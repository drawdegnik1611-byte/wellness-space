import type { Metadata } from "next";
import { Be_Vietnam_Pro } from "next/font/google";
import "./globals.css";
// Cập nhật đường dẫn import mới
import Navbar from "@/components/layouts/Navbar"; 
import Footer from "@/components/layouts/Footer";
import AdminShortcut from "@/components/ui/AdminShortcut";

// Khởi tạo font Be Vietnam Pro
const beVietnam = Be_Vietnam_Pro({
  subsets: ["latin", "vietnamese"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-be-vietnam", // Biến CSS để truyền vào Tailwind
});

export const metadata: Metadata = {
  title: "Bác sĩ Đỗ Hồng Ngọc",
  description: "Trang thông tin và sách của Bác sĩ Đỗ Hồng Ngọc",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className="scroll-smooth">
      {/* Bổ sung biến font beVietnam.variable vào class của body */}
      <body className={`${beVietnam.variable} bg-[#f8fafc] text-slate-900 antialiased flex flex-col min-h-screen`}>
        
        {/* Lắp component Navbar vào đây */}
        <Navbar />
        <AdminShortcut />
        
        {/* NỘI DUNG CHÍNH */}
        <main className="flex-grow">
          {children}
        </main>

        {/* Lắp component Footer vào đây */}
        <Footer />

      </body>
    </html>
  );
}