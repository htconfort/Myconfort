import React from 'react';
import { CheckCircle, AlertCircle } from 'lucide-react';
import { ToastType } from '../../types';

interface ToastProps {
  message: string;
  type: ToastType;
  show: boolean;
  onClose: () => void;
}

export const Toast: React.FC<ToastProps> = ({ message, type, show, onClose }) => {
  React.useEffect(() => {
    if (show) {
      const timer = setTimeout(onClose, 3000);
      return () => clearTimeout(timer);
    }
  }, [show, onClose]);

  if (!show) return null;

  return (
    <div className={`fixed bottom-4 right-4 z-50 transform transition-all duration-300 ${
      show ? 'translate-y-0 opacity-100' : 'translate-y-2 opacity-0'
    }`}>
      <div className={`flex items-center space-x-2 px-4 py-2 rounded-lg shadow-lg ${
        type === 'success' 
          ? 'bg-green-500 text-white' 
          : 'bg-red-500 text-white'
      }`}>
        {type === 'success' ? (
          <CheckCircle className="w-5 h-5" />
        ) : (
          <AlertCircle className="w-5 h-5" />
        )}
        <span>{message}</span>
      </div>
    </div>
  );
};
