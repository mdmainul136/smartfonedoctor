import { redirect } from "next/navigation";
import { getCurrentAdminAction } from "@/actions/auth";
import AdminProfileClient from "@/components/admin/AdminProfileClient";

export const metadata = {
  title: "Admin Profile & Security | SmartFoneDoctor Command Center",
  description: "Manage admin credentials, profile information, and security settings.",
};

export default async function AdminProfilePage() {
  const admin = await getCurrentAdminAction();

  if (!admin) {
    redirect("/sign-in?from=/profile");
  }

  return <AdminProfileClient initialUser={admin} />;
}
