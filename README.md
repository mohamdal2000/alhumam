# شركة الهمام المتقدمة للمقاولات العامة | Al Humam Advanced Contracting Co.

الموقع الرسمي ومنصة إدارة المحتوى ثنائية اللغة لشركة الهمام المتقدمة للمقاولات العامة (الرياض، المملكة العربية السعودية).

Official bilingual website and content management platform for Al Humam Advanced Contracting Co. (Riyadh, Kingdom of Saudi Arabia).

---

## 🌟 مميزات المشروع (Key Features)

- **تصميم هندسي فاخر ثنائي اللغة (Bilingual Architecture):**
  - دعم كامل للغتين العربية (RTL) والإنجليزية (LTR).
  - 59 صفحة ويب متكاملة (29 صفحة عربية + 29 صفحة إنجليزية + الصفحة الرئيسية).
  - محول فوري للوضع المظلم/الفاتح (Dark / Light Theme Engine) وساعة رقمية تفاعلية بتوقيت الرياض.
- **لوحة تحكم سحابية عبر Decap CMS & Netlify (Git-based Headless CMS):**
  - مسار الإدارة المباشر: `/admin/`
  - تعمل بالكامل وبشكل استاتيكي متكامل مع **GitHub Repository** عبر **Netlify Identity & Git Gateway**.
  - دعم كامل لإنشاء وتعديل المقالات والمشاريع ثنائية اللغة (Arabic / English) بصيغة Markdown & Frontmatter داخل مجلدات `data/articles/` و `data/projects/`.
  - محرك بناء وتوليد فوري للموقع `build.js` يُولّد الصفحات الثابتة HTML وبطاقات القوائم وخريطة الأرشفة `sitemap.xml` تلقائياً عند كل نشر.
  - تم الاحتفاظ بالنسخة الاحتياطية للوحة القديمة (PHP/Local) في المجلد `admin_legacy/`.
- **التوافق والاستضافة:**
  - استضافة مجانية وفائقة السرعة عبر شبكة Netlify CDN العالمية، مرتبطة بمستودع GitHub.
  - إعدادات النشر التلقائي عبر `netlify.toml` وأمر البناء `npm run build`.
- **أرشفة ومحركات البحث (SEO & GTM):**
  - خريطة موقع تلقائية ثنائية اللغة `sitemap.xml` بـ 57 رابطاً متزامناً مع وسوم `xhtml:link` البديلة.
  - تكامل كامل مع Google Tag Manager `GTM-TFXX823L`.
  - وسوم Open Graph و Twitter Cards وكافة مقاسات الأيقونات (Favicons).

---

## 📁 هيكلية المجلدات (Directory Structure)

```
alhumam/
├── admin/                  # لوحة التحكم ومحرك النشر (CMS & Admin Panel)
│   ├── config.php          # إعدادات الحماية ومسارات النظام
│   ├── index.php           # واجهة لوحة التحكم وشريط الأدوات
│   ├── publish.php         # معالج النشر والتعديل والحذف
│   ├── server.js           # سيرفر التطوير المحلي المستقل
│   └── style.css           # تصميم وتنسيقات لوحة التحكم
├── data/
│   └── content.json        # قاعدة بيانات المقالات والمشاريع (Bilingual JSON)
├── docs/                   # الملفات والوثائق الرسمية (Company Profile PDF)
├── en/                     # الصفحات الإنجليزية المستقلة (English Standalone Pages)
├── images/                 # الصور والشعارات والأيقونات والوسائط
├── pages/                  # الصفحات العربية المستقلة (Arabic Standalone Pages)
├── .gitignore              # استثناء الملفات المؤقتة والنسخ الاحتياطية
├── .htaccess               # إعدادات الأمان والتوجيه وخوادم Apache
├── article.css             # تنسيقات المقالات والمحتوى الغني والخطوط
├── article.js              # التفاعلات الخاصة بصفحات المقالات
├── config.php              # ملف الإعدادات العام
├── index.html              # الصفحة الرئيسية للموقع (عربي)
├── robots.txt              # تعليمات عناكب محركات البحث
├── script.js               # الجافاسكربت الرئيسي للموقع
├── send.php                # معالج نماذج الاتصال والرسائل
├── service.js              # التفاعلات الخاصة بصفحات الخدمات
├── sitemap.xml             # خريطة الموقع لمحركات البحث
└── style.css               # ملف التنسيقات الرئيسي للموقع
```

---

## 🚀 التشغيل المحلي (Local Development)

يمكنك تشغيل واختبار الموقع ولوحة التحكم محلياً بدون خادم PHP عبر سيرفر Node.js المدمج:

```bash
cd "F:\anti gravity\Github\alhumam"
node admin/server.js
```

- افتح المتصفح على: `http://localhost:3000/`
- لوحة الإدارة: `http://localhost:3000/admin/`
- كلمة المرور: `alhumam2026`

---

## 🌐 النشر على الاستضافة (Live Deployment)

لرفع الموقع إلى استضافة مثل ProFreeHost أو cPanel أو Hostinger:
1. ارفع كافة الملفات إلى مجلد `public_html` أو `htdocs`.
2. تأكد من إعطاء تصريح كتابة (`755` أو `777`) لمجلدي `data/` و `images/articles/`.
3. الموقع جاهز للعمل مباشرة بأعلى سرعة وأمان.
