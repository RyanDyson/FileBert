export interface ElectronAPI {
  resizeWindow: (width: number, height: number) => Promise<void>;
  writeClipboard: (text: string) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
