import prisma from "@/lib/prisma";
import { NextResponse } from "next/server";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    
    // 1. Hứng ĐẦY ĐỦ các trường mới thêm
    const { 
      title, 
      slug, 
      sku, 
      category, 
      price, 
      discount, 
      inStock, 
      coverImage, 
      description 
    } = body;

    // 2. Kiểm tra các trường bắt buộc (Tùy chọn nhưng nên có)
    if (!title || !slug || !sku) {
      return NextResponse.json({ error: "Thiếu thông tin bắt buộc" }, { status: 400 });
    }

    // 3. Truyền đủ dữ liệu vào Prisma
    const newProduct = await prisma.product.create({
      data: {
        title,
        slug,
        sku,
        category: category || "Tủ sách",
        price: parseInt(price) || 0,
        discount: parseInt(discount) || 0,
        inStock: parseInt(inStock) || 0,
        coverImage,
        description,
      },
    });

    return NextResponse.json({ success: true, product: newProduct });
  } catch (error) {
    console.error("Lỗi tạo sách:", error);
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}