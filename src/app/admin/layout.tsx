import { AdminSidebar } from "@/components/admin/sidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-background">
      <AdminSidebar />
      <main className="relative min-h-screen overflow-x-hidden px-4 pb-12 pt-20 md:pl-[var(--admin-sidebar-width)] md:pr-8 md:pt-8">
        <div className="absolute inset-0 -z-10 bg-[radial-gradient(circle_at_top_right,rgba(215,167,93,0.15),transparent_35%)]" />
        {children}
      </main>
    </div>
  );
}
