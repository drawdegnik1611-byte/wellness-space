import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import { formatDate } from "@/lib/utils";

export default async function PostDetail({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;

  const post = await prisma.post.findUnique({
    where: { slug: slug },
  });

  if (!post) return notFound();

  return (
    <article className="min-h-screen pb-32 bg-[#fdfcf0]">
      
      {/* KHU VỰC THUMBNAIL (FULL WIDTH Ở TRÊN CÙNG) */}
      {post.coverImage && post.showCover ? (
        <div className="relative w-full h-[50vh] md:h-[65vh]">
          <img 
            src={post.coverImage} 
            alt={post.title} 
            className="w-full h-full object-cover"
          />
          {/* Lớp phủ gradient mờ để làm dịu ảnh nếu ảnh quá sáng */}
          <div className="absolute inset-0 bg-gradient-to-b from-black/10 to-black/30"></div>
        </div>
      ) : (
        // Nếu không có ảnh, để một mảng màu tối làm nền cho đẹp
        <div className="w-full h-[25vh] bg-[#4e290f]"></div>
      )}

      {/* HEADER BÀI VIẾT (TEXTBOX TRẮNG ĐÈ LÊN ẢNH) */}
      <div className="relative z-10 max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 -mt-24 md:-mt-32">
        <div className="bg-white/95 backdrop-blur-md rounded-2xl shadow-[0_20px_40px_rgba(0,0,0,0.08)] p-8 md:p-14 border border-white">
          
          {/* Badge Chuyên mục & Thời gian */}
          <div className="flex items-center gap-4 mb-6">
            <Link href={`/${post.category === "Y lý" ? "y-ly" : "tan-van"}`} className="bg-[#2c1c11] text-white px-4 py-1.5 rounded-full font-sans text-xs font-bold uppercase tracking-widest hover:bg-[#8b5a2b] transition-colors">
              {post.category || "Tản văn"}
            </Link>
            <span className="font-sans text-xs uppercase tracking-widest text-[#947e6b]">
              {formatDate(post.createdAt)}
            </span>
          </div>

          {/* Tiêu đề chính */}
          <h1 className="font-serif text-3xl md:text-5xl lg:text-[54px] font-bold text-[#2c1c11] leading-[1.15] mb-8 tracking-tight">
            {post.title}
          </h1>

          {/* Khối tác giả */}
          <div className="flex items-center gap-4 border-t border-[#e8e0d0] pt-6">
            <div className="w-12 h-12 rounded-full bg-[#f6f2e9] border border-[#e8e0d0] flex items-center justify-center overflow-hidden">
              {/* Nếu có ảnh avatar của Bác sĩ thì đưa link vào src, nếu không dùng icon */}
              <svg className="w-6 h-6 text-[#cbb497]" fill="currentColor" viewBox="0 0 20 20"><path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"></path></svg>
            </div>
            <div>
              <div className="font-sans text-sm font-bold text-[#2c1c11]">Bác sĩ Đỗ Hồng Ngọc</div>
              <div className="font-sans text-xs text-[#947e6b]">Tác giả</div>
            </div>
          </div>
        </div>
      </div>

      {/* NỘI DUNG CHÍNH (TYPOGRAPHY HIỆN ĐẠI DÀNH CHO HEADING) */}
      <div className="max-w-[720px] mx-auto px-4 sm:px-6 lg:px-8 mt-16 md:mt-24">
        <div 
          className="prose prose-lg prose-stone max-w-none 
                     break-words whitespace-pre-wrap overflow-hidden
                     
                     prose-p:font-serif prose-p:text-[#382b22] prose-p:leading-[1.8] prose-p:text-[19px] prose-p:mb-8
                     
                     prose-headings:font-sans prose-headings:font-bold prose-headings:text-[#1a110a] prose-headings:tracking-tight
                     prose-h2:text-3xl prose-h2:mt-14 prose-h2:mb-6
                     prose-h3:text-2xl prose-h3:mt-10 prose-h3:mb-4
                     
                     prose-a:text-[#8b5a2b] prose-a:underline hover:prose-a:text-[#4e290f]
                     
                     prose-blockquote:border-l-4 prose-blockquote:border-[#8b5a2b] prose-blockquote:bg-[#f6f2e9]/60 prose-blockquote:py-5 prose-blockquote:px-8 prose-blockquote:italic prose-blockquote:text-[#5c4938] prose-blockquote:rounded-r-xl prose-blockquote:my-10
                     
                     prose-ul:font-serif prose-ul:text-[#382b22] prose-ul:text-[19px]
                     prose-li:my-2
                     
                     prose-img:rounded-2xl prose-img:shadow-lg prose-img:mx-auto prose-img:my-12"
          dangerouslySetInnerHTML={{ __html: post.content }}
        />
      </div>

    </article>
  );
}