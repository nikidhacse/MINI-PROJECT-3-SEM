import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import {
  Layers,
  ArrowRight,
  ArrowLeft,
  CheckCircle2,
  Palette,
  Users2,
  Calendar,
  Sparkles,
  ShieldCheck
} from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { SupportChat } from '../../components/layout/SupportChat';
import { ApiClient } from '../../services/api';
import toast from 'react-hot-toast';

export const CreateCampaignPage: React.FC = () => {
  const navigate = useNavigate();
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);

  // Form State
  const [name, setName] = useState('');
  const [brief, setBrief] = useState('');
  const [audience, setAudience] = useState('Tech innovators');
  const [industry, setIndustry] = useState('SaaS & Digital Products');
  const [platform, setPlatform] = useState('instagram_square');

  // Step 2 Brand Tokens
  const [brandKitName, setBrandKitName] = useState('Default Brand Kit');
  const [primaryColor, setPrimaryColor] = useState('#8B5CF6');
  const [secondaryColor, setSecondaryColor] = useState('#C4B5FD');
  const [tone, setTone] = useState('clear, practical, warm');

  // Step 3 Creator Assignment & Schedule
  const [assignedCreator, setAssignedCreator] = useState('Lead Designer');
  const [deadline, setDeadline] = useState(
    new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0]
  );

  const handleLaunchCampaign = async () => {
    if (!name.trim()) {
      toast.error('Campaign name is required');
      return;
    }

    setLoading(true);
    try {
      await ApiClient.writeResource('campaigns', {
        op: 'create',
        data: {
          name,
          brief,
          audience,
          platform,
          status: 'active',
          deadline: new Date(deadline).toISOString()
        }
      });
      toast.success(`Campaign "${name}" launched successfully!`);
      navigate('/business/campaigns');
    } catch (err: any) {
      toast.error(err.message || 'Failed to create campaign');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-4xl mx-auto w-full overflow-y-auto">
          {/* Stepper Header */}
          <div className="mb-10 text-center">
            <span className="text-xs font-bold uppercase tracking-wider text-aether-primary">
              Campaign Orchestration Wizard
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-aether-text mt-1">
              Create New Marketing Campaign
            </h1>

            {/* Stepper Progress Bar */}
            <div className="flex items-center justify-center space-x-4 mt-6 max-w-md mx-auto">
              <div className={`flex items-center space-x-2 text-xs font-bold ${
                step >= 1 ? 'text-aether-primary' : 'text-aether-subtext'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  step >= 1 ? 'bg-aether-primary text-white' : 'bg-aether-border text-aether-subtext'
                }`}>
                  1
                </span>
                <span>Strategy</span>
              </div>
              <div className={`w-12 h-0.5 ${step >= 2 ? 'bg-aether-primary' : 'bg-aether-border'}`} />

              <div className={`flex items-center space-x-2 text-xs font-bold ${
                step >= 2 ? 'text-aether-primary' : 'text-aether-subtext'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  step >= 2 ? 'bg-aether-primary text-white' : 'bg-aether-border text-aether-subtext'
                }`}>
                  2
                </span>
                <span>Brand Rules</span>
              </div>
              <div className={`w-12 h-0.5 ${step >= 3 ? 'bg-aether-primary' : 'bg-aether-border'}`} />

              <div className={`flex items-center space-x-2 text-xs font-bold ${
                step >= 3 ? 'text-aether-primary' : 'text-aether-subtext'
              }`}>
                <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[11px] ${
                  step >= 3 ? 'bg-aether-primary text-white' : 'bg-aether-border text-aether-subtext'
                }`}>
                  3
                </span>
                <span>Launch</span>
              </div>
            </div>
          </div>

          {/* Wizard Card Container */}
          <div className="glass-panel bg-white p-8 rounded-3xl border border-aether-border shadow-lavender-lg">
            {step === 1 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h3 className="text-lg font-bold text-aether-text">Step 1: Campaign Strategy & Target</h3>

                <div>
                  <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                    Campaign Name
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="e.g. Q4 Global Product Launch"
                    className="w-full px-4 py-3 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-semibold"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                    Creative Brief & Objectives
                  </label>
                  <textarea
                    rows={4}
                    value={brief}
                    onChange={(e) => setBrief(e.target.value)}
                    placeholder="Describe the campaign goal, key visual themes, and atmosphere..."
                    className="w-full p-4 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium leading-relaxed"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                      Target Audience
                    </label>
                    <select
                      value={audience}
                      onChange={(e) => setAudience(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs font-semibold text-aether-text focus:outline-none focus:border-aether-primary"
                    >
                      <option>Tech innovators</option>
                      <option>Small business owners</option>
                      <option>Design professionals</option>
                      <option>General consumers</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                      Primary Platform
                    </label>
                    <select
                      value={platform}
                      onChange={(e) => setPlatform(e.target.value)}
                      className="w-full p-3 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs font-semibold text-aether-text focus:outline-none focus:border-aether-primary"
                    >
                      <option value="instagram_square">Instagram Post (1:1)</option>
                      <option value="instagram_story">Instagram Story (9:16)</option>
                      <option value="facebook_link">Facebook Link (16:9)</option>
                      <option value="linkedin_post">LinkedIn Post (1:1)</option>
                      <option value="web_hero">Website Hero (8:3)</option>
                    </select>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      if (!name.trim()) return toast.error('Campaign name is required');
                      setStep(2);
                    }}
                    className="px-6 py-3 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition flex items-center space-x-2"
                  >
                    <span>Continue to Brand Rules</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 2 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h3 className="text-lg font-bold text-aether-text">Step 2: Brand Rules &amp; Collateral</h3>
                <p className="text-xs text-aether-subtext">Pre-loaded from your organization's vector brand kit</p>

                <div className="p-4 bg-aether-bg rounded-2xl border border-aether-border/80 space-y-3">
                  <div className="flex items-center space-x-2 text-xs font-bold text-aether-primary">
                    <Palette className="w-4 h-4" />
                    <span>Brand Tokens Applied to Briefs</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <span className="text-[10px] text-aether-subtext uppercase font-bold block mb-1">Primary Color</span>
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg border" style={{ backgroundColor: primaryColor }} />
                        <span className="text-xs font-bold text-aether-text uppercase">{primaryColor}</span>
                      </div>
                    </div>
                    <div>
                      <span className="text-[10px] text-aether-subtext uppercase font-bold block mb-1">Secondary Color</span>
                      <div className="flex items-center space-x-2">
                        <span className="w-6 h-6 rounded-lg border" style={{ backgroundColor: secondaryColor }} />
                        <span className="text-xs font-bold text-aether-text uppercase">{secondaryColor}</span>
                      </div>
                    </div>
                  </div>

                  <div>
                    <span className="text-[10px] text-aether-subtext uppercase font-bold block mb-1">Brand Voice & Tone</span>
                    <p className="text-xs text-aether-text font-medium">{tone}</p>
                  </div>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(1)}
                    className="px-5 py-2.5 rounded-2xl border border-aether-border hover:bg-aether-light text-xs font-semibold text-aether-text flex items-center space-x-1.5 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setStep(3)}
                    className="px-6 py-3 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition flex items-center space-x-2"
                  >
                    <span>Continue to Assignment</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>
              </motion.div>
            )}

            {step === 3 && (
              <motion.div initial={{ opacity: 0, x: 20 }} animate={{ opacity: 1, x: 0 }} className="space-y-5">
                <h3 className="text-lg font-bold text-aether-text">Step 3: Assignment &amp; Launch</h3>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                      Assign Creator
                    </label>
                    <div className="relative">
                      <Users2 className="w-4 h-4 text-aether-subtext absolute left-3.5 top-3.5" />
                      <input
                        type="text"
                        value={assignedCreator}
                        onChange={(e) => setAssignedCreator(e.target.value)}
                        placeholder="Creator or Designer Name"
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                      Target Delivery Deadline
                    </label>
                    <div className="relative">
                      <Calendar className="w-4 h-4 text-aether-subtext absolute left-3.5 top-3.5" />
                      <input
                        type="date"
                        value={deadline}
                        onChange={(e) => setDeadline(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium"
                      />
                    </div>
                  </div>
                </div>

                {/* Summary Card */}
                <div className="p-4 bg-emerald-50 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1.5">
                  <div className="flex items-center space-x-1.5 font-bold">
                    <ShieldCheck className="w-4 h-4 text-emerald-700" />
                    <span>Ready for Governance & Synthesis</span>
                  </div>
                  <p className="text-[11px] text-emerald-800 leading-relaxed">
                    Launching will register this campaign in the active organization. Assigned creators will see guideline passages retrieved automatically with confidence gating.
                  </p>
                </div>

                <div className="pt-4 flex justify-between">
                  <button
                    type="button"
                    onClick={() => setStep(2)}
                    className="px-5 py-2.5 rounded-2xl border border-aether-border hover:bg-aether-light text-xs font-semibold text-aether-text flex items-center space-x-1.5 transition"
                  >
                    <ArrowLeft className="w-4 h-4" />
                    <span>Back</span>
                  </button>

                  <button
                    type="button"
                    onClick={handleLaunchCampaign}
                    disabled={loading}
                    className="px-8 py-3.5 rounded-2xl bg-gradient-to-r from-aether-primary to-purple-700 text-white font-bold text-xs shadow-lavender-md hover:opacity-95 transition flex items-center space-x-2"
                  >
                    <Sparkles className="w-4 h-4" />
                    <span>{loading ? 'Launching...' : 'Launch Campaign'}</span>
                  </button>
                </div>
              </motion.div>
            )}
          </div>
        </main>
      </div>

      <SupportChat />
    </div>
  );
};
