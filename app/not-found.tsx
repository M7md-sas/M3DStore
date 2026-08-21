import Link from "next/link";
import { SearchIcon } from "@/components/Icons";

export default function NotFound() {
  return (
    <div className="mx-auto max-w-lg px-4 py-24 text-center">
      <span className="mx-auto flex h-20 w-20 items-center justify-center rounded-full bg-primary-soft text-primary">
        <SearchIcon width={36} height={36} />
      </span>
      <h1 className="mt-6 text-2xl font-extrabold">الصفحة غير موجودة</h1>
      <p className="mt-2 text-muted">يمكن الرابط تغير أو المنتج ما عاد متوفر</p>
      <Link
        href="/"
        className="mt-6 inline-block rounded-xl bg-primary px-7 py-3.5 font-bold text-white transition-colors hover:bg-primary-hover"
      >
        ارجع للرئيسية
      </Link>
    </div>
  );
}
