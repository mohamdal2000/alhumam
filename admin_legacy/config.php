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
