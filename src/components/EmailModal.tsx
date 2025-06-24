import React, { useState } from 'react';
import { X, Send, Mail, AlertCircle, CheckCircle, Loader, Settings, ExternalLink, TestTube } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Invoice } from '../types';
import { EmailService } from '../services/emailService';
import { AdvancedPDFService } from '../services/advancedPdfService';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

interface EmailModalProps {
  isOpen: boolean;
  onClose: () => void;
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const EmailModal: React.FC<EmailModalProps> = ({
  isOpen,
  onClose,
  invoice,
  onSuccess,
  onError
}) => {
  const [emailData, setEmailData] = useState({
    to_email: invoice.client.email,
    to_name: invoice.client.name,
    subject: `Facture ${invoice.invoiceNumber} - FactuFlash`,
    message: `Bonjour ${invoice.client.name},\n\nVeuillez trouver ci-joint votre facture n°${invoice.invoiceNumber}.\n\nCordialement,\n${invoice.advisorName || 'L\'équipe FactuFlash'}`
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [emailMethod, setEmailMethod] = useState<'emailjs' | 'client'>('emailjs');
  const [showConfiguration, setShowConfiguration] = useState(false);

  const totalAmount = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
  }, 0);

  const isEmailJSConfigured = EmailService.isConfigured();

  const validateForm = (): boolean => {
    const errors: string[] = [];

    if (!emailData.to_email) {
      errors.push('L\'adresse email est requise');
    } else if (!EmailService.validateEmail(emailData.to_email)) {
      errors.push('L\'adresse email n\'est pas valide');
    }

    if (!emailData.to_name.trim()) {
      errors.push('Le nom du destinataire est requis');
    }

    if (!emailData.subject.trim()) {
      errors.push('L\'objet de l\'email est requis');
    }

    if (!emailData.message.trim()) {
      errors.push('Le message est requis');
    }

    if (invoice.products.length === 0) {
      errors.push('La facture doit contenir au moins un produit');
    }

    setValidationErrors(errors);
    return errors.length === 0;
  };

  const handleSendEmailJS = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Générer le PDF avec jsPDF
      const pdfDoc = await AdvancedPDFService.generateInvoicePDF(invoice);
      
      // Envoyer l'email avec EmailJS
      const success = await EmailService.sendInvoiceByEmail(pdfDoc, invoice, emailData.message);

      if (success) {
        onSuccess('Facture envoyée avec succès par email !');
        onClose();
      } else {
        onError('Erreur lors de l\'envoi de l\'email. Veuillez vérifier votre configuration EmailJS.');
      }
    } catch (error) {
      console.error('Erreur lors de l\'envoi:', error);
      onError('Erreur lors de la génération ou de l\'envoi de la facture.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleOpenEmailClient = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);

    try {
      // Générer et télécharger le PDF d'abord
      await AdvancedPDFService.downloadPDF(invoice);
      
      // Ouvrir le client email
      EmailService.openEmailClient(invoice, emailData.message);
      
      onSuccess('PDF téléchargé et client email ouvert. Veuillez attacher le PDF manuellement.');
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      onError('Erreur lors de la génération du PDF.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendEmail = () => {
    if (emailMethod === 'emailjs' && isEmailJSConfigured) {
      handleSendEmailJS();
    } else {
      handleOpenEmailClient();
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setEmailData(prev => ({ ...prev, [field]: value }));
    // Effacer les erreurs de validation lors de la saisie
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleTestConfiguration = async () => {
    setIsLoading(true);
    try {
      const success = await EmailService.testConfiguration();
      if (success) {
        onSuccess('Configuration EmailJS testée avec succès !');
      } else {
        onError('Erreur lors du test de configuration EmailJS');
      }
    } catch (error) {
      onError('Erreur lors du test de configuration');
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Envoyer la facture par email" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* Informations de la facture */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Facture à envoyer</h4>
          </div>
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <span className="font-medium">N° Facture:</span> {invoice.invoiceNumber}
            </div>
            <div>
              <span className="font-medium">Date:</span> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
            </div>
            <div>
              <span className="font-medium">Client:</span> {invoice.client.name}
            </div>
            <div>
              <span className="font-medium">Montant:</span> {formatCurrency(totalAmount)}
            </div>
          </div>
        </div>

        {/* Configuration EmailJS */}
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <h4 className="font-semibold text-green-900">Service EmailJS Configuré</h4>
            </div>
            <button
              onClick={() => setShowConfiguration(!showConfiguration)}
              className="text-green-700 hover:text-green-900 text-sm underline"
            >
              {showConfiguration ? 'Masquer' : 'Voir'} détails
            </button>
          </div>
          <p className="text-sm text-green-700 mb-2">
            ✅ Service ID: <code className="bg-green-100 px-2 py-1 rounded">service_ocsxnme</code>
          </p>
          
          {showConfiguration && (
            <div className="mt-3 p-3 bg-green-100 rounded border text-sm">
              <p className="font-medium text-green-900 mb-2">Configuration actuelle :</p>
              <ul className="space-y-1 text-green-700">
                <li>• Service ID: service_ocsxnme ✅</li>
                <li>• Template ID: template_invoice (à configurer)</li>
                <li>• Public Key: (à configurer)</li>
              </ul>
              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={handleTestConfiguration}
                  disabled={isLoading}
                  className="bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded text-sm flex items-center space-x-1"
                >
                  <TestTube className="w-3 h-3" />
                  <span>Tester</span>
                </button>
                <a 
                  href="https://www.emailjs.com/" 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className="text-green-700 hover:text-green-900 underline text-sm flex items-center space-x-1"
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Dashboard EmailJS</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Sélection de la méthode d'envoi */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Méthode d'envoi</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="emailMethod"
                value="emailjs"
                checked={emailMethod === 'emailjs'}
                onChange={(e) => setEmailMethod(e.target.value as 'emailjs')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">
                Envoi automatique avec EmailJS (service_ocsxnme)
              </span>
            </label>
            <label className="flex items-center">
              <input
                type="radio"
                name="emailMethod"
                value="client"
                checked={emailMethod === 'client'}
                onChange={(e) => setEmailMethod(e.target.value as 'client')}
                className="form-radio h-4 w-4 text-blue-600"
              />
              <span className="ml-2 text-sm text-gray-700">
                Ouvrir le client email (PDF téléchargé séparément)
              </span>
            </label>
          </div>
        </div>

        {/* Erreurs de validation */}
        {validationErrors.length > 0 && (
          <div className="bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center space-x-2 mb-2">
              <AlertCircle className="w-5 h-5 text-red-600" />
              <h4 className="font-semibold text-red-900">Erreurs de validation</h4>
            </div>
            <ul className="list-disc list-inside text-sm text-red-700 space-y-1">
              {validationErrors.map((error, index) => (
                <li key={index}>{error}</li>
              ))}
            </ul>
          </div>
        )}

        {/* Formulaire email */}
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Email destinataire *
              </label>
              <input
                type="email"
                value={emailData.to_email}
                onChange={(e) => handleInputChange('to_email', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="client@email.com"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Nom destinataire *
              </label>
              <input
                type="text"
                value={emailData.to_name}
                onChange={(e) => handleInputChange('to_name', e.target.value)}
                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                placeholder="Nom du client"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Objet de l'email *
            </label>
            <input
              type="text"
              value={emailData.subject}
              onChange={(e) => handleInputChange('subject', e.target.value)}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Objet de l'email"
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Message *
            </label>
            <textarea
              value={emailData.message}
              onChange={(e) => handleInputChange('message', e.target.value)}
              rows={6}
              className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              placeholder="Votre message..."
            />
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={onClose}
            disabled={isLoading}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium disabled:opacity-50"
          >
            Annuler
          </button>
          
          <button
            onClick={handleSendEmail}
            disabled={isLoading}
            className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-2 rounded-lg font-medium flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading ? (
              <>
                <Loader className="w-4 h-4 animate-spin" />
                <span>
                  {emailMethod === 'emailjs' ? 'Envoi en cours...' : 'Préparation...'}
                </span>
              </>
            ) : (
              <>
                <Send className="w-4 h-4" />
                <span>
                  {emailMethod === 'emailjs' ? 'Envoyer avec EmailJS' : 'Ouvrir client email'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Instructions pour finaliser la configuration */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <h5 className="font-semibold text-blue-900 mb-2">Pour finaliser la configuration EmailJS :</h5>
          <ol className="list-decimal list-inside text-blue-700 space-y-1">
            <li>Connectez-vous à votre <a href="https://dashboard.emailjs.com/" target="_blank" rel="noopener noreferrer" className="underline">dashboard EmailJS</a></li>
            <li>Créez un template d'email avec les variables : to_email, to_name, invoice_number, message, invoice_pdf</li>
            <li>Récupérez votre Template ID et Public Key</li>
            <li>Remplacez les valeurs dans le fichier <code>emailService.ts</code></li>
          </ol>
          <p className="mt-2 text-blue-600 font-medium">
            ✅ Votre Service ID <code>service_ocsxnme</code> est déjà configuré !
          </p>
        </div>
      </div>
    </Modal>
  );
};