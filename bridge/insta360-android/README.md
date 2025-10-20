# Insta360 Android Bridge (Native)

A minimal Android app that bridges the official Insta360 Camera SDK to HTTP/WebSocket endpoints on your phone/tablet. Your React app (Camera Control (Beta)) talks to these endpoints over Wi‑Fi.

## Why native?
- Stable pairing and full feature coverage per model
- Access to preview frames, parameters, file management

## Project Structure
```
insta360-android/
├── settings.gradle
├── build.gradle (project)
└── app/
    ├── build.gradle (module)
    └── src/main/
        ├── AndroidManifest.xml
        ├── java/com/example/insta360bridge/
        │   ├── MainActivity.kt
        │   └── CameraBridgeServer.kt
        └── res/ (Compose UI, no layout XML required)
```

## SDK Setup
- Request the official Insta360 Camera SDK (Android) via Insta360 developer portal
- Add the SDK AAR(s) to `app/libs/` and reference them in `app/build.gradle`
- Required permissions in `AndroidManifest.xml`: `INTERNET`, `ACCESS_WIFI_STATE`, `ACCESS_NETWORK_STATE`, `BLUETOOTH`, `BLUETOOTH_ADMIN`, `ACCESS_FINE_LOCATION` (depending on SDK requirements)

## Compose UI
- The app uses Jetpack Compose for a simple UI to start/stop the embedded HTTP server and show its status.
- Compose is enabled in `app/build.gradle` with Material3 and Activity Compose.

## Endpoints (HTTP)
- `GET /info` → camera info
- `POST /mode {mode}` → `video|photo|timelapse`
- `POST /settings {...}` → parameters
- `POST /record/start` / `POST /record/stop`
- `POST /photo`
- `POST /preview/start` / `POST /preview/stop`
- `GET /preview/frame` → single JPEG frame (uses placeholder until SDK integrated)
- `GET /preview/stream` → MJPEG stream (alias)
- `GET /preview.mjpeg` → MJPEG stream (preferred)

## MJPEG Details
- MIME type: `multipart/x-mixed-replace; boundary=frame`
- Emits ~15 FPS placeholder frames when preview is active; replace with SDK camera frames during integration.
- Adds headers: `Access-Control-Allow-Origin: *`, `Cache-Control: no-cache`

## Build & Install
1. Open the project in Android Studio (Giraffe+)
2. Ensure `minSdk=24`, `targetSdk=34`
3. Place Insta360 SDK AARs in `app/libs/` and add to `dependencies` in `app/build.gradle`
4. Build and run on your device

## Notes
- This repo contains scaffolding code. You’ll integrate the official SDK to implement camera calls in `CameraBridgeServer.kt`.
- For preview streaming, we use MJPEG (`multipart/x-mixed-replace`), which is simple and compatible with browsers.
- Consider adding auth and TLS if exposing beyond local network.