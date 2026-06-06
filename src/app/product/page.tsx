'use client';

import React, { useState, useEffect, Suspense } from 'react';
import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useLanguage } from '@/context/LanguageContext';
import { loadCatalogData } from '@/lib/db';
import { addToCart } from '@/lib/cart';
import { Product } from '@/types';

function ProductContent() {
  const { currentLang, t, translateNumber } = useLanguage();
  const searchParams = useSearchParams();
  const productId = searchParams ? searchParams.get('id') : null;

  const [product, setProduct] = useState<Product | null>(null);
  const [relatedProducts, setRelatedProducts] = useState<Product[]>([]);
  const [quantity, setQuantity] = useState<number>(1);
  const [loading, setLoading] = useState<boolean>(true);

  // Load product and related ones on mount / change
  useEffect(() => {
    async function fetchProduct() {
      if (!productId) {
        setLoading(false);
        return;
      }
      setLoading(true);
      try {
        const data = await loadCatalogData();
        const found = data.products.find(p => p.id === productId);
        if (found) {
          setProduct(found);
          const related = data.products
            .filter(p => p.categoryId === found.categoryId && p.id !== found.id && p.inStock)
            .slice(0, 3);
          setRelatedProducts(related);
        } else {
          setProduct(null);
        }
      } catch (error) {
        console.error("Error fetching product details:", error);
      } finally {
        setLoading(false);
      }
    }
    fetchProduct();
    setQuantity(1);
  }, [productId]);

  const handleQtyChange = (val: number) => {
    const newVal = Math.max(1, Math.min(product?.stock || 99, val));
    setQuantity(newVal);
  };

  const handleAddToCart = () => {
    if (!product) return;
    addToCart(product, quantity);
    window.dispatchEvent(new CustomEvent('show_onyx_toast', {
      detail: { message: t('toast-cart-added'), isError: false }
    }));
  };

  if (loading) {
    return <div style={{ textAlign: 'center', padding: '100px', fontSize: '1.2rem' }}>Loading product details...</div>;
  }

  if (!product) {
    return (
      <div style={{ textAlign: 'center', padding: '100px 20px' }}>
        <h2 style={{ color: 'var(--dark-brown)' }}>
          {currentLang === 'en' ? 'Product Not Found' : 'পণ্যটি পাওয়া যায়নি'}
        </h2>
        <p style={{ color: 'var(--text-muted)', margin: '20px 0 30px' }}>
          {currentLang === 'en' ? 'The product you are looking for might have been removed or does not exist.' : 'আপনার কাঙ্ক্ষিত পণ্যটি মার্কেটপ্লেসে খুঁজে পাওয়া যায়নি।'}
        </p>
        <Link href="/shop" className="btn-primary">
          {currentLang === 'en' ? 'Return to Shop' : 'মার্কেটপ্লেসে ফিরে যান'}
        </Link>
      </div>
    );
  }

  const hasDiscount = product.discountPrice > 0 && product.discountPrice < product.price;
  const benefitsList = currentLang === 'en' ? product.benefitsEn : product.benefitsBn;

  return (
    <main style={{ maxWidth: '1200px', margin: '0 auto', padding: '120px 20px 80px' }}>
      
      {/* Back Button */}
      <div style={{ maxWidth: '1100px', margin: '0 auto 24px' }}>
        <Link href="/shop" style={{ display: 'inline-flex', alignItems: 'center', gap: '8px', textDecoration: 'none', color: 'var(--brown)', fontWeight: '600', fontFamily: "'Outfit', sans-serif" }}>
          ← {currentLang === 'en' ? 'Back to Marketplace' : 'মার্কেটপ্লেসে ফিরে যান'}
        </Link>
      </div>

      {/* Main product card layout */}
      <section className="product-detail-container" style={{ margin: '0 auto 80px' }}>
        
        {/* Left Gallery */}
        <div className="product-gallery">
          <div className="main-image-wrap">
            <img 
              src={product.imagePath || '/logo.jpg'} 
              alt={product.nameEn} 
            />
          </div>
        </div>

        {/* Right Info Details */}
        <div className="product-info-panel">
          {product.badgeEn && (
            <span className="product-meta-badge">
              {currentLang === 'en' ? product.badgeEn : product.badgeBn}
            </span>
          )}
          <h1 className="product-title">
            {currentLang === 'en' ? product.nameEn : product.nameBn}
          </h1>

          <div className="product-price-block">
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              {hasDiscount ? (
                <>
                  <span className="product-price-old">
                    ৳{translateNumber(product.price)}
                  </span>
                  <span className="product-price-current">
                    ৳{translateNumber(product.discountPrice)}
                  </span>
                </>
              ) : (
                <span className="product-price-current">
                  ৳{translateNumber(product.price)}
                </span>
              )}
              <span className="price-unit" style={{ fontSize: '1.1rem', fontFamily: "'Outfit', sans-serif", color: 'var(--text-muted)' }}>/{currentLang === 'en' ? product.unitEn : product.unitBn}</span>
            </div>

            {/* Stock indicator */}
            <span className={`product-stock-tag ${product.inStock ? 'stock-in' : 'stock-out'}`}>
              {product.inStock ? t('lbl-in-stock') : t('lbl-out-stock')}
            </span>
          </div>

          <p className="product-desc-text">
            {currentLang === 'en' ? product.descEn : product.descBn}
          </p>

          {/* Benefits Checkbox list */}
          {benefitsList && benefitsList.length > 0 && (
            <div className="product-benefits">
              <h4 className="benefits-title">
                {t('lbl-benefits')}
              </h4>
              <ul className="benefits-list-detail">
                {benefitsList.map((benefit, i) => (
                  <li key={i}>{benefit}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Add to Cart Actions */}
          {product.inStock && (
            <div className="qty-and-cart-row">
              <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
                <span style={{ fontFamily: "'Outfit', sans-serif", fontWeight: '600', fontSize: '0.9rem' }}>{t('lbl-qty')}:</span>
                <div className="quantity-box">
                  <button 
                    onClick={() => handleQtyChange(quantity - 1)}
                  >
                    -
                  </button>
                  <input 
                    type="number" 
                    value={quantity}
                    onChange={(e) => handleQtyChange(Number(e.target.value))}
                  />
                  <button 
                    onClick={() => handleQtyChange(quantity + 1)}
                  >
                    +
                  </button>
                </div>
              </div>

              <button 
                onClick={handleAddToCart}
                className="btn-primary btn-details-cart"
              >
                🛒 {t('btn-add-to-cart')}
              </button>
            </div>
          )}

        </div>
      </section>

      {/* Related Products */}
      {relatedProducts.length > 0 && (
        <section style={{ maxWidth: '1100px', margin: '80px auto 0', borderTop: 'var(--border-light)', paddingTop: '60px' }}>
          <h2 style={{ marginBottom: '36px', fontSize: '1.8rem', color: 'var(--dark-brown)' }}>
            {t('lbl-related')}
          </h2>
          <div className="products-grid">
            {relatedProducts.map(prod => {
              const relDiscount = prod.discountPrice > 0 && prod.discountPrice < prod.price;
              const relBadge = currentLang === 'en' ? prod.badgeEn : prod.badgeBn;

              return (
                <div key={prod.id} className="product-card">
                  {relBadge && <span className="product-badge premium">{relBadge}</span>}
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
                    
                    <div className="product-footer" style={{ marginTop: 'auto', paddingTop: '16px', display: 'flex', flexDirection: 'column', gap: '12px', alignItems: 'stretch' }}>
                      <div className="price-wrap" style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                        <div className="price" style={{ display: 'flex', alignItems: 'baseline', gap: '6px' }}>
                          {relDiscount ? (
                            <>
                              <span style={{ textDecoration: 'line-through', fontSize: '0.85rem', color: 'var(--text-muted)' }}>
                                ৳{translateNumber(prod.price)}
                              </span>
                              <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--brown)' }}>
                                ৳{translateNumber(prod.discountPrice)}
                              </span>
                            </>
                          ) : (
                            <span style={{ fontSize: '1.35rem', fontWeight: '800', color: 'var(--brown)' }}>
                              ৳{translateNumber(prod.price)}
                            </span>
                          )}
                        </div>
                        <div className="price-unit" style={{ fontSize: '0.8rem', color: 'var(--text-muted)' }}>
                          /{currentLang === 'en' ? prod.unitEn : prod.unitBn}
                        </div>
                      </div>

                      <Link href={`/product?id=${prod.id}`} className="btn-outline" style={{ padding: '10px 0', fontSize: '0.85rem', textAlign: 'center', display: 'block', justifyContent: 'center', width: '100%' }}>
                        {t('btn-quick-view')}
                      </Link>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </section>
      )}

    </main>
  );
}

export default function ProductPage() {
  return (
    <Suspense fallback={<div style={{ textAlign: 'center', padding: '100px' }}>Loading product details...</div>}>
      <ProductContent />
    </Suspense>
  );
}
