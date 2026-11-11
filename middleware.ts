import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { jwtVerify } from 'jose'

const SECRET = new TextEncoder().encode(process.env.JWT_SECRET || "khoa-bi-mat-chung-cua-he-thong");

export async function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value;
  const isAdminRoute = request.nextUrl.pathname.startsWith('/admin');

  // Chỉ can thiệp nếu cố tình vào khu vực /admin
  if (isAdminRoute) {
    if (!token) {
      // Chưa đăng nhập -> Trả về cổng login chung
      return NextResponse.redirect(new URL('/login', request.url));
    }

    try {
      // Giải mã token để lấy role
      const { payload } = await jwtVerify(token, SECRET);
      
      // Nếu có token nhưng chỉ là USER quèn -> Trả về trang chủ, không cho vào
      if (payload.role !== "ADMIN") {
        return NextResponse.redirect(new URL('/', request.url));
      }
    } catch (error) {
      // Token lỗi hoặc hết hạn -> Trả về login
      return NextResponse.redirect(new URL('/login', request.url));
    }
  }

  // Các trang khác (Trang chủ, login, giỏ hàng...) -> Cho đi qua thoải mái
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*'], 
}