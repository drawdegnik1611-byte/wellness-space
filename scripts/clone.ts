import axios from "axios";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();
const WP_API_URL = "https://www.dohongngoc.com/web/wp-json/wp/v2/posts";

// Hàm tạo Slug
function createSlug(text: string) {
    return text.toString().toLowerCase()
        .replace(/\s+/g, '-')           
        .replace(/[àáạảãâầấậẩẫăằắặẳẵ]/g, "a")
        .replace(/[èéẹẻẽêềếệểễ]/g, "e")
        .replace(/[ìíịỉĩ]/g, "i")
        .replace(/[òóọỏõôồốộổỗơờớợởỡ]/g, "o")
        .replace(/[ùúụủũưừứựửữ]/g, "u")
        .replace(/[ỳýỵỷỹ]/g, "y")
        .replace(/đ/g, "d")
        .replace(/[^\w\-]+/g, '')       
        .replace(/\-\-+/g, '-')         
        .replace(/^-+/, '')             
        .replace(/-+$/, '');            
}

// Hàm dọn dẹp các ký tự HTML loằng ngoằng của WordPress
function decodeWpTitle(text: string) {
    return text
        .replace(/&#8211;/g, "-")
        .replace(/&#8212;/g, "--")
        .replace(/&#8220;/g, '"')
        .replace(/&#8221;/g, '"')
        .replace(/&#8216;/g, "'")
        .replace(/&#8217;/g, "'")
        .replace(/&#038;/g, "&")
        .replace(/&amp;/g, "&");
}

async function cloneAllData() {
  try {
    console.log("🚀 BẮT ĐẦU VÉT CẠN DỮ LIỆU TỪ TRANG BÁC SĨ NGỌC...");
    
    let page = 1;
    let hasMore = true;
    let totalSaved = 0;

    // Vòng lặp tự động lật trang (mỗi trang 100 bài)
    while (hasMore) {
      console.log(`\n⏳ Đang lấy dữ liệu TRANG ${page}...`);
      
      try {
        const response = await axios.get(`${WP_API_URL}?per_page=100&page=${page}&_embed`);
        const posts = response.data;

        if (posts.length === 0) {
          hasMore = false;
          break; // Hết bài rồi thì thoát vòng lặp
        }

        for (const wpPost of posts) {
          const title = decodeWpTitle(wpPost.title.rendered);
          const content = wpPost.content.rendered;
          
          let excerpt = "";
          if (wpPost.excerpt && wpPost.excerpt.rendered) {
            excerpt = decodeWpTitle(wpPost.excerpt.rendered.replace(/(<([^>]+)>)/gi, "").trim());
          }

          let slug = wpPost.slug || createSlug(title);
          
          let coverImage = null;
          if (wpPost._embedded && wpPost._embedded['wp:featuredmedia']) {
            coverImage = wpPost._embedded['wp:featuredmedia'][0].source_url;
          }

          const existingPost = await prisma.post.findUnique({ where: { slug: slug } });

          if (!existingPost) {
            await prisma.post.create({
              data: {
                title: title,
                slug: slug,
                content: content,
                excerpt: excerpt.length > 150 ? excerpt.substring(0, 150) + "..." : excerpt,
                category: "Tản văn", // Sẽ phân loại chuẩn sau nếu cần
                coverImage: coverImage,
                createdAt: new Date(wpPost.date),
              }
            });
            console.log(`✅ [Trang ${page}] Đã lưu: ${title.substring(0, 50)}...`);
            totalSaved++;
          }
        }
        
        page++; // Tiến sang trang tiếp theo

      } catch (err: any) {
         // Lỗi 400 của WP API thường báo hiệu đã vượt quá số trang hiện có (Hết bài)
         if (err.response && err.response.status === 400) {
             console.log(`\n🛑 Đã lấy hết toàn bộ bài viết trên web cũ!`);
             hasMore = false;
         } else {
             console.error(`❌ Lỗi khi tải trang ${page}:`, err.message);
             hasMore = false; // Dừng lại nếu gặp lỗi mạng nghiêm trọng
         }
      }
    }
    
    console.log(`\n🎉 HOÀN TẤT! Đã cào thành công TỔNG CỘNG ${totalSaved} bài viết mới vào Database.`);
  } catch (error: any) {
    console.error("❌ Có lỗi xảy ra:", error.message);
  } finally {
    await prisma.$disconnect();
  }
}

cloneAllData();