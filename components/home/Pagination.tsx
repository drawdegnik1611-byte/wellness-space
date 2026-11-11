import Link from "next/link";

type PaginationProps = {
  currentPage: number;
  totalPages: number;
};

export default function Pagination({
  currentPage,
  totalPages,
}: PaginationProps) {
  if (totalPages <= 1) return null;

  const previousPage = currentPage - 1;
  const nextPage = currentPage + 1;

  // Class dùng chung cho nút bấm
  const baseBtnClass = "inline-flex items-center gap-3 rounded-full border border-slate-200 bg-white px-6 py-3 font-sans text-sm font-bold text-slate-700 transition-all hover:border-slate-300 hover:bg-slate-50 hover:shadow-sm";
  const disabledBtnClass = "inline-flex items-center gap-3 rounded-full border border-slate-100 bg-slate-50 px-6 py-3 font-sans text-sm font-bold text-slate-300 cursor-not-allowed";

  return (
    <nav aria-label="Phân trang bài viết" className="mt-20 flex flex-wrap items-center justify-center gap-6">
      {/* Trang trước */}
      {currentPage > 1 ? (
        <Link href={`/?page=${previousPage}#bai-viet-moi`} className={baseBtnClass}>
          <span>←</span> Mới hơn
        </Link>
      ) : (
        <span className={disabledBtnClass}>
          <span>←</span> Mới hơn
        </span>
      )}

      {/* Số trang hiển thị trực quan */}
      <div className="flex flex-col items-center gap-1.5">
        <span className="font-sans text-sm font-bold text-slate-900">
          {currentPage} / {totalPages}
        </span>
      </div>

      {/* Trang tiếp */}
      {currentPage < totalPages ? (
        <Link href={`/?page=${nextPage}#bai-viet-moi`} className={baseBtnClass}>
          Cũ hơn <span>→</span>
        </Link>
      ) : (
        <span className={disabledBtnClass}>
          Cũ hơn <span>→</span>
        </span>
      )}
    </nav>
  );
}