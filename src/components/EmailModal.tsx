import React, { useState } from 'react';
import { X, Send, Mail, AlertCircle, CheckCircle, Loader, Settings, ExternalLink, TestTube, FileText, Paperclip, AlertTriangle, Building2, Shield, Clock } from 'lucide-react';
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
    subject: `Facture ${invoice.invoiceNumber} - MYCONFORT`,
    message: `Bonjour ${invoice.client.name},\n\nVeuillez trouver ci-joint votre facture n°${invoice.invoiceNumber} générée avec notre système MYCONFORT.\n\n${invoice.signature ? '✓ Cette facture a été signée électroniquement et est juridiquement valide.\n\n' : ''}Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}\n\n---\nMYCONFORT - Facturation professionnelle avec signature électronique`
  });
  
  const [isLoading, setIsLoading] = useState(false);
  const [validationErrors, setValidationErrors] = useState<string[]>([]);
  const [emailMethod, setEmailMethod] = useState<'emailjs' | 'client'>('emailjs');
  const [showConfiguration, setShowConfiguration] = useState(false);
  const [showTroubleshooting, setShowTroubleshooting] = useState(false);
  const [pdfSize, setPdfSize] = useState<number>(0);
  const [sendingStep, setSendingStep] = useState<string>('');

  const totalAmount = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
  }, 0);

  const isEmailJSConfigured = EmailService.isConfigured();
  const configInfo = EmailService.getConfigurationInfo() as any;

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
      // Étape 1: Génération du PDF
      setSendingStep('Génération du PDF avec signature...');
      console.log('📄 Génération du PDF avec MYCONFORT...');
      const pdfDoc = await AdvancedPDFService.generateInvoicePDF(invoice);
      
      // Calculer la taille du PDF
      const pdfBlob = pdfDoc.output('blob');
      const sizeKB = Math.round(pdfBlob.size / 1024);
      setPdfSize(sizeKB);
      
      console.log('📎 PDF généré avec signature:', sizeKB, 'KB');
      
      // Étape 2: Optimisation du PDF
      setSendingStep('Optimisation du PDF pour envoi...');
      const optimizedPDF = await EmailService.optimizePDFForEmail(pdfBlob);
      
      // Étape 3: Envoi de l'email
      setSendingStep('Envoi sécurisé par email...');
      console.log('📧 Envoi de l\'email avec PDF signé en pièce jointe...');
      const success = await EmailService.sendInvoiceByEmail(pdfDoc, invoice, emailData.message);

      if (success) {
        setSendingStep('Envoi réussi !');
        onSuccess(`✅ Facture MYCONFORT envoyée avec succès ! PDF signé électroniquement (${sizeKB} KB) livré par email sécurisé.`);
        onClose();
      } else {
        onError('❌ Erreur: Template EmailJS introuvable. Vérifiez votre configuration dans le dashboard EmailJS.');
        setShowTroubleshooting(true);
      }
    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi:', error);
      
      if (error?.text?.includes('template ID not found') || error?.status === 400) {
        onError('❌ Template EmailJS introuvable. Le template ID configuré n\'existe pas dans votre compte.');
        setShowTroubleshooting(true);
      } else {
        onError('Erreur lors de la génération ou de l\'envoi de la facture avec PDF signé.');
      }
    } finally {
      setIsLoading(false);
      setSendingStep('');
    }
  };

  const handleOpenEmailClient = async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setSendingStep('Génération du PDF signé...');

    try {
      // Générer et télécharger le PDF d'abord
      await AdvancedPDFService.downloadPDF(invoice);
      
      setSendingStep('Ouverture du client email...');
      // Ouvrir le client email
      EmailService.openEmailClient(invoice, emailData.message);
      
      onSuccess('📎 PDF MYCONFORT téléchargé et client email ouvert. Veuillez attacher le PDF signé manuellement.');
      onClose();
    } catch (error) {
      console.error('Erreur:', error);
      onError('Erreur lors de la génération du PDF signé.');
    } finally {
      setIsLoading(false);
      setSendingStep('');
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
    if (validationErrors.length > 0) {
      setValidationErrors([]);
    }
  };

  const handleTestConfiguration = async () => {
    setIsLoading(true);
    try {
      const success = await EmailService.testConfiguration();
      if (success) {
        onSuccess('✅ Configuration EmailJS testée avec succès !');
      } else {
        onError('❌ Erreur lors du test de configuration EmailJS. Vérifiez votre template ID.');
        setShowTroubleshooting(true);
      }
    } catch (error) {
      onError('Erreur lors du test de configuration');
      setShowTroubleshooting(true);
    } finally {
      setIsLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="MYCONFORT - Envoi Automatique" maxWidth="max-w-3xl">
      <div className="space-y-6">
        {/* En-tête MYCONFORT */}
        <div className="bg-gradient-to-r from-green-600 to-blue-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">MYCONFORT</h3>
              <p className="text-green-100">Facturation professionnelle avec signature électronique</p>
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 mt-4">
            <div className="text-center">
              <Shield className="w-8 h-8 mx-auto mb-1 text-green-200" />
              <div className="text-sm font-semibold">Signature Électronique</div>
              <div className="text-xs text-green-100">Conforme eIDAS</div>
            </div>
            <div className="text-center">
              <Mail className="w-8 h-8 mx-auto mb-1 text-blue-200" />
              <div className="text-sm font-semibold">Envoi Automatique</div>
              <div className="text-xs text-blue-100">PDF en pièce jointe</div>
            </div>
            <div className="text-center">
              <Clock className="w-8 h-8 mx-auto mb-1 text-purple-200" />
              <div className="text-sm font-semibold">Instantané</div>
              <div className="text-xs text-purple-100">Livraison immédiate</div>
            </div>
          </div>
        </div>

        {/* Informations de la facture */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center space-x-2 mb-2">
            <Mail className="w-5 h-5 text-blue-600" />
            <h4 className="font-semibold text-blue-900">Facture à envoyer</h4>
            {invoice.signature && (
              <div className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                <Shield className="w-3 h-3" />
                <span>SIGNÉE</span>
              </div>
            )}
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
          
          {/* Indicateur de pièce jointe PDF */}
          <div className="mt-3 flex items-center space-x-2 p-2 bg-green-100 border border-green-200 rounded">
            <Paperclip className="w-4 h-4 text-green-600" />
            <FileText className="w-4 h-4 text-green-600" />
            {invoice.signature && <Shield className="w-4 h-4 text-green-600" />}
            <span className="text-sm font-medium text-green-700">
              PDF {invoice.signature ? 'signé électroniquement' : 'professionnel'} sera automatiquement attaché
              {pdfSize > 0 && ` (${pdfSize} KB)`}
            </span>
          </div>
        </div>

        {/* Configuration EmailJS */}
        <div className={`border rounded-lg p-4 ${isEmailJSConfigured ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
          <div className="flex items-center justify-between mb-2">
            <div className="flex items-center space-x-2">
              {isEmailJSConfigured ? (
                <CheckCircle className="w-5 h-5 text-green-600" />
              ) : (
                <AlertTriangle className="w-5 h-5 text-red-600" />
              )}
              <h4 className={`font-semibold ${isEmailJSConfigured ? 'text-green-900' : 'text-red-900'}`}>
                {isEmailJSConfigured ? 'Service EmailJS Configuré' : 'Configuration EmailJS Incomplète'}
              </h4>
            </div>
            <button
              onClick={() => setShowConfiguration(!showConfiguration)}
              className={`text-sm underline ${isEmailJSConfigured ? 'text-green-700 hover:text-green-900' : 'text-red-700 hover:text-red-900'}`}
            >
              {showConfiguration ? 'Masquer' : 'Voir'} détails
            </button>
          </div>
          
          {isEmailJSConfigured ? (
            <p className="text-sm text-green-700 mb-2">
              ✅ Service ID: <code className="bg-green-100 px-2 py-1 rounded">service_ocsxnme</code>
            </p>
          ) : (
            <div className="text-sm text-red-700 mb-2">
              <p className="font-medium mb-1">⚠️ Problème de configuration détecté:</p>
              <p>Le template ID configuré n'existe pas dans votre compte EmailJS.</p>
            </div>
          )}
          
          {showConfiguration && (
            <div className={`mt-3 p-3 rounded border text-sm ${isEmailJSConfigured ? 'bg-green-100' : 'bg-red-100'}`}>
              <p className={`font-medium mb-2 ${isEmailJSConfigured ? 'text-green-900' : 'text-red-900'}`}>
                Configuration MYCONFORT :
              </p>
              <ul className={`space-y-1 ${isEmailJSConfigured ? 'text-green-700' : 'text-red-700'}`}>
                <li>• Service ID: {configInfo.serviceId} ✅</li>
                <li>• Template ID: {configInfo.templateId} {isEmailJSConfigured ? '✅' : '❌'}</li>
                <li>• Public Key: {configInfo.publicKey ? 'Configuré ✅' : 'Manquant ❌'}</li>
                <li>• 📎 Attachement PDF: Automatique avec signature</li>
                <li>• 🔒 Sécurité: Conforme eIDAS</li>
              </ul>
              {configInfo.warning && (
                <div className="mt-2 p-2 bg-yellow-100 border border-yellow-300 rounded">
                  <p className="text-yellow-800 text-xs">{configInfo.warning}</p>
                </div>
              )}
              <div className="mt-3 flex items-center space-x-2">
                <button
                  onClick={handleTestConfiguration}
                  disabled={isLoading}
                  className={`px-3 py-1 rounded text-sm flex items-center space-x-1 ${
                    isEmailJSConfigured 
                      ? 'bg-green-600 hover:bg-green-700 text-white' 
                      : 'bg-red-600 hover:bg-red-700 text-white'
                  }`}
                >
                  <TestTube className="w-3 h-3" />
                  <span>Tester</span>
                </button>
                <a 
                  href={EmailService.getDashboardURL()} 
                  target="_blank" 
                  rel="noopener noreferrer"
                  className={`underline text-sm flex items-center space-x-1 ${
                    isEmailJSConfigured 
                      ? 'text-green-700 hover:text-green-900' 
                      : 'text-red-700 hover:text-red-900'
                  }`}
                >
                  <ExternalLink className="w-3 h-3" />
                  <span>Dashboard EmailJS</span>
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Instructions de dépannage */}
        {showTroubleshooting && (
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="w-5 h-5 text-yellow-600" />
                <h4 className="font-semibold text-yellow-900">Guide de dépannage MYCONFORT</h4>
              </div>
              <button
                onClick={() => setShowTroubleshooting(false)}
                className="text-yellow-700 hover:text-yellow-900"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="text-sm text-yellow-800">
              <p className="font-medium mb-2">🔧 Étapes pour résoudre le problème:</p>
              <ol className="list-decimal list-inside space-y-1 ml-2">
                {EmailService.getTroubleshootingSteps().map((step, index) => (
                  <li key={index}>{step}</li>
                ))}
              </ol>
              <div className="mt-3 p-2 bg-yellow-100 border border-yellow-300 rounded">
                <p className="font-medium text-yellow-900 mb-1">💡 Solution rapide:</p>
                <p className="text-xs">
                  Modifiez la constante <code>EMAILJS_TEMPLATE_ID</code> dans le fichier 
                  <code className="bg-yellow-200 px-1 rounded mx-1">src/services/emailService.ts</code>
                  avec l'ID d\'un template existant de votre dashboard EmailJS.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Sélection de la méthode d'envoi */}
        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
          <h4 className="font-semibold text-gray-900 mb-3">Méthode d'envoi MYCONFORT</h4>
          <div className="space-y-2">
            <label className="flex items-center">
              <input
                type="radio"
                name="emailMethod"
                value="emailjs"
                checked={emailMethod === 'emailjs'}
                onChange={(e) => setEmailMethod(e.target.value as 'emailjs')}
                className="form-radio h-4 w-4 text-blue-600"
                disabled={!isEmailJSConfigured}
              />
              <span className={`ml-2 text-sm flex items-center space-x-1 ${!isEmailJSConfigured ? 'text-gray-400' : 'text-gray-700'}`}>
                <Building2 className="w-4 h-4 text-blue-600" />
                <span>Envoi automatique MYCONFORT (service_ocsxnme)</span>
                <Paperclip className="w-3 h-3 text-green-600" />
                <Shield className="w-3 h-3 text-green-600" />
                <span className="text-green-600 font-medium">PDF signé attaché</span>
                {!isEmailJSConfigured && <span className="text-red-500 font-medium">(Non disponible)</span>}
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
              <span className="ml-2 text-sm text-gray-700 flex items-center space-x-1">
                <Mail className="w-4 h-4 text-gray-600" />
                <span>Ouvrir le client email (PDF téléchargé séparément)</span>
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

        {/* Indicateur de progression */}
        {isLoading && sendingStep && (
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center space-x-3">
              <Loader className="w-5 h-5 animate-spin text-blue-600" />
              <div>
                <div className="font-semibold text-blue-900">MYCONFORT en action...</div>
                <div className="text-sm text-blue-700">{sendingStep}</div>
              </div>
            </div>
          </div>
        )}

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
            disabled={isLoading || (emailMethod === 'emailjs' && !isEmailJSConfigured)}
            className="bg-gradient-to-r from-green-600 to-blue-600 hover:from-green-700 hover:to-blue-700 text-white px-8 py-3 rounded-lg font-bold flex items-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed transform transition-all hover:scale-105 shadow-lg"
          >
            {isLoading ? (
              <>
                <Loader className="w-5 h-5 animate-spin" />
                <span>
                  {emailMethod === 'emailjs' ? 'Envoi MYCONFORT...' : 'Préparation...'}
                </span>
              </>
            ) : (
              <>
                <Building2 className="w-5 h-5" />
                {emailMethod === 'emailjs' && <Paperclip className="w-4 h-4" />}
                {emailMethod === 'emailjs' && <Shield className="w-4 h-4" />}
                <span>
                  {emailMethod === 'emailjs' ? 'Envoyer avec MYCONFORT' : 'Ouvrir client email'}
                </span>
              </>
            )}
          </button>
        </div>

        {/* Instructions pour finaliser la configuration */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-sm">
          <h5 className="font-semibold text-blue-900 mb-2">📧 Template EmailJS pour MYCONFORT :</h5>
          <div className="bg-blue-100 p-3 rounded border font-mono text-xs overflow-x-auto">
            <div className="mb-2"><strong>Variables MYCONFORT disponibles :</strong></div>
            <div>• <code>{'{{invoice_pdf}}'}</code> - Données PDF base64 avec signature</div>
            <div>• <code>{'{{pdf_filename}}'}</code> - Nom du fichier PDF</div>
            <div>• <code>{'{{pdf_size}}'}</code> - Taille du PDF en KB</div>
            <div>• <code>{'{{to_email}}'}</code>, <code>{'{{to_name}}'}</code>, <code>{'{{message}}'}</code></div>
            <div>• <code>{'{{invoice_number}}'}</code>, <code>{'{{total_amount}}'}</code></div>
            <div>• <code>{'{{app_name}}'}</code> - "MYCONFORT"</div>
          </div>
          <p className="mt-2 text-blue-600 font-medium">
            {isEmailJSConfigured ? (
              <>✅ Service ID <code>service_ocsxnme</code> configuré | 📎 PDF signé automatiquement attaché</>
            ) : (
              <>⚠️ Configuration incomplète - Vérifiez votre template ID</>
            )}
          </p>
        </div>
      </div>
    </Modal>
  );
};