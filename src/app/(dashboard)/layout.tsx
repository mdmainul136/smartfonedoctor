import Menu from "@/components/Dashboard/Menu";
import Navbar from "@/components/Dashboard/Navbar";
import Link from "next/link";
import { StoreProvider } from "@/lib/storeContext";

export default function DashboardLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <StoreProvider>
      <div className="min-h-screen w-full flex bg-[#f9fafb] text-[#111111] antialiased">
        {/* Left Sidebar — 220px on lg+, 52px icon rail on mobile/tablet */}
        <aside className="sticky top-0 h-screen w-[52px] lg:w-[220px] shrink-0 bg-[#f9fafb] border-r border-[#e8e8e8] flex flex-col justify-between overflow-y-auto no-scrollbar select-none pb-16">
          <div className="p-2 lg:px-3 lg:py-4">
            {/* Brand Mark & Workspace Scope */}
            <Link
              href="/admin"
              className="flex items-center justify-center lg:justify-start gap-2.5 px-1.5 py-1 rounded-[6px] hover:bg-[#eeeeee]/60 transition-colors"
            >
              <span
                aria-hidden="true"
                className="w-6 h-6 rounded-[5px] bg-[#111111] text-white flex items-center justify-center text-[11px] font-semibold tracking-tight shrink-0"
              >
                SF
              </span>
              <div className="hidden lg:flex flex-col min-w-0">
                <span className="text-[13px] font-semibold text-[#111111] leading-tight truncate">
                  Smart Fone Doctor
                </span>
                <span className="text-[11px] text-[#6b6b6b] leading-tight truncate">
                  Philadelphia · 3 stores
                </span>
              </div>
            </Link>

            <Menu />
          </div>
        </aside>

        {/* Right Canvas Area */}
        <div className="flex-1 min-w-0 min-h-screen bg-[#f9fafb] flex flex-col">
          <Navbar />
          <main className="flex-1 min-w-0 w-full flex flex-col pb-12">
            {children}
          </main>
        </div>
      </div>
    </StoreProvider>
  );
}
