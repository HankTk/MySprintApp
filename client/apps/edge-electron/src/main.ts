import { app, BrowserWindow, ipcMain } from 'electron';
import * as path from 'path';
import { fileURLToPath } from 'url';

// Get __dirname equivalent in ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Keep a global reference of the window object
let mainWindow: BrowserWindow | null = null;

function createWindow(): void
{
  // Create the browser window
  mainWindow = new BrowserWindow({
    width: 1400,
    height: 900,
    webPreferences: {
      nodeIntegration: false,
      contextIsolation: true,
      preload: path.join(__dirname, 'preload.js'),
    },
    icon: path.join(__dirname, '../../../apps/my-app/public/favicon.ico'),
  });

  // Determine the URL to load
  const isDev = process.env['NODE_ENV'] === 'development' || !app.isPackaged;
  
  // Get the app to load from environment variable (defaults to 'my-app')
  const appToLoad = process.env['ELECTRON_APP'] || 'my-app';
  const port = appToLoad === 'my-dev' ? '4300' : '4200';
  
  if (isDev)
  {
    // In development, load from the dev server
    mainWindow.loadURL(`http://localhost:${port}`);
    // Open DevTools in development
    mainWindow.webContents.openDevTools();
  } else
 {
    // In production, load from the built files
    const appPath = appToLoad === 'my-dev' ? 'my-dev' : 'my-app';
    const indexPath = path.join(__dirname, `../../${appPath}/index.html`);
    mainWindow.loadFile(indexPath);
  }

  // Emitted when the window is closed
  mainWindow.on('closed', () =>
  {
    mainWindow = null;
  });
}

// Handle app shutdown from renderer - set up before window creation
ipcMain.on('app-shutdown', () =>
{
  console.log('Received shutdown request from renderer');
  app.quit();
});

// This method will be called when Electron has finished initialization
app.whenReady().then(() =>
{
  createWindow();

  app.on('activate', () =>
  {
    // On macOS, re-create a window when the dock icon is clicked
    if (BrowserWindow.getAllWindows().length === 0)
    {
      createWindow();
    }
  });
});

// Quit when all windows are closed, except on macOS
app.on('window-all-closed', () =>
{
  if (process.platform !== 'darwin')
  {
    app.quit();
  }
});
