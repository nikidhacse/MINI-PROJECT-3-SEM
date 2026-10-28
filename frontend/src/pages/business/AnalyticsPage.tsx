import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  BarChart3,
  TrendingUp,
  ShieldCheck,
  Award,
  Sparkles,
  Layers,
  CheckCircle2,
  AlertTriangle,
  ArrowUpRight,
  Download,
  Filter,
  Palette
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { SupportChat } from '../../components/layout/SupportChat';
import { useAuth } from '../../context/AuthContext';

export const AnalyticsPage: React.FC = () => {
  const { activeOrg } = useAuth();
  const [timeRange, setTimeRange] = useState<'7d' | '30d' | '90d'>('30d');

  const complianceMetrics = [
    { name: 'Color Palette Fidelity', score: 98, status: 'Optimal', desc: 'HEX #8B5CF6 & #2D1B69 exact match adherence' },
    { name: 'Typography & Hierarchy', score: 94, status: 'Optimal', desc: 'Poppins & Inter font weights within brand scale' },
    { name: 'Logo Clear Space & Safe Zones', score: 91, status: 'Good', desc: '24px padding maintained on 96% of generated assets' },
    { name: 'Tone & Caption Alignment', score: 96, status: 'Optimal', desc: 'Dual-confidence RAG cosine distance < 0.18' },
  ];

  const recentAudits = [
    { title: 'Summer Glow Serum Banner', campaign: 'Summer Launch 2026', score: 98, date: '2 hours ago', status: 'Approved' },
    { title: 'Cyber Monday Story Reel', campaign: 'Holiday Flash', score: 88, date: 'Yesterday', status: 'Flagged / Adjusted' },
    { title: 'Minimalist Studio Lookbook', campaign: 'Brand Refresh', score: 96, date: '3 days ago', status: 'Approved' },
    { title: 'Organic Cleanse Ad Square', campaign: 'Wellness 360', score: 92, date: '5 days ago', status: 'Approved' },
  ];

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <div>
              <div className="flex items-center space-x-2">
                <span className="text-xs font-bold uppercase tracking-wider text-aether-primary">
                  Intelligence & Compliance
                </span>
                <span className="px-2 py-0.5 rounded-full bg-emerald-100 text-emerald-700 text-[10px] font-extrabold uppercase">
                  Live Audit
                </span>
              </div>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-aether-text mt-1">
                Brand Compliance & Creative Analytics
              </h1>
              <p className="text-xs text-aether-subtext mt-1">
                Real-time 100-Point automated brand governance for {activeOrg?.org_name || 'Organization'}
              </p>
            </div>

            <div className="flex items-center space-x-3">
              <div className="flex bg-white border border-aether-border rounded-2xl p-1 shadow-lavender-sm text-xs font-semibold">
                {(['7d', '30d', '90d'] as const).map(range => (
                  <button
                    key={range}
                    onClick={() => setTimeRange(range)}
                    className={`px-3 py-1.5 rounded-xl transition ${
                      timeRange === range
                        ? 'bg-aether-primary text-white shadow-sm'
                        : 'text-aether-subtext hover:text-aether-text'
                    }`}
                  >
                    {range === '7d' ? '7 Days' : range === '30d' ? '30 Days' : '90 Days'}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Top Scorecard & KPI Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-5 mb-8">
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              className="glass-panel bg-gradient-to-br from-purple-700 via-aether-primary to-indigo-700 p-6 rounded-3xl text-white shadow-lavender-lg col-span-1 md:col-span-1 flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-3">
                  <span className="text-xs uppercase font-bold tracking-wider text-purple-200">Overall Health</span>
                  <Award className="w-5 h-5 text-amber-300" />
                </div>
                <div className="text-4xl font-extrabold">95.4<span className="text-xl font-normal text-purple-200">/100</span></div>
                <p className="text-xs text-purple-100 mt-2">
                  Enterprise Brand Compliance grade: <strong className="text-amber-300">Grade A+</strong>
                </p>
              </div>
              <div className="mt-4 pt-4 border-t border-white/20 text-[11px] text-purple-200 flex items-center justify-between">
                <span>+3.2 pts vs last month</span>
                <TrendingUp className="w-4 h-4 text-emerald-300" />
              </div>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.05 }}
              className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-aether-subtext uppercase">Assets Synthesized</span>
                  <div className="w-8 h-8 rounded-xl bg-purple-50 text-aether-primary flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-aether-text">324</div>
                <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>+42% velocity</span>
                </div>
              </div>
              <p className="text-[11px] text-aether-subtext mt-3 pt-3 border-t border-aether-border/60">
                100% FLUX enterprise synthesis
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-aether-subtext uppercase">Approval Velocity</span>
                  <div className="w-8 h-8 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
                    <CheckCircle2 className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-aether-text">1.8 hrs</div>
                <div className="flex items-center space-x-1.5 text-xs text-emerald-600 font-semibold mt-1">
                  <ArrowUpRight className="w-3.5 h-3.5" />
                  <span>4.2x faster turnaround</span>
                </div>
              </div>
              <p className="text-[11px] text-aether-subtext mt-3 pt-3 border-t border-aether-border/60">
                Automated pre-flight validation
              </p>
            </motion.div>

            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15 }}
              className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm flex flex-col justify-between"
            >
              <div>
                <div className="flex items-center justify-between mb-2">
                  <span className="text-xs font-bold text-aether-subtext uppercase">Multi-Channel Reach</span>
                  <div className="w-8 h-8 rounded-xl bg-indigo-50 text-indigo-600 flex items-center justify-center">
                    <Layers className="w-4 h-4" />
                  </div>
                </div>
                <div className="text-3xl font-extrabold text-aether-text">18.4k</div>
                <div className="flex items-center space-x-1.5 text-xs text-indigo-600 font-semibold mt-1">
                  <span>Across 5 platforms</span>
                </div>
              </div>
              <p className="text-[11px] text-aether-subtext mt-3 pt-3 border-t border-aether-border/60">
                Instagram, LinkedIn, X, Meta, Pinterest
              </p>
            </motion.div>
          </div>

          {/* Detailed Compliance Breakdown */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
            <div className="lg:col-span-2 glass-panel bg-white p-7 rounded-3xl border border-aether-border shadow-lavender-sm">
              <div className="flex items-center justify-between mb-6">
                <div>
                  <h2 className="text-lg font-bold text-aether-text">Brand Consistency Matrix</h2>
                  <p className="text-xs text-aether-subtext">RAG vector similarity & color space validation checks</p>
                </div>
                <span className="px-3 py-1 rounded-full bg-aether-light text-aether-primary font-bold text-xs">
                  Automated Audit
                </span>
              </div>

              <div className="space-y-5">
                {complianceMetrics.map((item, idx) => (
                  <div key={idx} className="space-y-1.5">
                    <div className="flex items-center justify-between text-xs font-bold">
                      <span className="text-aether-text">{item.name}</span>
                      <span className="text-aether-primary">{item.score}% ({item.status})</span>
                    </div>
                    <div className="w-full h-2.5 bg-aether-section rounded-full overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${item.score}%` }}
                        transition={{ duration: 0.8, delay: idx * 0.1 }}
                        className="h-full bg-gradient-to-r from-aether-primary to-purple-600 rounded-full"
                      />
                    </div>
                    <p className="text-[11px] text-aether-subtext">{item.desc}</p>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Optimization Suggestions */}
            <div className="glass-panel bg-white p-7 rounded-3xl border border-aether-border shadow-lavender-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center space-x-2 text-aether-primary font-bold text-xs uppercase mb-3">
                  <Sparkles className="w-4 h-4" />
                  <span>AI Recommendations</span>
                </div>
                <h3 className="text-base font-bold text-aether-text mb-4">Guideline Insights</h3>

                <div className="space-y-4">
                  <div className="p-3.5 rounded-2xl bg-amber-50/70 border border-amber-200 text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-amber-800 mb-1">
                      <AlertTriangle className="w-3.5 h-3.5" />
                      <span>Contrast Warning</span>
                    </div>
                    <p className="text-amber-700 leading-relaxed text-[11px]">
                      2 assets on "Holiday Flash" campaign have typography contrast below WCAG AAA standard. Use white backdrop overlay.
                    </p>
                  </div>

                  <div className="p-3.5 rounded-2xl bg-purple-50/70 border border-purple-200 text-xs">
                    <div className="flex items-center space-x-1.5 font-bold text-purple-800 mb-1">
                      <Palette className="w-3.5 h-3.5" />
                      <span>Color Harmony</span>
                    </div>
                    <p className="text-purple-700 leading-relaxed text-[11px]">
                      Lavender secondary palette (#EDE9FE) delivers +31% higher click-through engagement in tech/SaaS banners.
                    </p>
                  </div>
                </div>
              </div>

              <button className="w-full mt-6 py-2.5 px-4 rounded-2xl bg-aether-light text-aether-primary font-bold text-xs hover:bg-aether-border transition text-center">
                Download PDF Audit Report
              </button>
            </div>
          </div>

          {/* Recent Audit Log */}
          <div className="glass-panel bg-white p-7 rounded-3xl border border-aether-border shadow-lavender-sm">
            <h2 className="text-lg font-bold text-aether-text mb-1">Recent Automated Compliance Audits</h2>
            <p className="text-xs text-aether-subtext mb-6">Real-time scan logs across all generated creatives</p>

            <div className="overflow-x-auto">
              <table className="w-full text-left text-xs">
                <thead>
                  <tr className="border-b border-aether-border/80 text-aether-subtext uppercase text-[10px] font-bold">
                    <th className="pb-3">Asset Name</th>
                    <th className="pb-3">Campaign</th>
                    <th className="pb-3">Compliance Score</th>
                    <th className="pb-3">Timestamp</th>
                    <th className="pb-3 text-right">Status</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-aether-border/50">
                  {recentAudits.map((audit, i) => (
                    <tr key={i} className="hover:bg-aether-section/40 transition">
                      <td className="py-3.5 font-bold text-aether-text">{audit.title}</td>
                      <td className="py-3.5 text-aether-subtext">{audit.campaign}</td>
                      <td className="py-3.5">
                        <span className="font-extrabold text-aether-primary">{audit.score}/100</span>
                      </td>
                      <td className="py-3.5 text-aether-subtext">{audit.date}</td>
                      <td className="py-3.5 text-right">
                        <span
                          className={`px-2.5 py-1 rounded-full text-[10px] font-bold ${
                            audit.score >= 90
                              ? 'bg-emerald-100 text-emerald-700'
                              : 'bg-amber-100 text-amber-700'
                          }`}
                        >
                          {audit.status}
                        </span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>

      <SupportChat />
    </div>
  );
};
