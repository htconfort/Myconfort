export interface Client {
  id?: string;
  name: string;
  address: string;
  postalCode: string;
  city: string;
  housingType?: string;
  doorCode?: string;
  phone: string;
  email: string;
  siret?: string;
  createdAt?: string;
  invoices?: string[];
}

export interface Product {
  id?: string;
  name: string;
  category: string;
  quantity: number;
  unitPrice: number;
  priceTTC: number;
  discount: number;
  discountType: 'percent' | 'fixed';
  autoCalculateHT?: boolean;
}

export interface ProductCatalog {
  category: string;
  name: string;
  price?: number;
  priceTTC: number;
  autoCalculateHT?: boolean;
}

export interface DeliveryInfo {
  method: string;
  notes: string;
}

export interface PaymentInfo {
  method: string;
  depositAmount: number;
}

export interface Invoice {
  invoiceNumber: string;
  invoiceDate: string;
  eventLocation: string;
  advisorName: string;
  invoiceNotes: string;
  termsAccepted: boolean;
  taxRate: number;
  client: Client;
  delivery: DeliveryInfo;
  payment: PaymentInfo;
  products: Product[];
  signature?: string;
}

export type ToastType = 'success' | 'error';

export interface ValidationError {
  field: string;
  message: string;
}

// Add global window interface extension
declare global {
  interface Window {
    generateInvoicePDF: () => void;
  }
}
