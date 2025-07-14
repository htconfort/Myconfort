import { useState } from 'react';
import { ToastType } from '../types';

export const useToast = () => {
  const [toast, setToast] = useState({
    show: false,
    message: '',
    type: 'success' as ToastType
  });

  const showToast = (message: string, type: ToastType = 'success') => {
    setToast({ show: true, message, type });
  };

  const hideToast = () => {
    setToast(prev => ({ ...prev, show: false }));
  };

  return { toast, showToast, hideToast };
};