import { PlatformPreset } from '../types';

export const PLATFORM_DIMENSIONS: Record<string, { width: number; height: number; aspect: string }> = {
  instagram_square: { width: 1024, height: 1024, aspect: '1:1' },
  linkedin_post: { width: 1024, height: 1024, aspect: '1:1' },
  instagram_story: { width: 576, height: 1024, aspect: '9:16' },
  pinterest_pin: { width: 640, height: 960, aspect: '2:3' },
  facebook_link: { width: 1024, height: 576, aspect: '16:9' },
  web_hero: { width: 1024, height: 512, aspect: '2:1' },
  email_banner: { width: 1024, height: 512, aspect: '2:1' }
};

// Generate high-aesthetic deterministic SVG base64 image as ultimate offline fallback
export function generateDeterministicSvgBase64(params: {
  prompt: string;
  width: number;
  height: number;
  palette?: string[];
  mood?: string;
}): string {
  const { prompt, width, height, palette = ['#8B5CF6', '#C4B5FD', '#A78BFA'], mood = 'vibrant' } = params;

  const color1 = palette[0] || '#8B5CF6';
  const color2 = palette[1] || '#C4B5FD';
  const color3 = palette[2] || '#EDE9FE';
  const bgGrad = '#F8F7FF';

  // Create artistic abstract visual shapes that have NO text
  const svg = `
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    <linearGradient id="mainGrad" x1="0%" y1="0%" x2="100%" y2="100%">
      <stop offset="0%" stop-color="${color1}" />
      <stop offset="50%" stop-color="${color2}" />
      <stop offset="100%" stop-color="${color3}" />
    </linearGradient>
    <linearGradient id="softGrad" x1="100%" y1="0%" x2="0%" y2="100%">
      <stop offset="0%" stop-color="${color3}" stop-opacity="0.8" />
      <stop offset="100%" stop-color="${color1}" stop-opacity="0.4" />
    </linearGradient>
    <filter id="blurFilter" x="-20%" y="-20%" width="140%" height="140%">
      <feGaussianBlur stdDeviation="40" />
    </filter>
    <radialGradient id="glow" cx="50%" cy="50%" r="50%">
      <stop offset="0%" stop-color="${color2}" stop-opacity="0.7" />
      <stop offset="100%" stop-color="${color1}" stop-opacity="0" />
    </radialGradient>
  </defs>

  <!-- Background Base -->
  <rect width="${width}" height="${height}" fill="${bgGrad}" />

  <!-- Abstract Ambient Art Blobs -->
  <circle cx="${width * 0.3}" cy="${height * 0.4}" r="${Math.min(width, height) * 0.45}" fill="url(#mainGrad)" filter="url(#blurFilter)" opacity="0.65" />
  <circle cx="${width * 0.75}" cy="${height * 0.6}" r="${Math.min(width, height) * 0.4}" fill="url(#softGrad)" filter="url(#blurFilter)" opacity="0.55" />
  <rect x="${width * 0.2}" y="${height * 0.2}" width="${width * 0.6}" height="${height * 0.6}" rx="40" fill="url(#glow)" filter="url(#blurFilter)" opacity="0.4" />

  <!-- Modern Geometric Glass Accents -->
  <g transform="translate(${width * 0.15}, ${height * 0.15})">
    <rect width="${width * 0.7}" height="${height * 0.7}" rx="28" fill="rgba(255,255,255,0.4)" stroke="rgba(233,213,255,0.8)" stroke-width="2" />
    <circle cx="${width * 0.35}" cy="${height * 0.35}" r="${Math.min(width, height) * 0.2}" fill="none" stroke="url(#mainGrad)" stroke-width="4" stroke-dasharray="12 8" opacity="0.7" />
    <circle cx="${width * 0.35}" cy="${height * 0.35}" r="${Math.min(width, height) * 0.12}" fill="${color1}" opacity="0.85" />
  </g>

  <!-- Minimal Decorative Grid Dots -->
  <g fill="${color1}" opacity="0.25">
    <circle cx="${width * 0.08}" cy="${height * 0.08}" r="4" />
    <circle cx="${width * 0.12}" cy="${height * 0.08}" r="4" />
    <circle cx="${width * 0.16}" cy="${height * 0.08}" r="4" />
    <circle cx="${width * 0.08}" cy="${height * 0.12}" r="4" />
    <circle cx="${width * 0.12}" cy="${height * 0.12}" r="4" />
    <circle cx="${width * 0.16}" cy="${height * 0.12}" r="4" />
  </g>
</svg>
`.trim();

  const base64 = Buffer.from(svg).toString('base64');
  return `data:image/svg+xml;base64,${base64}`;
}

export async function synthesizeImageWithFlux(params: {
  imagePrompt: string;
  platform: string;
  palette?: string[];
  mood?: string;
}): Promise<{
  image: string; // base64 or data URL
  width: number;
  height: number;
  isFallback: boolean;
}> {
  const { imagePrompt, platform, palette, mood } = params;
  const dims = PLATFORM_DIMENSIONS[platform] || PLATFORM_DIMENSIONS['instagram_square'];

  const cloudflareAccountId = process.env.CLOUDFLARE_ACCOUNT_ID;
  const cloudflareApiToken = process.env.CLOUDFLARE_API_TOKEN;

  // 1. Try Cloudflare Workers AI FLUX if valid credentials provided
  if (cloudflareAccountId && cloudflareApiToken && !cloudflareAccountId.startsWith('your_') && !cloudflareApiToken.startsWith('your_')) {
    try {
      const url = `https://api.cloudflare.com/client/v4/accounts/${cloudflareAccountId}/ai/run/@cf/black-forest-labs/flux-1-schnell`;
      const res = await fetch(url, {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${cloudflareApiToken}`,
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          prompt: imagePrompt,
          steps: 4,
          width: dims.width,
          height: dims.height
        })
      });

      if (res.ok) {
        const data: any = await res.json();
        if (data.result && data.result.image) {
          const imgBase64 = data.result.image.startsWith('data:')
            ? data.result.image
            : `data:image/jpeg;base64,${data.result.image}`;

          return {
            image: imgBase64,
            width: dims.width,
            height: dims.height,
            isFallback: false
          };
        }
      } else {
        console.warn('Cloudflare FLUX API responded with status:', res.status);
      }
    } catch (err: any) {
      console.warn('Cloudflare FLUX request failed, falling back to direct FLUX generation:', err.message);
    }
  }

  // 2. Direct high-speed FLUX AI image synthesis (Pollinations FLUX engine)
  try {
    const cleanPrompt = `${imagePrompt}, high quality professional commercial visual, clean composition, no letters, no watermark`.slice(0, 1000);
    const seed = Math.floor(Math.random() * 9000000) + 1000000;
    const pollinationsUrl = `https://image.pollinations.ai/prompt/${encodeURIComponent(cleanPrompt)}?width=${dims.width}&height=${dims.height}&model=flux&nologo=true&seed=${seed}`;

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 45000);

    const res = await fetch(pollinationsUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64)'
      }
    });
    clearTimeout(timeoutId);

    if (res.ok) {
      const arrayBuffer = await res.arrayBuffer();
      const buffer = Buffer.from(arrayBuffer);
      if (buffer.byteLength > 1000) {
        const mimeType = res.headers.get('content-type') || 'image/jpeg';
        const base64Data = `data:${mimeType};base64,${buffer.toString('base64')}`;
        return {
          image: base64Data,
          width: dims.width,
          height: dims.height,
          isFallback: false
        };
      }
    } else {
      console.warn('Direct FLUX engine returned status:', res.status);
    }
  } catch (err: any) {
    console.warn('Direct FLUX synthesis failed:', err.message);
  }

  // 3. Ultimate deterministic SVG fallback (offline)
  const fallbackImg = generateDeterministicSvgBase64({
    prompt: imagePrompt,
    width: dims.width,
    height: dims.height,
    palette,
    mood
  });

  return {
    image: fallbackImg,
    width: dims.width,
    height: dims.height,
    isFallback: true
  };
}
