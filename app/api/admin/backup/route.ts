import { NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import Database from "better-sqlite3";
import { isAdmin } from "@/lib/admin-auth";
import { dataDir } from "@/lib/db";

export const dynamic = "force-dynamic";

const backupDir = path.join(dataDir, "backups");

function list() {
  if (!fs.existsSync(backupDir)) return [];
  return fs
    .readdirSync(backupDir)
    .filter((n) => n.startsWith("store-") && n.endsWith(".db"))
    .map((name) => {
      const s = fs.statSync(path.join(backupDir, name));
      return { name, size: s.size, at: new Date(s.mtimeMs).toISOString() };
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
