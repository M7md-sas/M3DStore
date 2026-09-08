import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { isAdmin } from "@/lib/admin-auth";
import { dataDir, integrityOf } from "@/lib/db";

export const dynamic = "force-dynamic";

const backupDir = path.join(dataDir, "backups");

/**
 * نفحص سلامة كل نسخة عند العرض: db.backup تنسخ الصفحات كما هي، فإن
 * كانت القاعدة معطوبة نُسخ العطب معها — ونسخة تالفة تبدو سليمة أسوأ
 * من غياب النسخ.
 */
function list() {
  if (!fs.existsSync(backupDir)) return [];
  return fs
    .readdirSync(backupDir)
    .filter((n) => n.startsWith("store-") && n.endsWith(".db"))
    .map((name) => {
      const st = fs.statSync(path.join(backupDir, name));
      return {
        name,
        size: st.size,
        at: new Date(st.mtimeMs).toISOString(),
        healthy: integrityOf(path.join(backupDir, name)) === "ok",
      };
    })
    .sort((a, b) => b.at.localeCompare(a.at));
}

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });
  return NextResponse.json({ backups: list() });
}

/**
 * ينشئ نسخة الآن. نستخدم db.backup لا نسخ الملف، لأن القاعدة تعمل بوضع
 * WAL ونسخها كملف أثناء البيع قد يعطي لقطة ناقصة.
 */
export async function POST() {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  try {
    fs.mkdirSync(backupDir, { recursive: true });
    const stamp = new Date(Date.now() + 3 * 60 * 60 * 1000)
      .toISOString()
      .replace(/[:T]/g, "-")
      .slice(0, 16);
    const name = `store-${stamp}.db`;

    const db = new Database(path.join(dataDir, "store.db"), { readonly: true });
    await db.backup(path.join(backupDir, name));
    db.close();

    return NextResponse.json({ ok: true, name, backups: list() });
  } catch {
    return NextResponse.json({ error: "تعذّر إنشاء النسخة" }, { status: 500 });
  }
}
