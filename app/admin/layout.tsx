"use client";

import AdminSidebar from "@/components/admin/AdminSidebar";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="relative flex min-h-screen w-full overflow-hidden bg-slate-50 font-sans">
      
      {/* Background Blobs tạo hiệu ứng hắt sáng */}
      <div className="pointer-events-none absolute -left-[10%] -top-[10%] h-96 w-96 rounded-full bg-sky-200/50 mix-blend-multiply blur-3xl filter" />
      <div className="pointer-events-none absolute -bottom-[10%] -right-[10%] h-96 w-96 rounded-full bg-blue-200/50 mix-blend-multiply blur-3xl filter" />
      <div className="pointer-events-none absolute left-[20%] top-[40%] h-72 w-72 rounded-full bg-teal-100/50 mix-blend-multiply blur-3xl filter" />

      {/* Gọi Component Sidebar riêng biệt (Đã bao gồm logic Mobile) */}
      <AdminSidebar />

      {/* Main Content Area */}
      <main className="relative z-10 my-4 mr-4 flex flex-1 flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/50 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl md:my-6 md:mr-6">
        <div className="h-full overflow-y-auto p-8">
          {children}
        </div>
      </main>

    </div>
  );
}