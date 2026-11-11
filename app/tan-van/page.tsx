import prisma from "@/lib/prisma";
import Link from "next/link";
import { formatDate } from "@/lib/utils";
import HeroBanner from "@/components/ui/HeroBanner";

export default async function TanVanPage({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const resolvedParams = await searchParams;
  const searchQuery = resolvedParams.q || "";

  // Truy xuất bài viết chỉ thuộc chuyên mục "Tản văn" và khớp với từ khóa tìm kiếm
  const posts = await prisma.post.findMany({
    where: {
      category: "Tản văn",
      title: { contains: searchQuery }, // Lọc theo tiêu đề
    },
    orderBy: { createdAt: "desc" },
  });

  return (
    <div className="min-h-screen pb-24">
    <HeroBanner 
      title="Tản văn" 
      description="Những chép nhặt nhẹ nhàng, những góc nhìn thong dong về tuổi già, sức khỏe và tình người qua lăng kính dung dị của Bác sĩ Đỗ Hồng Ngọc."
    />
    
      <section className="relative bg-[#4e290f] py-20 px-6 sm:px-12 overflow-hidden">
        {/* Họa tiết nền hoặc ảnh background mờ */}
        <div className="absolute inset-0 opacity-10 bg-[url('https://res.cloudinary.com/rpilwrtk/image/upload/v1700000000/pattern.png')] bg-cover bg-center"></div>
        <div className="relative z-10 max-w-5xl mx-auto text-center">
        </div>
      </section>

      {/* 2. CÔNG CỤ LỌC & TÌM KIẾM */}
      <section className="max-w-6xl mx-auto px-6 py-8 border-b border-[#e8e0d0]">
        <div className="flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="font-sans text-sm text-[#947e6b] font-bold uppercase tracking-widest">
            {posts.length} Bài viết
          </div>
          
          {/* Form tìm kiếm đẩy tham số lên URL (VD: /tan-van?q=tuoi-gia) */}
          <form method="GET" action="/tan-van" className="w-full md:w-80 relative">
            <input 
              type="text" 
              name="q" 
              defaultValue={searchQuery}
              placeholder="Tìm kiếm tản văn..." 
              className="w-full bg-[#f6f2e9] border border-[#e8e0d0] rounded-full px-5 py-2.5 font-sans text-sm text-[#4e290f] focus:outline-none focus:border-[#8b5a2b] transition-colors"
            />
            <button type="submit" className="absolute right-3 top-1/2 -translate-y-1/2 text-[#947e6b] hover:text-[#8b5a2b]">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg>
            </button>
          </form>
        </div>
      </section>

      {/* 3. LƯỚI HIỂN THỊ BÀI VIẾT */}
      <section className="max-w-6xl mx-auto px-6 py-12">
        {posts.length === 0 ? (
          <div className="text-center py-20 text-[#947e6b] font-serif italic text-lg">
            Không tìm thấy tản văn nào phù hợp...
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-10">
            {posts.map((post) => (
              <Link key={post.id} href={`/post/${post.slug}`} className="group flex flex-col block">
                {/* Ảnh Thumb (Nếu có) */}
                <div className="aspect-[4/3] w-full mb-5 overflow-hidden rounded-xl bg-[#f6f2e9] border border-[#e8e0d0]">
                  {post.coverImage ? (
                    <img src={post.coverImage} alt={post.title} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 ease-out" />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center font-serif text-[#cbb497] opacity-50">Đỗ Hồng Ngọc</div>
                  )}
                </div>
                {/* Thông tin */}
                <div className="flex items-center gap-2 mb-3">
                  <span className="font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-[#8b5a2b]">{post.category}</span>
                  <span className="w-1 h-1 rounded-full bg-[#d8caba]"></span>
                  <time className="font-sans text-[10px] uppercase tracking-widest text-[#947e6b]">{formatDate(post.createdAt)}</time>
                </div>
                <h2 className="font-serif text-xl font-bold text-[#4e290f] mb-3 leading-snug group-hover:text-[#8b5a2b] transition-colors line-clamp-2">
                  {post.title}
                </h2>
                <p className="font-sans text-sm text-[#736356] leading-relaxed line-clamp-3">
                  {post.excerpt || post.content.replace(/<[^>]+>/g, '').substring(0, 150) + "..."}
                </p>
              </Link>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}