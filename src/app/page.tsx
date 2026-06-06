'use client';

import React, { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useLanguage } from '@/context/LanguageContext';
import { loadCatalogData } from '@/lib/db';
import { addToCart } from '@/lib/cart';
import { Category, Product } from '@/types';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';

if (typeof window !== 'undefined') {
  gsap.registerPlugin(ScrollTrigger);
}

export default function HomePage() {
  const { currentLang, t, translateNumber } = useLanguage();
  const [categories, setCategories] = useState<Category[]>([]);
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const [newsletterEmail, setNewsletterEmail] = useState<string>('');
  const [subscribed, setSubscribed] = useState<boolean>(false);
  const categoryContainerRef = useRef<HTMLDivElement>(null);

  // GSAP scroll triggered categories animation
  useEffect(() => {
    if (categories.length === 0) return;

    const ctx = gsap.context(() => {
      // Cards stagger in from below with scale
      gsap.from('.gsap-category-card', {
        opacity: 0,
        y: 60,
        scale: 0.93,
        stagger: {
          amount: 0.55,
          from: 'start',
          ease: 'power1.inOut',
        },
        duration: 0.85,
        ease: 'power3.out',
        scrollTrigger: {
          trigger: categoryContainerRef.current,
          start: 'top 78%',
          toggleActions: 'play none none none',
        },
      });
    }, categoryContainerRef);

    const timer = setTimeout(() => {
      ScrollTrigger.refresh();
    }, 300);

    return () => {
      ctx.revert();
      clearTimeout(timer);
    };
  }, [categories]);

  // Load catalog data on mount
  useEffect(() => {
    async function fetchData() {
      try {
        const data = await loadCatalogData();
        setCategories(data.categories.filter(c => c.status !== 'Inactive').slice(0, 6));
        setFeaturedProducts(data.products.filter(p => p.isFeatured && p.inStock).slice(0, 6));
      } catch (error) {
        console.error("Error loading homepage data:", error);
      }
    }
    fetchData();
  }, []);

  // Intersection Observer for scroll reveal animations
  useEffect(() => {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('reveal-active');
        }
      });
    }, { threshold: 0.15 });

    const elements = document.querySelectorAll('.reveal-fade, .reveal-up, .reveal-left, .reveal-right, .reveal-scale');
    elements.forEach(el => observer.observe(el));

    return () => {
      elements.forEach(el => observer.unobserve(el));
    };
  }, [categories, featuredProducts]);

  const handleAddToCart = (product: Product) => {
    addToCart(product, 1);
    window.dispatchEvent(new CustomEvent('show_onyx_toast', {
      detail: { message: t('toast-cart-added'), isError: false }
    }));
  };

  const handleSubscribe = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newsletterEmail) return;
    setSubscribed(true);
    setNewsletterEmail('');
    window.dispatchEvent(new CustomEvent('show_onyx_toast', {
      detail: { message: currentLang === 'en' ? 'Subscribed successfully!' : 'সফলভাবে সাবস্ক্রাইব করা হয়েছে!', isError: false }
    }));
  };

  return (
    <main>
      {/* HERO SECTION */}
      <section className="hero">
        <div className="hero-bg-blob blob-1"></div>
        <div className="hero-bg-blob blob-2"></div>

        <div className="hero-left">
          <div className="hero-badge">
            <span className="badge-dot"></span>
            {currentLang === 'en' ? '100% Organic Sourced' : '১০০% প্রাকৃতিক সোর্সিং'}
          </div>
          <h1>
            {currentLang === 'en' ? (
              <>Pure Village Delights Delivered to Your <em>Home</em></>
            ) : (
              <>গ্রামের খাঁটি পণ্য সরাসরি আপনার <em>দ্বারে</em></>
            )}
          </h1>
          <p className="hero-sub">
            {currentLang === 'en'
              ? 'Sourced directly from rural Bangladeshi farmers, bringing you fresh dairy, organic honey, aromatic rice, and handcrafted products with absolute trust.'
              : 'বাংলাদেশের প্রান্তিক গ্রামের খামারি ও কারিগরদের থেকে সরাসরি সংগ্রহীত তাজা দুগ্ধজাত খাবার, প্রাকৃতিক মধু, সুগন্ধি চাল এবং ঐতিহ্যবাহী হস্তশিল্প পৌঁছে দিচ্ছি আপনার পরিবারে।'}
          </p>
          <div className="hero-actions">
            <Link href="/shop" className="btn-primary">
              {t('btn-shop-now')}
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M5 12h14M12 5l7 7-7 7"/></svg>
            </Link>
            <a href="#categories" className="btn-outline">
              {t('btn-explore-cats')}
            </a>
          </div>

          <div className="hero-stats">
            <div className="stat-item">
              <div className="stat-num">{translateNumber('5K')}+</div>
              <div className="stat-unit">{currentLang === 'en' ? 'Deliveries' : 'ডেলিভারি'}</div>
              <div className="stat-label">{currentLang === 'en' ? 'Sourced Goods' : 'সংগৃহীত পণ্য'}</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-num">{translateNumber('98')}%</div>
              <div className="stat-unit">{currentLang === 'en' ? 'Happy' : 'সন্তুষ্ট'}</div>
              <div className="stat-label">{currentLang === 'en' ? 'Urban Families' : 'শহুরে পরিবার'}</div>
            </div>
            <div className="stat-divider"></div>
            <div className="stat-item">
              <div className="stat-num">{translateNumber('12')}+</div>
              <div className="stat-unit">{currentLang === 'en' ? 'Districts' : 'জেলা'}</div>
              <div className="stat-label">{currentLang === 'en' ? 'Rural Partners' : 'গ্রামীণ অংশীদার'}</div>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-image-frame">
            <img src="/images/about_farm.png" className="hero-img" alt="Village Sourced Goods" />
            <div className="hero-badge-float badge-float-top">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14M22 4L12 14.01l-3-3"/></svg>
              {currentLang === 'en' ? 'Verified Quality' : 'মান যাচাইকৃত'}
            </div>
            <div className="hero-badge-float badge-float-bottom">
              {'🔑'} {currentLang === 'en' ? 'Direct From Sourced Village' : 'সরাসরি গ্রাম থেকে সোর্সড'}
            </div>
          </div>
          <span className="floating-leaf leaf-1">{'🍃'}</span>
          <span className="floating-leaf leaf-2">{'🌾'}</span>
        </div>
      </section>

      {/* CATEGORIES SECTION */}
      <section className="products cat-section" id="categories" ref={categoryContainerRef}>
        <div className="section-header reveal-up">
          <span className="section-label">
            {currentLang === 'en' ? 'Categories' : 'ক্যাটাগরি সমূহ'}
          </span>
          <h2>
            {currentLang === 'en' ? 'Browse Our Collections' : 'আমাদের কালেকশন দেখুন'}
          </h2>
          <p className="section-sub">
            {currentLang === 'en'
              ? 'Handpicked sections from the rich culinary and artisan heritage of rural Bangladesh.'
              : 'আমাদের গ্রামীণ ঐতিহ্য থেকে বিশেষভাবে প্রস্তুতকৃত ক্যাটাগরি সমূহ।'}
          </p>
        </div>

        <div className="cat-clean-grid">
          {categories.map((cat, index) => (
            <Link
              href={`/shop?category=${cat.id}`}
              key={cat.id}
              className="cat-clean-card gsap-category-card"
              style={{ '--card-delay': `${index * 0.08}s` } as React.CSSProperties}
            >
              <div className="cat-clean-img-wrap">
                <img
                  src={cat.imagePath || '/logo.jpg'}
                  className="cat-clean-img"
                  alt={currentLang === 'en' ? cat.nameEn : cat.nameBn}
                />
              </div>
              <div className="cat-clean-body">
                <h3 className="cat-clean-name">
                  {currentLang === 'en' ? cat.nameEn : cat.nameBn}
                </h3>
                <p className="cat-clean-desc">
                  {currentLang === 'en' ? cat.descriptionEn : cat.descriptionBn}
                </p>
                <span className="cat-clean-cta">
                  {currentLang === 'en' ? 'Explore' : 'দেখুন'}
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5">
                    <path d="M5 12h14M12 5l7 7-7 7"/>
                  </svg>
                </span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* TRUST STRIP */}
      <section className="trust-strip">
        <div className="trust-item">
          <div className="trust-icon-wrap">{'🌾'}</div>
          <div>{currentLang === 'en' ? 'Direct Sourcing Model' : 'সরাসরি সোর্সিং মডেল'}</div>
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <div className="trust-icon-wrap">{'🍯'}</div>
          <div>{currentLang === 'en' ? 'Chemical Free Standard' : 'রাসায়নিক মুক্ত মান'}</div>
        </div>
        <div className="trust-divider"></div>
        <div className="trust-item">
          <div className="trust-icon-wrap">{'🤝'}</div>
          <div>{currentLang === 'en' ? 'Fair Trade for Farmers' : 'কৃষকের ন্যায়্য মূল্য'}</div>
        </div>
      </section>

      {/* OUR STORY / ABOUT */}
      <section className="about" id="story">
        <div className="about-image-wrap reveal-left">
          <div className="about-img-container">
            <img src="/images/about_farm.png" className="about-img" alt="Bangladeshi Village Farm" />
          </div>
          <div className="about-tag">
            <strong>{translateNumber('100')}%</strong> {currentLang === 'en' ? 'Authentic' : 'খাঁটি ও তাজা'}
          </div>
          <div className="about-img-badge">
            {'🌿'} {currentLang === 'en' ? 'Tradition Sourced' : 'ঐতিহ্যবাহী উপায়ে প্রস্তুত'}
          </div>
        </div>
        <div className="about-details reveal-right">
          <span className="section-label">{currentLang === 'en' ? 'Our Story' : 'আমাদের গল্প'}</span>
          <h2>
            {currentLang === 'en' ? (
              <>Bridging <em>Village Roots</em> with <em>Urban Trust</em></>
            ) : (
              <>গ্রামের <em>শেকড়</em> এবং শহরের <em>আস্থার</em> বন্ধন</>
            )}
          </h2>
          <p>
            {currentLang === 'en'
              ? "At OnyxGoods, we believe that the best things in life are simple, traditional, and close to nature. Our journey started in Bangladesh's green countryside, where we saw hard-working farmers and artisans creating outstanding goods using techniques passed down through generations."
              : 'শিকড়ে আমরা বিশ্বাস করি যে জীবনের সেরা জিনিসগুলো সহজ, ঐতিহ্যবাহী এবং প্রকৃতির কাছাকাছি থাকে। আমাদের যাত্রা শুরু বাংলাদেশের সবুজ গ্রামগুলোতে, যেখানে আমরা দেখেছি কঠোর পরিশ্রমী কৃষক এবং কারিগরদের বংশ পরম্পরায় চমৎকার সব পণ্য তৈরি করতে।'}
          </p>
          <p>
            {currentLang === 'en'
              ? 'By removing unnecessary middlemen, we pay fair wages directly to village households while delivering premium quality, unadulterated essentials to urban doorsteps.'
              : 'মাঝারি দালালদের বাদ দিয়ে আমরা সরাসরি গ্রামীণ পরিবারগুলোকে ন্যায়্য পারিশ্রমিক দিই এবং শহরের দরজায় প্রিমিয়াম মানের ভেজালমুক্ত নিত্যপ্রয়োজনীয় জিনিস পৌঁছে দিই।'}
          </p>
          <ul className="check-list">
            <li>{currentLang === 'en' ? '100% chemical-free natural items' : '১০০% কেমিকেল ও প্রিজার্ভেটিভ মুক্ত প্রাকৃতিক উপাদান'}</li>
            <li>{currentLang === 'en' ? 'Empowers rural cottage-industry women' : 'গ্রামীণ কুটির শিল্পের নারীদের অর্থনৈতিক স্বাবলম্বী করা'}</li>
            <li>{currentLang === 'en' ? 'Recurrent lab checks for quality and purity' : 'গুণমান ও বিশুদ্ধতা বজায় রাখতে নিয়মিত ল্যাব পরীক্ষা'}</li>
          </ul>
          <Link href="/shop" className="btn-primary">{t('btn-shop-now')}</Link>
        </div>
      </section>

      {/* FEATURED PRODUCTS */}
      <section className="products" id="featured">
        <div className="section-header reveal-up">
          <span className="section-label">{currentLang === 'en' ? 'Featured Items' : 'সেরা পণ্যসমূহ'}</span>
          <h2>{currentLang === 'en' ? 'Best Sellers of the Season' : 'চলতি মৌসুমের সেরা বিক্রীত পণ্য'}</h2>
          <p className="section-sub">
            {currentLang === 'en'
              ? 'Fresh, pure, and highly rated by families across Dhaka. Limited batches available.'
              : 'বিশুদ্ধ, তাজা এবং ঢাকা শহরের গ্রাহকদের মাঝে ব্যাপক সমাদৃত খাবার ও সামগ্রী।'}
          </p>
        </div>

        <div className="ecom-products-grid">
          {featuredProducts.map((prod, idx) => {
            const hasDiscount = prod.discountPrice > 0 && prod.discountPrice < prod.price;
            const badgeText = currentLang === 'en' ? prod.badgeEn : prod.badgeBn;

            return (
              <div
                key={prod.id}
                className="ecom-product-card reveal-scale"
                style={{ '--card-delay': `${idx * 0.08}s` } as React.CSSProperties}
              >
                {badgeText && (
                  <span className="ecom-card-badge">{badgeText}</span>
                )}

                <Link href={`/product?id=${prod.id}`} className="ecom-card-img-link">
                  <div className="ecom-card-img-wrap">
                    <img
                      src={prod.imagePath || '/logo.jpg'}
                      className="ecom-card-img"
                      alt={prod.nameEn}
                    />
                    <div className="ecom-card-qv-overlay">
                      <span className="ecom-card-qv-btn">
                        {currentLang === 'en' ? 'Quick View' : 'দেখুন'}
                      </span>
                    </div>
                  </div>
                </Link>

                <div className="ecom-card-body">
                  <h3 className="ecom-card-title">
                    <Link href={`/product?id=${prod.id}`}>
                      {currentLang === 'en' ? prod.nameEn : prod.nameBn}
                    </Link>
                  </h3>

                  <p className="ecom-card-desc">
                    {currentLang === 'en' ? prod.descEn : prod.descBn}
                  </p>

                  <div className="ecom-card-price-row">
                    <span className="ecom-card-price">
                      {'৳'}{hasDiscount ? translateNumber(prod.discountPrice) : translateNumber(prod.price)}
                    </span>
                    <span className="ecom-card-unit">
                      /{currentLang === 'en' ? prod.unitEn : prod.unitBn}
                    </span>
                  </div>

                  <div className="ecom-card-actions">
                    <Link href={`/product?id=${prod.id}`} className="ecom-card-view-btn">
                      {t('btn-quick-view')}
                    </Link>
                    <button
                      onClick={() => handleAddToCart(prod)}
                      className="ecom-card-cart-btn"
                    >
                      <svg width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
                        <path d="M6 2L3 6v14a2 2 0 002 2h14a2 2 0 002-2V6l-3-4zM3 6h18M16 10a4 4 0 01-8 0"/>
                      </svg>
                      {t('btn-add-to-cart')}
                    </button>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </section>

      {/* TESTIMONIALS SECTION */}
      <section className="products" id="reviews" style={{ background: 'linear-gradient(to bottom, var(--warm-white) 0%, var(--cream) 100%)' }}>
        <div className="section-header reveal-up">
          <span className="section-label">{currentLang === 'en' ? 'Reviews' : 'গ্রাহকদের রিভিউ'}</span>
          <h2>{currentLang === 'en' ? 'Loved by Families' : 'আমাদের ওপর গ্রাহকদের আস্থা'}</h2>
          <p className="section-sub">
            {currentLang === 'en'
              ? 'Hear from real households who have made OnyxGoods their daily source of wellness.'
              : 'ঢাকা শহরের বিভিন্ন পরিবারের কিছু বাস্তব মতামত ও আমাদের প্রতি তাদের ভালোবাসা।'}
          </p>
        </div>

        <div className="products-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))' }}>
          <div className="product-card reveal-up" style={{ padding: '32px', '--t-delay': '0s' } as React.CSSProperties}>
            <div style={{ color: 'var(--amber)', fontSize: '1.5rem', marginBottom: '14px' }}>&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
              {currentLang === 'en'
                ? '"The raw cow milk is outstanding. My kids love it, and I am completely satisfied with the thick cream layer. Reminds me of my childhood village visits."'
                : '"গরুর কাঁচা দুধটা অসাধারণ। বাচ্চারা খুব পছন্দ করে এবং এর ঘন মালাই দেখে আমি ভীষণ সন্তুষ্ট। ছোটবেলার গ্রামে বেড়াতে যাওয়ার কথা মনে করিয়ে দেয়।"'}
            </p>
            <div>
              <strong style={{ color: 'var(--dark-brown)' }}>Nusrat Jahan</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Mirpur-2, Dhaka</div>
            </div>
          </div>

          <div className="product-card reveal-up" style={{ padding: '32px', '--t-delay': '0.1s' } as React.CSSProperties}>
            <div style={{ color: 'var(--amber)', fontSize: '1.5rem', marginBottom: '14px' }}>&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
              {currentLang === 'en'
                ? '"Authentic mustard oil is very hard to find in the city. OnyxGoods cold-pressed mustard oil has that strong, natural pungency. Will definitely order again!"'
                : '"শহরের বুকে খাঁটি সরিষার তেল পাওয়া খুবই কঠিন। শিকড়ের কাঠের ঘানির তেলটির খাঁটি ঝাঁঝ এবং গন্ধ অনন্য। আমি নিয়মিত অর্ডার করব!"'}
            </p>
            <div>
              <strong style={{ color: 'var(--dark-brown)' }}>Imtiaz Ahmed</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Dhanmondi, Dhaka</div>
            </div>
          </div>

          <div className="product-card reveal-up" style={{ padding: '32px', '--t-delay': '0.2s' } as React.CSSProperties}>
            <div style={{ color: 'var(--amber)', fontSize: '1.5rem', marginBottom: '14px' }}>&#9733;&#9733;&#9733;&#9733;&#9733;</div>
            <p style={{ fontStyle: 'italic', color: 'var(--text-muted)', marginBottom: '20px', fontSize: '0.95rem' }}>
              {currentLang === 'en'
                ? '"We ordered their Nakshikantha and sesame brittle. The handwork on the quilt is incredibly fine, and the sesame brittle is crunchy and fresh. Truly premium!"'
                : '"আমরা এদের একটি নকশিকাঁথা এবং কুষ্টিয়ার তিলের খাজা অর্ডার করেছিলাম। কাঁথার হাতের কাজ খুবই সূক্ষ্ম এবং তিলের খাজাগুলো চমৎকার মচমচে। আসলেই অনন্য!"'}
            </p>
            <div>
              <strong style={{ color: 'var(--dark-brown)' }}>Farzana Islam</strong>
              <div style={{ fontSize: '0.75rem', color: 'var(--text-muted)' }}>Uttara, Dhaka</div>
            </div>
          </div>
        </div>
      </section>

      {/* NEWSLETTER */}
      <section style={{ background: 'var(--dark-brown)', color: 'var(--cream)', padding: '80px 20px', textAlign: 'center' }}>
        <div style={{ maxWidth: '600px', margin: '0 auto' }}>
          <h2 style={{ color: 'var(--cream)', fontSize: '2.2rem', marginBottom: '12px' }}>
            {currentLang === 'en' ? 'Get updates on fresh batches' : 'নতুন ব্যাচ সোর্সিং-এর খবর পান'}
          </h2>
          <p style={{ color: 'var(--cream-mid)', marginBottom: '32px', fontSize: '0.98rem' }}>
            {currentLang === 'en'
              ? 'Subscribe to receive notifications when fresh honey, seasonal mangoes, or village ghee are sourced and shipped to Dhaka.'
              : 'সুন্দরবনের খাঁটি মধু, রাজশাহীর আম বা গ্রামের ঘি যখনই সোর্স করা হবে, তখনই নোটিফিকেশন পেতে সাবস্ক্রাইব করুন।'}
          </p>
          {subscribed ? (
            <div style={{ color: 'var(--gold)', fontWeight: '600', padding: '16px' }}>
              {'🎉'} {currentLang === 'en' ? 'Thank you for subscribing!' : 'সাবস্ক্রাইব করার জন্য আপনাকে ধন্যবাদ!'}
            </div>
          ) : (
            <form onSubmit={handleSubscribe} style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <input
                type="email"
                placeholder={currentLang === 'en' ? 'Enter email address' : 'আপনার ইমেইল দিন'}
                value={newsletterEmail}
                onChange={(e) => setNewsletterEmail(e.target.value)}
                required
                style={{ padding: '15px 24px', borderRadius: '50px', border: 'none', width: '100%', maxWidth: '350px', fontFamily: "'Outfit', sans-serif" }}
              />
              <button type="submit" className="btn-primary" style={{ background: 'var(--gold)', color: 'var(--dark-brown)', boxShadow: 'none' }}>
                {currentLang === 'en' ? 'Subscribe' : 'সাবস্ক্রাইব'}
              </button>
            </form>
          )}
        </div>
      </section>
    </main>
  );
}
