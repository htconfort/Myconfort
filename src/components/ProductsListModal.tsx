import React, { useState } from 'react';
import { X, Package, Plus, Edit3, Trash2, Search, Tag, Euro, Save, AlertCircle } from 'lucide-react';
import { Modal } from './ui/Modal';
import { ProductCatalog } from '../types';
import { productCatalog, productCategories } from '../data/products';
import { formatCurrency } from '../utils/calculations';

interface ProductsListModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export const ProductsListModal: React.FC<ProductsListModalProps> = ({
  isOpen,
  onClose
}) => {
  const [products, setProducts] = useState<ProductCatalog[]>(productCatalog);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [editingIndex, setEditingIndex] = useState<number | null>(null);
  const [showAddForm, setShowAddForm] = useState(false);
  const [newProduct, setNewProduct] = useState<ProductCatalog>({
    category: '',
    name: '',
    priceTTC: 0,
    autoCalculateHT: true
  });

  // Filtrer les produits
  const filteredProducts = React.useMemo(() => {
    return products.filter(product => {
      const matchesSearch = 
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.category.toLowerCase().includes(searchTerm.toLowerCase());
      
      const matchesCategory = 
        selectedCategory === '' || product.category === selectedCategory;
      
      return matchesSearch && matchesCategory;
    });
  }, [products, searchTerm, selectedCategory]);

  // Grouper par catégorie
  const productsByCategory = React.useMemo(() => {
    const grouped: { [key: string]: ProductCatalog[] } = {};
    filteredProducts.forEach(product => {
      if (!grouped[product.category]) {
        grouped[product.category] = [];
      }
      grouped[product.category].push(product);
    });
    return grouped;
  }, [filteredProducts]);

  const handleAddProduct = () => {
    if (!newProduct.name || !newProduct.category || newProduct.priceTTC <= 0) {
      alert('Veuillez remplir tous les champs obligatoires');
      return;
    }

    const updatedProducts = [...products, { ...newProduct }];
    setProducts(updatedProducts);
    
    // Réinitialiser le formulaire
    setNewProduct({
      category: '',
      name: '',
      priceTTC: 0,
      autoCalculateHT: true
    });
    setShowAddForm(false);
  };

  const handleEditProduct = (index: number, updatedProduct: ProductCatalog) => {
    const updatedProducts = [...products];
    updatedProducts[index] = updatedProduct;
    setProducts(updatedProducts);
    setEditingIndex(null);
  };

  const handleDeleteProduct = (index: number) => {
    const product = products[index];
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer "${product.name}" ?`)) {
      const updatedProducts = products.filter((_, i) => i !== index);
      setProducts(updatedProducts);
    }
  };

  const startEditing = (index: number) => {
    setEditingIndex(index);
  };

  const stopEditing = () => {
    setEditingIndex(null);
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Gestion des Produits MYCONFORT" maxWidth="max-w-6xl">
      <div className="space-y-6" style={{ backgroundColor: '#F2EFE2', color: '#000000' }}>
        {/* Statistiques */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 rounded-lg" style={{ backgroundColor: '#F2EFE2' }}>
          <div className="bg-white border-2 border-gray-300 p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-black" />
              <span className="font-bold text-black">Total Produits</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-black">{products.length}</div>
          </div>
          
          <div className="bg-white border-2 border-gray-300 p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Tag className="w-5 h-5 text-black" />
              <span className="font-bold text-black">Catégories</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-black">{productCategories.length}</div>
          </div>
          
          <div className="bg-white border-2 border-gray-300 p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Euro className="w-5 h-5 text-black" />
              <span className="font-bold text-black">Prix Moyen</span>
            </div>
            <div className="text-lg font-bold mt-1 text-black">
              {formatCurrency(products.reduce((sum, p) => sum + p.priceTTC, 0) / products.length || 0)}
            </div>
          </div>
          
          <div className="bg-white border-2 border-gray-300 p-4 rounded-lg shadow-sm">
            <div className="flex items-center space-x-2">
              <Package className="w-5 h-5 text-black" />
              <span className="font-bold text-black">Matelas</span>
            </div>
            <div className="text-2xl font-bold mt-1 text-black">
              {products.filter(p => p.category === 'Matelas').length}
            </div>
          </div>
        </div>

        {/* Filtres et recherche */}
        <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {/* Recherche */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-black w-4 h-4" />
              <input
                type="text"
                placeholder="Rechercher un produit..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
              />
            </div>

            {/* Filtre catégorie */}
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border-2 border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-black bg-white"
            >
              <option value="">Toutes les catégories</option>
              {productCategories.map(category => (
                <option key={category} value={category}>{category}</option>
              ))}
            </select>

            {/* Bouton ajouter */}
            <button
              onClick={() => setShowAddForm(!showAddForm)}
              className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-2 font-bold transition-all"
            >
              <Plus className="w-4 h-4" />
              <span>Ajouter un produit</span>
            </button>
          </div>
        </div>

        {/* Formulaire d'ajout */}
        {showAddForm && (
          <div className="bg-white p-6 rounded-lg border-2 border-green-300">
            <h3 className="text-lg font-bold text-black mb-4 flex items-center space-x-2">
              <Plus className="w-5 h-5" />
              <span>Ajouter un nouveau produit</span>
            </h3>
            
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
              <div>
                <label className="block text-black font-bold mb-1">Catégorie*</label>
                <select
                  value={newProduct.category}
                  onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-black bg-white focus:border-blue-500"
                >
                  <option value="">Sélectionner</option>
                  {productCategories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
              
              <div className="md:col-span-2">
                <label className="block text-black font-bold mb-1">Nom du produit*</label>
                <input
                  type="text"
                  value={newProduct.name}
                  onChange={(e) => setNewProduct({ ...newProduct, name: e.target.value })}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-black bg-white focus:border-blue-500"
                  placeholder="Ex: MATELAS BAMBOU 140 x 190"
                />
              </div>
              
              <div>
                <label className="block text-black font-bold mb-1">Prix TTC*</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={newProduct.priceTTC}
                  onChange={(e) => setNewProduct({ ...newProduct, priceTTC: parseFloat(e.target.value) || 0 })}
                  className="w-full border-2 border-gray-300 rounded-lg px-3 py-2 text-black bg-white focus:border-blue-500"
                  placeholder="0.00"
                />
              </div>
            </div>
            
            <div className="flex items-center space-x-4 mt-4">
              <label className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  checked={newProduct.autoCalculateHT || false}
                  onChange={(e) => setNewProduct({ ...newProduct, autoCalculateHT: e.target.checked })}
                  className="form-checkbox h-4 w-4 text-blue-600"
                />
                <span className="text-black font-semibold">Calcul automatique HT</span>
              </label>
              
              <div className="flex space-x-2">
                <button
                  onClick={handleAddProduct}
                  className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg flex items-center space-x-1 font-bold"
                >
                  <Save className="w-4 h-4" />
                  <span>Ajouter</span>
                </button>
                <button
                  onClick={() => setShowAddForm(false)}
                  className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg font-bold"
                >
                  Annuler
                </button>
              </div>
            </div>
          </div>
        )}

        {/* Liste des produits par catégorie */}
        <div className="space-y-6">
          {Object.keys(productsByCategory).length === 0 ? (
            <div className="bg-white p-8 rounded-lg border-2 border-gray-300 text-center">
              <Package className="w-12 h-12 mx-auto mb-4 text-gray-400" />
              <p className="text-black font-bold">Aucun produit trouvé</p>
              <p className="text-gray-600 mt-1">Modifiez vos critères de recherche ou ajoutez un nouveau produit</p>
            </div>
          ) : (
            Object.entries(productsByCategory).map(([category, categoryProducts]) => (
              <div key={category} className="bg-white rounded-lg border-2 border-gray-300 overflow-hidden">
                <div className="bg-gray-100 px-4 py-3 border-b border-gray-300">
                  <h3 className="text-lg font-bold text-black flex items-center space-x-2">
                    <Tag className="w-5 h-5" />
                    <span>{category}</span>
                    <span className="bg-blue-500 text-white px-2 py-1 rounded-full text-xs">
                      {categoryProducts.length}
                    </span>
                  </h3>
                </div>
                
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead>
                      <tr className="bg-gray-50 border-b border-gray-300">
                        <th className="px-4 py-3 text-left font-bold text-black">Nom du produit</th>
                        <th className="px-4 py-3 text-right font-bold text-black">Prix TTC</th>
                        <th className="px-4 py-3 text-center font-bold text-black">Calcul HT</th>
                        <th className="px-4 py-3 text-center font-bold text-black">Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categoryProducts.map((product, categoryIndex) => {
                        const globalIndex = products.findIndex(p => 
                          p.name === product.name && p.category === product.category
                        );
                        
                        return (
                          <tr key={`${product.category}-${categoryIndex}`} className="border-b border-gray-200 hover:bg-gray-50">
                            <td className="px-4 py-3">
                              {editingIndex === globalIndex ? (
                                <input
                                  type="text"
                                  value={product.name}
                                  onChange={(e) => {
                                    const updatedProduct = { ...product, name: e.target.value };
                                    handleEditProduct(globalIndex, updatedProduct);
                                  }}
                                  className="w-full border border-gray-300 rounded px-2 py-1 text-black bg-white"
                                  onBlur={stopEditing}
                                  onKeyPress={(e) => e.key === 'Enter' && stopEditing()}
                                  autoFocus
                                />
                              ) : (
                                <div 
                                  className="font-semibold text-black cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                  onClick={() => startEditing(globalIndex)}
                                >
                                  {product.name}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-right">
                              {editingIndex === globalIndex ? (
                                <input
                                  type="number"
                                  step="0.01"
                                  min="0"
                                  value={product.priceTTC}
                                  onChange={(e) => {
                                    const updatedProduct = { ...product, priceTTC: parseFloat(e.target.value) || 0 };
                                    handleEditProduct(globalIndex, updatedProduct);
                                  }}
                                  className="w-24 border border-gray-300 rounded px-2 py-1 text-right text-black bg-white"
                                  onBlur={stopEditing}
                                  onKeyPress={(e) => e.key === 'Enter' && stopEditing()}
                                />
                              ) : (
                                <div 
                                  className="font-bold text-green-600 cursor-pointer hover:bg-gray-100 px-2 py-1 rounded"
                                  onClick={() => startEditing(globalIndex)}
                                >
                                  {formatCurrency(product.priceTTC)}
                                </div>
                              )}
                            </td>
                            <td className="px-4 py-3 text-center">
                              {product.autoCalculateHT ? (
                                <span className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-semibold">
                                  Auto
                                </span>
                              ) : (
                                <span className="bg-gray-100 text-gray-800 px-2 py-1 rounded-full text-xs font-semibold">
                                  Manuel
                                </span>
                              )}
                            </td>
                            <td className="px-4 py-3">
                              <div className="flex justify-center space-x-1">
                                <button
                                  onClick={() => startEditing(globalIndex)}
                                  className="bg-blue-500 hover:bg-blue-600 text-white p-2 rounded transition-all"
                                  title="Modifier"
                                >
                                  <Edit3 className="w-4 h-4" />
                                </button>
                                <button
                                  onClick={() => handleDeleteProduct(globalIndex)}
                                  className="bg-red-500 hover:bg-red-600 text-white p-2 rounded transition-all"
                                  title="Supprimer"
                                >
                                  <Trash2 className="w-4 h-4" />
                                </button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            ))
          )}
        </div>

        {/* Résumé en bas */}
        {filteredProducts.length > 0 && (
          <div className="bg-white p-4 rounded-lg border-2 border-gray-300">
            <div className="text-sm text-black font-semibold">
              <strong>{filteredProducts.length}</strong> produit{filteredProducts.length > 1 ? 's' : ''} affiché{filteredProducts.length > 1 ? 's' : ''} 
              {searchTerm && ` pour "${searchTerm}"`}
              {selectedCategory && ` dans la catégorie "${selectedCategory}"`}
            </div>
          </div>
        )}

        {/* Note d'information */}
        <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-4">
          <div className="flex items-start space-x-2">
            <AlertCircle className="w-5 h-5 text-blue-600 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold">Gestion des produits MYCONFORT</p>
              <p className="mt-1">
                • Cliquez sur un nom ou prix pour le modifier directement<br/>
                • Les modifications sont automatiquement sauvegardées<br/>
                • Le calcul HT automatique utilise le taux de TVA de la facture<br/>
                • Les nouveaux produits seront disponibles dans le catalogue
              </p>
            </div>
          </div>
        </div>
      </div>
    </Modal>
  );
};
