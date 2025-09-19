const { app, BrowserWindow } = require('electron');
const path = require('path');

async function main() {
  const isDev = (await import('electron-is-dev')).default;

  function createWindow() {
    const win = new BrowserWindow({
      width: 1200,
      height: 800,
      webPreferences: {
        nodeIntegration: true,
        contextIsolation: false,
      },
    });

    if (isDev) {
      win.loadURL('http://localhost:3000');
      win.webContents.openDevTools();
    } else {
      // Fixed path to the built HTML file
      win.loadFile(path.join(__dirname, 'dist', 'index.html'));
    }
  }

  app.whenReady().then(createWindow);

  app.on('window-all-closed', () => {
    if (process.platform !== 'darwin') {
      app.quit();
    }
  });

  app.on('activate', () => {
    if (BrowserWindow.getAllWindows().length === 0) {
      createWindow();
    }
  });
}

main();