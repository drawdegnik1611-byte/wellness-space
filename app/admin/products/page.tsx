import Link from "next/link";
import prisma from "@/lib/prisma";
import ProductTable from "@/components/admin/ProductTable";
import AdminSearch from "@/components/admin/AdminSearch";

export default async function AdminProductsPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  // 1. Lấy từ khóa từ URL
  const { q } = await searchParams;
  const initialQuery = q || "";

  // 2. Tạo bộ lọc Prisma (nếu không có từ khóa thì trả về {} để lấy toàn bộ)
  const searchFilter = initialQuery
    ? { title: { contains: initialQuery } } 
    : {};

  // 3. Lấy dữ liệu thật từ DB kèm bộ lọc
  const products = await prisma.product.findMany({
    where: searchFilter,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      price: true,
      discount: true,
      coverImage: true,
      inStock: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      <header className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-sky-600">
            Quản trị Thương mại
          </span>
          <h1 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900">
            Danh sách Tủ sách
          </h1>
        </div>
        
        <Link 
          href="/admin/products/new"
          className="inline-flex h-[48px] items-center gap-2 rounded-2xl bg-slate-900 px-6 font-sans text-sm font-bold text-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-lg"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4"></path>
          </svg>
          Thêm sách mới
        </Link>
      </header>

      {/* THANH TÌM KIẾM */}
      <div className="w-full md:w-[400px]">
        {/* Đảm bảo file AdminSearch.tsx của bạn đã khai báo nhận prop placeholder */}
        <AdminSearch initialQuery={initialQuery} placeholder="Tìm kiếm tên sách..." />
      </div>

      {products.length > 0 ? (
        <ProductTable products={products} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-white/60 bg-white/40 p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <p className="font-sans text-slate-500">
            {initialQuery ? "Không tìm thấy cuốn sách nào phù hợp." : "Chưa có cuốn sách nào trong tủ."}
          </p>
        </div>
      )}
    </div>
  );
}