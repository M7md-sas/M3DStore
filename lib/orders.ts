import type Database from "better-sqlite3";
import { getDb } from "./db";

/**
 * إلغاء طلب وإرجاع كمياته إلى المخزون.
 *
 * يُستدعى من مكانين: لوحة التحكم، وإلغاء الزبون لطلبه. المنطق هنا لا
 * هناك حتى لا يفترقا — حارس stock_restored يمنع مضاعفة الكميات لو
 * أُلغي الطلب مرتين من الطريقين.
 */
export function cancelAndRestore(orderId: number): boolean {
  const db = getDb();
  const order = db
    .prepare("SELECT items_json, stock_restored FROM orders WHERE id = ?")
    .get(orderId) as { items_json: string; stock_restored: number } | undefined;
  if (!order) return false;

  const giveBack = db.prepare("UPDATE products SET stock = stock + ? WHERE id = ?");

  db.transaction(() => {
    db.prepare("UPDATE orders SET status = 'cancelled' WHERE id = ?").run(orderId);

    if (order.stock_restored === 0) {
      try {
        const items = JSON.parse(order.items_json) as { id: number; qty: number }[];
        for (const it of items) giveBack.run(Number(it.qty) || 0, Number(it.id));
      } catch {
        /* سطر تالف في الطلب لا يمنع الإلغاء */
      }
      db.prepare("UPDATE orders SET stock_restored = 1 WHERE id = ?").run(orderId);
    }
  })();

  return true;
}

export type LowStockItem = { id: number; name: string; stock: number };

/**
 * القطع التي قارب مخزونها الجاهز على النفاد بعد هذا الطلب.
 *
 * لا يعني توقف البيع — القطع تُطبع عند الطلب — لكنه يعني أن صاحب المتجر
 * سيطبع يدويًا بدل السحب من الجاهز، فيستحق أن يعرف قبل لا بعد.
 */
export function lowStockAfter(
  db: Database.Database,
  items: { id: number }[],
  threshold = 2
): LowStockItem[] {
  const out: LowStockItem[] = [];
  for (const it of items) {
    const row = db
      .prepare("SELECT id, name, stock FROM products WHERE id = ?")
      .get(it.id) as LowStockItem | undefined;
    if (row && row.stock <= threshold) out.push(row);
  }
  return out;
}
