"use client";

import Link from "next/link";

type ChartDataItem = {
  label: string;
  value: number;
};

type AdminDashboardUIProps = {
  totalPosts: number;
  totalProducts: number;
  totalOrders: number;
  chartData: ChartDataItem[];
  maxChartValue: number;
};

export default function AdminDashboardUI({
  totalPosts,
  totalProducts,
  totalOrders,
  chartData,
  maxChartValue,
}: AdminDashboardUIProps) {
  
  return (
    <div className="animate-in fade-in duration-500">
      <header className="mb-10">
        <span className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-sky-600">
          Tổng quan hệ thống
        </span>
        <h1 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900">
          Bảng điều khiển
        </h1>
      </header>

      {/* HÀNG 1: THẺ THỐNG KÊ (DỮ LIỆU THẬT) */}
      <div className="mb-8 grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
        
        <div className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Tổng bài viết</p>
            <h3 className="mt-2 font-sans text-3xl font-extrabold text-slate-900">{totalPosts}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-100 text-sky-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 20H5a2 2 0 01-2-2V6a2 2 0 012-2h10a2 2 0 012 2v1m2 13a2 2 0 01-2-2V7m2 13a2 2 0 002-2V9a2 2 0 00-2-2h-2m-4-3H9M7 16h6M7 8h6v4H7V8z"></path></svg>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Sách trong tủ</p>
            <h3 className="mt-2 font-sans text-3xl font-extrabold text-slate-900">{totalProducts}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-teal-100 text-teal-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"></path></svg>
          </div>
        </div>

        <div className="flex items-center justify-between rounded-3xl border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <div>
            <p className="font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Đơn đặt hàng</p>
            <h3 className="mt-2 font-sans text-3xl font-extrabold text-slate-900">{totalOrders}</h3>
          </div>
          <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-indigo-100 text-indigo-600">
            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"></path></svg>
          </div>
        </div>
      </div>

      {/* HÀNG 2: BIỂU ĐỒ & THAO TÁC */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        
        {/* Biểu đồ số bài viết tạo trong tuần (DỮ LIỆU THẬT) */}
        <div className="rounded-[2rem] border border-white/60 bg-white/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl lg:col-span-2">
          <div className="mb-8 flex items-end justify-between">
            <h3 className="font-sans text-xl font-bold text-slate-900">Bài viết mới 7 ngày qua</h3>
          </div>
          
          <div className="relative flex h-48 items-end justify-between gap-2 border-b border-dashed border-white/60 pb-2 sm:gap-6">
            <div className="pointer-events-none absolute inset-0 flex flex-col justify-between">
              <div className="w-full border-t border-dashed border-white/60"></div>
              <div className="w-full border-t border-dashed border-white/60"></div>
              <div className="w-full border-t border-dashed border-white/60"></div>
            </div>

            {chartData.map((data, i) => {
              // Tính % chiều cao dựa trên maxChartValue
              const heightPercent = maxChartValue > 0 ? (data.value / maxChartValue) * 100 : 0;
              
              return (
                <div key={i} className="group z-10 flex w-full flex-col items-center gap-2">
                  <div 
                    className="relative w-full rounded-t-lg bg-sky-500/20 transition-all duration-500 group-hover:bg-sky-500"
                    style={{ height: `${heightPercent}%`, minHeight: data.value > 0 ? '4px' : '0' }}
                  >
                    <span className="absolute -top-8 left-1/2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-slate-900 px-2 py-1 font-sans text-[10px] font-bold text-white opacity-0 shadow-sm transition-opacity group-hover:opacity-100">
                      {data.value} bài
                    </span>
                  </div>
                  <span className="font-sans text-xs font-medium text-slate-500">{data.label}</span>
                </div>
              );
            })}
          </div>
        </div>

        {/* Lối tắt nhanh */}
        <div className="flex flex-col rounded-[2rem] border border-white/60 bg-white/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <h3 className="mb-6 font-sans text-xl font-bold text-slate-900">Thao tác nhanh</h3>
          
          <div className="flex flex-grow flex-col gap-4">
            <Link 
              href="/admin/posts/new"
              className="flex w-full items-center justify-center gap-2 rounded-2xl bg-slate-900 py-4 font-sans text-xs font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sky-600"
            >
              + Viết bài mới
            </Link>
            
            <Link 
              href="/admin/products/new"
              className="flex w-full items-center justify-center gap-2 rounded-2xl border border-white/60 bg-white/50 py-4 font-sans text-xs font-bold uppercase tracking-widest text-slate-700 shadow-sm transition-all hover:bg-white/80 hover:text-sky-600"
            >
              + Thêm sách mới
            </Link>
          </div>

          <div className="mt-8 border-t border-dashed border-white/60 pt-6">
            <p className="text-center font-sans text-xs italic text-slate-500">
              "Số liệu thống kê được cập nhật theo thời gian thực."
            </p>
          </div>
        </div>

      </div>
    </div>
  );
}