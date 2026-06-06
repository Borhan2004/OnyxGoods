'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getCart, clearCart } from '@/lib/cart';
import { placeOrder } from '@/lib/db';
import { CartItem, Coupon, Order } from '@/types';

export default function CheckoutPage() {
  const { currentLang, t, translateNumber } = useLanguage();
  const router = useRouter();

  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [activeUser, setActiveUser] = useState<{ name?: string; phone?: string; whatsapp?: string; email?: string; address?: string; district?: string } | null>(null);
  
  // Billing Form State
  const [name, setName] = useState<string>('');
  const [phone, setPhone] = useState<string>('');
  const [whatsapp, setWhatsapp] = useState<string>('');
  const [email, setEmail] = useState<string>('');
  const [address, setAddress] = useState<string>('');
  const [district, setDistrict] = useState<string>('Dhaka');
  const [notes, setNotes] = useState<string>('');
  const [paymentMethod, setPaymentMethod] = useState<'Cash' | 'bKash' | 'Nagad'>('Cash');
  const [appliedCoupon, setAppliedCoupon] = useState<Coupon | null>(null);
  const [submitting, setSubmitting] = useState<boolean>(false);

  // Load cart, user, coupon details
  useEffect(() => {
    const cart = getCart();
    setCartItems(cart);

    if (cart.length === 0) {
      router.push('/shop');
      return;
    }

    const user = JSON.parse(localStorage.getItem("onyx_goods_logged_user") || "null");
    if (user) {
      setActiveUser(user);
      setName(user.name || '');
      setPhone(user.phone || '');
      setWhatsapp(user.whatsapp || '');
      setEmail(user.email || '');
      setAddress(user.address || '');
      if (user.district) setDistrict(user.district);
    } else {
      setEmail('guest@onyxgoods.com');
    }

    const coup = localStorage.getItem("onyx_goods_applied_coupon");
    if (coup) {
      setAppliedCoupon(JSON.parse(coup));
    }
  }, [router]);

  // Pricing calculations
  const subtotal = cartItems.reduce((sum, item) => {
    const price = item.discountPrice > 0 && item.discountPrice < item.price ? item.discountPrice : item.price;
    return sum + (price * item.quantity);
  }, 0);

  const shippingCharge = (district === 'Dhaka') ? 60 : 120;

  let discount = 0;
  if (appliedCoupon) {
    if (appliedCoupon.type === 'percentage') {
      discount = Math.round(subtotal * (appliedCoupon.value / 100));
    } else if (appliedCoupon.type === 'fixed') {
      discount = appliedCoupon.value;
    }
  }

  const finalTotal = Math.max(0, subtotal - discount + shippingCharge);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!name.trim() || !phone.trim() || !address.trim()) {
      window.dispatchEvent(new CustomEvent('show_onyx_toast', {
        detail: { message: t('toast-fields-req'), isError: true }
      }));
      return;
    }

    setSubmitting(true);

    const orderId = "SHK_" + Math.random().toString(36).substr(2, 9).toUpperCase();
    const orderData: Order = {
      id: orderId,
      customerEmail: email || "guest@onyxgoods.com",
      name: name.trim(),
      phone: phone.trim(),
      whatsapp: whatsapp.trim() || phone.trim(),
      address: address.trim(),
      district: district,
      notes: notes.trim(),
      items: cartItems,
      product: cartItems.map(i => `${i.nameEn} (x${i.quantity})`).join(", "),
      quantity: cartItems.reduce((sum, i) => sum + i.quantity, 0),
      subtotal: subtotal,
      discount: discount,
      deliveryCharge: shippingCharge,
      total: finalTotal,
      couponCode: appliedCoupon ? appliedCoupon.code : "",
      paymentMethod: paymentMethod,
      paymentStatus: (paymentMethod === 'Cash') ? 'Unpaid' : 'Paid',
      status: 'Pending',
      createdAt: new Date().toISOString()
    };

    try {
      const res = await placeOrder(orderData);
      if (res.success) {
        window.dispatchEvent(new CustomEvent('show_onyx_toast', {
          detail: { message: t('toast-order-success'), isError: false }
        }));

        sendWhatsAppInvoice(orderData);

        clearCart();
        localStorage.removeItem("onyx_goods_applied_coupon");

        setTimeout(() => {
          router.push('/account');
        }, 1500);
      } else {
        throw new Error("Failed to save order");
      }
    } catch (err) {
      console.error(err);
      window.dispatchEvent(new CustomEvent('show_onyx_toast', {
        detail: { message: t('toast-order-failed'), isError: true }
      }));
      setSubmitting(false);
    }
  };

  const sendWhatsAppInvoice = (order: Order) => {
    const num = "8801302101024";
    const displayTotal = translateNumber(order.total.toString());
    
    let msg = `Hello OnyxGoods! 🌿\nI just placed a new order on your premium marketplace:\n━━━━━━━━━━━━━━━━━━━━\n*Order ID*: ${order.id}\n*Name*: ${order.name}\n*Phone*: ${order.phone}\n*District*: ${order.district}\n*Address*: ${order.address}\n━━━━━━━━━━━━━━━━━━━━\n*Items Sourced*:\n`;

    order.items.forEach(item => {
      const nameVal = currentLang === 'en' ? item.nameEn : item.nameBn;
      const unitVal = currentLang === 'en' ? item.unitEn : item.unitBn;
      msg += `- ${nameVal} (x${item.quantity} ${unitVal})\n`;
    });

    msg += `━━━━━━━━━━━━━━━━━━━━\n*Payment Method*: ${order.paymentMethod}\n*Total Paid/Due*: BDT ${displayTotal}\n━━━━━━━━━━━━━━━━━━━━\nPlease confirm my packaging slot. Thank you!`;

    window.open(`https://wa.me/${num}?text=${encodeURIComponent(msg)}`, "_blank");
  };

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px 80px' }}>
      <h1 style={{ fontSize: '2.5rem', marginBottom: '32px', color: 'var(--dark-brown)' }}>
        {currentLang === 'en' ? 'Checkout & Billing' : 'চেকআউট ও পেমেন্ট'}
      </h1>

      <div className="checkout-container">
        
        {/* Left: Billing Form */}
        <section className="checkout-card">
          <h3 className="checkout-section-title" style={{ marginTop: 0 }}>
            {currentLang === 'en' ? 'Billing Details' : 'বিলিং তথ্য'}
          </h3>

          <form onSubmit={handleSubmit} style={{ display: 'grid', gap: '20px' }}>
            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>{currentLang === 'en' ? 'Full Name *' : 'পূর্ণ নাম *'}</label>
              <input 
                type="text" 
                className="lang-btn" 
                style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '45px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 16px', width: '100%', boxSizing: 'border-box' }}
                value={name}
                onChange={(e) => setName(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '20px' }}>
              <div style={{ display: 'grid', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>{currentLang === 'en' ? 'Contact Phone *' : 'ফোন নম্বর *'}</label>
                <input 
                  type="tel" 
                  className="lang-btn" 
                  style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '45px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 16px', width: '100%', boxSizing: 'border-box' }}
                  value={phone}
                  onChange={(e) => setPhone(e.target.value)}
                  required
                />
              </div>

              <div style={{ display: 'grid', gap: '8px' }}>
                <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>{currentLang === 'en' ? 'WhatsApp Number' : 'হোয়াটসঅ্যাপ নম্বর'}</label>
                <input 
                  type="tel" 
                  className="lang-btn" 
                  style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '45px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 16px', width: '100%', boxSizing: 'border-box' }}
                  value={whatsapp}
                  placeholder={phone || (currentLang === 'en' ? 'Same as Phone' : 'ফোনের মতোই')}
                  onChange={(e) => setWhatsapp(e.target.value)}
                />
              </div>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>{currentLang === 'en' ? 'Delivery Area *' : 'ডেলিভারি এলাকা *'}</label>
              <select 
                value={district}
                onChange={(e) => setDistrict(e.target.value)}
                style={{ height: '45px', borderRadius: '8px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 12px', fontSize: '0.95rem', background: '#fff', cursor: 'pointer', fontFamily: "'Outfit', sans-serif" }}
              >
                <option value="Dhaka">{currentLang === 'en' ? 'Inside Dhaka City' : 'ঢাকা সিটির ভেতরে'}</option>
                <option value="Outside">{currentLang === 'en' ? 'Outside Dhaka City' : 'ঢাকা সিটির বাইরে'}</option>
              </select>
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>{currentLang === 'en' ? 'Delivery Address *' : 'ডেলিভারি ঠিকানা *'}</label>
              <textarea 
                rows={3}
                className="lang-btn"
                style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', border: '1px solid hsla(0,0%,0%,0.15)', padding: '12px 16px', width: '100%', boxSizing: 'border-box', height: 'auto', fontFamily: 'inherit' }}
                value={address}
                onChange={(e) => setAddress(e.target.value)}
                required
              />
            </div>

            <div style={{ display: 'grid', gap: '8px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.9rem' }}>{currentLang === 'en' ? 'Order Notes (Optional)' : 'অর্ডার নোট (ঐচ্ছিক)'}</label>
              <textarea 
                rows={2}
                className="lang-btn"
                style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', border: '1px solid hsla(0,0%,0%,0.15)', padding: '12px 16px', width: '100%', boxSizing: 'border-box', height: 'auto', fontFamily: 'inherit' }}
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                placeholder={currentLang === 'en' ? 'E.g. preferences, specific delivery instruction...' : 'যেমন: ডেলিভারি নিয়ে বিশেষ নির্দেশনা...'}
              />
            </div>

            {/* Payment Options */}
            <div style={{ marginTop: '16px' }}>
              <label style={{ fontWeight: '600', fontSize: '0.95rem', display: 'block', marginBottom: '14px' }}>
                {currentLang === 'en' ? 'Select Payment Method' : 'পেমেন্ট পদ্ধতি নির্বাচন করুন'}
              </label>
              <div className="payment-methods-grid">
                <div 
                  onClick={() => setPaymentMethod('Cash')}
                  className={`payment-card ${paymentMethod === 'Cash' ? 'active' : ''}`}
                >
                  <div className="payment-card-logo">💵</div>
                  <strong className="payment-card-name">
                    {currentLang === 'en' ? 'Cash on Delivery' : 'ক্যাশ অন ডেলিভারি'}
                  </strong>
                </div>

                <div 
                  onClick={() => setPaymentMethod('bKash')}
                  className={`payment-card ${paymentMethod === 'bKash' ? 'active' : ''}`}
                >
                  <div className="payment-card-logo">📱</div>
                  <strong className="payment-card-name">bKash</strong>
                </div>

                <div 
                  onClick={() => setPaymentMethod('Nagad')}
                  className={`payment-card ${paymentMethod === 'Nagad' ? 'active' : ''}`}
                >
                  <div className="payment-card-logo">📱</div>
                  <strong className="payment-card-name">Nagad</strong>
                </div>
              </div>

              {/* Dynamic Payment Method Notes */}
              <div style={{ marginTop: '16px', padding: '14px', background: 'rgba(0,0,0,0.03)', borderRadius: '8px', borderLeft: '3px solid var(--gold)', display: 'block' }}>
                {paymentMethod === 'Cash' ? (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    {currentLang === 'en' ? 'Pay with cash upon delivery of package.' : 'পণ্য ডেলিভারি পাওয়ার পর সম্পূর্ণ মূল্য পরিশোধ করুন।'}
                  </p>
                ) : (
                  <p style={{ fontSize: '0.85rem', color: 'var(--text-muted)', margin: 0 }}>
                    {currentLang === 'en'
                      ? `Please send the total order amount of BDT ${translateNumber(finalTotal.toString())} to 01947-528890 (Personal Account) via Send Money. Paste your transaction reference ID in order notes or share on WhatsApp.`
                      : `দয়া করে মোট অর্ডার মূল্য ৳${translateNumber(finalTotal.toString())} টাকা ০১৯৪৭-৫২৮৮৯০ (পার্সোনাল নম্বর) এ Send Money করুন। ট্রানজেকশন আইডি নোট বক্সে অথবা হোয়াটস্যাপ ইনভয়েসে উল্লেখ করুন।`}
                  </p>
                )}
              </div>
            </div>

            <button 
              type="submit" 
              className="btn-primary" 
              disabled={submitting}
              style={{ width: '100%', boxSizing: 'border-box', justifyContent: 'center', padding: '16px', marginTop: '10px' }}
            >
              {submitting ? (currentLang === 'en' ? 'Processing Order...' : 'অর্ডার প্রসেস হচ্ছে...') : t('btn-place-order')}
            </button>
          </form>
        </section>

        {/* Right: Order Details Summary */}
        <section className="checkout-card">
          <h3 className="checkout-section-title" style={{ marginTop: 0 }}>
            {currentLang === 'en' ? 'Item Details' : 'অর্ডার আইটেম'}
          </h3>

          <div className="checkout-summary-list">
            {cartItems.map(item => {
              const singlePrice = item.discountPrice > 0 && item.discountPrice < item.price ? item.discountPrice : item.price;
              return (
                <div key={item.productId} className="checkout-summary-item">
                  <div style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
                    <img src={item.imagePath || '/logo.jpg'} style={{ width: '50px', height: '50px', objectFit: 'cover', borderRadius: '6px' }} alt={item.nameEn} />
                    <div>
                      <div className="checkout-summary-name">
                        {currentLang === 'en' ? item.nameEn : item.nameBn}
                      </div>
                      <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>
                        ৳{translateNumber(singlePrice)} x {translateNumber(item.quantity.toString())} {currentLang === 'en' ? item.unitEn : item.unitBn}
                      </div>
                    </div>
                  </div>
                  <strong style={{ alignSelf: 'center' }}>
                    ৳{translateNumber(singlePrice * item.quantity)}
                  </strong>
                </div>
              );
            })}
          </div>

          <div style={{ display: 'grid', gap: '12px', borderTop: '1px solid hsla(0,0%,0%,0.08)', paddingTop: '20px', fontSize: '0.95rem' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('lbl-subtotal')}</span>
              <strong>৳{translateNumber(subtotal)}</strong>
            </div>

            {discount > 0 && (
              <div style={{ display: 'flex', justifyContent: 'space-between', color: 'green' }}>
                <span>{t('lbl-discount')}</span>
                <strong>-৳{translateNumber(discount)}</strong>
              </div>
            )}

            <div style={{ display: 'flex', justifyContent: 'space-between' }}>
              <span style={{ color: 'var(--text-muted)' }}>{t('lbl-shipping')}</span>
              <strong>৳{translateNumber(shippingCharge)}</strong>
            </div>

            <div style={{ borderTop: '1px solid hsla(0,0%,0%,0.08)', paddingTop: '16px', display: 'flex', justifyContent: 'space-between', fontSize: '1.25rem' }}>
              <span style={{ color: 'var(--dark-brown)', fontWeight: '700' }}>{t('lbl-total')}</span>
              <strong style={{ color: 'var(--brown)' }}>৳{translateNumber(finalTotal)}</strong>
            </div>
          </div>
        </section>

      </div>
    </main>
  );
}
