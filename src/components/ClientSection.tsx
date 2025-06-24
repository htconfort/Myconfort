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
            <label className="block text-[#14281D] mb-1 font-semibold">
              Nom complet*
            </label>
            <input
              value={client.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              type="text"
              required
              className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
            />
          </div>
          
          <div>
            <label className="block text-[#14281D] mb-1 font-semibold">
              Adresse*
            </label>
            <input
              value={client.address}
              onChange={(e) => handleInputChange('address', e.target.value)}
              type="text"
              required
              className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
            />
          </div>
          
          <div>
            <label className="block text-[#14281D] mb-1 font-semibold">
              Code postal*
            </label>
            <input
              value={client.postalCode}
              onChange={(e) => handleInputChange('postalCode', e.target.value)}
              type="text"
              required
              className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
            />
          </div>
          
          <div>
            <label className="block text-[#14281D] mb-1 font-semibold">
              Ville*
            </label>
            <input
              value={client.city}
              onChange={(e) => handleInputChange('city', e.target.value)}
              type="text"
              required
              className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
            />
          </div>
          
          <div>
            <label className="block text-[#14281D] mb-1 font-semibold">
              Type de logement
            </label>
            <select
              value={client.housingType || ''}
              onChange={(e) => handleInputChange('housingType', e.target.value)}
              className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
            >
              <option value="">Sélectionner</option>
              <option value="Maison">Maison</option>
              <option value="Appartement">Appartement</option>
            </select>
          </div>
          
          <div>
            <label className="block text-[#14281D] mb-1 font-semibold">
              Code porte / étage
            </label>
            <input
              value={client.doorCode || ''}
              onChange={(e) => handleInputChange('doorCode', e.target.value)}
              type="text"
              className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
            />
          </div>
          
          <div>
            <label className="block text-[#14281D] mb-1 font-semibold">
              Téléphone*
            </label>
            <input
              value={client.phone}
              onChange={(e) => handleInputChange('phone', e.target.value)}
              type="tel"
              required
              className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
            />
          </div>
          
          <div>
            <label className="block text-[#14281D] mb-1 font-semibold">
              Email*
            </label>
            <input
              value={client.email}
              onChange={(e) => handleInputChange('email', e.target.value)}
              type="email"
              required
              className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
            />
          </div>
          
          <div>
            <label className="block text-[#14281D] mb-1 font-semibold">
              SIRET (si applicable)
            </label>
            <input
              value={client.siret || ''}
              onChange={(e) => handleInputChange('siret', e.target.value)}
              type="text"
              className="w-full border-2 border-[#477A0C] rounded-lg px-4 py-3 focus:border-[#F55D3E] focus:ring-2 focus:ring-[#89BBFE] transition-all bg-white text-[#14281D]"
            />
          </div>
        </div>
      </div>
    </div>
  );
};