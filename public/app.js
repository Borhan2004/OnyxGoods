// Firebase configuration
const firebaseConfig = {
  apiKey: "AIzaSyCRpexJ6gD9VpbLX_IhLSJ0jMMxohBvrPw",
  authDomain: "onyxgoods.firebaseapp.com",
  projectId: "onyxgoods",
  storageBucket: "onyxgoods.firebasestorage.app",
  messagingSenderId: "576476626749",
  appId: "1:576476626749:web:6b8cfd1f2bbd6417cbcf54"
};

// Global State
let db = null;
let isMockMode = false;
let currentLang = localStorage.getItem("onyx_goods_lang") || "en";
let categories = [];
let products = [];
let coupons = [];
let activeUser = null;

// Translation Dictionaries
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

// Initialize Database & Mode Setup
function initializeDatabase() {
  const urlParams = new URLSearchParams(window.location.search);
  const forceMock = urlParams.has('mock');
  const isDefaultConfig = forceMock || firebaseConfig.projectId.includes("YOUR_PROJECT_ID_HERE") || !firebaseConfig.apiKey;

  if (isDefaultConfig) {
    console.warn("OnyxGoods is running in MOCK MODE (localStorage).");
    isMockMode = true;
    setupMockDatabase();
  } else {
    try {
      firebase.initializeApp(firebaseConfig);
      db = firebase.firestore();
      console.log("Firebase Firestore successfully initialized.");
    } catch (error) {
      console.error("Firebase failed. Falling back to Mock Mode.", error);
      isMockMode = true;
      setupMockDatabase();
    }
  }
}

// Seed Mock LocalStorage DB
function setupMockDatabase() {
  if (!localStorage.getItem("onyx_goods_categories")) {
    const defaultCategories = [
      { id: "cat_dairy", nameEn: "Fresh Dairy", nameBn: "তাজা দুগ্ধজাত পণ্য", descriptionEn: "100% pure milk, fresh ghee, and authentic dairy products.", descriptionBn: "১০০% খাঁটি দুধ, তাজা ঘি এবং আসল দুগ্ধজাত খাবার।", imagePath: "images/daily_milk.png", status: "Active", createdAt: new Date().toISOString() },
      { id: "cat_honey", nameEn: "Honey & Natural Products", nameBn: "মধু ও প্রাকৃতিক পণ্য", descriptionEn: "Raw Sundarbans honey, pure mustard oil, and forest goods.", descriptionBn: "সুন্দরবনের খাঁটি মধু, কাঠের ঘানি ভাঙা সরিষার তেল এবং প্রাকৃতিক সামগ্রী।", imagePath: "images/premium_ghee.png", status: "Active", createdAt: new Date().toISOString() },
      { id: "cat_grains", nameEn: "Rice & Grains", nameBn: "চাল ও শস্যদানা", descriptionEn: "Traditional aromatic rice and nutrient-rich grains.", descriptionBn: "ঐতিহ্যবাহী সুগন্ধি চাল এবং পুষ্টিসমৃদ্ধ শস্যদানা।", imagePath: "images/tiler_khaja.png", status: "Active", createdAt: new Date().toISOString() },
      { id: "cat_veg", nameEn: "Fruits & Vegetables", nameBn: "ফলমূল ও শাকসবজি", descriptionEn: "Freshly harvested organic produce from Bangladesh's villages.", descriptionBn: "বাংলাদেশের গ্রাম থেকে সরাসরি সংগৃহীত তাজা ফল ও শাকসবজি।", imagePath: "images/about_farm.png", status: "Active", createdAt: new Date().toISOString() },
      { id: "cat_traditional", nameEn: "Traditional Foods", nameBn: "ঐতিহ্যবাহী খাবার", descriptionEn: "Crispy Kushtia sesame brittle, traditional date jaggery, and snacks.", descriptionBn: "কুষ্টিয়ার মচমচে তিলের খাজা, ঐতিহ্যবাহী খেজুর গুড় এবং পিঠার উপাদান।", imagePath: "images/tiler_khaja.png", status: "Active", createdAt: new Date().toISOString() },
      { id: "cat_handmade", nameEn: "Handmade Products", nameBn: "হস্তশিল্প", descriptionEn: "Intricate hand-stitched Nakshikantha quilts and home decor.", descriptionBn: "হাতে সেলাই করা চমৎকার নকশিকাঁথা এবং ঐতিহ্যবাহী মৃৎশিল্প।", imagePath: "images/nakshikantha.png", status: "Active", createdAt: new Date().toISOString() },
      { id: "cat_organic", nameEn: "Organic Products", nameBn: "অর্গানিক পণ্য", descriptionEn: "Strictly chemical-free, verified health foods.", descriptionBn: "সম্পূর্ণ রাসায়নিক ও প্রিজারভেটিভ মুক্ত অর্গানিক খাবার।", imagePath: "images/premium_ghee.png", status: "Active", createdAt: new Date().toISOString() },
      { id: "cat_seasonal", nameEn: "Seasonal Products", nameBn: "মৌসুমী পণ্য", descriptionEn: "Freshly sourced seasonal delights like summer mangoes.", descriptionBn: "মৌসুমী ফলমূল যেমন রাজশাহীর হিমসাগর ও ল্যাংড়া আম।", imagePath: "images/about_farm.png", status: "Active", createdAt: new Date().toISOString() }
    ];
    localStorage.setItem("onyx_goods_categories", JSON.stringify(defaultCategories));
  }

  if (!localStorage.getItem("onyx_goods_products")) {
    const defaultProducts = [
      { id: "prod_raw_milk", categoryId: "cat_dairy", nameEn: "Daily Raw Cow Milk", nameBn: "দৈনিক কাঁচা গরুর দুধ", descEn: "Pure, raw, single-source cow milk chilled immediately. Rich in nutrients.", descBn: "শতভাগ খাঁটি ও কাঁচা গরুর দুধ যা সংগ্রহের পরই দ্রুত শীতলীকৃত। পুষ্টিগুণে ভরপুর।", benefitsEn: ["Chilled immediately at source", "No preservatives added", "High fat and rich nutrients"], benefitsBn: ["সংগ্রহের পর দ্রুত শীতলীকৃত", "কোনো প্রিজারভেটিভ নেই", "প্রাকৃতিক পুষ্টি ও ঘন মালাই যুক্ত"], price: 80, discountPrice: 75, stock: 45, unitEn: "liter", unitBn: "লিটার", imagePath: "images/daily_milk.png", inStock: true, isFeatured: true, badgeEn: "Best Seller", badgeBn: "সেরা বিক্রীত", createdAt: new Date().toISOString() },
      { id: "prod_ghee", categoryId: "cat_dairy", nameEn: "Premium Village Cow Ghee", nameBn: "প্রিমিয়াম গ্রাম্য গরুর ঘি", descEn: "Slow-cooked pure cow ghee made from cultured butter cream. Signature aroma.", descBn: "ঘোল বা মাখন থেকে ধিমে আঁচে জ্বাল দেওয়া খাঁটি গরুর ঘি। দানাদার গঠন ও সুবাস।", benefitsEn: ["Traditionally slow cooked", "Granular texture", "Pure cultured butter cream"], benefitsBn: ["শতভাগ ঐতিহ্যবাহী উপায়ে তৈরি", "দানাদার এবং খাঁটি সুবাস", "প্রাকৃতিক মাখন থেকে প্রস্তুত"], price: 1200, discountPrice: 1150, stock: 15, unitEn: "kg", unitBn: "কেজি", imagePath: "images/premium_ghee.png", inStock: true, isFeatured: true, badgeEn: "Pure Gold", badgeBn: "খাঁটি সোনালী", createdAt: new Date().toISOString() },
      { id: "prod_mustard_oil", categoryId: "cat_honey", nameEn: "Authentic Mustard Oil", nameBn: "খাঁটি সরিষার তেল", descEn: "100% pure cold-pressed mustard oil extracted from high-quality mustard seeds.", descBn: "উচ্চমানের সরিষার বীজ থেকে কাঠের ঘানিতে ভাঙানো শতভাগ খাঁটি ও ঝাজালো সরিষার তেল।", benefitsEn: ["Cold-pressed wood mill extraction", "High pungency and rich color", "No chemical additives"], benefitsBn: ["কাঠের ঘানিতে কোল্ড-প্রেসড", "খাঁটি ঝাজালো স্বাদ ও বর্ণ", "কোনো কেমিকেল ব্যবহার করা হয়নি"], price: 280, discountPrice: 0, stock: 40, unitEn: "liter", unitBn: "লিটার", imagePath: "images/mustard_oil.png", inStock: true, isFeatured: true, badgeEn: "Cold Pressed", badgeBn: "ঘানি ভাঙা", createdAt: new Date().toISOString() },
      { id: "prod_nakshikantha", categoryId: "cat_handmade", nameEn: "Nakshikantha Quilt", nameBn: "নকশিকাঁথা", descEn: "Beautiful hand-stitched traditional Bengali quilt with elaborate artistic patterns, made by local village artisans.", descBn: "গ্রামের দক্ষ কারিগরদের সুনিপুণ হাতের কাজে তৈরি চমৎকার ঐতিহ্যবাহী নকশিকাঁথা।", benefitsEn: ["100% hand-stitched by rural women", "Traditional designs", "High quality cotton fabric"], benefitsBn: ["গ্রামীণ নারীদের হাতের নিখুঁত সেলাই", "ঐতিহ্যবাহী এবং বৈচিত্র্যময় নকশা", "উন্নত মানের সুতি কাপড় ব্যবহার"], price: 2500, discountPrice: 2200, stock: 5, unitEn: "piece", unitBn: "পিস", imagePath: "images/nakshikantha.png", inStock: true, isFeatured: true, badgeEn: "Artisan Craft", badgeBn: "হস্তশিল্প", createdAt: new Date().toISOString() },
      { id: "prod_tiler_khaja", categoryId: "cat_traditional", nameEn: "Kustiar Bikkhato Tiler Khaja", nameBn: "কুষ্টিয়ার বিখ্যাত তিলের খাজা", descEn: "Famous traditional sesame brittle sweet from Kushtia, extremely crispy and sweet.", descBn: "কুষ্টিয়ার ঐতিহ্যবাহী ও বিখ্যাত মচমচে তিলের খাজা। সেরা স্বাদের ও স্বাস্থ্যসম্মত উপায়ে তৈরি।", benefitsEn: ["Traditional recipe since 1900s", "No artificial sweeteners", "Made with pure sesame seeds"], benefitsBn: ["ঐতিহ্যবাহী রেসিপিতে তৈরি", "কোনো কৃত্রিম মিষ্টি নেই", "খাঁটি খোসা ছাড়ানো তিল ব্যবহার"], price: 160, discountPrice: 150, stock: 60, unitEn: "pack", unitBn: "প্যাকেট", imagePath: "images/tiler_khaja.png", inStock: true, isFeatured: true, badgeEn: "Kushtia Special", badgeBn: "কুষ্টিয়ার ঐতিহ্য", createdAt: new Date().toISOString() }
    ];
    localStorage.setItem("onyx_goods_products", JSON.stringify(defaultProducts));
  }

  if (!localStorage.getItem("onyx_goods_coupons")) {
    const defaultCoupons = [
      { code: "OnyxGoods10", type: "percentage", value: 10, expiryDate: "2027-12-31", status: "Active" },
      { code: "WELCOME100", type: "fixed", value: 100, expiryDate: "2027-12-31", status: "Active" },
      { code: "EID2026", type: "percentage", value: 20, expiryDate: "2026-09-30", status: "Active" }
    ];
    localStorage.setItem("onyx_goods_coupons", JSON.stringify(defaultCoupons));
  }

  if (!localStorage.getItem("onyx_goods_orders")) {
    localStorage.setItem("onyx_goods_orders", JSON.stringify([]));
  }

  if (!localStorage.getItem("onyx_goods_customers")) {
    localStorage.setItem("onyx_goods_customers", JSON.stringify([]));
  }

  if (!localStorage.getItem("onyx_goods_settings")) {
    const defaultSettings = {
      logoUrl: "logo.jpg",
      contactEmail: "onyxsupport36@gmail.com",
      contactPhone: "+8801302101024",
      whatsappNumber: "8801302101024",
      deliveryChargeDhaka: 60,
      deliveryChargeOutside: 120,
      socialLinks: { facebook: "#", instagram: "#" }
    };
    localStorage.setItem("onyx_goods_settings", JSON.stringify(defaultSettings));
  }
}

// Fetch Master Catalog Data
async function loadCatalogData() {
  try {
    if (isMockMode) {
      categories = JSON.parse(localStorage.getItem("onyx_goods_categories") || "[]");
      products   = JSON.parse(localStorage.getItem("onyx_goods_products")   || "[]");
      coupons    = JSON.parse(localStorage.getItem("onyx_goods_coupons")    || "[]");
    } else {
      // Load from Firestore
      const [catSnap, prodSnap, coupSnap] = await Promise.all([
        db.collection("categories").get(),
        db.collection("products").get(),
        db.collection("coupons").get()
      ]);

      categories = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      products   = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
      coupons    = coupSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));

      // If Firestore has NO products yet (fresh database), seed defaults
      if (products.length === 0) {
        console.log("No products in Firestore — seeding default catalog...");
        await seedDefaultCatalogToFirestore();
      }

      // If Firestore has NO coupons yet, seed defaults
      if (coupons.length === 0) {
        await seedDefaultCouponsToFirestore();
      }
    }
  } catch (error) {
    console.error("Error loading database catalog:", error);
    // Graceful fallback — use localStorage data so shop isn't completely broken
    isMockMode = true;
    categories = JSON.parse(localStorage.getItem("onyx_goods_categories") || "[]");
    products   = JSON.parse(localStorage.getItem("onyx_goods_products")   || "[]");
    coupons    = JSON.parse(localStorage.getItem("onyx_goods_coupons")    || "[]");
    if (categories.length === 0) setupMockDatabase();
  }
}

// Seed default categories + products to Firestore (called once on fresh DB)
async function seedDefaultCatalogToFirestore() {
  const defaultCategories = [
    { id: "cat_dairy",       nameEn: "Fresh Dairy",           nameBn: "তাজা দুগ্ধজাত পণ্য",       descriptionEn: "100% pure milk, fresh ghee, and authentic dairy products.",              descriptionBn: "১০০% খাঁটি দুধ, তাজা ঘি এবং আসল দুগ্ধজাত খাবার।",            imagePath: "images/daily_milk.png",    status: "Active" },
    { id: "cat_honey",       nameEn: "Honey & Natural",       nameBn: "মধু ও প্রাকৃতিক পণ্য",      descriptionEn: "Raw Sundarbans honey, pure mustard oil, and forest goods.",              descriptionBn: "সুন্দরবনের খাঁটি মধু, কাঠের ঘানি ভাঙা সরিষার তেল।",           imagePath: "images/premium_ghee.png",  status: "Active" },
    { id: "cat_traditional", nameEn: "Traditional Foods",     nameBn: "ঐতিহ্যবাহী খাবার",          descriptionEn: "Crispy Kushtia sesame brittle, traditional date jaggery, and snacks.", descriptionBn: "কুষ্টিয়ার মচমচে তিলের খাজা, ঐতিহ্যবাহী খেজুর গুড়।",         imagePath: "images/tiler_khaja.png",   status: "Active" },
    { id: "cat_handmade",    nameEn: "Handmade Products",     nameBn: "হস্তশিল্প",                  descriptionEn: "Hand-stitched Nakshikantha quilts and home decor.",                   descriptionBn: "হাতে সেলাই করা চমৎকার নকশিকাঁথা এবং মৃৎশিল্প।",              imagePath: "images/nakshikantha.png",  status: "Active" },
    { id: "cat_grains",      nameEn: "Rice & Grains",         nameBn: "চাল ও শস্যদানা",             descriptionEn: "Traditional aromatic rice and nutrient-rich grains.",                  descriptionBn: "ঐতিহ্যবাহী সুগন্ধি চাল এবং পুষ্টিসমৃদ্ধ শস্যদানা।",          imagePath: "images/tiler_khaja.png",   status: "Active" },
    { id: "cat_organic",     nameEn: "Organic Products",      nameBn: "অর্গানিক পণ্য",              descriptionEn: "Strictly chemical-free, verified health foods.",                        descriptionBn: "সম্পূর্ণ রাসায়নিক ও প্রিজারভেটিভ মুক্ত অর্গানিক খাবার।",      imagePath: "images/premium_ghee.png",  status: "Active" }
  ];

  const defaultProducts = [
    { id: "prod_raw_milk",     categoryId: "cat_dairy",       nameEn: "Daily Raw Cow Milk",            nameBn: "দৈনিক কাঁচা গরুর দুধ",            descEn: "Pure, raw cow milk chilled immediately. Rich in nutrients.",             descBn: "শতভাগ খাঁটি ও কাঁচা গরুর দুধ। পুষ্টিগুণে ভরপুর।",                  benefitsEn: ["Chilled at source","No preservatives","Rich nutrients"],           benefitsBn: ["সংগ্রহের পর দ্রুত শীতলীকৃত","কোনো প্রিজারভেটিভ নেই","প্রাকৃতিক পুষ্টি"],  price: 80,   discountPrice: 75,   stock: 45, unitEn: "liter",  unitBn: "লিটার",  imagePath: "images/daily_milk.png",   inStock: true, isFeatured: true, badgeEn: "Best Seller", badgeBn: "সেরা বিক্রীত",    createdAt: new Date().toISOString() },
    { id: "prod_ghee",         categoryId: "cat_dairy",       nameEn: "Premium Village Cow Ghee",      nameBn: "প্রিমিয়াম গ্রাম্য গরুর ঘি",       descEn: "Slow-cooked pure cow ghee with signature aroma.",                       descBn: "ধিমে আঁচে জ্বাল দেওয়া খাঁটি গরুর ঘি। দানাদার গঠন ও সুবাস।",        benefitsEn: ["Traditionally slow cooked","Granular texture","Pure butter"],      benefitsBn: ["ঐতিহ্যবাহী উপায়ে তৈরি","দানাদার ও খাঁটি সুবাস","প্রাকৃতিক মাখন"],        price: 1200, discountPrice: 1150, stock: 15, unitEn: "kg",     unitBn: "কেজি",   imagePath: "images/premium_ghee.png", inStock: true, isFeatured: true, badgeEn: "Pure Gold",   badgeBn: "খাঁটি সোনালী",    createdAt: new Date().toISOString() },
    { id: "prod_mustard_oil",  categoryId: "cat_honey",       nameEn: "Authentic Mustard Oil",         nameBn: "খাঁটি সরিষার তেল",                descEn: "100% pure cold-pressed mustard oil from high-quality seeds.",           descBn: "কাঠের ঘানিতে ভাঙানো শতভাগ খাঁটি সরিষার তেল।",                       benefitsEn: ["Cold-pressed extraction","High pungency","No chemicals"],          benefitsBn: ["কাঠের ঘানিতে কোল্ড-প্রেসড","খাঁটি ঝাজালো স্বাদ","কোনো কেমিকেল নেই"],    price: 280,  discountPrice: 0,    stock: 40, unitEn: "liter",  unitBn: "লিটার",  imagePath: "images/mustard_oil.png",  inStock: true, isFeatured: true, badgeEn: "Cold Pressed",badgeBn: "ঘানি ভাঙা",       createdAt: new Date().toISOString() },
    { id: "prod_nakshikantha", categoryId: "cat_handmade",    nameEn: "Nakshikantha Quilt",            nameBn: "নকশিকাঁথা",                       descEn: "Beautiful hand-stitched traditional Bengali quilt by village artisans.", descBn: "গ্রামের কারিগরদের হাতে তৈরি চমৎকার ঐতিহ্যবাহী নকশিকাঁথা।",        benefitsEn: ["100% hand-stitched","Traditional designs","Quality cotton"],       benefitsBn: ["হাতের নিখুঁত সেলাই","ঐতিহ্যবাহী নকশা","উন্নত সুতি কাপড়"],              price: 2500, discountPrice: 2200, stock: 5,  unitEn: "piece",  unitBn: "পিস",    imagePath: "images/nakshikantha.png", inStock: true, isFeatured: true, badgeEn: "Artisan",     badgeBn: "হস্তশিল্প",       createdAt: new Date().toISOString() },
    { id: "prod_tiler_khaja",  categoryId: "cat_traditional", nameEn: "Kushtia Tiler Khaja",           nameBn: "কুষ্টিয়ার তিলের খাজা",           descEn: "Famous traditional sesame brittle from Kushtia, crispy and sweet.",     descBn: "কুষ্টিয়ার বিখ্যাত মচমচে তিলের খাজা।",                              benefitsEn: ["Traditional recipe","No artificial sweeteners","Pure sesame"],     benefitsBn: ["ঐতিহ্যবাহী রেসিপি","কৃত্রিম মিষ্টি নেই","খাঁটি তিল"],                  price: 160,  discountPrice: 150,  stock: 60, unitEn: "pack",   unitBn: "প্যাকেট", imagePath: "images/tiler_khaja.png",  inStock: true, isFeatured: true, badgeEn: "Special",     badgeBn: "কুষ্টিয়ার ঐতিহ্য", createdAt: new Date().toISOString() }
  ];

  try {
    const batch = db.batch();
    defaultCategories.forEach(cat => {
      batch.set(db.collection("categories").doc(cat.id), cat);
    });
    defaultProducts.forEach(prod => {
      batch.set(db.collection("products").doc(prod.id), prod);
    });
    await batch.commit();

    // Reload after seeding
    const [catSnap, prodSnap] = await Promise.all([
      db.collection("categories").get(),
      db.collection("products").get()
    ]);
    categories = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    products   = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    console.log("Default catalog seeded to Firestore successfully.");
  } catch (e) {
    console.error("Failed to seed catalog to Firestore:", e);
  }
}

async function seedDefaultCouponsToFirestore() {
  const defaultCoupons = [
    { code: "OnyxGoods10",   type: "percentage", value: 10,  expiryDate: "2027-12-31", status: "Active" },
    { code: "WELCOME100", type: "fixed",       value: 100, expiryDate: "2027-12-31", status: "Active" },
    { code: "EID2026",    type: "percentage", value: 20,  expiryDate: "2026-09-30", status: "Active" }
  ];
  try {
    const batch = db.batch();
    defaultCoupons.forEach(c => batch.set(db.collection("coupons").doc(c.code), c));
    await batch.commit();
    coupons = defaultCoupons;
  } catch (e) {
    console.error("Failed to seed coupons:", e);
  }
}

// Save dynamic list to local storage
function saveMockData(key, data) {
  localStorage.setItem(key, JSON.stringify(data));
}

// Cart Management Actions
function getCart() {
  return JSON.parse(localStorage.getItem("onyx_goods_cart") || "[]");
}

function saveCart(cart) {
  localStorage.setItem("onyx_goods_cart", JSON.stringify(cart));
  updateCartBadge();
}

function addToCart(productId, qty = 1) {
  const cart = getCart();
  const prod = products.find(p => p.id === productId);
  if (!prod) return;

  const existing = cart.find(item => item.productId === productId);
  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      productId: prod.id,
      nameEn: prod.nameEn,
      nameBn: prod.nameBn,
      price: prod.price,
      discountPrice: prod.discountPrice || 0,
      unitEn: prod.unitEn,
      unitBn: prod.unitBn,
      imagePath: prod.imagePath || prod.imageData || "",
      quantity: qty
    });
  }
  saveCart(cart);
  showToast(translations[currentLang]["toast-cart-added"]);

  // Animate cart badge
  const badge = document.getElementById("cart-count-badge");
  if (badge) {
    badge.classList.remove("bounce");
    void badge.offsetWidth; // reflow
    badge.classList.add("bounce");
    setTimeout(() => badge.classList.remove("bounce"), 600);
  }
}

function updateCartQty(productId, qty) {
  const cart = getCart();
  const item = cart.find(item => item.productId === productId);
  if (item) {
    item.quantity = Math.max(1, qty);
    saveCart(cart);
    showToast(translations[currentLang]["toast-cart-updated"]);
  }
}

function removeFromCart(productId) {
  let cart = getCart();
  cart = cart.filter(item => item.productId !== productId);
  saveCart(cart);
  showToast(translations[currentLang]["toast-cart-removed"]);
}

function clearCart() {
  localStorage.removeItem("onyx_goods_cart");
  updateCartBadge();
}

function updateCartBadge() {
  const cart = getCart();
  const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
  // Update desktop nav badge
  const badge = document.getElementById("cart-count-badge");
  if (badge) badge.innerText = translateNumber(totalItems.toString());
  // Update mobile nav badge
  const mnavBadge = document.getElementById("mnav-cart-count");
  if (mnavBadge) mnavBadge.textContent = totalItems > 0 ? totalItems : "0";
}

// Localization Switcher
function setLanguage(lang) {
  currentLang = lang;
  localStorage.setItem("onyx_goods_lang", lang);

  const dict = translations[lang];

  // Set toggle btn text
  const langBtn = document.getElementById("lang-switch");
  if (langBtn) {
    langBtn.innerText = lang === "en" ? "বাংলা" : "English";
  }

  // Set page title
  if (dict["page-title"]) {
    document.title = dict["page-title"];
  }

  // Iterate element IDs for matching translation keys
  for (const [id, value] of Object.entries(dict)) {
    const el = document.getElementById(id);
    if (!el) continue;

    if (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.tagName === "SELECT") {
      if (el.tagName === "INPUT" && el.type === "placeholder") {
        el.placeholder = value;
      }
    } else if (el.tagName === "OPTION") {
      el.textContent = value;
    } else if (el.querySelector('svg, img, button, input')) {
      const firstText = Array.from(el.childNodes).find(n => n.nodeType === Node.TEXT_NODE && n.textContent.trim());
      if (firstText) firstText.textContent = value;
    } else if (value.includes('<')) {
      el.innerHTML = value;
    } else {
      el.textContent = value;
    }
  }

  // Run place-specific translations & re-render grids
  const path = window.location.pathname;
  if (path.includes("shop")) {
    renderShopPage();
  } else if (path.includes("product")) {
    if (activeProductId) renderProductDetailsPage();
  } else if (path.includes("cart")) {
    renderCartPage();
  } else if (path.includes("checkout")) {
    renderCheckoutPage();
  } else if (path.includes("account")) {
    renderAccountPage();
  } else {
    // index.html or home
    renderHomepageCatalog();
  }

  updateCartBadge();
}

function translateNumber(numStr) {
  if (currentLang === "en") return numStr;
  const bnDigits = ["০", "১", "২", "৩", "৪", "৫", "৬", "৭", "৮", "৯"];
  return numStr.toString().split("").map(char => {
    return (char >= "0" && char <= "9") ? bnDigits[parseInt(char)] : char;
  }).join("");
}

// Show custom alerts/toasts
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
    setTimeout(() => {
      toast.style.display = "none";
    }, 3500);
  }
}

// Page Initializers
window.addEventListener("DOMContentLoaded", async () => {
  initializeDatabase();
  await loadCatalogData();
  loadLoggedUser();

  // Bind Shared Nav UI switcher
  const langSwitchBtn = document.getElementById("lang-switch");
  if (langSwitchBtn) {
    langSwitchBtn.addEventListener("click", () => {
      const nextLang = currentLang === "en" ? "bn" : "en";
      setLanguage(nextLang);
    });
  }

  setLanguage(currentLang);

  // Mobile menu toggle
  const mobileMenuBtn = document.getElementById("mobile-menu-btn");
  const navLinks = document.querySelector(".nav-links");
  if (mobileMenuBtn && navLinks) {
    mobileMenuBtn.addEventListener("click", () => {
      navLinks.classList.toggle("mobile-active");
    });
  }

  // Router bindings
  const path = window.location.pathname;
  if (path.includes("shop")) {
    initShopPageBindings();
  } else if (path.includes("product")) {
    initProductPageBindings();
    renderProductDetailsPage(); // Render after activeProductId is set
  } else if (path.includes("cart")) {
    initCartPageBindings();
  } else if (path.includes("checkout")) {
    initCheckoutPageBindings();
  } else if (path.includes("account")) {
    initAccountPageBindings();
  } else {
    initHomepageBindings();
  }

  setupNavbarScroll();
  setupScrollReveal();
});

// Scroll Reveal
function setupScrollReveal() {
  const observer = new IntersectionObserver((entries, obs) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add("reveal-active");
        obs.unobserve(entry.target);
      }
    });
  }, { root: null, rootMargin: "0px -5% -5% 0px", threshold: 0.1 });
  
  const els = document.querySelectorAll(".reveal-fade, .reveal-up, .reveal-left, .reveal-right, .reveal-scale");
  els.forEach(el => observer.observe(el));
}

// Navbar styling on scroll
function setupNavbarScroll() {
  const navbar = document.getElementById("navbar");
  if (!navbar) return;
  window.addEventListener("scroll", () => {
    if (window.scrollY > 50) {
      navbar.classList.add("scrolled");
    } else {
      navbar.classList.remove("scrolled");
    }
  });
}

// User Profile loaders
function loadLoggedUser() {
  activeUser = JSON.parse(localStorage.getItem("onyx_goods_logged_user")) || null;
  const banner = document.getElementById("new-user-banner");
  if (banner && !activeUser) {
    banner.style.display = "block";
  }
}

/* ════════════════════════════════════════
   PAGE LOGICS: 1. HOMEPAGE
   ════════════════════════════════════════ */
function initHomepageBindings() {
  setupStatsCounter();
}

function renderHomepageCatalog() {
  // Render Categories inside Featured Categories
  const catGrid = document.getElementById("categories-list");
  if (catGrid) {
    catGrid.innerHTML = "";
    categories.forEach(cat => {
      const catCard = document.createElement("div");
      catCard.className = "category-card reveal-up";
      catCard.onclick = () => {
        window.location.href = `shop.html?category=${cat.id}`;
      };
      
      const name = currentLang === "en" ? cat.nameEn : cat.nameBn;
      const desc = currentLang === "en" ? cat.descriptionEn : cat.descriptionBn;
      
      catCard.innerHTML = `
        <div class="category-icon"><img src="${cat.imagePath || cat.imageData || 'images/daily_milk.png'}" alt="${name}" style="width:64px;height:64px;border-radius:50%;object-fit:cover;border:3px solid var(--green);" onerror="this.src='images/daily_milk.png'"></div>
        <div class="category-name">${name}</div>
        <div class="category-desc">${desc}</div>
      `;
      catGrid.appendChild(catCard);
    });
  }

  // Render Featured Products
  const prodGrid = document.getElementById("products-list");
  if (prodGrid) {
    prodGrid.innerHTML = "";
    const featuredList = products.filter(p => p.isFeatured && p.inStock);
    
    if (featuredList.length === 0) {
      prodGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);">No products featured today.</p>`;
      return;
    }

    featuredList.slice(0, 6).forEach(prod => {
      const card = document.createElement("article");
      card.className = "product-card reveal-scale";
      
      const name = currentLang === "en" ? prod.nameEn : prod.nameBn;
      const desc = currentLang === "en" ? prod.descEn : prod.descBn;
      const badge = currentLang === "en" ? prod.badgeEn : prod.badgeBn;
      const unit = currentLang === "en" ? prod.unitEn : prod.unitBn;
      const priceText = translateNumber(prod.price.toString());
      
      let badgeHtml = badge ? `<div class="product-badge">${badge}</div>` : "";
      
      card.innerHTML = `
        <div class="product-img-wrap">
          <img src="${prod.imagePath || prod.imageData || 'images/daily_milk.png'}" alt="${name}" class="product-img-pic" onerror="this.src='images/daily_milk.png'">
          ${badgeHtml}
        </div>
        <div class="product-body">
          <h3 class="product-name" style="font-family:'Outfit',sans-serif;font-weight:700;font-size:1.15rem;margin-bottom:8px;">${name}</h3>
          <p class="product-desc" style="font-size:0.85rem;color:var(--text-muted);margin-bottom:16px;line-height:1.5;">${desc}</p>
          <div class="product-footer" style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;">
            <div class="price-wrap">
              <div class="price" style="font-family:'Outfit',sans-serif;font-weight:700;font-size:1.2rem;color:var(--green);">${priceText} ৳</div>
              <div class="price-unit" style="font-size:0.75rem;color:var(--text-muted);">/ ${unit}</div>
            </div>
            <div style="display:flex;gap:8px;">
              <button class="add-btn" onclick="addToCart('${prod.id}', 1)" style="padding:8px 14px;background:var(--brown);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;font-size:0.8rem;">Add</button>
              <button class="add-btn" onclick="window.location.href='product.html?id=${prod.id}'" style="padding:8px 10px;background:var(--cream-mid);color:var(--text);border:none;border-radius:6px;cursor:pointer;font-weight:700;font-size:0.8rem;">View</button>
            </div>
          </div>
        </div>
      `;
      prodGrid.appendChild(card);
    });
  }
}

function setupStatsCounter() {
  const stats = [
    { num: 8, labelEn: "Product Categories", labelBn: "পণ্য ক্যাটাগরি" },
    { num: 50, labelEn: "Partner Villages", labelBn: "পার্টনার গ্রামসমূহ" },
    { num: 24, labelEn: "Sourcing Windows (Hrs)", labelBn: "সোর্সিং উইন্ডো (ঘণ্টা)" }
  ];
  stats.forEach((s, idx) => {
    const numEl = document.getElementById(`stat-num-${idx}`);
    const lblEl = document.getElementById(`stat-lbl-${idx}`);
    if (numEl && lblEl) {
      numEl.innerText = translateNumber(s.num.toString()) + "+";
      lblEl.innerText = currentLang === "en" ? s.labelEn : s.labelBn;
    }
  });
}

/* ════════════════════════════════════════
   PAGE LOGICS: 2. SHOP PAGE
   ════════════════════════════════════════ */
let shopFilters = {
  search: "",
  category: "all",
  sort: "featured",
  maxPrice: 3000
};

function initShopPageBindings() {
  const params = new URLSearchParams(window.location.search);
  const categoryParam = params.get("category");
  if (categoryParam) {
    shopFilters.category = categoryParam;
  }

  // Bind Search Input
  const searchInput = document.getElementById("shop-search-input");
  if (searchInput) {
    searchInput.addEventListener("input", (e) => {
      shopFilters.search = e.target.value.trim().toLowerCase();
      renderShopPage();
    });
  }

  // Bind Sort Selection
  const sortSelect = document.getElementById("shop-sort-select");
  if (sortSelect) {
    sortSelect.addEventListener("change", (e) => {
      shopFilters.sort = e.target.value;
      renderShopPage();
    });
  }

  // Bind Price Range slider
  const priceSlider = document.getElementById("shop-price-slider");
  const maxPriceInput = document.getElementById("shop-max-price");
  if (priceSlider && maxPriceInput) {
    priceSlider.addEventListener("input", (e) => {
      maxPriceInput.value = e.target.value;
      shopFilters.maxPrice = parseInt(e.target.value, 10);
      renderShopPage();
    });
    maxPriceInput.addEventListener("input", (e) => {
      priceSlider.value = e.target.value;
      shopFilters.maxPrice = parseInt(e.target.value, 10) || 3000;
      renderShopPage();
    });
  }
}

function renderShopPage() {
  // Render Categories Sidebar
  const catSidebarList = document.getElementById("shop-categories-list");
  if (catSidebarList) {
    catSidebarList.innerHTML = "";
    
    // Add "All Categories" link
    const allItem = document.createElement("li");
    allItem.className = "filter-item";
    const allActive = shopFilters.category === "all" ? "active" : "";
    const allLabel = translations[currentLang]["lbl-all-categories"];
    allItem.innerHTML = `
      <a href="#" class="filter-link ${allActive}" onclick="selectShopCategory('all', event)">
        <span>${allLabel}</span>
        <span class="filter-count">${products.length}</span>
      </a>
    `;
    catSidebarList.appendChild(allItem);

    // List categories
    categories.forEach(cat => {
      const item = document.createElement("li");
      item.className = "filter-item";
      const catCount = products.filter(p => p.categoryId === cat.id).length;
      const isActive = shopFilters.category === cat.id ? "active" : "";
      const name = currentLang === "en" ? cat.nameEn : cat.nameBn;

      item.innerHTML = `
        <a href="#" class="filter-link ${isActive}" onclick="selectShopCategory('${cat.id}', event)">
          <span>${name}</span>
          <span class="filter-count">${catCount}</span>
        </a>
      `;
      catSidebarList.appendChild(item);
    });
  }

  // Filter Products
  let filtered = [...products];

  // Category filter
  if (shopFilters.category !== "all") {
    filtered = filtered.filter(p => p.categoryId === shopFilters.category);
  }

  // Search filter
  if (shopFilters.search) {
    filtered = filtered.filter(p => 
      p.nameEn.toLowerCase().includes(shopFilters.search) || 
      p.nameBn.toLowerCase().includes(shopFilters.search) || 
      p.descEn.toLowerCase().includes(shopFilters.search)
    );
  }

  // Price filter
  filtered = filtered.filter(p => p.price <= shopFilters.maxPrice);

  // Sorting logic
  if (shopFilters.sort === "low") {
    filtered.sort((a, b) => a.price - b.price);
  } else if (shopFilters.sort === "high") {
    filtered.sort((a, b) => b.price - a.price);
  } else if (shopFilters.sort === "newest") {
    filtered.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
  }

  // Render items grid
  const shopGrid = document.getElementById("shop-products-grid");
  const countSpan = document.getElementById("shop-results-count");
  if (countSpan) {
    countSpan.innerText = translateNumber(filtered.length.toString());
  }

  if (shopGrid) {
    shopGrid.innerHTML = "";
    if (filtered.length === 0) {
      shopGrid.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:40px;color:var(--text-muted);">${currentLang === "en" ? "No products match your filters." : "কোনো পণ্য পাওয়া যায়নি।"}</div>`;
      return;
    }

    filtered.forEach(prod => {
      const card = document.createElement("article");
      card.className = "product-card reveal-scale reveal-active";
      
      const name = currentLang === "en" ? prod.nameEn : prod.nameBn;
      const desc = currentLang === "en" ? prod.descEn : prod.descBn;
      const badge = currentLang === "en" ? prod.badgeEn : prod.badgeBn;
      const unit = currentLang === "en" ? prod.unitEn : prod.unitBn;
      const priceText = translateNumber(prod.price.toString());
      
      let badgeHtml = badge ? `<div class="product-badge">${badge}</div>` : "";
      let actionBtn = prod.inStock 
        ? `<button class="add-btn" onclick="addToCart('${prod.id}', 1)" style="padding:8px 12px;background:var(--brown);color:#fff;border:none;border-radius:6px;cursor:pointer;font-weight:700;font-size:0.8rem;">Add</button>`
        : `<button class="add-btn" disabled style="background:#a4b0be;cursor:not-allowed;">Sold Out</button>`;

      card.innerHTML = `
        <div class="product-img-wrap">
          <img src="${prod.imagePath || prod.imageData || 'images/daily_milk.png'}" alt="${name}" class="product-img-pic" onerror="this.src='images/daily_milk.png'">
          ${badgeHtml}
        </div>
        <div class="product-body">
          <h3 class="product-name" style="font-family:'Outfit',sans-serif;font-weight:700;font-size:1.1rem;margin-bottom:8px;">${name}</h3>
          <p class="product-desc" style="font-size:0.82rem;color:var(--text-muted);margin-bottom:16px;line-height:1.5;max-height:60px;overflow:hidden;">${desc}</p>
          <div class="product-footer" style="display:flex;justify-content:space-between;align-items:center;margin-top:auto;">
            <div class="price-wrap">
              <div class="price" style="font-family:'Outfit',sans-serif;font-weight:700;font-size:1.15rem;color:var(--green);">${priceText} ৳</div>
              <div class="price-unit" style="font-size:0.75rem;color:var(--text-muted);">/ ${unit}</div>
            </div>
            <div style="display:flex;gap:6px;">
              ${actionBtn}
              <button class="add-btn" onclick="window.location.href='product.html?id=${prod.id}'" style="padding:8px 10px;background:var(--cream-mid);color:var(--text);border:none;border-radius:6px;cursor:pointer;font-weight:700;font-size:0.8rem;">View</button>
            </div>
          </div>
        </div>
      `;
      shopGrid.appendChild(card);
    });
  }
}

window.selectShopCategory = function(catId, event) {
  if (event) event.preventDefault();
  shopFilters.category = catId;
  renderShopPage();
};

/* ════════════════════════════════════════
   PAGE LOGICS: 3. PRODUCT DETAILS PAGE
   ════════════════════════════════════════ */
let activeProductId = "";
let selectedProductQty = 1;

function initProductPageBindings() {
  const params = new URLSearchParams(window.location.search);
  activeProductId = params.get("id") || "";

  // Bind qty selector actions
  const btnMinus = document.getElementById("qty-minus");
  const btnPlus = document.getElementById("qty-plus");
  const qtyInput = document.getElementById("qty-input");

  if (btnMinus && btnPlus && qtyInput) {
    btnMinus.addEventListener("click", () => {
      selectedProductQty = Math.max(1, selectedProductQty - 1);
      qtyInput.value = selectedProductQty;
    });
    btnPlus.addEventListener("click", () => {
      selectedProductQty = selectedProductQty + 1;
      qtyInput.value = selectedProductQty;
    });
    qtyInput.addEventListener("input", (e) => {
      selectedProductQty = Math.max(1, parseInt(e.target.value, 10) || 1);
      qtyInput.value = selectedProductQty;
    });
  }

  // Bind add to cart trigger
  const btnCart = document.getElementById("btn-add-details-cart");
  if (btnCart) {
    btnCart.addEventListener("click", () => {
      if (activeProductId) {
        addToCart(activeProductId, selectedProductQty);
      }
    });
  }
}

function renderProductDetailsPage() {
  const prod = products.find(p => p.id === activeProductId);
  if (!prod) {
    const container = document.getElementById("product-detail-area");
    if (container) {
      container.innerHTML = `<div style="grid-column:1/-1;text-align:center;padding:100px 0;"><h3 style="color:var(--dark-brown);">Product Not Found</h3><a href="shop.html" class="btn-primary" style="margin-top:20px;">Back to Shop</a></div>`;
    }
    return;
  }

  const name = currentLang === "en" ? prod.nameEn : prod.nameBn;
  const desc = currentLang === "en" ? prod.descEn : prod.descBn;
  const unit = currentLang === "en" ? prod.unitEn : prod.unitBn;
  const badge = currentLang === "en" ? prod.badgeEn : prod.badgeBn;
  const priceVal = prod.price;
  const oldPriceVal = prod.discountPrice ? prod.price : null;
  const currentPriceVal = prod.discountPrice ? prod.discountPrice : prod.price;

  // Render images
  const mainImg = document.getElementById("details-main-img");
  if (mainImg) {
    mainImg.src = prod.imagePath || prod.imageData || 'images/daily_milk.png';
    mainImg.onerror = () => { mainImg.src = 'images/daily_milk.png'; };
    mainImg.alt = name;
  }

  // Badge
  const badgeEl = document.getElementById("details-badge");
  if (badgeEl) {
    if (badge) {
      badgeEl.innerText = badge;
      badgeEl.style.display = "block";
    } else {
      badgeEl.style.display = "none";
    }
  }

  // Titles
  const titleEl = document.getElementById("details-title");
  if (titleEl) titleEl.innerText = name;

  // Prices
  const priceBlock = document.getElementById("details-price-block");
  if (priceBlock) {
    if (prod.discountPrice && prod.discountPrice > 0) {
      priceBlock.innerHTML = `
        <span class="product-price-current">${translateNumber(prod.discountPrice.toString())} ৳</span>
        <span class="product-price-old">${translateNumber(prod.price.toString())} ৳</span>
      `;
    } else {
      priceBlock.innerHTML = `<span class="product-price-current">${translateNumber(prod.price.toString())} ৳</span>`;
    }
  }

  // Stock status
  const stockEl = document.getElementById("details-stock");
  if (stockEl) {
    const text = prod.inStock ? translations[currentLang]["lbl-in-stock"] : translations[currentLang]["lbl-out-stock"];
    stockEl.innerText = text;
    stockEl.className = `product-stock-tag ${prod.inStock ? 'stock-in' : 'stock-out'}`;
    stockEl.style.opacity = "1";
  }

  // Description
  const descEl = document.getElementById("details-desc");
  if (descEl) descEl.innerText = desc;

  // Benefits
  const benefitsEl = document.getElementById("details-benefits-list");
  if (benefitsEl) {
    benefitsEl.innerHTML = "";
    const list = currentLang === "en" ? prod.benefitsEn : prod.benefitsBn;
    if (list && list.length > 0) {
      list.forEach(b => {
        const li = document.createElement("li");
        li.innerText = b;
        benefitsEl.appendChild(li);
      });
    } else {
      benefitsEl.innerHTML = `<li>Pure & Organic Sourced</li><li>Direct from Village Sourcing</li>`;
    }
  }

  // Render Related Products
  const relatedGrid = document.getElementById("details-related-grid");
  if (relatedGrid) {
    relatedGrid.innerHTML = "";
    const related = products.filter(p => p.categoryId === prod.categoryId && p.id !== prod.id).slice(0, 3);
    
    if (related.length === 0) {
      relatedGrid.innerHTML = `<p style="grid-column:1/-1;text-align:center;color:var(--text-muted);font-size:0.9rem;">No related products found in this category.</p>`;
      return;
    }

    related.forEach(item => {
      const relatedCard = document.createElement("article");
      relatedCard.className = "product-card reveal-scale reveal-active";
      
      const rName = currentLang === "en" ? item.nameEn : item.nameBn;
      const rUnit = currentLang === "en" ? item.unitEn : item.unitBn;
      
      relatedCard.innerHTML = `
        <div class="product-img-wrap" style="height:180px;">
          <img src="${item.imagePath}" alt="${rName}" class="product-img-pic" onerror="this.src='images/daily_milk.png'">
        </div>
        <div class="product-body" style="padding:16px;">
          <h4 class="product-name" style="font-family:'Outfit',sans-serif;font-weight:700;font-size:0.95rem;margin-bottom:6px;">${rName}</h4>
          <div class="product-footer" style="display:flex;justify-content:space-between;align-items:center;">
            <div class="price" style="font-family:'Outfit',sans-serif;font-weight:700;color:var(--green);">${translateNumber(item.price.toString())} ৳ <span style="font-size:0.7rem;color:var(--text-muted);">/ ${rUnit}</span></div>
            <button class="add-btn" onclick="window.location.href='product.html?id=${item.id}'" style="padding:4px 8px;background:var(--brown);color:#fff;border:none;border-radius:4px;cursor:pointer;font-size:0.75rem;">View</button>
          </div>
        </div>
      `;
      relatedGrid.appendChild(relatedCard);
    });
  }
}

/* ════════════════════════════════════════
   PAGE LOGICS: 4. CART PAGE
   ════════════════════════════════════════ */
let activeCoupon = null;

function initCartPageBindings() {
  // Bind Coupon Form
  const couponForm = document.getElementById("coupon-form");
  if (couponForm) {
    couponForm.addEventListener("submit", (e) => {
      e.preventDefault();
      const codeInput = document.getElementById("coupon-input-code").value.trim().toUpperCase();
      applyCouponCode(codeInput);
    });
  }
}

function applyCouponCode(code) {
  const msgEl = document.getElementById("coupon-message");
  if (!msgEl) return;

  const match = coupons.find(c => c.code === code && c.status === "Active" && new Date(c.expiryDate) >= new Date());
  if (match) {
    activeCoupon = match;
    localStorage.setItem("onyx_goods_active_coupon", JSON.stringify(match));
    msgEl.innerText = translations[currentLang]["toast-coupon-success"];
    msgEl.className = "coupon-msg success";
    showToast(translations[currentLang]["toast-coupon-success"]);
    renderCartPage();
  } else {
    activeCoupon = null;
    localStorage.removeItem("onyx_goods_active_coupon");
    msgEl.innerText = translations[currentLang]["toast-coupon-invalid"];
    msgEl.className = "coupon-msg error";
    showToast(translations[currentLang]["toast-coupon-invalid"], true);
    renderCartPage();
  }
}

function renderCartPage() {
  const cart = getCart();
  const listWrapper = document.getElementById("cart-items-wrapper");
  const cartGrid = document.getElementById("cart-page-layout");

  // Load active coupon if saved
  activeCoupon = JSON.parse(localStorage.getItem("onyx_goods_active_coupon")) || null;

  if (cart.length === 0) {
    if (cartGrid) {
      cartGrid.innerHTML = `
        <div class="cart-empty reveal-scale reveal-active">
          <div class="cart-empty-icon">🛒</div>
          <h3 id="lbl-cart-empty">${translations[currentLang]["lbl-cart-empty"]}</h3>
          <p id="lbl-cart-empty-text">${translations[currentLang]["lbl-cart-empty-text"]}</p>
          <a href="shop.html" class="btn-primary" id="btn-shop-now-empty">${translations[currentLang]["btn-shop-now"]}</a>
        </div>
      `;
    }
    return;
  }

  if (listWrapper) {
    listWrapper.innerHTML = `
      <div class="cart-header-row">
        <span>Product</span>
        <span style="text-align:center;">Price</span>
        <span style="text-align:center;">Quantity</span>
        <span style="text-align:right;">Subtotal</span>
      </div>
    `;

    cart.forEach(item => {
      const row = document.createElement("div");
      row.className = "cart-item-row";
      
      const name = currentLang === "en" ? item.nameEn : item.nameBn;
      const unit = currentLang === "en" ? item.unitEn : item.unitBn;
      
      const priceVal = item.discountPrice > 0 ? item.discountPrice : item.price;
      const rowSubtotal = priceVal * item.quantity;

      row.innerHTML = `
        <div class="cart-item-info">
          <button class="cart-item-remove" onclick="removeFromCart('${item.productId}'); renderCartPage();">&times;</button>
          <div class="cart-item-img">
            <img src="${item.imagePath}" alt="${name}" onerror="this.src='images/daily_milk.png'">
          </div>
          <div class="cart-item-meta">
            <a href="product.html?id=${item.productId}" class="cart-item-name">${name}</a>
            <span class="cart-item-unit">/ ${unit}</span>
          </div>
        </div>
        <div style="text-align:center;" class="cart-item-price">${translateNumber(priceVal.toString())} ৳</div>
        <div style="text-align:center; display:flex; justify-content:center;">
          <div class="quantity-box" style="height:36px;">
            <button onclick="updateCartQty('${item.productId}', ${item.quantity - 1}); renderCartPage();" style="width:30px;height:34px;">-</button>
            <input type="text" value="${item.quantity}" readonly style="width:32px;">
            <button onclick="updateCartQty('${item.productId}', ${item.quantity + 1}); renderCartPage();" style="width:30px;height:34px;">+</button>
          </div>
        </div>
        <div style="text-align:right;" class="cart-item-subtotal">${translateNumber(rowSubtotal.toString())} ৳</div>
      `;
      listWrapper.appendChild(row);
    });
  }

  // Calculate pricing
  let subtotal = 0;
  cart.forEach(item => {
    const p = item.discountPrice > 0 ? item.discountPrice : item.price;
    subtotal += p * item.quantity;
  });

  let discount = 0;
  if (activeCoupon) {
    if (activeCoupon.type === "percentage") {
      discount = Math.round(subtotal * (activeCoupon.value / 100));
    } else {
      discount = activeCoupon.value;
    }
  }

  // Set checkout totals in localstorage for checkout page load
  localStorage.setItem("onyx_goods_subtotal", subtotal);
  localStorage.setItem("onyx_goods_discount", discount);

  // Update Summary DOM
  const subtotalEl = document.getElementById("summary-subtotal");
  const discountEl = document.getElementById("summary-discount");
  const totalEl = document.getElementById("summary-total");

  if (subtotalEl) subtotalEl.innerText = `${translateNumber(subtotal.toString())} ৳`;
  if (discountEl) discountEl.innerText = `${translateNumber(discount.toString())} ৳`;
  if (totalEl) totalEl.innerText = `${translateNumber((subtotal - discount).toString())} ৳`;
}

/* ════════════════════════════════════════
   PAGE LOGICS: 5. CHECKOUT PAGE
   ════════════════════════════════════════ */
let selectedPaymentMethod = "Cash";

function initCheckoutPageBindings() {
  // Check if cart is empty, redirect
  const cart = getCart();
  if (cart.length === 0) {
    window.location.href = "cart.html";
    return;
  }

  // Bind Payment Card Clicks
  const cards = document.querySelectorAll(".payment-card");
  cards.forEach(card => {
    card.addEventListener("click", () => {
      cards.forEach(c => c.classList.remove("active"));
      card.classList.add("active");
      selectedPaymentMethod = card.getAttribute("data-method");
      toggleCheckoutPaymentInstructions();
    });
  });

  // Load active logged user details to auto fill
  if (activeUser) {
    const nameInput = document.getElementById("checkout-name");
    const phoneInput = document.getElementById("checkout-phone");
    const emailInput = document.getElementById("checkout-email");
    const addressInput = document.getElementById("checkout-address");
    const distSelect = document.getElementById("checkout-district");

    if (nameInput) nameInput.value = activeUser.name || "";
    if (phoneInput) phoneInput.value = activeUser.phone || "";
    if (emailInput) emailInput.value = activeUser.email || "";
    if (addressInput) addressInput.value = activeUser.address || "";
    if (distSelect) distSelect.value = activeUser.district || "Dhaka";
  }

  // Bind district change for shipping rates recalculations
  const districtSelect = document.getElementById("checkout-district");
  if (districtSelect) {
    districtSelect.addEventListener("change", () => {
      renderCheckoutPage();
    });
  }

  // Bind Order Submit
  const checkForm = document.getElementById("checkout-billing-form");
  if (checkForm) {
    checkForm.addEventListener("submit", (e) => {
      e.preventDefault();
      submitBillingOrder();
    });
  }
}

function toggleCheckoutPaymentInstructions() {
  const instructionsBox = document.getElementById("checkout-payment-instructions");
  if (!instructionsBox) return;

  if (selectedPaymentMethod === "Bkash") {
    instructionsBox.style.display = "block";
    instructionsBox.innerHTML = `
      <h5 style="margin-bottom:6px;font-family:'Outfit',sans-serif;font-weight:700;">bKash Payment Method</h5>
      <p style="font-size:0.85rem;color:var(--text-muted);">Please send the total order amount to <strong>01947-528890</strong> (Personal Account) via <strong>Send Money</strong>. Paste your transaction reference ID in order notes or share on WhatsApp.</p>
    `;
  } else if (selectedPaymentMethod === "Nagad") {
    instructionsBox.style.display = "block";
    instructionsBox.innerHTML = `
      <h5 style="margin-bottom:6px;font-family:'Outfit',sans-serif;font-weight:700;">Nagad Payment Method</h5>
      <p style="font-size:0.85rem;color:var(--text-muted);">Please send the total order amount to <strong>01947-528890</strong> (Personal Account) via <strong>Send Money</strong>. Paste your transaction reference ID in order notes or share on WhatsApp.</p>
    `;
  } else {
    instructionsBox.style.display = "none";
  }
}

function renderCheckoutPage() {
  const cart = getCart();
  const orderItemsList = document.getElementById("checkout-items-list");
  if (!orderItemsList) return;

  orderItemsList.innerHTML = "";
  cart.forEach(item => {
    const row = document.createElement("div");
    row.className = "checkout-summary-item";
    
    const name = currentLang === "en" ? item.nameEn : item.nameBn;
    const price = item.discountPrice > 0 ? item.discountPrice : item.price;
    const unit = currentLang === "en" ? item.unitEn : item.unitBn;
    const sub = price * item.quantity;

    row.innerHTML = `
      <span class="checkout-summary-name">${name} <span style="font-weight:normal;color:var(--text-muted);">x ${translateNumber(item.quantity.toString())}</span></span>
      <span>${translateNumber(sub.toString())} ৳</span>
    `;
    orderItemsList.appendChild(row);
  });

  // Calculate pricing with shipping
  const subtotal = parseInt(localStorage.getItem("onyx_goods_subtotal") || "0", 10);
  const discount = parseInt(localStorage.getItem("onyx_goods_discount") || "0", 10);

  // Delivery rate check
  const district = document.getElementById("checkout-district")?.value || "Dhaka";
  const shippingCharge = (district === "Dhaka") ? 60 : 120;

  const total = subtotal - discount + shippingCharge;

  document.getElementById("checkout-subtotal").innerText = `${translateNumber(subtotal.toString())} ৳`;
  document.getElementById("checkout-discount").innerText = `${translateNumber(discount.toString())} ৳`;
  document.getElementById("checkout-shipping").innerText = `${translateNumber(shippingCharge.toString())} ৳`;
  document.getElementById("checkout-total").innerText = `${translateNumber(total.toString())} ৳`;
}

async function submitBillingOrder() {
  const btn = document.getElementById("btn-submit-order-checkout");
  if (btn) btn.disabled = true;

  const district = document.getElementById("checkout-district").value;
  const shippingCharge = (district === "Dhaka") ? 60 : 120;
  const subtotal = parseInt(localStorage.getItem("onyx_goods_subtotal") || "0", 10);
  const discount = parseInt(localStorage.getItem("onyx_goods_discount") || "0", 10);
  const total = subtotal - discount + shippingCharge;
  const coupon = JSON.parse(localStorage.getItem("onyx_goods_active_coupon")) || null;

  const cartItems = getCart();
  const orderData = {
    id: "SHK_" + Math.random().toString(36).substr(2, 9).toUpperCase(),
    customerEmail: document.getElementById("checkout-email")?.value.trim() || "guest@onyxgoods.com",
    name: document.getElementById("checkout-name").value.trim(),
    phone: document.getElementById("checkout-phone").value.trim(),
    whatsapp: document.getElementById("checkout-whatsapp").value.trim(),
    address: document.getElementById("checkout-address").value.trim(),
    district: district,
    notes: document.getElementById("checkout-notes")?.value.trim() || "",
    items: cartItems,
    product: cartItems.map(i => `${i.nameEn} (x${i.quantity})`).join(", "),
    quantity: cartItems.reduce((sum, i) => sum + i.quantity, 0),
    subtotal: subtotal,
    discount: discount,
    deliveryCharge: shippingCharge,
    total: total,
    couponCode: coupon ? coupon.code : "",
    paymentMethod: selectedPaymentMethod,
    paymentStatus: (selectedPaymentMethod === "Cash") ? "Unpaid" : "Paid",
    status: "Pending",
    createdAt: new Date().toISOString()
  };

  try {
    if (isMockMode) {
      // Save order
      const ordersList = JSON.parse(localStorage.getItem("onyx_goods_orders") || "[]");
      ordersList.push(orderData);
      saveMockData("onyx_goods_orders", ordersList);

      // Save customer details
      const custsList = JSON.parse(localStorage.getItem("onyx_goods_customers") || "[]");
      const existIdx = custsList.findIndex(c => c.phone === orderData.phone);
      const profile = {
        name: orderData.name,
        phone: orderData.phone,
        whatsapp: orderData.whatsapp,
        email: orderData.customerEmail,
        address: orderData.address,
        district: orderData.district,
        lastOrderAt: orderData.createdAt
      };
      if (existIdx > -1) {
        custsList[existIdx] = profile;
      } else {
        custsList.push(profile);
      }
      saveMockData("onyx_goods_customers", custsList);
    } else {
      await db.collection("orders").doc(orderData.id).set(orderData);
      
      // Save customer doc
      await db.collection("customers").doc(orderData.phone).set({
        name: orderData.name,
        phone: orderData.phone,
        whatsapp: orderData.whatsapp,
        email: orderData.customerEmail,
        address: orderData.address,
        district: orderData.district,
        lastOrderAt: orderData.createdAt
      }, { merge: true });
    }

    showToast(translations[currentLang]["toast-order-success"]);
    
    // Clear out cart state
    clearCart();
    localStorage.removeItem("onyx_goods_active_coupon");
    localStorage.removeItem("onyx_goods_subtotal");
    localStorage.removeItem("onyx_goods_discount");

    // Open WhatsApp prefilled message window
    setTimeout(() => {
      sendWhatsAppInvoice(orderData);
      window.location.href = `account.html`;
    }, 2000);

  } catch (error) {
    console.error("Failed to place order:", error);
    showToast(translations[currentLang]["toast-order-failed"], true);
    if (btn) btn.disabled = false;
  }
}

function sendWhatsAppInvoice(order) {
  const num = "8801302101024";
  const displayTotal = translateNumber(order.total.toString());
  
  let msg = `Hello OnyxGoods! 🌿
I just placed a new order on your premium marketplace:
━━━━━━━━━━━━━━━━━━━━
*Order ID*: ${order.id}
*Name*: ${order.name}
*Phone*: ${order.phone}
*District*: ${order.district}
*Address*: ${order.address}
━━━━━━━━━━━━━━━━━━━━
*Items Sourced*:
`;

  order.items.forEach(item => {
    const name = currentLang === "en" ? item.nameEn : item.nameBn;
    const unit = currentLang === "en" ? item.unitEn : item.unitBn;
    msg += `- ${name} (x${item.quantity} ${unit})\n`;
  });

  msg += `━━━━━━━━━━━━━━━━━━━━
*Payment Method*: ${order.paymentMethod}
*Total Paid/Due*: BDT ${displayTotal}
━━━━━━━━━━━━━━━━━━━━
Please confirm my packaging slot. Thank you!`;

  window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
}

/* ════════════════════════════════════════
   PAGE LOGICS: 6. CUSTOMER ACCOUNT & PORTAL
   ════════════════════════════════════════ */
function initAccountPageBindings() {
  // Bind Tab switching
  const tabs = document.querySelectorAll(".account-menu-link");
  tabs.forEach(tab => {
    tab.addEventListener("click", (e) => {
      e.preventDefault();
      tabs.forEach(t => t.classList.remove("active"));
      tab.classList.add("active");

      const targetSection = tab.getAttribute("data-section");
      const sections = document.querySelectorAll(".account-section");
      sections.forEach(s => s.classList.remove("active"));
      document.getElementById(`account-sec-${targetSection}`).classList.add("active");
    });
  });

  // Bind Login Trigger
  const logForm = document.getElementById("cust-login-form");
  if (logForm) {
    logForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleCustomerAuth("login");
    });
  }

  // Bind Register Trigger
  const regForm = document.getElementById("cust-register-form");
  if (regForm) {
    regForm.addEventListener("submit", (e) => {
      e.preventDefault();
      handleCustomerAuth("register");
    });
  }
}

function handleCustomerAuth(mode) {
  const btnId = mode === "login" ? "btn-cust-login" : "btn-cust-register";
  const btn = document.getElementById(btnId);
  if (btn) btn.disabled = true;

  const email = document.getElementById(`${mode}-email`).value.trim();
  const password = document.getElementById(`${mode}-password`).value.trim();

  if (mode === "register") {
    const name = document.getElementById("register-name").value.trim();
    const phone = document.getElementById("register-phone").value.trim();
    const address = document.getElementById("register-address").value.trim();
    const district = document.getElementById("register-district").value;

    const newUser = { name, email, phone, address, district, password };

    // Register user in Mock local storage
    const users = JSON.parse(localStorage.getItem("onyx_goods_users") || "[]");
    if (users.find(u => u.email === email)) {
      showToast("Email address already registered.", true);
      if (btn) btn.disabled = false;
      return;
    }
    users.push(newUser);
    saveMockData("onyx_goods_users", users);

    // Save as active logged in
    localStorage.setItem("onyx_goods_logged_user", JSON.stringify(newUser));
    showToast(translations[currentLang]["toast-register-success"]);
    setTimeout(() => {
      window.location.reload();
    }, 1500);

  } else {
    // Login check
    const users = JSON.parse(localStorage.getItem("onyx_goods_users") || "[]");
    const match = users.find(u => u.email === email && u.password === password);
    
    if (match) {
      localStorage.setItem("onyx_goods_logged_user", JSON.stringify(match));
      showToast(translations[currentLang]["toast-login-success"]);
      setTimeout(() => {
        window.location.reload();
      }, 1500);
    } else {
      showToast(translations[currentLang]["toast-auth-failed"], true);
      if (btn) btn.disabled = false;
    }
  }
}

window.logoutCustomer = function() {
  localStorage.removeItem("onyx_goods_logged_user");
  window.location.reload();
};

function renderAccountPage() {
  const authContainer = document.getElementById("account-auth-container");
  const dashboardContainer = document.getElementById("account-dashboard-container");

  if (!authContainer || !dashboardContainer) return;

  if (!activeUser) {
    authContainer.style.display = "block";
    dashboardContainer.style.display = "none";
  } else {
    authContainer.style.display = "none";
    dashboardContainer.style.display = "grid";

    // Set header labels
    document.getElementById("user-display-name").innerText = activeUser.name;
    document.getElementById("user-display-email").innerText = activeUser.email;

    // Load dynamic order history
    loadUserOrders();
  }
}

async function loadUserOrders() {
  const list = document.getElementById("user-order-log-list");
  if (!list) return;

  let userOrders = [];
  try {
    if (isMockMode) {
      const allOrders = JSON.parse(localStorage.getItem("onyx_goods_orders") || "[]");
      userOrders = allOrders.filter(o => o.customerEmail === activeUser.email);
    } else {
      const snap = await db.collection("orders").where("customerEmail", "==", activeUser.email).get();
      userOrders = snap.docs.map(doc => ({ id: doc.id, ...doc.data() }));
    }
  } catch (error) {
    console.error("Failed to fetch customer orders:", error);
  }

  list.innerHTML = "";
  if (userOrders.length === 0) {
    list.innerHTML = `<p style="text-align:center;padding:30px;color:var(--text-muted);">${currentLang === "en" ? "You haven't placed any orders yet." : "আপনি এখনো কোনো অর্ডার করেননি।"}</p>`;
    return;
  }

  userOrders.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).forEach(order => {
    const card = document.createElement("div");
    card.className = "order-log-card";

    let itemSummaries = order.items.map(item => {
      const name = currentLang === "en" ? item.nameEn : item.nameBn;
      const unit = currentLang === "en" ? item.unitEn : item.unitBn;
      return `${name} (x${item.quantity} ${unit})`;
    }).join(", ");

    const displayDate = new Date(order.createdAt).toLocaleDateString(currentLang === "en" ? "en-US" : "bn-BD");
    const displayTotal = translateNumber(order.total.toString());
    const statusText = order.status;

    card.innerHTML = `
      <div class="order-log-header">
        <span>ID: ${order.id} | ${displayDate}</span>
        <span class="badge badge-${order.status.toLowerCase()}">${statusText}</span>
      </div>
      <div class="order-log-details">
        <div class="order-log-items">
          <strong>Products Sourced:</strong><br>${itemSummaries}
        </div>
        <div class="order-log-total">
          ${displayTotal} ৳
        </div>
      </div>
    `;
    list.appendChild(card);
  });
}
