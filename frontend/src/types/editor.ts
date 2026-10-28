export type ElementType = 'text' | 'image' | 'shape';

export interface BaseElement {
  id: string;
  name: string;
  type: ElementType;
  x: number;
  y: number;
  width: number;
  height: number;
  rotation: number; // degrees 0-360
  opacity: number; // 0 to 1
  zIndex: number;
  locked?: boolean;
  hidden?: boolean;
}

export interface TextElement extends BaseElement {
  type: 'text';
  content: string;
  fontSize: number;
  fontFamily: string;
  fontWeight: '300' | '400' | '500' | '600' | '700' | '800' | '900';
  fontStyle?: 'normal' | 'italic';
  textDecoration?: 'none' | 'underline';
  color: string;
  backgroundColor?: string; // highlight badge / pill background
  alignment: 'left' | 'center' | 'right' | 'justify';
  letterSpacing: number;
  lineHeight: number;
  textTransform?: 'none' | 'uppercase' | 'lowercase' | 'capitalize';
  effect: 'none' | 'shadow' | 'glow' | 'glass' | 'outline' | 'neon' | 'lift';
  strokeColor?: string;
  strokeWidth?: number;
}

export interface ImageFilterSettings {
  brightness: number; // 50 to 150 (default 100)
  contrast: number;   // 50 to 150 (default 100)
  saturation: number; // 0 to 200 (default 100)
  blur: number;       // 0 to 20 (default 0)
  sepia: number;      // 0 to 100 (default 0)
  grayscale: number;  // 0 to 100 (default 0)
  hueRotate: number;  // 0 to 360 (default 0)
}

export interface ImageElement extends BaseElement {
  type: 'image';
  src: string;
  borderRadius: number;
  borderWidth: number;
  borderColor: string;
  shadow: 'none' | 'subtle' | 'medium' | 'dramatic' | 'glow';
  flipH?: boolean;
  flipV?: boolean;
  filter: ImageFilterSettings;
}

export type ShapeKind =
  | 'rectangle'
  | 'rounded'
  | 'circle'
  | 'pill'
  | 'triangle'
  | 'star'
  | 'badge'
  | 'heart'
  | 'arrow'
  | 'speech'
  | 'line';

export interface ShapeElement extends BaseElement {
  type: 'shape';
  shapeType: ShapeKind;
  fillColor: string;
  gradientFill?: string; // e.g. "linear-gradient(135deg, #8B5CF6, #EC4899)"
  strokeColor: string;
  strokeWidth: number;
  borderRadius: number;
  shadow: 'none' | 'subtle' | 'medium' | 'dramatic' | 'glow';
}

export type StudioElement = TextElement | ImageElement | ShapeElement;

export interface CanvasBackdropSettings {
  image: string;
  backgroundColor: string; // solid or gradient
  showBackdrop: boolean;
  fit: 'cover' | 'contain' | 'fill';
  scale: number;
  offsetX: number;
  offsetY: number;
  flipH: boolean;
  flipV: boolean;
  filter: ImageFilterSettings;
}

export interface CanvasDimensions {
  id: string;
  name: string;
  width: number;
  height: number;
  icon?: string;
  aspectRatio: string;
}

export const CANVAS_PRESETS: CanvasDimensions[] = [
  { id: 'ig_square', name: 'Instagram Post (Square)', width: 1080, height: 1080, aspectRatio: '1:1' },
  { id: 'ig_story', name: 'Instagram Story / Reel', width: 1080, height: 1920, aspectRatio: '9:16' },
  { id: 'fb_post', name: 'Facebook Feed Post', width: 1200, height: 630, aspectRatio: '1.91:1' },
  { id: 'tw_post', name: 'Twitter / X Banner', width: 1200, height: 675, aspectRatio: '16:9' },
  { id: 'yt_thumb', name: 'YouTube Thumbnail', width: 1280, height: 720, aspectRatio: '16:9' },
  { id: 'linkedin_post', name: 'LinkedIn Post', width: 1200, height: 627, aspectRatio: '1.91:1' },
  { id: 'pinterest_pin', name: 'Pinterest Standard Pin', width: 1000, height: 1500, aspectRatio: '2:3' },
];

export const BRAND_PALETTES = [
  '#8B5CF6',
  '#C4B5FD',
  '#A78BFA',
  '#6D28D9',
  '#2D1B69',
  '#FFFFFF',
  '#000000',
  '#EF4444',
  '#F59E0B',
  '#10B981',
  '#06B6D4',
  '#EC4899',
  '#F43F5E',
  '#84CC16',
  '#3B82F6',
  '#64748B'
];

export const GRADIENT_PRESETS = [
  'linear-gradient(135deg, #8B5CF6 0%, #EC4899 100%)',
  'linear-gradient(135deg, #3B82F6 0%, #2DD4BF 100%)',
  'linear-gradient(135deg, #F59E0B 0%, #EF4444 100%)',
  'linear-gradient(135deg, #10B981 0%, #3B82F6 100%)',
  'linear-gradient(135deg, #2D1B69 0%, #8B5CF6 100%)',
  'linear-gradient(135deg, #000000 0%, #434343 100%)',
  'linear-gradient(135deg, #FA709A 0%, #FEE140 100%)',
  'linear-gradient(135deg, #667EEA 0%, #764BA2 100%)'
];

export const AVAILABLE_FONTS = [
  { label: 'Poppins (Modern Clean)', value: 'Poppins' },
  { label: 'Inter (UI Precision)', value: 'Inter' },
  { label: 'Montserrat (Geometric)', value: 'Montserrat' },
  { label: 'Playfair Display (Luxury Serif)', value: 'Playfair Display' },
  { label: 'Space Grotesk (Tech / Cyber)', value: 'Space Grotesk' },
  { label: 'Bebas Neue (Impact Headline)', value: 'Bebas Neue' },
  { label: 'Oswald (Punchy Bold)', value: 'Oswald' },
  { label: 'Pacifico (Handwritten Script)', value: 'Pacifico' },
  { label: 'Plus Jakarta Sans (Elite Modern)', value: 'Plus Jakarta Sans' },
  { label: 'Roboto (Standard Classic)', value: 'Roboto' }
];
