import React, { useState, useRef, useEffect, useCallback } from 'react';
import { VisionItem, BoundingBox, TaxonomyClass } from '../types/annotation';
import { useKeyboardShortcut } from '../hooks/useKeyboardShortcut';
import {
  ZoomIn,
  ZoomOut,
  Maximize2,
  MousePointer,
  Square,
  Hand,
  Trash2,
  Eye,
  EyeOff,
  CheckCircle,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Plus,
  Info,
  ShieldCheck,
  Check,
  X,
  Sliders,
  AlertCircle
} from 'lucide-react';

interface VisionStudioProps {
  items: VisionItem[];
  currentItemIndex: number;
  onSelectItemIndex: (index: number) => void;
  classes: TaxonomyClass[];
  onUpdateItemBoxes: (itemId: string, boxes: BoundingBox[], status?: VisionItem['status']) => void;
  onAddNewImage: (file: File) => void;
  onTriggerAiDetection: (item: VisionItem, threshold: number, guidelines?: string) => Promise<void>;
  isAiLoading: boolean;
}

type ToolMode = 'select' | 'draw' | 'pan';

export const VisionStudio: React.FC<VisionStudioProps> = ({
  items,
  currentItemIndex,
  onSelectItemIndex,
  classes,
  onUpdateItemBoxes,
  onAddNewImage,
  onTriggerAiDetection,
  isAiLoading,
}) => {
  const currentItem = items[currentItemIndex];
  const [selectedBoxId, setSelectedBoxId] = useState<string | null>(null);
  const [activeClassId, setActiveClassId] = useState<string>(classes[0]?.id || '');
  const [toolMode, setToolMode] = useState<ToolMode>('draw');
  const [zoom, setZoom] = useState<number>(1);
  const [panOffset, setPanOffset] = useState<{ x: number; y: number }>({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState<boolean>(false);
  const [panStart, setPanStart] = useState<{ x: number; y: number }>({ x: 0, y: 0 });

  // Drawing state
  const [isDrawing, setIsDrawing] = useState<boolean>(false);
  const [drawStart, setDrawStart] = useState<{ x: number; y: number } | null>(null);
  const [drawCurrent, setDrawCurrent] = useState<{ x: number; y: number } | null>(null);

  // Resize / drag box state
  type ResizeHandleType = 'nw' | 'n' | 'ne' | 'e' | 'se' | 's' | 'sw' | 'w';
  const [isDraggingBox, setIsDraggingBox] = useState<boolean>(false);
  const [dragStartPos, setDragStartPos] = useState<{ x: number; y: number } | null>(null);
  const [resizeHandle, setResizeHandle] = useState<ResizeHandleType | null>(null);
  const [initialBoxCoords, setInitialBoxCoords] = useState<[number, number, number, number] | null>(null);

  // Active drag reference to avoid closure staleness during window pointermove/pointerup
  const dragRef = useRef<{
    type: 'move' | 'resize';
    handle?: ResizeHandleType;
    startCoords: { x: number; y: number };
    initialBoxCoords: [number, number, number, number];
    boxId: string;
  } | null>(null);

  const currentItemRef = useRef(currentItem);
  useEffect(() => {
    currentItemRef.current = currentItem;
  }, [currentItem]);

  // AI settings
  const [confidenceThreshold, setConfidenceThreshold] = useState<number>(0.75);
  const [taskGuidelines, setTaskGuidelines] = useState<string>('');
  const [showGuidelinesInput, setShowGuidelinesInput] = useState<boolean>(false);

  // Hidden box IDs
  const [hiddenBoxIds, setHiddenBoxIds] = useState<Set<string>>(new Set());

  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const activeClass = classes.find((c) => c.id === activeClassId) || classes[0];

  // Reset viewport when changing item
  useEffect(() => {
    setSelectedBoxId(null);
    setIsDraggingBox(false);
    setResizeHandle(null);
    dragRef.current = null;
    setPanOffset({ x: 0, y: 0 });
    setZoom(1);
  }, [currentItemIndex]);

  // Convert client mouse event to normalized [0, 1000] coordinates relative to the image
  const getNormalizedCoords = useCallback(
    (e: React.MouseEvent | MouseEvent): { x: number; y: number } | null => {
      if (!imageRef.current) return null;
      const rect = imageRef.current.getBoundingClientRect();
      if (rect.width === 0 || rect.height === 0) return null;

      const clientX = e.clientX;
      const clientY = e.clientY;

      const normX = Math.max(0, Math.min(1000, ((clientX - rect.left) / rect.width) * 1000));
      const normY = Math.max(0, Math.min(1000, ((clientY - rect.top) / rect.height) * 1000));

      return { x: Math.round(normX), y: Math.round(normY) };
    },
    []
  );

  // Global window listeners for butter-smooth dragging & resizing
  useEffect(() => {
    const handleGlobalMouseMove = (e: MouseEvent) => {
      if (!dragRef.current || !currentItemRef.current) return;
      const { type, handle, startCoords, initialBoxCoords, boxId } = dragRef.current;
      const currentCoords = getNormalizedCoords(e);
      if (!currentCoords) return;

      const deltaX = currentCoords.x - startCoords.x;
      const deltaY = currentCoords.y - startCoords.y;
      let [y0, x0, y1, x1] = initialBoxCoords;
      const minSize = 12;

      if (type === 'move') {
        const boxW = x1 - x0;
        const boxH = y1 - y0;

        let newXmin = x0 + deltaX;
        let newYmin = y0 + deltaY;

        if (newXmin < 0) newXmin = 0;
        if (newYmin < 0) newYmin = 0;
        if (newXmin + boxW > 1000) newXmin = 1000 - boxW;
        if (newYmin + boxH > 1000) newYmin = 1000 - boxH;

        const newXmax = newXmin + boxW;
        const newYmax = newYmin + boxH;

        const newBoxes = currentItemRef.current.boxes.map((b) =>
          b.id === boxId
            ? { ...b, box_2d: [newYmin, newXmin, newYmax, newXmax] as [number, number, number, number] }
            : b
        );
        onUpdateItemBoxes(currentItemRef.current.id, newBoxes);
      } else if (type === 'resize' && handle) {
        switch (handle) {
          case 'nw':
            y0 = Math.max(0, Math.min(y1 - minSize, y0 + deltaY));
            x0 = Math.max(0, Math.min(x1 - minSize, x0 + deltaX));
            break;
          case 'n':
            y0 = Math.max(0, Math.min(y1 - minSize, y0 + deltaY));
            break;
          case 'ne':
            y0 = Math.max(0, Math.min(y1 - minSize, y0 + deltaY));
            x1 = Math.min(1000, Math.max(x0 + minSize, x1 + deltaX));
            break;
          case 'e':
            x1 = Math.min(1000, Math.max(x0 + minSize, x1 + deltaX));
            break;
          case 'se':
            y1 = Math.min(1000, Math.max(y0 + minSize, y1 + deltaY));
            x1 = Math.min(1000, Math.max(x0 + minSize, x1 + deltaX));
            break;
          case 's':
            y1 = Math.min(1000, Math.max(y0 + minSize, y1 + deltaY));
            break;
          case 'sw':
            y1 = Math.min(1000, Math.max(y0 + minSize, y1 + deltaY));
            x0 = Math.max(0, Math.min(x1 - minSize, x0 + deltaX));
            break;
          case 'w':
            x0 = Math.max(0, Math.min(x1 - minSize, x0 + deltaX));
            break;
        }

        const newBoxes = currentItemRef.current.boxes.map((b) =>
          b.id === boxId
            ? { ...b, box_2d: [y0, x0, y1, x1] as [number, number, number, number] }
            : b
        );
        onUpdateItemBoxes(currentItemRef.current.id, newBoxes);
      }
    };

    const handleGlobalMouseUp = () => {
      if (dragRef.current) {
        dragRef.current = null;
        setIsDraggingBox(false);
        setResizeHandle(null);
      }
    };

    window.addEventListener('mousemove', handleGlobalMouseMove);
    window.addEventListener('mouseup', handleGlobalMouseUp);
    return () => {
      window.removeEventListener('mousemove', handleGlobalMouseMove);
      window.removeEventListener('mouseup', handleGlobalMouseUp);
    };
  }, [getNormalizedCoords, onUpdateItemBoxes]);

  // Studio Keyboard shortcuts using useKeyboardShortcut hook
  useKeyboardShortcut(['w', 'W'], () => setToolMode('draw'));
  useKeyboardShortcut(['v', 'V'], () => setToolMode('select'));
  useKeyboardShortcut(['h', 'H', 'Space'], () => setToolMode('pan'));
  
  useKeyboardShortcut(['Delete', 'Backspace'], (e) => {
    if (selectedBoxId && currentItem) {
      e.preventDefault();
      const newBoxes = currentItem.boxes.filter((b) => b.id !== selectedBoxId);
      onUpdateItemBoxes(currentItem.id, newBoxes);
      setSelectedBoxId(null);
    }
  });

  useKeyboardShortcut(['d', 'D'], () => {
    if (currentItemIndex < items.length - 1) {
      onSelectItemIndex(currentItemIndex + 1);
    }
  });

  useKeyboardShortcut(['a', 'A'], () => {
    if (currentItemIndex > 0) {
      onSelectItemIndex(currentItemIndex - 1);
    }
  });

  useKeyboardShortcut('Enter', () => {
    if (selectedBoxId && currentItem) {
      const newBoxes = currentItem.boxes.map((b) =>
        b.id === selectedBoxId ? { ...b, isAiSuggested: false, reviewed: true } : b
      );
      onUpdateItemBoxes(currentItem.id, newBoxes, 'annotated');
    }
  });

  // Arrow keys nudging for selected box
  useKeyboardShortcut(['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'], (e) => {
    if (!selectedBoxId || !currentItem) return;
    const box = currentItem.boxes.find((b) => b.id === selectedBoxId);
    if (!box) return;

    const step = e.shiftKey ? 20 : 5;
    let [ymin, xmin, ymax, xmax] = box.box_2d;
    const w = xmax - xmin;
    const h = ymax - ymin;

    if (e.key === 'ArrowLeft') {
      xmin = Math.max(0, xmin - step);
      xmax = xmin + w;
    } else if (e.key === 'ArrowRight') {
      xmax = Math.min(1000, xmax + step);
      xmin = xmax - w;
    } else if (e.key === 'ArrowUp') {
      ymin = Math.max(0, ymin - step);
      ymax = ymin + h;
    } else if (e.key === 'ArrowDown') {
      ymax = Math.min(1000, ymax + step);
      ymin = ymax - h;
    }

    const newBoxes = currentItem.boxes.map((b) =>
      b.id === selectedBoxId ? { ...b, box_2d: [ymin, xmin, ymax, xmax] as [number, number, number, number] } : b
    );
    onUpdateItemBoxes(currentItem.id, newBoxes);
  });

  // Hotkeys 1-9 for class assignment
  useKeyboardShortcut(['1', '2', '3', '4', '5', '6', '7', '8', '9'], (e) => {
    const num = parseInt(e.key, 10);
    const targetClass = classes.find((c) => c.hotkey === e.key) || classes[num - 1];
    if (targetClass) {
      setActiveClassId(targetClass.id);
      if (selectedBoxId && currentItem) {
        const newBoxes = currentItem.boxes.map((b) =>
          b.id === selectedBoxId ? { ...b, label: targetClass.name } : b
        );
        onUpdateItemBoxes(currentItem.id, newBoxes);
      }
    }
  });

  // Handle Mouse Down on Canvas Background
  const handleMouseDown = (e: React.MouseEvent) => {
    // Middle click or Pan mode or Space key starts panning
    if (e.button === 1 || toolMode === 'pan' || e.altKey) {
      setIsPanning(true);
      setPanStart({ x: e.clientX - panOffset.x, y: e.clientY - panOffset.y });
      return;
    }

    if (e.button !== 0) return; // Only primary click

    const coords = getNormalizedCoords(e);
    if (!coords) return;

    if (toolMode === 'draw') {
      setIsDrawing(true);
      setDrawStart(coords);
      setDrawCurrent(coords);
      setSelectedBoxId(null);
    } else if (toolMode === 'select') {
      // Clicking empty area deselects
      setSelectedBoxId(null);
    }
  };

  // Handle Box Body Mouse Down (Start Moving)
  const handleBoxMouseDown = (box: BoundingBox, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    setSelectedBoxId(box.id);

    const coords = getNormalizedCoords(e);
    if (!coords) return;

    setIsDraggingBox(true);
    setDragStartPos(coords);
    setInitialBoxCoords([...box.box_2d]);

    dragRef.current = {
      type: 'move',
      startCoords: coords,
      initialBoxCoords: [...box.box_2d],
      boxId: box.id,
    };
  };

  // Handle Resize Handle Mouse Down
  const handleResizeHandleMouseDown = (handle: ResizeHandleType, e: React.MouseEvent) => {
    if (e.button !== 0) return;
    e.stopPropagation();
    if (!selectedBoxId || !currentItem) return;
    const box = currentItem.boxes.find((b) => b.id === selectedBoxId);
    if (!box) return;

    const coords = getNormalizedCoords(e);
    if (!coords) return;

    setResizeHandle(handle);
    setDragStartPos(coords);
    setInitialBoxCoords([...box.box_2d]);

    dragRef.current = {
      type: 'resize',
      handle,
      startCoords: coords,
      initialBoxCoords: [...box.box_2d],
      boxId: selectedBoxId,
    };
  };

  // Handle Mouse Move
  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPanOffset({
        x: e.clientX - panStart.x,
        y: e.clientY - panStart.y,
      });
      return;
    }

    if (isDrawing) {
      const coords = getNormalizedCoords(e);
      if (coords) {
        setDrawCurrent(coords);
      }
      return;
    }

    // Handle Moving Box
    if (isDraggingBox && dragStartPos && initialBoxCoords && selectedBoxId && currentItem) {
      const coords = getNormalizedCoords(e);
      if (!coords) return;

      const deltaX = coords.x - dragStartPos.x;
      const deltaY = coords.y - dragStartPos.y;
      const [y0, x0, y1, x1] = initialBoxCoords;
      const boxW = x1 - x0;
      const boxH = y1 - y0;

      let newXmin = x0 + deltaX;
      let newYmin = y0 + deltaY;

      // Clamp within image bounds
      if (newXmin < 0) newXmin = 0;
      if (newYmin < 0) newYmin = 0;
      if (newXmin + boxW > 1000) newXmin = 1000 - boxW;
      if (newYmin + boxH > 1000) newYmin = 1000 - boxH;

      const newXmax = newXmin + boxW;
      const newYmax = newYmin + boxH;

      const newBoxes = currentItem.boxes.map((b) =>
        b.id === selectedBoxId
          ? { ...b, box_2d: [newYmin, newXmin, newYmax, newXmax] as [number, number, number, number] }
          : b
      );
      onUpdateItemBoxes(currentItem.id, newBoxes);
      return;
    }

    // Handle Resizing Box
    if (resizeHandle && dragStartPos && initialBoxCoords && selectedBoxId && currentItem) {
      const coords = getNormalizedCoords(e);
      if (!coords) return;

      const deltaX = coords.x - dragStartPos.x;
      const deltaY = coords.y - dragStartPos.y;
      let [y0, x0, y1, x1] = initialBoxCoords;
      const minSize = 15;

      switch (resizeHandle) {
        case 'nw':
          y0 = Math.max(0, Math.min(y1 - minSize, y0 + deltaY));
          x0 = Math.max(0, Math.min(x1 - minSize, x0 + deltaX));
          break;
        case 'n':
          y0 = Math.max(0, Math.min(y1 - minSize, y0 + deltaY));
          break;
        case 'ne':
          y0 = Math.max(0, Math.min(y1 - minSize, y0 + deltaY));
          x1 = Math.min(1000, Math.max(x0 + minSize, x1 + deltaX));
          break;
        case 'e':
          x1 = Math.min(1000, Math.max(x0 + minSize, x1 + deltaX));
          break;
        case 'se':
          y1 = Math.min(1000, Math.max(y0 + minSize, y1 + deltaY));
          x1 = Math.min(1000, Math.max(x0 + minSize, x1 + deltaX));
          break;
        case 's':
          y1 = Math.min(1000, Math.max(y0 + minSize, y1 + deltaY));
          break;
        case 'sw':
          y1 = Math.min(1000, Math.max(y0 + minSize, y1 + deltaY));
          x0 = Math.max(0, Math.min(x1 - minSize, x0 + deltaX));
          break;
        case 'w':
          x0 = Math.max(0, Math.min(x1 - minSize, x0 + deltaX));
          break;
      }

      const newBoxes = currentItem.boxes.map((b) =>
        b.id === selectedBoxId
          ? { ...b, box_2d: [y0, x0, y1, x1] as [number, number, number, number] }
          : b
      );
      onUpdateItemBoxes(currentItem.id, newBoxes);
      return;
    }
  };

  // Handle Mouse Up
  const handleMouseUp = () => {
    if (isPanning) {
      setIsPanning(false);
      return;
    }

    if (isDraggingBox || resizeHandle) {
      setIsDraggingBox(false);
      setResizeHandle(null);
      setDragStartPos(null);
      setInitialBoxCoords(null);
      return;
    }

    if (isDrawing && drawStart && drawCurrent && currentItem) {
      const ymin = Math.min(drawStart.y, drawCurrent.y);
      const xmin = Math.min(drawStart.x, drawCurrent.x);
      const ymax = Math.max(drawStart.y, drawCurrent.y);
      const xmax = Math.max(drawStart.x, drawCurrent.x);

      // Only create if box has minimum dimensions (at least 15 units on 1000 scale)
      if (xmax - xmin > 15 && ymax - ymin > 15) {
        const newBox: BoundingBox = {
          id: `box-${Date.now()}-${Math.random().toString(36).substring(2, 6)}`,
          label: activeClass?.name || 'Object',
          box_2d: [ymin, xmin, ymax, xmax],
          confidence: 1.0,
          isAiSuggested: false,
          reviewed: true,
        };

        const updatedBoxes = [...currentItem.boxes, newBox];
        onUpdateItemBoxes(currentItem.id, updatedBoxes, 'annotated');
        setSelectedBoxId(newBox.id);
      }

      setIsDrawing(false);
      setDrawStart(null);
      setDrawCurrent(null);
    }
  };

  const handleAcceptAllAiSuggestions = () => {
    if (!currentItem) return;
    const updatedBoxes = currentItem.boxes.map((b) => ({
      ...b,
      isAiSuggested: false,
      reviewed: true,
    }));
    onUpdateItemBoxes(currentItem.id, updatedBoxes, 'annotated');
  };

  const handleAcceptSingleBox = (boxId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem) return;
    const updatedBoxes = currentItem.boxes.map((b) =>
      b.id === boxId ? { ...b, isAiSuggested: false, reviewed: true } : b
    );
    onUpdateItemBoxes(currentItem.id, updatedBoxes);
  };

  const handleRejectSingleBox = (boxId: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (!currentItem) return;
    const updatedBoxes = currentItem.boxes.filter((b) => b.id !== boxId);
    onUpdateItemBoxes(currentItem.id, updatedBoxes);
    if (selectedBoxId === boxId) setSelectedBoxId(null);
  };

  const toggleBoxVisibility = (boxId: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setHiddenBoxIds((prev) => {
      const next = new Set(prev);
      if (next.has(boxId)) next.delete(boxId);
      else next.add(boxId);
      return next;
    });
  };

  const getClassColor = (label: string): string => {
    const found = classes.find((c) => c.name.toLowerCase() === label.toLowerCase());
    return found ? found.color : '#3B82F6';
  };

  const pendingAiCount = currentItem?.boxes.filter((b) => b.isAiSuggested).length || 0;

  return (
    <div className="flex-1 flex flex-col min-h-0 bg-slate-950 overflow-hidden select-none">
      {/* Top Toolbar */}
      <div className="h-11 px-4 border-b border-slate-800 bg-slate-900/60 flex items-center justify-between shrink-0">
        {/* Left: Tool Selectors & Hotkey hints */}
        <div className="flex items-center gap-1.5">
          <div className="flex items-center bg-slate-950/80 p-0.5 rounded-lg border border-slate-800">
            <button
              onClick={() => setToolMode('draw')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                toolMode === 'draw'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Box Drawing Tool (W)"
            >
              <Square className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Box (W)</span>
            </button>

            <button
              onClick={() => setToolMode('select')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                toolMode === 'select'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Select / Move Tool (V)"
            >
              <MousePointer className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Select (V)</span>
            </button>

            <button
              onClick={() => setToolMode('pan')}
              className={`p-1.5 rounded-md text-xs font-medium flex items-center gap-1 transition-colors ${
                toolMode === 'pan'
                  ? 'bg-indigo-600 text-white shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/60'
              }`}
              title="Pan Tool (Space + Drag)"
            >
              <Hand className="w-3.5 h-3.5" />
              <span className="hidden sm:inline">Pan</span>
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1" />

          {/* Zoom controls */}
          <div className="flex items-center gap-1 bg-slate-950/80 px-1.5 py-1 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => setZoom((z) => Math.max(0.4, Number((z - 0.2).toFixed(1))))}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              title="Zoom Out (-)"
            >
              <ZoomOut className="w-3.5 h-3.5" />
            </button>
            <span className="w-12 text-center font-mono tabular-nums text-slate-300">
              {Math.round(zoom * 100)}%
            </span>
            <button
              onClick={() => setZoom((z) => Math.min(3.5, Number((z + 0.2).toFixed(1))))}
              className="text-slate-400 hover:text-white p-0.5 rounded cursor-pointer"
              title="Zoom In (+)"
            >
              <ZoomIn className="w-3.5 h-3.5" />
            </button>
            <button
              onClick={() => {
                setZoom(1);
                setPanOffset({ x: 0, y: 0 });
              }}
              className="text-slate-400 hover:text-white p-0.5 ml-1 border-l border-slate-800 pl-1.5 cursor-pointer"
              title="Fit to Screen"
            >
              <Maximize2 className="w-3 h-3" />
            </button>
          </div>

          <div className="h-4 w-px bg-slate-800 mx-1 hidden lg:block" />

          {/* Scenario Benchmark Quick Switcher */}
          <div className="hidden lg:flex items-center gap-1 bg-slate-950/80 p-0.5 rounded-lg border border-slate-800 text-xs">
            <button
              onClick={() => onSelectItemIndex(0)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                currentItemIndex === 0
                  ? 'bg-blue-600/30 text-blue-300 border border-blue-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Urban Driving: vehicles, pedestrians, bike, signs"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-blue-400" />
              <span>Urban (042)</span>
            </button>
            <button
              onClick={() => onSelectItemIndex(1)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                currentItemIndex === 1
                  ? 'bg-amber-600/30 text-amber-300 border border-amber-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Warehouse Logistics: forklift, racks, pallets, workers"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-amber-400" />
              <span>Forklift & Warehouse (089)</span>
            </button>
            <button
              onClick={() => onSelectItemIndex(2)}
              className={`px-2 py-1 rounded text-xs font-medium transition-colors cursor-pointer flex items-center gap-1 ${
                currentItemIndex === 2
                  ? 'bg-emerald-600/30 text-emerald-300 border border-emerald-500/40 shadow-xs'
                  : 'text-slate-400 hover:text-slate-200'
              }`}
              title="Retail Supermarket: beverages, cereal boxes, pasta, cans, price tags"
            >
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
              <span>Shelf & Consumables (014)</span>
            </button>
          </div>
        </div>

        {/* Center: AI Pending Notice */}
        {pendingAiCount > 0 && (
          <div className="flex items-center gap-2 px-3 py-1 bg-amber-500/10 border border-amber-500/30 rounded-lg text-xs text-amber-300">
            <Sparkles className="w-3.5 h-3.5 text-amber-400 animate-pulse" />
            <span>
              <strong className="font-semibold">{pendingAiCount}</strong> AI suggested box{pendingAiCount > 1 ? 'es' : ''} to review
            </span>
            <button
              onClick={handleAcceptAllAiSuggestions}
              className="ml-2 px-2 py-0.5 bg-amber-500 hover:bg-amber-400 text-slate-950 font-semibold rounded text-[11px] transition-colors cursor-pointer"
            >
              Accept All
            </button>
          </div>
        )}

        {/* Right: Quick Image Action & AI Trigger */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => onTriggerAiDetection(currentItem, confidenceThreshold, taskGuidelines)}
            disabled={isAiLoading || !currentItem}
            className="flex items-center gap-1.5 px-2.5 py-1 text-xs font-medium text-white bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 rounded-lg transition-colors cursor-pointer"
            title="Detect objects on current image with Gemini AI"
          >
            {isAiLoading ? (
              <div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <Sparkles className="w-3.5 h-3.5" />
            )}
            <span>Detect Objects (AI)</span>
          </button>
        </div>
      </div>

      {/* Main Workspace (Canvas + Right Sidebar) */}
      <div className="flex-1 flex min-h-0 relative">
        {/* Canvas Viewport */}
        <div
          ref={containerRef}
          onMouseDown={handleMouseDown}
          onMouseMove={handleMouseMove}
          onMouseUp={handleMouseUp}
          className={`flex-1 relative overflow-hidden bg-slate-950 flex items-center justify-center ${
            toolMode === 'pan' || isPanning ? 'cursor-grab active:cursor-grabbing' : toolMode === 'draw' ? 'cursor-crosshair' : 'cursor-default'
          }`}
        >
          {/* Subtle Grid Background Pattern */}
          <div
            className="absolute inset-0 pointer-events-none opacity-15"
            style={{
              backgroundImage: 'radial-gradient(circle, #475569 1px, transparent 1px)',
              backgroundSize: '24px 24px',
            }}
          />

          {currentItem ? (
            <div
              className="relative transition-transform duration-75 origin-center select-none"
              style={{
                transform: `translate(${panOffset.x}px, ${panOffset.y}px) scale(${zoom})`,
              }}
            >
              {/* Image element */}
              <img
                ref={imageRef}
                src={currentItem.imageUrl}
                alt={currentItem.name}
                draggable={false}
                className="max-w-none shadow-2xl rounded-sm border border-slate-800 pointer-events-none"
                style={{ width: `${currentItem.width}px`, height: `${currentItem.height}px` }}
              />

              {/* Existing Bounding Boxes SVG Overlay */}
              <svg
                className="absolute inset-0 w-full h-full pointer-events-none"
                viewBox={`0 0 ${currentItem.width} ${currentItem.height}`}
              >
                {currentItem.boxes.map((box) => {
                  if (hiddenBoxIds.has(box.id)) return null;

                  const [ymin, xmin, ymax, xmax] = box.box_2d;
                  const x = (xmin / 1000) * currentItem.width;
                  const y = (ymin / 1000) * currentItem.height;
                  const width = ((xmax - xmin) / 1000) * currentItem.width;
                  const height = ((ymax - ymin) / 1000) * currentItem.height;
                  const isSelected = selectedBoxId === box.id;
                  const boxColor = getClassColor(box.label);

                  return (
                    <g
                      key={box.id}
                      className="pointer-events-auto"
                      onClick={(e) => {
                        e.stopPropagation();
                        setSelectedBoxId(box.id);
                      }}
                    >
                      {/* Box Rectangle */}
                      <rect
                        x={x}
                        y={y}
                        width={width}
                        height={height}
                        fill={boxColor}
                        fillOpacity={isSelected ? 0.25 : 0.12}
                        stroke={boxColor}
                        strokeWidth={isSelected ? 3 : 2}
                        strokeDasharray={box.isAiSuggested ? '6 4' : 'none'}
                        className="transition-colors pointer-events-auto"
                        style={{ cursor: isSelected ? 'move' : 'pointer' }}
                        onMouseDown={(e) => handleBoxMouseDown(box, e)}
                      />

                      {/* AI Pulsing Glow effect if suggested */}
                      {box.isAiSuggested && (
                        <rect
                          x={x - 2}
                          y={y - 2}
                          width={width + 4}
                          height={height + 4}
                          fill="none"
                          stroke={boxColor}
                          strokeWidth={1}
                          opacity={0.6}
                          strokeDasharray="4 4"
                          className="animate-pulse pointer-events-none"
                        />
                      )}

                      {/* Label Badge on Top of Box */}
                      <foreignObject
                        x={x}
                        y={Math.max(0, y - 24)}
                        width={Math.max(160, width)}
                        height={24}
                        className="overflow-visible"
                      >
                        <div className="flex items-center gap-1.5 whitespace-nowrap">
                          <span
                            className="text-[11px] font-semibold text-white px-2 py-0.5 rounded shadow-md flex items-center gap-1 cursor-grab"
                            style={{ backgroundColor: boxColor }}
                            onMouseDown={(e) => handleBoxMouseDown(box, e)}
                          >
                            <span>{box.label}</span>
                            {box.confidence && (
                              <span className="font-mono opacity-80 text-[10px]">
                                {Math.round(box.confidence * 100)}%
                              </span>
                            )}
                            {box.isAiSuggested && (
                              <span className="bg-amber-400 text-slate-950 font-bold px-1 rounded text-[9px]">
                                AI
                              </span>
                            )}
                          </span>

                          {/* Quick Accept/Reject inline buttons when box is selected or AI suggested */}
                          {(isSelected || box.isAiSuggested) && (
                            <div className="flex items-center gap-1 bg-slate-900/90 border border-slate-700 rounded p-0.5 shadow-lg">
                              {box.isAiSuggested && (
                                <button
                                  onClick={(e) => handleAcceptSingleBox(box.id, e)}
                                  className="p-1 hover:bg-emerald-600/40 text-emerald-400 rounded transition-colors"
                                  title="Accept AI Box (Enter)"
                                >
                                  <Check className="w-3 h-3" />
                                </button>
                              )}
                              <button
                                onClick={(e) => handleRejectSingleBox(box.id, e)}
                                className="p-1 hover:bg-rose-600/40 text-rose-400 rounded transition-colors"
                                title="Delete Box (Del)"
                              >
                                <Trash2 className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </div>
                      </foreignObject>

                      {/* 8-Directional Resize Handles when selected */}
                      {isSelected && (
                        <g className="pointer-events-auto">
                          {[
                            { id: 'nw' as const, cx: x, cy: y, cursor: 'nwse-resize' },
                            { id: 'n' as const, cx: x + width / 2, cy: y, cursor: 'ns-resize' },
                            { id: 'ne' as const, cx: x + width, cy: y, cursor: 'nesw-resize' },
                            { id: 'e' as const, cx: x + width, cy: y + height / 2, cursor: 'ew-resize' },
                            { id: 'se' as const, cx: x + width, cy: y + height, cursor: 'nwse-resize' },
                            { id: 's' as const, cx: x + width / 2, cy: y + height, cursor: 'ns-resize' },
                            { id: 'sw' as const, cx: x, cy: y + height, cursor: 'nesw-resize' },
                            { id: 'w' as const, cx: x, cy: y + height / 2, cursor: 'ew-resize' },
                          ].map((h) => (
                            <g
                              key={h.id}
                              className="cursor-pointer"
                              style={{ cursor: h.cursor }}
                              onMouseDown={(e) => handleResizeHandleMouseDown(h.id, e)}
                            >
                              {/* Invisible larger hit target (r=12) */}
                              <circle cx={h.cx} cy={h.cy} r={12} fill="transparent" />
                              {/* Visible handle */}
                              <rect
                                x={h.cx - 4.5}
                                y={h.cy - 4.5}
                                width={9}
                                height={9}
                                rx={1.5}
                                fill="#ffffff"
                                stroke={boxColor}
                                strokeWidth={2}
                                className="shadow-md"
                              />
                            </g>
                          ))}

                          {/* Live Box Dimension Tooltip HUD */}
                          <foreignObject
                            x={x}
                            y={y + height + 6}
                            width={Math.max(160, width)}
                            height={24}
                            className="overflow-visible pointer-events-none"
                          >
                            <div className="flex items-center gap-1.5 font-mono text-[10px] text-slate-300 bg-slate-950/90 border border-slate-700/80 px-2 py-0.5 rounded shadow-lg backdrop-blur-sm whitespace-nowrap w-fit">
                              <span>{Math.round(width)} × {Math.round(height)} px</span>
                              <span className="text-slate-600">|</span>
                              <span className="text-indigo-400">[{ymin}, {xmin}, {ymax}, {xmax}]</span>
                            </div>
                          </foreignObject>
                        </g>
                      )}
                    </g>
                  );
                })}

                {/* Active Drawing Box Preview */}
                {isDrawing && drawStart && drawCurrent && (
                  <rect
                    x={(Math.min(drawStart.x, drawCurrent.x) / 1000) * currentItem.width}
                    y={(Math.min(drawStart.y, drawCurrent.y) / 1000) * currentItem.height}
                    width={(Math.abs(drawCurrent.x - drawStart.x) / 1000) * currentItem.width}
                    height={(Math.abs(drawCurrent.y - drawStart.y) / 1000) * currentItem.height}
                    fill={activeClass?.color || '#3B82F6'}
                    fillOpacity={0.25}
                    stroke={activeClass?.color || '#3B82F6'}
                    strokeWidth={2}
                    strokeDasharray="4 2"
                  />
                )}
              </svg>
            </div>
          ) : (
            <div className="text-center text-slate-500">
              <p>No images loaded in dataset.</p>
            </div>
          )}
        </div>

        {/* Right Sidebar: Taxonomy & Annotation Inspector */}
        <div className="w-72 border-l border-slate-800 bg-slate-900/90 flex flex-col shrink-0">
          {/* Class Palette Section */}
          <div className="p-3 border-b border-slate-800">
            <div className="flex items-center justify-between mb-2">
              <span className="text-xs font-semibold text-slate-300">Label Classes</span>
              <span className="text-[11px] text-slate-500 font-mono">Press 1-{classes.length}</span>
            </div>

            <div className="grid grid-cols-2 gap-1.5 max-h-40 overflow-y-auto pr-1">
              {classes.map((c) => {
                const countInItem = currentItem?.boxes.filter((b) => b.label === c.name).length || 0;
                const isSelected = activeClassId === c.id;

                return (
                  <button
                    key={c.id}
                    onClick={() => {
                      setActiveClassId(c.id);
                      if (selectedBoxId && currentItem) {
                        const newBoxes = currentItem.boxes.map((b) =>
                          b.id === selectedBoxId ? { ...b, label: c.name } : b
                        );
                        onUpdateItemBoxes(currentItem.id, newBoxes);
                      }
                    }}
                    className={`flex items-center justify-between px-2 py-1.5 rounded-md text-xs transition-all cursor-pointer ${
                      isSelected
                        ? 'bg-slate-800 border border-slate-700 shadow-sm text-white'
                        : 'bg-slate-950/60 border border-slate-800/80 text-slate-400 hover:text-slate-200 hover:bg-slate-800/40'
                    }`}
                  >
                    <div className="flex items-center gap-1.5 truncate">
                      <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: c.color }} />
                      <span className="truncate">{c.name}</span>
                    </div>
                    <div className="flex items-center gap-1 shrink-0 font-mono text-[10px]">
                      {countInItem > 0 && (
                        <span className="text-slate-300 bg-slate-800 px-1 rounded tabular-nums">
                          {countInItem}
                        </span>
                      )}
                      <kbd className="text-slate-500 bg-slate-900 px-1 rounded text-[9px]">{c.hotkey}</kbd>
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* AI Settings Accordion / Quick Sliders */}
          <div className="p-3 border-b border-slate-800 bg-slate-950/40 text-xs">
            <div className="flex items-center justify-between mb-1.5">
              <span className="text-slate-400 font-medium flex items-center gap-1">
                <Sliders className="w-3.5 h-3.5 text-indigo-400" />
                <span>AI Confidence Gate</span>
              </span>
              <span className="font-mono tabular-nums text-indigo-300 font-semibold">
                {Math.round(confidenceThreshold * 100)}%
              </span>
            </div>
            <input
              type="range"
              min="0.50"
              max="0.95"
              step="0.05"
              value={confidenceThreshold}
              onChange={(e) => setConfidenceThreshold(parseFloat(e.target.value))}
              className="w-full accent-indigo-500 h-1.5 bg-slate-800 rounded-lg cursor-pointer"
            />
            <p className="text-[10px] text-slate-500 mt-1">
              Detections below threshold trigger human review flags.
            </p>

            <button
              onClick={() => setShowGuidelinesInput(!showGuidelinesInput)}
              className="mt-2 text-[11px] text-indigo-400 hover:text-indigo-300 flex items-center gap-1 cursor-pointer"
            >
              <span>{showGuidelinesInput ? '- Hide' : '+ Custom AI Guidelines'}</span>
            </button>

            {showGuidelinesInput && (
              <textarea
                value={taskGuidelines}
                onChange={(e) => setTaskGuidelines(e.target.value)}
                placeholder="e.g., Only detect moving vehicles, ignore parked cars..."
                rows={2}
                className="mt-1.5 w-full bg-slate-900 border border-slate-800 rounded p-1.5 text-slate-200 placeholder-slate-600 text-xs focus:outline-none focus:border-indigo-500"
              />
            )}
          </div>

          {/* Detections in Current Image List */}
          <div className="flex-1 flex flex-col min-h-0">
            <div className="p-3 pb-1 flex items-center justify-between">
              <span className="text-xs font-semibold text-slate-300">
                Annotations ({currentItem?.boxes.length || 0})
              </span>
              {currentItem && currentItem.boxes.length > 0 && (
                <button
                  onClick={() => onUpdateItemBoxes(currentItem.id, [])}
                  className="text-[11px] text-rose-400 hover:text-rose-300 cursor-pointer"
                >
                  Clear All
                </button>
              )}
            </div>

            <div className="flex-1 overflow-y-auto px-3 py-1 space-y-1.5">
              {currentItem?.boxes.length === 0 ? (
                <div className="h-32 flex flex-col items-center justify-center text-center text-slate-500 text-xs">
                  <Square className="w-5 h-5 mb-1 opacity-40" />
                  <p>No bounding boxes yet</p>
                  <p className="text-[10px] text-slate-600">Drag on canvas to draw (W)</p>
                </div>
              ) : (
                currentItem?.boxes.map((box) => {
                  const isSelected = selectedBoxId === box.id;
                  const isHidden = hiddenBoxIds.has(box.id);
                  const color = getClassColor(box.label);

                  return (
                    <div
                      key={box.id}
                      onClick={() => setSelectedBoxId(box.id)}
                      className={`p-2 rounded-lg border text-xs transition-all cursor-pointer ${
                        isSelected
                          ? 'bg-slate-800/90 border-indigo-500/80 shadow-sm'
                          : 'bg-slate-950/60 border-slate-800/80 hover:bg-slate-800/40'
                      }`}
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-1.5 truncate">
                          <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: color }} />
                          <select
                            value={box.label}
                            onChange={(e) => {
                              const newLabel = e.target.value;
                              const newBoxes = currentItem.boxes.map((b) =>
                                b.id === box.id ? { ...b, label: newLabel } : b
                              );
                              onUpdateItemBoxes(currentItem.id, newBoxes);
                            }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-transparent text-slate-200 font-medium focus:outline-none cursor-pointer truncate max-w-[110px]"
                          >
                            {classes.map((c) => (
                              <option key={c.id} value={c.name} className="bg-slate-900 text-slate-200">
                                {c.name}
                              </option>
                            ))}
                          </select>
                        </div>

                        <div className="flex items-center gap-1 shrink-0">
                          {box.confidence && (
                            <span className="font-mono text-[10px] text-slate-400 tabular-nums">
                              {Math.round(box.confidence * 100)}%
                            </span>
                          )}

                          <button
                            onClick={(e) => toggleBoxVisibility(box.id, e)}
                            className="p-1 text-slate-500 hover:text-slate-300 rounded"
                            title={isHidden ? 'Show Box' : 'Hide Box'}
                          >
                            {isHidden ? <EyeOff className="w-3 h-3" /> : <Eye className="w-3 h-3" />}
                          </button>

                          <button
                            onClick={(e) => handleRejectSingleBox(box.id, e)}
                            className="p-1 text-slate-500 hover:text-rose-400 rounded"
                            title="Delete Box"
                          >
                            <Trash2 className="w-3 h-3" />
                          </button>
                        </div>
                      </div>

                      {/* AI Suggestion Banner / Rationale */}
                      {box.isAiSuggested && (
                        <div className="mt-1.5 pt-1.5 border-t border-slate-800/80 flex items-center justify-between text-[10px]">
                          <span className="text-amber-400 font-medium flex items-center gap-1">
                            <Sparkles className="w-2.5 h-2.5" />
                            <span>AI Proposal</span>
                          </span>
                          <div className="flex items-center gap-1">
                            <button
                              onClick={(e) => handleAcceptSingleBox(box.id, e)}
                              className="px-1.5 py-0.5 bg-emerald-600/80 hover:bg-emerald-500 text-white rounded font-medium"
                            >
                              Accept
                            </button>
                            <button
                              onClick={(e) => handleRejectSingleBox(box.id, e)}
                              className="px-1.5 py-0.5 bg-slate-800 hover:bg-slate-700 text-slate-300 rounded"
                            >
                              Reject
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  );
                })
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Bottom Filmstrip Carousel */}
      <div className="h-18 px-4 border-t border-slate-800 bg-slate-900/90 flex items-center justify-between shrink-0 gap-3">
        {/* Navigation Buttons */}
        <div className="flex items-center gap-1 shrink-0">
          <button
            onClick={() => onSelectItemIndex(Math.max(0, currentItemIndex - 1))}
            disabled={currentItemIndex === 0}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
            title="Previous Image (A)"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="font-mono text-xs tabular-nums text-slate-400 px-1">
            {currentItemIndex + 1} / {items.length}
          </span>
          <button
            onClick={() => onSelectItemIndex(Math.min(items.length - 1, currentItemIndex + 1))}
            disabled={currentItemIndex === items.length - 1}
            className="p-1.5 rounded-lg border border-slate-800 bg-slate-950 text-slate-400 hover:text-white disabled:opacity-30 cursor-pointer"
            title="Next Image (D)"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Thumbnails */}
        <div className="flex-1 flex items-center gap-2 overflow-x-auto py-1">
          {items.map((item, idx) => {
            const isCurrent = idx === currentItemIndex;
            const hasAi = item.boxes.some((b) => b.isAiSuggested);
            const isDone = item.status === 'annotated' || item.status === 'reviewed';

            return (
              <button
                key={item.id}
                onClick={() => onSelectItemIndex(idx)}
                className={`relative shrink-0 h-13 w-20 rounded-md overflow-hidden border-2 transition-all cursor-pointer ${
                  isCurrent
                    ? 'border-indigo-500 ring-2 ring-indigo-500/20 shadow-md'
                    : 'border-slate-800 opacity-60 hover:opacity-100'
                }`}
              >
                <img
                  src={item.imageUrl}
                  alt={item.name}
                  className="w-full h-full object-cover"
                />

                {/* Status Indicator */}
                <div className="absolute top-1 right-1">
                  {hasAi ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-amber-500 text-slate-950 flex items-center justify-center text-[9px] font-bold">
                      ✦
                    </span>
                  ) : isDone ? (
                    <span className="w-3.5 h-3.5 rounded-full bg-emerald-500 text-white flex items-center justify-center text-[9px]">
                      ✓
                    </span>
                  ) : null}
                </div>

                {/* Box count badge */}
                <div className="absolute bottom-0.5 left-1 text-[9px] font-mono tabular-nums text-white bg-slate-950/80 px-1 rounded">
                  {item.boxes.length}
                </div>
              </button>
            );
          })}

          {/* Upload New Image */}
          <button
            onClick={() => fileInputRef.current?.click()}
            className="shrink-0 h-13 w-20 rounded-md border-2 border-dashed border-slate-800 hover:border-slate-700 bg-slate-950/40 flex flex-col items-center justify-center text-slate-500 hover:text-slate-300 transition-colors cursor-pointer"
            title="Upload custom image"
          >
            <Plus className="w-4 h-4" />
            <span className="text-[10px] mt-0.5">Upload</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) {
                onAddNewImage(file);
                e.target.value = '';
              }
            }}
          />
        </div>
      </div>
    </div>
  );
};
