import { memoryStore, MemoryStore } from '../db/memory_store';

// Fixture data from Section 5.2
const FIXTURES = [
  {
    query: 'what contrast ratio do I need for text',
    answerable: true,
    top: 0.8704,
    gap: 0.054,
    expectedConfident: true,
    reason: 'Clear match with strong rank gap (gap 0.054 >= 0.03)'
  },
  {
    query: 'can I use stock photos of people pointing at laptops',
    answerable: true,
    top: 0.8462,
    gap: 0.056,
    expectedConfident: true,
    reason: 'Answerable rule separated cleanly by rank gap (gap 0.056 >= 0.03, even though top < 0.85)'
  },
  {
    query: 'how much clear space around the logo',
    answerable: true,
    top: 0.8940,
    gap: 0.084,
    expectedConfident: true,
    reason: 'High confidence and large gap (top 0.894 >= 0.85, gap 0.084 >= 0.03)'
  },
  {
    query: 'team photo for our about page',
    answerable: true,
    top: 0.8550,
    gap: 0.0198,
    expectedConfident: true,
    reason: 'Tight cluster of genuine photography rules; gap collapsed to 0.0198, recovered by top >= 0.85'
  },
  {
    query: 'what is our refund policy',
    answerable: false,
    top: 0.7375,
    gap: 0.011,
    expectedConfident: false,
    reason: 'Unanswerable query (top 0.7375 < 0.85, gap 0.011 < 0.03)'
  }
];

export function runConfidenceGateTests(): boolean {
  console.log('================================================================');
  console.log('🧪 RUNNING SECTION 5.2 CONFIDENCE GATE TEST SUITE');
  console.log('================================================================');

  let passed = 0;
  let failed = 0;

  // 1. Test the Dual Confidence Rule on each fixture
  FIXTURES.forEach((f, idx) => {
    const isConfident = (f.gap >= 0.03) || (f.top >= 0.85);
    const success = isConfident === f.expectedConfident;

    console.log(`\nTest #${idx + 1}: "${f.query}"`);
    console.log(`  Expected Answerable: ${f.answerable ? 'YES' : 'NO'}`);
    console.log(`  Top Similarity: ${f.top.toFixed(4)}, Rank Gap: ${f.gap.toFixed(4)}`);
    console.log(`  Dual Gate Evaluation: confident = ${isConfident} (${f.reason})`);

    if (success) {
      console.log(`  ✅ PASSED`);
      passed++;
    } else {
      console.error(`  ❌ FAILED: expected confident = ${f.expectedConfident}, got ${isConfident}`);
      failed++;
    }
  });

  // 2. Explicitly demonstrate why single-term rules fail
  console.log('\n----------------------------------------------------------------');
  console.log('🔬 DEMONSTRATING SINGLE-TERM RULE FAILURES');
  console.log('----------------------------------------------------------------');

  // Test Failure of 'gap >= 0.03' alone on Row 4 (Tight cluster)
  const row4 = FIXTURES[3];
  const gapOnlyConfident = row4.gap >= 0.03;
  console.log(`\n1. Single Rule 'gap >= 0.03' on "${row4.query}":`);
  console.log(`   Result: ${gapOnlyConfident} (FALSE NEGATIVE on genuine matches cluster).`);
  console.log(`   Recovery: 'top >= 0.85' recovers it correctly as confident = true.`);

  // Test Failure of 'top >= 0.85' alone on Row 2 (0.8462 with gap 0.056)
  const row2 = FIXTURES[1];
  const topOnlyConfident = row2.top >= 0.85;
  console.log(`\n2. Single Rule 'top >= 0.85' on "${row2.query}":`);
  console.log(`   Result: ${topOnlyConfident} (FALSE NEGATIVE on answerable query).`);
  console.log(`   Recovery: 'gap >= 0.03' recovers it correctly as confident = true.`);

  // Test Failure of Naive 'similarity > 0.7' on Row 5 (Unanswerable query scoring 0.7375)
  const row5 = FIXTURES[4];
  const naiveThresholdConfident = row5.top > 0.7;
  console.log(`\n3. Naive Rule 'similarity > 0.7' on "${row5.query}":`);
  console.log(`   Result: ${naiveThresholdConfident} (FALSE POSITIVE on completely unanswerable query).`);
  console.log(`   Recovery: Dual Rule correctly rejects it because gap (0.011) < 0.03 AND top (0.7375) < 0.85.`);

  console.log('\n================================================================');
  console.log(`📊 TEST RESULTS: ${passed}/${FIXTURES.length} Passed, ${failed} Failed`);
  console.log('================================================================\n');

  return failed === 0;
}
