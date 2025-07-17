import React from 'react';
import { X, Download, FileText } from 'lucide-react';
import { Modal } from './ui/Modal';

interface EmailJSConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (message: string) => void;
  onError: (message: string) => void;
}

export const EmailJSConfigModal: React.FC<EmailJSConfigModalProps> = ({
  isOpen,
  onClose,
  onSuccess
}) => {
  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Génération de PDF - Guide d'utilisation" maxWidth="max-w-2xl">
      <div className="space-y-6">
        {/* En-tête */}
        <div className="bg-gradient-to-r from-green-600 to-emerald-600 text-white rounded-lg p-4">
          <div className="flex items-center space-x-3 mb-2">
            <div className="bg-white/20 p-2 rounded-full">
              <FileText className="w-6 h-6" />
            </div>
            <div>
              <h3 className="text-xl font-bold">Guide de génération PDF</h3>
              <p className="text-green-100">Créez et partagez vos factures facilement</p>
            </div>
          </div>
          
          <p className="mt-2 text-sm text-green-100">
            Ce guide vous explique comment générer et partager vos factures au format PDF.
          </p>
        </div>

        {/* Instructions */}
        <div className="bg-white border border-gray-200 rounded-lg p-4">
          <h4 className="font-medium text-gray-800 mb-3">Comment générer un PDF :</h4>
          
          <ol className="list-decimal ml-5 space-y-2 text-gray-700">
            <li>Remplissez toutes les informations de la facture (client, produits, etc.)</li>
            <li>Cliquez sur le bouton <strong>"Générer et télécharger le PDF"</strong> dans la section principale</li>
            <li>Le PDF sera automatiquement téléchargé sur votre appareil</li>
            <li>Pour prévisualiser avant de télécharger, utilisez le bouton <strong>"APERÇU & PDF"</strong></li>
          </ol>
        </div>

        {/* Partage */}
        <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
          <h4 className="font-medium text-purple-800 mb-3">Comment partager votre facture :</h4>
          
          <ol className="list-decimal ml-5 space-y-2 text-purple-700">
            <li>Cliquez sur <strong>"APERÇU & PDF"</strong> pour ouvrir la prévisualisation</li>
            <li>Dans la fenêtre de prévisualisation, utilisez le bouton <strong>"Partager Aperçu"</strong></li>
            <li>Vous pouvez également envoyer le PDF téléchargé par email manuellement</li>
          </ol>
        </div>

        {/* Fonctionnalités */}
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <h4 className="font-medium text-blue-800 mb-2">Fonctionnalités disponibles :</h4>
          <div className="grid grid-cols-2 gap-2 text-sm text-blue-700">
            <div className="flex items-center space-x-2">
              <CheckIcon />
              <span>Génération PDF haute qualité</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon />
              <span>Téléchargement direct</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon />
              <span>Prévisualisation avant téléchargement</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon />
              <span>Impression directe</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon />
              <span>Signature électronique</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckIcon />
              <span>Gestion des acomptes</span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex justify-between items-center pt-4 border-t">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 hover:text-gray-800 font-medium"
          >
            Fermer
          </button>
          
          <button
            onClick={() => {
              onSuccess("✅ Guide consulté avec succès ! Vous pouvez maintenant générer vos PDF.");
              onClose();
            }}
            className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg font-medium flex items-center space-x-2"
          >
            <Download className="w-5 h-5" />
            <span>Compris, générer mes PDF</span>
          </button>
        </div>
      </div>
    </Modal>
  );
};

// Icône de vérification simple
const CheckIcon = () => (
  <svg className="w-4 h-4 text-green-500" fill="currentColor" viewBox="0 0 20 20">
    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
  </svg>
);
