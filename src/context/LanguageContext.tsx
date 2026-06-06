'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';

const translations = {
  en: {
    "page-title": "OnyxGoods | Village Roots, Urban Trust",
    "nav-home": "Home",
    "nav-shop": "Shop",
    "nav-story": "Our Story",
    "nav-reviews": "Reviews",
    "nav-cart": "Cart",
    "nav-account": "My Account",
    "footer-about-title": "About OnyxGoods",
    "footer-about-text": "OnyxGoods connects authentic village products directly with urban families, maintaining quality, freshness, and trust. Direct from rural producers.",
    "footer-links-title": "Quick Links",
    "footer-contact-title": "Contact Us",
    "footer-admin-title": "System Portal",
    "footer-admin-link": "🔑 Admin Dashboard",
    "footer-copyright": "&copy; 2026 OnyxGoods Marketplace. All rights reserved.",
    "footer-subtitle": "Village Roots, Urban Trust.",
    "footer-whatsapp": "💬 WhatsApp: +8801302101024",
    "footer-email": "📧 onyxsupport36@gmail.com",
    "footer-loc": "📍 Dhaka Office: Mirpur-10",
    "toast-cart-added": "Product added to cart!",
    "toast-cart-updated": "Cart updated!",
    "toast-cart-removed": "Product removed from cart!",
    "toast-coupon-success": "Coupon applied successfully!",
    "toast-coupon-invalid": "Invalid or expired coupon.",
    "toast-fields-req": "Please fill out all required fields.",
    "toast-order-success": "Order placed successfully! Redirecting...",
    "toast-order-failed": "Order placement failed. Please try again.",
    "toast-login-success": "Logged in successfully!",
    "toast-register-success": "Account created successfully!",
    "toast-auth-failed": "Authentication failed. Check your inputs.",
    "btn-shop-now": "Shop Now",
    "btn-explore-cats": "Explore Categories",
    "btn-add-to-cart": "Add to Cart",
    "btn-quick-view": "Quick View",
    "btn-apply": "Apply",
    "btn-checkout": "Proceed to Checkout",
    "btn-place-order": "Place Order",
    "lbl-subtotal": "Subtotal",
    "lbl-shipping": "Shipping",
    "lbl-discount": "Discount",
    "lbl-total": "Total",
    "lbl-qty": "Qty",
    "lbl-price": "Price",
    "lbl-in-stock": "In Stock",
    "lbl-out-stock": "Out of Stock",
    "lbl-benefits": "Product Benefits",
    "lbl-related": "Related Products",
    "lbl-cart-empty": "Your cart is empty",
    "lbl-cart-empty-text": "Explore our premium marketplace and discover authentic village products.",
    "lbl-search-placeholder": "Search products...",
    "lbl-sort": "Sort by",
    "opt-sort-featured": "Featured",
    "opt-sort-low": "Price: Low to High",
    "opt-sort-high": "Price: High to Low",
    "opt-sort-newest": "New Arrivals",
    "lbl-all-categories": "All Categories"
  },
  bn: {
    "page-title": "শিকড় | গ্রামের শেকড়, শহরের আস্থা",
    "nav-home": "হোম",
    "nav-shop": "শপ",
    "nav-story": "আমাদের গল্প",
    "nav-reviews": "রিভিউ",
    "nav-cart": "কার্ট",
    "nav-account": "আমার অ্যাকাউন্ট",
    "footer-about-title": "শিকড় সম্পর্কে",
    "footer-about-text": "শিকড় গ্রামের খাঁটি পণ্য সরাসরি শহরের পরিবারের সাথে সংযুক্ত করে। মান, সতেজতা ও বিশ্বাসের সাথে সরাসরি গ্রাম থেকে সংগৃহীত।",
    "footer-links-title": "সহজ লিঙ্ক",
    "footer-contact-title": "যোগাযোগ করুন",
    "footer-admin-title": "সিস্টেম পোর্টাল",
    "footer-admin-link": "🔑 অ্যাডমিন ড্যাশবোর্ড",
    "footer-copyright": "&copy; ২০২৬ OnyxGoods মার্কেটপ্লেস। সর্বস্বত্ব সংরক্ষিত।",
    "footer-subtitle": "গ্রামের শেকড়, শহরের আস্থা।",
    "footer-whatsapp": "💬 হোয়াটসঅ্যাপ: ০১৩০২১০১০২৪",
    "footer-email": "📧 onyxsupport36@gmail.com",
    "footer-loc": "📍 ঢাকা অফিস: মিরপুর-১০",
    "toast-cart-added": "কার্টে পণ্য যোগ করা হয়েছে!",
    "toast-cart-updated": "কার্ট আপডেট করা হয়েছে!",
    "toast-cart-removed": "কার্ট থেকে পণ্য সরানো হয়েছে!",
    "toast-coupon-success": "কুপন কোড সফলভাবে যোগ হয়েছে!",
    "toast-coupon-invalid": "অকার্যকর বা মেয়াদোত্তীর্ণ কুপন কোড।",
    "toast-fields-req": "দয়া করে সব প্রয়োজনীয় তথ্য পূরণ করুন।",
    "toast-order-success": "অর্ডার সফলভাবে সম্পন্ন হয়েছে! পাঠানো হচ্ছে...",
    "toast-order-failed": "অর্ডার সম্পন্ন করতে ব্যর্থ হয়েছে। আবার চেষ্টা করুন।",
    "toast-login-success": "সফলভাবে লগইন করা হয়েছে!",
    "toast-register-success": "অ্যাকাউন্ট সফলভাবে তৈরি হয়েছে!",
    "toast-auth-failed": "অথেনটিকেশন ব্যর্থ হয়েছে। তথ্যগুলো আবার চেক করুন।",
    "btn-shop-now": "কিনুন",
    "btn-explore-cats": "ক্যাটাগরি দেখুন",
    "btn-add-to-cart": "কার্টে যোগ করুন",
    "btn-quick-view": "বিস্তারিত দেখুন",
    "btn-apply": "প্রয়োগ করুন",
    "btn-checkout": "চেকআউট করুন",
    "btn-place-order": "অর্ডার প্লেস করুন",
    "lbl-subtotal": "উপমোট",
    "lbl-shipping": "ডেলিভারি চার্জ",
    "lbl-discount": "ছাড়",
    "lbl-total": "মোট",
    "lbl-qty": "পরিমাণ",
    "lbl-price": "মূল্য",
    "lbl-in-stock": "স্টকে আছে",
    "lbl-out-stock": "স্টকের বাইরে",
    "lbl-benefits": "পণ্যের উপকারিতা",
    "lbl-related": "সম্পর্কিত পণ্যসমূহ",
    "lbl-cart-empty": "আপনার কার্টটি খালি",
    "lbl-cart-empty-text": "আমাদের প্রিমিয়াম মার্কেটপ্লেসটি ঘুরে আসুন এবং গ্রামের খাঁটি পণ্যগুলো দেখুন।",
    "lbl-search-placeholder": "পণ্য খুঁজুন...",
    "lbl-sort": "বাছাই করুন",
    "opt-sort-featured": "ফিচার্ড",
    "opt-sort-low": "মূল্য: কম থেকে বেশি",
    "opt-sort-high": "মূল্য: বেশি থেকে কম",
    "opt-sort-newest": "নতুন পণ্য",
    "lbl-all-categories": "সব ক্যাটাগরি"
  }
};

export interface LanguageContextType {
  currentLang: 'en' | 'bn';
  toggleLanguage: () => void;
  t: (key: string) => string;
  translateNumber: (num: string | number) => string | number;
}

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export function LanguageProvider({ children }: { children: ReactNode }) {
  const [currentLang, setCurrentLang] = useState<'en' | 'bn'>('en');

  useEffect(() => {
    const savedLang = localStorage.getItem('onyx_goods_lang');
    if (savedLang === 'en' || savedLang === 'bn') {
      setCurrentLang(savedLang);
    }
  }, []);

  const toggleLanguage = () => {
    const nextLang = currentLang === 'en' ? 'bn' : 'en';
    setCurrentLang(nextLang);
    localStorage.setItem('onyx_goods_lang', nextLang);
  };

  const t = (key: string): string => {
    const dict = translations[currentLang];
    return (dict as Record<string, string>)[key] || key;
  };

  const translateNumber = (num: string | number): string | number => {
    if (currentLang === 'en' || !num) return num;
    const numStr = num.toString();
    const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
    return numStr.split("").map(char => {
      return (char >= "0" && char <= "9") ? bnDigits[parseInt(char, 10)] : char;
    }).join("");
  };

  return (
    <LanguageContext.Provider value={{ currentLang, toggleLanguage, t, translateNumber }}>
      {children}
    </LanguageContext.Provider>
  );
}

export function useLanguage() {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
}
