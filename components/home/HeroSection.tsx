import Image from "next/image";
import Link from "next/link";

export default function HeroSection() {
  return (
    <section className="relative h-screen w-full overflow-hidden">

      {/* 1. LỚP NỀN: ẢNH FULL MÀN HÌNH */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        <Image
          src="/images/blue-sky.jpg" 
          alt="Wellness Hero"
          fill
          priority
          sizes="100vw"
          className="object-cover object-center animate-hero-zoom"
        />
        {/* Lớp phủ tối nhẹ để chữ nổi bật trên mọi nền ảnh */}
        <div className="absolute inset-0 bg-black/20" />
      </div>
      
      {/* 2. LỚP NỘI DUNG NỔI BÊN TRÊN */}
      <div className="relative z-10 mx-auto h-full w-full max-w-[1500px] px-4 sm:px-6 lg:px-8">

        {/* TIÊU ĐỀ CHÍNH (Căn giữa, cách top 25%) */}
        <div className="absolute top-[20%] left-0 right-0 px-4 text-center md:top-[25%]">
          <h1 className="font-sans text-5xl font-extrabold leading-[1.1] tracking-tight text-white drop-shadow-lg md:text-7xl">
            Lorem ipsum dolor.<br />
            Sit amet consectetur.
          </h1>
        </div>

        {/* KHỐI BÊN TRÁI: TYPO TRẦN & NÚT BẤM */}
        <div className="absolute bottom-12 left-4 max-w-sm md:bottom-20 md:left-8 lg:left-12">
          <p className="mb-6 font-sans text-base font-medium leading-relaxed text-white drop-shadow-md md:text-lg">
            Lorem ipsum dolor sit amet, consectetur adipiscing elit. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris.
          </p>
          <Link
            href="#bai-viet-moi"
            className="inline-flex items-center justify-center gap-3 rounded-full bg-white px-6 py-3 font-sans text-sm font-bold text-slate-900 shadow-sm transition-all hover:bg-slate-50 hover:shadow-md"
          >
            Lorem ipsum
            <div className="flex h-6 w-6 items-center justify-center rounded-full bg-slate-900 text-white">
              <svg className="h-3 w-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M14 5l7 7m0 0l-7 7m7-7H3" />
              </svg>
            </div>
          </Link>
        </div>

        {/* KHỐI BÊN PHẢI: GLASSMORPHISM */}
        <div className="absolute right-4 bottom-12 hidden w-[300px] rounded-[1.5rem] border border-white/50 bg-white/30 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.1)] backdrop-blur-md md:right-8 md:bottom-20 lg:right-12 lg:block">
          <div className="mb-5 flex -space-x-3">
            <div className="h-10 w-10 rounded-full border-2 border-white bg-sky-200" />
            <div className="h-10 w-10 rounded-full border-2 border-white bg-teal-200" />
            <div className="h-10 w-10 rounded-full border-2 border-white bg-slate-200" />
          </div>
          <h3 className="mb-2 font-sans text-xl font-bold text-white drop-shadow-sm">
            Lorem Ipsum
          </h3>
          <p className="font-sans text-sm font-medium leading-relaxed text-white drop-shadow-sm">
            Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat.
          </p>
          <div className="mt-6 h-1 w-10 bg-white" />
        </div>
        
      </div>
    </section>
  );
}