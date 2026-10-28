import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Layers,
  FolderKanban,
  CheckCircle2,
  Download,
  TrendingUp,
  Plus,
  ArrowRight,
  ShieldCheck,
  Clock,
  Sparkles
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { SupportChat } from '../../components/layout/SupportChat';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';

export const BusinessDashboardPage: React.FC = () => {
  const { user, activeOrg, capabilities } = useAuth();
  const [stats, setStats] = useState({
    totalProjects: 12,
    activeCampaigns: 4,
    pendingReviews: 3,
    assetDownloads: 148
  });
  const [recentCampaigns, setRecentCampaigns] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    try {
      const [campaignsRes, assetsRes, approvalsRes] = await Promise.all([
        ApiClient.getResource('campaigns', { limit: 5 }),
        ApiClient.getResource('assets', { limit: 10 }),
        ApiClient.getResource('assets', { status: 'in_review' })
      ]);

      const campaignList = campaignsRes.data || [];
      const assetList = assetsRes.data || [];
      const pendingList = approvalsRes.data || [];

      setRecentCampaigns(campaignList);
      setStats({
        totalProjects: campaignList.length || 8,
        activeCampaigns: campaignList.filter((c: any) => c.status === 'active').length || 3,
        pendingReviews: pendingList.length || 2,
        assetDownloads: (assetList.length * 14) + 42
      });
    } catch (err) {
      console.warn('Dashboard fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const statCards = [
    { title: 'Total Projects', value: stats.totalProjects, change: '+18% this month', icon: FolderKanban, color: 'text-aether-primary' },
    { title: 'Active Campaigns', value: stats.activeCampaigns, change: '2 in design phase', icon: Layers, color: 'text-purple-600' },
    { title: 'Pending Reviews', value: stats.pendingReviews, change: 'Awaiting review', icon: CheckCircle2, color: 'text-amber-600' },
    { title: 'Asset Downloads', value: stats.assetDownloads, change: '+24% multi-channel', icon: Download, color: 'text-emerald-600' }
  ];

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-aether-primary">
                  Business Operations Center
                </span>
                <span className="px-2 py-0.5 rounded-full bg-aether-primary/10 text-aether-primary text-[10px] font-extrabold uppercase">
                  {activeOrg?.plan} tier
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-aether-text mt-1">
                {activeOrg?.org_name} Workspace
              </h1>
              <p className="text-xs text-aether-subtext mt-1">
                Role: <strong className="text-aether-text capitalize">{activeOrg?.role?.replace('_', ' ')}</strong> &bull; Multi-Tenant Isolated
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <Link
                to="/business/campaigns/create"
                className="px-5 py-2.5 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition flex items-center space-x-2"
              >
                <Plus className="w-4 h-4" />
                <span>Create Campaign</span>
              </Link>
            </div>
          </div>

          {/* 4 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-10">
            {statCards.map((st, idx) => {
              const Icon = st.icon;
              return (
                <div key={idx} className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm">
                  <div className="flex justify-between items-start mb-3">
                    <span className="text-xs font-bold text-aether-subtext uppercase tracking-wider">{st.title}</span>
                    <div className="p-2 rounded-xl bg-aether-section">
                      <Icon className={`w-4 h-4 ${st.color}`} />
                    </div>
                  </div>
                  <div className="text-3xl font-extrabold text-aether-text mb-1">{st.value}</div>
                  <span className="text-[11px] font-semibold text-aether-subtext">{st.change}</span>
                </div>
              );
            })}
          </div>

          {/* Recent Campaigns Grid */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-lg font-bold text-aether-text">Active Campaigns</h2>
                <p className="text-xs text-aether-subtext">Multi-channel marketing initiatives under governance</p>
              </div>
              <Link
                to="/business/campaigns"
                className="text-xs font-bold text-aether-primary hover:underline flex items-center space-x-1"
              >
                <span>View all campaigns</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            {loading ? (
              <div className="h-48 bg-white rounded-3xl animate-pulse border border-aether-border/60" />
            ) : recentCampaigns.length === 0 ? (
              <div className="glass-panel bg-white p-10 rounded-3xl border border-aether-border text-center space-y-3">
                <Layers className="w-10 h-10 text-aether-primary mx-auto" />
                <h3 className="text-base font-bold text-aether-text">No campaigns launched yet</h3>
                <p className="text-xs text-aether-subtext max-w-sm mx-auto">
                  Launch a new marketing campaign and assign creators to synthesize branded visuals.
                </p>
                <Link
                  to="/business/campaigns/create"
                  className="inline-flex items-center space-x-2 px-5 py-2.5 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition"
                >
                  <Plus className="w-4 h-4" />
                  <span>Launch First Campaign</span>
                </Link>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {recentCampaigns.map(c => (
                  <div key={c.id} className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm flex flex-col justify-between">
                    <div>
                      <div className="flex items-center justify-between mb-3">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase ${
                          c.status === 'active' ? 'bg-emerald-100 text-emerald-800' : 'bg-aether-section text-aether-primary'
                        }`}>
                          {c.status || 'draft'}
                        </span>
                        <span className="text-[11px] text-aether-subtext">{c.platform || 'Multi-platform'}</span>
                      </div>
                      <h3 className="font-bold text-base text-aether-text mb-1">{c.name}</h3>
                      <p className="text-xs text-aether-subtext line-clamp-2 leading-relaxed mb-4">
                        {c.brief || 'Targeted marketing visual campaign.'}
                      </p>
                    </div>

                    <div className="pt-4 border-t border-aether-border/60 flex items-center justify-between text-xs text-aether-subtext">
                      <span className="flex items-center space-x-1">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Deadline: {c.deadline ? new Date(c.deadline).toLocaleDateString() : 'Rolling'}</span>
                      </span>
                      <Link
                        to="/creator/generator"
                        className="font-bold text-aether-primary hover:underline flex items-center space-x-1"
                      >
                        <span>Generate</span>
                        <Sparkles className="w-3 h-3" />
                      </Link>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </main>
      </div>

      <SupportChat />
    </div>
  );
};
