import prisma from "@/lib/prisma";
import Link from "next/link";
import AddToCartButton from "@/components/shop/AddToCartButton";

export const dynamic = "force-dynamic";

export default async function BookstorePage() {
  const products = await prisma.product.findMany({
    orderBy: { createdAt: "desc" },
  });

  return (
    <main className="min-h-screen bg-[#f8fafc] px-4 pb-24 pt-32 sm:px-6 lg:px-8">
      
      {/* HEADER BANNER KÍNH MỜ */}
      <div className="mx-auto mb-16 flex max-w-4xl flex-col items-center text-center">
        <span className="mb-4 inline-block rounded-full border border-sky-200 bg-sky-50 px-5 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-sky-600 shadow-sm">
          Góc an trú
        </span>
        <h1 className="mb-6 font-sans text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
          Tủ sách của bác sĩ
        </h1>
        <p className="max-w-2xl font-sans text-base leading-relaxed text-slate-500">
          Những tựa sách gối đầu giường về thân - tâm - trí, giúp bạn tìm lại sự cân bằng, nuôi dưỡng tinh thần và chăm sóc sức khỏe mỗi ngày.
        </p>
      </div>

      {/* GRID SẢN PHẨM */}
      <div className="mx-auto max-w-7xl">
        {products.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            
            {products.map((product) => {
              const discount = product.discount || 0;
              const finalPrice = product.price * (1 - discount / 100);
              const isOutOfStock = product.inStock === 0;

              return (
                // Bọc toàn bộ Card bằng thẻ Link để click vào đi đến trang Chi tiết Sách
                <Link 
                  key={product.id} 
                  href={`/tu-sach/${product.slug}`}
                  className="group relative flex flex-col overflow-hidden rounded-[2rem] border border-white/60 bg-white/40 p-5 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:bg-white/60 hover:shadow-xl"
                >
                  
                  {/* Badge Giảm giá */}
                  {discount > 0 && (
                    <div className="absolute left-4 top-4 z-10 rounded-lg bg-rose-500 px-3 py-1 font-sans text-xs font-bold text-white shadow-sm">
                      -{discount}%
                    </div>
                  )}

                  {/* Ảnh Bìa */}
                  <div className="relative aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-200 shadow-inner">
                    {product.coverImage ? (
                      <img 
                        src={product.coverImage} 
                        alt={product.title} 
                        className={`h-full w-full object-cover transition-transform duration-700 group-hover:scale-105 ${isOutOfStock ? "grayscale opacity-70" : ""}`} 
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center text-slate-400">Trống</div>
                    )}
                  </div>

                  {/* Thông tin Sách */}
                  <div className="mt-5 flex flex-1 flex-col">
                    <span className="mb-1 font-sans text-[10px] font-bold uppercase tracking-widest text-sky-600">
                      {product.category}
                    </span>
                    <h3 className="line-clamp-2 font-sans text-lg font-bold leading-snug text-slate-900 transition-colors group-hover:text-sky-600">
                      {product.title}
                    </h3>
                    
                    <div className="mt-auto pt-4">
                      <div className="flex items-center gap-3">
                        <span className="font-sans text-xl font-extrabold text-slate-900">
                          {finalPrice.toLocaleString("vi-VN")}đ
                        </span>
                        {discount > 0 && (
                          <span className="font-sans text-sm font-medium text-slate-400 line-through">
                            {product.price.toLocaleString("vi-VN")}đ
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Gọi Client Component Nút thêm vào giỏ */}
                    <AddToCartButton 
                      product={{
                        id: product.id,
                        title: product.title,
                        price: product.price,
                        discount: discount,
                        coverImage: product.coverImage || "",
                        inStock: product.inStock,
                      }} 
                    />
                    
                  </div>
                </Link>
              );
            })}
          </div>
        ) : (
          <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-white/60 bg-white/40 p-24 text-center shadow-sm backdrop-blur-xl">
            <svg className="mb-4 h-12 w-12 text-slate-300" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
            </svg>
            <h3 className="font-sans text-xl font-bold text-slate-900">Tủ sách đang trống</h3>
            <p className="mt-2 font-sans text-slate-500">Các ấn phẩm mới sẽ sớm được cập nhật.</p>
          </div>
        )}
      </div>
      
    </main>
  );
}