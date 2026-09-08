/**
 * حدّ بسيط لمعدل الطلبات، في ذاكرة العملية.
 *
 * لا Redis ولا خدمة خارجية: المتجر يعمل بعملية واحدة على خادم واحد،
 * فخريطة في الذاكرة تكفي وتكلفتها صفر. لو تعدّدت العمليات يومًا صار
 * الحدّ لكل عملية لا للمجموع — وهذا يضعفه ولا يكسره.
 *
 * الغرض منع التعداد الآلي (تخمين رموز الطلبات، وتجريب كلمات المرور)،
 * لا صدّ هجوم موزّع.
 */
type Bucket = { count: number; resetAt: number };

const buckets = new Map<string, Bucket>();

/** ننظّف المنتهية عند التضخّم فلا تنمو الخريطة بلا حدّ */
function prune(now: number): void {
  if (buckets.size < 5000) return;
  for (const [key, b] of buckets) if (now > b.resetAt) buckets.delete(key);
}

/** true = مسموح، false = تجاوز الحدّ */
export function allow(key: string, limit: number, windowMs: number): boolean {
  const now = Date.now();
  const b = buckets.get(key);

  if (!b || now > b.resetAt) {
    prune(now);
    buckets.set(key, { count: 1, resetAt: now + windowMs });
    return true;
  }

  if (b.count >= limit) return false;
  b.count++;
  return true;
}

/**
 * عنوان الزبون كما يراه nginx. أول قيمة في x-forwarded-for هي الأصل،
 * وما بعدها وسطاء. تُزوَّر بسهولة، لكنها كافية لإبطاء أداة تعداد.
 */
export function clientIp(headers: Headers): string {
  const fwd = headers.get("x-forwarded-for");
  if (fwd) return fwd.split(",")[0].trim();
  return headers.get("x-real-ip") ?? "unknown";
}
