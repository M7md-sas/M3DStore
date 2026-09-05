#!/usr/bin/env node
/**
 * نسخة احتياطية من قاعدة بيانات المتجر.
 *
 * لا ننسخ الملف بـ cp: القاعدة تعمل بوضع WAL، فنسخ الملف وحده أثناء
 * التشغيل قد يعطي لقطة ناقصة أو تالفة. db.backup() تأخذ لقطة متسقة
 * والمتجر يبيع أثناءها بلا توقف.
 *
 * التشغيل: npm run backup
 */
import Database from "better-sqlite3";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const root = path.dirname(path.dirname(fileURLToPath(import.meta.url)));
const dataDir = process.env.M3D_DATA_DIR || path.join(root, "data");
const dbFile = path.join(dataDir, "store.db");
const backupDir = path.join(dataDir, "backups");

const KEEP_DAYS = 14;

if (!fs.existsSync(dbFile)) {
  console.error("لم أجد قاعدة البيانات:", dbFile);
  process.exit(1);
}

fs.mkdirSync(backupDir, { recursive: true });

// اسم بالتاريخ والوقت بتوقيت الرياض حتى تُقرأ النسخ بترتيبها الصحيح
const stamp = new Date(Date.now() + 3 * 60 * 60 * 1000)
  .toISOString()
  .replace(/[:T]/g, "-")
  .slice(0, 16);
const target = path.join(backupDir, `store-${stamp}.db`);

const db = new Database(dbFile, { readonly: true });
await db.backup(target);
db.close();

const size = (fs.statSync(target).size / 1024).toFixed(0);
console.log(`نسخة احتياطية: ${path.basename(target)} (${size} كيلوبايت)`);

// حذف ما تجاوز مدة الحفظ — النسخ تتراكم وتملأ القرص بلا هذا
const cutoff = Date.now() - KEEP_DAYS * 86400000;
let removed = 0;
for (const name of fs.readdirSync(backupDir)) {
  if (!name.startsWith("store-") || !name.endsWith(".db")) continue;
  const full = path.join(backupDir, name);
  if (fs.statSync(full).mtimeMs < cutoff) {
    fs.unlinkSync(full);
    removed++;
  }
}
if (removed > 0) console.log(`حُذفت ${removed} نسخة أقدم من ${KEEP_DAYS} يومًا`);
