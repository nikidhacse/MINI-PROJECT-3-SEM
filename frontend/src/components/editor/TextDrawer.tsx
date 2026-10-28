import React from 'react';
import { Type, Sparkles, Flame, Star, Tag, Quote, ShieldCheck } from 'lucide-react';
import { TextElement } from '../../types/editor';
import toast from 'react-hot-toast';

interface TextDrawerProps {
  onAddText: (preset: Partial<TextElement>) => void;
}

export const TextDrawer: React.FC<TextDrawerProps> = ({ onAddText }) => {
  return (
    <div className="space-y-5">
      <div>
        <h3 className="text-sm font-bold text-aether-text">Typography &amp; Headings</h3>
        <p className="text-[11px] text-aether-subtext">Click any preset to add live vector text</p>
      </div>

      {/* Primary Basic Text Blocks */}
      <div className="space-y-2">
        <button
          onClick={() => {
            onAddText({
              name: 'Heading',
              content: 'ADD A HEADING',
              fontSize: 52,
              fontFamily: 'Poppins',
              fontWeight: '800',
              color: '#FFFFFF',
              alignment: 'center',
              effect: 'shadow',
              width: 500,
              height: 70,
            });
            toast.success('Added Heading');
          }}
          className="w-full p-4 rounded-2xl bg-aether-bg hover:bg-aether-light border border-aether-border/80 text-left transition group shadow-sm"
        >
          <span className="text-xl font-extrabold text-aether-text block group-hover:text-aether-primary transition">
            Add a Heading
          </span>
          <span className="text-[10px] text-aether-subtext">Bold high-impact primary headline</span>
        </button>

        <button
          onClick={() => {
            onAddText({
              name: 'Subheading',
              content: 'Add a captivating subheading',
              fontSize: 26,
              fontFamily: 'Poppins',
              fontWeight: '600',
              color: '#F3F0FF',
              alignment: 'center',
              effect: 'glow',
              width: 440,
              height: 45,
            });
            toast.success('Added Subheading');
          }}
          className="w-full p-3.5 rounded-2xl bg-aether-bg hover:bg-aether-light border border-aether-border/80 text-left transition group shadow-sm"
        >
          <span className="text-sm font-bold text-aether-text block group-hover:text-aether-primary transition">
            Add a Subheading
          </span>
          <span className="text-[10px] text-aether-subtext">Medium secondary callout text</span>
        </button>

        <button
          onClick={() => {
            onAddText({
              name: 'Body Paragraph',
              content: 'Your engaging narrative marketing copy and product details go right here.',
              fontSize: 16,
              fontFamily: 'Inter',
              fontWeight: '400',
              color: '#E9D5FF',
              alignment: 'center',
              effect: 'none',
              width: 420,
              height: 50,
            });
            toast.success('Added Body Text');
          }}
          className="w-full p-3 rounded-2xl bg-aether-bg hover:bg-aether-light border border-aether-border/80 text-left transition group shadow-sm"
        >
          <span className="text-xs font-normal text-aether-text block group-hover:text-aether-primary transition">
            Add a little bit of body text
          </span>
          <span className="text-[10px] text-aether-subtext">Standard paragraph description copy</span>
        </button>
      </div>

      {/* Styled Font Combinations / Badges */}
      <div className="space-y-2 pt-2">
        <h4 className="text-xs font-bold text-aether-text flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-aether-primary" />
          <span>Curated Font Pairings &amp; Styles</span>
        </h4>

        {/* 1. Neon Cyberpunk */}
        <button
          onClick={() => {
            onAddText({
              name: 'Cyberpunk Neon',
              content: 'CYBERPUNK 2088',
              fontSize: 46,
              fontFamily: 'Space Grotesk',
              fontWeight: '800',
              color: '#06B6D4',
              effect: 'neon',
              letterSpacing: 4,
              alignment: 'center',
              width: 460,
              height: 60,
            });
            toast.success('Added Neon Cyberpunk');
          }}
          className="w-full p-3 rounded-2xl bg-[#0F172A] border border-cyan-500/40 hover:border-cyan-400 text-left transition flex items-center justify-between"
        >
          <div>
            <span className="text-sm font-extrabold text-cyan-400 tracking-widest block drop-shadow-[0_0_8px_rgba(6,182,212,0.8)]">
              CYBERPUNK 2088
            </span>
            <span className="text-[9px] text-cyan-200/60">Space Grotesk &bull; Neon Glow</span>
          </div>
          <Sparkles className="w-4 h-4 text-cyan-400" />
        </button>

        {/* 2. Luxury Editorial Serif */}
        <button
          onClick={() => {
            onAddText({
              name: 'Luxury Serif',
              content: 'The Haute Collection',
              fontSize: 38,
              fontFamily: 'Playfair Display',
              fontWeight: '600',
              fontStyle: 'italic',
              color: '#FDE047',
              effect: 'shadow',
              alignment: 'center',
              width: 440,
              height: 55,
            });
            toast.success('Added Luxury Serif');
          }}
          className="w-full p-3 rounded-2xl bg-gradient-to-r from-amber-950 to-stone-900 border border-amber-500/30 hover:border-amber-400 text-left transition flex items-center justify-between"
        >
          <div>
            <span className="text-sm font-serif italic text-amber-200 block">
              The Haute Collection
            </span>
            <span className="text-[9px] text-amber-300/60">Playfair Display &bull; Gold Shadow</span>
          </div>
          <Star className="w-4 h-4 text-amber-300" />
        </button>

        {/* 3. Flash Sale Burst */}
        <button
          onClick={() => {
            onAddText({
              name: 'Flash Sale Tag',
              content: '50% OFF FLASH SALE',
              fontSize: 24,
              fontFamily: 'Bebas Neue',
              fontWeight: '400',
              color: '#FFFFFF',
              backgroundColor: '#EF4444',
              alignment: 'center',
              letterSpacing: 2,
              effect: 'lift',
              width: 280,
              height: 46,
            });
            toast.success('Added Flash Sale Tag');
          }}
          className="w-full p-3 rounded-2xl bg-red-50 hover:bg-red-100 border border-red-200 text-left transition flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-black tracking-wider px-2 py-0.5 rounded bg-red-600 text-white inline-block">
              50% OFF FLASH SALE
            </span>
            <span className="text-[9px] text-red-600/80 block mt-1">Bebas Neue &bull; Red Highlight</span>
          </div>
          <Flame className="w-4 h-4 text-red-500" />
        </button>

        {/* 4. Glassmorphic Announcement Pill */}
        <button
          onClick={() => {
            onAddText({
              name: 'Glass Pill',
              content: 'NEW FEATURE RELEASE',
              fontSize: 16,
              fontFamily: 'Poppins',
              fontWeight: '700',
              color: '#8B5CF6',
              effect: 'glass',
              letterSpacing: 2,
              alignment: 'center',
              width: 280,
              height: 42,
            });
            toast.success('Added Glass Pill');
          }}
          className="w-full p-3 rounded-2xl bg-aether-light/70 hover:bg-aether-light border border-aether-primary/30 text-left transition flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-bold text-aether-primary tracking-widest block">
              NEW FEATURE RELEASE
            </span>
            <span className="text-[9px] text-aether-subtext">Glassmorphism &bull; Pill Format</span>
          </div>
          <ShieldCheck className="w-4 h-4 text-aether-primary" />
        </button>

        {/* 5. Elegant Quote */}
        <button
          onClick={() => {
            onAddText({
              name: 'Inspirational Quote',
              content: '"Design is intelligence made visible."',
              fontSize: 22,
              fontFamily: 'Montserrat',
              fontWeight: '300',
              fontStyle: 'italic',
              color: '#FFFFFF',
              effect: 'shadow',
              alignment: 'center',
              width: 440,
              height: 50,
            });
            toast.success('Added Quote');
          }}
          className="w-full p-3 rounded-2xl bg-aether-bg hover:bg-aether-light border border-aether-border text-left transition flex items-center justify-between"
        >
          <div>
            <span className="text-xs font-light italic text-aether-text block">
              "Design is intelligence made visible."
            </span>
            <span className="text-[9px] text-aether-subtext">Montserrat &bull; Clean Quote</span>
          </div>
          <Quote className="w-4 h-4 text-aether-subtext" />
        </button>
      </div>
    </div>
  );
};
