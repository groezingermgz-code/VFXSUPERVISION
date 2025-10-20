import asyncio
import json
import time
import base64
import os
from typing import Optional, List

from fastapi import FastAPI, Request, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse, Response, JSONResponse
from fastapi.staticfiles import StaticFiles
from fastapi import UploadFile, File, Form

# Initialize app and static files
app = FastAPI()
STATIC_ROOT = os.path.join(os.path.dirname(__file__), 'static')
try:
    os.makedirs(STATIC_ROOT, exist_ok=True)
except Exception:
    pass
app.mount('/files', StaticFiles(directory=STATIC_ROOT), name='files')

# Allow CORS for local dev
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Simple auth via header or query param
DEFAULT_TOKEN = "devtoken"

def _is_authorized(request: Request, token: Optional[str]) -> bool:
    # Accept either Authorization: Bearer <token> or ?token=<token>
    auth_header = request.headers.get("Authorization", "")
    if auth_header.startswith("Bearer "):
        tok = auth_header.split(" ", 1)[1]
        return tok == DEFAULT_TOKEN or tok == token
    if token is not None:
        return token == DEFAULT_TOKEN
    return False

# Mock camera state
camera_info = {"ok": True, "model": "Insta360", "firmware": None, "battery": None, "storage": None}
current_mode = "video"  # 'video' | 'photo' | 'timelapse'
current_settings = {
    "resolution": "2880x1440",
    "fps": 30,
    "bitrate": 40,
    "stabilization": "on",
    "iso": 400,
    "shutter": "auto",
    "whiteBalance": "auto",
    "exposureLock": False,
    "ev": 0,
    "fov": "standard"
}
preview_on = False

@app.get("/info")
async def info(request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return camera_info

@app.post("/mode")
async def set_mode(request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    body = await request.json()
    mode = body.get("mode")
    global current_mode
    if mode in ["video", "photo", "timelapse"]:
        current_mode = mode
    return {"ok": True, "mode": current_mode}

from pydantic import BaseModel

class Settings(BaseModel):
    resolution: Optional[str] = None
    fps: Optional[int] = None
    bitrate: Optional[int] = None
    stabilization: Optional[str] = None
    iso: Optional[int] = None
    shutter: Optional[str] = None
    whiteBalance: Optional[str] = None
    exposureLock: Optional[bool] = None
    ev: Optional[float] = None
    fov: Optional[str] = None

@app.post("/settings")
async def set_settings(payload: Settings, request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    global current_settings
    incoming = payload.dict(exclude_unset=True)
    current_settings.update(incoming)
    return {"ok": True, "settings": current_settings}

@app.post("/record/start")
async def record_start(request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"ok": True, "recording": True}

@app.post("/record/stop")
async def record_stop(request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"ok": True, "recording": False}

@app.post("/photo")
async def photo(request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    return {"ok": True, "photo": True}

@app.post("/preview/start")
async def preview_start(request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    global preview_on
    preview_on = True
    return {"ok": True, "preview_on": preview_on}

@app.post("/preview/stop")
async def preview_stop(request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    global preview_on
    preview_on = False
    return {"ok": True, "preview_on": preview_on}

# Fake preview frame generator
from PIL import Image, ImageDraw
from io import BytesIO

def generate_preview_frame(ev: float = 0.0) -> bytes:
    img = Image.new('RGB', (640, 360), color=(20, 20, 20))
    draw = ImageDraw.Draw(img)
    t = int(time.time())
    x = (t * 50) % 600 + 20
    y = ((t * 30) % 300) + 30
    draw.ellipse((x-10, y-10, x+10, y+10), fill=(255, 64, 64))
    draw.text((20, 20), f"Preview {t}", fill=(200, 200, 200))
    draw.text((20, 40), f"EV {ev:+.1f}", fill=(200, 200, 200))
    buf = BytesIO()
    img.save(buf, format='JPEG', quality=60)
    return buf.getvalue()

@app.get("/preview/frame")
async def preview_frame(request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    jpeg_bytes = generate_preview_frame(current_settings.get("ev", 0.0) or 0.0)
    return Response(content=jpeg_bytes, media_type="image/jpeg", headers={
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
    })

@app.get("/preview.mjpeg")
async def preview_mjpeg(request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")

    async def mjpeg_stream():
        boundary = b'--frame\r\n'
        while True:
            if await request.is_disconnected():
                break
            jpeg_bytes = generate_preview_frame(current_settings.get("ev", 0.0) or 0.0)
            yield boundary
            yield b'Content-Type: image/jpeg\r\n'
            yield f'Content-Length: {len(jpeg_bytes)}\r\n\r\n'.encode('utf-8')
            yield jpeg_bytes
            yield b'\r\n'
            await asyncio.sleep(0.2)

    return StreamingResponse(mjpeg_stream(), media_type="multipart/x-mixed-replace; boundary=frame", headers={
        "Cache-Control": "no-cache",
        "Pragma": "no-cache",
        "Connection": "keep-alive",
    })

# --- Events (SSE + Long Poll) ---
@app.get("/events")
async def events(request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")

    async def event_generator():
        while True:
            if await request.is_disconnected():
                break
            state = {
                "ok": True,
                "timestamp": int(time.time()),
                "preview_on": preview_on,
                "mode": current_mode,
                "settings": current_settings,
            }
            # Advise client to retry quickly and tag messages
            yield "retry: 2000\n"
            yield f"id: {state['timestamp']}\n"
            yield "event: status\n"
            yield f"data: {json.dumps(state)}\n\n"
            await asyncio.sleep(1)

    return StreamingResponse(event_generator(), media_type="text/event-stream", headers={
        "Cache-Control": "no-cache",
        "Connection": "keep-alive",
        "X-Accel-Buffering": "no",
    })

# Alias for MJPEG stream to match some clients
@app.get("/preview/stream")
async def preview_stream(request: Request, token: Optional[str] = None):
    return await preview_mjpeg(request, token)

@app.get("/events/poll")
async def events_poll(request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    state = {
        "ok": True,
        "timestamp": int(time.time()),
        "preview_on": preview_on,
        "mode": current_mode,
        "settings": current_settings,
    }
    return JSONResponse(content=state, headers={
        "Cache-Control": "no-cache, no-store, must-revalidate",
        "Pragma": "no-cache",
        "Expires": "0",
    })

# --- HDR Bracketing ---
class BracketRequest(BaseModel):
    exposures: Optional[List[float]] = None  # e.g., [-2, -1, 0, 1, 2]
    stops: Optional[int] = None              # e.g., 5 -> [-2,-1,0,1,2]
    delayMs: Optional[int] = 300             # delay between shots
    lockExposure: Optional[bool] = True
    includeThumbs: Optional[bool] = True
    includeFull: Optional[bool] = True

@app.post("/photo/bracket")
async def photo_bracket(req: BracketRequest, request: Request, token: Optional[str] = None):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")

    exposures = req.exposures
    if not exposures and req.stops:
        # Build symmetric exposures around 0
        n = max(1, req.stops)
        # Ensure odd count for symmetric sequence
        if n % 2 == 0:
            n += 1
        half = (n - 1) // 2
        exposures = [float(i) for i in range(-half, half + 1)]
    if not exposures:
        exposures = [-2.0, -1.0, 0.0, 1.0, 2.0]

    delay = (req.delayMs or 300) / 1000.0

    # Simulate capture: set exposure lock & ev, "take photo"
    original_ev = current_settings.get("ev", 0.0)
    original_lock = current_settings.get("exposureLock", False)

    # Prepare static output dir per session
    ts = int(time.time())
    session_dir = os.path.join(STATIC_ROOT, 'brackets', str(ts))
    try:
        os.makedirs(session_dir, exist_ok=True)
    except Exception:
        pass

    # Expected full-res (approx for 70.9MP, 2:1 ratio)
    expected_w, expected_h = 11904, 5952
    expected_mp = round((expected_w * expected_h) / 1_000_000, 2)

    results = []
    for ev in exposures:
        current_settings["exposureLock"] = bool(req.lockExposure)
        current_settings["ev"] = float(ev)

        # Generate small preview frame per EV
        jpeg_bytes = generate_preview_frame(ev)
        thumb_data = None
        if req.includeThumbs:
            thumb_data = "data:image/jpeg;base64," + base64.b64encode(jpeg_bytes).decode("ascii")

        # Generate simulated "full" image and save to static files
        full_obj = None
        if req.includeFull:
            full_w, full_h = 2048, 1024
            img = Image.new('RGB', (full_w, full_h), color=(24, 24, 24))
            draw = ImageDraw.Draw(img)
            draw.text((20, 20), f"EV {ev:+.2f}", fill=(220, 220, 220))
            draw.text((20, 44), f"Simulated Full", fill=(180, 180, 180))
            # Save file
            safe_ev = str(ev).replace('.', '_').replace('+', '')
            filename = f"ev_{safe_ev}.jpg"
            out_path = os.path.join(session_dir, filename)
            try:
                img.save(out_path, format='JPEG', quality=85)
                full_obj = {
                    "url": f"/files/brackets/{ts}/{filename}",
                    "width": full_w,
                    "height": full_h,
                    "megapixels": round((full_w * full_h) / 1_000_000, 2),
                    "expectedWidth": expected_w,
                    "expectedHeight": expected_h,
                    "expectedMegapixels": expected_mp,
                }
            except Exception:
                full_obj = None

        results.append({"ev": ev, "ok": True, "thumb": thumb_data, "full": full_obj})
        await asyncio.sleep(delay)

    # Restore previous settings
    current_settings["ev"] = original_ev
    current_settings["exposureLock"] = original_lock

    return {
        "ok": True,
        "count": len(results),
        "exposures": exposures,
        "lockExposure": bool(req.lockExposure),
        "results": results,
        "session": {"id": ts}
    }

# Upload full-resolution image for a bracket session
@app.post("/files/upload")
async def files_upload(request: Request, token: Optional[str] = None, session: str = Form(...), ev: float = Form(...), file: UploadFile = File(...)):
    if not _is_authorized(request, token):
        raise HTTPException(status_code=401, detail="Unauthorized")
    # Ensure session dir exists
    session_dir = os.path.join(STATIC_ROOT, 'brackets', str(session))
    try:
        os.makedirs(session_dir, exist_ok=True)
    except Exception:
        pass
    # Save uploaded file
    safe_ev = str(ev).replace('.', '_').replace('+', '')
    filename = f"ev_{safe_ev}_full.jpg"
    out_path = os.path.join(session_dir, filename)
    try:
        data = await file.read()
        with open(out_path, 'wb') as f:
            f.write(data)
        # Read dimensions
        from PIL import Image
        with Image.open(out_path) as im:
            width, height = im.size
        mp = round((width * height) / 1_000_000, 2)
        return {
            "ok": True,
            "full": {
                "url": f"/files/brackets/{session}/{filename}",
                "width": width,
                "height": height,
                "megapixels": mp,
            }
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=f"Upload failed: {e}")