"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import QuillEditor from "@/components/admin/QuillEditor";

export default function NewPostPage() {
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSlugEdited, setIsSlugEdited] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Tản văn",
    coverImage: "",
    showCover: true, // Tùy chọn mới: Mặc định hiển thị Thumbnail trong bài
    excerpt: "",
    content: "",
  });

  const generateSlug = (text: string) => {
    return text
      .toLowerCase()
      .normalize("NFD")
      .replace(/[\u0300-\u036f]/g, "")
      .replace(/[đĐ]/g, "d")
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-");
  };

  const handleTitleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newTitle = e.target.value;
    setFormData((prev) => ({
      ...prev,
      title: newTitle,
      slug: isSlugEdited ? prev.slug : generateSlug(newTitle),
    }));
  };

  const handleSlugChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsSlugEdited(true);
    setFormData({ ...formData, slug: e.target.value });
  };

  const handleImportWord = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;

        // Import động thư viện mammoth để không gây lỗi Server-Side Rendering
        const mammoth = await import("mammoth");

        // Chuyển đổi file Word sang HTML
        const result = await mammoth.convertToHtml({ arrayBuffer });

        // Đổ HTML vừa bóc tách được vào Quill Editor
        setFormData(prev => ({ ...prev, content: result.value }));

        // Reset lại ô chọn file để có thể up lại đúng file đó nếu muốn
        e.target.value = '';
      };
      reader.readAsArrayBuffer(file);
    } catch (error) {
      alert("Đã xảy ra lỗi khi đọc file Word.");
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const res = await fetch("/api/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        alert(data.error || "Có lỗi xảy ra khi lưu bài viết.");
        setIsSubmitting(false);
        return;
      }

      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      alert("Không thể kết nối đến máy chủ.");
      setIsSubmitting(false);
    }
  };

  // Hàm xử lý riêng biệt để không ảnh hưởng Form
  const handleUploadSuccess = (result: any) => {
    if (result.event === "success") {
      setFormData(prev => ({ ...prev, coverImage: result.info.secure_url }));
    }
  };

  return (
    <div>
      <header className="mb-8 flex items-center justify-between">
        <div>
          <Link href="/admin/posts" className="font-sans text-xs font-bold uppercase tracking-widest text-[#947e6b] hover:text-[#8b5a2b] flex items-center gap-2 mb-2">
            <span>←</span> Quay lại danh sách
          </Link>
          <h1 className="font-serif text-3xl font-bold text-[#4e290f]">Viết bài mới</h1>
        </div>
        <button onClick={handleSubmit} disabled={isSubmitting} className="px-8 py-3 bg-[#4e290f] text-[#fdfcf0] rounded-lg font-sans text-sm font-bold uppercase tracking-widest hover:bg-[#3d200b] transition-all shadow-lg disabled:opacity-70">
          {isSubmitting ? "Đang lưu..." : "Đăng bài viết"}
        </button>
      </header>

      {/* Đã xóa thẻ <form> bao bọc bên ngoài và chuyển handleSubmit sang nút bấm trực tiếp để ngắt sự kiện reload ngầm */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-6">
          <div className="paper-card p-6 rounded-2xl space-y-6">
            <div>
              <label className="block font-sans text-xs font-bold uppercase tracking-widest text-[#947e6b] mb-2">Tiêu đề bài viết</label>
              <input type="text" required value={formData.title} onChange={handleTitleChange} placeholder="Ví dụ: Già sao cho sướng..." className="w-full bg-white border border-[#e6dfd1] rounded-lg px-4 py-3 font-serif text-xl text-[#4e290f] focus:outline-none focus:border-[#8b5a2b]" />
            </div>

            <div>
             
              <div className="flex items-center justify-between mb-2">
                <label className="block font-sans text-xs font-bold uppercase tracking-widest text-[#947e6b]">
                  Nội dung bài viết
                </label>

                <label className="cursor-pointer flex items-center gap-1 font-sans text-xs font-bold uppercase tracking-widest text-[#8b5a2b] hover:text-[#4e290f] bg-[#f6f2e9] px-3 py-1.5 rounded border border-[#e6dfd1] transition-colors shadow-sm">
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  Import file .DOCX
                  {/* Input ẩn đi, chỉ hiện label đẹp mắt bên ngoài */}
                  <input
                    type="file"
                    accept=".docx"
                    className="hidden"
                    onChange={handleImportWord}
                  />
                </label>
              </div>
              <QuillEditor
                value={formData.content}
                onChange={(content) => setFormData(prev => ({ ...prev, content }))}
              />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="paper-card p-6 rounded-2xl space-y-6">
            <div>
              <label className="block font-sans text-xs font-bold uppercase tracking-widest text-[#947e6b] mb-2">Đường dẫn (Slug)</label>
              <input type="text" required value={formData.slug} onChange={handleSlugChange} className="w-full bg-gray-50 border border-[#e6dfd1] rounded-lg px-4 py-2 font-mono text-sm text-gray-500 focus:outline-none focus:border-[#8b5a2b]" />
            </div>

            <div>
              <label className="block font-sans text-xs font-bold uppercase tracking-widest text-[#947e6b] mb-2">Chuyên mục</label>
              <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className="w-full bg-white border border-[#e6dfd1] rounded-lg px-4 py-3 font-sans text-sm text-[#4e290f] focus:outline-none focus:border-[#8b5a2b]">
                <option value="Tản văn">Tản văn</option>
                <option value="Y lý">Y lý</option>
                <option value="Tủ sách">Tủ sách</option>
              </select>
            </div>

            <div>
              <label className="block font-sans text-xs font-bold uppercase tracking-widest text-[#947e6b] mb-2">Ảnh bìa (Thumbnail)</label>
              <CldUploadWidget
                uploadPreset="dhn_databook"
                options={{ multiple: false }} // Giới hạn chỉ up 1 ảnh
                onSuccess={handleUploadSuccess}
              >
                {({ open }) => (
                  <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="w-full flex items-center justify-center gap-2 bg-gray-50 border-2 border-dashed border-[#cbb497] rounded-lg px-4 py-8 font-sans text-sm text-[#8b5a2b] hover:bg-[#f6f2e9] hover:border-[#8b5a2b] transition-all">
                    <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    {formData.coverImage ? "Đổi ảnh khác" : "Click để tải ảnh lên"}
                  </button>
                )}
              </CldUploadWidget>

              {formData.coverImage && (
                <div className="mt-3 relative group">
                  <div className="aspect-[16/9] rounded-lg overflow-hidden border border-[#e6dfd1] shadow-sm">
                    <img src={formData.coverImage} alt="Cover Preview" className="w-full h-full object-cover" />
                  </div>
                  {/* Nút Xóa Ảnh */}
                  <button
                    type="button"
                    onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))}
                    className="absolute top-2 right-2 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                    title="Xóa ảnh này"
                  >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              )}
            </div>

            {/* Checkbox ẩn/hiện Thumbnail trong bài */}
            <div className="flex items-center gap-3 pt-2">
              <input
                type="checkbox"
                id="showCover"
                checked={formData.showCover}
                onChange={(e) => setFormData(prev => ({ ...prev, showCover: e.target.checked }))}
                className="w-5 h-5 accent-[#8b5a2b]"
              />
              <label htmlFor="showCover" className="font-sans text-sm text-[#4e290f] font-bold cursor-pointer">
                Hiển thị ảnh này ở đầu bài viết
              </label>
            </div>

            <div>
              <label className="block font-sans text-xs font-bold uppercase tracking-widest text-[#947e6b] mb-2">Đoạn trích ngắn</label>
              <textarea value={formData.excerpt} onChange={(e) => setFormData(prev => ({ ...prev, excerpt: e.target.value }))} placeholder="Vài dòng tóm tắt..." rows={4} className="w-full bg-white border border-[#e6dfd1] rounded-lg px-4 py-3 font-sans text-sm text-gray-700 focus:outline-none focus:border-[#8b5a2b]" />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}