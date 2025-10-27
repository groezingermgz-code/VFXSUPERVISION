package com.example.insta360bridge

import android.content.Context
import android.graphics.Bitmap
import android.graphics.Canvas
import android.graphics.Color
import android.graphics.Paint
import fi.iki.elonen.NanoHTTPD
import java.io.ByteArrayInputStream
import java.io.ByteArrayOutputStream
import java.io.PipedInputStream
import java.io.PipedOutputStream
import java.text.SimpleDateFormat
import java.util.Date
import java.util.Locale
import java.util.concurrent.Executors
import java.util.concurrent.TimeUnit
import java.util.concurrent.atomic.AtomicBoolean

class CameraBridgeServer(private val ctx: Context) : NanoHTTPD(8080) {
  private val previewOn = AtomicBoolean(false)
  @Volatile private var latestFrame: ByteArray? = null
  private var frameExecutor = Executors.newSingleThreadScheduledExecutor()
  private val authToken = "devtoken"

  override fun start() {
    start(SOCKET_READ_TIMEOUT, false)
  }

  override fun stop() {
    try { frameExecutor.shutdownNow() } catch (_: Exception) {}
    super.stop()
  }

  override fun serve(session: IHTTPSession): Response {
    val uri = session.uri
    // CORS preflight
    if (session.method == Method.OPTIONS) return corsOptions()
    // Simple Bearer token auth (header or query)
    if (!isAuth(session)) return unauthorized()
    return try {
      when {
        uri == "/info" && session.method == Method.GET -> handleInfo()
        uri == "/mode" && session.method == Method.POST -> okJson("{" + "\"ok\":true" + "}")
        uri == "/settings" && session.method == Method.POST -> okJson("{" + "\"ok\":true" + "}")
        uri == "/record/start" && session.method == Method.POST -> okJson("{" + "\"ok\":true" + "}")
        uri == "/record/stop" && session.method == Method.POST -> okJson("{" + "\"ok\":true" + "}")
        uri == "/photo" && session.method == Method.POST -> okJson("{" + "\"ok\":true" + "}")
        uri == "/preview/start" && session.method == Method.POST -> { startPreview(); okJson("{" + "\"ok\":true" + "}") }
        uri == "/preview/stop" && session.method == Method.POST -> { stopPreview(); okJson("{" + "\"ok\":true" + "}") }
        uri == "/preview/frame" && session.method == Method.GET -> handleFrame()
        uri == "/preview/stream" && session.method == Method.GET -> handleMjpeg()
        uri == "/preview.mjpeg" && session.method == Method.GET -> handleMjpeg()
        else -> notFound()
      }
    } catch (e: Exception) {
      internalError(e)
    }
  }

  private fun startPreview() {
    if (previewOn.get()) return
    previewOn.set(true)
    // Start generating placeholder frames at ~15 FPS
    try { frameExecutor.shutdownNow() } catch (_: Exception) {}
    frameExecutor = Executors.newSingleThreadScheduledExecutor()
    frameExecutor.scheduleAtFixedRate({
      if (!previewOn.get()) return@scheduleAtFixedRate
      latestFrame = generatePlaceholderFrame()
    }, 0, 66, TimeUnit.MILLISECONDS)
  }

  private fun stopPreview() {
    previewOn.set(false)
    try { frameExecutor.shutdownNow() } catch (_: Exception) {}
    latestFrame = null
  }

  private fun handleInfo(): Response {
    val body = "{" + "\"ok\":true," + "\"model\":\"Insta360\"," + "\"firmware\":null," + "\"battery\":null," + "\"storage\":null" + "}"
    return okJson(body)
  }

  private fun okJson(body: String): Response {
    val resp = newFixedLengthResponse(Response.Status.OK, "application/json", body)
    resp.addHeader("Access-Control-Allow-Origin", "*")
    return resp
  }

  private fun notFound(): Response {
    val resp = newFixedLengthResponse(Response.Status.NOT_FOUND, "text/plain", "Not found")
    resp.addHeader("Access-Control-Allow-Origin", "*")
    return resp
  }

  private fun internalError(e: Exception): Response {
    val resp = newFixedLengthResponse(Response.Status.INTERNAL_ERROR, "text/plain", e.message)
    resp.addHeader("Access-Control-Allow-Origin", "*")
    return resp
  }

  private fun unauthorized(): Response {
    val resp = newFixedLengthResponse(Response.Status.UNAUTHORIZED, "application/json", "{\"ok\":false,\"error\":\"unauthorized\"}")
    resp.addHeader("Access-Control-Allow-Origin", "*")
    resp.addHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
    resp.addHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    return resp
  }

  private fun corsOptions(): Response {
    val resp = newFixedLengthResponse(Response.Status.NO_CONTENT, "text/plain", "")
    resp.addHeader("Access-Control-Allow-Origin", "*")
    resp.addHeader("Access-Control-Allow-Methods", "GET,POST,OPTIONS")
    resp.addHeader("Access-Control-Allow-Headers", "Authorization, Content-Type")
    resp.addHeader("Access-Control-Max-Age", "600")
    return resp
  }

  private fun isAuth(session: IHTTPSession): Boolean {
    val authHeader = session.headers["authorization"]
    val tokenFromHeader = authHeader?.let { h ->
      val s = h.trim()
      if (s.lowercase(Locale.US).startsWith("bearer ")) s.substring(7).trim() else null
    }
    val tokenFromQuery = session.parameters["token"]?.firstOrNull()
    val token = tokenFromHeader ?: tokenFromQuery
    return token == authToken
  }

  private fun handleFrame(): Response {
    val frame = latestFrame ?: generatePlaceholderFrame()
    val resp = newFixedLengthResponse(Response.Status.OK, "image/jpeg", ByteArrayInputStream(frame), frame.size.toLong())
    resp.addHeader("Access-Control-Allow-Origin", "*")
    resp.addHeader("Cache-Control", "no-cache")
    return resp
  }

  // MJPEG stream using chunked response. Emits frames while previewOn is true.
  private fun handleMjpeg(): Response {
    val boundary = "frame"
    val mime = "multipart/x-mixed-replace; boundary=$boundary"
    val pos = PipedOutputStream()
    val pis = PipedInputStream(pos)

    val writer = Thread {
      try {
        while (true) {
          if (!previewOn.get()) {
            // Sleep briefly and continue; keep connection alive until client closes.
            Thread.sleep(100)
            continue
          }
          val frame = latestFrame ?: generatePlaceholderFrame()
          val header = "--$boundary\r\n" +
            "Content-Type: image/jpeg\r\n" +
            "Content-Length: ${frame.size}\r\n\r\n"
          pos.write(header.toByteArray())
          pos.write(frame)
          pos.write("\r\n".toByteArray())
          pos.flush()
          Thread.sleep(66)
        }
      } catch (_: Exception) {
        // Client likely disconnected; end thread.
      } finally {
        try { pos.close() } catch (_: Exception) {}
      }
    }
    writer.isDaemon = true
    writer.start()

    val resp = newChunkedResponse(Response.Status.OK, mime, pis)
    resp.addHeader("Access-Control-Allow-Origin", "*")
    resp.addHeader("Cache-Control", "no-cache")
    resp.addHeader("Pragma", "no-cache")
    return resp
  }

  // Placeholder frame generator: gray background with timestamp text.
  private fun generatePlaceholderFrame(): ByteArray {
    val width = 640
    val height = 360
    val bmp = Bitmap.createBitmap(width, height, Bitmap.Config.ARGB_8888)
    val canvas = Canvas(bmp)
    canvas.drawColor(Color.DKGRAY)

    val paint = Paint()
    paint.color = Color.WHITE
    paint.textSize = 28f
    paint.isAntiAlias = true

    val ts = SimpleDateFormat("yyyy-MM-dd HH:mm:ss", Locale.US).format(Date())
    canvas.drawText("Preview (MJPEG) - $ts", 20f, height / 2f, paint)

    val baos = ByteArrayOutputStream()
    bmp.compress(Bitmap.CompressFormat.JPEG, 80, baos)
    return baos.toByteArray()
  }
}