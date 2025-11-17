export interface ElectronAPI {
  resizeWindow: (width: number, height: number) => Promise<void>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
