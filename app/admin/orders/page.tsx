"use client";

import React, { useEffect, useState } from "react";
import Link from "next/link";

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedOrderId, setExpandedOrderId] = useState<string | null>(null);

  const fetchOrders = async () => {
    try {
      const res = await fetch("/api/admin/orders");
      if (!res.ok) return;
      const data = await res.json();
      if (data.success) setOrders(data.orders);
    } catch (err) {
      console.error(err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchOrders();
  }, []);

  const handleStatusChange = async (orderId: string, newStatus: string) => {
    try {
      const res = await fetch("/api/admin/orders", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, status: newStatus })
      });
      const data = await res.json();
      if (data.success) {
        setOrders(orders.map(o => o.id === orderId ? { ...o, status: newStatus } : o));
      }
    } catch (err) {
      alert("Lỗi khi cập nhật trạng thái!");
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "PENDING": return <span className="inline-flex items-center whitespace-nowrap rounded-md bg-amber-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-amber-700">Chờ xử lý</span>;
      case "PAID": return <span className="inline-flex items-center whitespace-nowrap rounded-md bg-sky-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-sky-700">Đã thanh toán</span>;
      case "SHIPPED": return <span className="inline-flex items-center whitespace-nowrap rounded-md bg-emerald-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-emerald-700">Đã giao</span>;
      case "CANCELLED": return <span className="inline-flex items-center whitespace-nowrap rounded-md bg-red-100 px-2.5 py-1 text-[10px] font-bold uppercase tracking-wider text-red-700">Đã hủy</span>;
      default: return null;
    }
  };

  if (isLoading) return <div className="p-8 text-center font-sans text-slate-500">Đang tải dữ liệu đơn hàng...</div>;

  return (
    <div className="w-full font-sans">
      <div className="mb-6 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-900">Quản lý Đơn hàng</h1>
          <p className="mt-1 text-sm font-medium text-slate-500">Tổng cộng {orders.length} đơn hàng trên hệ thống.</p>
        </div>
        <Link href="/admin" className="rounded-xl bg-slate-100 px-4 py-2 text-sm font-bold text-slate-600 transition-colors hover:bg-slate-200">
          Về Dashboard
        </Link>
      </div>

      <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
        <div className="overflow-x-auto">
          <table className="w-full table-auto text-left text-sm text-slate-600">
            <thead className="border-b border-slate-200 bg-slate-50 text-[10px] uppercase tracking-wider text-slate-500">
              <tr>
                {/* Dùng w-[1%] để ép cột tự co lại vừa đúng nội dung chữ */}
                <th className="w-[1%] whitespace-nowrap px-4 py-3 font-bold">Mã Đơn</th>
                {/* Không set w-[1%] để cột Khách hàng chiếm toàn bộ không gian trống */}
                <th className="px-4 py-3 font-bold">Khách Hàng</th>
                <th className="w-[1%] whitespace-nowrap px-4 py-3 font-bold text-center">Ngày Đặt</th>
                <th className="w-[1%] whitespace-nowrap px-4 py-3 font-bold text-right">Tổng Tiền</th>
                <th className="w-[1%] whitespace-nowrap px-4 py-3 font-bold text-center">Hình Thức</th>
                <th className="w-[1%] whitespace-nowrap px-4 py-3 font-bold text-center">Trạng Thái</th>
                <th className="w-[1%] whitespace-nowrap px-4 py-3 pr-6 text-right font-bold">Thao Tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {orders.map((order) => {
                const shortId = order.id.slice(0, 8).toUpperCase();
                const isExpanded = expandedOrderId === order.id;
                
                // Định dạng ngày gọn lại (VD: 10/11/26 thay vì 10/11/2026)
                const formattedDate = new Date(order.createdAt).toLocaleDateString("vi-VN", {
                  day: "2-digit", month: "2-digit", year: "2-digit"
                });

                return (
                  <React.Fragment key={order.id}>
                    <tr className={`transition-colors hover:bg-slate-50/70 ${isExpanded ? "bg-slate-50/70" : ""}`}>
                      <td className="w-[1%] whitespace-nowrap px-4 py-3 font-bold text-slate-900">#{shortId}</td>
                      <td className="px-4 py-3">
                        <p className="line-clamp-1 font-bold text-slate-900">{order.customerName}</p>
                        <p className="text-[11px] font-medium text-slate-500">{order.customerPhone}</p>
                      </td>
                      <td className="w-[1%] whitespace-nowrap px-4 py-3 text-center text-xs font-medium text-slate-500">
                        {formattedDate}
                      </td>
                      <td className="w-[1%] whitespace-nowrap px-4 py-3 text-right font-extrabold text-rose-500">
                        {order.totalAmount.toLocaleString("vi-VN")}đ
                      </td>
                      <td className="w-[1%] whitespace-nowrap px-4 py-3 text-center text-xs font-bold text-slate-700">
                        {order.paymentMethod === "QR" ? "VietQR" : "COD"}
                      </td>
                      <td className="w-[1%] whitespace-nowrap px-4 py-3 text-center">
                        {getStatusBadge(order.status)}
                      </td>
                      <td className="w-[1%] whitespace-nowrap px-4 py-3 pr-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <select 
                            value={order.status} 
                            onChange={(e) => handleStatusChange(order.id, e.target.value)}
                            className="w-[110px] cursor-pointer rounded-md border border-slate-200 bg-white px-2 py-1.5 text-[11px] font-bold text-slate-700 outline-none transition-all hover:border-sky-400 focus:ring-2 focus:ring-sky-100"
                          >
                            <option value="PENDING">Chờ xử lý</option>
                            <option value="PAID">Đã thanh toán</option>
                            <option value="SHIPPED">Đã giao hàng</option>
                            <option value="CANCELLED">Hủy đơn</option>
                          </select>
                          
                          <button 
                            onClick={() => setExpandedOrderId(isExpanded ? null : order.id)}
                            className="flex h-7 w-7 shrink-0 items-center justify-center rounded-md bg-slate-100 text-slate-500 hover:bg-slate-200 hover:text-slate-900"
                            title="Xem chi tiết"
                          >
                            <svg className={`h-4 w-4 transition-transform ${isExpanded ? "rotate-180" : ""}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" /></svg>
                          </button>
                        </div>
                      </td>
                    </tr>

                    {/* KHUNG XEM CHI TIẾT */}
                    {isExpanded && (
                      <tr>
                        <td colSpan={7} className="border-b-2 border-slate-100 bg-slate-50 px-4 py-4 pb-6 shadow-inner">
                          <div className="mx-auto flex max-w-5xl flex-col gap-6 md:flex-row">
                            {/* Cột T.tin Khách */}
                            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Thông tin giao hàng</h3>
                              <div className="space-y-2 text-sm">
                                <p className="flex justify-between"><span className="text-slate-500">Email:</span> <strong className="text-slate-900">{order.customerEmail}</strong></p>
                                <p className="flex justify-between"><span className="text-slate-500">SĐT:</span> <strong className="text-slate-900">{order.customerPhone}</strong></p>
                                <div className="mt-2 rounded-lg bg-slate-50 p-3 text-xs leading-relaxed text-slate-700">
                                  <span className="mb-1 block font-semibold text-slate-500">Địa chỉ:</span>
                                  {order.address}
                                </div>
                                {order.note && (
                                  <div className="mt-2 rounded-lg bg-amber-50 p-3 text-xs text-amber-800">
                                    <span className="mb-1 block font-semibold text-amber-600">Ghi chú từ khách:</span>
                                    {order.note}
                                  </div>
                                )}
                              </div>
                            </div>

                            {/* Cột T.tin Sản phẩm */}
                            <div className="flex-1 rounded-xl border border-slate-200 bg-white p-4 shadow-sm">
                              <h3 className="mb-3 text-[11px] font-bold uppercase tracking-wider text-slate-400">Sản phẩm đặt mua</h3>
                              <div className="space-y-3">
                                {order.orderItems.map((item: any) => (
                                  <div key={item.id} className="flex items-center gap-3 border-b border-slate-100 pb-3 last:border-0 last:pb-0">
                                    <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-slate-100">
                                      {item.product.coverImage && <img src={item.product.coverImage} className="h-full w-full object-cover" />}
                                    </div>
                                    <div className="flex-1">
                                      <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.product.title}</p>
                                      <p className="text-[11px] font-medium text-slate-500">SKU: {item.product.sku}</p>
                                    </div>
                                    <div className="text-right">
                                      <p className="text-xs font-bold text-slate-500">x{item.quantity}</p>
                                      <p className="text-sm font-bold text-rose-500">{(item.price).toLocaleString("vi-VN")}đ</p>
                                    </div>
                                  </div>
                                ))}
                              </div>
                              <div className="mt-3 flex justify-between border-t border-dashed border-slate-200 pt-3 text-sm">
                                <span className="font-bold text-slate-500">Voucher giảm:</span>
                                <span className="font-bold text-emerald-600">-{order.discount.toLocaleString("vi-VN")}đ</span>
                              </div>
                            </div>
                          </div>
                        </td>
                      </tr>
                    )}
                  </React.Fragment>
                );
              })}
            </tbody>
          </table>
          
          {orders.length === 0 && (
            <div className="p-12 text-center text-sm font-medium text-slate-500">Chưa có đơn hàng nào trên hệ thống.</div>
          )}
        </div>
      </div>
    </div>
  );
}