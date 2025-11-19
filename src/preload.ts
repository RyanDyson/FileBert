import { contextBridge, ipcRenderer } from "electron";

// See the Electron documentation for details on how to use preload scripts:
// https://www.electronjs.org/docs/latest/tutorial/process-model#preload-scripts

contextBridge.exposeInMainWorld("electronAPI", {
  resizeWindow: (width: number, height: number) =>
    ipcRenderer.invoke("resize-window", width, height),
  writeClipboard: (text: string) => ipcRenderer.invoke("write-clipboard", text),
});
