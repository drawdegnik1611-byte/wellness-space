import { cookies } from "next/headers";
import { NextResponse } from "next/server";

export async function POST() {
  // Hàm này tước quyền (xóa cookie) trực tiếp và dứt khoát nhất
  const cookieStore = await cookies();
  cookieStore.delete("token");
  
  return NextResponse.json({ success: true });
}