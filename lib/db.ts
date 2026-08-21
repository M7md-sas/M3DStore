import Database from "better-sqlite3";
import path from "path";
import fs from "fs";

// نثبّت مجلد البيانات على جذر المشروع نفسه مهما كان مكان تشغيل السيرفر
function findProjectRoot(): string {
  let dir = __dirname;
  for (let i = 0; i < 12; i++) {
    const base = path.basename(dir);
    if (
      base !== ".next" &&
      base !== "node_modules" &&
      fs.existsSync(path.join(dir, "package.json")) &&
      fs.existsSync(path.join(dir, "next.config.ts"))
    ) {
      return dir;
    }
    const parent = path.dirname(dir);
    if (parent === dir) break;
    dir = parent;
  }
  return process.cwd();
}

export const projectRoot = findProjectRoot();

const dataDir = process.env.M3D_DATA_DIR || path.join(projectRoot, "data");
if (!fs.existsSync(dataDir)) fs.mkdirSync(dataDir, { recursive: true });

const uploadsDir = path.join(dataDir, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

declare global {
  // eslint-disable-next-line no-var
  var __m3dstore_db: Database.Database | undefined;
}

function createDb(): Database.Database {
  const db = new Database(path.join(dataDir, "store.db"));
  db.pragma("journal_mode = WAL");

  db.exec(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      description TEXT NOT NULL DEFAULT '',
      price REAL NOT NULL,
      category TEXT NOT NULL,
      image TEXT NOT NULL DEFAULT '',
      stock INTEGER NOT NULL DEFAULT 10,
      active INTEGER NOT NULL DEFAULT 1,
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS orders (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      city TEXT NOT NULL,
      address TEXT NOT NULL DEFAULT '',
      items_json TEXT NOT NULL,
      subtotal REAL NOT NULL,
      shipping REAL NOT NULL,
      total REAL NOT NULL,
      payment_method TEXT NOT NULL DEFAULT '',
      status TEXT NOT NULL DEFAULT 'pending_payment',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

    CREATE TABLE IF NOT EXISTS custom_requests (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      code TEXT NOT NULL UNIQUE,
      customer_name TEXT NOT NULL,
      phone TEXT NOT NULL,
      description TEXT NOT NULL,
      file_name TEXT NOT NULL DEFAULT '',
      file_path TEXT NOT NULL DEFAULT '',
      price REAL,
      status TEXT NOT NULL DEFAULT 'review',
      admin_note TEXT NOT NULL DEFAULT '',
      payment_method TEXT NOT NULL DEFAULT '',
      created_at TEXT NOT NULL DEFAULT (datetime('now'))
    );

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

  const count = db.prepare("SELECT COUNT(*) AS n FROM products").get() as { n: number };
  if (count.n === 0) seed(db);

  return db;
}

function seed(db: Database.Database) {
  const insert = db.prepare(
    "INSERT INTO products (name, description, price, category, image, stock) VALUES (?, ?, ?, ?, ?, ?)"
  );
  const rows: [string, string, number, string, string, number][] = [
    [
      "مزهرية هندسية عصرية",
      "مزهرية بتصميم هندسي متعدد الأوجه، مطبوعة بدقة عالية بخامة PLA صديقة للبيئة. مثالية لديكور المكتب أو غرفة المعيشة. متوفرة بعدة ألوان — اذكر لونك المفضل في ملاحظات الطلب.",
      45, "ديكورات وهدايا", "/products/vase.svg", 15,
    ],
    [
      "حامل جوال قابل للتعديل",
      "حامل جوال بزوايا قابلة للتعديل يناسب جميع أحجام الأجهزة، تصميم متين ومقاوم للانزلاق. مثالي للمكتب ومشاهدة المقاطع ومكالمات الفيديو.",
      25, "قطع عملية وأدوات", "/products/phone-stand.svg", 30,
    ],
    [
      "ميدالية مفاتيح باسمك",
      "ميدالية مخصصة تُطبع باسمك أو أي كلمة تختارها بخط عربي أو إنجليزي أنيق. هدية مميزة وشخصية — اكتب الاسم المطلوب في ملاحظات الطلب.",
      15, "ديكورات وهدايا", "/products/keychain.svg", 50,
    ],
    [
      "منظم مكتب متعدد الأقسام",
      "منظم مكتبي بأقسام للأقلام والملاحظات والجوال وبطاقات العمل. يرتب مكتبك بقطعة واحدة أنيقة ومتينة.",
      55, "قطع عملية وأدوات", "/products/organizer.svg", 20,
    ],
    [
      "مصباح القمر المضيء",
      "مجسم قمر ثلاثي الأبعاد بتفاصيل سطح واقعية، مع إضاءة LED دافئة هادئة. قطعة ديكور ساحرة لغرف النوم والمجالس، وهدية لا تُنسى.",
      89, "ديكورات وهدايا", "/products/moon-lamp.svg", 10,
    ],
    [
      "حامل سماعات رأس",
      "حامل أنيق لسماعات الرأس يحفظها من الخدوش ويرتب مكتبك. قاعدة ثابتة وتصميم انسيابي يناسب جميع السماعات.",
      39, "قطع عملية وأدوات", "/products/headphone-stand.svg", 25,
    ],
    [
      "أصيص نباتات هندسي",
      "أصيص بتصميم هندسي مميز مع صحن تصريف داخلي، مثالي للنباتات الصغيرة والصباريات. يضيف لمسة عصرية لأي ركن.",
      35, "ديكورات وهدايا", "/products/planter.svg", 18,
    ],
    [
      "خطاف تعليق جداري (طقم 4 قطع)",
      "طقم خطاطيف جدارية قوية التحمل للمفاتيح والحقائب والإكسسوارات، بتصميم بسيط يندمج مع أي ديكور. تركيب سهل بدون أدوات معقدة.",
      29, "قطع عملية وأدوات", "/products/wall-hook.svg", 40,
    ],
  ];
  const tx = db.transaction(() => {
    for (const r of rows) insert.run(...r);
  });
  tx();
}

export function getDb(): Database.Database {
  if (!global.__m3dstore_db) global.__m3dstore_db = createDb();
  return global.__m3dstore_db;
}

export function generateCode(prefix: "ORD" | "CST"): string {
  const n = Math.floor(100000 + Math.random() * 900000);
  return `${prefix}-${n}`;
}

export { uploadsDir };
