<?php
/**
 * Al Humam Advanced Contracting — Secure Configuration File
 *
 * This configuration file isolates sensitive credentials from execution logic.
 * For production deployment, set environment variables or update the values below.
 */

// Prevent direct web access to config file
if (basename($_SERVER['PHP_SELF']) === basename(__FILE__)) {
    header('HTTP/1.1 403 Forbidden');
    exit('Access denied.');
}

return [
    // Database Configuration (PDO)
    'db' => [
        'host'    => getenv('DB_HOST') ?: 'localhost',
        'name'    => getenv('DB_NAME') ?: 'alhumam_advanced',
        'user'    => getenv('DB_USER') ?: 'alhumam_db_user',
        'pass'    => getenv('DB_PASS') ?: '',
        'charset' => 'utf8mb4',
    ],

    // Email Notification Configuration
    'mail' => [
        'admin_email' => getenv('ADMIN_EMAIL') ?: 'info@alhumam.sa',
        'sender_name' => 'شركة الهمام المتقدمة للمقاولات | Al Humam Advanced',
        'sender_mail' => 'noreply@alhumam.sa',
    ],

    // Security & Anti-Spam Tuning
    'security' => [
        'min_submit_seconds' => 2.5,  // Submissions faster than this are blocked as bots
        'max_rate_per_hour'  => 5,    // Max submissions per IP within 1 hour window
        'enable_db_logging'  => true, // Safely record leads to MySQL if available
    ],
];
