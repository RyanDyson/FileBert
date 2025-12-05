export interface ElectronAPI {
  resizeWindow: (width: number, height: number) => Promise<void>;
  writeClipboard: (text: string) => Promise<void>;
  switchToOverlay: (
    roomId: string,
    current_roles: string,
    username: string
  ) => Promise<void>;
  switchToStartScreen: () => Promise<void>;
  openMembersWindow: () => Promise<void>;
  openSettingsWindow: () => Promise<void>;
  openHistoryWindow: () => Promise<void>;
  openQuestionWindow: () => Promise<void>;
  setToastAction: (action: string | null, data?: any) => Promise<void>;
  getQuestions: () => Promise<{ id: number; text: string }[]>;
  updateQuestions: (questions: { id: number; text: string }[]) => Promise<void>;
  onQuestionsUpdated: (
    callback: (questions: { id: number; text: string }[]) => void
  ) => () => void;
  onToastAction: (
    callback: (action: string | null, data?: any) => void
  ) => () => void;
  getOverlayData: () => Promise<{
    roomId: string;
    current_roles: string;
    username: string;
  }>;
}

declare global {
  interface Window {
    electronAPI: ElectronAPI;
  }
}
