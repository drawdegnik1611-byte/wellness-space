import { NextRequest, NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import Fuse from "fuse.js";

// Hàm tiện ích: Lột sạch dấu tiếng Việt (để người dùng gõ không dấu vẫn ra kết quả)
function removeAccents(str: string) {
  return str.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();
}

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q");

    if (!query) return NextResponse.json({ results: [] });

    // 1. Chỉ lấy đúng những trường cần thiết (title, slug, createdAt, coverImage)
    // Không lấy content để API chạy siêu tốc độ dù có hàng ngàn bài viết
    const posts = await prisma.post.findMany({
      select: {
        id: true,
        title: true,
        slug: true,
        createdAt: true,
        coverImage: true,
      },
    });

    // 2. Nhào nặn dữ liệu: Gắn thêm 1 trường "không dấu" để tìm kiếm dễ hơn
    const searchablePosts = posts.map((post) => ({
      ...post,
      normalizedTitle: removeAccents(post.title),
    }));

    // 3. Khởi tạo "Máy quét lỗi chính tả" Fuse.js
    const fuse = new Fuse(searchablePosts, {
      keys: ["title", "normalizedTitle"],
      includeScore: true, // Chấm điểm mức độ khớp
      threshold: 0.4,     // Độ "châm chước" cho lỗi chính tả (0.0 là phải tuyệt đối, 1.0 là sai bét cũng ra. 0.4 là mức hoàn hảo)
      ignoreLocation: true,
    });

    // 4. Tìm kiếm kết hợp (Tìm cả có dấu lẫn không dấu)
    const normalizedQuery = removeAccents(query);
    let results = fuse.search(query);
    
    // Nếu gõ có dấu mà sai bét, thử tìm lại bằng bản lột dấu
    if (results.length === 0) {
      results = fuse.search(normalizedQuery);
    }

    // 5. Trả về top 10 kết quả tốt nhất
    const topResults = results.slice(0, 10).map((res) => res.item);

    return NextResponse.json({ success: true, results: topResults });
  } catch (error: any) {
    return NextResponse.json({ success: false, error: error.message }, { status: 500 });
  }
}