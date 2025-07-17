import React from 'react';
import { Edit, Trash2 } from 'lucide-react';
import { Modal } from './ui/Modal';
import { Client } from '../types';

interface ClientListModalProps {
  isOpen: boolean;
  onClose: () => void;
  clients: Client[];
  onLoadClient: (client: Client) => void;
  onDeleteClient: (index: number) => void;
}

export const ClientListModal: React.FC<ClientListModalProps> = ({
  isOpen,
  onClose,
  clients,
  onLoadClient,
  onDeleteClient
}) => {
  const handleDeleteClient = (index: number) => {
    if (window.confirm('Êtes-vous sûr de vouloir supprimer ce client ?')) {
      onDeleteClient(index);
    }
  };

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Liste des Clients">
      <div className="overflow-x-auto">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-[#477A0C] text-[#F2EFE2]">
              <th className="border px-4 py-2 text-left font-bold">Nom</th>
              <th className="border px-4 py-2 text-left font-bold">Email</th>
              <th className="border px-4 py-2 text-left font-bold">Téléphone</th>
              <th className="border px-4 py-2 text-left font-bold">Adresse</th>
              <th className="border px-4 py-2 text-center font-bold">Actions</th>
            </tr>
          </thead>
          <tbody>
            {clients.map((client, index) => (
              <tr key={client.id || index} className="bg-white hover:bg-gray-50">
                <td className="border px-4 py-2">
                  <span className="text-black font-bold">{client.name}</span>
                </td>
                <td className="border px-4 py-2">
                  <span className="text-black font-semibold">{client.email}</span>
                </td>
                <td className="border px-4 py-2">
                  <span className="text-black font-semibold">{client.phone}</span>
                </td>
                <td className="border px-4 py-2">
                  <span className="text-black font-semibold">
                    {`${client.address}, ${client.postalCode} ${client.city}`}
                  </span>
                </td>
                <td className="border px-4 py-2 text-center">
                  <div className="flex justify-center space-x-2">
                    <button
                      onClick={() => {
                        onLoadClient(client);
                        onClose();
                      }}
                      className="bg-blue-500 hover:bg-blue-600 text-white px-3 py-1 rounded flex items-center space-x-1 font-semibold"
                    >
                      <Edit className="w-4 h-4" />
                      <span>Charger</span>
                    </button>
                    <button
                      onClick={() => handleDeleteClient(index)}
                      className="bg-red-500 hover:bg-red-600 text-white px-3 py-1 rounded flex items-center space-x-1 font-semibold"
                    >
                      <Trash2 className="w-4 h-4" />
                      <span>Supprimer</span>
                    </button>
                  </div>
                </td>
              </tr>
            ))}
            {clients.length === 0 && (
              <tr>
                <td colSpan={5} className="border px-4 py-4 text-center">
                  <span className="text-black font-bold">Aucun client enregistré</span>
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </Modal>
  );
};
