'use client';

import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import {
  getDbConnection,
  loadPortalAdminData,
  saveCategory,
  deleteCategory,
  saveProduct,
  toggleProductStock,
  deleteProduct,
  saveCoupon,
  deleteCoupon,
  saveSettings,
  updateOrderStatus,
  updateOrderPaymentStatus,
  adminLogin,
  adminLogout,
  checkAdminSession
} from '@/lib/db';
import { Category, Product, Order, Coupon, StoreSettings, Customer } from '@/types';

export default function AdminPage() {
  const [adminEmail, setAdminEmail] = useState<string | null>(null);
  const [checkingSession, setCheckingSession] = useState<boolean>(true);

  // Login Form
  const [emailInput, setEmailInput] = useState<string>('');
  const [passwordInput, setPasswordInput] = useState<string>('');
  const [loginError, setLoginError] = useState<string>('');

  // Active Tab
  const [activeTab, setActiveTab] = useState<string>('dashboard');
  const [isMobileSidebarOpen, setIsMobileSidebarOpen] = useState<boolean>(false);
  const [dbMode, setDbMode] = useState<string>('Mock');

  // Loaded Catalog Data state
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [orders, setOrders] = useState<Order[]>([]);
  const [customers, setCustomers] = useState<Customer[]>([]);
  const [coupons, setCoupons] = useState<Coupon[]>([]);
  const [settings, setSettings] = useState<Partial<StoreSettings>>({});

  // Search Filters
  const [catSearch, setCatSearch] = useState<string>('');
  const [prodSearch, setProdSearch] = useState<string>('');
  const [orderSearch, setOrderSearch] = useState<string>('');
  const [custSearch, setCustSearch] = useState<string>('');
  const [orderStatusFilter, setOrderStatusFilter] = useState<string>('All');

  // Forms states
  // Categories form
  const [editCategoryId, setEditCategoryId] = useState<string>('');
  const [catNameEn, setCatNameEn] = useState<string>('');
  const [catNameBn, setCatNameBn] = useState<string>('');
  const [catDescEn, setCatDescEn] = useState<string>('');
  const [catDescBn, setCatDescBn] = useState<string>('');
  const [catImgData, setCatImgData] = useState<string>('');
  const [catStatus, setCatStatus] = useState<string>('Active');
  const [catImgName, setCatImgName] = useState<string>('');

  // Coupons form
  const [coupCode, setCoupCode] = useState<string>('');
  const [coupType, setCoupType] = useState<'percentage' | 'fixed'>('percentage');
  const [coupValue, setCoupValue] = useState<string>('');
  const [coupExpiry, setCoupExpiry] = useState<string>('');

  // Settings form
  const [setLogoUrl, setSetLogoUrl] = useState<string>('');
  const [setContactEmail, setSetContactEmail] = useState<string>('');
  const [setContactPhone, setSetContactPhone] = useState<string>('');
  const [setWhatsappNumber, setSetWhatsappNumber] = useState<string>('');
  const [setDeliveryChargeDhaka, setSetDeliveryChargeDhaka] = useState<string>('');
  const [setDeliveryChargeOutside, setSetDeliveryChargeOutside] = useState<string>('');

  // Product CRUD Modal State
  const [isProductModalOpen, setIsProductModalOpen] = useState<boolean>(false);
  const [editProductId, setEditProductId] = useState<string>('');
  const [prodNameEn, setProdNameEn] = useState<string>('');
  const [prodNameBn, setProdNameBn] = useState<string>('');
  const [prodCategory, setProdCategory] = useState<string>('');
  const [prodStock, setProdStock] = useState<string>('');
  const [prodPrice, setProdPrice] = useState<string>('');
  const [prodDiscountPrice, setProdDiscountPrice] = useState<string>('0');
  const [prodUnitEn, setProdUnitEn] = useState<string>('');
  const [prodUnitBn, setProdUnitBn] = useState<string>('');
  const [prodBadgeEn, setProdBadgeEn] = useState<string>('');
  const [prodBadgeBn, setProdBadgeBn] = useState<string>('');
  const [prodImgData, setProdImgData] = useState<string>('');
  const [prodImgName, setProdImgName] = useState<string>('');
  const [prodInStock, setProdInStock] = useState<boolean>(true);
  const [prodIsFeatured, setProdIsFeatured] = useState<boolean>(true);
  const [prodDescEn, setProdDescEn] = useState<string>('');
  const [prodDescBn, setProdDescBn] = useState<string>('');

  // Check Session on mount
  useEffect(() => {
    checkAdminSession((email) => {
      setAdminEmail(email);
      setCheckingSession(false);
      const conn = getDbConnection();
      setDbMode(conn.isMockMode ? 'Mock' : 'Live Firestore');
    });
  }, []);

  // Fetch Portal data on auth
  useEffect(() => {
    if (adminEmail) {
      loadData();
    }
  }, [adminEmail]);

  const loadData = async () => {
    try {
      const data = await loadPortalAdminData();
      setCategories(data.categories || []);
      setProducts(data.products || []);
      setOrders(data.orders || []);
      setCustomers(data.customers || []);
      setCoupons(data.coupons || []);
      
      const setts: Partial<StoreSettings> = data.settings || {};
      setSettings(setts);
      setSetLogoUrl(setts.logoUrl || 'logo.jpg');
      setSetContactEmail(setts.contactEmail || 'onyxsupport36@gmail.com');
      setSetContactPhone(setts.contactPhone || '+8801302101024');
      setSetWhatsappNumber(setts.whatsappNumber || '8801302101024');
      setSetDeliveryChargeDhaka((setts.deliveryChargeDhaka || 60).toString());
      setSetDeliveryChargeOutside((setts.deliveryChargeOutside || 120).toString());

      if (data.categories?.length > 0 && !prodCategory) {
        setProdCategory(data.categories[0].id);
      }
    } catch (e) {
      console.error("Failed to load portal data:", e);
      showToast("Error loading portal data", true);
    }
  };

  const showToast = (msg: string, isErr = false) => {
    window.dispatchEvent(new CustomEvent('show_onyx_toast', {
      detail: { message: msg, isError: isErr }
    }));
  };

  const handleLoginSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoginError('');
    try {
      const res = await adminLogin(emailInput, passwordInput);
      setAdminEmail(res.user.email);
      showToast("Signed in successfully!");
    } catch (err: any) {
      console.error(err);
      setLoginError(err.message || "Invalid authentication credentials.");
      showToast("Authentication failed", true);
    }
  };

  const handleLogoutClick = () => {
    adminLogout();
    setAdminEmail(null);
    showToast("Signed out successfully.");
  };

  // Image resizing handler (Canvas based)
  const processImageFile = (file: File, callback: (dataUrl: string) => void) => {
    const reader = new FileReader();
    reader.onload = (e) => {
      if (!e.target || typeof e.target.result !== 'string') return;
      const img = new Image();
      img.onload = () => {
        const canvas = document.createElement('canvas');
        let w = img.width;
        let h = img.height;
        const limit = 600;
        if (w > limit) {
          h = Math.round(h * limit / w);
          w = limit;
        }
        canvas.width = w;
        canvas.height = h;
        const ctx = canvas.getContext('2d');
        if (ctx) {
          ctx.drawImage(img, 0, 0, w, h);
          callback(canvas.toDataURL('image/jpeg', 0.72));
        }
      };
      img.src = e.target.result;
    };
    reader.readAsDataURL(file);
  };

  // CATEGORY OPERATIONS
  const handleSaveCategorySubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!catNameEn || !catNameBn) {
      showToast("Required fields are missing", true);
      return;
    }

    const id = editCategoryId || "cat_" + Math.random().toString(36).substr(2, 9);
    const catData: Category = {
      id,
      nameEn: catNameEn.trim(),
      nameBn: catNameBn.trim(),
      descriptionEn: catDescEn.trim(),
      descriptionBn: catDescBn.trim(),
      imagePath: catImgData || 'logo.jpg',
      status: catStatus,
      createdAt: new Date().toISOString()
    };

    try {
      await saveCategory(catData);
      showToast("Category saved successfully!");
      resetCategoryForm();
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to save category", true);
    }
  };

  const resetCategoryForm = () => {
    setEditCategoryId('');
    setCatNameEn('');
    setCatNameBn('');
    setCatDescEn('');
    setCatDescBn('');
    setCatImgData('');
    setCatImgName('');
    setCatStatus('Active');
  };

  const handleEditCategory = (cat: Category) => {
    setEditCategoryId(cat.id);
    setCatNameEn(cat.nameEn);
    setCatNameBn(cat.nameBn);
    setCatDescEn(cat.descriptionEn || '');
    setCatDescBn(cat.descriptionBn || '');
    setCatImgData(cat.imagePath || '');
    setCatStatus(cat.status || 'Active');
    setCatImgName(cat.imagePath ? 'Current Image' : '');
  };

  const handleDeleteCategoryClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this category?")) return;
    try {
      await deleteCategory(id);
      showToast("Category deleted.");
      loadData();
    } catch (e) {
      console.error(e);
      showToast("Failed to delete category", true);
    }
  };

  // PRODUCT OPERATIONS
  const openProductCrudModal = (prod: Product | null = null) => {
    if (prod) {
      setEditProductId(prod.id);
      setProdNameEn(prod.nameEn || '');
      setProdNameBn(prod.nameBn || '');
      setProdCategory(prod.categoryId || (categories[0]?.id || ''));
      setProdStock(prod.stock.toString());
      setProdPrice(prod.price.toString());
      setProdDiscountPrice((prod.discountPrice || 0).toString());
      setProdUnitEn(prod.unitEn || '');
      setProdUnitBn(prod.unitBn || '');
      setProdBadgeEn(prod.badgeEn || '');
      setProdBadgeBn(prod.badgeBn || '');
      setProdImgData(prod.imagePath || '');
      setProdImgName(prod.imagePath ? 'Current Image' : '');
      setProdInStock(prod.inStock !== false);
      setProdIsFeatured(prod.isFeatured === true);
      setProdDescEn(prod.descEn || '');
      setProdDescBn(prod.descBn || '');
    } else {
      setEditProductId('');
      setProdNameEn('');
      setProdNameBn('');
      setProdCategory(categories[0]?.id || '');
      setProdStock('');
      setProdPrice('');
      setProdDiscountPrice('0');
      setProdUnitEn('');
      setProdUnitBn('');
      setProdBadgeEn('');
      setProdBadgeBn('');
      setProdImgData('');
      setProdImgName('');
      setProdInStock(true);
      setProdIsFeatured(true);
      setProdDescEn('');
      setProdDescBn('');
    }
    setIsProductModalOpen(true);
  };

  const closeProductCrudModal = () => {
    setIsProductModalOpen(false);
  };

  const handleSaveProductSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!prodNameEn || !prodNameBn || !prodCategory || !prodStock || !prodPrice || !prodUnitEn || !prodUnitBn || !prodDescEn || !prodDescBn) {
      showToast("Required fields are missing", true);
      return;
    }

    const id = editProductId || "prod_" + Math.random().toString(36).substr(2, 9);
    const prodData: Product = {
      id,
      categoryId: prodCategory,
      nameEn: prodNameEn.trim(),
      nameBn: prodNameBn.trim(),
      descEn: prodDescEn.trim(),
      descBn: prodDescBn.trim(),
      benefitsEn: prodDescEn.split('\n').filter(l => l.trim()),
      benefitsBn: prodDescBn.split('\n').filter(l => l.trim()),
      price: parseInt(prodPrice, 10),
      discountPrice: parseInt(prodDiscountPrice, 10),
      stock: parseInt(prodStock, 10),
      unitEn: prodUnitEn.trim(),
      unitBn: prodUnitBn.trim(),
      badgeEn: prodBadgeEn.trim(),
      badgeBn: prodBadgeBn.trim(),
      imagePath: prodImgData || 'logo.jpg',
      inStock: prodInStock,
      isFeatured: prodIsFeatured,
      createdAt: new Date().toISOString()
    };

    try {
      await saveProduct(prodData);
      showToast("Product saved successfully!");
      closeProductCrudModal();
      loadData();
    } catch (err) {
      console.error(err);
      showToast("Failed to save product", true);
    }
  };

  const handleDeleteProductClick = async (id: string) => {
    if (!confirm("Are you sure you want to delete this product?")) return;
    try {
      await deleteProduct(id);
      showToast("Product deleted.");
      loadData();
    } catch (e) {
      console.error(e);
      showToast("Failed to delete product", true);
    }
  };

  const handleToggleStockClick = async (id: string, currentVal: boolean) => {
    try {
      await toggleProductStock(id, !currentVal);
      showToast("Stock status updated.");
      loadData();
    } catch (e) {
      console.error(e);
      showToast("Update failed", true);
    }
  };

  // COUPON OPERATIONS
  const handleSaveCouponSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!coupCode || !coupValue || !coupExpiry) return;

    const couponData: Coupon = {
      code: coupCode.trim().toUpperCase(),
      type: coupType,
      value: parseInt(coupValue, 10),
      expiryDate: coupExpiry,
      status: 'Active'
    };

    try {
      await saveCoupon(couponData);
      showToast("Coupon created!");
      setCoupCode('');
      setCoupValue('');
      setCoupExpiry('');
      loadData();
    } catch (e) {
      console.error(e);
      showToast("Failed to save coupon", true);
    }
  };

  const handleDeleteCouponClick = async (code: string) => {
    if (!confirm(`Delete coupon ${code}?`)) return;
    try {
      await deleteCoupon(code);
      showToast("Coupon deleted.");
      loadData();
    } catch (e) {
      console.error(e);
      showToast("Delete failed", true);
    }
  };

  // SETTINGS OPERATION
  const handleSaveSettingsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const sets: StoreSettings = {
      ...settings,
      logoUrl: setLogoUrl,
      contactEmail: setContactEmail,
      contactPhone: setContactPhone,
      whatsappNumber: setWhatsappNumber,
      deliveryChargeDhaka: parseInt(setDeliveryChargeDhaka, 10),
      deliveryChargeOutside: parseInt(setDeliveryChargeOutside, 10)
    };

    try {
      await saveSettings(sets);
      showToast("Store settings saved successfully!");
      loadData();
    } catch (e) {
      console.error(e);
      showToast("Save failed", true);
    }
  };

  // ORDER OPERATIONS
  const handleUpdateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      await updateOrderStatus(orderId, newStatus as any);
      showToast(`Order status updated to ${newStatus}`);
      loadData();
    } catch (e) {
      console.error(e);
      showToast("Failed to update status", true);
    }
  };

  const handleUpdateOrderPayment = async (orderId: string, newPayStatus: string) => {
    try {
      await updateOrderPaymentStatus(orderId, newPayStatus);
      showToast(`Payment status updated to ${newPayStatus}`);
      loadData();
    } catch (e) {
      console.error(e);
      showToast("Failed to update payment status", true);
    }
  };

  const exportOrdersToCSV = () => {
    if (orders.length === 0) {
      showToast("No orders available to export", true);
      return;
    }
    const headers = ["Order ID", "Customer Name", "Phone", "District", "Address", "Items Sourced", "Total (BDT)", "Payment Method", "Payment Status", "Status", "Order Date"];
    const rows = orders.map(o => [
      o.id,
      `"${o.name}"`,
      o.phone,
      o.district,
      `"${o.address}"`,
      `"${o.product}"`,
      o.total,
      o.paymentMethod,
      o.paymentStatus,
      o.status,
      o.createdAt
    ]);

    const csvContent = "data:text/csv;charset=utf-8," 
      + [headers.join(","), ...rows.map(e => e.join(","))].join("\n");

    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `OnyxGoods_Orders_${new Date().toISOString().split('T')[0]}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  // INVENTORY REPLENISH
  const handleReplenishStock = async (prod: Product, qtyText: string) => {
    const val = parseInt(qtyText, 10);
    if (isNaN(val) || val < 0) {
      showToast("Invalid replenish amount", true);
      return;
    }
    const updated = {
      ...prod,
      stock: prod.stock + val,
      inStock: (prod.stock + val) > 0
    };
    try {
      await saveProduct(updated);
      showToast(`Replenished stock of ${prod.nameEn}.`);
      loadData();
    } catch (e) {
      console.error(e);
      showToast("Stock replenish failed", true);
    }
  };

  // Rendering Helpers
  const kpiTotalRevenue = orders
    .filter(o => o.status !== 'Cancelled')
    .reduce((sum, o) => sum + o.total, 0);

  const kpiLowStockCount = products.filter(p => p.stock < 5).length;

  // Simple CSS Histogram for Last 7 days
  const last7DaysChartBars = () => {
    const datesMap: { [key: string]: number } = {};
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      datesMap[d.toDateString()] = 0;
    }

    orders.forEach(o => {
      const dateStr = new Date(o.createdAt).toDateString();
      if (dateStr in datesMap && o.status !== 'Cancelled') {
        datesMap[dateStr] += o.total;
      }
    });

    const values = Object.values(datesMap);
    const maxVal = Math.max(...values, 1000);

    return Object.entries(datesMap).map(([date, val], idx) => {
      const dayName = date.split(' ')[0] + ' ' + date.split(' ')[2];
      const barHeight = Math.max(10, Math.round((val / maxVal) * 120));
      return (
        <div key={idx} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', flexGrow: 1 }}>
          <div style={{ fontSize: '0.75rem', fontWeight: 'bold', color: 'var(--brown)', marginBottom: '4px' }}>৳{val}</div>
          <div style={{ height: '120px', display: 'flex', alignItems: 'flex-end', background: 'rgba(0,0,0,0.03)', width: '100%', borderRadius: '4px' }}>
            <div style={{ height: `${barHeight}px`, background: 'var(--brown)', width: '100%', borderRadius: '4px', transition: 'height 0.4s' }}></div>
          </div>
          <div style={{ fontSize: '0.72rem', color: 'var(--text-muted)', marginTop: '8px' }}>{dayName}</div>
        </div>
      );
    });
  };

  const switchTab = (tab: string) => {
    setActiveTab(tab);
    setIsMobileSidebarOpen(false);
  };

  if (checkingSession) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>Validating dashboard session...</div>;
  }

  // AUTH OVERLAY (NOT LOGGED IN)
  if (!adminEmail) {
    return (
      <div className="auth-overlay">
        <div className="auth-card" style={{ maxWidth: '420px', width: '100%' }}>
          <div style={{ textAlign: 'center', marginBottom: '24px' }}>
            <img src="/logo.jpg" alt="Logo" style={{ height: '38px', width: '38px', borderRadius: '50%', objectFit: 'cover', marginBottom: '8px' }} />
            <h3 style={{ fontFamily: "'Playfair Display', serif", color: 'var(--dark-brown)', fontSize: '1.8rem', marginBottom: '4px' }}>
              OnyxGoods Admin
            </h3>
            <p style={{ color: 'var(--text-muted)', fontSize: '0.88rem' }}>Sign in to access control portal</p>
          </div>

          {loginError && (
            <div style={{ color: 'red', fontSize: '0.85rem', background: 'rgba(255,0,0,0.05)', padding: '10px', borderRadius: '6px', marginBottom: '16px', borderLeft: '3px solid red' }}>
              {loginError}
            </div>
          )}

          <form onSubmit={handleLoginSubmit}>
            <div className="admin-field" style={{ marginBottom: '12px' }}>
              <label>Email Address</label>
              <input 
                type="email" 
                placeholder="onyxsupport36@gmail.com" 
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required 
              />
            </div>
            <div className="admin-field" style={{ marginBottom: '20px' }}>
              <label>Password</label>
              <input 
                type="password" 
                placeholder="••••••••" 
                value={passwordInput}
                onChange={(e) => setPasswordInput(e.target.value)}
                required 
              />
            </div>
            <button type="submit" className="submit-btn" style={{ width: '100%', padding: '14px', fontSize: '1rem' }}>
              Sign In to Dashboard
            </button>
          </form>
        </div>
      </div>
    );
  }

  return (
    <div className="admin-body" style={{ minHeight: '100vh', background: 'var(--cream-light)' }}>
      {/* Mobile Top Bar */}
      <div className="admin-mobile-topbar">
        <div className="admin-mobile-logo">ONYX<span> ADMIN</span></div>
        <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
          <span style={{ fontSize: '0.72rem', padding: '4px 10px', background: 'var(--green)', color: '#fff', borderRadius: '20px' }}>
            {dbMode} Mode
          </span>
          <button className="admin-hamburger" onClick={() => setIsMobileSidebarOpen(!isMobileSidebarOpen)}>☰</button>
        </div>
      </div>

      {/* Mobile Sidebar Overlay */}
      {isMobileSidebarOpen && (
        <div className="admin-sidebar-overlay" onClick={() => setIsMobileSidebarOpen(false)}></div>
      )}

      <div className="admin-sidebar-layout">
        
        {/* Sidebar Navigation */}
        <aside className={`admin-sidebar ${isMobileSidebarOpen ? 'active' : ''}`}>
          <div className="admin-sidebar-logo">
            <img src="/logo.jpg" alt="Logo" style={{ height: '38px', width: '38px', borderRadius: '50%', objectFit: 'cover', marginRight: '8px' }} />
            ONYX<span> ADMIN</span>
          </div>

          <div style={{ fontFamily: "'Outfit', sans-serif", fontSize: '0.72rem', padding: '5px 12px', background: 'rgba(255,255,255,0.1)', borderRadius: '20px', textAlign: 'center', marginBottom: '16px', color: 'var(--gold)' }}>
            {dbMode} Mode
          </div>

          <ul className="admin-sidebar-menu">
            <li>
              <a href="#" className={`admin-sidebar-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => switchTab('dashboard')}>
                📊 Dashboard
              </a>
            </li>
            <li>
              <a href="#" className={`admin-sidebar-link ${activeTab === 'categories' ? 'active' : ''}`} onClick={() => switchTab('categories')}>
                📁 Categories
              </a>
            </li>
            <li>
              <a href="#" className={`admin-sidebar-link ${activeTab === 'products' ? 'active' : ''}`} onClick={() => switchTab('products')}>
                📦 Products
              </a>
            </li>
            <li>
              <a href="#" className={`admin-sidebar-link ${activeTab === 'orders' ? 'active' : ''}`} onClick={() => switchTab('orders')}>
                🛒 Orders
              </a>
            </li>
            <li>
              <a href="#" className={`admin-sidebar-link ${activeTab === 'customers' ? 'active' : ''}`} onClick={() => switchTab('customers')}>
                👥 Customers
              </a>
            </li>
            <li>
              <a href="#" className={`admin-sidebar-link ${activeTab === 'inventory' ? 'active' : ''}`} onClick={() => switchTab('inventory')}>
                📈 Inventory
              </a>
            </li>
            <li>
              <a href="#" className={`admin-sidebar-link ${activeTab === 'coupons' ? 'active' : ''}`} onClick={() => switchTab('coupons')}>
                🏷️ Coupons
              </a>
            </li>
            <li>
              <a href="#" className={`admin-sidebar-link ${activeTab === 'cms' ? 'active' : ''}`} onClick={() => switchTab('cms')}>
                📝 CMS Banners
              </a>
            </li>
            <li>
              <a href="#" className={`admin-sidebar-link ${activeTab === 'reports' ? 'active' : ''}`} onClick={() => switchTab('reports')}>
                📊 Reports
              </a>
            </li>
            <li>
              <a href="#" className={`admin-sidebar-link ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => switchTab('settings')}>
                ⚙️ Settings
              </a>
            </li>
          </ul>

          <div className="admin-sidebar-user">
            <span style={{ fontWeight: 500, fontSize: '0.82rem', wordBreak: 'break-all' }}>{adminEmail}</span>
            <Link href="/" style={{ color: 'var(--gold)', textDecoration: 'none', fontFamily: "'Outfit', sans-serif", fontSize: '0.8rem', display: 'block', margin: '6px 0 12px' }}>
              🏠 Visit Store →
            </Link>
            <button onClick={handleLogoutClick} className="admin-logout" style={{ width: '100%', borderColor: 'rgba(255,255,255,0.25)' }}>
              Sign Out
            </button>
          </div>
        </aside>

        {/* Main Panel Content */}
        <div className="admin-main-wrapper" style={{ padding: '30px' }}>
          
          {/* TAB 1: DASHBOARD */}
          {activeTab === 'dashboard' && (
            <section className="admin-page-section active">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Operations Dashboard</h2>
              </div>
              
              <div className="stats-grid" style={{ marginBottom: '32px' }}>
                <div className="stat-card orders" style={{ borderLeftColor: 'var(--green)' }}>
                  <div className="stat-info">
                    <h4>Total Revenue</h4>
                    <div className="stat-val">৳{kpiTotalRevenue}</div>
                  </div>
                  <div className="stat-icon">💰</div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: '#3498db' }}>
                  <div className="stat-info">
                    <h4>Total Orders</h4>
                    <div className="stat-val">{orders.length}</div>
                  </div>
                  <div className="stat-icon">🛒</div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: 'var(--gold)' }}>
                  <div className="stat-info">
                    <h4>Total Customers</h4>
                    <div className="stat-val">{customers.length}</div>
                  </div>
                  <div className="stat-icon">👥</div>
                </div>
                <div className="stat-card" style={{ borderLeftColor: '#e74c3c' }}>
                  <div className="stat-info">
                    <h4>Low Stock Alerts</h4>
                    <div className="stat-val">{kpiLowStockCount}</div>
                  </div>
                  <div className="stat-icon">⚠️</div>
                </div>
              </div>

              <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--r-md)', border: 'var(--border-light)', marginBottom: '32px' }}>
                <h3 style={{ fontFamily: "'Outfit', sans-serif", fontSize: '1.15rem', marginBottom: '24px' }}>
                  Marketplace Sales Performance (Last 7 Days)
                </h3>
                <div style={{ display: 'flex', gap: '20px', justifyContent: 'space-between', alignItems: 'flex-end', minHeight: '180px', paddingBottom: '10px' }}>
                  {last7DaysChartBars()}
                </div>
              </div>

              <div className="table-container">
                <div style={{ padding: '18px 24px', borderBottom: '1px solid hsla(22,55%,13%,0.08)', fontWeight: 700, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span>Recent Placed Orders</span>
                  <a href="#" onClick={(e) => { e.preventDefault(); setActiveTab('orders'); }} style={{ fontSize: '0.82rem', color: 'var(--green)', textDecoration: 'none' }}>
                    View all →
                  </a>
                </div>
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>District</th>
                      <th>Total</th>
                      <th>Method</th>
                      <th>Status</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders.slice(0, 5).map(o => (
                      <tr key={o.id}>
                        <td style={{ fontWeight: 700 }}>{o.id}</td>
                        <td>{o.name}</td>
                        <td>{o.phone}</td>
                        <td>{o.district}</td>
                        <td style={{ fontWeight: 700 }}>৳{o.total}</td>
                        <td>{o.paymentMethod}</td>
                        <td>
                          <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 2: CATEGORIES */}
          {activeTab === 'categories' && (
            <section className="admin-page-section active">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Manage Categories</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'start' }}>
                {/* Form */}
                <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--r-md)', border: 'var(--border-light)' }}>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", marginBottom: '18px', fontSize: '1.1rem' }}>
                    {editCategoryId ? 'Edit Category' : 'Add Category'}
                  </h3>
                  <form onSubmit={handleSaveCategorySubmit}>
                    <div className="admin-field" style={{ marginBottom: '12px' }}>
                      <label>Category Name (English) *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. Fresh Dairy"
                        value={catNameEn}
                        onChange={(e) => setCatNameEn(e.target.value)}
                      />
                    </div>
                    <div className="admin-field" style={{ marginBottom: '12px' }}>
                      <label>Category Name (বাংলা) *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. তাজা দুগ্ধজাত পণ্য"
                        value={catNameBn}
                        onChange={(e) => setCatNameBn(e.target.value)}
                      />
                    </div>
                    <div className="admin-field" style={{ marginBottom: '12px' }}>
                      <label>Description (English)</label>
                      <textarea 
                        placeholder="Short category description..."
                        value={catDescEn}
                        onChange={(e) => setCatDescEn(e.target.value)}
                      />
                    </div>
                    <div className="admin-field" style={{ marginBottom: '12px' }}>
                      <label>Description (বাংলা)</label>
                      <textarea 
                        placeholder="সংক্ষিপ্ত বিবরণ..."
                        value={catDescBn}
                        onChange={(e) => setCatDescBn(e.target.value)}
                      />
                    </div>
                    
                    <div className="admin-field" style={{ marginBottom: '12px' }}>
                      <label>Category Image *</label>
                      <div className="img-upload-zone" style={{ borderStyle: 'dashed' }}>
                        <span className="upload-icon">🖼️</span>
                        {catImgName ? <p style={{ color: 'green', fontWeight: 'bold' }}>✓ {catImgName}</p> : <p>Choose or drop category photo</p>}
                        <input 
                          type="file" 
                          accept="image/*"
                          style={{ margin: '8px auto', fontSize: '0.8rem' }}
                          onChange={(e) => {
                            if (e.target.files?.[0]) {
                              setCatImgName(e.target.files[0].name);
                              processImageFile(e.target.files[0], (data) => setCatImgData(data));
                            }
                          }}
                        />
                      </div>
                    </div>

                    <div className="admin-field" style={{ marginBottom: '16px' }}>
                      <label>Status</label>
                      <select value={catStatus} onChange={(e) => setCatStatus(e.target.value)}>
                        <option value="Active">✅ Active</option>
                        <option value="Inactive">⛔ Inactive</option>
                      </select>
                    </div>
                    
                    <div style={{ display: 'flex', gap: '10px' }}>
                      <button type="submit" className="submit-btn" style={{ flex: 1, padding: '11px', margin: 0 }}>
                        {editCategoryId ? 'Update' : 'Save Category'}
                      </button>
                      <button type="button" onClick={resetCategoryForm} className="filter-btn" style={{ padding: '11px 16px', margin: 0 }}>
                        ↩ Reset
                      </button>
                    </div>
                  </form>
                </div>

                {/* Table */}
                <div className="table-container">
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid hsla(22,55%,13%,0.08)' }}>
                    <div className="admin-search-bar">
                      <span>🔍</span>
                      <input 
                        type="text" 
                        placeholder="Search categories..."
                        value={catSearch}
                        onChange={(e) => setCatSearch(e.target.value)}
                      />
                    </div>
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Image</th>
                        <th>Name EN / BN</th>
                        <th>Status</th>
                        <th>Actions</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories
                        .filter(c => c.nameEn.toLowerCase().includes(catSearch.toLowerCase()) || c.nameBn.includes(catSearch))
                        .map(cat => (
                          <tr key={cat.id}>
                            <td>
                              <img src={cat.imagePath || '/logo.jpg'} style={{ width: '45px', height: '45px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                            </td>
                            <td>
                              <strong>{cat.nameEn}</strong>
                              <div style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>{cat.nameBn}</div>
                            </td>
                            <td>
                              <span className={`badge badge-${cat.status === 'Active' ? 'confirmed' : 'cancelled'}`}>{cat.status}</span>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="filter-btn" onClick={() => handleEditCategory(cat)} style={{ padding: '5px 10px', fontSize: '0.78rem' }}>✏️</button>
                                <button className="filter-btn" onClick={() => handleDeleteCategoryClick(cat.id)} style={{ padding: '5px 10px', fontSize: '0.78rem', color: 'red' }}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 3: PRODUCTS */}
          {activeTab === 'products' && (
            <section className="admin-page-section active">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Manage Products</h2>
                <button onClick={() => openProductCrudModal()} className="submit-btn" style={{ padding: '10px 20px', margin: 0 }}>
                  ➕ Add Product
                </button>
              </div>
              <div className="admin-search-bar" style={{ marginBottom: '20px' }}>
                <span>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search products by name..."
                  value={prodSearch}
                  onChange={(e) => setProdSearch(e.target.value)}
                />
              </div>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Category</th>
                      <th>Price</th>
                      <th>Stock</th>
                      <th>Featured</th>
                      <th>Status</th>
                      <th>Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products
                      .filter(p => p.nameEn.toLowerCase().includes(prodSearch.toLowerCase()) || p.nameBn.includes(prodSearch))
                      .map(prod => {
                        const cat = categories.find(c => c.id === prod.categoryId);
                        return (
                          <tr key={prod.id}>
                            <td>
                              <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
                                <img src={prod.imagePath || '/logo.jpg'} style={{ width: '40px', height: '40px', objectFit: 'cover', borderRadius: '4px' }} alt="" />
                                <div>
                                  <strong>{prod.nameEn}</strong>
                                  <div style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>{prod.nameBn}</div>
                                </div>
                              </div>
                            </td>
                            <td>{cat ? cat.nameEn : prod.categoryId}</td>
                            <td style={{ fontWeight: 700 }}>
                              ৳{prod.price}
                              {prod.discountPrice > 0 && prod.discountPrice < prod.price && (
                                <div style={{ fontSize: '0.78rem', color: 'green' }}>৳{prod.discountPrice} (disc)</div>
                              )}
                            </td>
                            <td>
                              <span style={{ fontWeight: 600, color: prod.stock < 5 ? 'red' : 'inherit' }}>{prod.stock}</span>
                            </td>
                            <td>{prod.isFeatured ? '⭐ Yes' : 'No'}</td>
                            <td>
                              <button 
                                onClick={() => handleToggleStockClick(prod.id, prod.inStock)}
                                className={`badge badge-${prod.inStock ? 'confirmed' : 'cancelled'}`} 
                                style={{ border: 'none', cursor: 'pointer' }}
                              >
                                {prod.inStock ? 'In Stock' : 'Out of Stock'}
                              </button>
                            </td>
                            <td>
                              <div style={{ display: 'flex', gap: '6px' }}>
                                <button className="filter-btn" onClick={() => openProductCrudModal(prod)} style={{ padding: '5px 10px', fontSize: '0.78rem' }}>✏️</button>
                                <button className="filter-btn" onClick={() => handleDeleteProductClick(prod.id)} style={{ padding: '5px 10px', fontSize: '0.78rem', color: 'red' }}>🗑️</button>
                              </div>
                            </td>
                          </tr>
                        );
                      })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 4: ORDERS */}
          {activeTab === 'orders' && (
            <section className="admin-page-section active">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Manage Customer Orders</h2>
                <button onClick={exportOrdersToCSV} className="btn-export" style={{ background: '#27ae60', boxShadow: 'none' }}>
                  📥 Export CSV
                </button>
              </div>
              
              <div className="admin-search-bar" style={{ marginBottom: '20px' }}>
                <span>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search by name, phone, or order ID..."
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>

              <div className="admin-actions" style={{ marginBottom: '16px' }}>
                <div className="admin-filters">
                  {['All', 'Pending', 'Confirmed', 'Delivered', 'Cancelled'].map(st => (
                    <button 
                      key={st}
                      className={`filter-btn ${orderStatusFilter === st ? 'active' : ''}`} 
                      onClick={() => setOrderStatusFilter(st)}
                    >
                      {st} Orders
                    </button>
                  ))}
                </div>
              </div>

              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Order ID</th>
                      <th>Customer</th>
                      <th>Contact</th>
                      <th>Products (Qty)</th>
                      <th>Total</th>
                      <th>Method</th>
                      <th>Status</th>
                      <th>Update</th>
                    </tr>
                  </thead>
                  <tbody>
                    {orders
                      .filter(o => {
                        const matchesSearch = o.id.includes(orderSearch.toUpperCase()) || o.name.toLowerCase().includes(orderSearch.toLowerCase()) || o.phone.includes(orderSearch);
                        const matchesStatus = orderStatusFilter === 'All' || o.status === orderStatusFilter;
                        return matchesSearch && matchesStatus;
                      })
                      .map(o => (
                        <tr key={o.id}>
                          <td style={{ fontWeight: 700 }}>{o.id}</td>
                          <td>{o.name}</td>
                          <td>
                            <div>Phone: {o.phone}</div>
                            {o.whatsapp && <div style={{ fontSize: '0.8rem', color: 'var(--green)' }}>WA: {o.whatsapp}</div>}
                          </td>
                          <td>
                            <div style={{ fontSize: '0.82rem', maxWidth: '200px', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }} title={o.product}>
                              {o.product}
                            </div>
                            <span style={{ fontSize: '0.78rem', color: 'var(--text-muted)' }}>(Total qty: {o.quantity})</span>
                          </td>
                          <td style={{ fontWeight: 700 }}>
                            ৳{o.total}
                            <div style={{ fontSize: '0.75rem', fontWeight: 'normal' }}>
                              Pay status:{' '}
                              <select 
                                value={o.paymentStatus} 
                                onChange={(e) => handleUpdateOrderPayment(o.id, e.target.value)}
                                style={{ fontSize: '0.75rem', padding: '2px', border: 'none', background: 'rgba(0,0,0,0.05)', borderRadius: '4px' }}
                              >
                                <option value="Unpaid">Unpaid</option>
                                <option value="Paid">Paid</option>
                              </select>
                            </div>
                          </td>
                          <td>{o.paymentMethod}</td>
                          <td>
                            <span className={`badge badge-${o.status.toLowerCase()}`}>{o.status}</span>
                          </td>
                          <td>
                            <select 
                              value={o.status}
                              onChange={(e) => handleUpdateOrderStatus(o.id, e.target.value)}
                              style={{ padding: '6px', fontSize: '0.82rem', borderRadius: '4px', border: '1px solid hsla(0,0%,0%,0.15)', background: '#fff' }}
                            >
                              <option value="Pending">Pending</option>
                              <option value="Confirmed">Confirmed</option>
                              <option value="Delivered">Delivered</option>
                              <option value="Cancelled">Cancelled</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 5: CUSTOMERS */}
          {activeTab === 'customers' && (
            <section className="admin-page-section active">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Customer Directories</h2>
              </div>
              <div className="admin-search-bar" style={{ marginBottom: '20px' }}>
                <span>🔍</span>
                <input 
                  type="text" 
                  placeholder="Search customers by name or phone..."
                  value={custSearch}
                  onChange={(e) => setCustSearch(e.target.value)}
                />
              </div>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Customer Name</th>
                      <th>Email</th>
                      <th>Mobile Phone</th>
                      <th>District</th>
                      <th>Default Address</th>
                      <th>Last Order</th>
                    </tr>
                  </thead>
                  <tbody>
                    {customers
                      .filter(c => c.name.toLowerCase().includes(custSearch.toLowerCase()) || c.phone.includes(custSearch))
                      .map((cust, i) => (
                        <tr key={i}>
                          <td style={{ fontWeight: 600 }}>{cust.name}</td>
                          <td>{cust.email}</td>
                          <td>{cust.phone}</td>
                          <td>{cust.district}</td>
                          <td>{cust.address}</td>
                          <td>{cust.lastOrderAt ? new Date(cust.lastOrderAt).toLocaleDateString() : 'N/A'}</td>
                        </tr>
                      ))}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 6: INVENTORY */}
          {activeTab === 'inventory' && (
            <section className="admin-page-section active">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Inventory & Stock Tracking</h2>
              </div>
              <div className="table-container">
                <table className="admin-table">
                  <thead>
                    <tr>
                      <th>Product</th>
                      <th>Unit</th>
                      <th>Current Stock</th>
                      <th>Replenish</th>
                      <th>Safety Flag</th>
                    </tr>
                  </thead>
                  <tbody>
                    {products.map(prod => {
                      let tempQty = '';
                      return (
                        <tr key={prod.id}>
                          <td style={{ fontWeight: 600 }}>{prod.nameEn}</td>
                          <td>{prod.unitEn}</td>
                          <td>
                            <strong style={{ color: prod.stock < 5 ? 'red' : 'inherit' }}>{prod.stock}</strong>
                          </td>
                          <td>
                            <div style={{ display: 'flex', gap: '6px', maxWidth: '140px' }}>
                              <input 
                                type="number" 
                                placeholder="+ Qty"
                                onChange={(e) => { tempQty = e.target.value; }}
                                style={{ width: '60px', padding: '4px 8px', borderRadius: '4px', border: '1px solid hsla(0,0%,0%,0.15)' }}
                              />
                              <button 
                                onClick={(e) => {
                                  handleReplenishStock(prod, tempQty);
                                  const sibling = (e.currentTarget.previousSibling as HTMLInputElement);
                                  if (sibling) sibling.value = '';
                                  tempQty = '';
                                }}
                                className="submit-btn" 
                                style={{ padding: '4px 10px', fontSize: '0.8rem', margin: 0 }}
                              >
                                Add
                              </button>
                            </div>
                          </td>
                          <td>
                            {prod.stock < 5 ? (
                              <span style={{ color: 'red', fontWeight: 'bold' }}>⚠️ Low Stock</span>
                            ) : (
                              <span style={{ color: 'green' }}>✓ Safe</span>
                            )}
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            </section>
          )}

          {/* TAB 7: COUPONS */}
          {activeTab === 'coupons' && (
            <section className="admin-page-section active">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Manage Discount Coupons</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: '28px', alignItems: 'start' }}>
                <div style={{ background: '#fff', padding: '24px', borderRadius: 'var(--r-md)', border: 'var(--border-light)' }}>
                  <h3 style={{ fontFamily: "'Outfit', sans-serif", marginBottom: '18px', fontSize: '1.1rem' }}>Create Coupon</h3>
                  <form onSubmit={handleSaveCouponSubmit}>
                    <div className="admin-field" style={{ marginBottom: '12px' }}>
                      <label>Coupon Code *</label>
                      <input 
                        type="text" 
                        required 
                        placeholder="e.g. EID2026" 
                        style={{ textTransform: 'uppercase' }}
                        value={coupCode}
                        onChange={(e) => setCoupCode(e.target.value)}
                      />
                    </div>
                    <div className="admin-field" style={{ marginBottom: '12px' }}>
                      <label>Discount Type</label>
                      <select value={coupType} onChange={(e) => setCoupType(e.target.value as any)}>
                        <option value="percentage">Percentage (%)</option>
                        <option value="fixed">Fixed BDT Amount</option>
                      </select>
                    </div>
                    <div className="admin-field" style={{ marginBottom: '12px' }}>
                      <label>Discount Value *</label>
                      <input 
                        type="number" 
                        required 
                        min="1" 
                        placeholder="e.g. 10"
                        value={coupValue}
                        onChange={(e) => setCoupValue(e.target.value)}
                      />
                    </div>
                    <div className="admin-field" style={{ marginBottom: '18px' }}>
                      <label>Expiry Date *</label>
                      <input 
                        type="date" 
                        required
                        value={coupExpiry}
                        onChange={(e) => setCoupExpiry(e.target.value)}
                      />
                    </div>
                    <button type="submit" className="submit-btn" style={{ width: '100%', padding: '11px', margin: 0 }}>
                      💾 Save Coupon
                    </button>
                  </form>
                </div>
                <div className="table-container">
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Code</th>
                        <th>Rule</th>
                        <th>Expiry</th>
                        <th>Status</th>
                        <th>Action</th>
                      </tr>
                    </thead>
                    <tbody>
                      {coupons.map((c, idx) => (
                        <tr key={idx}>
                          <td style={{ fontWeight: 700 }}>{c.code}</td>
                          <td>
                            {c.type === 'percentage' ? `${c.value}% discount` : `৳${c.value} discount`}
                          </td>
                          <td>{c.expiryDate}</td>
                          <td>
                            <span className="badge badge-confirmed">{c.status}</span>
                          </td>
                          <td>
                            <button className="filter-btn" onClick={() => handleDeleteCouponClick(c.code)} style={{ color: 'red', padding: '5px 10px', fontSize: '0.78rem' }}>
                              🗑️
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 8: CMS */}
          {activeTab === 'cms' && (
            <section className="admin-page-section active">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Homepage Banners & CMS</h2>
              </div>
              <div style={{ background: '#fff', padding: '30px', borderRadius: 'var(--r-xl)', border: 'var(--border-light)', maxWidth: '800px' }}>
                <form onSubmit={(e) => { e.preventDefault(); showToast('CMS settings saved!'); }}>
                  <div className="admin-field" style={{ marginBottom: '12px' }}>
                    <label>Homepage Headline (English)</label>
                    <input type="text" defaultValue="Pure Village Delights Delivered to Your Home" />
                  </div>
                  <div className="admin-field" style={{ marginBottom: '12px' }}>
                    <label>Homepage Headline (বাংলা)</label>
                    <input type="text" defaultValue="গ্রামের খাঁটি পণ্য সরাসরি আপনার দ্বারে" />
                  </div>
                  <div className="admin-field" style={{ marginBottom: '12px' }}>
                    <label>Hero Subtitle (English)</label>
                    <input type="text" defaultValue="Sourced directly from rural Bangladeshi farmers, bringing you fresh dairy, organic honey..." />
                  </div>
                  <div className="admin-field" style={{ marginBottom: '20px' }}>
                    <label>Promo Banner Text</label>
                    <input type="text" defaultValue="Get a 100 ৳ welcome coupon directly in your inbox." />
                  </div>
                  <button type="submit" className="submit-btn" style={{ padding: '11px 28px', margin: 0 }}>
                    Update CMS
                  </button>
                </form>
              </div>
            </section>
          )}

          {/* TAB 9: REPORTS */}
          {activeTab === 'reports' && (
            <section className="admin-page-section active">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Sales & Performance Reports</h2>
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(320px, 1fr))', gap: '32px' }}>
                <div className="table-container">
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid hsla(22,55%,13%,0.08)', fontWeight: 700 }}>
                    Revenue by Category
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Category</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {categories.map(cat => {
                        const rev = orders
                          .filter(o => o.status !== 'Cancelled')
                          .reduce((sum, o) => {
                            const catTotal = o.items
                              .filter(item => item.categoryId === cat.id)
                              .reduce((itemSum, item) => {
                                const price = item.discountPrice > 0 && item.discountPrice < item.price ? item.discountPrice : item.price;
                                return itemSum + (price * item.quantity);
                              }, 0);
                            return sum + catTotal;
                          }, 0);
                        return (
                          <tr key={cat.id}>
                            <td>{cat.nameEn}</td>
                            <td style={{ fontWeight: 700 }}>৳{rev}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
                
                <div className="table-container">
                  <div style={{ padding: '18px 24px', borderBottom: '1px solid hsla(22,55%,13%,0.08)', fontWeight: 700 }}>
                    Top Performing Products
                  </div>
                  <table className="admin-table">
                    <thead>
                      <tr>
                        <th>Product</th>
                        <th>Units Sold</th>
                        <th>Revenue</th>
                      </tr>
                    </thead>
                    <tbody>
                      {products.map(prod => {
                        const units = orders
                          .filter(o => o.status !== 'Cancelled')
                          .reduce((sum, o) => {
                            const orderItem = o.items.find(item => item.productId === prod.id);
                            return sum + (orderItem ? orderItem.quantity : 0);
                          }, 0);
                        const revenue = orders
                          .filter(o => o.status !== 'Cancelled')
                          .reduce((sum, o) => {
                            const orderItem = o.items.find(item => item.productId === prod.id);
                            if (orderItem) {
                              const p = orderItem.discountPrice > 0 && orderItem.discountPrice < orderItem.price ? orderItem.discountPrice : orderItem.price;
                              return sum + (p * orderItem.quantity);
                            }
                            return sum;
                          }, 0);

                        return (
                          <tr key={prod.id}>
                            <td>{prod.nameEn}</td>
                            <td>{units}</td>
                            <td style={{ fontWeight: 700 }}>৳{revenue}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            </section>
          )}

          {/* TAB 10: SETTINGS */}
          {activeTab === 'settings' && (
            <section className="admin-page-section active">
              <div className="admin-section-header">
                <h2 className="admin-section-title">Marketplace Settings</h2>
              </div>
              <div style={{ background: '#fff', padding: '30px', borderRadius: 'var(--r-xl)', border: 'var(--border-light)', maxWidth: '800px' }}>
                <form onSubmit={handleSaveSettingsSubmit}>
                  <div className="admin-field" style={{ marginBottom: '12px' }}>
                    <label>Store Logo (Path or URL)</label>
                    <input 
                      type="text" 
                      value={setLogoUrl} 
                      onChange={(e) => setSetLogoUrl(e.target.value)}
                      required 
                    />
                  </div>
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '12px' }}>
                    <div className="admin-field">
                      <label>Contact Email</label>
                      <input 
                        type="email" 
                        value={setContactEmail} 
                        onChange={(e) => setSetContactEmail(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="admin-field">
                      <label>Contact Phone</label>
                      <input 
                        type="tel" 
                        value={setContactPhone} 
                        onChange={(e) => setSetContactPhone(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="admin-field">
                      <label>WhatsApp Number</label>
                      <input 
                        type="text" 
                        value={setWhatsappNumber} 
                        onChange={(e) => setSetWhatsappNumber(e.target.value)}
                        required 
                      />
                    </div>
                    <div className="admin-field">
                      <label>Dhaka Shipping Fee (৳)</label>
                      <input 
                        type="number" 
                        value={setDeliveryChargeDhaka} 
                        onChange={(e) => setSetDeliveryChargeDhaka(e.target.value)}
                        required 
                      />
                    </div>
                  </div>
                  <div className="admin-field" style={{ marginBottom: '20px' }}>
                    <label>Outside Dhaka Shipping Fee (৳)</label>
                    <input 
                      type="number" 
                      value={setDeliveryChargeOutside} 
                      onChange={(e) => setSetDeliveryChargeOutside(e.target.value)}
                      required 
                    />
                  </div>
                  <button type="submit" className="submit-btn" style={{ padding: '12px 28px', margin: 0 }}>
                    💾 Save Settings
                  </button>
                </form>
              </div>
            </section>
          )}

        </div>
      </div>

      {/* ADD / EDIT PRODUCT MODAL OVERLAY */}
      {isProductModalOpen && (
        <div className="auth-overlay" style={{ display: 'flex', padding: '20px 10px', alignItems: 'flex-start', overflowY: 'auto' }}>
          <div className="auth-card" style={{ maxWidth: '720px', width: '100%', padding: 0, borderRadius: 'var(--r-xl)', overflow: 'hidden', margin: 'auto' }}>
            {/* Header */}
            <div style={{ background: 'var(--dark-brown)', padding: '20px 28px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <h3 style={{ margin: 0, fontSize: '1.35rem', color: 'var(--cream)', fontFamily: "'Playfair Display', serif" }}>
                {editProductId ? 'Edit Product Specifications' : 'Add New Sourced Product'}
              </h3>
              <button onClick={closeProductCrudModal} style={{ background: 'rgba(255,255,255,0.15)', border: 'none', fontSize: '1.3rem', cursor: 'pointer', color: '#fff', width: '36px', height: '36px', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                ×
              </button>
            </div>
            
            {/* Form */}
            <form onSubmit={handleSaveProductSubmit} style={{ padding: '24px 28px' }}>
              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div className="admin-field">
                  <label>Product Name (English) *</label>
                  <input type="text" required value={prodNameEn} onChange={(e) => setProdNameEn(e.target.value)} placeholder="e.g. Sundarbans Honey" />
                </div>
                <div className="admin-field">
                  <label>Product Name (বাংলা) *</label>
                  <input type="text" required value={prodNameBn} onChange={(e) => setProdNameBn(e.target.value)} placeholder="e.g. সুন্দরবনের মধু" />
                </div>
              </div>

              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div className="admin-field">
                  <label>Category *</label>
                  <select required value={prodCategory} onChange={(e) => setProdCategory(e.target.value)}>
                    {categories.map(cat => (
                      <option key={cat.id} value={cat.id}>{cat.nameEn}</option>
                    ))}
                  </select>
                </div>
                <div className="admin-field">
                  <label>Stock Quantity *</label>
                  <input type="number" required value={prodStock} onChange={(e) => setProdStock(e.target.value)} placeholder="e.g. 50" />
                </div>
              </div>

              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div className="admin-field">
                  <label>Regular Price (৳) *</label>
                  <input type="number" required value={prodPrice} onChange={(e) => setProdPrice(e.target.value)} placeholder="e.g. 850" />
                </div>
                <div className="admin-field">
                  <label>Discount Price (৳, 0 = no discount)</label>
                  <input type="number" value={prodDiscountPrice} onChange={(e) => setProdDiscountPrice(e.target.value)} placeholder="e.g. 800" />
                </div>
              </div>

              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div className="admin-field">
                  <label>Unit (English) *</label>
                  <input type="text" required value={prodUnitEn} onChange={(e) => setProdUnitEn(e.target.value)} placeholder="e.g. kg, liter" />
                </div>
                <div className="admin-field">
                  <label>Unit (বাংলা) *</label>
                  <input type="text" required value={prodUnitBn} onChange={(e) => setProdUnitBn(e.target.value)} placeholder="e.g. কেজি, লিটার" />
                </div>
              </div>

              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '12px' }}>
                <div className="admin-field">
                  <label>Badge Label (English)</label>
                  <input type="text" value={prodBadgeEn} onChange={(e) => setProdBadgeEn(e.target.value)} placeholder="e.g. Organic, Best Seller" />
                </div>
                <div className="admin-field">
                  <label>Badge Label (বাংলা)</label>
                  <input type="text" value={prodBadgeBn} onChange={(e) => setProdBadgeBn(e.target.value)} placeholder="e.g. অর্গানিক" />
                </div>
              </div>

              <div className="admin-field" style={{ marginBottom: '12px' }}>
                <label>Product Image *</label>
                <div className="img-upload-zone" style={{ borderStyle: 'dashed' }}>
                  <span className="upload-icon">📸</span>
                  {prodImgName ? <p style={{ color: 'green', fontWeight: 'bold' }}>✓ {prodImgName}</p> : <p>Choose or drop product photo</p>}
                  <input 
                    type="file" 
                    accept="image/*"
                    style={{ margin: '8px auto', fontSize: '0.8rem' }}
                    onChange={(e) => {
                      if (e.target.files?.[0]) {
                        setProdImgName(e.target.files[0].name);
                        processImageFile(e.target.files[0], (data) => setProdImgData(data));
                      }
                    }}
                  />
                </div>
              </div>

              <div className="admin-field" style={{ marginBottom: '12px' }}>
                <label>Options</label>
                <div style={{ display: 'flex', gap: '20px' }}>
                  <label><input type="checkbox" checked={prodInStock} onChange={(e) => setProdInStock(e.target.checked)} /> In Stock</label>
                  <label><input type="checkbox" checked={prodIsFeatured} onChange={(e) => setProdIsFeatured(e.target.checked)} /> Featured Item</label>
                </div>
              </div>

              <div className="admin-form-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '20px' }}>
                <div className="admin-field">
                  <label>Description & Benefits (English) *</label>
                  <textarea required value={prodDescEn} onChange={(e) => setProdDescEn(e.target.value)} placeholder="Brief product description (enter benefits line-by-line)..." />
                </div>
                <div className="admin-field">
                  <label>Description & Benefits (বাংলা) *</label>
                  <textarea required value={prodDescBn} onChange={(e) => setProdDescBn(e.target.value)} placeholder="সংক্ষিপ্ত বিবরণ (প্রতি লাইনে একটি করে সুবিধা)..." />
                </div>
              </div>

              <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end', paddingTop: '14px', borderTop: '1px solid hsla(22,55%,13%,0.08)' }}>
                <button type="button" onClick={closeProductCrudModal} className="filter-btn" style={{ margin: 0, padding: '10px 20px' }}>Cancel</button>
                <button type="submit" className="submit-btn" style={{ margin: 0, padding: '10px 28px' }}>💾 Save Product</button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
