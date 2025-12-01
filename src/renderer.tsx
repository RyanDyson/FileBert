/**
 * This file will automatically be loaded by vite and run in the "renderer" context.
 * To learn more about the differences between the "main" and the "renderer" context in
 * Electron, visit:
 *
 * https://electronjs.org/docs/tutorial/process-model
 *
 * By default, Node.js integration in this file is disabled. When enabling Node.js integration
 * in a renderer process, please be aware of potential security implications. You can read
 * more about security risks here:
 *
 * https://electronjs.org/docs/tutorial/security
 *
 * To enable Node.js integration in this file, open up `main.ts` and enable the `nodeIntegration`
 * flag:
 *
 * ```
 *  // Create the browser window.
 *  mainWindow = new BrowserWindow({
 *    width: 800,
 *    height: 600,
 *    webPreferences: {
 *      nodeIntegration: true
 *    }
 *  });
 * ```
 */

import "./index.css";
import { createRoot } from "react-dom/client";
import { Route } from "react-router-dom";
import { Providers } from "@/components/global/providers";
import { Start } from "./routes/start";
import { MainOverlay } from "./routes/main-overlay";
import { Members } from "./routes/members";
import { Settings } from "./routes/settings";
import { History } from "./routes/history";
// import { Questions } from "./routes/question";
import { Actions } from "@/components/global/toast-config";
import { useState } from "react";

const App = () => {
  const [toastAction, setToastAction] = useState<Actions | null>(null);
  return (
    <Providers>
      <Route path="/history" element={<Start />} />
      <Route
        path="/overlay"
        element={
          <MainOverlay action={toastAction} setAction={setToastAction} />
        }
      />
      <Route path="/members" element={<Members />} />
      <Route path="/settings" element={<Settings />} />
      <Route path="/" element={<Members />} />
    </Providers>
  );
};

const container = document.getElementById("root");
if (container) {
  const root = createRoot(container);
  root.render(<App />);
}

// Later: detector.stop() or detector.dispose()
