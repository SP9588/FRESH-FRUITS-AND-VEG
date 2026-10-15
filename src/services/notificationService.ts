import { collection, addDoc, doc, setDoc } from 'firebase/firestore';
import { db } from '../firebase';
import { AppNotification, NotificationType, FRESH_WORLD_PAYEE } from '../types';

export const notificationService = {
  /**
   * Dispatch a notification to a specific user
   */
  async sendNotification({
    userId,
    type,
    title,
    message,
    productId,
    orderId,
    amount,
    upiId = FRESH_WORLD_PAYEE.upiId,
  }: {
    userId: string;
    type: NotificationType;
    title: string;
    message: string;
    productId?: string;
    orderId?: string;
    amount?: number;
    upiId?: string;
  }): Promise<string | null> {
    try {
      const notificationRef = doc(collection(db, 'notifications'));
      const notificationData: Omit<AppNotification, 'id'> = {
        userId,
        type,
        title,
        message,
        ...(productId ? { productId } : {}),
        ...(orderId ? { orderId } : {}),
        ...(amount !== undefined ? { amount } : {}),
        upiId,
        read: false,
        createdAt: new Date().toISOString(),
      };

      await setDoc(notificationRef, notificationData);
      return notificationRef.id;
    } catch (err) {
      console.error('Error dispatching notification:', err);
      return null;
    }
  },

  /**
   * Send notification for Platform Commission paid to Developer
   */
  async sendPlatformCommissionAlert(
    userId: string,
    amount: number,
    orderId: string
  ) {
    return this.sendNotification({
      userId,
      type: 'platform_commission',
      title: 'Platform Commission Logged',
      message: `Commercial platform fee of ₹${amount.toFixed(2)} (${FRESH_WORLD_PAYEE.commissionRate}%) allocated for Developer (${FRESH_WORLD_PAYEE.upiId} / ${FRESH_WORLD_PAYEE.developerEmail}) for Order #${orderId}.`,
      orderId,
      amount,
      upiId: FRESH_WORLD_PAYEE.upiId,
    });
  },

  /**
   * Send notification when direct UPI payment is confirmed
   */
  async sendPaymentSuccessAlert(
    userId: string,
    amount: number,
    utrNumber?: string
  ) {
    return this.sendNotification({
      userId,
      type: 'payment_success',
      title: 'UPI Payment Confirmed',
      message: `Payment of ₹${amount.toFixed(2)} to Payee UPI ${FRESH_WORLD_PAYEE.upiId} (${FRESH_WORLD_PAYEE.developerEmail}) has been successfully authenticated${utrNumber ? ` (Ref: ${utrNumber})` : ''}.`,
      amount,
      upiId: FRESH_WORLD_PAYEE.upiId,
    });
  },

  /**
   * Send welcome & developer payee info notification
   */
  async sendDeveloperNotice(userId: string) {
    return this.sendNotification({
      userId,
      type: 'developer_notice',
      title: 'Fresh World Commercial Payee & Support',
      message: `Welcome to Fresh World! Official Payee UPI: ${FRESH_WORLD_PAYEE.upiId} | Developer Contact: ${FRESH_WORLD_PAYEE.developerEmail}. A transparent ${FRESH_WORLD_PAYEE.commissionRate}% platform fee supports our global infrastructure.`,
      upiId: FRESH_WORLD_PAYEE.upiId,
    });
  },
};
