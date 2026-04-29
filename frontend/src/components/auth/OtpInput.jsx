import { useRef } from 'react'

export default function OtpInput({ length = 6, value = '', onChange }) {
  const refs = useRef([])

  const digits = Array.from({ length }, (_, i) => value[i] || '')

  const handleKey = (e, i) => {
    if (e.key === 'Backspace') {
      if (digits[i]) {
        const next = digits.map((d, j) => (j === i ? '' : d)).join('')
        onChange(next)
      } else if (i > 0) {
        refs.current[i - 1]?.focus()
        const next = digits.map((d, j) => (j === i - 1 ? '' : d)).join('')
        onChange(next)
      }
      return
    }
    if (e.key === 'ArrowLeft' && i > 0) { refs.current[i - 1]?.focus(); return }
    if (e.key === 'ArrowRight' && i < length - 1) { refs.current[i + 1]?.focus(); return }
  }

  const handleChange = (e, i) => {
    const char = e.target.value.replace(/\D/g, '').slice(-1)
    if (!char) return
    const next = digits.map((d, j) => (j === i ? char : d)).join('')
    onChange(next)
    if (i < length - 1) refs.current[i + 1]?.focus()
  }

  const handlePaste = (e) => {
    e.preventDefault()
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, length)
    onChange(pasted.padEnd(length, ' ').slice(0, length).trimEnd())
    refs.current[Math.min(pasted.length, length - 1)]?.focus()
  }

  return (
    <div style={{ display: 'flex', gap: 10, justifyContent: 'center', marginBottom: 24 }}>
      {digits.map((d, i) => (
        <input
          key={i}
          ref={el => refs.current[i] = el}
          type="text"
          inputMode="numeric"
          maxLength={1}
          value={d}
          onChange={e => handleChange(e, i)}
          onKeyDown={e => handleKey(e, i)}
          onPaste={handlePaste}
          style={{
            width: 52, height: 64, textAlign: 'center',
            background: 'rgba(255,255,255,0.02)',
            border: `1px solid ${d ? 'rgba(201,169,110,0.4)' : 'rgba(201,169,110,0.18)'}`,
            color: '#f0e6d0',
            fontFamily: "'Cormorant Garamond',serif",
            fontSize: 28, fontWeight: 300,
            outline: 'none',
            transition: 'border-color 0.3s,background 0.3s',
          }}
          onFocus={e => { e.target.style.borderColor = 'rgba(201,169,110,0.6)'; e.target.style.background = 'rgba(201,169,110,0.04)' }}
          onBlur={e => { e.target.style.borderColor = d ? 'rgba(201,169,110,0.4)' : 'rgba(201,169,110,0.18)'; e.target.style.background = 'rgba(255,255,255,0.02)' }}
        />
      ))}
    </div>
  )
}
