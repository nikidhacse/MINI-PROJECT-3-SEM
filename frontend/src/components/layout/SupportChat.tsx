import React, { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { MessageSquare, X, Send, Sparkles, AlertCircle, ArrowUpRight, HelpCircle } from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { ApiClient } from '../../services/api';
import { useLocation, useNavigate } from 'react-router-dom';
import toast from 'react-hot-toast';

export const SupportChat: React.FC = () => {
  const { user, activeOrg, status } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();

  const [isOpen, setIsOpen] = useState(false);
  const [messages, setMessages] = useState<Array<{ role: 'user' | 'assistant'; content: string }>>([
    {
      role: 'assistant',
      content: "Hello! I am your AetherDesign AI assistant. How can I help you with brand guidelines, AI generation, or editor workflows today?"
    }
  ]);
  const [input, setInput] = useState('');
  const [loading, setLoading] = useState(false);
  const [canEscalate, setCanEscalate] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const suggestionChips = [
    "Why is there no text in generated images?",
    "How do I add brand guidelines?",
    "Why was my brand rule ignored?",
    "How do I submit an asset for approval?"
  ];

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages, isOpen]);

  if (status !== 'ready' && status !== 'needs_onboarding') {
    return null;
  }

  const handleSend = async (textToSend?: string) => {
    const queryText = (textToSend || input).trim();
    if (!queryText || loading) return;

    const newMessages = [...messages, { role: 'user' as const, content: queryText }];
    setMessages(newMessages);
    setInput('');
    setLoading(true);

    try {
      const res = await ApiClient.chatSupport({
        messages: newMessages.slice(-10),
        role: activeOrg?.role || 'designer',
        plan: activeOrg?.plan || 'free',
        currentPage: location.pathname
      });

      setMessages(prev => [...prev, { role: 'assistant', content: res.reply }]);
      if (res.should_escalate) {
        setCanEscalate(true);
      }
    } catch (err) {
      // Smart contextual fallback when backend server is restarting or offline
      const lower = queryText.toLowerCase();
      let fallbackReply = "I'm having trouble reaching the live AI support server, but here is some quick guidance:";

      if (lower.includes('no text') || lower.includes('without text') || lower.includes('letters')) {
        fallbackReply = "Generated diffusion images are intentionally created without embedded text to avoid garbled or distorted lettering. You can now add, style, and edit crisp vector typography, logos, and shapes directly over your visual inside the Canva-like Design Studio!";
      } else if (lower.includes('brand guideline') || lower.includes('add brand') || lower.includes('brand kit')) {
        fallbackReply = "You can add and manage brand rules under the 'Brand Kit' section in the Business portal. Upload your PDF, DOCX, or text guidelines to automatically enforce brand colors, typography, and tone.";
      } else if (lower.includes('rule ignored') || lower.includes('guideline ignored') || lower.includes('not following')) {
        fallbackReply = "If a brand rule was not reflected in your visual, the retrieval confidence for that query may have been low. Ensure your prompt includes clear subject keywords and that your Brand Kit contains detailed instructions for that topic.";
      } else if (lower.includes('approval') || lower.includes('submit')) {
        fallbackReply = "To submit an asset for review, open your asset in the Asset Vault or Campaigns page and click 'Submit for Approval'. Reviewers on your team will be notified to approve or provide feedback.";
      } else if (lower.includes('edit') || lower.includes('canva') || lower.includes('studio')) {
        fallbackReply = "In the Design Studio, you can insert uploaded photos, add Google Fonts typography, draw shapes, adjust photo lighting filters, and export high-resolution PNG, JPG, or WebP files!";
      } else {
        fallbackReply = "I'm currently unable to reach the backend support server. You can file a support ticket below or check your connection.";
      }

      setMessages(prev => [
        ...prev,
        { role: 'assistant', content: fallbackReply }
      ]);
      setCanEscalate(true);
    } finally {
      setLoading(false);
    }
  };

  const handleEscalateToTicket = async () => {
    try {
      await ApiClient.submitTicket({
        name: user?.full_name || 'Creator User',
        email: user?.email || 'user@aetherdesign.io',
        topic: 'generation',
        subject: `Assistance requested from ${location.pathname}`,
        message: `Chat transcript:\n${messages.map(m => `${m.role.toUpperCase()}: ${m.content}`).join('\n')}`,
        chat_transcript: messages
      });
      toast.success('Support ticket created with your chat history!');
      setIsOpen(false);
      navigate('/support');
    } catch (err) {
      toast.error('Failed to submit ticket automatically');
      navigate('/support');
    }
  };

  return (
    <div className="fixed bottom-6 right-6 z-50">
      {/* Floating Toggle Button */}
      {!isOpen && (
        <motion.button
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
          onClick={() => setIsOpen(true)}
          className="w-14 h-14 rounded-full bg-gradient-to-tr from-aether-primary to-purple-600 text-white flex items-center justify-center shadow-lavender-lg hover:shadow-lavender-md transition relative group"
        >
          <MessageSquare className="w-6 h-6" />
          <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-emerald-400 border-2 border-white flex items-center justify-center text-[9px] font-bold text-emerald-900 animate-pulse">
            AI
          </span>
        </motion.button>
      )}

      {/* Chat Window */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.9, y: 20 }}
            className="w-96 max-w-[calc(100vw-2rem)] h-[520px] bg-white rounded-3xl shadow-lavender-lg border border-aether-border flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="p-4 bg-gradient-to-r from-aether-primary to-purple-700 text-white flex items-center justify-between">
              <div className="flex items-center space-x-2.5">
                <div className="w-8 h-8 rounded-xl bg-white/20 flex items-center justify-center">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="font-bold text-sm">Aether Assistant</h3>
                  <p className="text-[10px] text-purple-200">Creative support & guidance</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-1.5 rounded-full hover:bg-white/20 transition text-white/90"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Message Feed */}
            <div ref={scrollRef} className="flex-1 p-4 overflow-y-auto space-y-3 bg-aether-bg/40">
              {messages.map((m, idx) => (
                <div
                  key={idx}
                  className={`flex ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[82%] p-3 rounded-2xl text-xs leading-relaxed ${
                      m.role === 'user'
                        ? 'bg-aether-primary text-white rounded-br-none shadow-lavender-sm'
                        : 'bg-white text-aether-text border border-aether-border/80 rounded-bl-none shadow-sm'
                    }`}
                  >
                    {m.content}
                  </div>
                </div>
              ))}

              {loading && (
                <div className="flex justify-start">
                  <div className="bg-white border border-aether-border p-3 rounded-2xl rounded-bl-none flex items-center space-x-1.5">
                    <span className="w-2 h-2 rounded-full bg-aether-primary animate-bounce" />
                    <span className="w-2 h-2 rounded-full bg-aether-primary animate-bounce [animation-delay:0.2s]" />
                    <span className="w-2 h-2 rounded-full bg-aether-primary animate-bounce [animation-delay:0.4s]" />
                  </div>
                </div>
              )}
            </div>

            {/* Quick Suggestion Chips */}
            {messages.length < 3 && (
              <div className="p-2 border-t border-aether-border/40 bg-white flex flex-wrap gap-1.5">
                {suggestionChips.slice(0, 2).map((chip, idx) => (
                  <button
                    key={idx}
                    onClick={() => handleSend(chip)}
                    className="px-2.5 py-1 rounded-full bg-aether-light border border-aether-border/60 text-[10px] font-semibold text-aether-primary hover:bg-aether-section transition"
                  >
                    {chip}
                  </button>
                ))}
              </div>
            )}

            {/* Escalation Option */}
            {canEscalate && (
              <div className="p-2 bg-purple-50 border-t border-purple-100 flex items-center justify-between text-xs px-3">
                <span className="text-purple-800 text-[11px] font-medium">Need human assistance?</span>
                <button
                  onClick={handleEscalateToTicket}
                  className="px-2.5 py-1 rounded-lg bg-aether-primary text-white font-bold text-[10px] flex items-center space-x-1 hover:bg-aether-hover transition"
                >
                  <span>Create Ticket</span>
                  <ArrowUpRight className="w-3 h-3" />
                </button>
              </div>
            )}

            {/* Input Bar */}
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSend();
              }}
              className="p-3 bg-white border-t border-aether-border flex items-center space-x-2"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask about brand rules or generator..."
                className="flex-1 px-3.5 py-2 rounded-2xl bg-aether-section/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text placeholder:text-aether-subtext/60"
              />
              <button
                type="submit"
                disabled={loading || !input.trim()}
                className="p-2.5 rounded-2xl bg-aether-primary text-white disabled:opacity-40 hover:bg-aether-hover transition shadow-lavender-sm"
              >
                <Send className="w-3.5 h-3.5" />
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
