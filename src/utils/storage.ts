import { Client, Invoice } from '../types';

export const saveClients = (clients: Client[]): void => {
  localStorage.setItem('myconfortClients', JSON.stringify(clients));
};

export const loadClients = (): Client[] => {
  const stored = localStorage.getItem('myconfortClients');
  return stored ? JSON.parse(stored) : [];
};

export const saveDraft = (invoice: Invoice): void => {
  localStorage.setItem('myconfortInvoiceDraft', JSON.stringify(invoice));
};

export const loadDraft = (): Invoice | null => {
  const stored = localStorage.getItem('myconfortInvoiceDraft');
  return stored ? JSON.parse(stored) : null;
};

export const saveClient = (client: Client): void => {
  const clients = loadClients();
  const existingIndex = clients.findIndex(c => 
    c.email === client.email && c.name === client.name
  );
  
  if (existingIndex >= 0) {
    clients[existingIndex] = { ...clients[existingIndex], ...client };
  } else {
    clients.push({
      ...client,
      id: Date.now().toString(),
      createdAt: new Date().toISOString()
    });
  }
  
  saveClients(clients);
};