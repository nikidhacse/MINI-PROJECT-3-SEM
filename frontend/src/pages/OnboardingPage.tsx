import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Building2, Sparkles, Check, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { useAuth } from '../context/AuthContext';
import { PlanType } from '../lib/capabilities';

export const OnboardingPage: React.FC = () => {
  const { bootstrapWorkspace } = useAuth();
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const roleParam = searchParams.get('role');

  const [orgName, setOrgName] = useState('');
  const [selectedPlan, setSelectedPlan] = useState<PlanType>(roleParam === 'business' ? 'pro' : 'free');
  const [loading, setLoading] = useState(false);

  const plans = [
    {
      id: 'free' as PlanType,
      name: 'Creator Studio',
      price: '$0',
      period: 'forever',
      desc: 'For individual designers and creators',
      features: ['AI Image Generator', 'Design Studio Vector Editor', 'Public Templates', 'Standard Asset Storage']
    },
    {
      id: 'pro' as PlanType,
      name: 'Business Workspace',
      price: '$49',
      period: 'per month',
      popular: true,
      desc: 'For high-velocity marketing and design teams',
      features: ['Dual Confidence Brand Guidelines RAG', 'Multi-Platform Campaigns Wizard', 'Audit-Safe Approvals Workflow', '100-Pt Brand Compliance Analytics']
    },
    {
      id: 'enterprise' as PlanType,
      name: 'Enterprise Cloud',
      price: '$199',
      period: 'per month',
      desc: 'For global brands with strict tenancy requirements',
      features: ['Dedicated Supabase Vector Cluster', 'Unlimited Members & Approvers', 'Custom Diffusion Models', '24/7 Priority SLA & Support']
    }
  ];

  const handleBootstrap = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orgName.trim()) return;

    setLoading(true);
    const ok = await bootstrapWorkspace(orgName, selectedPlan);
    setLoading(false);

    if (ok) {
      navigate(selectedPlan === 'free' ? '/creator/dashboard' : '/business/dashboard');
    }
  };

  return (
    <div className="min-h-screen bg-aether-bg py-16 px-6 flex flex-col items-center justify-center">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="max-w-4xl w-full"
      >
        <div className="text-center mb-10">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-aether-primary to-purple-800 text-white flex items-center justify-center mx-auto mb-4 shadow-lavender-sm">
            <Building2 className="w-6 h-6" />
          </div>
          <h1 className="text-3xl font-extrabold text-aether-text tracking-tight">
            Configure Your AetherDesign Workspace
          </h1>
          <p className="text-xs text-aether-subtext mt-1 max-w-md mx-auto">
            Name your creative organization and pick the tier that matches your team's ambition.
          </p>
        </div>

        <form onSubmit={handleBootstrap} className="space-y-8">
          {/* Step 1: Workspace Name */}
          <div className="glass-panel bg-white p-6 rounded-3xl border border-aether-border shadow-sm max-w-lg mx-auto">
            <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-2">
              Workspace / Company Name
            </label>
            <input
              type="text"
              required
              value={orgName}
              onChange={(e) => setOrgName(e.target.value)}
              placeholder="e.g. Acme Studio, Lumina Brand..."
              className="w-full px-4 py-3 rounded-2xl bg-aether-bg/60 border border-aether-border text-sm focus:outline-none focus:border-aether-primary text-aether-text font-semibold"
            />
          </div>

          {/* Step 2: Plan Selection */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {plans.map((p) => {
              const isSelected = selectedPlan === p.id;
              return (
                <div
                  key={p.id}
                  onClick={() => setSelectedPlan(p.id)}
                  className={`cursor-pointer rounded-3xl p-6 transition flex flex-col justify-between relative ${
                    isSelected
                      ? 'bg-white border-2 border-aether-primary shadow-lavender-lg scale-[1.02]'
                      : 'bg-white/80 border border-aether-border hover:border-aether-primary/50'
                  }`}
                >
                  {p.popular && (
                    <span className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-0.5 rounded-full bg-aether-primary text-white text-[10px] font-extrabold uppercase shadow-sm">
                      Most Popular
                    </span>
                  )}

                  <div>
                    <h3 className="font-bold text-base text-aether-text mb-1">{p.name}</h3>
                    <div className="flex items-baseline space-x-1 mb-2">
                      <span className="text-2xl font-extrabold text-aether-text">{p.price}</span>
                      <span className="text-[11px] text-aether-subtext">{p.period}</span>
                    </div>
                    <p className="text-xs text-aether-subtext mb-5 leading-relaxed">{p.desc}</p>

                    <div className="space-y-2 border-t border-aether-border/60 pt-4">
                      {p.features.map((feat, idx) => (
                        <div key={idx} className="flex items-start space-x-2 text-xs text-aether-text">
                          <Check className="w-3.5 h-3.5 text-aether-primary shrink-0 mt-0.5" />
                          <span>{feat}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="mt-6 pt-4">
                    <div className={`w-full py-2.5 rounded-xl font-bold text-xs text-center ${
                      isSelected ? 'bg-aether-primary text-white shadow-lavender-sm' : 'bg-aether-section text-aether-text'
                    }`}>
                      {isSelected ? 'Selected Plan' : 'Select'}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Launch Button */}
          <div className="text-center pt-4">
            <button
              type="submit"
              disabled={loading || !orgName.trim()}
              className="px-10 py-4 rounded-2xl bg-aether-primary text-white font-bold text-sm shadow-lavender-md hover:bg-aether-hover disabled:opacity-40 transition inline-flex items-center space-x-2"
            >
              <span>{loading ? 'Initializing Workspace...' : 'Launch Workspace'}</span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};
