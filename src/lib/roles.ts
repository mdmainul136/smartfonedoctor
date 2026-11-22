/**
 * Roles (AdminUser.role). Admins (super_admin, admin) can publish, schedule,
 * unpublish and delete pages and change templates, global blocks, menus and
 * SEO settings. Everyone else signed in (manager, technician) is an editor:
 * they edit and save drafts, and an admin reviews and publishes.
 * Safe to import on the client (UI hints); the server enforces it in adminGuard.
 */
export const PUBLISHER_ROLES = ["super_admin", "admin"] as const;

export function canPublish(role: string | null | undefined): boolean {
  return (PUBLISHER_ROLES as readonly string[]).includes(role ?? "");
}
