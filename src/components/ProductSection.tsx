import React, { useState, useMemo } from 'react';
import { ShoppingCart, Plus, Trash2, Edit3, Calculator, Euro, TrendingUp } from 'lucide-react';
import { Product } from '../types';
import { productCatalog, productCategories } from '../data/products';
import { formatCurrency, calculateHT, calculateProductTotal } from '../utils/calculations';

interface ProductSectionProps {
  products: Product[];
  onUpdate: (products: Product[]) => void;
  taxRate: number;
  invoiceNotes: string;
  onNotesChange: (notes: string) => void;
  acompteAmount: number;
  onAcompteChange: (amount: number) => void;
}

export const ProductSection: React.FC<ProductSectionProps> = ({
  products,
  onUpdate,
  taxRate,
  invoiceNotes,
  onNotesChange,
  acompteAmount,
  onAcompteChange
}) => {
  const [newProduct, setNewProduct] = useState({
    category: '',
    name: '',
    quantity: 1,
    unitPrice: 0,
    priceTTC: 0
  });

  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  const filteredProducts = useMemo(() => {
    return productCatalog.filter(p => p.category === newProduct.category);
  }, [newProduct.category]);

  const totals = useMemo(() => {
    const subtotal = products.reduce((sum, product) => {
      return sum + (product.quantity * calculateHT(product.priceTTC, taxRate));
    }, 0);

    const totalWithTax = products.reduce((sum, product) => {
      return sum + calculateProductTotal(
        product.quantity,
        product.priceTTC,
        product.discount,
        product.discountType
      );
    }, 0);

    const totalDiscount = products.reduce((sum, product) => {
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
      taxAmount: totalWithTax - (totalWithTax / (1 + (taxRate / 100))),
      totalPercu: acompteAmount,
      totalARecevoir: Math.max(0, totalWithTax - acompteAmount)
    };
  }, [products, taxRate, acompteAmount]);

  const handleCategoryChange = (category: string) => {
    setNewProduct({
      ...newProduct,
      category,
      name: '',
      unitPrice: 0,
      priceTTC: 0
    });
  };

  const handleProductChange = (productName: string) => {
    const selectedProduct = productCatalog.find(p => p.name === productName);
    if (selectedProduct) {
      setNewProduct({
        ...newProduct,
        name: productName,
        priceTTC: selectedProduct.priceTTC,
        unitPrice: selectedProduct.autoCalculateHT 
          ? calculateHT(selectedProduct.priceTTC, taxRate)
          : selectedProduct.price || 0
      });
    }
  };

  const handlePriceTTCChange = (priceTTC: number) => {
    setNewProduct({
      ...newProduct,
      priceTTC,
      unitPrice: calculateHT(priceTTC, taxRate)
    });
  };

  const addProduct = () => {
    if (!newProduct.name || newProduct.quantity <= 0 || newProduct.priceTTC <= 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const selectedCatalogProduct = productCatalog.find(p => p.name === newProduct.name);
    
    const product: Product = {
      id: Date.now().toString(),
      name: newProduct.name,
      category: newProduct.category,
      quantity: newProduct.quantity,
      unitPrice: newProduct.unitPrice,
      priceTTC: newProduct.priceTTC,
      discount: 0,
      discountType: 'percent',
      autoCalculateHT: selectedCatalogProduct?.autoCalculateHT
    };

    // Check if product already exists
    const existingIndex = products.findIndex(p => 
      p.name === product.name && Math.abs(p.priceTTC - product.priceTTC) < 0.01
    );

    if (existingIndex >= 0) {
      const updatedProducts = [...products];
      updatedProducts[existingIndex].quantity += product.quantity;
      onUpdate(updatedProducts);
    } else {
      onUpdate([...products, product]);
    }

    // Reset form
    setNewProduct({
      category: '',
      name: '',
      quantity: 1,
      unitPrice: 0,
      priceTTC: 0
    });
  };

  const removeProduct = (index: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce produit ?')) {
      const updatedProducts = products.filter((_, i) => i !== index);
      onUpdate(updatedProducts);
    }
  };

  const updateProduct = (index: number, updates: Partial<Product>) => {
    const updatedProducts = [...products];
    updatedProducts[index] = { ...updatedProducts[index], ...updates };
    
    // Recalculate unitPrice if priceTTC changed and autoCalculateHT is true
    if (updates.priceTTC && updatedProducts[index].autoCalculateHT) {
      updatedProducts[index].unitPrice = calculateHT(updates.priceTTC, taxRate);
    }
    
    onUpdate(updatedProducts);
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
  };

  const stopEditing = () => {
    setEditingIndex(null);
  };

  return (
    <div className="bg-[#477A0C] rounded-lg shadow-xl p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
      <h2 className="text-lg font-bold text-[#F2EFE2] mb-4 flex items-center">
        <ShoppingCart className="mr-2" />
        Produits & Tarification
      </h2>
      
      {/* Add Product Form */}
      <div className="mb-6 bg-[#F2EFE2] rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-12 gap-2 mb-2">
          <div className="md:col-span-3">
            <label className="block text-[#14281D] font-bold mb-1">Catégorie</label>
            <select
              value={newProduct.category}
              onChange={(e) => handleCategoryChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white font-bold focus:border-[#477A0C] focus:ring-2 focus:ring-[#477A0C] focus:ring-opacity-20"
            >
              <option value="">Sélectionner</option>
              {productCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-4">
            <label className="block text-[#14281D] font-bold mb-1">Produit</label>
            <select
              value={newProduct.name}
              onChange={(e) => handleProductChange(e.target.value)}
              className="w-full border border-gray-300 rounded px-3 py-2 bg-white font-bold focus:border-[#477A0C] focus:ring-2 focus:ring-[#477A0C] focus:ring-opacity-20"
              disabled={!newProduct.category}
            >
              <option value="">
                {newProduct.category ? 'Sélectionner un produit' : 'Sélectionner une catégorie d\'abord'}
              </option>
              {filteredProducts.map(product => (
                <option key={product.name} value={product.name}>
                  {product.name}
                </option>
              ))}
            </select>
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-[#14281D] font-bold mb-1">Quantité</label>
            <input
              value={newProduct.quantity}
              onChange={(e) => setNewProduct({
                ...newProduct,
                quantity: parseInt(e.target.value) || 1
              })}
              type="number"
              min="1"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-[#477A0C] focus:ring-2 focus:ring-[#477A0C] focus:ring-opacity-20"
            />
          </div>
          
          <div className="md:col-span-2">
            <label className="block text-[#14281D] font-bold mb-1">Prix TTC</label>
            <input
              value={newProduct.priceTTC}
              onChange={(e) => handlePriceTTCChange(parseFloat(e.target.value) || 0)}
              type="number"
              step="0.01"
              min="0"
              className="w-full border border-gray-300 rounded px-3 py-2 focus:border-[#477A0C] focus:ring-2 focus:ring-[#477A0C] focus:ring-opacity-20"
            />
          </div>
          
          <div className="md:col-span-1 flex items-end">
            <button
              onClick={addProduct}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white px-3 py-2 rounded transition-colors flex items-center justify-center"
              title="Ajouter le produit"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>
        
        {newProduct.priceTTC > 0 && (
          <div className="mt-2 text-sm text-[#14281D]">
            <span className="font-semibold">Prix HT calculé: {formatCurrency(newProduct.unitPrice)}</span>
          </div>
        )}
      </div>
      
      {/* Products Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#477A0C] text-[#F2EFE2]">
              <th className="border border-[#477A0C] px-4 py-3 text-left font-extrabold">
                PRODUIT
              </th>
              <th className="border border-[#477A0C] px-3 py-2 text-center font-bold">
                Quantité
              </th>
              <th className="border border-[#477A0C] px-3 py-2 text-right font-bold">
                PU HT
              </th>
              <th className="border border-[#477A0C] px-3 py-2 text-right font-bold">
                PU TTC
              </th>
              <th className="border border-[#477A0C] px-3 py-2 text-right font-bold">
                Remise
              </th>
              <th className="border border-[#477A0C] px-3 py-2 text-right font-bold">
                Total TTC
              </th>
              <th className="border border-[#477A0C] px-3 py-2 text-center font-bold">
                Actions
              </th>
            </tr>
          </thead>
          <tbody>
            {products.map((product, index) => (
              <tr key={product.id || index} className="bg-white">
                <td className="border border-gray-300 px-3 py-2 font-bold">
                  <div>{product.name}</div>
                  {product.category && (
                    <div className="text-xs text-gray-500">{product.category}</div>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  {editingIndex === index ? (
                    <input
                      type="number"
                      min="1"
                      value={product.quantity}
                      onChange={(e) => updateProduct(index, { quantity: parseInt(e.target.value) || 1 })}
                      className="w-16 text-center border border-gray-300 rounded px-1 py-1"
                      onBlur={stopEditing}
                      onKeyPress={(e) => e.key === 'Enter' && stopEditing()}
                      autoFocus
                    />
                  ) : (
                    <span 
                      className="font-bold cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => startEditing(index)}
                    >
                      {product.quantity}
                    </span>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  <div className="font-bold">
                    {formatCurrency(calculateHT(product.priceTTC, taxRate))}
                  </div>
                  <div className="text-xs text-gray-500">HT</div>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right">
                  {editingIndex === index ? (
                    <input
                      type="number"
                      step="0.01"
                      min="0"
                      value={product.priceTTC}
                      onChange={(e) => updateProduct(index, { priceTTC: parseFloat(e.target.value) || 0 })}
                      className="w-20 text-right border border-gray-300 rounded px-1 py-1"
                      onBlur={stopEditing}
                      onKeyPress={(e) => e.key === 'Enter' && stopEditing()}
                    />
                  ) : (
                    <div 
                      className="cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                      onClick={() => startEditing(index)}
                    >
                      <div className="font-bold">{formatCurrency(product.priceTTC)}</div>
                      <div className="text-xs text-gray-500">TTC</div>
                    </div>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 bg-[#F55D3E] bg-opacity-20">
                  <div className="flex items-center justify-end space-x-1">
                    <select
                      value={product.discountType}
                      onChange={(e) => updateProduct(index, {
                        discountType: e.target.value as 'percent' | 'fixed'
                      })}
                      className="border border-gray-300 rounded px-1 py-1 text-xs w-12"
                    >
                      <option value="percent">%</option>
                      <option value="fixed">€</option>
                    </select>
                    <input
                      value={product.discount}
                      onChange={(e) => updateProduct(index, {
                        discount: parseFloat(e.target.value) || 0
                      })}
                      type="number"
                      step="0.01"
                      min="0"
                      className="w-16 border border-gray-300 rounded px-1 py-1 text-right"
                    />
                  </div>
                </td>
                <td className="border border-gray-300 px-3 py-2 text-right font-bold">
                  <span>
                    {formatCurrency(calculateProductTotal(
                      product.quantity,
                      product.priceTTC,
                      product.discount,
                      product.discountType
                    ))}
                  </span>
                  {product.discount > 0 && (
                    <div className="text-xs text-gray-500">
                      (-{product.discountType === 'percent' 
                        ? `${product.discount}%` 
                        : formatCurrency(product.discount)
                      })
                    </div>
                  )}
                </td>
                <td className="border border-gray-300 px-3 py-2 text-center">
                  <div className="flex justify-center space-x-1">
                    <button
                      onClick={() => startEditing(index)}
                      className="text-white bg-blue-500 hover:bg-blue-600 p-1 rounded transition-all"
                      title="Modifier"
                    >
                      <Edit3 className="w-3 h-3" />
                    </button>
                    <button
                      onClick={() => removeProduct(index)}
                      className="text-white bg-red-500 hover:bg-red-600 p-1 rounded transition-all"
                      title="Supprimer"
                    >
                      <Trash2 className="w-3 h-3" />
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {products.length === 0 && (
              <tr>
                <td colSpan={7} className="border border-gray-300 px-3 py-4 text-center text-gray-500">
                  <span className="text-[#14281D] font-bold">Aucun produit ajouté</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
      
      {/* NOUVEAU: Patio avec deux bandes de lancement pour les totaux et acompte */}
      <div className="mt-6 grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Bande 1: Remarques */}
        <div className="bg-[#F2EFE2] rounded-lg p-4 border-2 border-[#477A0C]">
          <div className="flex items-center mb-3">
            <div className="bg-[#477A0C] text-[#F2EFE2] p-2 rounded-full mr-3">
              <Edit3 className="w-5 h-5" />
            </div>
            <h3 className="text-[#14281D] font-bold text-lg">REMARQUES</h3>
          </div>
          <textarea
            value={invoiceNotes}
            onChange={(e) => onNotesChange(e.target.value)}
            className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 h-32 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
            placeholder="Notes ou remarques sur la facture..."
          />
        </div>

        {/* Bande 2: Totaux et Gestion Acompte */}
        <div className="bg-[#F2EFE2] rounded-lg p-4 border-2 border-[#477A0C]">
          <div className="flex items-center mb-3">
            <div className="bg-[#477A0C] text-[#F2EFE2] p-2 rounded-full mr-3">
              <Calculator className="w-5 h-5" />
            </div>
            <h3 className="text-[#14281D] font-bold text-lg">TOTAUX & ACOMPTE</h3>
          </div>
          
          <div className="space-y-3">
            {/* Totaux classiques */}
            <div className="flex justify-between border-b border-gray-300 pb-2">
              <span className="font-semibold text-[#14281D]">Total HT:</span>
              <span className="font-semibold text-[#14281D]">
                {formatCurrency(totals.subtotal)}
              </span>
            </div>
            <div className="flex justify-between border-b border-gray-300 pb-2">
              <span className="font-semibold text-[#14281D]">TVA ({taxRate}%):</span>
              <span className="font-semibold text-[#14281D]">
                {formatCurrency(totals.taxAmount)}
              </span>
            </div>
            {totals.totalDiscount > 0 && (
              <div className="flex justify-between text-red-600 border-b border-gray-300 pb-2">
                <span className="font-semibold">Remise totale:</span>
                <span className="font-semibold">
                  -{formatCurrency(totals.totalDiscount)}
                </span>
              </div>
            )}
            
            {/* Total TTC */}
            <div className="flex justify-between bg-[#477A0C] text-[#F2EFE2] p-3 rounded-lg shadow-md">
              <span className="font-bold text-lg">Total TTC:</span>
              <span className="font-bold text-xl">
                {formatCurrency(totals.totalWithTax)}
              </span>
            </div>

            {/* NOUVEAU: Section Acompte */}
            <div className="bg-gradient-to-r from-blue-50 to-indigo-50 border-2 border-blue-300 rounded-lg p-4 mt-4">
              <div className="flex items-center mb-3">
                <Euro className="w-5 h-5 text-blue-600 mr-2" />
                <h4 className="font-bold text-blue-800">GESTION ACOMPTE</h4>
              </div>
              
              <div className="space-y-3">
                {/* Champ acompte versé */}
                <div>
                  <label className="block text-blue-700 font-semibold mb-1">
                    Acompte versé (€)
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0"
                    max={totals.totalWithTax}
                    value={acompteAmount}
                    onChange={(e) => onAcompteChange(parseFloat(e.target.value) || 0)}
                    className="w-full border-2 border-blue-300 rounded-lg px-4 py-2 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 transition-all bg-white text-blue-800 font-bold"
                    placeholder="0.00"
                  />
                </div>

                {/* Affichage des calculs */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Total perçu */}
                  <div className="bg-green-100 border border-green-300 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <TrendingUp className="w-4 h-4 text-green-600 mr-1" />
                      <span className="text-green-700 font-semibold text-sm">Total perçu</span>
                    </div>
                    <div className="text-green-800 font-bold text-lg">
                      {formatCurrency(totals.totalPercu)}
                    </div>
                  </div>

                  {/* Total à recevoir */}
                  <div className="bg-orange-100 border border-orange-300 rounded-lg p-3">
                    <div className="flex items-center mb-1">
                      <Calculator className="w-4 h-4 text-orange-600 mr-1" />
                      <span className="text-orange-700 font-semibold text-sm">Total à recevoir</span>
                    </div>
                    <div className="text-orange-800 font-bold text-lg">
                      {formatCurrency(totals.totalARecevoir)}
                    </div>
                  </div>
                </div>

                {/* Barre de progression visuelle */}
                {totals.totalWithTax > 0 && (
                  <div className="mt-3">
                    <div className="flex justify-between text-xs text-gray-600 mb-1">
                      <span>Progression du paiement</span>
                      <span>{Math.round((acompteAmount / totals.totalWithTax) * 100)}%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-3">
                      <div 
                        className="bg-gradient-to-r from-green-500 to-blue-500 h-3 rounded-full transition-all duration-300"
                        style={{ width: `${Math.min((acompteAmount / totals.totalWithTax) * 100, 100)}%` }}
                      ></div>
                    </div>
                  </div>
                )}

                {/* Message informatif */}
                {acompteAmount > 0 && (
                  <div className="bg-blue-50 border border-blue-200 rounded p-2 mt-2">
                    <p className="text-blue-700 text-xs font-medium">
                      💡 Un acompte de {formatCurrency(acompteAmount)} a été versé. 
                      Il reste {formatCurrency(totals.totalARecevoir)} à percevoir.
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};