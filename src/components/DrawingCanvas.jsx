import React, { useEffect, useRef, useState } from 'react';

// Einfache Zeichenfläche mit Maus/Touch, Farb- und Pinselkontrolle,
// optionalem Hintergrundbild sowie Export als PNG.
// Props:
// - width, height: gewünschte CSS-Größe der Zeichenfläche
// - onSave(dataUrl): Callback mit PNG DataURL
// - initialColor, initialSize: Startwerte für Farbe und Pinselgröße
const DrawingCanvas = ({
  width = 800,
  height = 400,
  onSave,
  initialColor = '#ffdd00',
  initialSize = 6,
}) => {
  const canvasRef = useRef(null);
  const containerRef = useRef(null);
  const ctxRef = useRef(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [color, setColor] = useState(initialColor);
  const [size, setSize] = useState(initialSize);
  const [bgImageUrl, setBgImageUrl] = useState(null);
  const bgImageRef = useRef(null);

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
    redrawBackground();
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
    ctx.strokeStyle = color;
    ctx.lineWidth = size;
    ctx.beginPath();
    ctx.moveTo(x, y);
    setIsDrawing(true);
  };

  const onPointerMove = (e) => {
    if (!isDrawing) return;
    const { x, y } = getPos(e);
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const onPointerUp = () => {
    if (!isDrawing) return;
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.closePath();
    setIsDrawing(false);
  };

  const handleClear = () => {
    const ctx = ctxRef.current;
    if (!ctx) return;
    ctx.clearRect(0, 0, width, height);
    redrawBackground();
  };

  const handleDownload = () => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `skizze_${Date.now()}.png`;
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
        <strong>Skizze erstellen</strong>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Farbe
          <input type="color" value={color} onChange={(e) => setColor(e.target.value)} />
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Pinsel
          <input type="range" min={1} max={32} value={size} onChange={(e) => setSize(parseInt(e.target.value, 10))} />
          <span>{size}px</span>
        </label>
        <label style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
          Hintergrund laden
          <input type="file" accept="image/*" onChange={handleBgUpload} />
        </label>
        <div style={{ marginLeft: 'auto', display: 'flex', gap: '8px', flexWrap: 'wrap' }}>
          <button className="btn-outline" onClick={handleClear}>Leeren</button>
          <button className="btn-outline" onClick={handleDownload}>Als PNG speichern</button>
          <button className="btn-primary" onClick={handleSaveToNote}>In Notiz übernehmen</button>
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
    </div>
  );
};

export default DrawingCanvas;