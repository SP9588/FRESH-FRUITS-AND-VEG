import React, { useState } from 'react';
import { 
  Share2, 
  Copy, 
  Check, 
  ExternalLink, 
  Globe, 
  Code2, 
  Sparkles, 
  Layers, 
  ShieldCheck, 
  Send,
  MessageCircle,
  Hash,
  Terminal,
  BookOpen,
  QrCode
} from 'lucide-react';
import { toast } from 'react-hot-toast';
import { SOCIAL_PLATFORMS } from '../services/socialShareService';
import { FRESH_WORLD_PAYEE } from '../types';

export default function UniversalSaaSSocialHub() {
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const [activeCategory, setActiveCategory] = useState<string>('All');
  const [activeTab, setActiveTab] = useState<'social' | 'api' | 'embed'>('social');

  // Application share URLs
  const siteUrl = window.location.origin;
  const subscriptionUrl = `${siteUrl}/pricing`;
  const defaultShareText = 'Check out Fresh World Global Platform & Universal SaaS Subscription System — direct farmer-to-buyer trade, automated recurring validity & UPI payment integration!';
  const shareTitle = 'Fresh World Universal Subscription & SaaS Platform';

  const handleCopyLink = (url: string, id: string) => {
    navigator.clipboard.writeText(url);
    setCopiedId(id);
    setTimeout(() => setCopiedId(null), 2000);
    toast.success('Share link copied to clipboard!');
  };

  const categories = ['All', 'Messaging', 'Social', 'Professional', 'Video & Visual', 'Community'];
  const filteredPlatforms = activeCategory === 'All' 
    ? SOCIAL_PLATFORMS 
    : SOCIAL_PLATFORMS.filter(p => p.category === activeCategory);

  return (
    <div className="space-y-8 animate-in fade-in duration-500">
      {/* Top Banner */}
      <div className="bg-gradient-to-br from-stone-900 to-stone-800 text-white rounded-3xl p-6 sm:p-10 shadow-xl space-y-4">
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs font-bold text-brand-300 bg-brand-950/80 border border-brand-800 px-3 py-1 rounded-full uppercase tracking-wider flex items-center gap-1.5">
            <Globe size={13} /> Global Distribution Hub
          </span>
          <span className="text-xs font-mono text-stone-400">19+ Social & Professional Networks</span>
        </div>

        <h2 className="text-2xl sm:text-4xl font-black tracking-tight">
          Universal SaaS Sharing & Embed Suite
        </h2>
        <p className="text-stone-300 text-sm max-w-3xl leading-relaxed">
          Distribute and customize your online service and membership platform globally. Generate targeted shareable links across all major social networks, or embed the subscription engine into any external website, mobile app, or SaaS ecosystem.
        </p>

        {/* Global Share URL Quick-Bar */}
        <div className="bg-stone-800/80 border border-stone-700 p-3 sm:p-4 rounded-2xl flex flex-col sm:flex-row items-center justify-between gap-3 max-w-3xl">
          <div className="flex items-center gap-2 overflow-hidden w-full">
            <span className="text-xs text-stone-400 shrink-0 font-bold uppercase">SaaS URL:</span>
            <code className="text-xs font-mono text-brand-300 truncate select-all">{subscriptionUrl}</code>
          </div>
          <button
            onClick={() => handleCopyLink(subscriptionUrl, 'primary_url')}
            className="px-4 py-2 bg-brand-600 hover:bg-brand-500 text-white font-bold text-xs rounded-xl transition-all shadow-md shrink-0 flex items-center gap-1.5 w-full sm:w-auto justify-center"
          >
            {copiedId === 'primary_url' ? <Check size={14} /> : <Copy size={14} />}
            <span>{copiedId === 'primary_url' ? 'Copied URL!' : 'Copy Platform Link'}</span>
          </button>
        </div>
      </div>

      {/* Mode Tabs */}
      <div className="flex items-center gap-2 p-1.5 bg-stone-100 rounded-2xl w-fit">
        <button
          onClick={() => setActiveTab('social')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'social' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
        >
          <Share2 size={14} /> Social & Networking Links (19 Platforms)
        </button>
        <button
          onClick={() => setActiveTab('api')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'api' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
        >
          <Code2 size={14} /> Developer API & Webhooks
        </button>
        <button
          onClick={() => setActiveTab('embed')}
          className={`px-4 py-2 text-xs font-bold rounded-xl transition-all flex items-center gap-1.5 ${activeTab === 'embed' ? 'bg-white text-stone-900 shadow-sm' : 'text-stone-600 hover:text-stone-900'}`}
        >
          <Layers size={14} /> Universal Embed Code
        </button>
      </div>

      {/* Tab 1: Social Media Grid */}
      {activeTab === 'social' && (
        <div className="space-y-6">
          {/* Category Filter Pills */}
          <div className="flex flex-wrap gap-2">
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`px-3 py-1.5 text-xs font-bold rounded-xl transition-all border ${
                  activeCategory === cat 
                    ? 'bg-stone-900 text-white border-stone-900' 
                    : 'bg-white text-stone-600 border-stone-200 hover:bg-stone-50'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>

          {/* Social Platforms Cards */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {filteredPlatforms.map((network) => {
              const shareLink = network.shareUrlTemplate(subscriptionUrl, defaultShareText, shareTitle);

              return (
                <div
                  key={network.id}
                  className="bg-white border border-stone-200 rounded-3xl p-5 shadow-sm hover:shadow-md transition-all flex flex-col justify-between space-y-4"
                >
                  <div className="space-y-2">
                    <div className="flex justify-between items-center">
                      <div className="flex items-center gap-2.5">
                        <div
                          className="w-8 h-8 rounded-xl flex items-center justify-center text-white font-bold text-xs"
                          style={{ backgroundColor: network.iconColor }}
                        >
                          {network.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <h4 className="font-bold text-sm text-stone-900 leading-tight">{network.name}</h4>
                          <span className="text-[10px] text-stone-400 font-medium">{network.category}</span>
                        </div>
                      </div>

                      <span className="text-[10px] font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded-full">
                        Ready
                      </span>
                    </div>

                    <p className="text-xs text-stone-500 leading-relaxed">
                      {network.guide}
                    </p>
                  </div>

                  {/* Actions */}
                  <div className="pt-3 border-t border-stone-100 flex gap-2">
                    <button
                      onClick={() => handleCopyLink(shareLink, network.id)}
                      className="flex-1 py-2 bg-stone-100 hover:bg-stone-200 text-stone-700 text-xs font-bold rounded-xl transition-colors flex items-center justify-center gap-1.5"
                    >
                      {copiedId === network.id ? <Check size={13} className="text-emerald-600" /> : <Copy size={13} />}
                      <span>{copiedId === network.id ? 'Copied' : 'Copy Share Link'}</span>
                    </button>

                    <a
                      href={shareLink}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-white text-xs font-bold rounded-xl transition-colors flex items-center gap-1"
                    >
                      <ExternalLink size={13} />
                      <span>Open</span>
                    </a>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Tab 2: Developer API & Webhooks */}
      {activeTab === 'api' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-xl font-black text-stone-900">Universal Subscription REST API & Webhooks</h3>
            <p className="text-xs text-stone-500 mt-1">
              Integrate this subscription lifecycle system into any external iOS/Android app, Python backend, or Next.js storefront.
            </p>
          </div>

          <div className="space-y-4">
            <div className="bg-stone-900 text-stone-200 rounded-2xl p-5 font-mono text-xs space-y-3 overflow-x-auto">
              <div className="text-stone-400">// 1. Check Customer Validity & Feature Quota</div>
              <div className="text-emerald-400">GET /api/v1/subscriptions/validate?userId=usr_928172</div>
              <div className="text-stone-300">{`{
  "status": "active",
  "planId": "plan_annual_pro_12m",
  "validUntil": "2027-10-15T00:00:00Z",
  "daysRemaining": 365,
  "autoRenewAuthorized": true,
  "limits": {
    "apiRequestsPerMonth": 100000,
    "productListings": "Unlimited"
  }
}`}</div>
            </div>

            <div className="bg-stone-900 text-stone-200 rounded-2xl p-5 font-mono text-xs space-y-3 overflow-x-auto">
              <div className="text-stone-400">// 2. Recurring Renewal Webhook Payload (Dispatched by Payment Layer)</div>
              <div className="text-emerald-400">POST /api/v1/subscriptions/renew</div>
              <div className="text-stone-300">{`{
  "subscriptionId": "sub_usr928_172891",
  "paymentMethod": "UPI",
  "upiId": "${FRESH_WORLD_PAYEE.upiId}",
  "utrNumber": "529182740192",
  "amount": 1200,
  "currency": "INR",
  "isAutoRenew": true
}`}</div>
            </div>
          </div>
        </div>
      )}

      {/* Tab 3: Embed Widget Code */}
      {activeTab === 'embed' && (
        <div className="bg-white border border-stone-200 rounded-3xl p-6 sm:p-8 space-y-6 shadow-sm">
          <div>
            <h3 className="text-xl font-black text-stone-900">Customizable HTML / React Embed Code</h3>
            <p className="text-xs text-stone-500 mt-1">
              Copy-paste this widget script into any website or SaaS portal to display live subscription tiers with UPI and Razorpay checkout.
            </p>
          </div>

          <div className="bg-stone-900 text-stone-200 rounded-2xl p-5 font-mono text-xs overflow-x-auto space-y-2">
            <span className="text-stone-400">&lt;!-- Fresh World Universal Subscription Embed Widget --&gt;</span>
            <div className="text-brand-300">{`<div id="freshworld-subscription-embed" data-platform-id="fw_universal_saas" data-upi="${FRESH_WORLD_PAYEE.upiId}"></div>
<script src="${siteUrl}/embed/subscription-sdk.js" async defer></script>`}</div>
          </div>

          <button
            onClick={() => {
              navigator.clipboard.writeText(`<div id="freshworld-subscription-embed" data-platform-id="fw_universal_saas" data-upi="${FRESH_WORLD_PAYEE.upiId}"></div>\n<script src="${siteUrl}/embed/subscription-sdk.js" async defer></script>`);
              toast.success('Embed snippet copied!');
            }}
            className="px-5 py-2.5 bg-stone-900 hover:bg-stone-800 text-white font-bold text-xs rounded-xl transition-all shadow-sm flex items-center gap-1.5"
          >
            <Copy size={14} /> Copy Embed Code
          </button>
        </div>
      )}
    </div>
  );
}
