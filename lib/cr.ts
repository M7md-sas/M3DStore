import fs from "fs";
import path from "path";
import { projectRoot } from "./db";
import { CR_NUMBER, CR_LABEL, CR_FILE_PUBLIC } from "./site";

// أول امتداد موجود يفوز — ضع ملف الوثيقة في public باسم cr
const CR_FILES = ["cr.pdf", "cr.jpg", "cr.jpeg", "cr.png", "cr.webp"];

export type CommercialRegister = {
  number: string;
  label: string;
  file: string | null;
  /** صفحة التحقق الرسمية في منصة العمل الحر — نفس ما يفتحه رمز QR في الوثيقة */
  verifyUrl: string;
  qr: string | null;
  authorityLogo: string | null;
} | null;

/** رابط التحقق كما تبنيه المنصة: رقم الوثيقة بترميز base64 */
function buildVerifyUrl(number: string): string {
  const encoded = Buffer.from(number, "utf8").toString("base64");
  return `https://freelance.sa/certificate-validation/certificate-validation-details/${encoded}`;
}

function assetOrNull(relative: string): string | null {
  return fs.existsSync(path.join(projectRoot, "public", relative)) ? `/${relative}` : null;
}

/**
 * بيانات وثيقة العمل الحر كما تُعرض في المتجر.
 * بلا رقم لا يُعرض شيء. الرقم ورمز التحقق كافيان نظامًا،
 * وملف الوثيقة نفسه لا يُنشر لأنه يحمل رقم الهوية والاسم الكامل.
 */
export function commercialRegister(): CommercialRegister {
  const number = CR_NUMBER.trim();
  if (!number) return null;

  const base = {
    number,
    label: CR_LABEL,
    verifyUrl: buildVerifyUrl(number),
    qr: assetOrNull("verify/freelance-qr.png"),
    authorityLogo: assetOrNull("verify/mhrsd.png"),
  };

  if (CR_FILE_PUBLIC) {
    for (const name of CR_FILES) {
      if (fs.existsSync(path.join(projectRoot, "public", name))) {
        return { ...base, file: `/${name}` };
      }
    }
  }
  return { ...base, file: null };
}
