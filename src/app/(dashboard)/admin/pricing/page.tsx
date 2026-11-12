"use client";

import { useState } from "react";

interface PriceRow {
  id: number;
  service: string;
  iphone: string;
  samsung: string;
  google: string;
  other: string;
}

const INITIAL_PRICES: PriceRow[] = [
  { id: 1, service: "Screen Replacement", iphone: "$129–$299", samsung: "$99–$249", google: "$89–$179", other: "$59–$99" },
  { id: 2, service: "Battery Replacement", iphone: "$79", samsung: "$69", google: "$65", other: "$49" },
  { id: 3, service: "Back Glass Replacement", iphone: "$99–$149", samsung: "$89–$129", google: "$75–$99", other: "$49–$79" },
  { id: 4, service: "Charging Port Repair", iphone: "$89", samsung: "$79", google: "$69", other: "$59" },
  { id: 5, service: "Speaker / Mic Repair", iphone: "$69", samsung: "$59", google: "$55", other: "$45" },
  { id: 6, service: "Water Damage (Diagnosis)", iphone: "FREE", samsung: "FREE", google: "FREE", other: "FREE" },
  { id: 7, service: "Water Damage Repair", iphone: "$99–$199", samsung: "$89–$179", google: "$79–$149", other: "$59–$119" },
  { id: 8, service: "Camera Lens Replacement", iphone: "$59–$89", samsung: "$49–$79", google: "$49–$69", other: "$39–$59" },
  { id: 9, service: "Network / Carrier Unlock", iphone: "$29–$49", samsung: "$19–$39", google: "$19–$29", other: "$19–$29" },
];

export default function PricingPage() {
  const [prices] = useState<PriceRow[]>(INITIAL_PRICES);

  return (
    <div className="flex-1 p-4 flex flex-col gap-4">
      {/* HEADER */}
      <div className="bg-lamaSky py-4 px-6 rounded-md flex items-center justify-between">
        <div>
          <h1 className="text-xl font-bold text-gray-800">Price List</h1>
          <p className="text-xs text-gray-600 mt-0.5">
            Customer-facing and internal repair pricing breakdown by service and device brand.
          </p>
        </div>
        <span className="text-xs bg-white text-gray-600 px-3 py-1 rounded-full shadow-2xs font-medium">
          Effective Nov 2024
        </span>
      </div>

      <div className="bg-white rounded-md shadow-2xs overflow-hidden">
        <div className="p-3 border-b border-gray-100 flex items-center justify-between">
          <p className="text-xs text-gray-500">
            ℹ️ Estimated pricing guideline. Exact quote provided upon free in-store diagnostic.
          </p>
        </div>
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-lamaSkyLight text-gray-600">
              <th className="text-left p-3 font-semibold">Service</th>
              <th className="text-left p-3 font-semibold">🍎 iPhone</th>
              <th className="text-left p-3 font-semibold hidden md:table-cell">📱 Samsung Galaxy</th>
              <th className="text-left p-3 font-semibold hidden lg:table-cell">🔵 Google Pixel</th>
              <th className="text-left p-3 font-semibold hidden lg:table-cell">📲 Other Brands</th>
            </tr>
          </thead>
          <tbody>
            {prices.map((row, i) => (
              <tr
                key={row.id}
                className={`border-t border-gray-50 hover:bg-gray-50/60 ${
                  i % 2 === 0 ? "" : "bg-gray-50/30"
                }`}
              >
                <td className="p-3 font-medium text-gray-800">{row.service}</td>
                <td className="p-3 font-semibold text-gray-700">{row.iphone}</td>
                <td className="p-3 text-gray-700 hidden md:table-cell">{row.samsung}</td>
                <td className="p-3 text-gray-700 hidden lg:table-cell">{row.google}</td>
                <td className="p-3 text-gray-700 hidden lg:table-cell">{row.other}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

