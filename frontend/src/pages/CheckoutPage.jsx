import { useState, useEffect } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { cartApi } from '../api/cart'
import { userApi } from '../api/user'
import { ordersApi } from '../api/orders'

const fmt = (n) => '₹' + Number(n || 0).toLocaleString('en-IN')

function Stepper({ step }) {
  const steps = ['Delivery', 'Review', 'Payment']
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: 0, marginBottom: 52 }}>
      {steps.map((label, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', flex: 1 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, flexShrink: 0 }}>
            <div style={{
              width: 36, height: 36, border: `1px solid ${step > i ? '#c9a96e' : step === i ? '#c9a96e' : 'rgba(201,169,110,0.18)'}`,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              background: step > i ? '#c9a96e' : step === i ? 'rgba(201,169,110,0.06)' : 'transparent',
              color: step > i ? '#0d0c0b' : step === i ? '#c9a96e' : 'rgba(240,230,208,0.38)',
              fontSize: 11, fontFamily: "'DM Mono',monospace", transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)',
            }}>
              {step > i ? '✓' : `0${i + 1}`}
            </div>
            <span style={{ fontSize: 10, letterSpacing: '0.14em', textTransform: 'uppercase', color: step >= i ? '#f0e6d0' : 'rgba(240,230,208,0.38)', transition: 'color 0.5s' }}>{label}</span>
          </div>
          {i < steps.length - 1 && (
            <div style={{ flex: 1, height: 1, background: step > i ? 'rgba(201,169,110,0.4)' : 'rgba(201,169,110,0.18)', margin: '0 16px', transition: 'background 0.5s' }} />
          )}
        </div>
      ))}
    </div>
  )
}

function FormField({ label, ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)' }}>{label}</label>
      <input
        {...props}
        style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,169,110,0.18)', color: '#f0e6d0', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', width: '100%', ...props.style }}
      />
    </div>
  )
}

// Format a Prisma address for display
function addrLine(addr) {
  if (!addr) return ''
  return [addr.street, addr.city, addr.state, addr.zipCode].filter(Boolean).join(', ')
}

export default function CheckoutPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const queryClient = useQueryClient()
  const [step, setStep] = useState(0)
  const [selectedAddress, setSelectedAddress] = useState(null)
  // newAddr fields match Prisma Address schema: label, street, city, state, zipCode, country, phone
  const [newAddr, setNewAddr] = useState({
    label: 'Home',
    phone: '',
    street: '',
    city: '',
    state: '',
    zipCode: '',
    country: 'India',
  })
  const [paymentMethod, setPaymentMethod] = useState('razorpay')
  const [processing, setProcessing] = useState(false)
  const [addrError, setAddrError] = useState('')

  const coupon = location.state?.coupon

  const { data: cart } = useQuery({ queryKey: ['cart'], queryFn: () => cartApi.get().then(r => r.data.data) })
  const { data: addresses, refetch: refetchAddresses } = useQuery({
    queryKey: ['addresses'],
    queryFn: () => userApi.getAddresses().then(r => r.data.data),
  })

  useEffect(() => {
    if (addresses?.length > 0 && !selectedAddress) {
      // Default to the address marked isDefault, otherwise first
      const def = addresses.find(a => a.isDefault) || addresses[0]
      setSelectedAddress(def)
    }
  }, [addresses])

  const items = cart?.items || []
  const subtotal = cart?.subtotal || items.reduce((s, i) => s + (i.priceAtAdd || 0) * i.quantity, 0)
  const tax = Math.round(subtotal * 0.18)
  const discount = coupon
    ? Math.round(subtotal * ((coupon.discountValue || coupon.discountPercent || 0) / 100))
    : 0
  const total = subtotal + tax - discount

  const createAddressMutation = useMutation({
    mutationFn: (addrData) => userApi.createAddress(addrData),
  })

  const createOrderMutation = useMutation({
    mutationFn: (body) => ordersApi.create(body),
    onSuccess: (res) => {
      const oid = res.data.data?.orderId || res.data.data?.id || res.data.data?._id
      handlePayment(oid, total)
    },
    onError: (err) => {
      setProcessing(false)
      alert(err.response?.data?.message || 'Order creation failed')
    },
  })

  const handlePayment = async (oid, amount) => {
    try {
      const payRes = await ordersApi.pay(oid)
      const rzpData = payRes.data.data
      if (!rzpData?.razorpayOrderId) {
        setProcessing(false)
        queryClient.invalidateQueries({ queryKey: ['cart'] })
        navigate('/order-confirmation', { state: { orderId: oid } })
        return
      }
      const options = {
        key: rzpData.key,
        amount: rzpData.amount,
        currency: rzpData.currency || 'INR',
        order_id: rzpData.razorpayOrderId,
        name: 'NeuralShop',
        description: 'Purchase',
        handler: () => {
          setProcessing(false)
          queryClient.invalidateQueries({ queryKey: ['cart'] })
          navigate('/order-confirmation', { state: { orderId: oid } })
        },
        prefill: {
          name: selectedAddress?.label || '',
          contact: selectedAddress?.phone || newAddr.phone,
        },
        theme: { color: '#c9a96e' },
        modal: { ondismiss: () => setProcessing(false) },
      }
      const rzp = new window.Razorpay(options)
      rzp.open()
    } catch {
      setProcessing(false)
      queryClient.invalidateQueries({ queryKey: ['cart'] })
      navigate('/order-confirmation', { state: { orderId: oid } })
    }
  }

  const placeOrder = async () => {
    setProcessing(true)
    setAddrError('')

    let addressId = selectedAddress?.id

    // If no saved address selected, create the new address first
    if (!addressId) {
      if (!newAddr.street || !newAddr.city || !newAddr.state || !newAddr.zipCode) {
        setAddrError('Please fill in all required address fields.')
        setProcessing(false)
        return
      }
      try {
        const res = await createAddressMutation.mutateAsync(newAddr)
        addressId = res.data.data?.id || res.data.data?._id
        await refetchAddresses()
      } catch (err) {
        setAddrError(err.response?.data?.message || 'Failed to save address.')
        setProcessing(false)
        return
      }
    }

    createOrderMutation.mutate({
      addressId,
      couponCode: coupon?.code,
      paymentMethod,
    })
  }

  const miniSummary = (
    <div style={{ background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', padding: 28, position: 'sticky', top: 100 }}>
      <div style={{ fontSize: 10, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)', marginBottom: 20, paddingBottom: 16, borderBottom: '1px solid rgba(201,169,110,0.18)' }}>Order Summary</div>
      {items.map((item, i) => (
        <div key={i} style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '12px 0', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
          <div style={{ width: 52, height: 64, background: '#252320', border: '1px solid rgba(201,169,110,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
            {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : <svg width="24" height="24" viewBox="0 0 60 60" fill="none"><rect x="15" y="8" width="30" height="44" stroke="rgba(201,169,110,0.5)" strokeWidth="0.8" /></svg>}
          </div>
          <div style={{ flex: 1 }}>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 300, color: '#f0e6d0' }}>{item.name}</div>
            <div style={{ fontSize: 11, color: 'rgba(240,230,208,0.38)', marginTop: 4 }}>
              Qty: {item.quantity}{item.size ? ` · ${item.size}` : ''}
            </div>
          </div>
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: '#c9a96e', flexShrink: 0 }}>{fmt((item.priceAtAdd || 0) * item.quantity)}</div>
        </div>
      ))}
      <div style={{ marginTop: 16, padding: '16px 0 0', borderTop: '1px solid rgba(201,169,110,0.18)' }}>
        {[
          { label: 'Subtotal', val: fmt(subtotal) },
          { label: 'Tax (18%)', val: fmt(tax) },
          ...(discount > 0 ? [{ label: 'Discount', val: `−${fmt(discount)}`, green: true }] : []),
        ].map((r, i) => (
          <div key={i} style={{ display: 'flex', justifyContent: 'space-between', padding: '6px 0', fontSize: 12, color: r.green ? 'rgba(138,173,135,0.9)' : 'rgba(240,230,208,0.55)' }}>
            <span>{r.label}</span><span style={{ fontFamily: "'DM Mono',monospace" }}>{r.val}</span>
          </div>
        ))}
        <div style={{ display: 'flex', justifyContent: 'space-between', padding: '12px 0 0', marginTop: 8, borderTop: '1px solid rgba(201,169,110,0.18)' }}>
          <span style={{ fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)' }}>Total</span>
          <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, color: '#c9a96e', fontWeight: 300 }}>{fmt(total)}</span>
        </div>
      </div>
    </div>
  )

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100 }}>
      {processing && (
        <div style={{ position: 'fixed', inset: 0, background: 'rgba(13,12,11,0.97)', zIndex: 1000, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', gap: 24 }}>
          <style>{`@keyframes spin{to{transform:rotate(360deg)}}@keyframes pulse{0%,100%{opacity:0.6}50%{opacity:1}}`}</style>
          <div style={{ width: 64, height: 64, border: '1px solid rgba(201,169,110,0.18)', borderTopColor: '#c9a96e', borderRadius: '50%', animation: 'spin 1.2s linear infinite' }} />
          <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, color: '#f0e6d0', animation: 'pulse 2s ease-in-out infinite' }}>Securing your order</div>
          <div style={{ fontSize: 11, letterSpacing: '0.2em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)' }}>End-to-end encrypted · Razorpay</div>
        </div>
      )}

      <div style={{ maxWidth: 1300, margin: '0 auto', padding: '0 52px' }}>
        <div style={{ padding: '60px 0 48px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 12, fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', marginBottom: 14 }}>
            <div style={{ width: 28, height: 1, background: '#c9a96e' }} />Secure Checkout
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(36px,5vw,64px)', fontWeight: 300, color: '#f0e6d0', lineHeight: 1.05 }}>
            <em style={{ fontStyle: 'italic', color: '#c9a96e' }}>Complete</em> Your Order
          </h1>
        </div>

        <Stepper step={step} />

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 360px', gap: 52, paddingBottom: 100 }}>
          <div>
            {step === 0 && (
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 300, color: '#f0e6d0', marginBottom: 28 }}>Delivery Address</div>

                {/* Saved addresses */}
                {addresses?.length > 0 && (
                  <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 28 }}>
                    {addresses.map((addr) => (
                      <div
                        key={addr.id}
                        onClick={() => setSelectedAddress(addr)}
                        style={{ padding: 20, border: `1px solid ${selectedAddress?.id === addr.id ? '#c9a96e' : 'rgba(201,169,110,0.18)'}`, cursor: 'pointer', transition: 'all 0.4s cubic-bezier(0.23,1,0.32,1)', background: selectedAddress?.id === addr.id ? 'rgba(201,169,110,0.04)' : 'transparent', position: 'relative' }}>
                        {selectedAddress?.id === addr.id && <div style={{ position: 'absolute', top: -1, left: 0, right: 0, height: 2, background: '#c9a96e' }} />}
                        <div style={{ fontSize: 13, fontWeight: 500, color: '#f0e6d0', marginBottom: 4 }}>
                          {addr.label || 'Address'}
                          {addr.phone && <span style={{ fontSize: 11, color: 'rgba(240,230,208,0.4)', marginLeft: 8 }}>{addr.phone}</span>}
                        </div>
                        <div style={{ fontSize: 12, color: 'rgba(240,230,208,0.38)', lineHeight: 1.7 }}>
                          {addr.street}<br />
                          {addr.city}, {addr.state} {addr.zipCode}
                          {addr.country && addr.country !== 'India' ? `, ${addr.country}` : ''}
                        </div>
                        <div style={{ position: 'absolute', top: 16, right: 16, width: 16, height: 16, border: '1px solid rgba(201,169,110,0.18)', borderRadius: '50%', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                          {selectedAddress?.id === addr.id && <div style={{ width: 8, height: 8, background: '#c9a96e', borderRadius: '50%' }} />}
                        </div>
                      </div>
                    ))}
                  </div>
                )}

                {/* New address form */}
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, fontWeight: 300, color: 'rgba(240,230,208,0.6)', marginBottom: 20 }}>
                  {addresses?.length > 0 ? 'Or add a new address' : 'Enter delivery address'}
                </div>
                {addrError && (
                  <div style={{ marginBottom: 16, padding: '10px 16px', background: 'rgba(180,60,60,0.12)', border: '1px solid rgba(180,60,60,0.3)', fontSize: 12, color: 'rgba(240,150,150,0.9)' }}>
                    {addrError}
                  </div>
                )}
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <FormField
                    label="Address Label (e.g. Home, Work)"
                    value={newAddr.label}
                    onChange={e => { setSelectedAddress(null); setNewAddr(p => ({ ...p, label: e.target.value })) }}
                  />
                  <FormField
                    label="Phone"
                    value={newAddr.phone}
                    onChange={e => { setSelectedAddress(null); setNewAddr(p => ({ ...p, phone: e.target.value })) }}
                  />
                </div>
                <div style={{ marginBottom: 16 }}>
                  <FormField
                    label="Street Address *"
                    value={newAddr.street}
                    onChange={e => { setSelectedAddress(null); setNewAddr(p => ({ ...p, street: e.target.value })) }}
                  />
                </div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 32 }}>
                  <FormField label="City *" value={newAddr.city} onChange={e => { setSelectedAddress(null); setNewAddr(p => ({ ...p, city: e.target.value })) }} />
                  <FormField label="State *" value={newAddr.state} onChange={e => { setSelectedAddress(null); setNewAddr(p => ({ ...p, state: e.target.value })) }} />
                  <FormField label="ZIP / Pincode *" value={newAddr.zipCode} onChange={e => { setSelectedAddress(null); setNewAddr(p => ({ ...p, zipCode: e.target.value })) }} />
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button onClick={() => navigate('/cart')} style={{ padding: '18px 28px', background: 'none', color: 'rgba(240,230,208,0.38)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', border: '1px solid rgba(201,169,110,0.18)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>← Back</button>
                  <button
                    onClick={() => {
                      if (!selectedAddress && (!newAddr.street || !newAddr.city || !newAddr.state || !newAddr.zipCode)) {
                        setAddrError('Please fill in all required address fields.')
                        return
                      }
                      setAddrError('')
                      setStep(1)
                    }}
                    style={{ padding: '18px 36px', background: '#c9a96e', color: '#0d0c0b', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>
                    Continue →
                  </button>
                </div>
              </div>
            )}

            {step === 1 && (
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 300, color: '#f0e6d0', marginBottom: 28 }}>Review Your Order</div>
                {items.map((item, i) => (
                  <div key={i} style={{ display: 'flex', gap: 16, alignItems: 'center', padding: '16px 0', borderBottom: '1px solid rgba(201,169,110,0.08)' }}>
                    <div style={{ width: 52, height: 64, background: '#252320', border: '1px solid rgba(201,169,110,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
                      {item.image ? <img src={item.image} alt={item.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} /> : null}
                    </div>
                    <div style={{ flex: 1 }}>
                      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 16, fontWeight: 300, color: '#f0e6d0' }}>{item.name}</div>
                      <div style={{ fontSize: 11, color: 'rgba(240,230,208,0.38)', marginTop: 4 }}>
                        Qty: {item.quantity}{item.size ? ` · Size: ${item.size}` : ''}
                      </div>
                    </div>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 18, color: '#c9a96e', flexShrink: 0 }}>{fmt((item.priceAtAdd || 0) * item.quantity)}</div>
                  </div>
                ))}
                {(selectedAddress || newAddr.street) && (
                  <div style={{ marginTop: 24, padding: '16px 20px', background: 'rgba(201,169,110,0.03)', border: '1px solid rgba(201,169,110,0.12)' }}>
                    <div style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)', marginBottom: 8 }}>Deliver to</div>
                    {selectedAddress ? (
                      <>
                        <div style={{ fontSize: 13, color: '#f0e6d0' }}>{selectedAddress.label}</div>
                        <div style={{ fontSize: 12, color: 'rgba(240,230,208,0.5)', marginTop: 4 }}>{addrLine(selectedAddress)}</div>
                      </>
                    ) : (
                      <>
                        <div style={{ fontSize: 13, color: '#f0e6d0' }}>{newAddr.label}</div>
                        <div style={{ fontSize: 12, color: 'rgba(240,230,208,0.5)', marginTop: 4 }}>{addrLine(newAddr)}</div>
                      </>
                    )}
                  </div>
                )}
                <div style={{ display: 'flex', gap: 16, marginTop: 32 }}>
                  <button onClick={() => setStep(0)} style={{ padding: '18px 28px', background: 'none', color: 'rgba(240,230,208,0.38)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', border: '1px solid rgba(201,169,110,0.18)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>← Back</button>
                  <button onClick={() => setStep(2)} style={{ padding: '18px 36px', background: '#c9a96e', color: '#0d0c0b', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Continue →</button>
                </div>
              </div>
            )}

            {step === 2 && (
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 24, fontWeight: 300, color: '#f0e6d0', marginBottom: 28 }}>Payment Method</div>
                <div style={{ display: 'grid', gap: 12, marginBottom: 28 }}>
                  {[
                    { id: 'razorpay', name: 'Razorpay', desc: 'Cards, UPI, Netbanking, Wallets' },
                    { id: 'cod', name: 'Cash on Delivery', desc: 'Pay when your order arrives' },
                  ].map((method) => (
                    <div
                      key={method.id}
                      onClick={() => setPaymentMethod(method.id)}
                      style={{ display: 'flex', alignItems: 'center', gap: 16, padding: '18px 20px', border: `1px solid ${paymentMethod === method.id ? '#c9a96e' : 'rgba(201,169,110,0.18)'}`, cursor: 'pointer', transition: 'all 0.4s', position: 'relative' }}>
                      {paymentMethod === method.id && <div style={{ position: 'absolute', right: 0, top: 0, bottom: 0, width: 3, background: '#c9a96e' }} />}
                      <div style={{ width: 44, height: 28, border: '1px solid rgba(201,169,110,0.18)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 10, color: '#c9a96e', fontFamily: "'DM Mono',monospace", flexShrink: 0 }}>
                        {method.id === 'razorpay' ? 'RZP' : 'COD'}
                      </div>
                      <div>
                        <div style={{ fontSize: 13, color: '#f0e6d0', letterSpacing: '0.04em' }}>{method.name}</div>
                        <div style={{ fontSize: 11, color: 'rgba(240,230,208,0.38)' }}>{method.desc}</div>
                      </div>
                    </div>
                  ))}
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '12px 16px', border: '1px solid rgba(74,92,71,0.25)', background: 'rgba(74,92,71,0.08)', fontSize: 11, color: 'rgba(138,173,135,0.8)', marginBottom: 24 }}>
                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" /></svg>
                  Your payment is secured with 256-bit SSL encryption
                </div>
                <div style={{ display: 'flex', gap: 16 }}>
                  <button onClick={() => setStep(1)} style={{ padding: '18px 28px', background: 'none', color: 'rgba(240,230,208,0.38)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', border: '1px solid rgba(201,169,110,0.18)', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>← Back</button>
                  <button onClick={placeOrder} disabled={processing} style={{ padding: '18px 36px', background: '#c9a96e', color: '#0d0c0b', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, border: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: processing ? 0.7 : 1 }}>
                    Place Order — {fmt(total)}
                  </button>
                </div>
              </div>
            )}
          </div>
          {miniSummary}
        </div>
      </div>
    </div>
  )
}
