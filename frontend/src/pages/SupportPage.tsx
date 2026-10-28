import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { HelpCircle, Send, CheckCircle2, MessageSquare, ChevronDown, Mail, ShieldCheck } from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { ApiClient } from '../services/api';
import toast from 'react-hot-toast';

export const SupportPage: React.FC = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [topic, setTopic] = useState('generation');
  const [subject, setSubject] = useState('');
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);
  const [submittedId, setSubmittedId] = useState<string | null>(null);
  const [activeFaq, setActiveFaq] = useState<number | null>(0);

  const topics = [
    { value: 'generation', label: 'AI Image Generation & FLUX' },
    { value: 'editing', label: 'Design Studio & Live Typography' },
    { value: 'campaigns', label: 'Campaigns & Approvals Workflow' },
    { value: 'account', label: 'Account, Roles & Workspaces' },
    { value: 'billing', label: 'Plans & Billing' },
    { value: 'publishing', label: 'Social & Instagram Publishing' },
    { value: 'other', label: 'General / Other Support' }
  ];

  const faqs = [
    {
      q: 'Why does the AI diffusion model not render readable words?',
      a: 'Modern diffusion models (including FLUX-1-schnell) produce inconsistent or distorted text. By isolating visual art generation to the diffusion model, AetherDesign guarantees 100% legibility and precise brand typography using our live vector text editor in Design Studio.'
    },
    {
      q: 'Why do Story (9:16) and Hero (8:3) formats look softer?',
      a: 'Generation dimensions are carefully chosen per platform preset to preserve the target aspect ratio while maintaining optimal speed near one megapixel.'
    },
    {
      q: 'How does Brand Guidelines RAG work?',
      a: 'When you upload or paste your guidelines in Brand Kit, we parse the text, generate 256-dimensional embeddings, and use a dual confidence test (gap >= 0.03 OR top >= 0.85) to pull verified rules into every creative brief.'
    },
    {
      q: 'Can I invite clients or external approvers?',
      a: 'Yes. With Pro and Enterprise plans, organizations can assign users with the Approver role to review, comment on, and approve or reject assets without modifying the core campaign.'
    }
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const res = await ApiClient.submitTicket({
        name,
        email,
        topic,
        subject,
        message
      });
      setSubmittedId(res.ticket_id);
      toast.success('Support ticket submitted successfully!');
    } catch (err: any) {
      toast.error('Failed to submit ticket');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col">
      <Navbar />

      <main className="flex-1 max-w-6xl mx-auto px-6 py-12 w-full">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12">
          <span className="px-3.5 py-1.5 rounded-full bg-aether-section text-aether-primary font-bold text-xs uppercase tracking-wider">
            Help Center & Support
          </span>
          <h1 className="text-3xl sm:text-4xl font-extrabold text-aether-text mt-3">
            How Can We Assist You?
          </h1>
          <p className="text-xs text-aether-subtext mt-2">
            Browse our knowledge base or submit a direct ticket to our engineering and support team.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          {/* Left: Ticket Form */}
          <div className="lg:col-span-7 glass-panel bg-white p-8 rounded-3xl border border-aether-border shadow-lavender-sm">
            {submittedId ? (
              <div className="text-center py-10 space-y-4">
                <div className="w-14 h-14 rounded-full bg-emerald-100 text-emerald-600 flex items-center justify-center mx-auto">
                  <CheckCircle2 className="w-8 h-8" />
                </div>
                <h3 className="text-xl font-bold text-aether-text">Ticket #{submittedId} Received</h3>
                <p className="text-xs text-aether-subtext max-w-md mx-auto leading-relaxed">
                  Our technical operations team has logged your inquiry and will respond to <strong className="text-aether-text">{email}</strong> shortly.
                </p>
                <button
                  onClick={() => {
                    setSubmittedId(null);
                    setSubject('');
                    setMessage('');
                  }}
                  className="mt-4 px-6 py-2.5 rounded-2xl bg-aether-primary text-white text-xs font-bold shadow-lavender-sm hover:bg-aether-hover transition"
                >
                  Submit Another Ticket
                </button>
              </div>
            ) : (
              <div>
                <div className="flex items-center space-x-3 mb-6">
                  <div className="w-10 h-10 rounded-2xl bg-aether-light flex items-center justify-center text-aether-primary">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-aether-text">Submit Support Ticket</h3>
                    <p className="text-xs text-aether-subtext">Open a direct ticket with our product specialists</p>
                  </div>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                        Your Name
                      </label>
                      <input
                        type="text"
                        required
                        value={name}
                        onChange={(e) => setName(e.target.value)}
                        placeholder="Sophia Chen"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                        Email Address
                      </label>
                      <input
                        type="email"
                        required
                        value={email}
                        onChange={(e) => setEmail(e.target.value)}
                        placeholder="sophia@company.com"
                        className="w-full px-3.5 py-2.5 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                      Topic Area
                    </label>
                    <select
                      value={topic}
                      onChange={(e) => setTopic(e.target.value)}
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-semibold"
                    >
                      {topics.map(t => (
                        <option key={t.value} value={t.value}>{t.label}</option>
                      ))}
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                      Subject
                    </label>
                    <input
                      type="text"
                      required
                      value={subject}
                      onChange={(e) => setSubject(e.target.value)}
                      placeholder="e.g. Question regarding brand guidelines confidence score"
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-aether-text uppercase tracking-wider mb-1.5">
                      Detailed Message
                    </label>
                    <textarea
                      rows={4}
                      required
                      value={message}
                      onChange={(e) => setMessage(e.target.value)}
                      placeholder="Please explain the issue or question..."
                      className="w-full px-3.5 py-2.5 rounded-2xl bg-aether-bg/60 border border-aether-border text-xs focus:outline-none focus:border-aether-primary text-aether-text font-medium"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-3 px-4 rounded-2xl bg-aether-primary text-white font-bold text-xs shadow-lavender-sm hover:bg-aether-hover transition flex items-center justify-center space-x-2"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>{loading ? 'Submitting Ticket...' : 'Submit Support Request'}</span>
                  </button>
                </form>
              </div>
            )}
          </div>

          {/* Right: Knowledge Base FAQ */}
          <div className="lg:col-span-5 space-y-4">
            <div className="p-6 bg-white rounded-3xl border border-aether-border shadow-sm">
              <h3 className="text-base font-bold text-aether-text mb-4 flex items-center space-x-2">
                <HelpCircle className="w-4 h-4 text-aether-primary" />
                <span>Frequently Answered</span>
              </h3>

              <div className="space-y-3">
                {faqs.map((faq, idx) => {
                  const isOpen = activeFaq === idx;
                  return (
                    <div key={idx} className="border border-aether-border/70 rounded-2xl overflow-hidden">
                      <button
                        onClick={() => setActiveFaq(isOpen ? null : idx)}
                        className="w-full p-3.5 text-left text-xs font-bold text-aether-text flex items-center justify-between hover:bg-aether-section/40 transition"
                      >
                        <span>{faq.q}</span>
                        <ChevronDown className={`w-3.5 h-3.5 text-aether-subtext shrink-0 transition-transform ${isOpen ? 'rotate-180' : ''}`} />
                      </button>
                      {isOpen && (
                        <div className="p-3.5 pt-0 text-[11px] text-aether-subtext leading-relaxed border-t border-aether-border/40">
                          {faq.a}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="p-6 bg-gradient-to-br from-aether-light to-white rounded-3xl border border-aether-border text-center space-y-2">
              <ShieldCheck className="w-6 h-6 text-aether-primary mx-auto" />
              <h4 className="text-xs font-bold text-aether-text">Enterprise SLA Guarantee</h4>
              <p className="text-[11px] text-aether-subtext">
                Pro and Enterprise tier users receive guaranteed 1-hour priority support response times.
              </p>
            </div>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
};
