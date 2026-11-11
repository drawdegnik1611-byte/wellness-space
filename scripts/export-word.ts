import { PrismaClient } from "@prisma/client";
import fs from "fs";
import HTMLToDOCX from "html-to-docx";
import axios from "axios";

const prisma = new PrismaClient();

async function exportToWordWithImages() {
  try {
    console.log("⏳ Đang gom dữ liệu từ Database...");
    const posts = await prisma.post.findMany({ orderBy: { createdAt: "asc" } });

    const CHUNK_SIZE = 250;
    const totalChunks = Math.ceil(posts.length / CHUNK_SIZE);

    console.log(`📑 Tổng cộng ${posts.length} bài. Sẽ xuất thành ${totalChunks} Tập.`);

    for (let i = 0; i < totalChunks; i++) {
      const chunkPosts = posts.slice(i * CHUNK_SIZE, (i + 1) * CHUNK_SIZE);
      console.log(`\n======================================================`);
      console.log(`📦 ĐANG XỬ LÝ TẬP ${i + 1}/${totalChunks}...`);
      console.log(`======================================================`);

      let fullHtml = `<html><head><meta charset="utf-8"></head><body>`;
      let postCounter = 1;

      for (const post of chunkPosts) {
        process.stdout.write(`  [${postCounter}/${chunkPosts.length}] Đang xử lý: ${post.title.substring(0, 45).padEnd(45, ' ')} `);

        let htmlContent = post.content;
        
        // 1. Dọn dẹp iframe, video
        htmlContent = htmlContent.replace(/<iframe[^>]*>.*?<\/iframe>/gi, "");
        htmlContent = htmlContent.replace(/<video[^>]*>.*?<\/video>/gi, "");

        // 2. TẨY RỬA CSS RÁC: Xóa sạch style, class của các thẻ văn bản để chống lỗi createFont
        htmlContent = htmlContent.replace(/<(p|span|div|h[1-6]|a|li|ul|ol|table|tr|td|th)([^>]*)>/gi, (match, p1, p2) => {
            // Giữ lại href cho thẻ <a>, còn lại xóa hết thuộc tính
            if (p1.toLowerCase() === 'a') {
                const hrefMatch = p2.match(/href=["'][^"']*["']/i);
                return hrefMatch ? `<${p1} ${hrefMatch[0]}>` : `<${p1}>`;
            }
            return `<${p1}>`;
        });

        // 3. Xử lý Ảnh
        const imgTags = htmlContent.match(/<img[^>]*>/gi) || [];
        let imgCount = 0;

        for (const imgTag of imgTags) {
          let newTag = '<p>[Ảnh trên web cũ bị lỗi định dạng]</p>';
          
          const srcMatch = imgTag.match(/src=["']([^"']+)["']/i);
          if (srcMatch && srcMatch[1]) {
            let src = srcMatch[1].trim();

            try {
              if (src.startsWith('data:')) {
                if (/^data:image\/(jpeg|png|gif|bmp);base64,/i.test(src)) {
                  newTag = `<img src="${src}" />`;
                  imgCount++;
                }
              } else {
                if (src.startsWith('/')) {
                  src = 'https://www.dohongngoc.com' + src;
                }

                if (src.startsWith('http')) {
                  const response = await axios.get(src, { responseType: 'arraybuffer', timeout: 6000 });
                  
                  const rawType = String(response.headers['content-type'] || '').toLowerCase();
                  const cleanMime = rawType.split(';')[0].trim(); 
                  
                  const validMimes = ['image/jpeg', 'image/png', 'image/gif', 'image/bmp'];
                  
                  if (validMimes.includes(cleanMime)) {
                    const base64 = Buffer.from(response.data).toString('base64');
                    if (base64.length > 0) {
                      newTag = `<img src="data:${cleanMime};base64,${base64}" />`;
                      imgCount++;
                    }
                  }
                }
              }
            } catch (e) {
              // Lỗi mạng hoặc 404
            }
          }
          htmlContent = htmlContent.replace(imgTag, newTag);
        }

        console.log(`-> (${imgCount} ảnh)`); 

        fullHtml += `<h1>${post.title}</h1>`;
        fullHtml += `<p><em>Ngày đăng: ${post.createdAt.toLocaleDateString('vi-VN')}</em></p><hr>`;
        fullHtml += htmlContent;
        fullHtml += `<br clear="all" style="page-break-before:always" />`;
        
        postCounter++;
      }

      // 🧹 QUÉT RÁC LẦN CUỐI: Xóa img lỗi
      fullHtml = fullHtml.replace(/<img[^>]*>/gi, (match) => {
        if (match.includes('src="data:image/')) return match; 
        return ''; 
      });

      fullHtml += `</body></html>`;

      console.log(`\n⚙️ Đang đóng gói TẬP ${i + 1} thành Word... (Sẽ mất khoảng 10-30 giây)`);
      const fileBuffer = await HTMLToDOCX(fullHtml, null, {
        title: `Tuyển Tập Bác Sĩ Ngọc - Tập ${i + 1}`,
        margins: { top: 1440, right: 1440, bottom: 1440, left: 1440 },
      });

      fs.writeFileSync(`Tuyen_Tap_Bac_Si_Ngoc_Tap_${i + 1}.docx`, fileBuffer);
      console.log(`✅ Đã lưu thành công: Tuyen_Tap_Bac_Si_Ngoc_Tap_${i + 1}.docx\n`);
    }

    console.log("\n🎉 HOÀN TẤT TẤT CẢ! Đã xuất xong bộ Tuyển tập kèm hình ảnh.");
  } catch (error) {
    console.error("\n❌ Có lỗi:", error);
  } finally {
    await prisma.$disconnect();
  }
}

exportToWordWithImages();