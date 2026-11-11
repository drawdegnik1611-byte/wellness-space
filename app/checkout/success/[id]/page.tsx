import prisma from "@/lib/prisma";
import Link from "next/link";
import { notFound } from "next/navigation";

export default async function CheckoutSuccessPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const order = await prisma.order.findUnique({ where: { id } });

  if (!order) return notFound();

  const shortOrderId = order.id.slice(0, 8).toUpperCase();
  const isCOD = order.paymentMethod === "COD";
  
  // Nâng cấp: Đổi cú pháp nội dung chuyển khoản thành "Thanh toan [Mã đơn]" (Không dấu)
  const transferContent = `Thanh toan ${shortOrderId}`;
  
  const qrUrl = `https://img.vietqr.io/image/MB-09916112000-compact2.png?amount=${order.totalAmount}&addInfo=${encodeURIComponent(transferContent)}&accountName=DINH ANH QUAN`;

  return (
    <main className="relative flex min-h-screen items-center justify-center bg-slate-50 px-4 py-24 font-sans">
      <div className="pointer-events-none absolute h-[500px] w-[500px] rounded-full bg-emerald-200/40 mix-blend-multiply blur-3xl filter" />
      
      <div className="relative z-10 w-full max-w-2xl rounded-[2.5rem] border border-white/60 bg-white/60 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl sm:p-12 text-center">
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 text-emerald-500">
          <svg className="h-10 w-10" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7"></path></svg>
        </div>
        
        <h1 className="mb-2 text-2xl font-extrabold text-slate-900">Đặt hàng thành công!</h1>
        <p className="mb-8 text-slate-500">Mã đơn hàng của bạn là <strong className="text-slate-900">#{shortOrderId}</strong>. {isCOD ? "Sách sẽ được giao đến bạn sớm nhất." : "Vui lòng quét mã QR bên dưới để thanh toán."}</p>
        
        {/* NẾU LÀ QR THÌ HIỆN ẢNH QR */}
        {!isCOD && (
          <div className="mx-auto mb-8 max-w-[300px] overflow-hidden rounded-3xl border-4 border-white bg-white shadow-xl">
            <img src={qrUrl} alt="Mã thanh toán QR" className="w-full h-auto" />
          </div>
        )}

        <div className="mb-8 flex flex-col gap-2 rounded-2xl bg-sky-50 p-6 text-sm text-sky-900 border border-sky-100">
          {isCOD ? (
             <p><strong>Lưu ý:</strong> Vui lòng chuẩn bị số tiền <strong>{order.totalAmount.toLocaleString("vi-VN")}đ</strong> để thanh toán cho bưu tá khi nhận hàng.</p>
          ) : (
             <p><strong>Lưu ý:</strong> Đơn hàng sẽ tự động hủy nếu không nhận được thanh toán trong vòng 24 giờ. Vui lòng giữ nguyên nội dung chuyển khoản để hệ thống duyệt tự động.</p>
          )}
          <p>Một email xác nhận đã được gửi đến <strong>{order.customerEmail}</strong>.</p>
        </div>

        {/* Nâng cấp: Đổi Text linh hoạt và đưa thẳng về Trang Chủ */}
        <Link href="/" className="inline-flex h-12 items-center justify-center rounded-full bg-slate-900 px-8 font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:bg-emerald-600">
          {isCOD ? "Hoàn tất đặt hàng" : "Tôi đã hoàn tất thanh toán"}
        </Link>
      </div>
    </main>
  );
}