import React, { useEffect } from 'react';
import DrawingCanvas from './DrawingCanvas';

// Einfache Modal-Komponente zum Annotieren eines bestehenden Bildes.
// Props:
// - imageUrl: quellbild (DataURL oder URL)
// - onApply(dataUrl): Rückgabe des annotierten PNG
// - onClose(): Modal schließen
// - title: optionaler Titel
// - width, height: Canvas-Größe (CSS)
const ImageAnnotatorModal = ({ imageUrl, onApply, onClose, title = 'Bild annotieren', width = 800, height = 450 }) => {
  useEffect(() => {
    const onKey = (e) => {
      if (e.key === 'Escape') onClose?.();
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <div style={{ position: 'fixed', inset: 0, zIndex: 1000 }} aria-modal="true" role="dialog">
      <div style={{ position: 'absolute', inset: 0, background: 'rgba(0,0,0,0.45)' }} onClick={onClose} />
      <div className="card" style={{ position: 'relative', maxWidth: width + 48, margin: '40px auto', border: '1px solid var(--border-color)', borderRadius: 12, padding: 16, background: 'var(--card-bg)' }}>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
          <h2 style={{ margin: 0 }}>{title}</h2>
          <button className="btn-outline" onClick={onClose}>Schließen</button>
        </div>
        <DrawingCanvas
          width={width}
          height={height}
          onSave={(dataUrl) => onApply?.(dataUrl)}
          backgroundImage={imageUrl}
          hideBackgroundUpload={true}
          saveLabel="Annotation anwenden"
          initialColor="#ff0000"
          initialSize={4}
        />
      </div>
    </div>
  );
};

export default ImageAnnotatorModal;