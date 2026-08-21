import type { Metadata } from "next";
import { Amiri, Reem_Kufi, Changa } from "next/font/google";
import { getDb } from "@/lib/db";
import type { ProductRow } from "@/components/ProductCard";
import HeroLight from "@/components/heroes/HeroLight";
import HeroWorkshop from "@/components/heroes/HeroWorkshop";
import HeroLayers from "@/components/heroes/HeroLayers";

export const metadata: Metadata = { title: "اختيار شاشة الهيرو" };
export const dynamic = "force-dynamic";

// لكل اتجاه صوت طباعي مختلف — الفرق بينها يُقرأ قبل أن يُشرح
const amiri = Amiri({ subsets: ["arabic"], weight: ["700"], variable: "--f-amiri" });
const reem = Reem_Kufi({ subsets: ["arabic"], weight: ["600", "700"], variable: "--f-reem" });
const changa = Changa({ subsets: ["arabic"], weight: ["700", "800"], variable: "--f-changa" });

const OPTIONS = [
  {
    id: "أ",
    name: "الضوء",
    font: "Amiri — خط عربي كلاسيكي بحروف مذنّبة، يعيد صدى كلمة الشعار",
    idea: "أبيض بلا منافس، والذهبي يدخل خطًّا وحرفًا وزرًّا فقط. القطعة معروضة داخل حاشية كريمية كما تُعلَّق اللوحة.",
    best: "لو تبي المتجر يوحي بالهدوء والثمن الأعلى، والأبيض يبقى هو البطل.",
  },
  {
    id: "ب",
    name: "الورشة",
    font: "Reem Kufi — كوفي هندسي يوازي زوايا حرف الشعار",
    idea: "لوح كريمي ينزل من حافة الصفحة يحمل علامة الشعار بحجم معماري، والقطعة تعبر الحدّ بين اللوحين فتصنع العمق.",
    best: "لو تبي هوية الشعار حاضرة من أول نظرة، والدفء أهم من الحياد.",
  },
  {
    id: "ج",
    name: "الطبقة",
    font: "Changa — خط عربي عريض حديث بإيقاع صناعي",
    idea: "خطوط الطباعة الأفقية تتراكم خلف العنوان كما يتراكم الفتيل، والقطعة داخل قوس كريمي.",
    best: "لو تبي الزائر يفهم أنها طباعة ثلاثية الأبعاد قبل ما يقرأ كلمة.",
  },
];

export default function HeroPreviewPage() {
  const db = getDb();
  // نفس بيانات المتجر الحقيقية — لا صور وهمية ولا أسعار مخترعة
  const product = db
    .prepare("SELECT * FROM products WHERE active = 1 ORDER BY id DESC LIMIT 1")
    .get() as ProductRow | undefined;

  const heroes = [
    <HeroLight key="a" product={product ?? null} displayClass={amiri.className} />,
    <HeroWorkshop key="b" product={product ?? null} displayClass={reem.className} />,
    <HeroLayers key="c" product={product ?? null} displayClass={changa.className} />,
  ];

  return (
    <div className={`${amiri.variable} ${reem.variable} ${changa.variable} bg-[#F3F1EC] pb-20`}>
      <header className="mx-auto max-w-6xl px-6 py-12">
        <h1 className="text-3xl font-extrabold text-[#2C2A22]">ثلاث شاشات هيرو — اختر واحدة</h1>
        <p className="mt-2 max-w-[60ch] leading-relaxed text-[#6B6250]">
          الثلاثة مبنية بألوان شعارك: الذهبي الزيتوني{" "}
          <code dir="ltr" className="rounded bg-white px-1.5 py-0.5 text-sm text-[#7A6935]">
            #8B7744
          </code>
          ، النحاسي{" "}
          <code dir="ltr" className="rounded bg-white px-1.5 py-0.5 text-sm text-[#9A6B3C]">
            #C39363
          </code>
          ، والكريمي{" "}
          <code dir="ltr" className="rounded bg-white px-1.5 py-0.5 text-sm text-[#6B6250]">
            #FCF3E4
          </code>
          . الأبيض بقي هو الأرضية في كل واحدة — الألوان تدخل كلمسات لا كطبقة تغطّيه.
        </p>
        <p className="mt-3 text-sm text-[#8A7059]">
          كلها تستعمل منتجاتك وأسعارك الحقيقية، وأزرارها شغّالة. قل لي الحرف
          (أ / ب / ج) وأثبّتها في الصفحة الرئيسية.
        </p>
      </header>

      {OPTIONS.map((option, i) => (
        <section key={option.id} className="mx-auto mb-16 max-w-6xl px-6">
          <div className="mb-4 flex flex-wrap items-baseline gap-x-4 gap-y-1">
            <h2 className="text-2xl font-extrabold text-[#2C2A22]">
              <span className="text-[#8B7744]">{option.id}</span> — {option.name}
            </h2>
            <span className="text-sm text-[#8A7059]">{option.font}</span>
          </div>
          <p className="mb-1 max-w-[70ch] leading-relaxed text-[#6B6250]">{option.idea}</p>
          <p className="mb-5 max-w-[70ch] text-sm font-semibold text-[#7A6935]">
            مناسبة: {option.best}
          </p>

          <div className="overflow-hidden rounded-2xl border border-[#DED6C6] bg-white shadow-[0_20px_50px_-30px_rgba(92,78,42,0.5)]">
            {heroes[i]}
          </div>
        </section>
      ))}
    </div>
  );
}
