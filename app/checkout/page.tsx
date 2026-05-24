'use client'

import { useEffect, useState, useCallback } from 'react'
import { useSearchParams, useRouter } from 'next/navigation'

interface Product { id: string; name: string; description: string; price: number; imageUrl: string }

const PRODUCT_OVERRIDES: Record<string, { image: string; displayName?: string }> = {
  'product-1': { image: 'https://images.unsplash.com/photo-1546435770-a3e426bf472b?w=600&q=80' },
  'product-2': { image: 'https://images.unsplash.com/photo-1541140532154-b024d705b90a?w=600&q=80', displayName: 'Keyboard' },
  'product-3': { image: 'https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?w=600&q=80', displayName: 'Laptop' },
  'product-4': { image: 'https://images.unsplash.com/photo-1623949556303-b0d17d198863?w=600&q=80', displayName: 'Webcam HD' },
}

export default function CheckoutPage() {
  const searchParams = useSearchParams()
  const router = useRouter()
  const reservationId = searchParams.get('reservationId')
  const productId = searchParams.get('productId')
  const [product, setProduct] = useState<Product | null>(null)
  const [timeLeft, setTimeLeft] = useState(600)
  const [status, setStatus] = useState<'pending'|'confirmed'|'released'|'expired'>('pending')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    if (productId) fetch('/api/products').then(r=>r.json()).then(data=>setProduct(data.find((p:Product)=>p.id===productId)||null))
  }, [productId])

  const handleRelease = useCallback(async () => {
    if (!reservationId) return
    await fetch(`/api/reservations/${reservationId}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'release'}) })
  }, [reservationId])

  useEffect(() => {
    if (status !== 'pending') return
    if (timeLeft <= 0) { setStatus('expired'); handleRelease(); return }
    const t = setTimeout(() => setTimeLeft(x=>x-1), 1000)
    return () => clearTimeout(t)
  }, [timeLeft, status, handleRelease])

  const handleConfirm = async () => {
    if (!reservationId) return
    setLoading(true)
    try {
      const res = await fetch(`/api/reservations/${reservationId}`, { method:'POST', headers:{'Content-Type':'application/json'}, body:JSON.stringify({action:'confirm'}) })
      const data = await res.json()
      if (!res.ok) { alert(data.error||'Failed to confirm'); return }
      setStatus('confirmed')
    } catch { alert('Something went wrong!') } finally { setLoading(false) }
  }

  const handleCancel = async () => { await handleRelease(); setStatus('released'); router.push('/') }
  const fmt = (s:number) => `${Math.floor(s/60).toString().padStart(2,'0')}:${(s%60).toString().padStart(2,'0')}`
  const pct = (timeLeft/600)*100
  const isUrgent = timeLeft < 60

  const override = productId ? PRODUCT_OVERRIDES[productId] : null
  const displayImage = override?.image || product?.imageUrl || ''
  const displayName = override?.displayName || product?.name || ''

  const sharedStyle = `
    @import url('https://fonts.googleapis.com/css2?family=Cormorant+Garamond:ital,wght@0,300;0,400;1,300&family=Montserrat:wght@300;400;500&display=swap');
    *{box-sizing:border-box;margin:0;padding:0}
    @keyframes fadeIn{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:translateY(0)}}
    @keyframes spin{to{transform:rotate(360deg)}}
    .main{animation:fadeIn 0.5s ease forwards}
    .cbtn{transition:all 0.3s ease;cursor:pointer}
    .cbtn:hover:not(:disabled){transform:translateY(-2px);box-shadow:0 8px 30px rgba(212,175,55,0.3)}
    .cbtn:disabled{opacity:0.5;cursor:not-allowed}
    .xbtn{transition:all 0.3s ease;cursor:pointer}
    .xbtn:hover{border-color:#666!important;color:#999!important}
  `

  if (!product) return (
    <div style={{minHeight:'100vh',display:'flex',alignItems:'center',justifyContent:'center',background:'#080810'}}>
      <div style={{width:40,height:40,border:'2px solid #d4af37',borderTopColor:'transparent',borderRadius:'50%',animation:'spin 0.8s linear infinite'}}></div>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (status === 'confirmed') return (
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <style>{sharedStyle}</style>
      <div className="main" style={{maxWidth:480,width:'100%',textAlign:'center',padding:'60px 40px',border:'1px solid #16162a',background:'#0d0d1a',borderRadius:4}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(212,175,55,0.1)',border:'1px solid rgba(212,175,55,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 32px',fontSize:24,color:'#d4af37'}}>✓</div>
        <p style={{fontFamily:'Montserrat,sans-serif',fontSize:9,letterSpacing:5,color:'#d4af37',textTransform:'uppercase',marginBottom:16}}>Purchase Confirmed</p>
        <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:38,fontWeight:300,color:'#f0ede6',marginBottom:12}}>Order Placed</h2>
        <p style={{fontFamily:'Montserrat,sans-serif',fontSize:12,color:'#555',lineHeight:1.9,marginBottom:40}}>Your purchase of <strong style={{color:'#f0ede6',fontWeight:400}}>{displayName}</strong> has been confirmed successfully.</p>
        <button onClick={()=>router.push('/')} style={{background:'#d4af37',color:'#080810',border:'none',padding:'15px 40px',fontFamily:'Montserrat,sans-serif',fontSize:10,letterSpacing:3,textTransform:'uppercase',cursor:'pointer',borderRadius:2,width:'100%',fontWeight:500}}>
          Back to Collection
        </button>
      </div>
    </div>
  )

  if (status === 'expired' || status === 'released') return (
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',alignItems:'center',justifyContent:'center',padding:24}}>
      <style>{sharedStyle}</style>
      <div className="main" style={{maxWidth:480,width:'100%',textAlign:'center',padding:'60px 40px',border:'1px solid #16162a',background:'#0d0d1a',borderRadius:4}}>
        <div style={{width:64,height:64,borderRadius:'50%',background:'rgba(220,53,69,0.1)',border:'1px solid rgba(220,53,69,0.3)',display:'flex',alignItems:'center',justifyContent:'center',margin:'0 auto 32px',fontSize:22,color:'#dc3545'}}>✕</div>
        <p style={{fontFamily:'Montserrat,sans-serif',fontSize:9,letterSpacing:5,color:'#dc3545',textTransform:'uppercase',marginBottom:16}}>Reservation Expired</p>
        <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:38,fontWeight:300,color:'#f0ede6',marginBottom:12}}>Time's Up</h2>
        <p style={{fontFamily:'Montserrat,sans-serif',fontSize:12,color:'#555',lineHeight:1.9,marginBottom:40}}>Your 10-minute reservation has expired and the item has been released back to stock.</p>
        <button onClick={()=>router.push('/')} style={{background:'transparent',color:'#d4af37',border:'1px solid #d4af37',padding:'15px 40px',fontFamily:'Montserrat,sans-serif',fontSize:10,letterSpacing:3,textTransform:'uppercase',cursor:'pointer',borderRadius:2,width:'100%'}}>
          Back to Collection
        </button>
      </div>
    </div>
  )

  return (
    <div style={{minHeight:'100vh',background:'#080810',display:'flex',flexDirection:'column'}}>
      <style>{sharedStyle}</style>

      <header style={{borderBottom:'1px solid #16162a',padding:'22px 60px',display:'flex',justifyContent:'space-between',alignItems:'center',background:'rgba(8,8,16,0.97)',backdropFilter:'blur(20px)'}}>
        <div>
          <h1 style={{fontFamily:'Cormorant Garamond,serif',fontSize:24,fontWeight:300,letterSpacing:8,color:'#f0ede6',textTransform:'uppercase'}}>Allo</h1>
          <p style={{fontFamily:'Montserrat,sans-serif',fontSize:8,letterSpacing:5,color:'#d4af37',textTransform:'uppercase',marginTop:3}}>Checkout</p>
        </div>
        <div style={{textAlign:'right'}}>
          <p style={{fontFamily:'Montserrat,sans-serif',fontSize:9,letterSpacing:3,color:isUrgent?'#dc3545':'#555',textTransform:'uppercase',marginBottom:4}}>Time Remaining</p>
          <p style={{fontFamily:'Cormorant Garamond,serif',fontSize:32,fontWeight:300,color:isUrgent?'#dc3545':'#d4af37',letterSpacing:3}}>{fmt(timeLeft)}</p>
        </div>
      </header>

      {/* Timer bar */}
      <div style={{height:2,background:'#16162a'}}>
        <div style={{height:'100%',background:isUrgent?'#dc3545':'#d4af37',width:`${pct}%`,transition:'width 1s linear,background 0.3s ease'}}></div>
      </div>

      <main className="main" style={{flex:1,display:'flex',alignItems:'center',justifyContent:'center',padding:'48px 24px'}}>
        <div style={{maxWidth:540,width:'100%'}}>
          <p style={{fontFamily:'Montserrat,sans-serif',fontSize:9,letterSpacing:5,color:'#d4af37',textTransform:'uppercase',marginBottom:28}}>Complete Your Purchase</p>

          <div style={{border:'1px solid #16162a',borderRadius:4,overflow:'hidden',background:'#0d0d1a',marginBottom:24}}>
            <div style={{height:320,overflow:'hidden',position:'relative'}}>
              <img src={displayImage} alt={displayName} style={{width:'100%',height:'100%',objectFit:'cover',opacity:0.88}}/>
              <div style={{position:'absolute',inset:0,background:'linear-gradient(to top,rgba(13,13,26,0.5) 0%,transparent 50%)'}}></div>
            </div>
            <div style={{padding:'28px 26px'}}>
              <h2 style={{fontFamily:'Cormorant Garamond,serif',fontSize:30,fontWeight:300,color:'#f0ede6',marginBottom:8}}>{displayName}</h2>
              <p style={{fontFamily:'Montserrat,sans-serif',fontSize:11,color:'#4a4a6a',lineHeight:1.9,marginBottom:22}}>{product.description}</p>
              <div style={{display:'flex',justifyContent:'space-between',alignItems:'center',borderTop:'1px solid #16162a',paddingTop:20}}>
                <div>
                  <p style={{fontFamily:'Montserrat,sans-serif',fontSize:9,letterSpacing:2,color:'#444',textTransform:'uppercase',marginBottom:4}}>Total</p>
                  <span style={{fontFamily:'Cormorant Garamond,serif',fontSize:34,fontWeight:300,color:'#f0ede6'}}>₹{product.price.toLocaleString()}</span>
                </div>
                <span style={{fontFamily:'Montserrat,sans-serif',fontSize:9,letterSpacing:3,color:'#333',textTransform:'uppercase',border:'1px solid #1e1e2e',padding:'6px 14px',borderRadius:2}}>1 item</span>
              </div>
            </div>
          </div>

          {isUrgent && (
            <div style={{border:'1px solid rgba(220,53,69,0.3)',background:'rgba(220,53,69,0.05)',borderRadius:2,padding:'12px 16px',marginBottom:20,fontFamily:'Montserrat,sans-serif',fontSize:10,color:'#dc3545',letterSpacing:2,textTransform:'uppercase',textAlign:'center'}}>
              Less than 1 minute remaining
            </div>
          )}

          <div style={{display:'grid',gridTemplateColumns:'1fr 1fr',gap:12}}>
            <button className="cbtn" onClick={handleConfirm} disabled={loading}
              style={{background:'#d4af37',color:'#080810',border:'none',padding:'16px',fontFamily:'Montserrat,sans-serif',fontSize:10,letterSpacing:3,textTransform:'uppercase',borderRadius:2,fontWeight:500}}>
              {loading ? 'Processing...' : 'Confirm Purchase'}
            </button>
            <button className="xbtn" onClick={handleCancel} disabled={loading}
              style={{background:'transparent',color:'#444',border:'1px solid #2a2a3a',padding:'16px',fontFamily:'Montserrat,sans-serif',fontSize:10,letterSpacing:3,textTransform:'uppercase',borderRadius:2,cursor:'pointer'}}>
              Cancel
            </button>
          </div>
        </div>
      </main>
    </div>
  )
}