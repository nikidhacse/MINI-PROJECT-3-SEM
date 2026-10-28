import React from 'react';
import { ShapeElement } from '../../types/editor';

interface ShapeLayerRendererProps {
  element: ShapeElement;
  isSelected: boolean;
}

export const ShapeLayerRenderer: React.FC<ShapeLayerRendererProps> = ({
  element,
}) => {
  const { shapeType, fillColor, gradientFill, strokeColor, strokeWidth, borderRadius, shadow } = element;

  let shadowClass = '';
  if (shadow === 'subtle') shadowClass = 'drop-shadow-[0_4px_8px_rgba(0,0,0,0.15)]';
  if (shadow === 'medium') shadowClass = 'drop-shadow-[0_8px_20px_rgba(0,0,0,0.3)]';
  if (shadow === 'dramatic') shadowClass = 'drop-shadow-[0_16px_36px_rgba(0,0,0,0.5)]';
  if (shadow === 'glow') shadowClass = 'drop-shadow-[0_0_24px_rgba(139,92,246,0.6)]';

  const fillStyle = gradientFill ? { background: gradientFill } : { backgroundColor: fillColor };

  // SVG-based shapes for complex geometries
  if (shapeType === 'triangle') {
    return (
      <div className={`w-full h-full pointer-events-none ${shadowClass}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polygon
            points="50,0 100,100 0,100"
            fill={gradientFill ? 'url(#grad)' : fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      </div>
    );
  }

  if (shapeType === 'star') {
    return (
      <div className={`w-full h-full pointer-events-none ${shadowClass}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polygon
            points="50,0 63,35 100,35 70,57 82,92 50,70 18,92 30,57 0,35 37,35"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      </div>
    );
  }

  if (shapeType === 'badge') {
    return (
      <div className={`w-full h-full pointer-events-none ${shadowClass}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polygon
            points="50,0 62,7 75,3 82,15 95,18 97,32 100,45 95,58 97,71 85,78 80,91 67,93 56,100 44,97 33,100 22,91 16,80 4,73 5,60 0,48 5,35 3,22 15,17 21,5 34,7 44,0"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      </div>
    );
  }

  if (shapeType === 'heart') {
    return (
      <div className={`w-full h-full pointer-events-none ${shadowClass}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M50,25 C50,10 20,0 10,25 C0,50 30,75 50,95 C70,75 100,50 90,25 C80,0 50,10 50,25 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      </div>
    );
  }

  if (shapeType === 'arrow') {
    return (
      <div className={`w-full h-full pointer-events-none ${shadowClass}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <polygon
            points="0,35 60,35 60,10 100,50 60,90 60,65 0,65"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      </div>
    );
  }

  if (shapeType === 'speech') {
    return (
      <div className={`w-full h-full pointer-events-none ${shadowClass}`}>
        <svg viewBox="0 0 100 100" className="w-full h-full" preserveAspectRatio="none">
          <path
            d="M10,10 Q10,0 20,0 L80,0 Q90,0 90,10 L90,60 Q90,70 80,70 L35,70 L15,95 L20,70 L10,70 Q10,60 10,60 Z"
            fill={fillColor}
            stroke={strokeColor}
            strokeWidth={strokeWidth}
          />
        </svg>
      </div>
    );
  }

  if (shapeType === 'line') {
    return (
      <div className={`w-full h-full flex items-center pointer-events-none ${shadowClass}`}>
        <div
          style={{
            backgroundColor: strokeColor || fillColor,
            height: `${Math.max(2, strokeWidth || 4)}px`,
            borderRadius: `${borderRadius || 2}px`,
          }}
          className="w-full"
        />
      </div>
    );
  }

  // Box shapes (rect, rounded, circle, pill)
  let radiusStyle = '';
  if (shapeType === 'circle') radiusStyle = '50%';
  else if (shapeType === 'pill') radiusStyle = '9999px';
  else if (shapeType === 'rounded') radiusStyle = `${borderRadius || 24}px`;
  else radiusStyle = '0px';

  return (
    <div
      style={{
        ...fillStyle,
        borderRadius: radiusStyle,
        border: strokeWidth > 0 ? `${strokeWidth}px solid ${strokeColor}` : 'none',
      }}
      className={`w-full h-full pointer-events-none ${shadowClass}`}
    />
  );
};
