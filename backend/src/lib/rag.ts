import { RagRetrieveResult } from '../types';
import { getEmbedding } from './gemini';
import { query, pool, isConnected } from '../db/pool';
import { memoryStore } from '../db/memory_store';

// Section 5.1 Chunking Algorithm
export function chunkBrandGuidelines(text: string): string[] {
  if (!text || text.trim().length === 0) return [];

  // 1. Split on blank lines and bullet markers (-, *, •) so individual rules survive intact
  const rawSections = text
    .split(/(?:\r?\n\s*\r?\n)|(?:^|\r?\n)\s*[-*•]\s+/g)
    .map(s => s.trim())
    .filter(s => s.length > 0);

  if (rawSections.length === 0) return [];

  // 2. Greedily accumulate sections into chunks (~350 chars max, >50 chars before flush)
  const chunks: string[] = [];
  let currentChunk = '';

  for (const section of rawSections) {
    if (currentChunk.length === 0) {
      currentChunk = section;
    } else {
      const candidate = currentChunk + '\n' + section;
      if (candidate.length > 350 && currentChunk.length >= 50) {
        chunks.push(currentChunk);
        currentChunk = section;
      } else {
        currentChunk = candidate;
      }
    }
  }

  if (currentChunk.length > 0) {
    chunks.push(currentChunk);
  }

  // 3. Cap at 24 chunks per document by merging adjacent chunks if necessary
  if (chunks.length > 24) {
    const mergeFactor = Math.ceil(chunks.length / 24);
    const consolidated: string[] = [];
    for (let i = 0; i < chunks.length; i += mergeFactor) {
      const group = chunks.slice(i, i + mergeFactor);
      consolidated.push(group.join('\n\n'));
    }
    return consolidated.slice(0, 24);
  }

  return chunks;
}

// Ingest brand guidelines into vector storage
export async function ingestBrandGuidelines(orgId: string, brandKitId: string, guidelinesText: string) {
  const chunks = chunkBrandGuidelines(guidelinesText);

  // Process chunks sequentially: index 0 will clear existing chunks for this kit
  for (let i = 0; i < chunks.length; i++) {
    const chunkContent = chunks[i];
    const embedding = await getEmbedding(chunkContent);
    const embeddingStr = `[${embedding.join(',')}]`;

    // Try PostgreSQL first if connected
    if (pool && isConnected) {
      try {
        await query(
          'SELECT rag_upsert_chunk($1::uuid, $2::uuid, $3::integer, $4::text, $5::text)',
          [orgId, brandKitId, i, chunkContent, embeddingStr]
        );
      } catch (err: any) {
        console.warn('Postgres rag_upsert_chunk failed, falling back to memoryStore:', err.message);
        memoryStore.ragUpsertChunk(orgId, brandKitId, i, chunkContent, embedding);
      }
    } else {
      memoryStore.ragUpsertChunk(orgId, brandKitId, i, chunkContent, embedding);
    }
  }

  return {
    success: true,
    chunks_count: chunks.length
  };
}

// Confidence-Gated Retrieval
export async function retrieveBrandGuidelines(orgId: string, queryText: string, limit: number = 6): Promise<RagRetrieveResult> {
  const embedding = await getEmbedding(queryText);
  const embeddingStr = `[${embedding.join(',')}]`;

  // Try PostgreSQL PL/pgSQL function first
  if (pool && isConnected) {
    try {
      const res = await query('SELECT rag_retrieve($1::uuid, $2::text, $3::integer) as result', [orgId, embeddingStr, limit]);
      if (res && res.rows && res.rows[0] && res.rows[0].result) {
        return res.rows[0].result as RagRetrieveResult;
      }
    } catch (err: any) {
      console.warn('Postgres rag_retrieve failed, using in-memory cosine fallback:', err.message);
    }
  }

  // Fallback to in-memory cosine implementation
  return memoryStore.ragRetrieve(orgId, embedding, limit);
}
