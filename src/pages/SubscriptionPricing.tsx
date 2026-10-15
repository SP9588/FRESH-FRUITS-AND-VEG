import React, { useState, useEffect } from 'react';
import { 
  Check, 
  HelpCircle, 
  ShieldCheck, 
  RefreshCw, 
  Zap, 
  Sparkles, 
  ArrowRight, 
  QrCode, 
  Share2, 
  Calendar,
  Lock,
  ChevronDown
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { SubscriptionPlan, FRESH_WORLD_PAYEE } from '../types';
import { subscriptionService, DEFAULT_SUBSCRIPTION_PLANS } from '../services/subscriptionService';
import SubscriptionCheckoutModal from '../components/SubscriptionCheckoutModal';
import UniversalSaaSSocialHub from '../components/UniversalSaaSSocialHub';

interface SubscriptionPricingProps {
  user: any;
}

export default function SubscriptionPricing({ user }: SubscriptionPricingProps) {
  const [plans, setPlans] = useState<SubscriptionPlan[]>([]);
  const [selectedPlan, setSelectedPlan] = useState<SubscriptionPlan | null>(null);
  const [isCheckoutOpen, setIsCheckoutOpen] = useState(false);
  const [showShareHub, setShowShareHub] = useState(false);
  const [activeFaq, setActiveFaq] = useState<number | null>(null);

  useEffect(() => {
    const fetchPlans = async () => {
      await subscriptionService.ensureSeedData();
      const p = await subscriptionService.getPlans();
      setPlans(p.filter(item => item.active));
    };
    fetchPlans();
  }, []);

  const handleSelectPlan = (plan: SubscriptionPlan) => {
    setSelectedPlan(plan);
    setIsCheckoutOpen(true);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 space-y-16">
      {/* Hero Header */}
      <div className="text-center max-w-3xl mx-auto space-y-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 bg-brand-50 border border-brand-200 rounded-full text-xs font-bold text-brand-800">
          <Sparkles size={13} className="text-brand-600" />
          <span>Universal Subscription & Validity Engine</span>
        </div>
        <h1 className="text-4xl sm:text-5xl font-black text-stone-900 tracking-tight leading-tight">
          Flexible Membership Durations with Transparent Auto-Renewal
        </h1>
        <p className="text-base text-stone-600 max-w-2xl mx-auto leading-relaxed">
          Choose a 3-month, 6-month, 12-month (365 days), or Lifetime license. Explicit recurring authorization, instant UPI QR payments, 14-day zero-risk refund, and automated commercial tax invoices.
        </p>

        {/* Global Share Hub Toggle */}
        <div className="pt-2">
          <button
            onClick={() => setShowShareHub(!showShareHub)}
            className="inline-flex items-center gap-2 px-4 py-2 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all shadow-md"
          >
            <Share2 size={14} />
            <span>{showShareHub ? 'Hide Social & Networking Share Hub' : 'Share Globally across 19+ Social Platforms'}</span>
          </button>
        </div>
      </div>

      {/* Embedded Social Hub when opened */}
      {showShareHub && (
        <div className="border border-stone-200 rounded-3xl p-6 sm:p-8 bg-stone-50/50">
          <UniversalSaaSSocialHub />
        </div>
      )}

      {/* Pricing Cards Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-stretch">
        {plans.map((plan) => {
          const isAnnual = plan.billingInterval === '12_months';
          const isLifetime = plan.billingInterval === 'lifetime';

          return (
            <div
              key={plan.id}
              className={`rounded-3xl p-6 sm:p-7 flex flex-col justify-between transition-all relative ${
                isAnnual 
                  ? 'bg-stone-900 text-white ring-2 ring-brand-500 shadow-2xl scale-[1.02]' 
                  : 'bg-white text-stone-900 border border-stone-200 shadow-sm hover:border-stone-300'
              }`}
            >
              {plan.badge && (
                <div className="absolute -top-3.5 left-1/2 -translate-x-1/2">
                  <span className={`px-3 py-1 rounded-full text-[11px] font-bold uppercase tracking-wider shadow-sm ${
                    isAnnual ? 'bg-brand-500 text-stone-950' : 'bg-stone-900 text-white'
                  }`}>
                    {plan.badge}
                  </span>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <span className={`text-[11px] font-bold uppercase tracking-wider block ${
                    isAnnual ? 'text-brand-400' : 'text-stone-400'
                  }`}>
                    {plan.billingInterval.replace('_', ' ').toUpperCase()} ({plan.validityDays} DAYS)
                  </span>
                  <h3 className="text-xl font-black mt-1 leading-tight">{plan.name}</h3>
                  <p className={`text-xs mt-2 leading-relaxed ${isAnnual ? 'text-stone-300' : 'text-stone-500'}`}>
                    {plan.description}
                  </p>
                </div>

                {/* Price Display */}
                <div className="pt-2">
                  <div className="flex items-baseline gap-1">
                    <span className="text-3xl sm:text-4xl font-black font-mono tracking-tight">₹{plan.price}</span>
                    <span className={`text-xs font-semibold ${isAnnual ? 'text-stone-400' : 'text-stone-500'}`}>
                      {isLifetime ? 'one-time' : `/${plan.validityDays} days`}
                    </span>
                  </div>
                  {plan.renewablePrice > 0 && (
                    <span className={`text-[11px] block mt-1 font-medium ${isAnnual ? 'text-brand-300' : 'text-emerald-700'}`}>
                      Auto-renews at ₹{plan.renewablePrice} (Cancel anytime)
                    </span>
                  )}
                  {plan.trialPeriodDays > 0 && (
                    <span className={`text-[11px] block mt-0.5 ${isAnnual ? 'text-stone-400' : 'text-stone-500'}`}>
                      Includes {plan.trialPeriodDays}-day risk-free trial
                    </span>
                  )}
                </div>

                {/* Key Features */}
                <div className="space-y-2.5 pt-4 border-t border-stone-100/20">
                  <span className={`text-xs font-bold uppercase tracking-wider block ${
                    isAnnual ? 'text-stone-300' : 'text-stone-700'
                  }`}>
                    Included Privileges:
                  </span>
                  <ul className="space-y-2 text-xs">
                    {plan.features.map((feature, i) => (
                      <li key={i} className="flex items-start gap-2">
                        <Check size={14} className={`shrink-0 mt-0.5 ${isAnnual ? 'text-brand-400' : 'text-brand-600'}`} />
                        <span className={isAnnual ? 'text-stone-200' : 'text-stone-600'}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Action Button */}
              <div className="pt-6 mt-6 border-t border-stone-100/20">
                <button
                  onClick={() => handleSelectPlan(plan)}
                  className={`w-full py-3.5 px-4 font-bold text-xs uppercase tracking-wider rounded-2xl transition-all shadow-md flex items-center justify-center gap-1.5 ${
                    isAnnual 
                      ? 'bg-brand-500 hover:bg-brand-400 text-stone-950 font-black' 
                      : 'bg-stone-900 hover:bg-stone-800 text-white'
                  }`}
                >
                  <span>Select {plan.name}</span>
                  <ArrowRight size={14} />
                </button>
                <div className={`text-center text-[10px] mt-2 ${isAnnual ? 'text-stone-400' : 'text-stone-400'}`}>
                  UPI ID: {FRESH_WORLD_PAYEE.upiId} & Razorpay
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Concrete Feature Comparison Matrix (Domain Guideline 2.C) */}
      <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm overflow-hidden">
        <div>
          <span className="text-xs font-bold text-stone-400 uppercase tracking-wider block">Transparent Quota Comparison</span>
          <h3 className="text-2xl font-black text-stone-900 mt-1">Detailed Service Limits by Membership Tier</h3>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs border-collapse">
            <thead>
              <tr className="border-b border-stone-200 bg-stone-50 text-stone-500 font-bold uppercase tracking-wider">
                <th className="py-3 px-4">Feature / Metric</th>
                <th className="py-3 px-4">Standard (3m)</th>
                <th className="py-3 px-4 bg-brand-50/50 text-brand-900">Annual Pro (12m)</th>
                <th className="py-3 px-4">Commercial (6m)</th>
                <th className="py-3 px-4">Founders Lifetime</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              <tr>
                <td className="py-3.5 px-4 font-semibold text-stone-800">Produce Listings</td>
                <td className="py-3.5 px-4 text-stone-600">25 Products</td>
                <td className="py-3.5 px-4 font-bold text-brand-700 bg-brand-50/30">Unlimited</td>
                <td className="py-3.5 px-4 text-stone-600">100 Products</td>
                <td className="py-3.5 px-4 text-stone-600">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-stone-800">Monthly API Requests</td>
                <td className="py-3.5 px-4 font-mono text-stone-600">5,000</td>
                <td className="py-3.5 px-4 font-mono font-bold text-brand-700 bg-brand-50/30">100,000</td>
                <td className="py-3.5 px-4 font-mono text-stone-600">25,000</td>
                <td className="py-3.5 px-4 font-mono text-stone-600">Unlimited</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-stone-800">Export Licenses Tracked</td>
                <td className="py-3.5 px-4 text-stone-600">1 License</td>
                <td className="py-3.5 px-4 font-bold text-brand-700 bg-brand-50/30">5 Licenses</td>
                <td className="py-3.5 px-4 text-stone-600">2 Licenses</td>
                <td className="py-3.5 px-4 text-stone-600">99 Licenses</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-stone-800">Priority Cold-Chain Reefer</td>
                <td className="py-3.5 px-4 text-stone-400">Standard Queue</td>
                <td className="py-3.5 px-4 font-bold text-brand-700 bg-brand-50/30">VIP Fast-Track</td>
                <td className="py-3.5 px-4 text-stone-600">Priority</td>
                <td className="py-3.5 px-4 text-stone-600">Dedicated Fleet</td>
              </tr>
              <tr>
                <td className="py-3.5 px-4 font-semibold text-stone-800">Support Level</td>
                <td className="py-3.5 px-4 text-stone-600">Email & In-App (24h)</td>
                <td className="py-3.5 px-4 font-bold text-brand-700 bg-brand-50/30">Dedicated 24/7 Desk</td>
                <td className="py-3.5 px-4 text-stone-600">Priority (4h)</td>
                <td className="py-3.5 px-4 text-stone-600">Founder Direct Call</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      {/* Frequently Asked Questions */}
      <div className="bg-stone-50 border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-4">
        <h3 className="text-xl font-black text-stone-900">Subscription & Auto-Renewal Policies</h3>
        
        <div className="space-y-3">
          {[
            {
              q: 'How does automatic renewal work and when will I be charged?',
              a: 'Auto-renewal is completely optional. If authorized during checkout, your account will only be charged on your exact expiration date (e.g. Day 365 for annual plans). You will receive advance email notifications 30, 15, 7, 3, and 1 day prior to any transaction.'
            },
            {
              q: 'How can I cancel my recurring subscription?',
              a: 'You can cancel future auto-renewals in 1 click at any time from your Customer Dashboard. You retain full access to all features until the end of your prepaid term, and no further charges will ever be made.'
            },
            {
              q: 'What happens if a renewal payment fails?',
              a: 'If a payment fails, your account enters an automatic 7-day grace period. Your access remains active while you retry payment via UPI (9279120271@ybl) or Razorpay. Never will access be restricted without prior notice.'
            },
            {
              q: 'Can I renew manually instead of auto-pay?',
              a: 'Yes! Simply uncheck "Enable Automatic Renewal" during checkout. You can then renew manually by scanning the live UPI QR code or using Razorpay whenever your term approaches expiry.'
            }
          ].map((item, i) => (
            <div key={i} className="bg-white border border-stone-200 rounded-2xl overflow-hidden">
              <button
                onClick={() => setActiveFaq(activeFaq === i ? null : i)}
                className="w-full p-4 text-left flex justify-between items-center text-xs font-bold text-stone-900 hover:bg-stone-50/50"
              >
                <span>{item.q}</span>
                <ChevronDown size={16} className={`transform transition-transform ${activeFaq === i ? 'rotate-180' : ''}`} />
              </button>
              {activeFaq === i && (
                <div className="px-4 pb-4 text-xs text-stone-600 leading-relaxed border-t border-stone-100 pt-3">
                  {item.a}
                </div>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Active Checkout Modal */}
      {selectedPlan && (
        <SubscriptionCheckoutModal
          isOpen={isCheckoutOpen}
          onClose={() => {
            setIsCheckoutOpen(false);
            setSelectedPlan(null);
          }}
          plan={selectedPlan}
          user={user}
        />
      )}
    </div>
  );
}
