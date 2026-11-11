import AdminDashboardUI from "@/components/admin/AdminDashboardUI";
import prisma from "@/lib/prisma";

// Ép Next.js không cache trang này để dashboard luôn hiện số liệu mới nhất
export const dynamic = "force-dynamic";

export default async function AdminPage() {
  // 1. LẤY DỮ LIỆU THẬT TỪ DATABASE
  const totalPosts = await prisma.post.count();
  const totalProducts = await prisma.product.count();
  
  // (Nếu bạn đã có model Order, có thể dùng prisma.order.count(). Tạm thời để 0)
  const totalOrders = 0; 

  // 2. TÍNH TOÁN DỮ LIỆU BIỂU ĐỒ (Số bài viết tạo trong 7 ngày qua)
  const allPosts = await prisma.post.findMany({
    select: { createdAt: true },
    where: {
      // Chỉ lấy bài viết trong 7 ngày gần nhất cho nhẹ DB
      createdAt: {
        gte: new Date(new Date().setDate(new Date().getDate() - 7))
      }
    }
  });

  // Tạo mảng 7 ngày gần nhất (VD: T2, T3, T4...)
  const last7Days = Array.from({ length: 7 }).map((_, i) => {
    const d = new Date();
    d.setDate(d.getDate() - (6 - i));
    return d;
  });

  const chartData = last7Days.map(day => {
    // Đếm số bài viết trùng với ngày đang xét
    const count = allPosts.filter(p => new Date(p.createdAt).toDateString() === day.toDateString()).length;
    return {
      label: day.toLocaleDateString('vi-VN', { weekday: 'short' }), // Ra chữ "T2", "T3"
      value: count
    };
  });

  // Lấy giá trị cao nhất để vẽ chiều cao cột (tránh chia cho 0)
  const maxChartValue = Math.max(...chartData.map(d => d.value), 1);

  return (
    <AdminDashboardUI 
      totalPosts={totalPosts}
      totalProducts={totalProducts}
      totalOrders={totalOrders}
      chartData={chartData}
      maxChartValue={maxChartValue}
    />
  );
}