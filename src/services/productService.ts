import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, query, where, orderBy, getDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { Product } from '../types';

const COLLECTION_NAME = 'products';

export const productService = {
  async getAllProducts(): Promise<Product[]> {
    const q = query(collection(db, COLLECTION_NAME), orderBy('createdAt', 'desc'));
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  async getProductsBySeller(sellerId: string): Promise<Product[]> {
    const q = query(
      collection(db, COLLECTION_NAME),
      where('sellerId', '==', sellerId),
      orderBy('createdAt', 'desc')
    );
    const snapshot = await getDocs(q);
    return snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() } as Product));
  },

  async getProduct(id: string): Promise<Product | null> {
    const docRef = doc(db, COLLECTION_NAME, id);
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return { id: docSnap.id, ...docSnap.data() } as Product;
    }
    return null;
  },

  async addProduct(product: Omit<Product, 'id' | 'createdAt'>): Promise<string> {
    const docRef = await addDoc(collection(db, COLLECTION_NAME), {
      ...product,
      createdAt: new Date().toISOString(),
    });
    return docRef.id;
  },

  async updateProduct(id: string, product: Partial<Product>): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await updateDoc(docRef, product);
  },

  async deleteProduct(id: string): Promise<void> {
    const docRef = doc(db, COLLECTION_NAME, id);
    await deleteDoc(docRef);
  },

  async seedProducts(products: Product[]) {
    // Only for initial setup if needed
    for (const p of products) {
      const { id, ...data } = p;
      await addDoc(collection(db, COLLECTION_NAME), data);
    }
  }
};
