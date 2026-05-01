import { useState } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { ordersApi, couponsApi } from '../api/orders'

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

const STATUS_STEPS = [
  { key: 'PENDING', label: 'Order Placed', desc: 'Your order has been received and is being processed.' },
  { key: 'PROCESSING', label: 'Processing', desc: 'The seller is preparing your order for shipment.' },
  { key: 'SHIPPED', label: 'Shipped', desc: 'Your order is on its way to you.' },
  { key: 'DELIVERED', label: 'Delivered', desc: 'Your order has been delivered successfully.' },
]

const STATUS_ORDER = { PENDING: 0, PROCESSING: 1, SHIPPED: 2, DELIVERED: 3, CANCELLED: -1 }

function TimelineDot({ state }) {
  return (
    <div style={{
      position: 'absolute', left: -16, top: 3, width: 18, height: 18,
      border: `1px solid ${state === 'done' ? '#c9a96e' : state === 'active' ? '#c9a96e' : 'rgba(201,169,110,0.18)'}`,
      background: state === 'done' ? '#c9a96e' : state === 'active' ? 'rgba(201,169,110,0.1)' : '#1a1916',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      boxShadow: state === 'active' ? '0 0 0 4px rgba(201,169,110,0.08), 0 0 0 8px rgba(201,169,110,0.04)' : 'none',
      transition: 'all 0.6s cubic-bezier(0.23,1,0.32,1)',
    }}>
      {state === 'done' && <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#0d0c0b" strokeWidth="2.5"><polyline points="20 6 9 17 4 12" /></svg>}
      {state === 'active' && <div style={{ width: 6, height: 6, background: '#c9a96e', borderRadius: '50%' }} />}
    </div>
  )
}

export default function OrderTrackingPage() {
  const { orderId } = useParams()
  const navigate = useNavigate()
  const qc = useQueryClient()

  const [couponCode, setCouponCode] = useState('')
  const [couponMsg, setCouponMsg] = useState({ text: '', ok: false })

  const applyMutation = useMutation({
    mutationFn: (code) => couponsApi.apply(orderId, code),
    onSuccess: (res) => {
      setCouponMsg({ text: res.data?.message || 'Coupon applied!', ok: true })
      qc.invalidateQueries(['order', orderId])
    },
    onError: (err) => {
      setCouponMsg({ text: err?.response?.data?.message || 'Invalid coupon', ok: false })
    },
  })

  const { data: order, isLoading } = useQuery({
    queryKey: ['order', orderId],
    queryFn: () => ordersApi.get(orderId).then(r => r.data.data),
    enabled: !!orderId,
    refetchInterval: 30000,
  })

  if (isLoading) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{ width: 48, height: 48, border: '1px solid rgba(201,169,110,0.3)', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
      <style>{`@keyframes spin{to{transform:rotate(360deg)}}`}</style>
    </div>
  )

  if (!order) return (
    <div style={{ minHeight: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', paddingTop: 80 }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 32, color: '#c9a96e' }}>Order Not Found</div>
        <button onClick={() => navigate('/orders')} style={{ marginTop: 20, padding: '12px 24px', background: '#c9a96e', border: 'none', color: '#0d0c0b', cursor: 'pointer', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', fontFamily: "'DM Sans',sans-serif" }}>View All Orders</button>
      </div>
    </div>
  )

  const items = order.items || order.orderItems || []
  const overallStatus = order.status || items[0]?.status || 'PENDING'
  const currentStep = STATUS_ORDER[overallStatus] ?? 0
  const progressPct = overallStatus === 'CANCELLED' ? 0 : Math.round(((currentStep + 1) / STATUS_STEPS.length) * 100)

  const address = order.address || order.shippingAddress
  const orderDate = order.createdAt ? new Date(order.createdAt) : null
  const returnDays = order.createdAt ? Math.max(0, 30 - Math.floor((Date.now() - new Date(order.createdAt)) / 86400000)) : 30

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100 }}>
      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 52px' }}>
        <div style={{ padding: '60px 0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 14 }}>
            <div style={{ width: 28, height: 1, background: '#c9a96e' }} />Order Tracking
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 300, color: '#f0e6d0', lineHeight: 1.05 }}>
            Track Your <em style={{ fontStyle: 'italic', color: '#c9a96e' }}>Order</em>
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 380px', gap: 48, paddingBottom: 100, alignItems: 'start' }}>
          <div>
            <div style={{ background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', padding: 36 }}>
              <div style={{ marginBottom: 40, paddingBottom: 24, borderBottom: '1px solid rgba(201,169,110,0.18)' }}>
                <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: '#c9a96e', marginBottom: 6 }}>{orderId}</div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 26, fontWeight: 300, color: '#f0e6d0' }}>
                  {overallStatus === 'CANCELLED' ? 'Order Cancelled' : `Your order is ${overallStatus.toLowerCase()}`}
                </div>
              </div>

              <div style={{ margin: '28px 0', padding: 20, background: 'rgba(201,169,110,0.03)', border: '1px solid rgba(201,169,110,0.18)' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)', marginBottom: 12 }}>
                  <span>Order Progress</span><span>{progressPct}%</span>
                </div>
                <div style={{ height: 2, background: 'rgba(201,169,110,0.1)', position: 'relative', overflow: 'hidden' }}>
                  <div style={{ height: '100%', background: 'linear-gradient(90deg,#a07840,#c9a96e)', width: `${progressPct}%`, transition: 'width 1.5s cubic-bezier(0.23,1,0.32,1)', position: 'relative' }}>
                    {progressPct > 0 && <div style={{ position: 'absolute', right: 0, top: -3, width: 8, height: 8, background: '#c9a96e', borderRadius: '50%', transform: 'translateX(50%)' }} />}
                  </div>
                </div>
              </div>

              <div style={{ position: 'relative', paddingLeft: 24 }}>
                <div style={{ position: 'absolute', left: 8, top: 0, bottom: 0, width: 1, background: 'rgba(201,169,110,0.18)' }} />
                {STATUS_STEPS.map((s, i) => {
                  const state = i < currentStep ? 'done' : i === currentStep ? 'active' : 'inactive'
                  return (
                    <div key={s.key} style={{ position: 'relative', paddingLeft: 32, paddingBottom: i < STATUS_STEPS.length - 1 ? 40 : 0 }}>
                      <TimelineDot state={state} />
                      <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 10, color: 'rgba(240,230,208,0.38)', letterSpacing: '0.06em', marginBottom: 6 }}>
                        {state === 'done' ? 'Completed' : state === 'active' ? 'In Progress' : 'Pending'}
                      </div>
                      <div style={{ fontSize: 14, color: state === 'inactive' ? 'rgba(240,230,208,0.38)' : '#f0e6d0', fontWeight: state === 'active' ? 400 : 300, marginBottom: 4 }}>{s.label}</div>
                      <div style={{ fontSize: 12, color: 'rgba(240,230,208,0.38)', lineHeight: 1.6 }}>{s.desc}</div>
                    </div>
                  )
                })}
              </div>
            </div>
          </div>

          <div>
            <div style={{ background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', padding: 28, marginBottom: 16 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(201,169,110,0.18)' }}>Items Ordered</div>
              {items.map((item, i) => (
                <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '12px 0', borderBottom: i < items.length - 1 ? '1px solid rgba(201,169,110,0.08)' : 'none' }}>
                  <div style={{ width: 40, height: 50, background: '#252320', border: '1px solid rgba(201,169,110,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                    {(item.product?.image || item.image) ? <img src={item.product?.image || item.image} alt={item.product?.name || item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                  </div>
                  <div style={{ flex: 1 }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: '#f0e6d0' }}>{item.product?.name || item.name}</div>
                    <div style={{ fontSize: 10, color: 'rgba(240,230,208,0.38)', marginTop: 2 }}>Qty: {item.quantity} · {item.status || overallStatus}</div>
                  </div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, color: '#c9a96e', flexShrink: 0 }}>{fmt(item.price * item.quantity)}</div>
                </div>
              ))}
            </div>

            {overallStatus === 'PENDING' && !order?.couponCode && (
              <div style={{ background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', padding: 28, marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(201,169,110,0.18)' }}>Apply Coupon</div>
                <div style={{ display: 'flex', gap: 8 }}>
                  <input
                    value={couponCode}
                    onChange={(e) => { setCouponCode(e.target.value.toUpperCase()); setCouponMsg({ text: '', ok: false }) }}
                    placeholder="Enter coupon code"
                    style={{ flex: 1, padding: '10px 12px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,169,110,0.18)', color: '#f0e6d0', fontSize: 12, fontFamily: "'DM Mono',monospace", outline: 'none', letterSpacing: '0.08em' }}
                  />
                  <button
                    disabled={!couponCode.trim() || applyMutation.isPending}
                    onClick={() => applyMutation.mutate(couponCode.trim())}
                    style={{ padding: '10px 16px', background: '#c9a96e', color: '#0d0c0b', border: 'none', fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: !couponCode.trim() ? 'not-allowed' : 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: !couponCode.trim() ? 0.5 : 1 }}>
                    {applyMutation.isPending ? '…' : 'Apply'}
                  </button>
                </div>
                {couponMsg.text && (
                  <div style={{ marginTop: 8, fontSize: 11, color: couponMsg.ok ? 'rgba(138,173,135,0.85)' : 'rgba(190,110,110,0.85)' }}>{couponMsg.text}</div>
                )}
              </div>
            )}

            {address && (
              <div style={{ background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', padding: 28, marginBottom: 16 }}>
                <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(201,169,110,0.18)' }}>Deliver To</div>
                <div style={{ fontSize: 13, color: '#f0e6d0' }}>{address.label || address.fullName || 'Delivery Address'}</div>
                <div style={{ fontSize: 12, color: 'rgba(240,230,208,0.38)', lineHeight: 1.7, marginTop: 4 }}>
                  {address.street || address.line1}{address.line2 ? `, ${address.line2}` : ''}<br />
                  {address.city}, {address.state} {address.zipCode || address.pincode}
                </div>
              </div>
            )}

            <div style={{ background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', padding: 28 }}>
              <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 16, paddingBottom: 12, borderBottom: '1px solid rgba(201,169,110,0.18)' }}>Returns Window</div>
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <div>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: '#c9a96e' }}>{returnDays} days</div>
                  <div style={{ fontSize: 11, color: 'rgba(240,230,208,0.38)' }}>remaining for return</div>
                </div>
              </div>
              {overallStatus === 'DELIVERED' && returnDays > 0 && (
                <button onClick={() => navigate('/account/returns')} style={{ marginTop: 12, width: '100%', padding: 12, background: 'none', border: '1px solid rgba(201,169,110,0.18)', color: 'rgba(240,230,208,0.38)', fontSize: 10, letterSpacing: '0.16em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", transition: 'all 0.3s' }}>
                  Request Return
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
