import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Sparkles,
  Palette,
  Layers,
  Download,
  Paintbrush,
  FolderPlus,
  CheckCircle2,
  Copy,
  Check,
  Wand2,
  Image as ImageIcon,
  Sliders,
  Maximize2,
  Edit3,
  History,
  RotateCcw,
  ArrowRight,
  Send
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { SupportChat } from '../../components/layout/SupportChat';
import { CaptionsModal } from '../../components/modals/CaptionsModal';
import { ApiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const GeneratorPage: React.FC = () => {
  const { activeOrg } = useAuth();
  const navigate = useNavigate();

  // Form State
  const [prompt, setPrompt] = useState('');
  const [platform, setPlatform] = useState('instagram_square');
  const [audience, setAudience] = useState('General consumers');
  const [style, setStyle] = useState('editorial photography');
  const [presets, setPresets] = useState<any[]>([]);

  // Generation & Edit State
  const [loading, setLoading] = useState(false);
  const [loadingStage, setLoadingStage] = useState(0);
  const [editing, setEditing] = useState(false);
  const [editInstruction, setEditInstruction] = useState('');
  const [historyList, setHistoryList] = useState<any[]>([]);
  const [historyIndex, setHistoryIndex] = useState(0);
  const [isSaved, setIsSaved] = useState(false);
  const [savingAsset, setSavingAsset] = useState(false);
  const [showCaptionsModal, setShowCaptionsModal] = useState(false);
  const [copiedPrompt, setCopiedPrompt] = useState(false);

  const currentResult = historyList.length > 0 ? historyList[historyIndex] : null;

  const loadingStages = [
    'Formulating visual composition and lighting...',
    'Synthesizing ultra-high detail diffusion artwork with FLUX...',
    'Refining textures, depth of field, and color grading...',
    'Finalizing canvas-ready asset render...'
  ];

  const inspirationPrompts = [
    'Minimalist skincare ceramic bottle bathed in soft morning sunlight with gentle botanical shadows',
    'Modern wireless headphones floating on a vibrant pastel gradient background with frosted glass geometry',
    'Cozy Scandinavian coffee shop interior with warm ambient lamp glow and aesthetic wooden textures',
    'Futuristic luxury electric sports car in a clean neon-lit studio showroom with metallic reflections',
    'Fresh organic cold-pressed citrus juice bottle with water droplets and sliced oranges on marble',
    'Abstract 3D iridescent fluid sculpture with translucent glass ribbon accents and lavender lighting'
  ];

  const quickEditModifiers = [
    '🌅 Golden hour sunset lighting',
    '🌙 Dark moody atmosphere with neon rim light',
    '💎 Place on polished luxury marble pedestal',
    '🌿 Add lush botanical foliage and soft shadows',
    '✨ Add subtle water droplets and glossy reflections',
    '🎨 Transform into 3D isometric octane render'
  ];

  const audiences = [
    'General consumers',
    'Design professionals',
    'Small business owners',
    'Tech innovators',
    'Students & Gen-Z',
    'Parents & Families'
  ];

  const styles = [
    { label: 'Editorial Photography', value: 'editorial photography', desc: 'Crisp studio photography with natural textures' },
    { label: '3D Cinematic Render', value: '3D render', desc: 'Glossy lighting, octane render depth' },
    { label: 'Minimal Product Shot', value: 'minimal product shot', desc: 'Clean background, elegant negative space' },
    { label: 'Flat Illustration', value: 'flat illustration', desc: 'Modern graphic art with vibrant vector feel' },
    { label: 'Cyberpunk / Neon', value: 'cyberpunk neon style', desc: 'Vivid futuristic glows and moody tones' },
    { label: 'Hand-Drawn & Organic', value: 'hand-drawn', desc: 'Artistic textured strokes and painterly feel' }
  ];

  useEffect(() => {
    fetchPresets();
  }, []);

  const fetchPresets = async () => {
    try {
      const res = await ApiClient.getResource('platform_presets');
      if (res.data && Array.isArray(res.data)) {
        setPresets(res.data);
      }
    } catch (err) {
      setPresets([
        { key: 'instagram_square', label: 'Instagram Square', width: 1080, height: 1080, aspect: '1:1' },
        { key: 'instagram_story', label: 'Instagram Story', width: 1080, height: 1920, aspect: '9:16' },
        { key: 'facebook_link', label: 'Facebook Link', width: 1200, height: 630, aspect: '16:9' },
        { key: 'linkedin_post', label: 'LinkedIn Post', width: 1200, height: 1200, aspect: '1:1' },
        { key: 'email_banner', label: 'Email Banner', width: 1200, height: 400, aspect: '3:1' },
        { key: 'web_hero', label: 'Website Hero', width: 1600, height: 600, aspect: '8:3' },
        { key: 'pinterest_pin', label: 'Pinterest Pin', width: 1000, height: 1500, aspect: '2:3' }
      ]);
    }
  };

  const handleGenerate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (prompt.trim().length < 5) {
      toast.error('Please enter a descriptive prompt');
      return;
    }

    setLoading(true);
    setLoadingStage(0);

    const interval = setInterval(() => {
      setLoadingStage(prev => (prev < loadingStages.length - 1 ? prev + 1 : prev));
    }, 1400);

    try {
      const res = await ApiClient.generateAsset({
        prompt,
        platform,
        audience,
        style
      });

      clearInterval(interval);
      const newVersion = {
        ...res,
        versionLabel: 'v1 (Original)',
        editSummary: 'Original generation'
      };
      setHistoryList([newVersion]);
      setHistoryIndex(0);
      setIsSaved(false);
      toast.success('Image synthesized successfully!');
    } catch (err: any) {
      clearInterval(interval);
      toast.error(err.message || 'Generation failed');
    } finally {
      setLoading(false);
    }
  };

  // Edit Created Image with Prompt
  const handleEditWithPrompt = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentResult) return;
    if (editInstruction.trim().length < 3) {
      toast.error('Please describe what changes you want to apply');
      return;
    }

    setEditing(true);
    try {
      const originalPrompt = currentResult.image_prompt || currentResult.prompt || prompt;
      const res = await ApiClient.editAssetWithPrompt({
        original_prompt: originalPrompt,
        edit_instruction: editInstruction.trim(),
        platform,
        style
      });

      const nextVersionNum = historyList.length + 1;
      const updatedItem = {
        ...res,
        versionLabel: `v${nextVersionNum} (${editInstruction.slice(0, 18)}...)`,
        editSummary: editInstruction.trim()
      };

      const newHistory = [...historyList, updatedItem];
      setHistoryList(newHistory);
      setHistoryIndex(newHistory.length - 1);
      setEditInstruction('');
      setIsSaved(false);
      toast.success('Image modified successfully!');
    } catch (err: any) {
      toast.error(err.message || 'Failed to edit image');
    } finally {
      setEditing(false);
    }
  };

  // Save to Library (Explicit User Action Only)
  const handleSaveToLibrary = async () => {
    if (!currentResult) return;
    setSavingAsset(true);
    try {
      await ApiClient.writeResource('assets', {
        op: 'create',
        data: {
          title: currentResult.understanding?.intent || `${prompt.slice(0, 30)} Visual`,
          description: currentResult.image_prompt || currentResult.prompt || prompt,
          category: 'Social Media',
          status: 'draft',
          width: currentResult.gen_width || 1080,
          height: currentResult.gen_height || 1080,
          storage_path: currentResult.image,
          thumbnail_path: currentResult.image,
          quality_score: 98,
          prompt: currentResult.prompt,
          model: 'flux-1-schnell'
        }
      });
      setIsSaved(true);
      toast.success('Saved to Asset Library!');
    } catch (err: any) {
      toast.error('Failed to save asset to library');
    } finally {
      setSavingAsset(false);
    }
  };

  const handleOpenInEditor = () => {
    if (!currentResult) return;
    navigate('/creator/editor', {
      state: {
        backdropImage: currentResult.image,
        assetTitle: currentResult.understanding?.intent || 'Generated Visual',
        width: currentResult.gen_width,
        height: currentResult.gen_height,
        palette: currentResult.understanding?.palette
      }
    });
  };

  const handleDownload = () => {
    if (!currentResult?.image) return;
    const link = document.createElement('a');
    link.href = currentResult.image;
    link.download = `aether-visual-${platform}-${Date.now()}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleCopyPrompt = () => {
    const textToCopy = currentResult?.image_prompt || currentResult?.prompt || prompt;
    navigator.clipboard.writeText(textToCopy);
    setCopiedPrompt(true);
    toast.success('Prompt copied to clipboard');
    setTimeout(() => setCopiedPrompt(false), 2000);
  };

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-aether-primary">
                AI Image Studio
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-aether-primary animate-ping" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-aether-text mt-1">
              AI Visual Generator & Prompt Editor
            </h1>
            <p className="text-xs text-aether-subtext mt-1">
              Synthesize and iteratively refine high-resolution text-free visuals with AI &bull; Save to library anytime
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Form: Parameters */}
            <div className="lg:col-span-5 glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm space-y-5">
              <form onSubmit={handleGenerate} className="space-y-5">
                {/* Prompt Input */}
                <div>
                  <div className="flex items-center justify-between mb-2">
                    <label className="text-xs font-bold text-aether-text uppercase tracking-wider">
                      Creative Concept Prompt
                    </label>
                    <button
                      type="button"
                      onClick={() => {
                        const randomPrompt = inspirationPrompts[Math.floor(Math.random() * inspirationPrompts.length)];
                        setPrompt(randomPrompt);
                      }}
                      className="text-[11px] font-semibold text-aether-primary hover:underline flex items-center space-x-1"
                    >
                      <Wand2 className="w-3 h-3" />
                      <span>Surprise Me</span>
                    </button>
                  </div>
                  <textarea
                    rows={4}
                    required
                    value={prompt}
                    onChange={(e) => setPrompt(e.target.value)}
                    placeholder="Describe the image you want to generate (e.g. Minimalist skincare ceramic bottle bathed in soft morning sunlight with botanical shadows...)"
                    className="w-full p-3.5 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium leading-relaxed"
                  />
                  <div className="flex justify-between items-center text-[10px] text-aether-subtext mt-1 px-1">
                    <span>Pure diffusion without text or watermarks</span>
                    <span>{prompt.length} chars</span>
                  </div>

                  {/* Quick Ideas Chips */}
                  <div className="mt-2.5 flex flex-wrap gap-1.5">
                    {['Skincare Bottle', 'Modern Tech', 'Café Interior', '3D Abstract', 'Luxury Car'].map((chip, idx) => (
                      <button
                        key={idx}
                        type="button"
                        onClick={() => {
                          const matching = inspirationPrompts.find(p => p.toLowerCase().includes(chip.toLowerCase().split(' ')[0]));
                          if (matching) setPrompt(matching);
                        }}
                        className="px-2.5 py-1 rounded-lg bg-aether-section/70 hover:bg-aether-light border border-aether-border/60 text-[10px] font-medium text-aether-subtext hover:text-aether-primary transition"
                      >
                        + {chip}
                      </button>
                    ))}
                  </div>
                </div>

                {/* Platform Preset & Aspect Ratio */}
                <div>
                  <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-2">
                    Format & Aspect Ratio
                  </label>
                  <div className="grid grid-cols-2 gap-2">
                    {presets.slice(0, 6).map((p) => {
                      const isSelected = platform === p.key;
                      return (
                        <button
                          key={p.key}
                          type="button"
                          onClick={() => setPlatform(p.key)}
                          className={`p-2.5 rounded-2xl border text-left transition flex flex-col justify-between ${
                            isSelected
                              ? 'border-aether-primary bg-aether-light/70 shadow-sm ring-1 ring-aether-primary'
                              : 'border-aether-border/70 hover:bg-aether-section/40'
                          }`}
                        >
                          <span className="font-bold text-xs text-aether-text block truncate">{p.label}</span>
                          <span className="text-[10px] text-aether-subtext">{p.aspect} &bull; {p.width}×{p.height}</span>
                        </button>
                      );
                    })}
                  </div>
                </div>

                {/* Submit Action Button */}
                <button
                  type="submit"
                  disabled={loading || prompt.trim().length < 5}
                  className="w-full py-3.5 px-4 rounded-2xl bg-gradient-to-r from-aether-primary to-purple-600 text-white font-bold text-xs shadow-lavender-md hover:opacity-95 disabled:opacity-40 transition flex items-center justify-center space-x-2"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Synthesizing Visual...' : 'Generate New Visual'}</span>
                </button>
              </form>
            </div>

            {/* Right Display: Staged Loader / Generated Asset & Prompt Editor */}
            <div className="lg:col-span-7 space-y-6">
              {loading ? (
                <div className="glass-panel bg-white p-12 rounded-3xl border border-aether-border shadow-lavender-lg text-center space-y-6">
                  <div className="w-16 h-16 rounded-3xl bg-aether-light flex items-center justify-center mx-auto text-aether-primary">
                    <Sparkles className="w-8 h-8 animate-spin" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-aether-text mb-2">Generating Visual Artwork</h3>
                    <p className="text-xs font-semibold text-aether-primary animate-pulse">
                      {loadingStages[loadingStage]}
                    </p>
                  </div>
                  <div className="w-full bg-aether-section h-2 rounded-full overflow-hidden max-w-sm mx-auto">
                    <div
                      className="bg-aether-primary h-full transition-all duration-700"
                      style={{ width: `${((loadingStage + 1) / loadingStages.length) * 100}%` }}
                    />
                  </div>
                </div>
              ) : currentResult ? (
                <div className="space-y-6 animate-in fade-in duration-500">
                  {/* Visual Render Card */}
                  <div className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-lg space-y-4">
                    {/* Top Status & History Version Switcher */}
                    <div className="flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center space-x-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-aether-primary/10 text-aether-primary font-extrabold text-[10px] uppercase">
                          {currentResult.platform}
                        </span>
                        <span className="text-xs text-aether-subtext">{currentResult.gen_width} × {currentResult.gen_height}px</span>
                      </div>

                      {/* History Version Pills */}
                      {historyList.length > 1 && (
                        <div className="flex items-center space-x-1.5 overflow-x-auto py-1">
                          <History className="w-3.5 h-3.5 text-aether-subtext" />
                          {historyList.map((item, idx) => (
                            <button
                              key={idx}
                              onClick={() => {
                                setHistoryIndex(idx);
                                setIsSaved(false);
                              }}
                              className={`px-2.5 py-0.5 rounded-lg text-[10px] font-bold transition whitespace-nowrap ${
                                historyIndex === idx
                                  ? 'bg-aether-primary text-white shadow-sm'
                                  : 'bg-aether-section text-aether-subtext hover:bg-aether-light'
                              }`}
                            >
                              v{idx + 1}
                            </button>
                          ))}
                        </div>
                      )}

                      <div className="text-[11px] text-emerald-600 font-bold flex items-center space-x-1">
                        <CheckCircle2 className="w-3.5 h-3.5" />
                        <span>FLUX.1 Diffusion Render</span>
                      </div>
                    </div>

                    {/* Image Preview */}
                    <div className="relative rounded-2xl overflow-hidden bg-aether-bg border border-aether-border flex items-center justify-center max-h-[500px]">
                      <img
                        src={currentResult.image}
                        alt={currentResult.prompt}
                        className="w-full h-full object-contain max-h-[500px]"
                      />
                    </div>

                    {/* Quick Action Bar */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
                      <button
                        onClick={handleOpenInEditor}
                        className="flex-1 py-3 px-4 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition flex items-center justify-center space-x-2"
                      >
                        <Paintbrush className="w-4 h-4" />
                        <span>Open in Design Studio (Add Vector Typography)</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => setShowCaptionsModal(true)}
                          className="py-3 px-4 rounded-2xl border border-aether-border hover:bg-aether-light text-aether-text text-xs font-semibold flex items-center space-x-1.5 transition"
                          title="Generate AI Social Captions On-Demand"
                        >
                          <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                          <span>AI Captions</span>
                        </button>

                        {/* Save to Library (Only on Click) */}
                        <button
                          onClick={handleSaveToLibrary}
                          disabled={savingAsset}
                          className={`py-3 px-4 rounded-2xl border text-xs font-semibold flex items-center space-x-1.5 transition ${
                            isSaved
                              ? 'bg-emerald-50 border-emerald-300 text-emerald-700'
                              : 'border-aether-border hover:bg-aether-light text-aether-text'
                          }`}
                          title="Save this visual to your Asset Vault"
                        >
                          {isSaved ? (
                            <>
                              <Check className="w-3.5 h-3.5 text-emerald-600" />
                              <span>Saved to Library</span>
                            </>
                          ) : (
                            <>
                              <FolderPlus className="w-3.5 h-3.5 text-aether-primary" />
                              <span>{savingAsset ? 'Saving...' : 'Save to Library'}</span>
                            </>
                          )}
                        </button>

                        <button
                          onClick={handleDownload}
                          className="py-3 px-4 rounded-2xl border border-aether-border hover:bg-aether-light text-aether-text text-xs font-semibold flex items-center space-x-1.5 transition"
                          title="Download Image"
                        >
                          <Download className="w-3.5 h-3.5 text-aether-subtext" />
                        </button>
                      </div>
                    </div>
                  </div>

                  {/* EDIT CREATED IMAGE WITH PROMPT PANEL */}
                  <div className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-aether-border/60">
                      <div className="flex items-center space-x-2.5">
                        <div className="w-8 h-8 rounded-xl bg-purple-100 text-aether-primary flex items-center justify-center">
                          <Edit3 className="w-4 h-4" />
                        </div>
                        <div>
                          <h3 className="font-bold text-sm text-aether-text">Edit & Refine with Prompt</h3>
                          <p className="text-[11px] text-aether-subtext">Iterate and modify this visual description with AI</p>
                        </div>
                      </div>
                      {currentResult.editSummary && currentResult.editSummary !== 'Original generation' && (
                        <span className="text-[11px] font-semibold text-purple-700 bg-purple-50 px-2.5 py-1 rounded-lg border border-purple-200">
                          Active: {currentResult.editSummary}
                        </span>
                      )}
                    </div>

                    <form onSubmit={handleEditWithPrompt} className="space-y-3">
                      <div className="relative">
                        <input
                          type="text"
                          value={editInstruction}
                          onChange={(e) => setEditInstruction(e.target.value)}
                          placeholder="Describe the modification (e.g. Change lighting to sunset golden hour, add raindrops, make background darker...)"
                          className="w-full pl-4 pr-32 py-3 rounded-2xl bg-aether-bg/80 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium leading-relaxed"
                        />
                        <button
                          type="submit"
                          disabled={editing || editInstruction.trim().length < 3}
                          className="absolute right-1.5 top-1.5 bottom-1.5 px-4 rounded-xl bg-aether-primary text-white font-bold text-xs hover:bg-aether-hover disabled:opacity-40 transition flex items-center space-x-1.5"
                        >
                          {editing ? (
                            <>
                              <Sparkles className="w-3.5 h-3.5 animate-spin" />
                              <span>Modifying...</span>
                            </>
                          ) : (
                            <>
                              <Send className="w-3.5 h-3.5" />
                              <span>Apply Edit</span>
                            </>
                          )}
                        </button>
                      </div>

                      {/* Quick Modifier Chips */}
                      <div className="flex flex-wrap gap-1.5 pt-1">
                        {quickEditModifiers.map((mod, idx) => (
                          <button
                            key={idx}
                            type="button"
                            onClick={() => setEditInstruction(mod.replace(/^[^\s]+\s/, ''))}
                            className="px-2.5 py-1 rounded-xl bg-aether-section/70 hover:bg-aether-light border border-aether-border/60 text-[10px] font-medium text-aether-subtext hover:text-aether-primary transition"
                          >
                            {mod}
                          </button>
                        ))}
                      </div>
                    </form>
                  </div>

                  {/* Visual Details Card */}
                  <div className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm space-y-4">
                    <div className="flex items-center justify-between pb-3 border-b border-aether-border/60">
                      <div>
                        <h3 className="font-bold text-sm text-aether-text">Visual Synthesis Details</h3>
                        <p className="text-[11px] text-aether-subtext">Prompt details & composition characteristics</p>
                      </div>
                      <button
                        onClick={handleCopyPrompt}
                        className="px-3 py-1 rounded-xl border border-aether-border hover:bg-aether-light text-xs font-semibold text-aether-text flex items-center space-x-1.5 transition"
                      >
                        {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5 text-aether-subtext" />}
                        <span>{copiedPrompt ? 'Copied' : 'Copy Prompt'}</span>
                      </button>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
                      <div className="p-3 bg-aether-bg/60 rounded-2xl border border-aether-border/60 sm:col-span-2">
                        <span className="text-[10px] font-bold text-aether-subtext uppercase block mb-1">Current Active Prompt</span>
                        <p className="font-semibold text-aether-text leading-relaxed">
                          {currentResult.image_prompt || currentResult.prompt}
                        </p>
                      </div>

                      <div className="p-3 bg-aether-bg/60 rounded-2xl border border-aether-border/60">
                        <span className="text-[10px] font-bold text-aether-subtext uppercase block mb-1">Visual Style</span>
                        <p className="font-semibold text-aether-text capitalize">{currentResult.style || style}</p>
                      </div>

                      <div className="p-3 bg-aether-bg/60 rounded-2xl border border-aether-border/60">
                        <span className="text-[10px] font-bold text-aether-subtext uppercase block mb-1">Diffusion Model</span>
                        <p className="font-semibold text-aether-text">FLUX.1 Schnell Diffusion</p>
                      </div>

                      {currentResult.understanding?.composition && (
                        <div className="p-3 bg-aether-bg/60 rounded-2xl border border-aether-border/60 sm:col-span-2">
                          <span className="text-[10px] font-bold text-aether-subtext uppercase block mb-1">Composition Framing</span>
                          <p className="text-aether-text leading-relaxed">{currentResult.understanding.composition}</p>
                        </div>
                      )}

                      {currentResult.understanding?.palette && currentResult.understanding.palette.length > 0 && (
                        <div className="p-3 bg-aether-bg/60 rounded-2xl border border-aether-border/60 sm:col-span-2">
                          <span className="text-[10px] font-bold text-aether-subtext uppercase block mb-1">Palette Swatches</span>
                          <div className="flex items-center space-x-3 mt-1.5">
                            {currentResult.understanding.palette.map((hex: string, i: number) => (
                              <div key={i} className="flex items-center space-x-1.5">
                                <span className="w-5 h-5 rounded-full border border-white shadow-sm" style={{ backgroundColor: hex }} />
                                <span className="text-[10px] font-mono text-aether-subtext uppercase">{hex}</span>
                              </div>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel bg-white p-12 rounded-3xl border border-aether-border shadow-lavender-sm text-center space-y-4">
                  <div className="w-16 h-16 rounded-3xl bg-aether-light flex items-center justify-center text-aether-primary mx-auto">
                    <Sparkles className="w-8 h-8" />
                  </div>
                  <h3 className="text-base font-bold text-aether-text">Ready to Generate Visuals</h3>
                  <p className="text-xs text-aether-subtext max-w-md mx-auto leading-relaxed">
                    Enter a creative description on the left, select your canvas format and visual style, and click Generate to produce high-resolution visuals. You can edit with prompts and save to your library anytime.
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <SupportChat />

      <CaptionsModal
        isOpen={showCaptionsModal}
        onClose={() => setShowCaptionsModal(false)}
        assetPrompt={currentResult?.prompt || prompt || currentResult?.image_prompt || 'Instagram post'}
        assetImageUrl={currentResult?.image}
      />
    </div>
  );
};
