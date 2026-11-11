import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const product = await prisma.product.findUnique({ where: { id } });
    if (!product) return NextResponse.json({ error: "Không tìm thấy sách" }, { status: 404 });
    return NextResponse.json({ success: true, product });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();
    
    const updatedProduct = await prisma.product.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        sku: body.sku, // Thêm cập nhật mã hàng
        category: body.category, // Thêm cập nhật chuyên mục
        price: parseInt(body.price) || 0,
        discount: parseInt(body.discount) || 0, // Thêm cập nhật chiết khấu
        inStock: parseInt(body.inStock) || 0, // Đảm bảo ép kiểu số nguyên
        coverImage: body.coverImage,
        description: body.description,
      },
    });
    
    return NextResponse.json({ success: true, product: updatedProduct });
  } catch (error) {
    console.error("Lỗi cập nhật sách:", error);
    return NextResponse.json({ error: "Không thể cập nhật" }, { status: 500 });
  }
}

export async function DELETE(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await prisma.product.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (error) {
    return NextResponse.json({ error: "Không thể xóa" }, { status: 500 });
  }
}