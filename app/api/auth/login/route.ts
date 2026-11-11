import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { SignJWT } from "jose";

// Lấy Secret key từ môi trường (Bạn có thể thêm biến JWT_SECRET vào file .env)
const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "khoa-bi-mat-cua-bac-si-ngoc-2026");

export async function POST(req: Request) {
  const { email, password } = await req.json();
  const user = await prisma.user.findUnique({ where: { email } });

  if (!user || !(await bcrypt.compare(password, user.password))) {
    return NextResponse.json({ error: "Sai email hoặc mật khẩu!" }, { status: 401 });
  }

  // Tạo thẻ JWT
  const token = await new SignJWT({ id: user.id, role: user.role })
    .setProtectedHeader({ alg: "HS256" })
    .setExpirationTime("7d") // Đăng nhập lưu 7 ngày
    .sign(SECRET);

  const res = NextResponse.json({ success: true, role: user.role });
  
  // Gắn token vào HTTP-Only Cookie (Bảo mật tuyệt đối, chống XSS)
  res.cookies.set("token", token, { httpOnly: true, secure: process.env.NODE_ENV === "production", path: "/" });
  return res;
}