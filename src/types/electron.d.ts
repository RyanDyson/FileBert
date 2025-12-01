export interface ElectronAPI {
  resizeWindow: (width: number, height: number) => Promise<void>;
  writeClipboard: (text: string) => Promise<void>;
  switchToOverlay: (roomId, current_roles) => Promise<void>;
  switchToStartScreen: () => Promise<void>;
  openMembersWindow: () => Promise<void>;
  openSettingsWindow: () => Promise<void>;
  openHistoryWindow: () => Promise<void>;
  setToastAction: (action: string | null) => Promise<void>;
  onToastAction: (callback: (action: string | null) => void) => () => void;
  getOverlayData: () => Promise<{ roomId: string; current_roles: string }>;

}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
