"use client";

import { useRouter, usePathname } from "next/navigation";
import { useState, useEffect } from "react";
import { useDebounce } from "use-debounce"; // Tái sử dụng thư viện đã cài ở ngoài trang chủ

export default function AdminSearch({ 
  initialQuery = "", 
  placeholder = "Tìm kiếm..." // 1. Thêm placeholder với giá trị mặc định
}: { 
  initialQuery?: string;
  placeholder?: string; // Khai báo kiểu cho placeholder
}) {
  const router = useRouter();
  const pathname = usePathname();
  
  const [text, setText] = useState(initialQuery);
  const [debouncedValue] = useDebounce(text, 500); // Đợi 500ms sau khi ngừng gõ

  useEffect(() => {
    // Nếu giá trị debounce thay đổi và khác với query ban đầu lúc load trang
    if (debouncedValue !== initialQuery) {
      const params = new URLSearchParams();
      if (debouncedValue) {
        params.set("q", debouncedValue);
      }
      params.set("page", "1"); // Luôn reset về trang 1 khi search từ khóa mới
      
      router.push(`${pathname}?${params.toString()}`);
    }
  }, [debouncedValue, router, pathname, initialQuery]);

  return (
    <div className="relative w-full max-w-sm">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        placeholder={placeholder} // 2. Truyền biến placeholder vào đây
        className="w-full bg-[#fdfcf9] border border-[#e6dfd1] rounded-lg pl-10 pr-4 py-2 font-sans text-sm text-[#4e290f] placeholder-[#947e6b] focus:outline-none focus:border-[#8b5a2b] focus:ring-1 focus:ring-[#8b5a2b] transition-all"
      />
      <svg className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#947e6b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
      </svg>
    </div>
  );
}