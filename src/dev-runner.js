// dev-runner.js
const { app, BrowserWindow } = require('electron');
const path = require('path');

function createWindow() {
  const win = new BrowserWindow({
    width: 1200,
    height: 800,
    webPreferences: {
      // If you have a preload script, point to the built version
      // preload: path.join(__dirname, 'out/preload/preload.js'),
    },
  });

  // Load Vite's dev server
  win.loadURL('http://localhost:5173');
}

app.whenReady().then(createWindow);

app.on('window-all-closed', () => {
  if (process.platform !== 'darwin') app.quit();
});