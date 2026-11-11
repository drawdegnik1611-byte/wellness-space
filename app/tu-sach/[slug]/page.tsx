import prisma from "@/lib/prisma";
import { notFound } from "next/navigation";
import Link from "next/link";
import AddToCartButton from "@/components/shop/AddToCartButton";

type ProductDetailPageProps = {
    params: Promise<{ slug: string }>;
};

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
    const { slug } = await params;

    // 1. Lấy thông tin sách hiện tại
    const currentProduct = await prisma.product.findUnique({
        where: { slug: slug },
    });

    
const getStockStatus = (stock: number) => {
    if (stock === 0) {
        return (
            <span className="rounded-md bg-red-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-red-600">
                Hết hàng
            </span>
        );
    }

    if (stock < 5) {
        return (
            <span className="animate-pulse rounded-md bg-amber-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-amber-600">
                Sắp hết hàng
            </span>
        );
    }

    return (
        <span className="rounded-md bg-green-100 px-2 py-0.5 text-xs font-bold uppercase tracking-wider text-green-600">
            Còn hàng
        </span>
    );
};


    // Nếu không tìm thấy sách -> Chuyển hướng về trang 404
    if (!currentProduct) {
        notFound();
    }

    // 2. Tìm các sách tương tự cùng chuyên mục (loại trừ sách đang xem)
    const similarProducts = await prisma.product.findMany({
        where: {
            category: currentProduct.category,
            id: { not: currentProduct.id },
        },
        take: 4,
        orderBy: { createdAt: "desc" },
    });

    const discount = currentProduct.discount || 0;
    const finalPrice = currentProduct.price * (1 - discount / 100);

    return (
        <main className="min-h-screen bg-[#f8fafc] px-4 pb-24 pt-32 sm:px-6 lg:px-8 font-sans">
            <div className="mx-auto flex max-w-7xl flex-col gap-12">

                {/* Nút quay lại */}
                <div>
                    <Link href="/tu-sach" className="inline-flex items-center gap-2 font-sans text-xs font-bold uppercase tracking-widest text-slate-500 transition-colors hover:text-sky-600">
                        <span>←</span> Quay lại Tủ sách
                    </Link>
                </div>

                {/* THÔNG TIN CHI TIẾT SÁCH */}
                <div className="grid grid-cols-1 gap-12 md:grid-cols-2">
                    {/* Cột Ảnh bìa */}
                    <div className="flex justify-center rounded-[2rem] border border-white/60 bg-white/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
                        <div className="aspect-[3/4] w-full max-w-sm overflow-hidden rounded-2xl shadow-lg">
                            {currentProduct.coverImage ? (
                                <img src={currentProduct.coverImage} alt={currentProduct.title} className="h-full w-full object-cover" />
                            ) : (
                                <div className="flex h-full w-full items-center justify-center bg-slate-200 text-slate-400">Không có ảnh</div>
                            )}
                        </div>
                    </div>

                    {/* Cột Nội dung */}
                    <div className="flex flex-col justify-center gap-6">
                        <span className="inline-block w-fit rounded-full border border-sky-200 bg-sky-50 px-4 py-1.5 font-sans text-xs font-bold uppercase tracking-widest text-sky-600 shadow-sm">
                            {currentProduct.category}
                        </span>

                        <h1 className="font-sans text-4xl font-extrabold tracking-tight text-slate-900 md:text-5xl">
                            {currentProduct.title}
                        </h1>

                        <div className="flex items-center gap-4">
                            <span className="font-sans text-3xl font-extrabold text-slate-900">
                                {finalPrice.toLocaleString("vi-VN")}đ
                            </span>
                            {discount > 0 && (
                                <span className="font-sans text-xl font-medium text-slate-400 line-through">
                                    {currentProduct.price.toLocaleString("vi-VN")}đ
                                </span>
                            )}
                        </div>

                        <div className="flex items-center gap-3">
                            <span className="font-sans text-sm font-bold text-slate-500">Mã hàng: <span className="text-slate-900">{currentProduct.sku}</span></span>
                            <span className="text-slate-300">•</span>
                            <span className="font-sans text-sm font-bold text-slate-500 flex items-center gap-2">
                                Trạng thái: {getStockStatus(currentProduct.inStock)}
                            </span>
                        </div>
                        <div
                            className="prose prose-slate mt-4 max-w-none font-sans"
                            dangerouslySetInnerHTML={{ __html: currentProduct.description || "Chưa có mô tả cho cuốn sách này." }}
                        />

                        {/* Nút Thêm vào giỏ (Đã tích hợp sẵn bộ chọn số lượng bên trong component AddToCartButton) */}
                        <div className="mt-4 w-full max-w-md">
                            <AddToCartButton
                                product={{
                                    id: currentProduct.id,
                                    title: currentProduct.title,
                                    price: currentProduct.price,
                                    discount: discount,
                                    coverImage: currentProduct.coverImage || "",
                                    inStock: currentProduct.inStock,
                                }}
                            />
                        </div>
                    </div>
                </div>

                {/* KHU VỰC SÁCH TƯƠNG TỰ */}
                {similarProducts.length > 0 && (
                    <div className="mt-12">
                        <h3 className="mb-8 font-sans text-2xl font-extrabold tracking-tight text-slate-900">Sách cùng chuyên mục</h3>
                        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
                            {similarProducts.map((book) => {
                                const bDiscount = book.discount || 0;
                                const bFinalPrice = book.price * (1 - bDiscount / 100); // ĐÃ FIX LỖI TOÁN HỌC Ở ĐÂY

                                return (
                                    <Link key={book.id} href={`/tu-sach/${book.slug}`} className="group flex flex-col rounded-[2rem] border border-white/60 bg-white/40 p-4 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl transition-all hover:-translate-y-1 hover:bg-white/60 hover:shadow-xl">
                                        <div className="aspect-[3/4] w-full overflow-hidden rounded-2xl bg-slate-200 shadow-inner">
                                            {book.coverImage && <img src={book.coverImage} alt={book.title} className="h-full w-full object-cover transition-transform duration-500 group-hover:scale-105" />}
                                        </div>
                                        <div className="mt-4 flex flex-1 flex-col gap-1 px-2">
                                            <span className="font-sans text-[10px] font-bold uppercase tracking-widest text-sky-600">{book.category}</span>
                                            <h4 className="line-clamp-2 font-sans text-base font-bold text-slate-900 transition-colors group-hover:text-sky-600">{book.title}</h4>
                                            <div className="mt-auto pt-2 flex items-center gap-2">
                                                <span className="font-sans text-sm font-extrabold text-slate-900">{bFinalPrice.toLocaleString("vi-VN")}đ</span>
                                                {bDiscount > 0 && <span className="font-sans text-[10px] font-medium text-slate-400 line-through">{book.price.toLocaleString("vi-VN")}đ</span>}
                                            </div>
                                        </div>
                                    </Link>
                                );
                            })}
                        </div>
                    </div>
                )}
            </div>
        </main>
    );
}