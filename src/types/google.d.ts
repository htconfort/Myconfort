declare global {
  interface Window {
    gapi: any;
  }
}

export interface GoogleFile {
  id: string;
  name: string;
  mimeType: string;
  size?: string;
  modifiedTime?: string;
}

export interface GoogleDriveResponse {
  files: GoogleFile[];
  nextPageToken?: string;
}
