import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { isAdmin } from "@/lib/admin-auth";
import { dataDir } from "@/lib/db";

/**
 * تنزيل نسخة احتياطية على جهاز صاحب المتجر.
 *
 * وهذه هي الحماية الحقيقية: نسخة على القرص نفسه لا تنجو من عطل القرص،
 * أما نسخة عندك فتنجو من كل شيء.
 */
export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { name } = await params;
  const safe = path.basename(name);
  // اسم النسخ وحده مسموح — لا يُقرأ أي ملف آخر من مجلد البيانات
  if (!/^store-[\d-]+\.db$/.test(safe))
    return NextResponse.json({ error: "اسم غير صالح" }, { status: 400 });

  try {
    const data = await fs.readFile(path.join(dataDir, "backups", safe));
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safe}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "النسخة غير موجودة" }, { status: 404 });
  }
}
