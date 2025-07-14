// 🔧 Types TypeScript pour Google Drive
export interface GoogleDriveFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  webViewLink?: string;
  webContentLink?: string;
  createdTime?: string;
  modifiedTime?: string;
}

export interface GoogleDriveUploadResult {
  success: boolean;
  file?: GoogleDriveFile;
  error?: string;
  fileUrl?: string;
}

export interface GoogleAuthStatus {
  isSignedIn: boolean;
  isLoaded: boolean;
  error?: string;
  userEmail?: string;
}

export interface UploadProgress {
  stage: 'auth' | 'upload' | 'complete' | 'error';
  message: string;
  progress?: number;
}

// Extension du window pour gapi
declare global {
  interface Window {
    gapi: any;
  }
}