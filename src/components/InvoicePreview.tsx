import React from 'react';
import { Invoice } from '../types';
import { formatCurrency, calculateProductTotal } from '../utils/calculations';

interface InvoicePreviewProps {
  invoice: Invoice;
  className?: string;
}

export const InvoicePreview: React.FC<InvoicePreviewProps> = ({ 
  invoice, 
  className = "" 
}) => {
  // Calculer le total TTC
  const totalTTC = invoice.products.reduce((sum, product) => {
    return sum + calculateProductTotal(
      product.quantity,
      product.priceTTC,
      product.discount,
      product.discountType
    );
  }, 0);

  // Calculer l'acompte et le montant restant
  const acompteAmount = invoice.payment.depositAmount || 0;
  const montantRestant = totalTTC - acompteAmount;

  return (
    <div 
      id="facture-apercu" 
      className={`p-6 bg-white rounded-md max-w-3xl mx-auto text-black ${className}`}
    >
      {/* En-tête avec logo */}
      <div className="flex items-center mb-6">
        <div className="bg-[#477A0C] rounded-full w-12 h-12 flex items-center justify-center text-white text-2xl mr-4">
          🌸
        </div>
        <div>
          <h1 className="text-2xl font-bold text-[#477A0C]">MYCONFORT</h1>
          <p className="text-gray-600 text-sm">Facturation professionnelle</p>
        </div>
      </div>

      {/* Informations facture */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
        <div>
          <h2 className="text-lg font-semibold text-gray-800 mb-2">Informations facture</h2>
          <p className="text-gray-700">
            <span className="font-medium">Facture n°:</span> {invoice.invoiceNumber}
          </p>
          <p className="text-gray-700">
            <span className="font-medium">Date:</span> {new Date(invoice.invoiceDate).toLocaleDateString('fr-FR')}
          </p>
          {invoice.eventLocation && (
            <p className="text-gray-700">
              <span className="font-medium">Lieu:</span> {invoice.eventLocation}
            </p>
          )}
          {invoice.advisorName && (
            <p className="text-gray-700">
              <span className="font-medium">Conseiller:</span> {invoice.advisorName}
            </p>
          )}
        </div>

        {/* Statut signature */}
        <div className="flex justify-end">
          {invoice.signature ? (
            <div className="bg-green-100 border border-green-300 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-green-600">🔒</span>
                <span className="font-semibold text-green-800">FACTURE SIGNÉE</span>
              </div>
              <p className="text-xs text-green-600 mt-1">
                Signature électronique valide
              </p>
            </div>
          ) : (
            <div className="bg-yellow-100 border border-yellow-300 rounded-lg p-3">
              <div className="flex items-center space-x-2">
                <span className="text-yellow-600">⏳</span>
                <span className="font-semibold text-yellow-800">EN ATTENTE</span>
              </div>
              <p className="text-xs text-yellow-600 mt-1">
                Signature en attente
              </p>
            </div>
          )}
        </div>
      </div>

      <hr className="my-6 border-gray-300" />

      {/* Section client */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Client</h2>
        <div className="bg-gray-50 rounded-lg p-4">
          <p className="font-semibold text-gray-900">{invoice.client.name}</p>
          <p className="text-gray-700">{invoice.client.address}</p>
          <p className="text-gray-700">{invoice.client.postalCode} {invoice.client.city}</p>
          <div className="mt-2 grid grid-cols-1 md:grid-cols-2 gap-2">
            <p className="text-gray-700">
              <span className="font-medium">Tél:</span> {invoice.client.phone}
            </p>
            <p className="text-gray-700">
              <span className="font-medium">Email:</span> {invoice.client.email}
            </p>
          </div>
          {invoice.client.siret && (
            <p className="text-gray-700 mt-1">
              <span className="font-medium">SIRET:</span> {invoice.client.siret}
            </p>
          )}
        </div>
      </div>

      {/* Détail des produits */}
      <div className="mb-6">
        <h2 className="text-lg font-semibold text-gray-800 mb-3">Détail des produits</h2>
        <div className="overflow-x-auto">
          <table className="w-full border border-gray-300 rounded-lg overflow-hidden">
            <thead>
              <tr className="bg-[#477A0C] text-white">
                <th className="border border-gray-300 px-4 py-3 text-left font-semibold">Désignation</th>
                <th className="border border-gray-300 px-3 py-3 text-center font-semibold">Qté</th>
                <th className="border border-gray-300 px-3 py-3 text-right font-semibold">PU TTC</th>
                <th className="border border-gray-300 px-3 py-3 text-right font-semibold">Remise</th>
                <th className="border border-gray-300 px-3 py-3 text-right font-semibold">Total TTC</th>
              </tr>
            </thead>
            <tbody>
              {invoice.products.map((item, i) => {
                const totalProduct = calculateProductTotal(
                  item.quantity,
                  item.priceTTC,
                  item.discount,
                  item.discountType
                );
                
                return (
                  <tr key={i} className={i % 2 === 0 ? 'bg-white' : 'bg-gray-50'}>
                    <td className="border border-gray-300 px-4 py-3">
                      <div className="font-medium">{item.name}</div>
                      {item.category && (
                        <div className="text-xs text-gray-500">{item.category}</div>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-3 text-center font-semibold">
                      {item.quantity}
                    </td>
                    <td className="border border-gray-300 px-3 py-3 text-right">
                      {formatCurrency(item.priceTTC)}
                    </td>
                    <td className="border border-gray-300 px-3 py-3 text-right">
                      {item.discount > 0 ? (
                        <span className="text-red-600 font-medium">
                          -{item.discountType === 'percent' 
                            ? `${item.discount}%` 
                            : formatCurrency(item.discount)
                          }
                        </span>
                      ) : (
                        <span className="text-gray-400">-</span>
                      )}
                    </td>
                    <td className="border border-gray-300 px-3 py-3 text-right font-bold">
                      {formatCurrency(totalProduct)}
                    </td>
                  </tr>
                );
              })}
              {invoice.products.length === 0 && (
                <tr>
                  <td colSpan={5} className="border border-gray-300 px-4 py-6 text-center text-gray-500">
                    Aucun produit ajouté
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Totaux avec gestion acompte */}
      <div className="flex justify-end mb-6">
        <div className="w-full max-w-md">
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="font-medium">Total HT:</span>
                <span className="font-medium">
                  {formatCurrency(totalTTC / (1 + (invoice.taxRate / 100)))}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="font-medium">TVA ({invoice.taxRate}%):</span>
                <span className="font-medium">
                  {formatCurrency(totalTTC - (totalTTC / (1 + (invoice.taxRate / 100))))}
                </span>
              </div>
              <div className="border-t border-gray-300 pt-2">
                <div className="flex justify-between text-lg font-bold">
                  <span>TOTAL TTC:</span>
                  <span className="text-[#477A0C]">{formatCurrency(totalTTC)}</span>
                </div>
              </div>
              
              {/* Gestion acompte */}
              {acompteAmount > 0 && (
                <>
                  <div className="border-t border-gray-300 pt-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium">Acompte versé:</span>
                      <span className="font-medium text-blue-600">
                        {formatCurrency(acompteAmount)}
                      </span>
                    </div>
                  </div>
                  <div className="bg-orange-100 border border-orange-200 rounded p-2">
                    <div className="flex justify-between text-lg font-bold text-orange-600">
                      <span>RESTE À PAYER:</span>
                      <span>{formatCurrency(montantRestant)}</span>
                    </div>
                  </div>
                </>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Informations de paiement */}
      {invoice.payment.method && (
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Mode de paiement</h3>
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
            <p className="text-blue-800 font-medium">{invoice.payment.method}</p>
            {acompteAmount > 0 && (
              <p className="text-blue-700 text-sm mt-1">
                Acompte de {formatCurrency(acompteAmount)} versé
              </p>
            )}
          </div>
        </div>
      )}

      {/* Notes */}
      {invoice.invoiceNotes && (
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Remarques</h3>
          <div className="bg-gray-50 border border-gray-200 rounded-lg p-3">
            <p className="text-gray-700">{invoice.invoiceNotes}</p>
          </div>
        </div>
      )}

      {/* Signature */}
      {invoice.signature && (
        <div className="mb-6">
          <h3 className="text-md font-semibold text-gray-800 mb-2">Signature client</h3>
          <div className="border border-gray-300 rounded-lg p-4 bg-gray-50">
            <div className="flex items-center justify-center h-20">
              <img 
                src={invoice.signature} 
                alt="Signature client" 
                className="max-h-full max-w-full"
              />
            </div>
            <p className="text-xs text-gray-500 text-center mt-2">
              Signé électroniquement le {new Date().toLocaleDateString('fr-FR')}
            </p>
          </div>
        </div>
      )}

      {/* Pied de page */}
      <div className="text-center mt-8 pt-6 border-t border-gray-300">
        <div className="flex items-center justify-center mb-2">
          <span className="text-2xl mr-2">🌸</span>
          <span className="text-xl font-bold text-[#477A0C]">MYCONFORT</span>
        </div>
        <p className="text-lg font-semibold text-[#477A0C] mb-2">
          Merci pour votre confiance !
        </p>
        <p className="text-sm text-gray-600">
          Votre spécialiste en matelas et literie de qualité
        </p>
        <div className="mt-3 text-xs text-gray-500">
          <p>88 Avenue des Ternes, 75017 Paris - Tél: 04 68 50 41 45</p>
          <p>Email: myconfort@gmail.com - SIRET: 824 313 530 00027</p>
        </div>
      </div>
    </div>
  );
};