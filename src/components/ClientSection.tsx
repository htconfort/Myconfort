import React from 'react';
import { User } from 'lucide-react';
import { Client } from '../types';

interface ClientSectionProps {
  client: Client;
  onUpdate: (client: Client) => void;
}

export const ClientSection: React.FC<ClientSectionProps> = ({ client, onUpdate }) => {
  const handleInputChange = (field: keyof Client, value: string) => {
    onUpdate({ ...client, [field]: value });
  };

  // Fonction pour vérifier si un champ est vide
  const isFieldEmpty = (value: string | undefined) => {
    return !value || value.trim() === '';
  };

  // Style pour les champs obligatoires avec police noire
  const getFieldStyle = (value: string | undefined) => {
    return `w-full border-2 rounded-lg px-4 py-3 focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-semibold ${
      isFieldEmpty(value) 
        ? 'border-red-500 focus:border-red-500' 
        : 'border-[#477A0C] focus:border-[#F55D3E]'
    }`;
  };

  return (
    <div className="bg-[#477A0C] rounded-xl shadow-[0_10px_25px_-5px_rgba(0,0,0,0.3)] p-6 mb-6 transform transition-all hover:scale-[1.005] hover:shadow-[0_15px_30px_-5px_rgba(0,0,0,0.4)]">
      <h2 className="text-xl font-bold text-[#F2EFE2] mb-4 flex items-center justify-center">
        <User className="mr-3 text-xl" />
        <span className="bg-[#F2EFE2] text-[#477A0C] px-4 py-2 rounded-full font-bold">
          INFORMATIONS CLIENT
        </span>
      </h2>
      
      <div className="bg-[#F2EFE2] rounded-lg p-6 mt-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-black mb-1 font-bold">
              Nom complet <span className="text-red-600">*</span>
            </label>
            <input
              value={client.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              type="text"
              required
              className={getFieldStyle(client.name)}
              placeholder="Nom complet obligatoire"
            />
            {isFieldEmpty(client.name) && (
              <p className="text-red-600 text-xs mt-1 font-semibold">
                ⚠️ Le nom complet est obligatoire
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-black mb-1 font-bold">
              Adresse <span className="text-red-600">*</span>
            </label>
            <input
              value={client.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              type="text"
              required
              className={getFieldStyle(client.address)}
              placeholder="Adresse obligatoire"
            />
            {isFieldEmpty(client.address) && (
              <p className="text-red-600 text-xs mt-1 font-semibold">
                ⚠️ L'adresse est obligatoire
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-black mb-1 font-bold">
              Code postal <span className="text-red-600">*</span>
            </label>
            <input
              value={client.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              type="text"
              required
              className={getFieldStyle(client.postalCode)}
              placeholder="Code postal obligatoire"
            />
            {isFieldEmpty(client.postalCode) && (
              <p className="text-red-600 text-xs mt-1 font-semibold">
                ⚠️ Le code postal est obligatoire
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-black mb-1 font-bold">
              Ville <span className="text-red-600">*</span>
            </label>
            <input
              value={client.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              type="text"
              required
              className={getFieldStyle(client.city)}
              placeholder="Ville obligatoire"
            />
            {isFieldEmpty(client.city) && (
              <p className="text-red-600 text-xs mt-1 font-semibold">
                ⚠️ La ville est obligatoire
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-black mb-1 font-bold">
              Type de logement <span className="text-red-600">*</span>
            </label>
            <select
              value={client.housingType || ''}
              onChange={(e) => handleInputChange('housingType', e.target.value)}
              required
              className={getFieldStyle(client.housingType)}
            >
              <option value="">Sélectionner obligatoirement</option>
              <option value="Maison">Maison</option>
              <option value="Appartement">Appartement</option>
            </select>
            {isFieldEmpty(client.housingType) && (
              <p className="text-red-600 text-xs mt-1 font-semibold">
                ⚠️ Le type de logement est obligatoire
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-black mb-1 font-bold">
              Code porte / étage <span className="text-red-600">*</span>
            </label>
            <input
              value={client.doorCode || ''}
              onChange={(e) => handleInputChange('doorCode', e.target.value)}
              type="text"
              required
              className={getFieldStyle(client.doorCode)}
              placeholder="Code porte/étage obligatoire"
            />
            {isFieldEmpty(client.doorCode) && (
              <p className="text-red-600 text-xs mt-1 font-semibold">
                ⚠️ Le code porte/étage est obligatoire
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-black mb-1 font-bold">
              Téléphone <span className="text-red-600">*</span>
            </label>
            <input
              value={client.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              type="tel"
              required
              className={getFieldStyle(client.phone)}
              placeholder="Téléphone obligatoire"
            />
            {isFieldEmpty(client.phone) && (
              <p className="text-red-600 text-xs mt-1 font-semibold">
                ⚠️ Le téléphone est obligatoire
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-black mb-1 font-bold">
              Email <span className="text-red-600">*</span>
            </label>
            <input
              value={client.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              type="email"
              required
              className={getFieldStyle(client.email)}
              placeholder="Email obligatoire"
            />
            {isFieldEmpty(client.email) && (
              <p className="text-red-600 text-xs mt-1 font-semibold">
                ⚠️ L'email est obligatoire
              </p>
            )}
            {client.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(client.email) && (
              <p className="text-red-600 text-xs mt-1 font-semibold">
                ⚠️ Format d'email invalide
              </p>
            )}
          </div>
          
          <div>
            <label className="block text-black mb-1 font-bold">
              SIRET (si applicable)
            </label>
            <input
              value={client.siret || ''}
              onChange={(e) => handleInputChange('siret', e.target.value)}
              type="text"
              className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-black font-semibold"
              placeholder="SIRET (optionnel)"
            />
          </div>
        </div>

        {/* Message d'information sur les champs obligatoires */}
        <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-lg">
          <p className="text-red-800 text-sm font-semibold">
            ⚠️ <span className="text-red-600">*</span> Tous les champs marqués d'un astérisque rouge sont obligatoires pour pouvoir éditer la facture.
          </p>
        </div>
      </div>
    </div>
  );
};
