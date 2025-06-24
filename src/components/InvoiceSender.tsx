import React, { useState } from 'react';
import { Zap, Loader, CheckCircle, AlertCircle, Mail, FileText, Shield, Send } from 'lucide-react';
import jsPDF from 'jspdf';
import autoTable from 'jspdf-autotable';
import emailjs from '@emailjs/browser';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

interface InvoiceSenderProps {
  invoice: Invoice;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const InvoiceSender: React.FC<InvoiceSenderProps> = ({
  invoice,
  onSuccess,
  onError
}) => {
  const [loading, setLoading] = useState(false);
  const [step, setStep] = useState<string>('');

  // Configuration EmailJS
  const EMAILJS_SERVICE_ID = 'service_ocsxnme';
  const EMAILJS_TEMPLATE_ID = 'template_yng4k8s';
  const EMAILJS_PUBLIC_KEY = 'hvgYUCG9j2lURrt5k';

  // Calculer le total de la facture
  const totalTTC = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
  }, 0);

  // Validation des données
  const isValid = () => {
    return (
      invoice.client.name &&
      invoice.client.email &&
      invoice.products.length > 0 &&
      totalTTC > 0
    );
  };

  // Génération du PDF avec jsPDF
  const generatePDF = async (): Promise<jsPDF> => {
    setStep('Génération du PDF professionnel...');
    
    const doc = new jsPDF();

    // En-tête avec logo FactuSign Pro
    doc.setFillColor(71, 122, 12); // Couleur MYCONFORT
    doc.circle(25, 20, 8, 'F');
    
    doc.setTextColor(242, 239, 226);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('🌸', 22, 23);
    
    // Titre entreprise
    doc.setTextColor(71, 122, 12);
    doc.setFontSize(18);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT', 40, 20);
    
    // Sous-titre FactuSign Pro
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'italic');
    doc.text('FactuSign Pro - Factures intelligentes, signées et envoyées automatiquement', 40, 27);

    // Informations entreprise
    doc.setTextColor(20, 40, 29);
    doc.setFontSize(9);
    doc.setFont('helvetica', 'normal');
    doc.text('88 Avenue des Ternes', 15, 40);
    doc.text('75017 Paris, France', 15, 46);
    doc.text('SIRET: 824 313 530 00027', 15, 52);
    doc.text('Tél: 04 68 50 41 45', 15, 58);
    doc.text('Email: myconfort@gmail.com', 15, 64);

    // Titre FACTURE
    doc.setFillColor(71, 122, 12);
    doc.roundedRect(140, 15, 55, 15, 3, 3, 'F');
    doc.setTextColor(242, 239, 226);
    doc.setFontSize(16);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURE', 155, 26);

    // Informations facture
    doc.setTextColor(20, 40, 29);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    doc.text('N° Facture:', 140, 40);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.invoiceNumber, 170, 40);
    
    doc.setFont('helvetica', 'normal');
    doc.text('Date:', 140, 47);
    doc.setFont('helvetica', 'bold');
    doc.text(new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'), 170, 47);

    // Statut signé si signature présente
    if (invoice.signature) {
      doc.setFillColor(5, 150, 105);
      doc.roundedRect(140, 55, 55, 8, 2, 2, 'F');
      doc.setTextColor(242, 239, 226);
      doc.setFontSize(8);
      doc.setFont('helvetica', 'bold');
      doc.text('✓ SIGNÉ ÉLECTRONIQUEMENT', 167, 60, { align: 'center' });
    }

    // Section client
    doc.setFillColor(242, 239, 226);
    doc.rect(15, 75, 180, 8, 'F');
    doc.setTextColor(71, 122, 12);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('FACTURER À', 20, 81);

    // Informations client
    doc.setTextColor(20, 40, 29);
    doc.setFontSize(11);
    doc.setFont('helvetica', 'bold');
    doc.text(invoice.client.name, 20, 92);
    
    doc.setFont('helvetica', 'normal');
    doc.setFontSize(10);
    doc.text(invoice.client.address, 20, 99);
    doc.text(`${invoice.client.postalCode} ${invoice.client.city}`, 20, 106);
    doc.text(`Tél: ${invoice.client.phone}`, 20, 113);
    doc.text(`Email: ${invoice.client.email}`, 20, 120);

    // Tableau des produits
    const tableData = invoice.products.map(product => [
      product.name + (product.category ? `\n(${product.category})` : ''),
      product.quantity.toString(),
      formatCurrency(product.priceTTC / (1 + (invoice.taxRate / 100))), // Prix HT
      formatCurrency(product.priceTTC),
      product.discount > 0 ? 
        (product.discountType === 'percent' ? `${product.discount}%` : formatCurrency(product.discount)) : 
        '-',
      formatCurrency(calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType
      ))
    ]);

    autoTable(doc, {
      startY: 130,
      head: [['DÉSIGNATION', 'QTÉ', 'PU HT', 'PU TTC', 'REMISE', 'TOTAL TTC']],
      body: tableData,
      theme: 'grid',
      headStyles: {
        fillColor: [71, 122, 12],
        textColor: [242, 239, 226],
        fontSize: 10,
        fontStyle: 'bold',
        halign: 'center'
      },
      bodyStyles: {
        fontSize: 9,
        cellPadding: 3
      },
      columnStyles: {
        0: { cellWidth: 60, halign: 'left' },
        1: { cellWidth: 20, halign: 'center' },
        2: { cellWidth: 25, halign: 'right' },
        3: { cellWidth: 25, halign: 'right' },
        4: { cellWidth: 25, halign: 'center' },
        5: { cellWidth: 30, halign: 'right', fontStyle: 'bold' }
      },
      alternateRowStyles: {
        fillColor: [248, 250, 252]
      }
    });

    // Totaux
    const finalY = (doc as any).lastAutoTable.finalY + 10;
    const totalHT = totalTTC / (1 + (invoice.taxRate / 100));
    const totalTVA = totalTTC - totalHT;

    doc.setDrawColor(100, 116, 139);
    doc.roundedRect(130, finalY, 65, 35, 3, 3);
    
    doc.setTextColor(20, 40, 29);
    doc.setFontSize(10);
    doc.setFont('helvetica', 'normal');
    
    let yPos = finalY + 8;
    doc.text('Total HT:', 135, yPos);
    doc.text(formatCurrency(totalHT), 185, yPos, { align: 'right' });
    yPos += 7;
    
    doc.text(`TVA (${invoice.taxRate}%):`, 135, yPos);
    doc.text(formatCurrency(totalTVA), 185, yPos, { align: 'right' });
    yPos += 7;
    
    doc.setDrawColor(71, 122, 12);
    doc.line(135, yPos, 190, yPos);
    yPos += 5;
    
    doc.setFont('helvetica', 'bold');
    doc.setFontSize(12);
    doc.setTextColor(71, 122, 12);
    doc.text('TOTAL TTC:', 135, yPos);
    doc.text(formatCurrency(totalTTC), 185, yPos, { align: 'right' });

    // Signature si présente
    if (invoice.signature) {
      try {
        const signatureX = 130;
        const signatureY = finalY + 45;
        
        doc.setDrawColor(100, 116, 139);
        doc.roundedRect(signatureX, signatureY, 60, 25, 2, 2);
        
        doc.setTextColor(71, 122, 12);
        doc.setFontSize(9);
        doc.setFont('helvetica', 'bold');
        doc.text('SIGNATURE CLIENT', signatureX + 30, signatureY + 6, { align: 'center' });
        
        // Ajouter l'image de signature
        doc.addImage(
          invoice.signature,
          'PNG',
          signatureX + 5,
          signatureY + 8,
          50,
          15,
          undefined,
          'FAST'
        );
        
        doc.setTextColor(100, 116, 139);
        doc.setFontSize(7);
        doc.setFont('helvetica', 'normal');
        const signatureDate = new Date().toLocaleDateString('fr-FR');
        doc.text(`Signé le ${signatureDate}`, signatureX + 30, signatureY + 23, { align: 'center' });
      } catch (error) {
        console.warn('Erreur ajout signature, utilisation fallback:', error);
        doc.setTextColor(5, 150, 105);
        doc.setFontSize(10);
        doc.setFont('helvetica', 'bold');
        doc.text('✓ DOCUMENT SIGNÉ ÉLECTRONIQUEMENT', 160, finalY + 55, { align: 'center' });
      }
    }

    // Pied de page
    const pageHeight = doc.internal.pageSize.height;
    doc.setDrawColor(71, 122, 12);
    doc.line(15, pageHeight - 25, 195, pageHeight - 25);
    
    doc.setTextColor(71, 122, 12);
    doc.setFontSize(12);
    doc.setFont('helvetica', 'bold');
    doc.text('MYCONFORT - FactuSign Pro', 105, pageHeight - 18, { align: 'center' });
    
    doc.setTextColor(100, 116, 139);
    doc.setFontSize(8);
    doc.setFont('helvetica', 'normal');
    doc.text('Merci de votre confiance !', 105, pageHeight - 12, { align: 'center' });
    doc.text('TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530', 105, pageHeight - 8, { align: 'center' });

    return doc;
  };

  // Envoi par email avec EmailJS
  const sendEmail = async () => {
    if (!isValid()) {
      onError('Veuillez remplir toutes les informations requises (client, email, produits)');
      return;
    }

    setLoading(true);

    try {
      // Étape 1: Génération du PDF
      const pdf = await generatePDF();
      
      // Étape 2: Conversion en blob et base64
      setStep('Préparation de la pièce jointe...');
      const blob = pdf.output('blob');
      const sizeKB = Math.round(blob.size / 1024);

      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64 = (reader.result as string).split(',')[1];

        try {
          // Étape 3: Envoi avec EmailJS
          setStep('Envoi sécurisé par email...');
          
          await emailjs.send(
            EMAILJS_SERVICE_ID,
            EMAILJS_TEMPLATE_ID,
            {
              to_email: invoice.client.email,
              to_name: invoice.client.name,
              from_name: invoice.advisorName || 'MYCONFORT',
              invoice_number: invoice.invoiceNumber,
              invoice_date: new Date(invoice.invoiceDate).toLocaleDateString('fr-FR'),
              total_amount: formatCurrency(totalTTC),
              custom_message: `Bonjour ${invoice.client.name},\n\nVeuillez trouver ci-joint votre facture n°${invoice.invoiceNumber} générée avec FactuSign Pro.\n\n${invoice.signature ? '✓ Cette facture a été signée électroniquement et est juridiquement valide.\n\n' : ''}Cordialement,\n${invoice.advisorName || 'L\'équipe MYCONFORT'}\n\n---\nFactuSign Pro - Factures intelligentes, signées et envoyées automatiquement`,
              invoice_pdf: base64,
              pdf_filename: `facture_${invoice.invoiceNumber}.pdf`,
              pdf_size: sizeKB,
              company_name: 'MYCONFORT',
              company_address: '88 Avenue des Ternes, 75017 Paris',
              company_phone: '04 68 50 41 45',
              company_email: 'myconfort@gmail.com',
              app_name: 'FactuSign Pro'
            },
            EMAILJS_PUBLIC_KEY
          );

          setStep('Envoi réussi !');
          onSuccess(`✅ Facture FactuSign Pro envoyée avec succès ! PDF ${invoice.signature ? 'signé électroniquement' : 'professionnel'} (${sizeKB} KB) livré par email sécurisé à ${invoice.client.email}`);
        } catch (err) {
          console.error('Erreur EmailJS:', err);
          onError('❌ Erreur lors de l\'envoi de l\'email. Vérifiez votre configuration EmailJS.');
        }
      };

      reader.readAsDataURL(blob);
    } catch (error) {
      console.error('Erreur génération PDF:', error);
      onError('❌ Erreur lors de la génération du PDF.');
    } finally {
      setLoading(false);
      setStep('');
    }
  };

  return (
    <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-xl shadow-xl p-6 mb-6 text-white">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center space-x-4">
          <div className="bg-white/20 p-3 rounded-full">
            <Zap className="w-8 h-8" />
          </div>
          <div>
            <h2 className="text-2xl font-bold">FactuSign Pro</h2>
            <p className="text-green-100">Envoi automatique de facture avec signature électronique</p>
          </div>
        </div>
        
        {/* Statut de la facture */}
        <div className="text-right">
          <div className="text-sm text-blue-100 mb-1">Statut</div>
          {invoice.signature ? (
            <div className="bg-green-500 text-white px-3 py-1 rounded-full text-sm font-semibold flex items-center space-x-1">
              <Shield className="w-4 h-4" />
              <span>SIGNÉE</span>
            </div>
          ) : (
            <div className="bg-yellow-500 text-white px-3 py-1 rounded-full text-sm font-semibold">
              PRÊTE À SIGNER
            </div>
          )}
        </div>
      </div>

      {/* Informations de la facture */}
      <div className="bg-white/10 rounded-lg p-4 mb-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
          <div>
            <div className="text-blue-100">Client</div>
            <div className="font-semibold">{invoice.client.name || 'Non renseigné'}</div>
          </div>
          <div>
            <div className="text-blue-100">Email</div>
            <div className="font-semibold">{invoice.client.email || 'Non renseigné'}</div>
          </div>
          <div>
            <div className="text-blue-100">Montant</div>
            <div className="font-semibold">{formatCurrency(totalTTC)}</div>
          </div>
          <div>
            <div className="text-blue-100">Produits</div>
            <div className="font-semibold">{invoice.products.length} article{invoice.products.length > 1 ? 's' : ''}</div>
          </div>
        </div>
      </div>

      {/* Indicateurs de fonctionnalités */}
      <div className="grid grid-cols-3 gap-4 mb-6">
        <div className="text-center">
          <FileText className="w-8 h-8 mx-auto mb-2 text-blue-200" />
          <div className="text-sm font-semibold">PDF Professionnel</div>
          <div className="text-xs text-blue-100">Génération automatique</div>
        </div>
        <div className="text-center">
          <Shield className="w-8 h-8 mx-auto mb-2 text-green-200" />
          <div className="text-sm font-semibold">Signature Électronique</div>
          <div className="text-xs text-green-100">{invoice.signature ? 'Intégrée' : 'Optionnelle'}</div>
        </div>
        <div className="text-center">
          <Send className="w-8 h-8 mx-auto mb-2 text-purple-200" />
          <div className="text-sm font-semibold">Envoi Automatique</div>
          <div className="text-xs text-purple-100">Email sécurisé</div>
        </div>
      </div>

      {/* Validation et erreurs */}
      {!isValid() && (
        <div className="bg-red-500/20 border border-red-400 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-2">
            <AlertCircle className="w-5 h-5 text-red-300" />
            <div className="text-sm">
              <div className="font-semibold">Informations manquantes :</div>
              <ul className="list-disc list-inside mt-1 text-xs">
                {!invoice.client.name && <li>Nom du client</li>}
                {!invoice.client.email && <li>Email du client</li>}
                {invoice.products.length === 0 && <li>Au moins un produit</li>}
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Indicateur de progression */}
      {loading && step && (
        <div className="bg-blue-500/20 border border-blue-400 rounded-lg p-3 mb-4">
          <div className="flex items-center space-x-3">
            <Loader className="w-5 h-5 animate-spin text-blue-300" />
            <div>
              <div className="font-semibold text-blue-100">FactuSign Pro en action...</div>
              <div className="text-sm text-blue-200">{step}</div>
            </div>
          </div>
        </div>
      )}

      {/* Bouton d'envoi */}
      <div className="flex justify-center">
        <button
          onClick={sendEmail}
          disabled={loading || !isValid()}
          className="bg-white text-green-600 hover:bg-green-50 disabled:bg-gray-300 disabled:text-gray-500 px-8 py-4 rounded-xl font-bold text-lg flex items-center space-x-3 transition-all transform hover:scale-105 disabled:hover:scale-100 shadow-lg"
        >
          {loading ? (
            <>
              <Loader className="w-6 h-6 animate-spin" />
              <span>Envoi en cours...</span>
            </>
          ) : (
            <>
              <Zap className="w-6 h-6" />
              <Mail className="w-5 h-5" />
              {invoice.signature && <Shield className="w-5 h-5" />}
              <span>Envoyer avec FactuSign Pro</span>
            </>
          )}
        </button>
      </div>

      {/* Instructions */}
      <div className="mt-4 text-center text-sm text-blue-100">
        <p>
          {isValid() 
            ? `Prêt à envoyer la facture ${invoice.signature ? 'signée électroniquement' : 'professionnelle'} à ${invoice.client.email}`
            : 'Complétez les informations ci-dessus pour activer l\'envoi automatique'
          }
        </p>
      </div>
    </div>
  );
};