import { ProductCatalog } from '../types';

export const productCatalog: ProductCatalog[] = [
  // Matelas
  { category: 'Matelas', name: 'MATELAS BAMBOU 70 x 190', priceTTC: 900, autoCalculateHT: true },
  { category: 'Matelas', name: 'MATELAS BAMBOU 80 x 200', priceTTC: 1050, autoCalculateHT: true },
  { category: 'Matelas', name: 'MATELAS BAMBOU 90 x 190', priceTTC: 1110, autoCalculateHT: true },
  { category: 'Matelas', name: 'MATELAS BAMBOU 90 x 200', priceTTC: 1150, autoCalculateHT: true },
  { category: 'Matelas', name: 'MATELAS BAMBOU 120 x 190', priceTTC: 1600, autoCalculateHT: true },
  { category: 'Matelas', name: 'MATELAS BAMBOU 140 x 190', priceTTC: 1800, autoCalculateHT: true },
  { category: 'Matelas', name: 'MATELAS BAMBOU 140 x 200', priceTTC: 1880, autoCalculateHT: true },
  { category: 'Matelas', name: 'MATELAS BAMBOU 160 x 200', priceTTC: 2100, autoCalculateHT: true },
  { category: 'Matelas', name: 'MATELAS BAMBOU 180 x 200', priceTTC: 2200, autoCalculateHT: true },
  { category: 'Matelas', name: 'MATELAS BAMBOU 200 x 200', priceTTC: 2300, autoCalculateHT: true },

  // Sur-matelas
  { category: 'Sur-matelas', name: 'SURMATELAS BAMBOU 70 x 190', priceTTC: 220, autoCalculateHT: true },
  { category: 'Sur-matelas', name: 'SURMATELAS BAMBOU 80 x 200', priceTTC: 280, autoCalculateHT: true },
  { category: 'Sur-matelas', name: 'SURMATELAS BAMBOU 90 x 190', priceTTC: 310, autoCalculateHT: true },
  { category: 'Sur-matelas', name: 'SURMATELAS BAMBOU 90 x 200', priceTTC: 320, autoCalculateHT: true },
  { category: 'Sur-matelas', name: 'SURMATELAS BAMBOU 120 x 190', priceTTC: 420, autoCalculateHT: true },
  { category: 'Sur-matelas', name: 'SURMATELAS BAMBOU 140 x 190', priceTTC: 450, autoCalculateHT: true },
  { category: 'Sur-matelas', name: 'SURMATELAS BAMBOU 160 x 200', priceTTC: 490, autoCalculateHT: true },
  { category: 'Sur-matelas', name: 'SURMATELAS BAMBOU 180 x 200', priceTTC: 590, autoCalculateHT: true },
  { category: 'Sur-matelas', name: 'SURMATELAS BAMBOU 200 x 200', priceTTC: 630, autoCalculateHT: true },
  
  // Couettes
  { category: 'Couettes', name: 'Couette 220x240', priceTTC: 300, autoCalculateHT: true },
  { category: 'Couettes', name: 'Couette 240 x 260', priceTTC: 350, autoCalculateHT: true },
  
  // Oreillers
  { category: 'Oreillers', name: 'Oreiller Douceur', priceTTC: 80, autoCalculateHT: true },
  { category: 'Oreillers', name: 'Oreiller Thalasso', priceTTC: 60, autoCalculateHT: true },
  { category: 'Oreillers', name: 'Oreiller Dual', priceTTC: 60, autoCalculateHT: true },
  { category: 'Oreillers', name: 'Oreiller Panama', priceTTC: 70, autoCalculateHT: true },
  { category: 'Oreillers', name: 'Oreiller Papillon', priceTTC: 80, autoCalculateHT: true },
  { category: 'Oreillers', name: 'Pack de 2 oreillers', priceTTC: 100, autoCalculateHT: true },
  { category: 'Oreillers', name: 'Traversin 140', priceTTC: 140, autoCalculateHT: true },
  { category: 'Oreillers', name: 'Traversin 160', priceTTC: 160, autoCalculateHT: true },
  { category: 'Oreillers', name: 'Pack divers', price: 0, priceTTC: 0, autoCalculateHT: false },
  
  // Accessoires
  { category: 'Accessoires', name: 'Protège-matelas', price: 0, priceTTC: 0, autoCalculateHT: false },
  { category: 'Accessoires', name: 'Housse de couette', price: 0, priceTTC: 0, autoCalculateHT: false },
  { category: 'Accessoires', name: 'Taie d\'oreiller', price: 0, priceTTC: 0, autoCalculateHT: false }
];

export const productCategories = [
  'Matelas',
  'Sur-matelas', 
  'Couettes',
  'Oreillers',
  'Accessoires'
];
