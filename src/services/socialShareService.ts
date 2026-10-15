import { SocialNetworkShare } from '../types';

export const SOCIAL_PLATFORMS: SocialNetworkShare[] = [
  {
    id: 'whatsapp',
    name: 'WhatsApp',
    category: 'Messaging',
    iconColor: '#25D366',
    guide: 'Direct instant broadcast to agricultural contacts, exporter groups, and wholesale buyers.',
    shareUrlTemplate: (url, text) => `https://api.whatsapp.com/send?text=${encodeURIComponent(`${text} ${url}`)}`
  },
  {
    id: 'telegram',
    name: 'Telegram',
    category: 'Messaging',
    iconColor: '#229ED9',
    guide: 'Broadcast instantly across Telegram trading channels and global supply chain groups.',
    shareUrlTemplate: (url, text) => `https://t.me/share/url?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`
  },
  {
    id: 'x',
    name: 'X (Twitter)',
    category: 'Social',
    iconColor: '#000000',
    guide: 'Publish high-engagement thread with hashtags #AgriTech #SaaS #GlobalTrade #Export.',
    shareUrlTemplate: (url, text) => `https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}&hashtags=AgriTech,SaaS,GlobalTrade,FreshWorld`
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    category: 'Professional',
    iconColor: '#0A66C2',
    guide: 'Share B2B value proposition with corporate procurement officers, importers, and investors.',
    shareUrlTemplate: (url, text, title) => `https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}`
  },
  {
    id: 'facebook',
    name: 'Facebook',
    category: 'Social',
    iconColor: '#1877F2',
    guide: 'Post directly to farmer collectives, marketplace pages, and agricultural co-operatives.',
    shareUrlTemplate: (url) => `https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`
  },
  {
    id: 'instagram',
    name: 'Instagram',
    category: 'Video & Visual',
    iconColor: '#E4405F',
    guide: 'Copy pre-formatted bio link or caption for Instagram Stories and Reels showcase.',
    shareUrlTemplate: (url) => `https://www.instagram.com/`
  },
  {
    id: 'youtube',
    name: 'YouTube',
    category: 'Video & Visual',
    iconColor: '#FF0000',
    guide: 'Pin link in video description, community post, or YouTube Shorts pinned comment.',
    shareUrlTemplate: (url) => `https://www.youtube.com/`
  },
  {
    id: 'threads',
    name: 'Threads',
    category: 'Social',
    iconColor: '#000000',
    guide: 'Share modern micro-updates with the fast-growing Meta Threads business network.',
    shareUrlTemplate: (url, text) => `https://www.threads.net/intent/post?text=${encodeURIComponent(`${text} ${url}`)}`
  },
  {
    id: 'reddit',
    name: 'Reddit',
    category: 'Community',
    iconColor: '#FF4500',
    guide: 'Submit link post to r/SaaS, r/Agriculture, r/Entrepreneur, or r/IndiaInvestments.',
    shareUrlTemplate: (url, text, title) => `https://reddit.com/submit?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`
  },
  {
    id: 'pinterest',
    name: 'Pinterest',
    category: 'Video & Visual',
    iconColor: '#BD081C',
    guide: 'Pin farm produce infographics, subscription pricing sheets, and organic produce guides.',
    shareUrlTemplate: (url, text) => `https://pinterest.com/pin/create/button/?url=${encodeURIComponent(url)}&description=${encodeURIComponent(text)}`
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    category: 'Video & Visual',
    iconColor: '#000000',
    guide: 'Add as link in bio or share direct video prompt for viral harvest and quality testing clips.',
    shareUrlTemplate: () => `https://www.tiktok.com/`
  },
  {
    id: 'snapchat',
    name: 'Snapchat',
    category: 'Messaging',
    iconColor: '#FFFC00',
    guide: 'Share Snap link attachment directly with team members and verified field contacts.',
    shareUrlTemplate: (url) => `https://www.snapchat.com/scan?attachmentUrl=${encodeURIComponent(url)}`
  },
  {
    id: 'tumblr',
    name: 'Tumblr',
    category: 'Community',
    iconColor: '#36465D',
    guide: 'Publish rich multimedia blog post showcasing global farmer testimonials and pricing.',
    shareUrlTemplate: (url, text, title) => `https://www.tumblr.com/widgets/share/tool?canonicalUrl=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}&caption=${encodeURIComponent(text)}`
  },
  {
    id: 'quora',
    name: 'Quora',
    category: 'Community',
    iconColor: '#B92B27',
    guide: 'Answer questions regarding international produce export, cold-chain logistics, and farm SaaS.',
    shareUrlTemplate: (url) => `https://www.quora.com/share?url=${encodeURIComponent(url)}`
  },
  {
    id: 'bluesky',
    name: 'Bluesky',
    category: 'Social',
    iconColor: '#0085FF',
    guide: 'Post to the open decentralized social network with AT Protocol reach.',
    shareUrlTemplate: (url, text) => `https://bsky.app/intent/compose?text=${encodeURIComponent(`${text} ${url}`)}`
  },
  {
    id: 'discord',
    name: 'Discord',
    category: 'Community',
    iconColor: '#5865F2',
    guide: 'Post in trading servers, Web3 commodities channels, and developer Discord hubs.',
    shareUrlTemplate: () => `https://discord.com/channels/@me`
  },
  {
    id: 'github',
    name: 'GitHub',
    category: 'Professional',
    iconColor: '#181717',
    guide: 'Reference repository, developer API documentation, and open SaaS webhook specifications.',
    shareUrlTemplate: () => `https://github.com/`
  },
  {
    id: 'zoom',
    name: 'Zoom',
    category: 'Professional',
    iconColor: '#2D8CFF',
    guide: 'Share during client onboarding webinars, exporter workshops, and virtual meetings.',
    shareUrlTemplate: () => `https://zoom.us/`
  },
  {
    id: 'google_business',
    name: 'Google Business Profile',
    category: 'Professional',
    iconColor: '#4285F4',
    guide: 'Create an official Google Business update post for verified local and national search ranking.',
    shareUrlTemplate: () => `https://business.google.com/`
  }
];
