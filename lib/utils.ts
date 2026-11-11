// Hàm định dạng ngày tháng chuẩn Việt Nam (DD/MM/YYYY)
export function formatDate(date: Date | string) {
    return new Date(date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }
  
  // Hàm rút gọn văn bản (thích hợp làm mô tả ngắn cho bài viết)
  export function truncateText(text: string, maxLength: number) {
    if (!text) return "";
    if (text.length <= maxLength) return text;
    return text.substring(0, maxLength) + "...";
  }