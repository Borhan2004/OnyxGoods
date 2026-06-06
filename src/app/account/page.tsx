'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { fetchCustomerOrders } from '@/lib/db';
import { Order } from '@/types';

interface UserSession {
  name?: string;
  email: string;
  phone?: string;
  district?: string;
  address?: string;
  password?: string;
}

export default function AccountPage() {
  const { currentLang, t, translateNumber } = useLanguage();

  // Authentication State
  const [activeUser, setActiveUser] = useState<UserSession | null>(null);
  const [authTab, setAuthTab] = useState<'signin' | 'signup'>('signin');
  
  // Login Form
  const [loginEmail, setLoginEmail] = useState<string>('');
  const [loginPassword, setLoginPassword] = useState<string>('');

  // Register Form
  const [regName, setRegName] = useState<string>('');
  const [regEmail, setRegEmail] = useState<string>('');
  const [regPhone, setRegPhone] = useState<string>('');
  const [regDistrict, setRegDistrict] = useState<string>('Dhaka');
  const [regAddress, setRegAddress] = useState<string>('');
  const [regPassword, setRegPassword] = useState<string>('');

  // Dashboard State
  const [activeSection, setActiveSection] = useState<'profile' | 'orders'>('profile');
  const [orders, setOrders] = useState<Order[]>([]);
  const [ordersLoading, setOrdersLoading] = useState<boolean>(false);

  // Profile Settings
  const [profName, setProfName] = useState<string>('');
  const [profPhone, setProfPhone] = useState<string>('');
  const [profDistrict, setProfDistrict] = useState<string>('Dhaka');
  const [profAddress, setProfAddress] = useState<string>('');

  // Load user session on mount
  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("onyx_goods_logged_user") || "null");
    if (user) {
      setActiveUser(user);
      setProfName(user.name || '');
      setProfPhone(user.phone || '');
      setProfDistrict(user.district || 'Dhaka');
      setProfAddress(user.address || '');
    }
  }, []);

  // Fetch orders when "orders" tab is selected
  useEffect(() => {
    if (activeUser && activeSection === 'orders') {
      const loadOrders = async () => {
        setOrdersLoading(true);
        try {
          const res = await fetchCustomerOrders(activeUser.email);
          res.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
          setOrders(res);
        } catch (e) {
          console.error("Failed to load customer orders:", e);
        } finally {
          setOrdersLoading(false);
        }
      };
      loadOrders();
    }
  }, [activeUser, activeSection]);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    if (!loginEmail || !loginPassword) return;

    const users = JSON.parse(localStorage.getItem("onyx_goods_users") || "[]") as UserSession[];
    const found = users.find(u => u.email.toLowerCase() === loginEmail.trim().toLowerCase() && u.password === loginPassword);

    if (found) {
      localStorage.setItem("onyx_goods_logged_user", JSON.stringify(found));
      setActiveUser(found);
      setProfName(found.name || '');
      setProfPhone(found.phone || '');
      setProfDistrict(found.district || 'Dhaka');
      setProfAddress(found.address || '');

      window.dispatchEvent(new CustomEvent('show_onyx_toast', {
        detail: { message: t('toast-login-success'), isError: false }
      }));
      window.dispatchEvent(new Event('onyx_cart_updated'));
    } else {
      window.dispatchEvent(new CustomEvent('show_onyx_toast', {
        detail: { message: t('toast-auth-failed'), isError: true }
      }));
    }
  };

  const handleRegister = (e: React.FormEvent) => {
    e.preventDefault();
    if (!regName || !regEmail || !regPhone || !regAddress || !regPassword) {
      window.dispatchEvent(new CustomEvent('show_onyx_toast', {
        detail: { message: t('toast-fields-req'), isError: true }
      }));
      return;
    }

    const newUser: UserSession = {
      name: regName.trim(),
      email: regEmail.trim().toLowerCase(),
      phone: regPhone.trim(),
      district: regDistrict,
      address: regAddress.trim(),
      password: regPassword
    };

    const users = JSON.parse(localStorage.getItem("onyx_goods_users") || "[]") as UserSession[];
    if (users.find(u => u.email === newUser.email)) {
      window.dispatchEvent(new CustomEvent('show_onyx_toast', {
        detail: { message: currentLang === 'en' ? 'Email already registered.' : 'এই ইমেইলটি ইতিপূর্বে নিবন্ধিত হয়েছে।', isError: true }
      }));
      return;
    }

    users.push(newUser);
    localStorage.setItem("onyx_goods_users", JSON.stringify(users));
    localStorage.setItem("onyx_goods_logged_user", JSON.stringify(newUser));

    setActiveUser(newUser);
    setProfName(newUser.name || '');
    setProfPhone(newUser.phone || '');
    setProfDistrict(newUser.district || 'Dhaka');
    setProfAddress(newUser.address || '');

    window.dispatchEvent(new CustomEvent('show_onyx_toast', {
      detail: { message: t('toast-register-success'), isError: false }
    }));
    window.dispatchEvent(new Event('onyx_cart_updated'));

    // Clear form
    setRegName('');
    setRegEmail('');
    setRegPhone('');
    setRegAddress('');
    setRegPassword('');
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    if (!profName || !profPhone || !profAddress || !activeUser) {
      window.dispatchEvent(new CustomEvent('show_onyx_toast', {
        detail: { message: t('toast-fields-req'), isError: true }
      }));
      return;
    }

    const updatedUser: UserSession = {
      ...activeUser,
      name: profName.trim(),
      phone: profPhone.trim(),
      district: profDistrict,
      address: profAddress.trim()
    };

    localStorage.setItem("onyx_goods_logged_user", JSON.stringify(updatedUser));
    setActiveUser(updatedUser);

    const users = JSON.parse(localStorage.getItem("onyx_goods_users") || "[]") as UserSession[];
    const idx = users.findIndex(u => u.email === activeUser.email);
    if (idx > -1) {
      users[idx] = { ...users[idx], ...updatedUser };
      localStorage.setItem("onyx_goods_users", JSON.stringify(users));
    }

    window.dispatchEvent(new CustomEvent('show_onyx_toast', {
      detail: { message: currentLang === 'en' ? 'Profile saved successfully!' : 'প্রোফাইল সফলভাবে সংরক্ষণ করা হয়েছে!', isError: false }
    }));
    window.dispatchEvent(new Event('onyx_cart_updated'));
  };

  const handleLogout = () => {
    localStorage.removeItem("onyx_goods_logged_user");
    setActiveUser(null);
    window.dispatchEvent(new Event('onyx_cart_updated'));
  };

  // NOT LOGGED IN
  if (!activeUser) {
    return (
      <main className="auth-page-container">
        {authTab === 'signin' ? (
          <div className="auth-page-card">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--dark-brown)', fontSize: '1.6rem', marginBottom: '10px' }}>
              {currentLang === 'en' ? 'Sign In' : 'লগইন করুন'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
              {currentLang === 'en' ? 'Welcome back to OnyxGoods. Sign in to track your orders.' : 'OnyxGoods-এ আপনাকে স্বাগতম। আপনার অর্ডার ট্র্যাক করতে লগইন করুন।'}
            </p>
            
            <form onSubmit={handleLogin}>
              <div style={{ marginBottom: '12px', display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>{currentLang === 'en' ? 'Email Address' : 'ইমেইল অ্যাড্রেস'}</label>
                <input 
                  type="email" 
                  className="lang-btn"
                  style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '42px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 12px', width: '100%', boxSizing: 'border-box' }}
                  placeholder="e.g. user@onyxgoods.com"
                  value={loginEmail}
                  onChange={(e) => setLoginEmail(e.target.value)}
                  required 
                />
              </div>
              <div style={{ marginBottom: '16px', display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>{currentLang === 'en' ? 'Password' : 'পাসওয়ার্ড'}</label>
                <input 
                  type="password" 
                  className="lang-btn"
                  style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '42px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 12px', width: '100%', boxSizing: 'border-box' }}
                  placeholder="••••••••"
                  value={loginPassword}
                  onChange={(e) => setLoginPassword(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', margin: 0 }}>
                {currentLang === 'en' ? 'Login' : 'লগইন'}
              </button>
            </form>
            
            <div className="auth-toggle-tip">
              {currentLang === 'en' ? 'New to OnyxGoods?' : 'শিকড়ে নতুন?'}{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthTab('signup'); }}>
                {currentLang === 'en' ? 'Register Account' : 'নতুন অ্যাকাউন্ট খুলুন'}
              </a>
            </div>
          </div>
        ) : (
          <div className="auth-page-card">
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--dark-brown)', fontSize: '1.6rem', marginBottom: '10px' }}>
              {currentLang === 'en' ? 'Register Account' : 'নিবন্ধন করুন'}
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem', marginBottom: '20px' }}>
              {currentLang === 'en' ? 'Create a premium customer account to access history and fast checkouts.' : 'অর্ডার হিস্টোরি এবং দ্রুত চেকআউট সুবিধা পেতে আপনার অ্যাকাউন্ট নিবন্ধন করুন।'}
            </p>
            
            <form onSubmit={handleRegister}>
              <div style={{ marginBottom: '12px', display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>{currentLang === 'en' ? 'Full Name *' : 'পূর্ণ নাম *'}</label>
                <input 
                  type="text" 
                  className="lang-btn"
                  style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '42px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 12px', width: '100%', boxSizing: 'border-box' }}
                  placeholder="Enter your name" 
                  value={regName}
                  onChange={(e) => setRegName(e.target.value)}
                  required 
                />
              </div>
              <div style={{ marginBottom: '12px', display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>{currentLang === 'en' ? 'Email Address *' : 'ইমেইল অ্যাড্রেস *'}</label>
                <input 
                  type="email" 
                  className="lang-btn"
                  style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '42px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 12px', width: '100%', boxSizing: 'border-box' }}
                  placeholder="name@domain.com" 
                  value={regEmail}
                  onChange={(e) => setRegEmail(e.target.value)}
                  required 
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>{currentLang === 'en' ? 'Phone Number *' : 'ফোন নম্বর *'}</label>
                  <input 
                    type="tel" 
                    className="lang-btn"
                    style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '42px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 12px', width: '100%', boxSizing: 'border-box' }}
                    placeholder="e.g. 01711223344" 
                    value={regPhone}
                    onChange={(e) => setRegPhone(e.target.value)}
                    required 
                  />
                </div>
                <div style={{ display: 'grid', gap: '4px' }}>
                  <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>{currentLang === 'en' ? 'District *' : 'জেলা *'}</label>
                  <select 
                    value={regDistrict}
                    onChange={(e) => setRegDistrict(e.target.value)}
                    style={{ width: '100%', padding: '10px 12px', border: '1px solid hsla(0,0%,0%,0.15)', borderRadius: '8px', outline: 'none', background: '#fff', height: '42px', fontFamily: 'inherit' }}
                    required
                  >
                    <option value="Dhaka">Dhaka</option>
                    <option value="Chittagong">Chittagong</option>
                    <option value="Sylhet">Sylhet</option>
                    <option value="Kushtia">Kushtia</option>
                    <option value="Jessore">Jessore</option>
                  </select>
                </div>
              </div>
              <div style={{ marginBottom: '12px', display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>{currentLang === 'en' ? 'Delivery Address *' : 'ডেলিভারি ঠিকানা *'}</label>
                <input 
                  type="text" 
                  className="lang-btn"
                  style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '42px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 12px', width: '100%', boxSizing: 'border-box' }}
                  placeholder="Apartment, Road, Area details" 
                  value={regAddress}
                  onChange={(e) => setRegAddress(e.target.value)}
                  required 
                />
              </div>
              <div style={{ marginBottom: '16px', display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '0.82rem', fontWeight: 700 }}>{currentLang === 'en' ? 'Password *' : 'পাসওয়ার্ড *'}</label>
                <input 
                  type="password" 
                  className="lang-btn"
                  style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '42px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 12px', width: '100%', boxSizing: 'border-box' }}
                  placeholder="Min 6 characters" 
                  value={regPassword}
                  onChange={(e) => setRegPassword(e.target.value)}
                  required 
                />
              </div>
              <button type="submit" className="btn-primary" style={{ width: '100%', justifyContent: 'center', margin: 0 }}>
                {currentLang === 'en' ? 'Create Account' : 'অ্যাকাউন্ট তৈরি করুন'}
              </button>
            </form>

            <div className="auth-toggle-tip">
              {currentLang === 'en' ? 'Already have an account?' : 'ইতিপূর্বে অ্যাকাউন্ট করেছেন?'}{' '}
              <a href="#" onClick={(e) => { e.preventDefault(); setAuthTab('signin'); }}>
                {currentLang === 'en' ? 'Sign In' : 'লগইন করুন'}
              </a>
            </div>
          </div>
        )}
      </main>
    );
  }

  // LOGGED IN
  return (
    <main className="account-container">
      {/* Dashboard Sidebar Links */}
      <aside className="account-sidebar">
        <div className="account-user-card">
          <div className="account-avatar-circle">👤</div>
          <div className="account-user-name">{activeUser.name}</div>
          <div className="account-user-email">{activeUser.email}</div>
        </div>
        <ul className="account-menu">
          <li className="account-menu-item">
            <a 
              href="#" 
              className={`account-menu-link ${activeSection === 'profile' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveSection('profile'); }}
            >
              👤 {currentLang === 'en' ? 'Profile Settings' : 'প্রোফাইল সেটিংস'}
            </a>
          </li>
          <li className="account-menu-item">
            <a 
              href="#" 
              className={`account-menu-link ${activeSection === 'orders' ? 'active' : ''}`}
              onClick={(e) => { e.preventDefault(); setActiveSection('orders'); }}
            >
              📦 {currentLang === 'en' ? 'Order History' : 'অর্ডার হিস্টোরি'}
            </a>
          </li>
          <li className="account-menu-item" style={{ marginTop: '20px', borderTop: '1px solid var(--cream-mid)', paddingTop: '10px' }}>
            <a href="#" className="account-menu-link" onClick={(e) => { e.preventDefault(); handleLogout(); }} style={{ color: '#c0392b' }}>
              🚪 {currentLang === 'en' ? 'Log Out' : 'লগ আউট'}
            </a>
          </li>
        </ul>
      </aside>

      {/* Account Details Panel */}
      <section className="account-content">
        
        {/* PROFILE SECTION */}
        {activeSection === 'profile' && (
          <div className="account-section active">
            <h4 className="account-section-hdr">{currentLang === 'en' ? 'Profile Settings' : 'প্রোফাইল সেটিংস'}</h4>
            <form onSubmit={handleSaveProfile} style={{ maxWidth: '550px', display: 'grid', gap: '16px' }}>
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentLang === 'en' ? 'Full Name' : 'পূর্ণ নাম'}</label>
                <input 
                  type="text" 
                  className="lang-btn"
                  style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '42px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 12px', width: '100%', boxSizing: 'border-box' }}
                  value={profName}
                  onChange={(e) => setProfName(e.target.value)}
                  required 
                />
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentLang === 'en' ? 'Mobile Number' : 'মোবাইল নম্বর'}</label>
                <input 
                  type="tel" 
                  className="lang-btn"
                  style={{ background: '#fff', textAlign: 'left', borderRadius: '8px', cursor: 'text', height: '42px', border: '1px solid hsla(0,0%,0%,0.15)', padding: '0 12px', width: '100%', boxSizing: 'border-box' }}
                  value={profPhone}
                  onChange={(e) => setProfPhone(e.target.value)}
                  required 
                />
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentLang === 'en' ? 'Delivery Area District' : 'ডেলিভারি জেলা'}</label>
                <select 
                  value={profDistrict}
                  onChange={(e) => setProfDistrict(e.target.value)}
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid hsla(0,0%,0%,0.15)', borderRadius: '8px', outline: 'none', background: '#fff', height: '42px', fontFamily: 'inherit' }}
                >
                  <option value="Dhaka">Dhaka</option>
                  <option value="Chittagong">Chittagong</option>
                  <option value="Sylhet">Sylhet</option>
                  <option value="Kushtia">Kushtia</option>
                  <option value="Jessore">Jessore</option>
                </select>
              </div>
              <div style={{ display: 'grid', gap: '4px' }}>
                <label style={{ fontSize: '0.85rem', fontWeight: 700 }}>{currentLang === 'en' ? 'Billing & Shipping Address' : 'অর্ডার ঠিকানা'}</label>
                <textarea 
                  required 
                  style={{ width: '100%', padding: '10px 12px', border: '1px solid hsla(0,0%,0%,0.15)', borderRadius: '8px', outline: 'none', height: '80px', fontFamily: 'inherit', resize: 'vertical' }}
                  value={profAddress}
                  onChange={(e) => setProfAddress(e.target.value)}
                />
              </div>
              <button type="submit" className="btn-primary" style={{ margin: 0, padding: '10px 24px', width: 'fit-content' }}>
                {currentLang === 'en' ? 'Save Settings' : 'সংরক্ষণ করুন'}
              </button>
            </form>
          </div>
        )}

        {/* ORDERS HISTORY SECTION */}
        {activeSection === 'orders' && (
          <div className="account-section active">
            <h4 className="account-section-hdr">{currentLang === 'en' ? 'Order History' : 'অর্ডার হিস্টোরি'}</h4>
            {ordersLoading ? (
              <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>Loading orders...</p>
            ) : orders.length === 0 ? (
              <p style={{ textAlign: 'center', padding: '30px', color: 'var(--text-muted)' }}>
                {currentLang === 'en' ? "You haven't placed any orders yet." : 'আপনি এখনো কোনো অর্ডার করেননি।'}
              </p>
            ) : (
              <div id="user-order-log-list" style={{ display: 'grid', gap: '20px' }}>
                {orders.map(order => {
                  const itemsSummary = order.items.map(item => {
                    const itemName = currentLang === 'en' ? item.nameEn : item.nameBn;
                    const itemUnit = currentLang === 'en' ? item.unitEn : item.unitBn;
                    return `${itemName} (x${item.quantity} ${itemUnit})`;
                  }).join(", ");

                  const displayDate = new Date(order.createdAt).toLocaleDateString(currentLang === 'en' ? "en-US" : "bn-BD");

                  return (
                    <div key={order.id} className="order-log-card">
                      <div className="order-log-header">
                        <span>ID: {order.id} | {displayDate}</span>
                        <span className={`badge badge-${order.status.toLowerCase()}`}>
                          {order.status}
                        </span>
                      </div>
                      <div className="order-log-details">
                        <div className="order-log-items">
                          <strong>{currentLang === 'en' ? 'Products Sourced:' : 'সংগৃহীত পণ্যসমূহ:'}</strong><br />
                          {itemsSummary}
                        </div>
                        <div className="order-log-total">
                          ৳{translateNumber(order.total)}
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        )}

      </section>
    </main>
  );
}
