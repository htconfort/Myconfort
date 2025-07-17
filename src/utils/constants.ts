export const GOOGLE_CONFIG = {
  CLIENT_ID: import.meta.env.VITE_GOOGLE_CLIENT_ID || '821174911169-5aq0ba4hjcmsv6k00pjqvo1sb387g9ok.apps.googleusercontent.com',
  API_KEY: import.meta.env.VITE_GOOGLE_API_KEY || '',
  SCOPES: [
    'https://www.googleapis.com/auth/drive.file',
    'https://www.googleapis.com/auth/drive.readonly'
  ],
  DISCOVERY_DOC: 'https://www.googleapis.com/discovery/v1/apis/drive/v3/rest'
};
