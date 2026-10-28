import React, { useEffect, useState } from 'react';
import { NavLink } from 'react-router-dom';
import {
  LayoutDashboard,
  Sparkles,
  LayoutTemplate,
  FolderKanban,
  Palette,
  Layers,
  CheckCircle2,
  BarChart3,
  Settings,
  HelpCircle,
  Paintbrush
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';

export const Sidebar: React.FC = () => {
  const { capabilities } = useAuth();
  const [pendingApprovalsCount, setPendingApprovalsCount] = useState<number>(2);

  useEffect(() => {
    if (capabilities.approvals) {
      ApiClient.getResource('assets', { status: 'in_review' })
        .then(res => {
          if (res.data && Array.isArray(res.data)) {
            setPendingApprovalsCount(res.data.length);
          }
        })
        .catch(() => {});
    }
  }, [capabilities.approvals]);

  const dashboardRoute = capabilities.isSolo ? '/creator/dashboard' : '/business/dashboard';

  return (
    <aside className="w-64 min-h-[calc(100vh-65px)] bg-white border-r border-aether-border p-4 flex flex-col justify-between shrink-0">
      <div className="space-y-6">
        {/* Core Creative Tools */}
        <div>
          <div className="px-3 mb-2 text-[11px] font-bold text-aether-subtext uppercase tracking-wider">
            {capabilities.workspaceLabel}
          </div>
          <nav className="space-y-1">
            <NavLink
              to={dashboardRoute}
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-aether-light text-aether-primary shadow-lavender-sm'
                    : 'text-aether-text hover:bg-aether-section/60'
                }`
              }
            >
              <LayoutDashboard className="w-4 h-4" />
              <span>Dashboard</span>
            </NavLink>

            <NavLink
              to="/creator/generator"
              className={({ isActive }) =>
                `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-bold transition ${
                  isActive
                    ? 'bg-gradient-to-r from-aether-primary to-purple-600 text-white shadow-lavender-md'
                    : 'bg-aether-light/70 text-aether-primary hover:bg-aether-light border border-aether-border/60'
                }`
              }
            >
              <div className="flex items-center space-x-3">
                <Sparkles className="w-4 h-4 animate-pulse" />
                <span>AI Generator</span>
              </div>
              <span className="px-1.5 py-0.5 text-[9px] uppercase font-extrabold rounded-md bg-white/20 text-current">
                PRO
              </span>
            </NavLink>

            <NavLink
              to="/creator/editor"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-aether-light text-aether-primary shadow-lavender-sm'
                    : 'text-aether-text hover:bg-aether-section/60'
                }`
              }
            >
              <Paintbrush className="w-4 h-4" />
              <span>Design Studio</span>
            </NavLink>

            <NavLink
              to="/creator/templates"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-aether-light text-aether-primary shadow-lavender-sm'
                    : 'text-aether-text hover:bg-aether-section/60'
                }`
              }
            >
              <LayoutTemplate className="w-4 h-4" />
              <span>Templates</span>
            </NavLink>

            <NavLink
              to="/creator/assets"
              className={({ isActive }) =>
                `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                  isActive
                    ? 'bg-aether-light text-aether-primary shadow-lavender-sm'
                    : 'text-aether-text hover:bg-aether-section/60'
                }`
              }
            >
              <FolderKanban className="w-4 h-4" />
              <span>Asset Library</span>
            </NavLink>
          </nav>
        </div>

        {/* Business & Collaboration Tools (Gated by capabilities) */}
        {capabilities.campaigns && (
          <div>
            <div className="px-3 mb-2 text-[11px] font-bold text-aether-subtext uppercase tracking-wider">
              Management
            </div>
            <nav className="space-y-1">
              <NavLink
                to="/business/campaigns"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-aether-light text-aether-primary shadow-lavender-sm'
                      : 'text-aether-text hover:bg-aether-section/60'
                  }`
                }
              >
                <Layers className="w-4 h-4" />
                <span>Campaigns</span>
              </NavLink>

              <NavLink
                to="/business/brand-kit"
                className={({ isActive }) =>
                  `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                    isActive
                      ? 'bg-aether-light text-aether-primary shadow-lavender-sm'
                      : 'text-aether-text hover:bg-aether-section/60'
                  }`
                }
              >
                <Palette className="w-4 h-4" />
                <span>Brand Kit & RAG</span>
              </NavLink>

              {capabilities.approvals && (
                <NavLink
                  to="/business/approvals"
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-aether-light text-aether-primary shadow-lavender-sm'
                        : 'text-aether-text hover:bg-aether-section/60'
                    }`
                  }
                >
                  <div className="flex items-center space-x-3">
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Approvals</span>
                  </div>
                  {pendingApprovalsCount > 0 && (
                    <span className="px-2 py-0.5 rounded-full bg-aether-primary text-white font-bold text-[10px]">
                      {pendingApprovalsCount}
                    </span>
                  )}
                </NavLink>
              )}

              {capabilities.analytics && (
                <NavLink
                  to="/business/analytics"
                  className={({ isActive }) =>
                    `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
                      isActive
                        ? 'bg-aether-light text-aether-primary shadow-lavender-sm'
                        : 'text-aether-text hover:bg-aether-section/60'
                    }`
                  }
                >
                  <BarChart3 className="w-4 h-4" />
                  <span>Analytics & Compliance</span>
                </NavLink>
              )}
            </nav>
          </div>
        )}
      </div>

      {/* System Settings & Help */}
      <div className="pt-4 border-t border-aether-border/60 space-y-1">
        <NavLink
          to="/settings"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
              isActive
                ? 'bg-aether-light text-aether-primary shadow-lavender-sm'
                : 'text-aether-subtext hover:text-aether-text hover:bg-aether-section/60'
            }`
          }
        >
          <Settings className="w-4 h-4" />
          <span>Settings</span>
        </NavLink>

        <NavLink
          to="/support"
          className={({ isActive }) =>
            `flex items-center space-x-3 px-3.5 py-2.5 rounded-2xl text-xs font-semibold transition ${
              isActive
                ? 'bg-aether-light text-aether-primary shadow-lavender-sm'
                : 'text-aether-subtext hover:text-aether-text hover:bg-aether-section/60'
            }`
          }
        >
          <HelpCircle className="w-4 h-4" />
          <span>Support & FAQ</span>
        </NavLink>
      </div>
    </aside>
  );
};
