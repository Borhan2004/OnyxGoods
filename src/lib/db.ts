import firebase from 'firebase/compat/app';
import 'firebase/compat/firestore';
import 'firebase/compat/auth';
import { Category, Product, Coupon, Order, StoreSettings, Customer } from '@/types';

const firebaseConfig = {
  apiKey: "AIzaSyCRpexJ6gD9VpbLX_IhLSJ0jMMxohBvrPw",
  authDomain: "onyxgoods.firebaseapp.com",
  projectId: "onyxgoods",
  storageBucket: "onyxgoods.firebasestorage.app",
  messagingSenderId: "576476626749",
  appId: "1:576476626749:web:6b8cfd1f2bbd6417cbcf54"
};

let db: firebase.firestore.Firestore | null = null;
let isMockMode = false;

export interface DbConnection {
  db: firebase.firestore.Firestore | null;
  isMockMode: boolean;
}

// Client-side initialization helper
export function getDbConnection(): DbConnection {
  if (typeof window === 'undefined') {
    return { db: null, isMockMode: true };
  }

  if (db !== null) {
    return { db, isMockMode };
  }

  const urlParams = new URLSearchParams(window.location.search);
  const forceMock = urlParams.has('mock');
  const isDefaultConfig = forceMock || !firebaseConfig.apiKey || firebaseConfig.projectId.includes("YOUR_PROJECT");

  if (isDefaultConfig) {
    isMockMode = true;
    setupMockDatabase();
  } else {
    try {
      if (!firebase.apps.length) {
        firebase.initializeApp(firebaseConfig);
      }
      db = firebase.firestore();
      isMockMode = false;
    } catch (error) {
      console.error("Firebase initialization failed. Falling back to Mock Mode.", error);
      isMockMode = true;
      setupMockDatabase();
    }
  }

  return { db, isMockMode };
}

function setupMockDatabase(): void {
  if (typeof window === 'undefined') return;

  if (!localStorage.getItem("onyx_goods_categories")) {
    const defaultCategories: Category[] = [
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
    const defaultProducts: Product[] = [
      { id: "prod_raw_milk", categoryId: "cat_dairy", nameEn: "Daily Raw Cow Milk", nameBn: "দৈনিক কাঁচা গরুর দুধ", descEn: "Pure, raw, single-source cow milk chilled immediately. Rich in nutrients.", descBn: "শতভাগ খাঁটি ও কাঁচা গরুর দুধ যা সংগ্রহের পরই দ্রুত শীতলীকৃত। পুষ্টিগুণে ভরপুর।", benefitsEn: ["Chilled immediately at source", "No preservatives added", "High fat and rich nutrients"], benefitsBn: ["সংগ্রহের পর দ্রুত শীতলীকৃত", "কোনো প্রিজারভেটিভ নেই", "প্রাকৃতিক পুষ্টি ও ঘন মালাই যুক্ত"], price: 80, discountPrice: 75, stock: 45, unitEn: "liter", unitBn: "লিটার", imagePath: "images/daily_milk.png", inStock: true, isFeatured: true, badgeEn: "Best Seller", badgeBn: "সেরা বিক্রীত", createdAt: new Date().toISOString() },
      { id: "prod_ghee", categoryId: "cat_dairy", nameEn: "Premium Village Cow Ghee", nameBn: "প্রিমিয়াম গ্রাম্য গরুর ঘি", descEn: "Slow-cooked pure cow ghee made from cultured butter cream. Signature aroma.", descBn: "ঘোল বা মাখন থেকে ধিমে আঁচে জ্বাল দেওয়া খাঁটি গরুর ঘি। দানাদার গঠন ও সুবাস।", benefitsEn: ["Traditionally slow cooked", "Granular texture", "Pure cultured butter cream"], benefitsBn: ["শতভাগ ঐতিহ্যবাহী উপায়ে তৈরি", "দানাদার এবং খাঁটি সুবাস", "প্রাকৃতিক মাখন থেকে প্রস্তুত"], price: 1200, discountPrice: 1150, stock: 15, unitEn: "kg", unitBn: "কেজি", imagePath: "images/premium_ghee.png", inStock: true, isFeatured: true, badgeEn: "Pure Gold", badgeBn: "খাঁটি সোনালী", createdAt: new Date().toISOString() },
      { id: "prod_mustard_oil", categoryId: "cat_honey", nameEn: "Authentic Mustard Oil", nameBn: "খাঁটি সরিষার তেল", descEn: "100% pure cold-pressed mustard oil extracted from high-quality mustard seeds.", descBn: "উচ্চমানের সরিষার বীজ থেকে কাঠের ঘানিতে ভাঙানো শতভাগ খাঁটি ও ঝাজালো সরিষার তেল।", benefitsEn: ["Cold-pressed wood mill extraction", "High pungency and rich color", "No chemical additives"], benefitsBn: ["কাঠের ঘানিতে কোল্ড-প্রেসড", "খাঁটি ঝাজালো স্বাদ ও বর্ণ", "কোনো কেমিকেল ব্যবহার করা হয়নি"], price: 280, discountPrice: 0, stock: 40, unitEn: "liter", unitBn: "লিটার", imagePath: "images/mustard_oil.png", inStock: true, isFeatured: true, badgeEn: "Cold Pressed", badgeBn: "ঘানি ভাঙা", createdAt: new Date().toISOString() },
      { id: "prod_nakshikantha", categoryId: "cat_handmade", nameEn: "Nakshikantha Quilt", nameBn: "নকশিকাঁথা", descEn: "Beautiful hand-stitched traditional Bengali quilt with elaborate artistic patterns, made by local village artisans.", descBn: "গ্রামের দক্ষ কারিগরদের সুনিপুণ হাতের কাজে তৈরি চমৎকার ঐতিহ্যবাহী নকশিকাঁথা।", benefitsEn: ["100% hand-stitched by rural women", "Traditional designs", "High quality cotton fabric"], benefitsBn: ["গ্রামীণ নারীদের হাতের নিখুঁত সেলাই", "ঐতিহ্যবাহী এবং বৈচিত্র্যময় নকশা", "উন্নত মানের সুতি কাপড় ব্যবহার"], price: 2500, discountPrice: 2200, stock: 5, unitEn: "piece", unitBn: "পিস", imagePath: "images/nakshikantha.png", inStock: true, isFeatured: true, badgeEn: "Artisan Craft", badgeBn: "হস্তশিল্প", createdAt: new Date().toISOString() },
      { id: "prod_tiler_khaja", categoryId: "cat_traditional", nameEn: "Kustiar Bikkhato Tiler Khaja", nameBn: "কুষ্টিয়ার বিখ্যাত তিলের খাজা", descEn: "Famous traditional sesame brittle sweet from Kushtia, extremely crispy and sweet.", descBn: "কুষ্টিয়ার ঐতিহ্যবাহী ও বিখ্যাত মচমচে তিলের খাজা। সেরা স্বাদের ও স্বাস্থ্যসম্মত উপায়ে তৈরি।", benefitsEn: ["Traditionally slow cooked", "No artificial sweeteners", "Made with pure sesame seeds"], benefitsBn: ["ঐতিহ্যবাহী রেসিপিতে তৈরি", "কোনো কৃত্রিম মিষ্টি নেই", "খাঁটি খোসা ছাড়ানো তিল ব্যবহার"], price: 160, discountPrice: 150, stock: 60, unitEn: "pack", unitBn: "প্যাকেট", imagePath: "images/tiler_khaja.png", inStock: true, isFeatured: true, badgeEn: "Kushtia Special", badgeBn: "কুষ্টিয়ার ঐতিহ্য", createdAt: new Date().toISOString() }
    ];
    localStorage.setItem("onyx_goods_products", JSON.stringify(defaultProducts));
  }

  if (!localStorage.getItem("onyx_goods_coupons")) {
    const defaultCoupons: Coupon[] = [
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
    const defaultSettings: StoreSettings = {
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

// Seeding Firestore live DB (same logic as app.js helper)
export async function seedDefaultCatalogToFirestore(activeDb: firebase.firestore.Firestore): Promise<void> {
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
    { id: "prod_ghee",         categoryId: "cat_dairy",       nameEn: "Premium Village Cow Ghee",      nameBn: "প্রিমিয়াম গ্রাম্য গরুর ঘি",       descEn: "Slow-cooked pure cow ghee with signature aroma.",                       descBn: "ধিমে আঁচে জ্বাল দেওয়া খাঁটি গরুর ঘি। দানাকার গঠন ও সুবাস।",        benefitsEn: ["Traditionally slow cooked","Granular texture","Pure butter"],      benefitsBn: ["ঐতিহ্যবাহী উপায়ে তৈরি","দানাদার ও খাঁটি সুবাস","প্রাকৃতিক মাখন"],        price: 1200, discountPrice: 1150, stock: 15, unitEn: "kg",     unitBn: "কেজি",   imagePath: "images/premium_ghee.png", inStock: true, isFeatured: true, badgeEn: "Pure Gold",   badgeBn: "খাঁটি সোনালী",    createdAt: new Date().toISOString() },
    { id: "prod_mustard_oil",  categoryId: "cat_honey",       nameEn: "Authentic Mustard Oil",         nameBn: "খাঁটি সরিষার তেল",                descEn: "100% pure cold-pressed mustard oil from high-quality seeds.",           descBn: "কাঠের ঘানিতে ভাঙানো শতভাগ খাঁটি সরিষার তেল।",                       benefitsEn: ["Cold-pressed extraction","High pungency","No chemicals"],          benefitsBn: ["কাঠের ঘানিতে কোল্ড-প্রেসড","খাঁটি ঝাজালো স্বাদ","কোনো কেমিকেল নেই"],    price: 280,  discountPrice: 0,    stock: 40, unitEn: "liter",  unitBn: "লিটার",  imagePath: "images/mustard_oil.png",  inStock: true, isFeatured: true, badgeEn: "Cold Pressed",badgeBn: "ঘানি ভাঙা",       createdAt: new Date().toISOString() },
    { id: "prod_nakshikantha", categoryId: "cat_handmade",    nameEn: "Nakshikantha Quilt",            nameBn: "নকশিকাঁথা",                       descEn: "Beautiful hand-stitched traditional Bengali quilt by village artisans.", descBn: "গ্রামের কারিগরদের হাতে তৈরি চমৎকার ঐতিহ্যবাহী নকশিকাঁথা।",        benefitsEn: ["100% hand-stitched","Traditional designs","Quality cotton"],       benefitsBn: ["হাতের নিখুঁত সেলাই","ঐতিহ্যবাহী নকশা","উন্নত সুতি কাপড়"],              price: 2500, discountPrice: 2200, stock: 5,  unitEn: "piece",  unitBn: "পিস",    imagePath: "images/nakshikantha.png", inStock: true, isFeatured: true, badgeEn: "Artisan",     badgeBn: "হস্তশিল্প",       createdAt: new Date().toISOString() },
    { id: "prod_tiler_khaja",  categoryId: "cat_traditional", nameEn: "Kushtia Tiler Khaja",           nameBn: "কুষ্টিয়ার তিলের খাজা",           descEn: "Famous traditional sesame brittle from Kushtia, crispy and sweet.",     descBn: "কুষ্টিয়ার বিখ্যাত মচমচে তিলের খাজা।",                              benefitsEn: ["Traditional recipe","No artificial sweeteners","Pure sesame"],     benefitsBn: ["ঐতিহ্যবাহী রেসিপি","কৃত্রিম মিষ্টি নেই","খাঁটি তিল"],                  price: 160,  discountPrice: 150,  stock: 60, unitEn: "pack",   unitBn: "প্যাকেট", imagePath: "images/tiler_khaja.png",  inStock: true, isFeatured: true, badgeEn: "Special",     badgeBn: "কুষ্টিয়ার ঐতিহ্য", createdAt: new Date().toISOString() }
  ];

  try {
    const batch = activeDb.batch();
    defaultCategories.forEach(cat => {
      batch.set(activeDb.collection("categories").doc(cat.id), cat);
    });
    defaultProducts.forEach(prod => {
      batch.set(activeDb.collection("products").doc(prod.id), prod);
    });
    await batch.commit();
    console.log("Default catalog seeded to Firestore successfully.");
  } catch (e) {
    console.error("Failed to seed catalog to Firestore:", e);
  }
}

export async function seedDefaultCouponsToFirestore(activeDb: firebase.firestore.Firestore): Promise<void> {
  const defaultCoupons = [
    { code: "OnyxGoods10",   type: "percentage", value: 10,  expiryDate: "2027-12-31", status: "Active" },
    { code: "WELCOME100", type: "fixed",       value: 100, expiryDate: "2027-12-31", status: "Active" },
    { code: "EID2026",    type: "percentage", value: 20,  expiryDate: "2026-09-30", status: "Active" }
  ];
  try {
    const batch = activeDb.batch();
    defaultCoupons.forEach(c => batch.set(activeDb.collection("coupons").doc(c.code), c));
    await batch.commit();
  } catch (e) {
    console.error("Failed to seed coupons to Firestore:", e);
  }
}

export interface CatalogData {
  categories: Category[];
  products: Product[];
  coupons: Coupon[];
  settings: StoreSettings;
}

// Unified Database API
export async function loadCatalogData(): Promise<CatalogData> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();

  if (mock) {
    const categories = JSON.parse(localStorage.getItem("onyx_goods_categories") || "[]");
    const products   = JSON.parse(localStorage.getItem("onyx_goods_products")   || "[]");
    const coupons    = JSON.parse(localStorage.getItem("onyx_goods_coupons")    || "[]");
    const settings   = JSON.parse(localStorage.getItem("onyx_goods_settings")   || "{}");
    return { categories, products, coupons, settings };
  } else if (activeDb) {
    const [catSnap, prodSnap, coupSnap, setDoc] = await Promise.all([
      activeDb.collection("categories").get(),
      activeDb.collection("products").get(),
      activeDb.collection("coupons").get(),
      activeDb.collection("settings").doc("store_settings").get()
    ]);

    let categories = catSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
    let products   = prodSnap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    let coupons    = coupSnap.docs.map(doc => ({ code: doc.id, ...doc.data() })) as unknown as Coupon[];
    let settings   = (setDoc.exists ? setDoc.data() : {
      logoUrl: "logo.jpg",
      contactEmail: "onyxsupport36@gmail.com",
      contactPhone: "+8801302101024",
      whatsappNumber: "8801302101024",
      deliveryChargeDhaka: 60,
      deliveryChargeOutside: 120,
      socialLinks: { facebook: "#", instagram: "#" }
    }) as StoreSettings;

    if (products.length === 0) {
      await seedDefaultCatalogToFirestore(activeDb);
      const reloadProd = await activeDb.collection("products").get();
      products = reloadProd.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Product[];
    }

    if (categories.length === 0) {
      const reloadCat = await activeDb.collection("categories").get();
      categories = reloadCat.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Category[];
    }

    if (coupons.length === 0) {
      await seedDefaultCouponsToFirestore(activeDb);
      const reloadCoup = await activeDb.collection("coupons").get();
      coupons = reloadCoup.docs.map(doc => ({ code: doc.id, ...doc.data() })) as unknown as Coupon[];
    }

    return { categories, products, coupons, settings };
  }
  return { categories: [], products: [], coupons: [], settings: {} as StoreSettings };
}

export async function placeOrder(orderData: Order): Promise<{ success: boolean; orderId: string }> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();

  if (mock) {
    const ordersList = JSON.parse(localStorage.getItem("onyx_goods_orders") || "[]") as Order[];
    ordersList.push(orderData);
    localStorage.setItem("onyx_goods_orders", JSON.stringify(ordersList));

    const custsList = JSON.parse(localStorage.getItem("onyx_goods_customers") || "[]") as Customer[];
    const existIdx = custsList.findIndex(c => c.phone === orderData.phone);
    const profile: Customer = {
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
    localStorage.setItem("onyx_goods_customers", JSON.stringify(custsList));
    return { success: true, orderId: orderData.id };
  } else if (activeDb) {
    await activeDb.collection("orders").doc(orderData.id).set(orderData);
    await activeDb.collection("customers").doc(orderData.phone).set({
      name: orderData.name,
      phone: orderData.phone,
      whatsapp: orderData.whatsapp,
      email: orderData.customerEmail,
      address: orderData.address,
      district: orderData.district,
      lastOrderAt: orderData.createdAt
    }, { merge: true });
    return { success: true, orderId: orderData.id };
  }
  return { success: false, orderId: "" };
}

export async function fetchCustomerOrders(email: string): Promise<Order[]> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();

  if (mock) {
    const allOrders = JSON.parse(localStorage.getItem("onyx_goods_orders") || "[]") as Order[];
    return allOrders.filter(o => o.customerEmail === email);
  } else if (activeDb) {
    const snap = await activeDb.collection("orders").where("customerEmail", "==", email).get();
    return snap.docs.map(doc => ({ id: doc.id, ...doc.data() })) as Order[];
  }
  return [];
}

export interface PortalAdminData {
  categories: Category[];
  products: Product[];
  orders: Order[];
  customers: Customer[];
  coupons: Coupon[];
  settings: StoreSettings;
}

export async function loadPortalAdminData(): Promise<PortalAdminData> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();

  if (mock) {
    const categories = JSON.parse(localStorage.getItem("onyx_goods_categories") || "[]");
    const products   = JSON.parse(localStorage.getItem("onyx_goods_products")   || "[]");
    const orders     = JSON.parse(localStorage.getItem("onyx_goods_orders")     || "[]");
    const customers  = JSON.parse(localStorage.getItem("onyx_goods_customers")  || "[]");
    const coupons    = JSON.parse(localStorage.getItem("onyx_goods_coupons")    || "[]");
    const settings   = JSON.parse(localStorage.getItem("onyx_goods_settings")   || "{}");
    return { categories, products, orders, customers, coupons, settings };
  } else if (activeDb) {
    const [catSnap, prodSnap, ordSnap, custSnap, coupSnap, setDoc] = await Promise.all([
      activeDb.collection("categories").get(),
      activeDb.collection("products").get(),
      activeDb.collection("orders").orderBy("createdAt", "desc").get(),
      activeDb.collection("customers").get(),
      activeDb.collection("coupons").get(),
      activeDb.collection("settings").doc("store_settings").get()
    ]);
    const categories = catSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Category[];
    const products   = prodSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Product[];
    const orders     = ordSnap.docs.map(d => ({ id: d.id, ...d.data() })) as Order[];
    const customers  = custSnap.docs.map(d => ({ id: d.id, ...d.data() })) as unknown as Customer[];
    const coupons    = coupSnap.docs.map(d => ({ code: d.id, ...d.data() })) as unknown as Coupon[];
    const settings   = (setDoc.exists ? setDoc.data() : {}) as StoreSettings;
    return { categories, products, orders, customers, coupons, settings };
  }
  return { categories: [], products: [], orders: [], customers: [], coupons: [], settings: {} as StoreSettings };
}

export async function saveCategory(categoryData: Category): Promise<void> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();
  if (mock) {
    const categories = JSON.parse(localStorage.getItem("onyx_goods_categories") || "[]") as Category[];
    const idx = categories.findIndex(c => c.id === categoryData.id);
    if (idx > -1) {
      categories[idx] = categoryData;
    } else {
      categories.push(categoryData);
    }
    localStorage.setItem("onyx_goods_categories", JSON.stringify(categories));
  } else if (activeDb) {
    await activeDb.collection("categories").doc(categoryData.id).set(categoryData);
  }
}

export async function deleteCategory(id: string): Promise<void> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();
  if (mock) {
    let categories = JSON.parse(localStorage.getItem("onyx_goods_categories") || "[]") as Category[];
    categories = categories.filter(c => c.id !== id);
    localStorage.setItem("onyx_goods_categories", JSON.stringify(categories));
  } else if (activeDb) {
    await activeDb.collection("categories").doc(id).delete();
  }
}

export async function saveProduct(productData: Product): Promise<void> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();
  if (mock) {
    const products = JSON.parse(localStorage.getItem("onyx_goods_products") || "[]") as Product[];
    const idx = products.findIndex(p => p.id === productData.id);
    if (idx > -1) {
      products[idx] = productData;
    } else {
      products.push(productData);
    }
    localStorage.setItem("onyx_goods_products", JSON.stringify(products));
  } else if (activeDb) {
    await activeDb.collection("products").doc(productData.id).set(productData);
  }
}

export async function toggleProductStock(id: string, inStock: boolean): Promise<void> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();
  if (mock) {
    const products = JSON.parse(localStorage.getItem("onyx_goods_products") || "[]") as Product[];
    const idx = products.findIndex(p => p.id === id);
    if (idx > -1) {
      products[idx].inStock = inStock;
      localStorage.setItem("onyx_goods_products", JSON.stringify(products));
    }
  } else if (activeDb) {
    await activeDb.collection("products").doc(id).update({ inStock });
  }
}

export async function deleteProduct(id: string): Promise<void> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();
  if (mock) {
    let products = JSON.parse(localStorage.getItem("onyx_goods_products") || "[]") as Product[];
    products = products.filter(p => p.id !== id);
    localStorage.setItem("onyx_goods_products", JSON.stringify(products));
  } else if (activeDb) {
    await activeDb.collection("products").doc(id).delete();
  }
}

export async function saveCoupon(couponData: Coupon): Promise<void> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();
  if (mock) {
    const coupons = JSON.parse(localStorage.getItem("onyx_goods_coupons") || "[]") as Coupon[];
    const idx = coupons.findIndex(c => c.code === couponData.code);
    if (idx > -1) {
      coupons[idx] = couponData;
    } else {
      coupons.push(couponData);
    }
    localStorage.setItem("onyx_goods_coupons", JSON.stringify(coupons));
  } else if (activeDb) {
    await activeDb.collection("coupons").doc(couponData.code).set(couponData);
  }
}

export async function deleteCoupon(code: string): Promise<void> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();
  if (mock) {
    let coupons = JSON.parse(localStorage.getItem("onyx_goods_coupons") || "[]") as Coupon[];
    coupons = coupons.filter(c => c.code !== code);
    localStorage.setItem("onyx_goods_coupons", JSON.stringify(coupons));
  } else if (activeDb) {
    await activeDb.collection("coupons").doc(code).delete();
  }
}

export async function saveSettings(settingsData: StoreSettings): Promise<void> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();
  if (mock) {
    localStorage.setItem("onyx_goods_settings", JSON.stringify(settingsData));
  } else if (activeDb) {
    await activeDb.collection("settings").doc("store_settings").set(settingsData);
  }
}

export async function updateOrderStatus(orderId: string, status: string): Promise<void> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();
  if (mock) {
    const orders = JSON.parse(localStorage.getItem("onyx_goods_orders") || "[]") as Order[];
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx > -1) {
      orders[idx].status = status as Order['status'];
      localStorage.setItem("onyx_goods_orders", JSON.stringify(orders));
    }
  } else if (activeDb) {
    await activeDb.collection("orders").doc(orderId).update({ status });
  }
}

export async function updateOrderPaymentStatus(orderId: string, paymentStatus: string): Promise<void> {
  const { db: activeDb, isMockMode: mock } = getDbConnection();
  if (mock) {
    const orders = JSON.parse(localStorage.getItem("onyx_goods_orders") || "[]") as Order[];
    const idx = orders.findIndex(o => o.id === orderId);
    if (idx > -1) {
      orders[idx].paymentStatus = paymentStatus;
      localStorage.setItem("onyx_goods_orders", JSON.stringify(orders));
    }
  } else if (activeDb) {
    await activeDb.collection("orders").doc(orderId).update({ paymentStatus });
  }
}

// Auth wrappers
export async function adminLogin(email: string, password: string): Promise<{ user: { email: string | null } }> {
  const { isMockMode: mock } = getDbConnection();
  if (mock) {
    if (email === "onyxsupport36@gmail.com" && (password === "Eusuf#" || password === "Admin123456")) {
      sessionStorage.setItem("onyx_goods_admin_logged", "true");
      return { user: { email } };
    } else {
      throw new Error("Invalid testing credentials.");
    }
  } else {
    const userCredential = await firebase.auth().signInWithEmailAndPassword(email, password);
    return { user: { email: userCredential.user?.email || null } };
  }
}

export function adminLogout(): void {
  const { isMockMode: mock } = getDbConnection();
  if (mock) {
    sessionStorage.removeItem("onyx_goods_admin_logged");
  } else {
    firebase.auth().signOut().catch(console.error);
  }
}

export function checkAdminSession(callback: (email: string | null) => void): void {
  const { isMockMode: mock } = getDbConnection();
  if (mock) {
    const logged = sessionStorage.getItem("onyx_goods_admin_logged") === "true";
    if (logged) {
      callback("onyxsupport36@gmail.com");
    } else {
      callback(null);
    }
  } else {
    firebase.auth().onAuthStateChanged((user) => {
      if (user) {
        callback(user.email);
      } else {
        callback(null);
      }
    });
  }
}
