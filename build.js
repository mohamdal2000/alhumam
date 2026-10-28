/**
 * Al Humam Advanced Contracting — Decap CMS Static Site Generator (SSG)
 * Builds standalone Arabic & English HTML pages from Markdown/Frontmatter content
 * in data/articles/ and data/projects/, updates media.html and projects.html listings,
 * and keeps sitemap.xml in perfect sync during Netlify / CI build!
 */

const fs = require('fs');
const path = require('path');

const ROOT = __dirname;
const DATA_ARTICLES = path.join(ROOT, 'data', 'articles');
const DATA_PROJECTS = path.join(ROOT, 'data', 'projects');

function parseMarkdownFrontmatter(fileContent) {
  const match = fileContent.match(/^---\r?\n([\s\S]*?)\r?\n---\r?\n([\s\S]*)$/);
  if (!match) {
    return { data: {}, body: fileContent.trim() };
  }
  const rawMeta = match[1];
  const body = match[2].trim();
  const data = {};
  
  rawMeta.split(/\r?\n/).forEach(line => {
    const colonIdx = line.indexOf(':');
    if (colonIdx !== -1) {
      const key = line.slice(0, colonIdx).trim();
      let val = line.slice(colonIdx + 1).trim();
      if ((val.startsWith('"') && val.endsWith('"')) || (val.startsWith("'") && val.endsWith("'"))) {
        val = val.slice(1, -1);
      }
      data[key] = val;
    }
  });

  return { data, body };
}

function markdownToHtml(md) {
  if (!md) return '';
  let html = md
    .replace(/^### (.*$)/gim, '<h3>$1</h3>')
    .replace(/^## (.*$)/gim, '<h2>$1</h2>')
    .replace(/^# (.*$)/gim, '<h2>$1</h2>')
    .replace(/\*\*(.*?)\*\*/gim, '<strong class="gold-text">$1</strong>')
    .replace(/\*(.*?)\*/gim, '<em>$1</em>')
    .replace(/^\- (.*$)/gim, '<li>$1</li>');

  const lines = html.split(/\r?\n/);
  const result = [];
  let inList = false;

  for (let line of lines) {
    const trimmed = line.trim();
    if (!trimmed) {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      continue;
    }
    if (trimmed.startsWith('<li>')) {
      if (!inList) {
        result.push('<ul>');
        inList = true;
      }
      result.push('  ' + trimmed);
    } else {
      if (inList) {
        result.push('</ul>');
        inList = false;
      }
      if (trimmed.startsWith('<h2') || trimmed.startsWith('<h3') || trimmed.startsWith('<p') || trimmed.startsWith('<div')) {
        result.push(trimmed);
      } else {
        result.push('<p>' + trimmed + '</p>');
      }
    }
  }
  if (inList) {
    result.push('</ul>');
  }

  return result.join('\n');
}

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

/**
 * Extracts real site header and footer from reference page (article-bim.html)
 */
function getSiteChrome(lang, altDir, fileName, type) {
  const refPath = path.join(ROOT, lang === 'ar' ? 'pages' : 'en', 'article-bim.html');
  if (fs.existsSync(refPath)) {
    const tpl = fs.readFileSync(refPath, 'utf8');
    const hStart = tpl.indexOf('<div class="site-main-bg"></div>');
    const hEnd = tpl.indexOf('</header>');
    const fStart = tpl.indexOf('<!-- ============ FOOTER ============ -->');
    const fEnd = tpl.lastIndexOf('</body>');

    if (hStart !== -1 && hEnd !== -1 && fStart !== -1 && fEnd !== -1) {
      let header = tpl.slice(hStart, hEnd + 9);
      let footer = tpl.slice(fStart, fEnd);

      // Adjust language switch link to point to alternate language version of current article
      header = header.replace(/href="[^"]*article-[^"]*"/, `href="../${altDir}/${fileName}"`);

      // Highlight active menu item
      header = header.split(' nav__link--active').join('');
      const activeDataTag = type === 'project' ? 'PROJECTS' : 'MEDIA CENTER';
      header = header.replace(new RegExp(`(<a [^>]*data-en="${activeDataTag}"[^>]*class="nav__link)"`), '$1 nav__link--active"');

      return { header, footer };
    }
  }
  return null;
}

function generateArticlePageHtml({ fileName, title_ar, title_en, category_ar, category_en, date_ar, date_en, author_ar, author_en, scope_ar, scope_en, image, excerpt_ar, excerpt_en, contentHtmlAr, contentHtmlEn, type, lang }) {
  const isAr = lang === 'ar';
  const title = isAr ? title_ar : (title_en || title_ar);
  const category = isAr ? (category_ar || 'أخبار الشركة') : (category_en || category_ar || 'Company News');
  const date = isAr ? (date_ar || '2026') : (date_en || date_ar || '2026');
  const author = isAr ? (author_ar || 'شركة الهمام المتقدمة') : (author_en || author_ar || 'Al Humam Advanced');
  const excerpt = isAr ? (excerpt_ar || '') : (excerpt_en || excerpt_ar || '');
  const contentHtml = isAr ? contentHtmlAr : (contentHtmlEn || contentHtmlAr);

  const backUrl = type === 'project' ? 'projects.html' : 'media.html';
  const backTextEn = type === 'project' ? 'BACK TO PROJECTS' : 'BACK TO MEDIA CENTER';
  const backTextAr = type === 'project' ? 'العودة للمشاريع' : 'العودة للمركز الإعلامي';
  const backText = isAr ? backTextAr : backTextEn;

  const htmlDir = isAr ? 'rtl' : 'ltr';
  const altDir = isAr ? 'en' : 'pages';

  const chrome = getSiteChrome(lang, altDir, fileName, type);

  return `<!DOCTYPE html>
<html lang="${lang}" dir="${htmlDir}">
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
    <title>${escapeHtml(title)} | ${isAr ? 'شركة الهمام المتقدمة' : 'Al Humam Advanced'}</title>
    <meta name="description" content="${escapeHtml(excerpt)}">
    <link rel="canonical" href="https://alhumam.sa/${isAr ? 'pages' : 'en'}/${fileName}">
    <link rel="alternate" hreflang="ar" href="https://alhumam.sa/pages/${fileName}">
    <link rel="alternate" hreflang="en" href="https://alhumam.sa/en/${fileName}">
    <link rel="alternate" hreflang="x-default" href="https://alhumam.sa/pages/${fileName}">
    <meta property="og:type" content="article">
    <meta property="og:title" content="${escapeHtml(title)} | ${isAr ? 'شركة الهمام المتقدمة' : 'Al Humam Advanced'}">
    <meta property="og:description" content="${escapeHtml(excerpt)}">
    <meta property="og:url" content="https://alhumam.sa/${isAr ? 'pages' : 'en'}/${fileName}">
    <meta property="og:site_name" content="${isAr ? 'شركة الهمام المتقدمة للمقاولات' : 'Al Humam Advanced Contracting'}">
    <meta property="og:image" content="${escapeHtml(image)}">
</head>
<body>
    <!-- Google Tag Manager (noscript) -->
    <noscript><iframe src="https://www.googletagmanager.com/ns.html?id=GTM-TFXX823L"
    height="0" width="0" style="display:none;visibility:hidden"></iframe></noscript>
    <!-- End Google Tag Manager (noscript) -->

    ${chrome ? chrome.header : '<div class="site-main-bg"></div>'}

    <!-- ============ ARTICLE HERO ============ -->
    <div class="article-hero" id="articleHero" style="background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url('${escapeHtml(image)}'); background-size: cover; background-position: center;">
        <div class="article-header" id="articleHeader">
            <h1 class="article-title" id="articleTitle" data-en="${escapeHtml(title_en || title)}" data-ar="${escapeHtml(title_ar || title)}">${escapeHtml(title)}</h1>
            <div class="article-meta">
                <span id="articleDate" data-en="${escapeHtml(date_en || date)}" data-ar="${escapeHtml(date_ar || date)}">${escapeHtml(date)}</span>
                <span id="articleAuthor" data-en="${escapeHtml(author_en || author)}" data-ar="${escapeHtml(author_ar || author)}">${escapeHtml(author)}</span>
                ${(scope_ar || scope_en) ? `<span class="article-scope" data-en="${escapeHtml(scope_en || scope_ar)}" data-ar="${escapeHtml(scope_ar || scope_en)}">${escapeHtml(isAr ? scope_ar : (scope_en || scope_ar))}</span>` : ''}
            </div>
        </div>
    </div>

    <!-- ============ ARTICLE CONTENT ============ -->
    <div class="article-container">
        <div class="article-body" id="articleBody">
            <div class="article-content-wrapper">
                ${contentHtml}
            </div>
        </div>
        <div class="article-back">
            <a href="${backUrl}" class="svc-cta__btn" data-en="${backTextEn}" data-ar="${backTextAr}">${backText}</a>
        </div>
    </div>

    ${chrome ? chrome.footer : '<footer class="footer"><div class="container footer__bottom"><p>&copy; 2026 Al Humam Advanced Contracting.</p></div></footer>'}

    <script src="../script.js?v=13.9"></script>
    <script src="../article.js?v=14.0"></script>
</body>
</html>`;
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
    const projRegex = new RegExp('(?:\\r?\\n)?[\\t ]*<div\\b[^>]*class=["\'][^"\']*?\\bproject-card\\b(?!__)[^"\']*?["\'][^>]*>(?:(?!<div\\b[^>]*class=["\'][^"\']*?\\bproject-card\\b(?!__))([\\s\\S]))*?' + hrefPattern + '(?:(?!<div\\b)[\\s\\S])*?<\\/div>\\s*<\\/div>', 'gi');
    cleaned = html.replace(projRegex, '');
  }

  if (cleaned && cleaned !== html) {
    fs.writeFileSync(pagePath, cleaned, 'utf8');
    return true;
  }
  return false;
}

function injectCardIntoGrid(pagePath, gridClass, cardHtml) {
  if (!fs.existsSync(pagePath)) return false;
  let content = fs.readFileSync(pagePath, 'utf8');
  if (!content || content.length < 500) return false;

  const pattern = new RegExp(`(<div\\b[^>]*class="[^"]*\\b${escapeRegex(gridClass)}\\b[^"]*"[^>]*>)`, 'i');
  if (pattern.test(content)) {
    const updated = content.replace(pattern, `$1\r\n${cardHtml}`);
    fs.writeFileSync(pagePath, updated, 'utf8');
    return true;
  }
  return false;
}

function updateSitemap(fileName) {
  const sitemapPath = path.join(ROOT, 'sitemap.xml');
  if (!fs.existsSync(sitemapPath)) return;
  let sitemap = fs.readFileSync(sitemapPath, 'utf8');
  const locAr = 'https://alhumam.sa/pages/' + fileName;
  const locEn = 'https://alhumam.sa/en/' + fileName;
  const today = new Date().toISOString().split('T')[0];

  if (!sitemap.includes(`<loc>${locAr}</loc>`)) {
    const entryAr = `  <url>
    <loc>${locAr}</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${locAr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${locEn}"/>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    sitemap = sitemap.replace('</urlset>', entryAr + '</urlset>');
  }

  if (!sitemap.includes(`<loc>${locEn}</loc>`)) {
    const entryEn = `  <url>
    <loc>${locEn}</loc>
    <xhtml:link rel="alternate" hreflang="ar" href="${locAr}"/>
    <xhtml:link rel="alternate" hreflang="en" href="${locEn}"/>
    <lastmod>${today}</lastmod>
    <changefreq>monthly</changefreq>
    <priority>0.8</priority>
  </url>\n`;
    sitemap = sitemap.replace('</urlset>', entryEn + '</urlset>');
  }

  fs.writeFileSync(sitemapPath, sitemap, 'utf8');
}

// ==========================================
// MAIN BUILD EXECUTION
// ==========================================
console.log('🚀 Starting Al Humam Decap CMS SSG Build...');

const allItems = [];

// 1. Process Articles
if (fs.existsSync(DATA_ARTICLES)) {
  const files = fs.readdirSync(DATA_ARTICLES).filter(f => f.endsWith('.md'));
  files.forEach(f => {
    const raw = fs.readFileSync(path.join(DATA_ARTICLES, f), 'utf8');
    const { data, body } = parseMarkdownFrontmatter(raw);
    const item = { ...data, type: 'article', markdown_body: body, sourceFile: f };
    allItems.push(item);
  });
}

// 2. Process Projects
if (fs.existsSync(DATA_PROJECTS)) {
  const files = fs.readdirSync(DATA_PROJECTS).filter(f => f.endsWith('.md'));
  files.forEach(f => {
    const raw = fs.readFileSync(path.join(DATA_PROJECTS, f), 'utf8');
    const { data, body } = parseMarkdownFrontmatter(raw);
    const item = { ...data, type: 'project', markdown_body: body, sourceFile: f };
    allItems.push(item);
  });
}

console.log(`📑 Found ${allItems.length} content items to generate.`);

allItems.forEach(item => {
  let fileName = item.id || path.basename(item.sourceFile, '.md');
  if (!fileName.endsWith('.html')) fileName += '.html';

  const contentHtmlAr = item.content_ar ? markdownToHtml(item.content_ar) : markdownToHtml(item.markdown_body);
  const contentHtmlEn = item.content_en ? markdownToHtml(item.content_en) : contentHtmlAr;

  // Build Arabic Page
  const arHtml = generateArticlePageHtml({
    fileName,
    title_ar: item.title_ar,
    title_en: item.title_en,
    category_ar: item.category_ar,
    category_en: item.category_en,
    date_ar: item.date_ar,
    date_en: item.date_en,
    author_ar: item.author_ar,
    author_en: item.author_en,
    scope_ar: item.scope_ar,
    scope_en: item.scope_en,
    image: item.image,
    excerpt_ar: item.excerpt_ar,
    excerpt_en: item.excerpt_en,
    contentHtmlAr,
    contentHtmlEn,
    type: item.type,
    lang: 'ar'
  });

  // Build English Page
  const enHtml = generateArticlePageHtml({
    fileName,
    title_ar: item.title_ar,
    title_en: item.title_en,
    category_ar: item.category_ar,
    category_en: item.category_en,
    date_ar: item.date_ar,
    date_en: item.date_en,
    author_ar: item.author_ar,
    author_en: item.author_en,
    scope_ar: item.scope_ar,
    scope_en: item.scope_en,
    image: item.image,
    excerpt_ar: item.excerpt_ar,
    excerpt_en: item.excerpt_en,
    contentHtmlAr,
    contentHtmlEn,
    type: item.type,
    lang: 'en'
  });

  fs.writeFileSync(path.join(ROOT, 'pages', fileName), arHtml, 'utf8');
  fs.writeFileSync(path.join(ROOT, 'en', fileName), enHtml, 'utf8');

  // Update Listings
  const subpageAr = path.join(ROOT, 'pages', item.type === 'project' ? 'projects.html' : 'media.html');
  const subpageEn = path.join(ROOT, 'en', item.type === 'project' ? 'projects.html' : 'media.html');

  removeCardFromListing(subpageAr, fileName, item.type);
  removeCardFromListing(subpageEn, fileName, item.type);

  if (item.type === 'article') {
    const cardAr = `
                <article class="media-card" data-aos="fade-up">
                    <div class="media-card__img" style="background-image: url('${escapeHtml(item.image)}');"></div>
                    <div class="media-card__body">
                        <h3 class="media-card__title" data-en="${escapeHtml(item.title_en)}" data-ar="${escapeHtml(item.title_ar)}">${escapeHtml(item.title_ar)}</h3>
                        <div class="media-card__footer">
                            <span class="media-card__date" data-en="${escapeHtml(item.date_en)}" data-ar="${escapeHtml(item.date_ar)}">${escapeHtml(item.date_ar)}</span>
                            <a href="${fileName}" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">اقرأ المزيد ←</a>
                        </div>
                    </div>
                </article>`;

    const cardEn = `
                <article class="media-card" data-aos="fade-up">
                    <div class="media-card__img" style="background-image: url('${escapeHtml(item.image)}');"></div>
                    <div class="media-card__body">
                        <h3 class="media-card__title" data-en="${escapeHtml(item.title_en)}" data-ar="${escapeHtml(item.title_ar)}">${escapeHtml(item.title_en)}</h3>
                        <div class="media-card__footer">
                            <span class="media-card__date" data-en="${escapeHtml(item.date_en)}" data-ar="${escapeHtml(item.date_ar)}">${escapeHtml(item.date_en)}</span>
                            <a href="${fileName}" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">Read More →</a>
                        </div>
                    </div>
                </article>`;

    injectCardIntoGrid(subpageAr, 'media__grid', cardAr);
    injectCardIntoGrid(subpageEn, 'media__grid', cardEn);
  } else {
    const cardAr = `
                <div class="project-card" data-aos="fade-up">
                    <div class="project-card__img" style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url('${escapeHtml(item.image)}'); background-size: cover; background-position: center;">
                        <div class="project-card__content">
                            <span class="project-card__tag" data-en="${escapeHtml(item.category_en)}" data-ar="${escapeHtml(item.category_ar)}">${escapeHtml(item.category_ar)}</span>
                            <h3 data-en="${escapeHtml(item.title_en)}" data-ar="${escapeHtml(item.title_ar)}">${escapeHtml(item.title_ar)}</h3>
                            <p data-en="${escapeHtml(item.scope_en)}" data-ar="${escapeHtml(item.scope_ar)}">${escapeHtml(item.scope_ar)}</p>
                        </div>
                        <a href="${fileName}" class="project-card__link" data-en="Read More" data-ar="اقرأ المزيد">اقرأ المزيد</a>
                    </div>
                </div>`;

    const cardEn = `
                <div class="project-card" data-aos="fade-up">
                    <div class="project-card__img" style="background-image: url('${escapeHtml(item.image)}');">
                        <div class="project-card__content">
                            <span class="project-card__tag" data-en="${escapeHtml(item.category_en)}" data-ar="${escapeHtml(item.category_ar)}">${escapeHtml(item.category_en)}</span>
                            <h3 data-en="${escapeHtml(item.title_en)}" data-ar="${escapeHtml(item.title_ar)}">${escapeHtml(item.title_en)}</h3>
                            <p data-en="${escapeHtml(item.scope_en)}" data-ar="${escapeHtml(item.scope_ar)}">${escapeHtml(item.scope_ar)}</p>
                        </div>
                        <a href="${fileName}" class="project-card__link" data-en="Read More" data-ar="اقرأ المزيد">Read More</a>
                    </div>
                </div>`;

    injectCardIntoGrid(subpageAr, 'projects__grid', cardAr);
    injectCardIntoGrid(subpageEn, 'projects__grid', cardEn);
  }

  updateSitemap(fileName);
  console.log(`✅ Generated: ${fileName} (Arabic & English) with Full Header & Footer`);
});

console.log('✨ Build finished successfully!');
