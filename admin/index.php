<?php
ob_start();
ini_set('display_errors', '0');
error_reporting(E_ALL);

require_once __DIR__ . '/config.php';

// Handle Logout
if (isset($_GET['action']) && $_GET['action'] === 'logout') {
    $_SESSION['alhumam_admin_logged'] = false;
    session_destroy();
    header('Location: index.php');
    exit;
}

// Handle Login
$login_error = '';
if ($_SERVER['REQUEST_METHOD'] === 'POST' && isset($_POST['login_password'])) {
    if ($_POST['login_password'] === ADMIN_PASSWORD) {
        $_SESSION['alhumam_admin_logged'] = true;
        header('Location: index.php');
        exit;
    } else {
        $login_error = 'كلمة المرور غير صحيحة، يرجى المحاولة مرة أخرى.';
    }
}

$is_logged = isAuthenticated();
// Auto clean listing pages from stray \n and deduplicate cards
if ($is_logged) {
    if (function_exists('cleanAllSiteListingPages')) {
        cleanAllSiteListingPages();
    }
}

$data = $is_logged ? loadContentData() : ['articles' => [], 'projects' => []];

// Handle Edit Mode
$edit_id = trim($_GET['edit_id'] ?? '');
$edit_type = trim($_GET['type'] ?? 'article');
$edit_item = null;

if ($is_logged && !empty($edit_id)) {
    $targetCollection = $edit_type === 'project' ? 'projects' : 'articles';
    foreach (($data[$targetCollection] ?? []) as $item) {
        if ($item['id'] === $edit_id) {
            $edit_item = $item;
            break;
        }
    }
}
$is_editing = !empty($edit_item);
?>
<!DOCTYPE html>
<html lang="ar" dir="rtl">
<head>
    <meta charset="UTF-8">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>لوحة إدارة ونشر المحتوى ثنائي اللغة | شركة الهمام المتقدمة</title>
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link href="https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Tajawal:wght@400;500;700;800&display=swap" rel="stylesheet">
    <link rel="stylesheet" href="style.css">
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

<?php if (!$is_logged): ?>
    <!-- ================= LOGIN SCREEN ================= -->
    <div class="auth-wrapper">
        <div class="auth-card">
            <div style="margin-bottom: 20px;">
                <span class="brand-badge">AL HUMAM ADVANCED</span>
            </div>
            <h2>لوحة إدارة المحتوى ثنائي اللغة</h2>
            <p>سجّل الدخول لإضافة، تعديل، وحذف المقالات والمشاريع لكافة الصفحات</p>

            <?php if (!empty($login_error)): ?>
                <div class="alert alert-error"><?= htmlspecialchars($login_error) ?></div>
            <?php endif; ?>

            <form method="POST" action="index.php">
                <div class="form-group" style="text-align: right; margin-bottom: 20px;">
                    <label for="pwd">كلمة مرور الإدارة:</label>
                    <input type="password" id="pwd" name="login_password" placeholder="أدخل كلمة المرور" required autofocus>
                    <small style="color: #6c757d; font-size: 0.78rem; margin-top: 4px;">كلمة المرور الافتراضية: <code>alhumam2026</code></small>
                </div>
                <button type="submit" class="btn-primary" style="width: 100%; justify-content: center;">تسجيل الدخول</button>
            </form>
        </div>
    </div>
<?php else: ?>
    <!-- ================= DASHBOARD ================= -->
    <header class="admin-header">
        <div class="admin-brand">
            <span class="brand-badge">AL HUMAM</span>
            <span class="brand-title">لوحة نشر وإدارة المقالات والمشاريع (ثنائي اللغة العربي & الإنجليزي)</span>
        </div>
        <div class="admin-nav">
            <a href="../index.html" target="_blank" class="btn-view-site">زيارة الموقع ↗</a>
            <a href="index.php?action=logout" class="btn-logout">تسجيل الخروج</a>
        </div>
    </header>

    <div class="container">
        <!-- System Alerts -->
        <?php if (isset($_GET['success'])): ?>
            <?php $sc = $_GET['success']; ?>
            <div class="alert alert-success">
                <?php if ($sc === 'published'): ?>
                    ✅ <strong>تم بنجاح!</strong> تم نشر <?= ($_GET['type'] ?? '') === 'project' ? 'المشروع' : 'المقال' ?> وتوليد نسختي العربي والإنجليزية وتحديث كافة الصفحات (الرئيسية والفرعية) وتحديث خريطة الموقع sitemap.xml فورياً.
                    <?php if (!empty($_GET['file'])): ?>
                        <div style="margin-top: 8px;">
                            <a href="../pages/<?= htmlspecialchars($_GET['file']) ?>" target="_blank" style="color: #fff; text-decoration: underline; margin-left: 14px; font-weight: bold;">معاينة النسخة العربية 🇸🇦 ↗</a>
                            <a href="../en/<?= htmlspecialchars($_GET['file']) ?>" target="_blank" style="color: #2dd4bf; text-decoration: underline; font-weight: bold;">معاينة النسخة الإنجليزية 🇬🇧 ↗</a>
                        </div>
                    <?php endif; ?>
                <?php elseif ($sc === 'updated'): ?>
                    ✅ <strong>تم حفظ التعديلات!</strong> تم تحديث المحتوى باللغتين وتعديل البطاقات في كافة الصفحات وتحديث خريطة الموقع sitemap.xml.
                    <?php if (!empty($_GET['file'])): ?>
                        <div style="margin-top: 8px;">
                            <a href="../pages/<?= htmlspecialchars($_GET['file']) ?>" target="_blank" style="color: #fff; text-decoration: underline; margin-left: 14px; font-weight: bold;">معاينة النسخة العربية 🇸🇦 ↗</a>
                            <a href="../en/<?= htmlspecialchars($_GET['file']) ?>" target="_blank" style="color: #2dd4bf; text-decoration: underline; font-weight: bold;">معاينة النسخة الإنجليزية 🇬🇧 ↗</a>
                        </div>
                    <?php endif; ?>
                <?php elseif ($sc === 'deleted'): ?>
                    🗑️ <strong>تم الحذف بنجاح!</strong> تم حذف الملفات العربية والإنجليزية وإزالة البطاقات من كافة الصفحات (الرئيسية والفرعية) وتحديث خريطة الموقع.
                <?php endif; ?>
            </div>
        <?php endif; ?>

        <?php if (isset($_GET['error'])): ?>
            <div class="alert alert-error">
                ❌ خطأ: <?= htmlspecialchars($_GET['error']) ?>
            </div>
        <?php endif; ?>

        <!-- Tabs Navigation -->
        <div class="tabs">
            <button class="tab-btn <?= (!$is_editing || $edit_type === 'article') ? 'active' : '' ?>" onclick="switchTab('media', this)">📰 المركز الإعلامي (المقالات والأخبار)</button>
            <button class="tab-btn <?= ($is_editing && $edit_type === 'project') ? 'active' : '' ?>" onclick="switchTab('projects', this)">🏗️ مشاريعنا (سجل المشاريع المميزة)</button>
        </div>

        <!-- ================= TAB 1: MEDIA ARTICLES ================= -->
        <div id="tab-media" class="tab-content" style="<?= ($is_editing && $edit_type === 'project') ? 'display: none;' : '' ?>">
            <div class="admin-card">
                <?php if ($is_editing && $edit_type === 'article'): ?>
                    <div class="edit-banner">
                        <span>✏️ <strong>أنت الآن في وضع التعديل:</strong> جارٍ تعديل المقال "<?= htmlspecialchars($edit_item['title_ar'] ?? '') ?>"</span>
                        <a href="index.php" class="btn-cancel-edit" style="padding: 4px 12px; font-size: 0.85rem;">إلغاء التعديل ✕</a>
                    </div>
                <?php endif; ?>

                <h3 class="admin-card__title">
                    <?= ($is_editing && $edit_type === 'article') ? '✏️ تعديل المقال الإخباري (ثنائي اللغة)' : '✍️ إضافة مقال إخباري جديد (تحديث متزامن لكافة الصفحات)' ?>
                </h3>
                <form action="publish.php" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="type" value="article">
                    <?php if ($is_editing && $edit_type === 'article'): ?>
                        <input type="hidden" name="edit_id" value="<?= htmlspecialchars($edit_item['id']) ?>">
                    <input type="hidden" name="existing_file" value="<?= htmlspecialchars($edit_item['file'] ?? '') ?>">
                    <?php endif; ?>

                    <!-- Shared Featured Image -->
                    <div class="form-group full-width" style="margin-bottom: 20px;">
                        <label>الصورة البارزة للمقال (تظهر في البطاقات بكافة الصفحات ورأس المقال)</label>
                        <div class="file-upload-box" onclick="document.getElementById('articleImgInput').click()">
                            <span>📁 اضغط هنا لاختيار صورة من جهازك (JPG, PNG, WEBP, AVIF)</span>
                            <input type="file" id="articleImgInput" name="image" accept="image/*" style="display:none;" onchange="previewImage(this, 'articlePreview')">
                        </div>
                        <?php $artImg = $edit_item['image'] ?? ''; ?>
                        <img id="articlePreview" class="image-preview" src="<?= htmlspecialchars($artImg) ?>" style="<?= !empty($artImg) ? 'display:block;' : '' ?>" alt="معاينة الصورة">
                        <div style="margin-top: 8px;">
                            <input type="url" name="image_url" value="<?= (!empty($artImg) && strpos($artImg, 'http') === 0) ? htmlspecialchars($artImg) : '' ?>" placeholder="أو ضع رابط صورة مباشر من الإنترنت (اختياري)">
                        </div>
                    </div>

                    <!-- Panel 1: Arabic Content -->
                    <div class="lang-panel">
                        <div class="lang-panel__title">
                            <span>🇸🇦</span>
                            <strong>المحتوى باللغة العربية (يُعرض للمتصفح العربي وفي صفحة pages/ والرئيسية)</strong>
                        </div>
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label>عنوان المقال بالعربية *</label>
                                <input type="text" name="title_ar" value="<?= htmlspecialchars($edit_item['title_ar'] ?? '') ?>" placeholder="مثال: توقيع عقد تنفيذ مشروع المجمع الإداري الجديد" required>
                            </div>
                            <div class="form-group">
                                <label>تصنيف المقال بالعربية</label>
                                <?php $currCatAr = $edit_item['category_ar'] ?? ($edit_item['category'] ?? 'مشاريع حكومية'); ?>
                                <select name="category_ar">
                                    <option value="مشاريع حكومية" <?= $currCatAr === 'مشاريع حكومية' ? 'selected' : '' ?>>مشاريع حكومية</option>
                                    <option value="أخبار هندسية" <?= $currCatAr === 'أخبار هندسية' ? 'selected' : '' ?>>أخبار هندسية</option>
                                    <option value="استدامة وإنشاء أخضر" <?= $currCatAr === 'استدامة وإنشاء أخضر' ? 'selected' : '' ?>>استدامة وإنشاء أخضر</option>
                                    <option value="سلامة مهنية" <?= $currCatAr === 'سلامة مهنية' ? 'selected' : '' ?>>سلامة مهنية</option>
                                    <option value="بنية تحتية" <?= $currCatAr === 'بنية تحتية' ? 'selected' : '' ?>>بنية تحتية</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>تاريخ النشر بالعربية</label>
                                <input type="text" name="date_ar" value="<?= htmlspecialchars($edit_item['date_ar'] ?? 'أكتوبر 2026') ?>">
                            </div>
                            <div class="form-group full-width">
                                <label>المصدر / الكاتب بالعربية</label>
                                <input type="text" name="author_ar" value="<?= htmlspecialchars($edit_item['author_ar'] ?? 'المكتب الإعلامي لشركة الهمام المتقدمة') ?>">
                            </div>
                            <div class="form-group full-width">
                                <label>نبذة مختصرة بالعربية (تظهر في البطاقات ومحركات البحث) *</label>
                                <textarea name="excerpt_ar" placeholder="اكتب ملخصاً في سطرين عن موضوع المقال..." style="min-height: 80px;" required><?= htmlspecialchars($edit_item['excerpt_ar'] ?? ($edit_item['excerpt'] ?? '')) ?></textarea>
                            </div>
                            <div class="form-group full-width">
                                <label>نص وتفاصيل المقال الكاملة بالعربية (يدعم التنسيق والعناوين والألوان) *</label>
                                <div class="formatting-toolbar">
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_media', '<h2>', '</h2>', 'عنوان رئيسي كبير')" title="عنوان رئيسي (H2)">H2 رئيسي</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_media', '<h3>', '</h3>', 'عنوان فرعي بحد ذهبي')" title="عنوان فرعي بحد ذهبي (H3)">H3 فرعي</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_media', '<strong>', '</strong>', 'نص عريض')" title="تسميك الخط (Bold)"><strong>B عريض</strong></button>
                                        <button type="button" class="toolbar-btn toolbar-btn--gold" onclick="formatText('content_ar_media', '<span class="gold-text">', '</span>', 'نص باللون الذهبي')" title="تلوين النص باللون الذهبي">⭐ ذهبي</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_media', '<ul>\n  <li>', '</li>\n  <li>عنصر ثانٍ</li>\n</ul>', 'عنصر أول')" title="قائمة نقطية">📋 قائمة</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_media', '<blockquote>', '</blockquote>', 'اقتباس أو فقرة مميزة')" title="اقتباس أو تمييز فقرة">❝ اقتباس</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_media', '<p>', '</p>', 'فقرة جديدة')" title="فقرة جديدة">¶ فقرة</button>
                                    </div>
                                    <span class="toolbar-hint">💡 حدد النص ثم اضغط الزر لتنسيقه، أو اضغط لإدراج القالب</span>
                                </div>
                                <textarea id="content_ar_media" class="has-toolbar" name="content_ar" placeholder="اكتب محتوى المقال الكامل هنا. يمكنك استخدام أزرار التنسيق أعلاه لتسميك العناوين وتغيير لونها..." style="min-height: 180px;" required><?= htmlspecialchars($edit_item['content_ar'] ?? ($edit_item['content'] ?? '')) ?></textarea>
                            </div>
                        </div>
                    </div>

                    <!-- Panel 2: English Content -->
                    <div class="lang-panel">
                        <div class="lang-panel__title">
                            <span>🇬🇧</span>
                            <strong>المحتوى باللغة الإنجليزية (English Content for en/ Pages & English Homepage)</strong>
                        </div>
                        <div class="form-grid">
                            <div class="form-group full-width">
                                <label>العنوان بالإنجليزية (English Title) *</label>
                                <input type="text" name="title_en" value="<?= htmlspecialchars($edit_item['title_en'] ?? '') ?>" placeholder="e.g. New Government Administrative Complex Contract Signing" required>
                            </div>
                            <div class="form-group">
                                <label>التصنيف بالإنجليزية (English Category)</label>
                                <?php $currCatEn = $edit_item['category_en'] ?? 'Government Projects'; ?>
                                <select name="category_en">
                                    <option value="Government Projects" <?= $currCatEn === 'Government Projects' ? 'selected' : '' ?>>Government Projects</option>
                                    <option value="Engineering News" <?= $currCatEn === 'Engineering News' ? 'selected' : '' ?>>Engineering News</option>
                                    <option value="Sustainability & Green" <?= $currCatEn === 'Sustainability & Green' ? 'selected' : '' ?>>Sustainability & Green</option>
                                    <option value="Safety & HSE" <?= $currCatEn === 'Safety & HSE' ? 'selected' : '' ?>>Safety & HSE</option>
                                    <option value="Infrastructure" <?= $currCatEn === 'Infrastructure' ? 'selected' : '' ?>>Infrastructure</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>تاريخ النشر بالإنجليزية (English Date)</label>
                                <input type="text" name="date_en" value="<?= htmlspecialchars($edit_item['date_en'] ?? 'October 2026') ?>">
                            </div>
                            <div class="form-group full-width">
                                <label>المصدر / الكاتب بالإنجليزية (English Author)</label>
                                <input type="text" name="author_en" value="<?= htmlspecialchars($edit_item['author_en'] ?? 'Al Humam Press Office') ?>">
                            </div>
                            <div class="form-group full-width">
                                <label>نبذة مختصرة بالإنجليزية (English Short Excerpt)</label>
                                <textarea name="excerpt_en" placeholder="Short 2-line summary for cards and search engines..." style="min-height: 80px;"><?= htmlspecialchars($edit_item['excerpt_en'] ?? '') ?></textarea>
                            </div>
                            <div class="form-group full-width">
                                <label>نص وتفاصيل المقال الكاملة بالإنجليزية (Full English Article with formatting)</label>
                                <div class="formatting-toolbar">
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_media', '<h2>', '</h2>', 'Main Section Heading')" title="Main Heading (H2)">H2</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_media', '<h3>', '</h3>', 'Subheading with Gold Border')" title="Subheading (H3)">H3</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_media', '<strong>', '</strong>', 'Bold text')" title="Bold text"><strong>B Bold</strong></button>
                                        <button type="button" class="toolbar-btn toolbar-btn--gold" onclick="formatText('content_en_media', '<span class="gold-text">', '</span>', 'Golden accent text')" title="Highlight with gold color">⭐ Gold</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_media', '<ul>\n  <li>', '</li>\n  <li>Second item</li>\n</ul>', 'First item')" title="Bullet list">📋 List</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_media', '<blockquote>', '</blockquote>', 'Featured quote or note')" title="Blockquote">❝ Quote</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_media', '<p>', '</p>', 'Paragraph text')" title="Paragraph">¶ Paragraph</button>
                                    </div>
                                    <span class="toolbar-hint">💡 Select text then click to format, or click to insert template</span>
                                </div>
                                <textarea id="content_en_media" class="has-toolbar" name="content_en" placeholder="Full English article text. You can use the formatting toolbar above..." style="min-height: 180px;"><?= htmlspecialchars($edit_item['content_en'] ?? '') ?></textarea>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; margin-top: 15px;">
                        <button type="submit" class="btn-primary">
                            <?= ($is_editing && $edit_type === 'article') ? '💾 حفظ التعديلات وتحديث كافة الصفحات وSitemap' : '🚀 نشر المقال باللغتين وتحديث كافة الصفحات وSitemap' ?>
                        </button>
                        <?php if ($is_editing && $edit_type === 'article'): ?>
                            <a href="index.php" class="btn-cancel-edit">إلغاء التعديل</a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>

            <!-- Existing Articles -->
            <div class="admin-card">
                <h3 class="admin-card__title">📚 المقالات المنشورة حالياً (<?= count($data['articles'] ?? []) ?>)</h3>
                <div style="overflow-x: auto;">
                    <table class="content-table">
                        <thead>
                            <tr>
                                <th>الصورة</th>
                                <th>العنوان بالعربية</th>
                                <th>Title in English</th>
                                <th>التاريخ</th>
                                <th style="text-align: center;">الإجراءات المتاحة</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach (($data['articles'] ?? []) as $art): ?>
                            <tr>
                                <td>
                                    <?php if (!empty($art['image'])): ?>
                                        <img src="<?= htmlspecialchars($art['image']) ?>" class="table-thumb" alt="thumb">
                                    <?php endif; ?>
                                </td>
                                <td><strong><?= htmlspecialchars($art['title_ar'] ?? '') ?></strong></td>
                                <td><span style="color: #9e9ea7;"><?= htmlspecialchars($art['title_en'] ?? '') ?></span></td>
                                <td><?= htmlspecialchars($art['date_ar'] ?? '') ?></td>
                                <td>
                                    <div class="actions-cell">
                                        <a href="../pages/<?= htmlspecialchars($art['file'] ?? '') ?>" target="_blank" class="btn-action btn-view-ar" title="معاينة الصفحة العربية">عربي 🇸🇦</a>
                                        <a href="../en/<?= htmlspecialchars($art['file'] ?? '') ?>" target="_blank" class="btn-action btn-view-en" title="معاينة الصفحة الإنجليزية">EN 🇬🇧</a>
                                        <a href="index.php?edit_id=<?= urlencode($art['id']) ?>&type=article" class="btn-action btn-edit" title="تعديل المقال">تعديل ✏️</a>
                                        <a href="publish.php?action=delete&id=<?= urlencode($art['id']) ?>&file=<?= urlencode($art['file'] ?? '') ?>&type=article" class="btn-action btn-del" onclick="return confirm('هل أنت متأكد من حذف هذا المقال نهائياً من كافة الصفحات وخريطة الموقع؟')" title="حذف المقال">حذف 🗑️</a>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>

        <!-- ================= TAB 2: PROJECTS ================= -->
        <div id="tab-projects" class="tab-content" style="<?= (!$is_editing || $edit_type !== 'project') ? 'display: none;' : '' ?>">
            <div class="admin-card">
                <?php if ($is_editing && $edit_type === 'project'): ?>
                    <div class="edit-banner">
                        <span>✏️ <strong>أنت الآن في وضع التعديل:</strong> جارٍ تعديل المشروع "<?= htmlspecialchars($edit_item['title_ar'] ?? '') ?>"</span>
                        <a href="index.php" class="btn-cancel-edit" style="padding: 4px 12px; font-size: 0.85rem;">إلغاء التعديل ✕</a>
                    </div>
                <?php endif; ?>

                <h3 class="admin-card__title">
                    <?= ($is_editing && $edit_type === 'project') ? '✏️ تعديل المشروع الإنشائي (ثنائي اللغة)' : '🏗️ إضافة مشروع جديد (تحديث متزامن لكافة الصفحات)' ?>
                </h3>
                <form action="publish.php" method="POST" enctype="multipart/form-data">
                    <input type="hidden" name="type" value="project">
                    <?php if ($is_editing && $edit_type === 'project'): ?>
                        <input type="hidden" name="edit_id" value="<?= htmlspecialchars($edit_item['id']) ?>">
                        <input type="hidden" name="existing_file" value="<?= htmlspecialchars($edit_item['file'] ?? '') ?>">
                    <?php endif; ?>

                    <!-- Shared Featured Image -->
                    <div class="form-group full-width" style="margin-bottom: 20px;">
                        <label>صورة المشروع الرئيسية (تظهر في البطاقات بكافة الصفحات ورأس المشروع)</label>
                        <div class="file-upload-box" onclick="document.getElementById('projImgInput').click()">
                            <span>📁 اضغط هنا لاختيار صورة من جهازك (JPG, PNG, WEBP, AVIF)</span>
                            <input type="file" id="projImgInput" name="image" accept="image/*" style="display:none;" onchange="previewImage(this, 'projPreview')">
                        </div>
                        <?php $projImg = $edit_item['image'] ?? ''; ?>
                        <img id="projPreview" class="image-preview" src="<?= htmlspecialchars($projImg) ?>" style="<?= !empty($projImg) ? 'display:block;' : '' ?>" alt="معاينة الصورة">
                        <div style="margin-top: 8px;">
                            <input type="url" name="image_url" value="<?= (!empty($projImg) && strpos($projImg, 'http') === 0) ? htmlspecialchars($projImg) : '' ?>" placeholder="أو ضع رابط صورة مباشر من الإنترنت (اختياري)">
                        </div>
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
                                <input type="text" name="title_ar" value="<?= htmlspecialchars($edit_item['title_ar'] ?? '') ?>" placeholder="مثال: مجمع المستودعات اللوجستية الحديث" required>
                            </div>
                            <div class="form-group">
                                <label>تصنيف المشروع بالعربية</label>
                                <?php $currProjCatAr = $edit_item['category_ar'] ?? ($edit_item['category'] ?? 'حكومي'); ?>
                                <select name="category_ar">
                                    <option value="حكومي" <?= $currProjCatAr === 'حكومي' ? 'selected' : '' ?>>حكومي</option>
                                    <option value="سكني" <?= $currProjCatAr === 'سكني' ? 'selected' : '' ?>>سكني</option>
                                    <option value="تجاري" <?= $currProjCatAr === 'تجاري' ? 'selected' : '' ?>>تجاري</option>
                                    <option value="صناعي" <?= $currProjCatAr === 'صناعي' ? 'selected' : '' ?>>صناعي</option>
                                    <option value="بنية تحتية" <?= $currProjCatAr === 'بنية تحتية' ? 'selected' : '' ?>>بنية تحتية</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>المساحة أو نطاق العمل بالعربية</label>
                                <input type="text" name="scope_ar" value="<?= htmlspecialchars($edit_item['scope_ar'] ?? ($edit_item['scope'] ?? '')) ?>" placeholder="مثال: مساحة 30,000 متر مربع أو 500 وحدة">
                            </div>
                            <div class="form-group full-width">
                                <label>نبذة مختصرة بالعربية (تظهر في البطاقات ومحركات البحث) *</label>
                                <textarea name="excerpt_ar" placeholder="مجمع لوجستي بمواصفات تقنية متقدمة..." style="min-height: 80px;" required><?= htmlspecialchars($edit_item['excerpt_ar'] ?? ($edit_item['excerpt'] ?? '')) ?></textarea>
                            </div>
                            <div class="form-group full-width">
                                <label>تفاصيل المشروع الكاملة والمواصفات الفنية بالعربية (يدعم التنسيق والعناوين والألوان) *</label>
                                <div class="formatting-toolbar">
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_proj', '<h2>', '</h2>', 'عنوان رئيسي للمشروع')" title="عنوان رئيسي (H2)">H2 رئيسي</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_proj', '<h3>', '</h3>', 'مواصفة أو نطاق فرعي')" title="عنوان فرعي بحد ذهبي (H3)">H3 فرعي</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_proj', '<strong>', '</strong>', 'مواصفة تقنية بارزة')" title="تسميك الخط (Bold)"><strong>B عريض</strong></button>
                                        <button type="button" class="toolbar-btn toolbar-btn--gold" onclick="formatText('content_ar_proj', '<span class="gold-text">', '</span>', 'نص باللون الذهبي')" title="تلوين النص باللون الذهبي">⭐ ذهبي</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_proj', '<ul>\n  <li>', '</li>\n  <li>مواصفة ثانية</li>\n</ul>', 'مواصفة أولى')" title="قائمة نقطية">📋 قائمة</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_proj', '<blockquote>', '</blockquote>', 'نطاق الإنجاز المعتمد')" title="اقتباس أو تمييز">❝ اقتباس</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_ar_proj', '<p>', '</p>', 'فقرة وصفية')" title="فقرة جديدة">¶ فقرة</button>
                                    </div>
                                    <span class="toolbar-hint">💡 حدد النص ثم اضغط الزر لتنسيقه، أو اضغط لإدراج القالب</span>
                                </div>
                                <textarea id="content_ar_proj" class="has-toolbar" name="content_ar" placeholder="اكتب تفاصيل تنفيذ المشروع والمواصفات الهندسية مع التنسيق والعناوين..." style="min-height: 180px;" required><?= htmlspecialchars($edit_item['content_ar'] ?? ($edit_item['content'] ?? '')) ?></textarea>
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
                                <input type="text" name="title_en" value="<?= htmlspecialchars($edit_item['title_en'] ?? '') ?>" placeholder="e.g. Modern Logistics Warehouse Park" required>
                            </div>
                            <div class="form-group">
                                <label>تصنيف المشروع بالإنجليزية (English Category)</label>
                                <?php $currProjCatEn = $edit_item['category_en'] ?? 'Government'; ?>
                                <select name="category_en">
                                    <option value="Government" <?= $currProjCatEn === 'Government' ? 'selected' : '' ?>>Government</option>
                                    <option value="Residential" <?= $currProjCatEn === 'Residential' ? 'selected' : '' ?>>Residential</option>
                                    <option value="Commercial" <?= $currProjCatEn === 'Commercial' ? 'selected' : '' ?>>Commercial</option>
                                    <option value="Industrial" <?= $currProjCatEn === 'Industrial' ? 'selected' : '' ?>>Industrial</option>
                                    <option value="Infrastructure" <?= $currProjCatEn === 'Infrastructure' ? 'selected' : '' ?>>Infrastructure</option>
                                </select>
                            </div>
                            <div class="form-group">
                                <label>نطاق العمل بالإنجليزية (Scope in English)</label>
                                <input type="text" name="scope_en" value="<?= htmlspecialchars($edit_item['scope_en'] ?? '') ?>" placeholder="e.g. 30,000 sqm Built-Up Area or 500 Units">
                            </div>
                            <div class="form-group full-width">
                                <label>نبذة مختصرة بالإنجليزية (Short Excerpt)</label>
                                <textarea name="excerpt_en" placeholder="Advanced logistics complex built to world-class standards..." style="min-height: 80px;"><?= htmlspecialchars($edit_item['excerpt_en'] ?? '') ?></textarea>
                            </div>
                            <div class="form-group full-width">
                                <label>تفاصيل المشروع الكاملة بالإنجليزية (Full Technical Details with formatting)</label>
                                <div class="formatting-toolbar">
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_proj', '<h2>', '</h2>', 'Project Section Heading')" title="Main Heading (H2)">H2</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_proj', '<h3>', '</h3>', 'Technical Subheading')" title="Subheading (H3)">H3</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_proj', '<strong>', '</strong>', 'Key Spec')" title="Bold text"><strong>B Bold</strong></button>
                                        <button type="button" class="toolbar-btn toolbar-btn--gold" onclick="formatText('content_en_proj', '<span class="gold-text">', '</span>', 'Golden accent')" title="Highlight with gold color">⭐ Gold</button>
                                    </div>
                                    <div class="toolbar-divider"></div>
                                    <div class="toolbar-group">
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_proj', '<ul>\n  <li>', '</li>\n  <li>Second spec</li>\n</ul>', 'First spec')" title="Bullet list">📋 List</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_proj', '<blockquote>', '</blockquote>', 'Scope highlight or milestone')" title="Blockquote">❝ Quote</button>
                                        <button type="button" class="toolbar-btn" onclick="formatText('content_en_proj', '<p>', '</p>', 'Paragraph text')" title="Paragraph">¶ Paragraph</button>
                                    </div>
                                    <span class="toolbar-hint">💡 Select text then click to format, or click to insert template</span>
                                </div>
                                <textarea id="content_en_proj" class="has-toolbar" name="content_en" placeholder="Write full execution details, engineering specs, and client value with formatting..." style="min-height: 180px;"><?= htmlspecialchars($edit_item['content_en'] ?? '') ?></textarea>
                            </div>
                        </div>
                    </div>

                    <div style="display:flex; align-items:center; margin-top: 15px;">
                        <button type="submit" class="btn-primary">
                            <?= ($is_editing && $edit_type === 'project') ? '💾 حفظ التعديلات وتحديث كافة الصفحات وSitemap' : '🏗️ نشر المشروع باللغتين وتحديث كافة الصفحات وSitemap' ?>
                        </button>
                        <?php if ($is_editing && $edit_type === 'project'): ?>
                            <a href="index.php" class="btn-cancel-edit">إلغاء التعديل</a>
                        <?php endif; ?>
                    </div>
                </form>
            </div>

            <!-- Existing Projects -->
            <div class="admin-card">
                <h3 class="admin-card__title">📋 المشاريع المنشورة حالياً (<?= count($data['projects'] ?? []) ?>)</h3>
                <div style="overflow-x: auto;">
                    <table class="content-table">
                        <thead>
                            <tr>
                                <th>الصورة</th>
                                <th>اسم المشروع بالعربية</th>
                                <th>Project Name (EN)</th>
                                <th>النوع</th>
                                <th style="text-align: center;">الإجراءات المتاحة</th>
                            </tr>
                        </thead>
                        <tbody>
                            <?php foreach (($data['projects'] ?? []) as $proj): ?>
                            <tr>
                                <td>
                                    <?php if (!empty($proj['image'])): ?>
                                        <img src="<?= htmlspecialchars($proj['image']) ?>" class="table-thumb" alt="thumb">
                                    <?php endif; ?>
                                </td>
                                <td><strong><?= htmlspecialchars($proj['title_ar'] ?? '') ?></strong></td>
                                <td><span style="color: #9e9ea7;"><?= htmlspecialchars($proj['title_en'] ?? '') ?></span></td>
                                <td><span class="badge-tag"><?= htmlspecialchars($proj['category_ar'] ?? ($proj['category'] ?? '')) ?></span></td>
                                <td>
                                    <div class="actions-cell">
                                        <a href="../pages/<?= htmlspecialchars($proj['file'] ?? '') ?>" target="_blank" class="btn-action btn-view-ar" title="معاينة الصفحة العربية">عربي 🇸🇦</a>
                                        <a href="../en/<?= htmlspecialchars($proj['file'] ?? '') ?>" target="_blank" class="btn-action btn-view-en" title="معاينة الصفحة الإنجليزية">EN 🇬🇧</a>
                                        <a href="index.php?edit_id=<?= urlencode($proj['id']) ?>&type=project" class="btn-action btn-edit" title="تعديل المشروع">تعديل ✏️</a>
                                        <a href="publish.php?action=delete&id=<?= urlencode($proj['id']) ?>&file=<?= urlencode($proj['file'] ?? '') ?>&type=project" class="btn-action btn-del" onclick="return confirm('هل أنت متأكد من حذف هذا المشروع نهائياً من كافة الصفحات وخريطة الموقع؟')" title="حذف المشروع">حذف 🗑️</a>
                                    </div>
                                </td>
                            </tr>
                            <?php endforeach; ?>
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    </div>

    <!-- Tab, Formatting & Preview Script -->
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
        function switchTab(tabId, btn) {
            document.querySelectorAll('.tab-content').forEach(el => el.style.display = 'none');
            document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
            
            var targetTab = document.getElementById('tab-' + tabId);
            if (targetTab) targetTab.style.display = 'block';
            if (btn) {
                btn.classList.add('active');
            } else if (window.event && window.event.currentTarget) {
                window.event.currentTarget.classList.add('active');
            }
        }

        function previewImage(input, previewId) {
            if (input.files && input.files[0]) {
                const reader = new FileReader();
                reader.onload = function(e) {
                    const img = document.getElementById(previewId);
                    img.src = e.target.result;
                    img.style.display = 'block';
                };
                reader.readAsDataURL(input.files[0]);
            }
        }
    </script>
<?php endif; ?>

</body>
</html>
