import React, { useState } from 'react';
import {
  Square,
  Circle,
  Triangle,
  Star,
  Shield,
  Heart,
  ArrowRight,
  MessageSquare,
  Minus,
  Sparkles,
} from 'lucide-react';
import { ShapeElement, ShapeKind, BRAND_PALETTES, GRADIENT_PRESETS } from '../../types/editor';
import toast from 'react-hot-toast';

interface ShapesDrawerProps {
  onAddShape: (shape: Partial<ShapeElement>) => void;
}

const SHAPE_ITEMS: Array<{ kind: ShapeKind; label: string; icon: React.ReactNode; defaultW: number; defaultH: number }> = [
  { kind: 'rounded', label: 'Rounded Box', icon: <Square className="w-5 h-5 rounded-md" />, defaultW: 240, defaultH: 140 },
  { kind: 'circle', label: 'Circle / Oval', icon: <Circle className="w-5 h-5" />, defaultW: 160, defaultH: 160 },
  { kind: 'rectangle', label: 'Rectangle', icon: <Square className="w-5 h-5" />, defaultW: 260, defaultH: 120 },
  { kind: 'pill', label: 'Pill Tag', icon: <div className="w-6 h-3.5 rounded-full border border-current" />, defaultW: 220, defaultH: 50 },
  { kind: 'badge', label: 'Starburst Badge', icon: <Sparkles className="w-5 h-5" />, defaultW: 160, defaultH: 160 },
  { kind: 'star', label: '5-Point Star', icon: <Star className="w-5 h-5" />, defaultW: 150, defaultH: 150 },
  { kind: 'triangle', label: 'Triangle', icon: <Triangle className="w-5 h-5" />, defaultW: 160, defaultH: 140 },
  { kind: 'heart', label: 'Heart', icon: <Heart className="w-5 h-5" />, defaultW: 150, defaultH: 140 },
  { kind: 'arrow', label: 'Arrow Pointer', icon: <ArrowRight className="w-5 h-5" />, defaultW: 200, defaultH: 70 },
  { kind: 'speech', label: 'Speech Bubble', icon: <MessageSquare className="w-5 h-5" />, defaultW: 200, defaultH: 140 },
  { kind: 'line', label: 'Divider Line', icon: <Minus className="w-5 h-5" />, defaultW: 300, defaultH: 20 },
];

export const ShapesDrawer: React.FC<ShapesDrawerProps> = ({ onAddShape }) => {
  const [selectedColor, setSelectedColor] = useState('#8B5CF6');
  const [useGradient, setUseGradient] = useState<string | null>(null);

  const handleAdd = (item: typeof SHAPE_ITEMS[0]) => {
    onAddShape({
      name: item.label,
      shapeType: item.kind,
      width: item.defaultW,
      height: item.defaultH,
      fillColor: selectedColor,
      gradientFill: useGradient || undefined,
      strokeColor: '#FFFFFF',
      strokeWidth: 0,
      borderRadius: item.kind === 'rounded' ? 24 : 0,
      shadow: 'subtle',
      opacity: 0.95,
    });
    toast.success(`Added ${item.label}`);
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-aether-text">Shapes &amp; Graphics</h3>
        <p className="text-[11px] text-aether-subtext">Click any shape to place it on the canvas</p>
      </div>

      {/* Shapes Grid */}
      <div className="grid grid-cols-3 gap-2">
        {SHAPE_ITEMS.map((item) => (
          <button
            key={item.kind}
            onClick={() => handleAdd(item)}
            className="flex flex-col items-center justify-center p-3 rounded-2xl bg-aether-bg hover:bg-aether-light border border-aether-border hover:border-aether-primary text-aether-text hover:text-aether-primary transition group shadow-sm"
          >
            <div className="mb-1 text-aether-primary group-hover:scale-110 transition-transform">
              {item.icon}
            </div>
            <span className="text-[10px] font-semibold text-center leading-tight">
              {item.label}
            </span>
          </button>
        ))}
      </div>

      {/* Default Fill Color Selector */}
      <div className="space-y-2 pt-2">
        <label className="block text-[10px] font-bold uppercase text-aether-subtext">
          Default Shape Fill Color
        </label>
        <div className="flex flex-wrap gap-1.5">
          {BRAND_PALETTES.map((hex) => (
            <button
              key={hex}
              onClick={() => {
                setSelectedColor(hex);
                setUseGradient(null);
              }}
              style={{ backgroundColor: hex }}
              className={`w-6 h-6 rounded-lg border transition shadow-sm ${
                !useGradient && selectedColor === hex
                  ? 'border-aether-primary scale-110 ring-2 ring-aether-primary/40'
                  : 'border-gray-200 hover:scale-105'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Gradients */}
      <div className="space-y-2 pt-1">
        <label className="block text-[10px] font-bold uppercase text-aether-subtext">
          Vibrant Gradients
        </label>
        <div className="grid grid-cols-4 gap-1.5">
          {GRADIENT_PRESETS.map((grad, i) => (
            <button
              key={i}
              onClick={() => setUseGradient(grad)}
              style={{ background: grad }}
              className={`h-7 rounded-xl border transition shadow-sm ${
                useGradient === grad ? 'ring-2 ring-aether-primary scale-105' : 'hover:scale-105'
              }`}
            />
          ))}
        </div>
      </div>
    </div>
  );
};
