import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import { sendEmail } from "@/lib/mail";
import { generateOrderConfirmationEmail } from "@/lib/emailTemplates";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { 
      customerName, customerEmail, customerPhone, address, city, note,
      items, voucherCode, paymentMethod 
    } = body;

    const subTotal = items.reduce((sum: number, item: any) => sum + (item.price * item.quantity), 0);
    
    // Tính phí vận chuyển (Chống can thiệp từ Client)
    const isHCM = city === "Thành phố Hồ Chí Minh";
    const shippingFee = isHCM ? 20000 : 35000;

    const discount = voucherCode === "HONGNGOC" ? 20000 : 0;
    const totalAmount = Math.max(0, subTotal + shippingFee - discount);

    // ==========================================
    // TRANSACTION: TẠO ĐƠN & TRỪ KHO ĐỒNG THỜI
    // ==========================================
    const newOrder = await prisma.$transaction(async (tx) => {
      // 1. Kiểm tra tồn kho
      for (const item of items) {
        const product = await tx.product.findUnique({ where: { id: item.productId } });
        if (!product) throw new Error("Không tìm thấy sản phẩm trong hệ thống.");
        if (product.inStock < item.quantity) {
          throw new Error(`Sách "${product.title}" chỉ còn ${product.inStock} cuốn trong kho.`);
        }
      }

      // 2. Tạo đơn hàng và LẤY LUÔN THÔNG TIN TÊN SÁCH (include: product)
      const order = await tx.order.create({
        data: {
          customerName, customerEmail, customerPhone, address, note,
          subTotal, shippingFee, discount, totalAmount,
          paymentMethod: paymentMethod || "QR",
          status: "PENDING",
          orderItems: {
            create: items.map((item: any) => ({
              productId: item.productId,
              quantity: item.quantity,
              price: item.price,
            })),
          },
        },
        include: {
          orderItems: {
            include: { product: true } 
          }
        }
      });

      // 3. Trừ số lượng tồn kho
      for (const item of items) {
        await tx.product.update({
          where: { id: item.productId },
          data: { inStock: { decrement: item.quantity } }
        });
      }

      return order;
    });

    const shortOrderId = newOrder.id.slice(0, 8).toUpperCase(); 

    // Gọi hàm tạo Template Email từ file lib
    const emailHtml = generateOrderConfirmationEmail({
      shortOrderId,
      customerName,
      customerPhone,
      address, // fullAddress đã được khách hàng ghép sẵn từ fontend truyền vào
      note,
      items: newOrder.orderItems,
      subTotal,
      shippingFee,
      discount,
      totalAmount
    });

    // ==========================================
    // GỬI EMAIL AN TOÀN
    // ==========================================
    try {
      await sendEmail(customerEmail, `Xác nhận đơn hàng #${shortOrderId}`, emailHtml);
    } catch (mailErr) {
      console.error("⚠️ LỖI GỬI EMAIL NHƯNG ĐƠN HÀNG ĐÃ LƯU:", mailErr);
    }

    return NextResponse.json({ success: true, orderId: newOrder.id });

  } catch (error: any) {
    console.error("❌ LỖI SẬP API CHECKOUT:", error);
    return NextResponse.json({ error: error.message || "Lỗi hệ thống máy chủ, vui lòng thử lại sau." }, { status: 400 });
  }
}