/* ==========================================
   Al Humam Advanced — Main JavaScript
   Shared across all pages (index, article, service)
   ========================================== */

document.addEventListener('DOMContentLoaded', () => {

    // ========== GTM & ANALYTICS UNIVERSAL TRACKING DISPATCHER ==========
    (function initGTMTracking() {
        window.dataLayer = window.dataLayer || [];

        // 1. Detect current page context
        const currentPath = window.location.pathname.toLowerCase();
        const isEn = currentPath.includes("/en/") || currentPath.includes("\\en\\");
        const pageLang = isEn ? "en" : "ar";
        const pageTitle = document.title || "";
        const pageUrl = window.location.href;

        // 2. Dispatch standardized page_view event for GTM Triggers on all subpages
        window.dataLayer.push({
            event: "page_view",
            page_title: pageTitle,
            page_location: pageUrl,
            page_path: window.location.pathname,
            page_language: pageLang,
            page_type: currentPath.includes("service") ? "service" :
                       currentPath.includes("article") ? "article" :
                       currentPath.includes("about") ? "about" :
                       currentPath.includes("contact") ? "contact" :
                       currentPath.includes("projects") ? "projects" :
                       currentPath.includes("careers") ? "careers" :
                       currentPath.includes("media") ? "media" :
                       currentPath.includes("sustainability") ? "sustainability" :
                       currentPath.includes("innovation") ? "innovation" : "home",
            timestamp: new Date().toISOString()
        });

        // 3. Robust Click Delegation in Capture Phase (guarantees push before navigation)
        document.addEventListener("click", (e) => {
            const trackedEl = e.target.closest("[data-tracking]");
            if (!trackedEl) return;

            const trackingEvent = trackedEl.getAttribute("data-tracking");
            const href = trackedEl.getAttribute("href") || "";
            const text = trackedEl.innerText ? trackedEl.innerText.trim().substring(0, 80) : "";

            const payload = {
                event: trackingEvent,
                interaction_type: "click",
                element_text: text,
                element_href: href,
                page_language: pageLang,
                page_location: pageUrl,
                timestamp: new Date().toISOString()
            };

            window.dataLayer.push(payload);
        }, true);

        // 4. Form Submit Delegation
        document.addEventListener("submit", (e) => {
            const form = e.target.closest("form[data-tracking]");
            if (!form) return;

            const trackingEvent = form.getAttribute("data-tracking");
            window.dataLayer.push({
                event: trackingEvent,
                interaction_type: "form_submit",
                form_id: form.id || "contact_form",
                page_language: pageLang,
                page_location: pageUrl,
                timestamp: new Date().toISOString()
            });
        }, true);
    })();

    // ========== LANGUAGE SWITCHER (Physical Directory + Safe Fallback) ==========
    const langToggle = document.getElementById("langToggle");
    const currentPath = window.location.pathname.toLowerCase();
    const isEnDirectory = currentPath.includes("/en/") || currentPath.includes("\\en\\");
    
    // Determine language based on actual page directory
    let currentLang = isEnDirectory ? "en" : "ar";
    localStorage.setItem("alhumam-lang", currentLang);

    // Ensure document attributes match directory language
    const htmlEl = document.documentElement;
    if (currentLang === "en") {
        htmlEl.setAttribute("lang", "en");
        htmlEl.setAttribute("dir", "ltr");
        document.body.style.fontFamily = "'Inter', sans-serif";
    } else {
        htmlEl.setAttribute("lang", "ar");
        htmlEl.setAttribute("dir", "rtl");
        document.body.style.fontFamily = "'Tajawal', sans-serif";
    }

    // Toggle button click: update preference before navigating
    if (langToggle) {
        langToggle.addEventListener("click", () => {
            const nextLang = isEnDirectory ? "ar" : "en";
            localStorage.setItem("alhumam-lang", nextLang);
        });
    }

    // Ensure all leaf elements match current active language
    function syncPageLanguageText() {
        if (currentLang === "en") {
            document.querySelectorAll("[data-en]").forEach(el => {
                if (el.children.length === 0) {
                    const enText = el.getAttribute("data-en");
                    if (enText && /[\u0600-\u06FF]/.test(el.textContent.trim())) {
                        el.textContent = enText;
                    }
                }
            });
        } else {
            document.querySelectorAll("[data-ar]").forEach(el => {
                if (el.children.length === 0) {
                    const arText = el.getAttribute("data-ar");
                    if (arText && !/[\u0600-\u06FF]/.test(el.textContent.trim()) && /[a-zA-Z]/.test(el.textContent.trim())) {
                        el.textContent = arText;
                    }
                }
            });
        }
    }
    syncPageLanguageText();

    highlightBrand();

    // ========== BRAND HIGHLIGHT ==========
    function highlightBrand() {
        document.querySelectorAll('[data-en]').forEach(el => {
            const text = el.textContent;
            if (/Al Humam Advanced|AL HUMAM ADVANCED|الهمام المتقدمة|PALMIRA-LTD/i.test(text)) {
                el.innerHTML = text.replace(
                    /(Al Humam Advanced|AL HUMAM ADVANCED|الهمام المتقدمة للمقاولات|الهمام المتقدمة|PALMIRA-LTD)/gi,
                    '<span class="brand-highlight">$1</span>'
                );
            }
        });
    }

    // ========== SYNC ALL INTERNAL LINKS WITH CURRENT LANGUAGE ==========
    function updateAllInternalLinks(lang) {
        document.querySelectorAll('a[href]').forEach(a => {
            try {
                let href = a.getAttribute('href');
                if (!href) return;
                // Ignore external, bare anchors, protocols
                if (href.startsWith('http://') || href.startsWith('https://') || 
                    href.startsWith('#') || href.startsWith('mailto:') || 
                    href.startsWith('tel:') || href.startsWith('javascript:')) {
                    return;
                }
                // Append or replace ?lang= in internal links
                if (href.includes('lang=')) {
                    href = href.replace(/([?&])lang=[^&]*/, `$1lang=${lang}`);
                } else if (href.includes('?')) {
                    href = `${href}&lang=${lang}`;
                } else {
                    href = `${href}?lang=${lang}`;
                }
                a.setAttribute('href', href);
            } catch (e) {
                /* skip */
            }
        });
    }
    window.updateAllInternalLinks = updateAllInternalLinks;

    // Helper for accurate Riyadh (KSA) time
    function getRiyadhTime(withSeconds = true) {
        try {
            const parts = new Intl.DateTimeFormat('en-US', {
                timeZone: 'Asia/Riyadh',
                hour: '2-digit',
                minute: '2-digit',
                second: withSeconds ? '2-digit' : undefined,
                hour12: false
            }).formatToParts(new Date());
            const get = (type) => parts.find(p => p.type === type)?.value ?? '00';
            return withSeconds
                ? `${get('hour')}:${get('minute')}:${get('second')}`
                : `${get('hour')}:${get('minute')}`;
        } catch (e) {
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        }
    }

    // ========== LIVE DIGITAL CLOCK (HH:MM:SS) ==========
    function initLiveClock() {
        const clockEls = document.querySelectorAll('.header__clock-time, #clockTime');
        if (!clockEls.length) return;

        function updateClock() {
            const timeStr = getRiyadhTime(true);
            clockEls.forEach(el => {
                el.textContent = timeStr;
            });
        }

        updateClock();
        setInterval(updateClock, 1000);
    }
    initLiveClock();

    // ========== STICKY HEADER ==========
    const header = document.getElementById('header');
    if (header) {
        const syncHeaderState = () => {
            if (window.pageYOffset > 50) {
                header.classList.add('scrolled');
            } else {
                header.classList.remove('scrolled');
            }
        };
        syncHeaderState();
        window.addEventListener('scroll', syncHeaderState, { passive: true });
    }

    // ========== HAMBURGER MENU ==========
    const hamburger = document.getElementById('hamburger');
    const mainNav = document.getElementById('mainNav');

    if (hamburger && mainNav) {
        const toggleMenu = (e) => {
            if (e) {
                e.stopPropagation();
            }
            const isOpen = mainNav.classList.toggle('open');
            hamburger.classList.toggle('active', isOpen);
            hamburger.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
            document.body.style.overflow = isOpen ? 'hidden' : '';
        };

        hamburger.addEventListener('click', toggleMenu);

        // Close menu on link click
        document.querySelectorAll('.nav__link').forEach(link => {
            link.addEventListener('click', () => {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('open');
                document.body.style.overflow = '';
            });
        });

        // Close menu when clicking outside
        document.addEventListener('click', (e) => {
            if (mainNav.classList.contains('open') && !mainNav.contains(e.target) && !hamburger.contains(e.target)) {
                hamburger.classList.remove('active');
                hamburger.setAttribute('aria-expanded', 'false');
                mainNav.classList.remove('open');
                document.body.style.overflow = '';
            }
        });
    }

    // ========== SMOOTH SCROLL ==========
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            const targetId = this.getAttribute('href');
            if (targetId === '#') return; // Skip bare '#' links
            e.preventDefault();
            const target = document.querySelector(targetId);
            if (target) {
                const offset = 80;
                const top = target.getBoundingClientRect().top + window.pageYOffset - offset;
                window.scrollTo({ top, behavior: 'smooth' });
            }
        });
    });

    // ========== COUNTER ANIMATION ==========
    const counters = document.querySelectorAll('.stat-card__number');
    let countersAnimated = false;

    function animateCounters() {
        if (countersAnimated || counters.length === 0) return;

        counters.forEach(counter => {
            const target = parseInt(counter.getAttribute('data-target'));
            if (isNaN(target)) return;

            const duration = 2000;
            const steps = 60;
            const increment = target / steps;
            let current = 0;
            const stepTime = duration / steps;

            const timer = setInterval(() => {
                current += increment;
                if (current >= target) {
                    counter.textContent = target.toLocaleString();
                    clearInterval(timer);
                } else {
                    counter.textContent = Math.floor(current).toLocaleString();
                }
            }, stepTime);
        });

        countersAnimated = true;
    }

    // ========== INTERSECTION OBSERVER (Scroll Animations) ==========
    const observerOptions = {
        threshold: 0.02,
        rootMargin: '0px 0px -20px 0px'
    };

    const aosObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting || entry.intersectionRatio > 0) {
                const delay = entry.target.getAttribute('data-aos-delay') || 0;
                setTimeout(() => {
                    entry.target.classList.add('aos-animate');
                }, parseInt(delay));
                aosObserver.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Initial check: immediately reveal all elements already within or near the viewport on load
    document.querySelectorAll('[data-aos]').forEach(el => {
        const rect = el.getBoundingClientRect();
        if (rect.top < window.innerHeight + 80 && rect.bottom > -80) {
            el.classList.add('aos-animate');
        } else {
            aosObserver.observe(el);
        }
    });

    // Counter observer
    // Works on any page that contains the stats section (index, about, sustainability)
    const statsSection = document.getElementById('sustainability') || document.querySelector('.stats');
    if (statsSection) {
        const counterObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    animateCounters();
                }
            });
        }, { threshold: 0.3 });

        counterObserver.observe(statsSection);
    }

    // ========== 3D CUBE ANIMATION OBSERVER (Pause off-screen for 60FPS scroll) ==========
    const cubes = document.querySelectorAll('.cube');
    if (cubes.length > 0 && 'IntersectionObserver' in window) {
        const cubeObserver = new IntersectionObserver((entries) => {
            entries.forEach(entry => {
                if (entry.isIntersecting) {
                    entry.target.style.animationPlayState = 'running';
                } else {
                    entry.target.style.animationPlayState = 'paused';
                }
            });
        }, { threshold: 0.05 });

        cubes.forEach(cube => {
            cube.style.animationPlayState = 'paused';
            cubeObserver.observe(cube);
        });
    }

    // ========== CONTACT FORM ==========
    const contactForm = document.getElementById('contactForm');
    if (contactForm) {
        contactForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const btn = contactForm.querySelector('.form-submit');
            if (!btn) return;
            const originalText = btn.textContent;
            btn.textContent = currentLang === 'ar' ? 'تم الإرسال ✓' : 'SENT ✓';
            btn.style.background = '#2ecc71';
            btn.style.borderColor = '#2ecc71';
            setTimeout(() => {
                btn.textContent = originalText;
                btn.style.background = '';
                btn.style.borderColor = '';
                contactForm.reset();
            }, 2500);
        });
    }

    // ========== NEWSLETTER FORM ==========
    const newsletterForm = document.getElementById('newsletterForm');
    if (newsletterForm) {
        newsletterForm.addEventListener('submit', (e) => {
            e.preventDefault();
            const input = newsletterForm.querySelector('.newsletter-input');
            if (!input) return;
            const originalPlaceholder = input.placeholder;
            input.value = '';
            input.placeholder = currentLang === 'ar' ? 'تم الاشتراك ✓' : 'Subscribed ✓';
            setTimeout(() => {
                input.placeholder = originalPlaceholder;
            }, 2500);
        });
    }

    // ========== PARALLAX on Hero ==========
    const heroBg = document.querySelector('.hero__bg-img');
    if (heroBg) {
        let isHeroTicking = false;
        window.addEventListener('scroll', () => {
            if (!isHeroTicking) {
                window.requestAnimationFrame(() => {
                    const scrolled = window.pageYOffset;
                    if (scrolled < window.innerHeight) {
                        heroBg.style.transform = `scale(${1.05 + scrolled * 0.0003}) translateY(${scrolled * 0.3}px)`;
                    }
                    isHeroTicking = false;
                });
                isHeroTicking = true;
            }
        }, { passive: true });
    }

    // ========== PARTNER LOGO MARQUEE ==========
    // Partners section uses CSS animation marquee, no JS slider needed.
    // Kept for future manual slider if CSS marquee is removed.
    const partnersTrack = document.querySelector('.partners__track');
    const partnerPrev = document.getElementById('partnerPrev');
    const partnerNext = document.getElementById('partnerNext');

    if (partnersTrack && partnerPrev && partnerNext) {
        let partnerOffset = 0;
        const slideAmount = 190;

        partnerNext.addEventListener('click', () => {
            const maxScroll = partnersTrack.scrollWidth - partnersTrack.parentElement.offsetWidth;
            partnerOffset = Math.min(partnerOffset + slideAmount, maxScroll);
            partnersTrack.style.transform = `translateX(-${partnerOffset}px)`;
        });

        partnerPrev.addEventListener('click', () => {
            partnerOffset = Math.max(partnerOffset - slideAmount, 0);
            partnersTrack.style.transform = `translateX(-${partnerOffset}px)`;
        });
    }

    // ========== SERVICE CARD NAVIGATION ==========
    const serviceMap = {
        'Building & Construction': 'building',
        'البناء والتشييد': 'building',
        'Civil Engineering': 'civil',
        'الهندسة المدنية': 'civil',
        'Infrastructure': 'infrastructure',
        'البنية التحتية': 'infrastructure',
        'Design & Engineering': 'design',
        'التصميم والهندسة': 'design',
        'Energy & Utilities': 'energy',
        'الطاقة والمرافق': 'energy',
        'Finishing & Fit-Out Works': 'energy',
        'Finishing & Fitout Works': 'energy',
        'Finishing & Fitout': 'energy',
        'Finishing & Fit-Out': 'energy',
        'اعمال التشطيبات وال Fitout': 'energy',
        'أعمال التشطيبات وال Fitout': 'energy',
        'أعمال التشطيبات والـ Fit-Out': 'energy',
        'اعمال التشطيبات والـ Fit-Out': 'energy',
        'MEP': 'mep',
        'الكهروميكانيك': 'mep',
        'أعمال الكهروميكانيك': 'mep',
        'اعمال الكهروميكانيك': 'mep',
        'Excavation & Shoring': 'excavation',
        'أعمال الحفر وسند الجوانب': 'excavation',
        'اعمال الحفر وسند الجوانب': 'excavation',
        'Marine': 'excavation',
        'الأعمال البحرية': 'excavation',
        'Integrated Facilities Management': 'facilities',
        'إدارة المرافق المتكاملة': 'facilities',
        'ادارة المرافق المتكاملة': 'facilities',
        'Waterproofing & Epoxy Works': 'facilities',
        'Waterproofing & Epoxy Flooring': 'facilities',
        'Waterproofing & Epoxy Flooring Works': 'facilities',
        'Waterproofing, Insulation & Epoxy': 'facilities',
        'اعمال العزل والايبوكسي': 'facilities',
        'أعمال العزل والإيبوكسي': 'facilities',
        'أعمال العزل وأرضيات الإيبوكسي': 'facilities',
        'اعمال العزل وارضيات الايبوكسي': 'facilities'
    };

        // ========== DYNAMIC SERVICE ARTICLE EXPANSION (services.html) ==========
    window._activeDynServiceId = null;

    function syncUrlWithState(serviceTitle) {
        try {
            const pathLower = window.location.pathname.toLowerCase();
            const isDedicatedServicePage = /service-([a-z0-9_-]+)\.html/i.test(pathLower);

            if (!isDedicatedServicePage) {
                if (window.history && window.history.replaceState) {
                    const url = new URL(window.location.href);
                    if (window._activeDynServiceId) {
                        url.searchParams.set('id', window._activeDynServiceId);
                    }
                    window.history.replaceState(null, '', url.toString());
                }
                // Update document title dynamically for active service article
                if (serviceTitle) {
                    const brandSuffix = currentLang === 'ar' ? ' | شركة الهمام المتقدمة للمقاولات' : ' | Al Humam Advanced Contracting';
                    document.title = serviceTitle + brandSuffix;
                }
            }
            // Dispatch virtual_page_view to Google Tag Manager / GA4
            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                event: 'virtual_page_view',
                page_title: document.title,
                page_location: window.location.href,
                page_path: window.location.pathname + window.location.search,
                service_id: window._activeDynServiceId || '',
                timestamp: new Date().toISOString()
            });
        } catch (e) {}
    }

    const serviceOrder = ['excavation', 'building', 'civil', 'infrastructure', 'design', 'mep', 'energy', 'facilities'];

    function showDynamicServiceArticle(id, lang, shouldScroll = true) {
        const dynSection = document.getElementById('dynamic-service-article');
        if (!dynSection) return;

        const data = window.servicesData ? window.servicesData[id] : null;
        if (!data) return;

        window._activeDynServiceId = id;

        // Set active service attribute on wrapper for responsive layout
        const articleWrapper = dynSection.querySelector('.svc-article-wrapper');
        if (articleWrapper) {
            articleWrapper.setAttribute('data-active-service', id);
        }

        // Highlight active service card in the grid
        document.querySelectorAll('.service-card').forEach(c => {
            const svc = c.getAttribute('data-service');
            c.classList.toggle('service-card--active', svc === id);
        });

        // 1. Badge, Title, Lead
        const badgeEl = document.getElementById('dynSvcBadge');
        if (badgeEl) {
            badgeEl.textContent = (data.overviewTitle && data.overviewTitle[lang]) || data.overviewTitle || '';
        }

        const titleEl = document.getElementById('dynSvcTitle');
        if (titleEl) {
            titleEl.textContent = (data.title && data.title[lang]) || data.title || '';
        }

        const leadEl = document.getElementById('dynSvcLead');
        if (leadEl) {
            leadEl.textContent = (data.desc && data.desc[lang]) || data.desc || '';
        }



        // 3. Body Text (Split into paragraphs with brand highlight & extended body)
        const bodyEl = document.getElementById('dynSvcBody');
        const extBodyEl = document.getElementById('dynSvcExtendedBody');
        if (bodyEl) {
            const rawOverview = (data.overview && data.overview[lang]) || data.overview || '';
            let paras = rawOverview.split(/\r\n\s*\r\n|\r\n/).map(p => p.trim()).filter(Boolean);
            if (paras.length === 0) paras = [rawOverview];

            const formatP = (p) => {
                const highlighted = p.replace(
                    /(Al Humam Advanced|AL HUMAM ADVANCED|الهمام المتقدمة للمقاولات|الهمام المتقدمة|PALMIRA-LTD)/gi,
                    '<span class="brand-highlight">$1</span>'
                );
                return `<p>${highlighted}</p>`;
            };

            bodyEl.innerHTML = paras.map(formatP).join('');
            if (extBodyEl) {
                extBodyEl.innerHTML = '';
                extBodyEl.style.display = 'none';
            }
        }

        // 4. Visual Image & Overlay
        const imgEl = document.getElementById('dynSvcImage');
        if (imgEl) {
            let imgSrc = data.image || '';
            const pathLower = window.location.pathname.toLowerCase();
            const isSubDir = pathLower.includes('/pages/') || pathLower.includes('\\pages\\') ||
                             pathLower.includes('/en/') || pathLower.includes('\\en\\');
            if (imgSrc && !imgSrc.startsWith('http://') && !imgSrc.startsWith('https://') && !imgSrc.startsWith('data:')) {
                if (isSubDir && !imgSrc.startsWith('../')) {
                    imgSrc = '../' + imgSrc;
                } else if (!isSubDir && imgSrc.startsWith('../')) {
                    imgSrc = imgSrc.replace(/^\.\.\//, '');
                }
            }
            imgEl.src = imgSrc;
            imgEl.alt = (data.title && data.title[lang]) || '';
        }

        const imgBadgeEl = document.getElementById('dynSvcImageBadge');
        if (imgBadgeEl) {
            imgBadgeEl.textContent = lang === 'ar' ? 'كفاءة التنفيذ الميداني' : 'Execution Excellence';
            if (!imgBadgeEl.classList.contains('svc-article-badge--hollow')) {
                imgBadgeEl.classList.add('svc-article-badge--hollow');
            }
        }

        const imgTitleEl = document.getElementById('dynSvcImageTitle');
        if (imgTitleEl) {
            imgTitleEl.textContent = (data.title && data.title[lang]) || '';
            if (!imgTitleEl.classList.contains('svc-article-visual-single-line')) {
                imgTitleEl.classList.add('svc-article-visual-single-line');
            }
        }

        // 5. Key Metrics
        const metricsEl = document.getElementById('dynSvcMetrics');
        if (metricsEl) {
            if (data.stats && data.stats.length) {
                metricsEl.innerHTML = data.stats.map(st => {
                    const label = (st.label && st.label[lang]) || st.label || '';
                    return `
                        <div class="svc-metric-box">
                            <div class="svc-metric-number">${st.num || ''}</div>
                            <div class="svc-metric-label">${label}</div>
                        </div>
                    `;
                }).join('');
                metricsEl.style.display = 'grid';
            } else {
                metricsEl.style.display = 'none';
            }
        }

        // 6. Capabilities Grid
        const capTitleEl = document.getElementById('dynSvcCapTitle');
        if (capTitleEl) {
            capTitleEl.textContent = lang === 'ar' 
                ? (id === 'excavation' ? 'أبرز أنظمة وسيناريوهات سند جوانب الحفر' : 'الأنظمة والتقنيات التخصصية المنفذة')
                : (id === 'excavation' ? 'Advanced Shoring Systems & Technologies' : 'Core Capabilities & Specialized Systems');
        }

        const capsEl = document.getElementById('dynSvcCaps');
        if (capsEl) {
            if (data.capabilities && data.capabilities.length) {
                capsEl.innerHTML = data.capabilities.map((cap, idx) => {
                    const cTitle = (cap.title && cap.title[lang]) || cap.title || '';
                    const cDesc = (cap.desc && cap.desc[lang]) || cap.desc || '';
                    const numStr = String(idx + 1).padStart(2, '0');
                    return `
                        <div class="svc-method-card">
                            <div class="svc-method-num">${numStr}</div>
                            <h4>${cTitle}</h4>
                            <p>${cDesc}</p>
                        </div>
                    `;
                }).join('');
                capsEl.style.display = 'grid';
                if (capTitleEl) capTitleEl.style.display = 'block';
            } else {
                capsEl.style.display = 'none';
                if (capTitleEl) capTitleEl.style.display = 'none';
            }
        }

        // 7. Execution Stages & Methodology (Process Steps - Desktop Luminous Comet Stepper & Mobile Cards)
        const processSec = document.getElementById('dynSvcProcessSection');
        const processTitleEl = document.getElementById('dynSvcProcessTitle');
        const processEl = document.getElementById('dynSvcProcess');
        if (processEl) {
            if (data.process && data.process.length) {
                if (processTitleEl) {
                    processTitleEl.textContent = lang === 'ar' 
                        ? 'مراحل ومنهجية تنفيذ الأعمال بالمشروع'
                        : 'Project Execution Methodology & Work Stages';
                }
                const isRtl = lang === 'ar';

                // Desktop Circular Stepper with transparent circles and 2s-pause comet
                const nodesDesktopHtml = data.process.map((step, idx) => {
                    const sTitle = (step.title && step.title[lang]) || step.title || '';
                    const sDesc = (step.desc && step.desc[lang]) || step.desc || '';
                    const num = idx + 1;
                    const hasNext = idx < data.process.length - 1;
                    return `
                        <div class="svc-process-node">
                            <div class="svc-process-circle-wrap">
                                <div class="svc-process-circle">
                                    <span class="svc-process-circle-num">${num}</span>
                                </div>
                                ${hasNext ? '<div class="svc-process-track-line"></div>' : ''}
                            </div>
                            <div class="svc-process-text">
                                <h4 class="svc-process-title">${sTitle}</h4>
                                <p class="svc-process-desc">${sDesc}</p>
                            </div>
                        </div>
                    `;
                }).join('');

                const desktopHtml = `
                    <div class="svc-process-desktop">
                        <div class="svc-process-comet-rail">
                            <div class="svc-process-comet"></div>
                        </div>
                        ${nodesDesktopHtml}
                    </div>
                `;

                // Mobile View: Old Rectangular Cards Grid (< 992px)
                const cardsMobileHtml = data.process.map((step, idx) => {
                    const sTitle = (step.title && step.title[lang]) || step.title || '';
                    const sDesc = (step.desc && step.desc[lang]) || step.desc || '';
                    const numStr = String(idx + 1).padStart(2, '0');
                    return `
                        <div class="svc-process-card">
                            <div class="svc-process-header">
                                <span class="svc-process-num">${numStr}</span>
                                <h4>${sTitle}</h4>
                            </div>
                            <p>${sDesc}</p>
                        </div>
                    `;
                }).join('');

                const mobileHtml = `
                    <div class="svc-process-mobile">
                        ${cardsMobileHtml}
                    </div>
                `;

                processEl.className = `svc-process-timeline ${isRtl ? 'svc-process-timeline--rtl' : 'svc-process-timeline--ltr'}`;
                processEl.innerHTML = desktopHtml + mobileHtml;
                if (processSec) processSec.style.display = 'block';
            } else if (processSec) {
                processSec.style.display = 'none';
            }
        }

        // 8. Call to Action & Consultation Link
        const ctaTitleEl = document.getElementById('dynSvcCtaTitle');
        const ctaDescEl = document.getElementById('dynSvcCtaDesc');
        const ctaBtnTextEl = document.getElementById('dynSvcCtaBtnText');
        const ctaBtnEl = document.getElementById('dynSvcCtaBtn');

        if (data.cta) {
            if (ctaTitleEl) ctaTitleEl.textContent = (data.cta.title && data.cta.title[lang]) || '';
            if (ctaDescEl) ctaDescEl.textContent = (data.cta.desc && data.cta.desc[lang]) || '';
            if (ctaBtnTextEl) ctaBtnTextEl.textContent = (data.cta.btn && data.cta.btn[lang]) || (lang === 'ar' ? 'طلب استشارة هندسية' : 'Request Technical Consultation');
            if (ctaBtnEl) {
                ctaBtnEl.href = `contact.html?service=${id}`;
            }
        }



        // 10. Display and Scroll
        dynSection.style.display = 'block';
        const currentSvcTitle = (data.title && data.title[lang]) || data.title || '';
        syncUrlWithState(currentSvcTitle);

        if (shouldScroll) {
            setTimeout(() => {
                const headerOffset = window.innerWidth <= 768 ? 130 : 105;
                const rect = dynSection.getBoundingClientRect();
                const targetY = window.pageYOffset + rect.top - headerOffset;
                window.scrollTo({
                    top: Math.max(0, targetY),
                    behavior: 'smooth'
                });
            }, 100);
        }
    }
    window.showDynamicServiceArticle = showDynamicServiceArticle;

    // Service card click listener - Always navigate directly to dedicated service page (matching footer links exactly)
    document.querySelectorAll('.service-card').forEach(card => {
        card.style.cursor = 'pointer';
        card.addEventListener('click', (e) => {
            const anchor = e.target.closest('a');
            if (anchor && anchor.getAttribute('href')) return;

            let id = card.getAttribute('data-service');
            if (!id) {
                const titleEl = card.querySelector('.service-card__title');
                if (titleEl) {
                    const title = titleEl.textContent.trim();
                    id = serviceMap[title];
                }
            }

            if (!id) return;

            const pathLower = window.location.pathname.toLowerCase();
            const currentFileMatch = pathLower.match(/service-([a-z0-9_-]+)\.html/i);
            const currentFileId = currentFileMatch ? currentFileMatch[1] : null;

            // If already on this exact service page, scroll smoothly to its article section
            if (currentFileId === id) {
                const dynSection = document.getElementById('dynamic-service-article');
                if (dynSection) {
                    const headerOffset = window.innerWidth <= 768 ? 130 : 105;
                    const rect = dynSection.getBoundingClientRect();
                    const targetY = window.pageYOffset + rect.top - headerOffset;
                    window.scrollTo({
                        top: Math.max(0, targetY),
                        behavior: 'smooth'
                    });
                }
                return;
            }

            // Otherwise, navigate to the dedicated service page (matching footer links behavior)
            const isPagesDir = pathLower.includes('/pages/') || pathLower.includes('\\pages\\');
            const isEnDir = pathLower.includes('/en/') || pathLower.includes('\\en\\');

            let targetPage;
            if (isPagesDir || isEnDir) {
                targetPage = `service-${id}.html`;
            } else {
                targetPage = `pages/service-${id}.html`;
            }

            window.location.href = targetPage;
        });
    });

    // Back to Services buttons for dynamic service article (top and bottom below CTA)
    document.querySelectorAll('.dyn-article-close').forEach(btn => {
        btn.addEventListener('click', (e) => {
            e.preventDefault();
            const servicesGrid = document.getElementById('services');
            if (servicesGrid) {
                servicesGrid.scrollIntoView({ behavior: 'smooth' });
            }
        });
    });

    // Auto-fill contact form subject if service param is present
    const contactUrlParams = new URLSearchParams(window.location.search);
    const serviceParam = contactUrlParams.get('service');
    if (serviceParam) {
        const subjectInput = document.querySelector('input[name="subject"]');
        if (subjectInput && !subjectInput.value) {
            const svcData = window.servicesData ? window.servicesData[serviceParam] : null;
            const svcTitle = svcData ? ((svcData.title && svcData.title[currentLang]) || svcData.title) : serviceParam;
            subjectInput.value = currentLang === 'ar' ? `طلب استشارة ودراسة مشروع: ${svcTitle}` : `Consultation & Study Request: ${svcTitle}`;
        }
    }

    // Initialize Services page article (Excavation by default, or dedicated service from filename / URL parameter)
    const dynSection = document.getElementById('dynamic-service-article');
    if (dynSection && window.servicesData) {
        const pathLower = window.location.pathname.toLowerCase();
        const fileMatch = pathLower.match(/service-([a-z0-9_-]+)\.html/i);
        const fileServiceId = fileMatch ? fileMatch[1] : null;

        const pageUrlParams = new URLSearchParams(window.location.search);
        const requestedId = pageUrlParams.get('id');

        let initialServiceId = 'excavation';
        let shouldAutoScroll = false;

        if (fileServiceId && window.servicesData[fileServiceId]) {
            initialServiceId = fileServiceId;
            shouldAutoScroll = false;
        } else if (requestedId && window.servicesData[requestedId]) {
            initialServiceId = requestedId;
            shouldAutoScroll = true;
        }

        // Display active service article
        showDynamicServiceArticle(initialServiceId, currentLang, shouldAutoScroll);
        if (shouldAutoScroll) {
            setTimeout(() => {
                const headerOffset = window.innerWidth <= 768 ? 130 : 105;
                const rect = dynSection.getBoundingClientRect();
                const targetY = window.pageYOffset + rect.top - headerOffset;
                window.scrollTo({
                    top: Math.max(0, targetY),
                    behavior: 'smooth'
                });
            }, 250);
        }
    }

    // ========== INNOVATION FEATURE NAVIGATION ==========
    document.querySelectorAll('.innovation__feature').forEach(item => {
        item.style.cursor = 'pointer';
        item.addEventListener('click', (e) => {
            e.preventDefault();
            let articleId = item.getAttribute('data-article-id');
            const href = item.getAttribute('href');
            if (!articleId && href) {
                const match = href.match(/article-([a-z0-9_-]+)\.html/) || href.match(/id=([a-z0-9_-]+)/);
                if (match) articleId = match[1];
            }
            if (articleId) {
                const pathLower = window.location.pathname.toLowerCase();
                const isPagesDir = pathLower.includes('/pages/') || pathLower.includes('\\pages\\');
                const isEnDir = pathLower.includes('/en/') || pathLower.includes('\\en\\');
                
                let targetPage;
                if (isPagesDir || isEnDir) {
                    targetPage = `article-${articleId}.html`;
                } else {
                    targetPage = `pages/article-${articleId}.html`;
                }
                window.location.href = targetPage;
            }
        });
    });

    // ========== ACTIVE NAV ON SCROLL ==========
    const sections = document.querySelectorAll('section[id]');
    if (sections.length > 0) {
        let isNavTicking = false;
        window.addEventListener('scroll', () => {
            if (!isNavTicking) {
                window.requestAnimationFrame(() => {
                    const scrollPos = window.pageYOffset + 120;
                    sections.forEach(section => {
                        const top = section.offsetTop;
                        const height = section.offsetHeight;
                        const id = section.getAttribute('id');
                        const link = document.querySelector(`.nav__link[href="#${id}"]`);
                        if (link) {
                            if (scrollPos >= top && scrollPos < top + height) {
                                link.style.color = 'var(--accent)';
                            } else {
                                link.style.color = '';
                            }
                        }
                    });
                    isNavTicking = false;
                });
                isNavTicking = true;
            }
        }, { passive: true });
    }

    // ========== CORPORATE DOCUMENTS SLIDER (MEDIA CENTER) ==========
    const docsTrack = document.getElementById('docsSliderTrack');
    const docsPrev = document.getElementById('docsPrev');
    const docsNext = document.getElementById('docsNext');
    const docsDots = document.getElementById('docsDots');

    if (docsTrack && docsPrev && docsNext) {
        const docCards = docsTrack.querySelectorAll('.doc-card');
        const sliderContainer = document.getElementById('docsSliderContainer') || docsTrack.parentElement;
        let currentDocIndex = 0;

        function getVisibleDocsCount() {
            if (window.innerWidth <= 700) return 1;
            if (window.innerWidth <= 1100) return 2;
            return 3;
        }

        function getMaxDocIndex() {
            return Math.max(0, docCards.length - getVisibleDocsCount());
        }

        function getStep() {
            if (!docCards.length) return 300;
            const card = docCards[0];
            const gap = 24;
            return card.offsetWidth + gap;
        }

        function getBaseTranslate() {
            const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
            const step = getStep();
            const offset = currentDocIndex * step;
            const dirMultiplier = isRtl ? 1 : -1;
            return dirMultiplier * offset;
        }

        function renderDocDots() {
            if (!docsDots) return;
            docsDots.innerHTML = '';
            const max = getMaxDocIndex();
            for (let i = 0; i <= max; i++) {
                const dot = document.createElement('div');
                dot.className = `docs-slider-dot ${i === currentDocIndex ? 'active' : ''}`;
                dot.setAttribute('aria-label', `Slide ${i + 1}`);
                dot.addEventListener('click', () => {
                    currentDocIndex = i;
                    updateDocsSlider();
                });
                docsDots.appendChild(dot);
            }
        }

        function updateDocsSlider(customTransition = true) {
            if (!docCards.length) return;
            const baseTranslate = getBaseTranslate();
            if (customTransition === false) {
                docsTrack.style.transition = 'none';
            } else if (typeof customTransition === 'string') {
                docsTrack.style.transition = customTransition;
            } else {
                docsTrack.style.transition = 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';
            }
            docsTrack.style.transform = `translateX(${baseTranslate}px)`;

            if (docsDots) {
                const dots = docsDots.querySelectorAll('.docs-slider-dot');
                dots.forEach((dot, idx) => {
                    dot.classList.toggle('active', idx === currentDocIndex);
                });
            }
        }

        renderDocDots();

        docsNext.addEventListener('click', () => {
            const max = getMaxDocIndex();
            currentDocIndex = currentDocIndex >= max ? 0 : currentDocIndex + 1;
            updateDocsSlider();
        });

        docsPrev.addEventListener('click', () => {
            const max = getMaxDocIndex();
            currentDocIndex = currentDocIndex <= 0 ? max : currentDocIndex - 1;
            updateDocsSlider();
        });

        window.addEventListener('resize', () => {
            const max = getMaxDocIndex();
            if (currentDocIndex > max) currentDocIndex = max;
            renderDocDots();
            updateDocsSlider();
        });

        document.addEventListener('alhumam-lang-change', () => {
            setTimeout(updateDocsSlider, 50);
        });

        // ========== TOUCH & MOUSE DRAG/SWIPE SUPPORT WITH ORGANIC SPRING REBOUND ==========
        let startX = 0;
        let startY = 0;
        let currentX = 0;
        let isTouching = false;
        let isSwiping = false;
        let isScrolling = false;
        let hasMoved = false;
        let startTime = 0;

        // Helper: Calculate bounded drag translate with organic progressive spring tension (حركة النابض المرنة)
        function calculateDragTranslate(diffX) {
            const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
            const step = getStep();
            const max = getMaxDocIndex();
            
            // In RTL, dragging right (diffX > 0) advances toward the last card
            // In LTR, dragging left (diffX < 0) advances toward the last card
            const forwardDiff = isRtl ? diffX : -diffX;
            const currentOffset = currentDocIndex * step;
            const targetOffset = currentOffset + forwardDiff;
            const maxOffset = max * step;

            let boundedOffset;
            const maxStretch = 180; // Generous spring elastic range

            if (targetOffset < 0) {
                // Dragging backwards past Card 1 (progressive spring tension)
                const overshoot = -targetOffset;
                const stretch = Math.min(maxStretch, Math.pow(overshoot, 0.8) * 2.3);
                boundedOffset = -stretch;
            } else if (targetOffset > maxOffset) {
                // Dragging forward past the last card (progressive spring tension)
                const overshoot = targetOffset - maxOffset;
                const stretch = Math.min(maxStretch, Math.pow(overshoot, 0.8) * 2.3);
                boundedOffset = maxOffset + stretch;
            } else {
                boundedOffset = targetOffset;
            }

            const dirMultiplier = isRtl ? 1 : -1;
            return dirMultiplier * boundedOffset;
        }

        // Helper: Settle drag with authentic spring rebound (ردة فعل النابض), guaranteeing the last card is shown
        function settleDrag(diffX, elapsed) {
            const isRtl = document.documentElement.getAttribute('dir') === 'rtl';
            const step = getStep();
            const max = getMaxDocIndex();
            const forwardDiff = isRtl ? diffX : -diffX;
            const currentOffset = currentDocIndex * step;
            const targetOffset = currentOffset + forwardDiff;
            const maxOffset = max * step;
            const velocity = Math.abs(diffX) / (elapsed || 1);

            // Check if user was overshooting past boundaries (active spring rebound)
            const isOvershooting = targetOffset > maxOffset || targetOffset < 0;

            // 1. If dragged forward past or near the end (overscroll): ALWAYS settle on last card (Card 6)
            if (targetOffset >= maxOffset - (step * 0.25) || (forwardDiff >= step * 1.3 && currentDocIndex >= max - 2)) {
                currentDocIndex = max;
            } else if (targetOffset <= step * 0.25) {
                // Dragged past the start: clamp to Card 1
                currentDocIndex = 0;
            } else {
                // Proportional advancement based on distance & velocity
                let inertia = 0;
                if (velocity > 0.65) {
                    inertia = (forwardDiff > 0 ? 1 : -1) * (velocity > 1.2 ? 2 : 1);
                }
                let calculatedIndex = Math.round(targetOffset / step) + inertia;

                if (forwardDiff > 35 && calculatedIndex <= currentDocIndex) {
                    calculatedIndex = currentDocIndex + 1;
                } else if (forwardDiff < -35 && calculatedIndex >= currentDocIndex) {
                    calculatedIndex = currentDocIndex - 1;
                }

                currentDocIndex = Math.max(0, Math.min(max, calculatedIndex));
            }

            // Authentic spring rebound curve if overshooting, standard smooth easing otherwise
            const transitionStyle = isOvershooting
                ? 'transform 0.58s cubic-bezier(0.175, 1.25, 0.35, 1)'
                : 'transform 0.45s cubic-bezier(0.25, 1, 0.5, 1)';

            updateDocsSlider(transitionStyle);
            setTimeout(() => {
                hasMoved = false;
            }, 120);
        }

        if (sliderContainer) {
            sliderContainer.addEventListener('touchstart', (e) => {
                if (e.touches.length > 1) return;
                const touch = e.touches[0];
                startX = touch.clientX;
                startY = touch.clientY;
                currentX = touch.clientX;
                isTouching = true;
                isSwiping = false;
                isScrolling = false;
                hasMoved = false;
                startTime = Date.now();
            }, { passive: true });

            sliderContainer.addEventListener('touchmove', (e) => {
                if (!isTouching || isScrolling) return;
                const touch = e.touches[0];
                currentX = touch.clientX;
                const diffX = currentX - startX;
                const diffY = touch.clientY - startY;

                // Determine horizontal swipe vs vertical page scrolling
                if (!isSwiping) {
                    if (Math.abs(diffY) > Math.abs(diffX) && Math.abs(diffY) > 8) {
                        isScrolling = true;
                        return;
                    }
                    if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
                        isSwiping = true;
                        hasMoved = true;
                        docsTrack.classList.add('is-dragging');
                        docsTrack.style.transition = 'none';
                    }
                }

                if (isSwiping) {
                    if (e.cancelable) e.preventDefault();
                    docsTrack.style.transform = `translateX(${calculateDragTranslate(diffX)}px)`;
                }
            }, { passive: false });

            const handleTouchEnd = () => {
                if (!isTouching) return;
                isTouching = false;
                docsTrack.classList.remove('is-dragging');

                if (isSwiping) {
                    const diffX = currentX - startX;
                    const elapsed = Date.now() - startTime;
                    settleDrag(diffX, elapsed);
                }

                isSwiping = false;
                isScrolling = false;
            };

            sliderContainer.addEventListener('touchend', handleTouchEnd, { passive: true });
            sliderContainer.addEventListener('touchcancel', handleTouchEnd, { passive: true });

            // Desktop Mouse Drag Support
            let isMouseDown = false;
            sliderContainer.addEventListener('mousedown', (e) => {
                if (e.button !== 0) return;
                isMouseDown = true;
                startX = e.clientX;
                currentX = e.clientX;
                hasMoved = false;
                startTime = Date.now();
                docsTrack.classList.add('is-dragging');
                docsTrack.style.transition = 'none';
            });

            window.addEventListener('mousemove', (e) => {
                if (!isMouseDown) return;
                currentX = e.clientX;
                const diffX = currentX - startX;
                if (Math.abs(diffX) > 6) {
                    hasMoved = true;
                }
                if (hasMoved) {
                    docsTrack.style.transform = `translateX(${calculateDragTranslate(diffX)}px)`;
                }
            });

            window.addEventListener('mouseup', () => {
                if (!isMouseDown) return;
                isMouseDown = false;
                docsTrack.classList.remove('is-dragging');
                if (hasMoved) {
                    const diffX = currentX - startX;
                    const elapsed = Date.now() - startTime;
                    settleDrag(diffX, elapsed);
                }
            });

            // Prevent accidental click triggers on buttons/cards when dragging
            docsTrack.addEventListener('click', (e) => {
                if (hasMoved) {
                    e.preventDefault();
                    e.stopPropagation();
                }
            }, true);
        }
    }

    // ========== OFFICIAL DOCUMENTS LIGHTBOX MODAL & PREVIEW ==========
    (function initOfficialDocsModal() {
        const modal = document.getElementById('docModal');
        if (!modal) return;

        const backdrop = document.getElementById('docModalBackdrop');
        const closeBtn = document.getElementById('docModalClose');
        const footerCloseBtn = document.getElementById('docModalFooterClose');
        const titleEl = document.getElementById('docModalTitle');
        const issuerEl = document.getElementById('docModalIssuer');
        const badgeEl = document.getElementById('docModalBadge');
        const refEl = document.getElementById('docModalRef');
        const canvasEl = document.getElementById('docModalCanvas');
        const viewportEl = document.getElementById('docModalViewport');
        const zoomInBtn = document.getElementById('docModalZoomIn');
        const zoomOutBtn = document.getElementById('docModalZoomOut');
        const zoomLevelEl = document.getElementById('docModalZoomLevel');
        const printBtn = document.getElementById('docModalPrint');
        const downloadBtn = document.getElementById('docModalDownload');
        const primaryBtn = document.getElementById('docModalPrimaryBtn');
        const primaryBtnText = document.getElementById('docModalPrimaryBtnText');

        let currentDocKey = null;
        let currentZoom = 1.0;

        const DOCS_DATA = {
            cr: {
                id: 'cr',
                ref: 'CR: 1010784920',
                badgeEn: 'Active & Verified',
                badgeAr: 'ساري وموثق رسمياً',
                issuerEn: 'Ministry of Commerce — Kingdom of Saudi Arabia',
                issuerAr: 'وزارة التجارة — المملكة العربية السعودية',
                titleEn: 'Commercial Registration Certificate',
                titleAr: 'شهادة مستخرج السجل التجاري الإلكتروني',
                fileName: 'Al-Humam-Commercial-Registration-1010784920.pdf',
                pdfUrl: '../docs/Al-Humam-Company-Profile-2026.pdf',
                issueDateEn: '1442/08/15 H (28/03/2021 G)',
                issueDateAr: '15/08/1442 هـ (28/03/2021 م)',
                expiryDateEn: '1448/08/14 H (22/03/2027 G)',
                expiryDateAr: '14/08/1448 هـ (22/03/2027 م)',
                entityEn: 'Al Humam Advanced Contracting Co. (LLC)',
                entityAr: 'شركة الهمام المتقدمة للمقاولات (ذ.م.م)',
                capitalEn: 'SAR 50,000,000 (Fully Paid)',
                capitalAr: '50,000,000 ريال سعودي (مدفوع بالكامل)',
                scopeEn: 'General building contracting, civil works, deep excavation & shoring, infrastructure development, marine operations, electromechanical works (MEP), and industrial construction.',
                scopeAr: 'المقاولات العامة للمباني والمنشآت السكنية والتجارية، الأعمال الإنشائية والمدنية، أعمال الحفر العميق وسند الجوانب ونزح المياه، شبكات البنية التحتية، والأعمال الكهروميكانيكية.'
            },
            classification: {
                id: 'classification',
                ref: 'CLASS: Grade 1 (First Class)',
                badgeEn: 'Class 1 Certified',
                badgeAr: 'مصنف درجة أولى معتمد',
                issuerEn: 'Ministry of Municipalities & Housing — Contractor Classification Agency',
                issuerAr: 'وزارة البلديات والإسكان — وكالة تصنيف المقاولين',
                titleEn: 'Contractor Classification Certificate',
                titleAr: 'شهادة تصنيف المقاولين — الدرجة الأولى',
                fileName: 'Al-Humam-Contractor-Classification-Grade1.pdf',
                pdfUrl: '../docs/Al-Humam-Company-Profile-2026.pdf',
                issueDateEn: '1443/04/10 H (15/11/2021 G)',
                issueDateAr: '10/04/1443 هـ (15/11/2021 م)',
                expiryDateEn: '1448/04/09 H (20/10/2026 G)',
                expiryDateAr: '09/04/1448 هـ (20/10/2026 م)',
                entityEn: 'Al Humam Advanced Contracting Co.',
                entityAr: 'شركة الهمام المتقدمة للمقاولات',
                capitalEn: 'Certified Grade 1 (Mega Projects Authorized)',
                capitalAr: 'الدرجة الأولى (مؤهل لتنفيذ المشاريع الكبرى والحكومية)',
                scopeEn: 'Grade 1 authorized in Commercial & Residential Buildings, Roadworks, Water & Sewage Networks, Civil Infrastructure, Bridges, Excavations, and High-complexity structures.',
                scopeAr: 'تصنيف الدرجة الأولى في تنفيذ المباني السكنية والتجارية، شبكات المياه والصرف الصحي، أعمال الطرق والجسور، البنية التحتية الكبرى، والحفريات المتخصصة.'
            },
            sca: {
                id: 'sca',
                ref: 'SCA #40921',
                badgeEn: 'SCA Accredited Member',
                badgeAr: 'عضوية معتمدة وموثقة',
                issuerEn: 'Saudi Contractors Authority (SCA)',
                issuerAr: 'الهيئة السعودية للمقاولين',
                titleEn: 'SCA Professional Membership Certificate',
                titleAr: 'شهادة عضوية الهيئة السعودية للمقاولين',
                fileName: 'Al-Humam-SCA-Accreditation-40921.pdf',
                pdfUrl: '../docs/Al-Humam-Company-Profile-2026.pdf',
                issueDateEn: 'Active Annual Renewal (2026)',
                issueDateAr: 'تجديد سنوي ساري (2026 م)',
                expiryDateEn: 'Active Member in Good Standing',
                expiryDateAr: 'عضوية سارية المفعول ومحققة لكافة المعايير',
                entityEn: 'Al Humam Advanced Contracting Co.',
                entityAr: 'شركة الهمام المتقدمة للمقاولات',
                capitalEn: 'Gold Tier Corporate Membership',
                capitalAr: 'عضوية الفئة الذهبية للمقاولين المعتمدين',
                scopeEn: 'Fully compliant with Saudi Building Code (SBC), national procurement platforms (Etimad), standard engineering contracts, and occupational health, safety & environment guidelines.',
                scopeAr: 'الالتزام الكامل بكود البناء السعودي (SBC)، التأهيل في منصة اعتماد للمنافسات الحكومية، وتطبيق اشتراطات ومعايير السلامة المهنية والصحة والبيئة.'
            },
            tax: {
                id: 'tax',
                ref: 'VAT #310894210900003',
                badgeEn: 'ZATCA Compliant',
                badgeAr: 'شهادة التزام سارية',
                issuerEn: 'Zakat, Tax and Customs Authority (ZATCA)',
                issuerAr: 'هيئة الزكاة والضريبة والجمارك (ZATCA)',
                titleEn: 'Zakat & VAT Tax Compliance Certificate',
                titleAr: 'شهادة سداد الزكاة وضريبة القيمة المضافة',
                fileName: 'Al-Humam-ZATCA-Tax-Compliance.pdf',
                pdfUrl: '../docs/Al-Humam-Company-Profile-2026.pdf',
                issueDateEn: 'Fiscal Year 2025/2026',
                issueDateAr: 'العام المالي 2025 / 2026 م',
                expiryDateEn: 'Valid until 30/04/2027 G',
                expiryDateAr: 'سارية حتى 30/04/2027 م',
                entityEn: 'Al Humam Advanced Contracting Co.',
                entityAr: 'شركة الهمام المتقدمة للمقاولات',
                capitalEn: 'TIN: 310894210900003 — Fatoora Phase 2 Integrated',
                capitalAr: 'الرقم الضريبي: 310894210900003 — متكامل مع منظومة الفوترة الإلكترونية',
                scopeEn: 'Official certificate confirming full settlement of corporate Zakat declarations, VAT quarterly returns, and seamless electronic invoicing compliance.',
                scopeAr: 'شهادة رسمية تثبت سداد كامل المستحقات والإقرارات الزكوية والضريبية والالتزام بمعايير المرحلة الثانية من الفوترة الإلكترونية.'
            },
            chamber: {
                id: 'chamber',
                ref: 'COC #98244',
                badgeEn: 'Active Member',
                badgeAr: 'اشتراك ساري ومصدق',
                issuerEn: 'Riyadh Chamber of Commerce & Industry',
                issuerAr: 'الغرفة التجارية الصناعية بالرياض',
                titleEn: 'Chamber of Commerce Membership & Attestation',
                titleAr: 'شهادة اشتراك وتصديق الغرفة التجارية بالرياض',
                fileName: 'Al-Humam-Chamber-Commerce-98244.pdf',
                pdfUrl: '../docs/Al-Humam-Company-Profile-2026.pdf',
                issueDateEn: '1442/08/20 H',
                issueDateAr: '20/08/1442 هـ',
                expiryDateEn: '1448/08/19 H',
                expiryDateAr: '19/08/1448 هـ',
                entityEn: 'Al Humam Advanced Contracting Co.',
                entityAr: 'شركة الهمام المتقدمة للمقاولات',
                capitalEn: 'First Class Commercial Registration',
                capitalAr: 'الدرجة الممتازة — الغرفة التجارية بالرياض',
                scopeEn: 'Certified corporate member representing certified contracting entities in the capital Riyadh, with authorized digital document attestation.',
                scopeAr: 'عضوية معتمدة تمثل منشآت المقاولات الكبرى في العاصمة الرياض مع صلاحية التصديق الإلكتروني للوثائق والعقود التجارية.'
            },
            profile: {
                id: 'profile',
                ref: 'VER: 2026.1 / REF: KSA-HQ-2026',
                badgeEn: 'Prequalified & Certified',
                badgeAr: 'ملف معتمد ومؤهل رسمياً',
                issuerEn: 'Al Humam Advanced Contracting Co.',
                issuerAr: 'شركة الهمام المتقدمة للمقاولات',
                titleEn: 'Corporate Profile & Prequalification Dossier',
                titleAr: 'الملف التعريفي والتأهيلي الشامل وسابقة الأعمال',
                fileName: 'Al-Humam-Company-Profile-2026.pdf',
                pdfUrl: '../docs/Al-Humam-Company-Profile-2026.pdf',
                issueDateEn: 'Q1-2026 Official Edition',
                issueDateAr: 'الربع الأول 2026 م (إصدار معتمد)',
                expiryDateEn: 'Active for Mega-Tenders & Joint Ventures',
                expiryDateAr: 'ساري المفعول للمناقصات والمشاريع الكبرى والشراكات',
                entityEn: 'Al Humam Advanced Contracting Co. (LLC)',
                entityAr: 'شركة الهمام المتقدمة للمقاولات (شركة ذات مسؤولية محدودة)',
                capitalEn: 'Class 1 Certified | SAR 50M Capital | SCA Member #40921',
                capitalAr: 'مصنف درجة أولى | رأس مال 50 مليون ريال | عضو الهيئة #40921',
                scopeEn: 'Comprehensive corporate dossier: executive management, 10,000+ workforce, heavy machinery fleet, deep excavation & shoring systems, landmark public & commercial towers, civil infrastructure, and ISO 9001/14001/45001 certified operations.',
                scopeAr: 'الملف التعريفي والتأهيلي الشامل: القيادة التنفيذية، كوادر وأسطول يتجاوز 10,000 متخصص، معدات الحفر العميق وسند الجوانب، سابقة مشاريع الأبراج الحكومية والتجارية، أعمال البنية التحتية، وشهادات الجودة والسلامة العالمية.'
            }
        };

        function getSaudiEmblemSvg() {
            return `<svg viewBox="0 0 100 100" fill="currentColor">
                <!-- Two crossed swords and palm tree (Saudi National Emblem) -->
                <path d="M50 8 C44 20 40 32 50 48 C60 32 56 20 50 8 Z" fill="#1d7c4d"/>
                <path d="M36 16 C38 28 44 38 50 46 C42 40 34 30 36 16 Z" fill="#1d7c4d"/>
                <path d="M64 16 C62 28 56 38 50 46 C58 40 66 30 64 16 Z" fill="#1d7c4d"/>
                <path d="M26 28 C32 38 40 44 48 48 C38 46 28 38 26 28 Z" fill="#1d7c4d"/>
                <path d="M74 28 C68 38 60 44 52 48 C62 46 72 38 74 28 Z" fill="#1d7c4d"/>
                <rect x="47" y="46" width="6" height="18" fill="#1d7c4d" rx="2"/>
                <!-- Sword 1 -->
                <path d="M18 78 L78 52 L82 54 L22 80 Z" fill="#c8a45a"/>
                <circle cx="18" cy="80" r="3" fill="#c8a45a"/>
                <line x1="24" y1="74" x2="20" y2="84" stroke="#c8a45a" stroke-width="2"/>
                <!-- Sword 2 -->
                <path d="M82 78 L22 52 L18 54 L78 80 Z" fill="#c8a45a"/>
                <circle cx="82" cy="80" r="3" fill="#c8a45a"/>
                <line x1="76" y1="74" x2="80" y2="84" stroke="#c8a45a" stroke-width="2"/>
            </svg>`;
        }

        function getQrSvg() {
            return `<svg viewBox="0 0 100 100" fill="#111">
                <rect x="10" y="10" width="24" height="24" fill="none" stroke="#111" stroke-width="4"/>
                <rect x="16" y="16" width="12" height="12"/>
                <rect x="66" y="10" width="24" height="24" fill="none" stroke="#111" stroke-width="4"/>
                <rect x="72" y="16" width="12" height="12"/>
                <rect x="10" y="66" width="24" height="24" fill="none" stroke="#111" stroke-width="4"/>
                <rect x="16" y="72" width="12" height="12"/>
                <rect x="44" y="14" width="6" height="12"/>
                <rect x="54" y="22" width="6" height="6"/>
                <rect x="42" y="42" width="16" height="16"/>
                <rect x="18" y="44" width="8" height="8"/>
                <rect x="72" y="44" width="12" height="6"/>
                <rect x="44" y="68" width="8" height="14"/>
                <rect x="64" y="68" width="6" height="8"/>
                <rect x="76" y="78" width="12" height="10"/>
            </svg>`;
        }

        function getBarcodeSvg() {
            return `<svg viewBox="0 0 160 36" fill="currentColor">
                <rect x="0" y="0" width="3" height="36"/>
                <rect x="5" y="0" width="1" height="36"/>
                <rect x="8" y="0" width="4" height="36"/>
                <rect x="15" y="0" width="2" height="36"/>
                <rect x="19" y="0" width="1" height="36"/>
                <rect x="23" y="0" width="5" height="36"/>
                <rect x="31" y="0" width="2" height="36"/>
                <rect x="35" y="0" width="3" height="36"/>
                <rect x="41" y="0" width="1" height="36"/>
                <rect x="45" y="0" width="4" height="36"/>
                <rect x="52" y="0" width="2" height="36"/>
                <rect x="57" y="0" width="5" height="36"/>
                <rect x="65" y="0" width="1" height="36"/>
                <rect x="69" y="0" width="3" height="36"/>
                <rect x="75" y="0" width="4" height="36"/>
                <rect x="82" y="0" width="2" height="36"/>
                <rect x="87" y="0" width="1" height="36"/>
                <rect x="91" y="0" width="5" height="36"/>
                <rect x="99" y="0" width="3" height="36"/>
                <rect x="105" y="0" width="2" height="36"/>
                <rect x="110" y="0" width="4" height="36"/>
                <rect x="117" y="0" width="1" height="36"/>
                <rect x="121" y="0" width="3" height="36"/>
                <rect x="127" y="0" width="5" height="36"/>
                <rect x="135" y="0" width="2" height="36"/>
                <rect x="140" y="0" width="1" height="36"/>
                <rect x="144" y="0" width="4" height="36"/>
                <rect x="151" y="0" width="2" height="36"/>
                <rect x="156" y="0" width="3" height="36"/>
            </svg>`;
        }

        function renderDocument(key) {
            const isAr = document.documentElement.lang === 'ar' || document.documentElement.getAttribute('dir') === 'rtl';
            const doc = DOCS_DATA[key];
            if (!doc) return;

            // Update modal header info
            if (badgeEl) badgeEl.textContent = isAr ? doc.badgeAr : doc.badgeEn;
            if (issuerEl) issuerEl.textContent = isAr ? doc.issuerAr : doc.issuerEn;
            if (titleEl) titleEl.textContent = isAr ? doc.titleAr : doc.titleEn;
            if (refEl) refEl.textContent = doc.ref;

            // Setup download button attributes to open in new tab as requested
            if (downloadBtn) {
                downloadBtn.href = doc.pdfUrl;
                downloadBtn.target = '_blank';
                downloadBtn.rel = 'noopener noreferrer';
                downloadBtn.removeAttribute('download');
                downloadBtn.setAttribute('title', isAr ? 'فتح وتحميل الوثيقة في صفحة جديدة' : 'Open & Download Document in New Tab');
            }

            if (primaryBtn && primaryBtnText) {
                primaryBtnText.textContent = isAr ? (key === 'profile' ? 'فتح البروفايل في صفحة جديدة' : 'فتح وتحميل النسخة الرسمية') : (key === 'profile' ? 'Open Profile in New Tab' : 'Open Official Document');
            }

            // Uniform Official Certificate Layout for ALL documents (including Company Profile)
            canvasEl.innerHTML = `
                <div class="doc-cert">
                    <div class="doc-cert__watermark">
                        ${getSaudiEmblemSvg()}
                    </div>
                    <div class="doc-cert__content">
                        <!-- Certificate Header -->
                        <div class="doc-cert__header">
                            <div class="doc-cert__emblem">
                                ${getSaudiEmblemSvg()}
                            </div>
                            <div class="doc-cert__header-text">
                                <div class="doc-cert__country">${isAr ? 'المملكة العربية السعودية' : 'KINGDOM OF SAUDI ARABIA'}</div>
                                <div class="doc-cert__ministry">${isAr ? doc.issuerAr : doc.issuerEn}</div>
                                <div class="doc-cert__tagline">${isAr ? (key === 'profile' ? 'الملف التأهيلي والتعريفي المعتمد للمقاولين' : 'منصة التوثيق والتراخيص الحكومية المعتمدة') : (key === 'profile' ? 'Official Corporate Prequalification Dossier' : 'Official Government Credential & Verification Registry')}</div>
                            </div>
                            <div class="doc-cert__qr-small">
                                ${getQrSvg()}
                            </div>
                        </div>

                        <!-- Certificate Title Banner -->
                        <div class="doc-cert__banner">
                            <span class="doc-cert__type-tag">${isAr ? (key === 'profile' ? 'وثيقة تأهيل وسابقة أعمال رسمية معتمدة' : 'وثيقة إلكترونية رسمية معتمدة') : (key === 'profile' ? 'CERTIFIED CORPORATE PREQUALIFICATION' : 'OFFICIAL ELECTRONIC DOCUMENT')}</span>
                            <div class="doc-cert__doc-title">${isAr ? doc.titleAr : doc.titleEn}</div>
                        </div>

                        <!-- Data Grid -->
                        <div class="doc-cert__grid">
                            <div class="doc-cert__item">
                                <span class="doc-cert__label">${isAr ? 'رقم الوثيقة / القيد' : 'Document Reference No.'}</span>
                                <span class="doc-cert__value doc-cert__value--accent">${doc.ref}</span>
                            </div>
                            <div class="doc-cert__item">
                                <span class="doc-cert__label">${isAr ? 'حالة الاعتماد' : 'Certification Status'}</span>
                                <span class="doc-cert__value" style="color: #1d7c4d;">${isAr ? doc.badgeAr : doc.badgeEn}</span>
                            </div>
                            <div class="doc-cert__item doc-cert__item--full">
                                <span class="doc-cert__label">${isAr ? 'اسم المنشأة' : 'Legal Commercial Entity'}</span>
                                <span class="doc-cert__value doc-cert__value--bold">${isAr ? doc.entityAr : doc.entityEn}</span>
                            </div>
                            <div class="doc-cert__item">
                                <span class="doc-cert__label">${isAr ? 'تاريخ الإصدار' : 'Issue Date'}</span>
                                <span class="doc-cert__value">${isAr ? doc.issueDateAr : doc.issueDateEn}</span>
                            </div>
                            <div class="doc-cert__item">
                                <span class="doc-cert__label">${isAr ? 'تاريخ الصلاحية / الانتهاء' : 'Validity / Expiry Date'}</span>
                                <span class="doc-cert__value">${isAr ? doc.expiryDateAr : doc.expiryDateEn}</span>
                            </div>
                            <div class="doc-cert__item doc-cert__item--full">
                                <span class="doc-cert__label">${isAr ? (key === 'profile' ? 'الدرجة والتصنيف والاعتماد' : 'التصنيف / الفئة المعتمدة') : (key === 'profile' ? 'Classification & Credentials' : 'Classification / Registered Standing')}</span>
                                <span class="doc-cert__value">${isAr ? doc.capitalAr : doc.capitalEn}</span>
                            </div>
                            <div class="doc-cert__item doc-cert__item--full">
                                <span class="doc-cert__label">${isAr ? (key === 'profile' ? 'سابقة الأعمال والقدرات التنفيذية والأسطول' : 'مجال الترخيص والأنشطة النظامية') : (key === 'profile' ? 'Executive Capabilities, Machinery & Scope' : 'Licensed Scope of Operations')}</span>
                                <div class="doc-cert__scope">${isAr ? doc.scopeAr : doc.scopeEn}</div>
                            </div>
                        </div>

                        <!-- Certificate Footer with Seals & Verification -->
                        <div class="doc-cert__footer">
                            <div class="doc-cert__barcode">
                                <div class="doc-cert__barcode-lines">${getBarcodeSvg()}</div>
                                <div class="doc-cert__barcode-code">${(doc.ref.replace(/[^0-9A-Z]/gi, '') || 'SAUDI-VERIFIED-2026')}</div>
                            </div>
                            <div class="doc-cert__verification-note">
                                ${isAr ? (key === 'profile' ? 'تم اعتماد وتوثيق هذا الملف التعريفي وسابقة الأعمال رسمياً من قبل الإدارة العامة لشركة الهمام المتقدمة للمقاولات وهو صالح للتقديم في كافة المناقصات والشراكات الكبرى.' : 'تم التحقق من صحة هذه الوثيقة إلكترونياً وهي سارية المفعول ومطابقة لكافة اللوائح والأنظمة المعمول بها في المملكة العربية السعودية.') : (key === 'profile' ? 'This corporate prequalification profile has been digitally verified and approved by Al Humam Advanced Contracting Co. and is certified for official megaproject tenders.' : 'This document has been verified electronically. It is valid and fully compliant with applicable regulatory codes in Saudi Arabia.')}
                            </div>
                            <div class="doc-cert__seal">
                                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/><polyline points="9 12 11 14 15 10"/></svg>
                                <div class="doc-cert__seal-text">${isAr ? 'معتمد رسميـاً' : 'OFFICIALLY VERIFIED'}</div>
                            </div>
                        </div>
                    </div>
                </div>
            `;
        }

        function setZoom(val) {
            currentZoom = Math.max(0.65, Math.min(1.8, val));
            if (viewportEl) {
                viewportEl.style.transform = `scale(${currentZoom})`;
            }
            if (zoomLevelEl) {
                zoomLevelEl.textContent = `${Math.round(currentZoom * 100)}%`;
            }
        }

        function openModal(key) {
            currentDocKey = key;
            renderDocument(key);
            setZoom(1.0);
            modal.classList.add('active');
            modal.setAttribute('aria-hidden', 'false');
            document.body.classList.add('doc-modal-open');
        }

        function closeModal() {
            modal.classList.remove('active');
            modal.setAttribute('aria-hidden', 'true');
            document.body.classList.remove('doc-modal-open');
            currentDocKey = null;
        }

        // Attach trigger clicks
        document.querySelectorAll('.js-doc-modal-trigger').forEach(btn => {
            btn.addEventListener('click', (e) => {
                e.preventDefault();
                const key = btn.getAttribute('data-doc-key');
                if (key) openModal(key);
            });
        });

        // Close triggers
        if (closeBtn) closeBtn.addEventListener('click', closeModal);
        if (footerCloseBtn) footerCloseBtn.addEventListener('click', closeModal);
        if (backdrop) backdrop.addEventListener('click', closeModal);

        // Zoom In & Out
        if (zoomInBtn) zoomInBtn.addEventListener('click', () => setZoom(currentZoom + 0.15));
        if (zoomOutBtn) zoomOutBtn.addEventListener('click', () => setZoom(currentZoom - 0.15));

        // Print
        if (printBtn) {
            printBtn.addEventListener('click', () => {
                window.print();
            });
        }

        // Primary Action Button (Download)
        if (primaryBtn) {
            primaryBtn.addEventListener('click', () => {
                if (currentDocKey && DOCS_DATA[currentDocKey]) {
                    const doc = DOCS_DATA[currentDocKey];
                    window.open(doc.pdfUrl, '_blank');
                }
            });
        }

        // Escape Key
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && modal.classList.contains('active')) {
                closeModal();
            }
        });

        // Language change reactive update
        document.addEventListener('alhumam-lang-change', () => {
            if (currentDocKey && modal.classList.contains('active')) {
                renderDocument(currentDocKey);
            }
        });
    })();

});

/* ==========================================
   TOP UTILITY BAR — KSA Clock (Riyadh Time)
   Uses Intl.DateTimeFormat for timezone accuracy
   Page Visibility API stops interval when tab hidden
   ========================================== */
(function initUtilityClock() {
    const timeEls = document.querySelectorAll('.utility-bar__time, #utilityClockTime');
    if (!timeEls.length) return;

    let intervalId = null;

    function tick() {
        const timeStr = typeof getRiyadhTime === 'function' ? getRiyadhTime(true) : (() => {
            const now = new Date();
            const pad = (n) => String(n).padStart(2, '0');
            return `${pad(now.getHours())}:${pad(now.getMinutes())}:${pad(now.getSeconds())}`;
        })();
        timeEls.forEach(el => {
            el.textContent = timeStr;
            el.setAttribute('datetime', new Date().toISOString());
        });
    }

    function startClock() {
        tick();
        if (!intervalId) intervalId = setInterval(tick, 1000);
    }

    function stopClock() {
        if (intervalId) { clearInterval(intervalId); intervalId = null; }
    }

    // Page Visibility API - zero battery drain when tab is hidden
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) { stopClock(); } else { startClock(); }
    });

    // Utility bar always stays visible — no scroll-hide on mobile
    const bar = document.getElementById('topUtilityBar');
    const header = document.getElementById('header');
    if (bar) {
        bar.classList.remove('hidden-by-scroll');
        if (header) header.classList.remove('utility-hidden');
    }

    startClock();
})();

/* ==========================================
   DARK / LIGHT MODE TOGGLE
   Persists choice in localStorage with robust mobile touch support
   ========================================== */
(function initThemeToggle() {
    const STORAGE_KEY = 'alhumam-theme';
    const html = document.documentElement;

    function getToggles() {
        return document.querySelectorAll('.theme-toggle, #themeToggle, .header__theme-toggle, .js-theme-toggle');
    }

    function applyTheme(theme) {
        if (theme === 'light') {
            html.setAttribute('data-theme', 'light');
            getToggles().forEach(b => {
                b.setAttribute('data-tooltip', 'Dark Mode');
                b.setAttribute('aria-label', 'Switch to dark mode');
            });
        } else {
            html.removeAttribute('data-theme');
            getToggles().forEach(b => {
                b.setAttribute('data-tooltip', 'Light Mode');
                b.setAttribute('aria-label', 'Switch to light mode');
            });
        }
    }

    // Restore saved preference or URL param (?theme=light)
    const urlTheme = new URLSearchParams(window.location.search).get('theme');
    const saved = urlTheme || localStorage.getItem(STORAGE_KEY);
    applyTheme(saved === 'light' ? 'light' : 'dark');

    function toggleTheme(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        const current = html.getAttribute('data-theme');
        const next = current === 'light' ? 'dark' : 'light';
        localStorage.setItem(STORAGE_KEY, next);
        applyTheme(next);
    }

    // Attach click and touch events to all toggle buttons
    getToggles().forEach(btn => {
        btn.addEventListener('click', toggleTheme);

        let startX = 0;
        let startY = 0;
        btn.addEventListener('touchstart', (e) => {
            const t = e.touches[0];
            startX = t.clientX;
            startY = t.clientY;
        }, { passive: true });

        btn.addEventListener('touchend', (e) => {
            const t = e.changedTouches[0];
            const dx = Math.abs(t.clientX - startX);
            const dy = Math.abs(t.clientY - startY);
            if (dx < 14 && dy < 14) {
                toggleTheme(e);
            }
        }, { passive: false });
    });
})();

/* ==========================================
   CONTACT FORM SECURITY & TIME STAMPING
   ========================================== */
document.addEventListener("DOMContentLoaded", () => {
    // Populate anti-spam time-gate
    document.querySelectorAll(".js-form-time").forEach(el => {
        el.value = Math.floor(Date.now() / 1000);
    });

    // Check URL parameters for submission status toast
    const params = new URLSearchParams(window.location.search);
    if (params.get("status") === "success") {
        const lang = localStorage.getItem("alhumam-lang") || "ar";
        const msg = lang === "ar" 
            ? "تم استلام طلبك ورسالتك بنجاح! سيتواصل معك أحد مهندسينا قريباً." 
            : "Your inquiry has been received successfully! Our engineering team will contact you shortly.";
        setTimeout(() => { alert(msg); }, 300);
        if (window.history && window.history.replaceState) {
            const cleanUrl = window.location.pathname + window.location.hash;
            window.history.replaceState({}, document.title, cleanUrl);
        }
    }
});
