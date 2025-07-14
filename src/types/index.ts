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
  delivery: {
    method: string;
    notes: string;
  };
  payment: {
    method: string;
    depositAmount: number;
  };
  products: Product[];
  signature?: string;
}

export type ToastType = 'success' | 'error';