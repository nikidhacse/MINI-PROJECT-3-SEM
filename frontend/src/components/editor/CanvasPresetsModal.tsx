import React, { useState } from 'react';
import { X, Check, Monitor, Smartphone, Instagram, Youtube, Sparkles } from 'lucide-react';
import { CANVAS_PRESETS, CanvasDimensions } from '../../types/editor';

interface CanvasPresetsModalProps {
  isOpen: boolean;
  onClose: () => void;
  currentDims: { width: number; height: number };
  onSelectDimensions: (w: number, h: number, name: string) => void;
}

export const CanvasPresetsModal: React.FC<CanvasPresetsModalProps> = ({
  isOpen,
  onClose,
  currentDims,
  onSelectDimensions,
}) => {
  const [customW, setCustomW] = useState(currentDims.width);
  const [customH, setCustomH] = useState(currentDims.height);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl border border-aether-border max-w-lg w-full shadow-2xl p-6 space-y-5 animate-scaleUp">
        <div className="flex items-center justify-between pb-3 border-b border-aether-border/60">
          <div>
            <h3 className="text-base font-bold text-aether-text">Resize Canvas Dimensions</h3>
            <p className="text-xs text-aether-subtext">Choose standard multi-channel aspect ratios or custom pixel size</p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-xl hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Standard Preset Grid */}
        <div className="grid grid-cols-2 gap-2.5 max-h-[300px] overflow-y-auto pr-1">
          {CANVAS_PRESETS.map((preset) => {
            const isSelected = currentDims.width === preset.width && currentDims.height === preset.height;

            return (
              <button
                key={preset.id}
                onClick={() => {
                  onSelectDimensions(preset.width, preset.height, preset.name);
                  onClose();
                }}
                className={`p-3 rounded-2xl border text-left transition flex items-center justify-between group ${
                  isSelected
                    ? 'border-aether-primary bg-aether-light/70 ring-1 ring-aether-primary shadow-sm'
                    : 'border-aether-border bg-aether-bg/50 hover:bg-aether-light hover:border-aether-primary'
                }`}
              >
                <div>
                  <span className="text-xs font-bold text-aether-text block group-hover:text-aether-primary transition">
                    {preset.name}
                  </span>
                  <span className="text-[10px] text-aether-subtext block mt-0.5">
                    {preset.width} × {preset.height} px &bull; {preset.aspectRatio}
                  </span>
                </div>
                {isSelected && <Check className="w-4 h-4 text-aether-primary shrink-0" />}
              </button>
            );
          })}
        </div>

        {/* Custom Dimensions */}
        <div className="pt-2 border-t border-aether-border/60 space-y-3">
          <label className="block text-xs font-bold text-aether-text">
            Custom Resolution
          </label>
          <div className="flex items-center space-x-3">
            <div className="flex-1">
              <span className="text-[10px] text-aether-subtext font-semibold uppercase block mb-1">Width (px)</span>
              <input
                type="number"
                value={customW}
                onChange={(e) => setCustomW(Number(e.target.value))}
                min={200}
                max={4000}
                className="w-full px-3 py-2 rounded-xl bg-aether-bg border border-aether-border text-xs font-bold text-aether-text focus:outline-none focus:border-aether-primary"
              />
            </div>
            <span className="text-sm font-bold text-aether-subtext pt-4">×</span>
            <div className="flex-1">
              <span className="text-[10px] text-aether-subtext font-semibold uppercase block mb-1">Height (px)</span>
              <input
                type="number"
                value={customH}
                onChange={(e) => setCustomH(Number(e.target.value))}
                min={200}
                max={4000}
                className="w-full px-3 py-2 rounded-xl bg-aether-bg border border-aether-border text-xs font-bold text-aether-text focus:outline-none focus:border-aether-primary"
              />
            </div>
            <button
              onClick={() => {
                onSelectDimensions(customW, customH, 'Custom Size');
                onClose();
              }}
              className="mt-4 px-4 py-2 rounded-xl bg-aether-primary text-white text-xs font-bold shadow-sm hover:bg-aether-hover transition"
            >
              Apply Size
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
