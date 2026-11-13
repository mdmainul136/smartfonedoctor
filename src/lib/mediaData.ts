export interface MediaItem {
  id: string;
  filename: string;
  url: string;
  alt: string;
  caption?: string;
  filesize?: number;
  mimeType: string;
  width?: number;
  height?: number;
  createdAt: string;
}

export const INITIAL_MEDIA_LIBRARY: MediaItem[] = [
  {
    id: "media-1",
    filename: "iphone-battery-replacement-bench.jpg",
    url: "https://images.unsplash.com/photo-1598327105666-5b89351aff97?auto=format&fit=crop&w=1200&q=80",
    alt: "iPhone technician battery replacement bench in Philadelphia",
    caption: "OEM Grade Battery Calibration & Testing Bench",
    filesize: 284000,
    mimeType: "image/jpeg",
    width: 1200,
    height: 800,
    createdAt: "2026-11-10T10:00:00Z",
  },
  {
    id: "media-2",
    filename: "samsung-oled-screen-microscope.jpg",
    url: "https://images.unsplash.com/photo-1588872657578-7efd1f1555ed?auto=format&fit=crop&w=1200&q=80",
    alt: "Samsung Galaxy OLED screen repair under microscope",
    caption: "Precision Micro-soldering and FPC Connector Inspection",
    filesize: 345000,
    mimeType: "image/jpeg",
    width: 1200,
    height: 800,
    createdAt: "2026-11-11T12:30:00Z",
  },
  {
    id: "media-3",
    filename: "macbook-logic-board-liquid-cleaning.jpg",
    url: "https://images.unsplash.com/photo-1517336714731-489689fd1ca8?auto=format&fit=crop&w=1200&q=80",
    alt: "MacBook Pro ultrasonic liquid damage logic board cleanup",
    caption: "Ultrasonic Chemical Bath & Diagnostic Testing",
    filesize: 412000,
    mimeType: "image/jpeg",
    width: 1200,
    height: 800,
    createdAt: "2026-11-12T09:15:00Z",
  },
  {
    id: "media-4",
    filename: "ps5-hdmi-port-replacement.jpg",
    url: "https://images.unsplash.com/photo-1606813907291-d86efa9b94db?auto=format&fit=crop&w=1200&q=80",
    alt: "PlayStation 5 HDMI port micro-soldering and thermal paste re-application",
    caption: "PS5 Liquid Metal & Solid High-Speed HDMI 2.1 Port Installation",
    filesize: 310000,
    mimeType: "image/jpeg",
    width: 1200,
    height: 800,
    createdAt: "2026-11-12T14:45:00Z",
  },
  {
    id: "media-5",
    filename: "smartfone-doctor-logo.jpg",
    url: "/logo-png.jpg",
    alt: "SmartFone Doctor official Philadelphia brand logo",
    caption: "SmartFone Doctor Brand Identity",
    filesize: 54096,
    mimeType: "image/jpeg",
    width: 600,
    height: 200,
    createdAt: "2026-10-26T18:25:00Z",
  },
  {
    id: "media-6",
    filename: "ipad-pro-digitizer-screen.jpg",
    url: "https://images.unsplash.com/photo-1544244015-0df4b3ffc6b0?auto=format&fit=crop&w=1200&q=80",
    alt: "iPad Pro glass and digitizer separation",
    caption: "Laminated Display Restoration and Adhesive Seal",
    filesize: 295000,
    mimeType: "image/jpeg",
    width: 1200,
    height: 800,
    createdAt: "2026-11-12T16:00:00Z",
  },
];

const STORAGE_KEY = "sfd_media_library_v1";

export function getClientMediaLibrary(): MediaItem[] {
  if (typeof window === "undefined") return INITIAL_MEDIA_LIBRARY;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) {
      const parsed = JSON.parse(raw);
      if (Array.isArray(parsed) && parsed.length > 0) {
        return parsed;
      }
    }
  } catch (e) {
    console.error("Failed to load media library from localStorage", e);
  }
  return INITIAL_MEDIA_LIBRARY;
}

export function saveClientMediaLibrary(items: MediaItem[]): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
    window.dispatchEvent(new CustomEvent("sfd-media-library-updated", { detail: items }));
  } catch (e) {
    console.error("Failed to save media library", e);
  }
}

export function formatBytes(bytes?: number): string {
  if (!bytes || bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
