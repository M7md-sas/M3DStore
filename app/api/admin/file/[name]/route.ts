import { NextResponse } from "next/server";
import path from "path";
import fs from "fs/promises";
import { uploadsDir } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ name: string }> }
) {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const { name } = await params;
  const safe = path.basename(name);
  const full = path.join(uploadsDir, safe);
  try {
    const data = await fs.readFile(full);
    return new NextResponse(new Uint8Array(data), {
      headers: {
        "Content-Type": "application/octet-stream",
        "Content-Disposition": `attachment; filename="${safe}"`,
      },
    });
  } catch {
    return NextResponse.json({ error: "الملف غير موجود" }, { status: 404 });
  }
}
