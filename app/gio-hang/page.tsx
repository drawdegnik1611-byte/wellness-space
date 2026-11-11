"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

export default function CartPage() {
  const [isMounted, setIsMounted] = useState(false);
  const { items, removeItem, updateQuantity, getTotalPrice } = useCartStore();

  // Chống lỗi Hydration của Next.js khi dùng localStorage
  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted) return <div className="min-h-screen bg-slate-50"></div>;

  const totalPrice = getTotalPrice();

  return (
    <main className="relative min-h-screen bg-slate-50 px-4 pb-24 pt-32 font-sans">
      {/* Background Blobs */}
      <div className="pointer-events-none absolute -left-20 top-20 h-96 w-96 rounded-full bg-sky-200/50 mix-blend-multiply blur-3xl filter" />
      
      <div className="mx-auto max-w-5xl">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900">
          Giỏ hàng của bạn
        </h1>

        {items.length === 0 ? (
          <div className="rounded-[2.5rem] border border-white/60 bg-white/40 p-16 text-center shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
            <div className="mx-auto mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-slate-100">
              <svg className="h-10 w-10 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
              </svg>
            </div>
            <h2 className="mb-2 text-xl font-bold text-slate-700">Giỏ hàng đang trống</h2>
            <p className="mb-8 text-slate-500">Hãy tìm cho mình những cuốn sách thật hay nhé!</p>
            <Link href="/tu-sach" className="rounded-full bg-slate-900 px-8 py-3.5 text-sm font-bold text-white shadow-lg transition-all hover:bg-sky-600 hover:shadow-sky-600/30">
              Khám phá Tủ sách
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-8 lg:flex-row">
            
            {/* CỘT TRÁI: DANH SÁCH SẢN PHẨM */}
            <div className="flex-1 space-y-4">
              {items.map((item) => {
                const finalPrice = item.price * (1 - item.discount / 100);
                const isMaxStock = item.quantity >= item.inStock;

                return (
                  <div key={item.id} className="flex flex-col gap-4 rounded-3xl border border-white/60 bg-white/60 p-4 shadow-sm backdrop-blur-md sm:flex-row sm:items-center">
                    
                    {/* Ảnh sản phẩm */}
                    <div className="h-24 w-20 shrink-0 overflow-hidden rounded-xl bg-slate-200">
                      {item.coverImage ? (
                        <img src={item.coverImage} alt={item.title} className="h-full w-full object-cover" />
                      ) : (
                        <div className="flex h-full w-full items-center justify-center bg-slate-100 text-xs text-slate-400">No Image</div>
                      )}
                    </div>

                    {/* Thông tin & Giá */}
                    <div className="flex-1">
                      <h3 className="font-bold text-slate-900 line-clamp-1">{item.title}</h3>
                      <div className="mt-1 flex items-baseline gap-2">
                        <span className="font-semibold text-rose-500">{finalPrice.toLocaleString("vi-VN")}đ</span>
                        {item.discount > 0 && (
                          <span className="text-xs font-medium text-slate-400 line-through">
                            {item.price.toLocaleString("vi-VN")}đ
                          </span>
                        )}
                      </div>
                      {isMaxStock && (
                        <p className="mt-1 text-[10px] font-bold uppercase tracking-wider text-amber-500">
                          Chỉ còn {item.inStock} cuốn
                        </p>
                      )}
                    </div>

                    {/* Nút tăng giảm số lượng & Xóa */}
                    <div className="flex items-center gap-6">
                      <div className="flex items-center rounded-xl border border-slate-200 bg-white">
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity - 1)} 
                          className="flex h-9 w-9 items-center justify-center text-slate-500 transition-colors hover:text-slate-900"
                        >
                          -
                        </button>
                        <span className="w-8 text-center text-sm font-bold text-slate-900">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(item.id, item.quantity + 1)} 
                          disabled={isMaxStock}
                          className={`flex h-9 w-9 items-center justify-center transition-colors ${
                            isMaxStock ? "cursor-not-allowed text-slate-300" : "text-slate-500 hover:text-slate-900"
                          }`}
                        >
                          +
                        </button>
                      </div>
                      
                      <button onClick={() => removeItem(item.id)} className="text-sm font-bold text-slate-400 transition-colors hover:text-red-500 hover:underline">
                        Xóa
                      </button>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* CỘT PHẢI: ORDER SUMMARY */}
            <div className="w-full lg:w-[380px]">
              <div className="sticky top-24 rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
                <h2 className="mb-6 text-xl font-bold text-slate-900">Tóm tắt đơn hàng</h2>
                
                <div className="space-y-4 border-b border-slate-200/60 pb-6 text-sm">
                  <div className="flex justify-between text-slate-600">
                    <span>Tạm tính</span>
                    <span className="font-semibold text-slate-900">{totalPrice.toLocaleString("vi-VN")}đ</span>
                  </div>
                  <div className="flex justify-between text-slate-600">
                    <span>Phí giao hàng</span>
                    <span className="font-semibold text-emerald-600">Miễn phí</span>
                  </div>
                </div>

                <div className="mt-6 flex justify-between">
                  <span className="font-bold text-slate-900">Tổng cộng</span>
                  <span className="text-xl font-extrabold text-rose-500">{totalPrice.toLocaleString("vi-VN")}đ</span>
                </div>

                <Link 
                  href="/checkout"
                  className="mt-8 flex h-14 w-full items-center justify-center rounded-2xl bg-slate-900 px-6 font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-sky-600 hover:shadow-sky-600/30"
                >
                  Tiến hành thanh toán
                </Link>
                
                <div className="mt-4 text-center">
                  <Link href="/tu-sach" className="text-sm font-medium text-slate-500 hover:text-sky-600 hover:underline">
                    ← Tiếp tục mua sắm
                  </Link>
                </div>
              </div>
            </div>

          </div>
        )}
      </div>
    </main>
  );
}