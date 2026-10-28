import { StudioElement, CanvasBackdropSettings, TextElement, ImageElement, ShapeElement } from '../types/editor';

interface RenderOptions {
  width: number;
  height: number;
  scale?: number; // 1 for 1x, 2 for 2x HD
  backdrop: CanvasBackdropSettings;
  elements: StudioElement[];
}

/**
 * Load an HTML image element asynchronously with cross-origin handling
 */
const loadImage = (src: string): Promise<HTMLImageElement> => {
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.crossOrigin = 'anonymous';
    img.onload = () => resolve(img);
    img.onerror = () => {
      // Fallback without crossOrigin if CORS issues occur on some servers
      const fallbackImg = new Image();
      fallbackImg.onload = () => resolve(fallbackImg);
      fallbackImg.onerror = (err) => reject(err);
      fallbackImg.src = src;
    };
    img.src = src;
  });
};

/**
 * Draw a rounded rectangle path
 */
const drawRoundedRect = (
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  w: number,
  h: number,
  r: number
) => {
  const radius = Math.max(0, Math.min(r, w / 2, h / 2));
  ctx.beginPath();
  ctx.moveTo(x + radius, y);
  ctx.lineTo(x + w - radius, y);
  ctx.arcTo(x + w, y, x + w, y + radius, radius);
  ctx.lineTo(x + w, y + h - radius);
  ctx.arcTo(x + w, y + h, x + w - radius, y + h, radius);
  ctx.lineTo(x + radius, y + h);
  ctx.arcTo(x, y + h, x, y + h - radius, radius);
  ctx.lineTo(x, y + radius);
  ctx.arcTo(x, y, x + radius, y, radius);
  ctx.closePath();
};

/**
 * Draw custom shape geometries
 */
const drawShapePath = (
  ctx: CanvasRenderingContext2D,
  shapeType: ShapeElement['shapeType'],
  w: number,
  h: number,
  radius: number
) => {
  ctx.beginPath();
  switch (shapeType) {
    case 'circle': {
      ctx.ellipse(w / 2, h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      break;
    }
    case 'pill': {
      const r = Math.min(w, h) / 2;
      drawRoundedRect(ctx, 0, 0, w, h, r);
      break;
    }
    case 'rounded': {
      drawRoundedRect(ctx, 0, 0, w, h, radius || 20);
      break;
    }
    case 'rectangle': {
      ctx.rect(0, 0, w, h);
      break;
    }
    case 'triangle': {
      ctx.moveTo(w / 2, 0);
      ctx.lineTo(w, h);
      ctx.lineTo(0, h);
      ctx.closePath();
      break;
    }
    case 'star': {
      const cx = w / 2;
      const cy = h / 2;
      const outerRadius = Math.min(w, h) / 2;
      const innerRadius = outerRadius * 0.45;
      const spikes = 5;
      let rot = (Math.PI / 2) * 3;
      const step = Math.PI / spikes;

      ctx.moveTo(cx, cy - outerRadius);
      for (let i = 0; i < spikes; i++) {
        let x = cx + Math.cos(rot) * outerRadius;
        let y = cy + Math.sin(rot) * outerRadius;
        ctx.lineTo(x, y);
        rot += step;

        x = cx + Math.cos(rot) * innerRadius;
        y = cy + Math.sin(rot) * innerRadius;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.lineTo(cx, cy - outerRadius);
      ctx.closePath();
      break;
    }
    case 'badge': {
      // 12-point burst badge
      const cx = w / 2;
      const cy = h / 2;
      const outerRadius = Math.min(w, h) / 2;
      const innerRadius = outerRadius * 0.8;
      const points = 12;
      const step = Math.PI / points;
      let rot = 0;

      ctx.moveTo(cx + outerRadius, cy);
      for (let i = 0; i < points * 2; i++) {
        const r = i % 2 === 0 ? outerRadius : innerRadius;
        const x = cx + Math.cos(rot) * r;
        const y = cy + Math.sin(rot) * r;
        ctx.lineTo(x, y);
        rot += step;
      }
      ctx.closePath();
      break;
    }
    case 'heart': {
      const topCurveHeight = h * 0.3;
      ctx.moveTo(w / 2, h / 5);
      // top left curve
      ctx.bezierCurveTo(w / 2, 0, 0, 0, 0, topCurveHeight);
      // bottom left curve
      ctx.bezierCurveTo(0, (h + topCurveHeight) / 2, w / 2, (h + topCurveHeight) / 2, w / 2, h);
      // bottom right curve
      ctx.bezierCurveTo(w / 2, (h + topCurveHeight) / 2, w, (h + topCurveHeight) / 2, w, topCurveHeight);
      // top right curve
      ctx.bezierCurveTo(w, 0, w / 2, 0, w / 2, h / 5);
      ctx.closePath();
      break;
    }
    case 'arrow': {
      const shaftH = h * 0.35;
      const headW = w * 0.4;
      const shaftY = (h - shaftH) / 2;

      ctx.moveTo(0, shaftY);
      ctx.lineTo(w - headW, shaftY);
      ctx.lineTo(w - headW, 0);
      ctx.lineTo(w, h / 2);
      ctx.lineTo(w - headW, h);
      ctx.lineTo(w - headW, shaftY + shaftH);
      ctx.lineTo(0, shaftY + shaftH);
      ctx.closePath();
      break;
    }
    case 'speech': {
      const bodyH = h * 0.75;
      const r = radius || 16;
      drawRoundedRect(ctx, 0, 0, w, bodyH, r);
      // speech tail
      ctx.moveTo(w * 0.2, bodyH);
      ctx.lineTo(w * 0.1, h);
      ctx.lineTo(w * 0.4, bodyH);
      ctx.closePath();
      break;
    }
    case 'line': {
      ctx.rect(0, (h - 4) / 2, w, Math.max(2, h * 0.1));
      break;
    }
    default:
      ctx.rect(0, 0, w, h);
  }
};

/**
 * Build CSS filter string
 */
const buildFilterString = (f: ImageElement['filter']): string => {
  return `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) sepia(${f.sepia}%) grayscale(${f.grayscale}%) hue-rotate(${f.hueRotate}deg)`;
};

/**
 * Apply shadow styling to context
 */
const applyShadow = (ctx: CanvasRenderingContext2D, shadowType: string, scale: number) => {
  if (shadowType === 'subtle') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    ctx.shadowBlur = 8 * scale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 4 * scale;
  } else if (shadowType === 'medium') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.4)';
    ctx.shadowBlur = 16 * scale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 8 * scale;
  } else if (shadowType === 'dramatic') {
    ctx.shadowColor = 'rgba(0, 0, 0, 0.65)';
    ctx.shadowBlur = 30 * scale;
    ctx.shadowOffsetX = 4 * scale;
    ctx.shadowOffsetY = 12 * scale;
  } else if (shadowType === 'glow') {
    ctx.shadowColor = 'rgba(139, 92, 246, 0.85)';
    ctx.shadowBlur = 24 * scale;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  } else {
    ctx.shadowColor = 'transparent';
    ctx.shadowBlur = 0;
    ctx.shadowOffsetX = 0;
    ctx.shadowOffsetY = 0;
  }
};

/**
 * Render the full composite to an HTML5 Canvas element
 */
export const renderCompositeCanvas = async (options: RenderOptions): Promise<HTMLCanvasElement> => {
  const { width, height, scale = 1, backdrop, elements } = options;

  const canvas = document.createElement('canvas');
  canvas.width = width * scale;
  canvas.height = height * scale;
  const ctx = canvas.getContext('2d');

  if (!ctx) {
    throw new Error('Canvas 2D context not supported');
  }

  // Set crisp rendering
  ctx.imageSmoothingEnabled = true;
  ctx.imageSmoothingQuality = 'high';

  // 1. Draw Canvas Background (Solid or Gradient)
  if (backdrop.backgroundColor) {
    if (backdrop.backgroundColor.includes('gradient')) {
      const gradient = ctx.createLinearGradient(0, 0, canvas.width, canvas.height);
      if (backdrop.backgroundColor.includes('#8B5CF6') && backdrop.backgroundColor.includes('#EC4899')) {
        gradient.addColorStop(0, '#8B5CF6');
        gradient.addColorStop(1, '#EC4899');
      } else if (backdrop.backgroundColor.includes('#3B82F6')) {
        gradient.addColorStop(0, '#3B82F6');
        gradient.addColorStop(1, '#2DD4BF');
      } else if (backdrop.backgroundColor.includes('#F59E0B')) {
        gradient.addColorStop(0, '#F59E0B');
        gradient.addColorStop(1, '#EF4444');
      } else {
        gradient.addColorStop(0, '#2D1B69');
        gradient.addColorStop(1, '#8B5CF6');
      }
      ctx.fillStyle = gradient;
    } else {
      ctx.fillStyle = backdrop.backgroundColor;
    }
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  } else {
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, canvas.width, canvas.height);
  }

  // 2. Draw Backdrop Image if enabled and provided
  if (backdrop.showBackdrop && backdrop.image) {
    try {
      const bgImg = await loadImage(backdrop.image);
      ctx.save();

      // Apply Backdrop Filters
      if (backdrop.filter) {
        ctx.filter = buildFilterString(backdrop.filter);
      }

      // Flip transforms
      const flipScaleX = backdrop.flipH ? -1 : 1;
      const flipScaleY = backdrop.flipV ? -1 : 1;

      ctx.translate(
        (canvas.width / 2) + (backdrop.offsetX * scale),
        (canvas.height / 2) + (backdrop.offsetY * scale)
      );
      ctx.scale(flipScaleX * (backdrop.scale || 1), flipScaleY * (backdrop.scale || 1));

      // Draw centered
      ctx.drawImage(
        bgImg,
        -canvas.width / 2,
        -canvas.height / 2,
        canvas.width,
        canvas.height
      );

      ctx.restore();
    } catch (err) {
      console.warn('Could not load backdrop image for composite rendering:', err);
    }
  }

  // 3. Sort elements by zIndex
  const sortedElements = [...elements]
    .filter(el => !el.hidden)
    .sort((a, b) => a.zIndex - b.zIndex);

  // 4. Draw Elements in order
  for (const el of sortedElements) {
    ctx.save();

    const elX = el.x * scale;
    const elY = el.y * scale;
    const elW = el.width * scale;
    const elH = el.height * scale;

    // Apply translation & rotation around element center
    ctx.translate(elX + elW / 2, elY + elH / 2);
    if (el.rotation) {
      ctx.rotate((el.rotation * Math.PI) / 180);
    }
    ctx.translate(-elW / 2, -elH / 2);

    ctx.globalAlpha = el.opacity ?? 1;

    // A. Shape Element
    if (el.type === 'shape') {
      const shape = el as ShapeElement;
      applyShadow(ctx, shape.shadow, scale);

      drawShapePath(ctx, shape.shapeType, elW, elH, (shape.borderRadius || 0) * scale);

      // Fill shape
      if (shape.gradientFill) {
        const grad = ctx.createLinearGradient(0, 0, elW, elH);
        grad.addColorStop(0, '#8B5CF6');
        grad.addColorStop(1, '#EC4899');
        ctx.fillStyle = grad;
      } else {
        ctx.fillStyle = shape.fillColor || '#8B5CF6';
      }
      ctx.fill();

      // Stroke shape
      if (shape.strokeWidth > 0 && shape.strokeColor) {
        ctx.lineWidth = shape.strokeWidth * scale;
        ctx.strokeStyle = shape.strokeColor;
        ctx.stroke();
      }
    }

    // B. Image Element
    else if (el.type === 'image') {
      const imgEl = el as ImageElement;
      try {
        const imgObj = await loadImage(imgEl.src);
        applyShadow(ctx, imgEl.shadow, scale);

        // Apply Image Filters
        if (imgEl.filter) {
          ctx.filter = buildFilterString(imgEl.filter);
        }

        ctx.save();

        // Clip rounded rectangle / circular avatar if borderRadius is set
        if (imgEl.borderRadius > 0) {
          drawRoundedRect(ctx, 0, 0, elW, elH, imgEl.borderRadius * scale);
          ctx.clip();
        }

        // Horizontal / Vertical Flip
        const fX = imgEl.flipH ? -1 : 1;
        const fY = imgEl.flipV ? -1 : 1;
        if (imgEl.flipH || imgEl.flipV) {
          ctx.translate(elW / 2, elH / 2);
          ctx.scale(fX, fY);
          ctx.translate(-elW / 2, -elH / 2);
        }

        ctx.drawImage(imgObj, 0, 0, elW, elH);
        ctx.restore();

        // Draw Border
        if (imgEl.borderWidth > 0 && imgEl.borderColor) {
          ctx.lineWidth = imgEl.borderWidth * scale;
          ctx.strokeStyle = imgEl.borderColor;
          if (imgEl.borderRadius > 0) {
            drawRoundedRect(ctx, 0, 0, elW, elH, imgEl.borderRadius * scale);
            ctx.stroke();
          } else {
            ctx.strokeRect(0, 0, elW, elH);
          }
        }
      } catch (e) {
        console.warn('Could not render image layer:', imgEl.src, e);
      }
    }

    // C. Text Element
    else if (el.type === 'text') {
      const txt = el as TextElement;
      const fontSize = txt.fontSize * scale;
      const fontFamily = txt.fontFamily || 'Poppins';
      const fontWeight = txt.fontWeight || '700';
      const fontStyle = txt.fontStyle || 'normal';

      ctx.font = `${fontStyle} ${fontWeight} ${fontSize}px "${fontFamily}", sans-serif`;
      ctx.textAlign = txt.alignment === 'justify' ? 'left' : txt.alignment;
      ctx.textBaseline = 'top';

      // Split text into lines
      const lines = (txt.content || '').split('\n');
      const lineHeight = fontSize * (txt.lineHeight || 1.2);

      // Background highlight pill / banner
      if (txt.backgroundColor && txt.backgroundColor !== 'transparent') {
        ctx.fillStyle = txt.backgroundColor;
        drawRoundedRect(ctx, 0, 0, elW, elH, 8 * scale);
        ctx.fill();
      }

      // Glass Effect Box
      if (txt.effect === 'glass') {
        ctx.fillStyle = 'rgba(255, 255, 255, 0.22)';
        drawRoundedRect(ctx, 0, 0, elW, elH, 12 * scale);
        ctx.fill();
        ctx.lineWidth = 1.5 * scale;
        ctx.strokeStyle = 'rgba(255, 255, 255, 0.45)';
        ctx.stroke();
      }

      // Apply Text Effects
      if (txt.effect === 'shadow') {
        ctx.shadowColor = 'rgba(0, 0, 0, 0.8)';
        ctx.shadowBlur = 14 * scale;
        ctx.shadowOffsetX = 2 * scale;
        ctx.shadowOffsetY = 4 * scale;
      } else if (txt.effect === 'glow') {
        ctx.shadowColor = txt.color || '#8B5CF6';
        ctx.shadowBlur = 20 * scale;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } else if (txt.effect === 'neon') {
        ctx.shadowColor = '#06B6D4';
        ctx.shadowBlur = 25 * scale;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 0;
      } else if (txt.effect === 'lift') {
        ctx.shadowColor = 'rgba(45, 27, 105, 0.5)';
        ctx.shadowBlur = 20 * scale;
        ctx.shadowOffsetX = 0;
        ctx.shadowOffsetY = 10 * scale;
      }

      lines.forEach((lineText, idx) => {
        let drawText = lineText;
        if (txt.textTransform === 'uppercase') drawText = drawText.toUpperCase();
        if (txt.textTransform === 'lowercase') drawText = drawText.toLowerCase();

        let posX = 0;
        if (txt.alignment === 'center') posX = elW / 2;
        if (txt.alignment === 'right') posX = elW;

        const posY = idx * lineHeight + 4 * scale;

        // Text Stroke / Outline
        if (txt.effect === 'outline' || (txt.strokeWidth && txt.strokeWidth > 0)) {
          ctx.strokeStyle = txt.strokeColor || '#000000';
          ctx.lineWidth = (txt.strokeWidth || 3) * scale;
          ctx.strokeText(drawText, posX, posY);
        }

        // Fill Text
        ctx.fillStyle = txt.color || '#FFFFFF';
        ctx.fillText(drawText, posX, posY);

        // Underline
        if (txt.textDecoration === 'underline') {
          const metrics = ctx.measureText(drawText);
          const lineY = posY + fontSize + 2 * scale;
          ctx.lineWidth = Math.max(1, fontSize * 0.08);
          ctx.strokeStyle = txt.color || '#FFFFFF';
          ctx.beginPath();
          if (txt.alignment === 'center') {
            ctx.moveTo(posX - metrics.width / 2, lineY);
            ctx.lineTo(posX + metrics.width / 2, lineY);
          } else if (txt.alignment === 'right') {
            ctx.moveTo(posX - metrics.width, lineY);
            ctx.lineTo(posX, lineY);
          } else {
            ctx.moveTo(posX, lineY);
            ctx.lineTo(posX + metrics.width, lineY);
          }
          ctx.stroke();
        }
      });
    }

    ctx.restore();
  }

  return canvas;
};

/**
 * Export canvas to data URL with resilient CORS/tainted fallback
 */
export const exportCanvasToDataURL = async (
  options: RenderOptions,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png',
  quality: number = 0.92
): Promise<string> => {
  try {
    const canvas = await renderCompositeCanvas(options);
    return canvas.toDataURL(format, quality);
  } catch (err) {
    console.warn('Canvas toDataURL encountered an issue (e.g. cross-origin image), using safe fallback:', err);
    return options.backdrop.image || '';
  }
};

/**
 * Download composite file directly
 */
export const downloadCanvasFile = async (
  options: RenderOptions,
  filename: string,
  format: 'image/png' | 'image/jpeg' | 'image/webp' = 'image/png'
) => {
  const ext = format === 'image/jpeg' ? 'jpg' : format === 'image/webp' ? 'webp' : 'png';
  const dataUrl = await exportCanvasToDataURL(options, format);

  const link = document.createElement('a');
  link.href = dataUrl;
  link.download = `${filename}.${ext}`;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
};

/**
 * Copy composite image to clipboard
 */
export const copyCanvasToClipboard = async (options: RenderOptions): Promise<boolean> => {
  try {
    const canvas = await renderCompositeCanvas(options);
    return new Promise((resolve) => {
      canvas.toBlob(async (blob) => {
        if (!blob) {
          resolve(false);
          return;
        }
        try {
          await navigator.clipboard.write([
            new ClipboardItem({ 'image/png': blob })
          ]);
          resolve(true);
        } catch (err) {
          console.warn('Clipboard write failed:', err);
          resolve(false);
        }
      }, 'image/png');
    });
  } catch {
    return false;
  }
};
