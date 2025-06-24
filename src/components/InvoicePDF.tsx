import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, calculateHT, calculateProductTotal } from '../utils/calculations';

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
    <div className={containerClass} style={{ fontFamily: 'Manrope, sans-serif' }}>
      {/* En-tête de la facture */}
      <div className="p-8 border-b-4 border-[#477A0C]">
        <div className="flex justify-between items-start">
          {/* Logo et informations entreprise */}
          <div className="flex-1">
            <div className="flex items-center mb-4">
              <div className="text-4xl mr-3">🛋️</div>
              <div>
                <h1 className="text-3xl font-black text-[#477A0C] tracking-tight">
                  MYCONFORT
                </h1>
                <p className="text-sm text-gray-600 font-medium">Spécialiste du confort</p>
              </div>
            </div>
            
            <div className="text-sm text-gray-700 space-y-1">
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
            <div className="bg-[#477A0C] text-white px-6 py-3 rounded-lg mb-4">
              <h2 className="text-xl font-bold">FACTURE</h2>
            </div>
            
            <div className="space-y-2 text-sm">
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-600">N° Facture:</span>
                <span className="font-bold text-lg">{invoice.invoiceNumber}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="font-semibold text-gray-600">Date:</span>
                <span className="font-semibold">{new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}</span>
              </div>
              {invoice.eventLocation && (
                <div className="flex justify-between items-center">
                  <span className="font-semibold text-gray-600">Lieu:</span>
                  <span className="font-semibold">{invoice.eventLocation}</span>
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
            <h3 className="text-lg font-bold text-[#477A0C] mb-3 border-b-2 border-[#477A0C] pb-1">
              FACTURER À
            </h3>
            <div className="space-y-1 text-sm">
              <p className="font-bold text-base">{invoice.client.name}</p>
              <p>{invoice.client.address}</p>
              <p>{invoice.client.postalCode} {invoice.client.city}</p>
              {invoice.client.siret && <p>SIRET: {invoice.client.siret}</p>}
              <p className="pt-2">
                <span className="font-semibold">Tél:</span> {invoice.client.phone}
              </p>
              <p>
                <span className="font-semibold">Email:</span> {invoice.client.email}
              </p>
            </div>
          </div>

          <div>
            <h3 className="text-lg font-bold text-[#477A0C] mb-3 border-b-2 border-[#477A0C] pb-1">
              INFORMATIONS COMPLÉMENTAIRES
            </h3>
            <div className="space-y-2 text-sm">
              {invoice.client.housingType && (
                <p><span className="font-semibold">Type de logement:</span> {invoice.client.housingType}</p>
              )}
              {invoice.client.doorCode && (
                <p><span className="font-semibold">Code d'accès:</span> {invoice.client.doorCode}</p>
              )}
              {invoice.delivery.method && (
                <p><span className="font-semibold">Livraison:</span> {invoice.delivery.method}</p>
              )}
              {invoice.advisorName && (
                <p><span className="font-semibold">Conseiller:</span> {invoice.advisorName}</p>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Tableau des produits */}
      <div className="p-8">
        <h3 className="text-lg font-bold text-[#477A0C] mb-4 border-b-2 border-[#477A0C] pb-1">
          DÉTAIL DES PRODUITS
        </h3>
        
        <div className="overflow-x-auto">
          <table className="w-full border-collapse border border-gray-300">
            <thead>
              <tr className="bg-[#477A0C] text-white">
                <th className="border border-gray-300 px-4 py-3 text-left font-bold">DÉSIGNATION</th>
                <th className="border border-gray-300 px-3 py-3 text-center font-bold">QTÉ</th>
                <th className="border border-gray-300 px-3 py-3 text-right font-bold">PU HT</th>
                <th className="border border-gray-300 px-3 py-3 text-right font-bold">PU TTC</th>
                <th className="border border-gray-300 px-3 py-3 text-right font-bold">REMISE</th>
                <th className="border border-gray-300 px-3 py-3 text-right font-bold">TOTAL TTC</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products.map((product, index) => (
                <tr key={index} className={index % 2 === 0 ? 'bg-gray-50' : 'bg-white'}>
                  <td className="border border-gray-300 px-4 py-3">
                    <div className="font-semibold">{product.name}</div>
                    {product.category && (
                      <div className="text-xs text-gray-500 mt-1">{product.category}</div>
                    )}
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-center font-semibold">
                    {product.quantity}
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-right">
                    {formatCurrency(calculateHT(product.priceTTC, invoice.taxRate))}
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-right font-semibold">
                    {formatCurrency(product.priceTTC)}
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-right">
                    {product.discount > 0 ? (
                      <span className="text-red-600 font-semibold">
                        -{product.discountType === 'percent' 
                          ? `${product.discount}%` 
                          : formatCurrency(product.discount)
                        }
                      </span>
                    ) : '-'}
                  </td>
                  <td className="border border-gray-300 px-3 py-3 text-right font-bold">
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

        {/* Totaux */}
        <div className="mt-6 flex justify-end">
          <div className="w-full max-w-md">
            <div className="bg-gray-50 p-4 rounded-lg border">
              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">Total HT:</span>
                  <span className="font-semibold">{formatCurrency(totals.subtotal)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="font-semibold">TVA ({invoice.taxRate}%):</span>
                  <span className="font-semibold">{formatCurrency(totals.taxAmount)}</span>
                </div>
                {totals.totalDiscount > 0 && (
                  <div className="flex justify-between text-sm text-red-600">
                    <span className="font-semibold">Remise totale:</span>
                    <span className="font-semibold">-{formatCurrency(totals.totalDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-gray-300 pt-2">
                  <div className="flex justify-between text-lg font-bold">
                    <span>TOTAL TTC:</span>
                    <span className="text-[#477A0C]">{formatCurrency(totals.totalWithTax)}</span>
                  </div>
                </div>
                
                {invoice.payment.method === 'Acompte' && invoice.payment.depositAmount > 0 && (
                  <>
                    <div className="flex justify-between text-sm border-t border-gray-300 pt-2">
                      <span className="font-semibold">Acompte versé:</span>
                      <span className="font-semibold">{formatCurrency(invoice.payment.depositAmount)}</span>
                    </div>
                    <div className="flex justify-between text-lg font-bold text-[#F55D3E]">
                      <span>RESTE À PAYER:</span>
                      <span>{formatCurrency(totals.totalWithTax - invoice.payment.depositAmount)}</span>
                    </div>
                  </>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Informations de paiement et notes */}
      <div className="p-8 border-t border-gray-200 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div>
            <h3 className="text-lg font-bold text-[#477A0C] mb-3">MODALITÉS DE PAIEMENT</h3>
            <div className="space-y-2 text-sm">
              {invoice.payment.method && (
                <p><span className="font-semibold">Mode de règlement:</span> {invoice.payment.method}</p>
              )}
              <p className="text-xs text-gray-600 mt-3">
                Paiement à réception de facture. En cas de retard de paiement, des pénalités de 3 fois le taux d'intérêt légal seront appliquées.
              </p>
            </div>
          </div>

          <div>
            {invoice.invoiceNotes && (
              <>
                <h3 className="text-lg font-bold text-[#477A0C] mb-3">REMARQUES</h3>
                <div className="text-sm bg-white p-3 rounded border">
                  <p>{invoice.invoiceNotes}</p>
                </div>
              </>
            )}
            
            {invoice.delivery.notes && (
              <>
                <h3 className="text-lg font-bold text-[#477A0C] mb-3 mt-4">LIVRAISON</h3>
                <div className="text-sm bg-white p-3 rounded border">
                  <p>{invoice.delivery.notes}</p>
                </div>
              </>
            )}
          </div>
        </div>
      </div>

      {/* Pied de page */}
      <div className="p-8 border-t-4 border-[#477A0C] bg-[#477A0C] text-white">
        <div className="text-center">
          <p className="font-bold text-lg mb-2">Merci de votre confiance !</p>
          <p className="text-sm opacity-90">
            MYCONFORT - Votre spécialiste du confort depuis plus de 10 ans
          </p>
          <div className="mt-4 text-xs opacity-75">
            <p>TVA non applicable, art. 293 B du CGI - RCS Paris 824 313 530</p>
          </div>
        </div>
      </div>
    </div>
  );
};