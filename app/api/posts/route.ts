import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, slug, category, coverImage, excerpt, content } = body;

    // 1. Kiểm tra dữ liệu cơ bản
    if (!title || !slug || !content) {
      return NextResponse.json(
        { error: "Vui lòng nhập đủ Tiêu đề, Slug và Nội dung." },
        { status: 400 }
      );
    }

    // 2. Kiểm tra xem Slug (URL) đã tồn tại trong MySQL chưa
    const existingPost = await prisma.post.findUnique({
      where: { slug },
    });

    if (existingPost) {
      return NextResponse.json(
        { error: "Đường dẫn (Slug) này đã được sử dụng. Vui lòng đổi tiêu đề khác." },
        { status: 409 }
      );
    }

    // 3. Ghi dữ liệu vào database MySQL
    const newPost = await prisma.post.create({
      data: {
        title,
        slug,
        category,
        coverImage: coverImage || null,
        excerpt: excerpt || null,
        content,
      },
    });

    return NextResponse.json({ success: true, post: newPost }, { status: 201 });
  } catch (error) {
    console.error("Lỗi tạo bài viết:", error);
    return NextResponse.json(
      { error: "Có lỗi hệ thống khi lưu vào database." },
      { status: 500 }
    );
  }
}