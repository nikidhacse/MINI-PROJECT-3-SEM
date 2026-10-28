import React from 'react';
import { Link } from 'react-router-dom';
import { Sparkles, Shield, Cpu, Zap, Heart } from 'lucide-react';

export const Footer: React.FC = () => {
  return (
    <footer className="w-full bg-white border-t border-aether-border/80 py-12 px-6 lg:px-16 mt-auto">
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 gap-8 mb-12">
        {/* Brand */}
        <div className="space-y-3 md:col-span-1">
          <div className="flex items-center space-x-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-aether-primary to-purple-800 flex items-center justify-center text-white shadow-lavender-sm">
              <Sparkles className="w-4 h-4" />
            </div>
            <span className="text-lg font-bold gradient-text tracking-tight">AetherDesign</span>
          </div>
          <p className="text-xs text-aether-subtext leading-relaxed">
            Next-generation multi-tenant AI creative platform empowering businesses and creators with brand-consistent visual synthesis.
          </p>
          <div className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full bg-aether-section text-aether-primary text-[10px] font-bold">
            <Shield className="w-3 h-3" />
            <span>Enterprise Multi-Tenant Isolated</span>
          </div>
        </div>

        {/* Platform Links */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-aether-text">Platform</h4>
          <ul className="space-y-1.5 text-xs text-aether-subtext">
            <li><Link to="/creator/generator" className="hover:text-aether-primary transition">AI Image Generator</Link></li>
            <li><Link to="/creator/editor" className="hover:text-aether-primary transition">Design Studio Canvas</Link></li>
            <li><Link to="/creator/templates" className="hover:text-aether-primary transition">Template Gallery</Link></li>
            <li><Link to="/business/brand-kit" className="hover:text-aether-primary transition">Brand Guidelines RAG</Link></li>
          </ul>
        </div>

        {/* Enterprise & Workflow */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-aether-text">Collaboration</h4>
          <ul className="space-y-1.5 text-xs text-aether-subtext">
            <li><Link to="/business/campaigns" className="hover:text-aether-primary transition">Campaign Orchestration</Link></li>
            <li><Link to="/business/approvals" className="hover:text-aether-primary transition">Approval State Machine</Link></li>
            <li><Link to="/business/analytics" className="hover:text-aether-primary transition">Brand Compliance Score</Link></li>
            <li><Link to="/role-selection" className="hover:text-aether-primary transition">Creator & Business Portals</Link></li>
          </ul>
        </div>

        {/* Support & Legal */}
        <div className="space-y-2">
          <h4 className="text-xs font-bold uppercase tracking-wider text-aether-text">Resources</h4>
          <ul className="space-y-1.5 text-xs text-aether-subtext">
            <li><Link to="/support" className="hover:text-aether-primary transition">Help Center & FAQ</Link></li>
            <li><Link to="/support" className="hover:text-aether-primary transition">Submit Support Ticket</Link></li>
            <li><span className="text-aether-subtext/80">Privacy & Tenancy Terms</span></li>
            <li><span className="text-aether-subtext/80">Security & Compliance</span></li>
          </ul>
        </div>
      </div>

      <div className="max-w-7xl mx-auto pt-6 border-t border-aether-border/60 flex flex-col md:flex-row items-center justify-between text-xs text-aether-subtext">
        <div>
          © {new Date().getFullYear()} AetherDesign AI. Built with Google Gemini & Cloudflare FLUX.
        </div>
        <div className="flex items-center space-x-4 mt-4 md:mt-0">
          <span className="flex items-center space-x-1">
            <Cpu className="w-3.5 h-3.5 text-aether-primary" />
            <span>Dual Confidence-Gated RAG</span>
          </span>
          <span className="flex items-center space-x-1">
            <Zap className="w-3.5 h-3.5 text-aether-accent" />
            <span>No-Text Diffusion Synthesis</span>
          </span>
        </div>
      </div>
    </footer>
  );
};
