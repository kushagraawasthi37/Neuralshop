import { useState } from 'react'
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { useForm } from 'react-hook-form'
import { userApi } from '../../api/user'

function FormField({ label, register, name, type = 'text', ...props }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
      <label style={{ fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)' }}>{label}</label>
      <input type={type} {...(register ? register(name) : {})} {...props} style={{ padding: '14px 18px', background: 'rgba(255,255,255,0.02)', border: '1px solid rgba(201,169,110,0.18)', color: '#f0e6d0', fontFamily: "'DM Sans',sans-serif", fontSize: 14, outline: 'none', width: '100%' }} />
    </div>
  )
}

function Toast({ msg, show }) {
  return (
    <div style={{ position: 'fixed', bottom: 28, right: 28, zIndex: 9999, background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', padding: '14px 22px', display: 'flex', alignItems: 'center', gap: 10, fontSize: 12, color: '#f0e6d0', transform: show ? 'translateY(0)' : 'translateY(70px)', opacity: show ? 1 : 0, transition: 'all 0.5s cubic-bezier(0.23,1,0.32,1)', minWidth: 240 }}>
      <div style={{ width: 5, height: 5, background: '#c9a96e', borderRadius: '50%' }} />{msg}
    </div>
  )
}

const NAV_TABS = [
  { id: 'personal', label: 'Personal Info', icon: '👤' },
  { id: 'addresses', label: 'Addresses', icon: '📍' },
  { id: 'security', label: 'Security', icon: '🔒' },
]

export default function ProfilePage() {
  const qc = useQueryClient()
  const [activeTab, setActiveTab] = useState('personal')
  const [toast, setToast] = useState({ show: false, msg: '' })
  const [editingAddrId, setEditingAddrId] = useState(null)
  const [showNewAddr, setShowNewAddr] = useState(false)
  const [addrForm, setAddrForm] = useState({ label: 'Home', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India' })

  const showToast = (msg) => { setToast({ show: true, msg }); setTimeout(() => setToast({ show: false, msg: '' }), 3000) }

  const { data: profile, isLoading } = useQuery({ queryKey: ['profile'], queryFn: () => userApi.getProfile().then(r => r.data.data) })
  const { data: addresses = [] } = useQuery({ queryKey: ['addresses'], queryFn: () => userApi.getAddresses().then(r => r.data.data || []) })

  const { register, handleSubmit, reset } = useForm({ values: profile ? { name: profile.name, phone: profile.phone } : {} })

  const updateProfileMutation = useMutation({
    mutationFn: (data) => userApi.updateProfile(data),
    onSuccess: () => { qc.invalidateQueries(['profile']); showToast('Profile updated successfully') },
    onError: () => showToast('Failed to update profile'),
  })

  const createAddrMutation = useMutation({
    mutationFn: (data) => userApi.createAddress(data),
    onSuccess: () => { qc.invalidateQueries(['addresses']); setShowNewAddr(false); setAddrForm({ label: 'Home', phone: '', street: '', city: '', state: '', zipCode: '', country: 'India' }); showToast('Address added') },
    onError: () => showToast('Failed to add address'),
  })

  const deleteAddrMutation = useMutation({
    mutationFn: (id) => userApi.deleteAddress(id),
    onSuccess: () => { qc.invalidateQueries(['addresses']); showToast('Address removed') },
  })

  const initials = profile?.name ? profile.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase() : '?'

  return (
    <div style={{ minHeight: '100vh', paddingTop: 100 }}>
      <div style={{ maxWidth: 1320, margin: '0 auto', padding: '0 52px' }}>
        <div style={{ padding: '52px 0 44px', borderBottom: '1px solid rgba(201,169,110,0.18)', marginBottom: 52 }}>
          <div style={{ fontSize: 10, letterSpacing: '0.28em', textTransform: 'uppercase', color: '#c9a96e', display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
            <div style={{ width: 26, height: 1, background: '#c9a96e' }} />My Account
          </div>
          <h1 style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 'clamp(34px,4.5vw,58px)', fontWeight: 300, color: '#f0e6d0', lineHeight: 1.04 }}>
            Your <em style={{ fontStyle: 'italic', color: '#c9a96e' }}>Profile</em>
          </h1>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '280px 1fr', gap: 40, paddingBottom: 100, alignItems: 'start' }}>
          <div style={{ background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', padding: 32, position: 'sticky', top: 100 }}>
            <div style={{ width: 88, height: 88, border: '1px solid rgba(201,169,110,0.18)', margin: '0 auto 20px', position: 'relative', cursor: 'pointer', overflow: 'hidden' }}>
              <div style={{ width: '100%', height: '100%', background: '#252320', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: "'Cormorant Garamond',serif", fontSize: 32, fontWeight: 300, color: '#c9a96e' }}>{initials}</div>
            </div>
            <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, fontWeight: 300, color: '#f0e6d0', textAlign: 'center', marginBottom: 4 }}>{profile?.name || '—'}</div>
            <div style={{ fontSize: 11, color: 'rgba(240,230,208,0.38)', textAlign: 'center', marginBottom: 20 }}>{profile?.email || '—'}</div>

            <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 2, marginBottom: 24 }}>
              {[
                { num: 0, label: 'Orders' },
                { num: addresses.length, label: 'Addresses' },
              ].map((s, i) => (
                <div key={i} style={{ background: 'rgba(201,169,110,0.03)', border: '1px solid rgba(201,169,110,0.18)', padding: 12, textAlign: 'center' }}>
                  <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 22, color: '#c9a96e' }}>{s.num}</div>
                  <div style={{ fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)' }}>{s.label}</div>
                </div>
              ))}
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
              {NAV_TABS.map((tab, i) => (
                <button key={tab.id} onClick={() => setActiveTab(tab.id)} style={{ padding: '13px 16px', border: '1px solid rgba(201,169,110,0.18)', borderBottom: i < NAV_TABS.length - 1 ? 'none' : '1px solid rgba(201,169,110,0.18)', display: 'flex', alignItems: 'center', gap: 12, fontSize: 12, color: activeTab === tab.id ? '#c9a96e' : 'rgba(240,230,208,0.38)', cursor: 'pointer', transition: 'all 0.3s', letterSpacing: '0.04em', background: activeTab === tab.id ? 'rgba(201,169,110,0.05)' : 'none', borderLeftWidth: activeTab === tab.id ? 2 : 1, borderLeftColor: activeTab === tab.id ? '#c9a96e' : 'rgba(201,169,110,0.18)', fontFamily: "'DM Sans',sans-serif", textAlign: 'left' }}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          <div>
            {activeTab === 'personal' && (
              <form onSubmit={handleSubmit(data => updateProfileMutation.mutate(data))}>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 300, color: '#f0e6d0', marginBottom: 32 }}>Personal Information</div>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                  <FormField label="Full Name" register={register} name="name" defaultValue={profile?.name} />
                  <FormField label="Phone" register={register} name="phone" defaultValue={profile?.phone} />
                </div>
                <div style={{ marginBottom: 32 }}>
                  <FormField label="Email Address" defaultValue={profile?.email} disabled style={{ opacity: 0.6 }} />
                </div>
                <button type="submit" disabled={updateProfileMutation.isPending} style={{ padding: '14px 32px', background: '#c9a96e', border: 'none', color: '#0d0c0b', fontSize: 11, letterSpacing: '0.18em', textTransform: 'uppercase', fontWeight: 500, cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", opacity: updateProfileMutation.isPending ? 0.7 : 1 }}>
                  {updateProfileMutation.isPending ? 'Saving...' : 'Save Changes'}
                </button>
              </form>
            )}

            {activeTab === 'addresses' && (
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 300, color: '#f0e6d0', marginBottom: 32 }}>Saved Addresses</div>
                <div style={{ display: 'grid', gap: 16, marginBottom: 24 }}>
                  {addresses.map(addr => (
                    <div key={addr.id} style={{ padding: '20px 24px', background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', position: 'relative' }}>
                      <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between' }}>
                        <div>
                          <div style={{ fontSize: 14, color: '#f0e6d0', marginBottom: 6 }}>
                            {addr.label || 'Address'}
                            {addr.isDefault && <span style={{ marginLeft: 8, fontSize: 9, letterSpacing: '0.12em', textTransform: 'uppercase', color: '#c9a96e', border: '1px solid rgba(201,169,110,0.3)', padding: '2px 6px' }}>Default</span>}
                          </div>
                          <div style={{ fontSize: 12, color: 'rgba(240,230,208,0.5)', lineHeight: 1.7 }}>{addr.street}<br />{addr.city}, {addr.state} {addr.zipCode}</div>
                          <div style={{ fontSize: 11, color: 'rgba(240,230,208,0.38)', marginTop: 4 }}>{addr.phone}</div>
                        </div>
                        <button onClick={() => deleteAddrMutation.mutate(addr.id)} style={{ padding: '6px 14px', border: '1px solid rgba(140,70,70,0.35)', background: 'none', color: 'rgba(190,110,110,0.75)', fontSize: 9, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Remove</button>
                      </div>
                    </div>
                  ))}
                </div>
                {!showNewAddr ? (
                  <button onClick={() => setShowNewAddr(true)} style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '16px 20px', border: '1px dashed rgba(201,169,110,0.2)', color: 'rgba(240,230,208,0.38)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', background: 'none', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif", width: '100%', justifyContent: 'center', transition: 'all 0.3s' }}>
                    + Add New Address
                  </button>
                ) : (
                  <div style={{ padding: 24, border: '1px solid rgba(201,169,110,0.18)', background: '#1a1916' }}>
                    <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 20, color: '#f0e6d0', marginBottom: 20 }}>New Address</div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 16 }}>
                      <FormField label="Label (Home, Work…)" value={addrForm.label} onChange={e => setAddrForm(p => ({ ...p, label: e.target.value }))} />
                      <FormField label="Phone" value={addrForm.phone} onChange={e => setAddrForm(p => ({ ...p, phone: e.target.value }))} />
                    </div>
                    <div style={{ marginBottom: 16 }}><FormField label="Street Address" value={addrForm.street} onChange={e => setAddrForm(p => ({ ...p, street: e.target.value }))} /></div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 16, marginBottom: 24 }}>
                      <FormField label="City" value={addrForm.city} onChange={e => setAddrForm(p => ({ ...p, city: e.target.value }))} />
                      <FormField label="State" value={addrForm.state} onChange={e => setAddrForm(p => ({ ...p, state: e.target.value }))} />
                      <FormField label="ZIP / Pincode" value={addrForm.zipCode} onChange={e => setAddrForm(p => ({ ...p, zipCode: e.target.value }))} />
                    </div>
                    <div style={{ display: 'flex', gap: 12 }}>
                      <button onClick={() => createAddrMutation.mutate(addrForm)} style={{ padding: '12px 28px', background: '#c9a96e', border: 'none', color: '#0d0c0b', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Save Address</button>
                      <button onClick={() => setShowNewAddr(false)} style={{ padding: '12px 20px', background: 'none', border: '1px solid rgba(201,169,110,0.18)', color: 'rgba(240,230,208,0.38)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Cancel</button>
                    </div>
                  </div>
                )}
              </div>
            )}

            {activeTab === 'security' && (
              <div>
                <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 28, fontWeight: 300, color: '#f0e6d0', marginBottom: 32 }}>Security Settings</div>
                <div style={{ padding: '24px', background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)', marginBottom: 16 }}>
                  <div style={{ fontSize: 14, color: '#f0e6d0', marginBottom: 4 }}>Password</div>
                  <div style={{ fontSize: 12, color: 'rgba(240,230,208,0.38)', marginBottom: 16 }}>Change your account password</div>
                  <button onClick={() => window.location.href = '/forgot-password'} style={{ padding: '10px 24px', background: 'none', border: '1px solid rgba(201,169,110,0.18)', color: 'rgba(240,230,208,0.55)', fontSize: 11, letterSpacing: '0.14em', textTransform: 'uppercase', cursor: 'pointer', fontFamily: "'DM Sans',sans-serif" }}>Change Password</button>
                </div>
                <div style={{ padding: '24px', background: '#1a1916', border: '1px solid rgba(201,169,110,0.18)' }}>
                  <div style={{ fontSize: 14, color: '#f0e6d0', marginBottom: 4 }}>Account Email</div>
                  <div style={{ fontSize: 12, color: 'rgba(240,230,208,0.38)', marginBottom: 4 }}>Your verified email address</div>
                  <div style={{ fontFamily: "'DM Mono',monospace", fontSize: 13, color: '#c9a96e' }}>{profile?.email}</div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
      <Toast msg={toast.msg} show={toast.show} />
    </div>
  )
}
