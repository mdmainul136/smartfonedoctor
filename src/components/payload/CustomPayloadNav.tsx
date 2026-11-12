'use client'

import React, { useState } from 'react'
import Link from 'next/link'
import { usePathname } from 'next/navigation'
import {
  LayoutDashboard,
  CalendarCheck,
  Wrench,
  MapPin,
  Globe,
  Sparkles,
  Star,
  FileText,
  User,
  Settings,
  Layers,
  PhoneCall,
  ExternalLink,
} from 'lucide-react'

export const CustomPayloadNav = () => {
  const pathname = usePathname()

  const isCurrent = (path: string) => pathname === path || pathname.startsWith(path + '/')

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: '#ffffff',
        borderRight: '1px solid #e5e7eb',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '13px',
        color: '#111111',
      }}
    >
      {/* 1. BRAND HEADER */}
      <div style={{ padding: '16px 14px 12px 14px', borderBottom: '1px solid #e5e7eb' }}>
        <Link
          href="/admin"
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '10px',
            textDecoration: 'none',
            color: 'inherit',
          }}
        >
          <span
            style={{
              width: '32px',
              height: '32px',
              borderRadius: '8px',
              backgroundColor: '#009691',
              color: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: '13px',
              fontWeight: 800,
              flexShrink: 0,
            }}
          >
            SF
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#111111', lineHeight: 1.2 }}>
              SmartFoneDoctor
            </span>
            <span style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.2 }}>
              Central Admin &amp; Operations
            </span>
          </div>
        </Link>
      </div>

      {/* 2. SCROLLABLE MENU SECTIONS */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        
        {/* SECTION 1: OPERATIONS */}
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#9ca3af',
              padding: '4px 8px',
              marginBottom: '4px',
            }}
          >
            Store Operations
          </div>

          <Link
            href="/admin/collections/leads"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/leads') ? '#009691' : '#374151',
              backgroundColor: pathname.includes('/admin/collections/leads') ? '#e6f7f6' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/leads') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <CalendarCheck size={16} style={{ color: pathname.includes('/admin/collections/leads') ? '#009691' : '#6b7280' }} />
            <span>Customer Leads &amp; Calls</span>
          </Link>

          <Link
            href="/admin/collections/repairs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/repairs') ? '#009691' : '#374151',
              backgroundColor: pathname.includes('/admin/collections/repairs') ? '#e6f7f6' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/repairs') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <Wrench size={16} style={{ color: pathname.includes('/admin/collections/repairs') ? '#009691' : '#6b7280' }} />
            <span>Repair Tickets &amp; Tracking</span>
          </Link>

          <Link
            href="/admin/collections/reviews"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/reviews') ? '#009691' : '#374151',
              backgroundColor: pathname.includes('/admin/collections/reviews') ? '#e6f7f6' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/reviews') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <Star size={16} style={{ color: pathname.includes('/admin/collections/reviews') ? '#009691' : '#6b7280' }} />
            <span>Customer Reviews</span>
          </Link>

          <Link
            href="/admin/collections/locations"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/locations') ? '#009691' : '#374151',
              backgroundColor: pathname.includes('/admin/collections/locations') ? '#e6f7f6' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/locations') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <MapPin size={16} style={{ color: pathname.includes('/admin/collections/locations') ? '#009691' : '#6b7280' }} />
            <span>3 Store Locations</span>
          </Link>
        </div>

        {/* SECTION 2: WEBSITE & CONTENT */}
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#9ca3af',
              padding: '4px 8px',
              marginBottom: '4px',
            }}
          >
            Website &amp; CMS
          </div>

          <Link
            href="/admin/collections/pages"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/pages') ? '#009691' : '#374151',
              backgroundColor: pathname.includes('/admin/collections/pages') ? '#e6f7f6' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/pages') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <FileText size={16} style={{ color: pathname.includes('/admin/collections/pages') ? '#009691' : '#6b7280' }} />
            <span>Pages &amp; Block Builder</span>
          </Link>

          <Link
            href="/admin/collections/services"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/services') ? '#009691' : '#374151',
              backgroundColor: pathname.includes('/admin/collections/services') ? '#e6f7f6' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/services') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <Wrench size={16} style={{ color: pathname.includes('/admin/collections/services') ? '#009691' : '#6b7280' }} />
            <span>Services &amp; Pricing</span>
          </Link>

          <Link
            href="/admin/collections/faqs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/faqs') ? '#009691' : '#374151',
              backgroundColor: pathname.includes('/admin/collections/faqs') ? '#e6f7f6' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/faqs') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <Sparkles size={16} style={{ color: pathname.includes('/admin/collections/faqs') ? '#009691' : '#6b7280' }} />
            <span>FAQs &amp; Schema</span>
          </Link>

          <Link
            href="/admin/collections/media"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/media') ? '#009691' : '#374151',
              backgroundColor: pathname.includes('/admin/collections/media') ? '#e6f7f6' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/media') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <Layers size={16} style={{ color: pathname.includes('/admin/collections/media') ? '#009691' : '#6b7280' }} />
            <span>Media &amp; Images</span>
          </Link>
        </div>

        {/* SECTION 3: ANALYTICS & TOOLS */}
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#9ca3af',
              padding: '4px 8px',
              marginBottom: '4px',
            }}
          >
            SEO &amp; Insights
          </div>

          <a
            href="/portal/local-seo"
            style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              padding: '8px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              fontWeight: 500,
              marginBottom: '2px',
            }}
          >
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
              <Globe size={16} style={{ color: '#6b7280' }} />
              <span>GMB &amp; SEO Tracker</span>
            </div>
            <ExternalLink size={13} style={{ color: '#9ca3af' }} />
          </a>
        </div>

        {/* SECTION 4: SYSTEM */}
        <div>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.05em',
              color: '#9ca3af',
              padding: '4px 8px',
              marginBottom: '4px',
            }}
          >
            System
          </div>

          <Link
            href="/admin/collections/users"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '8px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/users') ? '#009691' : '#374151',
              backgroundColor: pathname.includes('/admin/collections/users') ? '#e6f7f6' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/users') ? 600 : 500,
            }}
          >
            <User size={16} style={{ color: pathname.includes('/admin/collections/users') ? '#009691' : '#6b7280' }} />
            <span>Staff &amp; Admins</span>
          </Link>
        </div>

      </div>

      {/* 3. FOOTER */}
      <div
        style={{
          padding: '12px 14px',
          borderTop: '1px solid #e5e7eb',
          fontSize: '11px',
          color: '#6b7280',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
        }}
      >
        <span>v3.91 · PostgreSQL</span>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          style={{
            color: '#009691',
            textDecoration: 'none',
            fontWeight: 600,
            display: 'flex',
            alignItems: 'center',
            gap: '4px',
          }}
        >
          View Site
          <ExternalLink size={12} />
        </a>
      </div>
    </div>
  )
}
