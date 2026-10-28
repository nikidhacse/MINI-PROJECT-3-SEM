import { Router, Response } from 'express';
import { z } from 'zod';
import { verifyAuth, requireActiveOrg, AuthenticatedRequest } from '../middleware/auth';
import { generateDirectImagePrompt, generateEditedImagePrompt } from '../lib/gemini';
import { synthesizeImageWithFlux, PLATFORM_DIMENSIONS } from '../lib/cloudflare';
import { memoryStore } from '../db/memory_store';

const router = Router();

const GenerateSchema = z.object({
  prompt: z.string().min(5, 'Prompt must be at least 5 characters'),
  platform: z.string().default('instagram_square'),
  audience: z.string().optional().default('General consumers'),
  style: z.string().optional().default('editorial photography')
});

const EditSchema = z.object({
  original_prompt: z.string().min(1, 'Original prompt is required'),
  edit_instruction: z.string().min(3, 'Edit instruction must be at least 3 characters'),
  platform: z.string().default('instagram_square'),
  style: z.string().optional().default('editorial photography')
});

// POST /generate (Direct initial generation - does NOT auto-save to library)
router.post('/', verifyAuth, requireActiveOrg, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = GenerateSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        ok: false,
        error: parse.error.errors[0]?.message || 'Invalid generation parameters',
        code: 'VALIDATION_ERROR'
      });
    }

    const orgId = req.user!.org_id!;
    const { prompt, platform, audience, style } = parse.data;
    const dims = PLATFORM_DIMENSIONS[platform] || PLATFORM_DIMENSIONS['instagram_square'] || { width: 1080, height: 1080 };

    let webhookUrl = process.env.N8N_IMAGE_GEN_WEBHOOK_URL || 'https://n8ntwo.app.n8n.cloud/webhook-test/681e02cd-668a-4cfb-ab56-f39c0483a253';

    let n8nImage: string | null = null;
    let n8nData: any = null;
    let webhookStatus: string = 'pending';

    const webhookPayload = {
      event: 'generate_image',
      prompt,
      platform,
      width: dims.width,
      height: dims.height,
      aspect: (dims as any).aspect || '1:1',
      user_id: req.user?.sub,
      user_email: req.user?.email,
      org_id: orgId,
      timestamp: new Date().toISOString()
    };

    const callWebhook = async (url: string) => {
      try {
        console.log(`📡 [n8n Webhook] Transmitting generation inputs to: ${url}`);
        const response = await fetch(url, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Accept': 'application/json, image/*, text/plain',
            'User-Agent': 'AetherDesign-ImageGenerator/1.0'
          },
          body: JSON.stringify(webhookPayload)
        });

        const contentType = response.headers.get('content-type') || '';

        if (response.ok) {
          if (contentType.includes('image/')) {
            const arrayBuffer = await response.arrayBuffer();
            const base64 = Buffer.from(arrayBuffer).toString('base64');
            const mime = contentType.split(';')[0] || 'image/png';
            n8nImage = `data:${mime};base64,${base64}`;
            webhookStatus = 'image_received_binary';
            console.log('✅ [n8n Webhook] Received binary image directly from n8n!');
            return true;
          }

          const rawText = await response.text();
          try {
            const json = JSON.parse(rawText);
            n8nData = json;
            n8nImage = json.image || json.imageUrl || json.image_url || json.url || json.output || json.data || (Array.isArray(json) && json[0]?.image) || null;
            if (n8nImage) {
              webhookStatus = 'image_received_json';
              console.log('✅ [n8n Webhook] Extracted image from n8n JSON response!');
            } else {
              webhookStatus = 'received_payload_ok';
              console.log('✅ [n8n Webhook] Webhook received payload successfully.');
            }
            return true;
          } catch {
            if (rawText.startsWith('data:image/') || rawText.startsWith('http://') || rawText.startsWith('https://')) {
              n8nImage = rawText.trim();
              webhookStatus = 'image_received_url';
              return true;
            }
          }
          return true;
        } else if (response.status === 404 && url.includes('webhook-test')) {
          // If test webhook is not active, try production webhook endpoint
          const prodUrl = url.replace('webhook-test', 'webhook');
          console.log(`ℹ️ [n8n Webhook] Test webhook not listening. Trying production webhook: ${prodUrl}`);
          return await callWebhook(prodUrl);
        } else {
          console.warn(`⚠️ [n8n Webhook] Responded with status ${response.status}`);
          webhookStatus = `http_${response.status}`;
        }
      } catch (err: any) {
        console.warn('⚠️ [n8n Webhook] Connection warning:', err.message);
        webhookStatus = 'network_error';
      }
      return false;
    };

    if (webhookUrl) {
      await callWebhook(webhookUrl);
    }

    // Direct Creator Prompt Enhancement (Text-Free High Aesthetic Diffusion)
    const promptDetails = await generateDirectImagePrompt({
      prompt,
      platform,
      audience,
      style
    });

    // Synthesize visual asset with FLUX diffusion engine or use n8n image if provided
    const synthesisResult = n8nImage
      ? { image: n8nImage, width: dims.width, height: dims.height, isFallback: false }
      : await synthesizeImageWithFlux({
          imagePrompt: promptDetails.image_prompt,
          platform,
          palette: promptDetails.palette,
          mood: promptDetails.mood
        });

    // Record job in transient generation jobs
    const jobId = 'job-' + Math.random().toString(36).substring(2, 10);
    memoryStore.generation_jobs.set(jobId, {
      id: jobId,
      org_id: orgId,
      campaign_id: null,
      brand_kit_id: null,
      prompt,
      refined_prompt: promptDetails.image_prompt,
      status: 'done',
      progress: 100,
      created_by: req.user!.sub,
      created_at: new Date().toISOString()
    });

    return res.status(200).json({
      ok: true,
      error: null,
      prompt,
      image_prompt: promptDetails.image_prompt,
      platform,
      style: style || 'editorial photography',
      image: synthesisResult.image,
      gen_width: synthesisResult.width,
      gen_height: synthesisResult.height,
      webhook_triggered: true,
      n8n_data: n8nData,
      understanding: {
        intent: promptDetails.intent,
        subject: promptDetails.subject,
        composition: promptDetails.composition,
        palette: promptDetails.palette,
        mood: promptDetails.mood,
        avoid: promptDetails.avoid,
        image_prompt: promptDetails.image_prompt,
        negative_prompt: promptDetails.negative_prompt
      }
    });
  } catch (err: any) {
    console.error('Generation pipeline failed:', err);
    return res.status(500).json({
      ok: false,
      error: err.message || 'Image generation failed',
      code: 'GENERATION_ERROR'
    });
  }
});

// POST /generate/edit (Edit created image with prompt)
router.post('/edit', verifyAuth, requireActiveOrg, async (req: AuthenticatedRequest, res: Response) => {
  try {
    const parse = EditSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({
        ok: false,
        error: parse.error.errors[0]?.message || 'Invalid edit parameters',
        code: 'VALIDATION_ERROR'
      });
    }

    const orgId = req.user!.org_id!;
    const { original_prompt, edit_instruction, platform, style } = parse.data;

    // Prompt engineer the edit modifications
    const promptDetails = await generateEditedImagePrompt({
      originalPrompt: original_prompt,
      editInstruction: edit_instruction,
      platform,
      style
    });

    // Synthesize updated image
    const synthesisResult = await synthesizeImageWithFlux({
      imagePrompt: promptDetails.image_prompt,
      platform,
      palette: promptDetails.palette,
      mood: promptDetails.mood
    });

    return res.status(200).json({
      ok: true,
      error: null,
      prompt: original_prompt,
      edit_instruction,
      image_prompt: promptDetails.image_prompt,
      platform,
      style: style || 'editorial photography',
      image: synthesisResult.image,
      gen_width: synthesisResult.width,
      gen_height: synthesisResult.height,
      understanding: {
        intent: promptDetails.intent,
        subject: promptDetails.subject,
        composition: promptDetails.composition,
        palette: promptDetails.palette,
        mood: promptDetails.mood,
        avoid: promptDetails.avoid,
        image_prompt: promptDetails.image_prompt,
        negative_prompt: promptDetails.negative_prompt
      }
    });
  } catch (err: any) {
    console.error('Image edit pipeline failed:', err);
    return res.status(500).json({
      ok: false,
      error: err.message || 'Image modification failed',
      code: 'GENERATION_ERROR'
    });
  }
});

export default router;
