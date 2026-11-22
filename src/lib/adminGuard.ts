// Server-side only: import it from server actions / server components.
import { getCurrentAdminAction } from "@/actions/auth";

import { canPublish } from "@/lib/roles";

export { canPublish, PUBLISHER_ROLES } from "@/lib/roles";

/** Every CMS write needs a signed-in, active admin session. Throws otherwise. */
export async function requireAdmin() {
  const admin = await getCurrentAdminAction();
  if (!admin) throw new Error("Not signed in. Please sign in to the admin again.");
  return admin;
}

/** Publishing, deleting and site-wide changes: admins only. Throws otherwise. */
export async function requirePublisher() {
  const admin = await requireAdmin();
  if (!canPublish(admin.role)) {
    throw new Error("Only an admin can do this. Your role can edit and save drafts.");
  }
  return admin;
}
