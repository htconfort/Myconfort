import { useEffect, useState } from 'react';
import { GOOGLE_CONFIG } from '../utils/constants';

export const useGoogleAPI = () => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isSignedIn, setIsSignedIn] = useState(false);

  useEffect(() => {
    const initializeGAPI = async () => {
      try {
        if (typeof window.gapi === 'undefined') {
          setError('Google API non disponible');
          return;
        }

        await new Promise<void>((resolve) => {
          window.gapi.load('client:auth2', resolve);
        });

        await window.gapi.client.init({
          apiKey: GOOGLE_CONFIG.API_KEY,
          clientId: GOOGLE_CONFIG.CLIENT_ID,
          discoveryDocs: [GOOGLE_CONFIG.DISCOVERY_DOC],
          scope: GOOGLE_CONFIG.SCOPES.join(' ')
        });

        const authInstance = window.gapi.auth2.getAuthInstance();
        setIsSignedIn(authInstance.isSignedIn.get());
        
        // Écouter les changements de connexion
        authInstance.isSignedIn.listen(setIsSignedIn);
        
        setIsLoaded(true);
      } catch (err) {
        setError(`Erreur initialisation Google API: ${err}`);
      }
    };

    initializeGAPI();
  }, []);

  const signIn = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signIn();
    } catch (err) {
      setError(`Erreur connexion: ${err}`);
    }
  };

  const signOut = async () => {
    try {
      const authInstance = window.gapi.auth2.getAuthInstance();
      await authInstance.signOut();
    } catch (err) {
      setError(`Erreur déconnexion: ${err}`);
    }
  };

  return { 
    isLoaded, 
    error, 
    isSignedIn, 
    signIn, 
    signOut 
  };
};
