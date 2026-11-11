import { NextResponse } from "next/server";
import { cookies } from "next/headers";
import * as jose from "jose";
import prisma from "@/lib/prisma";
import { v2 as cloudinary } from "cloudinary";

// 1. Cấu hình Cloudinary (Sử dụng đúng biến môi trường của bạn)
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

export async function POST(req: Request) {
  try {
    // 2. Xác thực người dùng qua Token
    const cookieStore = await cookies();
    const token = cookieStore.get("token")?.value;
    if (!token) return NextResponse.json({ error: "Chưa đăng nhập" }, { status: 401 });

    const secret = new TextEncoder().encode(process.env.JWT_SECRET || "fallback_secret");
    const { payload } = await jose.jwtVerify(token, secret);
    const userId = (payload.id || payload.userId) as string;

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: "Không tìm thấy User" }, { status: 404 });

    // 3. Nhận File ảnh từ Form (Giao diện gửi lên)
    const formData = await req.formData();
    const file = formData.get("avatar") as File;
    if (!file) return NextResponse.json({ error: "Không có file ảnh nào" }, { status: 400 });

    // 4. Chuyển File thành định dạng Base64 để bắn lên Cloudinary bằng API Backend
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    const fileUri = `data:${file.type};base64,${buffer.toString("base64")}`;

    // 5. TUYỆT CHIÊU GHI ĐÈ BẢO VỆ DUNG LƯỢNG CLOUD
    const uploadResponse = await cloudinary.uploader.upload(fileUri, {
      folder: "wellness_avatars", // Tự động tạo thư mục này trên Cloudinary
      public_id: `user_${userId}`, // ÉP DÙNG ID NGƯỜI DÙNG LÀM TÊN ẢNH
      overwrite: true,             // Trùng tên là tự động xóa ảnh cũ, đè ảnh mới
      invalidate: true,            // Bắt Cloudinary xóa cache CDN để web cập nhật hình ngay
    });

    // 6. Cập nhật đường link ảnh mới (từ Cloudinary) vào Database
    await prisma.user.update({
      where: { id: userId },
      data: { avatar: uploadResponse.secure_url }
    });

    return NextResponse.json({ success: true, avatar: uploadResponse.secure_url });

  } catch (error: any) {
    console.error("❌ LỖI UPLOAD AVATAR LÊN CLOUDINARY:", error);
    return NextResponse.json({ error: "Lỗi Cloudinary: " + error.message }, { status: 500 });
  }
}