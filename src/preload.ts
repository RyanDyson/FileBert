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
  switchToOverlay: () => ipcRenderer.invoke("switch-to-overlay"),
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
});
