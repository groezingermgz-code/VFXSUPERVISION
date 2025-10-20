# Insta360 Camera Bridge (Python, FastAPI)

A minimal HTTP bridge to control Insta360 cameras over Wi‑Fi using a reverse‑engineered RTMP protocol. Designed to pair with the React "Camera Control (Beta)" page and the Android bridge.

## Features
- Start/stop recording, take photo
- Logical mode and settings storage (prototype)
- Preview control: start/stop
- Live preview endpoints:
  - Single frame: `GET /preview/frame` (JPEG)
  - MJPEG stream: `GET /preview.mjpeg` (`multipart/x-mixed-replace`)

## Requirements
- Python 3.10+
- Packages: `uvicorn`, `fastapi`, `pillow`
- Optional: `insta360` PyPI package (RTMP client; may vary by model)

## Install
```bash
python -m venv .venv
. .venv/Scripts/activate  # Windows PowerShell
pip install --upgrade pip
pip install uvicorn fastapi pillow insta360
```

## Run
```bash
uvicorn app:app --host 0.0.0.0 --port 8080
```
The bridge listens on `http://<device-ip>:8080`. In the React app, set the base URL accordingly.

## Wi‑Fi Setup
- Put the camera in Wi‑Fi mode; ensure your phone/PC connects to the camera SSID.
- Some models require pairing; check the camera’s Wi‑Fi password on screen.

## Endpoints
- `GET /info` – basic info
- `POST /mode` – set logical mode `{ "mode": "video|photo|timelapse" }`
- `POST /settings` – apply settings (stored locally for demo)
- `POST /record/start` – start recording
- `POST /record/stop` – stop recording
- `POST /photo` – take a photo
- `POST /preview/start` – start preview stream
- `POST /preview/stop` – stop preview stream
- `GET /preview/frame` – returns a JPEG frame (placeholder if no camera)
- `GET /preview.mjpeg` – returns MJPEG stream (`multipart/x-mixed-replace; boundary=frame`)

## Preview notes
- If `pillow` is installed, placeholder frames include a timestamp overlay.
- If `pillow` is not available, a minimal 1×1 JPEG placeholder is served.
- When the preview is not active (`/preview/start` not called), the MJPEG stream keeps the connection alive until clients close it.
- Using the optional `insta360` RTMP client, preview and capture commands will call the camera when supported; otherwise they gracefully fall back.

## Security & Production
- Enable authentication and restrict CORS before exposing beyond the local network.
- Consider using the official Insta360 Camera SDK (Android/Windows/Linux) for deeper control, performance, and reliability.