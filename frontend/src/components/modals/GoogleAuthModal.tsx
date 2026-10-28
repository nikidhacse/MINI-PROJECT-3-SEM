import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, Sparkles } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useNavigate } from 'react-router-dom';

interface GoogleAuthModalProps {
  isOpen: boolean;
  onClose: () => void;
  targetRole?: 'creator' | 'business';
}

export const GoogleAuthModal: React.FC<GoogleAuthModalProps> = ({ isOpen, onClose, targetRole = 'creator' }) => {
  const { googleSignIn } = useAuth();
  const navigate = useNavigate();

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/40 backdrop-blur-sm">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          exit={{ opacity: 0, scale: 0.95 }}
          className="glass-panel bg-white p-8 rounded-3xl shadow-lavender-lg max-w-sm w-full border border-aether-border relative text-center"
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="w-12 h-12 rounded-2xl bg-aether-light flex items-center justify-center mx-auto mb-4 text-aether-primary">
            <svg className="w-6 h-6" viewBox="0 0 24 24">
              <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
              <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
              <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z" />
              <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z" />
            </svg>
          </div>

          <h3 className="text-xl font-bold text-aether-text mb-1">Google Single Sign-On</h3>
          <p className="text-xs text-aether-subtext mb-6">
            Continue with your Google account for instant workspace access.
          </p>

          <button
            onClick={async () => {
              await googleSignIn(targetRole);
              onClose();
              navigate(targetRole === 'business' ? '/business/dashboard' : '/creator/dashboard');
            }}
            className="w-full py-3 px-4 rounded-2xl bg-aether-primary text-white font-semibold text-sm shadow-lavender-sm hover:bg-aether-hover transition flex items-center justify-center space-x-2"
          >
            <Sparkles className="w-4 h-4" />
            <span>Authorize Google Account</span>
          </button>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};
