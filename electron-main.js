const { app, BrowserWindow } = require('electron');
const path = require('path');
const { fork } = require('child_process');

let mainWindow;
let serverProcess;

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true
    }
  });

  // Cargar el frontend desde dist
  mainWindow.loadFile(path.join(__dirname, 'dist', 'index.html'));      
  // Descomentar para debug
  mainWindow.webContents.openDevTools();

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

function startServer() {
  // Ruta del servidor
  const serverPath = path.join(__dirname, 'backend', 'server.js'); // Usar server.js o serverjs según el nombre real

  
  // Determinar la ruta base de recursos para el servidor
  // En empaquetado: process.resourcesPath. En desarrollo: __dirname (la raíz)
  const resourceBase = app.isPackaged ? process.resourcesPath : __dirname;
  console.log('Iniciando servidor desde:', serverPath);


  // Iniciar el servidor como proceso hijo
  serverProcess = fork(serverPath, [], {
    env: {
      ...process.env,
      ELECTRON_APP: 'true',
      NODE_ENV: 'production',
      // ⬇️ VARIABLE CRÍTICA PARA EL SERVIDOR ⬇️
      // Le decimos al servidor dónde buscar la carpeta de recursos.
      RESOURCE_BASE_PATH: resourceBase 
    },
    stdio: 'inherit'
  });
}

app.whenReady().then(() => {
  startServer();
  
  // Si el servidor no envía mensaje, crear ventana después de 2 segundos
  setTimeout(() => {
    if (!mainWindow) {
      createWindow();
    }
  }, 5000);

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});

// Cerrar el servidor cuando se cierra la app
app.on('before-quit', () => {
  if (serverProcess) {
    console.log('Cerrando servidor...');
    serverProcess.kill();
  }
});

app.on('quit', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
});