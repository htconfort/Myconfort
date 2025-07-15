import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, calculateHT, calculateProductTotal } from '../utils/calculations';
import { TermsAndConditions } from './TermsAndConditions';

interface InvoicePDFProps {
  invoice: Invoice;
  isPreview?: boolean;
}

export const InvoicePDF: React.FC<InvoicePDFProps> = ({ invoice, isPreview = false }) => {
  const totals = React.useMemo(() => {
    const subtotal = invoice.products.reduce((sum, product) => {
      return sum + (product.quantity * calculateHT(product.priceTTC, invoice.taxRate));
    }, 0);

    const totalWithTax = invoice.products.reduce((sum, product) => {
      return sum + calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType
      );
    }, 0);

    const totalDiscount = invoice.products.reduce((sum, product) => {
      const originalTotal = product.priceTTC * product.quantity;
      const discountedTotal = calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType
      );
      return sum + (originalTotal - discountedTotal);
    }, 0);

    return {
      subtotal,
      totalWithTax,
      totalDiscount,
      taxAmount: totalWithTax - (totalWithTax / (1 + (invoice.taxRate / 100)))
    };
  }, [invoice.products, invoice.taxRate]);

  const containerClass = isPreview 
    ? "max-w-4xl mx-auto bg-white shadow-2xl" 
    : "w-full bg-white";

  return (
    <div className={containerClass} style={{ fontFamily: 'Inter, sans-serif', color: '#080F0F' }}>
      {/* Bordure supérieure verte */}
      <div className="h-1 bg-[#477A0C]"></div>
      
      {/* En-tête de la facture */}
      <div className="p-8 border-b-4 border-[#477A0C]">
        <div className="flex justify-between items-start">
          {/* Logo et informations entreprise */}
          <div className="flex-1">
            <div className="flex items-center mb-6">
              <div className="bg-[#477A0C] rounded-full w-16 h-16 flex items-center justify-center text-[#F2EFE2] text-4xl mr-4">
                🌸
              </div>
              <div>
                <h1 className="text-4xl font-black text-[#477A0C] tracking-tight">
                  MYCONFORT
                </h1>
                <p className="text-lg font-medium" style={{ color: '#080F0F' }}>Facturation Professionnelle</p>
              </div>
            </div>
            
            <div className="text-sm space-y-1" style={{ color: '#080F0F' }}>
              <p className="font-semibold text-lg" style={{ color: '#080F0F' }}>MYCONFORT</p>
              <p className="font-semibold">88 Avenue des Ternes</p>
              <p>75017 Paris, France</p>
              <p>SIRET: 824 313 530 00027</p>
              <p>Tél: 04 68 50 41 45</p>
              <p>Email: myconfort@gmail.com</p>
              <p>Site web: https://www.htconfort.com</p>
            </div>
          </div>

          {/* Informations facture */}
          <div className="text-right">
            <div className="bg-[#477A0C] text-[#F2EFE2] px-8 py-4 rounded-lg mb-6">
              <h2 className="text-2xl font-bold">FACTURE</h2>
            </div>
            
            <div className="space-y-3 text-sm">
              <div className="flex justify-between items-center min-w-[200px]">
                <span className="font-semibold" style={{ color: '#080F0F' }}>N° Facture:</span>
                <span className="font-bold text-xl text-[#477A0C]">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold" style={{ color: '#080F0F' }}>Date:</span>
                <span className="font-semibold" style={{ color: '#080F0F' }}>{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</span>
              </div>
              {invoice.eventLocation && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold" style={{ color: '#080F0F' }}>Lieu:</span>
                  <span className="font-semibold" style={{ color: '#080F0F' }}>{invoice.eventLocation}</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informations client */}
      <div className="p-8 border-b border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-[#477A0C] mb-4 border-b-2 border-[#477A0C] pb-2">
              FACTURER À
            </h3>
            <div className="space-y-2 text-sm">
              <p className="font-bold text-lg" style={{ color: '#080F0F' }}>{invoice.client.name}</p>
              <p style={{ color: '#080F0F' }}>{invoice.client.address}</p>
              <p style={{ color: '#080F0F' }}>{invoice.client.postalCode} {invoice.client.city}</p>
              {invoice.client.siret && <p style={{ color: '#080F0F' }}>SIRET: {invoice.client.siret}</p>}
              <div className="pt-2 space-y-1">
                <p style={{ color: '#080F0F' }}>
                  <span className="font-semibold">Tél:</span> {invoice.client.phone}
                </p>
                <p style={{ color: '#080F0F' }}>
                  <span className="font-semibold">Email:</span> {invoice.client.email}
                </p>
              </div>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#477A0C] mb-4 border-b-2 border-[#477A0C] pb-2">
              INFORMATIONS COMPLÉMENTAIRES
            </h3>
            <div className="space-y-2 text-sm">
              {invoice.client.housingType && (
                <p style={{ color: '#080F0F' }}><span className="font-semibold">Type de logement:</span> {invoice.client.housingType}</p>
              )}
              {invoice.client.doorCode && (
                <p style={{ color: '#080F0F' }}><span className="font-semibold">Code d'accès:</span> {invoice.client.doorCode}</p>
              )}
              {invoice.delivery.method && (
                <p style={{ color: '#080F0F' }}><span className="font-semibold">Livraison:</span> {invoice.delivery.method}</p>
              )}
              {invoice.advisorName && (
                <p style={{ color: '#080F0F' }}><span className="font-semibold">Conseiller:</span> {invoice.advisorName}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="p-8">
        <h3 className="text-lg font-bold text-[#477A0C] mb-6 border-b-2 border-[#477A0C] pb-2">
          DÉTAIL DES PRODUITS
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#477A0C] text-[#F2EFE2]">
                <th className="border border-gray-300 px-4 py-4 text-left font-bold">DÉSIGNATION</th>
                <th className="border border-gray-300 px-3 py-4 text-center font-bold">QTÉ</th>
                <th className="border border-gray-300 px-3 py-4 text-right font-bold">PU HT</th>
                <th className="border border-gray-300 px-3 py-4 text-right font-bold">PU TTC</th>
                <th className="border border-gray-300 px-3 py-4 text-right font-bold">REMISE</th>
                <th className="border border-gray-300 px-3 py-4 text-right font-bold">TOTAL TTC</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products.map((product, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 px-4 py-4">
                    <div className="font-semibold" style={{ color: '#080F0F' }}>{product.name}</div>
                    {product.category && (
                      <div className="text-xs mt-1" style={{ color: '#080F0F' }}>{product.category}</div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-4 text-center font-semibold" style={{ color: '#080F0F' }}>
                    {product.quantity}
                  </td>
                  <td className="border border-gray-300 px-3 py-4 text-right" style={{ color: '#080F0F' }}>
                    {formatCurrency(calculateHT(product.priceTTC, invoice.taxRate))}
                  </td>
                  <td className="border border-gray-300 px-3 py-4 text-right font-semibold" style={{ color: '#080F0F' }}>
                    {formatCurrency(product.priceTTC)}
                  </td>
                  <td className="border border-gray-300 px-3 py-4 text-right">
                    {product.discount > 0 ? (
                      <span className="text-red-600 font-semibold">
                        -{product.discountType === 'percent' 
                          ? `${product.discount}%` 
                          : formatCurrency(product.discount)
                        }
                      </span>
                    ) : (
                      <span style={{ color: '#080F0F' }}>-</span>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-4 text-right font-bold" style={{ color: '#080F0F' }}>
                    {formatCurrency(calculateProductTotal(
                      product.quantity,
                      product.priceTTC,
                      product.discount,
                      product.discountType
                    ))}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        {/* Totaux avec gestion acompte */}
        <div className="mt-8 flex justify-end">
          <div className="w-full max-w-md">
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
              <div className="space-y-3">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold" style={{ color: '#080F0F' }}>Total HT:</span>
                  <span className="font-semibold" style={{ color: '#080F0F' }}>{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold" style={{ color: '#080F0F' }}>TVA ({invoice.taxRate}%):</span>
                  <span className="font-semibold" style={{ color: '#080F0F' }}>{formatCurrency(totals.taxAmount)}</span>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span className="font-semibold">Remise totale:</span>
                    <span className="font-semibold">-{formatCurrency(totals.totalDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-3">
                  <div className="flex justify-between text-xl font-bold">
                    <span style={{ color: '#080F0F' }}>TOTAL TTC:</span>
                    <span className="text-[#477A0C]">{formatCurrency(totals.totalWithTax)}</span>
                  </div>
                </div>
                
                {/* Gestion acompte - EXACTEMENT comme dans l'aperçu */}
                {invoice.payment.method === 'Acompte' && invoice.payment.depositAmount > 0 && (
                  <>
                    <div className="border-t border-gray-300 pt-3">
                      <div className="flex justify-between text-sm">
                        <span className="font-semibold" style={{ color: '#080F0F' }}>Acompte versé:</span>
                        <span className="font-semibold text-blue-600">{formatCurrency(invoice.payment.depositAmount)}</span>
                      </div>
                    </div>
                    <div className="bg-orange-50 border border-orange-200 rounded p-3">
                      <div className="flex justify-between text-lg font-bold text-orange-600">
                        <span>RESTE À PAYER:</span>
                        <span>{formatCurrency(totals.totalWithTax - invoice.payment.depositAmount)}</span>
                      </div>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Signature si présente */}
        {invoice.signature && (
          <div className="mt-8 flex justify-end">
            <div className="border border-gray-300 rounded p-4 w-64">
              <h4 className="text-[#477A0C] font-bold text-sm mb-2 text-center">SIGNATURE CLIENT</h4>
              <div className="h-16 flex items-center justify-center">
                <img src={invoice.signature} alt="Signature" className="max-h-full max-w-full" />
              </div>
              <p className="text-xs text-center mt-2" style={{ color: '#080F0F' }}>
                Signé le {new Date().toLocaleDateString('fr-FR')} à {new Date().toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        )}
      </div>

      {/* Informations de paiement et notes */}
      <div className="p-8 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-[#477A0C] mb-4">MODALITÉS DE PAIEMENT</h3>
            <div className="space-y-2 text-sm">
              {invoice.payment.method && (
                <p style={{ color: '#080F0F' }}><span className="font-semibold">Mode de règlement:</span> {invoice.payment.method}</p>
              )}
              
              {/* Affichage spécial pour acompte */}
              {invoice.payment.method === 'Acompte' && invoice.payment.depositAmount > 0 && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mt-3">
                  <p className="font-semibold text-blue-800">Détails de l'acompte:</p>
                  <p className="text-blue-700">Montant versé: <span className="font-bold">{formatCurrency(invoice.payment.depositAmount)}</span></p>
                  <p className="text-orange-700 font-semibold">Reste à payer: <span className="font-bold">{formatCurrency(totals.totalWithTax - invoice.payment.depositAmount)}</span></p>
                </div>
              )}
              
              <div className="bg-white p-4 rounded border mt-4">
                <p className="text-xs" style={{ color: '#080F0F' }}>
                  Paiement à réception de facture. En cas de retard de paiement, des pénalités de 3 fois le taux d'intérêt légal seront appliquées.
                </p>
              </div>
            </div>
          </div>

          <div>
            {invoice.invoiceNotes && (
              <>
                <h3 className="text-lg font-bold text-[#477A0C] mb-4">REMARQUES</h3>
                <div className="text-sm bg-white p-4 rounded border">
                  <p style={{ color: '#080F0F' }}>{invoice.invoiceNotes}</p>
                </div>
              </>
            )}
            
            {invoice.delivery.notes && (
              <>
                <h3 className="text-lg font-bold text-[#477A0C] mb-4 mt-6">LIVRAISON</h3>
                <div className="text-sm bg-white p-4 rounded border">
                  <p style={{ color: '#080F0F' }}>{invoice.delivery.notes}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="p-8 border-t-4 border-[#477A0C] bg-[#477A0C] text-[#F2EFE2]">
        <div className="text-center">
          <div className="flex items-center justify-center mb-4">
            <span className="text-2xl mr-3">🌸</span>
            <span className="text-2xl font-bold">MYCONFORT</span>
          </div>
          <p className="font-bold text-lg mb-2">Merci de votre confiance !</p>
          <p className="text-sm opacity-90">
            Votre spécialiste en matelas et literie de qualité
          </p>
          <div className="mt-4 text-xs opacity-75">
            <p>TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530</p>
          </div>
        </div>
      </div>
    </div>

    {/* PAGE 2 - CONDITIONS GÉNÉRALES DE VENTE */}
    <div style={{ pageBreakBefore: 'always' }}>
      <TermsAndConditions />
    </div>
  );
};