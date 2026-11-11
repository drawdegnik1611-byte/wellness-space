"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";

type AdminPost = {
  id: string;
  title: string;
  slug: string;
  category: string | null;
  createdAt: Date;
};

export default function PostTable({ posts }: { posts: AdminPost[] }) {
  const [isDeleting, setIsDeleting] = useState<string | null>(null);
  const router = useRouter();

  const handleDelete = async (id: string, title: string) => {
    // 1. Hiện popup xác nhận
    if (!confirm(`Bạn có chắc chắn muốn xóa vĩnh viễn bài viết "${title}"?`)) return;
    
    setIsDeleting(id);
    
    try {
      // 2. Gửi lệnh Xóa xuống API
      const res = await fetch(`/api/posts/${id}`, {
        method: "DELETE",
      });

      if (res.ok) {
        // 3. Xóa thành công -> Yêu cầu Next.js tải lại danh sách
        router.refresh();
      } else {
        const data = await res.json();
        alert(data.error || "Có lỗi xảy ra khi xóa.");
      }
    } catch (error) {
      alert("Lỗi kết nối đến máy chủ.");
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
              <th className="px-8 py-6 font-extrabold">Tiêu đề</th>
              <th className="px-8 py-6 font-extrabold">Chuyên mục</th>
              <th className="px-8 py-6 font-extrabold">Ngày đăng</th>
              <th className="px-8 py-6 text-right font-extrabold">Thao tác</th>
            </tr>
          </thead>

          <tbody className="divide-y divide-white/40">
            {posts.map((post) => (
              <tr key={post.id} className="transition-colors duration-200 hover:bg-white/60">
                
                <td className="px-8 py-5">
                  <span className="font-bold text-slate-900">{post.title}</span>
                </td>
                
                <td className="px-8 py-5">
                  <span className="inline-block rounded-full border border-slate-200 bg-white/50 px-3 py-1 text-xs font-semibold text-slate-600 shadow-sm">
                    {post.category || "Chưa phân loại"}
                  </span>
                </td>
                
                <td className="px-8 py-5 font-medium text-slate-500">
                  {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                </td>
                
                <td className="px-8 py-5 text-right">
                  <div className="flex items-center justify-end gap-2">
                    
                    {/* Nút Sửa dẫn đến trang Edit */}
                    <Link 
                      href={`/admin/posts/edit/${post.id}`} 
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-sky-50 px-3 text-xs font-bold text-sky-600 transition-colors hover:bg-sky-100 hover:text-sky-700"
                    >
                      SỬA
                    </Link>
                    
                    {/* Nút Xóa */}
                    <button 
                      onClick={() => handleDelete(post.id, post.title)}
                      disabled={isDeleting === post.id}
                      className="inline-flex h-8 items-center justify-center rounded-lg bg-red-50 px-3 text-xs font-bold text-red-500 transition-colors hover:bg-red-100 hover:text-red-600 disabled:opacity-50"
                    >
                      {isDeleting === post.id ? "ĐANG XÓA..." : "XÓA"}
                    </button>
                    
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
          
        </table>
      </div>
    </div>
  );
}