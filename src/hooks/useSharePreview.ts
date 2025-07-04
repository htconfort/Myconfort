import { useState, useCallback } from 'react';
import { AdvancedPDFService } from '../services/advancedPdfService';
import { GoogleDriveService } from '../services/googleDriveService';
import { SeparatePdfEmailService } from '../services/separatePdfEmailService';
import { Invoice } from '../types';

// 🎯 INTERFACES EXPORTÉES (requis par le modal)
export interface ShareOptions {
  includeGoogleDrive?: boolean;
  includeEmail?: boolean;
  emailRecipient?: string;
  emailSubject?: string;
  emailMessage?: string;
}

export interface ShareResult {
  success: boolean;
  pdfBlob?: Blob;
  googleDriveUrl?: string;
  emailSent?: boolean;
  pdfGenerated?: boolean;
  error?: string;
}

export interface ShareProgress {
  step: 'idle' | 'generating-pdf' | 'uploading-drive' | 'sending-email' | 'completed' | 'error';
  progress: number;
  message: string;
}

// 🎯 TYPE DE RETOUR DU HOOK (requis pour TypeScript)
export interface UseSharePreviewReturn {
  isSharing: boolean;
  shareProgress: ShareProgress;
  downloadPDF: (invoice: Invoice) => Promise<boolean>;
  shareToGoogleDrive: (invoice: Invoice) => Promise<ShareResult>;
  shareByEmail: (invoice: Invoice, emailRecipient?: string, subject?: string, message?: string) => Promise<ShareResult>;
  sendEmailOnly: (invoice: Invoice, emailRecipient?: string) => Promise<ShareResult>;
  generatePDFOnly: (invoice: Invoice) => Promise<ShareResult>;
  shareComplete: (invoice: Invoice, options: ShareOptions) => Promise<ShareResult>;
  testCompleteSystem: (invoice: Invoice) => Promise<void>;
}

export const useSharePreview = (): UseSharePreviewReturn => {
  const [isSharing, setIsSharing] = useState(false);
  const [shareProgress, setShareProgress] = useState<ShareProgress>({
    step: 'idle',
    progress: 0,
    message: ''
  });

  const updateProgress = useCallback((step: ShareProgress['step'], progress: number, message: string) => {
    setShareProgress({ step, progress, message });
  }, []);

  // 📥 TÉLÉCHARGEMENT PDF (utilise votre AdvancedPDFService)
  const downloadPDF = useCallback(async (invoice: Invoice): Promise<boolean> => {
    try {
      updateProgress('generating-pdf', 50, 'Génération du PDF...');
      await AdvancedPDFService.downloadPDF(invoice);
      updateProgress('completed', 100, 'Téléchargement initié');
      return true;
    } catch (error) {
      updateProgress('error', 0, 'Erreur téléchargement');
      console.error('Erreur téléchargement:', error);
      return false;
    }
  }, [updateProgress]);

  // 📁 GOOGLE DRIVE (utilise votre GoogleDriveService)
  const shareToGoogleDrive = useCallback(async (invoice: Invoice): Promise<ShareResult> => {
    setIsSharing(true);
    const result: ShareResult = { success: false };

    try {
      updateProgress('generating-pdf', 10, 'Génération du PDF...');
      const pdfBlob = await AdvancedPDFService.getPDFBlob(invoice);
      
      updateProgress('uploading-drive', 40, 'Upload vers Google Drive...');
      const success = await GoogleDriveService.uploadPDFToGoogleDrive(invoice, pdfBlob);
      
      if (success) {
        result.success = true;
        result.pdfBlob = pdfBlob;
        result.googleDriveUrl = 'https://drive.google.com';
        updateProgress('completed', 100, '✅ Archivé sur Google Drive !');
      } else {
        throw new Error('Échec upload Google Drive');
      }
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Erreur inconnue';
      updateProgress('error', 0, `❌ Erreur: ${result.error}`);
    } finally {
      setIsSharing(false);
      setTimeout(() => {
        setShareProgress({ step: 'idle', progress: 0, message: '' });
      }, 3000);
    }

    return result;
  }, [updateProgress]);

  // 📧 ENVOI PAR EMAIL (utilise votre SeparatePdfEmailService)
  const shareByEmail = useCallback(async (
    invoice: Invoice, 
    emailRecipient?: string, 
    subject?: string, 
    message?: string
  ): Promise<ShareResult> => {
    setIsSharing(true);
    const result: ShareResult = { success: false };

    try {
      updateProgress('sending-email', 20, 'Préparation de l\'email...');
      
      // Si un destinataire spécifique est fourni
      const invoiceForEmail = emailRecipient ? {
        ...invoice,
        client: {
          ...invoice.client,
          email: emailRecipient
        }
      } : invoice;

      updateProgress('sending-email', 50, 'Envoi via EmailJS...');
      
      // Utilise votre méthode complète
      const emailResult = await SeparatePdfEmailService.generatePDFAndSendEmail(invoiceForEmail);
      
      result.success = emailResult.pdfGenerated || emailResult.emailSent;
      result.pdfGenerated = emailResult.pdfGenerated;
      result.emailSent = emailResult.emailSent;
      
      if (emailResult.emailSent) {
        updateProgress('completed', 100, '✅ Email envoyé !');
      } else if (emailResult.pdfGenerated) {
        updateProgress('completed', 100, '✅ PDF généré');
      } else {
        throw new Error('Échec du processus');
      }
      
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Erreur email';
      updateProgress('error', 0, `❌ Erreur: ${result.error}`);
    } finally {
      setIsSharing(false);
      setTimeout(() => {
        setShareProgress({ step: 'idle', progress: 0, message: '' });
      }, 3000);
    }

    return result;
  }, [updateProgress]);

  // 📧 EMAIL SEULEMENT (utilise sendEmailSeparately)
  const sendEmailOnly = useCallback(async (
    invoice: Invoice,
    emailRecipient?: string
  ): Promise<ShareResult> => {
    setIsSharing(true);
    const result: ShareResult = { success: false };

    try {
      updateProgress('sending-email', 30, 'Envoi email de notification...');
      
      const invoiceForEmail = emailRecipient ? {
        ...invoice,
        client: {
          ...invoice.client,
          email: emailRecipient
        }
      } : invoice;

      const emailSent = await SeparatePdfEmailService.sendEmailSeparately(invoiceForEmail);
      
      result.success = emailSent;
      result.emailSent = emailSent;
      
      updateProgress('completed', 100, emailSent ? '✅ Email envoyé !' : '❌ Échec email');
      
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Erreur email';
      updateProgress('error', 0, `❌ Erreur: ${result.error}`);
    } finally {
      setIsSharing(false);
      setTimeout(() => {
        setShareProgress({ step: 'idle', progress: 0, message: '' });
      }, 3000);
    }

    return result;
  }, [updateProgress]);

  // 📄 PDF LOCAL SEULEMENT
  const generatePDFOnly = useCallback(async (invoice: Invoice): Promise<ShareResult> => {
    setIsSharing(true);
    const result: ShareResult = { success: false };

    try {
      updateProgress('generating-pdf', 50, 'Génération PDF local...');
      
      await SeparatePdfEmailService.generateInvoicePDFLocal(invoice);
      
      result.success = true;
      result.pdfGenerated = true;
      
      updateProgress('completed', 100, '✅ PDF généré !');
      
    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Erreur PDF';
      updateProgress('error', 0, `❌ Erreur: ${result.error}`);
    } finally {
      setIsSharing(false);
      setTimeout(() => {
        setShareProgress({ step: 'idle', progress: 0, message: '' });
      }, 3000);
    }

    return result;
  }, [updateProgress]);

  // 🚀 PARTAGE COMPLET
  const shareComplete = useCallback(async (
    invoice: Invoice,
    options: ShareOptions
  ): Promise<ShareResult> => {
    setIsSharing(true);
    const result: ShareResult = { success: false };

    try {
      const invoiceForSharing = options.emailRecipient ? {
        ...invoice,
        client: {
          ...invoice.client,
          email: options.emailRecipient
        }
      } : invoice;

      let currentProgress = 0;
      const stepSize = 50;

      // Google Drive si demandé
      if (options.includeGoogleDrive) {
        updateProgress('uploading-drive', 30, 'Upload Google Drive...');
        
        try {
          const pdfBlob = await AdvancedPDFService.getPDFBlob(invoiceForSharing);
          const driveSuccess = await GoogleDriveService.uploadPDFToGoogleDrive(invoiceForSharing, pdfBlob);
          
          if (driveSuccess) {
            result.googleDriveUrl = 'https://drive.google.com';
            result.pdfBlob = pdfBlob;
          }
        } catch (driveError) {
          console.warn('Erreur Google Drive:', driveError);
        }
      }

      // Email si demandé
      if (options.includeEmail) {
        updateProgress('sending-email', 70, 'Envoi email...');
        
        try {
          const emailResult = await SeparatePdfEmailService.generatePDFAndSendEmail(invoiceForSharing);
          result.emailSent = emailResult.emailSent;
          result.pdfGenerated = emailResult.pdfGenerated;
        } catch (emailError) {
          console.warn('Erreur email:', emailError);
        }
      }

      result.success = true;
      updateProgress('completed', 100, '🎉 Partage terminé !');

    } catch (error) {
      result.error = error instanceof Error ? error.message : 'Erreur inconnue';
      updateProgress('error', 0, `❌ Erreur: ${result.error}`);
    } finally {
      setIsSharing(false);
      setTimeout(() => {
        setShareProgress({ step: 'idle', progress: 0, message: '' });
      }, 3000);
    }

    return result;
  }, [updateProgress]);

  // 🧪 TEST COMPLET
  const testCompleteSystem = useCallback(async (invoice: Invoice): Promise<void> => {
    setIsSharing(true);
    
    try {
      updateProgress('sending-email', 50, 'Test du système...');
      await SeparatePdfEmailService.testSeparateMethod(invoice);
      updateProgress('completed', 100, '✅ Test terminé !');
    } catch (error) {
      updateProgress('error', 0, 'Erreur test');
      console.error('Erreur test:', error);
    } finally {
      setIsSharing(false);
      setTimeout(() => {
        setShareProgress({ step: 'idle', progress: 0, message: '' });
      }, 3000);
    }
  }, [updateProgress]);

  return {
    isSharing,
    shareProgress,
    downloadPDF,
    shareToGoogleDrive,
    shareByEmail,
    sendEmailOnly,
    generatePDFOnly,
    shareComplete,
    testCompleteSystem
  };
};

export default useSharePreview;