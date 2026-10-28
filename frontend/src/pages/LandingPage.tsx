import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import {
  Sparkles,
  Palette,
  Layers,
  Paintbrush,
  LayoutTemplate,
  Users2,
  BarChart3,
  ShieldCheck,
  ArrowRight,
  CheckCircle2,
  ChevronDown,
  Cpu,
  Zap,
  Star,
  Quote
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';

export const LandingPage: React.FC = () => {
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const featureCards = [
    {
      title: 'AI Content Generation',
      icon: Sparkles,
      desc: 'Diffusion synthesis tuned for enterprise platforms with zero garbled text.'
    },
    {
      title: 'Brand Kit Management',
      icon: Palette,
      desc: 'Vector indexed brand colors, typography, and unstructured guidelines via RAG.'
    },
    {
      title: 'Campaign Management',
      icon: Layers,
      desc: 'Multi-platform campaign orchestration with audience targeting and deadlines.'
    },
    {
      title: 'Canva-Style AI Editor',
      icon: Paintbrush,
      desc: 'Composite live vector typography, brand swatches, and visual effects over images.'
    },
    {
      title: 'Template Library',
      icon: LayoutTemplate,
      desc: 'Pre-built high-converting layout templates for posters, stories, and link banners.'
    },
    {
      title: 'Seamless Collaboration',
      icon: Users2,
      desc: 'Role-based creator assignment with audit-safe approval state machines.'
    },
    {
      title: 'Creative Analytics',
      icon: BarChart3,
      desc: 'Comprehensive charts and a 100-point brand compliance configuration score.'
    },
    {
      title: 'Asset Vault Management',
      icon: ShieldCheck,
      desc: 'Multi-tenant isolated storage with version tracking and automated backups.'
    }
  ];

  const workflowSteps = [
    { step: '01', title: 'Create Campaign', desc: 'Business defines marketing brief, platform preset, and brand kit.' },
    { step: '02', title: 'Assign Creator', desc: 'Campaign is assigned to a designated in-house designer or agency.' },
    { step: '03', title: 'AI Generates Visuals', desc: 'Confidence-gated RAG retrieves brand rules and synthesizes pristine art.' },
    { step: '04', title: 'Creator Customises', desc: 'Live typography, CTA, and brand tokens are overlaid in Design Studio.' },
    { step: '05', title: 'Business Approves', desc: 'One-click approval state machine transitions the asset for multi-channel release.' }
  ];

  const testimonials = [
    {
      quote: 'AetherDesign cut our campaign visual cycle from 5 days to 20 minutes. The dual confidence RAG ensures our brand rules are never violated.',
      author: 'Elena Rostova',
      role: 'VP of Marketing, HyperScale AI',
      rating: 5
    },
    {
      quote: 'The fact that generated diffusion images contain no garbled text—allowing us to add vector typography in the editor—is pure genius.',
      author: 'Marcus Vance',
      role: 'Lead Creative Director, Studio Pulse',
      rating: 5
    },
    {
      quote: 'The multi-tenant isolation and audit-safe approval versions gave our compliance team total peace of mind.',
      author: 'Sophia Chen',
      role: 'Brand Operations Lead, Omnicorp',
      rating: 5
    }
  ];

  const faqs = [
    {
      q: 'How does the Confidence-Gated RAG differ from basic similarity filters?',
      a: 'Brand guideline corpora are small and homogeneous, meaning cosine scores sit in a narrow band. AetherDesign uses a dual gate: gap >= 0.03 OR top_similarity >= 0.85. This separates genuine matches from noise while safely recovering tightly clustered valid rules.'
    },
    {
      q: 'Why do generated images contain no text?',
      a: 'Diffusion models render lettering unreliably, producing garbled headlines. AetherDesign renders pure visual artwork with diffusion, and you composite crisp live vector typography in the Canva-style Design Studio.'
    },
    {
      q: 'What is the difference between Creator Studio and Business Workspace?',
      a: 'Free plan users access Creator Studio (AI Generator, Design Studio, Templates, and Asset Library). Paid plans unlock Business Workspace (Campaigns, Brand Kit RAG, Approvals state machine, and Analytics).'
    },
    {
      q: 'Can I upload my existing brand PDF or Word document?',
      a: 'Yes! The Brand Kit parser extracts text directly in your browser from PDF and DOCX files, splits them into semantic chunks, and creates 256-dimensional embeddings.'
    }
  ];

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      {/* Hero Section */}
      <section className="relative px-6 pt-16 pb-24 lg:pt-24 lg:pb-32 overflow-hidden">
        <div className="max-w-7xl mx-auto text-center relative z-10">
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            className="inline-flex items-center space-x-2 px-4 py-1.5 rounded-full bg-aether-section border border-aether-border text-xs font-bold text-aether-primary uppercase tracking-wider mb-6 shadow-sm"
          >
            <Sparkles className="w-3.5 h-3.5 animate-pulse" />
            <span>Multi-Tenant AI Creative Operating System</span>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-4xl sm:text-6xl lg:text-7xl font-extrabold text-aether-text tracking-tight max-w-4xl mx-auto leading-[1.15]"
          >
            Brand-Consistent Visuals, <span className="gradient-text">Engineered by AI.</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="mt-6 text-base sm:text-lg text-aether-subtext max-w-2xl mx-auto font-normal leading-relaxed"
          >
            Upload your brand guidelines once. Our confidence-gated RAG engine retrieves exact rules, Gemini crafts the creative brief, FLUX synthesizes pure visual assets, and your team composites live vector typography.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <Link
              to="/role-selection"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-aether-primary text-white font-bold text-sm shadow-lavender-md hover:bg-aether-hover transition flex items-center justify-center space-x-2 group"
            >
              <span>Launch Studio Experience</span>
              <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition" />
            </Link>

            <Link
              to="/support"
              className="w-full sm:w-auto px-8 py-4 rounded-2xl bg-white border border-aether-border hover:bg-aether-light text-aether-text font-bold text-sm shadow-lavender-sm transition"
            >
              Explore Architecture & Docs
            </Link>
          </motion.div>

          {/* Animated SVG Dashboard Illustration */}
          <motion.div
            initial={{ opacity: 0, y: 40 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.4, duration: 0.8 }}
            className="mt-16 max-w-5xl mx-auto glass-panel p-4 sm:p-6 rounded-3xl shadow-lavender-lg border border-aether-border"
          >
            <div className="w-full h-auto rounded-2xl bg-gradient-to-br from-white via-aether-section/40 to-aether-light p-6 sm:p-8 border border-aether-border/60">
              <div className="flex items-center justify-between pb-4 border-b border-aether-border/60 mb-6">
                <div className="flex items-center space-x-3">
                  <div className="flex space-x-1.5">
                    <span className="w-3 h-3 rounded-full bg-red-400/80" />
                    <span className="w-3 h-3 rounded-full bg-amber-400/80" />
                    <span className="w-3 h-3 rounded-full bg-emerald-400/80" />
                  </div>
                  <span className="text-xs font-bold text-aether-text">AetherDesign Canvas • Instagram Post (1080×1080)</span>
                </div>
                <div className="flex items-center space-x-2">
                  <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-800 text-[10px] font-bold">RAG Confidence: 0.894 (True)</span>
                </div>
              </div>

              {/* Dynamic SVG Mockup */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Visual Diffusion Render */}
                <div className="md:col-span-2 relative aspect-square rounded-2xl bg-gradient-to-tr from-[#8B5CF6] via-[#C4B5FD] to-[#EDE9FE] overflow-hidden shadow-lavender-md flex items-center justify-center p-8">
                  <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-transparent" />
                  {/* Decorative Elements */}
                  <div className="absolute top-6 left-6 p-3 rounded-2xl bg-white/30 backdrop-blur-md border border-white/40 text-white text-left">
                    <div className="text-[10px] font-bold uppercase tracking-wider opacity-80">Diffusion Model</div>
                    <div className="text-xs font-bold">FLUX-1-Schnell Pure Art (No Text)</div>
                  </div>

                  {/* Vector Typography Composite Layer */}
                  <div className="relative z-10 text-center text-white space-y-3">
                    <span className="px-3 py-1 rounded-full bg-white/20 backdrop-blur-md text-[11px] font-bold uppercase tracking-widest border border-white/30">
                      Live Vector Typography Layer
                    </span>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight drop-shadow-md">
                      SUMMER HORIZONS
                    </h2>
                    <p className="text-xs sm:text-sm font-medium text-white/90 drop-shadow">
                      Engineered with automated brand palette &amp; font tokens
                    </p>
                  </div>
                </div>

                {/* AI Understanding Inspector Panel */}
                <div className="bg-white rounded-2xl p-5 border border-aether-border shadow-sm text-left space-y-4">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-aether-primary tracking-wider">AI Creative Director</span>
                    <h4 className="text-sm font-bold text-aether-text mt-0.5">Structured Brief</h4>
                  </div>
                  <div className="space-y-2 text-xs">
                    <div className="p-2 rounded-xl bg-aether-bg">
                      <span className="text-aether-subtext text-[10px] block">Intent</span>
                      <span className="font-semibold text-aether-text">Summer Campaign Hero</span>
                    </div>
                    <div className="p-2 rounded-xl bg-aether-bg">
                      <span className="text-aether-subtext text-[10px] block">Brand Palette</span>
                      <div className="flex space-x-1.5 mt-1">
                        <span className="w-5 h-5 rounded-full bg-[#8B5CF6] border border-white" />
                        <span className="w-5 h-5 rounded-full bg-[#C4B5FD] border border-white" />
                        <span className="w-5 h-5 rounded-full bg-[#A78BFA] border border-white" />
                      </div>
                    </div>
                    <div className="p-2 rounded-xl bg-aether-bg">
                      <span className="text-aether-subtext text-[10px] block">Text Gating</span>
                      <span className="font-bold text-emerald-600">✓ No text in diffusion render</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        </div>
      </section>

      {/* 8 Feature Cards Section */}
      <section className="py-20 px-6 bg-white border-y border-aether-border/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-aether-section text-aether-primary font-bold text-xs uppercase tracking-wider">
              Comprehensive Capabilities
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-aether-text mt-4">
              Everything Your Brand Needs to Scale Visual Output
            </h2>
            <p className="text-sm text-aether-subtext mt-3">
              Purpose-built tools connecting marketing strategy, generative AI, and human creative polish.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featureCards.map((feat, idx) => {
              const Icon = feat.icon;
              return (
                <div
                  key={idx}
                  className="glass-panel p-6 rounded-3xl border border-aether-border card-hover bg-white flex flex-col justify-between"
                >
                  <div>
                    <div className="w-12 h-12 rounded-2xl bg-aether-light flex items-center justify-center text-aether-primary mb-5 shadow-sm">
                      <Icon className="w-6 h-6" />
                    </div>
                    <h3 className="text-base font-bold text-aether-text mb-2">{feat.title}</h3>
                    <p className="text-xs text-aether-subtext leading-relaxed">{feat.desc}</p>
                  </div>
                  <div className="mt-4 pt-4 border-t border-aether-border/60 flex items-center text-xs font-semibold text-aether-primary">
                    <span>Explore feature</span>
                    <ArrowRight className="w-3.5 h-3.5 ml-1" />
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      {/* 5-Step How It Works Section */}
      <section className="py-24 px-6 bg-aether-bg">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-aether-section text-aether-primary font-bold text-xs uppercase tracking-wider">
              End-to-End Flow
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-aether-text mt-4">
              How AetherDesign Works
            </h2>
            <p className="text-sm text-aether-subtext mt-3">
              From business brief to approved high-resolution asset in 5 deterministic steps.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 relative">
            {workflowSteps.map((step, idx) => (
              <div key={idx} className="bg-white p-6 rounded-3xl border border-aether-border shadow-lavender-sm relative flex flex-col justify-between">
                <div>
                  <span className="text-3xl font-extrabold text-aether-primary/20 block mb-2">{step.step}</span>
                  <h4 className="text-sm font-bold text-aether-text mb-2">{step.title}</h4>
                  <p className="text-xs text-aether-subtext leading-relaxed">{step.desc}</p>
                </div>
                <div className="mt-4 flex items-center space-x-1.5 text-emerald-600 text-[11px] font-semibold">
                  <CheckCircle2 className="w-3.5 h-3.5" />
                  <span>Verified Step</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3 Testimonials Section */}
      <section className="py-20 px-6 bg-white border-y border-aether-border/80">
        <div className="max-w-7xl mx-auto">
          <div className="text-center max-w-3xl mx-auto mb-16">
            <span className="px-3.5 py-1.5 rounded-full bg-aether-section text-aether-primary font-bold text-xs uppercase tracking-wider">
              Client Feedback
            </span>
            <h2 className="text-3xl sm:text-4xl font-bold text-aether-text mt-4">
              Loved by Creative Teams Everywhere
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {testimonials.map((t, idx) => (
              <div key={idx} className="p-8 rounded-3xl bg-aether-bg/60 border border-aether-border flex flex-col justify-between">
                <div>
                  <div className="flex space-x-1 text-amber-400 mb-4">
                    {[...Array(t.rating)].map((_, i) => (
                      <Star key={i} className="w-4 h-4 fill-current" />
                    ))}
                  </div>
                  <Quote className="w-8 h-8 text-aether-primary/30 mb-2" />
                  <p className="text-xs text-aether-text font-medium leading-relaxed italic mb-6">
                    "{t.quote}"
                  </p>
                </div>
                <div className="pt-4 border-t border-aether-border/60">
                  <h5 className="text-xs font-bold text-aether-text">{t.author}</h5>
                  <p className="text-[11px] text-aether-subtext">{t.role}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Accordion FAQ */}
      <section className="py-20 px-6 bg-aether-bg">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <span className="px-3.5 py-1.5 rounded-full bg-aether-section text-aether-primary font-bold text-xs uppercase tracking-wider">
              FAQ
            </span>
            <h2 className="text-3xl font-bold text-aether-text mt-3">Frequently Asked Questions</h2>
          </div>

          <div className="space-y-4">
            {faqs.map((faq, idx) => {
              const isOpen = activeFaq === idx;
              return (
                <div key={idx} className="bg-white rounded-2xl border border-aether-border overflow-hidden shadow-sm">
                  <button
                    onClick={() => setActiveFaq(isOpen ? null : idx)}
                    className="w-full p-5 text-left font-bold text-sm text-aether-text flex items-center justify-between hover:bg-aether-section/30 transition"
                  >
                    <span>{faq.q}</span>
                    <ChevronDown className={`w-4 h-4 text-aether-subtext transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                  </button>
                  {isOpen && (
                    <div className="p-5 pt-0 text-xs text-aether-subtext leading-relaxed border-t border-aether-border/40">
                      {faq.a}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <Footer />
    </div>
  );
};
