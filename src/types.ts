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

export interface PlatformPayeeConfig {
  platformName: string;
  developerName: string;
  developerEmail: string;
  upiId: string;
  merchantName: string;
  commissionRate: number; // percentage, e.g., 10%
  upiQrUrl: string;
  supportPhone?: string;
  razorpayKeyId?: string;
}

export const FRESH_WORLD_PAYEE: PlatformPayeeConfig = {
  platformName: 'Fresh World Global SaaS Platform',
  developerName: 'Santosh Prasad',
  developerEmail: 'santoshprasad8891@gmail.com',
  upiId: '9279120271@ybl',
  merchantName: 'Fresh World Platform',
  commissionRate: 10,
  upiQrUrl: 'upi://pay?pa=9279120271@ybl&pn=FreshWorld%20Global%20Platform&cu=INR',
  razorpayKeyId: 'rzp_test_FW_SUB_9279120271',
  supportPhone: '+91 9279120271',
};

// ==========================================
// UNIVERSAL SUBSCRIPTION & VALIDITY ENGINE TYPES
// ==========================================

export type BillingInterval = '1_month' | '3_months' | '6_months' | '12_months' | 'lifetime';

export type SubscriptionStatus = 
  | 'trial' 
  | 'active' 
  | 'grace_period' 
  | 'suspended' 
  | 'cancelled' 
  | 'expired';

export interface UsageLimits {
  apiRequestsPerMonth: number | 'Unlimited';
  productListings: number | 'Unlimited';
  exportLicenses: number;
  priorityColdChain: boolean;
  cropDoctorConsultations: number | 'Unlimited';
  customDomainEnabled: boolean;
  supportTier: 'Standard' | 'Priority' | 'Dedicated 24/7 Account Manager';
}

export interface SubscriptionPlan {
  id: string;
  name: string;
  serviceName: string;
  description: string;
  price: number;
  currency: 'INR' | 'USD';
  billingInterval: BillingInterval;
  validityDays: number;
  trialPeriodDays: number;
  autoRenewEligible: boolean;
  manualRenewOption: boolean;
  cancellationPolicy: string;
  refundPolicy: string;
  taxPercentage: number;
  applicationFee: number;
  renewablePrice: number;
  promoDiscountPrice?: number;
  features: string[];
  usageLimits: UsageLimits;
  active: boolean;
  badge?: string;
  popular?: boolean;
  createdAt: string;
  updatedAt?: string;
}

export interface RenewalReminderPreferences {
  email30Days: boolean;
  email15Days: boolean;
  email7Days: boolean;
  email3Days: boolean;
  email1Day: boolean;
  emailOnRenewal: boolean;
  emailOnExpiry: boolean;
  emailOnFailedPayment: boolean;
}

export interface CustomerSubscription {
  id: string;
  userId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  serviceName: string;
  pricePaid: number;
  currency: 'INR' | 'USD';
  billingInterval: BillingInterval;
  validityDays: number;
  status: SubscriptionStatus;
  startDate: string;
  nextBillingDate: string;
  expirationDate: string;
  gracePeriodEndsAt?: string;
  autoRenewAuthorized: boolean;
  paymentMethod: 'UPI' | 'RAZORPAY' | 'CARD';
  paymentMethodDetails?: {
    upiId?: string;
    cardLast4?: string;
    razorpayOrderId?: string;
    mandateAuthorized?: boolean;
  };
  autoRenewAttempts: number;
  lastPaymentId?: string;
  cancellationRequested?: boolean;
  cancellationReason?: string;
  cancellationConsequencesAcknowledged?: boolean;
  cancelledAt?: string;
  renewalReminderPreferences: RenewalReminderPreferences;
  createdAt: string;
  updatedAt: string;
}

export interface SubscriptionPayment {
  id: string;
  subscriptionId: string;
  customerId: string;
  customerName: string;
  customerEmail: string;
  planId: string;
  planName: string;
  amount: number;
  taxAmount: number;
  applicationFee: number;
  totalAmount: number;
  currency: 'INR' | 'USD';
  paymentProvider: 'UPI' | 'RAZORPAY' | 'CARD';
  upiId?: string;
  utrNumber?: string;
  razorpayPaymentId?: string;
  razorpayOrderId?: string;
  razorpaySignature?: string;
  status: 'success' | 'failed' | 'refunded' | 'pending';
  failureReason?: string;
  invoiceNumber: string;
  isRenewal: boolean;
  autoRenewAttemptNumber?: number;
  createdAt: string;
}

export interface SubscriptionEmailTemplate {
  id: string;
  templateKey: 
    | 'reminder_30d' 
    | 'reminder_15d' 
    | 'reminder_7d' 
    | 'reminder_3d' 
    | 'reminder_1d' 
    | 'renewal_due_today' 
    | 'renewal_success' 
    | 'renewal_failed' 
    | 'subscription_expired' 
    | 'grace_period_alert'
    | 'cancellation_confirmed';
  name: string;
  subject: string;
  bodyHtml: string;
  bodyText: string;
  isTransactional: boolean;
  variables: string[];
  active: boolean;
  updatedAt: string;
}

export interface SubscriptionCoupon {
  id: string;
  code: string;
  discountPercent?: number;
  discountAmount?: number;
  validUntil: string;
  maxRedemptions: number;
  timesRedeemed: number;
  active: boolean;
  planIds?: string[];
  createdAt: string;
}

export interface SubscriptionAuditLog {
  id: string;
  action: 
    | 'PLAN_CREATED' 
    | 'PLAN_UPDATED' 
    | 'PLAN_DEACTIVATED' 
    | 'SUBSCRIPTION_ACTIVATED' 
    | 'SUBSCRIPTION_RENEWED' 
    | 'AUTO_RENEW_ATTEMPT' 
    | 'AUTO_RENEW_FAILED' 
    | 'MANUAL_RENEWAL' 
    | 'SUBSCRIPTION_CANCELLED' 
    | 'SUBSCRIPTION_EXPIRED' 
    | 'GRACE_PERIOD_STARTED' 
    | 'TEMPLATE_UPDATED' 
    | 'COUPON_CREATED'
    | 'REFUND_PROCESSED';
  actorId: string;
  actorEmail: string;
  targetSubscriptionId?: string;
  planId?: string;
  details: string;
  timestamp: string;
}

export interface SocialNetworkShare {
  id: string;
  name: string;
  category: 'Social' | 'Messaging' | 'Professional' | 'Community' | 'Video & Visual';
  iconColor: string;
  shareUrlTemplate: (url: string, text: string, title: string) => string;
  guide: string;
}

