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

Beispiele:
  # Verzeichnis mit EXIF-Zeiten
  python tools/hdr_merge.py --input ./brackets --output ./out.hdr --method debevec
  python tools/hdr_merge.py --input ./brackets --output ./out.exr --method robertson

  # Explizite Dateienliste mit EV-Stufen (relativ, Skala egal)
  python tools/hdr_merge.py --files IMG_001.jpg IMG_002.jpg IMG_003.jpg \
    --ev -2 -1 0 1 2 --output ./out.hdr --align

  # Zeiten manuell vorgeben (Sekunden)
  python tools/hdr_merge.py --input ./brackets --times 0.25 0.5 1 2 4 \
    --output ./out.exr

  # Tonemapped LDR-Preview (PNG/JPG)
  python tools/hdr_merge.py --input ./brackets --output ./out.exr \
    --tonemap reinhard --ldr-output ./out_preview.png --gamma 2.2

Hinweise:
- Für bestes Ergebnis sind echte Belichtungszeiten (EXIF) notwendig; andernfalls werden Zeiten geschätzt.
- Mit --ev werden relative Belichtungen verwendet (t ~ 2^EV); absolute Skala ist weniger wichtig.
- --align nutzt MTB, um Bracket-Bilder vor dem Merge auszurichten.
- --ldr-output schreibt eine LDR-Preview mit wählbarem Tonemapping.
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
                # ExposureTime (ID 33434) oder ShutterSpeedValue (ID 37377, APEX)
                et = exif.get(33434)
                if et:
                    if isinstance(et, tuple) and len(et) == 2 and et[1] != 0:
                        t = float(et[0]) / float(et[1])
                    else:
                        t = float(et)
                    times.append(t)
                else:
                    ssv = exif.get(37377)
                    if ssv:
                        try:
                            if isinstance(ssv, tuple) and len(ssv) == 2 and ssv[1] != 0:
                                apex = float(ssv[0]) / float(ssv[1])
                            else:
                                apex = float(ssv)
                            t = float(2.0 ** (-apex))
                            times.append(t)
                        except Exception:
                            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
                            brightness.append(float(np.mean(gray)))
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


def read_images_and_times_from_list(files: List[str], evs: List[float] = None, times_override: List[float] = None) -> Tuple[List[np.ndarray], np.ndarray]:
    """Liest eine explizite Liste von Dateien und ermittelt Belichtungszeiten.
    - Nutzt EXIF, falls vorhanden
    - Überschreibt mit "times_override" oder leitet relativ aus EV‑Stufen ab, falls angegeben
    - Fehlt alles, schätzt Zeiten aus Helligkeit
    """
    images = []
    times = []
    brightness = []

    for path in files:
        img_bgr = cv2.imread(path)
        if img_bgr is None:
            raise RuntimeError(f'Bild kann nicht gelesen werden: {path}')
        images.append(img_bgr)

        # EXIF auslesen
        try:
            with Image.open(path) as im:
                exif = im.getexif()
                et = exif.get(33434)
                if et:
                    if isinstance(et, tuple) and len(et) == 2 and et[1] != 0:
                        t = float(et[0]) / float(et[1])
                    else:
                        t = float(et)
                    times.append(t)
                else:
                    ssv = exif.get(37377)
                    if ssv:
                        try:
                            if isinstance(ssv, tuple) and len(ssv) == 2 and ssv[1] != 0:
                                apex = float(ssv[0]) / float(ssv[1])
                            else:
                                apex = float(ssv)
                            t = float(2.0 ** (-apex))
                            times.append(t)
                        except Exception:
                            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
                            brightness.append(float(np.mean(gray)))
                    else:
                        gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
                        brightness.append(float(np.mean(gray)))
        except Exception:
            gray = cv2.cvtColor(img_bgr, cv2.COLOR_BGR2GRAY)
            brightness.append(float(np.mean(gray)))

    # Falls Vorgaben vorhanden, anwenden
    if times_override is not None:
        t = np.array(times_override, dtype=np.float32)
        if len(t) != len(images):
            raise RuntimeError('Anzahl der --times muss der Anzahl der Bilder entsprechen.')
        return images, t

    if evs is not None:
        evs_arr = np.array(evs, dtype=np.float32)
        if len(evs_arr) != len(images):
            raise RuntimeError('Anzahl der --ev Werte muss der Anzahl der Bilder entsprechen.')
        # relative Belichtungszeit: t_i ~ 2^EV_i (Skala kann beliebig sein, Verhältnisse zählen)
        t = (2.0 ** evs_arr).astype(np.float32)
        return images, t

    # Sonst EXIF oder Helligkeit verwenden
    if times:
        return images, np.array(times, dtype=np.float32)

    if not brightness:
        raise RuntimeError('Weder EXIF noch Helligkeitsschätzung verfügbar.')
    b = np.array(brightness, dtype=np.float32)
    b = (b - b.min()) / max(1e-9, (b.max() - b.min()))
    times_est = (1.0 / (4000.0 - b * (4000.0 - 4.0))).astype(np.float32)
    return images, times_est


def align_images(images: List[np.ndarray]) -> List[np.ndarray]:
    """Richtet Belichtungsreihe mit MTB aus (sofern verfügbar)."""
    try:
        mtb = cv2.createAlignMTB()
        try:
            aligned = mtb.process(images)
        except TypeError:
            aligned = [img.copy() for img in images]
            mtb.process(images, aligned)
        return aligned
    except Exception:
        # Fallback: keine Ausrichtung
        return images


def tonemap_ldr(hdr_bgr: np.ndarray, method: str = 'reinhard', gamma: float = 2.2) -> np.ndarray:
    """Tonemap HDR in 8‑Bit BGR für Preview/Speicherung."""
    if method == 'reinhard':
        tm = cv2.createTonemapReinhard(gamma=1.0)
    elif method == 'drago':
        tm = cv2.createTonemapDrago(gamma=1.0)
    elif method == 'mantiuk':
        tm = cv2.createTonemapMantiuk(gamma=1.0)
    else:
        raise ValueError('Unbekanntes Tonemap‑Verfahren.')

    ldr = tm.process(hdr_bgr.copy())  # float32 [0..1]
    ldr = np.clip(ldr, 0.0, 1.0)
    # Gamma‑Korrektur für LDR
    ldr = ldr ** (1.0 / max(1e-6, gamma))
    ldr8 = (ldr * 255.0).astype(np.uint8)
    return ldr8


def main():
    ap = argparse.ArgumentParser(description='Merge multiple JPGs into HDR/EXR radiance map.')
    ap.add_argument('--input', help='Eingabeverzeichnis mit Belichtungsreihen (JPG/PNG)')
    ap.add_argument('--files', nargs='+', help='Explizite Datei‑Liste (JPG/PNG)')
    ap.add_argument('--output', required=True, help='Ausgabedatei (.hdr oder .exr)')
    ap.add_argument('--method', choices=['debevec', 'robertson'], default='debevec', help='Kalibrierung/Merge Methode')
    ap.add_argument('--ev', nargs='+', type=float, help='EV‑Stufen je Bild, z. B. -2 -1 0 1 2')
    ap.add_argument('--times', nargs='+', type=float, help='Belichtungszeiten in Sekunden je Bild')
    ap.add_argument('--align', action='store_true', help='Ausrichten (MTB) vor Merge')
    ap.add_argument('--tonemap', choices=['reinhard', 'drago', 'mantiuk'], help='Tonemapping für LDR‑Preview')
    ap.add_argument('--ldr-output', help='Pfad für LDR‑Preview (PNG/JPG)')
    ap.add_argument('--gamma', type=float, default=2.2, help='Gamma für LDR‑Preview')
    args = ap.parse_args()

    try:
        # Eingaben laden
        if args.files:
            images, times = read_images_and_times_from_list(
                args.files,
                evs=args.ev,
                times_override=args.times
            )
        elif args.input:
            images, times = read_images_and_times(args.input)
            # Vorgaben optional überschreiben
            if args.times is not None:
                t = np.array(args.times, dtype=np.float32)
                if len(t) != len(images):
                    raise RuntimeError('Anzahl der --times muss der Anzahl der Bilder entsprechen.')
                times = t
            elif args.ev is not None:
                evs_arr = np.array(args.ev, dtype=np.float32)
                if len(evs_arr) != len(images):
                    raise RuntimeError('Anzahl der --ev Werte muss der Anzahl der Bilder entsprechen.')
                times = (2.0 ** evs_arr).astype(np.float32)
        else:
            raise RuntimeError('Bitte entweder --input oder --files angeben.')

        print(f'[INFO] Bilder: {len(images)} | Zeiten: {times}')

        # Optional ausrichten
        if args.align:
            images = align_images(images)
            print('[INFO] Alignment (MTB) angewendet.')

        # Merge
        hdr = merge_hdr(images, times, method=args.method)

        # Output HDR/EXR
        ext = os.path.splitext(args.output)[1].lower()
        if ext == '.hdr':
            save_hdr(args.output, hdr)
        elif ext == '.exr':
            save_exr(args.output, hdr)
        else:
            raise RuntimeError('Unbekanntes Ausgabeformat. Verwende .hdr oder .exr')
        print(f'[OK] HDR/EXR gespeichert: {args.output}')

        # Optional LDR Preview
        if args.ldr_output:
            tm_method = args.tonemap or 'reinhard'
            ldr = tonemap_ldr(hdr, method=tm_method, gamma=args.gamma)
            ok = cv2.imwrite(args.ldr_output, ldr)
            if not ok:
                raise RuntimeError(f'LDR‑Preview konnte nicht gespeichert werden: {args.ldr_output}')
            print(f'[OK] LDR‑Preview gespeichert: {args.ldr_output} (Tonemap={tm_method}, Gamma={args.gamma})')

    except Exception as e:
        print('[FAIL]', e)
        sys.exit(1)


if __name__ == '__main__':
    main()