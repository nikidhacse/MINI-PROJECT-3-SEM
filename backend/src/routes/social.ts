import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { generateSocialCaptions } from '../lib/gemini';

const router = Router();

const CaptionsSchema = z.object({
  prompt: z.string().min(2),
  brandName: z.string().optional(),
  tone: z.string().optional(),
  wordCount: z.union([z.number(), z.string()]).optional(),
  format: z.string().optional()
});

const PostInstagramSchema = z.object({
  imageUrl: z.string().min(5),
  caption: z.string().min(1),
  accountName: z.string().optional().default('@i_teddy_bear_07')
});

// Helper: Ensure we have a publicly accessible HTTPS image URL for Instagram Graph API
async function ensurePublicImageUrl(imageUrl: string): Promise<string> {
  if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
    return imageUrl;
  }

  // If image is a base64 Data URI, upload to Supabase public storage bucket
  const supabaseUrl = process.env.SUPABASE_URL || 'https://gtkfpukurxzjcresambk.supabase.co';
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY || '';

  try {
    const matches = imageUrl.match(/^data:([A-Za-z-+\/]+);base64,(.+)$/);
    let buffer: Buffer;
    let mimeType = 'image/jpeg';
    let ext = 'jpg';

    if (matches && matches.length === 3) {
      mimeType = matches[1];
      buffer = Buffer.from(matches[2], 'base64');
      if (mimeType.includes('png')) ext = 'png';
      else if (mimeType.includes('webp')) ext = 'webp';
    } else {
      buffer = Buffer.from(imageUrl.replace(/^data:image\/\w+;base64,/, ''), 'base64');
    }

    const fileName = `ig-publish-${Date.now()}-${Math.random().toString(36).substring(2, 8)}.${ext}`;
    const filePath = `instagram-posts/${fileName}`;

    const uploadRes = await fetch(`${supabaseUrl}/storage/v1/object/brand-assets/${filePath}`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${serviceKey}`,
        'apikey': serviceKey,
        'Content-Type': mimeType,
        'x-upsert': 'true'
      },
      body: buffer
    });

    if (uploadRes.ok) {
      const publicUrl = `${supabaseUrl}/storage/v1/object/public/brand-assets/${filePath}`;
      console.log(`✅ [Instagram Storage] Converted base64 image to public URL: ${publicUrl}`);
      return publicUrl;
    } else {
      console.warn(`⚠️ [Instagram Storage] Supabase upload returned ${uploadRes.status}: ${await uploadRes.text()}`);
    }
  } catch (err: any) {
    console.warn(`⚠️ [Instagram Storage] Failed to convert base64 image:`, err.message);
  }

  return imageUrl;
}

// POST /social/captions
router.post('/captions', async (req: Request, res: Response) => {
  try {
    const parse = CaptionsSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Valid prompt is required', code: 'VALIDATION_ERROR' });
    }

    const { prompt, brandName, tone, wordCount, format } = parse.data;
    const variants = await generateSocialCaptions({ prompt, brandName, tone, wordCount, format });

    return res.status(200).json({
      success: true,
      variants
    });
  } catch (err: any) {
    return res.status(500).json({ error: 'Failed to generate captions', code: 'SERVER_ERROR' });
  }
});

// POST /social/post-instagram (Executes full Instagram Graph API 2-step publish workflow)
router.post('/post-instagram', async (req: Request, res: Response) => {
  try {
    const parse = PostInstagramSchema.safeParse(req.body);
    if (!parse.success) {
      return res.status(400).json({ error: 'Image URL and Caption are required', code: 'VALIDATION_ERROR' });
    }

    const { imageUrl: rawImageUrl, caption, accountName } = parse.data;

    // 1. Ensure public image URL for Instagram's servers
    const publicImageUrl = await ensurePublicImageUrl(rawImageUrl);

    const igUserId = process.env.INSTAGRAM_USER_ID || '17841440064535025';
    const igAccessToken = process.env.INSTAGRAM_ACCESS_TOKEN || 'IGAAeYsdOV6ctBZAFpVTUlMaG1UV2hqRERHZAE5uZAkJoWlhWbGxkZAlAwbXByZA1hPcVV2SEk1Nk1QSU1qVjd6SXlzZAVhVQUZACVURxQmtXSUxMV0ZA5akc2UnE5aFdzd2h6bjNIVC1yNlVjUDhHUmtWMFhPWVJYcldfdjB6RUluYTJtOAZDZD';

    let publishedPostId: string | null = null;
    let creationId: string | null = null;
    let graphApiError: any = null;

    // 2. Step 1: Create Instagram Media Container
    console.log(`📸 [Instagram Publish] Step 1: Creating media container for ${publicImageUrl.slice(0, 60)}...`);
    try {
      const containerUrl = `https://graph.instagram.com/v23.0/${igUserId}/media`;
      const containerRes = await fetch(containerUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${igAccessToken}`
        },
        body: JSON.stringify({
          image_url: publicImageUrl,
          caption: caption
        })
      });

      const containerData: any = await containerRes.json();
      console.log('📸 [Instagram Publish] Container API response:', containerRes.status, containerData);

      if (containerRes.ok && containerData.id) {
        creationId = containerData.id;
        console.log(`✅ [Instagram Publish] Container created! ID: ${creationId}`);

        // 3. Step 2: Publish Media Container (allow 2.5s for Instagram processing)
        await new Promise(resolve => setTimeout(resolve, 2500));

        console.log(`🚀 [Instagram Publish] Step 2: Publishing media container ${creationId}...`);
        const publishUrl = `https://graph.instagram.com/v23.0/${igUserId}/media_publish`;
        const publishRes = await fetch(publishUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${igAccessToken}`
          },
          body: JSON.stringify({
            creation_id: creationId
          })
        });

        const publishData: any = await publishRes.json();
        console.log('🚀 [Instagram Publish] Publish API response:', publishRes.status, publishData);

        if (publishRes.ok && publishData.id) {
          publishedPostId = publishData.id;
          console.log(`🎉 [Instagram Publish] Post published successfully to Instagram! ID: ${publishedPostId}`);
        } else {
          graphApiError = publishData;
          console.warn('⚠️ [Instagram Publish] Step 2 publish error:', publishData);
        }
      } else {
        graphApiError = containerData;
        console.warn('⚠️ [Instagram Publish] Step 1 container error:', containerData);
      }
    } catch (apiErr: any) {
      console.error('❌ [Instagram Publish] Graph API exception:', apiErr.message);
      graphApiError = apiErr.message;
    }

    // 4. Also forward event to workflow webhook if configured
    const webhookUrls = [
      process.env.INSTAGRAM_WEBHOOK_URL,
      process.env.N8N_INSTAGRAM_WEBHOOK_URL
    ].filter(Boolean) as string[];

    for (const webhookUrl of webhookUrls) {
      try {
        console.log(`📡 [Webhook Dispatch] Sending publication event to: ${webhookUrl}`);
        await fetch(webhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': 'AetherDesign-SocialPublisher/1.0'
          },
          body: JSON.stringify({
            imageUrl: publicImageUrl,
            caption: caption,
            publishedPostId: publishedPostId || undefined,
            creationId: creationId || undefined,
            accountName: accountName,
            timestamp: new Date().toISOString()
          })
        });
      } catch (webhookErr: any) {
        console.warn(`⚠️ [Webhook Dispatch] Warning for ${webhookUrl}:`, webhookErr.message);
      }
    }

    const finalPostId = publishedPostId || (creationId ? `ig_${creationId}` : 'ig_' + Math.random().toString(36).substring(2, 12));
    const permalink = publishedPostId
      ? `https://www.instagram.com/p/${publishedPostId}`
      : `https://www.instagram.com/i_teddy_bear_07`;

    return res.status(200).json({
      success: true,
      published_to_instagram: !!publishedPostId,
      post_id: finalPostId,
      creation_id: creationId,
      permalink: permalink,
      published_at: new Date().toISOString(),
      account: accountName || '@i_teddy_bear_07',
      image_url: publicImageUrl,
      caption_preview: caption.slice(0, 100) + '...',
      graph_api_error: graphApiError || null
    });
  } catch (err: any) {
    console.error('Instagram publish handler error:', err);
    return res.status(500).json({ error: 'Instagram publishing failed', code: 'SERVER_ERROR' });
  }
});

export default router;
