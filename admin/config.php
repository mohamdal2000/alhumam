<?php
/**
 * Al Humam Advanced Contracting — Lightweight Admin Configuration
 * Compatible with ProFreeHost, Hostinger, cPanel, and any standard PHP hosting.
 */

if (!ob_get_level()) {
    ob_start();
}

if (session_status() === PHP_SESSION_NONE) {
    @session_start();
}

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

// Security: Change this password to whatever you like
define('ADMIN_PASSWORD', 'alhumam2026');

// Root paths relative to /admin/
define('ROOT_DIR', dirname(__DIR__));
define('PAGES_DIR', ROOT_DIR . '/pages');
define('EN_DIR', ROOT_DIR . '/en');
define('DATA_DIR', ROOT_DIR . '/data');
define('IMAGES_ARTICLES_DIR', ROOT_DIR . '/images/articles');

// Ensure data and images directories exist
if (!is_dir(DATA_DIR)) {
    @mkdir(DATA_DIR, 0755, true);
}
if (!is_dir(IMAGES_ARTICLES_DIR)) {
    @mkdir(IMAGES_ARTICLES_DIR, 0755, true);
}

function isAuthenticated() {
    return isset($_SESSION['alhumam_admin_logged']) && $_SESSION['alhumam_admin_logged'] === true;
}

function requireAuth() {
    if (!isAuthenticated()) {
        header('Location: index.php');
        exit;
    }
}

function loadContentData() {
    $file = DATA_DIR . '/content.json';
    if (file_exists($file)) {
        $json = @file_get_contents($file);
        if ($json !== false && !empty($json)) {
            $data = json_decode($json, true);
            if (is_array($data)) {
                if (!isset($data['articles']) || !is_array($data['articles'])) $data['articles'] = [];
                if (!isset($data['projects']) || !is_array($data['projects'])) $data['projects'] = [];
                return $data;
            }
        }
    }
    return ['articles' => [], 'projects' => []];
}

function saveContentData($data) {
    $file = DATA_DIR . '/content.json';
    $json = json_encode($data, JSON_PRETTY_PRINT | JSON_UNESCAPED_UNICODE);
    if (!empty($json)) {
        @file_put_contents($file, $json, LOCK_EX);
    }
}

/**
 * Deduplicates cards and removes any stray literal '\n' characters inside HTML grids.
 */
/**
 * Deduplicates cards by UNIQUE HREF ONLY (never by title to prevent accidental collisions).
 * Automatically restores baseline articles if accidentally removed.
 */
function cleanListingPage($pagePath, $gridClass, $type = 'article') {
    if (!file_exists($pagePath)) return false;
    $html = @file_get_contents($pagePath);
    if ($html === false || strlen($html) < 500) return false;

    $original = $html;

    // 1. Remove literal slash-n strings that break CSS grid
    $html = str_replace(array('\\n', '\n'), '', $html);

    // 2. Find grid start
    $gridPattern = '/(<div\b[^>]*class=["\x27][^"\x27]*\b' . preg_quote($gridClass, '/') . '\b[^"\x27]*["\x27][^>]*>)/iu';
    if (!preg_match($gridPattern, $html, $gm, PREG_OFFSET_CAPTURE)) {
        if ($html !== $original) {
            @file_put_contents($pagePath, $html);
            return true;
        }
        return false;
    }

    $gridTag = $gm[0][0];
    $gridOffset = $gm[0][1];
    $contentStart = $gridOffset + strlen($gridTag);

    // 3. Find end of grid by searching for next section or docs container
    $nextSection = strpos($html, '</section>', $contentStart);
    if ($nextSection === false) {
        $nextSection = strpos($html, '<!-- ============', $contentStart);
    }
    if ($nextSection === false) {
        if ($html !== $original) {
            @file_put_contents($pagePath, $html);
            return true;
        }
        return false;
    }

    $gridContent = substr($html, $contentStart, $nextSection - $contentStart);
    $isEnglish = (strpos($pagePath, '/en/') !== false || strpos($pagePath, '\\en\\') !== false);

    $cards = array();
    $seenSlugs = array();

    if ($type === 'article') {
        preg_match_all('/<article\b[^>]*class=["\x27][^"\x27]*\bmedia-card\b[^"\x27]*["\x27][^>]*>[\s\S]*?<\/article>/iu', $gridContent, $matches);
        $rawCards = isset($matches[0]) ? $matches[0] : array();
        foreach ($rawCards as $card) {
            preg_match('/href=["\x27]([^"\x27]+)/i', $card, $hm);
            $href = isset($hm[1]) ? $hm[1] : '';
            $slugBase = preg_replace('/\.html$/i', '', basename($href));
            $slugKey = strtolower(trim((string)$slugBase));

            // Deduplicate ONLY by href/slugBase! NEVER by title!
            if (!empty($slugKey) && isset($seenSlugs[$slugKey])) {
                continue; // Skip duplicate card
            }

            if (!empty($slugKey)) $seenSlugs[$slugKey] = true;
            $cards[] = trim((string)$card);
        }

        // Ensure baseline article-news-gov is restored if missing
        if (!isset($seenSlugs['article-news-gov'])) {
            if ($isEnglish) {
                $govCard = '<article class="media-card" data-aos="fade-up">' . "\n"
                    . '                    <div class="media-card__img" style="background-image: url(\'../images/articles/news-gov.jpg\');"></div>' . "\n"
                    . '                    <div class="media-card__body">' . "\n"
                    . '                        <h3 class="media-card__title" data-en="New Government Administrative Complex" data-ar="مشروع المجمع الإداري الحكومي الجديد">New Government Administrative Complex</h3>' . "\n"
                    . '                        <div class="media-card__footer">' . "\n"
                    . '                            <span class="media-card__date" data-en="February 2026" data-ar="فبراير 2026">February 2026</span>' . "\n"
                    . '                            <a href="article-news-gov.html" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">Read More →</a>' . "\n"
                    . '                        </div>' . "\n"
                    . '                    </div>' . "\n"
                    . '                </article>';
            } else {
                $govCard = '<article class="media-card" data-aos="fade-up">' . "\n"
                    . '                    <div class="media-card__img" style="background-image: url(\'../images/articles/news-gov.jpg\');"></div>' . "\n"
                    . '                    <div class="media-card__body">' . "\n"
                    . '                        <h3 class="media-card__title" data-en="New Government Administrative Complex" data-ar="مشروع المجمع الإداري الحكومي الجديد">مشروع المجمع الإداري الحكومي الجديد</h3>' . "\n"
                    . '                        <div class="media-card__footer">' . "\n"
                    . '                            <span class="media-card__date" data-en="February 2026" data-ar="فبراير 2026">فبراير 2026</span>' . "\n"
                    . '                            <a href="article-news-gov.html" class="media-card__link" data-en="Read More →" data-ar="اقرأ المزيد ←">اقرأ المزيد ←</a>' . "\n"
                    . '                        </div>' . "\n"
                    . '                    </div>' . "\n"
                    . '                </article>';
            }
            if (count($cards) > 0) {
                array_splice($cards, 1, 0, array($govCard));
            } else {
                $cards[] = $govCard;
            }
            $seenSlugs['article-news-gov'] = true;
        }

    } else {
        preg_match_all('/<div\b[^>]*class=["\x27][^"\x27]*\bproject-card\b(?!__)[^"\x27]*["\x27][^>]*>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>/iu', $gridContent, $matches);
        $rawCards = isset($matches[0]) ? $matches[0] : array();
        foreach ($rawCards as $card) {
            preg_match('/href=["\x27]([^"\x27]+)/i', $card, $hm);
            $href = isset($hm[1]) ? $hm[1] : '';
            $slugBase = preg_replace('/\.html$/i', '', basename($href));
            $slugKey = strtolower(trim((string)$slugBase));

            if (!empty($slugKey) && isset($seenSlugs[$slugKey])) {
                continue;
            }

            if (!empty($slugKey)) $seenSlugs[$slugKey] = true;
            $cards[] = trim((string)$card);
        }
    }

    if (!empty($cards)) {
        $formattedGrid = "\n                " . implode("\n\n                ", $cards) . "\n            </div>\n        </div>\n\n    ";
        $newHtml = substr($html, 0, $contentStart) . $formattedGrid . substr($html, $nextSection);
        if ($newHtml !== $original && strlen($newHtml) >= (strlen($original) - 30000)) {
            @file_put_contents($pagePath, $newHtml);
            return true;
        }
    }
    return false;
}

function cleanAllSiteListingPages() {
    $rootDir = dirname(__DIR__);
    cleanListingPage($rootDir . '/pages/media.html', 'media__grid', 'article');
    cleanListingPage($rootDir . '/en/media.html', 'media__grid', 'article');
    cleanListingPage($rootDir . '/pages/projects.html', 'projects__grid', 'project');
    cleanListingPage($rootDir . '/en/projects.html', 'projects__grid', 'project');
    cleanListingPage($rootDir . '/index.html', 'media__grid', 'article');
    cleanListingPage($rootDir . '/en/index.html', 'media__grid', 'article');
    cleanListingPage($rootDir . '/index.html', 'projects__grid', 'project');
    cleanListingPage($rootDir . '/en/index.html', 'projects__grid', 'project');
}