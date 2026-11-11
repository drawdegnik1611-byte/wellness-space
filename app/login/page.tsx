"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";

export default function LoginPage() {
  const router = useRouter();
  const [isLoginMode, setIsLoginMode] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  const [formData, setFormData] = useState({ name: "", email: "", password: "" });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    const url = isLoginMode ? "/api/auth/login" : "/api/auth/register";

    try {
      const res = await fetch(url, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error);
        setIsLoading(false);
        return;
      }

      if (!isLoginMode) {
        alert("Đăng ký thành công! Vui lòng đăng nhập.");
        setIsLoginMode(true);
        setIsLoading(false);
      } else {
        // --- LOGIC CHUYỂN HƯỚNG THÔNG MINH ---
        
        // 1. Lấy đường dẫn cần quay lại từ URL (Ví dụ: /checkout)
        const params = new URLSearchParams(window.location.search);
        const redirectUrl = params.get("redirect");

        // 2. Quyết định nơi đi tiếp
        if (redirectUrl) {
          router.push(redirectUrl); // Đẩy ngược lại trang khách vừa đứng (VD: Checkout)
        } else if (data.role === "ADMIN") {
          router.push("/admin"); // Admin thì vào thẳng Dashboard
        } else {
          router.push("/"); // Khách mua hàng bình thường vào từ trang login thì ra trang chủ
        }
        
        router.refresh();
      }
    } catch (err) {
      setError("Lỗi kết nối đến máy chủ.");
      setIsLoading(false);
    }
  };

  return (
    <div className="relative flex min-h-screen items-center justify-center bg-slate-50 p-4 font-sans">
      {/* Background Blobs */}
      <div className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-sky-200/50 mix-blend-multiply blur-3xl filter" />
      <div className="pointer-events-none absolute right-20 top-20 h-72 w-72 rounded-full bg-blue-200/50 mix-blend-multiply blur-3xl filter" />

      {/* Khối Form Glassmorphism */}
      <div className="relative z-10 w-full max-w-md rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:p-10">
        
        <div className="mb-8 text-center">
          <Link href="/" className="mb-6 inline-block font-sans text-2xl font-extrabold tracking-tight text-slate-900">
            Wellness <span className="text-sky-600">Space</span>
          </Link>
          <h2 className="text-xl font-bold text-slate-700">
            {isLoginMode ? "Chào mừng trở lại!" : "Tạo tài khoản mới"}
          </h2>
          <p className="mt-2 text-sm text-slate-500">
            {isLoginMode ? "Đăng nhập để quản lý và mua sắm sách." : "Điền thông tin để tham gia cùng chúng tôi."}
          </p>
        </div>

        {error && (
          <div className="mb-6 rounded-xl bg-red-50 p-3 text-center text-sm font-bold text-red-500">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {!isLoginMode && (
            <div>
              <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Họ và tên</label>
              <input type="text" required value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
            </div>
          )}

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Email</label>
            <input type="email" required value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
          </div>

          <div>
            <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Mật khẩu</label>
            <input type="password" required value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 font-medium text-slate-900 outline-none transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
          </div>

          <button disabled={isLoading} type="submit" className="mt-4 flex h-12 w-full items-center justify-center rounded-2xl bg-slate-900 px-4 font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-sky-600 disabled:opacity-70">
            {isLoading ? "Đang xử lý..." : (isLoginMode ? "Đăng nhập" : "Đăng ký")}
          </button>
        </form>

        <div className="mt-8 border-t border-dashed border-white/60 pt-6 text-center">
          <p className="text-sm font-medium text-slate-500">
            {isLoginMode ? "Chưa có tài khoản? " : "Đã có tài khoản? "}
            <button type="button" onClick={() => { setIsLoginMode(!isLoginMode); setError(""); }} className="font-bold text-sky-600 hover:underline">
              {isLoginMode ? "Đăng ký ngay" : "Đăng nhập"}
            </button>
          </p>
        </div>

      </div>
    </div>
  );
}