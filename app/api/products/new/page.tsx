"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

export default function NewProductPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    price: "",
    coverImage: "",
    description: "",
  });

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const title = e.target.value;
    const autoSlug = title.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[đĐ]/g, "d").replace(/[^a-z0-9\s-]/g, "").trim().replace(/\s+/g, "-").replace(/-+/g, "-");
    setFormData({ ...formData, title, slug: autoSlug });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    
    const res = await fetch("/api/products", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(formData),
    });

    if (res.ok) {
      router.push("/admin/products");
      router.refresh();
    } else {
      const data = await res.json();
      alert(data.error);
      setIsSubmitting(false);
    }
  };

  return (
    <div>
      <header className="mb-8 flex justify-between items-center">
        <div>
          <Link href="/admin/products" className="font-sans text-xs font-bold uppercase tracking-widest text-[#947e6b] hover:text-[#8b5a2b] flex items-center gap-2 mb-2">← Danh sách sách</Link>
          <h1 className="font-serif text-3xl font-bold text-[#4e290f]">Thêm Sách mới</h1>
        </div>
        <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-[#4e290f] text-[#fdfcf0] rounded-lg font-sans text-sm font-bold uppercase tracking-widest hover:bg-[#3d200b] transition-all shadow-lg">
          {isSubmitting ? "Đang lưu..." : "Lưu Sản phẩm"}
        </button>
      </header>

      <div className="paper-card p-6 rounded-2xl grid grid-cols-1 md:grid-cols-2 gap-6">
        <div className="space-y-4">
          <div>
            <label className="block font-sans text-xs font-bold uppercase text-[#947e6b] mb-2">Tên sách</label>
            <input type="text" required value={formData.title} onChange={handleTitleChange} className="w-full border border-[#e6dfd1] rounded-lg px-4 py-2 focus:border-[#8b5a2b] focus:outline-none" />
          </div>
          <div>
            <label className="block font-sans text-xs font-bold uppercase text-[#947e6b] mb-2">Đường dẫn (Slug)</label>
            <input type="text" required value={formData.slug} onChange={(e) => setFormData({ ...formData, slug: e.target.value })} className="w-full border border-[#e6dfd1] rounded-lg px-4 py-2 bg-gray-50 focus:border-[#8b5a2b] focus:outline-none" />
          </div>
          <div>
            <label className="block font-sans text-xs font-bold uppercase text-[#947e6b] mb-2">Giá tiền (VND)</label>
            <input type="number" required value={formData.price} onChange={(e) => setFormData({ ...formData, price: e.target.value })} className="w-full border border-[#e6dfd1] rounded-lg px-4 py-2 focus:border-[#8b5a2b] focus:outline-none" />
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label className="block font-sans text-xs font-bold uppercase text-[#947e6b] mb-2">Link Ảnh bìa sách</label>
            <input type="url" value={formData.coverImage} onChange={(e) => setFormData({ ...formData, coverImage: e.target.value })} className="w-full border border-[#e6dfd1] rounded-lg px-4 py-2 focus:border-[#8b5a2b] focus:outline-none" />
          </div>
          <div>
            <label className="block font-sans text-xs font-bold uppercase text-[#947e6b] mb-2">Mô tả sách</label>
            <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} rows={5} className="w-full border border-[#e6dfd1] rounded-lg px-4 py-2 focus:border-[#8b5a2b] focus:outline-none" />
          </div>
        </div>
      </div>
    </div>
  );
}