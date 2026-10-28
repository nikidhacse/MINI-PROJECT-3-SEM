import React from 'react';
import {
  Layers,
  Eye,
  EyeOff,
  Lock,
  Unlock,
  Copy,
  Trash2,
  ChevronUp,
  ChevronDown,
  Type,
  Image as ImageIcon,
  Square,
  Sparkles,
} from 'lucide-react';
import { StudioElement } from '../../types/editor';
import toast from 'react-hot-toast';

interface LayersDrawerProps {
  elements: StudioElement[];
  selectedId: string | null;
  onSelect: (id: string) => void;
  onUpdateElement: (id: string, updates: Partial<StudioElement>) => void;
  onDeleteElement: (id: string) => void;
  onDuplicateElement: (id: string) => void;
  onMoveLayer: (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => void;
}

export const LayersDrawer: React.FC<LayersDrawerProps> = ({
  elements,
  selectedId,
  onSelect,
  onUpdateElement,
  onDeleteElement,
  onDuplicateElement,
  onMoveLayer,
}) => {
  // Elements rendered from highest zIndex (top) to lowest (bottom)
  const sortedLayers = [...elements].sort((a, b) => b.zIndex - a.zIndex);

  const getIcon = (el: StudioElement) => {
    if (el.type === 'text') return <Type className="w-3.5 h-3.5 text-aether-primary" />;
    if (el.type === 'image') return <ImageIcon className="w-3.5 h-3.5 text-emerald-500" />;
    return <Square className="w-3.5 h-3.5 text-indigo-500" />;
  };

  const getLabel = (el: StudioElement) => {
    if (el.name) return el.name;
    if (el.type === 'text') return `Text: "${(el as any).content?.substring(0, 16)}..."`;
    if (el.type === 'image') return 'Image Layer';
    return `Shape (${(el as any).shapeType})`;
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-sm font-bold text-aether-text flex items-center space-x-1.5">
            <Layers className="w-4 h-4 text-aether-primary" />
            <span>Canvas Layers</span>
          </h3>
          <p className="text-[11px] text-aether-subtext">{elements.length} layer(s) on stage</p>
        </div>
      </div>

      {elements.length === 0 ? (
        <div className="text-center py-12 space-y-2">
          <Layers className="w-8 h-8 text-aether-subtext/40 mx-auto" />
          <p className="text-xs text-aether-subtext">No layers added yet. Add text, shapes, or images.</p>
        </div>
      ) : (
        <div className="space-y-1.5 max-h-[500px] overflow-y-auto pr-1">
          {sortedLayers.map((el, index) => {
            const isSelected = selectedId === el.id;

            return (
              <div
                key={el.id}
                onClick={() => onSelect(el.id)}
                className={`group flex items-center justify-between p-2.5 rounded-2xl border transition cursor-pointer ${
                  isSelected
                    ? 'bg-aether-light border-aether-primary shadow-sm ring-1 ring-aether-primary/40'
                    : 'bg-white border-aether-border/80 hover:bg-aether-section/40'
                }`}
              >
                {/* Left: Icon & Label */}
                <div className="flex items-center space-x-2.5 flex-1 min-w-0">
                  <div className="p-1.5 rounded-xl bg-aether-bg border border-aether-border shrink-0">
                    {getIcon(el)}
                  </div>
                  <div className="min-w-0 flex-1">
                    <span className="text-xs font-semibold text-aether-text truncate block">
                      {getLabel(el)}
                    </span>
                    <span className="text-[9px] text-aether-subtext block uppercase">
                      Layer #{elements.length - index} &bull; z:{el.zIndex}
                    </span>
                  </div>
                </div>

                {/* Right: Quick Action Buttons */}
                <div className="flex items-center space-x-1 shrink-0">
                  {/* Move Up / Down */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveLayer(el.id, 'up');
                    }}
                    className="p-1 rounded-lg hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
                    title="Bring Forward"
                  >
                    <ChevronUp className="w-3.5 h-3.5" />
                  </button>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onMoveLayer(el.id, 'down');
                    }}
                    className="p-1 rounded-lg hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
                    title="Send Backward"
                  >
                    <ChevronDown className="w-3.5 h-3.5" />
                  </button>

                  {/* Toggle Visibility */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement(el.id, { hidden: !el.hidden });
                    }}
                    className="p-1 rounded-lg hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
                    title={el.hidden ? 'Show Layer' : 'Hide Layer'}
                  >
                    {el.hidden ? <EyeOff className="w-3.5 h-3.5 text-amber-500" /> : <Eye className="w-3.5 h-3.5" />}
                  </button>

                  {/* Lock / Unlock */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onUpdateElement(el.id, { locked: !el.locked });
                    }}
                    className="p-1 rounded-lg hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
                    title={el.locked ? 'Unlock Layer' : 'Lock Layer'}
                  >
                    {el.locked ? <Lock className="w-3.5 h-3.5 text-red-500" /> : <Unlock className="w-3.5 h-3.5" />}
                  </button>

                  {/* Duplicate */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDuplicateElement(el.id);
                    }}
                    className="p-1 rounded-lg hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
                    title="Duplicate"
                  >
                    <Copy className="w-3.5 h-3.5" />
                  </button>

                  {/* Delete */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      onDeleteElement(el.id);
                    }}
                    className="p-1 rounded-lg hover:bg-red-50 text-red-400 hover:text-red-600 transition"
                    title="Delete"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};
