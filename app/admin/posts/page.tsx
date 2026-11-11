import Link from "next/link";
import prisma from "@/lib/prisma";
import PostTable from "@/components/admin/PostTable";
import AdminSearch from "@/components/admin/AdminSearch";
import AdminPagination from "@/components/admin/AdminPagination";

const POSTS_PER_PAGE = 10;

type AdminPostsPageProps = {
  searchParams: Promise<{ q?: string; page?: string }>;
};

export default async function AdminPostsPage({ searchParams }: AdminPostsPageProps) {
  const { q, page } = await searchParams;
  
  const searchQuery = q || "";
  const parsedPage = Number(page);
  const currentPage = Number.isFinite(parsedPage) && parsedPage > 0 ? Math.floor(parsedPage) : 1;

  const whereCondition = searchQuery ? { title: { contains: searchQuery } } : {};

  const totalPosts = await prisma.post.count({ where: whereCondition });
  const totalPages = Math.ceil(totalPosts / POSTS_PER_PAGE) || 1;
  const validPage = Math.min(currentPage, totalPages);

  const posts = await prisma.post.findMany({
    where: whereCondition,
    skip: (validPage - 1) * POSTS_PER_PAGE,
    take: POSTS_PER_PAGE,
    orderBy: { createdAt: "desc" },
    select: {
      id: true,
      title: true,
      slug: true,
      category: true,
      createdAt: true,
    },
  });

  return (
    <div className="flex flex-col gap-6">
      
      {/* HEADER & NÚT TẠO MỚI */}
      <div className="flex flex-col gap-4 md:flex-row md:items-end md:justify-between">
        <div>
          <span className="mb-2 block font-sans text-xs font-bold uppercase tracking-widest text-sky-600">
            Quản trị Nội dung
          </span>
          <h1 className="font-sans text-3xl font-extrabold tracking-tight text-slate-900">
            Danh sách bài viết
          </h1>
        </div>
        
        <Link 
          href="/admin/posts/new" 
          className="inline-flex h-[48px] items-center gap-2 rounded-2xl bg-slate-900 px-6 font-sans text-sm font-bold text-white shadow-[0_4px_20px_rgba(0,0,0,0.1)] transition-all hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-lg"
        >
          <svg className="h-5 w-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 4v16m8-8H4" />
          </svg>
          Viết bài mới
        </Link>
      </div>

      {/* THANH TÌM KIẾM */}
      <div className="mb-2">
        {/* Pass initialQuery xuống để khớp với component search cũ của bạn */}
        <AdminSearch initialQuery={searchQuery} />
      </div>

      {/* GỌI COMPONENT BẢNG */}
      {posts.length > 0 ? (
        <PostTable posts={posts} />
      ) : (
        <div className="flex flex-col items-center justify-center rounded-[2.5rem] border border-white/60 bg-white/40 p-12 text-center shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
          <p className="font-sans text-slate-500">Không tìm thấy bài viết nào khớp với "{searchQuery}".</p>
        </div>
      )}

      {/* PHÂN TRANG */}
      <AdminPagination 
        currentPage={validPage} 
        totalPages={totalPages} 
        searchQuery={searchQuery} 
      />
      
    </div>
  );
}