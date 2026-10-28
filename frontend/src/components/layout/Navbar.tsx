import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sparkles, Bell, ChevronDown, Building2, LogOut, Settings, HelpCircle, CheckCircle2 } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { SwitchWorkspaceModal } from '../modals/SwitchWorkspaceModal';

export const Navbar: React.FC = () => {
  const { user, activeOrg, capabilities, logout } = useAuth();
  const navigate = useNavigate();
  const [showUserMenu, setShowUserMenu] = useState(false);
  const [showNotifications, setShowNotifications] = useState(false);
  const [showSwitchModal, setShowSwitchModal] = useState(false);

  const notifications = [
    { id: 1, title: 'Asset Approved', time: '10m ago', text: 'Instagram Product Spotlight was approved by Brand Admin.' },
    { id: 2, title: 'Guidelines Indexed', time: '1h ago', text: 'Brand guidelines vector index updated with 12 chunks.' }
  ];

  return (
    <>
      <header className="sticky top-0 z-40 glass-nav w-full px-6 py-3.5 flex items-center justify-between">
        {/* Brand Logo */}
        <div className="flex items-center space-x-6">
          <Link to="/" className="flex items-center space-x-2.5 group">
            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-aether-primary to-purple-800 flex items-center justify-center text-white shadow-lavender-sm group-hover:scale-105 transition">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <span className="text-xl font-bold gradient-text tracking-tight">AetherDesign</span>
              <span className="block text-[10px] uppercase tracking-wider font-semibold text-aether-subtext">AI Creative Engine</span>
            </div>
          </Link>

          {/* Workspace Pill */}
          {activeOrg && (
            <button
              onClick={() => setShowSwitchModal(true)}
              className="hidden md:flex items-center space-x-2 px-3.5 py-1.5 rounded-full bg-aether-section border border-aether-border/80 hover:border-aether-primary/60 transition text-xs font-semibold text-aether-text"
            >
              <Building2 className="w-3.5 h-3.5 text-aether-primary" />
              <span>{activeOrg.org_name}</span>
              <span className="px-2 py-0.5 rounded-full bg-aether-primary/10 text-aether-primary text-[10px] uppercase font-bold">
                {capabilities.workspaceLabel}
              </span>
              <ChevronDown className="w-3 h-3 text-aether-subtext" />
            </button>
          )}
        </div>

        {/* Right Nav Actions */}
        <div className="flex items-center space-x-4">
          {/* Notifications */}
          <div className="relative">
            <button
              onClick={() => setShowNotifications(!showNotifications)}
              className="p-2.5 rounded-2xl bg-white border border-aether-border hover:bg-aether-light text-aether-text relative transition shadow-sm"
              title="Notifications"
            >
              <Bell className="w-4 h-4" />
              <span className="absolute top-2 right-2 w-2 h-2 rounded-full bg-aether-primary animate-pulse" />
            </button>

            {showNotifications && (
              <div className="absolute right-0 mt-2 w-80 bg-white rounded-3xl p-4 shadow-lavender-lg border border-aether-border z-50 animate-in fade-in slide-in-from-top-2">
                <div className="flex items-center justify-between pb-3 border-b border-aether-border/60">
                  <h3 className="font-bold text-sm text-aether-text">Notifications</h3>
                  <span className="text-[11px] text-aether-primary font-semibold">Mark all read</span>
                </div>
                <div className="space-y-3 mt-3">
                  {notifications.map(n => (
                    <div key={n.id} className="p-2.5 rounded-2xl bg-aether-bg/60 hover:bg-aether-light transition text-xs">
                      <div className="flex justify-between items-center mb-1">
                        <span className="font-semibold text-aether-text">{n.title}</span>
                        <span className="text-[10px] text-aether-subtext">{n.time}</span>
                      </div>
                      <p className="text-aether-subtext leading-relaxed">{n.text}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>

          {/* User Menu */}
          {user ? (
            <div className="relative">
              <button
                onClick={() => setShowUserMenu(!showUserMenu)}
                className="flex items-center space-x-3 p-1.5 pr-3 rounded-2xl bg-white border border-aether-border hover:bg-aether-light transition shadow-sm"
              >
                <img
                  src={user.avatar_url || `https://api.dicebear.com/7.x/initials/svg?seed=${user.email}`}
                  alt={user.full_name || user.email}
                  className="w-8 h-8 rounded-xl object-cover border border-aether-border"
                />
                <div className="hidden lg:block text-left text-xs">
                  <div className="font-bold text-aether-text">{user.full_name || user.email.split('@')[0]}</div>
                  <div className="text-[10px] text-aether-subtext capitalize">{activeOrg?.role?.replace('_', ' ') || 'Member'}</div>
                </div>
                <ChevronDown className="w-3.5 h-3.5 text-aether-subtext" />
              </button>

              {showUserMenu && (
                <div className="absolute right-0 mt-2 w-56 bg-white rounded-3xl p-3 shadow-lavender-lg border border-aether-border z-50 animate-in fade-in">
                  <div className="px-3 py-2 border-b border-aether-border/60 mb-2">
                    <p className="text-xs font-bold text-aether-text truncate">{user.full_name || 'Creator'}</p>
                    <p className="text-[11px] text-aether-subtext truncate">{user.email}</p>
                  </div>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      setShowSwitchModal(true);
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-aether-text hover:bg-aether-light flex items-center space-x-2.5 transition"
                  >
                    <Building2 className="w-4 h-4 text-aether-primary" />
                    <span>Switch Workspace</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/settings');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-aether-text hover:bg-aether-light flex items-center space-x-2.5 transition"
                  >
                    <Settings className="w-4 h-4 text-aether-subtext" />
                    <span>Account Settings</span>
                  </button>

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      navigate('/support');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-medium text-aether-text hover:bg-aether-light flex items-center space-x-2.5 transition"
                  >
                    <HelpCircle className="w-4 h-4 text-aether-subtext" />
                    <span>Help & Support</span>
                  </button>

                  <div className="my-1 border-t border-aether-border/60" />

                  <button
                    onClick={() => {
                      setShowUserMenu(false);
                      logout();
                      navigate('/');
                    }}
                    className="w-full text-left px-3 py-2 rounded-xl text-xs font-semibold text-red-600 hover:bg-red-50 flex items-center space-x-2.5 transition"
                  >
                    <LogOut className="w-4 h-4" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2">
              <Link
                to="/role-selection"
                className="px-4 py-2 rounded-2xl bg-white border border-aether-border text-xs font-semibold text-aether-text hover:bg-aether-light transition"
              >
                Sign In
              </Link>
              <Link
                to="/role-selection"
                className="px-4 py-2 rounded-2xl bg-aether-primary text-white text-xs font-semibold shadow-lavender-sm hover:bg-aether-hover transition"
              >
                Get Started
              </Link>
            </div>
          )}
        </div>
      </header>

      <SwitchWorkspaceModal
        isOpen={showSwitchModal}
        onClose={() => setShowSwitchModal(false)}
      />
    </>
  );
};
