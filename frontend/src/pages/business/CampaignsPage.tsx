import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Layers,
  Plus,
  Search,
  Calendar,
  Clock,
  Sparkles,
  CheckCircle2,
  AlertCircle,
  MoreVertical,
  Trash2
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { SupportChat } from '../../components/layout/SupportChat';
import { ApiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const CampaignsPage: React.FC = () => {
  const { capabilities } = useAuth();
  const [campaigns, setCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  useEffect(() => {
    fetchCampaigns();
  }, []);

  const fetchCampaigns = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getResource('campaigns');
      if (res.data && Array.isArray(res.data)) {
        setCampaigns(res.data);
      }
    } catch (err) {
      console.warn('Failed to fetch campaigns:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await ApiClient.writeResource('campaigns', { op: 'delete', id });
      setCampaigns(prev => prev.filter(c => c.id !== id));
      toast.success('Campaign deleted successfully');
    } catch (err: any) {
      toast.error(err.message || 'Only Brand Admin and Owner can delete campaigns');
    }
  };

  const filtered = campaigns.filter(c => {
    const matchesStatus = statusFilter === 'all' || c.status === statusFilter;
    const matchesSearch = !searchQuery ||
      c.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.brief?.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesStatus && matchesSearch;
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
                Campaign Orchestration
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-aether-text mt-1">
                Marketing Campaigns
              </h1>
              <p className="text-xs text-aether-subtext mt-1">
                Plan, assign creators, and govern brand asset output across platforms.
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/business/campaigns/create"
                className="px-5 py-2.5 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>New Campaign</span>
              </Link>
            </div>
          </div>

          {/* Filter Bar */}
          <div className="flex flex-col sm:flex-row items-center justify-between gap-4 mb-8">
            <div className="flex space-x-2">
              {['all', 'draft', 'active', 'completed'].map((st) => (
                <button
                  key={st}
                  onClick={() => setStatusFilter(st)}
                  className={`px-3.5 py-1.5 rounded-2xl text-xs font-bold capitalize transition ${
                    statusFilter === st
                      ? 'bg-aether-primary text-white shadow-sm'
                      : 'bg-white border border-aether-border text-aether-subtext hover:text-aether-text'
                  }`}
                >
                  {st}
                </button>
              ))}
            </div>

            <div className="relative w-full sm:w-72">
              <Search className="w-4 h-4 text-aether-subtext absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="w-full pl-10 pr-4 py-2 rounded-2xl bg-white border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium shadow-sm"
              />
            </div>
          </div>

          {/* Campaigns Grid */}
          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3].map(n => (
                <div key={n} className="h-64 bg-white rounded-3xl animate-pulse border border-aether-border/60" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel bg-white p-12 rounded-3xl border border-aether-border text-center space-y-4">
              <Layers className="w-12 h-12 text-aether-primary mx-auto" />
              <h3 className="text-base font-bold text-aether-text">No campaigns found</h3>
              <p className="text-xs text-aether-subtext max-w-sm mx-auto">
                Create a campaign wizard workflow to define audience, platform presets, and guidelines.
              </p>
              <Link
                to="/business/campaigns/create"
                className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campaign</span>
              </Link>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map(c => (
                <div
                  key={c.id}
                  className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm card-hover flex flex-col justify-between"
                >
                  <div>
                    <div className="flex items-center justify-between mb-3">
                      <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                        c.status === 'active' ? 'bg-emerald-100 text-emerald-800' :
                        c.status === 'completed' ? 'bg-purple-100 text-purple-800' :
                        'bg-aether-section text-aether-primary'
                      }`}>
                        {c.status || 'draft'}
                      </span>

                      <button
                        onClick={(e) => handleDelete(c.id, e)}
                        className="p-1 rounded-lg hover:bg-red-50 text-aether-subtext hover:text-red-500 transition"
                        title="Delete Campaign"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>

                    <h3 className="font-bold text-base text-aether-text mb-1.5">{c.name}</h3>
                    <p className="text-xs text-aether-subtext line-clamp-3 leading-relaxed mb-4">
                      {c.brief || 'Targeted marketing visual campaign.'}
                    </p>

                    <div className="space-y-1 text-xs text-aether-text mb-4">
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-aether-subtext">Platform:</span>
                        <span className="font-semibold capitalize">{c.platform?.replace('_', ' ') || 'Instagram'}</span>
                      </div>
                      <div className="flex items-center justify-between">
                        <span className="text-[11px] text-aether-subtext">Audience:</span>
                        <span className="font-semibold">{c.audience || 'General'}</span>
                      </div>
                    </div>
                  </div>

                  <div className="pt-4 border-t border-aether-border/60 flex items-center justify-between">
                    <span className="text-[11px] text-aether-subtext flex items-center space-x-1">
                      <Calendar className="w-3 h-3" />
                      <span>{c.deadline ? new Date(c.deadline).toLocaleDateString() : 'No deadline'}</span>
                    </span>

                    <Link
                      to="/creator/generator"
                      className="px-3.5 py-1.5 rounded-xl bg-aether-section hover:bg-aether-primary hover:text-white text-aether-primary text-xs font-bold transition flex items-center space-x-1"
                    >
                      <Sparkles className="w-3 h-3" />
                      <span>Generate Asset</span>
                    </Link>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <SupportChat />
    </div>
  );
};
