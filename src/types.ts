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

export interface Review {
  id: string;
  productId: string;
  userId: string;
  userName: string;
  userPhoto?: string;
  rating: number; // 1 to 5
  comment: string;
  verifiedPurchase: boolean;
  freshnessRating?: number; // 1 to 5
  packagingRating?: number; // 1 to 5
  tasteRating?: number; // 1 to 5
  helpfulCount?: number;
  helpfulUsers?: string[]; // Array of user UIDs who found this helpful
  images?: string[];
  sellerReply?: {
    reply: string;
    createdAt: string;
  };
  createdAt: string;
}
