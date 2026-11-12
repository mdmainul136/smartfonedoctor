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
  ChevronDown,
  ExternalLink,
} from 'lucide-react'

export const CustomPayloadNav = () => {
  const pathname = usePathname()
  const [openSection, setOpenSection] = useState<string | null>('portal')

  const toggleSection = (id: string) => {
    setOpenSection((prev) => (prev === id ? null : id))
  }

  const isCurrent = (path: string) => pathname === path

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        height: '100%',
        width: '100%',
        backgroundColor: '#f9fafb',
        borderRight: '1px solid #e5e7eb',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        fontSize: '13px',
        color: '#111111',
      }}
    >
      {/* 1. BRAND HEADER */}
      <div style={{ padding: '16px 14px 12px 14px', borderBottom: '1px solid #e5e7eb' }}>
        <Link
          href="/portal"
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
              flexShrink: 0,
            }}
          >
            SF
          </span>
          <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0 }}>
            <span style={{ fontSize: '13px', fontWeight: 600, color: '#111111', lineHeight: 1.2 }}>
              Smart Fone Doctor
            </span>
            <span style={{ fontSize: '11px', color: '#6b7280', lineHeight: 1.2 }}>
              Philadelphia · 3 stores
            </span>
          </div>
        </Link>
      </div>

      {/* 2. SCROLLABLE MENU SECTIONS */}
      <div style={{ flex: 1, overflowY: 'auto', padding: '12px 10px' }}>
        {/* GROUP A: CMS COLLECTIONS */}
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6b7280',
              padding: '4px 8px',
              marginBottom: '4px',
            }}
          >
            Website Content (CMS)
          </div>

          <Link
            href="/admin"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: isCurrent('/admin') ? '#111111' : '#4b5563',
              backgroundColor: isCurrent('/admin') ? '#e5e7eb' : 'transparent',
              fontWeight: isCurrent('/admin') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <LayoutDashboard size={15} style={{ color: '#4b5563' }} />
            <span>CMS Dashboard</span>
          </Link>

          <Link
            href="/admin/collections/pages"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/pages') ? '#111111' : '#4b5563',
              backgroundColor: pathname.includes('/admin/collections/pages') ? '#e5e7eb' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/pages') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <FileText size={15} style={{ color: '#4b5563' }} />
            <span>Pages &amp; Blocks</span>
          </Link>

          <Link
            href="/admin/collections/services"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/services') ? '#111111' : '#4b5563',
              backgroundColor: pathname.includes('/admin/collections/services') ? '#e5e7eb' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/services') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <Wrench size={15} style={{ color: '#4b5563' }} />
            <span>Services &amp; Pricing</span>
          </Link>

          <Link
            href="/admin/collections/faqs"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/faqs') ? '#111111' : '#4b5563',
              backgroundColor: pathname.includes('/admin/collections/faqs') ? '#e5e7eb' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/faqs') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <Sparkles size={15} style={{ color: '#4b5563' }} />
            <span>FAQs &amp; Schema</span>
          </Link>

          <Link
            href="/admin/collections/media"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/media') ? '#111111' : '#4b5563',
              backgroundColor: pathname.includes('/admin/collections/media') ? '#e5e7eb' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/media') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <Layers size={15} style={{ color: '#4b5563' }} />
            <span>Media &amp; Images</span>
          </Link>
        </div>

        {/* GROUP B: STORE OPERATIONS PORTAL (Connected Directly) */}
        <div style={{ marginBottom: '18px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6b7280',
              padding: '4px 8px',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
            }}
          >
            <span>Operations Portal</span>
            <span
              style={{
                fontSize: '10px',
                padding: '1px 5px',
                borderRadius: '4px',
                backgroundColor: '#dcfce7',
                color: '#15803d',
                fontWeight: 600,
              }}
            >
              LIVE
            </span>
          </div>

          <a
            href="/portal"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              fontWeight: 500,
              marginBottom: '2px',
            }}
          >
            <LayoutDashboard size={15} style={{ color: '#6b7280' }} />
            <span>Portal Overview</span>
          </a>

          <a
            href="/portal/leads"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              fontWeight: 500,
              marginBottom: '2px',
            }}
          >
            <CalendarCheck size={15} style={{ color: '#6b7280' }} />
            <span>Leads &amp; Bookings</span>
          </a>

          <a
            href="/portal/local-seo"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              fontWeight: 500,
              marginBottom: '2px',
            }}
          >
            <MapPin size={15} style={{ color: '#6b7280' }} />
            <span>GMB &amp; Local SEO</span>
          </a>

          <a
            href="/portal/reviews"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              fontWeight: 500,
              marginBottom: '2px',
            }}
          >
            <Star size={15} style={{ color: '#6b7280' }} />
            <span>Reviews &amp; Reputation</span>
          </a>

          <a
            href="/portal/listings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              fontWeight: 500,
              marginBottom: '2px',
            }}
          >
            <Globe size={15} style={{ color: '#6b7280' }} />
            <span>Directory Listings</span>
          </a>

          <a
            href="/portal/listings/ai-visibility"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#374151',
              fontWeight: 500,
              marginBottom: '2px',
            }}
          >
            <Sparkles size={15} style={{ color: '#6b7280' }} />
            <span>Search &amp; AI Visibility</span>
          </a>
        </div>

        {/* GROUP C: SETTINGS & USERS */}
        <div style={{ marginBottom: '14px' }}>
          <div
            style={{
              fontSize: '11px',
              fontWeight: 600,
              textTransform: 'uppercase',
              letterSpacing: '0.04em',
              color: '#6b7280',
              padding: '4px 8px',
              marginBottom: '4px',
            }}
          >
            Access &amp; Settings
          </div>

          <Link
            href="/admin/collections/users"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: pathname.includes('/admin/collections/users') ? '#111111' : '#4b5563',
              backgroundColor: pathname.includes('/admin/collections/users') ? '#e5e7eb' : 'transparent',
              fontWeight: pathname.includes('/admin/collections/users') ? 600 : 500,
              marginBottom: '2px',
            }}
          >
            <User size={15} style={{ color: '#4b5563' }} />
            <span>CMS Admins</span>
          </Link>

          <a
            href="/settings"
            style={{
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              padding: '7px 10px',
              borderRadius: '6px',
              textDecoration: 'none',
              color: '#4b5563',
              fontWeight: 500,
              marginBottom: '2px',
            }}
          >
            <Settings size={15} style={{ color: '#4b5563' }} />
            <span>Store Settings</span>
          </a>
        </div>
      </div>

      {/* 3. FOOTER QUICK ACTION */}
      <div style={{ padding: '12px 14px', borderTop: '1px solid #e5e7eb', backgroundColor: '#ffffff' }}>
        <a
          href="/"
          target="_blank"
          rel="noreferrer"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            gap: '6px',
            padding: '7px 12px',
            borderRadius: '6px',
            backgroundColor: '#111111',
            color: '#ffffff',
            textDecoration: 'none',
            fontSize: '12px',
            fontWeight: 500,
          }}
        >
          <span>View Customer Site</span>
          <ExternalLink size={12} style={{ opacity: 0.8 }} />
        </a>
      </div>
    </div>
  )
}

