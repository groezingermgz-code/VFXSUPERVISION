package com.example.insta360bridge

import android.os.Bundle
import androidx.activity.ComponentActivity
import androidx.activity.compose.setContent
import androidx.compose.foundation.layout.*
import androidx.compose.material3.Button
import androidx.compose.material3.MaterialTheme
import androidx.compose.material3.Text
import androidx.compose.runtime.mutableStateOf
import androidx.compose.runtime.remember
import androidx.compose.ui.Alignment
import androidx.compose.ui.Modifier
import androidx.compose.ui.unit.dp

class MainActivity : ComponentActivity() {
  private lateinit var server: CameraBridgeServer

  override fun onCreate(savedInstanceState: Bundle?) {
    super.onCreate(savedInstanceState)
    server = CameraBridgeServer(this)

    setContent {
      MaterialTheme {
        val running = remember { mutableStateOf(false) }
        Column(
          modifier = Modifier.fillMaxSize().padding(24.dp),
          horizontalAlignment = Alignment.Start,
          verticalArrangement = Arrangement.spacedBy(12.dp)
        ) {
          Text("Insta360 Bridge Server")
          Row(horizontalArrangement = Arrangement.spacedBy(12.dp)) {
            Button(onClick = {
              server.start()
              running.value = true
            }) { Text("Start Server") }
            Button(onClick = {
              server.stop()
              running.value = false
            }) { Text("Stop Server") }
          }
          Text(if (running.value) "Status: Running" else "Status: Stopped")
        }
      }
    }
  }

  override fun onDestroy() {
    try { server.stop() } catch (_: Exception) {}
    super.onDestroy()
  }
}