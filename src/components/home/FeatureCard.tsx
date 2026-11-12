import React from "react";
import Link from "next/link";

interface FeatureCardProps {
  label: string;
  href?: string;
  highlighted?: boolean;
}

export function FeatureCard({ label, href = "#", highlighted = false }: FeatureCardProps) {
  return (
    <Link
      href={href}
      className={`
        flex items-center px-[18px]
        h-[64px] bg-white
        border border-[#dde1e7]
        rounded-[8px]
        hover:border-sfd-teal/60 transition-colors duration-150
        cursor-pointer
        ${highlighted ? "text-sfd-teal" : "text-[#1d1c1a]"}
      `}
    >
      <span className="text-[18px] font-normal leading-[21.6px] font-[Avenir,Arial,sans-serif]">
        {label}
      </span>
    </Link>
  );
}
