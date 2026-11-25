import { permanentRedirect } from "next/navigation";

export default function TrackIndexPage() {
  permanentRedirect("/repair-status");
}
