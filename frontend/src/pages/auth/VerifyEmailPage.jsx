import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { AuthCenter } from '../../components/auth/AuthLayout'
import OtpInput from '../../components/auth/OtpInput'
import { AuthBtn, FormEyebrow, FormTitle, FormSubtitle, FormError, TextLink } from '../../components/auth/AuthField'
import { StepBar } from './RegisterPage'
import { authApi } from '../../api/auth'
import { useAuthStore } from '../../store/authStore'

const RESEND_SECS = 60

export default function VerifyEmailPage() {
  const navigate = useNavigate()
  const { pendingEmail, pendingRole, setPendingEmail } = useAuthStore()
  const [otp, setOtp] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState('')
  const [success, setSuccess] = useState(false)
  const [timer, setTimer] = useState(RESEND_SECS)
  const [resending, setResending] = useState(false)

  useEffect(() => { if (!pendingEmail) navigate(pendingRole === 'admin' ? '/admin/register' : '/register') }, [pendingEmail])
  useEffect(() => {
    if (timer <= 0) return
    const t = setTimeout(() => setTimer(s => s - 1), 1000)
    return () => clearTimeout(t)
  }, [timer])

  const handleVerify = async () => {
    if (otp.replace(/\s/g, '').length < 6) { setError('Enter all 6 digits'); return }
    setLoading(true); setError('')
    try {
      const fn = pendingRole === 'admin' ? authApi.verifyAdminEmail : authApi.verifyEmail
      await fn({ email: pendingEmail, otp })
      setSuccess(true)
      setPendingEmail(null)
      setTimeout(() => navigate(pendingRole === 'admin' ? '/admin/login' : '/login'), 1800)
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid OTP. Try again.')
    } finally { setLoading(false) }
  }

  const handleResend = async () => {
    setResending(true); setError('')
    try {
      await authApi.resendOtp({ email: pendingEmail, type: 'verification', role: pendingRole })
      setTimer(RESEND_SECS)
    } catch (err) {
      setError(err.response?.data?.message || 'Could not resend.')
    } finally { setResending(false) }
  }

  return (
    <AuthCenter>
      {success ? <SuccessView role={pendingRole} /> : (
        <>
          <StepBar current={2} />
          <FormEyebrow>Email Verification</FormEyebrow>
          <FormTitle>Check your<br />inbox.</FormTitle>
          <FormSubtitle tight>We sent a 6-digit code. It expires in 10 minutes.</FormSubtitle>

          {pendingEmail && (
            <div style={{ display: 'inline-flex', alignItems: 'center', gap: 8, padding: '7px 14px', border: '1px solid rgba(201,169,110,0.18)', fontFamily: "'DM Mono',monospace", fontSize: 12, color: 'rgba(240,230,208,0.55)', marginBottom: 20 }}>
              <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5"><rect x="2" y="4" width="20" height="16" rx="2"/><path d="M22 7l-10 7L2 7"/></svg>
              {pendingEmail}
            </div>
          )}

          <FormError message={error} />

          <label style={{ display: 'block', fontSize: 10, letterSpacing: '0.18em', textTransform: 'uppercase', color: 'rgba(240,230,208,0.38)', textAlign: 'center', marginBottom: 14 }}>
            Enter 6-digit OTP
          </label>
          <OtpInput value={otp} onChange={setOtp} />

          <AuthBtn onClick={handleVerify} loading={loading} type="button">Verify & Continue →</AuthBtn>

          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 6, fontSize: 12, color: 'rgba(240,230,208,0.38)', marginBottom: 16 }}>
            {timer > 0 ? (
              <>Resend in <span style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 15, color: '#c9a96e' }}>{timer}s</span></>
            ) : (
              <button onClick={handleResend} disabled={resending} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#c9a96e', fontSize: 12, fontFamily: "'DM Sans',sans-serif", opacity: resending ? 0.5 : 1 }}>
                {resending ? 'Sending…' : 'Resend code →'}
              </button>
            )}
          </div>

          <div style={{ textAlign: 'center', fontSize: 12, color: 'rgba(240,230,208,0.38)' }}>
            Wrong email?{' '}
            <TextLink onClick={() => navigate(pendingRole === 'admin' ? '/admin/register' : '/register')}>← Back to register</TextLink>
          </div>
        </>
      )}
    </AuthCenter>
  )
}

function SuccessView({ role }) {
  return (
    <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
      <div style={{ width: 60, height: 60, border: '1px solid rgba(201,169,110,0.3)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20, position: 'relative' }}>
        <div style={{ position: 'absolute', inset: -4, border: '1px solid rgba(201,169,110,0.1)' }} />
        <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#c9a96e" strokeWidth="1.5"><path d="M20 6L9 17l-5-5"/></svg>
      </div>
      <div style={{ fontFamily: "'Cormorant Garamond',serif", fontSize: 30, fontWeight: 300, color: '#f0e6d0', marginBottom: 10 }}>Email verified.</div>
      <p style={{ fontSize: 13, color: 'rgba(240,230,208,0.4)', lineHeight: 1.6 }}>
        Account active. Redirecting to {role === 'admin' ? 'admin login' : 'sign in'}…
      </p>
    </div>
  )
}
