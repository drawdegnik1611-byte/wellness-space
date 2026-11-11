import Link from "next/link";
import Reveal from "./Reveal";
import type { PostSummary } from "./type";

type PostCardProps = {
  post: PostSummary;
  index: number;
};

const DEFAULT_THUMBNAIL = "https://images.unsplash.com/photo-1544716278-ca5e3f4abd8c?auto=format&fit=crop&w=800&q=80";

export default function PostCard({ post, index }: PostCardProps) {
  const thumbnail = post.coverImage || DEFAULT_THUMBNAIL;
  const publishedDate = new Date(post.createdAt).toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "long",
    year: "numeric",
  });

  return (
    <Reveal delay={Math.min(index % 3, 2) * 100} className="h-full">
      <article className="group flex h-full flex-col overflow-hidden rounded-[2rem] bg-white shadow-[0_4px_20px_rgb(0,0,0,0.03)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_8px_30px_rgb(0,0,0,0.08)]">
        
        {/* Thumbnail */}
        <Link href={`/post/${post.slug}`} className="relative block aspect-[4/3] overflow-hidden bg-slate-100">
          <img
            src={thumbnail}
            alt={post.title}
            loading="lazy"
            className="h-full w-full object-cover transition-transform duration-700 group-hover:scale-105"
          />
          
          {/* Overlay gradient nhẹ khi hover */}
          <div className="absolute inset-0 bg-slate-900/0 transition-colors duration-300 group-hover:bg-slate-900/10" />

          {/* Tag Chuyên mục */}
          <span className="absolute left-6 top-6 rounded-full bg-white/90 px-4 py-1.5 font-sans text-[10px] font-bold uppercase tracking-widest text-slate-900 shadow-sm backdrop-blur-md">
            {post.category || "Tản văn"}
          </span>
        </Link>

        {/* Content */}
        <div className="flex flex-grow flex-col p-8">
          <div className="mb-4 font-sans text-xs font-semibold tracking-wider text-sky-600">
            {publishedDate}
          </div>

          <h3 className="mb-4 line-clamp-2 font-sans text-xl font-bold leading-snug text-slate-900 transition-colors group-hover:text-sky-600">
            <Link href={`/post/${post.slug}`}>
              {post.title}
            </Link>
          </h3>

          <p className="mb-8 line-clamp-3 flex-grow font-sans text-sm leading-relaxed text-slate-600">
            {post.excerpt || "Đang cập nhật nội dung trích dẫn cho bài viết này..."}
          </p>

          {/* Nút Read more phong cách hiện đại */}
          <Link
            href={`/post/${post.slug}`}
            className="mt-auto inline-flex w-fit items-center gap-2 font-sans text-sm font-bold text-slate-900 transition-colors hover:text-sky-600"
          >
            Đọc tiếp
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-100 transition-colors group-hover:bg-sky-100">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </div>
      </article>
    </Reveal>
  );
}