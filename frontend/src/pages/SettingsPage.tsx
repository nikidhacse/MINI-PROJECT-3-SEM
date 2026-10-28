import React, { useState } from 'react';
import { motion } from 'framer-motion';
import {
  Settings,
  User,
  Building2,
  Key,
  Shield,
  Bell,
  Save,
  CheckCircle2,
  Sparkles,
  Layers,
  Copy
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Sidebar } from '../components/layout/Sidebar';
import { SupportChat } from '../components/layout/SupportChat';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

export const SettingsPage: React.FC = () => {
  const { user, activeOrg } = useAuth();

  const [activeTab, setActiveTab] = useState<'profile' | 'workspace' | 'api' | 'team'>('profile');
  const [fullName, setFullName] = useState(user?.full_name || 'Creative Director');
  const [email, setEmail] = useState(user?.email || 'creator@aetherdesign.io');
  const [orgName, setOrgName] = useState(activeOrg?.org_name || 'Studio Workspace');
  const [fluxApiKey, setFluxApiKey] = useState('flx_live_938fa482910bc47291a');
  const [openaiKey, setOpenaiKey] = useState('sk-proj-4910284719204918239');

  const handleSave = (e: React.FormEvent) => {
    e.preventDefault();
    toast.success('Settings saved successfully!');
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copied to clipboard!`);
  };

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-5xl mx-auto w-full overflow-y-auto">
          {/* Header */}
          <div className="mb-8">
            <span className="text-xs font-bold uppercase tracking-wider text-aether-primary">
              Preferences & Configuration
            </span>
            <h1 className="text-2xl sm:text-3xl font-extrabold text-aether-text mt-1">
              Account & Workspace Settings
            </h1>
            <p className="text-xs text-aether-subtext mt-1">
              Manage your personal credentials, workspace preferences, and AI engine integrations
            </p>
          </div>

          {/* Navigation Tabs */}
          <div className="flex space-x-2 border-b border-aether-border mb-8 pb-2">
            {[
              { id: 'profile', label: 'My Profile', icon: User },
              { id: 'workspace', label: 'Workspace & Plan', icon: Building2 },
              { id: 'api', label: 'AI Keys & Models', icon: Key },
              { id: 'team', label: 'Team Members', icon: Shield },
            ].map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`flex items-center space-x-2 px-4 py-2.5 rounded-2xl text-xs font-bold transition ${
                    activeTab === tab.id
                      ? 'bg-aether-primary text-white shadow-lavender-sm'
                      : 'text-aether-subtext hover:text-aether-text hover:bg-aether-section'
                  }`}
                >
                  <Icon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Contents */}
          <motion.div
            key={activeTab}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="glass-panel bg-white p-8 rounded-3xl border border-aether-border shadow-lavender-sm"
          >
            {activeTab === 'profile' && (
              <form onSubmit={handleSave} className="space-y-6">
                <h2 className="text-lg font-bold text-aether-text">Personal Information</h2>
                <div className="flex items-center space-x-4 pb-4 border-b border-aether-border">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-tr from-aether-primary to-purple-400 text-white flex items-center justify-center font-bold text-xl shadow-lavender-sm">
                    {fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className="font-bold text-sm text-aether-text">{fullName}</h3>
                    <p className="text-xs text-aether-subtext">{email}</p>
                    <span className="inline-block mt-1 px-2 py-0.5 rounded-full bg-aether-light text-aether-primary text-[10px] font-bold uppercase">
                      {activeOrg?.role || 'Creator'}
                    </span>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-aether-text mb-1.5">Full Name</label>
                    <input
                      type="text"
                      value={fullName}
                      onChange={e => setFullName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-aether-border text-xs focus:ring-2 focus:ring-aether-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-aether-text mb-1.5">Email Address</label>
                    <input
                      type="email"
                      value={email}
                      disabled
                      className="w-full px-4 py-2.5 rounded-2xl border border-aether-border bg-aether-section/50 text-xs text-aether-subtext cursor-not-allowed outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-aether-primary text-white text-xs font-bold shadow-lavender-sm hover:bg-aether-hover transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save Changes</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'workspace' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-aether-text">Workspace Details</h2>
                    <p className="text-xs text-aether-subtext">Manage multi-tenant tenant isolation and billing tier</p>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-purple-100 text-purple-700 font-extrabold text-xs uppercase">
                    {activeOrg?.plan || 'Free'} Plan
                  </span>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  <div>
                    <label className="block text-xs font-bold text-aether-text mb-1.5">Workspace Name</label>
                    <input
                      type="text"
                      value={orgName}
                      onChange={e => setOrgName(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-aether-border text-xs focus:ring-2 focus:ring-aether-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-aether-text mb-1.5">Workspace ID</label>
                    <div className="flex items-center space-x-2">
                      <input
                        type="text"
                        value={activeOrg?.org_id || 'org-main-tenant-4902'}
                        disabled
                        className="w-full px-4 py-2.5 rounded-2xl border border-aether-border bg-aether-section/50 text-xs text-aether-subtext font-mono"
                      />
                      <button
                        type="button"
                        onClick={() => copyToClipboard(activeOrg?.org_id || 'org-main-tenant-4902', 'Org ID')}
                        className="p-2.5 rounded-2xl border border-aether-border hover:bg-aether-light text-aether-primary transition"
                      >
                        <Copy className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-aether-primary text-white text-xs font-bold shadow-lavender-sm hover:bg-aether-hover transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Update Workspace</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'api' && (
              <form onSubmit={handleSave} className="space-y-6">
                <div>
                  <h2 className="text-lg font-bold text-aether-text">AI Synthesis & RAG Keys</h2>
                  <p className="text-xs text-aether-subtext">
                    AetherDesign includes built-in backend proxy endpoints, or you can supply your own API keys.
                  </p>
                </div>

                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-bold text-aether-text mb-1.5">
                      FLUX.1 Diffusion Model API Key
                    </label>
                    <input
                      type="password"
                      value={fluxApiKey}
                      onChange={e => setFluxApiKey(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-aether-border text-xs font-mono focus:ring-2 focus:ring-aether-primary outline-none"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-aether-text mb-1.5">
                      LLM / OpenAI & Gemini Embeddings Key (for Dual-Confidence RAG)
                    </label>
                    <input
                      type="password"
                      value={openaiKey}
                      onChange={e => setOpenaiKey(e.target.value)}
                      className="w-full px-4 py-2.5 rounded-2xl border border-aether-border text-xs font-mono focus:ring-2 focus:ring-aether-primary outline-none"
                    />
                  </div>
                </div>

                <div className="pt-4 flex justify-end">
                  <button
                    type="submit"
                    className="flex items-center space-x-2 px-6 py-2.5 rounded-2xl bg-aether-primary text-white text-xs font-bold shadow-lavender-sm hover:bg-aether-hover transition"
                  >
                    <Save className="w-4 h-4" />
                    <span>Save API Keys</span>
                  </button>
                </div>
              </form>
            )}

            {activeTab === 'team' && (
              <div className="space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h2 className="text-lg font-bold text-aether-text">Team Members & Permissions</h2>
                    <p className="text-xs text-aether-subtext">Manage who can create, edit, approve, or manage brand guidelines</p>
                  </div>
                  <button
                    type="button"
                    onClick={() => toast.success('Invite link copied!')}
                    className="px-4 py-2 rounded-2xl bg-aether-primary text-white text-xs font-bold shadow-lavender-sm hover:bg-aether-hover transition"
                  >
                    + Invite Member
                  </button>
                </div>

                <div className="divide-y divide-aether-border/60 text-xs">
                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-aether-text">{user?.full_name || 'Admin User'}</p>
                      <p className="text-[11px] text-aether-subtext">{user?.email || 'creator@aetherdesign.io'}</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-purple-100 text-purple-700 font-bold text-[10px] uppercase">
                      Owner
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-aether-text">Sarah Chen</p>
                      <p className="text-[11px] text-aether-subtext">sarah.chen@company.com</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-blue-100 text-blue-700 font-bold text-[10px] uppercase">
                      Brand Admin
                    </span>
                  </div>

                  <div className="py-3 flex items-center justify-between">
                    <div>
                      <p className="font-bold text-aether-text">Alex Rivera</p>
                      <p className="text-[11px] text-aether-subtext">alex.designer@company.com</p>
                    </div>
                    <span className="px-2.5 py-1 rounded-full bg-emerald-100 text-emerald-700 font-bold text-[10px] uppercase">
                      Designer
                    </span>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </main>
      </div>

      <SupportChat />
    </div>
  );
};
