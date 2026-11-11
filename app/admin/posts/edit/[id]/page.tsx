"use client";

import { useState, useEffect } from "react";
import { createPortal } from "react-dom"; // 1. THÊM IMPORT NÀY
import Link from "next/link";
import { useRouter, useParams } from "next/navigation";
import { CldUploadWidget } from "next-cloudinary";
import QuillEditor from "@/components/admin/QuillEditor";

export default function EditPostPage() {
  const router = useRouter();
  const params = useParams();
  const postId = params.id as string;

  // 2. BIẾN KIỂM TRA RENDER ĐỂ DÙNG PORTAL AN TOÀN TRÊN NEXT.JS
  const [isMounted, setIsMounted] = useState(false);
  useEffect(() => {
    setIsMounted(true);
  }, []);

  const [isLoading, setIsLoading] = useState(true);
  const [isSubmitting, setIsSubmitting] = useState(false);
  
  const [originalData, setOriginalData] = useState<any>(null); 
  const [revisions, setRevisions] = useState<any[]>([]);
  const [showHistoryModal, setShowHistoryModal] = useState(false);

  const [formData, setFormData] = useState({
    title: "",
    slug: "",
    category: "Tản văn",
    coverImage: "",
    showCover: true,
    excerpt: "",
    content: "",
  });

  useEffect(() => {
    const fetchPost = async () => {
      try {
        const res = await fetch(`/api/posts/${postId}`);
        const data = await res.json();

        if (data.success) {
          const postData = {
            title: data.post.title,
            slug: data.post.slug,
            category: data.post.category || "Tản văn",
            coverImage: data.post.coverImage || "",
            showCover: data.post.showCover ?? true,
            excerpt: data.post.excerpt || "",
            content: data.post.content,
          };
          setFormData(postData);
          setOriginalData(postData); 
          setRevisions(data.post.revisions || []);
        } else {
          router.push("/admin/posts");
        }
      } catch (error) {
        alert("Lỗi tải dữ liệu");
      } finally {
        setIsLoading(false);
      }
    };

    if (postId) fetchPost();
  }, [postId, router]);

  const handleResetChanges = () => {
    if (confirm("Bạn có chắc muốn khôi phục lại toàn bộ nội dung như lúc mới mở trang không?")) {
      setFormData(originalData);
    }
  };

  const handleRestoreRevision = (revision: any) => {
    if (confirm("Khôi phục về phiên bản này? Các chỉnh sửa hiện tại (chưa lưu) sẽ bị ghi đè.")) {
      setFormData(prev => ({
        ...prev,
        title: revision.title,
        content: revision.content
      }));
      setShowHistoryModal(false);
    }
  };

  const handleImportWord = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    try {
      const reader = new FileReader();
      reader.onload = async (event) => {
        const arrayBuffer = event.target?.result as ArrayBuffer;
        const mammoth = await import("mammoth");
        const result = await mammoth.convertToHtml({ arrayBuffer });
        setFormData(prev => ({ ...prev, content: result.value }));
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
      const res = await fetch(`/api/posts/${postId}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      if (!res.ok) {
        alert("Có lỗi xảy ra khi cập nhật bài viết.");
        setIsSubmitting(false);
        return;
      }
      alert("Đã lưu bài viết thành công!");
      router.push("/admin/posts");
      router.refresh();
    } catch (error) {
      alert("Không thể kết nối đến máy chủ.");
      setIsSubmitting(false);
    }
  };

  if (isLoading) return <div className="p-10 text-center font-sans text-sm font-bold text-sky-600">Đang tải dữ liệu bài viết...</div>;

  return (
    <div>
      {/* HEADER GIỮ NGUYÊN */}
      <header className="mb-8 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <Link href="/admin/posts" className="mb-2 flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-sky-600">
            <span>←</span> Quay lại danh sách
          </Link>
          <h1 className="font-sans text-3xl font-extrabold text-slate-900">Chỉnh sửa bài viết</h1>
        </div>
        
        <div className="flex flex-wrap items-center gap-3">
          <button type="button" onClick={() => setShowHistoryModal(true)} className="flex h-11 items-center gap-2 rounded-xl border border-white/60 bg-white/40 px-4 font-sans text-sm font-bold text-slate-700 shadow-sm backdrop-blur-md transition-all hover:bg-white/80 hover:text-sky-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>
            Lịch sử
          </button>
          <button type="button" onClick={handleResetChanges} className="flex h-11 items-center rounded-xl bg-red-50 px-4 font-sans text-sm font-bold text-red-600 shadow-sm transition-all hover:bg-red-100">
            Hủy thay đổi
          </button>
          <button onClick={handleSubmit} disabled={isSubmitting} className="flex h-11 items-center rounded-xl bg-slate-900 px-8 font-sans text-sm font-bold text-white shadow-lg transition-all hover:bg-sky-600 disabled:opacity-70">
            {isSubmitting ? "Đang cập nhật..." : "Lưu thay đổi"}
          </button>
        </div>
      </header>

      {/* KHU VỰC FORM GIỮ NGUYÊN */}
      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        <div className="space-y-6 lg:col-span-2">
          <div className="space-y-6 rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl md:p-8">
            <div>
              <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Tiêu đề bài viết</label>
              <input type="text" required value={formData.title} onChange={(e) => setFormData(prev => ({ ...prev, title: e.target.value }))} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-sans text-xl font-bold text-slate-900 outline-none backdrop-blur-md transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
            </div>

            <div>
              <div className="mb-2 flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                <label className="block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Nội dung bài viết</label>
                <label className="flex cursor-pointer items-center gap-2 rounded-lg bg-sky-50 px-3 py-1.5 font-sans text-xs font-bold uppercase tracking-widest text-sky-600 transition-colors hover:bg-sky-100 hover:text-sky-700">
                  <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                  Import file .DOCX
                  <input type="file" accept=".docx" className="hidden" onChange={handleImportWord} />
                </label>
              </div>
              <QuillEditor value={formData.content} onChange={(content) => setFormData(prev => ({ ...prev, content }))} />
            </div>
          </div>
        </div>

        <div className="space-y-6">
          <div className="space-y-6 rounded-[2rem] border border-white/60 bg-white/40 p-6 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl md:p-8">
            <div>
              <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Đường dẫn (Slug)</label>
              <input type="text" required value={formData.slug} onChange={(e) => setFormData(prev => ({ ...prev, slug: e.target.value }))} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-mono text-sm text-slate-600 outline-none backdrop-blur-md transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Chuyên mục</label>
              <select value={formData.category} onChange={(e) => setFormData(prev => ({ ...prev, category: e.target.value }))} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-sans text-sm font-bold text-slate-700 outline-none backdrop-blur-md transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100">
                <option value="Tản văn">Tản văn</option>
                <option value="Y lý">Y lý</option>
                <option value="Tủ sách">Tủ sách</option>
              </select>
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Ảnh bìa (Thumbnail)</label>
              <CldUploadWidget uploadPreset="dhn_databook" options={{ multiple: false }} onSuccess={(result: any) => { if (result.event === "success") setFormData(prev => ({ ...prev, coverImage: result.info.secure_url })) }}>
                {({ open }) => (
                  <button type="button" onClick={(e) => { e.preventDefault(); open(); }} className="flex w-full items-center justify-center gap-2 rounded-2xl border-2 border-dashed border-slate-300 bg-white/40 px-4 py-8 font-sans text-sm font-bold text-slate-500 transition-all hover:border-sky-400 hover:bg-white/60 hover:text-sky-600">
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"></path></svg>
                    {formData.coverImage ? "Đổi ảnh khác" : "Click để tải ảnh lên"}
                  </button>
                )}
              </CldUploadWidget>

              {formData.coverImage && (
                <div className="group relative mt-3">
                  <div className="aspect-[16/9] overflow-hidden rounded-2xl border border-white/60 shadow-sm">
                    <img src={formData.coverImage} alt="Cover Preview" className="h-full w-full object-cover" />
                  </div>
                  <button type="button" onClick={() => setFormData(prev => ({ ...prev, coverImage: "" }))} className="absolute right-2 top-2 rounded-full bg-red-500 p-1.5 text-white opacity-0 transition-opacity group-hover:opacity-100" title="Xóa ảnh này">
                    <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
                  </button>
                </div>
              )}
            </div>

            <div className="flex items-center gap-3 pt-2">
              <input type="checkbox" id="showCover" checked={formData.showCover} onChange={(e) => setFormData(prev => ({ ...prev, showCover: e.target.checked }))} className="h-5 w-5 accent-sky-600" />
              <label htmlFor="showCover" className="cursor-pointer font-sans text-sm font-bold text-slate-700">Hiển thị ảnh này ở đầu bài viết</label>
            </div>

            <div>
              <label className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-slate-500">Đoạn trích ngắn</label>
              <textarea value={formData.excerpt} onChange={(e) => setFormData({ ...formData, excerpt: e.target.value })} rows={4} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-sans text-sm text-slate-700 outline-none backdrop-blur-md transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
            </div>
          </div>
        </div>
      </div>

      {/* 3. DÙNG PORTAL BỌC QUANH POPUP ĐỂ HIỂN THỊ CHÍNH GIỮA MÀN HÌNH */}
      {showHistoryModal && isMounted && createPortal(
        <div className="fixed inset-0 z-[9999] flex items-center justify-center bg-slate-900/40 p-4 backdrop-blur-md">
          <div className="flex max-h-[80vh] w-full max-w-2xl flex-col overflow-hidden rounded-[2.5rem] border border-white/60 bg-white/90 shadow-2xl backdrop-blur-xl">
            <div className="flex items-center justify-between border-b border-white/40 bg-white/50 p-6">
              <h2 className="font-sans text-2xl font-extrabold text-slate-900">Lịch sử chỉnh sửa</h2>
              <button onClick={() => setShowHistoryModal(false)} className="text-slate-400 transition-colors hover:text-red-500">
                <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12"></path></svg>
              </button>
            </div>
            
            <div className="overflow-y-auto p-6">
              {revisions.length === 0 ? (
                <p className="text-center font-sans text-sm text-slate-500">Chưa có lịch sử chỉnh sửa nào.</p>
              ) : (
                <div className="space-y-4">
                  {revisions.map((rev, idx) => (
                    <div key={rev.id} className="flex items-center justify-between rounded-2xl border border-white/60 bg-white/50 p-4 transition-colors hover:border-sky-300 hover:bg-white/80">
                      <div>
                        <div className="mb-1 font-sans text-xs font-bold uppercase tracking-widest text-sky-600">
                          Bản lưu thứ {revisions.length - idx}
                        </div>
                        <div className="font-sans text-sm font-medium text-slate-700">
                          Lưu lúc: {new Date(rev.savedAt).toLocaleString("vi-VN")}
                        </div>
                      </div>
                      <button 
                        onClick={() => handleRestoreRevision(rev)}
                        className="rounded-xl bg-sky-50 px-4 py-2 font-sans text-xs font-bold uppercase tracking-widest text-sky-600 transition-all hover:bg-sky-600 hover:text-white"
                      >
                        Khôi phục
                      </button>
                    </div>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>,
        document.body
      )}

    </div>
  );
}