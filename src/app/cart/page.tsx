'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { getCart, updateCartQty, removeFromCart } from '@/lib/cart';
import { loadCatalogData } from '@/lib/db';
import { CartItem, Coupon } from '@/types';

export default function CartPage() {
  const { currentLang, t, translateNumber } = useLanguage();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [couponInput, setCouponInput] = useState<string>('');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);

  // Load cart items and coupon catalog
  useEffect(() => {
    const loadData = async () => {
      setCartItems(getCart());
      try {
        const catalog = await loadCatalogData();
        setCoupons(catalog.coupons);
      } catch (e) {
        console.error("Failed to load coupons in cart:", e);
      }

      // Check for previously applied coupon
      const savedCoupon = localStorage.getItem("onyx_goods_applied_coupon");
      if (savedCoupon) {
        setAppliedCoupon(JSON.parse(savedCoupon));
      }
    };
    loadData();

    const handleCartChange = () => {
      setCartItems(getCart());
    };
    window.addEventListener('onyx_cart_updated', handleCartChange);
    return () => {
      window.removeEventListener('onyx_cart_updated', handleCartChange);
    };
  }, []);

  const handleQtyUpdate = (productId: string, newQty: number) => {
    updateCartQty(productId, newQty);
  };

  const handleRemove = (productId: string) => {
    removeFromCart(productId);
    window.dispatchEvent(new CustomEvent('show_onyx_toast', {
      detail: { message: t('toast-cart-removed'), isError: false }
    }));
  };

  const handleApplyCoupon = (e: React.FormEvent) => {
    e.preventDefault();
    if (!couponInput.trim()) return;

    const code = couponInput.trim();
    const found = coupons.find(c => c.code.toLowerCase() === code.toLowerCase() && c.status === 'Active');

    if (found) {
      // Check expiry date
      const expiry = new Date(found.expiryDate);
      const today = new Date();
      if (expiry < today) {
        window.dispatchEvent(new CustomEvent('show_onyx_toast', {
          detail: { message: t('toast-coupon-invalid'), isError: true }
        }));
        return;
      }

      setAppliedCoupon(found);
      localStorage.setItem("onyx_goods_applied_coupon", JSON.stringify(found));
      setCouponInput('');
      window.dispatchEvent(new CustomEvent('show_onyx_toast', {
        detail: { message: t('toast-coupon-success'), isError: false }
      }));
    } else {
      window.dispatchEvent(new CustomEvent('show_onyx_toast', {
        detail: { message: t('toast-coupon-invalid'), isError: true }
      }));
    }
  };

  const handleRemoveCoupon = () => {
    setAppliedCoupon(null);
    localStorage.removeItem("onyx_goods_applied_coupon");
  };

  // Calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.discountPrice > 0 && item.discountPrice < item.price ? item.discountPrice : item.price;
    return sum + (price * item.quantity);
  }, 0);

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = Math.round(subtotal * (appliedCoupon.value / 100));
    } else if (appliedCoupon.type === 'fixed') {
      discount = appliedCoupon.value;
    }
  }

  const finalTotal = Math.max(0, subtotal - discount);

  if (cartItems.length === 0) {
    return (
      <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px 80px' }}>
        <h1 style={{ fontSize: '2.5rem', marginBottom: '32px', color: 'var(--dark-brown)' }}>
          {currentLang === 'en' ? 'Shopping Cart' : 'শপিং কার্ট'}
        </h1>
        <div className="cart-container" style={{ gridTemplateColumns: '1fr' }}>
          <div className="cart-empty">
            <div className="cart-empty-icon">🛒</div>
            <h3>{t('lbl-cart-empty')}</h3>
            <p>{t('lbl-cart-empty-text')}</p>
            <Link href="/shop" className="btn-primary" style={{ display: 'inline-flex', width: 'auto', margin: '0 auto' }}>
              {t('btn-shop-now')}
            </Link>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px 80px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '32px', color: 'var(--dark-brown)' }}>
        {currentLang === 'en' ? 'Shopping Cart' : 'শপিং কার্ট'}
      </h1>

      <div className="cart-container">
        
        {/* Left Side: Items list */}
        <div className="cart-list-wrapper">
          <div className="cart-header-row">
            <div>{currentLang === 'en' ? 'Product' : 'পণ্য'}</div>
            <div>{currentLang === 'en' ? 'Price' : 'মূল্য'}</div>
            <div>{currentLang === 'en' ? 'Qty' : 'পরিমাণ'}</div>
            <div style={{ textAlign: 'right' }}>{currentLang === 'en' ? 'Subtotal' : 'উপমোট'}</div>
          </div>

          {cartItems.map(item => {
            const hasDiscount = item.discountPrice > 0 && item.discountPrice < item.price;
            const singlePrice = hasDiscount ? item.discountPrice : item.price;
            const rowTotal = singlePrice * item.quantity;

            return (
              <div key={item.productId} className="cart-item-row">
                <div className="cart-item-info">
                  <div className="cart-item-img">
                    <img src={item.imagePath || '/logo.jpg'} alt={item.nameEn} />
                  </div>
                  <div className="cart-item-meta">
                    <Link href={`/product?id=${item.productId}`} className="cart-item-name">
                      {currentLang === 'en' ? item.nameEn : item.nameBn}
                    </Link>
                    <span className="cart-item-unit">
                      {currentLang === 'en' ? 'Unit:' : 'একক:'} {currentLang === 'en' ? item.unitEn : item.unitBn}
                    </span>
                  </div>
                </div>

                <div className="cart-item-price">
                  ৳{translateNumber(singlePrice)}
                </div>

                <div>
                  <div className="quantity-box" style={{ width: 'fit-content' }}>
                    <button onClick={() => handleQtyUpdate(item.productId, item.quantity - 1)}>-</button>
                    <input type="text" readOnly value={translateNumber(item.quantity.toString())} />
                    <button onClick={() => handleQtyUpdate(item.productId, item.quantity + 1)}>+</button>
                  </div>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', gap: '12px' }}>
                  <span className="cart-item-subtotal">
                    ৳{translateNumber(rowTotal)}
                  </span>
                  <button 
                    className="cart-item-remove" 
                    onClick={() => handleRemove(item.productId)}
                    title={currentLang === 'en' ? 'Remove Item' : 'পণ্য সরান'}
                  >
                    🗑️
                  </button>
                </div>
              </div>
            );
          })}

          <div className="cart-actions">
            <Link href="/shop" className="btn-outline">
              {currentLang === 'en' ? '← Continue Shopping' : '← কেনাকাটা চালিয়ে যান'}
            </Link>
          </div>
        </div>

        {/* Right Side: Summary and Coupon */}
        <div className="cart-summary-wrapper">
          <div className="cart-coupon-box">
            <h4 style={{ color: 'var(--dark-brown)', fontWeight: '700', fontSize: '1rem', marginBottom: '8px' }}>
              {currentLang === 'en' ? 'Have a Coupon?' : 'কুপন কোড আছে?'}
            </h4>
            {appliedCoupon ? (
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', background: 'var(--gold-pale)', border: '1px dashed var(--gold)', borderRadius: '8px', padding: '10px 14px' }}>
                <div>
                  <span style={{ fontSize: '0.8rem', fontWeight: '700', textTransform: 'uppercase', color: 'var(--brown)', display: 'block' }}>
                    {currentLang === 'en' ? 'Coupon Applied' : 'কুপন কোড'}
                  </span>
                  <span style={{ fontSize: '0.9rem', fontWeight: '600' }}>{appliedCoupon.code}</span>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginLeft: '6px' }}>
                    (-{appliedCoupon.type === 'percentage' ? `${translateNumber(appliedCoupon.value)}%` : `৳${translateNumber(appliedCoupon.value)}`})
                  </span>
                </div>
                <button 
                  onClick={handleRemoveCoupon}
                  style={{ background: 'none', border: 'none', color: 'red', fontWeight: 'bold', cursor: 'pointer', fontSize: '0.9rem' }}
                >
                  {currentLang === 'en' ? 'Remove' : 'বাদ দিন'}
                </button>
              </div>
            ) : (
              <form onSubmit={handleApplyCoupon} className="coupon-form">
                <input 
                  type="text" 
                  placeholder={currentLang === 'en' ? 'Enter code' : 'কুপন কোড দিন'}
                  value={couponInput}
                  onChange={(e) => setCouponInput(e.target.value)}
                />
                <button type="submit">{t('btn-apply')}</button>
              </form>
            )}
          </div>

          <div className="cart-summary-card">
            <h3 className="summary-title">{currentLang === 'en' ? 'Order Summary' : 'অর্ডার সারসংক্ষেপ'}</h3>
            
            <div className="summary-line">
              <span>{t('lbl-subtotal')}</span>
              <strong>৳{translateNumber(subtotal)}</strong>
            </div>

            {discount > 0 && (
              <div className="summary-line" style={{ color: 'var(--green)' }}>
                <span>{t('lbl-discount')}</span>
                <strong>-৳{translateNumber(discount)}</strong>
              </div>
            )}

            <div className="summary-line total">
              <span>{t('lbl-total')}</span>
              <strong>৳{translateNumber(finalTotal)}</strong>
            </div>

            <Link href="/checkout" className="btn-primary btn-checkout">
              {t('btn-checkout')}
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
