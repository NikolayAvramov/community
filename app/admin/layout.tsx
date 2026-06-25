import { redirect } from "next/navigation";
import { canAccessAdmin, getSession } from "@/lib/auth";
import { AdminSidebar } from "@/components/admin/sidebar";
import { SupportBanner } from "@/components/admin/support-banner";

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  const session = await getSession();
  if (!session) redirect("/login?redirect=/admin");
  if (!canAccessAdmin(session.role)) redirect("/");

  const isSupport = session.role === "SUPPORT";

  return (
    <div className="admin-shell flex min-h-screen">
      <AdminSidebar />
      <main className="flex-1 overflow-auto">
        {isSupport && <SupportBanner />}
        <div className="mx-auto max-w-7xl px-6 py-8 lg:px-8">{children}</div>
      </main>
    </div>
  );
}
