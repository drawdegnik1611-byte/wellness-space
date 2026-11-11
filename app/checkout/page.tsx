"use client";

import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCartStore } from "@/store/useCartStore";

export default function CheckoutPage() {
  const router = useRouter();
  const [isMounted, setIsMounted] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  
  // Dùng cả Ref và State để khóa giao diện ngay khoảnh khắc đặt hàng thành công
  const isSubmittingRef = useRef(false);
  const [isOrderSuccess, setIsOrderSuccess] = useState(false);
  
  const { items, getTotalPrice, clearCart } = useCartStore();
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState("");

  // Lưu song song cả Mã (Code) để hiển thị đúng trên <select> và Tên (Name) để ghép địa chỉ
  const [formData, setFormData] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    cityCode: "",
    city: "",
    districtCode: "",
    district: "",
    wardCode: "",
    ward: "",
    street: "",
    addressType: "HOME", 
    paymentMethod: "QR", 
    note: "",
  });

  const [provinces, setProvinces] = useState<any[]>([]);
  const [districts, setDistricts] = useState<any[]>([]);
  const [wards, setWards] = useState<any[]>([]);

  // Phí Ship & Gợi ý địa chỉ số nhà
  const [shippingFee, setShippingFee] = useState(0);
  const [shippingTime, setShippingTime] = useState("");
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [isSearchingAddress, setIsSearchingAddress] = useState(false);
  const searchTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const suggestionBoxRef = useRef<HTMLDivElement>(null);

  const [voucherInput, setVoucherInput] = useState("");
  const [appliedVoucher, setAppliedVoucher] = useState("");
  const [discountAmount, setDiscountAmount] = useState(0);

  // Hàm tính phí ship theo tên Tỉnh/Thành
  const updateShippingByCity = (cityName: string) => {
    if (cityName.includes("Hồ Chí Minh")) {
      setShippingFee(20000);
      setShippingTime("1 - 2 ngày làm việc");
    } else if (cityName) {
      setShippingFee(35000);
      setShippingTime("3 - 5 ngày làm việc");
    } else {
      setShippingFee(0);
      setShippingTime("");
    }
  };

  useEffect(() => {
    setIsMounted(true);

    // 1. Khôi phục địa chỉ đã lưu từ lần đặt hàng trước (kể cả Tỉnh/Quận/Phường)
    const savedAddress = localStorage.getItem("wellness_address");
    if (savedAddress) {
      try {
        const parsed = JSON.parse(savedAddress);
        setFormData(prev => ({ ...prev, ...parsed }));
        if (parsed.city) {
          updateShippingByCity(parsed.city);
        }
        if (parsed.cityCode) {
          fetch(`https://provinces.open-api.vn/api/p/${parsed.cityCode}?depth=2`)
            .then(res => res.json())
            .then(data => setDistricts(data.districts || []))
            .catch(() => {});
        }
        if (parsed.districtCode) {
          fetch(`https://provinces.open-api.vn/api/d/${parsed.districtCode}?depth=2`)
            .then(res => res.json())
            .then(data => setWards(data.wards || []))
            .catch(() => {});
        }
      } catch (e) {}
    }

    // 2. Kiểm tra tài khoản đăng nhập
    fetch("/api/auth/check").then(res => res.json()).then(data => {
      if (data.success && data.user) {
        setIsLoggedIn(true);
        setFormData(prev => ({
          ...prev,
          customerName: data.user.name || prev.customerName,
          customerEmail: data.user.email || prev.customerEmail,
        }));
      }
    }).catch(() => {});

    // 3. Tải danh sách 63 Tỉnh/Thành
    fetch("https://provinces.open-api.vn/api/p/")
      .then(res => res.json())
      .then(data => setProvinces(data))
      .catch(console.error);

    // Đóng dropdown gợi ý khi click ra ngoài
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionBoxRef.current && !suggestionBoxRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleCityChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selectedProvince = provinces.find(p => String(p.code) === String(code));
    const name = selectedProvince ? selectedProvince.name : "";
    
    setFormData(prev => ({
      ...prev,
      cityCode: code,
      city: name,
      districtCode: "",
      district: "",
      wardCode: "",
      ward: "",
    }));
    setDistricts([]);
    setWards([]);
    
    updateShippingByCity(name);

    if (!code) return;
    const res = await fetch(`https://provinces.open-api.vn/api/p/${code}?depth=2`);
    const data = await res.json();
    setDistricts(data.districts || []);
  };

  const handleDistrictChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selectedDistrict = districts.find(d => String(d.code) === String(code));
    const name = selectedDistrict ? selectedDistrict.name : "";
    
    setFormData(prev => ({
      ...prev,
      districtCode: code,
      district: name,
      wardCode: "",
      ward: "",
    }));
    setWards([]);
    
    if (!code) return;
    const res = await fetch(`https://provinces.open-api.vn/api/d/${code}?depth=2`);
    const data = await res.json();
    setWards(data.wards || []);
  };

  const handleWardChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    const code = e.target.value;
    const selectedWard = wards.find(w => String(w.code) === String(code));
    const name = selectedWard ? selectedWard.name : "";
    
    setFormData(prev => ({
      ...prev,
      wardCode: code,
      ward: name,
    }));
  };

  // Gợi ý địa chỉ thông minh ngay khi gõ (kết hợp khu vực đã chọn + OpenStreetMap Việt Nam)
  const handleStreetInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData(prev => ({ ...prev, street: value }));

    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);

    if (value.trim().length < 2) {
      setShowSuggestions(false);
      setSuggestions([]);
      return;
    }

    // 1. Tạo gợi ý nhanh dựa trên Phường/Quận/Tỉnh đang chọn
    const areaSuffix = [formData.ward, formData.district, formData.city].filter(Boolean).join(", ");
    const quickSuggestions = areaSuffix
      ? [
          `${value.trim()} (${areaSuffix})`,
          `Số ${value.trim()}, ${areaSuffix}`
        ]
      : [`${value.trim()}, TP. Hồ Chí Minh`, `${value.trim()}, Hà Nội`];

    setSuggestions(quickSuggestions);
    setShowSuggestions(true);

    // 2. Tìm kiếm địa chỉ thực tế qua OpenStreetMap Nominatim sau 350ms ngừng gõ
    searchTimeoutRef.current = setTimeout(async () => {
      try {
        setIsSearchingAddress(true);
        const query = areaSuffix ? `${value.trim()}, ${formData.city || "Việt Nam"}` : value.trim();
        const res = await fetch(
          `https://nominatim.openstreetmap.org/search?format=json&countrycodes=vn&addressdetails=1&limit=5&q=${encodeURIComponent(query)}`,
          { headers: { "Accept-Language": "vi" } }
        );
        const data = await res.json();

        if (Array.isArray(data) && data.length > 0) {
          const mapResults = data.map((item: any) => {
            // Lấy phần tên đường/số nhà gọn gàng hoặc chuỗi hiển thị đầu
            const parts = item.display_name.split(",").map((s: string) => s.trim());
            return parts.slice(0, 3).join(", ");
          });
          // Gộp kết quả thực tế và lọc trùng
          const combined = Array.from(new Set([...mapResults, ...quickSuggestions])).slice(0, 5);
          setSuggestions(combined);
        }
      } catch (err) {
        // Nếu mạng chặn OpenStreetMap thì vẫn giữ gợi ý nhanh ở trên
      } finally {
        setIsSearchingAddress(false);
      }
    }, 350);
  };

  const handleApplyVoucher = () => {
    if (voucherInput.toUpperCase() === "HONGNGOC") {
      setDiscountAmount(20000);
      setAppliedVoucher("HONGNGOC");
      setError("");
    } else {
      setDiscountAmount(0);
      setAppliedVoucher("");
      setError("Mã giảm giá không hợp lệ.");
    }
  };

  const handleCheckout = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError("");

    if (!formData.city || !formData.district || !formData.ward) {
      setError("Vui lòng chọn đầy đủ Tỉnh/Thành, Quận/Huyện, Phường/Xã.");
      setIsLoading(false);
      return;
    }

    // TÍNH NĂNG MỚI: Thuật toán kiểm tra địa chỉ ảo
    const streetTrim = formData.street.trim();
    if (streetTrim.length < 8 || !streetTrim.includes(" ") || !/\d/.test(streetTrim)) {
      setError("Địa chỉ chưa rõ ràng. Vui lòng nhập chi tiết số nhà và tên đường (VD: Số 12 Lê Lợi).");
      setIsLoading(false);
      return;
    }

    // Lưu toàn bộ thông tin địa chỉ (bao gồm cả mã Tỉnh/Quận/Phường) cho lần mua sau
    localStorage.setItem("wellness_address", JSON.stringify({
      customerPhone: formData.customerPhone,
      cityCode: formData.cityCode,
      city: formData.city,
      districtCode: formData.districtCode,
      district: formData.district,
      wardCode: formData.wardCode,
      ward: formData.ward,
      street: formData.street,
      addressType: formData.addressType,
      note: formData.note
    }));

    // ==========================================
    // FIX LỖI LẶP ĐỊA CHỈ: Kiểm tra chống trùng lặp thông minh
    // ==========================================
    const typeLabel = formData.addressType === "COMPANY" ? "[Công ty]" : "[Nhà riêng]";
    
    const addressParts = [formData.street];
    
    // Quét xem trong chuỗi street đã có Phường/Quận/Tỉnh chưa, chưa có mới thêm vào
    if (formData.ward && !formData.street.includes(formData.ward)) {
      addressParts.push(formData.ward);
    }
    if (formData.district && !formData.street.includes(formData.district)) {
      addressParts.push(formData.district);
    }
    if (formData.city && !formData.street.includes(formData.city)) {
      addressParts.push(formData.city);
    }

    const fullAddress = `${typeLabel} ${addressParts.join(", ")}`;
    // ==========================================

    try {
      const res = await fetch("/api/checkout", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          ...formData,
          address: fullAddress,
          city: formData.city,
          voucherCode: appliedVoucher,
          items: items.map(item => ({
            productId: item.id,
            quantity: item.quantity,
            price: item.price * (1 - item.discount / 100)
          }))
        }),
      });

      const rawText = await res.text();
      let data;
      
      try {
        data = JSON.parse(rawText);
      } catch (parseErr) {
        console.error("Lỗi HTML trả về từ Server:", rawText);
        throw new Error("API bị lỗi sập ngầm! Hãy mở Terminal của VS Code để xem chi tiết.");
      }

      if (!res.ok) throw new Error(data.error || "Có lỗi xảy ra khi tạo đơn hàng.");

      // Khóa màn hình ở trạng thái thành công rồi mới xóa giỏ và chuyển trang
      isSubmittingRef.current = true;
      setIsOrderSuccess(true);
      clearCart();
      router.push(`/checkout/success/${data.orderId}`);
    } catch (err: any) {
      setError(err.message || "Không thể kết nối đến máy chủ.");
      setIsLoading(false);
    }
  };

  if (!isMounted) {
    return <div className="min-h-screen bg-slate-50 pt-32 text-center text-slate-500">Đang tải thông tin thanh toán...</div>;
  }

  // Màn hình chờ khi đang chuyển sang trang QR
  if (isOrderSuccess || isSubmittingRef.current) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-sans">
        <div className="text-center">
          <div className="mx-auto mb-4 h-12 w-12 animate-spin rounded-full border-4 border-sky-600 border-t-transparent"></div>
          <h2 className="text-xl font-bold text-slate-900">Đang khởi tạo đơn hàng & mã QR...</h2>
          <p className="mt-1 text-sm text-slate-500">Vui lòng đợi trong giây lát.</p>
        </div>
      </main>
    );
  }

  // Nếu giỏ hàng trống: Hiện giao diện tĩnh
  if (items.length === 0) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 px-4 font-sans">
        <div className="rounded-[2.5rem] border border-white/60 bg-white/40 p-12 text-center shadow-sm backdrop-blur-xl">
          <h2 className="mb-2 text-xl font-bold text-slate-800">Giỏ hàng của bạn đang trống</h2>
          <p className="mb-6 text-sm text-slate-500">Vui lòng chọn sách trước khi tiến hành thanh toán.</p>
          <Link href="/tu-sach" className="rounded-full bg-slate-900 px-8 py-3.5 text-sm font-bold text-white hover:bg-sky-600">
            Quay lại Tủ sách
          </Link>
        </div>
      </main>
    );
  }
  
  const totalPrice = getTotalPrice();
  const finalTotal = Math.max(0, totalPrice + shippingFee - discountAmount);

  return (
    <main className="relative min-h-screen bg-slate-50 px-4 pb-24 pt-32 font-sans">
      <div className="mx-auto max-w-6xl">
        <h1 className="mb-8 text-3xl font-extrabold tracking-tight text-slate-900">Thanh toán & Giao hàng</h1>

        <div className="flex flex-col gap-8 lg:flex-row">
          <div className="flex-1">
            <div className="mb-6 rounded-[2rem] border border-white/60 bg-white/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
              <div className="mb-6 flex items-center justify-between border-b border-slate-200/60 pb-6">
                <h2 className="text-xl font-bold text-slate-900">Thông tin nhận hàng</h2>
                {!isLoggedIn && (
                  <Link href="/login?redirect=/checkout" className="text-sm font-semibold text-sky-600 hover:underline">Đã có tài khoản? Đăng nhập</Link>
                )}
              </div>

              {error && <div className="mb-6 rounded-xl bg-red-50 p-4 text-sm font-bold text-red-500">{error}</div>}

              <form id="checkout-form" onSubmit={handleCheckout} className="flex flex-col gap-6">
                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div className="md:col-span-2">
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Họ và tên</label>
                    <input type="text" required placeholder="Nhập họ và tên của bạn" value={formData.customerName} onChange={(e) => setFormData({...formData, customerName: e.target.value})} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none transition-all focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Email</label>
                    <input type="email" required placeholder="Nhập email của bạn" value={formData.customerEmail} onChange={(e) => setFormData({...formData, customerEmail: e.target.value})} readOnly={isLoggedIn} className={`w-full rounded-2xl border px-4 py-3 text-sm font-medium outline-none ${isLoggedIn ? "border-transparent bg-slate-100/70 text-slate-500 cursor-not-allowed" : "border-white/60 bg-white/50 text-slate-900 focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100"}`} />
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Số điện thoại</label>
                    <input type="tel" required placeholder="Nhập số điện thoại của bạn" value={formData.customerPhone} onChange={(e) => setFormData({...formData, customerPhone: e.target.value})} className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100" />
                  </div>
                </div>

                <hr className="border-slate-200/60" />

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500">Loại địa chỉ</label>
                  <div className="flex gap-4">
                    <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all ${formData.addressType === "HOME" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-transparent bg-white/60 text-slate-500 hover:bg-white"}`}>
                      <input type="radio" name="addressType" value="HOME" className="hidden" checked={formData.addressType === "HOME"} onChange={(e) => setFormData({...formData, addressType: e.target.value})} />🏠 Nhà riêng
                    </label>
                    <label className={`flex flex-1 cursor-pointer items-center justify-center gap-2 rounded-2xl border-2 px-4 py-3 text-sm font-bold transition-all ${formData.addressType === "COMPANY" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-transparent bg-white/60 text-slate-500 hover:bg-white"}`}>
                      <input type="radio" name="addressType" value="COMPANY" className="hidden" checked={formData.addressType === "COMPANY"} onChange={(e) => setFormData({...formData, addressType: e.target.value})} />🏢 Công ty
                    </label>
                  </div>
                </div>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-3">
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Tỉnh / Thành phố</label>
                    <select required value={formData.cityCode} onChange={handleCityChange} className="w-full cursor-pointer truncate rounded-2xl border border-white/60 bg-white/50 px-4 py-3 pr-8 text-sm font-medium text-slate-900 outline-none focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100">
                      <option value="">Chọn Tỉnh/Thành</option>
                      {provinces.map(p => <option key={p.code} value={p.code}>{p.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Quận / Huyện</label>
                    <select required value={formData.districtCode} onChange={handleDistrictChange} disabled={districts.length === 0} className="w-full cursor-pointer truncate rounded-2xl border border-white/60 bg-white/50 px-4 py-3 pr-8 text-sm font-medium text-slate-900 outline-none disabled:opacity-50 focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100">
                      <option value="">Chọn Quận/Huyện</option>
                      {districts.map(d => <option key={d.code} value={d.code}>{d.name}</option>)}
                    </select>
                  </div>
                  <div>
                    <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Phường / Xã</label>
                    <select required value={formData.wardCode} onChange={handleWardChange} disabled={wards.length === 0} className="w-full cursor-pointer truncate rounded-2xl border border-white/60 bg-white/50 px-4 py-3 pr-8 text-sm font-medium text-slate-900 outline-none disabled:opacity-50 focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100">
                      <option value="">Chọn Phường/Xã</option>
                      {wards.map(w => <option key={w.code} value={w.code}>{w.name}</option>)}
                    </select>
                  </div>
                </div>

                <div className="relative" ref={suggestionBoxRef}>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Số nhà, Tên đường</label>
                  <input
                    type="text"
                    required
                    autoComplete="off"
                    placeholder="Nhập số nhà, tên đường của bạn (VD: 123 Trần Não)..."
                    value={formData.street}
                    onFocus={() => { if (suggestions.length > 0) setShowSuggestions(true); }}
                    onChange={handleStreetInput}
                    className="w-full rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100"
                  />
                  
                  {showSuggestions && suggestions.length > 0 && (
                    <div className="absolute left-0 top-[105%] z-30 w-full overflow-hidden rounded-2xl border border-slate-200/80 bg-white/95 shadow-xl backdrop-blur-xl">
                      {isSearchingAddress && (
                        <div className="border-b border-slate-100 px-4 py-2 text-[11px] font-medium text-sky-600">
                          Đang tìm địa chỉ phù hợp...
                        </div>
                      )}
                      {suggestions.map((sug, i) => (
                        <div
                          key={i}
                          onClick={() => {
                            setFormData(prev => ({ ...prev, street: sug }));
                            setShowSuggestions(false);
                          }}
                          className="flex cursor-pointer items-center gap-2.5 border-b border-slate-100 px-4 py-3 text-sm font-medium text-slate-700 transition-colors hover:bg-sky-50 hover:text-sky-700 last:border-0"
                        >
                          <svg className="h-4 w-4 shrink-0 text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                          </svg>
                          <span className="line-clamp-1">{sug}</span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                <div>
                  <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Ghi chú</label>
                  <textarea rows={2} placeholder="Nhập ghi chú thêm cho người giao hàng..." value={formData.note} onChange={(e) => setFormData({...formData, note: e.target.value})} className="w-full resize-none rounded-2xl border border-white/60 bg-white/50 px-4 py-3 text-sm font-medium text-slate-900 outline-none focus:border-sky-400 focus:bg-white/80 focus:ring-4 focus:ring-sky-100"></textarea>
                </div>

                <hr className="border-slate-200/60" />

                <div>
                  <label className="mb-3 block text-xs font-bold uppercase tracking-widest text-slate-500">Hình thức thanh toán</label>
                  <div className="flex flex-col gap-3">
                    <label className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-4 py-4 text-sm font-bold transition-all ${formData.paymentMethod === "QR" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-white/60 bg-white/50 text-slate-500 hover:bg-white"}`}>
                      <input type="radio" name="paymentMethod" value="QR" className="hidden" checked={formData.paymentMethod === "QR"} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} />
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${formData.paymentMethod === "QR" ? "border-sky-500" : "border-slate-300"}`}>
                        {formData.paymentMethod === "QR" && <div className="h-2.5 w-2.5 rounded-full bg-sky-500"></div>}
                      </div>
                      Chuyển khoản qua mã QR (Khuyên dùng)
                    </label>
                    
                    <label className={`flex cursor-pointer items-center gap-4 rounded-2xl border-2 px-4 py-4 text-sm font-bold transition-all ${formData.paymentMethod === "COD" ? "border-sky-500 bg-sky-50 text-sky-700" : "border-white/60 bg-white/50 text-slate-500 hover:bg-white"}`}>
                      <input type="radio" name="paymentMethod" value="COD" className="hidden" checked={formData.paymentMethod === "COD"} onChange={(e) => setFormData({...formData, paymentMethod: e.target.value})} />
                      <div className={`flex h-5 w-5 items-center justify-center rounded-full border-2 ${formData.paymentMethod === "COD" ? "border-sky-500" : "border-slate-300"}`}>
                        {formData.paymentMethod === "COD" && <div className="h-2.5 w-2.5 rounded-full bg-sky-500"></div>}
                      </div>
                      Thanh toán tiền mặt khi nhận hàng (COD)
                    </label>
                  </div>
                </div>

              </form>
            </div>
          </div>

          <div className="w-full lg:w-[420px]">
            <div className="sticky top-24 rounded-[2.5rem] border border-white/60 bg-white/40 p-8 shadow-[0_8px_32px_rgba(0,0,0,0.04)] backdrop-blur-xl">
              <h2 className="mb-6 text-xl font-bold text-slate-900">Đơn hàng ({items.length} SP)</h2>
              
              <div className="mb-6 flex max-h-[280px] flex-col gap-4 overflow-y-auto border-b border-slate-200/60 pb-6 pr-2">
                {items.map((item) => (
                  <div key={item.id} className="flex items-center gap-3">
                    <div className="relative h-16 w-12 shrink-0 overflow-hidden rounded-lg bg-slate-200">
                      {item.coverImage && <img src={item.coverImage} className="h-full w-full object-cover" />}
                      <span className="absolute -right-1 -top-1 flex h-4 w-4 items-center justify-center rounded-full bg-slate-900 text-[9px] font-bold text-white">{item.quantity}</span>
                    </div>
                    <div className="flex-1">
                      <p className="line-clamp-1 text-sm font-bold text-slate-900">{item.title}</p>
                      {/* ĐÃ FIX LỖI SYNTAX Ở ĐÂY CHUẨN TOÁN HỌC */}
                      <p className="mt-0.5 text-xs font-semibold text-rose-500">{(item.price * (1 - item.discount / 100)).toLocaleString("vi-VN")}đ</p>
                    </div>
                  </div>
                ))}
              </div>

              <div className="mb-6 border-b border-slate-200/60 pb-6">
                <label className="mb-2 block text-xs font-bold uppercase tracking-widest text-slate-500">Mã giảm giá</label>
                <div className="flex gap-2">
                  <input type="text" placeholder="Nhập mã giảm giá..." value={voucherInput} onChange={(e) => setVoucherInput(e.target.value)} disabled={appliedVoucher !== ""} className="flex-1 rounded-xl border border-white/60 bg-white/50 px-4 py-2.5 text-sm font-medium uppercase text-slate-900 outline-none placeholder:normal-case focus:border-sky-400 focus:ring-4 focus:ring-sky-100 disabled:opacity-50" />
                  {appliedVoucher ? (
                    <button type="button" onClick={() => { setAppliedVoucher(""); setDiscountAmount(0); setVoucherInput(""); }} className="rounded-xl bg-slate-200 px-4 text-sm font-bold text-slate-600 hover:bg-slate-300">Hủy</button>
                  ) : (
                    <button type="button" onClick={handleApplyVoucher} className="rounded-xl bg-slate-900 px-4 text-sm font-bold text-white hover:bg-sky-600">Áp dụng</button>
                  )}
                </div>
              </div>

              <div className="mb-4 flex justify-between text-sm font-medium text-slate-600">
                <span>Tạm tính</span><span>{totalPrice.toLocaleString("vi-VN")}đ</span>
              </div>
              
              <div className="mb-4 flex flex-col gap-1 border-b border-dashed border-slate-200/60 pb-4 text-sm font-medium text-slate-600">
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span className="font-bold text-slate-900">{shippingFee === 0 ? "Chưa tính" : `${shippingFee.toLocaleString("vi-VN")}đ`}</span>
                </div>
                {shippingTime && <span className="text-xs text-emerald-600 italic">Dự kiến giao: {shippingTime}</span>}
              </div>

              <div className="mb-6 flex justify-between text-sm font-medium text-slate-600">
                <span>Giảm giá</span><span className="text-emerald-600">-{discountAmount.toLocaleString("vi-VN")}đ</span>
              </div>
              <div className="mb-6 flex justify-between">
                <span className="font-bold text-slate-900">Tổng thanh toán</span>
                <span className="text-2xl font-extrabold text-rose-500">{finalTotal.toLocaleString("vi-VN")}đ</span>
              </div>

              <button type="submit" form="checkout-form" disabled={isLoading} className="flex h-14 w-full items-center justify-center rounded-2xl bg-slate-900 px-6 font-bold uppercase tracking-widest text-white shadow-lg transition-all hover:-translate-y-0.5 hover:bg-sky-600 hover:shadow-sky-600/30 disabled:pointer-events-none disabled:opacity-70">
                {isLoading ? "Đang xử lý..." : "Xác nhận Đặt hàng"}
              </button>
            </div>
          </div>
        </div>
      </div>
    </main>
  );
}