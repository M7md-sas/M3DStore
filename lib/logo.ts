import fs from "fs";
import path from "path";
import { projectRoot } from "./db";

// أول امتداد موجود يفوز — ضع ملفك باسم logo في مجلد public
const LOGO_NAMES = ["logo.svg", "logo.png", "logo.webp", "logo.jpg", "logo.jpeg"];

/**
 * شعار المتجر إن وُجد في مجلد public، وإلا null فتُعرض أيقونة المكعّب الافتراضية.
 * يُقرأ مرة واحدة عند الطلب من مكوّن الخادم (layout) ويُمرَّر للهيدر والفوتر.
 */
export function findLogo(): string | null {
  for (const name of LOGO_NAMES) {
    if (fs.existsSync(path.join(projectRoot, "public", name))) return `/${name}`;
  }
  return null;
}
