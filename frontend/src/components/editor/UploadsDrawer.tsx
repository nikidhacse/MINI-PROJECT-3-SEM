import React, { useRef, useState } from 'react';
import { Upload, Plus, Trash2, Image as ImageIcon, Sparkles } from 'lucide-react';
import toast from 'react-hot-toast';

interface UploadsDrawerProps {
  onAddImageLayer: (src: string, name?: string) => void;
  onSetBackdrop: (src: string) => void;
}

export const UploadsDrawer: React.FC<UploadsDrawerProps> = ({
  onAddImageLayer,
  onSetBackdrop,
}) => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [uploads, setUploads] = useState<Array<{ id: string; name: string; src: string }>>([
    {
      id: 'demo-1',
      name: 'Modern Logo Badge',
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'demo-2',
      name: 'Cyberpunk Neon Sticker',
      src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=600&q=80',
    },
    {
      id: 'demo-3',
      name: 'Minimalist Product Cutout',
      src: 'https://images.unsplash.com/photo-1523275335684-37898b6baf30?auto=format&fit=crop&w=600&q=80',
    },
  ]);

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      if (!file.type.startsWith('image/')) {
        toast.error(`${file.name} is not an image file`);
        return;
      }

      const reader = new FileReader();
      reader.onload = (event) => {
        const src = event.target?.result as string;
        if (src) {
          const newItem = {
            id: 'up-' + Math.random().toString(36).substring(2, 9),
            name: file.name,
            src,
          };
          setUploads((prev) => [newItem, ...prev]);
          toast.success(`Uploaded ${file.name}`);
        }
      };
      reader.readAsDataURL(file);
    });

    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const handleDeleteUpload = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setUploads((prev) => prev.filter((u) => u.id !== id));
    toast.success('Removed upload');
  };

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-aether-text">Upload Media</h3>
        <p className="text-[11px] text-aether-subtext">Insert personal photos, logos &amp; graphics</p>
      </div>

      {/* Hidden file input */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileUpload}
        className="hidden"
      />

      {/* Upload Drop Zone Button */}
      <div
        onClick={() => fileInputRef.current?.click()}
        className="cursor-pointer border-2 border-dashed border-aether-primary/40 hover:border-aether-primary bg-aether-light/40 hover:bg-aether-light p-6 rounded-3xl text-center space-y-2 transition flex flex-col items-center justify-center group"
      >
        <div className="w-10 h-10 rounded-2xl bg-white border border-aether-border flex items-center justify-center text-aether-primary shadow-sm group-hover:scale-110 transition-transform">
          <Upload className="w-5 h-5" />
        </div>
        <div>
          <span className="text-xs font-bold text-aether-primary block">Upload Files from Device</span>
          <span className="text-[10px] text-aether-subtext">PNG, JPG, SVG or WebP</span>
        </div>
      </div>

      {/* Uploaded Gallery Grid */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-bold text-aether-text pt-2">
          <span>Uploaded Files ({uploads.length})</span>
        </div>

        <div className="grid grid-cols-2 gap-2 max-h-[380px] overflow-y-auto pr-1">
          {uploads.map((item) => (
            <div
              key={item.id}
              className="group relative rounded-2xl border border-aether-border overflow-hidden bg-white hover:border-aether-primary shadow-sm cursor-pointer transition"
            >
              <div className="aspect-square bg-aether-bg overflow-hidden flex items-center justify-center">
                <img
                  src={item.src}
                  alt={item.name}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Action Overlay */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 space-y-1.5">
                <button
                  onClick={() => onAddImageLayer(item.src, item.name)}
                  className="w-full py-1.5 px-2 rounded-xl bg-aether-primary text-white text-[10px] font-bold shadow-sm hover:bg-aether-hover transition flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Add Layer</span>
                </button>
                <button
                  onClick={() => onSetBackdrop(item.src)}
                  className="w-full py-1 px-2 rounded-xl bg-white/90 text-aether-text text-[9px] font-bold hover:bg-white transition"
                >
                  Set Background
                </button>
                <button
                  onClick={(e) => handleDeleteUpload(item.id, e)}
                  className="absolute top-1.5 right-1.5 p-1 rounded-lg bg-red-500/80 hover:bg-red-600 text-white transition"
                  title="Delete"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>

              <div className="p-1.5 text-[9px] font-semibold text-aether-text truncate bg-white/90">
                {item.name}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};
