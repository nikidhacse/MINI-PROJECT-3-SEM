import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Paintbrush,
  LayoutTemplate,
  FolderKanban,
  ArrowRight,
  TrendingUp,
  Image as ImageIcon,
  Clock
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { SupportChat } from '../../components/layout/SupportChat';
import { AssetPreviewModal } from '../../components/modals/AssetPreviewModal';

export const CreatorDashboardPage: React.FC = () => {
  const { user, activeOrg } = useAuth();
  const [recentAssets, setRecentAssets] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);

  useEffect(() => {
    fetchRecentAssets();
  }, []);

  const fetchRecentAssets = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getResource('assets', { limit: 6 });
      if (res.data && Array.isArray(res.data)) {
        setRecentAssets(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const quickActions = [
    {
      title: 'Generate New Visual',
      desc: 'High-fidelity AI diffusion synthesis',
      icon: Sparkles,
      link: '/creator/generator',
      color: 'bg-gradient-to-r from-aether-primary to-purple-600 text-white',
      badge: 'PRO'
    },
    {
      title: 'Design Studio Canvas',
      desc: 'Composite live vector typography',
      icon: Paintbrush,
      link: '/creator/editor',
      color: 'bg-white border border-aether-border text-aether-text hover:bg-aether-light'
    },
    {
      title: 'Explore Templates',
      desc: 'Pre-designed high-converting layouts',
      icon: LayoutTemplate,
      link: '/creator/templates',
      color: 'bg-white border border-aether-border text-aether-text hover:bg-aether-light'
    },
    {
      title: 'Asset Vault',
      desc: 'Browse and export saved marketing assets',
      icon: FolderKanban,
      link: '/creator/assets',
      color: 'bg-white border border-aether-border text-aether-text hover:bg-aether-light'
    }
  ];

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Welcome Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-aether-primary">
                  Creator Studio Environment
                </span>
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-aether-text mt-1">
                Welcome back, {user?.full_name || 'Creator'}!
              </h1>
              <p className="text-xs text-aether-subtext mt-1">
                Workspace: <strong className="text-aether-text">{activeOrg?.org_name || 'Personal Studio'}</strong>
              </p>
            </div>

            <Link
              to="/creator/generator"
              className="px-6 py-3 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-md hover:bg-aether-hover transition inline-flex items-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Create New Asset</span>
            </Link>
          </div>

          {/* Quick Action Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
            {quickActions.map((act, idx) => {
              const Icon = act.icon;
              return (
                <Link
                  key={idx}
                  to={act.link}
                  className={`p-5 rounded-3xl transition card-hover shadow-lavender-sm flex flex-col justify-between ${act.color}`}
                >
                  <div className="flex justify-between items-start mb-4">
                    <div className="p-2.5 rounded-2xl bg-white/20 backdrop-blur-md">
                      <Icon className="w-5 h-5" />
                    </div>
                    {act.badge && (
                      <span className="px-2 py-0.5 rounded-md bg-white/20 text-[9px] font-extrabold uppercase">
                        {act.badge}
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm mb-1">{act.title}</h3>
                    <p className="text-[11px] opacity-80 leading-relaxed">{act.desc}</p>
                  </div>
                </Link>
              );
            })}
          </div>

          {/* Recent Assets Section */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-aether-text">Recent Creative Assets</h2>
                <p className="text-xs text-aether-subtext">Latest generated and edited marketing visuals</p>
              </div>
              <Link
                to="/creator/assets"
                className="text-xs font-bold text-aether-primary hover:underline flex items-center space-x-1"
              >
                <span>View all library</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {[1, 2, 3].map(n => (
                  <div key={n} className="h-64 bg-white rounded-3xl animate-pulse border border-aether-border/60" />
                ))}
              </div>
            ) : recentAssets.length === 0 ? (
              <div className="glass-panel bg-white p-12 rounded-3xl border border-aether-border text-center space-y-4">
                <div className="w-14 h-14 rounded-2xl bg-aether-light flex items-center justify-center text-aether-primary mx-auto">
                  <ImageIcon className="w-7 h-7" />
                </div>
                <h3 className="text-base font-bold text-aether-text">No assets in your workspace yet</h3>
                <p className="text-xs text-aether-subtext max-w-sm mx-auto">
                  Generate your first visual asset using our high-resolution AI diffusion engine.
                </p>
                <Link
                  to="/creator/generator"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Generate First Asset</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6">
                {recentAssets.map(asset => (
                  <div
                    key={asset.id}
                    onClick={() => setSelectedAsset(asset)}
                    className="cursor-pointer glass-panel bg-white rounded-3xl border border-aether-border overflow-hidden card-hover shadow-lavender-sm group"
                  >
                    <div className="aspect-square bg-aether-bg relative overflow-hidden flex items-center justify-center">
                      <img
                        src={asset.storage_path || asset.thumbnail_path}
                        alt={asset.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                      <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-aether-text font-bold text-[10px] uppercase shadow-sm">
                        {asset.category || 'Visual'}
                      </span>
                    </div>

                    <div className="p-4">
                      <h4 className="font-bold text-xs text-aether-text truncate mb-1">{asset.title}</h4>
                      <div className="flex items-center justify-between text-[11px] text-aether-subtext">
                        <span>{asset.width} × {asset.height}px</span>
                        <span className="flex items-center space-x-1">
                          <Clock className="w-3 h-3" />
                          <span>v{asset.current_version || 1}.0</span>
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <SupportChat />

      <AssetPreviewModal
        isOpen={!!selectedAsset}
        onClose={() => setSelectedAsset(null)}
        asset={selectedAsset}
      />
    </div>
  );
};
