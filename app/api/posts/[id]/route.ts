import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    // Lấy bài viết kèm theo toàn bộ lịch sử của nó (sắp xếp mới nhất xếp trước)
    const post = await prisma.post.findUnique({ 
      where: { id },
      include: { revisions: { orderBy: { savedAt: 'desc' } } } 
    });
    if (!post) return NextResponse.json({ error: "Không tìm thấy" }, { status: 404 });
    return NextResponse.json({ success: true, post });
  } catch (error) {
    return NextResponse.json({ error: "Lỗi hệ thống" }, { status: 500 });
  }
}

export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await request.json();

    // 1. Lấy bài viết cũ hiện tại ra
    const oldPost = await prisma.post.findUnique({ where: { id } });
    
    // 2. Chép nội dung cũ vào bảng Lịch sử (PostRevision)
    if (oldPost) {
      await prisma.postRevision.create({
        data: {
          postId: id,
          title: oldPost.title,
          content: oldPost.content,
        }
      });
    }

    // 3. Cập nhật bài viết với nội dung mới
    const updatedPost = await prisma.post.update({
      where: { id },
      data: {
        title: body.title,
        slug: body.slug,
        category: body.category,
        coverImage: body.coverImage,
        showCover: body.showCover,
        excerpt: body.excerpt,
        content: body.content,
      },
    });

    return NextResponse.json({ success: true, post: updatedPost });
  } catch (error) {
    return NextResponse.json({ error: "Không thể cập nhật" }, { status: 500 });
  }
}