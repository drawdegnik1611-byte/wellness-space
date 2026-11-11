import React from "react";

type HeroBannerProps = {
  title: string;
  description: string;
  bgPattern?: string; // Tùy chọn truyền URL ảnh nền mờ
};

export default function HeroBanner({ title, description, bgPattern }: HeroBannerProps) {
  return (
    <section className="relative bg-[#4e290f] py-24 px-6 sm:px-12 overflow-hidden flex flex-col items-center justify-center min-h-[40vh]">
      {/* Background Pattern */}
      <div 
        className="absolute inset-0 opacity-10 bg-cover bg-center"
        style={{ backgroundImage: `url(${bgPattern || '/images/pattern.png'})` }}
      ></div>
      
      <div className="relative z-10 max-w-4xl mx-auto text-center mt-12">
        <h1 className="font-serif text-4xl md:text-6xl font-bold text-[#fdfcf0] mb-6">
          {title}
        </h1>
        <p className="font-sans text-sm md:text-base text-[#d8caba] max-w-2xl mx-auto leading-relaxed">
          {description}
        </p>
      </div>
    </section>
  );
}