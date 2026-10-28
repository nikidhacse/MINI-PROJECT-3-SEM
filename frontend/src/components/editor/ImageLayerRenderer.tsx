import React from 'react';
import { ImageElement } from '../../types/editor';

interface ImageLayerRendererProps {
  element: ImageElement;
  isSelected: boolean;
}

export const ImageLayerRenderer: React.FC<ImageLayerRendererProps> = ({
  element,
}) => {
  const f = element.filter || {
    brightness: 100,
    contrast: 100,
    saturation: 100,
    blur: 0,
    sepia: 0,
    grayscale: 0,
    hueRotate: 0,
  };

  const filterString = `brightness(${f.brightness}%) contrast(${f.contrast}%) saturate(${f.saturation}%) blur(${f.blur}px) sepia(${f.sepia}%) grayscale(${f.grayscale}%) hue-rotate(${f.hueRotate}deg)`;

  let shadowClass = '';
  if (element.shadow === 'subtle') shadowClass = 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]';
  if (element.shadow === 'medium') shadowClass = 'drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)]';
  if (element.shadow === 'dramatic') shadowClass = 'drop-shadow-[0_16px_36px_rgba(0,0,0,0.5)]';
  if (element.shadow === 'glow') shadowClass = 'drop-shadow-[0_0_24px_rgba(139,92,246,0.6)]';

  const transformString = `${element.flipH ? 'scaleX(-1)' : ''} ${element.flipV ? 'scaleY(-1)' : ''}`.trim();

  return (
    <div
      style={{
        borderRadius: `${element.borderRadius || 0}px`,
        border: element.borderWidth > 0 ? `${element.borderWidth}px solid ${element.borderColor}` : 'none',
      }}
      className={`w-full h-full overflow-hidden select-none pointer-events-none ${shadowClass}`}
    >
      <img
        src={element.src}
        alt={element.name}
        crossOrigin="anonymous"
        style={{
          filter: filterString,
          transform: transformString || undefined,
        }}
        className="w-full h-full object-cover pointer-events-none"
        draggable={false}
      />
    </div>
  );
};
