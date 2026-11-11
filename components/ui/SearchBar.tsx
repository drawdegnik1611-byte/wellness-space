"use client";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useDebounce } from "use-debounce";

type SearchResult = {
  id: string;
  title: string;
  slug: string;
  createdAt: string;
  coverImage: string | null;
};

export default function SearchBar() {
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedTerm] = useDebounce(searchTerm, 300);
  
  const [results, setResults] = useState<SearchResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    if (debouncedTerm) {
      setIsSearching(true);
      fetch(`/api/search?q=${encodeURIComponent(debouncedTerm)}`)
        .then((res) => res.json())
        .then((data) => {
          if (data.success) {
            setResults(data.results);
            setIsOpen(true);
          }
        })
        .finally(() => setIsSearching(false));
    } else {
      setResults([]);
      setIsOpen(false);
    }
  }, [debouncedTerm]);

  return (
    <div className="relative z-30 mx-auto w-full max-w-2xl">
      {/* Ô Nhập Liệu */}
      <div className="relative">
        <input
          type="text"
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
          placeholder="Tìm kiếm bài viết..."
          className="w-full rounded-lg border border-[#dcd3c2] bg-[#f6f2e9]/80 py-3.5 pl-11 pr-10 font-sans text-sm text-[#4e290f] placeholder-[#947e6b] shadow-inner transition-all focus:border-[#8b5a2b] focus:bg-[#fcfaf5] focus:outline-none focus:ring-2 focus:ring-[#8b5a2b]/15"
        />
        <svg className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-[#8b5a2b]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path>
        </svg>
        {isSearching && (
          <div className="absolute right-4 top-1/2 h-4 w-4 -translate-y-1/2 animate-spin rounded-full border-2 border-[#8b5a2b] border-t-transparent"></div>
        )}
      </div>

      {/* Hộp xổ xuống chứa Kết quả */}
      {isOpen && searchTerm && (
        <div className="absolute top-full mt-2 max-h-[60vh] w-full overflow-y-auto overflow-hidden rounded-xl border border-[#dcd3c2] bg-[#fcfaf5] shadow-[0_15px_35px_rgba(78,41,15,0.12)]">
          {results.length > 0 ? (
            <ul className="divide-y divide-[#ede6d8]">
              {results.map((post) => (
                <li key={post.id}>
                  <Link 
                    href={`/post/${post.slug}`}
                    onClick={() => setIsOpen(false)}
                    className="flex flex-col items-start p-4 transition-colors hover:bg-[#f3ede0] sm:flex-row sm:items-center"
                  >
                    <div className="flex-grow">
                      <h4 className="mb-1 font-serif text-base font-bold text-[#4e290f]">{post.title}</h4>
                      <p className="flex items-center font-sans text-xs text-[#947e6b]">
                        <svg className="mr-1.5 h-3 w-3 text-[#b48a62]" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z"></path>
                        </svg>
                        {new Date(post.createdAt).toLocaleDateString("vi-VN")}
                      </p>
                    </div>
                  </Link>
                </li>
              ))}
            </ul>
          ) : (
            <div className="p-6 text-center font-sans text-sm text-[#6e5a49]">
              Không tìm thấy bài viết nào phù hợp.
            </div>
          )}
        </div>
      )}

      {/* Lớp phủ đóng hộp tìm kiếm khi click ra ngoài */}
      {isOpen && (
        <div className="fixed inset-0 -z-10" onClick={() => setIsOpen(false)}></div>
      )}
    </div>
  );
}