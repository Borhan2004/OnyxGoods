export interface Category {
  id: string;
  nameEn: string;
  nameBn: string;
  descriptionEn?: string;
  descriptionBn?: string;
  imagePath: string;
  status: string;
  createdAt?: string;
}

export interface Product {
  id: string;
  categoryId: string;
  nameEn: string;
  nameBn: string;
  descEn: string;
  descBn: string;
  benefitsEn: string[];
  benefitsBn: string[];
  price: number;
  discountPrice: number;
  stock: number;
  unitEn: string;
  unitBn: string;
  badgeEn: string;
  badgeBn: string;
  imagePath: string;
  inStock: boolean;
  isFeatured: boolean;
  createdAt: string;
}

export interface CartItem {
  productId: string;
  nameEn: string;
  nameBn: string;
  price: number;
  discountPrice: number;
  unitEn: string;
  unitBn: string;
  imagePath: string;
  quantity: number;
  categoryId: string;
}

export interface Order {
  id: string;
  customerEmail: string;
  name: string;
  phone: string;
  whatsapp: string;
  address: string;
  district: string;
  notes?: string;
  items: CartItem[];
  product: string; // Summarized list of products
  quantity: number;
  subtotal: number;
  discount: number;
  deliveryCharge: number;
  total: number;
  couponCode: string;
  paymentMethod: string;
  paymentStatus: string;
  status: 'Pending' | 'Confirmed' | 'Delivered' | 'Cancelled';
  createdAt: string;
}

export interface Coupon {
  code: string;
  type: 'percentage' | 'fixed';
  value: number;
  expiryDate: string;
  status: string;
}

export interface StoreSettings {
  logoUrl: string;
  contactEmail: string;
  contactPhone: string;
  whatsappNumber: string;
  deliveryChargeDhaka: number;
  deliveryChargeOutside: number;
  socialLinks?: {
    facebook?: string;
    instagram?: string;
  };
}

export interface Customer {
  name: string;
  phone: string;
  whatsapp: string;
  email: string;
  address: string;
  district: string;
  lastOrderAt?: string;
}
