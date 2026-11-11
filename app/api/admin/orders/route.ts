import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const orders = await prisma.order.findMany({
      orderBy: { createdAt: "desc" },
      include: {
        orderItems: {
          include: {
            product: {
              select: { title: true, coverImage: true, sku: true }
            }
          }
        }
      }
    });
    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Lỗi lấy đơn hàng:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function PATCH(req: Request) {
  try {
    const { orderId, status } = await req.json();
    
    // ==========================================
    // TRANSACTION KIỂM SOÁT HOÀN KHO (RESTOCK)
    // ==========================================
    const updatedOrder = await prisma.$transaction(async (tx) => {
      
      // Lấy trạng thái CŨ của đơn hàng
      const currentOrder = await tx.order.findUnique({
        where: { id: orderId },
        include: { orderItems: true }
      });

      if (!currentOrder) throw new Error("Không tìm thấy đơn hàng.");

      // LOGIC 1: Đổi thành HỦY -> Cộng lại kho (Chỉ cộng nếu trạng thái cũ không phải là Hủy)
      if (status === "CANCELLED" && currentOrder.status !== "CANCELLED") {
        for (const item of currentOrder.orderItems) {
          await tx.product.update({
            where: { id: item.productId },
            data: { inStock: { increment: item.quantity } }
          });
        }
      }

      // LOGIC 2: Đổi từ HỦY sang BÌNH THƯỜNG (CTV lỡ tay) -> Trừ lại kho
      if (currentOrder.status === "CANCELLED" && status !== "CANCELLED") {
        for (const item of currentOrder.orderItems) {
          // Kiểm tra xem kho còn đủ để khôi phục đơn này không
          const product = await tx.product.findUnique({ where: { id: item.productId } });
          if (!product || product.inStock < item.quantity) {
             throw new Error(`Sản phẩm "${product?.title || ''}" không đủ hàng để khôi phục đơn.`);
          }

          await tx.product.update({
            where: { id: item.productId },
            data: { inStock: { decrement: item.quantity } }
          });
        }
      }

      // Cập nhật trạng thái mới
      return await tx.order.update({
        where: { id: orderId },
        data: { status }
      });
    });
    
    return NextResponse.json({ success: true, order: updatedOrder });
  } catch (error: any) {
    console.error("Lỗi cập nhật đơn hàng:", error);
    // Báo lỗi (VD: không đủ hàng để khôi phục đơn) ra màn hình Admin
    return NextResponse.json({ error: error.message || "Lỗi hệ thống" }, { status: 400 });
  }
}