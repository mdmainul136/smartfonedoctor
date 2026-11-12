"use client";

import React from 'react';
import { usePathname } from 'next/navigation';
import { Mail } from 'lucide-react';

export default function TopBar() {
  const pathname = usePathname();
  const isDashboard =
    pathname?.startsWith('/portal') ||
    pathname?.startsWith('/review') ||
    pathname?.startsWith('/profile') ||
    pathname?.startsWith('/settings') ||
    pathname?.startsWith('/sign-in') ||
    pathname?.startsWith('/list');

  if (isDashboard) {
    return null;
  }

  return (
    <div className="w-full bg-sfd-teal text-white text-[12px] sm:text-[13px]  h-[36px] sm:h-[38px] shadow-sm select-none border-b border-black/10">
      <div className="max-w-[1350px] mx-auto h-full px-3  sm:px-6 flex items-center justify-between">
        
        {/* Left Side: Tagline (Hides on tablet/mobile to prevent crunching) */}
        <div className="hidden md:block text-[12px] text-neutral-100 font-medium tracking-wide whitespace-nowrap">
          <span>Philadelphia&apos;s Trusted Device Repair Experts</span>
        </div>

        {/* Right Side: Social Media Icons + Text Number */}
        <div className="w-full md:w-auto flex items-center justify-between md:justify-end gap-2 sm:gap-4">
          
          {/* Social Icons Container */}
          <div className="flex items-center space-x-1 shrink-0">
            {/* Facebook */}
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noreferrer"
              className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px]  flex items-center justify-center text-white hover:opacity-80 transition"
              title="Facebook"
            > 
              <svg className=" w-[14px] h-[14px] sm:w-[16px] sm:h-[16px]  fill-current" viewBox="0 0 24 24">
                <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
              </svg>
            </a>

            {/* X / Twitter */}
            <a
              href="https://twitter.com"
              target="_blank"
              rel="noreferrer"
              className=" w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] flex items-center justify-center text-white hover:opacity-80 transition"
              title="Twitter"
            >
              <svg className=" w-[13px] h-[13px] sm:w-[14px] sm:h-[14px] fill-current" viewBox="0 0 24 24">
                <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
              </svg>
            </a>

            {/* Instagram */}
            <a
              href="https://instagram.com"
              target="_blank"
              rel="noreferrer"
              className="w-[20px] h-[20px] sm:w-[22px] sm:h-[22px] flex items-center justify-center text-white hover:opacity-80 transition"
              title="Instagram"
            >
              <svg className=" w-[14px] h-[14px] sm:w-[16px] sm:h-[16px] fill-current" viewBox="0 0 24 24">
                <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
              </svg>
            </a>

            {/* Email */}
            <a
              href="mailto:support@smartfonedoctor.com"
              className="w-[22px] h-[22px] flex items-center justify-center text-white hover:opacity-80 transition"
              title="Email"
            >
              <Mail className="w-[16px] h-[16px]" />
            </a>

            {/* Google */}
            <a
              href="https://share.google/gTlyWLewR88ToAdJQ"
              target="_blank"
              rel="noreferrer"
              className="w-[22px] h-[22px] flex items-center justify-center text-white hover:opacity-80 transition"
              title="Google Review"
            >
              <svg className="w-[16px] h-[16px] fill-current" viewBox="0 0 24 24">
                <path d="M12.24 10.285V14.4h6.806c-.275 1.765-2.056 5.174-6.806 5.174-4.095 0-7.439-3.389-7.439-7.574s3.344-7.574 7.439-7.574c2.33 0 3.891.989 4.785 1.849l3.254-3.138C18.189 1.186 15.479 0 12.24 0c-6.635 0-12 5.365-12 12s5.365 12 12 12c6.926 0 11.52-4.869 11.52-11.726 0-.788-.085-1.39-.189-1.989H12.24z" />
              </svg>
            </a>
          </div>

          {/* Text / Phone Number */}
          <div className="text-white text-[13px] tracking-wide flex items-center gap-1 shrink-0 whitespace-nowrap pl-2">
            <span className="text-neutral-200">Text:</span>
            <a href="tel:+12155982090" className="font-bold hover:underline">
              (215) 598-2090
            </a>
          </div>

        </div>

      </div>
    </div>
  );
}
