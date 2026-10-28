import React, { useState, useRef, useEffect } from 'react';
import { TextElement } from '../../types/editor';

interface TextLayerRendererProps {
  element: TextElement;
  isSelected: boolean;
  onUpdate: (updates: Partial<TextElement>) => void;
  onSelect: () => void;
}

export const TextLayerRenderer: React.FC<TextLayerRendererProps> = ({
  element,
  isSelected,
  onUpdate,
  onSelect,
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  const handleDoubleClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsEditing(true);
  };

  const handleBlur = () => {
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
    if (e.key === 'Escape') {
      setIsEditing(false);
    }
  };

  // Text Effects styling
  let effectStyle: React.CSSProperties = {};
  let effectClass = '';

  if (element.effect === 'shadow') {
    effectClass = 'drop-shadow-[0_8px_16px_rgba(0,0,0,0.7)]';
  } else if (element.effect === 'glow') {
    effectClass = 'drop-shadow-[0_0_18px_rgba(139,92,246,0.85)]';
  } else if (element.effect === 'neon') {
    effectClass = 'drop-shadow-[0_0_12px_rgba(6,182,212,0.9)]';
  } else if (element.effect === 'lift') {
    effectClass = 'drop-shadow-[0_12px_24px_rgba(45,27,105,0.4)]';
  } else if (element.effect === 'glass') {
    effectClass = 'bg-white/20 backdrop-blur-md border border-white/40 shadow-sm rounded-2xl px-4 py-2';
  } else if (element.effect === 'outline') {
    effectStyle = {
      WebkitTextStroke: `${element.strokeWidth || 2}px ${element.strokeColor || '#000000'}`,
    };
  }

  const containerStyle: React.CSSProperties = {
    fontSize: `${element.fontSize}px`,
    fontFamily: `"${element.fontFamily || 'Poppins'}", sans-serif`,
    fontWeight: element.fontWeight || '700',
    fontStyle: element.fontStyle || 'normal',
    textDecoration: element.textDecoration || 'none',
    color: element.color || '#FFFFFF',
    textAlign: element.alignment || 'left',
    letterSpacing: `${element.letterSpacing || 0}px`,
    lineHeight: element.lineHeight || 1.2,
    textTransform: element.textTransform || 'none',
    backgroundColor: element.backgroundColor || 'transparent',
    ...effectStyle,
  };

  if (isEditing) {
    return (
      <div className="w-full h-full flex items-center justify-center p-1">
        <textarea
          ref={inputRef}
          value={element.content}
          onChange={(e) => onUpdate({ content: e.target.value })}
          onBlur={handleBlur}
          onKeyDown={handleKeyDown}
          style={containerStyle}
          className="w-full h-full bg-black/40 text-white rounded outline-none resize-none border border-aether-primary/80 p-2 leading-tight"
        />
      </div>
    );
  }

  return (
    <div
      onDoubleClick={handleDoubleClick}
      style={containerStyle}
      className={`w-full h-full flex flex-col justify-center whitespace-pre-wrap select-none break-words ${effectClass}`}
    >
      {element.content}
    </div>
  );
};
