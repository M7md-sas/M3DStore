import fs from "fs";
import path from "path";
import { projectRoot } from "./db";

// المجلدات المسموح استخدام صورها كصور منتجات:
// products = الصور المرفقة مع المتجر، instagram = الصور المستوردة من حساب إنستقرام
const IMAGE_DIRS = ["products", "instagram"] as const;
const IMAGE_EXT = new Set([".svg", ".jpg", ".jpeg", ".png", ".webp", ".avif"]);

function dirPath(dir: string): string {
  return path.join(projectRoot, "public", dir);
}

/** كل الصور المتاحة للاختيار من لوحة التحكم — الأحدث أولًا داخل كل مجلد */
export function listProductImages(): string[] {
  const out: string[] = [];
  for (const dir of IMAGE_DIRS) {
    const full = dirPath(dir);
    if (!fs.existsSync(full)) continue;
    const names = fs
      .readdirSync(full)
      .filter((n) => IMAGE_EXT.has(path.extname(n).toLowerCase()))
      .sort();
    for (const name of names) out.push(`/${dir}/${name}`);
  }
  return out;
}

/**
 * يتحقق أن المسار صورة حقيقية داخل مجلد مسموح.
 * يحل محل القائمة البيضاء الثابتة القديمة التي كانت تمنع أي صورة جديدة.
 */
export function isValidImagePath(value: unknown): value is string {
  if (typeof value !== "string" || !value) return false;
  if (value.includes("..") || value.includes("\0") || value.includes("\\")) return false;

  const match = /^\/(products|instagram)\/([^/]+)$/.exec(value);
  if (!match) return false;

  const [, dir, name] = match;
  if (name !== path.basename(name)) return false;
  if (!IMAGE_EXT.has(path.extname(name).toLowerCase())) return false;

  return fs.existsSync(path.join(dirPath(dir), name));
}

/** صورة احتياطية عند إرسال مسار غير صالح */
export function fallbackImage(): string {
  return listProductImages()[0] ?? "/products/vase.svg";
}
