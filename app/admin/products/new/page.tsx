"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import QuillEditor from "@/components/admin/QuillEditor";

// Hàm tạo mã SKU ngẫu nhiên
const generateSKU = () => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let sku = "";
  for (let i = 0; i < 6; i++) {
    sku += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return sku;
};

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugEdited, setIsSlugEdited] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    sku: "",
    category: "Tủ sách",
    price: "",
    discount: "0",
    inStock: "10",
    coverImage: "",
    description: "",
  });

  // Tự động tạo SKU khi trang vừa load
  useEffect(() => {
    setFormData(prev => ({ ...prev, sku: generateSKU() }));
  }, []);

  const generateSlug = (text: string) => {
    return text.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: isSlugEdited ? prev.slug : generateSlug(newTitle),
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    try {
      const payload = {
        ...formData,
        price: parseInt(formData.price) || 0,
        discount: parseInt(formData.discount) || 0,
        inStock: parseInt(formData.inStock) || 0,
      };

      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      if (!res.ok) {
        alert("Có lỗi xảy ra khi lưu sản phẩm.");
        setIsSubmitting(false);
        return;
      }
      router.push("/admin/products");
      router.refresh();
    } catch (error) {
      alert("Lỗi kết nối.");
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/admin/products" className="mb-2 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-sky-600">
            <span>←</span> Quay lại danh sách
          </Link>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900">Thêm Sách mới</h1>
        </div>
        <button onClick={handleSubmit} disabled={isSubmitting} className="flex h-11 items-center rounded-xl bg-slate-900 px-8 font-sans text-sm font-bold text-white shadow-lg transition-all hover:bg-sky-600 disabled:opacity-70">
          {isSubmitting ? "Đang lưu..." : "Lưu Sản phẩm"}
        </button>
      </header>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-8 lg:grid-cols-2">
        
        <div className="space-y-6 rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl md:p-8">
          
          {/* Hàng ngang chứa Mã Hàng & Chuyên mục */}
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
            <div>
              <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Mã hàng (SKU)</label>
              <div className="flex gap-2">
                <input type="text" required value={formData.sku} onChange={(e) => setFormData(prev => ({ ...prev, sku: e.target.value.toUpperCase() }))} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-mono text-sm font-bold text-slate-900 outline-none backdrop-blur-md transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
                <button type="button" onClick={() => setFormData(prev => ({ ...prev, sku: generateSKU() }))} className="rounded-xl bg-sky-50 px-4 text-sky-600 transition-colors hover:bg-sky-100" title="Tạo mã mới">
                  <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" /></svg>
                </button>
              </div>
            </div>
            <div>
              <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Chuyên mục</label>
              <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-sans text-sm font-bold text-slate-700 outline-none backdrop-blur-md transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100">
                <option value="Tủ sách">Tủ sách (Mặc định)</option>
                <option value="Y lý">Y lý</option>
                <option value="Tản văn">Tản văn</option>
              </select>
            </div>
          </div>

          <div>
            <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Tên sách</label>
            <input type="text" required value={formData.title} onChange={handleTitleChange} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-sans text-xl font-bold text-slate-900 outline-none backdrop-blur-md transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
          </div>

          <div>
            <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Đường dẫn (Slug)</label>
            <input type="text" required value={formData.slug} onChange={(e) => { setIsSlugEdited(true); setFormData(prev => ({ ...prev, slug: e.target.value })); }} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-mono text-sm text-slate-600 outline-none backdrop-blur-md transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
          </div>

          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="sm:col-span-2">
              <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Giá bán (VNĐ)</label>
              <input type="number" required min="0" value={formData.price} onChange={(e) => setFormData(prev => ({ ...prev, price: e.target.value }))} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-sans text-sm font-bold text-slate-900 outline-none backdrop-blur-md transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
            </div>
            <div>
              <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Chiết khấu (%)</label>
              <input type="number" min="0" max="100" value={formData.discount} onChange={(e) => setFormData(prev => ({ ...prev, discount: e.target.value }))} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-sans text-sm font-bold text-rose-600 outline-none backdrop-blur-md transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
            </div>
          </div>

          <div>
            <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Số lượng trong kho</label>
            <input type="number" required min="0" value={formData.inStock} onChange={(e) => setFormData(prev => ({ ...prev, inStock: e.target.value }))} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-sans text-sm font-bold text-slate-900 outline-none backdrop-blur-md transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
          </div>
        </div>

        <div className="space-y-6 rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl md:p-8">
          <div>
            <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Ảnh bìa sách</label>
            <CldUploadWidget uploadPreset="dhn_databook" onSuccess={(result: any) => setFormData(prev => ({ ...prev, coverImage: result.info.secure_url }))}>
              {({ open }) => (
                <button type="button" onClick={() => open()} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white/40 px-4 py-8 font-sans text-sm font-bold text-slate-500 transition-all hover:border-sky-400 hover:bg-white/60 hover:text-sky-600">
                  <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  {formData.coverImage ? "Tải ảnh khác" : "Click để chọn ảnh"}
                </button>
              )}
            </CldUploadWidget>
            {formData.coverImage && (
              <div className="mt-3 aspect-[3/4] w-32 overflow-hidden rounded-2xl border border-white/60 shadow-sm">
                <img src={formData.coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
              </div>
            )}
          </div>

          <div>
            <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Mô tả giới thiệu sách</label>
            <QuillEditor value={formData.description} onChange={(content) => setFormData(prev => ({ ...prev, description: content }))} />
          </div>
        </div>
      </form>
    </div>
  );
}