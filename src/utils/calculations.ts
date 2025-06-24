export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat('fr-FR', {
    style: 'currency',
    currency: 'EUR'
  }).format(amount);
};

export const calculateHT = (ttcPrice: number, taxRate: number): number => {
  return ttcPrice / (1 + (taxRate / 100));
};

export const calculateTTC = (htPrice: number, taxRate: number): number => {
  return htPrice * (1 + (taxRate / 100));
};

export const calculateProductTotal = (
  quantity: number,
  priceTTC: number,
  discount: number,
  discountType: 'percent' | 'fixed'
): number => {
  let productTotal = priceTTC * quantity;
  
  if (discount > 0) {
    if (discountType === 'percent') {
      productTotal -= productTotal * (discount / 100);
    } else {
      productTotal -= discount * quantity;
    }
  }
  
  return Math.max(0, productTotal);
};

export const generateInvoiceNumber = (): string => {
  const now = new Date();
  const year = now.getFullYear();
  const lastInvoiceNumber = localStorage.getItem('lastInvoiceNumber') || `${year}-000`;
  
  try {
    const lastNumber = parseInt(lastInvoiceNumber.split('-')[1]) || 0;
    const newNumber = `${year}-${String(lastNumber + 1).padStart(3, '0')}`;
    localStorage.setItem('lastInvoiceNumber', newNumber);
    return newNumber;
  } catch (error) {
    // Fallback if parsing fails
    const fallbackNumber = `${year}-001`;
    localStorage.setItem('lastInvoiceNumber', fallbackNumber);
    return fallbackNumber;
  }
};

export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

export const validatePhone = (phone: string): boolean => {
  const phoneRegex = /^(?:(?:\+|00)33|0)\s*[1-9](?:[\s.-]*\d{2}){4}$/;
  return phoneRegex.test(phone.replace(/\s/g, ''));
};

export const validatePostalCode = (postalCode: string): boolean => {
  const postalCodeRegex = /^[0-9]{5}$/;
  return postalCodeRegex.test(postalCode);
};

export const formatPhoneNumber = (phone: string): string => {
  const cleaned = phone.replace(/\D/g, '');
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{2})(\d{2})(\d{2})(\d{2})/, '$1 $2 $3 $4 $5');
  }
  return phone;
};