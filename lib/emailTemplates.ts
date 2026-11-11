export const generateOrderConfirmationEmail = (data: {
    shortOrderId: string;
    customerName: string;
    customerPhone: string;
    address: string;
    note?: string | null;
    items: any[];
    subTotal: number;
    shippingFee: number;
    discount: number;
    totalAmount: number;
  }) => {
    const orderItemsHtml = data.items.map(item => `
      <tr>
        <td style="padding: 12px 8px; border-bottom: 1px dashed #e2e8f0; color: #334155;">
          <strong>${item.product.title}</strong>
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px dashed #e2e8f0; color: #64748b; text-align: center;">
          x${item.quantity}
        </td>
        <td style="padding: 12px 8px; border-bottom: 1px dashed #e2e8f0; color: #e11d48; text-align: right; font-weight: bold;">
          ${(item.price * item.quantity).toLocaleString("vi-VN")}đ
        </td>
      </tr>
    `).join("");
  
    const appUrl = process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000";
  
    return `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background-color: #ffffff; border: 1px solid #e2e8f0; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1);">
        
        <!-- HEADER -->
        <div style="background-color: #0f172a; padding: 30px; text-align: center;">
          <h1 style="color: #ffffff; margin: 0; font-size: 24px; letter-spacing: 1px;">XÁC NHẬN ĐƠN HÀNG</h1>
          <p style="color: #94a3b8; margin: 10px 0 0 0; font-size: 14px;">Mã đơn của bạn: <strong style="color: #38bdf8; font-size: 16px;">#${data.shortOrderId}</strong></p>
        </div>
  
        <!-- LỜI CẢM ƠN & LƯU Ý ADMIN -->
        <div style="padding: 30px; background-color: #f8fafc; border-bottom: 1px solid #e2e8f0;">
          <p style="margin: 0 0 15px 0; color: #334155; font-size: 16px; line-height: 1.5;">Chào <strong>${data.customerName}</strong>,</p>
          <p style="margin: 0 0 15px 0; color: #475569; font-size: 14px; line-height: 1.6;">Cảm ơn bạn đã tin tưởng và đặt hàng tại Wellness Space. Đơn hàng của bạn đã được hệ thống ghi nhận thành công.</p>
          
          <div style="background-color: #fffbeb; border-left: 4px solid #f59e0b; padding: 14px 16px; border-radius: 6px;">
            <p style="margin: 0; color: #b45309; font-size: 13px; line-height: 1.6;">
              <strong>⏱️ Quá trình kiểm duyệt:</strong> Đội ngũ Admin sẽ cần một chút thời gian để đối soát tình trạng thanh toán và xác nhận đơn hàng trước khi tiến hành đóng gói. Chúng tôi sẽ cố gắng giao sách đến bạn trong thời gian sớm nhất!
            </p>
          </div>
        </div>
  
        <!-- THÔNG TIN GIAO HÀNG & SẢN PHẨM -->
        <div style="padding: 30px;">
          
          <h3 style="color: #0f172a; margin: 0 0 15px 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Thông tin nhận hàng</h3>
          <div style="background-color: #f8fafc; padding: 16px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e2e8f0;">
            <p style="margin: 6px 0; color: #475569; font-size: 14px;"><strong>Người nhận:</strong> ${data.customerName}</p>
            <p style="margin: 6px 0; color: #475569; font-size: 14px;"><strong>Điện thoại:</strong> ${data.customerPhone}</p>
            <p style="margin: 6px 0; color: #475569; font-size: 14px;"><strong>Địa chỉ:</strong> ${data.address}</p>
            ${data.note ? `<p style="margin: 6px 0; color: #475569; font-size: 14px;"><strong>Ghi chú:</strong> <span style="color: #d97706;">${data.note}</span></p>` : ''}
          </div>
  
          <h3 style="color: #0f172a; margin: 0 0 15px 0; font-size: 15px; text-transform: uppercase; letter-spacing: 0.5px;">Chi tiết đơn hàng</h3>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 14px;">
            ${orderItemsHtml}
          </table>
  
          <!-- TỔNG TIỀN -->
          <div style="text-align: right; margin-bottom: 10px; border-bottom: 1px solid #e2e8f0; padding-bottom: 20px;">
            <p style="margin: 6px 0; color: #64748b; font-size: 14px;">Tạm tính: <strong>${data.subTotal.toLocaleString("vi-VN")}đ</strong></p>
            <p style="margin: 6px 0; color: #64748b; font-size: 14px;">Phí vận chuyển: <strong>${data.shippingFee === 0 ? 'Miễn phí' : data.shippingFee.toLocaleString("vi-VN") + 'đ'}</strong></p>
            <p style="margin: 6px 0; color: #059669; font-size: 14px;">Giảm giá Voucher: <strong>-${data.discount.toLocaleString("vi-VN")}đ</strong></p>
            <h2 style="margin: 15px 0 0 0; color: #e11d48; font-size: 20px;">Tổng thanh toán: ${data.totalAmount.toLocaleString("vi-VN")}đ</h2>
          </div>
        </div>
  
        <!-- FOOTER (LINK HỦY ĐƠN) -->
        <div style="background-color: #f8fafc; padding: 25px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="color: #64748b; font-size: 14px; margin: 0 0 15px 0;">Nếu bạn cần thay đổi thông tin hoặc muốn <strong>hủy đơn hàng</strong>, vui lòng nhấp vào liên kết bên dưới:</p>
          <a href="${appUrl}/orders" style="display: inline-block; background-color: #0f172a; color: #ffffff; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-size: 14px; font-weight: bold; letter-spacing: 0.5px;">Tra cứu / Hủy đơn hàng</a>
          <p style="color: #94a3b8; font-size: 12px; margin: 20px 0 0 0;">Cảm ơn bạn đã lựa chọn mua sắm cùng Wellness Space!</p>
        </div>
  
      </div>
    `;
  };