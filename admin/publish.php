<?php
/**
 * Al Humam Advanced Contracting — Fail-Safe Bilingual Content Publisher
 * Compatible with PHP 7.4 - 8.3, Apache 2.4, ProFreeHost, Hostinger, and cPanel.
 */

ob_start();
ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once __DIR__ . '/config.php';
requireAuth();
// PHP 7.4 Compatibility Polyfills
if (!function_exists('str_ends_with')) {
    function str_ends_with($haystack, $needle) {
        $length = strlen($needle);
        return $length === 0 || (substr($haystack, -$length) === $needle);
    }
}
if (!function_exists('str_starts_with')) {
    function str_starts_with($haystack, $needle) {
        return strncmp($haystack, $needle, strlen($needle)) === 0;
    }
}
if (!function_exists('str_contains')) {
    function str_contains($haystack, $needle) {
        return $needle !== '' && mb_strpos($haystack, $needle) !== false;
    }
}


// ================= HELPER FUNCTIONS =================

function updateSitemap($fileName, $action = 'add') {
    $sitemapPath = ROOT_DIR . '/sitemap.xml';
    if (!file_exists($sitemapPath)) return;
    $sitemap = @file_get_contents($sitemapPath);
    if ($sitemap === false || strlen($sitemap) < 100) return;

    $locAr = 'https://alhumam.sa/pages/' . $fileName;
    $locEn = 'https://alhumam.sa/en/' . $fileName;
    $today = date('Y-m-d');

    if ($action === 'delete') {
        $regexAr = '/[\\t ]*<url>\\s*<loc>' . preg_quote($locAr, '/') . '<\\/loc>[\\s\\S]*?<\\/url>\\s*/i';
        $regexEn = '/[\\t ]*<url>\\s*<loc>' . preg_quote($locEn, '/') . '<\\/loc>[\\s\\S]*?<\\/url>\\s*/i';
        $sitemap = preg_replace($regexAr, '', $sitemap);
        $sitemap = preg_replace($regexEn, '', $sitemap);
        if ($sitemap !== null && strlen($sitemap) > 100) {
            @file_put_contents($sitemapPath, $sitemap, LOCK_EX);
        }
        return;
    }

    if (strpos($sitemap, "<loc>{$locAr}</loc>") !== false) {
        $regexAr = '/(<loc>' . preg_quote($locAr, '/') . '<\\/loc>[\\s\\S]*?<lastmod>)[^<]+(<\\/lastmod>)/i';
        $sitemap = preg_replace($regexAr, '\${1}' . $today . '\${2}', $sitemap);
    }
    if (strpos($sitemap, "<loc>{$locEn}</loc>") !== false) {
        $regexEn = '/(<loc>' . preg_quote($locEn, '/') . '<\\/loc>[\\s\\S]*?<lastmod>)[^<]+(<\\/lastmod>)/i';
        $sitemap = preg_replace($regexEn, '\${1}' . $today . '\${2}', $sitemap);
    }
    if (strpos($sitemap, "<loc>{$locAr}</loc>") === false && strpos($sitemap, "<loc>{$locEn}</loc>") === false) {
        $newBlock = '  <url>\n'
            . '    <loc>' . $locAr . '</loc>\n'
            . '    <xhtml:link rel="alternate" hreflang="ar" href="' . $locAr . '"/>\n'
            . '    <xhtml:link rel="alternate" hreflang="en" href="' . $locEn . '"/>\n'
            . '    <xhtml:link rel="alternate" hreflang="x-default" href="' . $locAr . '"/>\n'
            . '    <lastmod>' . $today . '</lastmod>\n'
            . '    <changefreq>monthly</changefreq>\n'
            . '    <priority>0.8</priority>\n'
            . '  </url>\n'
            . '  <url>\n'
            . '    <loc>' . $locEn . '</loc>\n'
            . '    <xhtml:link rel="alternate" hreflang="en" href="' . $locEn . '"/>\n'
            . '    <xhtml:link rel="alternate" hreflang="ar" href="' . $locAr . '"/>\n'
            . '    <xhtml:link rel="alternate" hreflang="x-default" href="' . $locAr . '"/>\n'
            . '    <lastmod>' . $today . '</lastmod>\n'
            . '    <changefreq>monthly</changefreq>\n'
            . '    <priority>0.8</priority>\n'
            . '  </url>\n'
            . '</urlset>';
        $sitemap = str_replace('</urlset>', $newBlock, $sitemap);
    }
    if ($sitemap !== null && strlen($sitemap) > 100) {
        @file_put_contents($sitemapPath, $sitemap, LOCK_EX);
    }
}

function removeCardFromListing($pagePath, $fileName, $type) {
    if (!file_exists($pagePath)) return false;
    $html = @file_get_contents($pagePath);
    if ($html === false || strlen($html) < 500) return false;

    $baseSlug = preg_replace('/\.html$/i', '', basename($fileName));
    if (empty($baseSlug)) return false;
    $slugCore = preg_replace('/-\d{9,}$/', '', $baseSlug);

    // Clean literal slash-n
    $html = str_replace(array('\\n', '\n'), '', $html);

    $escapedSlug = preg_quote($baseSlug, '/');
    $escapedCore = preg_quote($slugCore, '/');

    // Matches any href referencing this slug or core slug
    $hrefPattern = 'href=["\x27][^"\x27]*?(?:' . $escapedSlug . '|' . $escapedCore . ')(?:-\d+)?(?:\.html)?["\x27]';

    $cleaned = null;
    if ($type === 'article') {
        $pattern = '/\s*<article\b[^>]*class=["\x27][^"\x27]*\bmedia-card\b[^"\x27]*["\x27][^>]*>(?:(?!<article\b).)*?' . $hrefPattern . '.*?<\/article>\s*/isu';
        $cleaned = preg_replace($pattern, "\n", $html);
    } else {
        $pattern = '/\s*<div\b[^>]*class=["\x27][^"\x27]*\bproject-card\b(?!__)[^"\x27]*["\x27][^>]*>(?:(?!<div\b[^>]*class=["\x27][^"\x27]*\bproject-card\b(?!__)).)*?' . $hrefPattern . '.*?<\/div>\s*<\/div>\s*<\/div>\s*/isu';
        $cleaned = preg_replace($pattern, "\n", $cleaned);
    }

    if ($cleaned !== null && $cleaned !== $html && strlen($cleaned) >= (strlen($html) - 30000)) {
        @file_put_contents($pagePath, $cleaned);
        return true;
    }
    return false;
}

function injectCardIntoGrid($pagePath, $gridClass, $cardHtml, $fileName = '', $type = 'article') {
    if (!file_exists($pagePath)) return false;

    // Remove any existing card for this file/slug FIRST to guarantee 0 duplicates
    if (!empty($fileName)) {
        removeCardFromListing($pagePath, $fileName, $type);
    }

    $content = @file_get_contents($pagePath);
    if ($content === false || strlen($content) < 500) {
        return false;
    }

    // Clean literal \n inside grid
    $content = str_replace(array('\\n', '\n'), '', $content);

    // Match grid opening tag
    $pattern = '/(<div\b[^>]*class=["\x27][^"\x27]*\b' . preg_quote($gridClass, '/') . '\b[^"\x27]*["\x27][^>]*>)/iu';
    if (preg_match($pattern, $content)) {
        $updated = preg_replace($pattern, "$1\n" . $cardHtml, $content, 1);
        if ($updated !== null && !empty($updated) && strlen($updated) > strlen($content)) {
            $written = @file_put_contents($pagePath, $updated);
            return $written !== false;
        }
    }
    return false;
}
function applySiteTemplate($pageHtml, $templatePath, $altDir, $fileName, $type) {
    if (!file_exists($templatePath)) return $pageHtml;
    $tpl = @file_get_contents($templatePath);
    if ($tpl === false || strlen($tpl) < 5000) return $pageHtml;

    $hStart = strpos($tpl, '<div class="site-main-bg"></div>');
    $hEnd = strpos($tpl, '</header>');
    $fStart = strpos($tpl, '<!-- ============ FOOTER ============ -->');
    $fEnd = strrpos($tpl, '</body>');
    if ($hStart === false || $hEnd === false || $fStart === false || $fEnd === false || $hEnd < $hStart || $fEnd < $fStart) {
        return $pageHtml;
    }
    $header = substr($tpl, $hStart, ($hEnd + strlen('</header>')) - $hStart);
    $footer = substr($tpl, $fStart, $fEnd - $fStart);

    // Language toggle points to this article's counterpart page
    $header = preg_replace('/href="\\.\\.\\/(en|pages)\\/article-[^"]+"/', 'href="../' . $altDir . '/' . $fileName . '"', $header);
    // Active nav item
    $header = str_replace(' nav__link--active', '', $header);
    $activeHref = $type === 'project' ? 'projects.html' : 'media.html';
    $header = preg_replace('/(<a href="' . preg_quote($activeHref, '/') . '"[^>]*class="nav__link)"/', '$1 nav__link--active"', $header, 1);
    // Replace scripts with current versions
    $footer = preg_replace('/\\s*<script src="\\.\\.\\/(script|article)\\.js[^"]*"><\\/script>/', '', $footer);
    $footer = rtrim($footer) . "\n    " . '<script src="../script.js?v=13.9"></script>' . "\n    " . '<script src="../article.js?v=14.0"></script>' . "\n";

    $pStart = strpos($pageHtml, '<div class="site-main-bg"></div>');
    $pHeaderEnd = strpos($pageHtml, '</header>');
    $pFooterStart = strpos($pageHtml, '<!-- ============ FOOTER ============ -->');
    $pEnd = strrpos($pageHtml, '</body>');
    if ($pStart === false || $pHeaderEnd === false || $pFooterStart === false || $pEnd === false) return $pageHtml;

    $result = substr($pageHtml, 0, $pStart) . $header
        . substr($pageHtml, $pHeaderEnd + strlen('</header>'), $pFooterStart - ($pHeaderEnd + strlen('</header>')))
        . $footer . substr($pageHtml, $pEnd);
    return strlen($result) > 3000 ? $result : $pageHtml;
}

/**
 * Sanitizes and formats article body HTML safely while preserving rich formatting
 * (h2, h3, h4, strong, b, em, i, span.gold-text, blockquote, ul, ol, li, p, br, a).
 * If plain text without tags is provided, converts paragraphs to <p> tags.
 */
function sanitizeArticleHtml($content) {
    if (empty($content)) return '';

    // Check if user input contains HTML tags
    $hasTags = (bool)preg_match('/<[a-z][\\s\\S]*>/i', $content);

    if ($hasTags) {
        // Strip dangerous tags completely
        $clean = preg_replace('/<\\s*(script|iframe|object|embed|applet|meta|link|style|form|input|button|select)[^>]*>[\\s\\S]*?<\\s*\\/\\s*\\1\\s*>/i', '', $content);
        $clean = preg_replace('/<\\s*(script|iframe|object|embed|applet|meta|link|style|form|input|button|select)[^>]*\\/?>/i', '', $clean);
        // Strip on* event attributes
        $clean = preg_replace('/\\s*on[a-z]+\\s*=\\s*("[^"]*"|\'[^\']*\'|[^\\s>]+)/i', '', $clean);
        // Strip javascript: URLs
        $clean = preg_replace('/href\\s*=\\s*[\\"\']\\s*javascript:[^\\"\']*[\\"\']/i', 'href="#"', $clean);

        // Process line by line to ensure bare lines are wrapped in <p>
        $lines = explode("\\n", $clean);
        $result = [];
        foreach ($lines as $line) {
            $trimmed = trim($line);
            if (empty($trimmed)) continue;
            // If already a block tag
            if (preg_match('/^<(h[1-6]|p|ul|ol|li|blockquote|div)\\b/i', $trimmed)) {
                $result[] = '                ' . $trimmed;
            } else {
                $result[] = '                <p>' . $trimmed . '</p>';
            }
        }
        return implode("\\n", $result);
    } else {
        // Plain text: convert paragraphs separated by blank lines into <p> tags
        $paras = preg_split('/\\r?\\n\\s*\\r?\\n/', trim($content));
        $result = [];
        foreach ($paras as $para) {
            $trimmed = trim($para);
            if (!empty($trimmed)) {
                $withBr = nl2br(htmlspecialchars($trimmed, ENT_QUOTES, 'UTF-8'));
                $result[] = '                <p>' . $withBr . '</p>';
            }
        }
        return implode("\\n", $result);
    }
}

try {

    // ================= HANDLE DELETE ACTION =================
    if (isset($_GET['action']) && $_GET['action'] === 'delete') {
        $deleteId = (string)trim($_GET['id'] ?? '');
        $deleteFile = (string)trim($_GET['file'] ?? '');
        $type = isset($_GET['type']) && $_GET['type'] === 'project' ? 'project' : 'article';

        if (empty($deleteId) && empty($deleteFile)) {
            ob_clean();
            header('Location: index.php?error=' . urlencode('معرف المقال غير موجود'));
            exit;
        }

        $data = loadContentData();
        $targetCollection = $type === 'project' ? 'projects' : 'articles';
        $foundIndex = -1;
        $fileToDelete = !empty($deleteFile) ? $deleteFile : '';

        $deleteIdBase = !empty($deleteId) ? pathinfo($deleteId, PATHINFO_FILENAME) : '';
        $deleteFileBase = !empty($deleteFile) ? pathinfo($deleteFile, PATHINFO_FILENAME) : '';

        foreach ($data[$targetCollection] as $idx => $item) {
            $itemId = (string)($item['id'] ?? '');
            $itemFile = (string)($item['file'] ?? '');
            $itemFileBase = pathinfo($itemFile, PATHINFO_FILENAME);

            if (
                (!empty($deleteId) && $itemId === $deleteId) ||
                (!empty($deleteFile) && $itemFile === $deleteFile) ||
                (!empty($deleteIdBase) && ($itemId === $deleteIdBase || $itemFileBase === $deleteIdBase)) ||
                (!empty($deleteFileBase) && ($itemId === $deleteFileBase || $itemFileBase === $deleteFileBase))
            ) {
                $foundIndex = $idx;
                if (empty($fileToDelete)) {
                    $fileToDelete = $itemFile ?: ($itemId . '.html');
                }
                break;
            }
        }

        if (empty($fileToDelete) && !empty($deleteId)) {
            $fileToDelete = (substr($deleteId, -5) === '.html') ? $deleteId : ($deleteId . '.html');
        }

        // 1. Remove HTML files (both Arabic and English pages)
        if (!empty($fileToDelete)) {
            $arFile = PAGES_DIR . '/' . $fileToDelete;
            $enFile = EN_DIR . '/' . $fileToDelete;
            if (file_exists($arFile)) { @unlink($arFile); }
            if (file_exists($enFile)) { @unlink($enFile); }
        }

        // 2. Remove Cards from all listing pages
        $subpageAr = $type === 'project' ? PAGES_DIR . '/projects.html' : PAGES_DIR . '/media.html';
        $subpageEn = $type === 'project' ? EN_DIR . '/projects.html' : EN_DIR . '/media.html';
        $homeAr = ROOT_DIR . '/index.html';
        $homeEn = EN_DIR . '/index.html';

        if (!empty($fileToDelete)) {
            removeCardFromListing($subpageAr, $fileToDelete, $type);
            removeCardFromListing($subpageEn, $fileToDelete, $type);
            removeCardFromListing($homeAr, $fileToDelete, $type);
            removeCardFromListing($homeEn, $fileToDelete, $type);
            updateSitemap($fileToDelete, 'delete');
        }

        // 3. Remove from JSON
        if ($foundIndex !== -1) {
            array_splice($data[$targetCollection], $foundIndex, 1);
            saveContentData($data);
        }

        ob_clean();
        header('Location: index.php?success=' . urlencode('deleted') . '&type=' . $type);
        exit;
    }

    // ================= HANDLE PUBLISH / EDIT POST =================
    if ($_SERVER['REQUEST_METHOD'] !== 'POST') {
        ob_clean();
        header('Location: index.php');
        exit;
    }

    $edit_id = (string)trim($_POST['edit_id'] ?? '');
    $existing_file = (string)trim($_POST['existing_file'] ?? '');
    $is_edit = (!empty($edit_id) || !empty($existing_file));
    $type = isset($_POST['type']) && $_POST['type'] === 'project' ? 'project' : 'article';

    // Bilingual Form Fields
    $title_ar = (string)trim($_POST['title_ar'] ?? '');
    $title_en = (string)trim($_POST['title_en'] ?? '');
    $category_ar = (string)trim($_POST['category_ar'] ?? ($type === 'project' ? 'حكومي' : 'مشاريع حكومية'));
    $category_en = (string)trim($_POST['category_en'] ?? ($type === 'project' ? 'Government' : 'Government Projects'));
    $date_ar = (string)trim($_POST['date_ar'] ?? 'أكتوبر 2026');
    $date_en = (string)trim($_POST['date_en'] ?? 'October 2026');
    $author_ar = (string)trim($_POST['author_ar'] ?? 'المكتب الإعلامي لشركة الهمام المتقدمة');
    $author_en = (string)trim($_POST['author_en'] ?? 'Al Humam Press Office');
    $scope_ar = (string)trim($_POST['scope_ar'] ?? '');
    $scope_en = (string)trim($_POST['scope_en'] ?? '');
    $excerpt_ar = (string)trim($_POST['excerpt_ar'] ?? '');
    $excerpt_en = (string)trim($_POST['excerpt_en'] ?? '');
    $content_ar = (string)trim($_POST['content_ar'] ?? '');
    $content_en = (string)trim($_POST['content_en'] ?? '');

    if (empty($title_ar)) {
        ob_clean();
        header('Location: index.php?error=' . urlencode('يرجى إدخال عنوان المقال أو المشروع بالعربية'));
        exit;
    }

    if (empty($title_en)) {
        $title_en = $title_ar;
    }
    if (empty($excerpt_en)) {
        $excerpt_en = !empty($excerpt_ar) ? $excerpt_ar : $title_en;
    }
    if (empty($excerpt_ar)) {
        $excerpt_ar = $title_ar;
    }
    if (empty($content_en)) {
        $content_en = !empty($content_ar) ? $content_ar : $excerpt_en;
    }
    if (empty($content_ar)) {
        $content_ar = $excerpt_ar;
    }
    if (empty($scope_en)) {
        $scope_en = $scope_ar;
    }

    // Find existing item if editing
    $data = loadContentData();
    $targetCollection = $type === 'project' ? 'projects' : 'articles';
    $existingItem = null;
    $existingIndex = -1;

    $editIdBase = !empty($edit_id) ? pathinfo($edit_id, PATHINFO_FILENAME) : '';
    $existingFileBase = !empty($existing_file) ? pathinfo($existing_file, PATHINFO_FILENAME) : '';

    if ($is_edit) {
        foreach ($data[$targetCollection] as $idx => $item) {
            $itemId = (string)($item['id'] ?? '');
            $itemFile = (string)($item['file'] ?? '');
            $itemFileBase = pathinfo($itemFile, PATHINFO_FILENAME);
            $itemTitleAr = (string)($item['title_ar'] ?? '');
            $itemTitleEn = (string)($item['title_en'] ?? '');

            $idMatched = (!empty($edit_id) && $itemId === $edit_id) || (!empty($editIdBase) && ($itemId === $editIdBase || $itemFileBase === $editIdBase));
            $fileMatched = (!empty($existing_file) && $itemFile === $existing_file) || (!empty($existingFileBase) && ($itemId === $existingFileBase || $itemFileBase === $existingFileBase));
            $titleMatched = (!empty($title_ar) && $itemTitleAr === $title_ar);

            if ($idMatched || $fileMatched || ($titleMatched && empty($edit_id))) {
                $existingItem = $item;
                $existingIndex = $idx;
                $is_edit = true;
                if (empty($edit_id)) {
                    $edit_id = $itemId;
                }
                if (empty($existing_file)) {
                    $existing_file = $itemFile;
                }
                break;
            }
        }
    }

    // 1. Handle Featured Image
    $image_path_relative = '';
    if (isset($_FILES['image']) && is_array($_FILES['image']) && $_FILES['image']['error'] === UPLOAD_ERR_OK) {
        $fileTmp = $_FILES['image']['tmp_name'];
        $fileNameOrig = $_FILES['image']['name'];
        $ext = strtolower(pathinfo($fileNameOrig, PATHINFO_EXTENSION));
        $allowed = ['jpg', 'jpeg', 'png', 'webp', 'avif'];
        
        if (in_array($ext, $allowed)) {
            $safeName = ($type === 'project' ? 'proj_' : 'news_') . time() . '_' . mt_rand(100, 999) . '.' . $ext;
            $dest = IMAGES_ARTICLES_DIR . '/' . $safeName;
            if (@move_uploaded_file($fileTmp, $dest)) {
                $image_path_relative = '../images/articles/' . $safeName;
            }
        }
    }

    if (empty($image_path_relative)) {
        if (!empty($_POST['image_url'])) {
            $image_path_relative = (string)trim($_POST['image_url']);
        } elseif ($is_edit && !empty($existingItem['image'])) {
            $image_path_relative = (string)$existingItem['image'];
        } else {
            $image_path_relative = '../images/articles/news-gov.jpg';
        }
    }

    // Calculate Home Image Path (never null)
    $image_path_home = preg_replace('/^\\.\\.\\//', '', (string)$image_path_relative);
    if (empty($image_path_home)) {
        $image_path_home = 'images/articles/news-gov.jpg';
    }

    // 2. Generate or Keep File Name
    $file_name = '';
    if ($is_edit) {
        if (!empty($existingItem['file'])) {
            $file_name = (string)$existingItem['file'];
        } elseif (!empty($existing_file)) {
            $file_name = $existing_file;
        } elseif (!empty($edit_id)) {
            $file_name = (substr($edit_id, -5) === '.html') ? $edit_id : ($edit_id . '.html');
        }
    }

    if (empty($file_name)) {
        $clean_slug_base = preg_replace('/[^a-z0-9\\-]/', '-', strtolower($title_en));
        $clean_slug_base = trim((string)preg_replace('/-+/', '-', (string)$clean_slug_base), '-');
        if (empty($clean_slug_base) || strlen($clean_slug_base) < 3) {
            $clean_slug_base = $type === 'project' ? 'custom-project' : 'custom-news';
        }
        $file_name = ($type === 'project' ? 'article-project-' : 'article-news-') . $clean_slug_base . '-' . time() . '.html';
    }

    $ar_file_path = PAGES_DIR . '/' . $file_name;
    $en_file_path = EN_DIR . '/' . $file_name;

    // 3. Format Content for Both Languages using Safe Rich Formatting
    $ar_paragraphs_html = sanitizeArticleHtml($content_ar);
    if (empty($ar_paragraphs_html)) {
        $ar_paragraphs_html = "                <p>" . htmlspecialchars($excerpt_ar, ENT_QUOTES, 'UTF-8') . "</p>\\n";
    }

    $en_paragraphs_html = sanitizeArticleHtml($content_en);
    if (empty($en_paragraphs_html)) {
        $en_paragraphs_html = "                <p>" . htmlspecialchars($excerpt_en, ENT_QUOTES, 'UTF-8') . "</p>\\n";
    }

    $back_url = $type === 'project' ? 'projects.html' : 'media.html';
    $back_text_ar = $type === 'project' ? 'العودة للمشاريع' : 'العودة للمركز الإعلامي';
    $back_text_en = $type === 'project' ? 'BACK TO PROJECTS' : 'BACK TO MEDIA CENTER';

    // 4. Generate Arabic Standalone Page (pages/{file_name})
    $ar_page_html = '<!DOCTYPE html>
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
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({\'gtm.start\':
    new Date().getTime(),event:\'gtm.js\'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!=\'dataLayer\'?\'&l=\'+l:\'\';j.async=true;j.src=
    \'https://www.googletagmanager.com/gtm.js?id=\'+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,\'script\',\'dataLayer\',\'GTM-TFXX823L\');</script>
    <!-- End Google Tag Manager -->
    <title>' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . ' | شركة الهمام المتقدمة</title>
    <meta name="description" content="' . htmlspecialchars($excerpt_ar, ENT_QUOTES, 'UTF-8') . '">
    <link rel="canonical" href="https://alhumam.sa/pages/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '">
    <link rel="alternate" hreflang="ar" href="https://alhumam.sa/pages/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '">
    <link rel="alternate" hreflang="en" href="https://alhumam.sa/en/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '">
    <link rel="alternate" hreflang="x-default" href="https://alhumam.sa/pages/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '">
    <meta property="og:type" content="article">
    <meta property="og:title" content="' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . ' | شركة الهمام المتقدمة">
    <meta property="og:description" content="' . htmlspecialchars($excerpt_ar, ENT_QUOTES, 'UTF-8') . '">
    <meta property="og:url" content="https://alhumam.sa/pages/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '">
    <meta property="og:site_name" content="شركة الهمام المتقدمة للمقاولات | Al Humam Advanced">
    <meta property="og:image" content="' . htmlspecialchars($image_path_relative, ENT_QUOTES, 'UTF-8') . '">
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
                    <li><a href="projects.html" class="nav__link ' . ($type === 'project' ? 'nav__link--active' : '') . '" data-en="PROJECTS" data-ar="مشاريعنا">مشاريعنا</a></li>
                    <li><a href="innovation.html" class="nav__link" data-en="INNOVATION" data-ar="الابتكار">الابتكار</a></li>
                    <li><a href="media.html" class="nav__link ' . ($type === 'article' ? 'nav__link--active' : '') . '" data-en="MEDIA CENTER" data-ar="المركز الإعلامي">المركز الإعلامي</a></li>
                    <li><a href="careers.html" class="nav__link" data-en="CAREERS" data-ar="التوظيف">التوظيف</a></li>
                    <li><a href="contact.html" class="nav__link" data-en="CONTACT" data-ar="اتصل بنا">اتصل بنا</a></li>
                </ul>
            </nav>
            <div class="header__actions">
                <a href="../en/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '" class="lang-toggle" aria-label="Switch to English">EN</a>
                <button class="hamburger" id="hamburger" aria-label="Toggle Menu"><span></span><span></span><span></span></button>
            </div>
        </div>
    </header>

    <!-- ============ ARTICLE HERO ============ -->
    <div class="article-hero" id="articleHero" style="background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url(\'' . htmlspecialchars($image_path_relative, ENT_QUOTES, 'UTF-8') . '\'); background-size: cover; background-position: center;">
        <div class="article-header" id="articleHeader">
            <span class="badge-tag" style="display:inline-block; margin-bottom:12px; font-size:1rem; padding:4px 14px;">' . htmlspecialchars($category_ar, ENT_QUOTES, 'UTF-8') . '</span>
            <h1 class="article-title" id="articleTitle" data-en="' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '</h1>
            <div class="article-meta">
                <span id="articleDate" data-en="' . htmlspecialchars($date_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($date_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($date_ar, ENT_QUOTES, 'UTF-8') . '</span>
                ' . (!empty($author_ar) ? '<span id="articleAuthor" data-en="' . htmlspecialchars($author_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($author_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($author_ar, ENT_QUOTES, 'UTF-8') . '</span>' : '') . '
                ' . (!empty($scope_ar) ? '<span class="article-scope">' . htmlspecialchars($scope_ar, ENT_QUOTES, 'UTF-8') . '</span>' : '') . '
            </div>
        </div>
    </div>

    <!-- ============ ARTICLE CONTENT ============ -->
    <div class="article-container">
        <div class="article-body" id="articleBody">
            <div class="article-content-wrapper">
' . $ar_paragraphs_html . '
            </div>
        </div>
        <div class="article-back">
            <a href="' . htmlspecialchars($back_url, ENT_QUOTES, 'UTF-8') . '" class="svc-cta__btn" data-en="' . htmlspecialchars($back_text_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($back_text_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($back_text_ar, ENT_QUOTES, 'UTF-8') . '</a>
        </div>
    </div>

    <!-- ============ FOOTER ============ -->
    <footer class="footer">
        <div class="footer__container">
            <div class="footer__grid">
                <div class="footer__brand">
                    <span class="logo-text logo-text--en">AL HUMAM<span class="logo-accent"> ADVANCED</span></span>
                    <span class="logo-text logo-text--ar">الهمام المتقدمة<span class="logo-accent"> للمقاولات</span></span>
                    <p class="footer__desc" data-en="Leading Saudi general contracting company delivering excellence in government, commercial, and infrastructure projects across the Kingdom." data-ar="شركة مقاولات عامة سعودية رائدة تقدم التميز في المشاريع الحكومية والتجارية ومشاريع البنية التحتية في جميع أنحاء المملكة.">
                        شركة مقاولات عامة سعودية رائدة تقدم التميز في المشاريع الحكومية والتجارية ومشاريع البنية التحتية في جميع أنحاء المملكة.
                    </p>
                </div>
                <div class="footer__nav">
                    <h4 class="footer__heading" data-en="NAVIGATION" data-ar="التنقل">التنقل</h4>
                    <ul class="footer__links">
                        <li><a href="about.html" data-en="About Us" data-ar="من نحن">من نحن</a></li>
                        <li><a href="services.html" data-en="Services" data-ar="خدماتنا">خدماتنا</a></li>
                        <li><a href="projects.html" data-en="Projects" data-ar="مشاريعنا">مشاريعنا</a></li>
                        <li><a href="sustainability.html" data-en="Sustainability" data-ar="الاستدامة">الاستدامة</a></li>
                        <li><a href="innovation.html" data-en="Innovation" data-ar="الابتكار">الابتكار</a></li>
                        <li><a href="media.html" data-en="Media Center" data-ar="المركز الإعلامي">المركز الإعلامي</a></li>
                        <li><a href="careers.html" data-en="Careers" data-ar="التوظيف">التوظيف</a></li>
                        <li><a href="contact.html" data-en="Contact" data-ar="اتصل بنا">اتصل بنا</a></li>
                    </ul>
                </div>
                <div class="footer__contact">
                    <h4 class="footer__heading" data-en="CONTACT" data-ar="معلومات الاتصال">معلومات الاتصال</h4>
                    <p class="footer__info" data-en="Riyadh, Kingdom of Saudi Arabia" data-ar="الرياض، المملكة العربية السعودية">الرياض، المملكة العربية السعودية</p>
                    <p class="footer__info"><a href="tel:+966555021200" dir="ltr">+966 55 502 1200</a></p>
                    <p class="footer__info"><a href="mailto:info@alhumam.sa">info@alhumam.sa</a></p>
                </div>
            </div>
            <div class="footer__bottom">
                <p class="footer__copy" data-en="© 2026 Al Humam Advanced Contracting Co. All rights reserved." data-ar="© 2026 شركة الهمام المتقدمة للمقاولات. جميع الحقوق محفوظة.">
                    © 2026 شركة الهمام المتقدمة للمقاولات. جميع الحقوق محفوظة.
                </p>
            </div>
        </div>
    </footer>

    <script src="../script.js?v=13.9"></script>
    <script src="../article.js?v=14.0"></script>
</body>
</html>';

    // 5. Generate English Standalone Page (en/{file_name})
    $en_page_html = '<!DOCTYPE html>
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
    <script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({\'gtm.start\':
    new Date().getTime(),event:\'gtm.js\'});var f=d.getElementsByTagName(s)[0],
    j=d.createElement(s),dl=l!=\'dataLayer\'?\'&l=\'+l:\'\';j.async=true;j.src=
    \'https://www.googletagmanager.com/gtm.js?id=\'+i+dl;f.parentNode.insertBefore(j,f);
    })(window,document,\'script\',\'dataLayer\',\'GTM-TFXX823L\');</script>
    <!-- End Google Tag Manager -->
    <title>' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . ' | Al Humam Advanced Contracting</title>
    <meta name="description" content="' . htmlspecialchars($excerpt_en, ENT_QUOTES, 'UTF-8') . '">
    <link rel="canonical" href="https://alhumam.sa/en/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '">
    <link rel="alternate" hreflang="ar" href="https://alhumam.sa/pages/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '">
    <link rel="alternate" hreflang="en" href="https://alhumam.sa/en/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '">
    <link rel="alternate" hreflang="x-default" href="https://alhumam.sa/pages/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '">
    <meta property="og:type" content="article">
    <meta property="og:title" content="' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . ' | Al Humam Advanced Contracting">
    <meta property="og:description" content="' . htmlspecialchars($excerpt_en, ENT_QUOTES, 'UTF-8') . '">
    <meta property="og:url" content="https://alhumam.sa/en/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '">
    <meta property="og:site_name" content="Al Humam Advanced Contracting Co.">
    <meta property="og:image" content="' . htmlspecialchars($image_path_relative, ENT_QUOTES, 'UTF-8') . '">
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
                    <li><a href="projects.html" class="nav__link ' . ($type === 'project' ? 'nav__link--active' : '') . '" data-en="PROJECTS" data-ar="مشاريعنا">PROJECTS</a></li>
                    <li><a href="innovation.html" class="nav__link" data-en="INNOVATION" data-ar="الابتكار">INNOVATION</a></li>
                    <li><a href="media.html" class="nav__link ' . ($type === 'article' ? 'nav__link--active' : '') . '" data-en="MEDIA CENTER" data-ar="المركز الإعلامي">MEDIA CENTER</a></li>
                    <li><a href="careers.html" class="nav__link" data-en="CAREERS" data-ar="التوظيف">CAREERS</a></li>
                    <li><a href="contact.html" class="nav__link" data-en="CONTACT" data-ar="اتصل بنا">CONTACT</a></li>
                </ul>
            </nav>
            <div class="header__actions">
                <a href="../pages/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '" class="lang-toggle" aria-label="التبديل إلى العربية">عربي</a>
                <button class="hamburger" id="hamburger" aria-label="Toggle Menu"><span></span><span></span><span></span></button>
            </div>
        </div>
    </header>

    <!-- ============ ARTICLE HERO ============ -->
    <div class="article-hero" id="articleHero" style="background-image: linear-gradient(rgba(0,0,0,0.55), rgba(0,0,0,0.85)), url(\'' . htmlspecialchars($image_path_relative, ENT_QUOTES, 'UTF-8') . '\'); background-size: cover; background-position: center;">
        <div class="article-header" id="articleHeader">
            <span class="badge-tag" style="display:inline-block; margin-bottom:12px; font-size:1rem; padding:4px 14px;">' . htmlspecialchars($category_en, ENT_QUOTES, 'UTF-8') . '</span>
            <h1 class="article-title" id="articleTitle" data-en="' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '</h1>
            <div class="article-meta">
                <span id="articleDate" data-en="' . htmlspecialchars($date_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($date_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($date_en, ENT_QUOTES, 'UTF-8') . '</span>
                ' . (!empty($author_en) ? '<span id="articleAuthor" data-en="' . htmlspecialchars($author_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($author_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($author_en, ENT_QUOTES, 'UTF-8') . '</span>' : '') . '
                ' . (!empty($scope_en) ? '<span class="article-scope">' . htmlspecialchars($scope_en, ENT_QUOTES, 'UTF-8') . '</span>' : '') . '
            </div>
        </div>
    </div>

    <!-- ============ ARTICLE CONTENT ============ -->
    <div class="article-container">
        <div class="article-body" id="articleBody">
            <div class="article-content-wrapper">
' . $en_paragraphs_html . '
            </div>
        </div>
        <div class="article-back">
            <a href="' . htmlspecialchars($back_url, ENT_QUOTES, 'UTF-8') . '" class="svc-cta__btn" data-en="' . htmlspecialchars($back_text_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($back_text_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($back_text_en, ENT_QUOTES, 'UTF-8') . '</a>
        </div>
    </div>

    <!-- ============ FOOTER ============ -->
    <footer class="footer">
        <div class="footer__container">
            <div class="footer__grid">
                <div class="footer__brand">
                    <span class="logo-text logo-text--en">AL HUMAM<span class="logo-accent"> ADVANCED</span></span>
                    <span class="logo-text logo-text--ar">الهمام المتقدمة<span class="logo-accent"> للمقاولات</span></span>
                    <p class="footer__desc" data-en="Leading Saudi general contracting company delivering excellence in government, commercial, and infrastructure projects across the Kingdom." data-ar="شركة مقاولات عامة سعودية رائدة تقدم التميز في المشاريع الحكومية والتجارية ومشاريع البنية التحتية في جميع أنحاء المملكة.">
                        Leading Saudi general contracting company delivering excellence in government, commercial, and infrastructure projects across the Kingdom.
                    </p>
                </div>
                <div class="footer__nav">
                    <h4 class="footer__heading" data-en="NAVIGATION" data-ar="التنقل">NAVIGATION</h4>
                    <ul class="footer__links">
                        <li><a href="about.html" data-en="About Us" data-ar="من نحن">About Us</a></li>
                        <li><a href="services.html" data-en="Services" data-ar="خدماتنا">Services</a></li>
                        <li><a href="projects.html" data-en="Projects" data-ar="مشاريعنا">Projects</a></li>
                        <li><a href="sustainability.html" data-en="Sustainability" data-ar="الاستدامة">Sustainability</a></li>
                        <li><a href="innovation.html" data-en="Innovation" data-ar="الابتكار">Innovation</a></li>
                        <li><a href="media.html" data-en="Media Center" data-ar="المركز الإعلامي">Media Center</a></li>
                        <li><a href="careers.html" data-en="Careers" data-ar="التوظيف">Careers</a></li>
                        <li><a href="contact.html" data-en="Contact" data-ar="اتصل بنا">Contact</a></li>
                    </ul>
                </div>
                <div class="footer__contact">
                    <h4 class="footer__heading" data-en="CONTACT" data-ar="معلومات الاتصال">CONTACT</h4>
                    <p class="footer__info" data-en="Riyadh, Kingdom of Saudi Arabia" data-ar="الرياض، المملكة العربية السعودية">Riyadh, Kingdom of Saudi Arabia</p>
                    <p class="footer__info"><a href="tel:+966555021200" dir="ltr">+966 55 502 1200</a></p>
                    <p class="footer__info"><a href="mailto:info@alhumam.sa">info@alhumam.sa</a></p>
                </div>
            </div>
            <div class="footer__bottom">
                <p class="footer__copy" data-en="© 2026 Al Humam Advanced Contracting Co. All rights reserved." data-ar="© 2026 شركة الهمام المتقدمة للمقاولات. جميع الحقوق محفوظة.">
                    © 2026 Al Humam Advanced Contracting Co. All rights reserved.
                </p>
            </div>
        </div>
    </footer>

    <script src="../script.js?v=13.9"></script>
    <script src="../article.js?v=14.0"></script>
</body>
</html>';

    // Apply Site Template (Header Clock/Language toggle + Full Footer)
    $ar_template_source = PAGES_DIR . '/article-news-gov.html';
    $en_template_source = EN_DIR . '/article-news-gov.html';
    $ar_final_html = applySiteTemplate($ar_page_html, $ar_template_source, 'en', $file_name, $type);
    $en_final_html = applySiteTemplate($en_page_html, $en_template_source, 'pages', $file_name, $type);

    // Write HTML files atomically
    @file_put_contents($ar_file_path, $ar_final_html, LOCK_EX);
    @file_put_contents($en_file_path, $en_final_html, LOCK_EX);

    // 6. Multi-Page Card Management
    $subpageAr = $type === 'project' ? PAGES_DIR . '/projects.html' : PAGES_DIR . '/media.html';
    $subpageEn = $type === 'project' ? EN_DIR . '/projects.html' : EN_DIR . '/media.html';
    $homeAr = ROOT_DIR . '/index.html';
    $homeEn = EN_DIR . '/index.html';

    // If EDITING: remove old card from subpage listings first so it doesn't duplicate
    if ($is_edit) {
        removeCardFromListing($subpageAr, $file_name, $type);
        removeCardFromListing($subpageEn, $file_name, $type);
    }

    if ($type === 'article') {
        // 6.1 Arabic Media Card (Subpage: pages/media.html)
        $card_ar_sub = '
                <article class="media-card" data-aos="fade-up">
                    <div class="media-card__img" style="background-image: url(\'' . htmlspecialchars($image_path_relative, ENT_QUOTES, 'UTF-8') . '\');"></div>
                    <div class="media-card__body">
                        <h3 class="media-card__title" data-en="' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '</h3>
                        <div class="media-card__footer">
                            <span class="media-card__date" data-en="' . htmlspecialchars($date_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($date_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($date_ar, ENT_QUOTES, 'UTF-8') . '</span>
                            <a href="' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">اقرأ المزيد ←</a>
                        </div>
                    </div>
                </article>';

        // 6.2 English Media Card (Subpage: en/media.html)
        $card_en_sub = '
                <article class="media-card" data-aos="fade-up">
                    <div class="media-card__img" style="background-image: url(\'' . htmlspecialchars($image_path_relative, ENT_QUOTES, 'UTF-8') . '\');"></div>
                    <div class="media-card__body">
                        <h3 class="media-card__title" data-en="' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '</h3>
                        <div class="media-card__footer">
                            <span class="media-card__date" data-en="' . htmlspecialchars($date_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($date_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($date_ar, ENT_QUOTES, 'UTF-8') . '</span>
                            <a href="' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">Read More →</a>
                        </div>
                    </div>
                </article>';

        // 6.3 Arabic Card for Homepage (index.html) - only used if updating an existing homepage card
        $card_ar_home = '
                <article class="media-card" data-aos="fade-up">
                    <div class="media-card__img" style="background-image: url(\'' . htmlspecialchars($image_path_home, ENT_QUOTES, 'UTF-8') . '\');"></div>
                    <div class="media-card__body">
                        <h3 class="media-card__title" data-en="' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '</h3>
                        <div class="media-card__footer">
                            <span class="media-card__date" data-en="' . htmlspecialchars($date_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($date_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($date_ar, ENT_QUOTES, 'UTF-8') . '</span>
                            <a href="pages/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">اقرأ المزيد ←</a>
                        </div>
                    </div>
                </article>';

        // 6.4 English Card for Homepage (en/index.html) - only used if updating an existing homepage card
        $card_en_home = '
                <article class="media-card" data-aos="fade-up">
                    <div class="media-card__img" style="background-image: url(\'' . htmlspecialchars($image_path_relative, ENT_QUOTES, 'UTF-8') . '\');"></div>
                    <div class="media-card__body">
                        <h3 class="media-card__title" data-en="' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '</h3>
                        <div class="media-card__footer">
                            <span class="media-card__date" data-en="' . htmlspecialchars($date_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($date_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($date_ar, ENT_QUOTES, 'UTF-8') . '</span>
                            <a href="' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">Read More →</a>
                        </div>
                    </div>
                </article>';

        // Inject into Subpages ONLY
        injectCardIntoGrid($subpageAr, 'media__grid', $card_ar_sub, $file_name, $type);
        injectCardIntoGrid($subpageEn, 'media__grid', $card_en_sub, $file_name, $type);

        // HOMEPAGE ISOLATION:
        // Do NOT inject new cards into index.html / en/index.html!
        // Only if editing an item that already exists on the homepage, update its card in place.
        if ($is_edit) {
            $wasOnHomeAr = removeCardFromListing($homeAr, $file_name, $type);
            if ($wasOnHomeAr) {
                injectCardIntoGrid($homeAr, 'media__grid', $card_ar_home, $file_name, $type);
            }
            $wasOnHomeEn = removeCardFromListing($homeEn, $file_name, $type);
            if ($wasOnHomeEn) {
                injectCardIntoGrid($homeEn, 'media__grid', $card_en_home, $file_name, $type);
            }
        }
    } else {
        // 6.1 Arabic Project Card (Subpage: pages/projects.html)
        $card_ar_sub = '
                <div class="project-card" data-aos="fade-up">
                    <div class="project-card__img" style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url(\'' . htmlspecialchars($image_path_relative, ENT_QUOTES, 'UTF-8') . '\'); background-size: cover; background-position: center;">
                        <div class="project-card__content">
                            <span class="project-card__tag" data-en="' . htmlspecialchars($category_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($category_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($category_ar, ENT_QUOTES, 'UTF-8') . '</span>
                            <h3 data-en="' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '</h3>
                            <p data-en="' . htmlspecialchars($scope_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($scope_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($scope_ar, ENT_QUOTES, 'UTF-8') . '</p>
                        </div>
                        <a href="' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '" class="project-card__link" data-en="Read More" data-ar="اقرأ المزيد">اقرأ المزيد</a>
                    </div>
                </div>';

        // 6.2 English Project Card (Subpage: en/projects.html)
        $card_en_sub = '
                <div class="project-card" data-aos="fade-up">
                    <div class="project-card__img" style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url(\'' . htmlspecialchars($image_path_relative, ENT_QUOTES, 'UTF-8') . '\'); background-size: cover; background-position: center;">
                        <div class="project-card__content">
                            <span class="project-card__tag" data-en="' . htmlspecialchars($category_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($category_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($category_en, ENT_QUOTES, 'UTF-8') . '</span>
                            <h3 data-en="' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '</h3>
                            <p data-en="' . htmlspecialchars($scope_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($scope_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($scope_ar, ENT_QUOTES, 'UTF-8') . '</p>
                        </div>
                        <a href="' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '" class="project-card__link" data-en="Read More" data-ar="اقرأ المزيد">Read More</a>
                    </div>
                </div>';

        // 6.3 Arabic Project Card for Homepage (index.html) - only if updating an existing homepage card
        $card_ar_home = '
                <div class="project-card" data-aos="fade-up">
                    <div class="project-card__img" style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url(\'' . htmlspecialchars($image_path_home, ENT_QUOTES, 'UTF-8') . '\'); background-size: cover; background-position: center;">
                        <div class="project-card__content">
                            <span class="project-card__tag" data-en="' . htmlspecialchars($category_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($category_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($category_ar, ENT_QUOTES, 'UTF-8') . '</span>
                            <h3 data-en="' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '</h3>
                            <p data-en="' . htmlspecialchars($scope_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($scope_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($scope_ar, ENT_QUOTES, 'UTF-8') . '</p>
                        </div>
                        <a href="pages/' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '" class="project-card__link" data-en="Read More" data-ar="اقرأ المزيد">اقرأ المزيد</a>
                    </div>
                </div>';

        // 6.4 English Project Card for Homepage (en/index.html) - only if updating an existing homepage card
        $card_en_home = '
                <div class="project-card" data-aos="fade-up">
                    <div class="project-card__img" style="background-image: linear-gradient(to bottom, rgba(0,0,0,0.15), rgba(0,0,0,0.85)), url(\'' . htmlspecialchars($image_path_relative, ENT_QUOTES, 'UTF-8') . '\'); background-size: cover; background-position: center;">
                        <div class="project-card__content">
                            <span class="project-card__tag" data-en="' . htmlspecialchars($category_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($category_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($category_en, ENT_QUOTES, 'UTF-8') . '</span>
                            <h3 data-en="' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($title_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($title_en, ENT_QUOTES, 'UTF-8') . '</h3>
                            <p data-en="' . htmlspecialchars($scope_en, ENT_QUOTES, 'UTF-8') . '" data-ar="' . htmlspecialchars($scope_ar, ENT_QUOTES, 'UTF-8') . '">' . htmlspecialchars($scope_ar, ENT_QUOTES, 'UTF-8') . '</p>
                        </div>
                        <a href="' . htmlspecialchars($file_name, ENT_QUOTES, 'UTF-8') . '" class="project-card__link" data-en="Read More" data-ar="اقرأ المزيد">Read More</a>
                    </div>
                </div>';

        // Inject into Subpages ONLY
        injectCardIntoGrid($subpageAr, 'projects__grid', $card_ar_sub, $file_name, $type);
        injectCardIntoGrid($subpageEn, 'projects__grid', $card_en_sub, $file_name, $type);

        // HOMEPAGE ISOLATION:
        // Do NOT inject new cards into index.html / en/index.html!
        if ($is_edit) {
            $wasOnHomeAr = removeCardFromListing($homeAr, $file_name, $type);
            if ($wasOnHomeAr) {
                injectCardIntoGrid($homeAr, 'projects__grid', $card_ar_home, $file_name, $type);
            }
            $wasOnHomeEn = removeCardFromListing($homeEn, $file_name, $type);
            if ($wasOnHomeEn) {
                injectCardIntoGrid($homeEn, 'projects__grid', $card_en_home, $file_name, $type);
            }
        }
    }

    cleanAllSiteListingPages();

    // 7. Update Sitemap.xml for Both Locs
    updateSitemap($file_name, $is_edit ? 'edit' : 'add');

    // 8. Update Content Data JSON (All Bilingual Fields)
    $entry = [
        'id' => $is_edit ? (!empty($edit_id) ? $edit_id : pathinfo($file_name, PATHINFO_FILENAME)) : pathinfo($file_name, PATHINFO_FILENAME),
        'type' => $type,
        'title_ar' => $title_ar,
        'title_en' => $title_en,
        'category_ar' => $category_ar,
        'category_en' => $category_en,
        'date_ar' => $date_ar,
        'date_en' => $date_en,
        'author_ar' => $author_ar,
        'author_en' => $author_en,
        'scope_ar' => $scope_ar,
        'scope_en' => $scope_en,
        'image' => $image_path_relative,
        'excerpt_ar' => $excerpt_ar,
        'excerpt_en' => $excerpt_en,
        'content_ar' => $content_ar,
        'content_en' => $content_en,
        'file' => $file_name
    ];

    if ($is_edit && $existingIndex !== -1) {
        $data[$targetCollection][$existingIndex] = $entry;
    } else {
        array_unshift($data[$targetCollection], $entry);
    }
    saveContentData($data);

    // 9. Redirect with success message
    $successAction = $is_edit ? 'updated' : 'published';
    ob_clean();
    header('Location: index.php?success=' . urlencode($successAction) . '&file=' . urlencode($file_name) . '&type=' . $type);
    exit;

} catch (Throwable $e) {
    @error_log('Publish fatal error: ' . $e->getMessage() . ' in ' . $e->getFile() . ':' . $e->getLine());
    if (ob_get_level()) { @ob_clean(); }
    $errMsg = 'حدث خطأ: ' . $e->getMessage();
    if (!headers_sent()) {
        header('Location: index.php?error=' . urlencode($errMsg));
    } else {
        echo '<script>window.location.href="index.php?error=' . urlencode($errMsg) . '";</script>';
    }
    exit;
}
