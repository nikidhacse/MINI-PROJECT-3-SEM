import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  FolderKanban,
  Search,
  Sparkles,
  Paintbrush,
  Download,
  Trash2,
  Heart,
  Eye,
  SlidersHorizontal,
  Clock
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { SupportChat } from '../../components/layout/SupportChat';
import { AssetPreviewModal } from '../../components/modals/AssetPreviewModal';
import { CaptionsModal } from '../../components/modals/CaptionsModal';
import { ApiClient } from '../../services/api';
import toast from 'react-hot-toast';

export const AssetsPage: React.FC = () => {
  const navigate = useNavigate();
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [captionAsset, setCaptionAsset] = useState<any | null>(null);
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const categories = ['All', 'Poster', 'Banner', 'Social Media', 'Presentation', 'Logo'];

  useEffect(() => {
    fetchAssets();
  }, []);

  const fetchAssets = async () => {
    setLoading(true);
    try {
      let combinedAssets: any[] = [];

      // 1. Fetch from backend API
      try {
        const res = await ApiClient.getResource('assets');
        if (res.data && Array.isArray(res.data)) {
          combinedAssets = [...res.data];
        }
      } catch (err) {
        console.warn('Backend assets fetch notice:', err);
      }

      // 2. Also check local workspace saved designs
      try {
        const localSaved = JSON.parse(localStorage.getItem('aether_saved_designs') || '[]');
        if (Array.isArray(localSaved) && localSaved.length > 0) {
          const localAssetsFormatted = localSaved.map((d: any) => ({
            id: d.id,
            title: d.title || 'Creative Marketing Visual',
            description: `Designed in Canva Studio with ${d.elements?.length || 0} layer(s)`,
            category: 'Social Media',
            status: 'draft',
            width: d.width || 1080,
            height: d.height || 1080,
            storage_path: d.preview,
            thumbnail_path: d.preview,
            quality_score: 99,
            created_at: d.savedAt || new Date().toISOString(),
          }));

          const existingIds = new Set(combinedAssets.map(a => a.id));
          localAssetsFormatted.forEach(la => {
            if (!existingIds.has(la.id)) {
              combinedAssets.unshift(la);
            }
          });
        }
      } catch (e) {
        console.warn('Local saved designs parse error:', e);
      }

      setAssets(combinedAssets);
    } finally {
      setLoading(false);
    }
  };

  const toggleFavorite = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setFavorites(prev => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const handleDelete = async (id: string) => {
    try {
      // Remove from localStorage if present
      try {
        const localSaved = JSON.parse(localStorage.getItem('aether_saved_designs') || '[]');
        const updatedLocal = localSaved.filter((d: any) => d.id !== id);
        localStorage.setItem('aether_saved_designs', JSON.stringify(updatedLocal));
      } catch (e) {}

      // Delete from backend API
      await ApiClient.writeResource('assets', {
        op: 'delete',
        id
      });
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.success('Asset deleted successfully');
    } catch (err: any) {
      setAssets(prev => prev.filter(a => a.id !== id));
      toast.success('Asset deleted from library');
    }
  };

  const filtered = assets.filter(a => {
    const matchesCat = selectedCategory === 'All' || a.category === selectedCategory;
    const matchesSearch = !searchQuery ||
      a.title?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      a.description?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-aether-primary">
                Workspace Repository
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-aether-text mt-1">
                Asset Vault &amp; Library
              </h1>
              <p className="text-xs text-aether-subtext mt-1">
                Manage, preview, composite, and distribute brand assets across your channels.
              </p>
            </div>

            {/* Search Input */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-aether-subtext absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search by title or prompt..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium shadow-sm"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto pb-2 space-x-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-aether-primary text-white shadow-lavender-sm'
                    : 'bg-white border border-aether-border text-aether-subtext hover:text-aether-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Asset Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-72 bg-white rounded-3xl animate-pulse border border-aether-border/60" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel bg-white p-12 rounded-3xl border border-aether-border text-center space-y-4">
              <FolderKanban className="w-12 h-12 text-aether-primary mx-auto" />
              <h3 className="text-base font-bold text-aether-text">No matching assets found</h3>
              <p className="text-xs text-aether-subtext max-w-sm mx-auto">
                Generate your first marketing visual or adjust search filters to explore saved files.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((asset) => {
                const isFav = favorites.has(asset.id);

                return (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className="cursor-pointer glass-panel bg-white rounded-3xl border border-aether-border overflow-hidden card-hover shadow-lavender-sm flex flex-col justify-between group relative"
                  >
                    {/* Media Thumbnail */}
                    <div className="aspect-square bg-aether-bg relative overflow-hidden flex items-center justify-center">
                      <img
                        src={asset.storage_path || asset.thumbnail_path}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />

                      {/* Favorite Button */}
                      <button
                        onClick={(e) => toggleFavorite(asset.id, e)}
                        className="absolute top-3 right-3 p-2 rounded-full bg-white/80 backdrop-blur-md hover:bg-white text-aether-text shadow-sm transition z-10"
                      >
                        <Heart className={`w-3.5 h-3.5 ${isFav ? 'fill-red-500 text-red-500' : 'text-aether-subtext'}`} />
                      </button>

                      {/* Category Badge */}
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-aether-text font-bold text-[10px] uppercase shadow-sm">
                        {asset.category || 'Social'}
                      </span>

                      {/* Hover Overlay Action Bar */}
                      <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center space-x-2">
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedAsset(asset);
                          }}
                          className="p-2.5 rounded-2xl bg-white text-aether-text shadow-sm hover:bg-aether-light transition"
                          title="Preview"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            navigate('/creator/editor', {
                              state: { backdropImage: asset.storage_path || asset.thumbnail_path, assetTitle: asset.title }
                            });
                          }}
                          className="p-2.5 rounded-2xl bg-aether-primary text-white shadow-sm hover:bg-aether-hover transition"
                          title="Open in Design Studio"
                        >
                          <Paintbrush className="w-4 h-4" />
                        </button>
                        <button
                          onClick={(e) => {
                            e.stopPropagation();
                            setCaptionAsset(asset);
                          }}
                          className="p-2.5 rounded-2xl bg-pink-500 text-white shadow-sm hover:bg-pink-600 transition"
                          title="Generate Captions"
                        >
                          <Sparkles className="w-4 h-4" />
                        </button>
                      </div>
                    </div>

                    {/* Metadata Footer */}
                    <div className="p-4">
                      <div className="flex items-center justify-between text-[10px] text-aether-subtext mb-1">
                        <span className="font-semibold uppercase">{asset.width} × {asset.height}px</span>
                        <span className={`px-2 py-0.5 rounded-full font-bold uppercase ${
                          asset.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          asset.status === 'in_review' ? 'bg-amber-100 text-amber-800' :
                          'bg-aether-section text-aether-primary'
                        }`}>
                          {asset.status || 'draft'}
                        </span>
                      </div>
                      <h4 className="font-bold text-xs text-aether-text truncate">{asset.title}</h4>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </main>
      </div>

      <SupportChat />

      <AssetPreviewModal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        asset={selectedAsset}
        onDelete={handleDelete}
        onOpenCaptions={(a) => setCaptionAsset(a)}
      />

      <CaptionsModal
        isOpen={!!captionAsset}
        onClose={() => setCaptionAsset(null)}
        assetPrompt={captionAsset?.description || captionAsset?.title || 'Marketing visual'}
        assetImageUrl={captionAsset?.storage_path || captionAsset?.thumbnail_path}
      />
    </div>
  );
};
