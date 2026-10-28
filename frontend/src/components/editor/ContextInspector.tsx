import React, { useState } from 'react';
import {
  Copy,
  Trash2,
  AlignLeft,
  AlignCenter,
  AlignRight,
  AlignJustify,
  Bold,
  Italic,
  Underline,
  Sparkles,
  Check,
  ChevronUp,
  ChevronDown,
  FlipHorizontal,
  FlipVertical,
  SlidersHorizontal,
  Layers,
  Palette,
  Maximize2,
  Type,
  Image as ImageIcon,
  Square,
} from 'lucide-react';
import {
  StudioElement,
  TextElement,
  ImageElement,
  ShapeElement,
  AVAILABLE_FONTS,
  BRAND_PALETTES,
  GRADIENT_PRESETS,
  CanvasBackdropSettings,
} from '../../types/editor';
import toast from 'react-hot-toast';

interface ContextInspectorProps {
  selectedElement: StudioElement | null;
  backdrop: CanvasBackdropSettings;
  canvasDims: { width: number; height: number };
  onUpdateSelected: (updates: Partial<StudioElement>) => void;
  onUpdateBackdrop: (updates: Partial<CanvasBackdropSettings>) => void;
  onDuplicateSelected: () => void;
  onDeleteSelected: () => void;
  onMoveLayer: (id: string, dir: 'up' | 'down' | 'top' | 'bottom') => void;
  onOpenResizeModal: () => void;
  onSetBackdropFromImage: (src: string) => void;
}

export const ContextInspector: React.FC<ContextInspectorProps> = ({
  selectedElement,
  backdrop,
  canvasDims,
  onUpdateSelected,
  onUpdateBackdrop,
  onDuplicateSelected,
  onDeleteSelected,
  onMoveLayer,
  onOpenResizeModal,
  onSetBackdropFromImage,
}) => {
  const [showFiltersTab, setShowFiltersTab] = useState(false);

  // If no element selected, show Canvas & Backdrop settings
  if (!selectedElement) {
    return (
      <div className="space-y-5">
        <div className="pb-3 border-b border-aether-border/60">
          <span className="text-[10px] font-bold uppercase tracking-wider text-aether-primary block">
            Canvas Properties
          </span>
          <h3 className="text-sm font-bold text-aether-text">Canvas Stage Inspector</h3>
        </div>

        {/* Canvas Dimension card */}
        <div className="p-3.5 rounded-2xl bg-aether-bg border border-aether-border space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-aether-text">Resolution</span>
            <span className="text-[11px] font-mono text-aether-primary font-bold">
              {canvasDims.width} × {canvasDims.height} px
            </span>
          </div>
          <button
            onClick={onOpenResizeModal}
            className="w-full py-2 px-3 rounded-xl bg-white border border-aether-border hover:border-aether-primary text-xs font-bold text-aether-text hover:text-aether-primary transition shadow-sm flex items-center justify-center space-x-1.5"
          >
            <Maximize2 className="w-3.5 h-3.5" />
            <span>Change Canvas Dimensions</span>
          </button>
        </div>

        {/* Canvas Background Color */}
        <div className="space-y-2">
          <label className="block text-[10px] font-bold uppercase text-aether-subtext">
            Background Color / Gradient
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
          <div className="grid grid-cols-4 gap-1 pt-1">
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

        {/* Quick Backdrop Brightness & Contrast */}
        <div className="space-y-3 pt-2">
          <span className="text-[10px] font-bold uppercase text-aether-subtext block">
            Backdrop Photo Light
          </span>
          <div>
            <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
              <span>BRIGHTNESS</span>
              <span>{backdrop.filter.brightness}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={160}
              value={backdrop.filter.brightness}
              onChange={(e) =>
                onUpdateBackdrop({
                  filter: { ...backdrop.filter, brightness: Number(e.target.value) },
                })
              }
              className="w-full accent-aether-primary"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
              <span>CONTRAST</span>
              <span>{backdrop.filter.contrast}%</span>
            </div>
            <input
              type="range"
              min={50}
              max={160}
              value={backdrop.filter.contrast}
              onChange={(e) =>
                onUpdateBackdrop({
                  filter: { ...backdrop.filter, contrast: Number(e.target.value) },
                })
              }
              className="w-full accent-aether-primary"
            />
          </div>
        </div>

        <div className="p-4 rounded-2xl bg-aether-light/60 border border-aether-border text-center space-y-1.5">
          <Sparkles className="w-5 h-5 text-aether-primary mx-auto" />
          <p className="text-xs font-bold text-aether-text">Select Any Element</p>
          <p className="text-[10px] text-aether-subtext">Click on any text, shape, or image layer in the canvas to adjust its properties.</p>
        </div>
      </div>
    );
  }

  // Header for Selected Element
  const renderHeader = (title: string, icon: React.ReactNode) => (
    <div className="flex items-center justify-between pb-3 border-b border-aether-border/60">
      <div className="flex items-center space-x-2">
        <div className="p-1.5 rounded-xl bg-aether-light text-aether-primary border border-aether-border/80">
          {icon}
        </div>
        <div>
          <h3 className="text-sm font-bold text-aether-text">{title}</h3>
          <span className="text-[10px] text-aether-subtext font-mono">
            {Math.round(selectedElement.width)} × {Math.round(selectedElement.height)} px &bull; {selectedElement.rotation || 0}°
          </span>
        </div>
      </div>

      {/* Layer action buttons */}
      <div className="flex items-center space-x-1">
        <button
          onClick={() => onMoveLayer(selectedElement.id, 'up')}
          className="p-1.5 rounded-lg hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
          title="Bring Forward"
        >
          <ChevronUp className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={() => onMoveLayer(selectedElement.id, 'down')}
          className="p-1.5 rounded-lg hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
          title="Send Backward"
        >
          <ChevronDown className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDuplicateSelected}
          className="p-1.5 rounded-lg hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
          title="Duplicate Element"
        >
          <Copy className="w-3.5 h-3.5" />
        </button>
        <button
          onClick={onDeleteSelected}
          className="p-1.5 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"
          title="Delete Element"
        >
          <Trash2 className="w-3.5 h-3.5" />
        </button>
      </div>
    </div>
  );

  // TEXT INSPECTOR
  if (selectedElement.type === 'text') {
    const txt = selectedElement as TextElement;

    return (
      <div className="space-y-4">
        {renderHeader('Typography Inspector', <Type className="w-4 h-4" />)}

        {/* Content input */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-aether-subtext mb-1.5">
            Text Content
          </label>
          <textarea
            rows={2}
            value={txt.content}
            onChange={(e) => onUpdateSelected({ content: e.target.value })}
            className="w-full px-3 py-2 rounded-xl bg-aether-bg border border-aether-border text-xs font-semibold text-aether-text focus:outline-none focus:border-aether-primary resize-none"
          />
        </div>

        {/* Font Family & Weight */}
        <div className="grid grid-cols-2 gap-2">
          <div>
            <label className="block text-[10px] font-bold uppercase text-aether-subtext mb-1">
              Font Family
            </label>
            <select
              value={txt.fontFamily}
              onChange={(e) => onUpdateSelected({ fontFamily: e.target.value })}
              className="w-full p-2 rounded-xl bg-aether-bg border border-aether-border text-xs font-semibold text-aether-text focus:outline-none focus:border-aether-primary"
            >
              {AVAILABLE_FONTS.map((f) => (
                <option key={f.value} value={f.value}>
                  {f.label}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-[10px] font-bold uppercase text-aether-subtext mb-1">
              Font Weight
            </label>
            <select
              value={txt.fontWeight}
              onChange={(e) => onUpdateSelected({ fontWeight: e.target.value as any })}
              className="w-full p-2 rounded-xl bg-aether-bg border border-aether-border text-xs font-semibold text-aether-text focus:outline-none focus:border-aether-primary"
            >
              <option value="300">300 - Light</option>
              <option value="400">400 - Regular</option>
              <option value="500">500 - Medium</option>
              <option value="600">600 - SemiBold</option>
              <option value="700">700 - Bold</option>
              <option value="800">800 - ExtraBold</option>
              <option value="900">900 - Black</option>
            </select>
          </div>
        </div>

        {/* Font Size & Letter Spacing */}
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
              <span>FONT SIZE</span>
              <span>{txt.fontSize}px</span>
            </div>
            <input
              type="range"
              min={12}
              max={120}
              value={txt.fontSize}
              onChange={(e) => onUpdateSelected({ fontSize: Number(e.target.value) })}
              className="w-full accent-aether-primary"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
              <span>LETTER SPACING</span>
              <span>{txt.letterSpacing}px</span>
            </div>
            <input
              type="range"
              min={-2}
              max={16}
              value={txt.letterSpacing}
              onChange={(e) => onUpdateSelected({ letterSpacing: Number(e.target.value) })}
              className="w-full accent-aether-primary"
            />
          </div>
        </div>

        {/* Styles Bar (Bold, Italic, Underline, Uppercase, Alignment) */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-aether-subtext mb-1.5">
            Style &amp; Alignment
          </label>
          <div className="flex items-center space-x-1 p-1 bg-aether-bg rounded-xl border border-aether-border">
            <button
              onClick={() =>
                onUpdateSelected({ fontStyle: txt.fontStyle === 'italic' ? 'normal' : 'italic' })
              }
              className={`p-1.5 rounded-lg text-xs transition ${
                txt.fontStyle === 'italic' ? 'bg-white text-aether-primary shadow-sm' : 'text-aether-subtext'
              }`}
              title="Italic"
            >
              <Italic className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                onUpdateSelected({
                  textDecoration: txt.textDecoration === 'underline' ? 'none' : 'underline',
                })
              }
              className={`p-1.5 rounded-lg text-xs transition ${
                txt.textDecoration === 'underline' ? 'bg-white text-aether-primary shadow-sm' : 'text-aether-subtext'
              }`}
              title="Underline"
            >
              <Underline className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() =>
                onUpdateSelected({
                  textTransform: txt.textTransform === 'uppercase' ? 'none' : 'uppercase',
                })
              }
              className={`px-2 py-1 rounded-lg text-[10px] font-bold transition ${
                txt.textTransform === 'uppercase' ? 'bg-white text-aether-primary shadow-sm' : 'text-aether-subtext'
              }`}
              title="Uppercase"
            >
              AA
            </button>

            <div className="w-px h-4 bg-aether-border mx-1" />

            <button
              onClick={() => onUpdateSelected({ alignment: 'left' })}
              className={`p-1.5 rounded-lg text-xs transition ${
                txt.alignment === 'left' ? 'bg-white text-aether-primary shadow-sm' : 'text-aether-subtext'
              }`}
            >
              <AlignLeft className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateSelected({ alignment: 'center' })}
              className={`p-1.5 rounded-lg text-xs transition ${
                txt.alignment === 'center' ? 'bg-white text-aether-primary shadow-sm' : 'text-aether-subtext'
              }`}
            >
              <AlignCenter className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => onUpdateSelected({ alignment: 'right' })}
              className={`p-1.5 rounded-lg text-xs transition ${
                txt.alignment === 'right' ? 'bg-white text-aether-primary shadow-sm' : 'text-aether-subtext'
              }`}
            >
              <AlignRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Text Color Swatches */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-aether-subtext mb-1.5">
            Font Color
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BRAND_PALETTES.map((hex) => (
              <button
                key={hex}
                onClick={() => onUpdateSelected({ color: hex })}
                style={{ backgroundColor: hex }}
                className={`w-6 h-6 rounded-lg border transition shadow-sm ${
                  txt.color?.toLowerCase() === hex.toLowerCase()
                    ? 'border-aether-primary scale-110 ring-2 ring-aether-primary/40'
                    : 'border-gray-300'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Text Effect Choices */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-aether-subtext mb-1.5">
            Typography Effect
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['none', 'shadow', 'glow', 'glass', 'neon', 'lift'] as const).map((ef) => (
              <button
                key={ef}
                onClick={() => onUpdateSelected({ effect: ef })}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold capitalize border transition ${
                  txt.effect === ef
                    ? 'border-aether-primary bg-aether-light text-aether-primary shadow-sm'
                    : 'border-aether-border/80 hover:bg-aether-section/40 text-aether-text'
                }`}
              >
                {ef}
              </button>
            ))}
          </div>
        </div>

        {/* Opacity Slider */}
        <div>
          <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
            <span>LAYER OPACITY</span>
            <span>{Math.round((txt.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={txt.opacity ?? 1}
            onChange={(e) => onUpdateSelected({ opacity: Number(e.target.value) })}
            className="w-full accent-aether-primary"
          />
        </div>
      </div>
    );
  }

  // IMAGE INSPECTOR
  if (selectedElement.type === 'image') {
    const img = selectedElement as ImageElement;

    return (
      <div className="space-y-4">
        {renderHeader('Image Layer Inspector', <ImageIcon className="w-4 h-4" />)}

        {/* Quick Flip & Background Action */}
        <div className="grid grid-cols-2 gap-2">
          <button
            onClick={() => onUpdateSelected({ flipH: !img.flipH })}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              img.flipH ? 'bg-aether-primary text-white border-aether-primary' : 'bg-aether-bg border-aether-border text-aether-text'
            }`}
          >
            <FlipHorizontal className="w-3.5 h-3.5" />
            <span>Flip H</span>
          </button>
          <button
            onClick={() => onUpdateSelected({ flipV: !img.flipV })}
            className={`py-2 px-3 rounded-xl border text-xs font-bold transition flex items-center justify-center space-x-1.5 ${
              img.flipV ? 'bg-aether-primary text-white border-aether-primary' : 'bg-aether-bg border-aether-border text-aether-text'
            }`}
          >
            <FlipVertical className="w-3.5 h-3.5" />
            <span>Flip V</span>
          </button>
        </div>

        <button
          onClick={() => {
            onSetBackdropFromImage(img.src);
            toast.success('Set as canvas background!');
          }}
          className="w-full py-2 px-3 rounded-xl bg-aether-light border border-aether-primary/40 hover:bg-aether-primary hover:text-white text-aether-primary text-xs font-bold transition shadow-sm flex items-center justify-center space-x-1.5"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Set as Canvas Background</span>
        </button>

        {/* Frame / Corner Radius & Border */}
        <div className="space-y-3">
          <div>
            <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
              <span>CORNER RADIUS (ROUND / CIRCLE)</span>
              <span>{img.borderRadius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={Math.min(img.width, img.height) / 2}
              value={img.borderRadius || 0}
              onChange={(e) => onUpdateSelected({ borderRadius: Number(e.target.value) })}
              className="w-full accent-aether-primary"
            />
          </div>

          <div>
            <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
              <span>BORDER WIDTH</span>
              <span>{img.borderWidth}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={16}
              value={img.borderWidth || 0}
              onChange={(e) => onUpdateSelected({ borderWidth: Number(e.target.value) })}
              className="w-full accent-aether-primary"
            />
          </div>

          {img.borderWidth > 0 && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-aether-subtext mb-1.5">
                Border Color
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BRAND_PALETTES.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => onUpdateSelected({ borderColor: hex })}
                    style={{ backgroundColor: hex }}
                    className={`w-6 h-6 rounded-lg border transition shadow-sm ${
                      img.borderColor?.toLowerCase() === hex.toLowerCase()
                        ? 'border-aether-primary scale-110 ring-2 ring-aether-primary/40'
                        : 'border-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Drop Shadow Preset */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-aether-subtext mb-1.5">
            Drop Shadow
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['none', 'subtle', 'medium', 'dramatic', 'glow'] as const).map((sh) => (
              <button
                key={sh}
                onClick={() => onUpdateSelected({ shadow: sh })}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold capitalize border transition ${
                  img.shadow === sh
                    ? 'border-aether-primary bg-aether-light text-aether-primary shadow-sm'
                    : 'border-aether-border/80 hover:bg-aether-section/40 text-aether-text'
                }`}
              >
                {sh}
              </button>
            ))}
          </div>
        </div>

        {/* Toggle Image Filters */}
        <div className="pt-2 border-t border-aether-border/60">
          <button
            onClick={() => setShowFiltersTab(!showFiltersTab)}
            className="w-full flex items-center justify-between text-xs font-bold text-aether-text hover:text-aether-primary py-1"
          >
            <span className="flex items-center space-x-1.5">
              <SlidersHorizontal className="w-3.5 h-3.5" />
              <span>Image Lighting Filters</span>
            </span>
            <span>{showFiltersTab ? 'Hide' : 'Show'}</span>
          </button>

          {showFiltersTab && (
            <div className="space-y-3 pt-3">
              <div>
                <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
                  <span>BRIGHTNESS</span>
                  <span>{img.filter?.brightness ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={180}
                  value={img.filter?.brightness ?? 100}
                  onChange={(e) =>
                    onUpdateSelected({
                      filter: { ...(img.filter || {}), brightness: Number(e.target.value) } as any,
                    })
                  }
                  className="w-full accent-aether-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
                  <span>CONTRAST</span>
                  <span>{img.filter?.contrast ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min={50}
                  max={180}
                  value={img.filter?.contrast ?? 100}
                  onChange={(e) =>
                    onUpdateSelected({
                      filter: { ...(img.filter || {}), contrast: Number(e.target.value) } as any,
                    })
                  }
                  className="w-full accent-aether-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
                  <span>SATURATION</span>
                  <span>{img.filter?.saturation ?? 100}%</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={200}
                  value={img.filter?.saturation ?? 100}
                  onChange={(e) =>
                    onUpdateSelected({
                      filter: { ...(img.filter || {}), saturation: Number(e.target.value) } as any,
                    })
                  }
                  className="w-full accent-aether-primary"
                />
              </div>

              <div>
                <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
                  <span>BLUR</span>
                  <span>{img.filter?.blur ?? 0}px</span>
                </div>
                <input
                  type="range"
                  min={0}
                  max={20}
                  value={img.filter?.blur ?? 0}
                  onChange={(e) =>
                    onUpdateSelected({
                      filter: { ...(img.filter || {}), blur: Number(e.target.value) } as any,
                    })
                  }
                  className="w-full accent-aether-primary"
                />
              </div>
            </div>
          )}
        </div>

        {/* Opacity */}
        <div>
          <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
            <span>OPACITY</span>
            <span>{Math.round((img.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={img.opacity ?? 1}
            onChange={(e) => onUpdateSelected({ opacity: Number(e.target.value) })}
            className="w-full accent-aether-primary"
          />
        </div>
      </div>
    );
  }

  // SHAPE INSPECTOR
  if (selectedElement.type === 'shape') {
    const shp = selectedElement as ShapeElement;

    return (
      <div className="space-y-4">
        {renderHeader('Shape Inspector', <Square className="w-4 h-4" />)}

        {/* Fill Color / Gradient */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-aether-subtext mb-1.5">
            Fill Color
          </label>
          <div className="flex flex-wrap gap-1.5">
            {BRAND_PALETTES.map((hex) => (
              <button
                key={hex}
                onClick={() => onUpdateSelected({ fillColor: hex, gradientFill: undefined })}
                style={{ backgroundColor: hex }}
                className={`w-6 h-6 rounded-lg border transition shadow-sm ${
                  !shp.gradientFill && shp.fillColor?.toLowerCase() === hex.toLowerCase()
                    ? 'border-aether-primary scale-110 ring-2 ring-aether-primary/40'
                    : 'border-gray-300'
                }`}
              />
            ))}
          </div>

          <div className="grid grid-cols-4 gap-1.5 pt-2">
            {GRADIENT_PRESETS.map((grad, i) => (
              <button
                key={i}
                onClick={() => onUpdateSelected({ gradientFill: grad })}
                style={{ background: grad }}
                className={`h-6 rounded-lg border transition shadow-sm ${
                  shp.gradientFill === grad ? 'ring-2 ring-aether-primary scale-105' : 'hover:scale-105'
                }`}
              />
            ))}
          </div>
        </div>

        {/* Stroke / Border */}
        <div className="space-y-2.5">
          <div>
            <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
              <span>BORDER STROKE WIDTH</span>
              <span>{shp.strokeWidth}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={16}
              value={shp.strokeWidth || 0}
              onChange={(e) => onUpdateSelected({ strokeWidth: Number(e.target.value) })}
              className="w-full accent-aether-primary"
            />
          </div>

          {shp.strokeWidth > 0 && (
            <div>
              <label className="block text-[10px] font-bold uppercase text-aether-subtext mb-1.5">
                Stroke Color
              </label>
              <div className="flex flex-wrap gap-1.5">
                {BRAND_PALETTES.map((hex) => (
                  <button
                    key={hex}
                    onClick={() => onUpdateSelected({ strokeColor: hex })}
                    style={{ backgroundColor: hex }}
                    className={`w-6 h-6 rounded-lg border transition shadow-sm ${
                      shp.strokeColor?.toLowerCase() === hex.toLowerCase()
                        ? 'border-aether-primary scale-110 ring-2 ring-aether-primary/40'
                        : 'border-gray-300'
                    }`}
                  />
                ))}
              </div>
            </div>
          )}
        </div>

        {/* Corner Radius (for rounded/rect) */}
        {shp.shapeType === 'rounded' && (
          <div>
            <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
              <span>CORNER RADIUS</span>
              <span>{shp.borderRadius}px</span>
            </div>
            <input
              type="range"
              min={0}
              max={80}
              value={shp.borderRadius || 24}
              onChange={(e) => onUpdateSelected({ borderRadius: Number(e.target.value) })}
              className="w-full accent-aether-primary"
            />
          </div>
        )}

        {/* Drop Shadow Preset */}
        <div>
          <label className="block text-[10px] font-bold uppercase text-aether-subtext mb-1.5">
            Drop Shadow
          </label>
          <div className="grid grid-cols-3 gap-1.5">
            {(['none', 'subtle', 'medium', 'dramatic', 'glow'] as const).map((sh) => (
              <button
                key={sh}
                onClick={() => onUpdateSelected({ shadow: sh })}
                className={`py-1.5 px-2 rounded-xl text-[11px] font-semibold capitalize border transition ${
                  shp.shadow === sh
                    ? 'border-aether-primary bg-aether-light text-aether-primary shadow-sm'
                    : 'border-aether-border/80 hover:bg-aether-section/40 text-aether-text'
                }`}
              >
                {sh}
              </button>
            ))}
          </div>
        </div>

        {/* Opacity */}
        <div>
          <div className="flex justify-between text-[10px] text-aether-subtext font-bold mb-1">
            <span>OPACITY</span>
            <span>{Math.round((shp.opacity ?? 1) * 100)}%</span>
          </div>
          <input
            type="range"
            min={0.1}
            max={1}
            step={0.05}
            value={shp.opacity ?? 1}
            onChange={(e) => onUpdateSelected({ opacity: Number(e.target.value) })}
            className="w-full accent-aether-primary"
          />
        </div>
      </div>
    );
  }

  return null;
};
