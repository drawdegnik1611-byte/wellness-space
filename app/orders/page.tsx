"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function OrdersHistoryPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    // Kéo dữ liệu đơn hàng từ API vừa tạo
    const fetchOrders = async () => {
      try {
        const res = await fetch("/api/user/orders");
        const data = await res.json();
        
        if (res.status === 401) {
          router.push("/login?redirect=/orders");
          return;
        }

        if (data.success) {
          setOrders(data.orders);
        }
      } catch (err) {
        console.error("Lỗi tải đơn hàng");
      } finally {
        setIsLoading(false);
      }
    };

    fetchOrders();
  }, [router]);

  // Hàm dịch trạng thái sang Tiếng Việt & Màu sắc
  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING":
        return <span className="rounded-full bg-amber-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-amber-700">Chờ xác nhận</span>;
      case "SHIPPING":
        return <span className="rounded-full bg-sky-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-sky-700">Đang giao hàng</span>;
      case "COMPLETED":
        return <span className="rounded-full bg-emerald-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-emerald-700">Thành công</span>;
      case "CANCELLED":
        return <span className="rounded-full bg-rose-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-rose-700">Đã hủy</span>;
      default:
        return <span className="rounded-full bg-slate-100 px-3 py-1 text-[11px] font-bold uppercase tracking-wider text-slate-700">{status}</span>;
    }
  };

  if (isLoading) return <div className="pt-32 text-center font-sans text-slate-500">Đang tải lịch sử mua hàng...</div>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 pb-24 pt-32 font-sans">
      <div className="mx-auto max-w-4xl">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900">Lịch sử đơn hàng</h1>

        {orders.length === 0 ? (
          <div className="rounded-[2.5rem] border border-white/60 bg-white/40 p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
            <h2 className="mb-2 text-xl font-bold text-slate-800">Bạn chưa có đơn hàng nào</h2>
            <p className="mb-6 text-sm text-slate-500">Hãy dạo quanh tủ sách và chọn cho mình những tác phẩm ưng ý nhé.</p>
            <Link href="/tu-sach" className="inline-block rounded-full bg-slate-900 px-8 py-3.5 text-sm font-bold text-white transition-colors hover:bg-sky-600">
              Khám phá Tủ sách
            </Link>
          </div>
        ) : (
          <div className="flex flex-col gap-6">
            {orders.map((order) => (
              <div key={order.id} className="overflow-hidden rounded-[2rem] border border-white/60 bg-white/60 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all hover:shadow-lg">
                
                {/* Order Header */}
                <div className="flex flex-col items-start justify-between gap-4 border-b border-slate-200/60 bg-white/40 p-6 sm:flex-row sm:items-center">
                  <div>
                    <p className="text-xs font-bold uppercase tracking-widest text-slate-500">Mã đơn hàng</p>
                    <p className="font-mono text-lg font-bold text-sky-600">#{order.id.slice(0, 8).toUpperCase()}</p>
                    <p className="mt-1 text-xs font-medium text-slate-500">
                      Đặt ngày: {new Date(order.createdAt).toLocaleDateString("vi-VN", { hour: '2-digit', minute: '2-digit' })}
                    </p>
                  </div>
                  <div className="flex flex-col items-end gap-2">
                    {getStatusBadge(order.status)}
                    <span className="text-xs font-semibold text-slate-500">Thanh toán: {order.paymentMethod}</span>
                  </div>
                </div>

                {/* Order Body (Items) */}
                <div className="p-6">
                  <div className="flex flex-col gap-4">
                    {order.orderItems.map((item: any) => (
                      <div key={item.id} className="flex items-center gap-4">
                        <div className="h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-200 shadow-sm">
                          {item.product.coverImage ? (
                            <img src={item.product.coverImage} alt={item.product.title} className="h-full w-full object-cover" />
                          ) : (
                            <div className="h-full w-full bg-slate-300"></div>
                          )}
                        </div>
                        <div className="flex-1">
                          <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.product.title}</p>
                          <p className="mt-1 text-xs font-semibold text-slate-500">x{item.quantity}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm font-bold text-rose-500">{(item.price * item.quantity).toLocaleString("vi-VN")}đ</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Order Footer (Total) */}
                <div className="flex items-center justify-between border-t border-slate-200/60 bg-slate-50/50 p-6">
                  <p className="text-sm font-bold text-slate-500">Tổng thanh toán</p>
                  <p className="text-xl font-extrabold text-rose-600">{order.totalAmount.toLocaleString("vi-VN")}đ</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </main>
  );
}