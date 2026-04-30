import { useEffect, useState } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery } from '@tanstack/react-query'
import { ordersApi } from '../api/orders'

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

function Particle({ style }) {
  return <div style={{ position: 'absolute', width: 2, height: 2, background: '#c9a96e', borderRadius: '50%', ...style }} />
}

export default function OrderConfirmationPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const orderId = location.state?.orderId
  const [copied, setCopied] = useState(false)
  const [particles] = useState(() =>
    Array.from({ length: 20 }, (_, i) => ({
      key: i,
      left: `${Math.random() * 80 + 10}%`,
      animationDelay: `${Math.random() * 1}s`,
      animationDuration: `${2 + Math.random() * 2}s`,
      tx: `${(Math.random() - 0.5) * 200}px`,
      ty: `${-80 - Math.random() * 100}px`,
    }))
  )

  const { data: order } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.get(orderId).then(r => r.data.data),
    enabled: !!orderId,
  })

  const copyOrderId = () => {
    navigator.clipboard.writeText(orderId || '')
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const items = order?.items || order?.orderItems || []
  const total = order?.totalAmount || order?.total || 0

  useEffect(() => {
    const style = document.createElement('style')
    style.textContent = `
      @keyframes checkAppear{from{transform:scale(0.3);opacity:0}to{transform:scale(1);opacity:1}}
      @keyframes ringExpand{from{transform:scale(0.8);opacity:0}to{transform:scale(1);opacity:1}}
      @keyframes drawCheck{to{stroke-dashoffset:0}}
      @keyframes slideUp{from{opacity:0;transform:translateY(20px)}to{opacity:1;transform:none}}
      @keyframes particleFloat{0%{opacity:0.8;transform:translate(0,0) scale(1)}100%{opacity:0;transform:translate(var(--tx),var(--ty)) scale(0)}}
    `
    document.head.appendChild(style)
    return () => document.head.removeChild(style)
  }, [])

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100, position: 'relative' }}>
      <div style={{ position: 'absolute', top: 100, left: 0, right: 0, height: 300, pointerEvents: 'none', overflow: 'hidden' }}>
        {particles.map(p => (
          <div key={p.key} style={{ position: 'absolute', width: 2, height: 2, background: '#c9a96e', opacity: 0, left: p.left, top: '60%', animation: `particleFloat ${p.animationDuration} ease-out ${p.animationDelay} both`, '--tx': p.tx, '--ty': p.ty }} />
        ))}
      </div>

      <div style={{ maxWidth: 800, margin: '0 auto', padding: '60px 52px 100px', textAlign: 'center' }}>
        <div style={{ width: 100, height: 100, margin: '0 auto 40px', position: 'relative' }}>
          <div style={{ width: '100%', height: '100%', border: '1px solid rgba(201,169,110,0.18)', borderRadius: '50%', background: 'rgba(201,169,110,0.04)', animation: 'checkAppear 0.6s cubic-bezier(0.23,1,0.32,1) both 0.2s', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
            <svg width="40" height="40" viewBox="0 0 50 50" fill="none">
              <polyline points="10,25 21,36 40,14" stroke="#c9a96e" strokeWidth="2" strokeLinecap="round" strokeDasharray="40" strokeDashoffset="40" style={{ animation: 'drawCheck 0.7s cubic-bezier(0.23,1,0.32,1) forwards 0.6s' }} />
            </svg>
          </div>
          <div style={{ position: 'absolute', inset: -8, border: '1px solid rgba(201,169,110,0.15)', borderRadius: '50%', animation: 'ringExpand 1.2s cubic-bezier(0.23,1,0.32,1) both 0.5s' }} />
          <div style={{ position: 'absolute', inset: -20, border: '1px solid rgba(201,169,110,0.07)', borderRadius: '50%', animation: 'ringExpand 1.4s cubic-bezier(0.23,1,0.32,1) both 0.7s' }} />
        </div>

        <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 16, animation: 'slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 0.8s', opacity: 0 }}>Order Confirmed</div>
        <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(40px,5vw,64px)', fontWeight: 300, color: '#f0e6d0', lineHeight: 1.05, marginBottom: 12, animation: 'slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 0.9s', opacity: 0 }}>
          Thank <em style={{ fontStyle: 'italic', color: '#c9a96e' }}>You</em>
        </h1>
        <p style={{ fontSize: 14, color: 'rgba(240,230,208,0.55)', maxWidth: 480, margin: '0 auto 48px', animation: 'slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 1.0s', opacity: 0 }}>
          Your order has been placed successfully. A confirmation email is on its way to you.
        </p>

        {orderId && (
          <div
            onClick={copyOrderId}
            style={{ background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', padding: '20px 28px', display: 'inline-flex', alignItems: 'center', gap: 20, marginBottom: 52, animation: 'slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 1.1s', opacity: 0, cursor: 'pointer', transition: 'border-color 0.3s' }}>
            <div>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)' }}>Order ID</div>
              <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 16, color: '#c9a96e', letterSpacing: '0.06em' }}>{orderId}</div>
            </div>
            <button style={{ padding: '6px 14px', border: '1px solid rgba(201,169,110,0.18)', background: 'none', color: 'rgba(240,230,208,0.38)', fontSize: 9, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.3s' }}>
              {copied ? 'Copied!' : 'Copy'}
            </button>
          </div>
        )}

        {order && (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 2, marginBottom: 52, textAlign: 'left', animation: 'slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 1.2s', opacity: 0 }}>
            {[
              { label: 'Total Amount', val: fmt(total), sub: 'Inclusive of taxes' },
              { label: 'Payment Status', val: order?.paymentStatus || 'Pending', sub: 'Razorpay secured' },
              { label: 'Estimated Delivery', val: '3–5 Business Days', sub: 'Standard shipping' },
            ].map((box, i) => (
              <div key={i} style={{ padding: 24, background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)' }}>
                <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)', marginBottom: 10 }}>{box.label}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: '#f0e6d0' }}>{box.val}</div>
                <div style={{ fontSize: 11, color: 'rgba(240,230,208,0.38)', marginTop: 4 }}>{box.sub}</div>
              </div>
            ))}
          </div>
        )}

        {items.length > 0 && (
          <div style={{ border: '1px solid rgba(201,169,110,0.18)', marginBottom: 48, animation: 'slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 1.3s', opacity: 0 }}>
            {items.map((item, i) => (
              <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 20, padding: '20px 24px', borderBottom: i < items.length - 1 ? '1px solid rgba(201,169,110,0.08)' : 'none' }}>
                <div style={{ width: 52, height: 64, background: '#252320', border: '1px solid rgba(201,169,110,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                  {(item.product?.image || item.image) ? <img src={item.product?.image || item.image} alt={item.product?.name || item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                </div>
                <div style={{ flex: 1, textAlign: 'left' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 17, fontWeight: 300, color: '#f0e6d0' }}>{item.product?.name || item.name}</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,230,208,0.38)', marginTop: 4 }}>Qty: {item.quantity}</div>
                </div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#c9a96e' }}>{fmt(item.price * item.quantity)}</div>
              </div>
            ))}
          </div>
        )}

        <div style={{ display: 'flex', gap: 16, justifyContent: 'center', animation: 'slideUp 0.6s cubic-bezier(0.23,1,0.32,1) both 1.4s', opacity: 0 }}>
          {orderId && (
            <button onClick={() => navigate(`/orders/${orderId}/track`)} style={{ padding: '18px 36px', background: '#c9a96e', color: '#0d0c0b', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
              Track Order →
            </button>
          )}
          <button onClick={() => navigate('/')} style={{ padding: '18px 28px', background: 'none', color: 'rgba(240,230,208,0.38)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', border: '1px solid rgba(201,169,110,0.18)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
            Continue Shopping
          </button>
        </div>
      </div>
    </div>
  )
}
