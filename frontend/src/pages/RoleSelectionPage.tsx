import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { Building2, Sparkles, Check, ArrowRight, Shield } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';

export const RoleSelectionPage: React.FC = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-5xl mx-auto px-6 py-16 flex flex-col justify-center items-center text-center">
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-12 max-w-xl"
        >
          <span className="px-3.5 py-1.5 rounded-full bg-aether-section text-aether-primary font-bold text-xs uppercase tracking-wider">
            Select Your Environment
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-aether-text mt-4">
            How would you like to use AetherDesign?
          </h1>
          <p className="text-sm text-aether-subtext mt-2">
            Choose the workspace that fits your workflow. You can join or switch workspaces anytime.
          </p>
        </motion.div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 w-full max-w-4xl">
          {/* Option 1: Creator Studio (Solo / Free) */}
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.1 }}
            className="glass-panel p-8 rounded-3xl border border-aether-border card-hover bg-white flex flex-col justify-between text-left relative overflow-hidden"
          >
            <div>
              <div className="w-12 h-12 rounded-2xl bg-aether-light flex items-center justify-center text-aether-primary mb-6">
                <Sparkles className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold text-aether-text">Creator Studio</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-extrabold uppercase">
                  Free
                </span>
              </div>
              <p className="text-xs text-aether-subtext mb-6 leading-relaxed">
                For independent creators, freelance designers, and solopreneurs wanting fast AI synthesis and visual editing.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-2.5 text-xs text-aether-text">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Image Generator with Gemini Creative Briefs</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-aether-text">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Canva-Style Design Studio Vector Canvas</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-aether-text">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>Public Template Gallery & Asset Vault</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-aether-text">
                  <Check className="w-4 h-4 text-emerald-600 shrink-0" />
                  <span>AI Social Caption Writer & Instagram Publishing</span>
                </div>
              </div>
            </div>

            <Link
              to="/login/creator"
              className="w-full py-3.5 px-4 rounded-2xl bg-white border-2 border-aether-border hover:border-aether-primary text-aether-text font-bold text-xs flex items-center justify-center space-x-2 transition"
            >
              <span>Enter Creator Studio</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>

          {/* Option 2: Business Workspace (Team / Pro / Enterprise) */}
          <motion.div
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.2 }}
            className="glass-panel p-8 rounded-3xl border-2 border-aether-primary/40 card-hover bg-gradient-to-b from-white to-aether-section/40 flex flex-col justify-between text-left relative overflow-hidden shadow-lavender-md"
          >
            <div className="absolute top-0 right-0 bg-aether-primary text-white text-[10px] font-extrabold uppercase px-4 py-1 rounded-bl-2xl">
              Recommended
            </div>

            <div>
              <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-aether-primary to-purple-700 flex items-center justify-center text-white mb-6 shadow-lavender-sm">
                <Building2 className="w-6 h-6" />
              </div>
              <div className="flex items-center space-x-2 mb-2">
                <h2 className="text-2xl font-bold text-aether-text">Business Workspace</h2>
                <span className="px-2.5 py-0.5 rounded-full bg-aether-primary/10 text-aether-primary text-[10px] font-extrabold uppercase">
                  Pro / Team
                </span>
              </div>
              <p className="text-xs text-aether-subtext mb-6 leading-relaxed">
                For brands, marketing teams, and agencies needing automated guidelines RAG and multi-role review governance.
              </p>

              <div className="space-y-3 mb-8">
                <div className="flex items-center space-x-2.5 text-xs text-aether-text font-medium">
                  <Check className="w-4 h-4 text-aether-primary shrink-0" />
                  <span>Dual Confidence-Gated Brand Guidelines RAG</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-aether-text font-medium">
                  <Check className="w-4 h-4 text-aether-primary shrink-0" />
                  <span>Multi-Tenant Campaign Orchestration Wizard</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-aether-text font-medium">
                  <Check className="w-4 h-4 text-aether-primary shrink-0" />
                  <span>Audit-Safe Approvals Workflow State Machine</span>
                </div>
                <div className="flex items-center space-x-2.5 text-xs text-aether-text font-medium">
                  <Check className="w-4 h-4 text-aether-primary shrink-0" />
                  <span>100-Point Brand Compliance Analytics</span>
                </div>
              </div>
            </div>

            <Link
              to="/login/business"
              className="w-full py-3.5 px-4 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition flex items-center justify-center space-x-2"
            >
              <span>Launch Business Workspace</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </motion.div>
        </div>
      </main>
    </div>
  );
};
