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
  subtotalAmount?: number;
  shippingAmount?: number;
  commissionAmount: number;
  commissionRate?: number;
  status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled';
  paymentMethod?: 'UPI_DIRECT' | 'CARD_ESCROW' | 'NET_BANKING';
  paymentStatus?: 'paid' | 'pending' | 'failed' | 'verifying';
  payeeUpiId?: string;
  payeeName?: string;
  payeeEmail?: string;
  utrNumber?: string;
  transactionRef?: string;
  paidAt?: string;
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

export type NotificationType = 
  | 'low_stock' 
  | 'order_received' 
  | 'system' 
  | 'platform_commission' 
  | 'payment_success' 
  | 'developer_notice' 
  | 'payout_ready' 
  | 'crop_doctor_update';

export interface AppNotification {
  id: string;
  userId: string;
  type: NotificationType;
  title: string;
  message: string;
  productId?: string;
  orderId?: string;
  amount?: number;
  upiId?: string;
  read: boolean;
  createdAt: string;
}

export interface PlatformPayeeConfig {
  platformName: string;
  developerName: string;
  developerEmail: string;
  upiId: string;
  merchantName: string;
  commissionRate: number; // percentage, e.g., 10%
  upiQrUrl: string;
  supportPhone?: string;
}

export const FRESH_WORLD_PAYEE: PlatformPayeeConfig = {
  platformName: 'Fresh World',
  developerName: 'Santosh Prasad',
  developerEmail: 'samtoshprasad8891@gmail.com',
  upiId: '9279120271ybl',
  merchantName: 'Fresh World Developer',
  commissionRate: 10,
  upiQrUrl: 'upi://pay?pa=9279120271ybl&pn=Fresh%20World%20Developer&cu=INR',
};
