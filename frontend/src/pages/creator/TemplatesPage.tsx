import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';
import { LayoutTemplate, Search, Sparkles, Paintbrush, Instagram, ArrowRight } from 'lucide-react';
import { Navbar } from '../../components/layout/Navbar';
import { Sidebar } from '../../components/layout/Sidebar';
import { SupportChat } from '../../components/layout/SupportChat';
import { CaptionsModal } from '../../components/modals/CaptionsModal';
import { ApiClient } from '../../services/api';

export const TemplatesPage: React.FC = () => {
  const navigate = useNavigate();
  const [templates, setTemplates] = useState<any[]>([]);
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [loading, setLoading] = useState(true);
  const [captionTemplate, setCaptionTemplate] = useState<any | null>(null);

  const categories = ['All', 'Social Media', 'Banner', 'Poster', 'Logo', 'Presentation', 'Business', 'Marketing'];

  useEffect(() => {
    fetchTemplates();
  }, []);

  const fetchTemplates = async () => {
    setLoading(true);
    try {
      const res = await ApiClient.getResource('templates');
      if (res.data && Array.isArray(res.data)) {
        setTemplates(res.data);
      }
    } catch (err) {
      console.warn('Could not fetch templates:', err);
    } finally {
      setLoading(false);
    }
  };

  const filtered = templates.filter(t => {
    const matchesCat = selectedCategory === 'All' || t.category === selectedCategory;
    const matchesQuery = !searchQuery || t.title.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const handleUseTemplate = (tpl: any) => {
    navigate('/creator/editor', {
      state: {
        templateSpec: tpl.spec,
        assetTitle: tpl.title,
        backdropImage: tpl.preview_path
      }
    });
  };

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <div className="flex-1 flex">
        <Sidebar />

        <main className="flex-1 p-6 lg:p-10 max-w-7xl mx-auto w-full overflow-y-auto">
          {/* Header */}
          <div className="mb-8 flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div>
              <span className="text-xs font-bold uppercase tracking-wider text-aether-primary">
                Creative Accelerators
              </span>
              <h1 className="text-2xl sm:text-3xl font-extrabold text-aether-text mt-1">
                Template Gallery
              </h1>
              <p className="text-xs text-aether-subtext mt-1">
                Pre-configured multi-channel layouts with customizable vector typography and brand swatches.
              </p>
            </div>

            {/* Search Bar */}
            <div className="relative w-full md:w-72">
              <Search className="w-4 h-4 text-aether-subtext absolute left-3.5 top-3.5" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search templates..."
                className="w-full pl-10 pr-4 py-2.5 rounded-2xl bg-white border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium shadow-sm"
              />
            </div>
          </div>

          {/* Category Tabs */}
          <div className="flex overflow-x-auto pb-2 space-x-2 mb-8">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategory(cat)}
                className={`px-4 py-2 rounded-2xl text-xs font-bold whitespace-nowrap transition ${
                  selectedCategory === cat
                    ? 'bg-aether-primary text-white shadow-lavender-sm'
                    : 'bg-white border border-aether-border text-aether-subtext hover:text-aether-text'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Templates Grid */}
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {[1, 2, 3, 4].map(n => (
                <div key={n} className="h-72 bg-white rounded-3xl animate-pulse border border-aether-border/60" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="glass-panel bg-white p-12 rounded-3xl border border-aether-border text-center space-y-3">
              <LayoutTemplate className="w-10 h-10 text-aether-primary mx-auto" />
              <h3 className="text-base font-bold text-aether-text">No templates found in this category</h3>
              <p className="text-xs text-aether-subtext">Try changing your search terms or view All templates.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
              {filtered.map((tpl) => (
                <div
                  key={tpl.id}
                  className="glass-panel bg-white rounded-3xl border border-aether-border overflow-hidden card-hover shadow-lavender-sm flex flex-col justify-between group"
                >
                  <div className="aspect-[4/3] bg-aether-bg relative overflow-hidden flex items-center justify-center">
                    {tpl.preview_path ? (
                      <img
                        src={tpl.preview_path}
                        alt={tpl.title}
                        className="w-full h-full object-cover group-hover:scale-105 transition duration-500"
                      />
                    ) : (
                      <div className="w-full h-full bg-gradient-to-br from-aether-light to-purple-100 flex items-center justify-center text-aether-primary">
                        <Sparkles className="w-8 h-8" />
                      </div>
                    )}
                    <span className="absolute top-3 left-3 px-2.5 py-0.5 rounded-full bg-white/90 backdrop-blur-md text-aether-text font-bold text-[10px] uppercase shadow-sm">
                      {tpl.category}
                    </span>
                  </div>

                  <div className="p-5 flex flex-col justify-between flex-1">
                    <div>
                      <h3 className="font-bold text-sm text-aether-text truncate mb-1">{tpl.title}</h3>
                      <p className="text-[11px] text-aether-subtext mb-4">Vector typography layered preset</p>
                    </div>

                    <div className="space-y-2">
                      <button
                        onClick={() => handleUseTemplate(tpl)}
                        className="w-full py-2.5 px-3 rounded-2xl bg-aether-section hover:bg-aether-primary hover:text-white text-aether-primary text-xs font-bold transition flex items-center justify-center space-x-1.5"
                      >
                        <Paintbrush className="w-3.5 h-3.5" />
                        <span>Customize in Editor</span>
                      </button>

                      <button
                        onClick={() => setCaptionTemplate(tpl)}
                        className="w-full py-2.5 px-3 rounded-2xl bg-gradient-to-r from-pink-500/10 via-purple-500/10 to-indigo-500/10 hover:from-pink-500 hover:via-purple-600 hover:to-indigo-600 text-pink-600 hover:text-white border border-pink-200/70 hover:border-transparent text-xs font-bold transition flex items-center justify-center space-x-1.5 shadow-sm"
                      >
                        <Instagram className="w-3.5 h-3.5" />
                        <span>Create Instagram Post</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </main>
      </div>

      <SupportChat />

      <CaptionsModal
        isOpen={!!captionTemplate}
        onClose={() => setCaptionTemplate(null)}
        assetPrompt={captionTemplate?.title ? `${captionTemplate.title} - ${captionTemplate.category || 'Post'}` : 'Social media post'}
        assetImageUrl={captionTemplate?.preview_path}
      />
    </div>
  );
};
