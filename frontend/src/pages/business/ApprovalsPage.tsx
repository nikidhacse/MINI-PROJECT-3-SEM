import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
  CheckCircle2,
  XCircle,
  AlertCircle,
  MessageSquare,
  Clock,
  Paintbrush,
  Send,
  Eye,
  ShieldCheck,
  Check
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { SupportChat } from '../../components/layout/SupportChat';
import { ApiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

export const ApprovalsPage: React.FC = () => {
  const { capabilities } = useAuth();
  const [assets, setAssets] = useState<any[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<any | null>(null);
  const [comment, setComment] = useState('');
  const [loading, setLoading] = useState(true);
  const [deciding, setDeciding] = useState(false);

  useEffect(() => {
    fetchReviewQueue();
  }, []);

  const fetchReviewQueue = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getResource('assets');
      if (res.data && Array.isArray(res.data)) {
        // Show in_review first, then all assets
        const sorted = [...res.data].sort((a, b) => {
          if (a.status === 'in_review' && b.status !== 'in_review') return -1;
          if (b.status === 'in_review' && a.status !== 'in_review') return 1;
          return 0;
        });
        setAssets(sorted);
        if (sorted.length > 0) setSelectedAsset(sorted[0]);
      }
    } catch (err) {
      console.warn('Failed to fetch approval assets:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleDecision = async (decision: 'approved' | 'rejected' | 'changes_requested') => {
    if (!selectedAsset) return;
    if (!capabilities.approvalDecide) {
      toast.error('Only Organization Approvers, Brand Admins, and Owners can make review decisions');
      return;
    }

    setDeciding(true);
    try {
      const res = await ApiClient.writeResource('approvals', {
        op: 'create',
        data: {
          asset_id: selectedAsset.id,
          decision,
          comment
        }
      });

      toast.success(`Asset marked as ${decision.replace('_', ' ')}!`);
      setComment('');

      // Update local asset list with updated record
      if (res.asset) {
        setAssets(prev => prev.map(a => (a.id === res.asset.id ? res.asset : a)));
        setSelectedAsset(res.asset);
      }
    } catch (err: any) {
      toast.error(err.message || 'Failed to submit review decision');
    } finally {
      setDeciding(false);
    }
  };

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center space-x-2">
              <span className="text-xs font-bold uppercase tracking-wider text-aether-primary">
                Review &amp; Governance Queue
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-aether-primary animate-pulse" />
            </div>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-aether-text mt-1">
              Approvals Workflow State Machine
            </h1>
            <p className="text-xs text-aether-subtext mt-1">
              Deterministic state transitions: <code className="bg-aether-section px-1.5 py-0.5 rounded text-[11px]">draft &rarr; in_review &rarr; approved</code> (Rejection increments version n+1).
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Left Queue List */}
            <div className="lg:col-span-4 glass-panel bg-white p-5 rounded-3xl border border-aether-border shadow-lavender-sm space-y-3">
              <div className="flex items-center justify-between pb-3 border-b border-aether-border/60">
                <h3 className="font-bold text-sm text-aether-text">Review Queue</h3>
                <span className="text-xs font-bold text-aether-primary bg-aether-light px-2.5 py-0.5 rounded-full">
                  {assets.length} Assets
                </span>
              </div>

              {loading ? (
                <div className="space-y-3">
                  {[1, 2, 3].map(n => (
                    <div key={n} className="h-20 bg-aether-bg rounded-2xl animate-pulse" />
                  ))}
                </div>
              ) : assets.length === 0 ? (
                <div className="text-center py-10 text-xs text-aether-subtext">No assets submitted for review.</div>
              ) : (
                <div className="space-y-2.5 max-h-[600px] overflow-y-auto pr-1">
                  {assets.map(asset => {
                    const isSelected = selectedAsset?.id === asset.id;
                    const statusColor =
                      asset.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                      asset.status === 'in_review' ? 'bg-amber-100 text-amber-800' :
                      asset.status === 'rejected' ? 'bg-red-100 text-red-800' :
                      'bg-aether-section text-aether-primary';

                    return (
                      <div
                        key={asset.id}
                        onClick={() => setSelectedAsset(asset)}
                        className={`p-3 rounded-2xl border transition cursor-pointer flex items-center space-x-3 ${
                          isSelected
                            ? 'border-aether-primary bg-aether-light/70 shadow-sm'
                            : 'border-aether-border/60 hover:bg-aether-section/40'
                        }`}
                      >
                        <img
                          src={asset.storage_path || asset.thumbnail_path}
                          alt={asset.title}
                          className="w-12 h-12 rounded-xl object-cover border border-aether-border shrink-0"
                        />
                        <div className="flex-1 min-w-0">
                          <div className="flex items-center justify-between mb-1">
                            <h4 className="font-bold text-xs text-aether-text truncate">{asset.title}</h4>
                            <span className={`px-2 py-0.5 rounded-full text-[9px] font-bold uppercase ${statusColor}`}>
                              {asset.status}
                            </span>
                          </div>
                          <div className="flex items-center justify-between text-[10px] text-aether-subtext">
                            <span>v{asset.current_version || 1}.0</span>
                            <span>{asset.width}×{asset.height}</span>
                          </div>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
            </div>

            {/* Right Asset Inspection & Action Box */}
            <div className="lg:col-span-8 space-y-6">
              {selectedAsset ? (
                <div className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-lg space-y-6">
                  {/* Asset Header */}
                  <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between pb-4 border-b border-aether-border/60 gap-3">
                    <div>
                      <div className="flex items-center space-x-2 mb-1">
                        <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                          selectedAsset.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                          selectedAsset.status === 'in_review' ? 'bg-amber-100 text-amber-800' :
                          selectedAsset.status === 'rejected' ? 'bg-red-100 text-red-800' :
                          'bg-aether-section text-aether-primary'
                        }`}>
                          Status: {selectedAsset.status}
                        </span>
                        <span className="text-xs text-aether-subtext font-medium">
                          Version: <strong>v{selectedAsset.current_version || 1}.0</strong>
                        </span>
                      </div>
                      <h2 className="text-xl font-bold text-aether-text">{selectedAsset.title}</h2>
                    </div>

                    <div className="text-right text-xs text-aether-subtext">
                      <span className="block font-semibold text-aether-text">Quality Score: {selectedAsset.quality_score || 95}%</span>
                      <span>Delivery: {selectedAsset.width} × {selectedAsset.height}px</span>
                    </div>
                  </div>

                  {/* Image Display */}
                  <div className="relative rounded-2xl overflow-hidden bg-aether-bg border border-aether-border flex items-center justify-center max-h-[480px]">
                    <img
                      src={selectedAsset.storage_path || selectedAsset.thumbnail_path}
                      alt={selectedAsset.title}
                      className="w-full h-full object-contain max-h-[480px]"
                    />
                  </div>

                  {/* Comment & Feedback Box */}
                  <div className="space-y-4 pt-2">
                    <div>
                      <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5 flex items-center space-x-1.5">
                        <MessageSquare className="w-3.5 h-3.5 text-aether-primary" />
                        <span>Reviewer Feedback &amp; Revision Instructions</span>
                      </label>
                      <textarea
                        rows={3}
                        value={comment}
                        onChange={(e) => setComment(e.target.value)}
                        placeholder="Add required revisions or approval notes for the creator..."
                        className="w-full p-3.5 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium"
                      />
                    </div>

                    {/* Decision Action Buttons (Gated by can.approvalDecide) */}
                    <div className="flex flex-wrap items-center justify-between gap-3 pt-3 border-t border-aether-border/60">
                      <button
                        onClick={() => handleDecision('rejected')}
                        disabled={deciding || !capabilities.approvalDecide}
                        className="px-5 py-2.5 rounded-2xl bg-red-50 hover:bg-red-100 text-red-700 text-xs font-bold border border-red-200 transition flex items-center space-x-1.5 disabled:opacity-40"
                      >
                        <XCircle className="w-4 h-4" />
                        <span>Reject &amp; Bump to v{(selectedAsset.current_version || 1) + 1}.0</span>
                      </button>

                      <div className="flex items-center space-x-2">
                        <button
                          onClick={() => handleDecision('changes_requested')}
                          disabled={deciding || !capabilities.approvalDecide}
                          className="px-5 py-2.5 rounded-2xl bg-amber-50 hover:bg-amber-100 text-amber-800 text-xs font-bold border border-amber-200 transition flex items-center space-x-1.5 disabled:opacity-40"
                        >
                          <AlertCircle className="w-4 h-4" />
                          <span>Request Changes</span>
                        </button>

                        <button
                          onClick={() => handleDecision('approved')}
                          disabled={deciding || !capabilities.approvalDecide}
                          className="px-6 py-2.5 rounded-2xl bg-emerald-600 hover:bg-emerald-700 text-white text-xs font-bold shadow-sm transition flex items-center space-x-1.5 disabled:opacity-40"
                        >
                          <Check className="w-4 h-4" />
                          <span>Approve for Release</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="glass-panel bg-white p-12 rounded-3xl border border-aether-border text-center space-y-3">
                  <ShieldCheck className="w-12 h-12 text-aether-primary mx-auto" />
                  <h3 className="text-base font-bold text-aether-text">Select an Asset to Review</h3>
                  <p className="text-xs text-aether-subtext">Click on any visual in the queue to inspect and decide.</p>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>

      <SupportChat />
    </div>
  );
};
