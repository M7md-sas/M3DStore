import { getDb } from "./db";

/**
 * تحليلات داخل المتجر — لا Google Analytics ولا طرف ثالث.
 *
 * السبب: لا تحتاج حسابًا ولا مفاتيح، ولا يحجبها مانع الإعلانات (العدّ
 * يتم على الخادم لا في المتصفح)، ولا تُخزَّن أي بيانات شخصية — فلا
 * تلزمنا موافقة كوكيز. نحفظ عددًا واحدًا لكل يوم ولكل منتج، فيبقى
 * الجدول صغيرًا مهما طال الزمن.
 */

function today(): string {
  // توقيت الرياض حتى تطابق الأرقام يوم صاحب المتجر لا يوم UTC
  return new Date(Date.now() + 3 * 60 * 60 * 1000).toISOString().slice(0, 10);
}

/** productId = 0 يعني صفحة عامة (الرئيسية أو قائمة المنتجات) */
export function recordView(productId = 0): void {
  try {
    getDb()
      .prepare(
        `INSERT INTO views (day, product_id, count) VALUES (?, ?, 1)
         ON CONFLICT(day, product_id) DO UPDATE SET count = count + 1`
      )
      .run(today(), productId);
  } catch {
    /* التحليلات لا تكسر صفحة أبدًا */
  }
}

function daysAgo(n: number): string {
  return new Date(Date.now() + 3 * 60 * 60 * 1000 - n * 86400000)
    .toISOString()
    .slice(0, 10);
}

export type Analytics = {
  views: { today: number; week: number; month: number };
  orders: { today: number; week: number; month: number; revenue: number };
  conversion: number;
  topProducts: { id: number; name: string; views: number }[];
  daily: { day: string; views: number; orders: number }[];
};

export function analyticsSummary(): Analytics {
  const db = getDb();

  const viewsSince = (from: string): number =>
    (db.prepare("SELECT COALESCE(SUM(count), 0) AS n FROM views WHERE day >= ?").get(from) as {
      n: number;
    }).n;

  // الطلبات الملغاة لا تُحتسب إيرادًا
  const orderStats = (from: string) =>
    db
      .prepare(
        `SELECT COUNT(*) AS n, COALESCE(SUM(total), 0) AS revenue
         FROM orders WHERE date(created_at) >= ? AND status != 'cancelled'`
      )
      .get(from) as { n: number; revenue: number };

  const t = today();
  const week = daysAgo(6);
  const month = daysAgo(29);

  const monthViews = viewsSince(month);
  const monthOrders = orderStats(month);

  const topProducts = db
    .prepare(
      `SELECT p.id, p.name, SUM(v.count) AS views
       FROM views v JOIN products p ON p.id = v.product_id
       WHERE v.day >= ? AND v.product_id > 0
       GROUP BY p.id ORDER BY views DESC LIMIT 8`
    )
    .all(month) as { id: number; name: string; views: number }[];

  // آخر ١٤ يومًا للرسم — الأيام الفارغة تظهر أصفارًا لا تُحذف
  const daily: { day: string; views: number; orders: number }[] = [];
  for (let i = 13; i >= 0; i--) {
    const day = daysAgo(i);
    const v = (db
      .prepare("SELECT COALESCE(SUM(count), 0) AS n FROM views WHERE day = ?")
      .get(day) as { n: number }).n;
    const o = (db
      .prepare(
        "SELECT COUNT(*) AS n FROM orders WHERE date(created_at) = ? AND status != 'cancelled'"
      )
      .get(day) as { n: number }).n;
    daily.push({ day, views: v, orders: o });
  }

  return {
    views: { today: viewsSince(t), week: viewsSince(week), month: monthViews },
    orders: {
      today: orderStats(t).n,
      week: orderStats(week).n,
      month: monthOrders.n,
      revenue: monthOrders.revenue,
    },
    // نسبة التحويل: كم زيارة تنتهي بطلب — المقياس الذي يخبرك أين الخلل
    conversion: monthViews > 0 ? (monthOrders.n / monthViews) * 100 : 0,
    topProducts,
    daily,
  };
}
