export type UserRole = 'customer' | 'seller' | 'admin';

export interface UserProfile {
  uid: string;
  email: string;
  displayName: string;
  photoURL?: string;
  role: UserRole;
  createdAt: string;
}

export interface SellerProfile {
  id: string; // Matches user uid
  businessName: string;
  farmName: string;
  type: string;
  phone: string;
  whatsapp: string;
  country: string;
  isoCode: string;
  city: string;
  address: string;
  verified: boolean;
  commissionRate: number;
  documents?: string[];
  aiAudit?: {
    confidenceScore: number;
    flags: string[];
    summary: string;
    lastAudited: string;
  };
  createdAt?: string;
}

export interface Product {
  id: string;
  name: string;
  category: string;
  description: string;
  price: number;
  discountPrice?: number;
  unit: 'kg' | 'unit' | 'box' | 'g';
  stock: number;
  sellerId: string;
  sellerName: string;
  originCountry: string;
  isOrganic: boolean;
  image: string;
  rating: number;
  reviewCount: number;
  status: 'active' | 'draft' | 'out_of_stock';
  lowStockThreshold?: number;
  createdAt: string;
  selectedVariations?: {
    size: string;
    ripeness: string;
    packaging: string;
    delivery: string;
    deliveryDate: string;
  };
}

export interface OrderItem {
  productId: string;
  name: string;
  price: number;
  quantity: number;
  sellerId: string;
  selectedVariations?: {
    size: string;
    ripeness: string;
    packaging: string;
    delivery: string;
    deliveryDate: string;
  };
}

export interface Order {
  id: string;
  customerId: string;
  items: OrderItem[];
  totalAmount: number;
  commissionAmount: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  shippingAddress: string;
  createdAt: string;
}
