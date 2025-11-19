import { app, BrowserWindow, Menu, screen, ipcMain, clipboard } from "electron";
import path from "node:path";
import started from "electron-squirrel-startup";

let mainWindow: BrowserWindow | null = null;

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = () => {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth } = primaryDisplay.workAreaSize;

  // Window dimensions (start minimized)
  const windowWidth = 400;
  const windowHeight = 50;

  // Calculate center position horizontally, stick to top vertically
  const x = Math.floor((screenWidth - windowWidth) / 2);
  const y = 0; // Stick to top of screen

  // Create the browser window as an overlay (frameless, always on top)
  mainWindow = new BrowserWindow({
    width: windowWidth,
    height: windowHeight,
    frame: false, // No title bar
    transparent: true, // Transparent background
    backgroundColor: "#00000000", // Fully transparent background
    alwaysOnTop: true, // Stay on top of other windows
    skipTaskbar: false,
    resizable: true,
    hasShadow: true, // Enable shadow for depth
    vibrancy: process.platform === "darwin" ? "under-window" : undefined, // macOS native blur
    visualEffectState: process.platform === "darwin" ? "active" : undefined, // macOS
    x: x, // Centered horizontally
    y: y, // Sticky to top
    webPreferences: {
      preload: path.join(__dirname, "preload.js"),
      backgroundThrottling: false,
    },
  });

  Menu.setApplicationMenu(null);

  if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
    mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
  } else {
    mainWindow.loadFile(
      path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
    );
  }

  // IPC handler for resizing window with smooth animation
  ipcMain.handle("resize-window", async (_, width: number, height: number) => {
    if (mainWindow) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth } = primaryDisplay.workAreaSize;
      const targetX = Math.floor((screenWidth - width) / 2);

      // Get current bounds
      const currentBounds = mainWindow.getBounds();
      const startWidth = currentBounds.width;
      const startHeight = currentBounds.height;
      const startX = currentBounds.x;

      // Calculate steps for smooth animation (60fps, 300ms duration)
      const duration = 300; // milliseconds
      const steps = 18; // ~60fps for 300ms
      const stepDelay = duration / steps;

      const widthStep = (width - startWidth) / steps;
      const heightStep = (height - startHeight) / steps;
      const xStep = (targetX - startX) / steps;

      // Animate resize
      for (let i = 1; i <= steps; i++) {
        setTimeout(() => {
          if (mainWindow) {
            // For the last step, use exact target values to avoid rounding errors
            if (i === steps) {
              mainWindow.setBounds({
                width: width,
                height: height,
                x: targetX,
                y: 0,
              });
            } else {
              const newWidth = Math.round(startWidth + widthStep * i);
              const newHeight = Math.round(startHeight + heightStep * i);
              const newX = Math.round(startX + xStep * i);
              mainWindow.setBounds({
                width: newWidth,
                height: newHeight,
                x: newX,
                y: 0,
              });
            }
          }
        }, stepDelay * i);
      }
    }
  });

  // IPC handler for writing to clipboard
  ipcMain.handle("write-clipboard", async (_, text: string) => {
    clipboard.writeText(text);
  });
};

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", createWindow);

// Quit when all windows are closed, except on macOS. There, it's common
// for applications and their menu bar to stay active until the user quits
// explicitly with Cmd + Q.
app.on("window-all-closed", () => {
  if (process.platform !== "darwin") {
    app.quit();
  }
});

app.on("activate", () => {
  // On OS X it's common to re-create a window in the app when the
  // dock icon is clicked and there are no other windows open.
  if (BrowserWindow.getAllWindows().length === 0) {
    createWindow();
  }
});

// In this file you can include the rest of your app's specific main process
// code. You can also put them in separate files and import them here.
