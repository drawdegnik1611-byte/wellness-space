"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState, useEffect } from "react";
import { useCartStore } from "@/store/useCartStore";

export default function Navbar() {
  const pathname = usePathname();
  const router = useRouter();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  
  // 1. STATE GIỎ HÀNG
  const [isMounted, setIsMounted] = useState(false);
  const totalItems = useCartStore((state) => state.getTotalItems());

  // 2. STATE AUTH & AVATAR
  const [userRole, setUserRole] = useState<string | null>(null);
  const [userAvatar, setUserAvatar] = useState<string | null>(null); // State lưu ảnh đại diện

  useEffect(() => {
    setIsMounted(true);
    
    const checkAuth = async () => {
      try {
        const res = await fetch("/api/auth/check");
        const data = await res.json();
        if (data.success && data.user) {
          setUserRole(data.user.role);
          setUserAvatar(data.user.avatar || null); // Lấy avatar từ DB
        } else {
          setUserRole(null);
          setUserAvatar(null);
        }
      } catch (err) {}
    };

    checkAuth();
  }, [pathname]);

  const handleLogout = async () => {
    await fetch("/api/auth/logout", { method: "POST" });
    window.location.href = "/"; 
  };

  // Ẩn Navbar ở trang Admin
  if (pathname?.startsWith("/admin")) return null;

  return (
    <header className="fixed left-1/2 top-6 z-50 w-[92%] max-w-5xl -translate-x-1/2 transition-all duration-300">
      
      <div className="flex items-center justify-between rounded-full border border-white/40 bg-white/60 px-6 py-3.5 shadow-[0_8px_30px_rgb(0,0,0,0.06)] backdrop-blur-md">
        
        {/* LOGO */}
        <Link href="/" className="flex items-center gap-2">
          <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="font-sans text-lg font-bold tracking-tight text-slate-900">
            Wellness
          </span>
        </Link>

        {/* MAIN MENU (Desktop) */}
        <nav className="hidden items-center gap-8 md:flex">
          <Link href="/" className="font-sans text-sm font-medium text-slate-700 transition-colors hover:text-sky-600">Trang chủ</Link>
          <Link href="/tan-van" className="font-sans text-sm font-medium text-slate-700 transition-colors hover:text-sky-600">Tản văn</Link>
          <Link href="/y-ly" className="font-sans text-sm font-medium text-slate-700 transition-colors hover:text-sky-600">Y lý</Link>
          <Link href="/tu-sach" className="font-sans text-sm font-medium text-slate-700 transition-colors hover:text-sky-600">Tủ sách</Link>
        </nav>

        {/* RIGHT ACTIONS: CART & USER */}
        <div className="hidden items-center gap-4 md:flex">
          
          {/* GIỎ HÀNG */}
          <Link href="/gio-hang" className="relative p-2 text-slate-700 transition-colors hover:text-sky-600">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            {isMounted && totalItems > 0 && (
              <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 font-sans text-[9px] font-bold text-white shadow-sm">
                {totalItems}
              </span>
            )}
          </Link>

          <div className="h-5 w-px bg-slate-300"></div>

          {/* USER MENU */}
          {userRole ? (
            <div className="group relative">
              <button className="flex items-center gap-2 p-2 text-slate-700 transition-colors hover:text-sky-600">
                {/* HIỂN THỊ AVATAR HOẶC ICON MẶC ĐỊNH */}
                <div className="flex h-7 w-7 overflow-hidden items-center justify-center rounded-full bg-sky-100 text-sky-600">
                  {userAvatar ? (
                    <img src={userAvatar} alt="Avatar" className="h-full w-full object-cover" />
                  ) : (
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" /></svg>
                  )}
                </div>
              </button>
              
              {/* KHU VỰC ĐÃ FIX: Dùng pt-3 (cây cầu tàng hình) thay cho mt-2 */}
              <div className="absolute right-0 top-full hidden pt-3 group-hover:block">
                <div className="flex w-52 flex-col overflow-hidden rounded-2xl border border-white/60 bg-white/95 shadow-xl backdrop-blur-xl">
                  
                  {/* 1. Thông tin cá nhân */}
                  <Link href="/profile" className="flex items-center gap-3 px-4 py-3 font-sans text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-sky-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"></path><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>
                    Hồ sơ của tôi
                  </Link>
                  
                  {/* 2. Lịch sử mua hàng */}
                  <Link href="/orders" className="flex items-center gap-3 px-4 py-3 font-sans text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-sky-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"></path></svg>
                    Lịch sử đơn hàng
                  </Link>

                  {/* 3. Bài viết đã lưu */}
                  <Link href="/saved-posts" className="flex items-center gap-3 px-4 py-3 font-sans text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-50 hover:text-sky-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z"></path></svg>
                    Bài viết đã lưu
                  </Link>

                  <div className="my-1 border-t border-slate-100"></div>

                  {/* Nút Admin (chỉ hiện khi là ADMIN) */}
                  {userRole === "ADMIN" && (
                    <Link href="/admin" className="flex items-center gap-3 px-4 py-3 font-sans text-sm font-bold text-sky-600 transition-colors hover:bg-sky-50">
                      <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 10V3L4 14h7v7l9-11h-7z"></path></svg>
                      Trang Quản trị
                    </Link>
                  )}

                  <button onClick={handleLogout} className="flex items-center gap-3 px-4 py-3 text-left font-sans text-sm font-semibold text-red-500 transition-colors hover:bg-red-50 hover:text-red-600">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                    Đăng xuất
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <Link 
              href="/login" 
              className="rounded-full bg-slate-900 px-6 py-2.5 font-sans text-xs font-semibold uppercase tracking-wider text-white transition-colors hover:bg-sky-600"
            >
              Đăng nhập
            </Link>
          )}
        </div>

        {/* MOBILE MENU BUTTON */}
        <div className="flex items-center gap-3 md:hidden">
          <Link href="/gio-hang" className="relative p-2 text-slate-900">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" /></svg>
            {isMounted && totalItems > 0 && <span className="absolute right-0 top-0 flex h-4 w-4 items-center justify-center rounded-full bg-rose-500 font-sans text-[9px] font-bold text-white">{totalItems}</span>}
          </Link>

          <button className="p-2 text-slate-900" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" /></svg>
          </button>
        </div>
      </div>

      {/* MOBILE MENU DROPDOWN */}
      {isMobileMenuOpen && (
        <div className="mt-4 flex flex-col gap-4 rounded-2xl border border-white/50 bg-white/90 p-6 shadow-lg backdrop-blur-xl md:hidden">
          <nav className="flex flex-col gap-4 border-b border-slate-200 pb-4 text-center">
            <Link href="/" className="font-sans text-sm font-semibold text-slate-700" onClick={() => setIsMobileMenuOpen(false)}>Trang chủ</Link>
            <Link href="/tan-van" className="font-sans text-sm font-semibold text-slate-700" onClick={() => setIsMobileMenuOpen(false)}>Tản văn</Link>
            <Link href="/y-ly" className="font-sans text-sm font-semibold text-slate-700" onClick={() => setIsMobileMenuOpen(false)}>Y lý</Link>
            <Link href="/tu-sach" className="font-sans text-sm font-semibold text-slate-700" onClick={() => setIsMobileMenuOpen(false)}>Tủ sách</Link>
          </nav>
          
          <div className="flex flex-col gap-3 text-center">
            {userRole ? (
              <>
                <Link href="/profile" className="font-sans text-sm font-semibold text-slate-700" onClick={() => setIsMobileMenuOpen(false)}>Hồ sơ của tôi</Link>
                <Link href="/orders" className="font-sans text-sm font-semibold text-slate-700" onClick={() => setIsMobileMenuOpen(false)}>Lịch sử đơn hàng</Link>
                <Link href="/saved-posts" className="font-sans text-sm font-semibold text-slate-700" onClick={() => setIsMobileMenuOpen(false)}>Bài viết đã lưu</Link>
                
                <div className="my-2 border-t border-slate-200"></div>

                {userRole === "ADMIN" && <Link href="/admin" className="font-sans text-sm font-bold text-sky-600" onClick={() => setIsMobileMenuOpen(false)}>Trang quản trị</Link>}
                <button onClick={() => { handleLogout(); setIsMobileMenuOpen(false); }} className="font-sans text-sm font-bold text-red-500">Đăng xuất</button>
              </>
            ) : (
              <Link href="/login" className="rounded-full bg-slate-900 py-3 font-sans text-sm font-semibold text-white" onClick={() => setIsMobileMenuOpen(false)}>Đăng nhập</Link>
            )}
          </div>
        </div>
      )}
    </header>
  );
}