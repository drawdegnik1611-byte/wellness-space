import Image from "next/image";
import SearchBar from "@/components/ui/SearchBar";
import Reveal from "./Reveal";
import PostCard from "./PostCard";
import Pagination from "./Pagination";
import type { PostSummary } from "./type";

type PostsSectionProps = {
  posts: PostSummary[];
  totalPosts: number;
  currentPage: number;
  totalPages: number;
};

export default function PostsSection({
  posts,
  totalPosts,
  currentPage,
  totalPages,
}: PostsSectionProps) {
  return (
    <section
      id="bai-viet-moi"
      className="min-h-screen scroll-mt-8 bg-[#f8fafc] px-4 pb-24 pt-20 sm:px-6 lg:px-8 lg:pt-32"
    >
      <div className="relative z-10 mx-auto max-w-[1400px]">
        
        {/* HEADER BANNER MỚI CÓ ẢNH NỀN */}
        <Reveal className="mb-16">
          <div className="relative flex w-full flex-col items-center justify-center overflow-hidden rounded-[2.5rem] py-20 md:py-28 shadow-xl">
            
            {/* Ảnh nền */}
            <div className="absolute inset-0 z-0">
              <Image
                src="https://images.unsplash.com/photo-1499714608240-22fc6ad53fb2?auto=format&fit=crop&w=1200&q=80" // Thay link ảnh nền của bạn vào đây
                alt="Banner bài viết"
                fill
                className="object-cover object-center"
              />
              {/* Lớp phủ mờ giúp chữ trắng nổi bật */}
              <div className="absolute inset-0 bg-black/40" />
            </div>

            {/* Nội dung đè lên ảnh */}
            <div className="relative z-10 flex w-full flex-col items-center px-4 text-center">
              <span className="mb-5 inline-block rounded-full border border-white/40 bg-white/20 px-5 py-2 font-sans text-[10px] font-bold uppercase tracking-[0.2em] text-white shadow-sm backdrop-blur-md">
                Thư viện bài viết
              </span>
              
              <h2 className="mb-6 font-sans text-4xl font-extrabold tracking-tight text-white drop-shadow-md md:text-5xl">
                {currentPage === 1 ? "Bài viết mới nhất" : "Danh sách bài viết"}
              </h2>
              
              <p className="max-w-2xl font-sans text-base leading-relaxed text-slate-100 drop-shadow-sm">
                {currentPage === 1 
                  ? "Cập nhật những kiến thức, tản văn và chia sẻ mới nhất giúp bạn tìm lại sự cân bằng và nuôi dưỡng thân tâm." 
                  : `Đang xem trang ${currentPage} trong ${totalPages} trang.`}
              </p>

              <div className="mt-10 w-full max-w-md">
                <SearchBar />
                <div className="mt-4 font-sans text-xs font-medium text-slate-200 drop-shadow-sm">
                  Tổng cộng {totalPosts} bài viết
                </div>
              </div>
            </div>
            
          </div>
        </Reveal>

        {/* Danh sách bài viết */}
        {posts.length > 0 ? (
          <div className="grid grid-cols-1 gap-8 md:grid-cols-2 lg:grid-cols-3 lg:gap-10">
            {posts.map((post, index) => (
              <PostCard
                key={post.id}
                post={post}
                index={index}
              />
            ))}
          </div>
        ) : (
          <div className="rounded-[2.5rem] bg-white py-24 text-center shadow-sm">
            <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-full bg-slate-100 text-slate-400">
              <svg className="h-8 w-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 002 2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
              </svg>
            </div>
            <h3 className="font-sans text-xl font-bold text-slate-900">
              Chưa có bài viết nào
            </h3>
            <p className="mt-2 font-sans text-sm text-slate-500">
              Nội dung sẽ sớm được cập nhật.
            </p>
          </div>
        )}

        <Pagination
          currentPage={currentPage}
          totalPages={totalPages}
        />
      </div>
    </section>
  );
}