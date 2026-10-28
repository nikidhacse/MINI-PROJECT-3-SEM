import React, { useState, useEffect } from 'react';
import { Search, Plus, Sparkles, FolderKanban, Image as ImageIcon } from 'lucide-react';
import { ApiClient } from '../../services/api';
import toast from 'react-hot-toast';

interface StockPhotosDrawerProps {
  onAddImageLayer: (src: string, name?: string) => void;
  onSetBackdrop: (src: string) => void;
}

const STOCK_CATEGORIES = [
  {
    id: 'ai_vault',
    label: 'My AI Assets',
  },
  {
    id: 'abstract',
    label: '3D & Abstract',
  },
  {
    id: 'minimal',
    label: 'Minimalist Studio',
  },
  {
    id: 'tech',
    label: 'Tech & Cyber',
  },
  {
    id: 'nature',
    label: 'Nature & Atmosphere',
  },
];

const CURATED_IMAGES: Record<string, Array<{ id: string; title: string; src: string }>> = {
  abstract: [
    {
      id: 'abs-1',
      title: 'Violet Fluid Wave',
      src: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'abs-2',
      title: 'Holographic Gradient',
      src: 'https://images.unsplash.com/photo-1550684848-fac1c5b4e853?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'abs-3',
      title: 'Dark Neon Orb',
      src: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'abs-4',
      title: 'Silk Purple Curves',
      src: 'https://images.unsplash.com/photo-1618005198919-d3d4b5a92ead?auto=format&fit=crop&w=800&q=80',
    },
  ],
  minimal: [
    {
      id: 'min-1',
      title: 'Modern Architecture Podium',
      src: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'min-2',
      title: 'Clean Studio Lighting',
      src: 'https://images.unsplash.com/photo-1507679799987-c73779587ccf?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'min-3',
      title: 'White Marble Texture',
      src: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?auto=format&fit=crop&w=800&q=80',
    },
  ],
  tech: [
    {
      id: 'tech-1',
      title: 'Cyberpunk Neon Street',
      src: 'https://images.unsplash.com/photo-1550745165-9bc0b252726f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'tech-2',
      title: 'AI Neural Matrix',
      src: 'https://images.unsplash.com/photo-1620712943543-bcc4688e7485?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'tech-3',
      title: 'Digital Data Grid',
      src: 'https://images.unsplash.com/photo-1526374965328-7f61d4dc18c5?auto=format&fit=crop&w=800&q=80',
    },
  ],
  nature: [
    {
      id: 'nat-1',
      title: 'Misty Forest Pines',
      src: 'https://images.unsplash.com/photo-1511497584788-87676104235f?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'nat-2',
      title: 'Golden Sunset Horizons',
      src: 'https://images.unsplash.com/photo-1495616811223-4d98c6e9c869?auto=format&fit=crop&w=800&q=80',
    },
    {
      id: 'nat-3',
      title: 'Deep Ocean Blues',
      src: 'https://images.unsplash.com/photo-1518837695005-2083093ee35b?auto=format&fit=crop&w=800&q=80',
    },
  ],
};

export const StockPhotosDrawer: React.FC<StockPhotosDrawerProps> = ({
  onAddImageLayer,
  onSetBackdrop,
}) => {
  const [activeCategory, setActiveCategory] = useState('abstract');
  const [search, setSearch] = useState('');
  const [vaultAssets, setVaultAssets] = useState<any[]>([]);
  const [loadingVault, setLoadingVault] = useState(false);

  useEffect(() => {
    if (activeCategory === 'ai_vault') {
      loadVaultAssets();
    }
  }, [activeCategory]);

  const loadVaultAssets = async () => {
    setLoadingVault(true);
    try {
      const res = await ApiClient.getResource('assets');
      if (res.data && Array.isArray(res.data)) {
        setVaultAssets(res.data);
      }
    } catch (err) {
      console.warn('Could not load assets for editor:', err);
    } finally {
      setLoadingVault(false);
    }
  };

  const imagesToShow =
    activeCategory === 'ai_vault'
      ? vaultAssets.map((a) => ({
          id: a.id,
          title: a.title,
          src: a.storage_path || a.thumbnail_path,
        }))
      : (CURATED_IMAGES[activeCategory] || []).filter((img) =>
          search ? img.title.toLowerCase().includes(search.toLowerCase()) : true
        );

  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-bold text-aether-text">Stock &amp; Generated Photos</h3>
        <p className="text-[11px] text-aether-subtext">Add high-resolution imagery into your canvas</p>
      </div>

      {/* Category Pills */}
      <div className="flex overflow-x-auto space-x-1.5 pb-1">
        {STOCK_CATEGORIES.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setActiveCategory(cat.id)}
            className={`px-3 py-1.5 rounded-xl text-[11px] font-bold whitespace-nowrap transition ${
              activeCategory === cat.id
                ? 'bg-aether-primary text-white shadow-sm'
                : 'bg-aether-bg border border-aether-border/80 text-aether-subtext hover:text-aether-text'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Search Bar */}
      <div className="relative">
        <Search className="w-3.5 h-3.5 text-aether-subtext absolute left-3 top-2.5" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Filter photos..."
          className="w-full pl-9 pr-3 py-2 rounded-xl bg-aether-bg border border-aether-border text-xs focus:outline-none focus:border-aether-primary"
        />
      </div>

      {/* Photos Grid */}
      <div className="grid grid-cols-2 gap-2 max-h-[420px] overflow-y-auto pr-1">
        {loadingVault ? (
          <div className="col-span-2 py-8 text-center text-xs text-aether-subtext">
            Loading AI Vault assets...
          </div>
        ) : imagesToShow.length === 0 ? (
          <div className="col-span-2 py-8 text-center text-xs text-aether-subtext">
            No images found.
          </div>
        ) : (
          imagesToShow.map((img) => (
            <div
              key={img.id}
              className="group relative rounded-2xl border border-aether-border overflow-hidden bg-white hover:border-aether-primary shadow-sm transition"
            >
              <div className="aspect-square bg-aether-bg overflow-hidden flex items-center justify-center">
                <img
                  src={img.src}
                  alt={img.title}
                  className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
                />
              </div>

              {/* Hover Actions */}
              <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col items-center justify-center p-2 space-y-1.5">
                <button
                  onClick={() => {
                    onAddImageLayer(img.src, img.title);
                    toast.success('Inserted image layer');
                  }}
                  className="w-full py-1.5 px-2 rounded-xl bg-aether-primary text-white text-[10px] font-bold shadow-sm hover:bg-aether-hover transition flex items-center justify-center space-x-1"
                >
                  <Plus className="w-3 h-3" />
                  <span>Insert Layer</span>
                </button>
                <button
                  onClick={() => {
                    onSetBackdrop(img.src);
                    toast.success('Updated canvas backdrop');
                  }}
                  className="w-full py-1 px-2 rounded-xl bg-white/90 text-aether-text text-[9px] font-bold hover:bg-white transition"
                >
                  Set Background
                </button>
              </div>

              <div className="p-1.5 text-[9px] font-semibold text-aether-text truncate bg-white/90">
                {img.title}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};
