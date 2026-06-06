import { CartItem, Product } from '@/types';

export function getCart(): CartItem[] {
  if (typeof window === 'undefined') return [];
  return JSON.parse(localStorage.getItem("onyx_goods_cart") || "[]");
}

export function saveCart(cart: CartItem[]): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem("onyx_goods_cart", JSON.stringify(cart));
  // Notify other components (Navbar, Mobile Nav)
  window.dispatchEvent(new Event('onyx_cart_updated'));
}

export function addToCart(product: Product, qty: number = 1, showToastFn?: (success: boolean) => void): void {
  if (typeof window === 'undefined') return;
  const cart = getCart();
  const existing = cart.find(item => item.productId === product.id);

  if (existing) {
    existing.quantity += qty;
  } else {
    cart.push({
      productId: product.id,
      nameEn: product.nameEn,
      nameBn: product.nameBn,
      price: product.price,
      discountPrice: product.discountPrice || 0,
      unitEn: product.unitEn,
      unitBn: product.unitBn,
      imagePath: product.imagePath || "",
      quantity: qty,
      categoryId: product.categoryId
    });
  }

  saveCart(cart);
  if (showToastFn) {
    showToastFn(true);
  }
}

export function updateCartQty(productId: string, qty: number): void {
  const cart = getCart();
  const item = cart.find(item => item.productId === productId);
  if (item) {
    item.quantity = Math.max(1, qty);
    saveCart(cart);
  }
}

export function removeFromCart(productId: string): void {
  let cart = getCart();
  cart = cart.filter(item => item.productId !== productId);
  saveCart(cart);
}

export function clearCart(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem("onyx_goods_cart");
  saveCart([]);
}
