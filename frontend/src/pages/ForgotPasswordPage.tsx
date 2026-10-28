import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import { Mail, ArrowLeft, Send, CheckCircle2 } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import toast from 'react-hot-toast';

export const ForgotPasswordPage: React.FC = () => {
  const [email, setEmail] = useState('');
  const [sent, setSent] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
    toast.success('Password reset link sent to your email');
  };

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <main className="flex-1 flex items-center justify-center p-6">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          className="glass-panel bg-white p-8 rounded-3xl shadow-lavender-lg max-w-md w-full border border-aether-border text-center"
        >
          {sent ? (
            <div className="space-y-4">
              <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                <CheckCircle2 className="w-6 h-6" />
              </div>
              <h2 className="text-xl font-bold text-aether-text">Check Your Inbox</h2>
              <p className="text-xs text-aether-subtext leading-relaxed">
                We've sent a secure password reset link to <strong className="text-aether-text">{email}</strong>.
              </p>
              <Link
                to="/role-selection"
                className="inline-flex items-center space-x-2 text-xs font-bold text-aether-primary hover:underline pt-4"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                <span>Return to Sign In</span>
              </Link>
            </div>
          ) : (
            <div>
              <h2 className="text-2xl font-bold text-aether-text mb-2">Reset Password</h2>
              <p className="text-xs text-aether-subtext mb-6">
                Enter your account email to receive a password recovery link.
              </p>

              <form onSubmit={handleSubmit} className="space-y-4 text-left">
                <div>
                  <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-aether-subtext absolute left-3.5 top-3.5" />
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="name@company.com"
                      className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 px-4 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition flex items-center justify-center space-x-2"
                >
                  <Send className="w-3.5 h-3.5" />
                  <span>Send Recovery Email</span>
                </button>
              </form>

              <div className="mt-6">
                <Link
                  to="/role-selection"
                  className="inline-flex items-center space-x-1.5 text-xs text-aether-subtext hover:text-aether-text transition"
                >
                  <ArrowLeft className="w-3.5 h-3.5" />
                  <span>Back to Sign In</span>
                </Link>
              </div>
            </div>
          )}
        </motion.div>
      </main>
    </div>
  );
};
