import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Language {
  code: string;
  name: string;
  nativeName: string;
  flag: string;
  region: 'Americas' | 'Europe' | 'Asia-Pacific' | 'Middle East & Africa' | 'South Asia';
  dir: 'ltr' | 'rtl';
  greeting: string;
  country: string;
  speakers: string;
  currency: {
    code: string;
    symbol: string;
    rateVsUsd: number; // e.g. 1 USD = 0.92 EUR
  };
}

export const GLOBAL_LANGUAGES: Language[] = [
  { code: 'en', name: 'English', nativeName: 'English', flag: '🇬🇧', region: 'Americas', dir: 'ltr', greeting: 'Hello & Welcome 👋', country: 'Global / USA / UK', speakers: '1.5 Billion', currency: { code: 'USD', symbol: '$', rateVsUsd: 1.0 } },
  { code: 'hi', name: 'Hindi', nativeName: 'हिन्दी', flag: '🇮🇳', region: 'South Asia', dir: 'ltr', greeting: 'नमस्ते एवं स्वागतम् 🙏', country: 'India', speakers: '610 Million', currency: { code: 'INR', symbol: '₹', rateVsUsd: 83.5 } },
  { code: 'es', name: 'Spanish', nativeName: 'Español', flag: '🇪🇸', region: 'Europe', dir: 'ltr', greeting: '¡Hola y Bienvenidos! 👋', country: 'Spain / Latin America', speakers: '560 Million', currency: { code: 'EUR', symbol: '€', rateVsUsd: 0.92 } },
  { code: 'fr', name: 'French', nativeName: 'Français', flag: '🇫🇷', region: 'Europe', dir: 'ltr', greeting: 'Bonjour et Bienvenue 🥖', country: 'France / Francophonie', speakers: '320 Million', currency: { code: 'EUR', symbol: '€', rateVsUsd: 0.92 } },
  { code: 'de', name: 'German', nativeName: 'Deutsch', flag: '🇩🇪', region: 'Europe', dir: 'ltr', greeting: 'Guten Tag & Willkommen 🥨', country: 'Germany / Austria / Switzerland', speakers: '135 Million', currency: { code: 'EUR', symbol: '€', rateVsUsd: 0.92 } },
  { code: 'zh', name: 'Mandarin Chinese', nativeName: '中文 (简体)', flag: '🇨🇳', region: 'Asia-Pacific', dir: 'ltr', greeting: '你好，欢迎光临 🥢', country: 'China / Singapore', speakers: '1.1 Billion', currency: { code: 'CNY', symbol: '¥', rateVsUsd: 7.23 } },
  { code: 'ja', name: 'Japanese', nativeName: '日本語', flag: '🇯🇵', region: 'Asia-Pacific', dir: 'ltr', greeting: 'こんにちは・いらっしゃいませ 🍵', country: 'Japan', speakers: '125 Million', currency: { code: 'JPY', symbol: '¥', rateVsUsd: 155.0 } },
  { code: 'ar', name: 'Arabic', nativeName: 'العربية', flag: '🇸🇦', region: 'Middle East & Africa', dir: 'rtl', greeting: 'مرحباً وأهلاً بكم ☕', country: 'Saudi Arabia / UAE / MENA', speakers: '420 Million', currency: { code: 'AED', symbol: 'د.إ', rateVsUsd: 3.67 } },
  { code: 'bn', name: 'Bengali', nativeName: 'বাংলা', flag: '🇧🇩', region: 'South Asia', dir: 'ltr', greeting: 'নমস্কার ও স্বাগতম 🌾', country: 'Bangladesh / India', speakers: '300 Million', currency: { code: 'BDT', symbol: '৳', rateVsUsd: 117.0 } },
  { code: 'pt', name: 'Portuguese', nativeName: 'Português', flag: '🇧🇷', region: 'Americas', dir: 'ltr', greeting: 'Olá e Bem-vindo 🇧🇷', country: 'Brazil / Portugal', speakers: '260 Million', currency: { code: 'BRL', symbol: 'R$', rateVsUsd: 5.45 } },
  { code: 'ru', name: 'Russian', nativeName: 'Русский', flag: '🇷🇺', region: 'Europe', dir: 'ltr', greeting: 'Здравствуйте и добро пожаловать 🌾', country: 'Eurasia', speakers: '255 Million', currency: { code: 'RUB', symbol: '₽', rateVsUsd: 88.5 } },
  { code: 'ko', name: 'Korean', nativeName: '한국어', flag: '🇰🇷', region: 'Asia-Pacific', dir: 'ltr', greeting: '안녕하세요, 환영합니다 🌸', country: 'South Korea', speakers: '82 Million', currency: { code: 'KRW', symbol: '₩', rateVsUsd: 1375.0 } },
  { code: 'it', name: 'Italian', nativeName: 'Italiano', flag: '🇮🇹', region: 'Europe', dir: 'ltr', greeting: 'Benvenuti nel mercato 🇮🇹', country: 'Italy', speakers: '68 Million', currency: { code: 'EUR', symbol: '€', rateVsUsd: 0.92 } },
  { code: 'pa', name: 'Punjabi', nativeName: 'ਪੰਜਾਬੀ', flag: '🇮🇳', region: 'South Asia', dir: 'ltr', greeting: 'ਸਤਿ ਸ੍ਰੀ ਅਕਾਲ ਜੀ 🙏', country: 'India / Agri Belt', speakers: '125 Million', currency: { code: 'INR', symbol: '₹', rateVsUsd: 83.5 } },
  { code: 'ta', name: 'Tamil', nativeName: 'தமிழ்', flag: '🇮🇳', region: 'South Asia', dir: 'ltr', greeting: 'வணக்கம், நல்வரவு 🙏', country: 'India / Sri Lanka / Singapore', speakers: '88 Million', currency: { code: 'INR', symbol: '₹', rateVsUsd: 83.5 } },
  { code: 'te', name: 'Telugu', nativeName: 'తెలుగు', flag: '🇮🇳', region: 'South Asia', dir: 'ltr', greeting: 'నమస్కారం, స్వాగతం 🙏', country: 'India / Agri Hub', speakers: '96 Million', currency: { code: 'INR', symbol: '₹', rateVsUsd: 83.5 } },
  { code: 'mr', name: 'Marathi', nativeName: 'मराठी', flag: '🇮🇳', region: 'South Asia', dir: 'ltr', greeting: 'नमस्कार आणि स्वागत 🙏', country: 'India / Maharashtra', speakers: '95 Million', currency: { code: 'INR', symbol: '₹', rateVsUsd: 83.5 } },
  { code: 'gu', name: 'Gujarati', nativeName: 'ગુજરાતી', flag: '🇮🇳', region: 'South Asia', dir: 'ltr', greeting: 'નમસ્તે અને સ્વાગત છે 🙏', country: 'India / Spice Hub', speakers: '62 Million', currency: { code: 'INR', symbol: '₹', rateVsUsd: 83.5 } },
  { code: 'ur', name: 'Urdu', nativeName: 'اردو', flag: '🇵🇰', region: 'South Asia', dir: 'rtl', greeting: 'خوش آمدید اور سلام 🌺', country: 'Pakistan / India', speakers: '230 Million', currency: { code: 'PKR', symbol: '₨', rateVsUsd: 278.0 } },
  { code: 'sw', name: 'Swahili', nativeName: 'Kiswahili', flag: '🇰🇪', region: 'Middle East & Africa', dir: 'ltr', greeting: 'Jambo na Karibu Sana 🌍', country: 'Kenya / Tanzania / East Africa', speakers: '100 Million', currency: { code: 'KES', symbol: 'KSh', rateVsUsd: 130.0 } },
  { code: 'tr', name: 'Turkish', nativeName: 'Türkçe', flag: '🇹🇷', region: 'Middle East & Africa', dir: 'ltr', greeting: 'Merhaba ve Hoş Geldiniz 🧿', country: 'Turkey', speakers: '88 Million', currency: { code: 'TRY', symbol: '₺', rateVsUsd: 32.8 } },
  { code: 'nl', name: 'Dutch', nativeName: 'Nederlands', flag: '🇳🇱', region: 'Europe', dir: 'ltr', greeting: 'Hallo en Welkom 🌷', country: 'Netherlands / Belgium', speakers: '25 Million', currency: { code: 'EUR', symbol: '€', rateVsUsd: 0.92 } },
  { code: 'vi', name: 'Vietnamese', nativeName: 'Tiếng Việt', flag: '🇻🇳', region: 'Asia-Pacific', dir: 'ltr', greeting: 'Xin chào và Chào mừng 🇻🇳', country: 'Vietnam', speakers: '85 Million', currency: { code: 'VND', symbol: '₫', rateVsUsd: 25400.0 } },
  { code: 'th', name: 'Thai', nativeName: 'ไทย', flag: '🇹🇭', region: 'Asia-Pacific', dir: 'ltr', greeting: 'สวัสดีและยินดีต้อนรับ 🐘', country: 'Thailand', speakers: '71 Million', currency: { code: 'THB', symbol: '฿', rateVsUsd: 36.8 } },
  { code: 'id', name: 'Indonesian', nativeName: 'Bahasa Indonesia', flag: '🇮🇩', region: 'Asia-Pacific', dir: 'ltr', greeting: 'Selamat Datang di Pasar 🌴', country: 'Indonesia', speakers: '200 Million', currency: { code: 'IDR', symbol: 'Rp', rateVsUsd: 16200.0 } },
  { code: 'ms', name: 'Malay', nativeName: 'Bahasa Melayu', flag: '🇲🇾', region: 'Asia-Pacific', dir: 'ltr', greeting: 'Selamat Datang 🇲🇾', country: 'Malaysia', speakers: '35 Million', currency: { code: 'MYR', symbol: 'RM', rateVsUsd: 4.72 } },
  { code: 'pl', name: 'Polish', nativeName: 'Polski', flag: '🇵🇱', region: 'Europe', dir: 'ltr', greeting: 'Dzień dobry i witamy 🥟', country: 'Poland', speakers: '45 Million', currency: { code: 'PLN', symbol: 'zł', rateVsUsd: 3.95 } },
  { code: 'el', name: 'Greek', nativeName: 'Ελληνικά', flag: '🇬🇷', region: 'Europe', dir: 'ltr', greeting: 'Γεια σας και καλώς ήρθατε 🫒', country: 'Greece / Cyprus', speakers: '14 Million', currency: { code: 'EUR', symbol: '€', rateVsUsd: 0.92 } },
  { code: 'uk', name: 'Ukrainian', nativeName: 'Українська', flag: '🇺🇦', region: 'Europe', dir: 'ltr', greeting: 'Ласкаво просимо 🌻', country: 'Ukraine', speakers: '40 Million', currency: { code: 'UAH', symbol: '₴', rateVsUsd: 40.5 } },
  { code: 'tl', name: 'Tagalog / Filipino', nativeName: 'Wikang Tagalog', flag: '🇵🇭', region: 'Asia-Pacific', dir: 'ltr', greeting: 'Mabuhay at Maligayang Pagdating 🥭', country: 'Philippines', speakers: '82 Million', currency: { code: 'PHP', symbol: '₱', rateVsUsd: 58.5 } },
  { code: 'he', name: 'Hebrew', nativeName: 'עברית', flag: '🇮🇱', region: 'Middle East & Africa', dir: 'rtl', greeting: 'שלום וברוכים הבאים 🕊️', country: 'Israel', speakers: '9 Million', currency: { code: 'ILS', symbol: '₪', rateVsUsd: 3.72 } },
  { code: 'sv', name: 'Swedish', nativeName: 'Svenska', flag: '🇸🇪', region: 'Europe', dir: 'ltr', greeting: 'Välkommen till marknaden ❄️', country: 'Sweden', speakers: '10 Million', currency: { code: 'SEK', symbol: 'kr', rateVsUsd: 10.8 } }
];

// Essential UI dictionary mapping for top languages
const TRANSLATION_DICTIONARY: Record<string, Record<string, string>> = {
  hi: {
    'nav.marketplace': 'ग्लोबल मार्केटप्लेस',
    'nav.recipes': 'मौसमी रेसिपी',
    'nav.cropDoctor': 'फसल डॉक्टर AI',
    'nav.cart': 'शॉपिंग कार्ट',
    'nav.dashboard': 'डैशबोर्ड',
    'nav.orders': 'ऑर्डर सूची',
    'nav.sellerCenter': 'विक्रेता केंद्र',
    'hero.title': 'खेत से सीधे वैश्विक कृषि बाजार',
    'hero.subtitle': 'ताजे फल, सब्जियां और मसालों के लिए दुनिया भर के किसानों को सीधे अंतरराष्ट्रीय खरीदारों से जोड़ना।',
    'search.placeholder': 'कृषि उत्पाद, फल, सब्जियां, मसाले खोजें...',
    'btn.addToCart': 'कार्ट में जोड़ें',
    'btn.buyNow': 'अभी खरीदें',
    'label.organic': 'प्रमाणित जैविक',
    'label.ecoScore': 'इको स्कोर',
    'label.carbonFootprint': 'कार्बन पदचिह्न',
    'label.seasonalRecipes': 'मौसमी AI रेसिपी',
    'label.currency': 'मुद्रा',
    'label.language': 'भाषा',
    'btn.minimizeView': 'वेबपेज छोटा करें (सभी भाषाएं देखें)',
    'btn.maximizeView': 'वेबपेज बड़ा करें'
  },
  es: {
    'nav.marketplace': 'Mercado Global',
    'nav.recipes': 'Recetas de Estación',
    'nav.cropDoctor': 'IA Médico de Cultivos',
    'nav.cart': 'Carrito de Compras',
    'nav.dashboard': 'Panel de Control',
    'nav.orders': 'Mis Pedidos',
    'nav.sellerCenter': 'Centro de Vendedores',
    'hero.title': 'Mercado Agrícola Global Directo de Granja',
    'hero.subtitle': 'Conectando agricultores de todo el mundo directamente con compradores para frutas, verduras y especias frescas.',
    'search.placeholder': 'Buscar productos agrícolas, frutas, verduras, especias...',
    'btn.addToCart': 'Añadir al Carrito',
    'btn.buyNow': 'Comprar Ahora',
    'label.organic': 'Orgánico Certificado',
    'label.ecoScore': 'Puntuación Ecológica',
    'label.carbonFootprint': 'Huella de Carbono',
    'label.seasonalRecipes': 'Recetas Estacionales con IA',
    'label.currency': 'Moneda',
    'label.language': 'Idioma',
    'btn.minimizeView': 'Minimizar Página (Ver Idiomas)',
    'btn.maximizeView': 'Maximizar Página'
  },
  fr: {
    'nav.marketplace': 'Marché Global',
    'nav.recipes': 'Recettes de Saison',
    'nav.cropDoctor': 'IA Médecin des Cultures',
    'nav.cart': 'Panier d’Achat',
    'nav.dashboard': 'Tableau de Bord',
    'nav.orders': 'Mes Commandes',
    'nav.sellerCenter': 'Espace Vendeur',
    'hero.title': 'Marché Agricole Mondial Ferme à la Table',
    'hero.subtitle': 'Connecter les agriculteurs du monde entier directement avec les acheteurs de fruits, légumes et épices frais.',
    'search.placeholder': 'Rechercher des produits agricoles, fruits, légumes, épices...',
    'btn.addToCart': 'Ajouter au Panier',
    'btn.buyNow': 'Acheter Maintenant',
    'label.organic': 'Biologique Certifié',
    'label.ecoScore': 'Score Écologique',
    'label.carbonFootprint': 'Empreinte Carbone',
    'label.seasonalRecipes': 'Recettes de Saison IA',
    'label.currency': 'Devise',
    'label.language': 'Langue',
    'btn.minimizeView': 'Réduire la page (Voir langues)',
    'btn.maximizeView': 'Agrandir la page'
  },
  de: {
    'nav.marketplace': 'Globaler Marktplatz',
    'nav.recipes': 'Saisonale Rezepte',
    'nav.cropDoctor': 'KI Pflanzendoktor',
    'nav.cart': 'Warenkorb',
    'nav.dashboard': 'Dashboard',
    'nav.orders': 'Bestellungen',
    'nav.sellerCenter': 'Verkäuferzentrum',
    'hero.title': 'Globaler Landwirtschaftsmarkt direkt vom Bauernhof',
    'hero.subtitle': 'Verbindung von Landwirten weltweit direkt mit Käufern für frisches Obst, Gemüse und Gewürze.',
    'search.placeholder': 'Agrarprodukte, Obst, Gemüse, Gewürze suchen...',
    'btn.addToCart': 'In den Warenkorb',
    'btn.buyNow': 'Jetzt Kaufen',
    'label.organic': 'Zertifiziert Bio',
    'label.ecoScore': 'Öko-Bewertung',
    'label.carbonFootprint': 'CO₂-Fußabdruck',
    'label.seasonalRecipes': 'Saisonale KI-Rezepte',
    'label.currency': 'Währung',
    'label.language': 'Sprache',
    'btn.minimizeView': 'Seite minimieren (Sprachen)',
    'btn.maximizeView': 'Seite maximieren'
  },
  zh: {
    'nav.marketplace': '全球农产品市场',
    'nav.recipes': '时令食谱',
    'nav.cropDoctor': 'AI 农作物医生',
    'nav.cart': '购物车',
    'nav.dashboard': '控制台',
    'nav.orders': '我的订单',
    'nav.sellerCenter': '卖家中心',
    'hero.title': '农场直达全球农业市场',
    'hero.subtitle': '将世界各地的农夫与新鲜水果、蔬菜和香料买家直接连接。',
    'search.placeholder': '搜索农产品、水果、蔬菜、香料...',
    'btn.addToCart': '加入购物车',
    'btn.buyNow': '立即购买',
    'label.organic': '有机认证',
    'label.ecoScore': '环保评分',
    'label.carbonFootprint': '碳足迹',
    'label.seasonalRecipes': 'AI 时令食谱',
    'label.currency': '货币',
    'label.language': '语言',
    'btn.minimizeView': '缩小网页 (查看所有语言)',
    'btn.maximizeView': '放大全屏'
  },
  ar: {
    'nav.marketplace': 'السوق الزراعي العالمي',
    'nav.recipes': 'وصفات موسمية',
    'nav.cropDoctor': 'طبيب المحاصيل بالذكاء الاصطناعي',
    'nav.cart': 'سلة التسوق',
    'nav.dashboard': 'لوحة التحكم',
    'nav.orders': 'طلباتي',
    'nav.sellerCenter': 'مركز البائعين',
    'hero.title': 'سوق زراعي عالمي من المزرعة مباشرة',
    'hero.subtitle': 'ربط المزارعين حول العالم مباشرة بالمشترين للفواكه والخضروات والتوابل الطازجة.',
    'search.placeholder': 'البحث عن المنتجات الزراعية، الفواكه، الخضروات، التوابل...',
    'btn.addToCart': 'أضف إلى السلة',
    'btn.buyNow': 'اشتري الآن',
    'label.organic': 'عضوي معتمد',
    'label.ecoScore': 'مؤشر الاستدامة',
    'label.carbonFootprint': 'البصمة الكربونية',
    'label.seasonalRecipes': 'وصفات موسمية بالذكاء الاصطناعي',
    'label.currency': 'العملة',
    'label.language': 'اللغة',
    'btn.minimizeView': 'تصغير الصفحة (عرض اللغات)',
    'btn.maximizeView': 'تكبير الصفحة'
  },
  ja: {
    'nav.marketplace': 'グローバル農産物市場',
    'nav.recipes': '旬のレシピ',
    'nav.cropDoctor': 'AI 作物ドクター',
    'nav.cart': 'ショッピングカート',
    'nav.dashboard': 'ダッシュボード',
    'nav.orders': '注文履歴',
    'nav.sellerCenter': '出品者センター',
    'hero.title': '農家直送のグローバルアグリマーケット',
    'hero.subtitle': '世界中の農家と新鮮な果物、野菜、スパイスのバイヤーを直接繋ぎます。',
    'search.placeholder': '農産物、果物、野菜、スパイスを検索...',
    'btn.addToCart': 'カートに追加',
    'btn.buyNow': '今すぐ購入',
    'label.organic': '有機JAS認証',
    'label.ecoScore': 'エコスコア',
    'label.carbonFootprint': 'カーボンフットプリント',
    'label.seasonalRecipes': 'AI旬のレシピ',
    'label.currency': '通貨',
    'label.language': '言語',
    'btn.minimizeView': 'ページを縮小（言語一覧）',
    'btn.maximizeView': '全画面表示'
  },
  sw: {
    'nav.marketplace': 'Soko la Kilimo la Kimataifa',
    'nav.recipes': 'Mapishi ya Msimu',
    'nav.cropDoctor': 'Daktari wa Mazao AI',
    'nav.cart': 'Kikapu Cha Ununuzi',
    'nav.dashboard': 'Dashboard',
    'nav.orders': 'Orodha ya Oda',
    'nav.sellerCenter': 'Kituo cha Wauzaji',
    'hero.title': 'Soko la Kimataifa Kutoka Shamba Moja Kwa Moja',
    'hero.subtitle': 'Kuuunganisha wakulima ulimwenguni kote na wanunuzi wa matunda na mboga mpya.',
    'search.placeholder': 'Tafuta mazao ya kilimo, matunda, mboga, viungo...',
    'btn.addToCart': 'Weka Kwenye Kikapu',
    'btn.buyNow': 'Nunua Sasa',
    'label.organic': 'Aina ya Organiki',
    'label.ecoScore': 'Alama ya Mazingira',
    'label.carbonFootprint': 'Athari ya Kaboni',
    'label.seasonalRecipes': 'Mapishi ya AI ya Msimu',
    'label.currency': 'Mataji',
    'label.language': 'Lugha',
    'btn.minimizeView': 'Punguza Ukurasa (Orodha ya Lugha)',
    'btn.maximizeView': 'Kuza Ukurasa'
  }
};

export interface LanguageContextType {
  currentLanguage: Language;
  setLanguageByCode: (code: string) => void;
  t: (key: string, fallback?: string) => string;
  formatPriceInLocalCurrency: (usdPrice: number) => string;
  translateDynamicText: (text: string) => Promise<string>;
  isTranslating: boolean;
  isPageMinimized: boolean;
  setIsPageMinimized: (minimized: boolean) => void;
  togglePageMinimized: () => void;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState<Language>(GLOBAL_LANGUAGES[0]);
  const [isTranslating, setIsTranslating] = useState<boolean>(false);
  const [isPageMinimized, setIsPageMinimized] = useState<boolean>(false);
  const [dynamicTranslationCache, setDynamicTranslationCache] = useState<Record<string, string>>({});

  // Restore saved language preference
  useEffect(() => {
    const savedCode = localStorage.getItem('freshworld_lang');
    if (savedCode) {
      const found = GLOBAL_LANGUAGES.find(l => l.code === savedCode);
      if (found) setCurrentLanguage(found);
    }
  }, []);

  // Sync document direction (LTR vs RTL) on language switch
  useEffect(() => {
    document.documentElement.dir = currentLanguage.dir;
    document.documentElement.lang = currentLanguage.code;
    localStorage.setItem('freshworld_lang', currentLanguage.code);
  }, [currentLanguage]);

  // Escape key handler to quickly maximize webpage
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isPageMinimized) {
        setIsPageMinimized(false);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isPageMinimized]);

  const setLanguageByCode = (code: string) => {
    const lang = GLOBAL_LANGUAGES.find(l => l.code === code);
    if (lang) {
      setCurrentLanguage(lang);
    }
  };

  const togglePageMinimized = () => {
    setIsPageMinimized(prev => !prev);
  };

  const t = (key: string, fallback?: string): string => {
    if (currentLanguage.code === 'en') {
      return fallback || key;
    }

    const dict = TRANSLATION_DICTIONARY[currentLanguage.code];
    if (dict && dict[key]) {
      return dict[key];
    }

    return fallback || key;
  };

  const formatPriceInLocalCurrency = (usdPrice: number): string => {
    const { symbol, rateVsUsd, code } = currentLanguage.currency;
    const converted = usdPrice * rateVsUsd;

    // Formatting based on currency
    if (code === 'JPY' || code === 'KRW' || code === 'VND' || code === 'IDR') {
      return `${symbol} ${Math.round(converted).toLocaleString()}`;
    }

    return `${symbol} ${converted.toFixed(2)}`;
  };

  const translateDynamicText = async (text: string): Promise<string> => {
    if (!text || currentLanguage.code === 'en') return text;

    const cacheKey = `${currentLanguage.code}:${text}`;
    if (dynamicTranslationCache[cacheKey]) {
      return dynamicTranslationCache[cacheKey];
    }

    try {
      setIsTranslating(true);
      const res = await fetch('/api/ai/translate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          text,
          targetLanguage: currentLanguage.name,
          sourceLanguage: 'English'
        })
      });

      if (!res.ok) return text;
      const data = await res.json();
      const translated = data.translatedText || text;

      setDynamicTranslationCache(prev => ({ ...prev, [cacheKey]: translated }));
      return translated;
    } catch (err) {
      console.error('Translation error:', err);
      return text;
    } finally {
      setIsTranslating(false);
    }
  };

  return (
    <LanguageContext.Provider value={{
      currentLanguage,
      setLanguageByCode,
      t,
      formatPriceInLocalCurrency,
      translateDynamicText,
      isTranslating,
      isPageMinimized,
      setIsPageMinimized,
      togglePageMinimized
    }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};
