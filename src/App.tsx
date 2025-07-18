import React, { useState, useEffect } from 'react';
import { Header } from './components/Header';
import { InvoiceHeader } from './components/InvoiceHeader';
import { ClientSection } from './components/ClientSection';
import { ProductSection } from './components/ProductSection';
import { ClientListModal } from './components/ClientListModal';
import { InvoicesListModal } from './components/InvoicesListModal';
import { ProductsListModal } from './components/ProductsListModal';
import { PDFPreviewModal } from './components/PDFPreviewModal';
import { EmailJSConfigModal } from './components/EmailJSConfigModal';
import { GoogleDriveModal } from './components/GoogleDriveModal';
import { SignaturePad } from './components/SignaturePad';
import { EmailSender } from './components/EmailSender';
import { InvoicePDF } from './components/InvoicePDF';
import { Toast } from './components/ui/Toast';
import { Invoice, Client, ToastType } from './types';
import { generateInvoiceNumber } from './utils/calculations';
import { saveClients, loadClients, saveDraft, loadDraft, saveClient, saveInvoice, loadInvoices, deleteInvoice } from './utils/storage';
import { AdvancedPDFService } from './services/advancedPdfService';
import { GoogleDriveService } from './services/googleDriveService';

console.log('🔧 App.tsx chargé - Composant principal OK');

function App() {
  console.log('🎯 App() fonction appelée - Rendu en cours...');
  
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split('T')[0],
    eventLocation: '',
    advisorName: '',
    invoiceNotes: '',
    termsAccepted: false,
    taxRate: 20,
    client: {
      name: '',
      address: '',
      postalCode: '',
      city: '',
      phone: '',
      email: '',
      housingType: '',
      doorCode: ''
    },
    delivery: {
      method: '',
      notes: ''
    },
    payment: {
      method: '',
      depositAmount: 0
    },
    products: [],
    signature: ''
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);
  const [showClientsList, setShowClientsList] = useState(false);
  const [showInvoicesList, setShowInvoicesList] = useState(false);
  const [showProductsList, setShowProductsList] = useState(false);
  const [showPDFPreview, setShowPDFPreview] = useState(false);
  const [showEmailJSConfig, setShowEmailJSConfig] = useState(false);
  const [showGoogleDriveConfig, setShowGoogleDriveConfig] = useState(false);
  const [showSignaturePad, setShowSignaturePad] = useState(false);
  const [showInvoicePreview, setShowInvoicePreview] = useState(true);
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as ToastType
  });

  useEffect(() => {
    console.log('⚡ useEffect initial - Chargement des données...');
    setClients(loadClients());
    setInvoices(loadInvoices());
    const draft = loadDraft();
    if (draft) {
      setInvoice(draft);
      showToast('Brouillon chargé', 'success');
    }

    // Auto-save every 60 seconds
    const interval = setInterval(() => {
      handleSave();
    }, 60000);

    return () => clearInterval(interval);
  }, []);

  // 🧪 TEST DE PREVIEW - Affichage temporaire pour débugger
  const isTestMode = false; // Changer à true pour tester
  
  if (isTestMode) {
    console.log('🧪 MODE TEST ACTIVÉ');
    return (
      <div style={{
        padding: 40,
        backgroundColor: '#477A0C',
        color: 'white',
        textAlign: 'center',
        fontSize: '24px',
        fontWeight: 'bold',
        minHeight: '100vh',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        flexDirection: 'column'
      }}>
        <div>🎉 Hello Test Preview MYCONFORT !</div>
        <div style={{ fontSize: '16px', marginTop: '20px' }}>
          ✅ React fonctionne correctement<br/>
          ✅ App.tsx se charge bien<br/>
          ✅ Styles appliqués<br/>
          🔧 Changez isTestMode à false pour voir l'app complète
        </div>
      </div>
    );
  }

  console.log('🎨 Rendu de l\'application complète MYCONFORT');

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  const handleSave = () => {
    try {
      saveDraft(invoice);
      if (invoice.client.name && invoice.client.email) {
        saveClient(invoice.client);
        setClients(loadClients());
      }
      showToast('Brouillon enregistré', 'success');
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement', 'error');
    }
  };

  const handleSaveInvoice = () => {
    try {
      if (!invoice.client.name || !invoice.client.email || invoice.products.length === 0) {
        showToast('Veuillez compléter les informations client et ajouter au moins un produit', 'error');
        return;
      }

      saveInvoice(invoice);
      setInvoices(loadInvoices());
      showToast(`Facture ${invoice.invoiceNumber} enregistrée avec succès`, 'success');
    } catch (error) {
      showToast('Erreur lors de l\'enregistrement de la facture', 'error');
    }
  };

  // 🆕 NOUVELLE FONCTION - ENREGISTRER + UTILISER MÊME LOGIQUE QUE BOUTON DRIVE
  const handleSaveAndSendInvoice = async () => {
    try {
      // 🔒 VALIDATION OBLIGATOIRE
      const validation = validateMandatoryFields();
      
      if (!validation.isValid) {
        showToast(`Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
        return;
      }

      // 1. 💾 ENREGISTRER LA FACTURE LOCALEMENT
      handleSave();
      handleSaveInvoice();
      
      showToast('📧 Enregistrement terminé ! Cliquez maintenant sur le bouton "Drive" en haut à droite pour envoyer l\'email avec PDF.', 'success');
      
      // 🎯 GUIDANCE UTILISATEUR
      setTimeout(() => {
        showToast('💡 Astuce : Le bouton "Drive" en haut à droite enverra automatiquement l\'email avec la pièce jointe PDF !', 'info');
      }, 3000);
      
    } catch (error: any) {
      console.error('❌ Erreur enregistrement:', error);
      showToast(`❌ Erreur d'enregistrement: ${error.message || 'Erreur inconnue'}`, 'error');
    }
  };

  // 🔒 VALIDATION OBLIGATOIRE RENFORCÉE AVEC DATE
  const validateMandatoryFields = (): { isValid: boolean; errors: string[] } => {
    const errors: string[] = [];

    // Validation date (OBLIGATOIRE)
    if (!invoice.invoiceDate || invoice.invoiceDate.trim() === '') {
      errors.push('Date de la facture obligatoire');
    }

    // Validation lieu d'événement (OBLIGATOIRE)
    if (!invoice.eventLocation || invoice.eventLocation.trim() === '') {
      errors.push('Lieu de l\'événement obligatoire');
    }

    // Validation informations client (TOUS OBLIGATOIRES)
    if (!invoice.client.name || invoice.client.name.trim() === '') {
      errors.push('Nom complet du client obligatoire');
    }

    if (!invoice.client.address || invoice.client.address.trim() === '') {
      errors.push('Adresse du client obligatoire');
    }

    if (!invoice.client.postalCode || invoice.client.postalCode.trim() === '') {
      errors.push('Code postal du client obligatoire');
    }

    if (!invoice.client.city || invoice.client.city.trim() === '') {
      errors.push('Ville du client obligatoire');
    }

    if (!invoice.client.housingType || invoice.client.housingType.trim() === '') {
      errors.push('Type de logement du client obligatoire');
    }

    if (!invoice.client.doorCode || invoice.client.doorCode.trim() === '') {
      errors.push('Code porte/étage du client obligatoire');
    }

    if (!invoice.client.phone || invoice.client.phone.trim() === '') {
      errors.push('Téléphone du client obligatoire');
    }

    if (!invoice.client.email || invoice.client.email.trim() === '') {
      errors.push('Email du client obligatoire');
    }

    // Validation email format
    if (invoice.client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(invoice.client.email)) {
      errors.push('Format d\'email invalide');
    }

    // Validation produits
    if (invoice.products.length === 0) {
      errors.push('Au moins un produit obligatoire');
    }

    return {
      isValid: errors.length === 0,
      errors
    };
  };

  const handleShowPDFPreview = () => {
    // 🔒 VALIDATION OBLIGATOIRE AVANT APERÇU
    const validation = validateMandatoryFields();
    
    if (!validation.isValid) {
      showToast(`Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    
    handleSave();
    handleSaveInvoice();
    setShowPDFPreview(true);
  };

  const handleGeneratePDF = async () => {
    try {
      // 🔒 VALIDATION OBLIGATOIRE AVANT GÉNÉRATION PDF
      const validation = validateMandatoryFields();
      
      if (!validation.isValid) {
        showToast(`Impossible de générer le PDF. Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
        return;
      }

      handleSave();
      handleSaveInvoice();
      showToast('Génération du PDF MYCONFORT en cours...', 'success');
      
      await AdvancedPDFService.downloadPDF(invoice);
      showToast(`PDF MYCONFORT téléchargé avec succès${invoice.signature ? ' (avec signature électronique)' : ''}`, 'success');
    } catch (error) {
      console.error('PDF generation error:', error);
      showToast('Erreur lors de la génération du PDF', 'error');
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const handleEmailJSSuccess = (message: string) => {
    handleSaveInvoice();
    showToast(message, 'success');
  };

  const handleEmailJSError = (message: string) => {
    showToast(message, 'error');
  };

  const handleLoadClient = (client: Client) => {
    setInvoice(prev => ({ ...prev, client }));
    setShowClientsList(false);
    showToast('Client chargé avec succès', 'success');
  };

  const handleDeleteClient = (index: number) => {
    const updatedClients = clients.filter((_, i) => i !== index);
    setClients(updatedClients);
    saveClients(updatedClients);
    showToast('Client supprimé', 'success');
  };

  const handleLoadInvoice = (loadedInvoice: Invoice) => {
    setInvoice(loadedInvoice);
    showToast(`Facture ${loadedInvoice.invoiceNumber} chargée avec succès`, 'success');
  };

  const handleDeleteInvoice = (index: number) => {
    const invoiceToDelete = invoices[index];
    if (invoiceToDelete) {
      deleteInvoice(invoiceToDelete.invoiceNumber);
      setInvoices(loadInvoices());
      showToast(`Facture ${invoiceToDelete.invoiceNumber} supprimée`, 'success');
    }
  };

  const handleSaveSignature = (signature: string) => {
    setInvoice(prev => ({ ...prev, signature }));
    showToast('Signature enregistrée - Facture prête pour envoi !', 'success');
  };

  // 🚀 NOUVELLE FONCTION - UPLOAD DIRECT VERS GOOGLE DRIVE AVEC PDF POUR EMAIL
  const handleUploadToGoogleDrive = async () => {
    try {
      // 🔒 VALIDATION OBLIGATOIRE AVANT UPLOAD
      const validation = validateMandatoryFields();
      
      if (!validation.isValid) {
        showToast(`Impossible d'envoyer vers Google Drive. Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
        return;
      }

      // Sauvegarder la facture avant upload
      handleSave();
      handleSaveInvoice();
      
      showToast('📤 Envoi vers Google Drive et génération email en cours...', 'success');
      
      // 🆕 GÉNÉRER LE PDF ET L'ENVOYER VERS N8N POUR EMAIL
      const pdfBlob = await AdvancedPDFService.getPDFBlob(invoice);
      
      // 🔄 CONVERTIR LE PDF EN BASE64 POUR N8N
      const base64Data = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onload = () => {
          const base64 = (reader.result as string).split(",")[1]; // Supprimer le préfixe data URL
          resolve(base64);
        };
        reader.onerror = () => reject(new Error("Erreur de conversion PDF"));
        reader.readAsDataURL(pdfBlob);
      });

      // 🚀 PRÉPARER LES DONNÉES POUR N8N AVEC PDF
      const webhookData = {
        nom_facture: `Facture_MYCONFORT_${invoice.invoiceNumber}`,
        fichier_facture: base64Data, // 📎 PDF EN PIÈCE JOINTE POUR EMAIL !
        date_creation: new Date().toISOString(),
        numero_facture: invoice.invoiceNumber,
        date_facture: invoice.invoiceDate,
        montant_total: invoice.products.reduce((sum, product) => sum + (product.quantity * product.price), 0),
        acompte: invoice.payment.depositAmount || 0,
        montant_restant: invoice.products.reduce((sum, product) => sum + (product.quantity * product.price), 0) - (invoice.payment.depositAmount || 0),
        nom_client: invoice.client.name,
        email_client: invoice.client.email,
        telephone_client: invoice.client.phone,
        adresse_client: `${invoice.client.address}, ${invoice.client.postalCode} ${invoice.client.city}`,
        mode_paiement: invoice.payment.method || 'Non précisé',
        signature: invoice.signature ? 'Oui' : 'Non',
        conseiller: invoice.advisorName || 'Non précisé',
        lieu_evenement: invoice.eventLocation || 'Non précisé',
        nombre_produits: invoice.products.length,
        produits: invoice.products.map(p => `${p.quantity}x ${p.name}`).join(', '),
        dossier_id: '1hZsPW8TeZ6s3AlLesb1oLQNbI3aJY3p-'
      };

      // 📤 ENVOYER VERS N8N WEBHOOK AVEC PDF - URL CORRIGÉE
      const response = await fetch('https://n8n.srv765811.hstgr.cloud/webhook/e7ca38d2-4b2a-4216-9c26-23663529790a', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(webhookData)
      });

      if (response.ok) {
        showToast('✅ Facture envoyée avec succès ! Email avec PDF en cours d\'envoi...', 'success');
      } else {
        throw new Error('Erreur lors de l\'envoi vers N8N');
      }
      
    } catch (error: any) {
      console.error('❌ Erreur upload Google Drive:', error);
      showToast(`❌ Erreur d'envoi: ${error.message || 'Erreur inconnue'}`, 'error');
    }
  };
  // 🆕 FONCTION NOUVELLE FACTURE - REMISE À ZÉRO COMPLÈTE
  const handleNewInvoice = () => {
    if (window.confirm('Êtes-vous sûr de vouloir créer une nouvelle facture?\n\nToutes les données actuelles seront perdues et remises à zéro.')) {
      // Générer un nouveau numéro de facture
      const newInvoiceNumber = generateInvoiceNumber();
      
      // Remettre à zéro TOUTES les données
      setInvoice({
        invoiceNumber: newInvoiceNumber,
        invoiceDate: new Date().toISOString().split('T')[0], // Date du jour
        eventLocation: '',
        advisorName: '',
        invoiceNotes: '',
        termsAccepted: false,
        taxRate: 20,
        client: {
          name: '',
          address: '',
          postalCode: '',
          city: '',
          phone: '',
          email: '',
          housingType: '',
          doorCode: ''
        },
        delivery: {
          method: '',
          notes: ''
        },
        payment: {
          method: '',
          depositAmount: 0
        },
        products: [],
        signature: ''
      });
      
      // Effacer le brouillon
      localStorage.removeItem('myconfortInvoiceDraft');
      
      showToast(`✅ Nouvelle facture créée : ${newInvoiceNumber}`, 'success');
    }
  };

  const scrollToSection = (sectionId: string) => {
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  // 🔒 VALIDATION COMPLÈTE POUR BOUTON PDF
  const handleValidateAndPDF = () => {
    const validation = validateMandatoryFields();
    if (!validation.isValid) {
      showToast(`Champs obligatoires manquants: ${validation.errors.join(', ')}`, 'error');
      return;
    }
    handleShowPDFPreview();
  };

  // 🔒 VÉRIFICATION DES CHAMPS OBLIGATOIRES POUR L'AFFICHAGE
  const validation = validateMandatoryFields();

  return (
    <div className="min-h-screen font-['Inter'] text-gray-100" style={{ backgroundColor: '#14281D' }}>
      {/* 🔍 Indicateur de debug en développement */}
      {process.env.NODE_ENV === 'development' && (
        <div style={{
          position: 'fixed',
          top: 0,
          right: 0,
          background: '#477A0C',
          color: 'white',
          padding: '5px 10px',
          fontSize: '12px',
          zIndex: 9999,
          borderRadius: '0 0 0 8px'
        }}>
          ✅ MYCONFORT LOADED
        </div>
      )}
      
      <Header
        onGeneratePDF={handleValidateAndPDF}
        onShowClients={() => setShowClientsList(true)}
        onShowInvoices={() => setShowInvoicesList(true)}
        onShowProducts={() => setShowProductsList(true)}
        onShowGoogleDrive={handleUploadToGoogleDrive}
      />

      <main className="container mx-auto px-4 py-6" id="invoice-content">
        {/* En-tête MYCONFORT avec dégradé basé sur #477A0C */}
        <div 
          className="text-white rounded-xl shadow-xl p-6 mb-6"
          style={{
            background: 'linear-gradient(135deg, #477A0C 0%, #5A8F0F 25%, #3A6A0A 50%, #6BA015 75%, #477A0C 100%)'
          }}
        >
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <div className="bg-white/20 p-3 rounded-full">
                <span className="text-2xl">🌸</span>
              </div>
              <div>
                <h1 className="text-3xl font-bold">MYCONFORT</h1>
                <p className="text-green-100">Facturation professionnelle avec signature électronique</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-sm text-blue-100">Statut de la facture</div>
              <div className="flex items-center space-x-2 mt-1">
                {validation.isValid ? (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>✅</span>
                    <span>COMPLÈTE</span>
                  </div>
                ) : (
                  <div className="bg-red-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>⚠️</span>
                    <span>INCOMPLÈTE</span>
                  </div>
                )}
                {invoice.signature && (
                  <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
                    <span>🔒</span>
                    <span>SIGNÉE</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>

        <InvoiceHeader
          invoice={invoice}
          onUpdate={(updates) => setInvoice(prev => ({ ...prev, ...updates }))}
        />

        <div id="client-section">
          <ClientSection
            client={invoice.client}
            onUpdate={(client) => setInvoice(prev => ({ ...prev, client }))}
          />
        </div>

        <div id="products-section">
          <ProductSection
            products={invoice.products}
            onUpdate={(products) => setInvoice(prev => ({ ...prev, products }))}
            taxRate={invoice.taxRate}
            invoiceNotes={invoice.invoiceNotes}
            onNotesChange={(invoiceNotes) => setInvoice(prev => ({ ...prev, invoiceNotes }))}
            acompteAmount={invoice.payment.depositAmount}
            onAcompteChange={(amount) => setInvoice(prev => ({ 
              ...prev, 
              payment: { ...prev.payment, depositAmount: amount }
            }))}
            paymentMethod={invoice.payment.method}
            onPaymentMethodChange={(method) => setInvoice(prev => ({
              ...prev,
              payment: { ...prev.payment, method }
            }))}
            advisorName={invoice.advisorName}
            onAdvisorNameChange={(name) => setInvoice(prev => ({ ...prev, advisorName: name }))}
            termsAccepted={invoice.termsAccepted}
            onTermsAcceptedChange={(accepted) => setInvoice(prev => ({ ...prev, termsAccepted: accepted }))}
            signature={invoice.signature}
            onShowSignaturePad={() => setShowSignaturePad(true)}
          />
        </div>

        {/* Delivery Section - UNIFORMISÉ */}
        <div id="delivery-section" className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
            <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
              INFORMATIONS LOGISTIQUES
            </span>
          </h2>
          
          <div className="bg-[#F2EFE2] rounded-lg p-6 mt-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-black mb-1 font-bold">
                  Mode de livraison
                </label>
                <select
                  value={invoice.delivery.method}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, method: e.target.value }
                  }))}
                  className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold"
                >
                  <option value="">Sélectionner</option>
                  <option value="Colissimo 48 heures">Colissimo 48 heures</option>
                  <option value="Livraison par transporteur">Livraison par transporteur</option>
                  <option value="Retrait en magasin">Retrait en magasin</option>
                </select>
              </div>
              
              <div>
                <label className="block text-black mb-1 font-bold">
                  Précisions de livraison
                </label>
                <textarea
                  value={invoice.delivery.notes}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    delivery: { ...prev.delivery, notes: e.target.value }
                  }))}
                  className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold h-20"
                  placeholder="Instructions spéciales, étage, code d'accès..."
                />
              </div>
            </div>
            
            <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-black italic font-semibold">
              <p>📦 Livraison estimée sous 48 heures. Les délais sont donnés à titre indicatif et ne sont pas contractuels.</p>
            </div>
          </div>
        </div>

        {/* PDF Generation Section */}
        <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
          <EmailSender
            invoice={invoice}
            onSuccess={handleEmailJSSuccess}
            onError={handleEmailJSError}
            onShowConfig={() => setShowGoogleDriveConfig(true)}
          />
        </div>

        {/* Aperçu de la facture - UNIFORMISÉ SANS BOUTON TÉLÉCHARGER PDF */}
        {showInvoicePreview && (
          <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-bold text-[#F2EFE2] flex items-center justify-center">
                <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
                  APERÇU DE LA FACTURE
                </span>
              </h2>
              <button
                onClick={() => setShowInvoicePreview(!showInvoicePreview)}
                className="text-[#F2EFE2] hover:text-white underline text-sm font-semibold"
              >
                {showInvoicePreview ? 'Masquer' : 'Afficher'} l'aperçu
              </button>
            </div>
            
            <div className="bg-[#F2EFE2] rounded-lg p-4">
              <div className="border border-gray-300 rounded-lg overflow-hidden">
                <InvoicePDF invoice={invoice} isPreview={true} />
              </div>
              
              <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded-lg text-sm text-blue-700">
                <p className="font-semibold">🎯 Aperçu de votre facture MYCONFORT</p>
                <p>Cet aperçu sera converti en PDF lorsque vous cliquerez sur le bouton "Générer et télécharger le PDF".</p>
              </div>
            </div>
          </div>
        )}

        {/* Action Buttons - UNIFORMISÉ AVEC NOUVELLE FACTURE CLIQUABLE */}
        <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
          <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
            <span className="bg-[#F2EFE2] text-[#477A0C] px-6 py-3 rounded-full font-bold">
              ACTIONS PRINCIPALES
            </span>
          </h2>
          
          <div className="bg-[#F2EFE2] rounded-lg p-6">
            <div className="flex flex-col md:flex-row justify-between items-center space-y-4 md:space-y-0">
              <div>
                <label className="block text-black mb-1 font-bold">Email du destinataire</label>
                <input
                  value={invoice.client.email}
                  onChange={(e) => setInvoice(prev => ({
                    ...prev,
                    client: { ...prev.client, email: e.target.value }
                  }))}
                  type="email"
                  className="w-full md:w-64 border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-bold"
                  placeholder="client@email.com"
                />
              </div>
              <div className="flex gap-3 justify-center">
                <button
                  onClick={handleSaveAndSendInvoice}
                  disabled={!validation.isValid}
                  className={`px-6 py-3 rounded-xl flex items-center space-x-3 font-bold shadow-lg transform transition-all duration-300 hover:scale-110 disabled:hover:scale-100 hover:shadow-2xl hover:rotate-1 ${
                    validation.isValid
                      ? 'bg-gradient-to-r from-orange-500 to-orange-600 hover:from-orange-600 hover:to-orange-700 text-white animate-pulse hover:animate-none' 
                      : 'bg-gray-400 text-gray-600 cursor-not-allowed'
                  }`}
                  title={validation.isValid 
                    ? "Enregistrer la facture puis utiliser le bouton Drive pour l'envoyer" 
                    : "Complétez tous les champs obligatoires pour enregistrer"}
                >
                  <span className="text-xl animate-bounce">💾</span>
                  <span>ENREGISTRER</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>

      <ClientListModal
        isOpen={showClientsList}
        onClose={() => setShowClientsList(false)}
        clients={clients}
        onLoadClient={handleLoadClient}
        onDeleteClient={handleDeleteClient}
      />

      <InvoicesListModal
        isOpen={showInvoicesList}
        onClose={() => setShowInvoicesList(false)}
        invoices={invoices}
        onLoadInvoice={handleLoadInvoice}
        onDeleteInvoice={handleDeleteInvoice}
      />

      <ProductsListModal
        isOpen={showProductsList}
        onClose={() => setShowProductsList(false)}
      />

      <PDFPreviewModal
        isOpen={showPDFPreview}
        onClose={() => setShowPDFPreview(false)}
        invoice={invoice}
        onDownload={handleGeneratePDF}
      />

      <EmailJSConfigModal
        isOpen={showEmailJSConfig}
        onClose={() => setShowEmailJSConfig(false)}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      />

      <GoogleDriveModal
        isOpen={showGoogleDriveConfig}
        onClose={() => setShowGoogleDriveConfig(false)}
        onSuccess={handleEmailJSSuccess}
        onError={handleEmailJSError}
      />

      <SignaturePad
        isOpen={showSignaturePad}
        onClose={() => setShowSignaturePad(false)}
        onSave={handleSaveSignature}
      />

      <Toast
        message={toast.message}
        type={toast.type}
        show={toast.show}
        onClose={hideToast}
      />
    </div>
  );
}

export default App;