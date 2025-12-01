import { contextBridge, ipcRenderer } from "electron";

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

contextBridge.exposeInMainWorld("electronAPI", {
  resizeWindow: (width: number, height: number) =>
    ipcRenderer.invoke("resize-window", width, height),
  writeClipboard: (text: string) => ipcRenderer.invoke("write-clipboard", text),
  switchToOverlay: (roomId: string, current_roles: string) => {
    ipcRenderer.invoke("switch-to-overlay", roomId, current_roles);
  },
  switchToStartScreen: () => ipcRenderer.invoke("switch-to-start-screen"),
  openMembersWindow: () => ipcRenderer.invoke("open-members-window"),
  openSettingsWindow: () => ipcRenderer.invoke("open-settings-window"),
  openHistoryWindow: () => ipcRenderer.invoke("open-history-window"),
  setToastAction: (action: string | null) =>
    ipcRenderer.invoke("set-toast-action", action),
  onToastAction: (callback: (action: string | null) => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      action: string | null
    ) => callback(action);
    ipcRenderer.on("toast-action-changed", handler);
    return () => {
      ipcRenderer.removeListener("toast-action-changed", handler);
    };
  },
  getOverlayData: () => ipcRenderer.invoke("get-overlay-data"),
});
