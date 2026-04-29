export default function ProductCardSkeleton() {
  return (
    <div style={{ flex: '0 0 300px', background: '#1a1916', border: '1px solid rgba(201,169,110,0.08)', overflow: 'hidden' }}>
      <div className="skeleton" style={{ width: '100%', height: 320 }} />
      <div style={{ padding: 24 }}>
        <div className="skeleton" style={{ width: 80, height: 10, marginBottom: 12 }} />
        <div className="skeleton" style={{ width: '70%', height: 20, marginBottom: 8 }} />
        <div className="skeleton" style={{ width: '90%', height: 13, marginBottom: 4 }} />
        <div className="skeleton" style={{ width: '60%', height: 13, marginBottom: 20 }} />
        <div style={{ display: 'flex', justifyContent: 'space-between' }}>
          <div className="skeleton" style={{ width: 80, height: 22 }} />
          <div className="skeleton" style={{ width: 60, height: 14 }} />
        </div>
      </div>
    </div>
  )
}
