import html2pdf from 'html2pdf.js';
import emailjs from 'emailjs-com';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

// Configuration EmailJS
const EMAILJS_CONFIG = {
  SERVICE_ID: 'service_ocsxnme',
  TEMPLATE_ID: 'template_yng4k8s',
  USER_ID: 'hvgYUCG9j2lURrt5k',
  PRIVATE_KEY: 'mh3upHQbKrIViyw4T9-S6'
};

export class SeparatePdfEmailService {
  /**
   * Initialise EmailJS
   */
  static initializeEmailJS(): void {
    try {
      emailjs.init(EMAILJS_CONFIG.USER_ID);
      console.log('✅ EmailJS initialisé pour envoi séparé');
    } catch (error) {
      console.error('❌ Erreur initialisation EmailJS:', error);
    }
  }

  /**
   * 📄 GÉNÈRE LE PDF EN LOCAL avec html2pdf.js (votre script exact)
   */
  static async generateInvoicePDFLocal(invoice: Invoice): Promise<void> {
    console.log('📄 GÉNÉRATION PDF LOCAL avec votre script exact');
    
    // Chercher l'élément .facture-apercu en priorité
    let element = document.querySelector('.facture-apercu') as HTMLElement;
    
    if (!element) {
      // Fallback vers d'autres éléments
      element = document.getElementById('pdf-preview-content') || 
                document.getElementById('facture-apercu') ||
                document.querySelector('[class*="invoice"]') as HTMLElement;
    }
    
    if (!element) {
      throw new Error('❌ Aucun élément de facture trouvé pour la génération PDF');
    }

    // Attendre que l'élément soit rendu
    await this.waitForElementToRender(element);

    // 📋 CONFIGURATION EXACTE DE VOTRE SCRIPT
    const opt = {
      margin: 0,
      filename: `facture_MYCONFORT_${invoice.invoiceNumber}_avec_CGV.pdf`,
      html2canvas: { 
        scale: 2, 
        useCORS: true,
        letterRendering: true,
        allowTaint: true,
        backgroundColor: '#ffffff',
        logging: false,
        width: element.scrollWidth,
        height: element.scrollHeight,
        scrollX: 0,
        scrollY: 0
      },
      jsPDF: { 
        unit: 'mm', 
        format: 'a4', 
        orientation: 'portrait',
        compress: true
      }
    };

    try {
      console.log('🔄 Génération PDF avec votre script exact...');
      
      // Créer un conteneur temporaire avec facture + CGV
      const tempContainer = await this.createFactureWithCGVContainer(invoice, element);
      
      // Générer le PDF avec votre script
      await html2pdf().set(opt).from(tempContainer).save();
      
      // Nettoyer le conteneur temporaire
      document.body.removeChild(tempContainer);
      
      console.log('✅ PDF généré et téléchargé avec succès (Facture + CGV MYCONFORT)');
      return;
    } catch (error) {
      console.error('❌ Erreur génération PDF avec CGV:', error);
      
      // Fallback: générer seulement la facture
      console.log('🔄 Fallback: génération PDF facture seule...');
      await html2pdf().set(opt).from(element).save();
      console.log('✅ PDF facture généré (sans CGV)');
    }
  }

  /**
   * 📧 ENVOIE L'EMAIL SÉPARÉMENT (sans PDF)
   */
  static async sendEmailSeparately(invoice: Invoice): Promise<boolean> {
    try {
      console.log('📧 ENVOI EMAIL SÉPARÉ (sans PDF dans le payload)');
      
      // Initialiser EmailJS
      this.initializeEmailJS();
      
      // Calculer les montants
      const totalAmount = invoice.products.reduce((sum, product) => {
        return sum + calculateProductTotal(
          product.quantity,
          product.priceTTC,
          product.discount,
          product.discountType
        );
      }, 0);

      const acompteAmount = invoice.payment.depositAmount || 0;
      const montantRestant = totalAmount - acompteAmount;

      // Préparer le message personnalisé
      let message = `Bonjour ${invoice.client.name},\n\n`;
      message += `Votre facture n°${invoice.invoiceNumber} a été générée avec succès.\n\n`;
      message += `📋 DÉTAILS :\n`;
      message += `• Numéro: ${invoice.invoiceNumber}\n`;
      message += `• Date: ${new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}\n`;
      
      if (acompteAmount > 0) {
        message += `• Total TTC: ${formatCurrency(totalAmount)}\n`;
        message += `• Acompte versé: ${formatCurrency(acompteAmount)}\n`;
        message += `• Montant restant: ${formatCurrency(montantRestant)}\n\n`;
      } else {
        message += `• Montant total: ${formatCurrency(totalAmount)}\n\n`;
      }
      
      if (invoice.payment.method) {
        message += `💳 Mode de paiement: ${invoice.payment.method}\n\n`;
      }
      
      if (invoice.signature) {
        message += '✅ Cette facture a été signée électroniquement.\n\n';
      }
      
      message += `📎 Le PDF de votre facture avec les conditions générales de vente a été généré et téléchargé sur votre appareil.\n\n`;
      message += `Pour toute question, contactez-nous :\n`;
      message += `• Téléphone: 04 68 50 41 45\n`;
      message += `• Email: myconfort@gmail.com\n\n`;
      message += `Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}`;

      // Paramètres pour le template (SANS PDF)
      const templateParams = {
        // Destinataire
        to_email: invoice.client.email,
        to_name: invoice.client.name,
        
        // Expéditeur
        from_name: 'MYCONFORT',
        reply_to: 'myconfort@gmail.com',
        
        // Sujet et message
        subject: `Facture MYCONFORT n°${invoice.invoiceNumber}`,
        message: message,
        
        // Informations facture
        invoice_number: invoice.invoiceNumber,
        invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
        total_amount: formatCurrency(totalAmount),
        deposit_amount: acompteAmount > 0 ? formatCurrency(acompteAmount) : '',
        remaining_amount: acompteAmount > 0 ? formatCurrency(montantRestant) : '',
        has_signature: invoice.signature ? 'Oui' : 'Non',
        
        // Informations client
        client_name: invoice.client.name,
        client_email: invoice.client.email,
        client_address: invoice.client.address,
        client_city: invoice.client.city,
        client_postal_code: invoice.client.postalCode,
        client_phone: invoice.client.phone,
        
        // Informations entreprise
        company_name: 'MYCONFORT',
        company_address: '88 Avenue des Ternes, 75017 Paris',
        company_phone: '04 68 50 41 45',
        company_email: 'myconfort@gmail.com',
        company_siret: '824 313 530 00027',
        
        // Conseiller
        advisor_name: invoice.advisorName || 'MYCONFORT',
        
        // Mode de paiement
        payment_method: invoice.payment.method || 'Non spécifié',
        
        // Statut PDF (généré localement)
        has_pdf: 'false', // Pas de PDF dans l'email
        pdf_note: 'PDF généré et téléchargé localement avec les conditions générales de vente MYCONFORT',
        
        // Métadonnées
        generated_date: new Date().toLocaleDateString('fr-FR'),
        generated_time: new Date().toLocaleTimeString('fr-FR'),
        
        // Produits
        products_count: invoice.products.length,
        products_summary: invoice.products.map(p => `${p.quantity}x ${p.name}`).join(', ')
      };

      console.log('📧 Envoi email de notification (sans PDF)...');
      
      const response = await emailjs.send(
        EMAILJS_CONFIG.SERVICE_ID,
        EMAILJS_CONFIG.TEMPLATE_ID,
        templateParams,
        EMAILJS_CONFIG.USER_ID
      );

      console.log('✅ Email de notification envoyé avec succès:', response);
      return true;

    } catch (error: any) {
      console.error('❌ Erreur lors de l\'envoi de l\'email séparé:', error);
      throw new Error(`Erreur d'envoi email: ${error.message}`);
    }
  }

  /**
   * 🚀 MÉTHODE PRINCIPALE : Génère le PDF ET envoie l'email séparément
   */
  static async generatePDFAndSendEmail(invoice: Invoice): Promise<{ pdfGenerated: boolean; emailSent: boolean; message: string }> {
    try {
      console.log('🚀 PROCESSUS SÉPARÉ : PDF LOCAL + EMAIL SANS PAYLOAD');
      
      let pdfGenerated = false;
      let emailSent = false;
      let message = '';

      // Étape 1: Générer le PDF localement
      try {
        console.log('📄 Étape 1: Génération PDF local...');
        await this.generateInvoicePDFLocal(invoice);
        pdfGenerated = true;
        message += '✅ PDF généré et téléchargé avec succès (Facture + CGV MYCONFORT)\n';
      } catch (error) {
        console.error('❌ Erreur génération PDF:', error);
        message += '❌ Erreur lors de la génération du PDF\n';
      }

      // Étape 2: Envoyer l'email de notification
      try {
        console.log('📧 Étape 2: Envoi email de notification...');
        emailSent = await this.sendEmailSeparately(invoice);
        message += '✅ Email de notification envoyé avec succès\n';
      } catch (error) {
        console.error('❌ Erreur envoi email:', error);
        message += '❌ Erreur lors de l\'envoi de l\'email\n';
      }

      // Résultat final
      if (pdfGenerated && emailSent) {
        message += '\n🎉 Processus terminé avec succès !\n';
        message += `📎 PDF téléchargé: facture_MYCONFORT_${invoice.invoiceNumber}_avec_CGV.pdf\n`;
        message += `📧 Email envoyé à: ${invoice.client.email}`;
      } else if (pdfGenerated && !emailSent) {
        message += '\n⚠️ PDF généré mais email non envoyé';
      } else if (!pdfGenerated && emailSent) {
        message += '\n⚠️ Email envoyé mais PDF non généré';
      } else {
        message += '\n❌ Échec complet du processus';
      }

      return {
        pdfGenerated,
        emailSent,
        message
      };

    } catch (error: any) {
      console.error('❌ Erreur processus séparé:', error);
      return {
        pdfGenerated: false,
        emailSent: false,
        message: `❌ Erreur: ${error.message}`
      };
    }
  }

  /**
   * 📋 CRÉER UN CONTENEUR TEMPORAIRE AVEC FACTURE + CGV MYCONFORT
   */
  private static async createFactureWithCGVContainer(invoice: Invoice, factureElement: HTMLElement): Promise<HTMLElement> {
    console.log('📋 Création du conteneur temporaire : PAGE 1 (Facture) + PAGE 2 (CGV MYCONFORT)...');
    
    // Créer un conteneur temporaire
    const tempContainer = document.createElement('div');
    tempContainer.style.position = 'absolute';
    tempContainer.style.left = '-9999px';
    tempContainer.style.top = '0';
    tempContainer.style.width = '210mm';
    tempContainer.style.backgroundColor = 'white';
    tempContainer.style.fontFamily = 'Inter, sans-serif';
    tempContainer.style.fontSize = '12px';
    tempContainer.style.lineHeight = '1.5';
    tempContainer.style.color = 'black';
    
    // PAGE 1: Cloner la facture existante
    console.log('📄 PAGE 1 : Clonage de votre facture (.facture-apercu)...');
    const factureClone = factureElement.cloneNode(true) as HTMLElement;
    factureClone.style.pageBreakAfter = 'always';
    factureClone.style.minHeight = '297mm';
    factureClone.style.backgroundColor = 'white';
    factureClone.style.padding = '10mm';
    tempContainer.appendChild(factureClone);
    
    // PAGE 2: Créer les CGV MYCONFORT
    console.log('📄 PAGE 2 : Création des CGV MYCONFORT...');
    const cgvPage = this.createCGVMyconfortPage(invoice);
    tempContainer.appendChild(cgvPage);
    
    // Ajouter au DOM temporairement
    document.body.appendChild(tempContainer);
    
    // Attendre le rendu
    await new Promise(resolve => setTimeout(resolve, 500));
    
    console.log('✅ Conteneur temporaire créé : 2 pages prêtes');
    return tempContainer;
  }

  /**
   * 📋 CRÉER LA PAGE CGV MYCONFORT (PAGE 2)
   */
  private static createCGVMyconfortPage(invoice: Invoice): HTMLElement {
    console.log('📋 Création de la page CGV MYCONFORT...');
    
    const cgvPage = document.createElement('div');
    cgvPage.style.minHeight = '297mm';
    cgvPage.style.width = '210mm';
    cgvPage.style.padding = '10mm';
    cgvPage.style.backgroundColor = 'white';
    cgvPage.style.pageBreakBefore = 'always';
    cgvPage.style.fontFamily = 'Inter, sans-serif';
    cgvPage.style.fontSize = '9px';
    cgvPage.style.lineHeight = '1.3';
    cgvPage.style.color = 'black';
    cgvPage.style.boxSizing = 'border-box';
    
    cgvPage.innerHTML = `
      <!-- En-tête CGV MYCONFORT -->
      <div style="background: linear-gradient(135deg, #477A0C, #5A8F0F); color: #F2EFE2; padding: 12px; text-align: center; margin-bottom: 15px; border-radius: 6px;">
        <h1 style="font-size: 16px; font-weight: bold; margin: 0;">CONDITIONS GÉNÉRALES DE VENTE</h1>
        <p style="font-size: 11px; margin: 3px 0 0 0;">MYCONFORT - Vente de matelas et literie</p>
      </div>
      
      <!-- Articles CGV MYCONFORT en 2 colonnes -->
      <div style="columns: 2; column-gap: 12px; font-size: 8px; line-height: 1.2;">
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 1 - LIVRAISON</h3>
          <p style="margin: 0; text-align: justify;">Une fois la commande expédiée, vous serez contacté par SMS ou mail pour programmer la livraison en fonction de vos disponibilités (à la journée ou demi-journée). Le transporteur livre le produit au pas de porte ou en bas de l'immeuble. Veuillez vérifier que les dimensions du produit permettent son passage dans les escaliers, couloirs et portes. Aucun service d'installation ou de reprise de l'ancienne literie n'est prévu.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 2 - DÉLAIS DE LIVRAISON</h3>
          <p style="margin: 0; text-align: justify;">Les délais de livraison sont donnés à titre indicatif et ne constituent pas un engagement ferme. En cas de retard, aucune indemnité ou annulation ne sera acceptée, notamment en cas de force majeure. Nous déclinons toute responsabilité en cas de délai dépassé.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 3 - RISQUES DE TRANSPORT</h3>
          <p style="margin: 0; text-align: justify;">Les marchandises voyagent aux risques du destinataire. En cas d'avarie ou de perte, il appartient au client de faire les réserves nécessaires obligatoires sur le bordereau du transporteur.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 4 - ACCEPTATION DES CONDITIONS</h3>
          <p style="margin: 0; text-align: justify;">Toute livraison implique l'acceptation des présentes conditions. Le transporteur livre à l'adresse indiquée sans monter les étages. Le client est responsable de vérifier et d'accepter les marchandises lors de la livraison.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 5 - RÉCLAMATIONS</h3>
          <p style="margin: 0; text-align: justify;">Les réclamations concernant la qualité des marchandises doivent être formulées par écrit dans les huit jours suivant la livraison, par lettre recommandée avec accusé de réception.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 6 - RETOURS</h3>
          <p style="margin: 0; text-align: justify;">Aucun retour de marchandises ne sera accepté sans notre accord écrit préalable.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 7 - TAILLES DES MATELAS</h3>
          <p style="margin: 0; text-align: justify;">Les dimensions des matelas peuvent varier de +/- 5 cm en raison de la thermosensibilité des mousses viscoélastiques. Les tailles standards sont données à titre indicatif.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 8 - ODEUR DES MATÉRIAUX</h3>
          <p style="margin: 0; text-align: justify;">Les mousses viscoélastiques naturelles (à base d'huile de ricin) et les matériaux de conditionnement peuvent émettre une légère odeur après déballage.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 9 - RÈGLEMENTS ET REMISES</h3>
          <p style="margin: 0; text-align: justify;">Sauf accord express, aucun rabais ou escompte ne sera appliqué pour paiement comptant.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 10 - PAIEMENT</h3>
          <p style="margin: 0; text-align: justify;">Les factures sont payables par chèque, virement, carte bancaire ou espèce à réception.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 11 - PÉNALITÉS DE RETARD</h3>
          <p style="margin: 0; text-align: justify;">En cas de non-paiement, une majoration de 10% avec un minimum de 300 € sera appliquée.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 12 - EXIGIBILITÉ EN CAS DE NON-PAIEMENT</h3>
          <p style="margin: 0; text-align: justify;">Le non-paiement d'une échéance rend immédiatement exigible le solde de toutes les échéances à venir.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 13 - LIVRAISON INCOMPLÈTE OU NON-CONFORME</h3>
          <p style="margin: 0; text-align: justify;">En cas de livraison endommagée ou non conforme, mentionnez-le sur le bon de livraison. Contactez-nous sous 72h ouvrables si constatée après le départ du transporteur.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 14 - LITIGES</h3>
          <p style="margin: 0; text-align: justify;">Tout litige sera de la compétence exclusive du Tribunal de Commerce de Perpignan ou du tribunal compétent du prestataire.</p>
        </div>
        
        <div style="margin-bottom: 8px; break-inside: avoid;">
          <h3 style="color: #477A0C; font-weight: bold; font-size: 9px; margin: 0 0 3px 0;">ART. 15 - HORAIRES DE LIVRAISON</h3>
          <p style="margin: 0; text-align: justify;">Les livraisons sont effectuées du lundi au vendredi. Une personne majeure doit être présente. Toute modification d'adresse doit être signalée immédiatement à myconfort66@gmail.com.</p>
        </div>
        
      </div>
      
      <!-- Informations légales MYCONFORT -->
      <div style="background: #f8f9fa; padding: 10px; margin-top: 15px; border-radius: 6px; border: 1px solid #dee2e6;">
        <h3 style="color: #477A0C; font-weight: bold; font-size: 10px; margin: 0 0 6px 0;">INFORMATIONS LÉGALES MYCONFORT</h3>
        <div style="font-size: 8px; line-height: 1.3;">
          <p style="margin: 0 0 2px 0;"><strong>MYCONFORT</strong> - SARL au capital de 10 000 €</p>
          <p style="margin: 0 0 2px 0;">SIRET : 824 313 530 00027 - RCS Paris</p>
          <p style="margin: 0 0 2px 0;">Siège social : 88 Avenue des Ternes, 75017 Paris</p>
          <p style="margin: 0 0 2px 0;">Téléphone : 04 68 50 41 45 - Email : myconfort@gmail.com</p>
          <p style="margin: 0;">Email support : myconfort66@gmail.com</p>
        </div>
      </div>
      
      <!-- Pied de page CGV -->
      <div style="background: linear-gradient(135deg, #477A0C, #5A8F0F); color: #F2EFE2; padding: 10px; text-align: center; margin-top: 15px; border-radius: 6px;">
        <p style="font-weight: bold; font-size: 10px; margin: 0 0 3px 0;">🌸 MYCONFORT - Conditions Générales de Vente</p>
        <p style="font-size: 8px; margin: 0;">Version en vigueur au ${new Date().toLocaleDateString('fr-FR')}</p>
      </div>
    `;
    
    console.log('✅ Page CGV MYCONFORT créée');
    return cgvPage;
  }

  /**
   * 🕐 ATTENDRE QUE L'ÉLÉMENT SOIT COMPLÈTEMENT RENDU
   */
  private static async waitForElementToRender(element: HTMLElement): Promise<void> {
    return new Promise((resolve) => {
      const images = element.querySelectorAll('img');
      let loadedImages = 0;
      
      if (images.length === 0) {
        setTimeout(resolve, 100);
        return;
      }
      
      const checkAllImagesLoaded = () => {
        loadedImages++;
        if (loadedImages >= images.length) {
          setTimeout(resolve, 200);
        }
      };
      
      images.forEach((img) => {
        if (img.complete) {
          checkAllImagesLoaded();
        } else {
          img.onload = checkAllImagesLoaded;
          img.onerror = checkAllImagesLoaded;
        }
      });
      
      setTimeout(resolve, 2000);
    });
  }

  /**
   * 🧪 TEST DE LA MÉTHODE SÉPARÉE
   */
  static async testSeparateMethod(invoice: Invoice): Promise<void> {
    console.log('🧪 TEST DE LA MÉTHODE SÉPARÉE : PDF LOCAL + EMAIL SANS PAYLOAD');
    
    try {
      const result = await this.generatePDFAndSendEmail(invoice);
      
      let alertMessage = '🧪 TEST DE LA MÉTHODE SÉPARÉE TERMINÉ\n\n';
      alertMessage += result.message;
      
      if (result.pdfGenerated && result.emailSent) {
        alertMessage += '\n\n✅ Test réussi ! Méthode séparée fonctionnelle.';
      } else {
        alertMessage += '\n\n⚠️ Test partiellement réussi. Vérifiez les détails ci-dessus.';
      }
      
      alert(alertMessage);
      
    } catch (error) {
      console.error('❌ Erreur test méthode séparée:', error);
      alert('❌ Erreur lors du test de la méthode séparée. Vérifiez la console pour plus de détails.');
    }
  }
}