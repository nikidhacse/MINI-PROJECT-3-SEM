import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { ShieldAlert, ArrowLeft, Sparkles, Building2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';

export const AccessDeniedPage: React.FC = () => {
  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6 text-center">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel bg-white p-8 rounded-3xl shadow-lavender-lg max-w-md w-full border border-aether-border space-y-4"
        >
          <div className="w-14 h-14 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center mx-auto">
            <ShieldAlert className="w-7 h-7" />
          </div>

          <h2 className="text-2xl font-bold text-aether-text">Feature Locked</h2>
          <p className="text-xs text-aether-subtext leading-relaxed">
            This module (Campaigns, Brand Kit RAG, Approvals, or Analytics) requires a <strong>Pro</strong> or <strong>Enterprise</strong> tier workspace.
          </p>

          <div className="pt-2 space-y-2">
            <Link
              to="/onboarding"
              className="w-full py-3 px-4 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition flex items-center justify-center space-x-2"
            >
              <Sparkles className="w-4 h-4" />
              <span>Upgrade to Business Workspace</span>
            </Link>

            <Link
              to="/creator/dashboard"
              className="w-full py-2.5 px-4 rounded-2xl border border-aether-border hover:bg-aether-light text-aether-text font-semibold text-xs flex items-center justify-center space-x-1.5 transition"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              <span>Return to Creator Studio</span>
            </Link>
          </div>
        </motion.div>
      </main>
    </div>
  );
};
