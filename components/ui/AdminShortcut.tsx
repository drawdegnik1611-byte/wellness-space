"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function AdminShortcut() {
  const router = useRouter();

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Bắt tổ hợp phím Cmd + Shift + A (hoặc Ctrl + Shift + A)
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && e.key.toLowerCase() === "a") {
        e.preventDefault(); // Chặn hành vi mặc định của trình duyệt nếu có
        router.push("/admin");
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    
    // Dọn dẹp event listener khi component unmount
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [router]);

  return null; // Component này hoàn toàn tàng hình trên giao diện
}