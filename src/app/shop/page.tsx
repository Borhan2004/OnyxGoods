'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { loadCatalogData } from '@/lib/db';
import { addToCart } from '@/lib/cart';
import { Category, Product } from '@/types';

function ShopContent() {
  const { currentLang, t, translateNumber } = useLanguage();
  const searchParams = useSearchParams();

  // State variables
  const [categories, setCategories] = useState<Category[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [filteredProducts, setFilteredProducts] = useState<Product[]>([]);
  
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const [maxPrice, setMaxPrice] = useState<number>(3000);
  const [sortBy, setSortBy] = useState<string>('featured');

  // Load catalog on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadCatalogData();
        setCategories(data.categories.filter(c => c.status !== 'Inactive'));
        setProducts(data.products);
      } catch (error) {
        console.error("Error loading shop catalog:", error);
      }
    }
    fetchData();
  }, []);

  // Parse category query parameter
  useEffect(() => {
    if (searchParams) {
      const catParam = searchParams.get('category');
      if (catParam) {
        setSelectedCategory(catParam);
      }
    }
  }, [searchParams]);

  // Apply filters and sorting
  useEffect(() => {
    let result = [...products];

    // Filter by Category
    if (selectedCategory) {
      result = result.filter(p => p.categoryId === selectedCategory);
    }

    // Filter by Search Query
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase();
      result = result.filter(p => 
        (p.nameEn && p.nameEn.toLowerCase().includes(query)) ||
        (p.nameBn && p.nameBn.includes(query)) ||
        (p.descEn && p.descEn.toLowerCase().includes(query)) ||
        (p.descBn && p.descBn.includes(query))
      );
    }

    // Filter by Price
    result = result.filter(p => {
      const price = p.discountPrice > 0 && p.discountPrice < p.price ? p.discountPrice : p.price;
      return price <= maxPrice;
    });

    // Sorting
    if (sortBy === 'low') {
      result.sort((a, b) => {
        const pA = a.discountPrice > 0 && a.discountPrice < a.price ? a.discountPrice : a.price;
        const pB = b.discountPrice > 0 && b.discountPrice < b.price ? b.discountPrice : b.price;
        return pA - pB;
      });
    } else if (sortBy === 'high') {
      result.sort((a, b) => {
        const pA = a.discountPrice > 0 && a.discountPrice < a.price ? a.discountPrice : a.price;
        const pB = b.discountPrice > 0 && b.discountPrice < b.price ? b.discountPrice : b.price;
        return pB - pA;
      });
    } else if (sortBy === 'newest') {
      result.sort((a, b) => new Date(b.createdAt || 0).getTime() - new Date(a.createdAt || 0).getTime());
    }

    setFilteredProducts(result);
  }, [products, selectedCategory, searchQuery, maxPrice, sortBy]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    window.dispatchEvent(new CustomEvent('show_onyx_toast', {
      detail: { message: t('toast-cart-added'), isError: false }
    }));
  };

  return (
    <main className="shop-container">
      {/* Sidebar Filters */}
      <aside className="shop-sidebar">
        {/* Search Sourced Items */}
        <div className="filter-group">
          <h4 className="filter-title" id="lbl-filter-search">
            {currentLang === 'en' ? 'Search Sourced Items' : 'পণ্য খুঁজুন'}
          </h4>
          <div className="filter-search-box">
            <input 
              type="text" 
              placeholder={t('lbl-search-placeholder')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>

        {/* Categories */}
        <div className="filter-group">
          <h4 className="filter-title" id="lbl-filter-cats">
            {currentLang === 'en' ? 'Categories' : 'ক্যাটাগরি সমূহ'}
          </h4>
          <ul className="filter-list" id="shop-categories-list">
            <li 
              className={selectedCategory === null ? 'active' : ''} 
              style={{ cursor: 'pointer' }}
              onClick={() => setSelectedCategory(null)}
            >
              {t('lbl-all-categories')}
            </li>
            {categories.map(cat => (
              <li 
                key={cat.id} 
                className={selectedCategory === cat.id ? 'active' : ''}
                style={{ cursor: 'pointer' }}
                onClick={() => setSelectedCategory(cat.id)}
              >
                {currentLang === 'en' ? cat.nameEn : cat.nameBn}
              </li>
            ))}
          </ul>
        </div>

        {/* Price Filter */}
        <div className="filter-group">
          <h4 className="filter-title" id="lbl-filter-price">
            {currentLang === 'en' ? 'Price Filter (BDT)' : 'মূল্য ফিল্টার (টাকা)'}
          </h4>
          <div className="filter-price-slider">
            <div className="price-inputs">
              <span>{currentLang === 'en' ? 'Max Price:' : 'সর্বোচ্চ মূল্য:'}</span>
              <input 
                type="number" 
                value={maxPrice} 
                min="0" 
                max="10000"
                onChange={(e) => setMaxPrice(Number(e.target.value))}
              />
            </div>
            <input 
              type="range" 
              className="slider-range" 
              min="0" 
              max="5000" 
              value={maxPrice}
              onChange={(e) => setMaxPrice(Number(e.target.value))}
            />
          </div>
        </div>
      </aside>

      {/* Products Main Area */}
      <section className="shop-main">
        {/* Toolbar */}
        <div className="shop-toolbar">
          <div className="toolbar-results">
            <span id="shop-results-count">{translateNumber(filteredProducts.length.toString())}</span>{' '}
            {currentLang === 'en' ? 'Sourced items found' : 'টি পণ্য পাওয়া গেছে'}
          </div>
          <div className="toolbar-sort">
            <span id="lbl-sort">{t('lbl-sort')}</span>
            <select value={sortBy} onChange={(e) => setSortBy(e.target.value)}>
              <option value="featured">{t('opt-sort-featured')}</option>
              <option value="low">{t('opt-sort-low')}</option>
              <option value="high">{t('opt-sort-high')}</option>
              <option value="newest">{t('opt-sort-newest')}</option>
            </select>
          </div>
        </div>

        {/* Grid */}
        <div className="products-grid" style={{ marginTop: 0 }}>
          {filteredProducts.length === 0 ? (
            <div style={{ gridColumn: '1/-1', textAlign: 'center', padding: '60px 20px', color: 'var(--text-muted)' }}>
              {currentLang === 'en' ? 'No products match your filters.' : 'কোনো পণ্য পাওয়া যায়নি।'}
            </div>
          ) : (
            filteredProducts.map(prod => {
              const hasDiscount = prod.discountPrice > 0 && prod.discountPrice < prod.price;
              const badgeText = currentLang === 'en' ? prod.badgeEn : prod.badgeBn;

              return (
                <div key={prod.id} className="product-card">
                  {badgeText && <span className="product-badge premium">{badgeText}</span>}
                  <div className="product-img-wrap">
                    <Link href={`/product?id=${prod.id}`}>
                      <img src={prod.imagePath || '/logo.jpg'} className="product-img-pic" alt={prod.nameEn} />
                    </Link>
                  </div>
                  <div className="product-body">
                    <h3 className="product-name">
                      <Link href={`/product?id=${prod.id}`} style={{ textDecoration: 'none', color: 'inherit' }}>
                        {currentLang === 'en' ? prod.nameEn : prod.nameBn}
                      </Link>
                    </h3>
                    <p className="product-desc">
                      {currentLang === 'en' ? prod.descEn : prod.descBn}
                    </p>
                    
                    <div className="product-footer" style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
                      <div className="price-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div className="price" style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          {hasDiscount ? (
                            <>
                              <span style={{ textDecoration: 'line-through', fontSize: '0.9rem', color: 'var(--text-muted)' }}>
                                ৳{translateNumber(prod.price)}
                              </span>
                              <span style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--brown)' }}>
                                ৳{translateNumber(prod.discountPrice)}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontSize: '1.45rem', fontWeight: '800', color: 'var(--brown)' }}>
                              ৳{translateNumber(prod.price)}
                            </span>
                          )}
                        </div>
                        <div className="price-unit" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          /{currentLang === 'en' ? prod.unitEn : prod.unitBn}
                        </div>
                      </div>

                      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1.2fr', gap: '8px' }}>
                        <Link href={`/product?id=${prod.id}`} className="btn-outline" style={{ padding: '10px 0', fontSize: '0.85rem', textAlign: 'center', display: 'block', justifyContent: 'center' }}>
                          {t('btn-quick-view')}
                        </Link>
                        <button 
                          onClick={() => handleAddToCart(prod)}
                          className="btn-primary" 
                          style={{ padding: '10px 0', fontSize: '0.85rem', boxShadow: 'none', justifyContent: 'center', width: '100%' }}
                        >
                          {t('btn-add-to-cart')}
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </section>
    </main>
  );
}

export default function ShopPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}>Loading marketplace...</div>}>
      <ShopContent />
    </Suspense>
  );
}
