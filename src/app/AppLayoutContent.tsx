'use client';

import React, { useState, useEffect, ReactNode } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { getCart } from '@/lib/cart';

interface ToastState {
  show: boolean;
  message: string;
  isError: boolean;
}

interface ActiveUserState {
  email: string;
  name?: string;
}

export default function AppLayoutContent({ children }: { children: ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { currentLang, toggleLanguage, t, translateNumber } = useLanguage();

  const [cartCount, setCartCount] = useState<number>(0);
  const [activeUser, setActiveUser] = useState<ActiveUserState | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState<boolean>(false);
  const [scrolled, setScrolled] = useState<boolean>(false);
  const [scrollY, setScrollY] = useState<number>(0);
  const [toast, setToast] = useState<ToastState>({ show: false, message: '', isError: false });

  // Load state and listen to custom events
  useEffect(() => {
    const updateLocalState = () => {
      const cart = getCart();
      const count = cart.reduce((sum, item) => sum + item.quantity, 0);
      setCartCount(count);

      const user = JSON.parse(localStorage.getItem("onyx_goods_logged_user") || "null");
      setActiveUser(user);
    };

    updateLocalState();
    if (typeof window !== 'undefined') {
      setScrollY(window.scrollY);
    }

    // Listen for cart update event
    window.addEventListener('onyx_cart_updated', updateLocalState);

    // Listen for custom toast notifications
    const handleToastEvent = (e: Event) => {
      const customEvent = e as CustomEvent<{ message: string; isError?: boolean }>;
      const { message, isError } = customEvent.detail || { message: '', isError: false };
      setToast({ show: true, message, isError: !!isError });
      setTimeout(() => {
        setToast((prev) => ({ ...prev, show: false }));
      }, 3500);
    };

    window.addEventListener('show_onyx_toast', handleToastEvent);

    // Scroll listener for sticky navbar
    const handleScroll = () => {
      setScrollY(window.scrollY);
      if (window.scrollY > 50) {
        setScrolled(true);
      } else {
        setScrolled(false);
      }
    };

    window.addEventListener('scroll', handleScroll);

    return () => {
      window.removeEventListener('onyx_cart_updated', updateLocalState);
      window.removeEventListener('show_onyx_toast', handleToastEvent);
      window.removeEventListener('scroll', handleScroll);
    };
  }, []);

  const handleMobileMenuToggle = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const isAdminPage = pathname ? pathname.startsWith('/admin') : false;

  if (isAdminPage) {
    return (
      <>
        {children}
        {toast.show && (
          <div id="toastMessage" className={`toast-msg ${toast.isError ? 'error' : ''}`} style={{ display: 'flex', animation: 'slideInToast 0.3s ease forwards' }}>
            <span id="toastIcon">{toast.isError ? '❌' : '✅'}</span>
            <span id="toastText">{toast.message}</span>
          </div>
        )}
      </>
    );
  }

  return (
    <>
      {/* Announcement Banner */}
      {!activeUser && (
        <div 
          id="new-user-banner" 
          style={{ 
            background: 'var(--gold)', 
            color: 'var(--dark-brown)', 
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            height: '45px', 
            fontWeight: '600', 
            fontFamily: "'Outfit', sans-serif", 
            zIndex: 99, 
            position: 'relative', 
            fontSize: '0.95rem',
            boxSizing: 'border-box'
          }}
        >
          Create Account to track your order <Link href="/account" style={{ marginLeft: '8px', color: 'var(--dark-brown)', textDecoration: 'underline' }}>Sign Up</Link>
        </div>
      )}

      {/* Navbar */}
      <nav 
        id="navbar" 
        className={scrolled ? 'scrolled' : ''}
        style={{
          top: !activeUser ? `${Math.max(0, 45 - scrollY)}px` : '0px',
          transition: 'padding 0.3s ease, background 0.3s ease, box-shadow 0.3s ease'
        }}
      >
        <Link href="/" className="nav-logo">
          <img src="/logo.jpg" className="nav-logo-img" alt="Logo" style={{ height: '38px', width: '38px', verticalAlign: 'middle', marginRight: '8px', borderRadius: '50%', objectFit: 'cover' }} />
          OnyxGoods<span>.</span>
        </Link>
        <ul className={`nav-links ${mobileMenuOpen ? 'mobile-active' : ''}`}>
          <li>
            <Link href="/" className={pathname === '/' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              {t('nav-home')}
            </Link>
          </li>
          <li>
            <Link href="/shop" className={pathname === '/shop' ? 'active' : ''} onClick={() => setMobileMenuOpen(false)}>
              {t('nav-shop')}
            </Link>
          </li>
          <li>
            <Link href="/#story" onClick={() => setMobileMenuOpen(false)}>
              {t('nav-story')}
            </Link>
          </li>
          <li>
            <Link href="/#reviews" onClick={() => setMobileMenuOpen(false)}>
              {t('nav-reviews')}
            </Link>
          </li>
        </ul>
        <div className="nav-actions">
          <button id="mobile-menu-btn" className="mobile-menu-btn" style={{ display: 'block', background: 'none', border: 'none', fontSize: '1.5rem', cursor: 'pointer', color: 'var(--dark-brown)' }} onClick={handleMobileMenuToggle}>
            ☰
          </button>
          <button id="lang-switch" className="lang-btn" onClick={toggleLanguage}>
            {currentLang === 'en' ? 'বাংলা' : 'English'}
          </button>
          <Link href="/account" className={`profile-btn ${pathname === '/account' ? 'active' : ''}`} title="My Account">
            👤
          </Link>
          <Link href="/cart" className={`cart-badge-container ${pathname === '/cart' ? 'active' : ''}`}>
            🛒 <span className="cart-badge" id="cart-count-badge">{translateNumber(cartCount.toString())}</span>
          </Link>
        </div>
      </nav>

      {/* Main Pages */}
      <div style={{ minHeight: '80vh', paddingTop: '80px' }}>
        {children}
      </div>

      {/* Footer */}
      <footer>
        <div className="footer-top">
          <div className="footer-brand">
            <Link href="/" className="nav-logo">
              <img src="/logo.jpg" className="nav-logo-img" alt="Logo" style={{ height: '38px', width: '38px', verticalAlign: 'middle', marginRight: '8px', borderRadius: '50%', objectFit: 'cover' }} />
              OnyxGoods<span>.</span>
            </Link>
            <p id="footer-about-text">{t('footer-about-text')}</p>
          </div>
          <div>
            <h5 id="footer-links-title">{t('footer-links-title')}</h5>
            <ul>
              <li><Link href="/">{t('nav-home')}</Link></li>
              <li><Link href="/shop">{t('nav-shop')}</Link></li>
              <li><Link href="/#story">{t('nav-story')}</Link></li>
              <li><Link href="/#reviews">{t('nav-reviews')}</Link></li>
            </ul>
          </div>
          <div>
            <h5 id="footer-contact-title">{t('footer-contact-title')}</h5>
            <ul>
              <li><a href="https://wa.me/8801302101024" id="footer-whatsapp">{t('footer-whatsapp')}</a></li>
              <li><a href="mailto:onyxsupport36@gmail.com" id="footer-email">{t('footer-email')}</a></li>
              <li><a href="#" id="footer-loc">{t('footer-loc')}</a></li>
            </ul>
          </div>
          <div>
            <h5 id="footer-admin-title">{t('footer-admin-title')}</h5>
            <ul>
              <li><Link href="/admin" id="footer-admin-link">{t('footer-admin-link')}</Link></li>
            </ul>
          </div>
        </div>
        <div className="footer-bottom">
          <p id="footer-copyright" dangerouslySetInnerHTML={{ __html: t('footer-copyright') }} />
          <p id="footer-subtitle">{t('footer-subtitle')}</p>
        </div>
      </footer>

      {/* Toast Notification */}
      {toast.show && (
        <div id="toastMessage" className={`toast-msg ${toast.isError ? 'error' : ''}`} style={{ display: 'flex', animation: 'slideInToast 0.3s ease forwards' }}>
          <span id="toastIcon">{toast.isError ? '❌' : '✅'}</span>
          <span id="toastText">{toast.message}</span>
        </div>
      )}

      {/* Floating WhatsApp */}
      <a href="https://wa.me/8801302101024?text=Hello+OnyxGoods!" className="floating-whatsapp" target="_blank" rel="noopener noreferrer" title="Chat on WhatsApp">
        <svg viewBox="0 0 32 32" xmlns="http://www.w3.org/2000/svg"><path d="M16 0C7.163 0 0 7.163 0 16c0 2.822.736 5.469 2.025 7.773L0 32l8.468-2.004A15.927 15.927 0 0016 32c8.837 0 16-7.163 16-16S24.837 0 16 0zm8.121 22.121c-.336.947-1.945 1.808-2.706 1.921-.693.104-1.567.147-2.528-.159-.582-.189-1.33-.44-2.283-.862-4.016-1.742-6.636-5.822-6.836-6.093-.196-.27-1.6-2.129-1.6-4.063 0-1.934 1.013-2.887 1.373-3.279.359-.392.782-.49 1.043-.49.261 0 .521.003.749.013.24.011.562-.091.88.672.336.799 1.143 2.775 1.242 2.978.1.203.163.44.033.712-.13.27-.196.44-.392.675-.196.236-.412.528-.588.708-.196.2-.4.415-.173.815.228.4.012 2.436 2.073 3.329 1.432.624 2.574.815 3.008.908.434.094 1.013-.106 1.383-.514.37-.408.947-1.111 1.205-1.518.26-.407.52-.34.879-.204.359.136 2.277 1.073 2.667 1.268.39.196.651.293.748.457.097.163.097.946-.24 1.893z"/></svg>
      </a>

      {/* Mobile Bottom Navigation */}
      <nav className="mobile-bottom-nav">
        <ul>
          <li>
            <Link href="/" className={pathname === '/' ? 'active' : ''}>
              <span className="mnav-icon">🏠</span>{currentLang === 'en' ? 'Home' : 'হোম'}
            </Link>
          </li>
          <li>
            <Link href="/shop" className={pathname === '/shop' ? 'active' : ''}>
              <span className="mnav-icon">🛒</span>{currentLang === 'en' ? 'Shop' : 'শপ'}
            </Link>
          </li>
          <li>
            <Link href="/cart" className={pathname === '/cart' ? 'active' : ''} style={{ position: 'relative' }}>
              <span className="mnav-icon">🛍️</span>{currentLang === 'en' ? 'Cart' : 'কার্ট'}
              <span className="mnav-badge" id="mnav-cart-count">{translateNumber(cartCount.toString())}</span>
            </Link>
          </li>
          <li>
            <Link href="/account" className={pathname === '/account' ? 'active' : ''}>
              <span className="mnav-icon">👤</span>{currentLang === 'en' ? 'Account' : 'অ্যাকাউন্ট'}
            </Link>
          </li>
        </ul>
      </nav>
    </>
  );
}
