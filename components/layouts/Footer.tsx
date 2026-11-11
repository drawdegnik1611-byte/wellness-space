"use client";

import { usePathname } from "next/navigation";
import Link from "next/link";

export default function Footer() {
  const pathname = usePathname();

  // Nếu đang ở khu vực admin thì ẩn hoàn toàn Footer
  if (pathname?.startsWith("/admin")) return null;

  return (
    <footer className="bg-slate-900 py-8 text-slate-300 md:py-12">
      <div className="mx-auto flex max-w-7xl flex-col items-center px-4 sm:px-6 lg:px-8">
        
        {/* LOGO MÔ PHỎNG (Giống trên Navbar) */}
        <Link href="/" className="mb-8 flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-slate-900">
            <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
            </svg>
          </div>
          <span className="font-sans text-2xl font-bold tracking-tight text-white">
            Wellness
          </span>
        </Link>

        {/* TRÍCH DẪN (LOREM IPSUM) */}
        <p className="mb-12 max-w-md text-center font-sans text-base font-medium leading-relaxed text-slate-400">
          "Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore."
        </p>

        {/* MENU ĐIỀU HƯỚNG */}
        <nav className="mb-12 flex flex-wrap justify-center gap-6 font-sans text-sm font-semibold uppercase tracking-widest text-slate-400 md:gap-10">
          <Link href="/" className="transition-colors hover:text-white">Trang chủ</Link>
          <Link href="/tan-van" className="transition-colors hover:text-white">Tản văn</Link>
          <Link href="/y-ly" className="transition-colors hover:text-white">Y lý</Link>
          <Link href="/tu-sach" className="transition-colors hover:text-white">Tủ sách</Link>
        </nav>

        {/* COPYRIGHT */}
        <div className="flex w-full flex-col items-center border-t border-slate-800 pt-8 text-center">
          <p className="font-sans text-xs font-medium uppercase tracking-[0.2em] text-slate-500">
            &copy; {new Date().getFullYear()} Wellness. All rights reserved.
          </p>
        </div>
        
      </div>
    </footer>
  );
}