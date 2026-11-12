"use client";

import React, { useEffect, useRef, useState } from "react";
import { Plus, Minus, MapPin, ExternalLink, Phone, Navigation } from "lucide-react";

interface StorePoint {
  id: number;
  name: string;
  badge?: string;
  address: string;
  cityStateZip: string;
  phone: string;
  rating: number;
  reviewsCount: number;
  category: string;
  hours: string;
  lat: number;
  lng: number;
  gmbUrl: string;
}

const STORES: StorePoint[] = [
  {
    id: 1,
    name: "Smart Fone Doctor (Smartphone Doctor)",
    badge: "Flagship",
    address: "33 S 52nd St",
    cityStateZip: "Philadelphia, PA 19139",
    phone: "(215) 598-2090",
    rating: 4.9,
    reviewsCount: 1524,
    category: "Cell phone store · Mobile phone repair shop",
    hours: "Open · Closes 7 PM",
    lat: 39.9575,
    lng: -75.2263,
    gmbUrl: "https://share.google/gTlyWLewR88ToAdJQ",
  },
  {
    id: 2,
    name: "Smart Fone Doctor",
    address: "4016 Lancaster Ave",
    cityStateZip: "Philadelphia, PA 19104",
    phone: "(215) 598-2090",
    rating: 4.9,
    reviewsCount: 880,
    category: "Cell phone store · Phone repair service",
    hours: "Open · Closes 7 PM",
    lat: 39.9628,
    lng: -75.2045,
    gmbUrl: "https://maps.google.com/?q=4016+Lancaster+Ave,+Philadelphia,+PA+19104",
  },
  {
    id: 3,
    name: "Smart FoneDoctor",
    address: "4060 Lancaster Ave",
    cityStateZip: "Philadelphia, PA 19104",
    phone: "(215) 598-2090",
    rating: 4.9,
    reviewsCount: 940,
    category: "Cell phone store · Electronics repair shop",
    hours: "Open · Closes 7 PM",
    lat: 39.9634,
    lng: -75.2058,
    gmbUrl: "https://maps.google.com/?q=4060+Lancaster+Ave,+Philadelphia,+PA+19104",
  },
];

export default function AboutMap() {
  const containerRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markersRef = useRef<{ [key: number]: any }>({});
  const [activeStoreId, setActiveStoreId] = useState<number>(1);
  const [mapLoaded, setMapLoaded] = useState(false);

  useEffect(() => {
    let isMounted = true;

    // 1. Ensure Leaflet CSS
    if (!document.getElementById("leaflet-css")) {
      const link = document.createElement("link");
      link.id = "leaflet-css";
      link.rel = "stylesheet";
      link.href = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.css";
      document.head.appendChild(link);
    }

    // 2. Load Leaflet script
    const loadScript = () => {
      const L = (window as any).L;
      if (L) {
        initMap(L);
        return;
      }

      const existingScript = document.getElementById("leaflet-js");
      if (existingScript) {
        existingScript.addEventListener("load", () => {
          if (isMounted) initMap((window as any).L);
        });
        return;
      }

      const script = document.createElement("script");
      script.id = "leaflet-js";
      script.src = "https://unpkg.com/leaflet@1.9.4/dist/leaflet.js";
      script.async = true;
      script.onload = () => {
        if (isMounted) initMap((window as any).L);
      };
      document.body.appendChild(script);
    };

    const initMap = (L: any) => {
      if (!L || !containerRef.current || mapInstanceRef.current) return;

      const map = L.map(containerRef.current, {
        center: [39.9605, -75.2155],
        zoom: 13,
        zoomControl: false,
        attributionControl: false,
      });

      // 100% Free OpenStreetMap raster tiles
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        maxZoom: 19,
        subdomains: ["a", "b", "c"],
      }).addTo(map);

      // Custom Google Maps-style Pin with Store Logo inside
      const createTeardropPin = (store: StorePoint) => {
        const isFlagship = store.id === 1;
        const w = isFlagship ? 48 : 42;
        const h = isFlagship ? 58 : 52;
        const radius = isFlagship ? 16 : 14;
        const cx = w / 2;
        const cy = isFlagship ? 20 : 18;

        const pinSvg = `
          <svg width="${w}" height="${h}" viewBox="0 0 ${w} ${h}" fill="none" xmlns="http://www.w3.org/2000/svg" style="filter: drop-shadow(0 4px 6px rgba(0,0,0,0.35)); cursor: pointer;">
            <defs>
              <clipPath id="pin-clip-${store.id}">
                <circle cx="${cx}" cy="${cy}" r="${radius}" />
              </clipPath>
            </defs>
            <!-- Teardrop Body -->
            <path d="M${cx} 2 C${cx - 18} 2 ${cx - 20} 14 ${cx - 20} ${cy} C${cx - 20} ${cy + 12} ${cx - 3} ${h - 4} ${cx} ${h - 1} C${cx + 3} ${h - 4} ${cx + 20} ${cy + 12} ${cx + 20} ${cy} C${cx + 20} 14 ${cx + 18} 2 ${cx} 2 Z" fill="#c8102e" stroke="#ffffff" stroke-width="2.5" />
            
            <!-- White Disc for Logo -->
            <circle cx="${cx}" cy="${cy}" r="${radius + 1}" fill="#ffffff" />
            
            <!-- Logo inside circle -->
            <image href="/logo-png.jpg" x="${cx - radius}" y="${cy - radius}" width="${radius * 2}" height="${radius * 2}" clip-path="url(#pin-clip-${store.id})" preserveAspectRatio="xMidYMid meet" />

            <!-- Verified check badge on pin -->
            <circle cx="${cx + radius - 2}" cy="${cy + radius - 2}" r="5" fill="#1a73e8" stroke="#ffffff" stroke-width="1" />
            <path d="M${cx + radius - 4} ${cy + radius - 2} L${cx + radius - 2.5} ${cy + radius - 0.5} L${cx + radius} ${cy + radius - 4}" stroke="#ffffff" stroke-width="1.2" stroke-linecap="round" stroke-linejoin="round" fill="none" />
          </svg>
        `;

        return L.divIcon({
          className: "custom-sfd-pin",
          html: pinSvg,
          iconSize: [w, h],
          iconAnchor: [w / 2, h],
          popupAnchor: [0, -h + 8],
        });
      };

      // Pixel-Perfect Google My Business (GMB) Card HTML
      const createGmbPopupHtml = (store: StorePoint) => {
        return `
          <div style="
            width: 290px;
            font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
            color: #202124;
            line-height: 1.35;
            background: #ffffff;
            border-radius: 12px;
            overflow: hidden;
          ">
            <!-- 1. Google Business Profile Header Bar -->
            <div style="display: flex; align-items: center; justify-content: space-between; padding: 8px 12px 7px 12px; background: #fafafa; border-bottom: 1px solid #ebebeb;">
              <div style="display: flex; align-items: center; gap: 5px;">
                <!-- 4-Color Google G Icon -->
                <svg width="15" height="15" viewBox="0 0 24 24">
                  <path fill="#4285F4" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                  <path fill="#34A853" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                  <path fill="#FBBC05" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"/>
                  <path fill="#EA4335" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"/>
                </svg>
                <span style="font-size: 11px; font-weight: 600; color: #5f6368; letter-spacing: 0.2px;">Google Business Profile</span>
              </div>
              <div style="display: flex; align-items: center; gap: 3px; background: #e8f0fe; color: #1a73e8; padding: 2px 7px; border-radius: 12px; font-size: 10px; font-weight: 600;">
                <svg width="11" height="11" viewBox="0 0 24 24" fill="#1a73e8">
                  <path d="M12 2C6.48 2 2 6.48 2 12s4.48 10 10 10 10-4.48 10-10S17.52 2 12 2zm-2 15l-5-5 1.41-1.41L10 14.17l7.59-7.59L19 8l-9 9z"/>
                </svg>
                Verified
              </div>
            </div>

            <!-- 2. Logo + Store Name + Category -->
            <div style="padding: 10px 12px 10px 12px;">
              <div style="display: flex; align-items: flex-start; gap: 9px;">
                <!-- Store Logo Avatar with Blue Checkmark -->
                <div style="position: relative; width: 44px; height: 44px; border-radius: 8px; border: 1px solid #e5e7eb; background: #ffffff; padding: 2px; flex-shrink: 0; box-shadow: 0 1px 3px rgba(0,0,0,0.08);">
                  <img src="/logo-png.jpg" alt="Store Logo" style="width: 100%; height: 100%; object-fit: contain;" />
                  <div style="position: absolute; bottom: -3px; right: -3px; width: 14px; height: 14px; background: #1a73e8; border-radius: 50%; border: 2px solid #ffffff; display: flex; align-items: center; justify-content: center;">
                    <svg width="8" height="8" viewBox="0 0 24 24" fill="#ffffff">
                      <path d="M9 16.2L4.8 12l-1.4 1.4L9 19 21 7l-1.4-1.4L9 16.2z"/>
                    </svg>
                  </div>
                </div>

                <div style="flex: 1; min-width: 0;">
                  <h4 style="margin: 0; font-size: 13.5px; font-weight: 700; color: #202124; line-height: 1.25;">
                    ${store.name}
                  </h4>
                  <div style="font-size: 10.5px; color: #5f6368; margin-top: 2px;">
                    ${store.category}
                  </div>
                </div>
              </div>

              <!-- 3. Star Rating & Reviews -->
              <div style="display: flex; align-items: center; gap: 5px; margin-top: 7px; font-size: 11.5px;">
                <span style="font-weight: 700; color: #202124;">${store.rating}</span>
                <div style="display: flex; color: #fbbc04; font-size: 12px; letter-spacing: -1px;">
                  ★★★★★
                </div>
                <span style="color: #1a73e8; text-decoration: underline; font-size: 11px;">
                  (${store.reviewsCount.toLocaleString()} Google reviews)
                </span>
              </div>

              <!-- 4. Status & Hours -->
              <div style="display: flex; align-items: center; gap: 4px; margin-top: 5px; font-size: 11px;">
                <span style="color: #188038; font-weight: 700;">● ${store.hours.split(" · ")[0]}</span>
                <span style="color: #5f6368;">· ${store.hours.split(" · ")[1] || "Closes 7 PM"}</span>
              </div>

              <!-- 5. Address & Phone -->
              <div style="margin-top: 8px; padding-top: 7px; border-top: 1px solid #f1f3f4; font-size: 11px; color: #3c4043;">
                <div style="display: flex; align-items: flex-start; gap: 5px; margin-bottom: 3px;">
                  <span style="color: #70757a; font-size: 12px; line-height: 1;">📍</span>
                  <span style="line-height: 1.3;">${store.address}, ${store.cityStateZip}</span>
                </div>
                <div style="display: flex; align-items: center; gap: 5px;">
                  <span style="color: #70757a; font-size: 12px; line-height: 1;">📞</span>
                  <a href="tel:+12155982090" style="color: #1a73e8; font-weight: 600; text-decoration: none;">
                    ${store.phone}
                  </a>
                </div>
              </div>

              <!-- 6. Google Action Buttons -->
              <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 6px; margin-top: 9px;">
                <a href="${store.gmbUrl}" target="_blank" rel="noopener noreferrer" style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 4px;
                  background: #1a73e8;
                  color: #ffffff;
                  font-size: 11px;
                  font-weight: 600;
                  padding: 6px 8px;
                  border-radius: 6px;
                  text-decoration: none;
                  box-shadow: 0 1px 2px rgba(26,115,232,0.3);
                ">
                  <svg width="12" height="12" viewBox="0 0 24 24" fill="#ffffff">
                    <path d="M21.71 11.29l-9-9c-.39-.39-1.02-.39-1.41 0l-9 9c-.39.39-.39 1.02 0 1.41l9 9c.39.39 1.02.39 1.41 0l9-9c.39-.38.39-1.01 0-1.41zM14 14.5V12h-4v3H8v-4c0-.55.45-1 1-1h5V7.5l3.5 3.5-3.5 3.5z"/>
                  </svg>
                  Directions
                </a>

                <a href="tel:+12155982090" style="
                  display: flex;
                  align-items: center;
                  justify-content: center;
                  gap: 4px;
                  background: #f1f3f4;
                  color: #1a73e8;
                  font-size: 11px;
                  font-weight: 600;
                  padding: 6px 8px;
                  border-radius: 6px;
                  text-decoration: none;
                  border: 1px solid #dadce0;
                ">
                  <svg width="11" height="11" viewBox="0 0 24 24" fill="#1a73e8">
                    <path d="M6.62 10.79c1.44 2.83 3.76 5.14 6.59 6.59l2.2-2.2c.27-.27.67-.36 1.02-.24 1.12.37 2.33.57 3.57.57.55 0 1 .45 1 1V20c0 .55-.45 1-1 1-9.39 0-17-7.61-17-17 0-.55.45-1 1-1h3.5c.55 0 1 .45 1 1 0 1.25.2 2.45.57 3.57.11.35.03.74-.25 1.02l-2.2 2.2z"/>
                  </svg>
                  Call Store
                </a>
              </div>

              <!-- 7. View on Google Maps Link -->
              <div style="margin-top: 7px; text-align: center;">
                <a href="${store.gmbUrl}" target="_blank" rel="noopener noreferrer" style="
                  display: inline-flex;
                  align-items: center;
                  gap: 3px;
                  font-size: 10px;
                  color: #1a73e8;
                  font-weight: 600;
                  text-decoration: none;
                ">
                  <span>View on Google Maps</span>
                  <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="#1a73e8" stroke-width="2.5">
                    <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6M15 3h6v6M10 14L21 3"/>
                  </svg>
                </a>
              </div>
            </div>
          </div>
        `;
      };

      // Add pins and popups for all 3 stores
      const bounds = L.latLngBounds([]);

      STORES.forEach((store) => {
        const marker = L.marker([store.lat, store.lng], {
          icon: createTeardropPin(store),
        }).addTo(map);

        bounds.extend([store.lat, store.lng]);

        marker.bindPopup(createGmbPopupHtml(store), {
          maxWidth: 320,
          className: "sfd-gmb-leaflet-popup",
          autoPan: true,
          autoPanPadding: [30, 40],
        });

        marker.on("click", () => {
          setActiveStoreId(store.id);
        });

        markersRef.current[store.id] = marker;
      });

      // Fit bounds to show all 3 Philadelphia stores with good padding
      map.fitBounds(bounds, { padding: [120, 60], maxZoom: 13.5 });

      // Automatically open Flagship store GMB card on load
      setTimeout(() => {
        if (markersRef.current[1] && isMounted) {
          markersRef.current[1].openPopup();
        }
      }, 500);

      mapInstanceRef.current = map;
      setMapLoaded(true);
    };

    loadScript();

    return () => {
      isMounted = false;
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
        mapInstanceRef.current = null;
      }
    };
  }, []);

  const handleZoomIn = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomIn();
  };

  const handleZoomOut = () => {
    if (mapInstanceRef.current) mapInstanceRef.current.zoomOut();
  };

  const handleSelectStore = (storeId: number) => {
    setActiveStoreId(storeId);
    const store = STORES.find((s) => s.id === storeId);
    const marker = markersRef.current[storeId];
    if (mapInstanceRef.current && store) {
      mapInstanceRef.current.flyTo([store.lat, store.lng], 15, { duration: 0.8 });
      if (marker) {
        marker.openPopup();
      }
    }
  };

  const handleResetBounds = () => {
    if (mapInstanceRef.current) {
      const L = (window as any).L;
      if (!L) return;
      const bounds = L.latLngBounds(STORES.map((s) => [s.lat, s.lng]));
      mapInstanceRef.current.fitBounds(bounds, { padding: [80, 50], maxZoom: 14 });
    }
  };

  return (
    <div className="relative w-full h-full min-h-[440px] sm:min-h-[480px] rounded-[20px] overflow-hidden border border-neutral-200/80 bg-neutral-100 isolate z-0 flex flex-col">
      {/* Global CSS overrides for Leaflet GMB popup */}
      <style jsx global>{`
        .sfd-gmb-leaflet-popup .leaflet-popup-content-wrapper {
          padding: 0 !important;
          border-radius: 12px !important;
          overflow: hidden !important;
          box-shadow: 0 10px 30px rgba(0, 0, 0, 0.22) !important;
          border: 1px solid rgba(0, 0, 0, 0.08) !important;
        }
        .sfd-gmb-leaflet-popup .leaflet-popup-content {
          margin: 0 !important;
          line-height: inherit !important;
        }
        .sfd-gmb-leaflet-popup .leaflet-popup-tip {
          background: #ffffff !important;
          box-shadow: 0 4px 12px rgba(0, 0, 0, 0.12) !important;
        }
        .sfd-gmb-leaflet-popup a.leaflet-popup-close-button {
          top: 7px !important;
          right: 7px !important;
          color: #70757a !important;
          font-size: 15px !important;
          width: 20px !important;
          height: 20px !important;
          display: flex !important;
          align-items: center !important;
          justify-content: center !important;
          border-radius: 50% !important;
          background: rgba(0, 0, 0, 0.05) !important;
          padding: 0 !important;
          z-index: 10 !important;
        }
        .sfd-gmb-leaflet-popup a.leaflet-popup-close-button:hover {
          background: rgba(0, 0, 0, 0.12) !important;
          color: #202124 !important;
        }
      `}</style>

      {/* Map Canvas */}
      <div ref={containerRef} className="w-full flex-1 min-h-[380px]" />

      {/* Floating Zoom & Reset Controls (Top-Right) */}
      <div className="absolute top-3 right-3 z-20 flex flex-col gap-1.5 shadow-md">
        <button
          type="button"
          onClick={handleZoomIn}
          title="Zoom In"
          className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-neutral-800 flex items-center justify-center font-bold text-sm shadow-xs border border-neutral-200 active:scale-95 transition"
        >
          <Plus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleZoomOut}
          title="Zoom Out"
          className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-neutral-800 flex items-center justify-center font-bold text-sm shadow-xs border border-neutral-200 active:scale-95 transition"
        >
          <Minus className="w-4 h-4" />
        </button>
        <button
          type="button"
          onClick={handleResetBounds}
          title="Show All 3 Stores"
          className="w-8 h-8 rounded-lg bg-white/95 hover:bg-white text-[#009691] flex items-center justify-center font-bold text-xs shadow-xs border border-neutral-200 active:scale-95 transition"
        >
          <MapPin className="w-4 h-4" />
        </button>
      </div>

      {/* Interactive Location Selector Bar */}
      <div className="bg-white/95 backdrop-blur-xs border-t border-neutral-200/80 px-3 py-2 flex items-center justify-between gap-2 text-[11px] text-neutral-600 z-10 shrink-0">
        <div className="flex items-center gap-1.5 overflow-x-auto no-scrollbar py-0.5">
          <span className="text-[10.5px] font-bold text-neutral-500 uppercase tracking-wide shrink-0 hidden sm:inline">
            Stores:
          </span>
          {STORES.map((store) => {
            const isActive = store.id === activeStoreId;
            return (
              <button
                key={store.id}
                type="button"
                onClick={() => handleSelectStore(store.id)}
                className={`text-[11px] font-semibold px-2.5 py-1 rounded-full transition-all whitespace-nowrap flex items-center gap-1.5 cursor-pointer ${
                  isActive
                    ? "bg-[#c8102e] text-white shadow-xs"
                    : "bg-neutral-100 hover:bg-neutral-200 text-neutral-700"
                }`}
              >
                <span
                  className={`w-1.5 h-1.5 rounded-full ${
                    isActive ? "bg-white" : "bg-emerald-500"
                  }`}
                />
                <span>{store.address}</span>
              </button>
            );
          })}
        </div>

        <a
          href="https://share.google/gTlyWLewR88ToAdJQ"
          target="_blank"
          rel="noopener noreferrer"
          className="inline-flex items-center gap-1 text-[#1a73e8] hover:underline font-semibold shrink-0 text-[11px]"
        >
          <span>Google Profile</span>
          <ExternalLink className="w-3 h-3" />
        </a>
      </div>
    </div>
  );
}