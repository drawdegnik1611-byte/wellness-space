import { NextRequest, NextResponse } from "next/server";
import mammoth from "mammoth";
import prisma from "@/lib/prisma";

function createSlug(text: string) {
  return text.toString().toLowerCase()
      .replace(/\s+/g, '-').replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
      .replace(/[èéẹẻẽêềếệểễ]/g, "e").replace(/[ìíịỉĩ]/g, "i")
      .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o").replace(/[ùúụủũưừứựửữ]/g, "u")
      .replace(/[ỳýỵỷỹ]/g, "y").replace(/đ/g, "d")
      .replace(/[^\w\-]+/g, '').replace(/\-\-+/g, '-')
      .replace(/^-+/, '').replace(/-+$/, '');            
}

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get("file") as File;
    if (!file) return NextResponse.json({ error: "Chưa chọn file" }, { status: 400 });

    // Đọc ruột file Word
    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);

    // Mammoth bóc tách HTML siêu sạch từ Word
    const result = await mammoth.convertToHtml({ buffer });
    const htmlContent = result.value; // Nội dung web
    
    // Mammoth bóc tách chữ thô (Raw text) để ta đoán Tiêu đề và Trích dẫn
    const rawTextResult = await mammoth.extractRawText({ buffer });
    const lines = (rawTextResult.value as string)
    .split('\n')
    .map((l: string) => l.trim())
    .filter((l: string) => l.length > 0);
    // Giả định: Dòng đầu tiên trong file Word là Tiêu đề
    const title = lines[0] || file.name.replace(".docx", "");
    // Cộng thêm mã thời gian để tránh slug bị trùng lặp
    const slug = createSlug(title) + "-" + Date.now().toString().slice(-6); 
    // Lấy đoạn văn thứ 2 làm tóm tắt
    const excerpt = lines.slice(1, 3).join(" ").substring(0, 150) + "...";

    // Lưu vào MySQL
    const post = await prisma.post.create({
      data: {
        title,
        slug,
        content: htmlContent,
        excerpt,
        category: "Tản văn",
      }
    });

    return NextResponse.json({ success: true, slug: post.slug });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}