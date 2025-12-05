import { contextBridge, ipcRenderer } from "electron";

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

interface Question {
  id: number;
  text: string;
}

contextBridge.exposeInMainWorld("electronAPI", {
  resizeWindow: (width: number, height: number) =>
    ipcRenderer.invoke("resize-window", width, height),
  writeClipboard: (text: string) => ipcRenderer.invoke("write-clipboard", text),
  switchToOverlay: (
    roomId: string,
    current_roles: string,
    username: string
  ) => {
    ipcRenderer.invoke("switch-to-overlay", roomId, current_roles, username);
  },
  switchToStartScreen: () => ipcRenderer.invoke("switch-to-start-screen"),
  openMembersWindow: () => ipcRenderer.invoke("open-members-window"),
  openSettingsWindow: () => ipcRenderer.invoke("open-settings-window"),
  openHistoryWindow: () => ipcRenderer.invoke("open-history-window"),
  openQuestionWindow: () => ipcRenderer.invoke("open-question-window"),
  setToastAction: (action: string | null, data?: unknown) =>
    ipcRenderer.invoke("set-toast-action", action, data),
  getQuestions: () => ipcRenderer.invoke("get-questions"),
  updateQuestions: (questions: Question[]) =>
    ipcRenderer.invoke("update-questions", questions),
  onQuestionsUpdated: (callback: (questions: Question[]) => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      questions: Question[]
    ) => callback(questions);
    ipcRenderer.on("questions-updated", handler);
    return () => {
      ipcRenderer.removeListener("questions-updated", handler);
    };
  },
  onToastAction: (
    callback: (action: string | null, data?: unknown) => void
  ) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      action: string | null,
      data?: unknown
    ) => callback(action, data);
    ipcRenderer.on("toast-action-changed", handler);
    return () => {
      ipcRenderer.removeListener("toast-action-changed", handler);
    };
  },
  getOverlayData: () => ipcRenderer.invoke("get-overlay-data"),
  // Gesture IPC
  sendGestureData: (data: unknown) =>
    ipcRenderer.invoke("send-gesture-data", data),
  onGestureData: (callback: (data: unknown) => void) => {
    const handler = (_event: Electron.IpcRendererEvent, data: unknown) =>
      callback(data);
    ipcRenderer.on("gesture-data-updated", handler);
    return () => {
      ipcRenderer.removeListener("gesture-data-updated", handler);
    };
  },
  setGestureConfig: (config: { gesturePair: string }) =>
    ipcRenderer.invoke("set-gesture-config", config),
  onGestureConfig: (callback: (config: { gesturePair: string }) => void) => {
    const handler = (
      _event: Electron.IpcRendererEvent,
      config: { gesturePair: string }
    ) => callback(config);
    ipcRenderer.on("gesture-config-updated", handler);
    return () => {
      ipcRenderer.removeListener("gesture-config-updated", handler);
    };
  },
});
