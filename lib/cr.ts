import fs from "fs";
import path from "path";
import { projectRoot } from "./db";
import { CR_NUMBER } from "./site";

// أول امتداد موجود يفوز — ضع ملف السجل في public باسم cr
const CR_FILES = ["cr.pdf", "cr.jpg", "cr.jpeg", "cr.png", "cr.webp"];

export type CommercialRegister = { number: string; file: string | null } | null;

/**
 * بيانات السجل التجاري كما تُعرض في التذييل.
 * بلا رقم لا يُعرض شيء؛ ووجود الملف اختياري — الرقم وحده كافٍ نظامًا.
 */
export function commercialRegister(): CommercialRegister {
  const number = CR_NUMBER.trim();
  if (!number) return null;

  for (const name of CR_FILES) {
    if (fs.existsSync(path.join(projectRoot, "public", name))) {
      return { number, file: `/${name}` };
    }
  }
  return { number, file: null };
}
