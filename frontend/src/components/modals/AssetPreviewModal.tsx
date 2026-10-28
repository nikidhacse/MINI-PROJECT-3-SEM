import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Paintbrush, Download, Sparkles, Trash2, Calendar, CheckCircle2, ShieldAlert } from 'lucide-react';
import { useNavigate } from 'react-router-dom';

interface AssetPreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  asset: any;
  onDelete?: (id: string) => void;
  onOpenCaptions?: (asset: any) => void;
}

export const AssetPreviewModal: React.FC<AssetPreviewModalProps> = ({
  isOpen,
  onClose,
  asset,
  onDelete,
  onOpenCaptions
}) => {
  const navigate = useNavigate();

  if (!isOpen || !asset) return null;

  const handleDownload = () => {
    const link = document.createElement('a');
    link.href = asset.storage_path || asset.thumbnail_path;
    link.download = `${asset.title.toLowerCase().replace(/\s+/g, '-')}.png`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleEditInCanvas = () => {
    onClose();
    navigate('/creator/editor', { state: { backdropImage: asset.storage_path || asset.thumbnail_path, assetTitle: asset.title } });
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-md">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel bg-white rounded-3xl shadow-lavender-lg max-w-4xl w-full max-h-[90vh] overflow-hidden border border-aether-border flex flex-col md:flex-row relative"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-aether-text shadow-sm transition"
          >
            <X className="w-5 h-5" />
          </button>

          {/* Left: Image Canvas */}
          <div className="md:w-3/5 bg-aether-bg p-6 flex items-center justify-center border-r border-aether-border/60">
            <img
              src={asset.storage_path || asset.thumbnail_path}
              alt={asset.title}
              className="max-h-[60vh] max-w-full rounded-2xl shadow-lavender-md object-contain"
            />
          </div>

          {/* Right: Details & Workflow */}
          <div className="md:w-2/5 p-6 flex flex-col justify-between overflow-y-auto">
            <div className="space-y-4">
              <div>
                <div className="flex items-center space-x-2 mb-1.5">
                  <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                    asset.status === 'approved' ? 'bg-emerald-100 text-emerald-700' :
                    asset.status === 'in_review' ? 'bg-amber-100 text-amber-800' :
                    'bg-aether-section text-aether-primary'
                  }`}>
                    {asset.status || 'draft'}
                  </span>
                  <span className="text-[11px] text-aether-subtext">{asset.width} × {asset.height}px</span>
                </div>
                <h3 className="text-lg font-bold text-aether-text">{asset.title}</h3>
                <p className="text-xs text-aether-subtext mt-1">{asset.category || 'Social Media'}</p>
              </div>

              {asset.description && (
                <div className="p-3 bg-aether-section/50 rounded-2xl border border-aether-border/60">
                  <div className="text-[10px] uppercase font-bold text-aether-subtext mb-1">Prompt Spec</div>
                  <p className="text-xs text-aether-text leading-relaxed">{asset.description}</p>
                </div>
              )}

              {/* Version & Quality */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="p-2.5 rounded-xl bg-white border border-aether-border">
                  <span className="text-[10px] text-aether-subtext block">Version</span>
                  <span className="font-bold text-aether-text">v{asset.current_version || 1}.0</span>
                </div>
                <div className="p-2.5 rounded-xl bg-white border border-aether-border">
                  <span className="text-[10px] text-aether-subtext block">Quality Score</span>
                  <span className="font-bold text-aether-primary">{asset.quality_score || 95}%</span>
                </div>
              </div>
            </div>

            {/* Action Bar */}
            <div className="space-y-2 pt-6 border-t border-aether-border/60 mt-4">
              <button
                onClick={handleEditInCanvas}
                className="w-full py-2.5 px-4 rounded-2xl bg-aether-primary text-white text-xs font-bold shadow-lavender-sm hover:bg-aether-hover transition flex items-center justify-center space-x-2"
              >
                <Paintbrush className="w-4 h-4" />
                <span>Open in Design Studio</span>
              </button>

              <div className="grid grid-cols-2 gap-2">
                <button
                  onClick={() => {
                    onClose();
                    onOpenCaptions?.(asset);
                  }}
                  className="py-2.5 px-3 rounded-2xl border border-aether-border hover:bg-aether-light text-xs font-semibold text-aether-text flex items-center justify-center space-x-1.5 transition"
                >
                  <Sparkles className="w-3.5 h-3.5 text-pink-500" />
                  <span>AI Captions</span>
                </button>

                <button
                  onClick={handleDownload}
                  className="py-2.5 px-3 rounded-2xl border border-aether-border hover:bg-aether-light text-xs font-semibold text-aether-text flex items-center justify-center space-x-1.5 transition"
                >
                  <Download className="w-3.5 h-3.5 text-aether-primary" />
                  <span>Download</span>
                </button>
              </div>

              {onDelete && (
                <button
                  onClick={() => {
                    onDelete(asset.id);
                    onClose();
                  }}
                  className="w-full py-2 text-xs font-semibold text-red-500 hover:text-red-700 transition flex items-center justify-center space-x-1"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                  <span>Delete Asset</span>
                </button>
              )}
            </div>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
