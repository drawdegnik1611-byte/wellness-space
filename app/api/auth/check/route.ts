import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import prisma from "@/lib/prisma";

export async function GET() {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;

    if (!token) return NextResponse.json({ success: false });

    // Giải mã thẻ Token bằng "Con dấu đỏ"
    const secret = new TextEncoder().encode(process.env.JWT_SECRET);
    const { payload } = await jose.jwtVerify(token, secret);

    // Linh hoạt tìm User bằng ID hoặc Email (tùy xem token cũ của bạn mã hóa cái gì)
    const userId = (payload.id || payload.userId) as string;
    const userEmail = payload.email as string;

    let user = null;
    if (userId) {
      user = await prisma.user.findUnique({ where: { id: userId } });
    } else if (userEmail) {
      user = await prisma.user.findUnique({ where: { email: userEmail } });
    }

    if (!user) return NextResponse.json({ success: false });

    return NextResponse.json({
      success: true,
      user: {
        name: user.name,
        email: user.email,
        role: user.role,
        avatar: user.avatar, // <-- ĐÃ BỔ SUNG TRƯỜNG NÀY ĐỂ FRONTEND NHẬN ĐƯỢC ẢNH
      },
    });
  } catch (error) {
    console.error("Lỗi xác thực Token:", error);
    return NextResponse.json({ success: false });
  }
}