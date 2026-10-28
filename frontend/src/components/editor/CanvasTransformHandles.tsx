import React, { useState, useEffect, useRef } from 'react';
import { RotateCw } from 'lucide-react';
import { StudioElement } from '../../types/editor';

interface CanvasTransformHandlesProps {
  element: StudioElement;
  zoom: number;
  onUpdate: (updates: Partial<StudioElement>) => void;
  onDragStart?: () => void;
  onDragEnd?: () => void;
}

type HandleType = 'nw' | 'ne' | 'se' | 'sw' | 'n' | 'e' | 's' | 'w' | 'rot';

export const CanvasTransformHandles: React.FC<CanvasTransformHandlesProps> = ({
  element,
  zoom,
  onUpdate,
}) => {
  const [activeHandle, setActiveHandle] = useState<HandleType | null>(null);
  const startPosRef = useRef<{ x: number; y: number; elX: number; elY: number; elW: number; elH: number; rot: number }>({
    x: 0,
    y: 0,
    elX: 0,
    elY: 0,
    elW: 0,
    elH: 0,
    rot: 0,
  });

  const handleMouseDown = (e: React.MouseEvent, type: HandleType) => {
    e.stopPropagation();
    e.preventDefault();
    setActiveHandle(type);
    startPosRef.current = {
      x: e.clientX,
      y: e.clientY,
      elX: element.x,
      elY: element.y,
      elW: element.width,
      elH: element.height,
      rot: element.rotation || 0,
    };
  };

  useEffect(() => {
    if (!activeHandle) return;

    const handleMouseMove = (e: MouseEvent) => {
      const { x: startX, y: startY, elX, elY, elW, elH, rot } = startPosRef.current;
      const dx = (e.clientX - startX) / zoom;
      const dy = (e.clientY - startY) / zoom;

      if (activeHandle === 'rot') {
        // Calculate angle from element center
        const centerX = elX + elW / 2;
        const centerY = elY + elH / 2;
        const currentMouseCanvasX = elX + elW / 2 + dx;
        const currentMouseCanvasY = elY + elH / 2 + dy;
        const rad = Math.atan2(currentMouseCanvasY - centerY, currentMouseCanvasX - centerX);
        let deg = Math.round((rad * 180) / Math.PI) + 90;
        if (deg < 0) deg += 360;
        onUpdate({ rotation: deg % 360 });
        return;
      }

      let newX = elX;
      let newY = elY;
      let newW = elW;
      let newH = elH;

      const minSize = 20;

      if (activeHandle.includes('e')) {
        newW = Math.max(minSize, elW + dx);
      }
      if (activeHandle.includes('s')) {
        newH = Math.max(minSize, elH + dy);
      }
      if (activeHandle.includes('w')) {
        const potentialW = elW - dx;
        if (potentialW >= minSize) {
          newW = potentialW;
          newX = elX + dx;
        }
      }
      if (activeHandle.includes('n')) {
        const potentialH = elH - dy;
        if (potentialH >= minSize) {
          newH = potentialH;
          newY = elY + dy;
        }
      }

      onUpdate({
        x: Math.round(newX),
        y: Math.round(newY),
        width: Math.round(newW),
        height: Math.round(newH),
      });
    };

    const handleMouseUp = () => {
      setActiveHandle(null);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };
  }, [activeHandle, element, zoom, onUpdate]);

  if (element.locked) return null;

  const handleClass =
    'absolute w-2.5 h-2.5 bg-white border-2 border-aether-primary rounded-full shadow-sm z-30 hover:scale-125 transition-transform';

  return (
    <div className="absolute inset-0 pointer-events-none border-2 border-aether-primary rounded-sm">
      {/* 4 Corner Handles */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'nw')}
        className={`${handleClass} -top-1.5 -left-1.5 cursor-nwse-resize pointer-events-auto`}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'ne')}
        className={`${handleClass} -top-1.5 -right-1.5 cursor-nesw-resize pointer-events-auto`}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'se')}
        className={`${handleClass} -bottom-1.5 -right-1.5 cursor-nwse-resize pointer-events-auto`}
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'sw')}
        className={`${handleClass} -bottom-1.5 -left-1.5 cursor-nesw-resize pointer-events-auto`}
      />

      {/* 4 Edge Handles */}
      <div
        onMouseDown={(e) => handleMouseDown(e, 'n')}
        className="absolute w-4 h-1.5 bg-white border border-aether-primary rounded-full -top-1 left-1/2 -translate-x-1/2 cursor-ns-resize pointer-events-auto shadow-sm"
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 's')}
        className="absolute w-4 h-1.5 bg-white border border-aether-primary rounded-full -bottom-1 left-1/2 -translate-x-1/2 cursor-ns-resize pointer-events-auto shadow-sm"
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'w')}
        className="absolute h-4 w-1.5 bg-white border border-aether-primary rounded-full top-1/2 -left-1 -translate-y-1/2 cursor-ew-resize pointer-events-auto shadow-sm"
      />
      <div
        onMouseDown={(e) => handleMouseDown(e, 'e')}
        className="absolute h-4 w-1.5 bg-white border border-aether-primary rounded-full top-1/2 -right-1 -translate-y-1/2 cursor-ew-resize pointer-events-auto shadow-sm"
      />

      {/* Rotation Pin */}
      <div className="absolute -top-7 left-1/2 -translate-x-1/2 flex flex-col items-center pointer-events-auto">
        <div
          onMouseDown={(e) => handleMouseDown(e, 'rot')}
          className="w-5 h-5 bg-white rounded-full border border-aether-primary shadow-md flex items-center justify-center cursor-grab active:cursor-grabbing hover:scale-110 text-aether-primary"
          title="Rotate Element"
        >
          <RotateCw className="w-2.5 h-2.5" />
        </div>
        <div className="w-0.5 h-2 bg-aether-primary" />
      </div>

      {/* Dimensions Tooltip (when active) */}
      {activeHandle && (
        <div className="absolute -bottom-7 left-1/2 -translate-x-1/2 px-2 py-0.5 rounded bg-black/80 text-white text-[9px] font-mono whitespace-nowrap">
          {activeHandle === 'rot'
            ? `${element.rotation || 0}°`
            : `${Math.round(element.width)} × ${Math.round(element.height)} px`}
        </div>
      )}
    </div>
  );
};
