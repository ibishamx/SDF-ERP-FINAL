import { app, BrowserWindow } from 'electron';
import path from 'path';
import { fork, ChildProcess } from 'child_process';

let mainWindow: BrowserWindow | null = null;
let serverProcess: ChildProcess | null = null;

const PORT = 3000;

function startBackendServer() {
  const userDataPath = app.getPath('userData');
  if (app.isPackaged) {
    // In production, run the bundled server
    const serverPath = path.join(process.resourcesPath, 'app/dist/server.cjs');
    serverProcess = fork(serverPath, [], {
      env: { ...process.env, PORT: PORT.toString(), NODE_ENV: 'production', USER_DATA_PATH: userDataPath }
    });
  } else {
    // In development
    console.log('UserData path:', userDataPath);
  }
}

function createWindow() {
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    title: 'Saleem Daal Factory ERP',
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js')
    },
    icon: path.join(__dirname, '../public/icon.ico')
  });

  // Load local server URL
  const startUrl = `http://localhost:${PORT}`;
  
  // Wait a brief moment for server to boot or load directly
  setTimeout(() => {
    mainWindow?.loadURL(startUrl);
  }, 1000);

  mainWindow.on('closed', () => {
    mainWindow = null;
  });
}

app.whenReady().then(() => {
  startBackendServer();
  createWindow();

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
});

app.on('window-all-closed', () => {
  if (serverProcess) {
    serverProcess.kill();
  }
  if (process.platform !== 'darwin') {
    app.quit();
  }
});
