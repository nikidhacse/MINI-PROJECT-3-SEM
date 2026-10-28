import React, { useState } from 'react';
import {
  SlidersHorizontal,
  Sparkles,
  FlipHorizontal,
  FlipVertical,
  RotateCcw,
  Palette,
  Eye,
  EyeOff,
  Wand2,
  Image as ImageIcon,
} from 'lucide-react';
import { CanvasBackdropSettings, BRAND_PALETTES, GRADIENT_PRESETS } from '../../types/editor';
import { ApiClient } from '../../services/api';
import toast from 'react-hot-toast';

interface FiltersDrawerProps {
  backdrop: CanvasBackdropSettings;
  onUpdateBackdrop: (updates: Partial<CanvasBackdropSettings>) => void;
  onSetBackdropImage: (url: string) => void;
  originalPrompt?: string;
}

export const FiltersDrawer: React.FC<FiltersDrawerProps> = ({
  backdrop,
  onUpdateBackdrop,
  onSetBackdropImage,
  originalPrompt = 'Modern vibrant brand background',
}) => {
  const [aiInstruction, setAiInstruction] = useState('');
  const [isEditingWithAi, setIsEditingWithAi] = useState(false);

  const f = backdrop.filter;

  const updateFilter = (key: keyof CanvasBackdropSettings['filter'], value: number) => {
    onUpdateBackdrop({
      filter: {
        ...backdrop.filter,
        [key]: value,
      },
    });
  };

  const handleResetFilters = () => {
    onUpdateBackdrop({
      flipH: false,
      flipV: false,
      filter: {
        brightness: 100,
        contrast: 100,
        saturation: 100,
        blur: 0,
        sepia: 0,
        grayscale: 0,
        hueRotate: 0,
      },
    });
    toast.success('Filters reset to default');
  };

  const handleAiEdit = async () => {
    if (!aiInstruction.trim()) {
      toast.error('Please enter an AI editing instruction');
      return;
    }

    setIsEditingWithAi(true);
    try {
      const res = await ApiClient.editAssetWithPrompt({
        original_prompt: originalPrompt,
        edit_instruction: aiInstruction,
        platform: 'instagram_square',
      });

      if (res.image) {
        onSetBackdropImage(res.image);
        toast.success('AI updated your backdrop visual!');
        setAiInstruction('');
      } else {
        toast.error('Could not generate edited visual');
      }
    } catch (err: any) {
      toast.error(err.message || 'AI Edit failed');
    } finally {
      setIsEditingWithAi(false);
    }
  };

  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-aether-text">Photo &amp; Canvas Adjustments</h3>
        <p className="text-[11px] text-aether-subtext">Tune backdrop lighting, filters &amp; AI enhancements</p>
      </div>

      {/* AI Visual Re-Edit Prompt Box */}
      <div className="p-4 rounded-2xl bg-gradient-to-br from-aether-light to-purple-100 border border-aether-primary/30 space-y-2.5">
        <div className="flex items-center space-x-1.5 text-xs font-bold text-aether-primary">
          <Sparkles className="w-4 h-4 animate-pulse" />
          <span>In-Studio AI Image Edit</span>
        </div>
        <p className="text-[10px] text-aether-subtext leading-tight">
          Type instructions to modify the backdrop diffusion visual (e.g. "Add subtle golden sunset rays", "Change colors to emerald green").
        </p>
        <textarea
          value={aiInstruction}
          onChange={(e) => setAiInstruction(e.target.value)}
          placeholder="e.g. Make the backdrop moody with dark violet neon lights..."
          rows={2}
          className="w-full px-3 py-2 rounded-xl bg-white border border-aether-border text-xs text-aether-text placeholder-aether-subtext/60 focus:outline-none focus:border-aether-primary resize-none shadow-sm"
        />
        <button
          onClick={handleAiEdit}
          disabled={isEditingWithAi}
          className="w-full py-2 px-3 rounded-xl bg-aether-primary text-white text-xs font-bold shadow-sm hover:bg-aether-hover transition flex items-center justify-center space-x-1.5 disabled:opacity-50"
        >
          <Wand2 className="w-3.5 h-3.5" />
          <span>{isEditingWithAi ? 'AI Processing...' : 'Apply AI Transformation'}</span>
        </button>
      </div>

      {/* Backdrop Visibility & Flip Controls */}
      <div className="flex items-center justify-between p-3 rounded-2xl bg-aether-bg border border-aether-border">
        <button
          onClick={() => onUpdateBackdrop({ showBackdrop: !backdrop.showBackdrop })}
          className="flex items-center space-x-2 text-xs font-bold text-aether-text hover:text-aether-primary"
        >
          {backdrop.showBackdrop ? <Eye className="w-4 h-4 text-aether-primary" /> : <EyeOff className="w-4 h-4 text-aether-subtext" />}
          <span>{backdrop.showBackdrop ? 'Hide Backdrop Image' : 'Show Backdrop Image'}</span>
        </button>

        <div className="flex items-center space-x-1">
          <button
            onClick={() => onUpdateBackdrop({ flipH: !backdrop.flipH })}
            className={`p-1.5 rounded-lg border transition ${
              backdrop.flipH ? 'bg-aether-primary text-white border-aether-primary' : 'bg-white text-aether-subtext border-aether-border'
            }`}
            title="Flip Horizontally"
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={() => onUpdateBackdrop({ flipV: !backdrop.flipV })}
            className={`p-1.5 rounded-lg border transition ${
              backdrop.flipV ? 'bg-aether-primary text-white border-aether-primary' : 'bg-white text-aether-subtext border-aether-border'
            }`}
            title="Flip Vertically"
          >
            <FlipVertical className="w-3.5 h-3.5" />
          </button>
          <button
            onClick={handleResetFilters}
            className="p-1.5 rounded-lg bg-white text-aether-subtext hover:text-aether-text border border-aether-border transition"
            title="Reset Filters"
          >
            <RotateCcw className="w-3.5 h-3.5" />
          </button>
        </div>
      </div>

      {/* Adjustments Sliders */}
      <div className="space-y-3.5">
        <h4 className="text-xs font-bold text-aether-text flex items-center space-x-1.5">
          <SlidersHorizontal className="w-3.5 h-3.5 text-aether-primary" />
          <span>Lighting &amp; Color Sliders</span>
        </h4>

        {/* Brightness */}
        <div>
          <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
            <span>BRIGHTNESS</span>
            <span>{f.brightness}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={180}
            value={f.brightness}
            onChange={(e) => updateFilter('brightness', Number(e.target.value))}
            className="w-full accent-aether-primary"
          />
        </div>

        {/* Contrast */}
        <div>
          <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
            <span>CONTRAST</span>
            <span>{f.contrast}%</span>
          </div>
          <input
            type="range"
            min={40}
            max={180}
            value={f.contrast}
            onChange={(e) => updateFilter('contrast', Number(e.target.value))}
            className="w-full accent-aether-primary"
          />
        </div>

        {/* Saturation */}
        <div>
          <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
            <span>SATURATION</span>
            <span>{f.saturation}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={220}
            value={f.saturation}
            onChange={(e) => updateFilter('saturation', Number(e.target.value))}
            className="w-full accent-aether-primary"
          />
        </div>

        {/* Blur */}
        <div>
          <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
            <span>BLUR / DEPTH OF FIELD</span>
            <span>{f.blur}px</span>
          </div>
          <input
            type="range"
            min={0}
            max={20}
            value={f.blur}
            onChange={(e) => updateFilter('blur', Number(e.target.value))}
            className="w-full accent-aether-primary"
          />
        </div>

        {/* Hue Rotate */}
        <div>
          <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
            <span>HUE SHIFT</span>
            <span>{f.hueRotate}°</span>
          </div>
          <input
            type="range"
            min={0}
            max={360}
            value={f.hueRotate}
            onChange={(e) => updateFilter('hueRotate', Number(e.target.value))}
            className="w-full accent-aether-primary"
          />
        </div>

        {/* Grayscale */}
        <div>
          <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
            <span>BLACK &amp; WHITE (GRAYSCALE)</span>
            <span>{f.grayscale}%</span>
          </div>
          <input
            type="range"
            min={0}
            max={100}
            value={f.grayscale}
            onChange={(e) => updateFilter('grayscale', Number(e.target.value))}
            className="w-full accent-aether-primary"
          />
        </div>
      </div>

      {/* Canvas Background Colors (Solid / Gradients) */}
      <div className="space-y-2 pt-2">
        <label className="block text-[10px] font-bold uppercase text-aether-subtext flex items-center space-x-1">
          <Palette className="w-3 h-3 text-aether-primary" />
          <span>Canvas Background Color</span>
        </label>
        <div className="flex flex-wrap gap-1.5">
          {BRAND_PALETTES.map((hex) => (
            <button
              key={hex}
              onClick={() => onUpdateBackdrop({ backgroundColor: hex })}
              style={{ backgroundColor: hex }}
              className={`w-6 h-6 rounded-lg border transition shadow-sm ${
                backdrop.backgroundColor === hex ? 'ring-2 ring-aether-primary scale-110' : 'border-gray-300'
              }`}
            />
          ))}
        </div>

        <div className="grid grid-cols-4 gap-1.5 pt-1">
          {GRADIENT_PRESETS.map((grad, i) => (
            <button
              key={i}
              onClick={() => onUpdateBackdrop({ backgroundColor: grad })}
              style={{ background: grad }}
              className={`h-6 rounded-lg border transition shadow-sm ${
                backdrop.backgroundColor === grad ? 'ring-2 ring-aether-primary scale-105' : 'hover:scale-105'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
