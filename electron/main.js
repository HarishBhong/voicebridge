const { app, BrowserWindow } = require('electron');
const path = require('path');

let mainWindow;

// Reduce noisy Chromium network logs in development (e.g. chunked upload -2).
app.commandLine.appendSwitch('disable-logging');
app.commandLine.appendSwitch('log-level', '3');

const isDev = !app.isPackaged;
const FRONTEND_DEV_URL = process.env.FRONTEND_DEV_URL || 'http://localhost:5173';

app.on('ready', () => {
  mainWindow = new BrowserWindow({
    width: 800,
    height: 600,
    webPreferences: {
      contextIsolation: true,
      enableRemoteModule: false,
      preload: path.join(__dirname, 'preload.js'),
    },
  });

  if (isDev) {
    mainWindow.loadURL(FRONTEND_DEV_URL); // Load React dev server
    mainWindow.webContents.openDevTools(); // Open DevTools in development
  } else {
    mainWindow.loadFile(path.join(__dirname, '../dist/index.html')); // Load built React app
  }
});

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') {
    app.quit();
  }
});