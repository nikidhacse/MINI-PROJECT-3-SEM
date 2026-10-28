import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Building2, Sparkles, Check, Plus } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface SwitchWorkspaceModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const SwitchWorkspaceModal: React.FC<SwitchWorkspaceModalProps> = ({ isOpen, onClose }) => {
  const { activeOrg, memberships, switchOrg } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95, y: 10 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.95, y: 10 }}
          className="glass-panel bg-white p-6 rounded-3xl shadow-lavender-lg max-w-md w-full border border-aether-border relative"
        >
          <button
            onClick={onClose}
            className="absolute top-5 right-5 p-2 rounded-full hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="flex items-center space-x-3 mb-6">
            <div className="w-10 h-10 rounded-2xl bg-aether-light flex items-center justify-center text-aether-primary">
              <Building2 className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-aether-text">Switch Workspace</h2>
              <p className="text-xs text-aether-subtext">Select an organization or create a new studio</p>
            </div>
          </div>

          <div className="space-y-3 mb-6">
            {memberships.map((m) => {
              const isActive = activeOrg?.org_id === m.org_id;
              const isPaid = m.plan !== 'free';

              return (
                <button
                  key={m.org_id}
                  onClick={async () => {
                    await switchOrg(m.org_id);
                    onClose();
                    navigate(isPaid ? '/business/dashboard' : '/creator/dashboard');
                  }}
                  className={`w-full text-left p-4 rounded-2xl border transition flex items-center justify-between ${
                    isActive
                      ? 'border-aether-primary bg-aether-light/60 shadow-lavender-sm'
                      : 'border-aether-border/60 hover:border-aether-primary/50 hover:bg-aether-section/40'
                  }`}
                >
                  <div className="flex items-center space-x-3">
                    <div className={`w-9 h-9 rounded-xl flex items-center justify-center font-bold text-sm ${
                      isPaid ? 'bg-aether-primary text-white' : 'bg-aether-secondary/30 text-aether-primary'
                    }`}>
                      {m.org_name.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className="font-semibold text-sm text-aether-text flex items-center space-x-2">
                        <span>{m.org_name}</span>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold uppercase ${
                          isPaid ? 'bg-aether-primary/10 text-aether-primary' : 'bg-gray-100 text-gray-600'
                        }`}>
                          {m.plan}
                        </span>
                      </div>
                      <p className="text-xs text-aether-subtext capitalize">Role: {m.role.replace('_', ' ')}</p>
                    </div>
                  </div>
                  {isActive && <Check className="w-5 h-5 text-aether-primary" />}
                </button>
              );
            })}
          </div>

          <button
            onClick={() => {
              onClose();
              navigate('/onboarding');
            }}
            className="w-full py-3 px-4 rounded-2xl border border-dashed border-aether-primary/40 text-aether-primary hover:bg-aether-light/60 font-semibold text-sm flex items-center justify-center space-x-2 transition"
          >
            <Plus className="w-4 h-4" />
            <span>Create New Workspace</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
