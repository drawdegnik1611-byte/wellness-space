import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    
    if (!token) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret");
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = (payload.id || payload.userId) as string;

    // Tìm thông tin User để lấy Email
    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "User không tồn tại" }, { status: 404 });

    // Lấy toàn bộ đơn hàng có email trùng với email của User
    // Bao gồm cả danh sách sản phẩm bên trong để hiển thị
    const orders = await prisma.order.findMany({
      where: { customerEmail: user.email },
      orderBy: { createdAt: 'desc' }, // Sắp xếp đơn mới nhất lên đầu
      include: {
        orderItems: {
          include: { product: true }
        }
      }
    });

    return NextResponse.json({ success: true, orders });
  } catch (error) {
    console.error("Lỗi lấy lịch sử đơn hàng:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}