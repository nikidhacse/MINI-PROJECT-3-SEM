import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  Palette,
  Upload,
  FileText,
  Sparkles,
  CheckCircle2,
  Save,
  Cpu,
  Layers,
  FileUp,
  Image as ImageIcon
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { SupportChat } from '../../components/layout/SupportChat';
import { ApiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import * as mammoth from 'mammoth';
import * as pdfjsLib from 'pdfjs-dist';
import toast from 'react-hot-toast';

// Set up PDF.js worker
pdfjsLib.GlobalWorkerOptions.workerSrc = `https://cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version || '4.10.38'}/pdf.worker.min.mjs`;

export const BrandKitPage: React.FC = () => {
  const { activeOrg, capabilities } = useAuth();
  const [brandKitId, setBrandKitId] = useState<string | null>(null);
  const [name, setName] = useState('Acme Brand Kit');
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6');
  const [secondaryColor, setSecondaryColor] = useState('#C4B5FD');
  const [accentColor, setAccentColor] = useState('#A78BFA');
  const [headingFont, setHeadingFont] = useState('Poppins');
  const [bodyFont, setBodyFont] = useState('Poppins');
  const [tone, setTone] = useState('clear, practical, warm');
  const [logoUrl, setLogoUrl] = useState<string>('');
  const [guidelinesText, setGuidelinesText] = useState('');
  const [loading, setLoading] = useState(false);
  const [ingesting, setIngesting] = useState(false);
  const [chunkCount, setChunkCount] = useState<number | null>(null);
  const [parsingDoc, setParsingDoc] = useState(false);

  useEffect(() => {
    fetchBrandKit();
  }, []);

  const fetchBrandKit = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getResource('brand_kits');
      if (res.data && Array.isArray(res.data) && res.data.length > 0) {
        const kit = res.data[0];
        setBrandKitId(kit.id);
        setName(kit.name);
        if (kit.tokens?.colors) {
          setPrimaryColor(kit.tokens.colors.primary || '#8B5CF6');
          setSecondaryColor(kit.tokens.colors.secondary || '#C4B5FD');
          setAccentColor(kit.tokens.colors.accent || '#A78BFA');
        }
        if (kit.tokens?.fonts) {
          setHeadingFont(kit.tokens.fonts.heading || 'Poppins');
          setBodyFont(kit.tokens.fonts.body || 'Poppins');
        }
        if (kit.tokens?.tone) setTone(kit.tokens.tone);
        if (kit.guidelines_text) setGuidelinesText(kit.guidelines_text);
      }
    } catch (err) {
      console.warn('Failed to fetch brand kit:', err);
    } finally {
      setLoading(false);
    }
  };

  // Client-Side PDF / DOCX Text Parser
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    setParsingDoc(true);
    try {
      const fileName = file.name.toLowerCase();

      if (fileName.endsWith('.docx')) {
        const arrayBuffer = await file.arrayBuffer();
        const result = await mammoth.extractRawText({ arrayBuffer });
        setGuidelinesText(result.value);
        toast.success(`Extracted ${result.value.length} characters from DOCX!`);
      } else if (fileName.endsWith('.pdf')) {
        const arrayBuffer = await file.arrayBuffer();
        const pdf = await pdfjsLib.getDocument({ data: arrayBuffer }).promise;
        let fullText = '';

        for (let i = 1; i <= pdf.numPages; i++) {
          const page = await pdf.getPage(i);
          const textContent = await page.getTextContent();
          const pageStrings = textContent.items.map((item: any) => item.str);
          fullText += pageStrings.join(' ') + '\n\n';
        }

        setGuidelinesText(fullText.trim());
        toast.success(`Extracted ${fullText.length} characters across ${pdf.numPages} PDF pages!`);
      } else {
        // Plain text file fallback
        const text = await file.text();
        setGuidelinesText(text);
        toast.success(`Imported text file (${text.length} chars)`);
      }
    } catch (err: any) {
      console.error('Document extraction error:', err);
      toast.error('Could not extract text from document');
    } finally {
      setParsingDoc(false);
    }
  };

  const handleSaveBrandKit = async () => {
    if (!capabilities.brandKitEdit) {
      toast.error('Only Brand Admin and Owner can edit brand guidelines');
      return;
    }

    setIngesting(true);
    try {
      const tokens = {
        colors: { primary: primaryColor, secondary: secondaryColor, accent: accentColor },
        fonts: { heading: headingFont, body: bodyFont },
        tone
      };

      // 1. Save Brand Kit record
      let kitId = brandKitId;
      if (kitId) {
        await ApiClient.writeResource('brand_kits', {
          op: 'update',
          id: kitId,
          data: { name, tokens, guidelines_text: guidelinesText }
        });
      } else {
        const res = await ApiClient.writeResource('brand_kits', {
          op: 'create',
          data: { name, tokens, guidelines_text: guidelinesText }
        });
        kitId = res.data.id;
        setBrandKitId(kitId);
      }

      // 2. Trigger RAG Vector Ingestion if guidelines exist
      if (guidelinesText.trim().length > 10 && kitId) {
        const ragRes = await ApiClient.ingestGuidelines(kitId, guidelinesText);
        setChunkCount(ragRes.chunks_count);
        toast.success(`Brand Kit saved! Indexed ${ragRes.chunks_count} vector chunks.`);
      } else {
        toast.success('Brand Kit updated successfully!');
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to save Brand Kit');
    } finally {
      setIngesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-aether-primary">
                  Vector Memory Engine
                </span>
                <span className="px-2 py-0.5 rounded-full bg-aether-primary/10 text-aether-primary text-[10px] font-extrabold uppercase">
                  256-Dim Embeddings
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-aether-text mt-1">
                Brand Kit &amp; Guidelines RAG
              </h1>
              <p className="text-xs text-aether-subtext mt-1">
                Configure brand tokens and ingest unstructured PDF / DOCX guidelines into vector memory.
              </p>
            </div>

            {capabilities.brandKitEdit && (
              <button
                onClick={handleSaveBrandKit}
                disabled={ingesting}
                className="px-6 py-3 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition flex items-center space-x-2"
              >
                <Save className="w-4 h-4" />
                <span>{ingesting ? 'Indexing Vector Chunks...' : 'Save & Ingest RAG'}</span>
              </button>
            )}
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left: Tokens & Identity */}
            <div className="lg:col-span-5 space-y-6">
              {/* Brand Visual Identity Card */}
              <div className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm space-y-5">
                <div className="flex items-center space-x-2.5">
                  <Palette className="w-5 h-5 text-aether-primary" />
                  <h3 className="text-sm font-bold text-aether-text">Color Palette Tokens</h3>
                </div>

                {/* Colors */}
                <div className="space-y-3">
                  <div>
                    <label className="block text-[11px] font-bold text-aether-subtext uppercase tracking-wider mb-1">
                      Primary Brand Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-aether-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={primaryColor}
                        onChange={(e) => setPrimaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-aether-bg border border-aether-border text-xs font-bold uppercase text-aether-text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-aether-subtext uppercase tracking-wider mb-1">
                      Secondary Brand Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-aether-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={secondaryColor}
                        onChange={(e) => setSecondaryColor(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-aether-bg border border-aether-border text-xs font-bold uppercase text-aether-text"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-aether-subtext uppercase tracking-wider mb-1">
                      Accent Color
                    </label>
                    <div className="flex items-center space-x-3">
                      <input
                        type="color"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="w-10 h-10 rounded-xl border border-aether-border cursor-pointer"
                      />
                      <input
                        type="text"
                        value={accentColor}
                        onChange={(e) => setAccentColor(e.target.value)}
                        className="flex-1 px-3 py-2 rounded-xl bg-aether-bg border border-aether-border text-xs font-bold uppercase text-aether-text"
                      />
                    </div>
                  </div>
                </div>

                {/* Typography Tokens */}
                <div className="pt-4 border-t border-aether-border/60 space-y-3">
                  <h4 className="text-xs font-bold text-aether-text">Typography Defaults</h4>
                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <span className="text-[10px] text-aether-subtext uppercase font-bold block mb-1">Heading</span>
                      <select
                        value={headingFont}
                        onChange={(e) => setHeadingFont(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-aether-bg border border-aether-border text-xs font-semibold text-aether-text focus:outline-none"
                      >
                        <option>Poppins</option>
                        <option>Inter</option>
                        <option>Playfair Display</option>
                        <option>Montserrat</option>
                        <option>Space Grotesk</option>
                      </select>
                    </div>

                    <div>
                      <span className="text-[10px] text-aether-subtext uppercase font-bold block mb-1">Body Font</span>
                      <select
                        value={bodyFont}
                        onChange={(e) => setBodyFont(e.target.value)}
                        className="w-full p-2.5 rounded-xl bg-aether-bg border border-aether-border text-xs font-semibold text-aether-text focus:outline-none"
                      >
                        <option>Poppins</option>
                        <option>Inter</option>
                        <option>Roboto</option>
                      </select>
                    </div>
                  </div>
                </div>

                {/* Tone Field */}
                <div className="pt-4 border-t border-aether-border/60">
                  <label className="block text-[11px] font-bold text-aether-subtext uppercase tracking-wider mb-1">
                    Tone &amp; Voice
                  </label>
                  <input
                    type="text"
                    value={tone}
                    onChange={(e) => setTone(e.target.value)}
                    placeholder="clear, practical, warm"
                    className="w-full px-3.5 py-2.5 rounded-xl bg-aether-bg border border-aether-border text-xs font-medium text-aether-text focus:outline-none focus:border-aether-primary"
                  />
                </div>
              </div>
            </div>

            {/* Right: Unstructured Guidelines Document & Vector Ingest */}
            <div className="lg:col-span-7 space-y-6">
              <div className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm space-y-4">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-3 border-b border-aether-border/60 gap-2">
                  <div>
                    <h3 className="text-sm font-bold text-aether-text">Guidelines Corpus &amp; Document Ingestion</h3>
                    <p className="text-[11px] text-aether-subtext">Supports manual pasting, PDF parsing, or DOCX text extraction</p>
                  </div>

                  {/* File Upload Button */}
                  <div>
                    <label className="cursor-pointer px-4 py-2 rounded-2xl bg-aether-section hover:bg-aether-light border border-aether-border/80 text-xs font-bold text-aether-primary transition flex items-center space-x-1.5">
                      <FileUp className="w-3.5 h-3.5" />
                      <span>{parsingDoc ? 'Parsing...' : 'Upload PDF / DOCX'}</span>
                      <input
                        type="file"
                        accept=".pdf,.docx,.txt"
                        onChange={handleFileUpload}
                        className="hidden"
                      />
                    </label>
                  </div>
                </div>

                {/* Guidelines Text Area */}
                <div>
                  <textarea
                    rows={12}
                    value={guidelinesText}
                    onChange={(e) => setGuidelinesText(e.target.value)}
                    placeholder={`Paste brand rules, photography guidelines, or clear space instructions here...\n\nExample:\n- Photography must feature real people in candid, natural lighting environments.\n- Never use stock photos of people pointing at laptops.\n- Maintain at least 4.5:1 contrast ratio for all superimposed typography.\n- Logo requires clear space equal to the height of the symbol icon on all sides.`}
                    className="w-full p-4 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium leading-relaxed font-mono"
                  />
                  <div className="flex justify-between items-center text-[11px] text-aether-subtext mt-1 px-1">
                    <span>Individual bullet points and blank lines become vector chunks</span>
                    <span>{guidelinesText.length} characters</span>
                  </div>
                </div>

                {/* Vector Ingestion Status Indicator */}
                <div className="p-4 bg-purple-50 rounded-2xl border border-purple-200 flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-9 h-9 rounded-xl bg-aether-primary text-white flex items-center justify-center">
                      <Cpu className="w-5 h-5" />
                    </div>
                    <div>
                      <span className="text-xs font-bold text-aether-text block">Vector RAG Status</span>
                      <span className="text-[11px] text-aether-subtext">
                        {chunkCount !== null
                          ? `✅ Ingested and indexed across ${chunkCount} vector chunks (HNSW Cosine)`
                          : 'Ready to chunk and embed into PostgreSQL vector database'}
                      </span>
                    </div>
                  </div>

                  {chunkCount !== null && (
                    <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold uppercase">
                      Active
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </main>
      </div>

      <SupportChat />
    </div>
  );
};
