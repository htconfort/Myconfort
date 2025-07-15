import { useState, useEffect } from 'react';
import { Invoice, Client, ToastType } from '../types';
import { generateInvoiceNumber } from '../utils/calculations';
import { saveClients, loadClients, saveDraft, loadDraft, saveClient, saveInvoice, loadInvoices } from '../utils/storage';

export const useInvoice = () => {
  const [invoice, setInvoice] = useState<Invoice>({
    invoiceNumber: generateInvoiceNumber(),
    invoiceDate: new Date().toISOString().split('T')[0],
    eventLocation: '',
    advisorName: '',
    invoiceNotes: '',
    termsAccepted: false,
    taxRate: 20,
    client: {
      name: '',
      address: '',
      postalCode: '',
      city: '',
      phone: '',
      email: '',
      housingType: '',
      doorCode: ''
    },
    delivery: {
      method: '',
      notes: ''
    },
    payment: {
      method: '',
      depositAmount: 0
    },
    products: [],
    signature: ''
  });

  const [clients, setClients] = useState<Client[]>([]);
  const [invoices, setInvoices] = useState<Invoice[]>([]);

  useEffect(() => {
    setClients(loadClients());
    setInvoices(loadInvoices());
    const draft = loadDraft();
    if (draft) {
      setInvoice(draft);
    }
  }, []);

  const updateInvoice = (updates: Partial<Invoice>) => {
    setInvoice(prev => ({ ...prev, ...updates }));
  };

  const saveInvoiceData = () => {
    saveDraft(invoice);
    if (invoice.client.name && invoice.client.email) {
      saveClient(invoice.client);
      setClients(loadClients());
    }
    saveInvoice(invoice);
    setInvoices(loadInvoices());
  };

  const createNewInvoice = () => {
    const newInvoiceNumber = generateInvoiceNumber();
    setInvoice({
      ...invoice,
      invoiceNumber: newInvoiceNumber,
      invoiceDate: new Date().toISOString().split('T')[0],
      eventLocation: '',
      advisorName: '',
      invoiceNotes: '',
      termsAccepted: false,
      client: {
        name: '',
        address: '',
        postalCode: '',
        city: '',
        phone: '',
        email: '',
        housingType: '',
        doorCode: ''
      },
      delivery: { method: '', notes: '' },
      payment: { method: '', depositAmount: 0 },
      products: [],
      signature: ''
    });
    localStorage.removeItem('myconfortInvoiceDraft');
  };

  const validateInvoice = () => {
    const errors: string[] = [];
    
    if (!invoice.invoiceDate) errors.push('Date de facture');
    if (!invoice.eventLocation) errors.push('Lieu d\'événement');
    if (!invoice.client.name) errors.push('Nom client');
    if (!invoice.client.address) errors.push('Adresse client');
    if (!invoice.client.postalCode) errors.push('Code postal');
    if (!invoice.client.city) errors.push('Ville');
    if (!invoice.client.phone) errors.push('Téléphone');
    if (!invoice.client.email) errors.push('Email');
    if (!invoice.client.housingType) errors.push('Type de logement');
    if (!invoice.client.doorCode) errors.push('Code porte');
    
    // 🚫 VALIDATION RENFORCÉE : Produits obligatoires
    if (!invoice.products || invoice.products.length === 0) {
      errors.push('Au moins un produit');
    } else {
      // Vérifier que les produits ont des données valides
      const invalidProducts = invoice.products.filter(product => 
        !product.name || product.quantity <= 0 || product.priceTTC <= 0
      );
      if (invalidProducts.length > 0) {
        errors.push(`${invalidProducts.length} produit(s) invalide(s)`);
      }
    }
    
    return {
      isValid: errors.length === 0,
      errors
    };
  };

  return {
    invoice,
    clients,
    invoices,
    updateInvoice,
    saveInvoiceData,
    createNewInvoice,
    validateInvoice,
    setClients,
    setInvoices
  };
};