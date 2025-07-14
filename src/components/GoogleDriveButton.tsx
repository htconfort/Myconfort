import React from 'react';
import { UploadCloud as CloudUpload, Loader, CheckCircle, AlertCircle, Settings } from 'lucide-react';
import { useGoogleDrive } from '../hooks/useGoogleDrive';
import { GoogleDriveService } from '../services/googleDriveService';
import { Invoice } from '../types';

interface GoogleDriveButtonProps {
  invoice: Invoice;
  disabled?: boolean;
  className?: string;
}

export const GoogleDriveButton: React.FC<GoogleDriveButtonProps> = ({
  invoice,
  disabled = false,
  className = ''
}) => {
  const { authStatus, uploadProgress, uploadFile, testConnection, signIn } = useGoogleDrive();

  // 📤 Gérer l'upload
  const handleUpload = async () => {
    const success = await GoogleDriveService.uploadInvoicePDF(invoice, uploadFile);
    
    if (success) {
      // Optionnel: callback de succès
      console.log('✅ Facture uploadée avec succès');
    }
  };

  // 🧪 Gérer le test de connexion
  const handleTest = async () => {
    await testConnection();
  };

  // 🔐 Gérer la connexion
  const handleConnect = async () => {
    await signIn();
  };

  // 🎨 Rendu du bouton selon l'état
  const renderButton = () => {
    // Erreur de configuration
    if (authStatus.error) {
      return (
        <button
          disabled
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-red-100 text-red-700 cursor-not-allowed ${className}`}
          title={authStatus.error}
        >
          <AlertCircle className="w-4 h-4" />
          <span>Config Error</span>
        </button>
      );
    }

    // API en cours de chargement
    if (!authStatus.isLoaded) {
      return (
        <button
          disabled
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-gray-100 text-gray-500 cursor-not-allowed ${className}`}
        >
          <Loader className="w-4 h-4 animate-spin" />
          <span>Chargement...</span>
        </button>
      );
    }

    // Upload en cours
    if (uploadProgress) {
      const isError = uploadProgress.stage === 'error';
      const isComplete = uploadProgress.stage === 'complete';
      
      return (
        <button
          disabled
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg ${
            isError 
              ? 'bg-red-100 text-red-700' 
              : isComplete 
                ? 'bg-green-100 text-green-700'
                : 'bg-blue-100 text-blue-700'
          } cursor-not-allowed ${className}`}
        >
          {isError ? (
            <AlertCircle className="w-4 h-4" />
          ) : isComplete ? (
            <CheckCircle className="w-4 h-4" />
          ) : (
            <Loader className="w-4 h-4 animate-spin" />
          )}
          <span className="text-sm">{uploadProgress.message}</span>
        </button>
      );
    }

    // Non connecté à Google
    if (!authStatus.isSignedIn) {
      return (
        <button
          onClick={handleConnect}
          disabled={disabled}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-blue-500 hover:bg-blue-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          <Settings className="w-4 h-4" />
          <span>Connecter Drive</span>
        </button>
      );
    }

    // Prêt pour l'upload
    return (
      <div className="flex space-x-2">
        <button
          onClick={handleUpload}
          disabled={disabled}
          className={`flex items-center space-x-2 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed ${className}`}
        >
          <CloudUpload className="w-4 h-4" />
          <span>Sauver sur Drive</span>
        </button>
        
        <button
          onClick={handleTest}
          disabled={disabled}
          className="flex items-center space-x-1 px-3 py-2 rounded-lg bg-gray-500 hover:bg-gray-600 text-white transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-sm"
          title="Tester la connexion"
        >
          <Settings className="w-3 h-3" />
        </button>
      </div>
    );
  };

  return (
    <div className="flex flex-col space-y-2">
      {renderButton()}
      
      {/* Informations utilisateur */}
      {authStatus.isSignedIn && authStatus.userEmail && (
        <div className="text-xs text-gray-500 text-center">
          Connecté: {authStatus.userEmail}
        </div>
      )}
    </div>
  );
};