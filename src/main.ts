import { app, BrowserWindow, Menu, screen, ipcMain, clipboard } from "electron";
import path from "node:path";
import { pathToFileURL } from "node:url";
import started from "electron-squirrel-startup";

let mainWindow: BrowserWindow | null = null;
const secondaryWindows = new Map<string, BrowserWindow>();

// Handle creating/removing shortcuts on Windows when installing/uninstalling.
if (started) {
  app.quit();
}

const createWindow = (isOverlay = false) => {
  // Get primary display dimensions
  const primaryDisplay = screen.getPrimaryDisplay();
  const { width: screenWidth, height: screenHeight } =
    primaryDisplay.workAreaSize;

  if (isOverlay) {
    // Create overlay window (frameless, always on top)
    // Start at expanded size since toast will be shown initially
    const overlayWidth = 650;
    const overlayHeight = 120;
    const x = Math.floor((screenWidth - overlayWidth) / 2);
    const y = 0;

    mainWindow = new BrowserWindow({
      width: overlayWidth,
      height: overlayHeight,
      frame: false, // No title bar
      transparent: true,
      backgroundColor: "#00000000",
      alwaysOnTop: true,
      skipTaskbar: false,
      resizable: true,
      hasShadow: true,
      vibrancy: process.platform === "darwin" ? "under-window" : undefined,
      visualEffectState: process.platform === "darwin" ? "active" : undefined,
      x: x,
      y: y,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        backgroundThrottling: false,
      },
    });

    mainWindow.setTitle("FileBert");

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + "/overlay");
    } else {
      mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`),
        { hash: "/overlay" }
      );
    }
  } else {
    // Window dimensions for start screen (normal window)
    const windowWidth = 500;
    const windowHeight = 500;

    // Calculate center position
    const x = Math.floor((screenWidth - windowWidth) / 2);
    const y = Math.floor((screenHeight - windowHeight) / 2);

    // Create the browser window as a normal window (with frame, not always on top)
    mainWindow = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      frame: true, // Normal title bar with controls
      transparent: false, // Opaque background
      backgroundColor: "#f8f9fa", // Match UI background color (light gray)
      alwaysOnTop: false, // Normal window behavior
      skipTaskbar: false,
      resizable: true,
      hasShadow: true,
      title: "FileBert", // Set window title
      titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default", // macOS: custom title bar area
      x: x, // Centered horizontally
      y: y, // Centered vertically
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        backgroundThrottling: false,
      },
    });

    // Set window title explicitly
    mainWindow.setTitle("FileBert");

    Menu.setApplicationMenu(null);

    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
    } else {
      mainWindow.loadFile(
        path.join(__dirname, `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`)
      );
    }
  }
};

let questions = [
  { id: 1, text: "Are you a good listener?" },
  { id: 2, text: "Have you used React before?" },
  { id: 3, text: "Do you like dark mode?" },
  { id: 4, text: "Is this app helpful?" },
];

// Setup IPC handlers (registered once, globally)
const setupIpcHandlers = () => {
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

  // IPC handler to get questions
  ipcMain.handle("get-questions", async () => {
    return questions;
  });

  // IPC handler to update questions
  ipcMain.handle("update-questions", async (_, newQuestions) => {
    console.log("Updating questions:", newQuestions.length);
    questions = newQuestions;
    // Notify question window if it's open
    const questionWindow = secondaryWindows.get("/question");
    if (questionWindow) {
      if (!questionWindow.isDestroyed()) {
        console.log("Sending update to question window");
        questionWindow.webContents.send("questions-updated", questions);
      } else {
        console.log("Question window is destroyed");
      }
    } else {
      console.log("Question window not found in secondaryWindows");
    }
    return true;
  });

  // IPC handler to switch to overlay mode
  ipcMain.handle("switch-to-overlay", async () => {
    if (mainWindow) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth } = primaryDisplay.workAreaSize;

      // Start at expanded size since toast will be shown initially
      const overlayWidth = 650;
      const overlayHeight = 120;
      const x = Math.floor((screenWidth - overlayWidth) / 2);
      const y = 0;

      // Store current window state
      const wasVisible = mainWindow.isVisible();

      // Close the current window
      mainWindow.close();

      // Create new frameless overlay window
      mainWindow = new BrowserWindow({
        width: overlayWidth,
        height: overlayHeight,
        frame: false, // No title bar
        transparent: true,
        backgroundColor: "#00000000",
        alwaysOnTop: true,
        skipTaskbar: false,
        resizable: true,
        hasShadow: true,
        vibrancy: process.platform === "darwin" ? "under-window" : undefined,
        visualEffectState: process.platform === "darwin" ? "active" : undefined,
        x: x,
        y: y,
        webPreferences: {
          preload: path.join(__dirname, "preload.js"),
          backgroundThrottling: false,
        },
      });

      mainWindow.setTitle("FileBert");

      // Load the URL
      if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + "/overlay");
      } else {
        const filePath = path.join(
          __dirname,
          `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
        );
        const fileUrl = pathToFileURL(filePath).href + "#/overlay";
        mainWindow.loadURL(fileUrl);
      }

      if (wasVisible) {
        mainWindow.show();
      }
    }
  });

  // IPC handler to switch back to start screen (normal window)
  ipcMain.handle("switch-to-start-screen", async () => {
    // Close all secondary windows
    secondaryWindows.forEach((window) => {
      if (!window.isDestroyed()) {
        window.close();
      }
    });
    secondaryWindows.clear();

    if (mainWindow) {
      const primaryDisplay = screen.getPrimaryDisplay();
      const { width: screenWidth, height: screenHeight } =
        primaryDisplay.workAreaSize;

      const windowWidth = 500;
      const windowHeight = 600;
      const x = Math.floor((screenWidth - windowWidth) / 2);
      const y = Math.floor((screenHeight - windowHeight) / 2);

      // Store current window state
      const wasVisible = mainWindow.isVisible();

      // Close the current window
      mainWindow.close();

      // Create new normal window
      mainWindow = new BrowserWindow({
        width: windowWidth,
        height: windowHeight,
        frame: true, // Normal title bar with controls
        transparent: false, // Opaque background
        backgroundColor: "#f8f9fa", // Match UI background color
        alwaysOnTop: false, // Normal window behavior
        skipTaskbar: false,
        resizable: true,
        hasShadow: true,
        title: "FileBert",
        titleBarStyle:
          process.platform === "darwin" ? "hiddenInset" : "default",
        x: x,
        y: y,
        webPreferences: {
          preload: path.join(__dirname, "preload.js"),
          backgroundThrottling: false,
        },
      });

      mainWindow.setTitle("FileBert");

      // Load the URL (start screen)
      if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
        mainWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL);
      } else {
        mainWindow.loadFile(
          path.join(
            __dirname,
            `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
          )
        );
      }

      if (wasVisible) {
        mainWindow.show();
      }
    }
  });

  // Helper function to create a secondary window (like start screen styling)
  const createSecondaryWindow = (route: string, title: string) => {
    const primaryDisplay = screen.getPrimaryDisplay();
    const { width: screenWidth, height: screenHeight } =
      primaryDisplay.workAreaSize;

    const windowWidth = 800;
    const windowHeight = 700;
    const x = Math.floor((screenWidth - windowWidth) / 2);
    const y = Math.floor((screenHeight - windowHeight) / 2);

    // Check if window already exists
    const existingWindow = secondaryWindows.get(route);
    if (existingWindow && !existingWindow.isDestroyed()) {
      existingWindow.focus();
      return;
    }

    const newWindow = new BrowserWindow({
      width: windowWidth,
      height: windowHeight,
      frame: true,
      transparent: false,
      backgroundColor: "#f8f9fa",
      alwaysOnTop: false,
      skipTaskbar: false,
      resizable: true,
      hasShadow: true,
      title: title,
      titleBarStyle: process.platform === "darwin" ? "hiddenInset" : "default",
      x: x,
      y: y,
      webPreferences: {
        preload: path.join(__dirname, "preload.js"),
        backgroundThrottling: false,
      },
    });

    newWindow.setTitle(title);

    // Load the URL
    if (MAIN_WINDOW_VITE_DEV_SERVER_URL) {
      newWindow.loadURL(MAIN_WINDOW_VITE_DEV_SERVER_URL + route);
    } else {
      const filePath = path.join(
        __dirname,
        `../renderer/${MAIN_WINDOW_VITE_NAME}/index.html`
      );
      const fileUrl = pathToFileURL(filePath).href + "#" + route;
      newWindow.loadURL(fileUrl);
    }

    // Clean up when window is closed
    newWindow.on("closed", () => {
      secondaryWindows.delete(route);
    });

    secondaryWindows.set(route, newWindow);
  };

  // IPC handler to open members window
  ipcMain.handle("open-members-window", async () => {
    createSecondaryWindow("/members", "FileBert - Members");
  });

  // IPC handler to open settings window
  ipcMain.handle("open-settings-window", async () => {
    createSecondaryWindow("/settings", "FileBert - Settings");
  });

  // IPC handler to open history window
  ipcMain.handle("open-history-window", async () => {
    createSecondaryWindow("/history", "FileBert - History");
  });

  // IPC handler to open question window
  ipcMain.handle("open-question-window", async () => {
    createSecondaryWindow("/question", "FileBert - Question");
  });

  ipcMain.handle(
    "set-toast-action",
    async (_, action: string | null, data?: unknown) => {
      // Send the action to the main overlay window
      if (mainWindow && !mainWindow.isDestroyed()) {
        mainWindow.webContents.send("toast-action-changed", action, data);
      }
    }
  );
};

// Setup IPC handlers before creating window
setupIpcHandlers();

// This method will be called when Electron has finished
// initialization and is ready to create browser windows.
// Some APIs can only be used after this event occurs.
app.on("ready", () => {
  createWindow(false); // Start with normal window (start screen)
});

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
