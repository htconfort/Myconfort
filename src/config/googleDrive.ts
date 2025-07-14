// 🔧 Configuration Google Drive centralisée
export const GOOGLE_DRIVE_CONFIG = {
  // Clés d'authentification
  API_KEY: import.meta.env.VITE_GOOGLE_DRIVE_API_KEY,
  CLIENT_ID: import.meta.env.VITE_GOOGLE_DRIVE_CLIENT_ID,
  
  // Configuration Drive
  FOLDER_ID: import.meta.env.VITE_GOOGLE_DRIVE_FOLDER_ID,
  
  // Configuration n8n
  WEBHOOK_URL: import.meta.env.VITE_N8N_WEBHOOK_URL,
  
  // Scopes requis
  SCOPES: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly'
  ],
  
  // Discovery document
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest',
  
  // Configuration upload
  MAX_FILE_SIZE: 50 * 1024 * 1024, // 50MB
  ALLOWED_TYPES: ['application/pdf'],
  
  // Validation
  isConfigured(): boolean {
    return !!(this.API_KEY && this.CLIENT_ID && this.FOLDER_ID);
  },
  
  getErrors(): string[] {
    const errors: string[] = [];
    if (!this.API_KEY) errors.push('VITE_GOOGLE_DRIVE_API_KEY manquante');
    if (!this.CLIENT_ID) errors.push('VITE_GOOGLE_DRIVE_CLIENT_ID manquant');
    if (!this.FOLDER_ID) errors.push('VITE_GOOGLE_DRIVE_FOLDER_ID manquant');
    return errors;
  }
};