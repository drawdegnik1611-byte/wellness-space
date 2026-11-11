"use client";

import Link from "next/link";

type AdminPaginationProps = {
  currentPage: number;
  totalPages: number;
  searchQuery?: string;
};

export default function AdminPagination({
  currentPage,
  totalPages,
  searchQuery = "",
}: AdminPaginationProps) {
  if (totalPages <= 1) return null;

  const createPageUrl = (pageNumber: number) => {
    const params = new URLSearchParams();
    if (searchQuery) params.set("q", searchQuery);
    params.set("page", pageNumber.toString());
    return `/admin/posts?${params.toString()}`;
  };

  const btnClass = "inline-flex h-[40px] items-center justify-center rounded-xl border border-white/60 bg-white/40 px-4 font-sans text-sm font-semibold text-slate-700 backdrop-blur-md transition-all hover:bg-white/80 hover:text-sky-600 shadow-sm";
  const disabledClass = "inline-flex h-[40px] items-center justify-center rounded-xl border border-white/20 bg-white/20 px-4 font-sans text-sm font-semibold text-slate-400 backdrop-blur-md cursor-not-allowed";

  return (
    <div className="mt-6 flex items-center justify-between">
      <span className="font-sans text-sm text-slate-500">
        Trang <strong className="text-slate-900">{currentPage}</strong> / {totalPages}
      </span>
      
      <div className="flex gap-2">
        {currentPage > 1 ? (
          <Link href={createPageUrl(currentPage - 1)} className={btnClass}>
            Trang trước
          </Link>
        ) : (
          <span className={disabledClass}>Trang trước</span>
        )}

        {currentPage < totalPages ? (
          <Link href={createPageUrl(currentPage + 1)} className={btnClass}>
            Trang sau
          </Link>
        ) : (
          <span className={disabledClass}>Trang sau</span>
        )}
      </div>
    </div>
  );
}