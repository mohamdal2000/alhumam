/**
 * Al Humam Advanced Contracting — Local Development Server & Bilingual CMS Runner
 * Allows testing the CMS locally with Node.js before uploading PHP files to ProFreeHost / Hostinger!
 * 
 * Features:
 * - Full Bilingual Support: Arabic & English standalone article pages
 * - Synchronous Multi-Page Updates:
 *   * pages/media.html or pages/projects.html (Arabic subpage)
 *   * en/media.html or en/projects.html (English subpage)
 *   * index.html (Arabic root homepage)
 *   * en/index.html (English root homepage)
 * - Automatic Bilingual Sitemap.xml Synchronization on Add / Edit / Delete
 * - Full Arabic RTL Management Dashboard with Edit Mode & Preview Buttons
 * 
 * Usage: node admin/server.js
 * Access: http://localhost:3000/admin/
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const url = require('url');

const PORT = 3000;
const ROOT = path.resolve(__dirname, '..');
const ADMIN_PASSWORD = 'alhumam2026';

const mimeTypes = {
  '.html': 'text/html; charset=utf-8',
  '.css': 'text/css',
  '.js': 'application/javascript',
  '.json': 'application/json',
  '.svg': 'image/svg+xml',
  '.png': 'image/png',
  '.jpg': 'image/jpeg',
  '.jpeg': 'image/jpeg',
  '.webp': 'image/webp',
  '.avif': 'image/avif',
  '.ico': 'image/x-icon'
};

function escapeHtml(str) {
  if (!str) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function escapeRegex(str) {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function parseCookies(req) {
  const list = {};
  const rc = req.headers.cookie;
  if (rc) {
    rc.split(';').forEach(cookie => {
      const parts = cookie.split('=');
      list[parts.shift().trim()] = decodeURI(parts.join('='));
    });
  }
  return list;
}

function loadData() {
  const file = path.join(ROOT, 'data', 'content.json');
  if (fs.existsSync(file)) {
    try {
      return JSON.parse(fs.readFileSync(file, 'utf8'));
    } catch(e) {}
  }
  return { articles: [], projects: [] };
}

function saveData(data) {
  const file = path.join(ROOT, 'data', 'content.json');
  fs.writeFileSync(file, JSON.stringify(data, null, 2), 'utf8');
}

function updateSitemap(fileName, action = 'add') {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return;
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const locAr = 'https://alhumam.sa/pages/' + fileName;
  const locEn = 'https://alhumam.sa/en/' + fileName;
  const today = new Date().toISOString().split('T')[0];

  if (action === 'delete') {
    const regexAr = new RegExp(`[\\t ]*<url>\\s*<loc>${escapeRegex(locAr)}<\\/loc>[\\s\\S]*?<\\/url>\\s*`, 'gi');
    const regexEn = new RegExp(`[\\t ]*<url>\\s*<loc>${escapeRegex(locEn)}<\\/loc>[\\s\\S]*?<\\/url>\\s*`, 'gi');
    sitemap = sitemap.replace(regexAr, '').replace(regexEn, '');
    fs.writeFileSync(sitemapPath, sitemap, 'utf8');
    return;
  }

  if (sitemap.includes(`<loc>${locAr}</loc>`)) {
    const regexAr = new RegExp(`(<loc>${escapeRegex(locAr)}<\\/loc>[\\s\\S]*?<lastmod>)[^<]+(<\\/lastmod>)`, 'i');
    sitemap = sitemap.replace(regexAr, `$1${today}$2`);
  }
  if (sitemap.includes(`<loc>${locEn}</loc>`)) {
    const regexEn = new RegExp(`(<loc>${escapeRegex(locEn)}<\\/loc>[\\s\\S]*?<lastmod>)[^<]+(<\\/lastmod>)`, 'i');
    sitemap = sitemap.replace(regexEn, `$1${today}$2`);
  }
  if (!sitemap.includes(`<loc>${locAr}</loc>`) && !sitemap.includes(`<loc>${locEn}</loc>`)) {
    const newBlock = `  <url>\r\n    <loc>${locAr}</loc>\r\n    <xhtml:link rel="alternate" hreflang="ar" href="${locAr}"/>\r\n    <xhtml:link rel="alternate" hreflang="en" href="${locEn}"/>\r\n    <xhtml:link rel="alternate" hreflang="x-default" href="${locAr}"/>\r\n    <lastmod>${today}</lastmod>\r\n    <changefreq>monthly</changefreq>\r\n    <priority>0.8</priority>\r\n  </url>\r\n  <url>\r\n    <loc>${locEn}</loc>\r\n    <xhtml:link rel="alternate" hreflang="en" href="${locEn}"/>\r\n    <xhtml:link rel="alternate" hreflang="ar" href="${locAr}"/>\r\n    <xhtml:link rel="alternate" hreflang="x-default" href="${locAr}"/>\r\n    <lastmod>${today}</lastmod>\r\n    <changefreq>monthly</changefreq>\r\n    <priority>0.8</priority>\r\n  </url>\r\n</urlset>`;
    sitemap = sitemap.replace('</urlset>', newBlock);
  }
  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

function removeCardFromListing(pagePath, fileName, type) {
  if (!fs.existsSync(pagePath)) return false;
  let html = fs.readFileSync(pagePath, 'utf8');
  if (!html || html.length < 500) return false;

  const baseSlug = path.basename(fileName, '.html');
  if (!baseSlug) return false;

  const hrefPattern = 'href=["\'][^"\']*?' + escapeRegex(baseSlug) + '(?:\\.html)?["\']';

  let cleaned = html;
  if (type === 'article') {
    const mediaRegex = new RegExp('(?:\\r?\\n)?[\\t ]*<article\\b[^>]*class=["\'][^"\']*?\\bmedia-card\\b[^"\']*?["\'][^>]*>(?:(?!<article\\b)[\\s\\S])*?' + hrefPattern + '[\\s\\S]*?<\\/article>', 'gi');
    cleaned = html.replace(mediaRegex, '');
  } else {
    // Project card has 3 closing </div> tags
    const projRegex = new RegExp('(?:\\r?\\n)?[\\t ]*<div\\b[^>]*class=["\'][^"\']*?\\bproject-card\\b(?!__)[^"\']*?["\'][^>]*>(?:(?!<div\\b[^>]*class=["\'][^"\']*?\\bproject-card\\b(?!__))([\\s\\S]))*?' + hrefPattern + '(?:(?!<div\\b)[\\s\\S])*?<\\/div>\\s*<\\/div>', 'gi');
    cleaned = html.replace(projRegex, '');
  }
  if (cleaned && cleaned !== html && cleaned.length >= (html.length - 15000)) {
    fs.writeFileSync(pagePath, cleaned, 'utf8');
    return true;
  }
  return false;
}

/**
 * Sanitizes and formats article body HTML safely while preserving rich formatting
 * (h2, h3, h4, strong, b, em, i, span.gold-text, blockquote, ul, ol, li, p, br, a).
 * If plain text without tags is provided, converts paragraphs to <p> tags.
 */
function sanitizeArticleHtml(content) {
  if (!content) return '';
  const hasTags = /<[a-z][\s\S]*>/i.test(content);
  if (hasTags) {
    let clean = content.replace(/<\s*(script|iframe|object|embed|applet|meta|link|style|form|input|button|select)[^>]*>[\s\S]*?<\s*\/\s*\1\s*>/gi, '');
    clean = clean.replace(/<\s*(script|iframe|object|embed|applet|meta|link|style|form|input|button|select)[^>]*\/?>/gi, '');
    clean = clean.replace(/\s*on[a-z]+\s*=\s*("[^"]*"|'[^']*'|[^\s>]+)/gi, '');
    clean = clean.replace(/href\s*=\s*["']\s*javascript:[^"']*["']/gi, 'href="#"');

    const lines = clean.split('\r\n');
    const result = [];
    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed) continue;
      if (/^<(h[1-6]|p|ul|ol|li|blockquote|div)\b/i.test(trimmed)) {
        result.push('                ' + trimmed);
      } else {
        result.push('                <p>' + trimmed + '</p>');
      }
    }
    return result.join('\r\n');
  } else {
    const paras = content.trim().split(/\r?\r\n\s*\r?\r\n/);
    const result = [];
    for (const para of paras) {
      const trimmed = para.trim();
      if (trimmed) {
        const withBr = escapeHtml(trimmed).replace(/\r?\r\n/g, '<br>');
        result.push('                <p>' + withBr + '</p>');
      }
    }
    return result.join('\r\n');
  }
}

function injectCardIntoGrid(pagePath, gridClass, cardHtml) {
  if (!fs.existsSync(pagePath)) return false;
  let content = fs.readFileSync(pagePath, 'utf8');
  if (!content || content.length < 500) return false;

  const pattern = new RegExp(`(<div\\b[^>]*class="[^"]*\\b${escapeRegex(gridClass)}\\b[^"]*"[^>]*>)`, 'i');
  if (pattern.test(content)) {
    const updated = content.replace(pattern, `$1\r\n${cardHtml}`);
    if (updated && updated.length > content.length) {
      fs.writeFileSync(pagePath, updated, 'utf8');
      return true;
    }
  }
  return false;
}


function applySiteTemplate(pageHtml, templatePath, altDir, fileName, type) {
  try {
    if (!fs.existsSync(templatePath)) return pageHtml;
    const tpl = fs.readFileSync(templatePath, 'utf8');
    if (!tpl || tpl.length < 5000) return pageHtml;
    const hStart = tpl.indexOf('<div class="site-main-bg"></div>');
    const hEnd = tpl.indexOf('</header>');
    const fStart = tpl.indexOf('<!-- ============ FOOTER ============ -->');
    const fEnd = tpl.lastIndexOf('</body>');
    if (hStart < 0 || hEnd < hStart || fStart < 0 || fEnd < fStart) return pageHtml;
    let header = tpl.slice(hStart, hEnd + 9);
    let footer = tpl.slice(fStart, fEnd);
    header = header.replace(/href="\.\.\/(en|pages)\/article-[^"]+"/, 'href="../' + altDir + '/' + fileName + '"');
    header = header.split(' nav__link--active').join('');
    const activeHref = type === 'project' ? 'projects\\.html' : 'media\\.html';
    header = header.replace(new RegExp('(<a href="' + activeHref + '"[^>]*class="nav__link)"'), '$1 nav__link--active"');
    footer = footer.replace(/\s*<script src="\.\.\/(script|article)\.js[^"]*"><\/script>/g, '').trimEnd()
      + '\r\n    <script src="../script.js?v=13.9"></script>\r\n    <script src="../article.js?v=14.0"></script>\r\n';
    // Back link identical to static pages
    let page = pageHtml.replace(/\s*<div style="margin-top: 45px;[^"]*">\s*<a href="([^"]+)" class="btn-primary"[^>]*data-en="([^"]*)" data-ar="([^"]*)">([^<]*)<\/a>\s*<\/div>\s*<\/div>\s*<\/div>/,
      (m, href, en, ar, txt) => {
        const isAr = /[\u0600-\u06FF]/.test(txt);
        const backEn = href.indexOf('projects') === 0 ? 'BACK TO PROJECTS' : 'BACK TO MEDIA CENTER';
        const backAr = href.indexOf('projects') === 0 ? 'العودة للمشاريع' : 'العودة للمركز الإعلامي';
        return '\r\n        </div>\r\n        <div class="article-back">\r\n            <a href="' + href + '" class="svc-cta__btn" data-en="' + backEn + '" data-ar="' + backAr + '">' + (isAr ? backAr : backEn) + '</a>\r\n        </div>\r\n    </div>';
      });
    const pStart = page.indexOf('<div class="site-main-bg"></div>');
    const pHeaderEnd = page.indexOf('</header>');
    const pFooterStart = page.indexOf('<!-- ============ FOOTER ============ -->');
    const pEnd = page.lastIndexOf('</body>');
    if (pStart < 0 || pHeaderEnd < 0 || pFooterStart < 0 || pEnd < 0) return pageHtml;
    const result = page.slice(0, pStart) + header + page.slice(pHeaderEnd + 9, pFooterStart) + footer + page.slice(pEnd);
    return result.length > 3000 ? result : pageHtml;
  } catch (e) { return pageHtml; }
}

function generateArabicArticlePage({ fileName, title_ar, title_en, category_ar, date_ar, date_en, author_ar, author_en, scope_ar, image, excerpt_ar, paragraphsHtmlAr, type }) {
  const backUrl = type === 'project' ? 'projects.html' : 'media.html';
  const backTextAr = type === 'project' ? '← العودة إلى قائمة مشاريعنا' : '← العودة إلى المركز الإعلامي';
  const backTextEn = type === 'project' ? '← Back to Featured Projects' : '← Back to Media Center';

  return `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="../favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600&family=Rajdhani:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css?v=13.9">
    <link rel="stylesheet" href="../article.css">
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-TFXX823L');</script>
    <!-- End Google Tag Manager -->
    <title>${escapeHtml(title_ar)} | شركة الهمام المتقدمة</title>
    <meta name="description" content="${escapeHtml(excerpt_ar)}">
    <link rel="canonical" href="https://alhumam.sa/pages/${fileName}">
    <link rel="alternate" hreflang="ar" href="https://alhumam.sa/pages/${fileName}">
    <link rel="alternate" hreflang="en" href="https://alhumam.sa/en/${fileName}">
    <link rel="alternate" hreflang="x-default" href="https://alhumam.sa/pages/${fileName}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title_ar)} | شركة الهمام المتقدمة">
    <meta property="og:description" content="${escapeHtml(excerpt_ar)}">
    <meta property="og:url" content="https://alhumam.sa/pages/${fileName}">
    <meta property="og:site_name" content="شركة الهمام المتقدمة للمقاولات | Al Humam Advanced">
    <meta property="og:image" content="${escapeHtml(image)}">
</head>
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TFXX823L"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <div class="site-main-bg"></div>

    <!-- ============ TOP UTILITY BAR ============ -->
    <div class="top-utility-bar" id="topUtilityBar" aria-hidden="true">
        <div class="utility-bar__clock">
            <svg class="utility-bar__clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <time class="utility-bar__time" id="utilityClockTime">00:00</time>
        </div>
        <div class="utility-bar__label">
            <span class="utility-bar__dot"></span>
            <span class="utility-bar__label-en">RIYADH, KSA</span>
            <span class="utility-bar__label-ar">الرياض، السعودية</span>
        </div>
    </div>

    <!-- ============ HEADER ============ -->
    <header class="header" id="header">
        <div class="header__container">
            <a href="../index.html" class="header__logo">
                <span class="logo-text logo-text--en">AL HUMAM<span class="logo-accent"> ADVANCED</span></span>
                <span class="logo-text logo-text--ar">الهمام المتقدمة<span class="logo-accent"> للمقاولات</span></span>
            </a>
            <nav class="header__nav" id="mainNav">
                <ul class="nav__list">
                    <li><a href="about.html" class="nav__link" data-en="ABOUT US" data-ar="من نحن">من نحن</a></li>
                    <li><a href="sustainability.html" class="nav__link" data-en="SUSTAINABILITY" data-ar="الاستدامة">الاستدامة</a></li>
                    <li><a href="services.html" class="nav__link" data-en="SERVICES" data-ar="خدماتنا">خدماتنا</a></li>
                    <li><a href="projects.html" class="nav__link ${type === 'project' ? 'nav__link--active' : ''}" data-en="PROJECTS" data-ar="مشاريعنا">مشاريعنا</a></li>
                    <li><a href="innovation.html" class="nav__link" data-en="INNOVATION" data-ar="الابتكار">الابتكار</a></li>
                    <li><a href="media.html" class="nav__link ${type === 'article' ? 'nav__link--active' : ''}" data-en="MEDIA CENTER" data-ar="المركز الإعلامي">المركز الإعلامي</a></li>
                    <li><a href="careers.html" class="nav__link" data-en="CAREERS" data-ar="التوظيف">التوظيف</a></li>
                    <li><a href="contact.html" class="nav__link" data-en="CONTACT" data-ar="اتصل بنا">اتصل بنا</a></li>
                </ul>
            </nav>
            <div class="header__actions">
                <a href="../en/${fileName}" class="lang-toggle" aria-label="Switch to English">EN</a>
                <button class="hamburger" id="hamburger" aria-label="Toggle Menu"><span></span><span></span><span></span></button>
            </div>
        </div>
    </header>

    <!-- ============ ARTICLE HERO ============ -->
    <div class="article-hero" id="articleHero" style="background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url('${escapeHtml(image)}'); background-size: cover; background-position: center;">
        <div class="article-header" id="articleHeader">
            <span class="badge-tag" style="display:inline-block; margin-bottom:12px; font-size:1rem; padding:4px 14px;">${escapeHtml(category_ar)}</span>
            <h1 class="article-title" id="articleTitle" data-en="${escapeHtml(title_en)}" data-ar="${escapeHtml(title_ar)}">${escapeHtml(title_ar)}</h1>
            <div class="article-meta">
                <span id="articleDate" data-en="${escapeHtml(date_en)}" data-ar="${escapeHtml(date_ar)}">${escapeHtml(date_ar)}</span>
                ${author_ar ? `<span id="articleAuthor" data-en="${escapeHtml(author_en)}" data-ar="${escapeHtml(author_ar)}">${escapeHtml(author_ar)}</span>` : ''}
                ${scope_ar ? `<span class="article-scope">${escapeHtml(scope_ar)}</span>` : ''}
            </div>
        </div>
    </div>

    <!-- ============ ARTICLE CONTENT ============ -->
    <div class="article-container">
        <div class="article-body" id="articleBody">
            <div class="article-content-wrapper">
${paragraphsHtmlAr}
            </div>
            <div style="margin-top: 45px; padding-top: 25px; border-top: 1px solid rgba(255,255,255,0.1);">
                <a href="${backUrl}" class="btn-primary" style="display:inline-block; padding:10px 24px; text-decoration:none;" data-en="${backTextEn}" data-ar="${backTextAr}">${backTextAr}</a>
            </div>
        </div>
    </div>

    <!-- ============ FOOTER ============ -->
    <footer class="footer">
        <div class="container">
            <div class="footer__bottom">
                <p data-en="All Rights Reserved for © 2026 Al Humam Advanced" data-ar="جميع الحقوق محفوظة © 2026 شركة الهمام المتقدمة للمقاولات">جميع الحقوق محفوظة © 2026 شركة الهمام المتقدمة للمقاولات</p>
            </div>
        </div>
    </footer>

    <!-- WhatsApp Floating -->
    <a href="https://wa.me/966508601269" class="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg></a>

    <script src="../article.js?v=14.0"></script>
    <script src="../script.js?v=13.9"></script>
</body>
</html>`;
}

function generateEnglishArticlePage({ fileName, title_ar, title_en, category_en, date_ar, date_en, author_ar, author_en, scope_en, image, excerpt_en, paragraphsHtmlEn, type }) {
  const backUrl = type === 'project' ? 'projects.html' : 'media.html';
  const backTextEn = type === 'project' ? '← Back to Featured Projects' : '← Back to Media Center';

  return `<!DOCTYPE html>
<html lang="en" dir="ltr">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <link rel="icon" type="image/x-icon" href="../favicon.ico">
    <link rel="icon" type="image/png" sizes="32x32" href="../images/favicon-32x32.png">
    <link rel="icon" type="image/png" sizes="16x16" href="../images/favicon-16x16.png">
    <link rel="apple-touch-icon" sizes="180x180" href="../apple-touch-icon.png">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600&family=Rajdhani:wght@300;400;500;600;700&family=Tajawal:wght@300;400;500;700;800;900&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="../style.css?v=13.9">
    <link rel="stylesheet" href="../article.css">
    <!-- Google Tag Manager -->
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
    new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
    'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,'script','dataLayer','GTM-TFXX823L');</script>
    <!-- End Google Tag Manager -->
    <title>${escapeHtml(title_en)} | Al Humam Advanced Contracting</title>
    <meta name="description" content="${escapeHtml(excerpt_en)}">
    <link rel="canonical" href="https://alhumam.sa/en/${fileName}">
    <link rel="alternate" hreflang="ar" href="https://alhumam.sa/pages/${fileName}">
    <link rel="alternate" hreflang="en" href="https://alhumam.sa/en/${fileName}">
    <link rel="alternate" hreflang="x-default" href="https://alhumam.sa/pages/${fileName}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title_en)} | Al Humam Advanced Contracting">
    <meta property="og:description" content="${escapeHtml(excerpt_en)}">
    <meta property="og:url" content="https://alhumam.sa/en/${fileName}">
    <meta property="og:site_name" content="Al Humam Advanced Contracting">
    <meta property="og:image" content="${escapeHtml(image)}">
</head>
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TFXX823L"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    <div class="site-main-bg"></div>

    <!-- ============ TOP UTILITY BAR ============ -->
    <div class="top-utility-bar" id="topUtilityBar" aria-hidden="true">
        <div class="utility-bar__clock">
            <svg class="utility-bar__clock-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
            <time class="utility-bar__time" id="utilityClockTime">00:00</time>
        </div>
        <div class="utility-bar__label">
            <span class="utility-bar__dot"></span>
            <span class="utility-bar__label-en">RIYADH, KSA</span>
            <span class="utility-bar__label-ar">الرياض، السعودية</span>
        </div>
    </div>

    <!-- ============ HEADER ============ -->
    <header class="header" id="header">
        <div class="header__container">
            <a href="index.html" class="header__logo">
                <span class="logo-text logo-text--en">AL HUMAM<span class="logo-accent"> ADVANCED</span></span>
                <span class="logo-text logo-text--ar">الهمام المتقدمة<span class="logo-accent"> للمقاولات</span></span>
            </a>
            <nav class="header__nav" id="mainNav">
                <ul class="nav__list">
                    <li><a href="about.html" class="nav__link" data-en="ABOUT US" data-ar="من نحن">ABOUT US</a></li>
                    <li><a href="sustainability.html" class="nav__link" data-en="SUSTAINABILITY" data-ar="الاستدامة">SUSTAINABILITY</a></li>
                    <li><a href="services.html" class="nav__link" data-en="SERVICES" data-ar="خدماتنا">SERVICES</a></li>
                    <li><a href="projects.html" class="nav__link ${type === 'project' ? 'nav__link--active' : ''}" data-en="PROJECTS" data-ar="مشاريعنا">PROJECTS</a></li>
                    <li><a href="innovation.html" class="nav__link" data-en="INNOVATION" data-ar="الابتكار">INNOVATION</a></li>
                    <li><a href="media.html" class="nav__link ${type === 'article' ? 'nav__link--active' : ''}" data-en="MEDIA CENTER" data-ar="المركز الإعلامي">MEDIA CENTER</a></li>
                    <li><a href="careers.html" class="nav__link" data-en="CAREERS" data-ar="التوظيف">CAREERS</a></li>
                    <li><a href="contact.html" class="nav__link" data-en="CONTACT" data-ar="اتصل بنا">CONTACT</a></li>
                </ul>
            </nav>
            <div class="header__actions">
                <a href="../pages/${fileName}" class="lang-toggle" aria-label="التحويل إلى العربية">عربي</a>
                <button class="hamburger" id="hamburger" aria-label="Toggle Menu"><span></span><span></span><span></span></button>
            </div>
        </div>
    </header>

    <!-- ============ ARTICLE HERO ============ -->
    <div class="article-hero" id="articleHero" style="background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url('${escapeHtml(image)}'); background-size: cover; background-position: center;">
        <div class="article-header" id="articleHeader">
            <span class="badge-tag" style="display:inline-block; margin-bottom:12px; font-size:1rem; padding:4px 14px;">${escapeHtml(category_en)}</span>
            <h1 class="article-title" id="articleTitle" data-en="${escapeHtml(title_en)}" data-ar="${escapeHtml(title_ar)}">${escapeHtml(title_en)}</h1>
            <div class="article-meta">
                <span id="articleDate" data-en="${escapeHtml(date_en)}" data-ar="${escapeHtml(date_ar)}">${escapeHtml(date_en)}</span>
                ${author_en ? `<span id="articleAuthor" data-en="${escapeHtml(author_en)}" data-ar="${escapeHtml(author_ar)}">${escapeHtml(author_en)}</span>` : ''}
                ${scope_en ? `<span class="article-scope">${escapeHtml(scope_en)}</span>` : ''}
            </div>
        </div>
    </div>

    <!-- ============ ARTICLE CONTENT ============ -->
    <div class="article-container">
        <div class="article-body" id="articleBody">
            <div class="article-content-wrapper">
${paragraphsHtmlEn}
            </div>
            <div style="margin-top: 45px; padding-top: 25px; border-top: 1px solid rgba(255,255,255,0.1);">
                <a href="${backUrl}" class="btn-primary" style="display:inline-block; padding:10px 24px; text-decoration:none;" data-en="${backTextEn}" data-ar="${backTextEn}">${backTextEn}</a>
            </div>
        </div>
    </div>

    <!-- ============ FOOTER ============ -->
    <footer class="footer">
        <div class="container">
            <div class="footer__bottom">
                <p data-en="All Rights Reserved for © 2026 Al Humam Advanced" data-ar="جميع الحقوق محفوظة © 2026 شركة الهمام المتقدمة للمقاولات">All Rights Reserved for © 2026 Al Humam Advanced</p>
            </div>
        </div>
    </footer>

    <!-- WhatsApp Floating -->
    <a href="https://wa.me/966508601269" class="whatsapp-float" target="_blank" rel="noopener noreferrer" aria-label="WhatsApp"><svg viewBox="0 0 24 24" fill="currentColor" width="28" height="28"><path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/></svg></a>

    <script src="../article.js?v=14.0"></script>
    <script src="../script.js?v=13.9"></script>
</body>
</html>`;
}

const server = http.createServer((req, res) => {
  const parsedUrl = url.parse(req.url, true);
  let pathname = decodeURI(parsedUrl.pathname);

  // Authentication check
  const cookies = parseCookies(req);
  const isLogged = cookies['alhumam_admin'] === '1';

  // Handle Logout
  if (pathname === '/admin/logout' || (pathname === '/admin/' && parsedUrl.query.action === 'logout')) {
    res.writeHead(302, {
      'Set-Cookie': 'alhumam_admin=0; Max-Age=0; Path=/admin',
      'Location': '/admin/'
    });
    res.end();
    return;
  }

  // Handle Login Post
  if (pathname === '/admin/' && req.method === 'POST') {
    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      const params = new URLSearchParams(body);
      if (params.get('login_password') === ADMIN_PASSWORD) {
        res.writeHead(302, {
          'Set-Cookie': 'alhumam_admin=1; Path=/admin; HttpOnly',
          'Location': '/admin/'
        });
        res.end();
      } else {
        res.writeHead(302, {
          'Location': '/admin/?error=invalid_password'
        });
        res.end();
      }
    });
    return;
  }

  // ================= HANDLE DELETE ACTION =================
  if (
    (pathname === '/admin/publish.php' && parsedUrl.query.action === 'delete') ||
    (pathname === '/admin/' && parsedUrl.query.action === 'delete') ||
    (pathname === '/admin/api/delete')
  ) {
    if (!isLogged) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      return;
    }

    const deleteId = (parsedUrl.query.id || '').trim();
    const type = parsedUrl.query.type === 'project' ? 'project' : 'article';

    if (!deleteId) {
      res.writeHead(302, { 'Location': '/admin/?error=' + encodeURIComponent('معرف المقال غير موجود') });
      res.end();
      return;
    }

    const data = loadData();
    const targetCollection = type === 'project' ? 'projects' : 'articles';
    const foundIndex = data[targetCollection].findIndex(item => item.id === deleteId);

    if (foundIndex !== -1) {
      const itemToDelete = data[targetCollection][foundIndex];
      const fileToDelete = itemToDelete.file || '';

      // 1. Remove HTML files (both pages/ and en/)
      if (fileToDelete) {
        const arPath = path.join(ROOT, 'pages', fileToDelete);
        const enPath = path.join(ROOT, 'en', fileToDelete);
        if (fs.existsSync(arPath)) { try { fs.unlinkSync(arPath); } catch(e) {} }
        if (fs.existsSync(enPath)) { try { fs.unlinkSync(enPath); } catch(e) {} }
      }

      // 2. Remove Cards from all 4 listing pages
      const subpageAr = path.join(ROOT, 'pages', type === 'project' ? 'projects.html' : 'media.html');
      const subpageEn = path.join(ROOT, 'en', type === 'project' ? 'projects.html' : 'media.html');
      const homeAr = path.join(ROOT, 'index.html');
      const homeEn = path.join(ROOT, 'en', 'index.html');

      removeCardFromListing(subpageAr, fileToDelete, type);
      removeCardFromListing(subpageEn, fileToDelete, type);
      removeCardFromListing(homeAr, fileToDelete, type);
      removeCardFromListing(homeEn, fileToDelete, type);

      // 3. Remove both URLs from sitemap.xml
      if (fileToDelete) {
        updateSitemap(fileToDelete, 'delete');
      }

      // 4. Remove from JSON
      data[targetCollection].splice(foundIndex, 1);
      saveData(data);

      if (pathname === '/admin/api/delete') {
        res.writeHead(200, { 'Content-Type': 'application/json' });
        res.end(JSON.stringify({ success: true, deleted: fileToDelete }));
      } else {
        res.writeHead(302, { 'Location': `/admin/?success=deleted&type=${type}` });
        res.end();
      }
      return;
    } else {
      res.writeHead(302, { 'Location': '/admin/?error=' + encodeURIComponent('لم يتم العثور على العنصر المطلوب حذفه') });
      res.end();
      return;
    }
  }

  // ================= HANDLE PUBLISH / EDIT POST =================
  if ((pathname === '/admin/api/publish' || pathname === '/admin/publish.php') && req.method === 'POST') {
    if (!isLogged) {
      res.writeHead(401, { 'Content-Type': 'application/json' });
      res.end(JSON.stringify({ success: false, error: 'Unauthorized' }));
      return;
    }

    let body = '';
    req.on('data', chunk => { body += chunk.toString(); });
    req.on('end', () => {
      try {
        let payload = {};
        const contentType = req.headers['content-type'] || '';
        if (contentType.includes('application/json')) {
          payload = JSON.parse(body);
        } else {
          const params = new URLSearchParams(body);
          params.forEach((val, key) => { payload[key] = val; });
        }

        const edit_id = (payload.edit_id || '').trim();
        const existing_file = (payload.existing_file || '').trim();
        const is_edit = Boolean(edit_id || existing_file);
        const type = payload.type === 'project' ? 'project' : 'article';

        // Bilingual Form Fields
        const title_ar = (payload.title_ar || '').trim();
        let title_en = (payload.title_en || '').trim();
        const category_ar = (payload.category_ar || (type === 'project' ? 'حكومي' : 'مشاريع حكومية')).trim();
        const category_en = (payload.category_en || (type === 'project' ? 'Government' : 'Government Projects')).trim();
        const date_ar = (payload.date_ar || 'أكتوبر 2026').trim();
        const date_en = (payload.date_en || 'October 2026').trim();
        const author_ar = (payload.author_ar || 'المكتب الإعلامي لشركة الهمام المتقدمة').trim();
        const author_en = (payload.author_en || 'Al Humam Press Office').trim();
        const scope_ar = (payload.scope_ar || '').trim();
        let scope_en = (payload.scope_en || '').trim();
        let excerpt_ar = (payload.excerpt_ar || '').trim();
        let excerpt_en = (payload.excerpt_en || '').trim();
        let content_ar = (payload.content_ar || '').trim();
        let content_en = (payload.content_en || '').trim();
        const image = payload.image || (is_edit ? '' : 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80');

        if (!title_ar) {
          throw new Error('يرجى إدخال عنوان المقال أو المشروع بالعربية');
        }
        if (!title_en) title_en = title_ar;
        if (!excerpt_ar) excerpt_ar = title_ar;
        if (!excerpt_en) excerpt_en = excerpt_ar;
        if (!content_ar) content_ar = excerpt_ar;
        if (!content_en) content_en = content_ar;
        if (!scope_en) scope_en = scope_ar;

        const data = loadData();
        const targetCollection = type === 'project' ? 'projects' : 'articles';
        let existingItem = null;
        let existingIndex = -1;

        const editIdBase = edit_id ? path.basename(edit_id, '.html') : '';
        const existingFileBase = existing_file ? path.basename(existing_file, '.html') : '';

        if (is_edit) {
          existingIndex = data[targetCollection].findIndex(item => {
            const itemId = item.id || '';
            const itemFile = item.file || '';
            const itemFileBase = path.basename(itemFile, '.html');
            return (
              (edit_id && itemId === edit_id) ||
              (existing_file && itemFile === existing_file) ||
              (editIdBase && (itemId === editIdBase || itemFileBase === editIdBase)) ||
              (existingFileBase && (itemId === existingFileBase || itemFileBase === existingFileBase))
            );
          });
          if (existingIndex !== -1) {
            existingItem = data[targetCollection][existingIndex];
          }
        }

        // Determine final image
        const finalImageHome = (image || (existingItem && existingItem.image) || '').replace(/^\.\.\//, '');
        const finalImage = image || (existingItem && existingItem.image) || 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80';

        // Determine file name
        let fileName = '';
        if (is_edit) {
          if (existingItem && existingItem.file) {
            fileName = existingItem.file;
          } else if (existing_file) {
            fileName = existing_file;
          } else if (edit_id) {
            fileName = edit_id.endsWith('.html') ? edit_id : `${edit_id}.html`;
          }
        }
        if (!fileName) {
          let cleanSlug = title_en.toLowerCase().replace(/[^a-z0-9\-]/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '') || (type === 'project' ? 'custom-project' : 'custom-news');
          if (cleanSlug.length < 3) cleanSlug = type === 'project' ? 'custom-project' : 'custom-news';
          fileName = (type === 'project' ? 'article-project-' : 'article-news-') + cleanSlug + '-' + Date.now() + '.html';
        }

        const arFilePath = path.join(ROOT, 'pages', fileName);
        const enFilePath = path.join(ROOT, 'en', fileName);

        // Build formatted paragraphs for both languages using sanitizeArticleHtml
        const paragraphsHtmlAr = sanitizeArticleHtml(content_ar) || `                <p>${escapeHtml(excerpt_ar)}</p>`;
        const paragraphsHtmlEn = sanitizeArticleHtml(content_en) || `                <p>${escapeHtml(excerpt_en)}</p>`;

        // Generate Standalone Arabic and English Pages
        const arPageHtml = generateArabicArticlePage({
          fileName,
          title_ar,
          title_en,
          category_ar,
          date_ar,
          date_en,
          author_ar,
          author_en,
          scope_ar,
          image: finalImage,
          excerpt_ar,
          paragraphsHtmlAr,
          type
        });

        const enPageHtml = generateEnglishArticlePage({
          fileName,
          title_ar,
          title_en,
          category_en,
          date_ar,
          date_en,
          author_ar,
          author_en,
          scope_en,
          image: finalImage,
          excerpt_en,
          paragraphsHtmlEn,
          type
        });

        fs.writeFileSync(arFilePath, applySiteTemplate(arPageHtml, path.join(ROOT, 'pages', 'article-news-gov.html'), 'en', fileName, type), 'utf8');
        fs.writeFileSync(enFilePath, applySiteTemplate(enPageHtml, path.join(ROOT, 'en', 'article-news-gov.html'), 'pages', fileName, type), 'utf8');

        // Multi-Page Synchronous Card Injection (Subpages ONLY, Homepage isolated)
        const subpageAr = path.join(ROOT, 'pages', type === 'project' ? 'projects.html' : 'media.html');
        const subpageEn = path.join(ROOT, 'en', type === 'project' ? 'projects.html' : 'media.html');
        const homeAr = path.join(ROOT, 'index.html');
        const homeEn = path.join(ROOT, 'en', 'index.html');

        if (is_edit) {
          removeCardFromListing(subpageAr, fileName, type);
          removeCardFromListing(subpageEn, fileName, type);
        }

        if (type === 'article') {
          // Cards
          const cardArSub = `
                <article class="media-card" data-aos="fade-up">
                    <div class="media-card__img" style="background-image: url('${escapeHtml(finalImage)}');"></div>
                    <div class="media-card__body">
                        <h3 class="media-card__title" data-en="${escapeHtml(title_en)}" data-ar="${escapeHtml(title_ar)}">${escapeHtml(title_ar)}</h3>
                        <div class="media-card__footer">
                            <span class="media-card__date" data-en="${escapeHtml(date_en)}" data-ar="${escapeHtml(date_ar)}">${escapeHtml(date_ar)}</span>
                            <a href="${fileName}" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">اقرأ المزيد ←</a>
                        </div>
                    </div>
                </article>`;

          const cardEnSub = `
                <article class="media-card" data-aos="fade-up">
                    <div class="media-card__img" style="background-image: url('${escapeHtml(finalImage)}');"></div>
                    <div class="media-card__body">
                        <h3 class="media-card__title" data-en="${escapeHtml(title_en)}" data-ar="${escapeHtml(title_ar)}">${escapeHtml(title_en)}</h3>
                        <div class="media-card__footer">
                            <span class="media-card__date" data-en="${escapeHtml(date_en)}" data-ar="${escapeHtml(date_ar)}">${escapeHtml(date_en)}</span>
                            <a href="${fileName}" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">Read More →</a>
                        </div>
                    </div>
                </article>`;

          const cardArHome = `
                <article class="media-card" data-aos="fade-up">
                    <div class="media-card__img" style="background-image: url('${escapeHtml(finalImageHome)}');"></div>
                    <div class="media-card__body">
                        <h3 class="media-card__title" data-en="${escapeHtml(title_en)}" data-ar="${escapeHtml(title_ar)}">${escapeHtml(title_ar)}</h3>
                        <div class="media-card__footer">
                            <span class="media-card__date" data-en="${escapeHtml(date_en)}" data-ar="${escapeHtml(date_ar)}">${escapeHtml(date_ar)}</span>
                            <a href="pages/${fileName}" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">اقرأ المزيد ←</a>
                        </div>
                    </div>
                </article>`;

          const cardEnHome = `
                <article class="media-card" data-aos="fade-up">
                    <div class="media-card__img" style="background-image: url('${escapeHtml(finalImage)}');"></div>
                    <div class="media-card__body">
                        <h3 class="media-card__title" data-en="${escapeHtml(title_en)}" data-ar="${escapeHtml(title_ar)}">${escapeHtml(title_en)}</h3>
                        <div class="media-card__footer">
                            <span class="media-card__date" data-en="${escapeHtml(date_en)}" data-ar="${escapeHtml(date_ar)}">${escapeHtml(date_en)}</span>
                            <a href="${fileName}" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">Read More →</a>
                        </div>
                    </div>
                </article>`;

          injectCardIntoGrid(subpageAr, 'media__grid', cardArSub);
          injectCardIntoGrid(subpageEn, 'media__grid', cardEnSub);

          // Homepage Isolation: only update existing card if it was already on homepage
          if (is_edit) {
            const wasOnHomeAr = removeCardFromListing(homeAr, fileName, type);
            if (wasOnHomeAr) {
              injectCardIntoGrid(homeAr, 'media__grid', cardArHome);
            }
            const wasOnHomeEn = removeCardFromListing(homeEn, fileName, type);
            if (wasOnHomeEn) {
              injectCardIntoGrid(homeEn, 'media__grid', cardEnHome);
            }
          }
        } else {
          // Project Cards
          const cardArSub = `
                <div class="project-card" data-aos="fade-up">
                    <div class="project-card__img" style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url('${escapeHtml(finalImage)}'); background-size: cover; background-position: center;">
                        <div class="project-card__content">
                            <span class="project-card__tag" data-en="${escapeHtml(category_en)}" data-ar="${escapeHtml(category_ar)}">${escapeHtml(category_ar)}</span>
                            <h3 data-en="${escapeHtml(title_en)}" data-ar="${escapeHtml(title_ar)}">${escapeHtml(title_ar)}</h3>
                            <p data-en="${escapeHtml(scope_en)}" data-ar="${escapeHtml(scope_ar)}">${escapeHtml(scope_ar)}</p>
                        </div>
                        <a href="${fileName}" class="project-card__link" data-en="Read More" data-ar="اقرأ المزيد">اقرأ المزيد</a>
                    </div>
                </div>`;

          const cardEnSub = `
                <div class="project-card" data-aos="fade-up">
                    <div class="project-card__img" style="background-image: url('${escapeHtml(finalImage)}');">
                        <div class="project-card__content">
                            <span class="project-card__tag" data-en="${escapeHtml(category_en)}" data-ar="${escapeHtml(category_ar)}">${escapeHtml(category_en)}</span>
                            <h3 data-en="${escapeHtml(title_en)}" data-ar="${escapeHtml(title_ar)}">${escapeHtml(title_en)}</h3>
                            <p data-en="${escapeHtml(scope_en)}" data-ar="${escapeHtml(scope_ar)}">${escapeHtml(scope_en)}</p>
                        </div>
                        <a href="${fileName}" class="project-card__link" data-en="Read More" data-ar="اقرأ المزيد">Read More</a>
                    </div>
                </div>`;

          const cardArHome = `
                <div class="project-card" data-aos="fade-up">
                    <div class="project-card__img" style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url('${escapeHtml(finalImageHome)}'); background-size: cover; background-position: center;">
                        <div class="project-card__content">
                            <span class="project-card__tag" data-en="${escapeHtml(category_en)}" data-ar="${escapeHtml(category_ar)}">${escapeHtml(category_ar)}</span>
                            <h3 data-en="${escapeHtml(title_en)}" data-ar="${escapeHtml(title_ar)}">${escapeHtml(title_ar)}</h3>
                            <p data-en="${escapeHtml(scope_en)}" data-ar="${escapeHtml(scope_ar)}">${escapeHtml(scope_ar)}</p>
                        </div>
                        <a href="pages/${fileName}" class="project-card__link" data-en="Read More" data-ar="اقرأ المزيد">اقرأ المزيد</a>
                    </div>
                </div>`;

          const cardEnHome = `
                <div class="project-card" data-aos="fade-up">
                    <div class="project-card__img" style="background-image: url('${escapeHtml(finalImage)}');">
                        <div class="project-card__content">
                            <span class="project-card__tag" data-en="${escapeHtml(category_en)}" data-ar="${escapeHtml(category_ar)}">${escapeHtml(category_en)}</span>
                            <h3 data-en="${escapeHtml(title_en)}" data-ar="${escapeHtml(title_ar)}">${escapeHtml(title_en)}</h3>
                            <p data-en="${escapeHtml(scope_en)}" data-ar="${escapeHtml(scope_ar)}">${escapeHtml(scope_en)}</p>
                        </div>
                        <a href="${fileName}" class="project-card__link" data-en="Read More" data-ar="اقرأ المزيد">Read More</a>
                    </div>
                </div>`;

          injectCardIntoGrid(subpageAr, 'projects__grid', cardArSub);
          injectCardIntoGrid(subpageEn, 'projects__grid', cardEnSub);

          // Homepage Isolation: only update existing card if it was already on homepage
          if (is_edit) {
            const wasOnHomeAr = removeCardFromListing(homeAr, fileName, type);
            if (wasOnHomeAr) {
              injectCardIntoGrid(homeAr, 'projects__grid', cardArHome);
            }
            const wasOnHomeEn = removeCardFromListing(homeEn, fileName, type);
            if (wasOnHomeEn) {
              injectCardIntoGrid(homeEn, 'projects__grid', cardEnHome);
            }
          }
        }

        // Update sitemap.xml
        updateSitemap(fileName, is_edit ? 'edit' : 'add');

        // Save entry in JSON
        const entry = {
          id: is_edit ? edit_id : path.basename(fileName, '.html'),
          type,
          title_ar,
          title_en,
          category_ar,
          category_en,
          date_ar,
          date_en,
          author_ar,
          author_en,
          scope_ar,
          scope_en,
          image: finalImage,
          excerpt_ar,
          excerpt_en,
          content_ar,
          content_en,
          file: fileName
        };

        if (is_edit && existingIndex !== -1) {
          data[targetCollection][existingIndex] = entry;
        } else {
          data[targetCollection].unshift(entry);
        }
        saveData(data);

        if (contentType.includes('application/json')) {
          res.writeHead(200, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: true, file: fileName, type, is_edit }));
        } else {
          const msg = is_edit ? 'updated' : 'published';
          res.writeHead(302, { 'Location': `/admin/?success=${msg}&file=${encodeURIComponent(fileName)}&type=${type}` });
          res.end();
        }
      } catch (err) {
        if ((req.headers['content-type'] || '').includes('application/json')) {
          res.writeHead(500, { 'Content-Type': 'application/json' });
          res.end(JSON.stringify({ success: false, error: err.message }));
        } else {
          res.writeHead(302, { 'Location': '/admin/?error=' + encodeURIComponent(err.message) });
          res.end();
        }
      }
    });
    return;
  }

  // ================= SERVE ADMIN UI & STATIC FILES =================
  let reqPath = pathname === '/' ? '/index.html' : pathname;
  if (reqPath === '/admin' || reqPath === '/admin/' || reqPath === '/admin/index.php') {
    // Serve admin UI
    if (!isLogged) {
      // Login HTML
      const loginHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة إدارة المحتوى | شركة الهمام المتقدمة</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/admin/style.css">
</head>
<body>
    <div class="auth-wrapper">
        <div class="auth-card">
            <div style="margin-bottom: 20px;"><span class="brand-badge">AL HUMAM ADVANCED</span></div>
            <h2>لوحة إدارة المحتوى ثنائي اللغة</h2>
            <p>سجّل الدخول لإضافة، تعديل، وحذف المقالات والمشاريع لكافة الصفحات</p>
            ${parsedUrl.query.error ? '<div class="alert alert-error">كلمة المرور غير صحيحة، حاول مجدداً.</div>' : ''}
            <form method="POST" action="/admin/">
                <div class="form-group" style="text-align: right; margin-bottom: 20px;">
                    <label for="pwd">كلمة مرور الإدارة:</label>
                    <input type="password" id="pwd" name="login_password" placeholder="أدخل كلمة المرور" required autofocus>
                    <small style="color: #6c757d; font-size: 0.78rem; margin-top: 4px;">كلمة المرور الافتراضية: <code>alhumam2026</code></small>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">تسجيل الدخول</button>
            </form>
        </div>
    </div>
</body>
</html>`;
      res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
      res.end(loginHtml);
      return;
    }

    // Dashboard HTML
    const contentData = loadData();
    const edit_id = parsedUrl.query.edit_id || '';
    const edit_type = parsedUrl.query.type || 'article';
    const is_editing = Boolean(edit_id);
    let edit_item = {};

    if (is_editing) {
      const col = edit_type === 'project' ? contentData.projects : contentData.articles;
      edit_item = col.find(i => i.id === edit_id) || {};
    }

    const articlesCount = contentData.articles.length;
    const projectsCount = contentData.projects.length;

    const articlesRows = contentData.articles.map(a => `
        <tr>
            <td><img src="${escapeHtml(a.image)}" class="table-thumb" alt="thumb"></td>
            <td><strong>${escapeHtml(a.title_ar)}</strong></td>
            <td><span style="color: #9e9ea7;">${escapeHtml(a.title_en || '')}</span></td>
            <td>${escapeHtml(a.date_ar || '')}</td>
            <td>
                <div class="actions-cell">
                    <a href="/pages/${escapeHtml(a.file)}" target="_blank" class="btn-action btn-view-ar" title="معاينة الصفحة العربية">عربي 🇸🇦</a>
                    <a href="/en/${escapeHtml(a.file)}" target="_blank" class="btn-action btn-view-en" title="معاينة الصفحة الإنجليزية">EN 🇬🇧</a>
                    <a href="/admin/?edit_id=${encodeURIComponent(a.id)}&type=article" class="btn-action btn-edit" title="تعديل المقال">تعديل ✏️</a>
                    <a href="/admin/publish.php?action=delete&id=${encodeURIComponent(a.id)}&file=${encodeURIComponent(a.file || '')}&type=article" class="btn-action btn-del" onclick="return confirm('هل أنت متأكد من حذف هذا المقال نهائياً من كافة الصفحات وخريطة الموقع؟')" title="حذف المقال">حذف 🗑️</a>
                </div>
            </td>
        </tr>
    `).join('');

    const projectsRows = contentData.projects.map(p => `
        <tr>
            <td><img src="${escapeHtml(p.image)}" class="table-thumb" alt="thumb"></td>
            <td><strong>${escapeHtml(p.title_ar)}</strong></td>
            <td><span style="color: #9e9ea7;">${escapeHtml(p.title_en || '')}</span></td>
            <td><span class="badge-tag">${escapeHtml(p.category_ar || (p.category || ''))}</span></td>
            <td>
                <div class="actions-cell">
                    <a href="/pages/${escapeHtml(p.file)}" target="_blank" class="btn-action btn-view-ar" title="معاينة الصفحة العربية">عربي 🇸🇦</a>
                    <a href="/en/${escapeHtml(p.file)}" target="_blank" class="btn-action btn-view-en" title="معاينة الصفحة الإنجليزية">EN 🇬🇧</a>
                    <a href="/admin/?edit_id=${encodeURIComponent(p.id)}&type=project" class="btn-action btn-edit" title="تعديل المشروع">تعديل ✏️</a>
                    <a href="/admin/publish.php?action=delete&id=${encodeURIComponent(p.id)}&file=${encodeURIComponent(p.file || '')}&type=project" class="btn-action btn-del" onclick="return confirm('هل أنت متأكد من حذف هذا المشروع نهائياً من كافة الصفحات وخريطة الموقع؟')" title="حذف المشروع">حذف 🗑️</a>
                </div>
            </td>
        </tr>
    `).join('');

    // Alerts
    let alertHtml = '';
    if (parsedUrl.query.success === 'published') {
      alertHtml = `<div class="alert alert-success">✅ <strong>تم بنجاح!</strong> تم نشر ${parsedUrl.query.type === 'project' ? 'المشروع' : 'المقال'} باللغتين وتحديث كافة الصفحات (الرئيسية والفرعية) وsitemap.xml فورياً. ${parsedUrl.query.file ? `<div style="margin-top: 8px;"><a href="/pages/${escapeHtml(parsedUrl.query.file)}" target="_blank" style="color:#fff; text-decoration:underline; margin-left:14px; font-weight:bold;">معاينة النسخة العربية 🇸🇦 ↗</a><a href="/en/${escapeHtml(parsedUrl.query.file)}" target="_blank" style="color:#2dd4bf; text-decoration:underline; font-weight:bold;">معاينة النسخة الإنجليزية 🇬🇧 ↗</a></div>` : ''}</div>`;
    } else if (parsedUrl.query.success === 'updated') {
      alertHtml = `<div class="alert alert-success">✅ <strong>تم حفظ التعديلات!</strong> تم تحديث المحتوى باللغتين وتحديث كافة الصفحات وsitemap.xml. ${parsedUrl.query.file ? `<div style="margin-top: 8px;"><a href="/pages/${escapeHtml(parsedUrl.query.file)}" target="_blank" style="color:#fff; text-decoration:underline; margin-left:14px; font-weight:bold;">معاينة النسخة العربية 🇸🇦 ↗</a><a href="/en/${escapeHtml(parsedUrl.query.file)}" target="_blank" style="color:#2dd4bf; text-decoration:underline; font-weight:bold;">معاينة النسخة الإنجليزية 🇬🇧 ↗</a></div>` : ''}</div>`;
    } else if (parsedUrl.query.success === 'deleted') {
      alertHtml = `<div class="alert alert-success">🗑️ <strong>تم الحذف بنجاح!</strong> تم حذف الملفات وإزالة البطاقات من كافة الصفحات (الرئيسية والفرعية) وتحديث خريطة الموقع sitemap.xml.</div>`;
    } else if (parsedUrl.query.error) {
      alertHtml = `<div class="alert alert-error">❌ خطأ: ${escapeHtml(parsedUrl.query.error)}</div>`;
    }

    const currArtCatAr = edit_item.category_ar || (edit_item.category || 'مشاريع حكومية');
    const currArtCatEn = edit_item.category_en || 'Government Projects';
    const currProjCatAr = edit_item.category_ar || (edit_item.category || 'حكومي');
    const currProjCatEn = edit_item.category_en || 'Government';

    const dashboardHtml = `<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة نشر وإدارة المقالات والمشاريع ثنائي اللغة | شركة الهمام المتقدمة</title>
    <link href="https://fonts.googleapis.com/css2?family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="/admin/style.css">
    <style>
        .lang-panel {
            background: rgba(255, 255, 255, 0.02);
            border: 1px solid rgba(200, 164, 90, 0.22);
            border-radius: 10px;
            padding: 20px;
            margin-bottom: 24px;
        }
        .lang-panel__title {
            display: flex;
            align-items: center;
            gap: 10px;
            font-size: 1.1rem;
            color: var(--gold);
            margin-bottom: 16px;
            padding-bottom: 10px;
            border-bottom: 1px dashed rgba(200, 164, 90, 0.25);
        }
        .actions-cell {
            display: flex;
            gap: 6px;
            align-items: center;
            flex-wrap: wrap;
        }
        .btn-action {
            display: inline-flex;
            align-items: center;
            justify-content: center;
            padding: 5px 9px;
            border-radius: 5px;
            font-size: 0.8rem;
            text-decoration: none;
            font-weight: 600;
            transition: all 0.2s ease;
        }
        .btn-view-ar {
            background: rgba(200, 164, 90, 0.15);
            color: var(--gold);
            border: 1px solid rgba(200, 164, 90, 0.35);
        }
        .btn-view-ar:hover { background: var(--gold); color: #000; }
        .btn-view-en {
            background: rgba(13, 148, 136, 0.15);
            color: #2dd4bf;
            border: 1px solid rgba(13, 148, 136, 0.35);
        }
        .btn-view-en:hover { background: #0d9488; color: #fff; }
        .btn-edit {
            background: rgba(33, 150, 243, 0.15);
            color: #64b5f6;
            border: 1px solid rgba(33, 150, 243, 0.35);
        }
        .btn-edit:hover { background: #2196f3; color: #fff; }
        .btn-del {
            background: rgba(244, 67, 54, 0.15);
            color: #e57373;
            border: 1px solid rgba(244, 67, 54, 0.35);
        }
        .btn-del:hover { background: #f44336; color: #fff; }
    </style>
</head>
<body>
    <header class="admin-header">
        <div class="admin-brand">
            <span class="brand-badge">AL HUMAM</span>
            <span class="brand-title">لوحة نشر وإدارة المقالات والمشاريع (تحديث متزامن ثنائي اللغة)</span>
        </div>
        <div class="admin-nav">
            <a href="/index.html" target="_blank" class="btn-view-site">زيارة الموقع ↗</a>
            <a href="/admin/logout" class="btn-logout">تسجيل الخروج</a>
        </div>
    </header>

    <div class="container">
        <div id="alertBox">${alertHtml}</div>
        <div class="tabs">
            <button class="tab-btn ${(!is_editing || edit_type === 'article') ? 'active' : ''}" onclick="switchTab('media')">📰 المركز الإعلامي (المقالات والأخبار)</button>
            <button class="tab-btn ${(is_editing && edit_type === 'project') ? 'active' : ''}" onclick="switchTab('projects')">🏗️ مشاريعنا (سجل المشاريع المميزة)</button>
        </div>

        <!-- ================= TAB 1: MEDIA ================= -->
        <div id="tab-media" class="tab-content" style="${(is_editing && edit_type === 'project') ? 'display: none;' : ''}">
            <div class="admin-card">
                ${(is_editing && edit_type === 'article') ? `
                    <div class="edit-banner">
                        <span>✏️ <strong>أنت الآن في وضع التعديل:</strong> جارٍ تعديل المقال "${escapeHtml(edit_item.title_ar || '')}"</span>
                        <a href="/admin/" class="btn-cancel-edit" style="padding: 4px 12px; font-size: 0.85rem;">إلغاء التعديل ✕</a>
                    </div>
                ` : ''}

                <h3 class="admin-card__title">
                    ${(is_editing && edit_type === 'article') ? '✏️ تعديل المقال الإخباري (ثنائي اللغة)' : '✍️ إضافة مقال إخباري جديد (تحديث متزامن لكافة الصفحات)'}
                </h3>
                <form id="mediaForm" onsubmit="handlePublish(event, 'article')">
                    ${(is_editing && edit_type === 'article') ? `<input type="hidden" name="edit_id" value="${escapeHtml(edit_item.id)}"><input type="hidden" name="existing_file" value="${escapeHtml(edit_item.file || '')}">` : ''}
                    
                    <!-- Shared Image -->
                    <div class="form-group full-width" style="margin-bottom: 20px;">
                        <label>رابط الصورة البارزة للمقال (أو اتركها للافتراضية)</label>
                        <input type="url" name="image" value="${escapeHtml(edit_item.image || '')}" placeholder="https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=80">
                    </div>

                    <!-- Panel 1: Arabic Content -->
                    <div class="lang-panel">
                        <div class="lang-panel__title">
                            <span>🇸🇦</span>
                            <strong>المحتوى باللغة العربية (المتصفح العربي وصفحة pages/ والرئيسية)</strong>
                        </div>
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label>عنوان المقال بالعربية *</label>
                                <input type="text" name="title_ar" value="${escapeHtml(edit_item.title_ar || '')}" placeholder="مثال: توقيع عقد تنفيذ مشروع المجمع الإداري الجديد" required>
                            </div>
                            <div class="form-group">
                                <label>تصنيف المقال بالعربية</label>
                                <select name="category_ar">
                                    <option value="مشاريع حكومية" ${currArtCatAr === 'مشاريع حكومية' ? 'selected' : ''}>مشاريع حكومية</option>
                                    <option value="أخبار هندسية" ${currArtCatAr === 'أخبار هندسية' ? 'selected' : ''}>أخبار هندسية</option>
                                    <option value="استدامة وإنشاء أخضر" ${currArtCatAr === 'استدامة وإنشاء أخضر' ? 'selected' : ''}>استدامة وإنشاء أخضر</option>
                                    <option value="سلامة مهنية" ${currArtCatAr === 'سلامة مهنية' ? 'selected' : ''}>سلامة مهنية</option>
                                    <option value="بنية تحتية" ${currArtCatAr === 'بنية تحتية' ? 'selected' : ''}>بنية تحتية</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>تاريخ النشر بالعربية</label>
                                <input type="text" name="date_ar" value="${escapeHtml(edit_item.date_ar || 'أكتوبر 2026')}">
                            </div>
                            <div class="form-group full-width">
                                <label>المصدر / الكاتب بالعربية</label>
                                <input type="text" name="author_ar" value="${escapeHtml(edit_item.author_ar || 'المكتب الإعلامي لشركة الهمام المتقدمة')}">
                            </div>
                            <div class="form-group full-width">
                                <label>نبذة مختصرة بالعربية (تظهر في كرت المركز الإعلامي ومحركات البحث) *</label>
                                <textarea name="excerpt_ar" placeholder="اكتب ملخصاً في سطرين عن موضوع المقال..." style="min-height: 80px;" required>${escapeHtml(edit_item.excerpt_ar || (edit_item.excerpt || ''))}</textarea>
                            </div>
                            <div class="form-group full-width">
                                <label>نص وتفاصيل المقال الكاملة بالعربية (يدعم التنسيق والعناوين والألوان) *</label>
                                <div class="formatting-toolbar">
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_media', '<h2>', '</h2>', 'عنوان رئيسي كبير')" title="عنوان رئيسي (H2)">H2 رئيسي</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_media', '<h3>', '</h3>', 'عنوان فرعي بحد ذهبي')" title="عنوان فرعي بحد ذهبي (H3)">H3 فرعي</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_media', '<strong>', '</strong>', 'نص عريض')" title="تسميك الخط (Bold)"><strong>B عريض</strong></button>
                                        <button type="button" class="toolbar-btn toolbar-btn--gold" onclick="formatText('srv_content_ar_media', '<span class=\"gold-text\">', '</span>', 'نص باللون الذهبي')" title="تلوين النص باللون الذهبي">⭐ ذهبي</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_media', '<ul>\r\n  <li>', '</li>\r\n  <li>عنصر ثانٍ</li>\r\n</ul>', 'عنصر أول')" title="قائمة نقطية">📋 قائمة</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_media', '<blockquote>', '</blockquote>', 'اقتباس أو فقرة مميزة')" title="اقتباس أو تمييز فقرة">❝ اقتباس</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_media', '<p>', '</p>', 'فقرة جديدة')" title="فقرة جديدة">¶ فقرة</button>
                                    </div>
                                    <span class="toolbar-hint">💡 حدد النص ثم اضغط الزر لتنسيقه، أو اضغط لإدراج القالب</span>
                                </div>
                                <textarea id="srv_content_ar_media" class="has-toolbar" name="content_ar" placeholder="اكتب محتوى المقال الكامل هنا. يمكنك استخدام أدوات التنسيق أعلاه لتسميك العناوين وتغيير لونها..." style="min-height: 180px;" required>${escapeHtml(edit_item.content_ar || (edit_item.content || ''))}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Panel 2: English Content -->
                    <div class="lang-panel">
                        <div class="lang-panel__title">
                            <span>🇬🇧</span>
                            <strong>المحتوى باللغة الإنجليزية (English Content for en/ Pages & Homepage)</strong>
                        </div>
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label>العنوان بالإنجليزية (English Title) *</label>
                                <input type="text" name="title_en" value="${escapeHtml(edit_item.title_en || '')}" placeholder="e.g. New Government Complex Contract Signing" required>
                            </div>
                            <div class="form-group">
                                <label>التصنيف بالإنجليزية (English Category)</label>
                                <select name="category_en">
                                    <option value="Government Projects" ${currArtCatEn === 'Government Projects' ? 'selected' : ''}>Government Projects</option>
                                    <option value="Engineering News" ${currArtCatEn === 'Engineering News' ? 'selected' : ''}>Engineering News</option>
                                    <option value="Sustainability & Green" ${currArtCatEn === 'Sustainability & Green' ? 'selected' : ''}>Sustainability & Green</option>
                                    <option value="Safety & HSE" ${currArtCatEn === 'Safety & HSE' ? 'selected' : ''}>Safety & HSE</option>
                                    <option value="Infrastructure" ${currArtCatEn === 'Infrastructure' ? 'selected' : ''}>Infrastructure</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>تاريخ النشر بالإنجليزية (English Date)</label>
                                <input type="text" name="date_en" value="${escapeHtml(edit_item.date_en || 'October 2026')}">
                            </div>
                            <div class="form-group full-width">
                                <label>المصدر / الكاتب بالإنجليزية (English Author)</label>
                                <input type="text" name="author_en" value="${escapeHtml(edit_item.author_en || 'Al Humam Press Office')}">
                            </div>
                            <div class="form-group full-width">
                                <label>نبذة مختصرة بالإنجليزية (English Excerpt)</label>
                                <textarea name="excerpt_en" placeholder="Short 2-line summary for cards and search engines..." style="min-height: 80px;">${escapeHtml(edit_item.excerpt_en || '')}</textarea>
                            </div>
                            <div class="form-group full-width">
                                <label>نص وتفاصيل المقال الكاملة بالإنجليزية (Full English Article with formatting)</label>
                                <div class="formatting-toolbar">
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_media', '<h2>', '</h2>', 'Main Section Heading')" title="Main Heading (H2)">H2</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_media', '<h3>', '</h3>', 'Subheading with Gold Border')" title="Subheading (H3)">H3</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_media', '<strong>', '</strong>', 'Bold text')" title="Bold text"><strong>B Bold</strong></button>
                                        <button type="button" class="toolbar-btn toolbar-btn--gold" onclick="formatText('srv_content_en_media', '<span class=\"gold-text\">', '</span>', 'Golden accent text')" title="Highlight with gold color">⭐ Gold</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_media', '<ul>\r\n  <li>', '</li>\r\n  <li>Second item</li>\r\n</ul>', 'First item')" title="Bullet list">📋 List</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_media', '<blockquote>', '</blockquote>', 'Featured quote or note')" title="Blockquote">❝ Quote</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_media', '<p>', '</p>', 'Paragraph text')" title="Paragraph">¶ Paragraph</button>
                                    </div>
                                    <span class="toolbar-hint">💡 Select text then click to format, or click to insert template</span>
                                </div>
                                <textarea id="srv_content_en_media" class="has-toolbar" name="content_en" placeholder="Full English article text. You can use the formatting toolbar above..." style="min-height: 180px;">${escapeHtml(edit_item.content_en || '')}</textarea>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center;">
                        <button type="submit" class="btn-primary" id="btnMedia">
                            ${(is_editing && edit_type === 'article') ? '💾 حفظ التعديلات وتحديث كافة الصفحات وSitemap' : '🚀 نشر المقال باللغتين وتحديث كافة الصفحات وSitemap'}
                        </button>
                        ${(is_editing && edit_type === 'article') ? `<a href="/admin/" class="btn-cancel-edit">إلغاء التعديل</a>` : ''}
                    </div>
                </form>
            </div>

            <div class="admin-card">
                <h3 class="admin-card__title">📚 المقالات المنشورة حالياً (${articlesCount})</h3>
                <div style="overflow-x: auto;">
                    <table class="content-table">
                        <thead>
                            <tr><th>الصورة</th><th>العنوان بالعربية</th><th>Title (EN)</th><th>التاريخ</th><th style="text-align: center;">الإجراءات المتاحة</th></tr>
                        </thead>
                        <tbody>${articlesRows}</tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ================= TAB 2: PROJECTS ================= -->
        <div id="tab-projects" class="tab-content" style="${(!is_editing || edit_type !== 'project') ? 'display: none;' : ''}">
            <div class="admin-card">
                ${(is_editing && edit_type === 'project') ? `
                    <div class="edit-banner">
                        <span>✏️ <strong>أنت الآن في وضع التعديل:</strong> جارٍ تعديل المشروع "${escapeHtml(edit_item.title_ar || '')}"</span>
                        <a href="/admin/" class="btn-cancel-edit" style="padding: 4px 12px; font-size: 0.85rem;">إلغاء التعديل ✕</a>
                    </div>
                ` : ''}

                <h3 class="admin-card__title">
                    ${(is_editing && edit_type === 'project') ? '✏️ تعديل المشروع الإنشائي (ثنائي اللغة)' : '🏗️ إضافة مشروع جديد (تحديث متزامن لكافة الصفحات)'}
                </h3>
                <form id="projectForm" onsubmit="handlePublish(event, 'project')">
                    ${(is_editing && edit_type === 'project') ? `<input type="hidden" name="edit_id" value="${escapeHtml(edit_item.id)}"><input type="hidden" name="existing_file" value="${escapeHtml(edit_item.file || '')}">` : ''}
                    
                    <!-- Shared Image -->
                    <div class="form-group full-width" style="margin-bottom: 20px;">
                        <label>رابط صورة المشروع الرئيسية</label>
                        <input type="url" name="image" value="${escapeHtml(edit_item.image || '')}" placeholder="https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=80">
                    </div>

                    <!-- Panel 1: Arabic Content -->
                    <div class="lang-panel">
                        <div class="lang-panel__title">
                            <span>🇸🇦</span>
                            <strong>بيانات المشروع باللغة العربية (Arabic Project Details)</strong>
                        </div>
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label>اسم المشروع بالعربية *</label>
                                <input type="text" name="title_ar" value="${escapeHtml(edit_item.title_ar || '')}" placeholder="مثال: مجمع المستودعات اللوجستية الحديث" required>
                            </div>
                            <div class="form-group">
                                <label>تصنيف المشروع بالعربية</label>
                                <select name="category_ar">
                                    <option value="حكومي" ${currProjCatAr === 'حكومي' ? 'selected' : ''}>حكومي</option>
                                    <option value="سكني" ${currProjCatAr === 'سكني' ? 'selected' : ''}>سكني</option>
                                    <option value="تجاري" ${currProjCatAr === 'تجاري' ? 'selected' : ''}>تجاري</option>
                                    <option value="صناعي" ${currProjCatAr === 'صناعي' ? 'selected' : ''}>صناعي</option>
                                    <option value="بنية تحتية" ${currProjCatAr === 'بنية تحتية' ? 'selected' : ''}>بنية تحتية</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>المساحة أو نطاق العمل بالعربية</label>
                                <input type="text" name="scope_ar" value="${escapeHtml(edit_item.scope_ar || (edit_item.scope || ''))}" placeholder="مثال: مساحة 30,000 متر مربع أو 500 وحدة">
                            </div>
                            <div class="form-group full-width">
                                <label>نبذة مختصرة بالعربية (تظهر في البطاقات ومحركات البحث) *</label>
                                <textarea name="excerpt_ar" placeholder="مجمع لوجستي بمواصفات تقنية متقدمة..." style="min-height: 80px;" required>${escapeHtml(edit_item.excerpt_ar || (edit_item.excerpt || ''))}</textarea>
                            </div>
                            <div class="form-group full-width">
                                <label>تفاصيل المشروع الكاملة والمواصفات الفنية بالعربية (يدعم التنسيق والعناوين والألوان) *</label>
                                <div class="formatting-toolbar">
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_proj', '<h2>', '</h2>', 'عنوان رئيسي للمشروع')" title="عنوان رئيسي (H2)">H2 رئيسي</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_proj', '<h3>', '</h3>', 'مواصفة أو نطاق فرعي')" title="عنوان فرعي بحد ذهبي (H3)">H3 فرعي</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_proj', '<strong>', '</strong>', 'مواصفة تقنية بارزة')" title="تسميك الخط (Bold)"><strong>B عريض</strong></button>
                                        <button type="button" class="toolbar-btn toolbar-btn--gold" onclick="formatText('srv_content_ar_proj', '<span class=\"gold-text\">', '</span>', 'نص باللون الذهبي')" title="تلوين النص باللون الذهبي">⭐ ذهبي</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_proj', '<ul>\r\n  <li>', '</li>\r\n  <li>مواصفة ثانية</li>\r\n</ul>', 'مواصفة أولى')" title="قائمة نقطية">📋 قائمة</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_proj', '<blockquote>', '</blockquote>', 'نطاق الإنجاز المعتمد')" title="اقتباس أو تمييز">❝ اقتباس</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_ar_proj', '<p>', '</p>', 'فقرة وصفية')" title="فقرة جديدة">¶ فقرة</button>
                                    </div>
                                    <span class="toolbar-hint">💡 حدد النص ثم اضغط الزر لتنسيقه، أو اضغط لإدراج القالب</span>
                                </div>
                                <textarea id="srv_content_ar_proj" class="has-toolbar" name="content_ar" placeholder="اكتب تفاصيل تنفيذ المشروع والمواصفات الهندسية مع التنسيق والعناوين..." style="min-height: 180px;" required>${escapeHtml(edit_item.content_ar || (edit_item.content || ''))}</textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Panel 2: English Content -->
                    <div class="lang-panel">
                        <div class="lang-panel__title">
                            <span>🇬🇧</span>
                            <strong>بيانات المشروع باللغة الإنجليزية (English Project Details)</strong>
                        </div>
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label>اسم المشروع بالإنجليزية (Project Name) *</label>
                                <input type="text" name="title_en" value="${escapeHtml(edit_item.title_en || '')}" placeholder="e.g. Modern Logistics Warehouse Park" required>
                            </div>
                            <div class="form-group">
                                <label>تصنيف المشروع بالإنجليزية (English Category)</label>
                                <select name="category_en">
                                    <option value="Government" ${currProjCatEn === 'Government' ? 'selected' : ''}>Government</option>
                                    <option value="Residential" ${currProjCatEn === 'Residential' ? 'selected' : ''}>Residential</option>
                                    <option value="Commercial" ${currProjCatEn === 'Commercial' ? 'selected' : ''}>Commercial</option>
                                    <option value="Industrial" ${currProjCatEn === 'Industrial' ? 'selected' : ''}>Industrial</option>
                                    <option value="Infrastructure" ${currProjCatEn === 'Infrastructure' ? 'selected' : ''}>Infrastructure</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>نطاق العمل بالإنجليزية (Scope in English)</label>
                                <input type="text" name="scope_en" value="${escapeHtml(edit_item.scope_en || '')}" placeholder="e.g. 30,000 sqm Built-Up Area or 500 Units">
                            </div>
                            <div class="form-group full-width">
                                <label>نبذة مختصرة بالإنجليزية (English Excerpt)</label>
                                <textarea name="excerpt_en" placeholder="Advanced logistics complex built to world-class standards..." style="min-height: 80px;">${escapeHtml(edit_item.excerpt_en || '')}</textarea>
                            </div>
                            <div class="form-group full-width">
                                <label>تفاصيل المشروع الكاملة بالإنجليزية (Full Technical Details with formatting)</label>
                                <div class="formatting-toolbar">
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_proj', '<h2>', '</h2>', 'Project Section Heading')" title="Main Heading (H2)">H2</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_proj', '<h3>', '</h3>', 'Technical Subheading')" title="Subheading (H3)">H3</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_proj', '<strong>', '</strong>', 'Key Spec')" title="Bold text"><strong>B Bold</strong></button>
                                        <button type="button" class="toolbar-btn toolbar-btn--gold" onclick="formatText('srv_content_en_proj', '<span class=\"gold-text\">', '</span>', 'Golden accent')" title="Highlight with gold color">⭐ Gold</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_proj', '<ul>\r\n  <li>', '</li>\r\n  <li>Second spec</li>\r\n</ul>', 'First spec')" title="Bullet list">📋 List</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_proj', '<blockquote>', '</blockquote>', 'Scope highlight or milestone')" title="Blockquote">❝ Quote</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('srv_content_en_proj', '<p>', '</p>', 'Paragraph text')" title="Paragraph">¶ Paragraph</button>
                                    </div>
                                    <span class="toolbar-hint">💡 Select text then click to format, or click to insert template</span>
                                </div>
                                <textarea id="srv_content_en_proj" class="has-toolbar" name="content_en" placeholder="Write full execution details, engineering specs, and client value with formatting..." style="min-height: 180px;">${escapeHtml(edit_item.content_en || '')}</textarea>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center;">
                        <button type="submit" class="btn-primary" id="btnProject">
                            ${(is_editing && edit_type === 'project') ? '💾 حفظ التعديلات وتحديث كافة الصفحات وSitemap' : '🏗️ نشر المشروع باللغتين وتحديث كافة الصفحات وSitemap'}
                        </button>
                        ${(is_editing && edit_type === 'project') ? `<a href="/admin/" class="btn-cancel-edit">إلغاء التعديل</a>` : ''}
                    </div>
                </form>
            </div>

            <div class="admin-card">
                <h3 class="admin-card__title">📋 المشاريع المنشورة حالياً (${projectsCount})</h3>
                <div style="overflow-x: auto;">
                    <table class="content-table">
                        <thead>
                            <tr><th>الصورة</th><th>اسم المشروع بالعربية</th><th>Project Name (EN)</th><th>النوع</th><th style="text-align: center;">الإجراءات المتاحة</th></tr>
                        </thead>
                        <tbody>${projectsRows}</tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <script>
        function formatText(fieldId, tagOpen, tagClose, placeholder) {
            var textarea = document.getElementById(fieldId);
            if (!textarea) return;
            textarea.focus();
            var start = textarea.selectionStart;
            var end = textarea.selectionEnd;
            var text = textarea.value;
            var selected = text.substring(start, end);
            var replacement = selected ? (tagOpen + selected + tagClose) : (tagOpen + (placeholder || '') + tagClose);
            textarea.value = text.substring(0, start) + replacement + text.substring(end);
            textarea.selectionStart = start + tagOpen.length;
            textarea.selectionEnd = start + replacement.length - tagClose.length;
        }

        function switchTab(tabId) {
            document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.tab-btn').forEach(btn => btn.classList.remove('active'));
            document.getElementById('tab-' + tabId).style.display = 'block';
            event.target.classList.add('active');
        }

        async function handlePublish(e, type) {
            e.preventDefault();
            const form = e.target;
            const btn = type === 'project' ? document.getElementById('btnProject') : document.getElementById('btnMedia');
            const originalText = btn.textContent;
            btn.disabled = true;
            btn.textContent = '⏳ جاري النشر والتحديث المتزامن لكافة الصفحات...';

            const formData = new FormData(form);
            const data = { type };
            formData.forEach((val, key) => { data[key] = val; });

            try {
                const res = await fetch('/admin/api/publish', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify(data)
                });
                const result = await res.json();
                if (result.success) {
                    const actionWord = result.is_edit ? 'تحديث' : 'نشر';
                    document.getElementById('alertBox').innerHTML = \`
                        <div class="alert alert-success">
                            ✅ <strong>تم بنجاح!</strong> تم \${actionWord} \${type === 'project' ? 'المشروع' : 'المقال'} باللغتين وتحديث كافة الصفحات (الرئيسية والفرعية) وsitemap.xml فورياً.
                            <div style="margin-top: 8px;">
                                <a href="/pages/\${result.file}" target="_blank" style="color: #fff; text-decoration: underline; margin-left: 14px; font-weight: bold;">معاينة النسخة العربية 🇸🇦 ↗</a>
                                <a href="/en/\${result.file}" target="_blank" style="color: #2dd4bf; text-decoration: underline; font-weight: bold;">معاينة النسخة الإنجليزية 🇬🇧 ↗</a>
                            </div>
                        </div>
                    \`;
                    setTimeout(() => { window.location.href = '/admin/?success=' + (result.is_edit ? 'updated' : 'published') + '&file=' + encodeURIComponent(result.file) + '&type=' + type; }, 1200);
                } else {
                    alert('خطأ: ' + result.error);
                    btn.disabled = false;
                    btn.textContent = originalText;
                }
            } catch (err) {
                alert('فشل الاتصال: ' + err.message);
                btn.disabled = false;
                btn.textContent = originalText;
            }
        }
    </script>
</body>
</html>`;
    res.writeHead(200, { 'Content-Type': 'text/html; charset=utf-8' });
    res.end(dashboardHtml);
    return;
  }

  // Serve static assets from project root
  const filePath = path.join(ROOT, reqPath);
  if (fs.existsSync(filePath) && fs.statSync(filePath).isFile()) {
    const ext = path.extname(filePath);
    res.writeHead(200, { 'Content-Type': mimeTypes[ext] || 'application/octet-stream' });
    res.end(fs.readFileSync(filePath));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('404 Not Found');
  }
});

server.listen(PORT, () => {
  console.log(`=======================================================`);
  console.log(` Al Humam Advanced Contracting — Admin Server Running`);
  console.log(` URL: http://localhost:${PORT}/admin/`);
  console.log(` Default Password: ${ADMIN_PASSWORD}`);
  console.log(`=======================================================`);
});
