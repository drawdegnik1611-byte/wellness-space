"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";

export default function ProfilePage() {
  const [user, setUser] = useState<any>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();

  useEffect(() => {
    // Tạm dùng API check để lấy thông tin (Bạn cần sửa API check trả về thêm avatar)
    fetch("/api/auth/check").then(res => res.json()).then(data => {
      if (!data.success) {
        router.push("/login");
      } else {
        setUser(data.user);
      }
      setIsLoading(false);
    });
  }, [router]);

  const handleAvatarChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) return alert("Chỉ chấp nhận file ảnh!");
    if (file.size > 2 * 1024 * 1024) return alert("Ảnh phải nhỏ hơn 2MB!");

    setIsUploading(true);
    const formData = new FormData();
    formData.append("avatar", file);

    try {
      const res = await fetch("/api/user/avatar", { method: "POST", body: formData });
      
      // BỌC GIÁP CHỐNG SẬP HTML
      const rawText = await res.text();
      let data;
      try {
        data = JSON.parse(rawText);
      } catch (err) {
        console.error("Lỗi HTML từ Server:", rawText);
        alert("API bị sập! Hãy mở Terminal của VS Code để xem dòng báo lỗi màu đỏ.");
        setIsUploading(false);
        return;
      }

      if (res.ok && data.success) {
        setUser({ ...user, avatar: data.avatar });
        window.location.reload(); 
      } else {
        alert(data.error || "Có lỗi xảy ra khi lưu ảnh.");
      }
    } catch (err) {
      alert("Lỗi kết nối mạng, vui lòng thử lại.");
    } finally {
      setIsUploading(false);
    }
  };

  if (isLoading) return <div className="pt-32 text-center text-slate-500">Đang tải...</div>;

  return (
    <main className="min-h-screen bg-slate-50 px-4 pt-32 pb-24 font-sans">
      <div className="mx-auto max-w-2xl rounded-[2rem] border border-white/60 bg-white/60 p-8 shadow-sm backdrop-blur-xl md:p-12">
        <h1 className="mb-8 text-2xl font-extrabold text-slate-900">Hồ sơ cá nhân</h1>
        
        <div className="mb-8 flex flex-col items-center justify-center gap-4 border-b border-slate-200/60 pb-8 text-center">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <div className="h-24 w-24 overflow-hidden rounded-full bg-slate-200 shadow-inner">
              {user?.avatar ? (
                <img src={user.avatar} className="h-full w-full object-cover" alt="Avatar" />
              ) : (
                <svg className="h-full w-full p-6 text-slate-400" fill="currentColor" viewBox="0 0 24 24"><path d="M24 20.993V24H0v-2.996A14.977 14.977 0 0112.004 15c4.904 0 9.26 2.354 11.996 5.993zM16.002 8.999a4 4 0 11-8 0 4 4 0 018 0z" /></svg>
              )}
            </div>
            
            {/* Lớp overlay hiện chữ Đổi Ảnh khi hover */}
            <div className="absolute inset-0 flex items-center justify-center rounded-full bg-black/40 opacity-0 transition-opacity group-hover:opacity-100">
              <span className="text-xs font-bold text-white">{isUploading ? "Đang tải..." : "Đổi Ảnh"}</span>
            </div>
            <input type="file" ref={fileInputRef} onChange={handleAvatarChange} accept="image/*" className="hidden" />
          </div>
          <div>
            <h2 className="text-lg font-bold text-slate-900">{user?.name}</h2>
            <p className="text-sm font-medium text-slate-500 uppercase tracking-widest">{user?.role}</p>
          </div>
        </div>

        <div className="space-y-6">
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Họ và tên</label>
            <input type="text" value={user?.name} readOnly className="w-full cursor-not-allowed rounded-2xl border-transparent bg-slate-100/70 px-4 py-3 text-sm font-medium text-slate-600 outline-none" />
          </div>
          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Email</label>
            <input type="text" value={user?.email} readOnly className="w-full cursor-not-allowed rounded-2xl border-transparent bg-slate-100/70 px-4 py-3 text-sm font-medium text-slate-600 outline-none" />
          </div>
          <div className="rounded-xl bg-sky-50 p-4 text-xs font-medium text-sky-800">
            💡 Hiện tại hệ thống không hỗ trợ thay đổi thông tin Họ tên và Email để đảm bảo tính minh bạch cho các đơn hàng.
          </div>
        </div>
      </div>
    </main>
  );
}