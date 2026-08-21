import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { getDb, generateCode, uploadsDir } from "@/lib/db";

const ALLOWED_EXT = [".stl", ".obj", ".3mf", ".step", ".stp", ".png", ".jpg", ".jpeg", ".webp", ".pdf", ".zip"];
const MAX_SIZE = 40 * 1024 * 1024; // 40MB

export async function POST(request: Request) {
  try {
    const form = await request.formData();
    const customer_name = String(form.get("name") ?? "").trim();
    const phone = String(form.get("phone") ?? "").trim();
    const description = String(form.get("description") ?? "").trim();
    const file = form.get("file");

    if (!customer_name) return NextResponse.json({ error: "اكتب اسمك" }, { status: 400 });
    if (!/^05\d{8}$/.test(phone))
      return NextResponse.json({ error: "رقم الجوال لازم يكون بصيغة 05xxxxxxxx" }, { status: 400 });
    if (description.length < 10)
      return NextResponse.json({ error: "اشرح فكرتك بتفصيل أكثر (10 أحرف على الأقل)" }, { status: 400 });

    if (!(file instanceof File) || file.size === 0)
      return NextResponse.json({ error: "لازم ترفع ملف التصميم أو صورة توضيحية للفكرة" }, { status: 400 });
    if (file.size > MAX_SIZE)
      return NextResponse.json({ error: "حجم الملف يتجاوز 40 ميجابايت" }, { status: 400 });
    const ext = path.extname(file.name).toLowerCase();
    if (!ALLOWED_EXT.includes(ext))
      return NextResponse.json(
        { error: `صيغة الملف غير مدعومة — الصيغ المقبولة: ${ALLOWED_EXT.join("، ")}` },
        { status: 400 }
      );
    const stored = `${crypto.randomUUID()}${ext}`;
    const buf = Buffer.from(await file.arrayBuffer());
    await fs.writeFile(path.join(uploadsDir, stored), buf);
    const fileName = file.name;
    const filePath = stored;

    const db = getDb();
    const code = generateCode("CST");
    db.prepare(
      `INSERT INTO custom_requests (code, customer_name, phone, description, file_name, file_path)
       VALUES (?, ?, ?, ?, ?, ?)`
    ).run(code, customer_name, phone, description, fileName, filePath);

    return NextResponse.json({ code });
  } catch {
    return NextResponse.json({ error: "حدث خطأ في الخادم" }, { status: 500 });
  }
}
