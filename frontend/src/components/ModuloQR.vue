<template>
  <div class="modulo-qr">
    <h2>📱 Escanear QR</h2>

    <div v-if="!escanerActivo" class="inicio">
      <p>Usa esta función para escanear códigos QR de computadoras desde tu celular.</p>
      <button @click="iniciarEscaner" class="btn-iniciar">
        📷 Iniciar Cámara
      </button>
    </div>

    <div v-else class="escaner-activo">
      <div class="video-container">
        <video 
          ref="videoElement" 
          playsinline 
          autoplay 
          muted
        ></video>
        <canvas ref="canvasElement" style="display: none;"></canvas>
      </div>

      <button @click="detenerEscaner" class="btn-detener">
        ❌ Detener Cámara
      </button>

      <div v-if="qrDetectado" class="qr-detectado">
        <h3>✓ QR Detectado</h3>
        <p>ID Computadora: <strong>{{ qrDetectado }}</strong></p>
        <button @click="irAComputadora(qrDetectado)" class="btn-ir">
          Ir a Computadora
        </button>
      </div>
    </div>

    <div v-if="error" class="alert alert-error">{{ error }}</div>
  </div>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue';
import { useRouter } from 'vue-router';
import jsQR from 'jsqr';

const router = useRouter();
const videoElement = ref(null);
const canvasElement = ref(null);
const escanerActivo = ref(false);
const qrDetectado = ref(null);
const error = ref('');
let stream = null;
let scanningInterval = null;

const iniciarEscaner = async () => {
  try {
    error.value = '';
    console.log('Iniciando escaneo...');
    
    // Verificar soporte
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
      error.value = 'Tu navegador no soporta acceso a cámara. Usa Chrome, Firefox o Edge.';
      console.error('getUserMedia no disponible');
      return;
    }

    console.log('Solicitando acceso a cámara...');
    stream = await navigator.mediaDevices.getUserMedia({
      video: {
        width: { ideal: 1280 },
        height: { ideal: 720 }
      },
      audio: false
    });

    console.log('Cámara accedida');
    escanerActivo.value = true;
    
    if (videoElement.value) {
      videoElement.value.srcObject = stream;
      videoElement.value.play().catch(err => {
        console.error('Error reproduciendo video:', err);
      });
    }

    // Iniciar escaneo continuo
    scanningInterval = setInterval(() => {
      escanearQR();
    }, 100);
    
    console.log('✓ Escaneo iniciado');
  } catch (err) {
    let mensaje = 'Error de cámara: ';
    if (err.name === 'NotAllowedError') {
      mensaje += 'Permiso denegado. Acepta el acceso a la cámara.';
    } else if (err.name === 'NotFoundError') {
      mensaje += 'No se encontró cámara en el dispositivo.';
    } else if (err.name === 'NotReadableError') {
      mensaje += 'La cámara está siendo usada por otra app.';
    } else {
      mensaje += err.message || 'Error desconocido';
    }
    
    error.value = mensaje;
    console.error('Error de cámara detallado:', err);
  }
};

const escanearQR = () => {
  const canvas = canvasElement.value;
  const video = videoElement.value;

  if (!canvas || !video || video.readyState !== video.HAVE_ENOUGH_DATA) {
    return;
  }

  canvas.width = video.videoWidth;
  canvas.height = video.videoHeight;

  const ctx = canvas.getContext('2d');
  ctx.drawImage(video, 0, 0);

  const imageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
  const code = jsQR(imageData.data, imageData.width, imageData.height);

  if (code) {
    qrDetectado.value = code.data;
  }
};

const detenerEscaner = () => {
  if (stream) {
    stream.getTracks().forEach(track => track.stop());
  }

  if (scanningInterval) {
    clearInterval(scanningInterval);
  }

  escanerActivo.value = false;
  qrDetectado.value = null;
};

const irAComputadora = (id) => {
  detenerEscaner();
  // Aquí puedes navegar a la computadora o crear un préstamo
  alert(`Computadora detectada: ${id}`);
};

onUnmounted(() => {
  detenerEscaner();
});
</script>

<style scoped>
.modulo-qr {
  background: white;
  padding: 20px;
  border-radius: 8px;
  max-width: 600px;
}

.modulo-qr h2 {
  margin-bottom: 20px;
  color: #333;
}

.inicio {
  text-align: center;
  padding: 40px 20px;
}

.inicio p {
  color: #666;
  margin-bottom: 20px;
  font-size: 16px;
}

.btn-iniciar {
  padding: 12px 30px;
  background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
  color: white;
  border: none;
  border-radius: 6px;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.3s;
}

.btn-iniciar:hover {
  transform: translateY(-2px);
  box-shadow: 0 5px 15px rgba(102, 126, 234, 0.3);
}

.escaner-activo {
  display: flex;
  flex-direction: column;
  gap: 15px;
}

.video-container {
  width: 100%;
  border-radius: 8px;
  overflow: hidden;
  background: #000;
  aspect-ratio: 4/3;
}

.video-container video {
  width: 100%;
  height: 100%;
  object-fit: cover;
}

.btn-detener {
  padding: 10px 20px;
  background: #dc3545;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  transition: all 0.3s;
}

.btn-detener:hover {
  background: #c82333;
}

.qr-detectado {
  background: #d4edda;
  border: 2px solid #28a745;
  border-radius: 8px;
  padding: 15px;
  text-align: center;
}

.qr-detectado h3 {
  margin: 0 0 10px 0;
  color: #155724;
}

.qr-detectado p {
  margin: 10px 0;
  color: #155724;
}

.btn-ir {
  padding: 10px 20px;
  background: #28a745;
  color: white;
  border: none;
  border-radius: 6px;
  cursor: pointer;
  font-weight: 600;
  margin-top: 10px;
}

.btn-ir:hover {
  background: #218838;
}

.alert {
  padding: 12px;
  border-radius: 6px;
  font-size: 14px;
}

.alert-error {
  background: #fee;
  color: #c33;
  border: 1px solid #fcc;
}

@media (max-width: 768px) {
  .modulo-qr {
    max-width: 100%;
    padding: 10px;
  }

  .video-container {
    aspect-ratio: 9/16;
  }
}
</style>