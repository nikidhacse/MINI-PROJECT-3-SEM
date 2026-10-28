import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Sparkles,
  Copy,
  Instagram,
  Check,
  RefreshCw,
  MessageSquare,
  Sliders,
  AlignLeft,
  FileText,
  Hash
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import toast from 'react-hot-toast';

interface CaptionsModalProps {
  isOpen: boolean;
  onClose: () => void;
  assetPrompt: string;
  assetImageUrl?: string;
  brandName?: string;
}

export const CaptionsModal: React.FC<CaptionsModalProps> = ({
  isOpen,
  onClose,
  assetPrompt,
  assetImageUrl,
  brandName
}) => {
  const [loading, setLoading] = useState(false);
  const [publishing, setPublishing] = useState(false);
  const [generated, setGenerated] = useState(false);
  const [showConfig, setShowConfig] = useState(false);

  // User configurable parameters
  const [tone, setTone] = useState('engaging and modern');
  const [lengthPreset, setLengthPreset] = useState<'short' | 'medium' | 'long' | 'custom'>('medium');
  const [customWordCount, setCustomWordCount] = useState<number>(60);
  const [format, setFormat] = useState('Standard Hook + Body + CTA');

  const [variants, setVariants] = useState<{ punchy: string; story: string; value: string }>({
    punchy: '',
    story: '',
    value: ''
  });
  const [selectedVariant, setSelectedVariant] = useState<'punchy' | 'story' | 'value'>('punchy');
  const [editedCaption, setEditedCaption] = useState('');
  const [copied, setCopied] = useState(false);

  const getEffectiveWordCount = (): string => {
    switch (lengthPreset) {
      case 'short':
        return '20-35 words';
      case 'medium':
        return '50-80 words';
      case 'long':
        return '120-180 words';
      case 'custom':
        return `${customWordCount} words`;
      default:
        return '50-80 words';
    }
  };

  const handleGenerateCaptions = async () => {
    if (!assetPrompt) return;
    setLoading(true);
    const effectiveWords = getEffectiveWordCount();
    try {
      const res = await ApiClient.generateCaptions(assetPrompt, brandName, tone, effectiveWords, format);
      if (res.variants) {
        setVariants(res.variants);
        setEditedCaption(res.variants.punchy || '');
        setSelectedVariant('punchy');
        setGenerated(true);
        setShowConfig(false);
        toast.success('Captions crafted successfully!');
      }
    } catch (err) {
      toast.error('Could not generate captions');
    } finally {
      setLoading(false);
    }
  };

  const handleSelectTab = (type: 'punchy' | 'story' | 'value') => {
    setSelectedVariant(type);
    setEditedCaption(variants[type] || '');
  };

  const handleCopy = () => {
    navigator.clipboard.writeText(editedCaption);
    setCopied(true);
    toast.success('Caption copied to clipboard!');
    setTimeout(() => setCopied(false), 2000);
  };

  const handlePostInstagram = async () => {
    if (!assetImageUrl) {
      toast.error('No image URL available to publish');
      return;
    }
    setPublishing(true);
    try {
      const res = await ApiClient.postInstagram(assetImageUrl, editedCaption, '@i_teddy_bear_07');
      if (res.success) {
        toast.success(
          (t) => (
            <div className="flex flex-col space-y-1">
              <span className="font-bold text-xs text-emerald-700 dark:text-emerald-300">🎉 Published to Instagram!</span>
              <span className="text-[11px] text-aether-subtext">Post ID: {res.post_id}</span>
              {res.permalink && (
                <a
                  href={res.permalink}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-[11px] text-pink-600 dark:text-pink-400 font-semibold underline hover:text-pink-700"
                >
                  View Post on Instagram &rarr;
                </a>
              )}
            </div>
          ),
          { duration: 6000 }
        );
        onClose();
      } else {
        toast.error('Instagram publishing could not be completed.');
      }
    } catch (err: any) {
      toast.error(err.message || 'Instagram publishing failed');
    } finally {
      setPublishing(false);
    }
  };

  // Word & character counter
  const wordCount = editedCaption.trim() ? editedCaption.trim().split(/\s+/).length : 0;
  const charCount = editedCaption.length;

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel bg-white p-6 sm:p-7 rounded-3xl shadow-lavender-lg max-w-xl w-full border border-aether-border relative max-h-[90vh] overflow-y-auto"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-5">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-tr from-pink-500 via-purple-600 to-indigo-600 text-white flex items-center justify-center shadow-sm">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-aether-text">AI Social Copywriter</h2>
              <p className="text-xs text-aether-subtext">Generate custom captions tailored by length, format, and tone</p>
            </div>
          </div>

          {/* Subject / Prompt Banner */}
          {assetPrompt && (
            <div className="mb-5 bg-aether-section/70 p-3 rounded-2xl border border-aether-border flex items-center space-x-2.5">
              <div className="w-6 h-6 rounded-lg bg-pink-100 dark:bg-pink-900/40 text-pink-600 flex items-center justify-center shrink-0">
                <Sparkles className="w-3.5 h-3.5" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-[10px] font-bold text-aether-subtext uppercase tracking-wider">Post Subject / Image Prompt</p>
                <p className="text-xs font-semibold text-aether-text truncate" title={assetPrompt}>{assetPrompt}</p>
              </div>
            </div>
          )}

          {!generated || showConfig ? (
            <div className="space-y-5">
              <div className="text-center">
                <h3 className="text-sm font-bold text-aether-text mb-1">Configure Caption Specifications</h3>
                <p className="text-xs text-aether-subtext max-w-md mx-auto">
                  Customize the exact word length, structure, and tone for your Instagram post.
                </p>
              </div>

              {/* 1. Word Count / Length Presets */}
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-[11px] font-bold text-aether-text uppercase tracking-wider flex items-center space-x-1.5">
                    <AlignLeft className="w-3.5 h-3.5 text-aether-primary" />
                    <span>Caption Length &amp; Word Count</span>
                  </label>
                  <span className="text-[11px] font-semibold text-aether-primary">
                    Target: {getEffectiveWordCount()}
                  </span>
                </div>

                <div className="grid grid-cols-4 gap-2">
                  <button
                    type="button"
                    onClick={() => setLengthPreset('short')}
                    className={`py-2 px-2.5 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center ${
                      lengthPreset === 'short'
                        ? 'bg-aether-primary text-white shadow-lavender-sm'
                        : 'bg-aether-bg/70 hover:bg-aether-section text-aether-text border border-aether-border/80'
                    }`}
                  >
                    <span>Short</span>
                    <span className={`text-[10px] font-medium ${lengthPreset === 'short' ? 'text-white/80' : 'text-aether-subtext'}`}>
                      ~25 words
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLengthPreset('medium')}
                    className={`py-2 px-2.5 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center ${
                      lengthPreset === 'medium'
                        ? 'bg-aether-primary text-white shadow-lavender-sm'
                        : 'bg-aether-bg/70 hover:bg-aether-section text-aether-text border border-aether-border/80'
                    }`}
                  >
                    <span>Medium</span>
                    <span className={`text-[10px] font-medium ${lengthPreset === 'medium' ? 'text-white/80' : 'text-aether-subtext'}`}>
                      ~60 words
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLengthPreset('long')}
                    className={`py-2 px-2.5 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center ${
                      lengthPreset === 'long'
                        ? 'bg-aether-primary text-white shadow-lavender-sm'
                        : 'bg-aether-bg/70 hover:bg-aether-section text-aether-text border border-aether-border/80'
                    }`}
                  >
                    <span>Long</span>
                    <span className={`text-[10px] font-medium ${lengthPreset === 'long' ? 'text-white/80' : 'text-aether-subtext'}`}>
                      ~150 words
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setLengthPreset('custom')}
                    className={`py-2 px-2.5 rounded-2xl text-xs font-bold transition flex flex-col items-center justify-center ${
                      lengthPreset === 'custom'
                        ? 'bg-aether-primary text-white shadow-lavender-sm'
                        : 'bg-aether-bg/70 hover:bg-aether-section text-aether-text border border-aether-border/80'
                    }`}
                  >
                    <span>Custom</span>
                    <span className={`text-[10px] font-medium ${lengthPreset === 'custom' ? 'text-white/80' : 'text-aether-subtext'}`}>
                      Exact No.
                    </span>
                  </button>
                </div>

                {lengthPreset === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    className="pt-2"
                  >
                    <div className="flex items-center space-x-3 bg-aether-section/60 p-2.5 rounded-2xl border border-aether-border">
                      <span className="text-xs font-semibold text-aether-text">Exact Word Limit:</span>
                      <input
                        type="number"
                        min={10}
                        max={350}
                        value={customWordCount}
                        onChange={(e) => setCustomWordCount(Math.max(5, parseInt(e.target.value) || 10))}
                        className="w-24 px-3 py-1.5 rounded-xl bg-white border border-aether-border text-xs font-bold text-aether-primary focus:outline-none focus:border-aether-primary"
                      />
                      <span className="text-xs text-aether-subtext">words</span>
                    </div>
                  </motion.div>
                )}
              </div>

              {/* 2. Format Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-aether-text uppercase tracking-wider flex items-center space-x-1.5">
                  <FileText className="w-3.5 h-3.5 text-aether-primary" />
                  <span>Post Format &amp; Layout</span>
                </label>
                <select
                  value={format}
                  onChange={(e) => setFormat(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-aether-bg/80 border border-aether-border text-xs font-semibold text-aether-text focus:outline-none focus:border-aether-primary"
                >
                  <option value="Standard Hook + Body + CTA">📌 Standard: Catchy Hook + Value Body + CTA</option>
                  <option value="Bullet Points & Emojis Listicle">📋 Bullet Points: Key Takeaways with Emojis</option>
                  <option value="One-Liner Punchy Statement">⚡ One-Liner: Minimalist Impact Statement</option>
                  <option value="Question & Conversation Starter">💬 Question: Community Conversation Starter</option>
                  <option value="Step-by-Step Practical Tips">🎯 Step-by-Step: 1-2-3 Actionable Tips</option>
                  <option value="Story & Narrative Arc">📖 Story: Narrative Journey & Behind the Scenes</option>
                </select>
              </div>

              {/* 3. Tone Selection */}
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold text-aether-text uppercase tracking-wider flex items-center space-x-1.5">
                  <Sparkles className="w-3.5 h-3.5 text-aether-primary" />
                  <span>Desired Copy Tone</span>
                </label>
                <select
                  value={tone}
                  onChange={(e) => setTone(e.target.value)}
                  className="w-full p-2.5 rounded-2xl bg-aether-bg/80 border border-aether-border text-xs font-semibold text-aether-text focus:outline-none focus:border-aether-primary"
                >
                  <option value="engaging and modern">⚡ Engaging &amp; Modern</option>
                  <option value="story-driven and inspiring">📖 Story-Driven &amp; Inspiring</option>
                  <option value="direct, punchy, high-converting">🎯 Direct &amp; High-Converting CTA</option>
                  <option value="luxury, sophisticated, minimal">💎 Luxury &amp; Minimalist</option>
                  <option value="educational and informative">📚 Informative &amp; Value-Focused</option>
                  <option value="bold, witty, and energetic">🔥 Bold &amp; Energetic</option>
                </select>
              </div>

              {/* Submit Button */}
              <div className="pt-2">
                <button
                  onClick={handleGenerateCaptions}
                  disabled={loading}
                  className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white font-bold text-xs shadow-lavender-md hover:opacity-95 transition flex items-center justify-center space-x-2 disabled:opacity-50"
                >
                  <Sparkles className="w-4 h-4" />
                  <span>{loading ? 'Crafting Captions...' : 'Generate Social Captions'}</span>
                </button>
                {generated && (
                  <button
                    onClick={() => setShowConfig(false)}
                    className="w-full py-2 mt-2 text-xs font-semibold text-aether-subtext hover:text-aether-text text-center transition"
                  >
                    Cancel &amp; View Current Captions
                  </button>
                )}
              </div>
            </div>
          ) : loading ? (
            <div className="py-16 text-center">
              <div className="w-10 h-10 rounded-full border-3 border-aether-border border-t-aether-primary animate-spin mx-auto mb-3" />
              <p className="text-xs text-aether-subtext">Crafting captions tailored to {getEffectiveWordCount()} ({format})...</p>
            </div>
          ) : (
            <div className="space-y-4">
              {/* Variant Tabs & Length/Format Specs badge */}
              <div className="flex items-center justify-between">
                <div className="flex p-1 bg-aether-section rounded-2xl flex-1 mr-2">
                  <button
                    onClick={() => handleSelectTab('punchy')}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                      selectedVariant === 'punchy' ? 'bg-white text-aether-primary shadow-sm' : 'text-aether-subtext hover:text-aether-text'
                    }`}
                  >
                    ⚡ Punchy
                  </button>
                  <button
                    onClick={() => handleSelectTab('story')}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                      selectedVariant === 'story' ? 'bg-white text-aether-primary shadow-sm' : 'text-aether-subtext hover:text-aether-text'
                    }`}
                  >
                    📖 Story
                  </button>
                  <button
                    onClick={() => handleSelectTab('value')}
                    className={`flex-1 py-1.5 px-2 rounded-xl text-xs font-semibold transition ${
                      selectedVariant === 'value' ? 'bg-white text-aether-primary shadow-sm' : 'text-aether-subtext hover:text-aether-text'
                    }`}
                  >
                    💎 Value &amp; Tags
                  </button>
                </div>

                <button
                  onClick={() => setShowConfig(true)}
                  className="p-2 rounded-2xl border border-aether-border hover:bg-aether-section text-aether-subtext hover:text-aether-primary transition"
                  title="Adjust Length, Word Count & Format"
                >
                  <Sliders className="w-4 h-4" />
                </button>
              </div>

              {/* Active Format Badge */}
              <div className="flex items-center justify-between text-[10px] text-aether-subtext px-1">
                <span className="font-semibold text-aether-primary capitalize">
                  {format.split(':')[0]} • {getEffectiveWordCount()}
                </span>
                <span>
                  <strong>{wordCount}</strong> words · <strong>{charCount}</strong> chars
                </span>
              </div>

              {/* Caption Textarea */}
              <div>
                <textarea
                  rows={6}
                  value={editedCaption}
                  onChange={(e) => setEditedCaption(e.target.value)}
                  className="w-full p-3.5 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium leading-relaxed resize-y"
                  placeholder="Generated caption will appear here..."
                />
              </div>

              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-2">
                <button
                  onClick={() => setShowConfig(true)}
                  className="px-3 py-2 rounded-2xl border border-aether-border hover:bg-aether-section text-xs font-semibold text-aether-subtext flex items-center space-x-1.5 transition"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Adjust Specs</span>
                </button>

                <div className="flex items-center space-x-2">
                  <button
                    onClick={handleCopy}
                    className="px-4 py-2.5 rounded-2xl border border-aether-border hover:bg-aether-light text-xs font-semibold text-aether-text flex items-center space-x-2 transition"
                  >
                    {copied ? <Check className="w-4 h-4 text-emerald-600" /> : <Copy className="w-4 h-4 text-aether-primary" />}
                    <span>{copied ? 'Copied' : 'Copy'}</span>
                  </button>

                  <button
                    onClick={handlePostInstagram}
                    disabled={publishing}
                    className="px-5 py-2.5 rounded-2xl bg-gradient-to-r from-pink-500 via-purple-600 to-indigo-600 text-white text-xs font-bold shadow-lavender-sm hover:opacity-95 transition flex items-center space-x-2"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>{publishing ? 'Publishing...' : 'Publish to Instagram'}</span>
                  </button>
                </div>
              </div>
            </div>
          )}
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
