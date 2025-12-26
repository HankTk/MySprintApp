export interface ElectronAPI
{
  platform: string;
  versions: {
    node: string;
    chrome: string;
    electron: string;
  };
  shutdown: () => void;
}

declare global {
  interface Window
  {
    electronAPI?: ElectronAPI;
  }
}
