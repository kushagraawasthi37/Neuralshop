import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../api/cart'
import { couponsApi } from '../api/orders'

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

function ProductSVG() {
  return (
    <svg width="40" height="40" viewBox="0 0 60 60" fill="none">
      <rect x="15" y="8" width="30" height="44" stroke="rgba(201,169,110,0.6)" strokeWidth="0.8" />
      <line x1="20" y1="20" x2="40" y2="20" stroke="rgba(201,169,110,0.3)" strokeWidth="0.8" />
      <line x1="20" y1="26" x2="40" y2="26" stroke="rgba(201,169,110,0.3)" strokeWidth="0.8" />
      <line x1="20" y1="32" x2="34" y2="32" stroke="rgba(201,169,110,0.3)" strokeWidth="0.8" />
      <circle cx="30" cy="42" r="4" stroke="rgba(201,169,110,0.4)" strokeWidth="0.8" />
    </svg>
  )
}

function Toast({ msg, show }) {
  return (
    <div style={{
      position: 'fixed', bottom: 32, right: 32, zIndex: 9000,
      background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)',
      padding: '16px 24px', display: 'flex', alignItems: 'center', gap: 12,
      fontSize: 12, color: '#f0e6d0',
      transform: show ? 'translateY(0)' : 'translateY(80px)',
      opacity: show ? 1 : 0,
      transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
    }}>
      <div style={{ width: 6, height: 6, background: '#c9a96e', borderRadius: '50%' }} />
      {msg}
    </div>
  )
}

export default function CartPage() {
  const navigate = useNavigate()
  const qc = useQueryClient()
  const [couponCode, setCouponCode] = useState('')
  const [coupon, setCoupon] = useState(null)
  const [toast, setToast] = useState({ show: false, msg: '' })

  const { data, isLoading, error } = useQuery({
    queryKey: ['cart'],
    queryFn: () => cartApi.get().then(r => r.data.data),
    retry: 1,
  })

  const showToast = (msg) => {
    setToast({ show: true, msg })
    setTimeout(() => setToast({ show: false, msg: '' }), 3000)
  }

  const updateMutation = useMutation({
    mutationFn: ({ productId, quantity, size }) => cartApi.updateItem(productId, quantity, size),
    onSuccess: () => qc.invalidateQueries(['cart']),
    onError: () => showToast('Failed to update quantity'),
  })

  const removeMutation = useMutation({
    mutationFn: ({ productId, size }) => cartApi.removeItem(productId, size),
    onSuccess: () => { qc.invalidateQueries(['cart']); showToast('Item removed') },
    onError: () => showToast('Failed to remove item'),
  })

  const clearMutation = useMutation({
    mutationFn: () => cartApi.clear(),
    onSuccess: () => { qc.invalidateQueries(['cart']); showToast('Cart cleared') },
  })

  const handleApplyCoupon = async () => {
    if (!couponCode.trim()) return
    try {
      const subtotal = data?.subtotal || 0
      const res = await couponsApi.validate(couponCode.trim(), subtotal)
      setCoupon(res.data.data)
      showToast('Coupon applied successfully')
    } catch (err) {
      showToast(err.response?.data?.message || 'Invalid coupon code')
    }
  }

  const items = data?.items || []
  const subtotal = data?.subtotal || items.reduce((s, i) => s + (i.priceAtAdd || 0) * i.quantity, 0)
  const shipping = data?.shippingCost || 0
  const tax = data?.tax || Math.round(subtotal * 0.18)
  const discount = coupon
    ? Math.round(subtotal * ((coupon.discountValue || coupon.discountPercent || 0) / 100))
    : 0
  const total = subtotal + shipping + tax - discount

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{ width: 48, height: 48, border: '1px solid rgba(201,169,110,0.3)', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100 }}>
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 52px' }}>

        <div style={{ padding: '60px 0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 14 }}>
            <div style={{ width: 28, height: 1, background: '#c9a96e' }} />
            Shopping Cart
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 300, color: '#f0e6d0', lineHeight: 1.05 }}>
            Your <em style={{ fontStyle: 'italic', color: '#c9a96e' }}>Curation</em>
          </h1>
        </div>

        {items.length === 0 ? (
          <div style={{ textAlign: 'center', padding: '80px 0', color: 'rgba(240,230,208,0.4)' }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 300, marginBottom: 16 }}>Your cart is empty</div>
            <button onClick={() => navigate('/collections')} style={{ padding: '14px 32px', background: '#c9a96e', border: 'none', color: '#0d0c0b', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", fontWeight: 500, marginTop: 16 }}>
              Browse Collections
            </button>
          </div>
        ) : (
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 40, alignItems: 'start', paddingBottom: 100 }}>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', paddingBottom: 20, borderBottom: '1px solid rgba(201,169,110,0.18)', marginBottom: 32 }}>
                <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)' }}>{items.length} Item{items.length !== 1 ? 's' : ''}</span>
                <button onClick={() => clearMutation.mutate()} style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif', transition: 'color 0.3s'" }}>Clear All</button>
              </div>

              {items.map((item) => (
                <div key={item.productId + (item.size || '')} style={{ display: 'grid', gridTemplateColumns: '88px 1fr auto', gap: 24, padding: '24px 0', borderBottom: '1px solid rgba(201,169,110,0.08)', transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)' }}>
                  <div style={{ width: 88, height: 110, background: '#252320', border: '1px solid rgba(201,169,110,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                    ) : <ProductSVG />}
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', justifyContent: 'space-between' }}>
                    <div>
                      <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)', marginBottom: 6 }}>Neural Shop</div>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 300, color: '#f0e6d0', marginBottom: 8, lineHeight: 1.2 }}>{item.name}</div>
                      <div style={{ display: 'flex', gap: 12, marginBottom: 16 }}>
                        {item.size && (
                          <span style={{ fontSize: 11, color: 'rgba(240,230,208,0.38)', letterSpacing: '0.08em', padding: '3px 10px', border: '1px solid rgba(201,169,110,0.18)' }}>{item.size}</span>
                        )}
                      </div>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 0 }}>
                      <button onClick={() => updateMutation.mutate({ productId: item.productId, quantity: Math.max(1, item.quantity - 1), size: item.size })} style={{ width: 32, height: 32, border: '1px solid rgba(201,169,110,0.18)', background: 'none', color: '#f0e6d0', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif" }}>−</button>
                      <div style={{ width: 40, height: 32, borderTop: '1px solid rgba(201,169,110,0.18)', borderBottom: '1px solid rgba(201,169,110,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14, fontFamily: "'DM Mono',monospace" }}>{item.quantity}</div>
                      <button onClick={() => updateMutation.mutate({ productId: item.productId, quantity: item.quantity + 1, size: item.size })} style={{ width: 32, height: 32, border: '1px solid rgba(201,169,110,0.18)', background: 'none', color: '#f0e6d0', fontSize: 16, cursor: 'pointer', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'DM Sans',sans-serif" }}>+</button>
                    </div>
                  </div>

                  <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', justifyContent: 'space-between' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, color: '#c9a96e' }}>{fmt((item.priceAtAdd || 0) * item.quantity)}</div>
                    <button onClick={() => removeMutation.mutate({ productId: item.productId, size: item.size })} style={{ fontSize: 10, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)', background: 'none', border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", padding: '4px 0', borderBottom: '1px solid transparent' }}>Remove</button>
                  </div>
                </div>
              ))}

              <div style={{ marginTop: 32, display: 'flex', gap: 0 }}>
                <input
                  value={couponCode}
                  onChange={e => setCouponCode(e.target.value)}
                  onKeyDown={e => e.key === 'Enter' && handleApplyCoupon()}
                  placeholder="Neural Code"
                  style={{ flex: 1, padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,169,110,0.18)', color: '#f0e6d0', fontFamily: "'DM Sans',sans-serif", fontSize: 13, outline: 'none', letterSpacing: '0.06em' }}
                />
                <button onClick={handleApplyCoupon} style={{ padding: '0 24px', background: '#252320', border: '1px solid rgba(201,169,110,0.18)', borderLeft: 'none', color: '#c9a96e', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Apply</button>
              </div>
              {coupon && (
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginTop: 12, padding: '10px 16px', background: 'rgba(74,92,71,0.15)', border: '1px solid rgba(74,92,71,0.3)', fontSize: 12, color: 'rgba(138,173,135,0.9)' }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><polyline points="20 6 9 17 4 12" /></svg>
                  {coupon.code} applied — You save {fmt(discount)}
                </div>
              )}
            </div>

            <div>
              <div style={{ background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', padding: '36px 32px', position: 'sticky', top: 100 }}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, color: '#f0e6d0', marginBottom: 28, paddingBottom: 20, borderBottom: '1px solid rgba(201,169,110,0.18)' }}>Order Summary</div>

                {[
                  { label: `Subtotal (${items.length} items)`, value: fmt(subtotal) },
                  { label: 'Shipping', value: shipping === 0 ? 'Free' : fmt(shipping), green: shipping === 0 },
                  { label: 'Tax (18% GST)', value: fmt(tax) },
                  ...(discount > 0 ? [{ label: `Discount (${coupon.code})`, value: `−${fmt(discount)}`, green: true }] : []),
                ].map((row, i) => (
                  <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '10px 0', borderBottom: '1px solid rgba(201,169,110,0.06)' }}>
                    <span style={{ fontSize: 12, color: 'rgba(240,230,208,0.38)', letterSpacing: '0.08em' }}>{row.label}</span>
                    <span style={{ fontSize: 14, color: row.green ? 'rgba(138,173,135,0.9)' : '#f0e6d0', fontFamily: "'DM Mono',monospace" }}>{row.value}</span>
                  </div>
                ))}

                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '20px 0 0', marginTop: 12, borderTop: '1px solid rgba(201,169,110,0.18)' }}>
                  <span style={{ fontSize: 11, letterSpacing: '0.16em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)' }}>Total</span>
                  <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, color: '#c9a96e', fontWeight: 300 }}>{fmt(total)}</span>
                </div>

                <button
                  onClick={() => navigate('/checkout', { state: { coupon, total } })}
                  style={{ width: '100%', marginTop: 28, padding: 18, background: '#c9a96e', color: '#0d0c0b', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.3s' }}>
                  Proceed to Checkout →
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 16, justifyContent: 'center', fontSize: 10, color: 'rgba(240,230,208,0.38)', letterSpacing: '0.08em' }}>
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  256-bit SSL · Razorpay PCI DSS
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  )
}
