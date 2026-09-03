import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import crypto from "crypto";
import { isAdmin } from "@/lib/admin-auth";
import { projectRoot } from "@/lib/db";

const MAX_BYTES = 8 * 1024 * 1024;
const EXT_BY_TYPE: Record<string, string> = {
  "image/jpeg": ".jpg",
  "image/png": ".png",
  "image/webp": ".webp",
};

/** رفع صورة منتج جديدة من جهاز المدير مباشرة إلى public/products */
export async function POST(request: Request) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const form = await request.formData();
  const file = form.get("file");
  if (!(file instanceof Blob))
    return NextResponse.json({ error: "لم يصل ملف" }, { status: 400 });

  const ext = EXT_BY_TYPE[file.type];
  if (!ext)
    return NextResponse.json({ error: "صيغة الصورة يجب أن تكون JPG أو PNG أو WEBP" }, { status: 400 });
  if (file.size > MAX_BYTES)
    return NextResponse.json({ error: "حجم الصورة أكبر من 8 ميجابايت" }, { status: 400 });

  const name = `${Date.now()}-${crypto.randomBytes(4).toString("hex")}${ext}`;
  const dir = path.join(projectRoot, "public", "products");
  await fs.mkdir(dir, { recursive: true });
  await fs.writeFile(path.join(dir, name), Buffer.from(await file.arrayBuffer()));

  return NextResponse.json({ ok: true, path: `/products/${name}` });
}
