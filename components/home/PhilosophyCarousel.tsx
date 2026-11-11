"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";

const items = [
  { id: 1, image: "https://images.unsplash.com/photo-1544367567-0f2fcb009e0b?auto=format&fit=crop&w=800&q=80" },
  { id: 2, image: "https://images.unsplash.com/photo-1512438248247-f0f2a5a8b7f0?auto=format&fit=crop&w=800&q=80" },
  { id: 3, image: "https://images.unsplash.com/photo-1506126613408-eca07ce68773?auto=format&fit=crop&w=800&q=80" },
  { id: 4, image: "https://images.unsplash.com/photo-1529156069898-49953eb1b5ae?auto=format&fit=crop&w=800&q=80" },
  { id: 5, image: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?auto=format&fit=crop&w=800&q=80" },
];

export default function PhilosophyCarousel() {
  const [activeIndex, setActiveIndex] = useState(2);

  useEffect(() => {
    const timer = setInterval(() => {
      setActiveIndex((current) => (current + 1) % items.length);
    }, 3000);
    return () => clearInterval(timer);
  }, []);

  const getStyle = (index: number) => {
    let diff = index - activeIndex;
    if (diff < -2) diff += 5;
    if (diff > 2) diff -= 5;

    let transform = "translateX(0) scale(1)";
    let opacity = 1;
    let zIndex = 30;

    if (diff === 0) {
      transform = "translateX(0) scale(1)";
      opacity = 1;
      zIndex = 30;
    } else if (diff === -1) {
      transform = "translateX(-80%) scale(0.85)";
      opacity = 0.6;
      zIndex = 20;
    } else if (diff === 1) {
      transform = "translateX(80%) scale(0.85)";
      opacity = 0.6;
      zIndex = 20;
    } else if (diff === -2) {
      transform = "translateX(-150%) scale(0.7)";
      opacity = 0.2;
      zIndex = 10;
    } else if (diff === 2) {
      transform = "translateX(150%) scale(0.7)";
      opacity = 0.2;
      zIndex = 10;
    }

    return {
      transform,
      opacity,
      zIndex,
      transition: "all 0.8s cubic-bezier(0.4, 0, 0.2, 1)",
    };
  };

  return (
    <section className="overflow-hidden bg-[#f8fafc] py-24 md:py-32">
      
      <div className="mx-auto mb-16 max-w-4xl px-4 text-center">
        <span className="mb-8 inline-block rounded-full border border-slate-200 bg-white px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-[0.2em] text-slate-500 shadow-sm">
          Lorem Ipsum
        </span>
        <p className="font-sans text-2xl font-medium leading-normal text-slate-400 md:text-4xl md:leading-[1.6]">
          Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut <span className="text-slate-900">labore et dolore</span> magna aliqua. Ut enim ad minim veniam.
        </p>
      </div>

      <div className="relative mx-auto flex h-[350px] w-full max-w-6xl items-center justify-center md:h-[450px]">
        {items.map((item, index) => (
          <div
            key={item.id}
            className="absolute aspect-[4/5] w-[60%] max-w-[280px] cursor-pointer overflow-hidden rounded-[2rem] shadow-2xl md:max-w-[360px]"
            style={getStyle(index)}
            onClick={() => setActiveIndex(index)}
          >
            <Image
              src={item.image}
              alt={`Slide ${index}`}
              fill
              className="object-cover"
            />
          </div>
        ))}
      </div>

      <div className="relative z-40 mt-16 text-center">
        <Link href="#specialists" className="group inline-flex items-center gap-3 font-sans text-sm font-bold uppercase tracking-widest text-slate-900 transition-colors hover:text-sky-600">
          Lorem ipsum dolor
          <div className="flex h-8 w-8 items-center justify-center rounded-full bg-slate-900 text-white transition-colors group-hover:bg-sky-600">
            <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M14 5l7 7m0 0l-7 7m7-7H3" />
            </svg>
          </div>
        </Link>
      </div>

    </section>
  );
}