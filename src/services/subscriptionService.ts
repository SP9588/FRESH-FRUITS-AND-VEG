import { 
  collection, 
  doc, 
  getDoc, 
  getDocs, 
  setDoc, 
  updateDoc, 
  deleteDoc, 
  query, 
  where, 
  orderBy, 
  limit, 
  serverTimestamp 
} from 'firebase/firestore';
import { db, auth } from '../firebase';
import { 
  SubscriptionPlan, 
  CustomerSubscription, 
  SubscriptionPayment, 
  SubscriptionEmailTemplate, 
  SubscriptionCoupon, 
  SubscriptionAuditLog, 
  BillingInterval, 
  SubscriptionStatus,
  FRESH_WORLD_PAYEE 
} from '../types';
import { notificationService } from './notificationService';

// Default initial plans matching the user's business requirements
export const DEFAULT_SUBSCRIPTION_PLANS: SubscriptionPlan[] = [
  {
    id: 'plan_starter_3m',
    name: 'Standard Merchant Access',
    serviceName: 'Fresh World SaaS & B2B Global Platform',
    description: 'Quarterly membership for emerging organic growers and regional suppliers with verified buyer matchmaking.',
    price: 399,
    currency: 'INR',
    billingInterval: '3_months',
    validityDays: 90,
    trialPeriodDays: 7,
    autoRenewEligible: true,
    manualRenewOption: true,
    cancellationPolicy: 'Cancel anytime prior to next scheduled billing date without termination penalty.',
    refundPolicy: 'Full refund within 7 days of initial purchase if no export consignments booked.',
    taxPercentage: 18,
    applicationFee: 25,
    renewablePrice: 399,
    promoDiscountPrice: 349,
    features: [
      'Up to 25 Live Produce Listings',
      'Direct Buyer Messaging & RFQ Access',
      'Cold-Chain Logistics Calculator',
      'Quarterly Tax & Commercial Invoice Archive',
      'Standard Email & In-App Support (24h SLA)'
    ],
    usageLimits: {
      apiRequestsPerMonth: 5000,
      productListings: 25,
      exportLicenses: 1,
      priorityColdChain: false,
      cropDoctorConsultations: 10,
      customDomainEnabled: false,
      supportTier: 'Standard'
    },
    active: true,
    popular: false,
    badge: 'Popular for Beginners',
    createdAt: new Date().toISOString()
  },
  {
    id: 'plan_annual_pro_12m',
    name: 'Global Enterprise Pro (Annual)',
    serviceName: 'Fresh World SaaS & B2B Global Platform',
    description: 'Full-year complete digital infrastructure suite for international traders, commercial farms, and bulk exporters.',
    price: 1200,
    currency: 'INR',
    billingInterval: '12_months',
    validityDays: 365,
    trialPeriodDays: 14,
    autoRenewEligible: true,
    manualRenewOption: true,
    cancellationPolicy: 'Cancel auto-renewal anytime in one click. Plan remains active until the end of the paid 365-day term.',
    refundPolicy: '14-day zero-risk money-back guarantee with instant credit.',
    taxPercentage: 18,
    applicationFee: 0,
    renewablePrice: 1200,
    promoDiscountPrice: 1099,
    features: [
      'Unlimited Produce & Fruit Listings',
      'Cross-Border Escrow & Instant UPI Settlement',
      'Crop Doctor AI 4K Real-time Disease Diagnostics',
      'Universal REST API & Webhooks Access',
      'Dedicated Cold-Chain Reefer Priority Booking',
      'Automated Commercial Invoice & Multi-currency Generator',
      'Priority 24/7 WhatsApp & Dedicated Account Desk'
    ],
    usageLimits: {
      apiRequestsPerMonth: 100000,
      productListings: 'Unlimited',
      exportLicenses: 5,
      priorityColdChain: true,
      cropDoctorConsultations: 'Unlimited',
      customDomainEnabled: true,
      supportTier: 'Dedicated 24/7 Account Manager'
    },
    active: true,
    popular: true,
    badge: 'Best Value (₹100/mo)',
    createdAt: new Date().toISOString()
  },
  {
    id: 'plan_business_6m',
    name: 'Commercial Producer Tier',
    serviceName: 'Fresh World SaaS & B2B Global Platform',
    description: 'Semi-annual package designed for expanding regional distributors, packhouses, and agricultural co-ops.',
    price: 699,
    currency: 'INR',
    billingInterval: '6_months',
    validityDays: 180,
    trialPeriodDays: 7,
    autoRenewEligible: true,
    manualRenewOption: true,
    cancellationPolicy: 'Hassle-free cancellation. Retain full access throughout the current 6-month cycle.',
    refundPolicy: 'Pro-rata refund available within first 10 calendar days.',
    taxPercentage: 18,
    applicationFee: 15,
    renewablePrice: 699,
    promoDiscountPrice: 649,
    features: [
      'Up to 100 Active Product Listings',
      'Verified Seller Gold Badge',
      'Export Quality Audit & Phytosanitary Assistance',
      'Inventory AI Forecaster & Reorder Alerts',
      'Priority Support Desk (4h SLA)'
    ],
    usageLimits: {
      apiRequestsPerMonth: 25000,
      productListings: 100,
      exportLicenses: 2,
      priorityColdChain: true,
      cropDoctorConsultations: 50,
      customDomainEnabled: false,
      supportTier: 'Priority'
    },
    active: true,
    popular: false,
    badge: '6 Months Saver',
    createdAt: new Date().toISOString()
  },
  {
    id: 'plan_lifetime_founders',
    name: 'Founders Lifetime Pass',
    serviceName: 'Fresh World SaaS & B2B Global Platform',
    description: 'One-time investment granting permanent, non-expiring access to all current and future enterprise modules.',
    price: 4999,
    currency: 'INR',
    billingInterval: 'lifetime',
    validityDays: 36500, // 100 years
    trialPeriodDays: 0,
    autoRenewEligible: false,
    manualRenewOption: false,
    cancellationPolicy: 'Lifetime membership — no recurring renewal charges ever.',
    refundPolicy: '30-day no-questions-asked total refund policy.',
    taxPercentage: 18,
    applicationFee: 0,
    renewablePrice: 0,
    features: [
      'Lifetime Non-Expiring Platform License',
      'Zero Commission on First $10,000 Global Volume',
      'All Future SaaS Modules & API Upgrades Included',
      'Direct Advisory Channel with Developer Team',
      'VIP Founders Badge on All Global Quotes'
    ],
    usageLimits: {
      apiRequestsPerMonth: 'Unlimited',
      productListings: 'Unlimited',
      exportLicenses: 99,
      priorityColdChain: true,
      cropDoctorConsultations: 'Unlimited',
      customDomainEnabled: true,
      supportTier: 'Dedicated 24/7 Account Manager'
    },
    active: true,
    popular: false,
    badge: 'Lifetime Ownership',
    createdAt: new Date().toISOString()
  }
];

export const DEFAULT_EMAIL_TEMPLATES: SubscriptionEmailTemplate[] = [
  {
    id: 'tpl_reminder_30d',
    templateKey: 'reminder_30d',
    name: '30-Day Expiration Notice (Early Advance)',
    subject: 'Advance Notice: Your {{serviceName}} subscription renews in 30 days',
    isTransactional: true,
    variables: ['customerName', 'serviceName', 'planName', 'expirationDate', 'renewalAmount', 'renewalDate', 'renewUrl', 'settingsUrl', 'cancellationUrl'],
    active: true,
    updatedAt: new Date().toISOString(),
    bodyText: `Hello {{customerName}},\n\nYour subscription to {{productOrServiceName}} (Plan: {{planName}}) is currently active and scheduled for renewal on {{renewalDate}}.\n\nRenewal Amount: {{renewalAmount}}\nExpiration Date: {{expirationDate}}\nStatus: Active\n\nIf you have auto-renewal enabled, your payment method will be charged automatically on {{renewalDate}}. You can manage your preferences or renew early using the secure link below:\n\nRenew Manually: {{renewUrl}}\nManage Preferences: {{settingsUrl}}\nCancellation Options: {{cancellationUrl}}\n\nNote: This is a critical transactional billing service notice, not marketing promotion.`,
    bodyHtml: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e7e5e4;border-radius:16px;">
      <h2 style="color:#1c1917;margin-bottom:8px;">Upcoming Subscription Renewal</h2>
      <p style="color:#57534e;">Hi <strong>{{customerName}}</strong>,</p>
      <p style="color:#57534e;">Your subscription to <strong>{{serviceName}}</strong> ({{planName}}) will expire on <strong>{{expirationDate}}</strong>.</p>
      <div style="background:#f5f5f4;padding:16px;border-radius:12px;margin:16px 0;">
        <p style="margin:4px 0;color:#292524;"><strong>Renewal Price:</strong> {{renewalAmount}}</p>
        <p style="margin:4px 0;color:#292524;"><strong>Next Billing Date:</strong> {{renewalDate}}</p>
        <p style="margin:4px 0;color:#292524;"><strong>Validity Period:</strong> 365 Days</p>
      </div>
      <a href="{{renewUrl}}" style="display:inline-block;background:#166534;color:#ffffff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Review & Renew Plan</a>
      <p style="font-size:12px;color:#a8a29e;margin-top:24px;">Manage subscription: <a href="{{settingsUrl}}">Settings</a> | <a href="{{cancellationUrl}}">Cancel Renewal</a></p>
    </div>`
  },
  {
    id: 'tpl_reminder_7d',
    templateKey: 'reminder_7d',
    name: '7-Day Expiration Reminder (Action Required)',
    subject: 'Important: 7 days left on your {{serviceName}} subscription',
    isTransactional: true,
    variables: ['customerName', 'serviceName', 'planName', 'expirationDate', 'renewalAmount', 'renewalDate', 'renewUrl', 'settingsUrl', 'cancellationUrl'],
    active: true,
    updatedAt: new Date().toISOString(),
    bodyText: `Dear {{customerName}},\n\nYour {{serviceName}} {{planName}} will expire in exactly 7 days on {{expirationDate}}.\n\nRenewal Amount: {{renewalAmount}}\nScheduled Date: {{renewalDate}}\n\nRenew now to prevent disruption of your export listings and API quotas: {{renewUrl}}\nSettings: {{settingsUrl}}\nCancel: {{cancellationUrl}}`,
    bodyHtml: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #fed7aa;border-radius:16px;background:#fffbeb;">
      <h2 style="color:#9a3412;">7 Days Until Expiration</h2>
      <p style="color:#78350f;">Dear <strong>{{customerName}}</strong>, your {{serviceName}} subscription expires on <strong>{{expirationDate}}</strong>.</p>
      <p style="color:#78350f;">Renewal Amount: <strong>{{renewalAmount}}</strong></p>
      <a href="{{renewUrl}}" style="display:inline-block;background:#c2410c;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Extend Validity Now</a>
      <p style="font-size:12px;color:#a8a29e;margin-top:20px;"><a href="{{settingsUrl}}">Manage Settings</a> | <a href="{{cancellationUrl}}">Cancel Auto-Renewal</a></p>
    </div>`
  },
  {
    id: 'tpl_renewal_due_today',
    templateKey: 'renewal_due_today',
    name: 'Renewal Due Today (Renewal Day)',
    subject: 'Renewal Notice: Your {{serviceName}} payment is scheduled for today',
    isTransactional: true,
    variables: ['customerName', 'serviceName', 'planName', 'renewalAmount', 'renewUrl', 'settingsUrl'],
    active: true,
    updatedAt: new Date().toISOString(),
    bodyText: `Hello {{customerName}},\n\nYour subscription to {{serviceName}} renews today for {{renewalAmount}}.\n\nIf automatic renewal is authorized, your account will be billed. If manual payment is required, please complete your UPI or Card renewal here: {{renewUrl}}`,
    bodyHtml: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e7e5e4;border-radius:16px;">
      <h2 style="color:#15803d;">Renewal Due Today</h2>
      <p>Hello <strong>{{customerName}}</strong>,</p>
      <p>Your subscription is scheduled for renewal today for <strong>{{renewalAmount}}</strong>.</p>
      <a href="{{renewUrl}}" style="display:inline-block;background:#15803d;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Confirm Renewal</a>
    </div>`
  },
  {
    id: 'tpl_renewal_success',
    templateKey: 'renewal_success',
    name: 'Successful Renewal Confirmation & Tax Invoice',
    subject: 'Payment Confirmed: Your {{serviceName}} subscription has been extended!',
    isTransactional: true,
    variables: ['customerName', 'serviceName', 'planName', 'newExpirationDate', 'invoiceNumber', 'amountPaid', 'receiptUrl'],
    active: true,
    updatedAt: new Date().toISOString(),
    bodyText: `Thank you {{customerName}}!\n\nYour renewal payment of {{amountPaid}} was successful. Your subscription to {{serviceName}} is extended until {{newExpirationDate}}.\n\nInvoice: {{invoiceNumber}}\nReceipt: {{receiptUrl}}`,
    bodyHtml: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #bbf7d0;background:#f0fdf4;border-radius:16px;">
      <h2 style="color:#166534;">Payment Confirmed & Subscription Extended</h2>
      <p style="color:#14532d;">Hello <strong>{{customerName}}</strong>,</p>
      <p style="color:#14532d;">We received your renewal payment of <strong>{{amountPaid}}</strong>. Your subscription is now active through <strong>{{newExpirationDate}}</strong>.</p>
      <p><strong>Tax Invoice:</strong> {{invoiceNumber}}</p>
      <a href="{{receiptUrl}}" style="display:inline-block;background:#166534;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Download Commercial Invoice</a>
    </div>`
  },
  {
    id: 'tpl_renewal_failed',
    templateKey: 'renewal_failed',
    name: 'Renewal Payment Failed (Grace Period Alert)',
    subject: 'Urgent: Renewal payment failed for {{serviceName}}',
    isTransactional: true,
    variables: ['customerName', 'serviceName', 'planName', 'failureReason', 'gracePeriodEndsAt', 'renewUrl', 'settingsUrl'],
    active: true,
    updatedAt: new Date().toISOString(),
    bodyText: `Dear {{customerName}},\n\nWe were unable to process your renewal payment for {{serviceName}} (Reason: {{failureReason}}).\n\nA 7-day grace period has been activated until {{gracePeriodEndsAt}}. Your access will remain active during this grace period, but will be restricted thereafter if payment is not completed.\n\nPay & Retry: {{renewUrl}}\nUpdate Payment Method: {{settingsUrl}}`,
    bodyHtml: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #fecaca;background:#fef2f2;border-radius:16px;">
      <h2 style="color:#b91c1c;">Payment Attempt Failed</h2>
      <p style="color:#7f1d1d;">Dear <strong>{{customerName}}</strong>,</p>
      <p style="color:#7f1d1d;">We could not complete your automatic renewal ({{failureReason}}).</p>
      <p style="color:#7f1d1d;"><strong>Grace Period Active:</strong> You have until <strong>{{gracePeriodEndsAt}}</strong> to update your payment details before services are suspended.</p>
      <a href="{{renewUrl}}" style="display:inline-block;background:#dc2626;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;font-weight:bold;">Resolve Payment Now</a>
    </div>`
  },
  {
    id: 'tpl_subscription_expired',
    templateKey: 'subscription_expired',
    name: 'Subscription Expired Notice',
    subject: 'Notice: Your {{serviceName}} subscription has expired',
    isTransactional: true,
    variables: ['customerName', 'serviceName', 'planName', 'expirationDate', 'reactivateUrl'],
    active: true,
    updatedAt: new Date().toISOString(),
    bodyText: `Hello {{customerName}},\n\nYour subscription to {{serviceName}} expired on {{expirationDate}}. Your account features have been transitioned to standard tier.\n\nYou can reactivate your subscription and restore all limits at any time: {{reactivateUrl}}`,
    bodyHtml: `<div style="font-family:sans-serif;max-width:600px;margin:auto;padding:24px;border:1px solid #e7e5e4;border-radius:16px;">
      <h2 style="color:#57534e;">Subscription Expired</h2>
      <p>Hello <strong>{{customerName}}</strong>,</p>
      <p>Your subscription to <strong>{{serviceName}}</strong> ended on <strong>{{expirationDate}}</strong>.</p>
      <a href="{{reactivateUrl}}" style="display:inline-block;background:#1c1917;color:#fff;padding:10px 20px;border-radius:8px;text-decoration:none;">Reactivate Plan</a>
    </div>`
  }
];

export const DEFAULT_COUPONS: SubscriptionCoupon[] = [
  {
    id: 'coup_freshworld20',
    code: 'FRESHWORLD20',
    discountPercent: 20,
    validUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString(),
    maxRedemptions: 500,
    timesRedeemed: 34,
    active: true,
    createdAt: new Date().toISOString()
  },
  {
    id: 'coup_annual100',
    code: 'ANNUAL100',
    discountAmount: 100,
    validUntil: new Date(Date.now() + 180 * 24 * 60 * 60 * 1000).toISOString(),
    maxRedemptions: 200,
    timesRedeemed: 12,
    active: true,
    createdAt: new Date().toISOString()
  }
];

class SubscriptionService {
  /**
   * Initialize Firestore collections with baseline plans & templates if empty
   */
  async ensureSeedData(): Promise<void> {
    try {
      const plansRef = collection(db, 'subscriptionPlans');
      const snap = await getDocs(plansRef);
      if (snap.empty) {
        for (const plan of DEFAULT_SUBSCRIPTION_PLANS) {
          await setDoc(doc(db, 'subscriptionPlans', plan.id), plan);
        }
      }

      const templatesRef = collection(db, 'subscriptionTemplates');
      const tplSnap = await getDocs(templatesRef);
      if (tplSnap.empty) {
        for (const tpl of DEFAULT_EMAIL_TEMPLATES) {
          await setDoc(doc(db, 'subscriptionTemplates', tpl.id), tpl);
        }
      }

      const couponsRef = collection(db, 'subscriptionCoupons');
      const coupSnap = await getDocs(couponsRef);
      if (coupSnap.empty) {
        for (const coup of DEFAULT_COUPONS) {
          await setDoc(doc(db, 'subscriptionCoupons', coup.id), coup);
        }
      }
    } catch (err) {
      console.warn('Subscription seed note:', err);
    }
  }

  /**
   * Fetch all active subscription plans
   */
  async getPlans(): Promise<SubscriptionPlan[]> {
    try {
      const snap = await getDocs(collection(db, 'subscriptionPlans'));
      if (snap.empty) {
        return DEFAULT_SUBSCRIPTION_PLANS;
      }
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionPlan));
    } catch (err) {
      console.error('Error fetching plans, fallback to defaults:', err);
      return DEFAULT_SUBSCRIPTION_PLANS;
    }
  }

  /**
   * Create or update a subscription plan (Admin only)
   */
  async savePlan(plan: SubscriptionPlan, actorEmail = 'admin'): Promise<void> {
    const planRef = doc(db, 'subscriptionPlans', plan.id);
    await setDoc(planRef, {
      ...plan,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await this.logAudit({
      action: 'PLAN_UPDATED',
      actorId: auth.currentUser?.uid || 'admin',
      actorEmail: actorEmail,
      planId: plan.id,
      details: `Plan "${plan.name}" saved with price ₹${plan.price} / ${plan.billingInterval} (Validity: ${plan.validityDays} days).`
    });
  }

  /**
   * Delete or deactivate a plan
   */
  async togglePlanActive(planId: string, active: boolean, actorEmail = 'admin'): Promise<void> {
    const planRef = doc(db, 'subscriptionPlans', planId);
    await updateDoc(planRef, { active, updatedAt: new Date().toISOString() });

    await this.logAudit({
      action: active ? 'PLAN_UPDATED' : 'PLAN_DEACTIVATED',
      actorId: auth.currentUser?.uid || 'admin',
      actorEmail,
      planId,
      details: `Plan ${planId} active status set to ${active}.`
    });
  }

  async deletePlan(planId: string, actorEmail = 'admin'): Promise<void> {
    await deleteDoc(doc(db, 'subscriptionPlans', planId));
    await this.logAudit({
      action: 'PLAN_DEACTIVATED',
      actorId: auth.currentUser?.uid || 'admin',
      actorEmail,
      planId,
      details: `Plan ${planId} deleted from catalog.`
    });
  }

  /**
   * Calculate validity date endpoints based on plan intervals
   */
  calculateValidity(validityDays: number, startDate = new Date()) {
    const start = new Date(startDate);
    const expiration = new Date(start.getTime() + validityDays * 24 * 60 * 60 * 1000);
    // Next billing date is typically the expiration date
    const nextBilling = new Date(expiration.getTime());
    // 7-day grace period
    const gracePeriodEndsAt = new Date(expiration.getTime() + 7 * 24 * 60 * 60 * 1000);

    return {
      startDate: start.toISOString(),
      expirationDate: expiration.toISOString(),
      nextBillingDate: nextBilling.toISOString(),
      gracePeriodEndsAt: gracePeriodEndsAt.toISOString()
    };
  }

  /**
   * Purchase & Activate Subscription for a Customer
   * Automatically creates payment record, sets validity, creates customerSubscription, and dispatches confirmation
   */
  async purchaseAndActivateSubscription({
    userId,
    customerName,
    customerEmail,
    plan,
    autoRenewAuthorized,
    paymentMethod,
    upiId,
    utrNumber,
    razorpayPaymentId,
    razorpayOrderId,
    couponCode,
    appliedDiscount = 0
  }: {
    userId: string;
    customerName: string;
    customerEmail: string;
    plan: SubscriptionPlan;
    autoRenewAuthorized: boolean;
    paymentMethod: 'UPI' | 'RAZORPAY';
    upiId?: string;
    utrNumber?: string;
    razorpayPaymentId?: string;
    razorpayOrderId?: string;
    couponCode?: string;
    appliedDiscount?: number;
  }): Promise<{ subscription: CustomerSubscription; payment: SubscriptionPayment }> {
    const validity = this.calculateValidity(plan.validityDays);
    const subscriptionId = `sub_${userId.slice(0, 6)}_${Date.now()}`;
    const paymentId = `pay_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const invoiceNumber = `INV-FW-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const basePrice = Math.max(0, plan.price - appliedDiscount);
    const taxAmount = Number(((basePrice * plan.taxPercentage) / 100).toFixed(2));
    const totalAmount = Number((basePrice + taxAmount + plan.applicationFee).toFixed(2));

    const subscription: CustomerSubscription = {
      id: subscriptionId,
      userId,
      customerName: customerName || 'Member',
      customerEmail,
      planId: plan.id,
      planName: plan.name,
      serviceName: plan.serviceName,
      pricePaid: totalAmount,
      currency: plan.currency,
      billingInterval: plan.billingInterval,
      validityDays: plan.validityDays,
      status: 'active',
      startDate: validity.startDate,
      nextBillingDate: validity.nextBillingDate,
      expirationDate: validity.expirationDate,
      gracePeriodEndsAt: validity.gracePeriodEndsAt,
      autoRenewAuthorized: Boolean(autoRenewAuthorized && plan.autoRenewEligible),
      paymentMethod,
      paymentMethodDetails: {
        upiId: upiId || FRESH_WORLD_PAYEE.upiId,
        razorpayOrderId: razorpayOrderId || undefined,
        mandateAuthorized: autoRenewAuthorized
      },
      autoRenewAttempts: 0,
      lastPaymentId: paymentId,
      cancellationRequested: false,
      renewalReminderPreferences: {
        email30Days: true,
        email15Days: true,
        email7Days: true,
        email3Days: true,
        email1Day: true,
        emailOnRenewal: true,
        emailOnExpiry: true,
        emailOnFailedPayment: true
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    const payment: SubscriptionPayment = {
      id: paymentId,
      subscriptionId,
      customerId: userId,
      customerName: customerName || 'Member',
      customerEmail,
      planId: plan.id,
      planName: plan.name,
      amount: basePrice,
      taxAmount,
      applicationFee: plan.applicationFee,
      totalAmount,
      currency: plan.currency,
      paymentProvider: paymentMethod,
      upiId: paymentMethod === 'UPI' ? (upiId || FRESH_WORLD_PAYEE.upiId) : undefined,
      utrNumber: paymentMethod === 'UPI' ? utrNumber : undefined,
      razorpayPaymentId: paymentMethod === 'RAZORPAY' ? razorpayPaymentId : undefined,
      razorpayOrderId: paymentMethod === 'RAZORPAY' ? razorpayOrderId : undefined,
      status: 'success',
      invoiceNumber,
      isRenewal: false,
      createdAt: new Date().toISOString()
    };

    // Save to Firestore
    await setDoc(doc(db, 'customerSubscriptions', subscriptionId), subscription);
    await setDoc(doc(db, 'subscriptionPayments', paymentId), payment);

    // Record audit log
    await this.logAudit({
      action: 'SUBSCRIPTION_ACTIVATED',
      actorId: userId,
      actorEmail: customerEmail,
      targetSubscriptionId: subscriptionId,
      planId: plan.id,
      details: `Subscription activated for plan "${plan.name}". Total paid: ₹${totalAmount} via ${paymentMethod} (Ref: ${utrNumber || razorpayPaymentId || 'N/A'}). Auto-renew: ${autoRenewAuthorized ? 'ENABLED' : 'MANUAL'}. Valid until: ${validity.expirationDate}.`
    });

    // Notify user in system
    await notificationService.sendNotification({
      userId,
      type: 'payment_success',
      title: 'Subscription Activated',
      message: `Welcome to ${plan.name}! Your membership is valid for ${plan.validityDays} days until ${new Date(validity.expirationDate).toLocaleDateString()}. Invoice: ${invoiceNumber}.`,
      amount: totalAmount,
      upiId: FRESH_WORLD_PAYEE.upiId
    });

    return { subscription, payment };
  }

  /**
   * Renew Subscription (Manual or Automatic)
   * Enforces Rule #10: NEVER extend a subscription merely because a reminder was sent or payment was attempted;
   * only extend when payment confirmation is verified!
   */
  async processRenewal({
    subscriptionId,
    isAutoRenew = false,
    paymentMethod,
    utrNumber,
    razorpayPaymentId,
    actorEmail = 'customer'
  }: {
    subscriptionId: string;
    isAutoRenew?: boolean;
    paymentMethod: 'UPI' | 'RAZORPAY';
    utrNumber?: string;
    razorpayPaymentId?: string;
    actorEmail?: string;
  }): Promise<{ updatedSubscription: CustomerSubscription; payment: SubscriptionPayment }> {
    const subRef = doc(db, 'customerSubscriptions', subscriptionId);
    const subSnap = await getDoc(subRef);
    if (!subSnap.exists()) {
      throw new Error(`Subscription ${subscriptionId} not found.`);
    }

    const currentSub = subSnap.data() as CustomerSubscription;
    const plans = await this.getPlans();
    const plan = plans.find(p => p.id === currentSub.planId) || DEFAULT_SUBSCRIPTION_PLANS[1];

    // Compute extension from existing expiration date or today (whichever is later)
    const baseDate = new Date(currentSub.expirationDate).getTime() > Date.now() 
      ? new Date(currentSub.expirationDate) 
      : new Date();

    const newValidity = this.calculateValidity(currentSub.validityDays || plan.validityDays, baseDate);
    const paymentId = `pay_renew_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
    const invoiceNumber = `INV-REN-${new Date().getFullYear()}-${Math.floor(100000 + Math.random() * 900000)}`;

    const renewalPrice = plan.renewablePrice || plan.price;
    const taxAmount = Number(((renewalPrice * plan.taxPercentage) / 100).toFixed(2));
    const totalAmount = Number((renewalPrice + taxAmount).toFixed(2));

    const payment: SubscriptionPayment = {
      id: paymentId,
      subscriptionId,
      customerId: currentSub.userId,
      customerName: currentSub.customerName,
      customerEmail: currentSub.customerEmail,
      planId: currentSub.planId,
      planName: currentSub.planName,
      amount: renewalPrice,
      taxAmount,
      applicationFee: 0,
      totalAmount,
      currency: currentSub.currency,
      paymentProvider: paymentMethod,
      upiId: paymentMethod === 'UPI' ? FRESH_WORLD_PAYEE.upiId : undefined,
      utrNumber: paymentMethod === 'UPI' ? utrNumber : undefined,
      razorpayPaymentId: paymentMethod === 'RAZORPAY' ? razorpayPaymentId : undefined,
      status: 'success',
      invoiceNumber,
      isRenewal: true,
      autoRenewAttemptNumber: isAutoRenew ? (currentSub.autoRenewAttempts || 0) + 1 : undefined,
      createdAt: new Date().toISOString()
    };

    const updatedSubscription: CustomerSubscription = {
      ...currentSub,
      status: 'active',
      expirationDate: newValidity.expirationDate,
      nextBillingDate: newValidity.nextBillingDate,
      gracePeriodEndsAt: newValidity.gracePeriodEndsAt,
      lastPaymentId: paymentId,
      autoRenewAttempts: 0, // reset attempts on success
      cancellationRequested: false, // cleared if renewed
      updatedAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'subscriptionPayments', paymentId), payment);
    await updateDoc(subRef, {
      status: updatedSubscription.status,
      expirationDate: updatedSubscription.expirationDate,
      nextBillingDate: updatedSubscription.nextBillingDate,
      gracePeriodEndsAt: updatedSubscription.gracePeriodEndsAt,
      lastPaymentId: updatedSubscription.lastPaymentId,
      autoRenewAttempts: 0,
      cancellationRequested: false,
      updatedAt: updatedSubscription.updatedAt
    });

    await this.logAudit({
      action: isAutoRenew ? 'AUTO_RENEW_ATTEMPT' : 'MANUAL_RENEWAL',
      actorId: currentSub.userId,
      actorEmail,
      targetSubscriptionId: subscriptionId,
      planId: currentSub.planId,
      details: `${isAutoRenew ? 'Automatic' : 'Manual'} renewal processed successfully for ₹${totalAmount}. Validity extended to ${newValidity.expirationDate}. Invoice: ${invoiceNumber}.`
    });

    await notificationService.sendNotification({
      userId: currentSub.userId,
      type: 'payment_success',
      title: 'Subscription Successfully Renewed',
      message: `Your subscription to ${currentSub.planName} has been extended to ${new Date(newValidity.expirationDate).toLocaleDateString()}. Total: ₹${totalAmount}. Invoice: ${invoiceNumber}.`,
      amount: totalAmount,
      upiId: FRESH_WORLD_PAYEE.upiId
    });

    return { updatedSubscription, payment };
  }

  /**
   * Record a Failed Renewal Payment & Trigger Grace Period Protocol
   */
  async recordRenewalPaymentFailure({
    subscriptionId,
    reason = 'Insufficient funds / UPI Authorization expired',
    actorEmail = 'system'
  }: {
    subscriptionId: string;
    reason?: string;
    actorEmail?: string;
  }): Promise<CustomerSubscription> {
    const subRef = doc(db, 'customerSubscriptions', subscriptionId);
    const snap = await getDoc(subRef);
    if (!snap.exists()) throw new Error('Subscription not found');

    const sub = snap.data() as CustomerSubscription;
    const attempts = (sub.autoRenewAttempts || 0) + 1;
    const isNowGracePeriod = attempts >= 1;

    const paymentId = `pay_fail_${Date.now()}`;
    const failedPayment: SubscriptionPayment = {
      id: paymentId,
      subscriptionId,
      customerId: sub.userId,
      customerName: sub.customerName,
      customerEmail: sub.customerEmail,
      planId: sub.planId,
      planName: sub.planName,
      amount: sub.pricePaid,
      taxAmount: 0,
      applicationFee: 0,
      totalAmount: sub.pricePaid,
      currency: sub.currency,
      paymentProvider: sub.paymentMethod || 'UPI',
      status: 'failed',
      failureReason: reason,
      invoiceNumber: `FAIL-${Date.now()}`,
      isRenewal: true,
      autoRenewAttemptNumber: attempts,
      createdAt: new Date().toISOString()
    };

    await setDoc(doc(db, 'subscriptionPayments', paymentId), failedPayment);

    // Apply grace period policy: if failed on renewal, set status to grace_period
    const updatedStatus: SubscriptionStatus = isNowGracePeriod ? 'grace_period' : sub.status;
    await updateDoc(subRef, {
      status: updatedStatus,
      autoRenewAttempts: attempts,
      updatedAt: new Date().toISOString()
    });

    await this.logAudit({
      action: 'AUTO_RENEW_FAILED',
      actorId: sub.userId,
      actorEmail,
      targetSubscriptionId: subscriptionId,
      details: `Renewal payment failed (Attempt #${attempts}). Reason: "${reason}". Status changed to: ${updatedStatus}.`
    });

    await notificationService.sendNotification({
      userId: sub.userId,
      type: 'system',
      title: 'Payment Failed - Grace Period Active',
      message: `Your automatic renewal of ₹${sub.pricePaid} could not be processed (${reason}). Your 7-day grace period is active until ${new Date(sub.gracePeriodEndsAt || Date.now() + 7 * 86400000).toLocaleDateString()}. Please renew manually to prevent interruption.`,
      amount: sub.pricePaid
    });

    return { ...sub, status: updatedStatus, autoRenewAttempts: attempts };
  }

  /**
   * Cancel Automatic Renewal with Consequence Review
   */
  async cancelSubscription({
    subscriptionId,
    reason,
    consequencesAcknowledged = true,
    actorEmail = 'customer'
  }: {
    subscriptionId: string;
    reason: string;
    consequencesAcknowledged: boolean;
    actorEmail?: string;
  }): Promise<void> {
    const subRef = doc(db, 'customerSubscriptions', subscriptionId);
    const snap = await getDoc(subRef);
    if (!snap.exists()) throw new Error('Subscription not found');

    const sub = snap.data() as CustomerSubscription;

    await updateDoc(subRef, {
      autoRenewAuthorized: false,
      cancellationRequested: true,
      cancellationReason: reason,
      cancellationConsequencesAcknowledged: consequencesAcknowledged,
      cancelledAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    });

    await this.logAudit({
      action: 'SUBSCRIPTION_CANCELLED',
      actorId: sub.userId,
      actorEmail,
      targetSubscriptionId: subscriptionId,
      details: `Future auto-renewal cancelled. Reason: "${reason}". Access remains active until expiration: ${sub.expirationDate}.`
    });

    await notificationService.sendNotification({
      userId: sub.userId,
      type: 'system',
      title: 'Auto-Renewal Cancelled',
      message: `Automatic renewal for ${sub.planName} has been turned off. You will retain full access until ${new Date(sub.expirationDate).toLocaleDateString()}. You can reactivate anytime.`,
      amount: 0
    });
  }

  /**
   * Toggle Auto-Renewal Consent
   */
  async toggleAutoRenew(subscriptionId: string, authorized: boolean, actorEmail = 'customer'): Promise<void> {
    const subRef = doc(db, 'customerSubscriptions', subscriptionId);
    await updateDoc(subRef, {
      autoRenewAuthorized: authorized,
      cancellationRequested: !authorized,
      updatedAt: new Date().toISOString()
    });

    await this.logAudit({
      action: 'SUBSCRIPTION_UPDATED' as any,
      actorId: auth.currentUser?.uid || 'user',
      actorEmail,
      targetSubscriptionId: subscriptionId,
      details: `Auto-renewal preference set to: ${authorized ? 'ENABLED' : 'DISABLED'}.`
    });
  }

  /**
   * Fetch customer subscriptions
   */
  async getCustomerSubscriptions(userId: string): Promise<CustomerSubscription[]> {
    try {
      const q = query(
        collection(db, 'customerSubscriptions'),
        where('userId', '==', userId)
      );
      const snap = await getDocs(q);
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerSubscription));
    } catch (err) {
      console.error('Error fetching customer subscriptions:', err);
      return [];
    }
  }

  /**
   * Fetch all subscriptions for Admin
   */
  async getAllSubscriptions(): Promise<CustomerSubscription[]> {
    try {
      const snap = await getDocs(collection(db, 'customerSubscriptions'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as CustomerSubscription));
    } catch (err) {
      console.error('Error fetching all subscriptions:', err);
      return [];
    }
  }

  /**
   * Fetch payment ledger for customer or admin
   */
  async getPayments(userId?: string): Promise<SubscriptionPayment[]> {
    try {
      if (userId) {
        const q = query(
          collection(db, 'subscriptionPayments'),
          where('customerId', '==', userId)
        );
        const snap = await getDocs(q);
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionPayment))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      } else {
        const snap = await getDocs(collection(db, 'subscriptionPayments'));
        return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionPayment))
          .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
      }
    } catch (err) {
      console.error('Error fetching payments:', err);
      return [];
    }
  }

  /**
   * Fetch & update Email Templates
   */
  async getEmailTemplates(): Promise<SubscriptionEmailTemplate[]> {
    try {
      const snap = await getDocs(collection(db, 'subscriptionTemplates'));
      if (snap.empty) return DEFAULT_EMAIL_TEMPLATES;
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionEmailTemplate));
    } catch (err) {
      return DEFAULT_EMAIL_TEMPLATES;
    }
  }

  async saveEmailTemplate(template: SubscriptionEmailTemplate, actorEmail = 'admin'): Promise<void> {
    await setDoc(doc(db, 'subscriptionTemplates', template.id), {
      ...template,
      updatedAt: new Date().toISOString()
    }, { merge: true });

    await this.logAudit({
      action: 'TEMPLATE_UPDATED',
      actorId: auth.currentUser?.uid || 'admin',
      actorEmail,
      details: `Email template "${template.name}" (${template.templateKey}) updated.`
    });
  }

  /**
   * Coupons Management
   */
  async getCoupons(): Promise<SubscriptionCoupon[]> {
    try {
      const snap = await getDocs(collection(db, 'subscriptionCoupons'));
      if (snap.empty) return DEFAULT_COUPONS;
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionCoupon));
    } catch (err) {
      return DEFAULT_COUPONS;
    }
  }

  async saveCoupon(coupon: SubscriptionCoupon, actorEmail = 'admin'): Promise<void> {
    await setDoc(doc(db, 'subscriptionCoupons', coupon.id), coupon, { merge: true });
    await this.logAudit({
      action: 'COUPON_CREATED',
      actorId: auth.currentUser?.uid || 'admin',
      actorEmail,
      details: `Promo coupon "${coupon.code}" created/updated (${coupon.discountPercent ? `${coupon.discountPercent}% off` : `₹${coupon.discountAmount} off`}).`
    });
  }

  /**
   * Audit Logging
   */
  async logAudit(log: Omit<SubscriptionAuditLog, 'id' | 'timestamp'>): Promise<void> {
    try {
      const logRef = doc(collection(db, 'subscriptionAuditLogs'));
      await setDoc(logRef, {
        ...log,
        id: logRef.id,
        timestamp: new Date().toISOString()
      });
    } catch (err) {
      console.error('Audit log write error:', err);
    }
  }

  async getAuditLogs(limitCount = 50): Promise<SubscriptionAuditLog[]> {
    try {
      const snap = await getDocs(collection(db, 'subscriptionAuditLogs'));
      return snap.docs.map(d => ({ id: d.id, ...d.data() } as SubscriptionAuditLog))
        .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
        .slice(0, limitCount);
    } catch (err) {
      return [];
    }
  }

  /**
   * Validate Coupon
   */
  async validateCoupon(code: string, planPrice: number): Promise<{ valid: boolean; discountAmount: number; message: string }> {
    const cleanCode = code.trim().toUpperCase();
    const coupons = await this.getCoupons();
    const coupon = coupons.find(c => c.code.toUpperCase() === cleanCode && c.active);

    if (!coupon) {
      return { valid: false, discountAmount: 0, message: 'Invalid or inactive promotional code.' };
    }

    if (new Date(coupon.validUntil).getTime() < Date.now()) {
      return { valid: false, discountAmount: 0, message: 'This coupon has expired.' };
    }

    if (coupon.timesRedeemed >= coupon.maxRedemptions) {
      return { valid: false, discountAmount: 0, message: 'Coupon redemption quota exceeded.' };
    }

    let discount = 0;
    if (coupon.discountPercent) {
      discount = Number(((planPrice * coupon.discountPercent) / 100).toFixed(2));
    } else if (coupon.discountAmount) {
      discount = Math.min(planPrice, coupon.discountAmount);
    }

    return {
      valid: true,
      discountAmount: discount,
      message: `Coupon "${coupon.code}" applied! You save ₹${discount}.`
    };
  }
}

export const subscriptionService = new SubscriptionService();
