# نشر المتجر على m3dstoreksa.com

## الوضع الحالي

| الشيء | الحالة |
|---|---|
| الدومين | `m3dstoreksa.com` يشير إلى **GitHub Pages** ويقدّم موقع «قُرب \| QRB» من مستودع `M3DStore-NFC` |
| المتجر | يعمل محليًا فقط، **غير منشور** |
| الدفع | معطّل بمفتاح `PAYMENT_LIVE` في `lib/site.ts` — الطلبات تُؤكَّد عبر واتساب |

**GitHub Pages لا يقدر يشغّل هذا المتجر.** يقدّم ملفات ثابتة فقط، والمتجر يحتاج خادم Node لأنه يشغّل ١١ مسار API وقاعدة SQLite على القرص.

---

## ما تحتاجه

**خادم VPS بنظام Ubuntu.** أرخص ما يكفي: خطة بذاكرة ‎1 GB‎ (هوستنقر، DigitalOcean، Contabo — تقريبًا ٥–٨ دولار شهريًا).

> **ليش VPS ولا استضافة مشتركة؟** الاستضافة المشتركة تشغّل PHP لا Node.
> **وليش لا Vercel؟** خطته المجانية للاستخدام غير التجاري، وقاعدة SQLite لا تبقى بين النشرات لأن قرصه مؤقت.

---

## الخطوات

### ١. جهّز الخادم

```bash
sudo apt update && sudo apt install -y nodejs npm nginx certbot python3-certbot-nginx
sudo npm install -g pm2
```

تأكد أن Node ‎20‎ أو أحدث: `node -v`. لو أقدم، ثبّته من [NodeSource](https://github.com/nodesource/distributions).

### ٢. أنزل المشروع وشغّله

```bash
git clone https://github.com/M7md-sas/M3DStore.git /var/www/m3dstore
cd /var/www/m3dstore && npm install && npm run build
```

أنشئ `.env.local` على الخادم (**غير موجود في git لأنه يحمل كلمة المرور**):

```
M3D_DATA_DIR=/var/www/m3dstore/data
ADMIN_PASSWORD=كلمة_مرور_قوية
ADMIN_SECRET=نص_عشوائي_طويل
NEXT_PUBLIC_SITE_URL=https://m3dstoreksa.com
```

ثم:

```bash
pm2 start "npm run start" --name m3dstore && pm2 save && pm2 startup
```

### ٣. انقل قاعدة البيانات والصور

منتجاتك التسعة وصورها موجودة على جهازك فقط. من ويندوز:

```bash
scp -r data public/instagram public/logo.jpg public/verify root@IP:/var/www/m3dstore/
```

> `data/` و`public/cr.*` مستثناة من git عمدًا — الأولى فيها بيانات الزبائن، والثانية تحمل رقم هويتك.

### ٤. nginx و SSL

`/etc/nginx/sites-available/m3dstore`:

```nginx
server {
  server_name m3dstoreksa.com www.m3dstoreksa.com;
  client_max_body_size 45M;
  location / {
    proxy_pass http://127.0.0.1:3000;
    proxy_set_header Host $host;
    proxy_set_header X-Forwarded-Proto $scheme;
    proxy_set_header X-Forwarded-For $proxy_add_x_forwarded_for;
  }
}
```

```bash
sudo ln -s /etc/nginx/sites-available/m3dstore /etc/nginx/sites-enabled/
sudo nginx -t && sudo systemctl reload nginx
sudo certbot --nginx -d m3dstoreksa.com -d www.m3dstoreksa.com
```

### ٥. حوّل الدومين — بهذا الترتيب

**لا تنفّذ هذه الخطوة قبل أن يعمل المتجر على الـ IP.** أي عكس للترتيب ينزّل الموقعين معًا.

1. تحقق أن `http://IP` يفتح المتجر.
2. احذف ملف `CNAME` من مستودع `M3DStore-NFC` — يحرّر الدومين من GitHub Pages.
3. في لوحة الدومين: احذف سجلات `A` الأربعة (`185.199.108-111.153`) وضع سجلًا واحدًا يشير إلى IP الخادم، و`CNAME` لـ`www`.
4. انتظر انتشار DNS (دقائق إلى ساعتين)، ثم شغّل `certbot`.

موقع QRB يبقى متاحًا على `m7md-sas.github.io/M3DStore-NFC` بعد إزالة الدومين.

---

## ترتيب ميسر

ميسر يطلب رابطًا حيًّا ليراجع المتجر، والمتجر لا يُنشر بدفع كاذب. الترتيب الذي يحلّ الحلقة:

1. **انشر المتجر بالطلب عبر واتساب** — وهو جاهز الآن. متجر حقيقي يعمل بمنتجات وأسعار.
2. **سجّل في ميسر** بوثيقة العمل الحر ورابط الموقع.
3. **ضع المفاتيح** في `.env.local`:
   ```
   MOYASAR_PUBLISHABLE_KEY=pk_test_xxx
   MOYASAR_SECRET_KEY=sk_test_xxx
   ```
4. **يُستبدل محاكي الدفع** في `app/api/pay/route.ts` بـ Moyasar SDK وwebhook يتحقق من التوقيع.
5. **ارفع `PAYMENT_LIVE` إلى `true`** في `lib/site.ts` — عندها فقط يظهر زر الدفع.

> `PAYMENT_LIVE = false` يقفل مسار `/api/pay` على الخادم (‎503‎)، لا في الواجهة فقط. فلا يمكن تعليم طلب مدفوعًا بأي طريقة.

---

## بعد النشر

```bash
cd /var/www/m3dstore && git pull && npm install && npm run build && pm2 restart m3dstore
```

**نسخة احتياطية أسبوعية** لمجلد `data/` — فيه طلباتك ومنتجاتك، ولا نسخة منه في git.
