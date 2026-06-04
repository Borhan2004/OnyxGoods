// Firebase configuration placeholders
// Replace these values with your actual Firebase project settings
const firebaseConfig = {
  apiKey: "AIzaSyD1xvrgTpoldBiMkPi4YkRB3f35j7wgkBY",
  authDomain: "dudhwala-13a69.firebaseapp.com",
  projectId: "dudhwala-13a69",
  storageBucket: "dudhwala-13a69.firebasestorage.app",
  messagingSenderId: "360751875123",
  appId: "1:360751875123:web:dd56e1cd1f0ad8e01d4f46"
};

// Global State
let db = null;
let isMockMode = false;
let currentLang = localStorage.getItem("lang") || "en";

// Translation Dictionaries
const translations = {
  en: {
    "page-title": "DudhWala | 250 KM Fresh Farm-to-Home Milk Delivery",
    "nav-logo-link": 'Dudh<span>Wala</span>',
    "link-home": "Home",
    "link-about": "Why Us",
    "link-products": "Products",
    "link-process": "Our Process",
    "link-reviews": "Reviews",
    "nav-cta-btn": "Order Now",
    
    "hero-badge-tag": "100% Pure & Untouched",
    "hero-heading": "250 KM Fresh <em>Farm-to-Home</em> Milk Delivery",
    "hero-subtitle": "Collected today from trusted village farmer families, chilled immediately to lock in freshness, and transported 250 KM refrigerated to arrive at your doorstep tomorrow morning.",
    "hero-primary-cta": "Order Fresh Milk",
    "hero-secondary-cta": "Why Our Milk Is Different",
    
    "stat-distance": '250+ KM<div class="stat-label">Refrigerated Transport</div>',
    "stat-farmers": '15+ Families<div class="stat-label">Trusted Village Farmers</div>',
    "stat-delivery": '24 Hrs<div class="stat-label">Freshness Window</div>',
    
    "txt-trust-fridge": "250 KM Refrigerated Chain",
    "txt-trust-farmers": "Direct Farmer Sourced",
    "txt-trust-testing": "Purity & Fat Checked",
    "txt-trust-chemical": "Zero Water or Preservatives",
    
    "about-badge-tag": '<strong>100%</strong> Verified Village Sourced',
    "lbl-why-us": "Why Our Milk Is Different",
    "about-heading": "Naturally Rich, Safely <em>Chilled</em> & Untouched",
    "about-desc": "Most commercial milk spends days traveling through middlemen, getting chemically treated or mixed in giant silos. We believe in preserving the traditional taste of pure village cow milk.",
    "why-li-1": "Collected from verified village farmer families caring for native cows.",
    "why-li-2": "Chilled immediately at village collection centers to halt bacteria growth.",
    "why-li-3": "Rigorous quality verification for fat, purity, and water before dispatch.",
    "why-li-4": "Transported 250 KM in specialized cold chains (under 4°C).",
    "why-li-5": "Delivered fresh to your doorstep within 24 hours of cow milking—no middlemen.",
    "about-order-cta": "Get Tomorrow's Milk",
    
    "lbl-freshly-sourced": "Freshly Sourced",
    "products-heading": "Our Small-Batch Products",
    "prod-name-daily": "Daily Raw Cow Milk",
    "prod-desc-daily": "Pure, raw, single-source cow milk chilled immediately. Rich in nutrients, ideal for families, boiling, and daily consumption.",
    "prod-price-daily": '80 ৳ <span id="prod-unit-daily">/ Liter</span>',
    "btn-select-daily-milk": "Select",
    "prod-name-full": "Full Cream Village Milk",
    "prod-desc-full": "Rich in cream and natural fats, sourced from cows raised on green grass. Perfect for making traditional sweets, ghee, and curd.",
    "prod-price-full": '95 ৳ <span id="prod-unit-full">/ Liter</span>',
    "btn-select-full-cream": "Select",
    "prod-name-ghee": "Premium Village Cow Ghee",
    "prod-desc-ghee": "Slow-cooked pure cow ghee made from cultured butter cream. Granular texture, signature traditional aroma, and deep golden color.",
    "prod-price-ghee": '1,200 ৳ <span id="prod-unit-ghee">/ Kg</span>',
    "btn-select-ghee": "Select",
    
    "lbl-ops-driven": "Operations Driven",
    "process-heading": "How Fresh Milk Reaches You",
    "process-subtitle": "A daily logistically optimized flow built around freshness and temperature control.",
    "step-title-1": "Place Order Before 8 PM",
    "step-desc-1": "Order today. We lock the collection volumes for tomorrow morning's dispatch.",
    "step-title-2": "Morning Collection",
    "step-desc-2": "Milk is collected early in the morning from verified farmer families at local centers.",
    "step-title-3": "250 KM Transport",
    "step-desc-3": "Milk is instantly chilled to 4°C and transported in refrigerated containers over 250 kilometers.",
    "step-title-4": "Next Morning Delivery",
    "step-desc-4": "Arrives in the city fresh and cold, delivered to your doorstep within 24 hours of milking.",
    
    "lbl-cust-reviews": "Customer Reviews",
    "reviews-heading": "What Milk Lovers Say",
    "rev-text-1": "I was skeptical about delivery from 250 KM away, but the milk arrived ice-cold and has a beautiful cream layer after boiling. Reminds me of my village home.",
    "rev-name-1": "Rahim Uddin",
    "rev-loc-1": "Mirpur, Dhaka",
    "rev-text-2": "We order the Full Cream Milk daily. The ghee made from this milk is incredible! My kids love the natural sweetness. Highly recommend the subscription.",
    "rev-name-2": "Nusrat Jahan",
    "rev-loc-2": "Gulshan, Dhaka",
    "rev-text-3": "Traditional granular ghee is hard to find in Dhaka. DudhWala's cow ghee is aromatic, deep golden, and tastes authentic. Ordering was super simple.",
    "rev-name-3": "Farhan Ahmed",
    "rev-loc-3": "Dhanmondi, Dhaka",
    
    "order-form-title": "Place Your Order",
    "lbl-cust-name": "Full Name *",
    "lbl-cust-phone": "Phone Number *",
    "lbl-cust-whatsapp": "WhatsApp Number *",
    "lbl-cust-address": "Delivery Address *",
    "lbl-delivery-area": "Delivery Area *",
    "lbl-cust-landmark": "Landmark *",
    "lbl-order-product": "Select Product *",
    "lbl-delivery-date": "First Delivery Date *",
    "lbl-subscription-type": "Subscription Plan *",
    "lbl-payment-method": "Payment Method *",
    "btn-submit-order": "Confirm Tomorrow's Delivery",
    
    "opt-select-area": "Select Area",
    "opt-choose-product": "Choose Product",
    "opt-qty": "Quantity",
    "opt-sub-onetime": "One Time (Single Order)",
    "opt-sub-daily": "Daily Subscription",
    "opt-sub-weekly": "Weekly (Every 7 Days)",
    "opt-sub-monthly": "Monthly (Every 30 Days)",
    "opt-pay-cash": "Cash on Delivery",
    "opt-pay-bkash": "bKash (Send Money)",
    "opt-pay-nagad": "Nagad (Send Money)",
    
    "lbl-freshness-guaranteed": "Freshness Guaranteed",
    "order-info-heading": "Tomorrow Morning Delivery",
    "order-info-text": "We operate a 24-hour delivery window. Any order received today before 8:00 PM is collected from our farmers tomorrow morning, chilled, transported 250 KM, and delivered fresh to your door next morning.",
    "order-subinfo-title-1": "📦 Real-time Status via WhatsApp",
    "order-subinfo-text-1": "After placing your order, you will receive an automatic WhatsApp notification confirming your delivery slot. You can message us anytime to adjust your subscription or delivery address.",
    "order-subinfo-title-2": "🌿 Multiple Farmer Families",
    "order-subinfo-text-2": "Your purchase directly supports 15+ farmer families. We collect milk from verified local families who take excellent care of their pasture-fed cows. This ensures rich milk quality, every single day.",
    
    "footer-logo-link": 'Dudh<span>Wala</span>',
    "footer-brand-text": "Authentic, natural, farm-fresh milk sourced from local village farmers. Transported with love in our refrigerated cold chain.",
    "footer-hdr-quicklinks": "Quick Links",
    "footer-hdr-contact": "Contact Us",
    "footer-hdr-portal": "System Portal",
    "footer-copyright": "&copy; 2026 DudhWala Milk Delivery. All rights reserved.",
    "footer-subtitle": "Collected Today, Delivered Chilled Tomorrow.",
    "footer-wa": "💬 WhatsApp: +880 1998-518914",
    "footer-email": "📧 borhankustia@gmail.com",
    
    // Quick Links text links
    "fl-home": "Home",
    "fl-about": "Why Us",
    "fl-products": "Products",
    "fl-process": "Our Process",
    "fl-loc": "📍 Dhaka Office: Mirpur-10",
    "link-admin-panel": "🔑 Admin Dashboard",
    
    // Toast & Submit Actions
    "toast-success-wa": "Order placed successfully! Redirecting to WhatsApp...",
    "toast-fields-req": "Please fill out all required fields.",
    "toast-failed": "Failed to place order. Please try again.",
    "toast-placing": "Placing Order..."
  },
  bn: {
    "page-title": "দুধওয়ালা | ২৫০ কিমি দূর থেকে খামার-তাজা গরুর দুধ ডেলিভারি",
    "nav-logo-link": 'Dudh<span>Wala</span>',
    "link-home": "হোম",
    "link-about": "আমাদের বৈশিষ্ট্য",
    "link-products": "পণ্যসমূহ",
    "link-process": "ডেলিভারি ধাপ",
    "link-reviews": "রিভিউ",
    "nav-cta-btn": "অর্ডার করুন",
    
    "hero-badge-tag": "১০০% খাঁটি ও স্পর্শহীন",
    "hero-heading": "২৫০ কিমি দূর থেকে <em>খামার-তাজা</em> সরাসরি দুয়ারে",
    "hero-subtitle": "বিশ্বস্ত গ্রাম্য খামারিদের থেকে আজই সংগৃহীত, পুষ্টি ও সতেজতা ধরে রাখতে দ্রুত শীতলীকৃত এবং ২৫০ কিমি দূর থেকে কোল্ড-চেইনে আগামীকাল সকালে আপনার দুয়ারে পরিবাহিত।",
    "hero-primary-cta": "দুধ অর্ডার করুন",
    "hero-secondary-cta": "আমাদের দুধ কেন আলাদা",
    
    "stat-distance": '২৫০+ কিমি<div class="stat-label">কোল্ড-চেইন পরিবহন</div>',
    "stat-farmers": '১৫+ পরিবার<div class="stat-label">বিশ্বস্ত গ্রাম্য খামারি</div>',
    "stat-delivery": '২৪ ঘণ্টা<div class="stat-label">সতেজতা উইন্ডো</div>',
    
    "txt-trust-fridge": "২৫০ কিমি কোল্ড-চেইন",
    "txt-trust-farmers": "সরাসরি খামারি থেকে",
    "txt-trust-testing": "বিশুদ্ধতা ও ফ্যাট পরীক্ষিত",
    "txt-trust-chemical": "১০০% প্রিজারভেটিভ মুক্ত",
    
    "about-badge-tag": '<strong>১০০%</strong> যাচাইকৃত গ্রাম্য উৎস',
    "lbl-why-us": "আমাদের দুধ কেন আলাদা",
    "about-heading": "প্রাকৃতিক পুষ্টিগুণ সম্পন্ন, নিরাপদ <em>শীতলীকরণ</em> ও স্পর্শহীন",
    "about-desc": "সাধারণত বাজারজাতকৃত দুধ মধ্যস্বত্বভোগীদের মাধ্যমে আসতে দিন পার হয়ে যায়, রাসায়নিক প্রক্রিয়াজাত করা হয় বা বিশাল ট্যাংকে মিশ্রিত করা হয়। আমরা খাঁটি গ্রাম্য গরুর দুধের ঐতিহ্যবাহী স্বাদ বজায় রাখতে বিশ্বাসী।",
    "why-li-1": "দেশি গরুর যত্ন নেওয়া যাচাইকৃত গ্রাম্য খামারিদের থেকে সংগৃহীত।",
    "why-li-2": "ব্যাকটেরিয়ার আক্রমণ রোধ করতে গ্রামের সংগ্রহ কেন্দ্রে তাৎক্ষণিকভাবে শীতলীকৃত।",
    "why-li-3": "পাঠানোর আগে ফ্যাট, বিশুদ্ধতা এবং পানির পরিমাণ কঠোরভাবে যাচাইকরণ।",
    "why-li-4": "বিশেষায়িত কোল্ড চেইনে (৪° সেলসিয়াসের নিচে) ২৫০ কিমি পরিবহন।",
    "why-li-5": "কোনো মধ্যস্বত্বভোগী ছাড়া গরু দোয়ানোর ২৪ ঘণ্টার মধ্যে আপনার ঘরে পৌঁছে দেওয়া।",
    "about-order-cta": "আগামীকালের দুধের অর্ডার দিন",
    
    "lbl-freshly-sourced": "তাজা উৎস",
    "products-heading": "আমাদের সতেজ পণ্যসমূহ",
    "prod-name-daily": "দৈনিক কাঁচা গরুর দুধ",
    "prod-desc-daily": "শতভাগ খাঁটি ও কাঁচা গরুর দুধ যা সংগ্রহের পরই দ্রুত শীতলীকৃত। পুষ্টিগুণে ভরপুর, প্রতিদিনের জ্বাল দেওয়া ও পানের জন্য আদর্শ।",
    "prod-price-daily": '৮০ ৳ <span id="prod-unit-daily">/ লিটার</span>',
    "btn-select-daily-milk": "নির্বাচন করুন",
    "prod-name-full": "ফুল ক্রিম গ্রাম্য দুধ",
    "prod-desc-full": "প্রাকৃতিক ঘাসে লালিত গরুর ঘন মালাই ও চর্বিযুক্ত দুধ। ঐতিহ্যবাহী মিষ্টি, ঘি এবং দই তৈরির জন্য একদম উপযুক্ত।",
    "prod-price-full": '৯৫ ৳ <span id="prod-unit-full">/ লিটার</span>',
    "btn-select-full-cream": "নির্বাচন করুন",
    "prod-name-ghee": "প্রিমিয়াম গ্রাম্য গরুর ঘি",
    "prod-desc-ghee": "ঘোল বা মাখন থেকে ধিমে আঁচে জ্বাল দেওয়া খাঁটি গরুর ঘি। দানাদার গঠন, ঐতিহ্যবাহী সুবাস এবং আকর্ষণীয় সোনালী রঙ।",
    "prod-price-ghee": '১,২০০ ৳ <span id="prod-unit-ghee">/ কেজি</span>',
    "btn-select-ghee": "নির্বাচন করুন",
    
    "lbl-ops-driven": "উন্নত পরিচালনা ব্যবস্থা",
    "process-heading": "যেভাবে তাজা দুধ আপনার কাছে পৌঁছায়",
    "process-subtitle": "সতেজতা এবং সঠিক তাপমাত্রা বজায় রাখার জন্য প্রতিদিনের একটি উন্নত লজিস্টিক ব্যবস্থা।",
    "step-title-1": "রাত ৮ টার আগে অর্ডার করুন",
    "step-desc-1": "আজ অর্ডার করুন। আগামীকাল সকালের ডেলিভারির জন্য আমরা অর্ডার নিশ্চিত করে থাকি।",
    "step-title-2": "সকালে সংগ্রহ",
    "step-desc-2": "খুব ভোরে যাচাইকৃত খামারি পরিবারের কাছ থেকে স্থানীয় সংগ্রহ কেন্দ্রে দুধ সংগ্রহ করা হয়।",
    "step-title-3": "২৫০ কিমি পরিবহন",
    "step-desc-3": "দুধ সাথে সাথে ৪° সেলসিয়াসে ঠান্ডা করে রেফ্রিজারেটেড কন্টেইনারে ২৫০ কিমি পরিবহন করা হয়।",
    "step-title-4": "পরের দিন সকালে ডেলিভারি",
    "step-desc-4": "শহরে একদম তাজা ও ঠান্ডা অবস্থায় পৌঁছায়, দোয়ানোর ২৪ ঘণ্টার মধ্যে আপনার দরজায় ডেলিভারি।",
    
    "lbl-cust-reviews": "গ্রাহকদের মতামত",
    "reviews-heading": "দুধপ্রেমীরা যা বলছেন",
    "rev-text-1": "২৫০ কিমি দূর থেকে ডেলিভারি নিয়ে আমার সংশয় ছিল, কিন্তু দুধ একদম ঠান্ডা এসেছে এবং জ্বাল দেওয়ার পর চমৎকার মালাইয়ের স্তর জমেছে। একদম গ্রামের বাড়ির কথা মনে করিয়ে দেয়।",
    "rev-name-1": "রহিম উদ্দিন",
    "rev-loc-1": "মিরপুর, ঢাকা",
    "rev-text-2": "আমরা প্রতিদিন ফুল ক্রিম দুধের অর্ডার করি। এই দুধ দিয়ে বানানো ঘি সত্যিই অসাধারণ! আমার সন্তানরা এর প্রাকৃতিক মিষ্টি স্বাদ পছন্দ করে। সাবস্ক্রিপশন নেওয়ার জোরালো সুপারিশ করছি।",
    "rev-name-2": "নুসরাত জাহান",
    "rev-loc-2": "গুলshan, ঢাকা",
    "rev-text-3": "ঢাকায় খাঁটি দানাদার ঘি পাওয়া খুব কঠিন। দুধওয়ালার গরুর ঘি সুগন্ধি, গাঢ় সোনালী এবং স্বাদে অতুলনীয়। অর্ডার করা খুবই সহজ ছিল।",
    "rev-name-3": "ফরহান আহমেদ",
    "rev-loc-3": "ধানমন্ডি, ঢাকা",
    
    "order-form-title": "আপনার অর্ডার নিশ্চিত করুন",
    "lbl-cust-name": "পূর্ণ নাম *",
    "lbl-cust-phone": "ফোন নম্বর *",
    "lbl-cust-whatsapp": "হোয়াটসঅ্যাপ নম্বর *",
    "lbl-cust-address": "ডেলিভারি ঠিকানা *",
    "lbl-delivery-area": "ডেলিভারি এলাকা *",
    "lbl-cust-landmark": "নিকটবর্তী চেনার স্থান (ল্যান্ডমার্ক) *",
    "lbl-order-product": "পণ্য নির্বাচন করুন *",
    "lbl-delivery-date": "প্রথম ডেলিভারির তারিখ *",
    "lbl-subscription-type": "সাবস্ক্রিপশন প্ল্যান *",
    "lbl-payment-method": "পেমেন্ট মাধ্যম *",
    "btn-submit-order": "আগামীকালের ডেলিভারি নিশ্চিত করুন",
    
    "opt-select-area": "এলাকা নির্বাচন করুন",
    "opt-choose-product": "পণ্য পছন্দ করুন",
    "opt-qty": "পরিমাণ",
    "opt-sub-onetime": "একবার (একটি একক অর্ডার)",
    "opt-sub-daily": "প্রতিদিন (ডেইলি সাবস্ক্রিপশন)",
    "opt-sub-weekly": "সাপ্তাহিক (প্রতি ৭ দিনে একবার)",
    "opt-sub-monthly": "মাসিক (প্রতি ৩০ দিনে একবার)",
    "opt-pay-cash": "ক্যাশ অন ডেলিভারি",
    "opt-pay-bkash": "বিকাশ (সেন্ড মানি)",
    "opt-pay-nagad": "নগদ (সেন্ড মানি)",
    
    "lbl-freshness-guaranteed": "সতেজতার গ্যারান্টি",
    "order-info-heading": "আগামীকাল সকালে ডেলিভারি",
    "order-info-text": "আমরা ২৪ ঘণ্টার ডেলিভারি পদ্ধতিতে কাজ করি। আজ রাত ৮:০০ টার আগে প্রাপ্ত যেকোনো অর্ডার আমাদের খামারিদের থেকে আগামীকাল ভোরে সংগ্রহ করা হয়, শীতলীকৃত হয়, ২৫০ কিমি পরিবহন করা হয় এবং পরের দিন সকালে আপনার ঘরে সতেজ অবস্থায় পৌঁছে দেওয়া হয়।",
    "order-subinfo-title-1": "📦 হোয়াটসঅ্যাপে রিয়েল-টাইম স্ট্যাটাস",
    "order-subinfo-text-1": "আপনার অর্ডার দেওয়ার পর, আপনি আপনার ডেলিভারি স্লট নিশ্চিত করে একটি স্বয়ংক্রিয় হোয়াটসঅ্যাপ বার্তা পাবেন। আপনার সাবস্ক্রিপশন বা ডেলিভারি ঠিকানা পরিবর্তন করতে যেকোনো সময় আমাদের বার্তা পাঠাতে পারেন।",
    "order-subinfo-title-2": "🌿 বহু খামারি পরিবার",
    "order-subinfo-text-2": "আপনার প্রতিটি কেনাকাটা সরাসরি ১৫টিরও বেশি খামারি পরিবারকে সহায়তা করে। আমরা যাচাইকৃত স্থানীয় পরিবারগুলোর থেকে দুধ সংগ্রহ করি যারা তাদের চারণভূমিতে পালিত গরুর চমৎকার যত্ন নেয়। এটি প্রতিদিন পুষ্টিগুণ সমৃদ্ধ দুধ নিশ্চিত করে।",
    
    "footer-logo-link": 'Dudh<span>Wala</span>',
    "footer-brand-text": "স্থানীয় গ্রাম্য খামারিদের থেকে সংগৃহীত খাঁটি, প্রাকৃতিক ও খামার-তাজা গরুর দুধ। ভালোবাসার সাথে আমাদের রেফ্রিজারেটেড কোল্ড চেইনে পরিবাহিত।",
    "footer-hdr-quicklinks": "সহজ লিঙ্ক",
    "footer-hdr-contact": "যোগাযোগ করুন",
    "footer-hdr-portal": "অ্যাডমিন পোর্টাল",
    "footer-copyright": "&copy; ২০২৬ দুধওয়ালা মিল্ক ডেলিভারি। সর্বস্বত্ব সংরক্ষিত।",
    "footer-subtitle": "আজ সংগৃহীত, আগামীকাল ঠান্ডা ও সতেজ ডেলিভারি।",
    "footer-wa": "💬 হোয়াটসঅ্যাপ: ০১৯৯৮৫১৮৯১৪",
    "footer-email": "📧 borhankustia@gmail.com",
    
    "fl-home": "হোম",
    "fl-about": "আমাদের বৈশিষ্ট্য",
    "fl-products": "পণ্যসমূহ",
    "fl-process": "ডেলিভারি ধাপ",
    "fl-loc": "📍 ঢাকা অফিস: মিরপুর-১০",
    "link-admin-panel": "🔑 অ্যাডমিন ড্যাশবোর্ড",
    
    "toast-success-wa": "অর্ডার সফলভাবে সম্পন্ন হয়েছে! হোয়াটসঅ্যাপে পাঠানো হচ্ছে...",
    "toast-fields-req": "অনুগ্রহ করে সব প্রয়োজনীয় তথ্য পূরণ করুন।",
    "toast-failed": "অর্ডার সম্পন্ন করতে ব্যর্থ হয়েছে। অনুগ্রহ করে আবার চেষ্টা করুন।",
    "toast-placing": "অর্ডার করা হচ্ছে..."
  }
};

// Initialize Firebase or Fallback to Mock Mode
function initializeDatabase() {
  const isDefaultConfig = firebaseConfig.projectId.includes("YOUR_PROJECT_ID_HERE") || !firebaseConfig.apiKey;
  
  if (isDefaultConfig) {
    console.warn("Firebase is running in MOCK MODE because API keys are placeholders. Order data will be saved locally in your browser.");
    isMockMode = true;
    setupMockDatabase();
  } else {
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      console.log("Firebase Firestore successfully initialized.");
    } catch (error) {
      console.error("Firebase initialization failed. Falling back to Mock Mode.", error);
      isMockMode = true;
      setupMockDatabase();
    }
  }
}

// Emulate Firestore Collections in LocalStorage for testing
function setupMockDatabase() {
  if (!localStorage.getItem("gram_dudh_orders")) {
    localStorage.setItem("gram_dudh_orders", JSON.stringify([]));
  }
  if (!localStorage.getItem("gram_dudh_customers")) {
    localStorage.setItem("gram_dudh_customers", JSON.stringify([]));
  }
  if (!localStorage.getItem("gram_dudh_subscriptions")) {
    localStorage.setItem("gram_dudh_subscriptions", JSON.stringify([]));
  }
}

// Set active language
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("lang", lang);
  
  const dict = translations[lang];
  
  // Set toggle button text
  const langBtn = document.getElementById("lang-switch");
  if (langBtn) {
    langBtn.innerText = lang === "en" ? "বাংলা" : "English";
  }
  
  // Translate standard text nodes
  for (const [id, value] of Object.entries(dict)) {
    const el = document.getElementById(id);
    if (el) {
      if (id === "page-title") {
        document.title = value;
      } else if (el.tagName === "INPUT" || el.tagName === "TEXTAREA") {
        // Handle placeholders
        if (id === "customerName") el.placeholder = "Enter your full name"; // handled below in special inputs
      } else if (el.innerHTML.includes("<span") || el.innerHTML.includes("<em") || el.innerHTML.includes("<div") || el.innerHTML.includes("<strong")) {
        el.innerHTML = value;
      } else {
        el.innerText = value;
      }
    }
  }

  // Update Input Placeholders manually
  const nameInput = document.getElementById("customerName");
  if (nameInput) nameInput.placeholder = lang === "en" ? "Enter your full name" : "আপনার পূর্ণ নাম লিখুন";
  
  const phoneInput = document.getElementById("customerPhone");
  if (phoneInput) phoneInput.placeholder = lang === "en" ? "e.g. 01712345678" : "যেমন: ০১৭১২৩৪৫৬৭৮";
  
  const waInput = document.getElementById("customerWhatsapp");
  if (waInput) waInput.placeholder = lang === "en" ? "e.g. 01712345678" : "যেমন: ০১৭১২৩৪৫৬৭৮";
  
  const addrInput = document.getElementById("customerAddress");
  if (addrInput) addrInput.placeholder = lang === "en" ? "Apartment, House, Road, Block details" : "বাসা, ফ্ল্যাট, রোড, ব্লক ও এলাকা বিস্তারিত";
  
  const landmarkInput = document.getElementById("customerLandmark");
  if (landmarkInput) landmarkInput.placeholder = lang === "en" ? "e.g. Near Mirpur-10 Circle" : "যেমন: মিরপুর-১০ গোলচত্বরের কাছে";

  // Translate Options inside dropdowns
  const translateOption = (id, key) => {
    const el = document.getElementById(id);
    if (el && dict[key]) el.text = dict[key];
  };

  translateOption("opt-select-area", "opt-select-area");
  translateOption("opt-choose-product", "opt-choose-product");
  translateOption("opt-qty", "opt-qty");
  translateOption("opt-sub-onetime", "opt-sub-onetime");
  translateOption("opt-sub-daily", "opt-sub-daily");
  translateOption("opt-sub-weekly", "opt-sub-weekly");
  translateOption("opt-sub-monthly", "opt-sub-monthly");
  translateOption("opt-pay-cash", "opt-pay-cash");
  translateOption("opt-pay-bkash", "opt-pay-bkash");
  translateOption("opt-pay-nagad", "opt-pay-nagad");
  
  // Localize quantities dropdown
  const qtySelect = document.getElementById("orderQuantity");
  if (qtySelect) {
    const options = qtySelect.options;
    const unitText = lang === "en" ? "Liter / Kg" : "লিটার / কেজি";
    const unitsText = lang === "en" ? "Liters / Kg" : "লিটার / কেজি";
    for (let i = 1; i < options.length; i++) {
      const val = options[i].value;
      const displayVal = lang === "en" ? val : translateNumber(val);
      options[i].text = `${displayVal} ${val === "1" ? unitText : unitsText}`;
    }
  }

  // Update product selection dropdown text
  const prodSelect = document.getElementById("orderProduct");
  if (prodSelect && prodSelect.options.length >= 4) {
    prodSelect.options[1].text = lang === "en" ? "Daily Raw Cow Milk (80 ৳)" : "দৈনিক কাঁচা গরুর দুধ (৮০ ৳)";
    prodSelect.options[2].text = lang === "en" ? "Full Cream Village Milk (95 ৳)" : "ফুল ক্রিম গ্রাম্য দুধ (৯৫ ৳)";
    prodSelect.options[3].text = lang === "en" ? "Premium Village Cow Ghee (1,200 ৳)" : "প্রিমিয়াম গ্রাম্য গরুর ঘি (১,২০০ ৳)";
  }

  updateProductLabels();
  togglePaymentInfo();
}

// Convert English digits to Bangla digits
function translateNumber(numStr) {
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return numStr.toString().split("").map(char => {
    return (char >= "0" && char <= "9") ? bnDigits[parseInt(char)] : char;
  }).join("");
}

// Initialize on page load
window.addEventListener("DOMContentLoaded", () => {
  initializeDatabase();
  
  // Set language toggle click listener
  const langSwitchBtn = document.getElementById("lang-switch");
  if (langSwitchBtn) {
    langSwitchBtn.addEventListener("click", () => {
      const nextLang = currentLang === "en" ? "bn" : "en";
      setLanguage(nextLang);
    });
  }
  
  // Apply saved or default language
  setLanguage(currentLang);
  setupDateInput();
  setupNavbarScroll();
});

// Setup date input defaults
function setupDateInput() {
  const deliveryDateInput = document.getElementById("deliveryDate");
  if (deliveryDateInput) {
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    
    const yyyy = tomorrow.getFullYear();
    const mm = String(tomorrow.getMonth() + 1).padStart(2, '0');
    const dd = String(tomorrow.getDate()).padStart(2, '0');
    
    const tomorrowStr = `${yyyy}-${mm}-${dd}`;
    deliveryDateInput.value = tomorrowStr;
    deliveryDateInput.min = tomorrowStr;
  }
}

// Navbar styling on scroll
function setupNavbarScroll() {
  const navbar = document.getElementById("navbar");
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// Select a product from a card
function selectProduct(productName) {
  const productSelect = document.getElementById("orderProduct");
  if (productSelect) {
    productSelect.value = productName;
    updateProductLabels();
    
    // Smooth scroll to order section
    const orderSection = document.getElementById("order");
    if (orderSection) {
      orderSection.scrollIntoView({ behavior: "smooth" });
    }
  }
}

// Dynamically update quantity label (Liter vs Kg)
function updateProductLabels() {
  const product = document.getElementById("orderProduct").value;
  const lblQuantity = document.getElementById("lblQuantity");
  if (lblQuantity) {
    if (currentLang === "bn") {
      if (product === "Premium Village Cow Ghee") {
        lblQuantity.innerText = "পরিমাণ * (কেজি)";
      } else {
        lblQuantity.innerText = "পরিমাণ * (লিটার)";
      }
    } else {
      if (product === "Premium Village Cow Ghee") {
        lblQuantity.innerText = "Quantity * (Kg)";
      } else {
        lblQuantity.innerText = "Quantity * (Liters)";
      }
    }
  }
}

// Toggle Payment Instructions
function togglePaymentInfo() {
  const method = document.getElementById("paymentMethod").value;
  const instructionBox = document.getElementById("mobilePaymentInstructions");
  const header = document.getElementById("paymentInstructionHeader");
  const text = document.getElementById("paymentInstructionText");

  if (!instructionBox || !header || !text) return;

  if (method === "Bkash") {
    instructionBox.style.display = "block";
    header.innerText = currentLang === "en" ? "bKash Payment Instructions" : "বিকাশ পেমেন্ট নির্দেশনাবলী";
    text.innerHTML = currentLang === "en" 
      ? "Please send the total order amount to <strong>01712-345678</strong> (Personal bKash) via <strong>Send Money</strong>. Paste your Transaction ID in the Landmark field or share it over WhatsApp."
      : "অনুগ্রহ করে অর্ডারের মোট টাকা <strong>01712-345678</strong> (পার্সোনাল বিকাশ) নম্বরে <strong>সেন্ড মানি</strong> করুন। আপনার ট্রানজেকশন আইডি-টি ল্যান্ডমার্ক ফিল্ডে লিখুন অথবা হোয়াটসঅ্যাপে আমাদের সাথে শেয়ার করুন।";
  } else if (method === "Nagad") {
    instructionBox.style.display = "block";
    header.innerText = currentLang === "en" ? "Nagad Payment Instructions" : "নগদ পেমেন্ট নির্দেশনাবলী";
    text.innerHTML = currentLang === "en" 
      ? "Please send the total order amount to <strong>01712-345678</strong> (Personal Nagad) via <strong>Send Money</strong>. Paste your Transaction ID in the Landmark field or share it over WhatsApp."
      : "অনুগ্রহ করে অর্ডারের মোট টাকা <strong>01712-345678</strong> (পার্সোনাল নগদ) নম্বরে <strong>সেন্ড মানি</strong> করুন। আপনার ট্রানজেকশন আইডি-টি ল্যান্ডমার্ক ফিল্ডে লিখুন অথবা হোয়াটসঅ্যাপে আমাদের সাথে শেয়ার করুন।";
  } else {
    instructionBox.style.display = "none";
  }
}

// Handle Order Submission
async function handleOrderSubmit(event) {
  event.preventDefault();
  
  const submitBtn = document.getElementById("btn-submit-order");
  submitBtn.disabled = true;
  submitBtn.innerText = translations[currentLang]["toast-placing"];

  const orderData = {
    name: document.getElementById("customerName").value.trim(),
    phone: document.getElementById("customerPhone").value.trim(),
    whatsapp: document.getElementById("customerWhatsapp").value.trim(),
    address: document.getElementById("customerAddress").value.trim(),
    area: document.getElementById("deliveryArea").value,
    landmark: document.getElementById("customerLandmark").value.trim(),
    product: document.getElementById("orderProduct").value,
    quantity: parseInt(document.getElementById("orderQuantity").value, 10),
    deliveryDate: document.getElementById("deliveryDate").value,
    subscriptionType: document.getElementById("subscriptionType").value,
    paymentMethod: document.getElementById("paymentMethod").value,
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  // Basic validation
  if (!orderData.name || !orderData.phone || !orderData.address || !orderData.area || !orderData.product || !orderData.quantity) {
    showToast(translations[currentLang]["toast-fields-req"], true);
    submitBtn.disabled = false;
    submitBtn.innerText = translations[currentLang]["btn-submit-order"];
    return;
  }

  try {
    if (isMockMode) {
      saveMockData(orderData);
    } else {
      await saveFirestoreData(orderData);
    }
    
    showToast(translations[currentLang]["toast-success-wa"]);
    
    // Redirect to WhatsApp with order details after 2 seconds
    setTimeout(() => {
      sendWhatsAppNotification(orderData);
      document.getElementById("orderForm").reset();
      setupDateInput();
      togglePaymentInfo();
      submitBtn.disabled = false;
      submitBtn.innerText = translations[currentLang]["btn-submit-order"];
    }, 2000);

  } catch (error) {
    console.error("Order submission failed:", error);
    showToast(translations[currentLang]["toast-failed"], true);
    submitBtn.disabled = false;
    submitBtn.innerText = translations[currentLang]["btn-submit-order"];
  }
}

// Save mock data locally in browser storage
function saveMockData(order) {
  // Save Order
  const orders = JSON.parse(localStorage.getItem("gram_dudh_orders") || "[]");
  order.id = "MOCK_ORD_" + Math.random().toString(36).substr(2, 9);
  orders.push(order);
  localStorage.setItem("gram_dudh_orders", JSON.stringify(orders));

  // Save/Update Customer profile
  const customers = JSON.parse(localStorage.getItem("gram_dudh_customers") || "[]");
  const existingCustIndex = customers.findIndex(c => c.phone === order.phone);
  const customerProfile = {
    name: order.name,
    phone: order.phone,
    whatsapp: order.whatsapp,
    address: order.address,
    area: order.area,
    landmark: order.landmark,
    lastOrderAt: order.createdAt
  };
  if (existingCustIndex > -1) {
    customers[existingCustIndex] = customerProfile;
  } else {
    customerProfile.id = "MOCK_CUST_" + Math.random().toString(36).substr(2, 9);
    customers.push(customerProfile);
  }
  localStorage.setItem("gram_dudh_customers", JSON.stringify(customers));

  // Save Subscription if applicable
  if (order.subscriptionType !== "One Time") {
    const subscriptions = JSON.parse(localStorage.getItem("gram_dudh_subscriptions") || "[]");
    subscriptions.push({
      id: "MOCK_SUB_" + Math.random().toString(36).substr(2, 9),
      customerName: order.name,
      customerPhone: order.phone,
      product: order.product,
      quantity: order.quantity,
      subscriptionType: order.subscriptionType,
      status: "Active",
      startDate: order.deliveryDate,
      createdAt: order.createdAt
    });
    localStorage.setItem("gram_dudh_subscriptions", JSON.stringify(subscriptions));
  }
}

// Save to production Firestore database
async function saveFirestoreData(order) {
  // 1. Add order to Firestore
  const orderRef = await db.collection("orders").add(order);
  const orderId = orderRef.id;

  // 2. Add/Update customer profile
  const customerId = order.phone; // phone number is the customer ID to keep it simple and unique
  await db.collection("customers").doc(customerId).set({
    name: order.name,
    phone: order.phone,
    whatsapp: order.whatsapp,
    address: order.address,
    area: order.area,
    landmark: order.landmark,
    lastOrderAt: order.createdAt
  }, { merge: true });

  // 3. Add subscription details if not one-time
  if (order.subscriptionType !== "One Time") {
    await db.collection("subscriptions").add({
      orderId: orderId,
      customerPhone: order.phone,
      customerName: order.name,
      product: order.product,
      quantity: order.quantity,
      subscriptionType: order.subscriptionType,
      status: "Active",
      startDate: order.deliveryDate,
      createdAt: order.createdAt
    });
  }
}

// Redirect client to WhatsApp with pre-filled message
function sendWhatsAppNotification(order) {
  const businessNumber = "8801998518914"; // Replace with your actual company WhatsApp number
  const productPrice = getPrice(order.product);
  const totalPrice = productPrice * order.quantity;
  
  const isGhee = order.product.includes('Ghee');
  const unit = isGhee 
    ? (currentLang === "en" ? "Kg" : "কেজি") 
    : (currentLang === "en" ? (order.quantity === 1 ? "Liter" : "Liters") : "লিটার");
  
  const displayQty = currentLang === "en" ? order.quantity : translateNumber(order.quantity);
  const displayPrice = currentLang === "en" ? totalPrice : translateNumber(totalPrice);
  
  let textMsg = "";
  if (currentLang === "en") {
    textMsg = `Hello DudhWala! 🥛

I just placed an order. Here are my details:
━━━━━━━━━━━━━━━━━━━━
*Name*: ${order.name}
*Phone*: ${order.phone}
*WhatsApp*: ${order.whatsapp}
*Area*: ${order.area}
*Landmark*: ${order.landmark}
*Address*: ${order.address}
━━━━━━━━━━━━━━━━━━━━
*Product*: ${order.product}
*Quantity*: ${displayQty} ${unit}
*Delivery Date*: ${order.deliveryDate}
*Order Type*: ${order.subscriptionType}
*Payment Method*: ${order.paymentMethod}
*Total Cost*: BDT ${displayPrice}
━━━━━━━━━━━━━━━━━━━━
Please confirm my delivery slots. Thank you!`;
  } else {
    // Translate some status strings for invoice representation
    const getProductBn = (prod) => {
      if (prod === "Daily Raw Cow Milk") return "দৈনিক কাঁচা গরুর দুধ";
      if (prod === "Full Cream Village Milk") return "ফুল ক্রিম গ্রাম্য দুধ";
      if (prod === "Premium Village Cow Ghee") return "প্রিমিয়াম গ্রাম্য গরুর ঘি";
      return prod;
    };
    const getSubBn = (sub) => {
      if (sub === "One Time") return "একবার (একক অর্ডার)";
      if (sub === "Daily") return "প্রতিদিন";
      if (sub === "Weekly") return "সাপ্তাহিক";
      if (sub === "Monthly") return "মাসিক";
      return sub;
    };
    const getPayBn = (pay) => {
      if (pay === "Cash") return "ক্যাশ অন ডেলিভারি";
      if (pay === "Bkash") return "বিকাশ";
      if (pay === "Nagad") return "নগদ";
      return pay;
    };

    textMsg = `হ্যালো দুধওয়ালা! 🥛

আমি একটি নতুন অর্ডার করেছি। আমার বিবরণ নিচে দেওয়া হলো:
━━━━━━━━━━━━━━━━━━━━
*নাম*: ${order.name}
*ফোন*: ${order.phone}
*হোয়াটসঅ্যাপ*: ${order.whatsapp}
*এলাকা*: ${order.area}
*ল্যান্ডমার্ক*: ${order.landmark}
*ঠিকানা*: ${order.address}
━━━━━━━━━━━━━━━━━━━━
*পণ্য*: ${getProductBn(order.product)}
*পরিমাণ*: ${displayQty} ${unit}
*ডেলিভারির তারিখ*: ${order.deliveryDate}
*অর্ডারের ধরণ*: ${getSubBn(order.subscriptionType)}
*পেমেন্ট মাধ্যম*: ${getPayBn(order.paymentMethod)}
*মোট খরচ*: BDT ${displayPrice}
━━━━━━━━━━━━━━━━━━━━
অনুগ্রহ করে আমার ডেলিভারি স্লটটি নিশ্চিত করুন। ধন্যবাদ!`;
  }

  const encodedMsg = encodeURIComponent(textMsg);
  const whatsappUrl = `https://wa.me/${businessNumber}?text=${encodedMsg}`;
  
  // Open in new tab
  window.open(whatsappUrl, "_blank");
}

// Helper to get prices
function getPrice(productName) {
  if (productName === "Daily Raw Cow Milk") return 80;
  if (productName === "Full Cream Village Milk") return 95;
  if (productName === "Premium Village Cow Ghee") return 1200;
  return 0;
}

// Show custom toast notification
function showToast(message, isError = false) {
  const toast = document.getElementById("toastMessage");
  const toastText = document.getElementById("toastText");
  const toastIcon = document.getElementById("toastIcon");

  if (toast && toastText && toastIcon) {
    toastText.innerText = message;
    toastIcon.innerText = isError ? "❌" : "✅";
    
    if (isError) {
      toast.classList.add("error");
    } else {
      toast.classList.remove("error");
    }
    
    toast.style.display = "flex";
    
    // Auto hide after 3.5 seconds
    setTimeout(() => {
      toast.style.display = "none";
    }, 3500);
  }
}
