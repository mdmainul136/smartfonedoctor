// Server-side only: the stores shown on the store finder (Admin > Settings > Branches),
// as map pins. Shared by /locations/i/book-repair, the page editor and /preview.
import { getStoreBranchesAction } from "@/actions/settings";
import { STORES } from "@/lib/stores";
import type { MapStore } from "@/components/locator/InteractiveMap";

export const LOCATIONS_PATH = "/locations/i/book-repair";

export async function getLocationStores() {
  const res = await getStoreBranchesAction();
  const branches = res.success && res.data && res.data.length > 0 ? res.data : STORES;
  const mapStores: MapStore[] = branches.map((b) => ({
    id: b.id,
    name: b.name,
    hours: b.businessHours || "Open today 10:00 am - 7:00 pm",
    address: b.address,
    cityStateZip: b.cityStateZip,
    phone: b.phone,
    lat: b.id === 1 ? 39.9575 : b.id === 2 ? 39.9628 : 39.9634,
    lng: b.id === 1 ? -75.2263 : b.id === 2 ? -75.2045 : -75.2058,
    gmbPlaceId: b.id === 1 ? "ChIJ_sfd_philly_33s52nd" : `ChIJ_sfd_store_${b.id}`,
    gmbRating: 4.9,
    gmbReviewsCount: b.id === 1 ? 1524 : b.id === 2 ? 880 : 940,
    gmbUrl: b.gmbUrl,
  }));
  return { branches, mapStores };
}
