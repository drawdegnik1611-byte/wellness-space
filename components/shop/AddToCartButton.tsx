
"use client";

import { useState, type MouseEvent } from "react";
import { useCartStore } from "@/store/useCartStore";

type AddToCartProps = {
  product: {
    id: string;
    title: string;
    price: number;
    discount: number;
    coverImage: string;
    inStock: number;
  };
};

export default function AddToCartButton({
  product,
}: AddToCartProps) {
  const addItem = useCartStore((state) => state.addItem);

  const [quantity, setQuantity] = useState(1);

  const stockLimit = Math.max(
    0,
    Math.floor(product.inStock)
  );

  const isOutOfStock = stockLimit <= 0;
  const isLowStock = stockLimit > 0 && stockLimit < 5;

  // Đảm bảo số lượng đang chọn luôn phù hợp với tồn kho
  const safeQuantity = isOutOfStock
    ? 0
    : Math.min(quantity, stockLimit);

  // Giảm số lượng
  const handleDecrease = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setQuantity((current) => Math.max(1, current - 1));
  };

  // Tăng số lượng
  const handleIncrease = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    setQuantity((current) =>
      Math.min(stockLimit, current + 1)
    );
  };

  // Thêm vào giỏ hàng
  const handleAddToCart = (e: MouseEvent<HTMLButtonElement>) => {
    e.preventDefault();
    e.stopPropagation();

    if (isOutOfStock) return;

    const addedQuantity = addItem(product, safeQuantity);

    // Không thể thêm vì giỏ đã đạt giới hạn tồn kho
    if (addedQuantity === 0) {
      alert(
        `"${product.title}" đã đạt giới hạn tồn kho trong giỏ hàng.`
      );
      return;
    }

    // Kho không đủ đáp ứng toàn bộ số lượng khách chọn
    if (addedQuantity < safeQuantity) {
      alert(
        `Kho hiện chỉ có thể bổ sung ${addedQuantity} cuốn "${product.title}". Đã thêm ${addedQuantity} cuốn vào giỏ hàng.`
      );
      return;
    }

    alert(
      `Đã thêm ${addedQuantity} cuốn "${product.title}" vào giỏ hàng!`
    );
  };

  return (
    <div className="mt-4 w-full space-y-4">

      {/* BỘ CHỌN SỐ LƯỢNG */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-col gap-1">
          <span className="font-sans text-sm font-bold text-slate-700">
            Số lượng
          </span>

          {/* Chỉ hiển thị khi tồn kho dưới 5 */}
          {isLowStock && (
            <span className="font-sans text-xs font-semibold text-amber-600">
              Sắp hết hàng
            </span>
          )}
        </div>

        <div
          className={`inline-flex h-12 items-center overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm ${
            isOutOfStock ? "opacity-50" : ""
          }`}
        >
          {/* Nút giảm */}
          <button
            type="button"
            onClick={handleDecrease}
            disabled={isOutOfStock || safeQuantity <= 1}
            aria-label="Giảm số lượng"
            className="flex h-full w-12 items-center justify-center text-xl font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            −
          </button>

          {/* Số lượng hiện tại */}
          <span
            aria-live="polite"
            className="flex h-full min-w-12 items-center justify-center border-x border-slate-200 px-3 font-sans text-base font-extrabold text-slate-900"
          >
            {safeQuantity}
          </span>

          {/* Nút tăng */}
          <button
            type="button"
            onClick={handleIncrease}
            disabled={isOutOfStock || safeQuantity >= stockLimit}
            aria-label="Tăng số lượng"
            className="flex h-full w-12 items-center justify-center text-xl font-bold text-slate-600 transition-colors hover:bg-slate-100 disabled:cursor-not-allowed disabled:text-slate-300"
          >
            +
          </button>
        </div>
      </div>

      {/* NÚT THÊM VÀO GIỎ */}
      <button
        type="button"
        onClick={handleAddToCart}
        disabled={isOutOfStock}
        className={`flex w-full items-center justify-center gap-2 rounded-xl py-3.5 font-sans text-sm font-bold uppercase tracking-widest transition-all ${
          isOutOfStock
            ? "cursor-not-allowed bg-slate-100 text-slate-400"
            : "bg-slate-900 text-white shadow-lg hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-sky-200 active:translate-y-0"
        }`}
      >
        <svg
          className="h-5 w-5"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth="2"
            d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z"
          />
        </svg>

        {isOutOfStock ? "Hết hàng" : "Thêm vào giỏ hàng"}
      </button>

      {/* Chỉ hiển thị số lượng khách đang chọn */}
      {!isOutOfStock && (
        <p className="text-center font-sans text-xs text-slate-400">
          Số lượng: {safeQuantity} cuốn
        </p>
      )}
    </div>
  );
}
