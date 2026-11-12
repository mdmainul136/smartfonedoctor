import React from 'react'

export const PortalNavBanner = () => {
  return (
    <div className="portal-switch-banner">
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '4px' }}>
        <span style={{ fontSize: '11px', textTransform: 'uppercase', letterSpacing: '0.05em', color: '#6b7280', fontWeight: 600 }}>
          Operations
        </span>
        <span className="portal-badge">
          <span style={{ width: '6px', height: '6px', borderRadius: '50%', backgroundColor: '#10b981', display: 'inline-block' }} />
          Live
        </span>
      </div>
      <a href="/portal" className="portal-link">
        <span>Go to Store Portal &rarr;</span>
      </a>
      <span className="portal-sub">Leads, Pricing, Reviews &amp; SEO</span>
    </div>
  )
}

