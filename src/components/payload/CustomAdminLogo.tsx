import React from 'react'

export const CustomAdminLogo = () => {
  return (
    <div style={{ display: 'flex', alignItems: 'center', gap: '10px', padding: '6px 0' }}>
      <span
        style={{
          width: '28px',
          height: '28px',
          borderRadius: '6px',
          backgroundColor: '#111111',
          color: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          fontSize: '12px',
          fontWeight: 700,
          letterSpacing: '-0.02em',
        }}
      >
        SF
      </span>
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span style={{ fontSize: '14px', fontWeight: 600, color: 'var(--theme-elevation-900, #111)', lineHeight: 1.2 }}>
          Smart Fone Doctor
        </span>
        <span style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.2 }}>
          Content Management System
        </span>
      </div>
    </div>
  )
}

