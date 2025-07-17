import React, { useRef, useEffect, useState } from 'react';
import { X, RotateCcw, Check } from 'lucide-react';

interface SignaturePadProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (signature: string) => void;
}

export const SignaturePad: React.FC<SignaturePadProps> = ({ isOpen, onClose, onSave }) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signaturePad, setSignaturePad] = useState<any>(null);

  useEffect(() => {
    if (isOpen && canvasRef.current) {
      // Dynamically import SignaturePad
      import('signature_pad').then((SignaturePadModule) => {
        const SignaturePad = SignaturePadModule.default;
        const canvas = canvasRef.current!;
        
        // Set canvas size
        const rect = canvas.getBoundingClientRect();
        canvas.width = rect.width * window.devicePixelRatio;
        canvas.height = rect.height * window.devicePixelRatio;
        
        const ctx = canvas.getContext('2d')!;
        ctx.scale(window.devicePixelRatio, window.devicePixelRatio);
        
        const pad = new SignaturePad(canvas, {
          backgroundColor: 'rgb(255, 255, 255)',
          penColor: 'rgb(0, 0, 0)',
          minWidth: 1,
          maxWidth: 3,
        });
        
        setSignaturePad(pad);
        
        // Add event listeners
        const startDrawing = () => setIsDrawing(true);
        const stopDrawing = () => setIsDrawing(false);
        
        canvas.addEventListener('mousedown', startDrawing);
        canvas.addEventListener('touchstart', startDrawing);
        canvas.addEventListener('mouseup', stopDrawing);
        canvas.addEventListener('touchend', stopDrawing);
        
        return () => {
          canvas.removeEventListener('mousedown', startDrawing);
          canvas.removeEventListener('touchstart', startDrawing);
          canvas.removeEventListener('mouseup', stopDrawing);
          canvas.removeEventListener('touchend', stopDrawing);
        };
      });
    }
  }, [isOpen]);

  const clearSignature = () => {
    if (signaturePad) {
      signaturePad.clear();
    }
  };

  const saveSignature = () => {
    if (signaturePad && !signaturePad.isEmpty()) {
      const dataURL = signaturePad.toDataURL();
      onSave(dataURL);
      onClose();
    } else {
      alert('Veuillez fournir une signature avant de valider.');
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-xl font-bold text-[#14281D]">Signature du client</h3>
          <button
            onClick={onClose}
            className="text-gray-500 hover:text-gray-700 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>
        
        <div className="p-4">
          <div className="border-2 border-gray-300 rounded mb-4 bg-white">
            <canvas
              ref={canvasRef}
              className="w-full h-48 touch-none"
              style={{ touchAction: 'none' }}
            />
          </div>
          
          <div className="text-sm text-gray-600 mb-4 text-center">
            {isDrawing ? 'Signature en cours...' : 'Signez dans la zone ci-dessus'}
          </div>
          
          <div className="flex justify-between">
            <button
              onClick={clearSignature}
              className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
            >
              <RotateCcw className="w-4 h-4" />
              <span>Effacer</span>
            </button>
            
            <div className="flex space-x-2">
              <button
                onClick={onClose}
                className="bg-gray-500 hover:bg-gray-600 text-white px-4 py-2 rounded-lg transition-all"
              >
                Annuler
              </button>
              <button
                onClick={saveSignature}
                className="bg-[#477A0C] hover:bg-[#3A6A0A] text-white px-4 py-2 rounded-lg flex items-center space-x-2 transition-all"
              >
                <Check className="w-4 h-4" />
                <span>Valider</span>
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
