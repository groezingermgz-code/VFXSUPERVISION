#!/usr/bin/env python3
"""
HDR/EXR Merge Prototype

Konvertiert mehrere unterschiedlich belichtete JPGs zu einem HDR‑Bild (Radiance .hdr)
und – falls unterstützt – alternativ zu OpenEXR (.exr).

Abhängigkeiten:
- opencv-python
- pillow (für EXIF)
- numpy
- optional: OpenEXR, Imath (falls cv2 kein EXR schreiben kann)

Installation:
  pip install opencv-python pillow numpy
  # optional für EXR
  pip install OpenEXR Imath

Beispiel:
  python tools/hdr_merge.py --input ./brackets --output ./out.hdr --method debevec
  python tools/hdr_merge.py --input ./brackets --output ./out.exr --method robertson

Hinweis:
- Für bestes Ergebnis sind echte Belichtungszeiten (EXIF) notwendig.
- Falls Belichtungszeiten fehlen, wird eine grobe Schätzung per Helligkeit vorgenommen.
"""

import argparse
import os
import sys
from typing import List, Tuple
import numpy as np
import cv2
from PIL import Image

try:
    import OpenEXR, Imath  # optional
    HAS_OPENEXR = True
except Exception:
    HAS_OPENEXR = False


def read_images_and_times(input_dir: str) -> Tuple[List[np.ndarray], np.ndarray]:
    """Liest JPGs aus dem Verzeichnis und extrahiert Belichtungszeiten (Sekunden) aus EXIF.
    Falls EXIF fehlt, schätzt Zeiten über relative Helligkeit.
    """
    files = sorted([f for f in os.listdir(input_dir) if f.lower().endswith(('.jpg', '.jpeg', '.png'))])
    if not files:
        raise RuntimeError('Keine Bilder gefunden. Erwarte JPG/JPEG/PNG im Eingabeordner.')

    images = []
    times = []
    brightness = []

    for fname in files:
        path = os.path.join(input_dir, fname)
        img_bgr = cv2.imread(path)
        if img_bgr is None:
            raise RuntimeError(f'Bild kann nicht gelesen werden: {path}')
        images.append(img_bgr)

        # EXIF auslesen
        try:
            with Image.open(path) as im:
                exif = im.getexif()
                # ExposureTime (ID 33434) oder ShutterSpeedValue (ID 37377)
                et = exif.get(33434)
                if et:
                    if isinstance(et, tuple) and len(et) == 2 and et[1] != 0:
                        t = float(et[0]) / float(et[1])
                    else:
                        t = float(et)
                    times.append(t)
                else:
                    # Fallback: Helligkeit schätzen
                    gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
                    brightness.append(float(np.mean(gray)))
        except Exception:
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            brightness.append(float(np.mean(gray)))

    if not times:
        # Schätzung: hellere Bilder => längere Zeit; normalisieren auf sinnvollen Bereich
        if not brightness:
            raise RuntimeError('Weder EXIF noch Helligkeitsschätzung verfügbar.')
        b = np.array(brightness, dtype=np.float32)
        b = (b - b.min()) / max(1e-9, (b.max() - b.min()))
        # Skaliere auf [1/4000 .. 1/4] s
        times = list((1.0 / (4000.0 - b * (4000.0 - 4.0))).astype(np.float32))

    return images, np.array(times, dtype=np.float32)


def merge_hdr(images: List[np.ndarray], times: np.ndarray, method: str = 'debevec') -> np.ndarray:
    """Erzeugt Radiance HDR (32‑bit float) in BGR Reihenfolge (OpenCV)."""
    if method == 'debevec':
        calibrate = cv2.createCalibrateDebevec()
        response = calibrate.process(images, times)
        merge_debevec = cv2.createMergeDebevec()
        hdr = merge_debevec.process(images, times, response)
    elif method == 'robertson':
        calibrate = cv2.createCalibrateRobertson()
        response = calibrate.process(images, times)
        merge_robertson = cv2.createMergeRobertson()
        hdr = merge_robertson.process(images, times, response)
    else:
        raise ValueError('Unbekannte Methode. Verwende "debevec" oder "robertson".')
    return hdr  # float32 BGR


def save_hdr(path: str, hdr_bgr: np.ndarray):
    """Speichert Radiance HDR (.hdr) via OpenCV."""
    # OpenCV speichert .hdr und .exr in BGR Float
    ok = cv2.imwrite(path, hdr_bgr)
    if not ok:
        raise RuntimeError(f'HDR konnte nicht gespeichert werden: {path}')


def save_exr(path: str, hdr_bgr: np.ndarray):
    """Speichert OpenEXR (.exr). Versucht zuerst cv2.imwrite, fällt zurück auf OpenEXR lib."""
    # Zuerst versuchen über OpenCV (falls mit OpenEXR gebaut)
    try:
        ok = cv2.imwrite(path, hdr_bgr)
        if ok:
            return
    except Exception:
        pass

    if not HAS_OPENEXR:
        raise RuntimeError('EXR‑Speicherung fehlgeschlagen. Installiere "OpenEXR" & "Imath" oder nutze .hdr.')

    # Fallback: OpenEXR direkt schreiben (RGB Float)
    bgr = hdr_bgr.astype(np.float32)
    rgb = bgr[:, :, ::-1]  # BGR -> RGB
    height, width, _ = rgb.shape

    R = rgb[:, :, 0].astype(np.float32).tobytes()
    G = rgb[:, :, 1].astype(np.float32).tobytes()
    B = rgb[:, :, 2].astype(np.float32).tobytes()

    header = OpenEXR.Header(width, height)
    header['channels'] = {
        'R': Imath.Channel(Imath.PixelType(Imath.PixelType.FLOAT)),
        'G': Imath.Channel(Imath.PixelType(Imath.PixelType.FLOAT)),
        'B': Imath.Channel(Imath.PixelType(Imath.PixelType.FLOAT)),
    }
    out = OpenEXR.OutputFile(path, header)
    out.writePixels({'R': R, 'G': G, 'B': B})
    out.close()


def main():
    ap = argparse.ArgumentParser(description='Merge multiple JPGs into HDR/EXR radiance map.')
    ap.add_argument('--input', required=True, help='Eingabeverzeichnis mit Belichtungsreihen (JPG/PNG)')
    ap.add_argument('--output', required=True, help='Ausgabedatei (.hdr oder .exr)')
    ap.add_argument('--method', choices=['debevec', 'robertson'], default='debevec', help='Kalibrierung/Merge Methode')
    args = ap.parse_args()

    try:
        images, times = read_images_and_times(args.input)
        print(f'[INFO] Bilder: {len(images)} | Zeiten: {times}')
        hdr = merge_hdr(images, times, method=args.method)

        ext = os.path.splitext(args.output)[1].lower()
        if ext == '.hdr':
            save_hdr(args.output, hdr)
        elif ext == '.exr':
            save_exr(args.output, hdr)
        else:
            raise RuntimeError('Unbekanntes Ausgabeformat. Verwende .hdr oder .exr')
        print(f'[OK] Gespeichert: {args.output}')
    except Exception as e:
        print('[FAIL]', e)
        sys.exit(1)


if __name__ == '__main__':
    main()