import React, { useState } from 'react';
import { Invoice } from '../types';
import { useSharePreview, ShareOptions } from '../hooks/useSharePreview';

interface PDFPreviewModalProps {
  invoice: Invoice;
  onClose: () => void;
}

const PDFPreviewModal: React.FC<PDFPreviewModalProps> = ({ invoice, onClose }) => {
  const { 
    downloadPDF, 
    shareToGoogleDrive, 
    shareByEmail,
    sendEmailOnly,
    generatePDFOnly,
    shareComplete,
    testCompleteSystem,
    isSharing, 
    shareProgress 
  } = useSharePreview();

  // États pour l'email
  const [showEmailForm, setShowEmailForm] = useState(false);
  const [emailRecipient, setEmailRecipient] = useState(invoice.client.email || '');
  const [includeGoogleDrive, setIncludeGoogleDrive] = useState(true);

  // 📥 ACTIONS RAPIDES
  const handleDownloadPDF = async () => {
    await downloadPDF(invoice);
  };

  const handleUploadToDrive = async () => {
    const result = await shareToGoogleDrive(invoice);
    if (result.success) {
      alert('✅ Facture archivée avec succès sur Google Drive !');
    } else {
      alert(`❌ Erreur upload Google Drive : ${result.error}`);
    }
  };

  // 📧 ACTIONS EMAIL
  const handleEmailWithPDF = async () => {
    if (!emailRecipient.trim()) {
      alert('⚠️ Veuillez saisir un destinataire email');
      return;
    }

    const result = await shareByEmail(invoice, emailRecipient);
    
    if (result.success) {
      let message = '✅ Processus terminé !\n\n';
      if (result.pdfGenerated) message += '📄 PDF généré et téléchargé\n';
      if (result.emailSent) message += '📧 Email envoyé avec succès\n';
      
      alert(message);
      if (result.emailSent) setShowEmailForm(false);
    } else {
      alert(`❌ Erreur : ${result.error}`);
    }
  };

  const handleEmailOnly = async () => {
    if (!emailRecipient.trim()) {
      alert('⚠️ Veuillez saisir un destinataire email');
      return;
    }

    const result = await sendEmailOnly(invoice, emailRecipient);
    
    if (result.success) {
      alert('✅ Email de notification envoyé avec succès !');
      setShowEmailForm(false);
    } else {
      alert(`❌ Erreur envoi email : ${result.error}`);
    }
  };

  const handlePDFOnly = async () => {
    const result = await generatePDFOnly(invoice);
    
    if (result.success) {
      alert('✅ PDF généré et téléchargé avec votre script html2pdf !');
    } else {
      alert(`❌ Erreur génération PDF : ${result.error}`);
    }
  };

  // 🚀 PARTAGE COMPLET
  const handleCompleteShare = async () => {
    if (!emailRecipient.trim()) {
      alert('⚠️ Veuillez saisir un destinataire email');
      return;
    }

    const options: ShareOptions = {
      includeGoogleDrive,
      includeEmail: true,
      emailRecipient
    };

    const result = await shareComplete(invoice, options);
    
    if (result.success) {
      let message = '✅ Partage complet terminé !\n\n';
      if (result.googleDriveUrl) message += '📁 Sauvegardé sur Google Drive\n';
      if (result.emailSent) message += '📧 Email envoyé avec PDF\n';
      if (result.pdfGenerated) message += '📄 PDF généré localement\n';
      
      alert(message);
      onClose();
    } else {
      alert(`❌ Erreur : ${result.error}`);
    }
  };

  // 🧪 TEST COMPLET
  const handleTestSystem = async () => {
    await testCompleteSystem(invoice);
  };

  // 🎨 COULEURS PROGRESS BAR
  const getProgressColor = () => {
    switch (shareProgress.step) {
      case 'completed': return 'bg-green-500';
      case 'error': return 'bg-red-500';
      default: return 'bg-blue-500';
    }
  };

  const getProgressIcon = () => {
    switch (shareProgress.step) {
      case 'generating-pdf': return '📄';
      case 'uploading-drive': return '📁';
      case 'sending-email': return '📧';
      case 'completed': return '✅';
      case 'error': return '❌';
      default: return '⏳';
    }
  };

  // Calculer le total (adapté à votre structure Invoice)
  const calculateTotal = () => {
    if (invoice.products && Array.isArray(invoice.products)) {
      return invoice.products.reduce((sum, product) => {
        return sum + (product.quantity * product.priceTTC || 0);
      }, 0);
    }
    return 0;
  };

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-60 z-50">
      <div className="bg-white rounded-lg p-8 w-full max-w-3xl shadow-lg relative max-h-[90vh] overflow-y-auto">
        <button 
          onClick={onClose} 
          className="absolute top-4 right-4 text-gray-600 hover:text-black text-xl"
          disabled={isSharing}
        >
          &times;
        </button>
        
        <h2 className="text-2xl font-bold mb-4">📤 Partager la Facture MYCONFORT</h2>

        {/* INFORMATIONS FACTURE */}
        <div className="mb-6 p-4 bg-gray-50 rounded-lg">
          <p><b>Facture :</b> {invoice.invoiceNumber}</p>
          <p><b>Client :</b> {invoice.client.name}</p>
          <p><b>Email :</b> {invoice.client.email}</p>
          <p><b>Date :</b> {invoice.invoiceDate}</p>
          <p><b>Total :</b> {calculateTotal()}€</p>
        </div>

        {/* PROGRESS BAR */}
        {isSharing && (
          <div className="mb-6 p-4 bg-blue-50 rounded-lg">
            <div className="flex items-center gap-2 mb-2">
              <span className="text-lg">{getProgressIcon()}</span>
              <span className="text-sm font-medium">{shareProgress.message}</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className={`h-2 rounded-full transition-all duration-300 ${getProgressColor()}`}
                style={{ width: `${shareProgress.progress}%` }}
              />
            </div>
          </div>
        )}

        {/* ACTIONS RAPIDES */}
        <div className="mb-6">
          <h3 className="font-semibold mb-3">🚀 Actions rapides</h3>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
            <button
              className="px-3 py-3 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 text-sm"
              onClick={handleDownloadPDF}
              disabled={isSharing}
            >
              📥 Télécharger<br/>
              <span className="text-xs">(AdvancedPDF)</span>
            </button>
            
            <button
              className="px-3 py-3 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 text-sm"
              onClick={handleUploadToDrive}
              disabled={isSharing}
            >
              📁 Google Drive<br/>
              <span className="text-xs">(Upload)</span>
            </button>

            <button
              className="px-3 py-3 bg-purple-600 text-white rounded hover:bg-purple-700 disabled:opacity-50 text-sm"
              onClick={handlePDFOnly}
              disabled={isSharing}
            >
              📄 PDF Local<br/>
              <span className="text-xs">(html2pdf.js)</span>
            </button>

            <button
              className="px-3 py-3 bg-orange-600 text-white rounded hover:bg-orange-700 disabled:opacity-50 text-sm"
              onClick={handleTestSystem}
              disabled={isSharing}
            >
              🧪 Test Complet<br/>
              <span className="text-xs">(EmailJS)</span>
            </button>
          </div>
        </div>

        {/* SECTION EMAIL */}
        <div className="mb-6">
          <div className="flex items-center justify-between mb-3">
            <h3 className="font-semibold">📧 Email avec votre service EmailJS</h3>
            <button
              onClick={() => setShowEmailForm(!showEmailForm)}
              className="text-blue-600 hover:text-blue-800 text-sm"
              disabled={isSharing}
            >
              {showEmailForm ? 'Masquer' : 'Afficher les options'}
            </button>
          </div>

          {showEmailForm && (
            <div className="space-y-4 p-4 border rounded-lg bg-gray-50">
              <div>
                <label className="block text-sm font-medium mb-1">Destinataire :</label>
                <input
                  type="email"
                  placeholder="destinataire@email.com"
                  value={emailRecipient}
                  onChange={(e) => setEmailRecipient(e.target.value)}
                  disabled={isSharing}
                  className="w-full p-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div className="flex items-center gap-4">
                <label className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={includeGoogleDrive}
                    onChange={(e) => setIncludeGoogleDrive(e.target.checked)}
                    disabled={isSharing}
                    className="rounded"
                  />
                  <span className="text-sm">📁 Également sauvegarder sur Google Drive</span>
                </label>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-2">
                <button
                  onClick={handleEmailOnly}
                  disabled={isSharing || !emailRecipient.trim()}
                  className="px-4 py-2 bg-yellow-500 text-white rounded hover:bg-yellow-600 disabled:opacity-50 text-sm"
                >
                  📧 Email notification<br/>
                  <span className="text-xs">(sans PDF joint)</span>
                </button>
                
                <button
                  onClick={handleEmailWithPDF}
                  disabled={isSharing || !emailRecipient.trim()}
                  className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50 text-sm"
                >
                  📧 Email + PDF<br/>
                  <span className="text-xs">(méthode complète)</span>
                </button>
                
                <button
                  onClick={handleCompleteShare}
                  disabled={isSharing || !emailRecipient.trim()}
                  className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 text-sm"
                >
                  🚀 Tout en un<br/>
                  <span className="text-xs">(Drive + Email + PDF)</span>
                </button>
              </div>
            </div>
          )}
        </div>

        {/* INFORMATIONS SERVICES */}
        <div className="mb-6 p-4 bg-green-50 rounded-lg border border-green-200">
          <h4 className="font-semibold text-green-800 mb-2">🔧 Services utilisés :</h4>
          <ul className="text-sm text-green-700 space-y-1">
            <li>📄 <b>AdvancedPDFService</b> - Génération PDF avancée</li>
            <li>📁 <b>GoogleDriveService</b> - Upload vers Google Drive</li>
            <li>📧 <b>SeparatePdfEmailService</b> - EmailJS avec html2pdf.js</li>
            <li>🔑 <b>Clés EmailJS</b> - Configuration définitive testée</li>
          </ul>
        </div>

        {/* BOUTON FERMER */}
        <div className="flex justify-end">
          <button
            onClick={onClose}
            disabled={isSharing}
            className="px-6 py-2 text-gray-600 hover:text-gray-800 disabled:opacity-50"
          >
            {isSharing ? 'Fermeture après partage...' : 'Fermer'}
          </button>
        </div>
      </div>
    </div>
  );
};

export default PDFPreviewModal;