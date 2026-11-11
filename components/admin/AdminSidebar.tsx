"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";

export default function AdminSidebar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isOpen, setIsOpen] = useState(false); 

  const navItems = [
    { name: "Tổng quan", href: "/admin", icon: "M4 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2V6zM14 6a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2V6zM4 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2H6a2 2 0 01-2-2v-2zM14 16a2 2 0 012-2h2a2 2 0 012 2v2a2 2 0 01-2 2h-2a2 2 0 01-2-2v-2z" },
    { name: "Quản lý Bài viết", href: "/admin/posts", icon: "M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" },
    { name: "Quản lý Tủ sách", href: "/admin/products", icon: "M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" },
    { name: "Đơn đặt hàng", href: "/admin/orders", icon: "M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" },
  ];

  const activeIndex = navItems.findIndex((item) =>
    item.href === "/admin"
      ? pathname === "/admin"
      : pathname?.startsWith(item.href)
  );

  const handleLogout = async () => {
    // Gọi API xóa Cookie dưới backend
    await fetch("/api/auth/logout", { method: "POST" }); 
    // Ép trình duyệt tải lại hoàn toàn từ đầu để quét sạch phiên bản cũ
    window.location.href = "/";
  };

  return (
    <>
      {/* NÚT MỞ MENU TRÊN MOBILE */}
      <button 
        onClick={() => setIsOpen(true)}
        className="fixed bottom-6 right-6 z-50 rounded-full bg-slate-900 p-4 text-white shadow-2xl transition-transform active:scale-95 md:hidden"
      >
        <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
        </svg>
      </button>

      {/* LỚP PHỦ LÀM MỜ KHI MỞ MENU MOBILE */}
      {isOpen && (
        <div 
          className="fixed inset-0 z-40 bg-slate-900/60 backdrop-blur-sm md:hidden"
          onClick={() => setIsOpen(false)}
        />
      )}

      {/* SIDEBAR KÍNH MỜ (Responsive & Sticky) */}
      <aside className={`
        fixed inset-y-0 left-0 z-50 flex w-72 flex-col rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-transform duration-300 ease-in-out
        md:sticky md:top-6 md:z-10 md:m-6 md:h-[calc(100vh-3rem)] md:shrink-0
        ${isOpen ? "m-4 translate-x-0" : "-translate-x-[120%] md:translate-x-0"}
      `}>
        
        {/* Header Sidebar */}
        <div className="mb-10 mt-4 flex items-center justify-between px-4 md:block">
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">
            Wellness <span className="text-sky-600">Admin</span>
          </h1>
          <button onClick={() => setIsOpen(false)} className="text-slate-500 hover:text-slate-900 md:hidden">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
          </button>
        </div>

        {/* Khối Navigation có Morph Animation */}
        <nav className="relative flex flex-1 flex-col gap-2">
          {activeIndex !== -1 && (
            <div
              className="absolute left-0 h-[48px] w-full rounded-2xl bg-white shadow-[0_2px_15px_rgba(0,0,0,0.06)] transition-transform duration-500 ease-out"
              style={{ transform: `translateY(${activeIndex * 56}px)` }} 
            />
          )}

          {navItems.map((item, index) => {
            const isActive = index === activeIndex;
            return (
              <Link
                key={item.name}
                href={item.href}
                onClick={() => setIsOpen(false)} 
                className={`relative z-10 flex h-[48px] items-center gap-3 px-4 text-sm transition-colors duration-300 ${
                  isActive
                    ? "font-extrabold text-sky-700" 
                    : "font-semibold text-slate-500 hover:text-slate-800"
                }`}
              >
                <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={isActive ? "2.5" : "2"} d={item.icon} />
                </svg>
                {item.name}
              </Link>
            );
          })}
        </nav>

        {/* Cụm Nút Xem Trang Chủ & Đăng xuất */}
        <div className="mt-auto flex flex-col gap-2 pt-6">
          <Link 
            href="/"
            className="flex h-[48px] w-full items-center gap-3 rounded-2xl px-4 text-sm font-semibold text-slate-500 transition-all hover:bg-white/60 hover:text-sky-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 19l-7-7m0 0l7-7m-7 7h18" /></svg>
            Xem trang chủ
          </Link>

          <button 
            onClick={handleLogout}
            className="flex h-[48px] w-full items-center gap-3 rounded-2xl px-4 text-sm font-semibold text-slate-500 transition-all hover:bg-red-50 hover:text-red-600"
          >
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
            </svg>
            Đăng xuất
          </button>
        </div>

      </aside>
    </>
  );
}