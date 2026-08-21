import { NextResponse } from "next/server";
import { getDb } from "@/lib/db";
import { isAdmin } from "@/lib/admin-auth";
import { getImportedProducts } from "@/lib/instagram";
import { listProductImages } from "@/lib/images";

export async function GET() {
  if (!(await isAdmin())) return NextResponse.json({ error: "غير مصرح" }, { status: 401 });

  const db = getDb();
  const products = db.prepare("SELECT * FROM products ORDER BY id DESC").all();
  const orders = db.prepare("SELECT * FROM orders ORDER BY id DESC").all();
  const custom = db.prepare("SELECT * FROM custom_requests ORDER BY id DESC").all();

  const instagram = getImportedProducts();
  const images = listProductImages();

  return NextResponse.json({ products, orders, custom, instagram, images });
}
