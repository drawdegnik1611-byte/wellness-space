"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminProduct = {
  id: string;
  title: string;
  price: number;
  discount: number | null; 
  inStock: number;
  coverImage: string | null;
};

export default function ProductTable({ products }: { products: AdminProduct[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string, title: string) => {
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn sách "${title}"?`)) return;
    setIsDeleting(id);
    try {
      const res = await fetch(`/api/products/${id}`, { method: "DELETE" });
      if (res.ok) router.refresh();
      else alert("Có lỗi xảy ra khi xóa.");
    } catch (error) {
      alert("Lỗi kết nối.");
    } finally {
      setIsDeleting(null);
    }
  };

  return (
    <div className="overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/40 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left font-sans text-sm">
          
          <thead className="border-b border-white/40 bg-white/30 text-xs uppercase tracking-widest text-slate-500">
            <tr>
              <th className="px-8 py-6 font-extrabold">Sách</th>
              <th className="px-8 py-6 font-extrabold">Giá bán</th>
              <th className="px-8 py-6 font-extrabold">Kho hàng</th>
              <th className="px-8 py-6 text-right font-extrabold">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/40">
            {products.map((product) => {
              const discount = product.discount || 0;
              const finalPrice = product.price * (1 - discount / 100);
              const isLowStock = product.inStock > 0 && product.inStock <= 5;
              const isOutOfStock = product.inStock === 0;

              return (
                <tr key={product.id} className="transition-colors duration-200 hover:bg-white/60">
                  
                  {/* Cột Tên & Ảnh */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-4">
                      <div className="h-12 w-9 shrink-0 overflow-hidden rounded bg-slate-200 shadow-sm">
                        {product.coverImage && <img src={product.coverImage} className="h-full w-full object-cover" alt={product.title} />}
                      </div>
                      <span className="font-bold text-slate-900">{product.title}</span>
                    </div>
                  </td>
                  
                  {/* Cột Giá & Chiết khấu */}
                  <td className="px-8 py-5">
                    <div className="flex flex-col">
                      <span className="font-bold text-slate-900">{finalPrice.toLocaleString("vi-VN")}đ</span>
                      {discount > 0 && (
                        <div className="flex items-center gap-2 text-xs">
                          <span className="line-through text-slate-400">{product.price.toLocaleString("vi-VN")}đ</span>
                          <span className="font-bold text-rose-500">-{discount}%</span>
                        </div>
                      )}
                    </div>
                  </td>
                  
                  {/* Cột Tồn kho & Cảnh báo Low Stock */}
                  <td className="px-8 py-5">
                    <div className="flex items-center gap-3">
                      <span className="font-bold text-slate-700">{product.inStock}</span>
                      {isOutOfStock ? (
                        <span className="rounded-md bg-red-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-red-600">Hết hàng</span>
                      ) : isLowStock ? (
                        <span className="rounded-md bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-amber-600 animate-pulse">Sắp hết</span>
                      ) : (
                        <span className="rounded-md bg-green-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider text-green-600">Còn hàng</span>
                      )}
                    </div>
                  </td>
                  
                  {/* Cột Thao tác */}
                  <td className="px-8 py-5 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Link 
                        href={`/admin/products/edit/${product.id}`} 
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-sky-50 px-3 text-xs font-bold text-sky-600 transition-colors hover:bg-sky-100 hover:text-sky-700"
                      >
                        SỬA
                      </Link>
                      <button 
                        onClick={() => handleDelete(product.id, product.title)}
                        disabled={isDeleting === product.id}
                        className="inline-flex h-8 items-center justify-center rounded-lg bg-red-50 px-3 text-xs font-bold text-red-500 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                      >
                        {isDeleting === product.id ? "..." : "XÓA"}
                      </button>
                    </div>
                  </td>
                  
                </tr>
              )
            })}
          </tbody>
          
        </table>
      </div>
    </div>
  );
}