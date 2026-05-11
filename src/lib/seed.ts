import { db } from './firebase';
import { collection, addDoc, getDocs, query, limit } from 'firebase/firestore';
import { handleFirestoreError, OperationType } from './error-handler';

const INITIAL_PRODUCTS = [
  {
    name: 'Smoked Spanish Paprika',
    description: 'Intensity deep red color with a robust, smoky aroma. Sourced from the La Vera region.',
    basePrice: 12.50,
    category: 'Spices',
    stockQuantity: 1500,
    threshold: 200,
    unit: 'g',
    tier: 'Standard',
    image: 'https://images.unsplash.com/photo-1599940824399-b87987ceb72a?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Tellicherry Peppercorns',
    description: 'Extra large peppercorns with a complex, citrusy heat. The pinnacle of black pepper.',
    basePrice: 18.00,
    category: 'Spices',
    stockQuantity: 800,
    threshold: 100,
    unit: 'g',
    tier: 'Premium',
    image: 'https://images.unsplash.com/photo-1509358740172-f77c168f6312?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Marcona Almonds',
    description: 'The "Queen of Almonds," slow-roasted in sea salt. Exceptionally sweet and buttery.',
    basePrice: 22.00,
    category: 'Nuts',
    stockQuantity: 500,
    threshold: 50,
    unit: 'g',
    tier: 'Premium',
    image: 'https://images.unsplash.com/photo-1508817628294-5a453fa0b8fb?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Green Cardamom Pods',
    description: 'High altitude pods from Kerala. Extremely fragrant with minty, herbal notes.',
    basePrice: 14.00,
    category: 'Spices',
    stockQuantity: 1200,
    threshold: 150,
    unit: 'g',
    tier: 'Standard',
    image: 'https://images.unsplash.com/photo-1627662236973-4fda03d0023a?auto=format&fit=crop&q=80&w=400'
  },
  {
    name: 'Raw Vietnam Cashews',
    description: 'Large, creamy cashews perfect for snacking or making artisan nut milks.',
    basePrice: 9.50,
    category: 'Nuts',
    stockQuantity: 3000,
    threshold: 500,
    unit: 'g',
    tier: 'Basic',
    image: 'https://images.unsplash.com/photo-1554522271-be6f8510a111?auto=format&fit=crop&q=80&w=400'
  }
];

export async function seedProducts() {
  const productsCol = collection(db, 'products');
  let snapshot;
  try {
    snapshot = await getDocs(query(productsCol, limit(1)));
  } catch (error) {
    handleFirestoreError(error, OperationType.LIST, 'products');
    return false;
  }
  
  if (snapshot.empty) {
    console.log('Seeding products...');
    try {
      for (const product of INITIAL_PRODUCTS) {
        await addDoc(productsCol, product);
      }
      console.log('Seeding complete.');
      return true;
    } catch (error) {
      // Permission error is expected for non-admins, but we must report it
      try {
        handleFirestoreError(error, OperationType.WRITE, 'products');
      } catch (e) {
        console.warn('Seeding failed due to permissions - this is normal for non-admin users.');
      }
      return false;
    }
  }
  return false;
}
