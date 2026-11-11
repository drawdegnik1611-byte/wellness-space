import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";
import bcrypt from "bcryptjs";
import { sendEmail } from "@/lib/mail";

export async function POST(req: Request) {
  try {
    const { name, email, password } = await req.json();
    
    // Mã hóa mật khẩu
    const hashedPassword = await bcrypt.hash(password, 10);
    
    // Kiểm tra và cấp quyền ADMIN cho người đầu tiên
    const userCount = await prisma.user.count();
    const assignedRole = userCount === 0 ? "ADMIN" : "USER"; 
    
    // Lưu vào Database trước
    await prisma.user.create({
      data: { 
        name, 
        email, 
        password: hashedPassword, 
        role: assignedRole 
      }
    });

    // ==========================================
    // MODULE GỬI EMAIL CẢM ƠN (Chạy ngầm)
    // ==========================================
    const welcomeHtml = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; overflow: hidden; box-shadow: 0 4px 15px rgba(0,0,0,0.05); border: 1px solid #f1f5f9;">
        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 2px;">WELLNESS SPACE</h1>
        </div>
        <div style="padding: 40px 30px;">
          <h2 style="color: #0f172a; margin-top: 0;">Xin chào ${name},</h2>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Cảm ơn bạn đã trở thành một phần của <strong>Wellness Space</strong> - Góc an trú dành cho Thân, Tâm và Trí.</p>
          <p style="color: #475569; font-size: 16px; line-height: 1.6;">Tại đây, bạn có thể tìm thấy những tựa sách nuôi dưỡng tâm hồn và những bài tản văn nhẹ nhàng từ bác sĩ Đỗ Hồng Ngọc.</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="http://localhost:3000" style="background-color: #0284c7; color: #ffffff; text-decoration: none; padding: 14px 28px; border-radius: 8px; font-weight: bold; font-size: 15px; display: inline-block;">Khám phá Tủ sách ngay</a>
          </div>
          <hr style="border: none; border-top: 1px dashed #e2e8f0; margin: 30px 0;" />
          <p style="color: #64748b; font-size: 14px; margin: 0;">Chúc bạn một ngày thật an lành!</p>
        </div>
      </div>
    `;

    // Gọi hàm helper để gửi mail (chạy ngầm, không dùng await để tránh nghẽn luồng đăng ký)
    sendEmail(email, "Chào mừng bạn đến với Wellness Space!", welcomeHtml);
    
    return NextResponse.json({ success: true, role: assignedRole });
  } catch (error) {
    return NextResponse.json({ error: "Email này đã được sử dụng hoặc có lỗi xảy ra!" }, { status: 400 });
  }
}