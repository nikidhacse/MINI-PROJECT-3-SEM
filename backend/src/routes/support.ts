import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generateSupportResponse } from '../lib/gemini';
import { memoryStore } from '../db/memory_store';
import { verifyAuth, AuthenticatedRequest } from '../middleware/auth';

const router = Router();

const ChatSchema = z.object({
  messages: z.array(z.object({
    role: z.enum(['user', 'assistant']),
    content: z.string()
  })),
  role: z.string().optional().default('designer'),
  plan: z.string().optional().default('free'),
  currentPage: z.string().optional().default('/creator/generator')
});

const TicketSchema = z.object({
  email: z.string().email(),
  name: z.string().min(2),
  topic: z.enum(['generation', 'editing', 'campaigns', 'account', 'billing', 'publishing', 'other']).default('other'),
  subject: z.string().min(3),
  message: z.string().min(5),
  chat_transcript: z.any().optional()
});

// POST /support/chat
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const parse = ChatSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Valid messages array required', code: 'VALIDATION_ERROR' });
    }

    const { messages, role, plan, currentPage } = parse.data;
    const response = await generateSupportResponse({ messages, role, plan, currentPage });

    return res.status(200).json({
      reply: response.reply,
      should_escalate: response.shouldEscalate
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Support chatbot error', code: 'SERVER_ERROR' });
  }
});

// POST /support/ticket
router.post('/ticket', async (req: Request, res: Response) => {
  try {
    const parse = TicketSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'All ticket fields are required', code: 'VALIDATION_ERROR' });
    }

    const data = parse.data;
    const ticketId = 'tkt-' + Math.random().toString(36).substring(2, 10);
    const ticket = {
      id: ticketId,
      org_id: null,
      user_id: null,
      email: data.email,
      name: data.name,
      topic: data.topic,
      subject: data.subject,
      message: data.message,
      status: 'open',
      chat_transcript: data.chat_transcript || null,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };

    memoryStore.support_tickets.set(ticketId, ticket);

    return res.status(201).json({
      success: true,
      ticket_id: ticketId,
      message: 'Support ticket successfully submitted. Our team will contact you shortly.'
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to create ticket', code: 'SERVER_ERROR' });
  }
});

export default router;
