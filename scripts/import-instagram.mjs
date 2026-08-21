#!/usr/bin/env node
/**
 * استيراد بوستات إنستقرام من ملف التصدير الرسمي إلى قاعدة بيانات المتجر.
 *
 *   node scripts/import-instagram.mjs "C:\\Users\\...\\instagram-export.zip"
 *   node scripts/import-instagram.mjs "C:\\Users\\...\\instagram-export"   (مجلد مفكوك)
 *
 * الخيارات:
 *   --force   إعادة فك ضغط الملف حتى لو كان مفكوكًا من قبل
 *   --dry     تحليل فقط بدون نسخ صور أو كتابة في قاعدة البيانات
 *   --logo    استبدال شعار الموقع بصورة حساب إنستقرام حتى لو كان فيه شعار
 *
 * السكربت idempotent: تشغيله مرتين لا يكرّر أي بوست ولا أي صورة.
 */
import fs from "fs";
import path from "path";
import crypto from "crypto";
import { execFileSync } from "child_process";
import { fileURLToPath } from "url";
import Database from "better-sqlite3";

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), "..");
const OUT_DIR = path.join(ROOT, "public", "instagram");
const EXTRACT_ROOT = path.join(ROOT, ".instagram-export");

const IMAGE_EXT = new Set([".jpg", ".jpeg", ".png", ".webp", ".avif", ".heic"]);
const VIDEO_EXT = new Set([".mp4", ".mov", ".m4v", ".webm", ".gif"]);
// نفس ترتيب الأولوية في lib/logo.ts
const LOGO_NAMES = ["logo.svg", "logo.png", "logo.webp", "logo.jpg", "logo.jpeg"];

const args = process.argv.slice(2);
const FORCE = args.includes("--force");
const DRY = args.includes("--dry");
const FORCE_LOGO = args.includes("--logo");
const inputArg = args.find((a) => !a.startsWith("--"));

// ── أدوات مساعدة ────────────────────────────────────────────────────────────

function die(msg) {
  console.error(`\n❌ ${msg}\n`);
  process.exit(1);
}

/** قراءة M3D_DATA_DIR من .env.local حتى نكتب في نفس قاعدة بيانات الموقع */
function loadEnvLocal() {
  const file = path.join(ROOT, ".env.local");
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const m = /^\s*([A-Z0-9_]+)\s*=\s*(.*?)\s*$/.exec(line);
    if (!m) continue;
    const value = m[2].replace(/^["']|["']$/g, "");
    if (!(m[1] in process.env)) process.env[m[1]] = value;
  }
}

/**
 * إنستقرام يكتب في ملف التصدير بايتات UTF-8 مهروبة كأنها Latin-1،
 * فالكابشن العربي يخرج مثل "Ø§ÙØ³ÙØ§Ù" بدل "السلام".
 * نصلحه فقط عندما ينتج التحويل نصًا غير لاتيني سليمًا، وإلا نُبقي الأصل.
 */
function fixMojibake(input) {
  if (typeof input !== "string" || input === "") return "";
  if (!/[\u0080-\u00ff]/.test(input)) return input;
  try {
    const decoded = Buffer.from(input, "latin1").toString("utf8");
    if (decoded.includes("\uFFFD")) return input;
    const meaningful =
      /[\u0600-\u06FF\u0750-\u077F\u08A0-\u08FF]/u.test(decoded) || // عربي
      /[\u{1F000}-\u{1FAFF}\u2600-\u27BF]/u.test(decoded); // إيموجي
    return meaningful ? decoded : input;
  } catch {
    return input;
  }
}

function walk(dir, onFile) {
  let entries;
  try {
    entries = fs.readdirSync(dir, { withFileTypes: true });
  } catch {
    return;
  }
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) walk(full, onFile);
    else if (entry.isFile()) onFile(full);
  }
}

function sha1(value) {
  return crypto.createHash("sha1").update(value).digest("hex");
}

/** أول سطر من الكابشن كاسم مقترح للمنتج، بدون هاشتاقات */
function captionTitle(caption, max = 60) {
  const line = caption
    .split("\n")
    .map((l) => l.trim())
    .find((l) => l.length > 0);
  if (!line) return "";
  const clean = line
    .replace(/#[^\s#]+/g, "")
    .replace(/\s+/g, " ")
    .trim();
  return clean.length > max ? `${clean.slice(0, max).trim()}…` : clean;
}

function normalizeUri(uri) {
  return uri.replace(/\\/g, "/").replace(/^\.?\/+/, "").toLowerCase();
}

/**
 * الامتداد الحقيقي من بايتات الملف نفسه، لا من اسمه.
 * إنستقرام يصدّر صور آيفون باسم .heic بينما محتواها JPEG عادي،
 * والامتداد الخاطئ يعطي Content-Type غلط ويُخرج الصورة من منتقي الصور في اللوحة.
 */
function sniffExtension(file, fallback) {
  let head;
  try {
    const fd = fs.openSync(file, "r");
    head = Buffer.alloc(16);
    fs.readSync(fd, head, 0, 16, 0);
    fs.closeSync(fd);
  } catch {
    return fallback;
  }

  if (head[0] === 0xff && head[1] === 0xd8) return ".jpg";
  if (head.subarray(0, 8).equals(Buffer.from([0x89, 0x50, 0x4e, 0x47, 0x0d, 0x0a, 0x1a, 0x0a])))
    return ".png";
  if (head.subarray(0, 4).toString("ascii") === "RIFF" && head.subarray(8, 12).toString("ascii") === "WEBP")
    return ".webp";
  if (head.subarray(4, 8).toString("ascii") === "ftyp") {
    const brand = head.subarray(8, 12).toString("ascii");
    if (brand.startsWith("avif")) return ".avif";
    return ".heic";
  }
  return fallback;
}

// ── ١) تحديد مجلد التصدير ───────────────────────────────────────────────────

function resolveExportDir(input) {
  if (!input) {
    die(
      "أعطني مسار ملف التصدير.\n" +
        '   مثال: node scripts/import-instagram.mjs "C:\\Users\\7m010\\Downloads\\instagram-export.zip"'
    );
  }
  const abs = path.resolve(input);
  if (!fs.existsSync(abs)) die(`المسار غير موجود:\n   ${abs}`);

  if (fs.statSync(abs).isDirectory()) return abs;

  if (path.extname(abs).toLowerCase() !== ".zip")
    die(`المتوقع مجلد أو ملف .zip، لكن وصلني:\n   ${abs}`);

  const target = path.join(EXTRACT_ROOT, path.basename(abs, ".zip"));
  const alreadyExtracted = fs.existsSync(target) && fs.readdirSync(target).length > 0;

  if (alreadyExtracted && !FORCE) {
    console.log(`📂 استخدام المجلد المفكوك مسبقًا (استخدم --force لإعادة الفك):\n   ${target}`);
    return target;
  }

  if (alreadyExtracted) fs.rmSync(target, { recursive: true, force: true });
  fs.mkdirSync(target, { recursive: true });

  console.log("📦 فكّ ضغط ملف التصدير… (قد يأخذ دقائق للملفات الكبيرة)");
  const psQuote = (s) => `'${s.replace(/'/g, "''")}'`;

  // ExtractToDirectory من .NET يتعامل مع الملفات الكبيرة بكفاءة،
  // بينما Expand-Archive في PowerShell 5.1 ينهار بـ OutOfMemoryException.
  const strategies = [
    `Add-Type -AssemblyName System.IO.Compression.FileSystem; [System.IO.Compression.ZipFile]::ExtractToDirectory(${psQuote(
      abs
    )}, ${psQuote(target)})`,
    `Expand-Archive -LiteralPath ${psQuote(abs)} -DestinationPath ${psQuote(target)} -Force`,
  ];

  for (const [i, command] of strategies.entries()) {
    try {
      execFileSync("powershell.exe", ["-NoProfile", "-Command", command], {
        stdio: i === 0 ? "pipe" : "inherit",
      });
      return target;
    } catch (error) {
      if (i === 0) {
        console.log("   الطريقة الأولى فشلت، أجرّب البديل…");
        // تنظيف أي بقايا جزئية قبل المحاولة التالية
        fs.rmSync(target, { recursive: true, force: true });
        fs.mkdirSync(target, { recursive: true });
        continue;
      }
      console.error(String(error?.stderr ?? error?.message ?? error).slice(0, 500));
    }
  }

  die(
    "فشل فكّ الضغط بكل الطرق.\n" +
      "   فكّ الملف يدويًا (كليك يمين ← Extract All) ثم مرّر مسار المجلد بدل ملف الـ ZIP."
  );
}

// ── ٢) فهرسة ملفات التصدير ──────────────────────────────────────────────────

/**
 * مسارات الوسائط داخل JSON نسبية لجذر التصدير، لكن الجذر قد يكون متداخلًا
 * داخل مجلد باسم الحساب. نبني فهرسًا بلاحقة المسار وباسم الملف معًا حتى
 * نلقى كل صورة مهما كان مستوى التداخل.
 */
function indexFiles(root) {
  const bySuffix = new Map();
  const byName = new Map();
  let total = 0;

  walk(root, (full) => {
    total++;
    const rel = path.relative(root, full).replace(/\\/g, "/").toLowerCase();
    const parts = rel.split("/");
    for (let i = 0; i < parts.length; i++) {
      const suffix = parts.slice(i).join("/");
      if (!bySuffix.has(suffix)) bySuffix.set(suffix, full);
    }
    const name = parts[parts.length - 1];
    if (!byName.has(name)) byName.set(name, full);
  });

  return { bySuffix, byName, total };
}

function resolveMedia(uri, index) {
  if (typeof uri !== "string" || !uri) return null;
  const clean = normalizeUri(uri);
  return index.bySuffix.get(clean) ?? index.byName.get(clean.split("/").pop()) ?? null;
}

// ── ٣) قراءة بوستات إنستقرام ────────────────────────────────────────────────

function findPostFiles(root) {
  const files = [];
  walk(root, (full) => {
    if (/^posts(_\d+)?\.json$/i.test(path.basename(full))) files.push(full);
  });
  return files.sort();
}

/**
 * صورة الحساب من التصدير تُركَّب كشعار للموقع (public/logo.<ext>).
 * لا تُستبدَل إن كان فيه شعار موجود، إلا مع --logo.
 */
function installLogo(root, index) {
  const existing = LOGO_NAMES.map((n) => path.join(ROOT, "public", n)).find((f) =>
    fs.existsSync(f)
  );
  if (existing && !FORCE_LOGO) {
    return { status: "kept", file: path.basename(existing) };
  }

  const jsonFiles = [];
  walk(root, (full) => {
    if (/^profile_photos?\.json$/i.test(path.basename(full))) jsonFiles.push(full);
  });

  const entries = [];
  for (const file of jsonFiles) {
    for (const entry of readPostArray(file)) {
      const uri = entry?.uri ?? entry?.media?.[0]?.uri;
      if (typeof uri === "string") {
        entries.push({ uri, ts: Number(entry?.creation_timestamp ?? 0) });
      }
    }
  }
  if (entries.length === 0) return { status: "notfound" };

  // أحدث صورة حساب
  entries.sort((a, b) => b.ts - a.ts);
  const source = resolveMedia(entries[0].uri, index);
  if (!source) return { status: "notfound" };

  const ext = sniffExtension(source, path.extname(source).toLowerCase() || ".jpg");
  const target = path.join(ROOT, "public", `logo${ext}`);
  if (!DRY) {
    // إزالة أي شعار بامتداد مختلف حتى لا يتنازع اثنان
    for (const n of LOGO_NAMES) {
      const f = path.join(ROOT, "public", n);
      if (f !== target && fs.existsSync(f)) fs.rmSync(f);
    }
    fs.copyFileSync(source, target);
  }
  return { status: "installed", file: `logo${ext}` };
}

function readPostArray(file) {
  let json;
  try {
    json = JSON.parse(fs.readFileSync(file, "utf8"));
  } catch {
    console.warn(`⚠️  تعذّرت قراءة ${path.basename(file)} — ملف JSON غير سليم، تخطّيته.`);
    return [];
  }
  if (Array.isArray(json)) return json;
  // بعض الإصدارات تلفّ المصفوفة داخل كائن بمفتاح واحد
  return Object.values(json ?? {}).find(Array.isArray) ?? [];
}

// ── ٤) التنفيذ ──────────────────────────────────────────────────────────────

loadEnvLocal();
const DATA_DIR = process.env.M3D_DATA_DIR || path.join(ROOT, "data");
const DB_PATH = path.join(DATA_DIR, "store.db");

const exportDir = resolveExportDir(inputArg);
console.log("🔎 فحص محتويات التصدير…");

const index = indexFiles(exportDir);
const postFiles = findPostFiles(exportDir);

if (postFiles.length === 0) {
  die(
    `ما لقيت ملف بوستات (posts_1.json) داخل:\n   ${exportDir}\n\n` +
      '   تأكد أنك طلبت التصدير بصيغة JSON وليس HTML، وأنك علّمت "Posts".\n' +
      `   (فُحص ${index.total} ملف)`
  );
}
console.log(`   وجدت ${postFiles.length} ملف بوستات، و${index.total} ملف إجمالًا.`);

const posts = [];
for (const file of postFiles) {
  for (const entry of readPostArray(file)) {
    const media = Array.isArray(entry?.media) ? entry.media : [];
    if (media.length === 0) continue;
    posts.push({
      caption: fixMojibake(entry?.title || media[0]?.title || ""),
      ts: Number(entry?.creation_timestamp || media[0]?.creation_timestamp || 0),
      media,
    });
  }
}

if (posts.length === 0) die("ملفات البوستات موجودة لكنها فاضية — ما فيه بوستات للاستيراد.");

posts.sort((a, b) => b.ts - a.ts);

const stats = {
  posts: posts.length,
  imported: 0,
  skippedNoImage: 0,
  videosSkipped: 0,
  imagesCopied: 0,
  imagesReused: 0,
  missingFiles: 0,
  inserted: 0,
  updated: 0,
  productsCreated: 0,
};

if (!DRY) fs.mkdirSync(OUT_DIR, { recursive: true });

const db = DRY ? null : new Database(DB_PATH);
if (db) {
  db.pragma("journal_mode = WAL");
  // نفس تعريف الجدول في lib/db.ts — آمن لأنه IF NOT EXISTS
  db.exec(`
    CREATE TABLE IF NOT EXISTS instagram_posts (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      source_key TEXT NOT NULL UNIQUE,
      caption TEXT NOT NULL DEFAULT '',
      image TEXT NOT NULL,
      extra_images TEXT NOT NULL DEFAULT '[]',
      taken_at TEXT NOT NULL DEFAULT '',
      hidden INTEGER NOT NULL DEFAULT 0,
      product_id INTEGER,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );
  `);
}

const findExisting = db?.prepare(
  "SELECT id, product_id FROM instagram_posts WHERE source_key = ?"
);
const insertProduct = db?.prepare(
  "INSERT INTO products (name, description, price, category, image, stock, active) VALUES (?, ?, ?, ?, ?, 0, 0)"
);
const linkProduct = db?.prepare("UPDATE instagram_posts SET product_id = ? WHERE source_key = ?");
const upsert = db?.prepare(`
  INSERT INTO instagram_posts (source_key, caption, image, extra_images, taken_at)
  VALUES (@source_key, @caption, @image, @extra_images, @taken_at)
  ON CONFLICT(source_key) DO UPDATE SET
    caption      = excluded.caption,
    image        = excluded.image,
    extra_images = excluded.extra_images,
    taken_at     = excluded.taken_at
`);

/** ينسخ ملف وسائط إلى public/instagram ويرجّع مساره العام */
function copyImage(uri) {
  const source = resolveMedia(uri, index);
  if (!source) {
    stats.missingFiles++;
    return null;
  }
  const ext = sniffExtension(source, path.extname(source).toLowerCase() || ".jpg");
  const outName = `${sha1(normalizeUri(uri)).slice(0, 16)}${ext}`;
  const outPath = path.join(OUT_DIR, outName);

  if (fs.existsSync(outPath) && fs.statSync(outPath).size === fs.statSync(source).size) {
    stats.imagesReused++;
  } else {
    if (!DRY) fs.copyFileSync(source, outPath);
    stats.imagesCopied++;
  }
  return `/instagram/${outName}`;
}

function run() {
  for (const post of posts) {
    const images = [];
    for (const item of post.media) {
      const uri = item?.uri;
      if (typeof uri !== "string") continue;
      const ext = path.extname(uri).toLowerCase();

      if (VIDEO_EXT.has(ext)) {
        stats.videosSkipped++;
        continue;
      }
      if (!IMAGE_EXT.has(ext)) continue;

      const publicPath = copyImage(uri);
      if (publicPath) images.push({ uri, publicPath });
    }

    if (images.length === 0) {
      stats.skippedNoImage++;
      continue;
    }

    const record = {
      source_key: sha1(normalizeUri(images[0].uri)),
      caption: post.caption,
      image: images[0].publicPath,
      extra_images: JSON.stringify(images.slice(1).map((i) => i.publicPath)),
      taken_at: post.ts ? new Date(post.ts * 1000).toISOString() : "",
    };

    if (db) {
      const existed = findExisting.get(record.source_key);
      upsert.run(record);
      if (existed) stats.updated++;
      else stats.inserted++;

      // كل بوست يصير منتجًا في المتجر — مخفيًا حتى يُحدَّد سعره من اللوحة.
      // البوستات التي لها منتج مسبقًا لا تُنشئ منتجًا جديدًا، ولا يُلمس ما عدّله صاحب المتجر.
      if (!existed?.product_id) {
        const info = insertProduct.run(
          captionTitle(record.caption) || "منتج من إنستقرام",
          record.caption,
          0,
          "ديكورات وهدايا",
          record.image
        );
        linkProduct.run(Number(info.lastInsertRowid), record.source_key);
        stats.productsCreated++;
      }
    }
    stats.imported++;
  }
}

if (db) db.transaction(run)();
else run();

db?.close();

const logo = installLogo(exportDir, index);

// ── ٥) الملخص ───────────────────────────────────────────────────────────────

const arabicSample = posts.find((p) => /[\u0600-\u06FF]/.test(p.caption));

console.log(`
${DRY ? "🧪 وضع التحليل فقط (--dry) — ما تغيّر شيء" : "✅ اكتمل الاستيراد"}
──────────────────────────────────────────
  بوستات في ملف التصدير .... ${stats.posts}
  بوستات مستوردة ........... ${stats.imported}
     منها جديدة ............ ${stats.inserted}
     منها محدَّثة ........... ${stats.updated}
  منتجات جديدة أُنشئت ....... ${stats.productsCreated}
  صور منسوخة ............... ${stats.imagesCopied}
  صور موجودة مسبقًا ......... ${stats.imagesReused}
  فيديوهات متخطّاة .......... ${stats.videosSkipped}
  بوستات بلا صورة .......... ${stats.skippedNoImage}
  ملفات مفقودة ............. ${stats.missingFiles}
  شعار الموقع .............. ${
    logo.status === "installed"
      ? `✅ رُكِّب من صورة حسابك (public/${logo.file})`
      : logo.status === "kept"
        ? `موجود مسبقًا (public/${logo.file}) — استخدم --logo للاستبدال`
        : "ما وُجدت صورة حساب في التصدير"
  }
──────────────────────────────────────────
  قاعدة البيانات: ${DB_PATH}
  الصور: ${OUT_DIR}
`);

if (arabicSample) {
  console.log(
    `نموذج كابشن عربي (للتأكد من سلامة الترميز):\n   «${arabicSample.caption.split("\n")[0].slice(0, 80)}»\n`
  );
} else if (stats.imported > 0) {
  console.log("ℹ️  ما لقيت كابشنات عربية — إذا كانت بوستاتك عربية راجع الترميز.\n");
}

if (!DRY && stats.productsCreated > 0) {
  console.log(
    `التالي: شغّل الموقع (npm run dev) وافتح /admin ← تبويب «إنستقرام».
${stats.productsCreated} منتج بانتظار التسعير — حدّد سعر كل واحد واضغط «نشر» ليظهر في المتجر.\n`
  );
}
