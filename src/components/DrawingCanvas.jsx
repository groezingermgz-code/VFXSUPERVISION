import React, { useEffect, useRef, useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

// Einfache Zeichenfläche mit Maus/Touch, Farb- und Pinselkontrolle,
// optionalem Hintergrundbild sowie Export als PNG.
// Props:
// - width, height: gewünschte CSS-Größe der Zeichenfläche
// - onSave(dataUrl): Callback mit PNG DataURL
// - initialColor, initialSize: Startwerte für Farbe und Pinselgröße
// - backgroundImage: optionaler DataURL/String zum Laden als Hintergrund
// - saveLabel: Label für den Speichern/Anwenden-Button
// - hideBackgroundUpload: blendet den Upload für Hintergrund aus
const DrawingCanvas = ({
  width = 800,
  height = 400,
  onSave,
  initialColor = '#ffdd00',
  initialSize = 6,
  backgroundImage,
  saveLabel,
  hideBackgroundUpload = false,
  actionsPlacement = 'end',
}) => {
  const { t } = useLanguage();
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(initialColor);
  const [size, setSize] = useState(initialSize);
  const [bgImageUrl, setBgImageUrl] = useState(null);
  const bgImageRef = useRef(null);
  const [tool, setTool] = useState('pen'); // 'pen' | 'rect' | 'arrow' | 'text'
  const [actions, setActions] = useState([]);
  const [redoStack, setRedoStack] = useState([]);
  const [currentPath, setCurrentPath] = useState(null);
  const [dragStart, setDragStart] = useState(null);
  const [previewShape, setPreviewShape] = useState(null);
  const [textValue, setTextValue] = useState('');
  const actionsJustify = actionsPlacement === 'start' ? 'flex-start' : actionsPlacement === 'center' ? 'center' : 'flex-end';

  const setupCanvas = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.floor(width * dpr);
    canvas.height = Math.floor(height * dpr);
    canvas.style.width = `${width}px`;
    canvas.style.height = `${height}px`;
    const ctx = canvas.getContext('2d');
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    ctx.lineJoin = 'round';
    ctx.lineCap = 'round';
    ctxRef.current = ctx;
    // Hintergrund initial zeichnen
    redrawAll();
  };

  const redrawBackground = () => {
    const canvas = canvasRef.current;
    const ctx = ctxRef.current;
    if (!canvas || !ctx) return;
    ctx.fillStyle = getComputedStyle(document.documentElement).getPropertyValue('--card-bg') || '#222';
    ctx.fillRect(0, 0, width, height);
    if (bgImageRef.current) {
      try {
        const img = bgImageRef.current;
        // Bild passend einzeichnen (contain)
        const scale = Math.min(width / img.width, height / img.height);
        const dw = img.width * scale;
        const dh = img.height * scale;
        const dx = (width - dw) / 2;
        const dy = (height - dh) / 2;
        ctx.drawImage(img, dx, dy, dw, dh);
      } catch {}
    }
  };

  const drawAction = (ctx, action) => {
    if (!ctx || !action) return;
    ctx.strokeStyle = action.color || color;
    ctx.fillStyle = action.color || color;
    ctx.lineWidth = action.size || size;
    if (action.type === 'pen') {
      const pts = action.points || [];
      if (pts.length > 1) {
        ctx.beginPath();
        ctx.moveTo(pts[0].x, pts[0].y);
        for (let i = 1; i < pts.length; i++) {
          ctx.lineTo(pts[i].x, pts[i].y);
        }
        ctx.stroke();
      }
    } else if (action.type === 'rect') {
      const start = action.start;
      const end = action.end;
      const w = end.x - start.x;
      const h = end.y - start.y;
      ctx.strokeRect(start.x, start.y, w, h);
    } else if (action.type === 'arrow') {
      const start = action.start;
      const end = action.end;
      // Linie
      ctx.beginPath();
      ctx.moveTo(start.x, start.y);
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      // Pfeilspitze
      const angle = Math.atan2(end.y - start.y, end.x - start.x);
      const headLength = (action.size || 6) * 4;
      ctx.beginPath();
      ctx.moveTo(end.x, end.y);
      ctx.lineTo(end.x - headLength * Math.cos(angle - Math.PI / 6), end.y - headLength * Math.sin(angle - Math.PI / 6));
      ctx.lineTo(end.x - headLength * Math.cos(angle + Math.PI / 6), end.y - headLength * Math.sin(angle + Math.PI / 6));
      ctx.lineTo(end.x, end.y);
      ctx.stroke();
      ctx.closePath();
    } else if (action.type === 'text') {
      const sizePx = Math.max(12, (action.size || 6) * 4);
      ctx.fillStyle = action.color;
      ctx.font = `${sizePx}px sans-serif`;
      ctx.fillText(action.text || '', action.x, action.y);
    }
  };

  const redrawAll = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    redrawBackground();
    try {
      (actions || []).forEach(a => drawAction(ctx, a));
      if (previewShape) {
        drawAction(ctx, previewShape);
      }
    } catch {}
  };

  useEffect(() => {
    setupCanvas();
    const handleResize = () => {
      // Canvas neu initialisieren bei DPI/Resize
      setupCanvas();
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [width, height]);

  useEffect(() => {
    redrawAll();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [actions, previewShape, bgImageUrl]);

  // Hintergrund aus Prop laden/aktualisieren
  useEffect(() => {
    if (backgroundImage === undefined) return; // Prop nicht gesetzt
    if (backgroundImage) {
      const img = new Image();
      img.onload = () => {
        bgImageRef.current = img;
        setBgImageUrl(backgroundImage);
        redrawBackground();
        redrawAll();
      };
      img.src = backgroundImage;
    } else if (backgroundImage === null) {
      bgImageRef.current = null;
      setBgImageUrl(null);
      redrawBackground();
      redrawAll();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [backgroundImage]);

  // Pointer Handling
  const getPos = (e) => {
    const rect = canvasRef.current.getBoundingClientRect();
    const x = (e.clientX ?? (e.touches && e.touches[0]?.clientX)) - rect.left;
    const y = (e.clientY ?? (e.touches && e.touches[0]?.clientY)) - rect.top;
    return { x, y };
  };

  const onPointerDown = (e) => {
    e.preventDefault();
    const { x, y } = getPos(e);
    const ctx = ctxRef.current;
    if (!ctx) return;
    if (tool === 'pen') {
      const path = [{ x, y }];
      setCurrentPath(path);
      setPreviewShape({ type: 'pen', points: path, color, size });
      setIsDrawing(true);
    } else if (tool === 'rect') {
      setDragStart({ x, y });
      setPreviewShape({ type: 'rect', start: { x, y }, end: { x, y }, color, size });
      setIsDrawing(true);
    } else if (tool === 'arrow') {
      setDragStart({ x, y });
      setPreviewShape({ type: 'arrow', start: { x, y }, end: { x, y }, color, size });
      setIsDrawing(true);
    } else if (tool === 'text') {
      const text = textValue?.trim() || '';
      if (!text) {
        const p = window.prompt(t('notes.canvas.textPrompt'));
        if (!p) return;
        const action = { type: 'text', x, y, text: p, color, size };
        setActions(prev => [...prev, action]);
        setRedoStack([]);
        redrawAll();
      } else {
        const action = { type: 'text', x, y, text: textValue, color, size };
        setActions(prev => [...prev, action]);
        setRedoStack([]);
        redrawAll();
      }
      setIsDrawing(false);
    }
  };

  const onPointerMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    if (tool === 'pen') {
      setCurrentPath(prev => {
        const next = (prev || []).concat({ x, y });
        setPreviewShape({ type: 'pen', points: next, color, size });
        return next;
      });
    } else if (tool === 'rect') {
      setPreviewShape({ type: 'rect', start: dragStart, end: { x, y }, color, size });
    } else if (tool === 'arrow') {
      setPreviewShape({ type: 'arrow', start: dragStart, end: { x, y }, color, size });
    }
    redrawAll();
  };

  const onPointerUp = (e) => {
    if (!isDrawing) return;
    const endPos = e ? getPos(e) : null;
    if (tool === 'pen') {
      const path = currentPath || [];
      if (path.length > 1) {
        const action = { type: 'pen', points: path, color, size };
        setActions(prev => [...prev, action]);
        setRedoStack([]);
      }
      setCurrentPath(null);
    } else if (tool === 'rect') {
      const action = { type: 'rect', start: dragStart, end: endPos || dragStart, color, size };
      setActions(prev => [...prev, action]);
      setRedoStack([]);
      setDragStart(null);
    } else if (tool === 'arrow') {
      const action = { type: 'arrow', start: dragStart, end: endPos || dragStart, color, size };
      setActions(prev => [...prev, action]);
      setRedoStack([]);
      setDragStart(null);
    }
    setPreviewShape(null);
    setIsDrawing(false);
    redrawAll();
  };

  const handleClear = () => {
    setActions([]);
    setRedoStack([]);
    setPreviewShape(null);
    const ctx = ctxRef.current;
    if (ctx) {
      ctx.clearRect(0, 0, width, height);
    }
    redrawAll();
  };

  const handleUndo = () => {
    setActions(prev => {
      if (!prev.length) return prev;
      const next = prev.slice(0, -1);
      const last = prev[prev.length - 1];
      setRedoStack(r => [...r, last]);
      return next;
    });
  };

  const handleRedo = () => {
    setRedoStack(prev => {
      if (!prev.length) return prev;
      const nextRedo = prev.slice(0, -1);
      const last = prev[prev.length - 1];
      setActions(a => [...a, last]);
      return nextRedo;
    });
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    const prefix = t('notes.canvas.filePrefix');
    a.download = `${prefix}_${Date.now()}.png`;
    a.click();
  };

  const handleSaveToNote = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    if (typeof onSave === 'function') {
      onSave(url);
    }
  };

  const handleExportJSON = () => {
    const data = {
      version: 1,
      width,
      height,
      actions,
      backgroundImage: bgImageUrl || null,
      color,
      size,
    };
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    const prefix = t('notes.canvas.filePrefix');
    a.download = `${prefix}_${Date.now()}.json`;
    a.click();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
  };

  const handleImportJSON = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      try {
        const data = JSON.parse(reader.result);
        if (data.backgroundImage) {
          const img = new Image();
          img.onload = () => {
            bgImageRef.current = img;
            setBgImageUrl(data.backgroundImage);
            setActions(Array.isArray(data.actions) ? data.actions : []);
            setRedoStack([]);
            redrawAll();
          };
          img.src = data.backgroundImage;
        } else {
          setBgImageUrl(null);
          bgImageRef.current = null;
          setActions(Array.isArray(data.actions) ? data.actions : []);
          setRedoStack([]);
          redrawAll();
        }
      } catch (err) {
        console.error(t('notes.canvas.jsonImportError'), err);
      }
    };
    reader.readAsText(file);
  };

  const handleBgUpload = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.onload = () => {
        bgImageRef.current = img;
        setBgImageUrl(reader.result);
        redrawBackground();
      };
      img.src = reader.result;
    };
    reader.readAsDataURL(file);
  };

  return (
    <div ref={containerRef} className="drawing-canvas card" style={{ padding: '12px' }}>
      <div style={{ display: 'flex', gap: '12px', alignItems: 'center', marginBottom: '8px', flexWrap: 'wrap' }}>
        <strong>{t('notes.canvas.createSketch')}</strong>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {t('notes.canvas.tool')}
          <select value={tool} onChange={(e) => setTool(e.target.value)}>
            <option value="pen">{t('notes.canvas.toolOptions.pen')}</option>
            <option value="rect">{t('notes.canvas.toolOptions.rect')}</option>
            <option value="arrow">{t('notes.canvas.toolOptions.arrow')}</option>
            <option value="text">{t('notes.canvas.toolOptions.text')}</option>
          </select>
        </label>
        {tool === 'text' && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {t('notes.canvas.text')}
            <input type="text" placeholder={t('notes.canvas.textPlaceholder')} value={textValue} onChange={(e) => setTextValue(e.target.value)} />
          </label>
        )}
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {t('notes.canvas.color')}
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} style={{ width: 120, height: 28, padding: 0, border: '1px solid var(--border-color)', borderRadius: 6 }} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          {t('notes.canvas.brush')}
          <input type="range" min={1} max={32} value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))} />
          <span>{size}px</span>
        </label>
        {!hideBackgroundUpload && (
          <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
            {t('notes.canvas.loadBackground')}
            <input type="file" accept="image/*" onChange={handleBgUpload} />
          </label>
        )}
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-primary" onClick={handleSaveToNote} style={{ textAlign: 'center' }}>
            {saveLabel || t('notes.canvas.applyToNote')}
          </button>
        </div>
      </div>
      <canvas
        ref={canvasRef}
        style={{ border: '1px solid var(--border-color)', borderRadius: 8, touchAction: 'none', background: 'transparent' }}
        onMouseDown={onPointerDown}
        onMouseMove={onPointerMove}
        onMouseUp={onPointerUp}
        onMouseLeave={onPointerUp}
        onTouchStart={onPointerDown}
        onTouchMove={onPointerMove}
        onTouchEnd={onPointerUp}
      />
      <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap', justifyContent: actionsJustify, marginTop: 8 }}>
        <button className="btn-outline" onClick={handleUndo} disabled={actions.length === 0} style={{ textAlign: 'center' }}>{t('common.undo')}</button>
        <button className="btn-outline" onClick={handleRedo} disabled={redoStack.length === 0} style={{ textAlign: 'center' }}>{t('common.redo')}</button>
        <button className="btn-outline" onClick={handleClear} style={{ textAlign: 'center' }}>{t('notes.canvas.clear')}</button>
        <button className="btn-outline" onClick={handleDownload} style={{ textAlign: 'center' }}>{t('notes.canvas.savePng')}</button>
        <button className="btn-outline" onClick={handleExportJSON} style={{ textAlign: 'center' }}>{t('notes.canvas.exportJson')}</button>
        <label className="btn-outline" style={{ cursor: 'pointer', display: 'inline-flex', alignItems: 'center', justifyContent: 'center' }}>
          {t('notes.canvas.importJson')}
          <input type="file" accept="application/json" onChange={handleImportJSON} style={{ display: 'none' }} />
        </label>
      </div>
    </div>
  );
};

export default DrawingCanvas;