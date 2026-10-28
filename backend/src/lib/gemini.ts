import { GoogleGenerativeAI } from '@google/generative-ai';
import { CreativeDirectorBrief } from '../types';

function getGenAI(): GoogleGenerativeAI | null {
  const key = process.env.GEMINI_API_KEY;
  if (key && key.trim().length > 0 && !key.startsWith('your_') && key !== 'sk-...') {
    return new GoogleGenerativeAI(key.trim());
  }
  return null;
}

const GENERATION_MODELS = [
  'gemini-2.5-flash',
  'gemini-2.0-flash',
  'gemini-1.5-flash',
  'gemini-1.5-pro',
  'gemini-pro'
];
const EMBEDDING_MODELS = ['text-embedding-004', 'gemini-embedding-001'];

function withTimeout<T>(promise: Promise<T>, ms: number = 4000): Promise<T> {
  return Promise.race([
    promise,
    new Promise<T>((_, reject) => setTimeout(() => reject(new Error('Timeout')), ms))
  ]);
}

// 1. Deterministic 256-dimensional fallback embedding generator
export function generateDeterministicEmbedding(text: string): number[] {
  const embedding = new Array(256).fill(0);
  const normalized = text.toLowerCase().trim();
  const words = normalized.split(/\s+/);

  for (let i = 0; i < words.length; i++) {
    const word = words[i];
    for (let j = 0; j < word.length; j++) {
      const code = word.charCodeAt(j);
      const idx1 = (code * 13 + j * 7 + i * 17) % 256;
      const idx2 = (code * 31 + j * 19 + i * 23) % 256;
      embedding[idx1] += (code % 10) * 0.1;
      embedding[idx2] += ((code * 3) % 7) * 0.05;
    }
  }

  // Add overall string fingerprint
  for (let i = 0; i < normalized.length; i++) {
    const charCode = normalized.charCodeAt(i);
    embedding[i % 256] += Math.sin(charCode + i) * 0.5;
  }

  // L2 normalize
  let norm = 0;
  for (let i = 0; i < 256; i++) {
    norm += embedding[i] * embedding[i];
  }
  norm = Math.sqrt(norm);
  if (norm > 0) {
    for (let i = 0; i < 256; i++) {
      embedding[i] = parseFloat((embedding[i] / norm).toFixed(6));
    }
  } else {
    embedding[0] = 1;
  }

  return embedding;
}

// 2. Embed content with Gemini or fallback
export async function getEmbedding(text: string): Promise<number[]> {
  const genAI = getGenAI();
  if (genAI) {
    for (const modelName of EMBEDDING_MODELS) {
      try {
        const model = genAI.getGenerativeModel({ model: modelName });
        const result = await withTimeout(
          model.embedContent({ content: { parts: [{ text }], role: 'user' } }),
          3000
        );
        if (result.embedding && result.embedding.values) {
          let values = result.embedding.values;
          if (values.length > 256) {
            values = values.slice(0, 256);
          }
          // Normalize
          let norm = 0;
          for (let i = 0; i < values.length; i++) norm += values[i] * values[i];
          norm = Math.sqrt(norm);
          if (norm > 0) {
            values = values.map(v => parseFloat((v / norm).toFixed(6)));
          }
          return values;
        }
      } catch (err: any) {
        // Try next embedding model
      }
    }
  }

  return generateDeterministicEmbedding(text);
}

// 3. Direct Creator Image Prompt Enhancer (Zero RAG / Brand Guidelines)
export async function generateDirectImagePrompt(params: {
  prompt: string;
  platform: string;
  audience?: string;
  style?: string;
}): Promise<{
  intent: string;
  subject: string;
  composition: string;
  palette: string[];
  mood: string;
  avoid: string[];
  image_prompt: string;
  negative_prompt: string;
}> {
  const { prompt, platform, audience, style } = params;
  const visualStyle = style || 'editorial photography';

  const systemInstruction = `You are a world-class prompt engineer for state-of-the-art text-to-image diffusion models (like FLUX.1 and Imagen). Your goal is to transform the user's prompt into an ultra-high-fidelity, aesthetic visual description.
CRITICAL INVARIANTS:
1. OUTPUT ONLY A VALID RAW JSON OBJECT. No markdown backticks, no explanations.
2. DO NOT put readable text, letters, typography, slogans, or words in the image prompt.
3. Describe physical details: cinematic lighting, realistic textures, camera perspective, color harmony, and clean composition.

JSON Schema:
{
  "intent": "short title for the generated visual",
  "subject": "main subject matter in rich visual detail",
  "composition": "framing, angle, and layout description",
  "palette": ["#hex1", "#hex2", "#hex3"],
  "mood": "mood and aesthetic vibe keywords",
  "avoid": ["readable text", "watermarks", "deformed objects", "blurry details"],
  "image_prompt": "one vivid, atmospheric, highly detailed prompt sentence for diffusion image generation. NEVER ask for words or letters.",
  "negative_prompt": "text, letters, words, watermark, signature, logo, blurry, distorted, low quality"
}`;

  const userPrompt = `
User Concept: "${prompt}"
Target Platform / Aspect: ${platform}
Visual Aesthetic Style: ${visualStyle}
Target Audience / Context: ${audience || 'General audience'}
`;

  const genAI = getGenAI();
  if (genAI) {
    for (const modelName of GENERATION_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.5,
            responseMimeType: 'application/json'
          },
          systemInstruction
        });

        const response = await withTimeout(model.generateContent(userPrompt), 3500);
        const text = response.response.text();
        const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.image_prompt) {
          return {
            intent: parsed.intent || `${prompt.slice(0, 35)} Visual`,
            subject: parsed.subject || prompt,
            composition: parsed.composition || `Balanced commercial composition optimized for ${platform}`,
            palette: Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette : ['#8B5CF6', '#C4B5FD', '#A78BFA'],
            mood: parsed.mood || 'Cinematic, vibrant, modern',
            avoid: Array.isArray(parsed.avoid) ? parsed.avoid : ['text', 'watermarks', 'blur'],
            image_prompt: parsed.image_prompt,
            negative_prompt: parsed.negative_prompt || 'text, letters, typography, watermark, logo, blur'
          };
        }
      } catch (err: any) {
        // Continue to fallback
      }
    }
  }

  // Pure aesthetic algorithmic fallback prompt
  return {
    intent: `${prompt.slice(0, 35)} Visual`,
    subject: `High-fidelity ${visualStyle} representation of ${prompt}.`,
    composition: `Sophisticated commercial composition optimized for ${platform}, with clean aesthetic framing.`,
    palette: ['#8B5CF6', '#C4B5FD', '#A78BFA'],
    mood: 'Vibrant, clean, cinematic',
    avoid: ['text', 'lettering', 'watermarks', 'distortions'],
    image_prompt: `A breathtaking, high-end ${visualStyle} showcasing ${prompt}, cinematic studio lighting, elegant textures, clean aesthetic, 8k resolution visual art without any written words.`,
    negative_prompt: 'text, letters, typography, watermark, logo, blurry, noisy, low resolution, bad anatomy'
  };
}

// 4. Prompt-based Image Editing & Refinement
export async function generateEditedImagePrompt(params: {
  originalPrompt: string;
  editInstruction: string;
  platform?: string;
  style?: string;
}): Promise<{
  intent: string;
  subject: string;
  composition: string;
  palette: string[];
  mood: string;
  avoid: string[];
  image_prompt: string;
  negative_prompt: string;
}> {
  const { originalPrompt, editInstruction, platform = 'instagram_square', style = 'editorial photography' } = params;

  const systemInstruction = `You are a world-class prompt engineer specializing in iterative image refinement and prompt editing for text-to-image diffusion models.
Your objective is to take an original image description and modify it according to the user's edit instruction.
CRITICAL INVARIANTS:
1. Retain the core subject, identity, and framing of the original image unless the edit instruction explicitly replaces them.
2. Accurately apply the requested modifications (e.g. lighting changes, color palette shifts, background scenery changes, weather/atmosphere, style adjustments, or adding/removing elements).
3. OUTPUT ONLY RAW JSON matching the schema. No markdown backticks.
4. ZERO words, typography, letters, slogans, or watermarks.

JSON Schema:
{
  "intent": "short title for the edited visual",
  "subject": "updated subject description reflecting edits",
  "composition": "updated composition framing",
  "palette": ["#hex1", "#hex2", "#hex3"],
  "mood": "updated mood keywords",
  "avoid": ["readable text", "watermarks", "distortions", "artifacts"],
  "image_prompt": "the complete updated diffusion prompt incorporating the edits seamlessly. NO words or lettering.",
  "negative_prompt": "text, letters, words, watermark, logo, blur, distorted"
}`;

  const userPrompt = `
Original Image Description: "${originalPrompt}"
Requested Edit Instruction: "${editInstruction}"
Visual Style: ${style}
Target Platform/Aspect: ${platform}
`;

  const genAI = getGenAI();
  if (genAI) {
    for (const modelName of GENERATION_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: {
            temperature: 0.5,
            responseMimeType: 'application/json'
          },
          systemInstruction
        });

        const response = await withTimeout(model.generateContent(userPrompt), 3500);
        const text = response.response.text();
        const cleaned = text.replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(cleaned);

        if (parsed.image_prompt) {
          return {
            intent: parsed.intent || `Edited: ${editInstruction.slice(0, 30)}`,
            subject: parsed.subject || originalPrompt,
            composition: parsed.composition || 'Updated refined composition',
            palette: Array.isArray(parsed.palette) && parsed.palette.length ? parsed.palette : ['#8B5CF6', '#C4B5FD', '#A78BFA'],
            mood: parsed.mood || 'Modern, refined, cinematic',
            avoid: Array.isArray(parsed.avoid) ? parsed.avoid : ['text', 'watermarks', 'blur'],
            image_prompt: parsed.image_prompt,
            negative_prompt: parsed.negative_prompt || 'text, letters, typography, watermark, logo, blur'
          };
        }
      } catch (err: any) {
        // Continue to fallback
      }
    }
  }

  // Pure aesthetic algorithmic fallback prompt
  return {
    intent: `Edited: ${editInstruction.slice(0, 30)}`,
    subject: `${originalPrompt}, modified: ${editInstruction}`,
    composition: `Refined composition optimized for ${platform}`,
    palette: ['#8B5CF6', '#C4B5FD', '#A78BFA'],
    mood: 'Vibrant, updated, cinematic',
    avoid: ['text', 'lettering', 'watermarks'],
    image_prompt: `A breathtaking, high-end ${style} of ${originalPrompt}, updated with ${editInstruction}, cinematic lighting, photorealistic textures, 8k resolution, text-free visual art.`,
    negative_prompt: 'text, letters, words, logo, watermark, blurry, low resolution'
  };
}

// 5. Creative Director Agent (kept for backward compatibility)
export async function generateCreativeBrief(params: {
  prompt: string;
  platform: string;
  audience?: string;
  style?: string;
  brandTokens?: any;
  guidelines?: string[];
  enforcePalette?: boolean;
}): Promise<CreativeDirectorBrief> {
  const { prompt, platform, audience, style } = params;
  return generateDirectImagePrompt({ prompt, platform, audience, style });
}

// Helper: Contextual Subject-Centric Fallback Caption Generator
function generateContextualSubjectCaptions(params: {
  prompt: string;
  targetNum: number;
  format: string;
}): { punchy: string; story: string; value: string } {
  const { prompt, targetNum, format } = params;
  const cleanPrompt = prompt.trim().replace(/^["']|["']$/g, '');
  const subjectWords = cleanPrompt.split(/\s+/);

  const stopWords = new Set(['a', 'an', 'the', 'in', 'on', 'at', 'with', 'of', 'for', 'and', 'or', 'by', 'to', 'from', 'is', 'are', 'this', 'that']);
  const keywords = subjectWords
    .map(w => w.replace(/[^a-zA-Z0-9]/g, ''))
    .filter(w => w.length > 2 && !stopWords.has(w.toLowerCase()))
    .slice(0, 6);

  const subjectTags = keywords.length > 0
    ? keywords.map(k => `#${k.charAt(0).toUpperCase() + k.slice(1).toLowerCase()}`).join(' ')
    : '#InstaDaily #Vibes #ExplorePage #Trending';

  const capitalize = (s: string) => s.charAt(0).toUpperCase() + s.slice(1);
  const lower = cleanPrompt.toLowerCase();

  const isFood = /coffee|cappuccino|latte|pizza|burger|cake|tea|cocktail|food|recipe|dish|bakery|pasta|sushi|meal|drink|dessert|breakfast|lunch|dinner/.test(lower);
  const isFashion = /outfit|dress|fashion|shoes|sneakers|jacket|style|streetwear|watch|jewelry|coat|hoodie|bag|luxury|model|clothing|wear/.test(lower);
  const isCar = /car|sports car|supercar|porsche|ferrari|bmw|audi|mercedes|lamborghini|motorcycle|drive|highway|vehicle|racing/.test(lower);
  const isTravel = /sunset|beach|mountain|ocean|nature|forest|lake|travel|city|landscape|island|skyline|vacation|roadtrip|resort|scenery/.test(lower);
  const isBullet = format.toLowerCase().includes('bullet') || format.toLowerCase().includes('list');

  // Short presets (~25 words)
  if (targetNum <= 35) {
    if (isFood) {
      return {
        punchy: `☕ The ultimate treat: ${cleanPrompt}! Fresh, rich, and crafted to pure perfection. Stop by or order yours today! ✨\n\n${subjectTags}`,
        story: `Nothing beats starting the day with ${cleanPrompt}. That first sip is pure bliss. How do you take yours? 💭\n\n${subjectTags}`,
        value: `🔥 Daily craving solved: ${cleanPrompt}. Save this spot for your next coffee run! 📌\n\n${subjectTags}`
      };
    }
    if (isFashion) {
      return {
        punchy: `✨ Obsessed with this look: ${cleanPrompt}. Clean lines, effortless confidence. Shop now via the link in bio! 🛍️\n\n${subjectTags}`,
        story: `Fit check of the day featuring ${cleanPrompt}. Comfort meets timeless style. Drop a rating 1-10 in the comments! 👇\n\n${subjectTags}`,
        value: `💎 Style essentials: ${cleanPrompt}. Elevate your wardrobe this season. Save for outfit inspo! 📌\n\n${subjectTags}`
      };
    }
    if (isCar) {
      return {
        punchy: `🏁 Pure adrenaline: ${cleanPrompt}. Engineering excellence and raw power on the open road. Turn your sound on! 🏎️\n\n${subjectTags}`,
        story: `Dream drives become reality. ${cleanPrompt} cruising into the golden hour. Would you take this on a road trip? 💨\n\n${subjectTags}`,
        value: `⚡ Performance at its finest: ${cleanPrompt}. Double tap if you need this in your garage! 📌\n\n${subjectTags}`
      };
    }
    return {
      punchy: `✨ Pure perfection: ${cleanPrompt}. When every single detail comes together effortlessly. Tap the link in bio to experience it! 🔥\n\n${subjectTags}`,
      story: `A moment worth slowing down for. ${cleanPrompt} has completely made our day. What is your favorite part of this? 💭\n\n${subjectTags}`,
      value: `⚡ Unmatched vibes with ${cleanPrompt}. Bookmark this post for your daily inspiration! 📌\n\n${subjectTags}`
    };
  }

  // Medium presets (~50-80 words)
  if (targetNum < 100) {
    if (isFood) {
      if (isBullet) {
        return {
          punchy: `☕ Craving the perfect cup? Look no further than ${cleanPrompt}!\n\nHere is why this is an absolute game changer:\n• Freshly roasted, rich aromatic beans brewed to perfection\n• Velvety smooth texture with handcrafted finish\n• The ideal pick-me-up to power through your day\n\nDrop in today or order ahead to grab yours! Link in bio.\n\n${subjectTags} #CoffeeLovers #DailyFuel #CafeLife`,
          story: `✨ 3 reflections on why ${cleanPrompt} hits differently every single time:\n\n1. It turns an ordinary morning routine into a mindful ritual.\n2. The rich, comforting flavors bring pure joy from the first sip.\n3. Cozy vibes that make you want to stay all afternoon.\n\nHow do you like to enjoy your favorite brew? Let us know below! 👇\n\n${subjectTags} #MorningRitual #CoffeeVibes #CozyMoments`,
          value: `🔥 The Secrets to ${capitalize(cleanPrompt)}:\n\n☕ Perfectly calibrated brew temperature for maximum flavor\n🥛 Micro-foamed milk for that silky, luxurious mouthfeel\n✨ A touch of sweetness that balances every note\n\nSave this post for your next coffee stop and share with a friend who needs caffeine! 📌\n\n${subjectTags} #CoffeeTime #FoodieFinds #BaristaLife`
        };
      }
      return {
        punchy: `✨ Elevate your day with ${cleanPrompt}!\n\nThere is nothing quite like the irresistible aroma, rich flavor notes, and comforting warmth of a fresh brew made with care. Whether you are kicking off a busy morning or taking a well-deserved afternoon break, this is guaranteed to hit the spot every single time.\n\n👉 Treat yourself today—tap the link in our bio to find your nearest location!\n\n${subjectTags} #CoffeeLovers #DailyIndulgence #CafeMoments #FreshBrew #FoodieFavorites`,
        story: `There is something truly comforting about stepping into a cozy space and enjoying ${cleanPrompt}.\n\nThat quiet moment before the day gets busy, listening to the gentle hum of the cafe, and savoring the first warm sip—it is the little rituals that bring the most peace. It is all about slowing down and enjoying life's simple pleasures.\n\n💬 What is your go-to morning order? Tell us in the comments! ☕\n\n${subjectTags} #CafeVibes #MorningRitual #CozyAfternoon #CoffeeLovers #MindfulMoments`,
        value: `Looking for the ultimate pick-me-up? ${capitalize(cleanPrompt)} delivers rich flavor, smooth texture, and an unforgettable taste experience.\n\nPair it with your favorite pastry, grab a cozy seat by the window, and recharge your energy for the rest of the week.\n\n📌 Save this post for your next cafe visit and tag someone you want to grab coffee with! ☕\n\n${subjectTags} #FoodInspo #CafeCulture #CoffeeAddict #TreatYourself #DailyInspiration`
      };
    }

    if (isFashion) {
      return {
        punchy: `🔥 Level up your everyday wardrobe with ${cleanPrompt}!\n\nDesigned for effortless confidence and premium all-day comfort, this piece brings together sharp modern tailoring and versatile style. Whether you are dressing up for an evening out or keeping it sleek during the day, it is made to turn heads everywhere you go.\n\n👉 Shop the new arrival now via the link in our bio!\n\n${subjectTags} #FashionInspo #OOTD #StreetStyle #StyleGoals #LookOfTheDay`,
        story: `Style is more than what you wear—it is how you carry yourself, and ${cleanPrompt} is all about effortless confidence.\n\nWhen your outfit feels just right, everything else falls into place. We love the versatile silhouette, the rich texture, and how effortlessly it transitions from day to night.\n\n💬 How would you style this look? Drop your outfit ideas in the comments below! ✨\n\n${subjectTags} #StyleInspo #WardrobeEssentials #OutfitGoals #DailyLook #FashionCommunity`,
        value: `💎 The 3 Style Rules for ${capitalize(cleanPrompt)}:\n\n1️⃣ Keep the accessories minimal to let the statement piece shine\n2️⃣ Pair with neutral tones for a clean, timeless silhouette\n3️⃣ Prioritize fit and comfort for effortless all-day wear\n\nBookmark this post for your next outfit planning session and share with a friend who loves great style! 📌\n\n${subjectTags} #StyleGuide #FashionTips #CapsuleWardrobe #OutfitInspo #OOTDGuide`
      };
    }

    if (isCar) {
      return {
        punchy: `🏁 Unleash pure performance with ${cleanPrompt}!\n\nFrom the roaring engine note to the sculpted aerodynamic lines, every single curve is built for speed, precision, and commanding presence. When you are behind the wheel, the open road is yours to conquer.\n\n👉 Tap the link in bio to explore full specifications and book a test drive today! 🏎️\n\n${subjectTags} #Supercars #CarLovers #AutomotiveDaily #SpeedFreak #CarEnthusiast`,
        story: `There is an unmatched thrill when you take ${cleanPrompt} out on the open highway at dusk.\n\nAs the city lights fade into the rear-view mirror and the tarmac opens up ahead, all the noise of the day disappears. It is pure harmony between driver, machine, and the open road.\n\n💬 If you had the keys for a weekend, where is the first destination you would drive to? Drop it below! 💨\n\n${subjectTags} #DriveLife #AutomotiveCulture #DreamCars #CarGram #NightDrive`,
        value: `⚡ What Makes ${capitalize(cleanPrompt)} So Incredible:\n\n🏎️ Precision engineered chassis with razor-sharp handling\n🔥 Uncompromising horsepower delivering instant acceleration\n✨ Aerodynamic styling that turns heads at every stoplight\n\nDouble tap if you love high performance machines and save this post to your dream garage! 📌\n\n${subjectTags} #CarPorn #Automotive #PerformanceCars #DreamGarage #SpeedVibes`
      };
    }

    return {
      punchy: `✨ Experience the magic of ${cleanPrompt}!\n\nFrom vibrant atmosphere to unmatched presence, this brings energy and effortless charm to any moment. When quality and attention to detail come together, the result is something truly special that you will want to revisit again and again.\n\n👉 Discover more and join our community—tap the link in our bio today!\n\n${subjectTags} #ExplorePage #InstaVibes #DailyInspo #TrendingNow #MustSee`,
      story: `There is a distinct feeling that comes with ${cleanPrompt}.\n\nIt is in the atmosphere, the rich details, and the effortless way it captures your attention. Sometimes taking a moment to appreciate what is right in front of you brings a fresh wave of positive energy to the day.\n\n💬 What does this scene inspire in you? We would love to hear your thoughts in the comments below! ✨\n\n${subjectTags} #Storytelling #MindfulMoments #PositiveVibes #DailyInspiration #GoodVibes`,
      value: `🌟 Highlights of ${capitalize(cleanPrompt)}:\n\n✨ Distinctive presence that stands out effortlessly\n💫 Rich atmosphere that brings warmth and energy\n🎯 Timeless quality that keeps you coming back\n\nSave this post to your bookmarks for whenever you need a boost of inspiration, and share it with someone special! 📌\n\n${subjectTags} #DailyInspo #BookmarkThis #PositiveEnergy #CuratedFeed #InstaGood`
    };
  }

  // Long presets (~120-180 words)
  return {
    punchy: `✨ Introducing: ${capitalize(cleanPrompt)}.\n\nWhen exceptional craftsmanship and genuine passion come together, the result is an unforgettable experience that commands your attention. In a fast-paced world, it is the thoughtful details, rich atmosphere, and authentic textures that make you stop scrolling and take notice.\n\nEvery single element here was crafted to evoke pure warmth, quality, and timeless elegance. Whether you are discovering this for the very first time or returning to a beloved favorite, immersing yourself in this experience changes everything.\n\nWe invite you to take in the atmosphere, explore the details, and share the journey with us. It is more than just a moment—it is an authentic statement of style and intentional living.\n\n👉 Discover the full story and experience the difference today. Tap the link in our bio to explore all details!\n\n${subjectTags} #DailyInspo #LifestyleGoals #ExplorePage #InstaMood #TrendingNow`,
    story: `There is a quiet power in moments like this, and ${cleanPrompt} captures that essence in its truest form.\n\nWhen we look at this scene, we are reminded of how much beauty exists in the subtle details: the gentle play of light, the rich warmth in the atmosphere, and the feeling of being completely present in the moment. It is the kind of experience that invites you to take a deep breath, pause your busy day, and reconnect with what truly inspires you.\n\nEvery great journey starts with a passion—a desire to bring something authentic and meaningful into the world. We hope this image brings a sense of calm and renewed energy to your day.\n\n💬 Which part of this scene speaks to you the most? Drop your thoughts and stories in the comments below, we would love to hear from you!\n\n${subjectTags} #Storytelling #VisualMood #CreativeJourney #DailyInspiration #MindfulLiving #ArtisticVibes #CommunityVibes`,
    value: `🌟 The 4 Key Elements That Make ${capitalize(cleanPrompt)} So Captivating:\n\n1️⃣ Uncompromising Quality: Built with genuine passion and dedication to excellence in every single detail.\n\n2️⃣ Immersive Atmosphere: Rich textures and natural warmth that make the entire experience deeply memorable.\n\n3️⃣ Timeless Appeal: Combining effortless simplicity with enduring sophistication that never fades.\n\n4️⃣ Everyday Inspiration: A reminder to slow down, appreciate the craft, and savor life's finest moments.\n\nSave this post to your bookmarks for your next dose of inspiration, and share it with someone who appreciates authentic quality!\n\n📌 Save & Share!\n\n${subjectTags} #KeyTakeaways #PracticalGuide #KnowledgeShare #DailyTips #MustSave #InspirationFeed`
  };
}

// 6. Copywriter Agent
export async function generateSocialCaptions(params: {
  prompt: string;
  brandName?: string;
  tone?: string;
  wordCount?: number | string;
  format?: string;
}): Promise<{
  punchy: string;
  story: string;
  value: string;
}> {
  const {
    prompt,
    tone = 'engaging, authentic, modern',
    wordCount = '50-80 words',
    format = 'Standard hook, body, and CTA'
  } = params;

  // Extract numeric target and minimum word counts
  let targetNum = 60;
  let minWords = 50;
  let maxWords = 80;

  if (typeof wordCount === 'number') {
    targetNum = wordCount;
    minWords = Math.max(10, Math.floor(wordCount * 0.85));
    maxWords = Math.floor(wordCount * 1.25);
  } else if (typeof wordCount === 'string') {
    const numMatches = wordCount.match(/\d+/g);
    if (numMatches && numMatches.length >= 2) {
      minWords = parseInt(numMatches[0]);
      maxWords = parseInt(numMatches[1]);
      targetNum = Math.round((minWords + maxWords) / 2);
    } else if (numMatches && numMatches.length === 1) {
      targetNum = parseInt(numMatches[0]);
      minWords = Math.max(10, Math.floor(targetNum * 0.85));
      maxWords = Math.floor(targetNum * 1.25);
    } else if (wordCount.toLowerCase().includes('short')) {
      targetNum = 25;
      minWords = 18;
      maxWords = 35;
    } else if (wordCount.toLowerCase().includes('long')) {
      targetNum = 150;
      minWords = 120;
      maxWords = 180;
    }
  }

  const systemInstruction = `You are an expert social media copywriter and content creator for Instagram.
Your task is to write authentic, engaging Instagram captions about the real-world subject, product, lifestyle, moment, or experience shown in the image prompt: "${prompt}".

MANDATORY SUBJECT RELEVANCE:
- Write directly and exclusively about the subject matter in: "${prompt}" (e.g. if it's coffee, talk about the rich aroma, handcrafted foam, cafe vibes; if it's fashion, talk about style, comfort, outfit inspo; if it's a car, talk about horsepower and the open road; if it's nature/travel, talk about scenic beauty and wanderlust).
- NEVER mention "AetherDesign", "design software", "graphic design", "design agency", "templates", "vector", "moodboard", "design principles", or "AI art".
- The captions must read as if posted by an authentic creator, influencer, shop owner, or enthusiast sharing their real photo on Instagram.

STRICT WORD COUNT REQUIREMENT:
- EACH of the 3 variants ("punchy", "story", "value") MUST strictly contain between ${minWords} and ${maxWords} words (Target: ${targetNum} words).
- Expand each variant with a captivating hook, descriptive body paragraphs about the subject, a direct call to action, and 4-6 hashtags about the image topic.

CRITICAL CONSTRAINTS:
1. Subject: Exclusively about "${prompt}".
2. Tone: "${tone}".
3. Word Count: Between ${minWords} and ${maxWords} words per caption.
4. Format Style: "${format}".
5. Hashtags: 4-6 hashtags related directly to the visual subject.

Return ONLY a raw JSON object with keys:
{
  "punchy": "High-impact caption about '${prompt}' containing ${minWords}-${maxWords} words in ${format} format.",
  "story": "Narrative or moment-in-time caption about '${prompt}' containing ${minWords}-${maxWords} words in ${format} format.",
  "value": "Value-packed or experiential caption about '${prompt}' containing ${minWords}-${maxWords} words in ${format} format."
}`;

  const genAI = getGenAI();
  if (genAI) {
    for (const modelName of GENERATION_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.7, responseMimeType: 'application/json' },
          systemInstruction
        });

        const res = await withTimeout(model.generateContent(`Generate 3 distinct captions about "${prompt}". Each caption MUST be strictly between ${minWords} and ${maxWords} words in format "${format}".`), 5500);
        const text = res.response.text().replace(/```json/gi, '').replace(/```/g, '').trim();
        const parsed = JSON.parse(text);
        if (parsed.punchy && parsed.story && parsed.value) {
          return parsed;
        }
      } catch (err: any) {
        // Try next model
      }
    }
  }

  // Pure contextual subject fallback
  return generateContextualSubjectCaptions({ prompt, targetNum, format });
}

// 5. Contextual Intent Support Engine
export function getContextualSupportAnswer(
  userQuery: string,
  role: string = 'designer',
  plan: string = 'free',
  currentPage: string = ''
): string {
  const q = userQuery.toLowerCase().trim();

  // 1. Where / How to generate images
  if (
    q.includes('where should i generate') ||
    q.includes('where to generate') ||
    q.includes('how to generate') ||
    q.includes('generate image') ||
    q.includes('create image') ||
    q.includes('make image') ||
    q.includes('ai generator') ||
    q.includes('flux') ||
    q.includes('diffusion') ||
    q.includes('new image') ||
    q.includes('prompt')
  ) {
    return "To generate new AI marketing visuals, click 'AI Generator' on the left navigation bar (/creator/generator). Enter your creative prompt, pick your style and platform aspect ratio (e.g. 1:1 Square, 9:16 Story), and click 'Synthesize Diffusion Visual'!";
  }

  // 2. Text / Typography in visuals
  if (
    q.includes('no text') ||
    q.includes('why is there no text') ||
    q.includes('without text') ||
    q.includes('words in image') ||
    q.includes('letters') ||
    q.includes('typography') ||
    q.includes('heading') ||
    q.includes('fonts') ||
    q.includes('add text') ||
    q.includes('edit text')
  ) {
    return "Generated diffusion backdrops are intentionally created without embedded text to prevent garbled or blurry lettering. You can add, edit, and style live crisp vector typography (with 10+ Google Fonts, glowing effects, and shadows) directly in the 'Design Studio' (/creator/editor)!";
  }

  // 3. Saving & Asset Vault / Library
  if (
    q.includes('save') ||
    q.includes('asset library') ||
    q.includes('library') ||
    q.includes('vault') ||
    q.includes('where is my image') ||
    q.includes('saved image') ||
    q.includes('storage')
  ) {
    return "To save your visual, click 'Save to Library' at the top right of the Design Studio. You can view, preview, re-edit, or download all your saved visuals anytime in the 'Asset Library' (/creator/assets)!";
  }

  // 4. Design Studio / Canva editor
  if (
    q.includes('design studio') ||
    q.includes('canva') ||
    q.includes('edit') ||
    q.includes('editor') ||
    q.includes('shapes') ||
    q.includes('filter') ||
    q.includes('brightness') ||
    q.includes('layer') ||
    q.includes('insert image') ||
    q.includes('upload')
  ) {
    return "The 'Design Studio' (/creator/editor) gives you a Canva-like workspace to upload custom images, add typography presets, draw geometric shapes and badges, adjust photo lighting filters, and manage multi-layer layouts!";
  }

  // 5. Exporting & Downloading
  if (
    q.includes('download') ||
    q.includes('export') ||
    q.includes('png') ||
    q.includes('jpg') ||
    q.includes('jpeg') ||
    q.includes('webp') ||
    q.includes('ultra-hd') ||
    q.includes('resolution')
  ) {
    return "In the Design Studio, click the 'Export' dropdown button on the top toolbar to download your design as PNG, Ultra-HD 2x 4K, JPEG, WebP, or copy the image directly to your clipboard!";
  }

  // 6. Brand Kit & Guidelines
  if (
    q.includes('brand kit') ||
    q.includes('brand rule') ||
    q.includes('guideline') ||
    q.includes('colors') ||
    q.includes('logo') ||
    q.includes('upload pdf') ||
    q.includes('rules')
  ) {
    return "You can configure your brand rules in the 'Brand Kit' section (/business/brand-kit). Upload your PDF, DOCX, or text brand guidelines to automatically enforce brand palettes, typography, and tone across your generated assets.";
  }

  // 7. Templates
  if (
    q.includes('template') ||
    q.includes('preset') ||
    q.includes('layouts') ||
    q.includes('ready made')
  ) {
    return "Explore ready-to-use multi-channel design layouts in the 'Templates' gallery (/creator/templates). Simply click 'Customize in Editor' on any template to adapt it with your brand assets!";
  }

  // 8. Captions & Social Media
  if (
    q.includes('caption') ||
    q.includes('instagram') ||
    q.includes('hashtag') ||
    q.includes('social media') ||
    q.includes('post')
  ) {
    return "You can generate tailored Instagram captions with targeted hashtags by clicking 'Create Instagram Post' or 'Generate Captions' on any asset in the Asset Library or Template Gallery!";
  }

  // 9. Campaigns & Approvals
  if (
    q.includes('campaign') ||
    q.includes('approval') ||
    q.includes('review') ||
    q.includes('workflow') ||
    q.includes('submit for review')
  ) {
    return "In the Business workspace, you can organize creative initiatives using 'Campaigns' and manage multi-stage team 'Approvals' where Brand Admins and Approvers review and approve designs.";
  }

  // 10. Pricing & Plans
  if (
    q.includes('price') ||
    q.includes('pricing') ||
    q.includes('pro') ||
    q.includes('enterprise') ||
    q.includes('plan') ||
    q.includes('upgrade') ||
    q.includes('cost') ||
    q.includes('free')
  ) {
    return "AetherDesign features Free, Pro, and Enterprise plans. Pro includes unlimited Flux Schnell visual generation and Canva Studio exports, while Enterprise unlocks multi-seat workspaces, Brand Kit RAG enforcement, and automated publishing!";
  }

  // 11. Greetings & Identity
  if (
    q.includes('hello') ||
    q.includes('hi') ||
    q.includes('hey') ||
    q.includes('who are you') ||
    q.includes('help')
  ) {
    return "Hello! I am your Aether AI assistant. I can guide you on generating visuals with AI, designing in the Canva-like Studio, configuring Brand Kits, or managing campaigns. What would you like to build today?";
  }

  // 12. General fallback
  return `You can generate visuals in 'AI Generator', customize them with typography and shapes in 'Design Studio', and manage your files in 'Asset Library'. Let me know if you need help with a specific feature!`;
}

// 5. Support Agent
export async function generateSupportResponse(params: {
  messages: Array<{ role: 'user' | 'assistant'; content: string }>;
  role: string;
  plan: string;
  currentPage: string;
}): Promise<{ reply: string; shouldEscalate: boolean }> {
  const { messages, role, plan, currentPage } = params;
  const lastUserMessage = messages[messages.length - 1]?.content || 'How can I use AetherDesign?';

  const systemInstruction = `You are the AetherDesign AI Support Assistant.
Context:
- User Role: ${role}
- Plan: ${plan}
- Current Page: ${currentPage}

Product Knowledge & Guidance:
1. 'AI Generator' (/creator/generator): Where users type prompts to synthesize AI diffusion imagery using Flux Schnell with custom aspect ratios (Square, Story, Landscape).
2. 'Design Studio' (/creator/editor): Canva-like interactive canvas where users edit text, insert uploaded photos, add Google Fonts, draw shapes, and adjust lighting filters.
3. Generated diffusion visuals contain NO embedded text by design (to prevent garbled letters); live typography is added in Design Studio.
4. 'Asset Library' (/creator/assets): Where saved assets and designs are stored, previewed, and exported.
5. 'Brand Kit' (/business/brand-kit): Where business users upload guidelines (PDF/DOCX/text) to enforce brand rules.
6. Answer the user's specific question concisely in 2 to 3 friendly, direct sentences. Tell them the exact tab, button, or URL to use.`;

  const shouldEscalate =
    lastUserMessage.toLowerCase().includes('bug') ||
    lastUserMessage.toLowerCase().includes('billing') ||
    lastUserMessage.toLowerCase().includes('talk to human') ||
    lastUserMessage.toLowerCase().includes('broken') ||
    lastUserMessage.toLowerCase().includes('agent');

  const genAI = getGenAI();
  if (genAI) {
    for (const modelName of GENERATION_MODELS) {
      try {
        const model = genAI.getGenerativeModel({
          model: modelName,
          generationConfig: { temperature: 0.4 },
          systemInstruction,
        });

        const historyFormatted = messages
          .slice(-6)
          .map((m) => `${m.role.toUpperCase()}: ${m.content}`)
          .join('\n');

        const res = await withTimeout(
          model.generateContent(
            `Conversation history:\n${historyFormatted}\n\nUSER: ${lastUserMessage}`
          ),
          5000
        );
        const reply = res.response.text().trim();
        if (reply && reply.length > 5) {
          return { reply, shouldEscalate };
        }
      } catch (err: any) {
        // Try next model or fallback
      }
    }
  }

  // Pure contextual topic matching fallback
  const fallbackAnswer = getContextualSupportAnswer(lastUserMessage, role, plan, currentPage);
  return {
    reply: fallbackAnswer,
    shouldEscalate,
  };
}
