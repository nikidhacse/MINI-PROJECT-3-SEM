import React, { useState, useRef, useEffect, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation, useNavigate } from 'react-router-dom';
import {
  ArrowLeft,
  Sparkles,
  Download,
  FolderPlus,
  Type,
  Upload,
  Shapes,
  Image as ImageIcon,
  SlidersHorizontal,
  Layers,
  Undo2,
  Redo2,
  ZoomIn,
  ZoomOut,
  Maximize2,
  Copy,
  Trash2,
  Check,
  ChevronDown,
  FileImage,
  ClipboardCheck,
  RotateCcw,
} from 'lucide-react';
import { ApiClient } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import toast from 'react-hot-toast';

import {
  StudioElement,
  TextElement,
  ImageElement,
  ShapeElement,
  CanvasBackdropSettings,
} from '../../types/editor';
import {
  renderCompositeCanvas,
  exportCanvasToDataURL,
  downloadCanvasFile,
  copyCanvasToClipboard,
} from '../../utils/canvasRenderer';

import { CanvasTransformHandles } from '../../components/editor/CanvasTransformHandles';
import { TextLayerRenderer } from '../../components/editor/TextLayerRenderer';
import { ImageLayerRenderer } from '../../components/editor/ImageLayerRenderer';
import { ShapeLayerRenderer } from '../../components/editor/ShapeLayerRenderer';
import { UploadsDrawer } from '../../components/editor/UploadsDrawer';
import { StockPhotosDrawer } from '../../components/editor/StockPhotosDrawer';
import { ShapesDrawer } from '../../components/editor/ShapesDrawer';
import { TextDrawer } from '../../components/editor/TextDrawer';
import { FiltersDrawer } from '../../components/editor/FiltersDrawer';
import { LayersDrawer } from '../../components/editor/LayersDrawer';
import { CanvasPresetsModal } from '../../components/editor/CanvasPresetsModal';
import { ContextInspector } from '../../components/editor/ContextInspector';

interface HistorySnapshot {
  elements: StudioElement[];
  backdrop: CanvasBackdropSettings;
  canvasDims: { width: number; height: number };
}

export const EditorPage: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { activeOrg } = useAuth();

  const canvasRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // 1. Canvas Dimensions & Title
  const [assetTitle, setAssetTitle] = useState(location.state?.assetTitle || 'Creative Marketing Visual');
  const [canvasDims, setCanvasDims] = useState<{ width: number; height: number }>({
    width: location.state?.width || 1080,
    height: location.state?.height || 1080,
  });
  const [isResizeModalOpen, setIsResizeModalOpen] = useState(false);

  // 2. Backdrop Image & Canvas Background
  const [backdrop, setBackdrop] = useState<CanvasBackdropSettings>({
    image:
      location.state?.backdropImage ||
      'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
    backgroundColor: '#FFFFFF',
    showBackdrop: true,
    fit: 'cover',
    scale: 1,
    offsetX: 0,
    offsetY: 0,
    flipH: false,
    flipV: false,
    filter: {
      brightness: 100,
      contrast: 100,
      saturation: 100,
      blur: 0,
      sepia: 0,
      grayscale: 0,
      hueRotate: 0,
    },
  });

  // 3. Studio Elements (Layers)
  const [elements, setElements] = useState<StudioElement[]>([
    {
      id: 'txt-headline',
      name: 'Main Headline',
      type: 'text',
      content: 'ELEVATE YOUR VISION',
      x: 140,
      y: 180,
      width: 520,
      height: 70,
      rotation: 0,
      opacity: 1,
      zIndex: 10,
      fontSize: 48,
      fontFamily: 'Poppins',
      fontWeight: '800',
      color: '#FFFFFF',
      alignment: 'center',
      letterSpacing: 2,
      lineHeight: 1.1,
      effect: 'shadow',
    } as TextElement,
    {
      id: 'txt-subheading',
      name: 'Sub-Headline',
      type: 'text',
      content: 'Precision AI Generated Brand Consistency',
      x: 180,
      y: 260,
      width: 440,
      height: 40,
      rotation: 0,
      opacity: 0.95,
      zIndex: 11,
      fontSize: 20,
      fontFamily: 'Poppins',
      fontWeight: '600',
      color: '#C4B5FD',
      alignment: 'center',
      letterSpacing: 1,
      lineHeight: 1.2,
      effect: 'glow',
    } as TextElement,
  ]);

  // 4. UI Interaction State
  const [selectedId, setSelectedId] = useState<string | null>('txt-headline');
  const [activeTab, setActiveTab] = useState<
    'text' | 'uploads' | 'photos' | 'shapes' | 'filters' | 'layers' | 'ai'
  >('text');
  const [zoom, setZoom] = useState<number>(0.65);
  const [saving, setSaving] = useState(false);
  const [isExportMenuOpen, setIsExportMenuOpen] = useState(false);
  const [isSmartGuidesVisible, setIsSmartGuidesVisible] = useState(false);

  // 5. Undo / Redo History Management
  const [history, setHistory] = useState<HistorySnapshot[]>([
    {
      elements: [
        {
          id: 'txt-headline',
          name: 'Main Headline',
          type: 'text',
          content: 'ELEVATE YOUR VISION',
          x: 140,
          y: 180,
          width: 520,
          height: 70,
          rotation: 0,
          opacity: 1,
          zIndex: 10,
          fontSize: 48,
          fontFamily: 'Poppins',
          fontWeight: '800',
          color: '#FFFFFF',
          alignment: 'center',
          letterSpacing: 2,
          lineHeight: 1.1,
          effect: 'shadow',
        } as TextElement,
        {
          id: 'txt-subheading',
          name: 'Sub-Headline',
          type: 'text',
          content: 'Precision AI Generated Brand Consistency',
          x: 180,
          y: 260,
          width: 440,
          height: 40,
          rotation: 0,
          opacity: 0.95,
          zIndex: 11,
          fontSize: 20,
          fontFamily: 'Poppins',
          fontWeight: '600',
          color: '#C4B5FD',
          alignment: 'center',
          letterSpacing: 1,
          lineHeight: 1.2,
          effect: 'glow',
        } as TextElement,
      ],
      backdrop: {
        image:
          location.state?.backdropImage ||
          'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?auto=format&fit=crop&w=1080&q=80',
        backgroundColor: '#FFFFFF',
        showBackdrop: true,
        fit: 'cover',
        scale: 1,
        offsetX: 0,
        offsetY: 0,
        flipH: false,
        flipV: false,
        filter: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          sepia: 0,
          grayscale: 0,
          hueRotate: 0,
        },
      },
      canvasDims: { width: location.state?.width || 1080, height: location.state?.height || 1080 },
    },
  ]);
  const [historyIndex, setHistoryIndex] = useState(0);

  // Push to history when changes are committed
  const pushHistory = useCallback(
    (newElements: StudioElement[], newBackdrop: CanvasBackdropSettings, newDims = canvasDims) => {
      setHistory((prev) => {
        const sliced = prev.slice(0, historyIndex + 1);
        return [
          ...sliced,
          {
            elements: JSON.parse(JSON.stringify(newElements)),
            backdrop: JSON.parse(JSON.stringify(newBackdrop)),
            canvasDims: { ...newDims },
          },
        ];
      });
      setHistoryIndex((prev) => prev + 1);
    },
    [historyIndex, canvasDims]
  );

  const handleUndo = useCallback(() => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const snapshot = history[prevIdx];
      setElements(JSON.parse(JSON.stringify(snapshot.elements)));
      setBackdrop(JSON.parse(JSON.stringify(snapshot.backdrop)));
      setCanvasDims({ ...snapshot.canvasDims });
      setHistoryIndex(prevIdx);
      toast('Undo', { icon: '↩️', duration: 1000 });
    }
  }, [historyIndex, history]);

  const handleRedo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const snapshot = history[nextIdx];
      setElements(JSON.parse(JSON.stringify(snapshot.elements)));
      setBackdrop(JSON.parse(JSON.stringify(snapshot.backdrop)));
      setCanvasDims({ ...snapshot.canvasDims });
      setHistoryIndex(nextIdx);
      toast('Redo', { icon: '↪️', duration: 1000 });
    }
  }, [historyIndex, history]);

  const selectedElement = elements.find((e) => e.id === selectedId) || null;

  // Selected element updater
  const updateSelected = useCallback(
    (updates: Partial<StudioElement>) => {
      if (!selectedId) return;
      setElements((prev) => {
        const next = prev.map((el) => (el.id === selectedId ? { ...el, ...updates } : el));
        return next as StudioElement[];
      });
    },
    [selectedId]
  );

  const updateSelectedWithHistory = useCallback(
    (updates: Partial<StudioElement>) => {
      if (!selectedId) return;
      setElements((prev) => {
        const next = prev.map((el) => (el.id === selectedId ? { ...el, ...updates } : el));
        pushHistory(next as StudioElement[], backdrop);
        return next as StudioElement[];
      });
    },
    [selectedId, backdrop, pushHistory]
  );

  // Update specific element by ID
  const updateElementById = useCallback(
    (id: string, updates: Partial<StudioElement>) => {
      setElements((prev) => {
        const next = prev.map((el) => (el.id === id ? { ...el, ...updates } : el));
        return next as StudioElement[];
      });
    },
    []
  );

  // Delete element
  const deleteSelected = useCallback(() => {
    if (!selectedId) return;
    setElements((prev) => {
      const next = prev.filter((el) => el.id !== selectedId);
      pushHistory(next, backdrop);
      return next;
    });
    setSelectedId(null);
    toast.success('Layer deleted');
  }, [selectedId, backdrop, pushHistory]);

  // Duplicate element
  const duplicateSelected = useCallback(() => {
    if (!selectedElement) return;
    const newId = `${selectedElement.type}-${Math.random().toString(36).substring(2, 8)}`;
    const highestZ = Math.max(...elements.map((e) => e.zIndex), 0);

    const clone: StudioElement = {
      ...JSON.parse(JSON.stringify(selectedElement)),
      id: newId,
      name: `${selectedElement.name || 'Layer'} (Copy)`,
      x: selectedElement.x + 30,
      y: selectedElement.y + 30,
      zIndex: highestZ + 1,
    };

    setElements((prev) => {
      const next = [...prev, clone];
      pushHistory(next, backdrop);
      return next;
    });
    setSelectedId(newId);
    toast.success('Layer duplicated');
  }, [selectedElement, elements, backdrop, pushHistory]);

  // Layer Reordering
  const handleMoveLayer = useCallback(
    (id: string, direction: 'up' | 'down' | 'top' | 'bottom') => {
      setElements((prev) => {
        const target = prev.find((e) => e.id === id);
        if (!target) return prev;

        const otherElements = prev.filter((e) => e.id !== id);
        let newZ = target.zIndex;

        if (direction === 'up') newZ = target.zIndex + 1.5;
        else if (direction === 'down') newZ = Math.max(1, target.zIndex - 1.5);
        else if (direction === 'top') newZ = Math.max(...prev.map((e) => e.zIndex), 0) + 1;
        else if (direction === 'bottom') newZ = 1;

        const updated = [...otherElements, { ...target, zIndex: newZ }].sort((a, b) => a.zIndex - b.zIndex);
        // Normalize zIndexes to 1, 2, 3...
        const normalized = updated.map((el, i) => ({ ...el, zIndex: (i + 1) * 2 }));
        pushHistory(normalized, backdrop);
        return normalized;
      });
      toast.success('Layer reordered');
    },
    [backdrop, pushHistory]
  );

  // Add Elements
  const handleAddText = useCallback(
    (preset: Partial<TextElement>) => {
      const id = 'txt-' + Math.random().toString(36).substring(2, 8);
      const highestZ = Math.max(...elements.map((e) => e.zIndex), 0);

      const newText: TextElement = {
        id,
        name: preset.name || 'Text Layer',
        type: 'text',
        content: preset.content || 'Your Text Here',
        x: preset.x || 160,
        y: preset.y || 220,
        width: preset.width || 440,
        height: preset.height || 60,
        rotation: 0,
        opacity: 1,
        zIndex: highestZ + 1,
        fontSize: preset.fontSize || 36,
        fontFamily: preset.fontFamily || 'Poppins',
        fontWeight: preset.fontWeight || '700',
        fontStyle: preset.fontStyle || 'normal',
        textDecoration: preset.textDecoration || 'none',
        color: preset.color || '#FFFFFF',
        backgroundColor: preset.backgroundColor || undefined,
        alignment: preset.alignment || 'center',
        letterSpacing: preset.letterSpacing || 1,
        lineHeight: 1.2,
        effect: preset.effect || 'shadow',
      };

      setElements((prev) => {
        const next = [...prev, newText];
        pushHistory(next, backdrop);
        return next;
      });
      setSelectedId(id);
    },
    [elements, backdrop, pushHistory]
  );

  const handleAddImageLayer = useCallback(
    (src: string, name?: string) => {
      const id = 'img-' + Math.random().toString(36).substring(2, 8);
      const highestZ = Math.max(...elements.map((e) => e.zIndex), 0);

      const newImage: ImageElement = {
        id,
        name: name || 'Inserted Photo',
        type: 'image',
        src,
        x: 180,
        y: 180,
        width: 320,
        height: 320,
        rotation: 0,
        opacity: 1,
        zIndex: highestZ + 1,
        borderRadius: 24,
        borderWidth: 0,
        borderColor: '#FFFFFF',
        shadow: 'medium',
        filter: {
          brightness: 100,
          contrast: 100,
          saturation: 100,
          blur: 0,
          sepia: 0,
          grayscale: 0,
          hueRotate: 0,
        },
      };

      setElements((prev) => {
        const next = [...prev, newImage];
        pushHistory(next, backdrop);
        return next;
      });
      setSelectedId(id);
    },
    [elements, backdrop, pushHistory]
  );

  const handleAddShape = useCallback(
    (preset: Partial<ShapeElement>) => {
      const id = 'shp-' + Math.random().toString(36).substring(2, 8);
      const highestZ = Math.max(...elements.map((e) => e.zIndex), 0);

      const newShape: ShapeElement = {
        id,
        name: preset.name || 'Shape Graphic',
        type: 'shape',
        shapeType: preset.shapeType || 'rounded',
        x: 200,
        y: 200,
        width: preset.width || 240,
        height: preset.height || 140,
        rotation: 0,
        opacity: preset.opacity ?? 1,
        zIndex: highestZ + 1,
        fillColor: preset.fillColor || '#8B5CF6',
        gradientFill: preset.gradientFill,
        strokeColor: preset.strokeColor || '#FFFFFF',
        strokeWidth: preset.strokeWidth || 0,
        borderRadius: preset.borderRadius || 20,
        shadow: preset.shadow || 'subtle',
      };

      setElements((prev) => {
        const next = [...prev, newShape];
        pushHistory(next, backdrop);
        return next;
      });
      setSelectedId(id);
    },
    [elements, backdrop, pushHistory]
  );

  // Backdrop Image & Background Updates
  const handleUpdateBackdrop = useCallback(
    (updates: Partial<CanvasBackdropSettings>) => {
      setBackdrop((prev) => {
        const next = { ...prev, ...updates };
        pushHistory(elements, next);
        return next;
      });
    },
    [elements, pushHistory]
  );

  const handleSetBackdropImage = useCallback(
    (src: string) => {
      handleUpdateBackdrop({ image: src, showBackdrop: true });
      toast.success('Backdrop image set');
    },
    [handleUpdateBackdrop]
  );

  // Resize Dimensions
  const handleSelectDimensions = useCallback(
    (w: number, h: number, name: string) => {
      setCanvasDims({ width: w, height: h });
      pushHistory(elements, backdrop, { width: w, height: h });
      toast.success(`Canvas resized to ${name} (${w}×${h}px)`);
    },
    [elements, backdrop, pushHistory]
  );

  // Keyboard Shortcuts Listener
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Ignore if user is currently typing in an input or textarea
      if (['INPUT', 'TEXTAREA', 'SELECT'].includes((e.target as HTMLElement).tagName)) {
        return;
      }

      // Undo: Ctrl+Z
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'z' && !e.shiftKey) {
        e.preventDefault();
        handleUndo();
      }
      // Redo: Ctrl+Y or Ctrl+Shift+Z
      if (
        (e.ctrlKey || e.metaKey) &&
        (e.key.toLowerCase() === 'y' || (e.key.toLowerCase() === 'z' && e.shiftKey))
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Duplicate: Ctrl+D
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'd') {
        e.preventDefault();
        duplicateSelected();
      }
      // Delete: Delete or Backspace
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedId) {
          e.preventDefault();
          deleteSelected();
        }
      }
      // Deselect: Escape
      if (e.key === 'Escape') {
        setSelectedId(null);
      }
      // Arrow Keys for Micro-Nudging
      if (['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key) && selectedElement) {
        e.preventDefault();
        const step = e.shiftKey ? 10 : 1;
        let dx = 0;
        let dy = 0;
        if (e.key === 'ArrowUp') dy = -step;
        if (e.key === 'ArrowDown') dy = step;
        if (e.key === 'ArrowLeft') dx = -step;
        if (e.key === 'ArrowRight') dx = step;
        updateSelected({ x: selectedElement.x + dx, y: selectedElement.y + dy });
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    handleUndo,
    handleRedo,
    duplicateSelected,
    deleteSelected,
    selectedId,
    selectedElement,
    updateSelected,
  ]);

  // Export File Options
  const handleExport = async (format: 'image/png' | 'image/jpeg' | 'image/webp', scale = 1) => {
    setIsExportMenuOpen(false);
    const toastId = toast.loading('Rendering high-resolution composite...');

    try {
      await downloadCanvasFile(
        {
          width: canvasDims.width,
          height: canvasDims.height,
          scale,
          backdrop,
          elements,
        },
        `${assetTitle.toLowerCase().replace(/\s+/g, '-')}-${scale === 2 ? 'ultra-hd' : 'composite'}`,
        format
      );
      toast.success(
        `Exported ${format.split('/')[1].toUpperCase()} (${scale === 2 ? '2x 4K Ultra-HD' : 'Full-Res'})!`,
        { id: toastId }
      );
    } catch (err: any) {
      toast.error('Export failed: ' + (err.message || 'Unknown error'), { id: toastId });
    }
  };

  // Copy to Clipboard
  const handleCopyClipboard = async () => {
    setIsExportMenuOpen(false);
    const toastId = toast.loading('Generating image for clipboard...');
    try {
      const ok = await copyCanvasToClipboard({
        width: canvasDims.width,
        height: canvasDims.height,
        scale: 1,
        backdrop,
        elements,
      });

      if (ok) {
        toast.success('Composite copied to clipboard! Ready to paste anywhere.', { id: toastId });
      } else {
        toast.error('Browser blocked clipboard write. Please use Export PNG.', { id: toastId });
      }
    } catch (err) {
      toast.error('Failed to copy to clipboard', { id: toastId });
    }
  };

  // Save to Asset Vault (Library)
  const handleSaveToVault = async () => {
    setSaving(true);
    const toastId = toast.loading('Saving design to Asset Library...');

    try {
      // 1. Generate optimized preview data URL
      let previewUrl = backdrop.image || '';
      try {
        previewUrl = await exportCanvasToDataURL(
          {
            width: Math.min(canvasDims.width, 800),
            height: Math.min(canvasDims.height, 800),
            scale: 0.75,
            backdrop,
            elements,
          },
          'image/jpeg',
          0.85
        );
      } catch (err) {
        console.warn('Preview thumbnail generation fallback:', err);
      }

      // 2. Persist design to localStorage as backup
      const localDesign = {
        id: 'design-' + Date.now(),
        title: assetTitle,
        preview: previewUrl,
        width: canvasDims.width,
        height: canvasDims.height,
        elements,
        backdrop,
        savedAt: new Date().toISOString(),
      };
      try {
        const existing = JSON.parse(localStorage.getItem('aether_saved_designs') || '[]');
        localStorage.setItem('aether_saved_designs', JSON.stringify([localDesign, ...existing].slice(0, 30)));
      } catch (e) {
        console.warn('LocalStorage save error:', e);
      }

      // 3. Write to backend asset repository
      await ApiClient.writeResource('assets', {
        op: 'create',
        data: {
          title: assetTitle,
          description: `Designed in Canva Studio with ${elements.length} layer(s)`,
          category: 'Social Media',
          status: 'draft',
          width: canvasDims.width,
          height: canvasDims.height,
          storage_path: previewUrl,
          thumbnail_path: previewUrl,
          quality_score: 99,
          metadata: {
            elements_count: elements.length,
            has_backdrop: backdrop.showBackdrop,
            aspect_ratio: `${canvasDims.width}:${canvasDims.height}`,
          },
        },
      });

      toast.success('Successfully saved to Asset Library!', { id: toastId });
    } catch (err: any) {
      console.warn('Backend save notice:', err);
      // If backend had an issue, design is safely kept in local storage
      toast.success('Design saved to your local workspace vault!', { id: toastId });
    } finally {
      setSaving(false);
    }
  };

  // Backdrop CSS Filter String for live canvas preview
  const backdropFilterCss = `brightness(${backdrop.filter.brightness}%) contrast(${backdrop.filter.contrast}%) saturate(${backdrop.filter.saturation}%) blur(${backdrop.filter.blur}px) sepia(${backdrop.filter.sepia}%) grayscale(${backdrop.filter.grayscale}%) hue-rotate(${backdrop.filter.hueRotate}deg)`;

  const backdropTransformCss = `${backdrop.flipH ? 'scaleX(-1)' : ''} ${backdrop.flipV ? 'scaleY(-1)' : ''}`.trim();

  return (
    <div className="min-h-screen bg-aether-bg flex flex-col overflow-hidden select-none">
      {/* 1. TOP STUDIO NAVIGATION & TOOLBAR */}
      <header className="glass-nav px-5 py-2.5 flex items-center justify-between z-30 shrink-0 border-b border-aether-border">
        {/* Left: Back & Editable Title */}
        <div className="flex items-center space-x-3">
          <button
            onClick={() => navigate(-1)}
            className="p-2 rounded-2xl bg-white border border-aether-border hover:bg-aether-light text-aether-text transition shadow-sm"
            title="Go Back"
          >
            <ArrowLeft className="w-4 h-4" />
          </button>

          <div>
            <input
              type="text"
              value={assetTitle}
              onChange={(e) => setAssetTitle(e.target.value)}
              className="font-extrabold text-sm text-aether-text bg-transparent border-b border-transparent hover:border-aether-border focus:border-aether-primary focus:outline-none px-1 py-0.5 rounded transition"
              title="Click to rename design"
            />
            <div className="flex items-center space-x-2 text-[10px] text-aether-subtext px-1">
              <span>Canva Studio</span>
              <span>&bull;</span>
              <button
                onClick={() => setIsResizeModalOpen(true)}
                className="font-semibold text-aether-primary hover:underline flex items-center space-x-1"
                title="Change Dimensions"
              >
                <span>
                  {canvasDims.width} × {canvasDims.height} px
                </span>
                <Maximize2 className="w-2.5 h-2.5" />
              </button>
            </div>
          </div>
        </div>

        {/* Center: Undo/Redo & Zoom Controls */}
        <div className="flex items-center space-x-3">
          {/* History Undo / Redo */}
          <div className="flex items-center space-x-1 bg-white px-2 py-1 rounded-2xl border border-aether-border shadow-sm">
            <button
              onClick={handleUndo}
              disabled={historyIndex <= 0}
              className="p-1.5 rounded-xl hover:bg-aether-section text-aether-text disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Undo (Ctrl+Z)"
            >
              <Undo2 className="w-4 h-4" />
            </button>
            <button
              onClick={handleRedo}
              disabled={historyIndex >= history.length - 1}
              className="p-1.5 rounded-xl hover:bg-aether-section text-aether-text disabled:opacity-30 disabled:hover:bg-transparent transition"
              title="Redo (Ctrl+Y)"
            >
              <Redo2 className="w-4 h-4" />
            </button>
          </div>

          {/* Zoom Controls */}
          <div className="flex items-center space-x-1.5 bg-white px-3 py-1 rounded-2xl border border-aether-border shadow-sm">
            <button
              onClick={() => setZoom((prev) => Math.max(0.3, prev - 0.1))}
              className="p-1 rounded-lg hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
              title="Zoom Out"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span
              onClick={() => setZoom(0.7)}
              className="text-xs font-bold text-aether-text px-1 cursor-pointer hover:text-aether-primary"
              title="Reset Zoom to 70%"
            >
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((prev) => Math.min(1.5, prev + 0.1))}
              className="p-1 rounded-lg hover:bg-aether-section text-aether-subtext hover:text-aether-text transition"
              title="Zoom In"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>

        {/* Right: Save & Export Dropdown */}
        <div className="flex items-center space-x-3 relative">
          <button
            onClick={handleSaveToVault}
            disabled={saving}
            className="px-4 py-2 rounded-2xl border border-aether-border bg-white hover:bg-aether-light text-xs font-bold text-aether-text flex items-center space-x-1.5 transition shadow-sm"
          >
            <FolderPlus className="w-3.5 h-3.5 text-aether-primary" />
            <span>{saving ? 'Saving...' : 'Save to Library'}</span>
          </button>

          {/* Export Dropdown Button */}
          <div className="relative">
            <button
              onClick={() => setIsExportMenuOpen(!isExportMenuOpen)}
              className="px-5 py-2 rounded-2xl bg-aether-primary text-white text-xs font-bold shadow-lavender-sm hover:bg-aether-hover transition flex items-center space-x-1.5"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Export</span>
              <ChevronDown className="w-3 h-3 ml-0.5" />
            </button>

            {/* Export Menu Dropdown */}
            {isExportMenuOpen && (
              <div className="absolute right-0 top-11 w-56 bg-white rounded-2xl border border-aether-border shadow-2xl p-2 z-50 space-y-1 animate-scaleUp">
                <button
                  onClick={() => handleExport('image/png', 1)}
                  className="w-full p-2 rounded-xl hover:bg-aether-light text-left text-xs font-bold text-aether-text flex items-center space-x-2 transition"
                >
                  <FileImage className="w-4 h-4 text-aether-primary" />
                  <div>
                    <span className="block">Download PNG</span>
                    <span className="text-[10px] text-aether-subtext font-normal">Best for web &amp; social</span>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('image/png', 2)}
                  className="w-full p-2 rounded-xl hover:bg-aether-light text-left text-xs font-bold text-aether-text flex items-center space-x-2 transition"
                >
                  <Sparkles className="w-4 h-4 text-amber-500" />
                  <div>
                    <span className="block">Ultra-HD PNG (2x 4K)</span>
                    <span className="text-[10px] text-aether-subtext font-normal">Crisp print &amp; display</span>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('image/jpeg', 1)}
                  className="w-full p-2 rounded-xl hover:bg-aether-light text-left text-xs font-bold text-aether-text flex items-center space-x-2 transition"
                >
                  <FileImage className="w-4 h-4 text-blue-500" />
                  <div>
                    <span className="block">Download JPEG</span>
                    <span className="text-[10px] text-aether-subtext font-normal">Smaller file size</span>
                  </div>
                </button>

                <button
                  onClick={() => handleExport('image/webp', 1)}
                  className="w-full p-2 rounded-xl hover:bg-aether-light text-left text-xs font-bold text-aether-text flex items-center space-x-2 transition"
                >
                  <FileImage className="w-4 h-4 text-emerald-500" />
                  <div>
                    <span className="block">Download WebP</span>
                    <span className="text-[10px] text-aether-subtext font-normal">Next-gen performance</span>
                  </div>
                </button>

                <div className="h-px bg-aether-border my-1" />

                <button
                  onClick={handleCopyClipboard}
                  className="w-full p-2 rounded-xl hover:bg-aether-light text-left text-xs font-bold text-aether-text flex items-center space-x-2 transition"
                >
                  <ClipboardCheck className="w-4 h-4 text-purple-600" />
                  <div>
                    <span className="block">Copy to Clipboard</span>
                    <span className="text-[10px] text-aether-subtext font-normal">Instant paste</span>
                  </div>
                </button>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* 2. MAIN STUDIO WORKSPACE */}
      <div className="flex-1 flex overflow-hidden">
        {/* Left Vertical Icon Tab Bar */}
        <div className="w-20 bg-white border-r border-aether-border flex flex-col items-center py-4 space-y-3 shrink-0 z-20 shadow-sm">
          {/* Text Tab */}
          <button
            onClick={() => setActiveTab('text')}
            className={`w-14 p-2.5 rounded-2xl transition flex flex-col items-center space-y-1 ${
              activeTab === 'text'
                ? 'bg-aether-light text-aether-primary shadow-sm font-bold'
                : 'text-aether-subtext hover:text-aether-text hover:bg-aether-bg'
            }`}
          >
            <Type className="w-5 h-5" />
            <span className="text-[10px]">Text</span>
          </button>

          {/* Uploads Tab */}
          <button
            onClick={() => setActiveTab('uploads')}
            className={`w-14 p-2.5 rounded-2xl transition flex flex-col items-center space-y-1 ${
              activeTab === 'uploads'
                ? 'bg-aether-light text-aether-primary shadow-sm font-bold'
                : 'text-aether-subtext hover:text-aether-text hover:bg-aether-bg'
            }`}
          >
            <Upload className="w-5 h-5" />
            <span className="text-[10px]">Uploads</span>
          </button>

          {/* Photos Tab */}
          <button
            onClick={() => setActiveTab('photos')}
            className={`w-14 p-2.5 rounded-2xl transition flex flex-col items-center space-y-1 ${
              activeTab === 'photos'
                ? 'bg-aether-light text-aether-primary shadow-sm font-bold'
                : 'text-aether-subtext hover:text-aether-text hover:bg-aether-bg'
            }`}
          >
            <ImageIcon className="w-5 h-5" />
            <span className="text-[10px]">Photos</span>
          </button>

          {/* Shapes Tab */}
          <button
            onClick={() => setActiveTab('shapes')}
            className={`w-14 p-2.5 rounded-2xl transition flex flex-col items-center space-y-1 ${
              activeTab === 'shapes'
                ? 'bg-aether-light text-aether-primary shadow-sm font-bold'
                : 'text-aether-subtext hover:text-aether-text hover:bg-aether-bg'
            }`}
          >
            <Shapes className="w-5 h-5" />
            <span className="text-[10px]">Shapes</span>
          </button>

          {/* Filters & Backdrop Tab */}
          <button
            onClick={() => setActiveTab('filters')}
            className={`w-14 p-2.5 rounded-2xl transition flex flex-col items-center space-y-1 ${
              activeTab === 'filters'
                ? 'bg-aether-light text-aether-primary shadow-sm font-bold'
                : 'text-aether-subtext hover:text-aether-text hover:bg-aether-bg'
            }`}
          >
            <SlidersHorizontal className="w-5 h-5" />
            <span className="text-[10px]">Adjust</span>
          </button>

          {/* Layers Tab */}
          <button
            onClick={() => setActiveTab('layers')}
            className={`w-14 p-2.5 rounded-2xl transition flex flex-col items-center space-y-1 relative ${
              activeTab === 'layers'
                ? 'bg-aether-light text-aether-primary shadow-sm font-bold'
                : 'text-aether-subtext hover:text-aether-text hover:bg-aether-bg'
            }`}
          >
            <Layers className="w-5 h-5" />
            <span className="text-[10px]">Layers</span>
            {elements.length > 0 && (
              <span className="absolute top-1 right-2 w-4 h-4 rounded-full bg-aether-primary text-white text-[9px] flex items-center justify-center font-bold">
                {elements.length}
              </span>
            )}
          </button>

          <div className="w-10 h-px bg-aether-border my-1" />

          {/* AI Generator Shortcut */}
          <button
            onClick={() => navigate('/creator/generator')}
            className="w-14 p-2.5 rounded-2xl transition flex flex-col items-center space-y-1 bg-gradient-to-br from-aether-light to-purple-100 text-aether-primary border border-aether-primary/40 hover:scale-105"
            title="Open AI Diffusion Generator"
          >
            <Sparkles className="w-5 h-5 animate-pulse" />
            <span className="text-[9px] font-bold">AI Studio</span>
          </button>
        </div>

        {/* Left Drawer Panels */}
        <div className="w-80 bg-white border-r border-aether-border p-5 overflow-y-auto shrink-0 z-10 shadow-sm">
          {activeTab === 'text' && <TextDrawer onAddText={handleAddText} />}

          {activeTab === 'uploads' && (
            <UploadsDrawer
              onAddImageLayer={handleAddImageLayer}
              onSetBackdrop={handleSetBackdropImage}
            />
          )}

          {activeTab === 'photos' && (
            <StockPhotosDrawer
              onAddImageLayer={handleAddImageLayer}
              onSetBackdrop={handleSetBackdropImage}
            />
          )}

          {activeTab === 'shapes' && <ShapesDrawer onAddShape={handleAddShape} />}

          {activeTab === 'filters' && (
            <FiltersDrawer
              backdrop={backdrop}
              onUpdateBackdrop={handleUpdateBackdrop}
              onSetBackdropImage={handleSetBackdropImage}
              originalPrompt={location.state?.assetTitle || assetTitle}
            />
          )}

          {activeTab === 'layers' && (
            <LayersDrawer
              elements={elements}
              selectedId={selectedId}
              onSelect={(id) => setSelectedId(id)}
              onUpdateElement={updateElementById}
              onDeleteElement={(id) => {
                setElements((prev) => prev.filter((el) => el.id !== id));
                if (selectedId === id) setSelectedId(null);
                toast.success('Layer deleted');
              }}
              onDuplicateElement={(id) => {
                const target = elements.find((e) => e.id === id);
                if (!target) return;
                const newId = `${target.type}-${Math.random().toString(36).substring(2, 8)}`;
                const clone = {
                  ...JSON.parse(JSON.stringify(target)),
                  id: newId,
                  x: target.x + 20,
                  y: target.y + 20,
                  zIndex: Math.max(...elements.map((e) => e.zIndex), 0) + 1,
                };
                setElements((prev) => [...prev, clone]);
                setSelectedId(newId);
                toast.success('Layer duplicated');
              }}
              onMoveLayer={handleMoveLayer}
            />
          )}
        </div>

        {/* Center Interactive Canvas Stage */}
        <div
          ref={containerRef}
          onClick={() => setSelectedId(null)}
          className="flex-1 bg-[#EEECF8] p-8 flex items-center justify-center overflow-auto relative cursor-default bg-[radial-gradient(#C4B5FD_1px,transparent_1px)] [background-size:20px_20px]"
        >
          <div
            style={{
              transform: `scale(${zoom})`,
              transformOrigin: 'center center',
              width: `${canvasDims.width}px`,
              height: `${canvasDims.height}px`,
            }}
            className="transition-transform duration-150 shrink-0 select-none shadow-2xl relative"
          >
            {/* The Concrete Canvas Board */}
            <div
              ref={canvasRef}
              onClick={(e) => {
                e.stopPropagation();
                setSelectedId(null);
              }}
              style={{
                width: `${canvasDims.width}px`,
                height: `${canvasDims.height}px`,
                backgroundColor: backdrop.backgroundColor || '#FFFFFF',
                background: backdrop.backgroundColor?.includes('gradient')
                  ? backdrop.backgroundColor
                  : undefined,
              }}
              className="rounded-2xl shadow-lavender-lg border border-aether-border relative overflow-hidden select-none"
            >
              {/* Diffusion Backdrop Image */}
              {backdrop.showBackdrop && backdrop.image && (
                <div
                  style={{
                    transform: backdropTransformCss || undefined,
                  }}
                  className="w-full h-full absolute inset-0 pointer-events-none"
                >
                  <img
                    src={backdrop.image}
                    alt="Backdrop"
                    crossOrigin="anonymous"
                    style={{
                      filter: backdropFilterCss,
                    }}
                    className="w-full h-full object-cover pointer-events-none"
                    draggable={false}
                  />
                </div>
              )}

              {/* Smart Alignment Guides (Horizontal & Vertical Center) */}
              {isSmartGuidesVisible && (
                <>
                  <div className="absolute top-0 bottom-0 left-1/2 w-0.5 bg-pink-500/80 z-40 pointer-events-none -translate-x-1/2" />
                  <div className="absolute left-0 right-0 top-1/2 h-0.5 bg-pink-500/80 z-40 pointer-events-none -translate-y-1/2" />
                </>
              )}

              {/* Vector Elements Stack */}
              {elements.map((el) => {
                if (el.hidden) return null;
                const isSelected = selectedId === el.id;

                return (
                  <motion.div
                    key={el.id}
                    drag={!el.locked}
                    dragMomentum={false}
                    dragElastic={0}
                    dragConstraints={canvasRef}
                    onDragStart={() => {
                      setSelectedId(el.id);
                      setIsSmartGuidesVisible(true);
                    }}
                    onDrag={(_, info) => {
                      // Check for center alignment snap
                      const currentCenterX = el.x + info.offset.x + el.width / 2;
                      const canvasCenterX = canvasDims.width / 2;
                      if (Math.abs(currentCenterX - canvasCenterX) < 15) {
                        setIsSmartGuidesVisible(true);
                      }
                    }}
                    onDragEnd={(_, info) => {
                      setIsSmartGuidesVisible(false);
                      const finalX = Math.round(el.x + info.offset.x);
                      const finalY = Math.round(el.y + info.offset.y);
                      updateSelectedWithHistory({ x: finalX, y: finalY });
                    }}
                    onClick={(e) => {
                      e.stopPropagation();
                      setSelectedId(el.id);
                    }}
                    style={{
                      position: 'absolute',
                      left: el.x,
                      top: el.y,
                      width: el.width,
                      height: el.height,
                      transform: el.rotation ? `rotate(${el.rotation}deg)` : undefined,
                      opacity: el.opacity ?? 1,
                      zIndex: el.zIndex || 10,
                      cursor: el.locked ? 'default' : 'move',
                    }}
                    className="group"
                  >
                    {/* Layer Renderers */}
                    {el.type === 'text' && (
                      <TextLayerRenderer
                        element={el as TextElement}
                        isSelected={isSelected}
                        onUpdate={(updates) => updateSelectedWithHistory(updates)}
                        onSelect={() => setSelectedId(el.id)}
                      />
                    )}

                    {el.type === 'image' && (
                      <ImageLayerRenderer element={el as ImageElement} isSelected={isSelected} />
                    )}

                    {el.type === 'shape' && (
                      <ShapeLayerRenderer element={el as ShapeElement} isSelected={isSelected} />
                    )}

                    {/* Interactive 8-point Transform & Rotation Handles */}
                    {isSelected && (
                      <CanvasTransformHandles
                        element={el}
                        zoom={zoom}
                        onUpdate={(updates) => updateSelected(updates)}
                      />
                    )}
                  </motion.div>
                );
              })}
            </div>
          </div>
        </div>

        {/* Right Inspector Panel */}
        <div className="w-80 bg-white border-l border-aether-border p-5 overflow-y-auto shrink-0 z-10 shadow-sm">
          <ContextInspector
            selectedElement={selectedElement}
            backdrop={backdrop}
            canvasDims={canvasDims}
            onUpdateSelected={updateSelectedWithHistory}
            onUpdateBackdrop={handleUpdateBackdrop}
            onDuplicateSelected={duplicateSelected}
            onDeleteSelected={deleteSelected}
            onMoveLayer={handleMoveLayer}
            onOpenResizeModal={() => setIsResizeModalOpen(true)}
            onSetBackdropFromImage={handleSetBackdropImage}
          />
        </div>
      </div>

      {/* Resize Canvas Presets Modal */}
      <CanvasPresetsModal
        isOpen={isResizeModalOpen}
        onClose={() => setIsResizeModalOpen(false)}
        currentDims={canvasDims}
        onSelectDimensions={handleSelectDimensions}
      />
    </div>
  );
};
