'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'

interface Stock { total: number; reserved: number }
interface Product { id: string; name: string; description: string; price: number; imageUrl: string; stocks: Stock[] }

const PRODUCT_OVERRIDES: Record<string, { image: string; tag: string; highlight: string; displayName?: string }> = {
  'product-1': {
    image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80',
    tag: 'Best Seller',
    highlight: 'Active Noise Cancellation · 40hr Battery · Premium Sound'
  },
  'product-2': {
    image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80',
    tag: 'Popular',
    highlight: 'Cherry MX Switches · RGB Backlit · Anti-Ghosting',
    displayName: 'Keyboard'
  },
  'product-3': {
    image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80',
    tag: 'New Arrival',
    highlight: 'HDMI · USB-A x3 · SD Card · PD Charging',
    displayName: 'Laptop'
  },
  'product-4': {
image: 'https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=600&q=80',    
tag: 'Top Rated',
    highlight: '1080p Full HD · Built-in Mic · Auto Light Correction',
    displayName: 'Webcam HD'
  },
}

const HERO_IMAGES = [
  'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=400&q=80',
  'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=400&q=80',
  'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=400&q=80',
  'https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=600&q=80',
]

export default function Home() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [reserving, setReserving] = useState<string | null>(null)
  const [activeImg, setActiveImg] = useState(0)
  const router = useRouter()

  useEffect(() => {
    fetch('/api/products').then(r => r.json()).then(data => { setProducts(data); setLoading(false) })
  }, [])

  useEffect(() => {
    const t = setInterval(() => setActiveImg(i => (i + 1) % HERO_IMAGES.length), 2500)
    return () => clearInterval(t)
  }, [])

  const getAvailable = (stocks: Stock[]) => stocks.reduce((acc, s) => acc + s.total - s.reserved, 0)

  const handleReserve = async (productId: string) => {
    setReserving(productId)
    try {
      const res = await fetch('/api/reservations', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ productId, quantity: 1 }) })
      const data = await res.json()
      if (!res.ok) { alert(data.error || 'Failed to reserve'); return }
      router.push(`/checkout?reservationId=${data.id}&productId=${productId}`)
    } catch { alert('Something went wrong!') } finally { setReserving(null) }
  }

  if (loading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', background: '#080810' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ width: 48, height: 48, border: '2px solid #d4af37', borderTopColor: 'transparent', borderRadius: '50%', animation: 'spin 0.9s linear infinite', margin: '0 auto 20px' }}></div>
        <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, letterSpacing: 6, color: '#666', textTransform: 'uppercase' }}>Loading Collection</p>
      </div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', background: '#080810', color: '#f0ede6' }}>
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;0,500;1,300;1,400&family=Montserrat:wght@300;400;500;600&display=swap');
        *{box-sizing:border-box;margin:0;padding:0}
        body{background:#080810}
        @keyframes spin{to{transform:rotate(360deg)}}
        @keyframes fadeUp{from{opacity:0;transform:translateY(40px)}to{opacity:1;transform:translateY(0)}}
        @keyframes fadeIn{from{opacity:0;transform:scale(1.04)}to{opacity:1;transform:scale(1)}}
        @keyframes float{0%,100%{transform:translateY(0)}50%{transform:translateY(-12px)}}
        @keyframes pulse{0%,100%{opacity:1}50%{opacity:0.4}}
        @keyframes gradientShift{0%{background-position:0% 50%}50%{background-position:100% 50%}100%{background-position:0% 50%}}
        @keyframes rotateSlow{from{transform:rotate(0deg)}to{transform:rotate(360deg)}}
        .card{animation:fadeUp 0.7s ease forwards;opacity:0;transition:transform 0.45s cubic-bezier(0.25,0.46,0.45,0.94),box-shadow 0.45s ease}
        .card:nth-child(1){animation-delay:0.05s}
        .card:nth-child(2){animation-delay:0.15s}
        .card:nth-child(3){animation-delay:0.25s}
        .card:nth-child(4){animation-delay:0.35s}
        .card:hover{transform:translateY(-10px);box-shadow:0 30px 70px rgba(212,175,55,0.18),0 0 0 1px rgba(212,175,55,0.1)}
        .card:hover .cimg{transform:scale(1.08)}
        .cimg{transition:transform 0.7s cubic-bezier(0.25,0.46,0.45,0.94)}
        .rbtn{transition:all 0.3s ease;cursor:pointer}
        .rbtn:hover:not(:disabled){background:#d4af37!important;color:#080810!important;box-shadow:0 0 30px rgba(212,175,55,0.4)}
        .rbtn:disabled{opacity:0.3;cursor:not-allowed}
        .low{animation:pulse 1.5s infinite}
        .hero-title{background:linear-gradient(135deg,#f0ede6 0%,#d4af37 50%,#f0ede6 100%);background-size:200% auto;-webkit-background-clip:text;-webkit-text-fill-color:transparent;background-clip:text;animation:gradientShift 4s ease infinite}
        .hero-img{animation:fadeIn 0.8s ease forwards}
        .float-card{animation:float 4s ease-in-out infinite}
        .float-card:nth-child(2){animation-delay:0.5s}
        .float-card:nth-child(3){animation-delay:1s}
        .float-card:nth-child(4){animation-delay:1.5s}
        .orbit{animation:rotateSlow 20s linear infinite;transform-origin:center}
      `}</style>

      {/* Header */}
      <header style={{ borderBottom: '1px solid #16162a', padding: '24px 64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', position: 'sticky', top: 0, background: 'rgba(8,8,16,0.97)', backdropFilter: 'blur(24px)', zIndex: 100 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 32, fontWeight: 300, letterSpacing: 10, color: '#f0ede6', textTransform: 'uppercase' }}>Allo</h1>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 8, letterSpacing: 6, color: '#d4af37', textTransform: 'uppercase', marginTop: 4 }}>Inventory Store</p>
        </div>
        <div style={{ display: 'flex', gap: 40, alignItems: 'center' }}>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, letterSpacing: 3, color: '#444', textTransform: 'uppercase', marginBottom: 4 }}>Collection</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#d4af37' }}>{products.length} Items</p>
          </div>
          <div style={{ textAlign: 'center' }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, letterSpacing: 3, color: '#444', textTransform: 'uppercase', marginBottom: 4 }}>Hold Time</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, color: '#f0ede6' }}>10 min</p>
          </div>
        </div>
      </header>

      {/* Hero — split layout */}
      <section style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', minHeight: '88vh', position: 'relative', overflow: 'hidden' }}>
        {/* Left: text */}
        <div style={{ padding: '100px 64px', display: 'flex', flexDirection: 'column', justifyContent: 'center', position: 'relative', zIndex: 2 }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, letterSpacing: 6, color: '#d4af37', textTransform: 'uppercase', marginBottom: 28 }}>Limited Stock · Reserve Now</p>
          <h2 className="hero-title" style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 'clamp(44px,5.5vw,84px)', fontWeight: 300, lineHeight: 1.08, marginBottom: 32 }}>
            Premium Tech,<br />Reserved <em style={{ fontStyle: 'italic' }}>Just for You</em>
          </h2>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 13, color: '#555', maxWidth: 420, lineHeight: 2, letterSpacing: 0.5, marginBottom: 48 }}>
            Curated premium tech accessories with real-time inventory. Reserve any item for 10 minutes — no account needed.
          </p>
          <div style={{ display: 'flex', gap: 40 }}>
            {[['Free Shipping', 'Above ₹999'], ['10-Min Hold', 'Guaranteed'], ['Secure', '100% Safe']].map(([title, sub]) => (
              <div key={title}>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 5 }}>{title}</p>
                <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: '#444' }}>{sub}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Right: animated product showcase */}
        <div style={{ position: 'relative', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden', background: 'radial-gradient(ellipse at center, rgba(212,175,55,0.05) 0%, transparent 70%)' }}>
          {/* Decorative rings */}
          <div style={{ position: 'absolute', width: 500, height: 500, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.06)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}></div>
          <div style={{ position: 'absolute', width: 380, height: 380, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.08)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}></div>
          <div style={{ position: 'absolute', width: 260, height: 260, borderRadius: '50%', border: '1px solid rgba(212,175,55,0.1)', top: '50%', left: '50%', transform: 'translate(-50%,-50%)' }}></div>

          {/* Main center image - cycles through products */}
          <div style={{ position: 'relative', zIndex: 3 }}>
            {HERO_IMAGES.map((img, i) => (
              <div key={i} style={{ position: i === 0 ? 'relative' : 'absolute', top: 0, left: 0, width: 300, height: 300, borderRadius: 16, overflow: 'hidden', border: '1px solid rgba(212,175,55,0.2)', boxShadow: '0 24px 80px rgba(0,0,0,0.8)', opacity: activeImg === i ? 1 : 0, transition: 'opacity 0.8s ease', background: '#0d0d1a' }}>
                <img src={img} alt="product" style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(135deg, rgba(212,175,55,0.1) 0%, transparent 60%)' }}></div>
              </div>
            ))}
            {/* Gold shine overlay */}
            <div style={{ position: 'absolute', inset: 0, borderRadius: 16, background: 'linear-gradient(135deg, rgba(212,175,55,0.08) 0%, transparent 50%)', zIndex: 4, pointerEvents: 'none' }}></div>
          </div>

          {/* Floating mini cards */}
          <div className="float-card" style={{ position: 'absolute', top: '14%', left: '8%', background: 'rgba(13,13,26,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212,175,55,0.2)', borderRadius: 12, padding: '12px 16px', width: 140 }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 8, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 6 }}>In Stock</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: '#f0ede6' }}>Headphones</p>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: '#555', marginTop: 3 }}>₹2,999</p>
          </div>

          <div className="float-card" style={{ position: 'absolute', bottom: '18%', left: '6%', background: 'rgba(13,13,26,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, padding: '12px 16px', width: 140 }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 8, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 6 }}>Popular</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: '#f0ede6' }}>Keyboard</p>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: '#555', marginTop: 3 }}>₹4,499</p>
          </div>

          <div className="float-card" style={{ position: 'absolute', top: '14%', right: '6%', background: 'rgba(13,13,26,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, padding: '12px 16px', width: 130 }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 8, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 6 }}>New</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: '#f0ede6' }}>Laptop</p>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: '#555', marginTop: 3 }}>₹1,499</p>
          </div>

          <div className="float-card" style={{ position: 'absolute', bottom: '18%', right: '5%', background: 'rgba(13,13,26,0.9)', backdropFilter: 'blur(16px)', border: '1px solid rgba(212,175,55,0.15)', borderRadius: 12, padding: '12px 16px', width: 130 }}>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 8, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase', marginBottom: 6 }}>Top Rated</p>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 15, color: '#f0ede6' }}>Webcam HD</p>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: '#555', marginTop: 3 }}>₹3,299</p>
          </div>

          {/* Dot indicators */}
          <div style={{ position: 'absolute', bottom: '8%', left: '50%', transform: 'translateX(-50%)', display: 'flex', gap: 8 }}>
            {HERO_IMAGES.map((_, i) => (
              <div key={i} onClick={() => setActiveImg(i)} style={{ width: i === activeImg ? 24 : 6, height: 6, borderRadius: 3, background: i === activeImg ? '#d4af37' : '#2a2a3a', transition: 'all 0.3s ease', cursor: 'pointer' }}></div>
            ))}
          </div>
        </div>
      </section>

      <div style={{ margin: '0 64px', height: 1, background: 'linear-gradient(90deg,transparent,#d4af37,transparent)' }}></div>

      {/* Products Grid */}
      <main style={{ padding: '72px 64px', maxWidth: 1500, margin: '0 auto' }}>
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 48 }}>
          <h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 40, fontWeight: 300, color: '#f0ede6', letterSpacing: 2 }}>Our Collection</h3>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, letterSpacing: 3, color: '#333', textTransform: 'uppercase' }}>Showing {products.length} products</p>
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(320px, 1fr))', gap: 32 }}>
          {products.map(product => {
            const available = getAvailable(product.stocks)
            const isLow = available > 0 && available <= 3
            const override = PRODUCT_OVERRIDES[product.id]
            const image = override?.image || product.imageUrl
            const tag = override?.tag || 'In Stock'
            const highlight = override?.highlight || ''
            return (
              <div key={product.id} className="card" style={{ background: '#0d0d1a', border: '1px solid #16162a', borderRadius: 4, overflow: 'hidden' }}>
                <div style={{ height: 280, overflow: 'hidden', position: 'relative', background: '#0a0a15' }}>
                  <img src={image} alt={product.name} className="cimg" style={{ width: '100%', height: '100%', objectFit: 'cover', opacity: 0.9 }} />
                  <div style={{ position: 'absolute', inset: 0, background: 'linear-gradient(to top, rgba(13,13,26,0.5) 0%, transparent 50%)' }}></div>
                  <div style={{ position: 'absolute', top: 16, left: 16, background: 'rgba(212,175,55,0.15)', backdropFilter: 'blur(12px)', border: '1px solid rgba(212,175,55,0.35)', padding: '5px 14px', borderRadius: 2, fontFamily: 'Montserrat, sans-serif', fontSize: 9, letterSpacing: 2, color: '#d4af37', textTransform: 'uppercase' }}>{tag}</div>
                  <div className={isLow ? 'low' : ''} style={{ position: 'absolute', top: 16, right: 16, background: available === 0 ? 'rgba(180,40,40,0.9)' : 'rgba(8,8,16,0.85)', backdropFilter: 'blur(12px)', border: available === 0 ? 'none' : '1px solid rgba(212,175,55,0.2)', padding: '5px 14px', borderRadius: 2, fontFamily: 'Montserrat, sans-serif', fontSize: 9, letterSpacing: 2, color: available === 0 ? '#fff' : '#d4af37', textTransform: 'uppercase' }}>
                    {available === 0 ? 'Sold Out' : isLow ? `Only ${available} left!` : `${available} in stock`}
                  </div>
                </div>
                <div style={{ padding: '28px 26px 26px' }}>
                  {highlight && <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, letterSpacing: 1.5, color: '#3a3a5a', marginBottom: 12, lineHeight: 1.8 }}>{highlight}</p>}
<h3 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 26, fontWeight: 400, color: '#f0ede6', marginBottom: 10, lineHeight: 1.2 }}>{override?.displayName || product.name}</h3>                  <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: '#4a4a6a', lineHeight: 1.9, marginBottom: 24, letterSpacing: 0.3 }}>{product.description}</p>
                  <div style={{ borderTop: '1px solid #16162a', paddingTop: 22, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                      <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 9, letterSpacing: 2, color: '#444', textTransform: 'uppercase', marginBottom: 4 }}>Price</p>
                      <span style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 30, fontWeight: 300, color: '#f0ede6' }}>₹{product.price.toLocaleString()}</span>
                    </div>
                    <button className="rbtn" disabled={available === 0 || reserving === product.id} onClick={() => handleReserve(product.id)}
                      style={{ background: 'transparent', border: '1px solid #d4af37', color: '#d4af37', padding: '12px 28px', fontFamily: 'Montserrat, sans-serif', fontSize: 9, letterSpacing: 3, textTransform: 'uppercase', borderRadius: 2 }}>
                      {reserving === product.id ? 'Reserving...' : available === 0 ? 'Sold Out' : 'Reserve Now'}
                    </button>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      </main>

      {/* Trust bar */}
      <section style={{ borderTop: '1px solid #16162a', borderBottom: '1px solid #16162a', padding: '48px 64px', display: 'grid', gridTemplateColumns: 'repeat(4,1fr)', gap: 32 }}>
        {[
          ['Instant Reservation', 'Your item is held for exactly 10 minutes once reserved.'],
          ['Real-Time Stock', 'Stock levels update live across all users simultaneously.'],
          ['Safe & Secure', 'Your reservation is protected with concurrent locking technology.'],
          ['Easy Cancellation', 'Changed your mind? Cancel anytime and stock is instantly released.'],
        ].map(([title, desc]) => (
          <div key={title}>
            <p style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 400, color: '#d4af37', marginBottom: 12 }}>{title}</p>
            <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: '#444', lineHeight: 1.9, letterSpacing: 0.3 }}>{desc}</p>
          </div>
        ))}
      </section>

      {/* Footer */}
      <footer style={{ padding: '40px 64px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 24 }}>
        <div>
          <h1 style={{ fontFamily: 'Cormorant Garamond, serif', fontSize: 20, fontWeight: 300, letterSpacing: 8, color: '#2a2a3a', textTransform: 'uppercase' }}>Allo Inventory</h1>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 10, color: '#2a2a3a', marginTop: 6, letterSpacing: 1 }}>Real-time inventory reservation system</p>
        </div>
        <div style={{ textAlign: 'right' }}>
          <p style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 12, color: '#3a3a5a', letterSpacing: 1, marginBottom: 8 }}>Built by <span style={{ color: '#d4af37', fontWeight: 500 }}>Jesvanth S</span></p>
          <a href="https://www.linkedin.com/in/jesvanth/" target="_blank" rel="noopener noreferrer"
            style={{ fontFamily: 'Montserrat, sans-serif', fontSize: 11, color: '#4a6fa5', letterSpacing: 1, textDecoration: 'none', borderBottom: '1px solid rgba(74,111,165,0.4)', paddingBottom: 2 }}>
            linkedin.com/in/jesvanth
          </a>
        </div>
      </footer>
    </div>
  )
}