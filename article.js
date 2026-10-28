/* ==========================================
   Al Humam Advanced — Article Page JavaScript
   Handles article rendering, gallery, and
   language sync with the main script.js
   ========================================== */

const articlesData = {
    'bim': {
        title: { 
            en: 'BIM 4D/5D Modeling: Engineering Precision & Lifecycle Value', 
            ar: 'تقنية نمذجة معلومات البناء (BIM 4D/5D): هندسة متقدمة وإدارة رقمية متكاملة للمشاريع' 
        },
        date: { en: 'February 10, 2026', ar: '10 فبراير 2026' },
        author: { en: 'Al Humam Engineering Excellence Team', ar: 'فريق التميز الهندسي في شركة الهمام المتقدمة' },
        content: {
            en: `
                <p>Building Information Modeling (BIM) represents the cornerstone of modern engineering transformation at <strong>Al Humam Advanced</strong>. Beyond standard three-dimensional geometry, our implementation integrates multi-dimensional intelligence (3D to 7D), establishing a unified digital thread that governs complex capital projects from initial concept through lifetime asset operations.</p>
                
                <h3>Multi-Dimensional Digital Twin Architecture</h3>
                <p>At Al Humam Advanced, we construct a fully coordinated <em>Digital Twin</em> before commencing excavation on-site. By coupling parametric geometric modeling (3D) with granular construction scheduling (4D) and continuous cost engineering (5D), our project managers execute digital rehearsals of every construction sequence. This rigorous virtual pre-construction eliminates schedule compression risks and optimizes capital expenditure with unmatched precision.</p>

                <h3>Clash Detection & Zero-Rework Delivery</h3>
                <p>Through centralized Common Data Environments (CDE) using Autodesk Revit, Navisworks, and Bentley systems, our specialized engineering divisions coordinate structural framing, post-tensioned slabs, MEP ductwork, and specialized architectural elements. Early automated clash detection resolves thousands of physical and logistical conflicts prior to fabrication, driving down field variation orders by more than 85% and significantly accelerating project commissioning.</p>

                <h3>Saudi Vision 2030 Standards & Asset Handover</h3>
                <p>Aligned with the high-specification demands of Saudi Vision 2030 giga-projects, our BIM framework incorporates COBie-compliant metadata (6D/7D) for integrated facility lifecycle management. Our clients receive not just a physical asset of exceptional quality, but a fully indexed, intelligent digital database ready for automated smart operations and predictive maintenance.</p>
            `,
            ar: `
                <p>تُمثّل نمذجة معلومات البناء (BIM) الركيزة الأساسية للتحول الهندسي الحديث في <strong>شركة الهمام المتقدمة للمقاولات</strong>. لا تقتصر رؤيتنا على التصاميم ثلاثية الأبعاد فحسب، بل تمتد إلى دمج الأبعاد الهندسية المتقدمة (من 3D حتى 7D)، لإنشاء بيئة رقمية موحدة وشاملة تدير المشاريع الإنشائية الكبرى بدقة متناهية من مرحلة الفكرة وحتى التشغيل الكامل للأصل.</p>
                
                <h3>بنية التوأم الرقمي متعدد الأبعاد (Digital Twin)</h3>
                <p>في شركة الهمام المتقدمة، نحرص على بناء <em>توأم رقمي</em> مطابق تماماً قبل تحريك أول معدة في الموقع. ومن خلال الربط الوثيق بين النماذج البارامترية (3D) والجداول الزمنية الدقيقة (4D) والتكلفة التقديرية والتدفقات النقدية (5D)، يتمكن مهندسونا من محاكاة كل خطوة تنفيذية افتراضياً، مما يضمن القضاء على مخاطر التأخير وضبط التكاليف التشغيلية بأعلى معايير الحوكمة الإنشائية.</p>

                <h3>اكتشاف التعارضات الهندسية ومبدأ التنفيذ بدون أخطاء</h3>
                <p>عبر بيئة البيانات المشتركة (CDE) وبرمجيات Autodesk Revit و Navisworks المتقدمة، يُنسق فريقنا الهندسي بين الهياكل الخرسانية المسلحة، وأنظمة الكهروميكانيك (MEP)، والواجهات المعمارية المتطورة. يتيح كشف التعارضات الآلي المبكر حل آلاف التداخلات قبل التصنيع والتوريد، مما يؤدي إلى خفض أوامر التغيير بنسبة تتجاوز 85% وتقليص زمن التسليم بدرجة استثنائية.</p>

                <h3>التوافق مع متطلبات مشاريع رؤية 2030 وإدارة الأصول</h3>
                <p>التزاماً بالمعايير العالمية والمواصفات القياسية لمشاريع رؤية السعودية 2030 الكبرى، يتضمن إطار BIM لدينا مخرجات بيانات COBie للأبعاد (6D/7D)، مما يزود المالك بقاعدة بيانات ذكية لإدارة المرافق والصيانة الاستباقية المستدامة طوال العمر الافتراضي للمبنى.</p>
            `
        },
        image: 'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=1200&q=85',
        gallery: [
            'https://images.unsplash.com/photo-1581094794329-c8112a89af12?w=800&q=80',
            'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=800&q=80',
            'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=800&q=80'
        ]
    },
    'drones': {
        title: { 
            en: 'Autonomous Drone Surveillance & LiDAR Scanning in Modern Site Operations', 
            ar: 'المراقبة الذكية بالدرونز والمسح الطوبوغرافي بالليزر (LiDAR): آفاق الدقة والسلامة المهنية' 
        },
        date: { en: 'January 22, 2026', ar: '22 يناير 2026' },
        author: { en: 'Al Humam Survey & Remote Sensing Division', ar: 'قسم المساحة والاستشعار عن بعد في شركة الهمام المتقدمة' },
        content: {
            en: `
                <p>In high-stakes, fast-track civil and infrastructure developments, traditional manual surveying is unable to match the speed and precision demanded by modern contracting. <strong>Al Humam Advanced</strong> operates an enterprise fleet of autonomous UAVs (Unmanned Aerial Vehicles) equipped with Real-Time Kinematic (RTK) GPS, high-resolution photogrammetry cameras, and LiDAR scanners.</p>

                <h3>Millimeter-Accurate Volumetrics & Topographical Mapping</h3>
                <p>Our drone division conducts automated fly-overs generating dense 3D point clouds and digital elevation models (DEM). This capability is pivotal for heavy earthworks, excavation, and shoring contracts, allowing daily volumetric cut-and-fill calculations with sub-centimeter accuracy. Progress tracking reports that once took days are now generated in hours, directly validated against engineering baselines.</p>

                <h3>Uncompromised Safety & High-Risk Inspections</h3>
                <p>Personnel safety is the unyielding priority across all Al Humam Advanced job sites. By deploying specialized drones for high-altitude facade inspections, tower crane structural audits, and deep basement excavation perimeters, we eliminate hazardous working conditions at height. Thermal radiometric cameras identify heat leakage, moisture infiltration, and electrical hotspots without manual human exposure.</p>

                <h3>Seamless Aerial-to-BIM Integration</h3>
                <p>The high-density spatial datasets captured by our drones feed directly into our BIM models and GIS platforms. This creates a transparent, auditable digital log of actual construction progress versus planned milestones, giving public and private stakeholders real-time 360-degree visibility into the jobsite from any corporate dashboard.</p>
            `,
            ar: `
                <p>في المشاريع المدنية ومشاريع البنية التحتية العملاقة متسارعة الوتيرة، لم تعد الطرق المساحية التقليدية قادرة على مضاهاة سرعة ودقة متطلبات المقاولات الحديثة. لذلك، تعتمد <strong>شركة الهمام المتقدمة للمقاولات</strong> أسطولاً متطوراً من الطائرات المسيرة (UAVs) المجهزة بأنظمة تحديد المواقع الفضائية اللحظية (RTK GPS) وكاميرات القياس التصويري ومستشعرات المسح الليزري (LiDAR).</p>

                <h3>المسح الطوبوغرافي وحساب الكميات بدقة المليمتر</h3>
                <p>يقوم قسم المساحة الرقمية بإجراء مسوحات جوية دورية لإنتاج سحب نقطية ثلاثية الأبعاد (3D Point Clouds) ونماذج تضاريس رقمية (DEM). تبرز أهمية هذه التقنية بشكل خاص في عقود الحفر الكبرى وتثبيت وسند الجوانب؛ حيث تمكننا من احتساب كميات الردم والقطع بدقة مليمترية يومياً، واستخراج تقارير إنجاز كمية موثوقة في غضون ساعات قليلة بدلاً من أيام.</p>

                <h3>أعلى معايير السلامة المهنية وفحص المواقع الخطرة</h3>
                <p>تضع شركة الهمام المتقدمة سلامة الكوادر البشرية في مقدمة أولوياتها المطلقة. من خلال نشر الدرونز لفحص الواجهات الشاهقة، وتدقيق سلامة الرافعات البرجية، ومراقبة جدران السند في الحفريات العميقة، نجنب المهندسين والعمال المخاطر المباشرة. كما تتيح كاميرات التصوير الحراري اكتشاف التسريبات والعيوب الإنشائية والكهربائية بدقة فائقة وبشكل استباقي.</p>

                <h3>الدمج المباشر بين البيانات الجوية ونماذج BIM</h3>
                <p>تتدفق البيانات الميدانية المجمعة من الطائرات المسيرة آلياً إلى نماذج BIM ومنصات الـ GIS الخاصة بالمشروع، مما يوفر سجلاً رقمياً موثقاً لمقارنة الواقع المنفذ بالجدول الزمني المخطط، ويمنح عملاءنا في القطاعين العام والخاص رؤية بانورامية تفاعلية حية تسهم في اتخاذ القرارات السريعة والمستنيرة.</p>
            `
        },
        image: 'https://images.unsplash.com/photo-1508614589041-895b88991e3e?w=1200&q=85',
        gallery: [
            'https://images.unsplash.com/photo-1527977966376-1c8408f9f108?w=800&q=80',
            'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
            'https://images.unsplash.com/photo-1581092160607-ee22621dd758?w=800&q=80'
        ]
    },
    'ai': {
        title: { 
            en: 'AI-Powered Project Management & Predictive Risk Control', 
            ar: 'إدارة المشاريع الذكية بالذكاء الاصطناعي: التحليلات التنبؤية وتحسين الموارد' 
        },
        date: { en: 'March 05, 2026', ar: '05 مارس 2026' },
        author: { en: 'Al Humam Digital Innovation Hub', ar: 'مركز الابتكار الرقمي في شركة الهمام المتقدمة' },
        content: {
            en: `
                <p>The construction sector is experiencing a paradigm shift from reactive problem-solving to proactive predictive intelligence. At <strong>Al Humam Advanced</strong>, our proprietary AI and machine learning infrastructure synthesizes historical jobsite data, material supply chain metrics, weather forecasts, and equipment telemetry to build a resilient, forward-looking project delivery ecosystem.</p>

                <h3>Predictive Critical-Path & Bottleneck Mitigation</h3>
                <p>Traditional CPM (Critical Path Method) schedules often struggle to adapt dynamically to unforeseen logistics disruptions. Our AI algorithms analyze real-time procurement milestones and site progress vectors to identify potential micro-delays weeks before they reach critical milestones. Project leaders can simulate scenario mitigations—such as alternate vendor routing or resequencing pour phases—mitigating schedule creep and preserving contractual deadlines.</p>

                <h3>Dynamic Fleet & Labor Allocation</h3>
                <p>Operating a vast fleet of heavy machinery—from heavy hydraulic excavators to concrete pumps and mobile cranes—requires precise fleet optimization. Machine learning models predict maintenance cycles based on vibration and sensor telemetry, preventing catastrophic jobsite downtime. Real-time algorithms also balance specialized labor distribution across multiple concurrent sectors, ensuring optimum crew productivity and eliminating idle equipment overheads.</p>

                <h3>Intelligent Procurement & Material Cost Hedging</h3>
                <p>Given the volatility in bulk commodity markets including rebar, structural steel, and cement, our procurement models analyze global commodity indexes and local supply trends. By forecasting material pricing curves, Al Humam Advanced locks in procurement packages at favorable windows, insulating client budgets and maintaining robust margins across long-term developments.</p>
            `,
            ar: `
                <p>يشهد قطاع المقاولات والإنشاءات نقلة نوعية كبرى بالتحول من أسلوب معالجة المشكلات بعد وقوعها إلى الإدارة التنبؤية الذكية والاستباقية. في <strong>شركة الهمام المتقدمة للمقاولات</strong>، نوظف خوارزميات الذكاء الاصطناعي والتعلم الآلي لدمج بيانات المشاريع السابقة، ومؤشرات سلاسل الإمداد، والتنبؤات المناخية، وبيانات تتبع المعدات الثقيلة لبناء منظومة تشغيلية ذكية وعالية الكفاءة.</p>

                <h3>التحليل التنبؤي للمسار الحرج وتفادي الاختناقات</h3>
                <p>غالباً ما تواجه الجداول الزمنية التقليدية صعوبة في استيعاب المتغيرات الطارئة في سلاسل التوريد. تقوم خوارزمياتنا الذكية بتحليل معدلات الإنجاز اليومية وتتبع التوريدات للتنبؤ بأي اختناقات محتملة قبل حدوثها بأسابيع. يتيح ذلك لمديري المشاريع محاكاة سيناريوهات معالجة بديلة وإعادة ترتيب مراحل الصب والتنفيذ بمرونة، مما يحمي الجداول الزمنية ويضمن التسليم في الموعد المحدد بدقة.</p>

                <h3>التحسين الديناميكي لأسطول المعدات والكوادر البشرية</h3>
                <p>تتطلب إدارة أسطول الآليات والمعدات الثقيلة في شركة الهمام المتقدمة—من الحفارات العملاقة ومضخات الخرسانة والرافعات—تنسيقاً بالغ الدقة. تعتمد نماذج التعلم الآلي على مستشعرات إنترنت الأشياء (IoT) المدمجة بالآليات للتنبؤ بجداول الصيانة الدورية وتفادي التوقف المفاجئ للمعدات. كما تدير الأنظمة توزيع العمالة الفنية المتخصصة بذكاء لمنع الهدر ورفع كفاءة الإنتاجية الميدانية.</p>

                <h3>إدارة المشتريات الذكية والتحوط ضد تقلبات الأسعار</h3>
                <p>في ظل التغيرات المتسارعة في أسواق المواد الأساسية كحديد التسليح والخرسانة والصلب الإنشائي، تحلل نماذجنا الاقتصادية مؤشرات الأسعار المحلية والعالمية. يمكّن هذا التحليل الاستباقي شركة الهمام المتقدمة من إبرام عقود التوريد في الأوقات الأنسب، مما يحمي ميزانيات العملاء ويضمن استقرار التكاليف وجودة المواد المستخدمة عبر كافة مراحل المشروع.</p>
            `
        },
        image: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=1200&q=85',
        gallery: [
            'https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=800&q=80',
            'https://images.unsplash.com/photo-1451187580459-43490279c0fa?w=800&q=80',
            'https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=800&q=80'
        ]
    },
    'green': {
        title: { 
            en: 'Sustainable Green Construction & Next-Generation Environmental Engineering', 
            ar: 'تقنيات البناء الأخضر والاستدامة البيئية: مبادئ الهندسة المستدامة وكفاءة الطاقة' 
        },
        date: { en: 'April 12, 2026', ar: '12 أبريل 2026' },
        author: { en: 'Al Humam Sustainability & ESG Directorate', ar: 'إدارة الاستدامة والحوكمة البيئية في شركة الهمام المتقدمة' },
        content: {
            en: `
                <p>Sustainability is not a supplementary feature of modern construction—it is a foundational imperative. At <strong>Al Humam Advanced</strong>, our sustainable contracting practice is firmly anchored in international LEED (Leadership in Energy and Environmental Design) principles and the Kingdom of Saudi Arabia's <em>Mostadam</em> (مستدام) green building certification system, contributing actively to the <strong>Saudi Green Initiative</strong>.</p>

                <h3>High-Performance Thermal Envelopes & Energy Decarbonization</h3>
                <p>Buildings in the Arabian Gulf region face intense solar irradiance and ambient temperatures. Al Humam Advanced engineers high-performance building envelopes utilizing thermal-break curtain walls, double low-emissivity glazing, and continuous exterior insulation. By combining these structural systems with smart VRF/VAV HVAC engineering, our developments achieve up to a 40% reduction in lifetime operational energy demand compared to standard building benchmarks.</p>

                <h3>Circular Materials & Low-Carbon Concrete Engineering</h3>
                <p>We actively reduce embodied carbon through engineered concrete mix designs incorporating supplementary cementitious materials such as GGBS (Ground Granulated Blast-furnace Slag) and silica fume. Furthermore, our jobsite protocols enforce closed-loop circular economy principles: over 80% of clean construction and demolition waste is segregated, processed, and repurposed for road base, non-structural backfill, and aggregate supply.</p>

                <h3>Water Conservation & Eco-Smart Infrastructure</h3>
                <p>In water-stressed arid environments, every drop must be stewardship-managed. Al Humam Advanced designs and installs decentralized greywater recycling networks and condensate water capture systems on institutional and commercial projects. Treated water is redirected to smart drip irrigation and cooling tower make-up, decreasing municipal potable water demand by up to 50% and safeguarding natural environmental resources for future generations.</p>
            `,
            ar: `
                <p>لم تعد الاستدامة البيئية مجرد خيار تكميلي في مشاريع المقاولات الحديثة، بل باتت التزاماً هندسياً وأخلاقياً أصيلاً. تتبنى <strong>شركة الهمام المتقدمة للمقاولات</strong> معايير الاستدامة الصارمة المعتمدة في نظام LEED العالمي ونظام <em>مستدام (Mostadam)</em> الوطني المعتمد بالمملكة، بما يدعم أهداف <strong>مبادرة السعودية الخضراء</strong> نحو الوصول إلى الحياد الصفري والانبعاثات المنخفضة.</p>

                <h3>أغلفة المباني عالية الأداء وخفض استهلاك الطاقة</h3>
                <p>في ظل الطبيعة المناخية للمنطقة وارتفاع درجات الحرارة صيفاً، يطور مهندسونا أغلفة إنشائية ومعمارية فائقة الكفاءة تعتمد على الجدران الستائرية ذات العزل الحراري المتقدم والزجاج المزدوج منخفض الانبعاثات (Low-E). يسهم هذا التصميم المتكامل، بالتوازي مع أنظمة التكييف الذكية ذات تدفق التبريد المتغير (VRF)، في خفض استهلاك الطاقة التشغيلية للمباني بنسبة تصل إلى 40% طوال دورة حياة المبنى.</p>

                <h3>الخرسانة الخضراء منخفضة الكربون والاقتصاد الدائري</h3>
                <p>نعمل في شركة الهمام المتقدمة على تقليل الكربون المدمج في الخرسانة عبر خلطات هندسية متطورة تستبدل جزءاً من الأسمنت التقليدي بمواد بوزولانية طبيعية وخبث الأفران المحبب (GGBS) وغبار السيليكا. كما نطبق بروتوكولات صارمة للاقتصاد الدائري في مواقع العمل، حيث يُفرز ويعاد تدوير أكثر من 80% من مخلفات البناء لاستخدامها في طبقات الأساس الطرقي والردم الهندسي.</p>

                <h3>ترشيد الموارد المائية وحلول الري الذكي</h3>
                <p>حرصاً على حماية الموارد المائية، تنفذ شركة الهمام المتقدمة محطات مدمجة لمعالجة المياه الرمادية وشبكات استرجاع مياه تكثيف التكييف في المشاريع الحكومية والتجارية والسكنية. يُعاد توجيه هذه المياه المعالجة لتغذية أبراج التبريد وأنظمة الري الذكي للمسطحات الخضراء، مما يوفر ما يصل إلى 50% من استهلاك المياه العذبة ويترك أثراً بيئياً مستداماً تفخر به الأجيال القادمة.</p>
            `
        },
        image: 'https://images.unsplash.com/photo-1513694203232-719a280e022f?w=1200&q=85',
        gallery: [
            'https://images.unsplash.com/photo-1497366216548-37526070297c?w=800&q=80',
            'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=800&q=80',
            'https://images.unsplash.com/photo-1542601906990-b4d3fb778b09?w=800&q=80'
        ]
    },
    'news-gov': {
        title: { en: 'New Government Administrative Complex Contract', ar: 'عقد إنشاء المجمع الإداري الحكومي الجديد' },
        date: { en: 'February 15, 2026', ar: '15 فبراير 2026' },
        author: { en: 'Al Humam Press Office', ar: 'المكتب الإعلامي لشركة الهمام المتقدمة' },
        content: {
            en: `
                <p>Al Humam Advanced is proud to announce it has been awarded the prestigious EPC (Engineering, Procurement, and Construction) contract for the new Ministry Administrative Complex in Riyadh. This landmark project, valued at over 500 Million SAR, underscores our position as a tier-one contractor for critical government infrastructure and aligns with the Kingdom's rapid urban development.</p>
                <h3>Project Technical Specifications</h3>
                <p>The development spans a massive 150,000 square meter built-up area, comprising three high-rise administrative towers interconnected by a climate-controlled atrium. The structural design employs high-strength reinforced concrete with post-tensioned slab systems, allowing for expansive column-free office spaces that foster a collaborative work environment. The façade utilizes high-performance low-E double glazing with integrated shading devices to minimize solar gain while maximizing natural light.</p>
                <h3>Sustainability and Smart Systems</h3>
                <p>Targeting LEED Gold certification, the complex will feature a state-of-the-art Building Management System (BMS) integrating HVAC, lighting, and security systems for optimal energy efficiency. Advanced MEP solutions include a district cooling interface and a greywater recycling plant for landscape irrigation.</p>
                <h3>Execution Strategy</h3>
                <p>"This contract is a testament to our technical capability to deliver complex, multi-disciplinary projects on a fast-track schedule," stated Eng. Ahmed Al-Salem, CEO of Al Humam Advanced. "We are deploying Building Information Modeling (BIM) Level 2 protocols from day one to ensure zero-clash coordination between structural, architectural, and MEP disciplines." Mobilization of heavy equipment and site offices has commenced, with heavy civil works scheduled for next month.</p>
            `,
            ar: `
                <p>تعلن شركة الهمام المتقدمة بفخر عن فوزها بعقد "الهندسة والمشتريات والبناء" (EPC) المرموق لإنشاء المجمع الإداري الجديد للوزارة في الرياض. يؤكد هذا المشروع المعلمي، الذي تبلغ قيمته أكثر من 500 مليون ريال سعودي، مكانتنا كمقاول من الدرجة الأولى للبنية التحتية الحكومية الحيوية ويتماشى مع التطور الحضري المتسارع في المملكة.</p>
                <h3>المواصفات الفنية للمشروع</h3>
                <p>يمتد المشروع على مساحة بناء ضخمة تبلغ 150,000 متر مربع، ويضم ثلاثة أبراج إدارية شاهقة مترابطة بواسطة ردهة يتم التحكم في مناخها. يستخدم التصميم الإنشائي الخرسانة المسلحة عالية القوة مع أنظمة البلاطات سابقة الإجهاد (Post-Tensioned)، مما يسمح بمساحات مكتبية واسعة خالية من الأعمدة تعزز بيئة العمل التعاونية. تستخدم الواجهة زجاجاً مزدوجاً عالي الأداء منخفض الانبعاثية (Low-E) مع أجهزة تظليل مدمجة لتقليل الكسب الشمسي مع تعظيم الإضاءة الطبيعية.</p>
                <h3>الاستدامة والأنظمة الذكية</h3>
                <p>يستهدف المجمع الحصول على شهادة LEED الذهبية، وسيضم نظام إدارة مباني (BMS) متطور يدمج أنظمة التكييف والإضاءة والأمن لتحقيق كفاءة طاقة مثالية. تشمل حلول الهندسة الميكانيكية والكهربائية (MEP) المتقدمة ربطاً بتبريد المناطق ومحطة لإعادة تدوير المياه الرمادية لري المسطحات الخضراء.</p>
                <h3>استراتيجية التنفيذ</h3>
                <p>صرح المهندس أحمد السالم، الرئيس التنفيذي لشركة الهمام المتقدمة، قائلاً: "هذا العقد هو شهادة على قدرتنا الفنية على تسليم مشاريع معقدة ومتعددة التخصصات وفق جدول زمني سريع المسار". وأضاف: "نحن ننشر بروتوكولات نمذجة معلومات البناء (BIM) من المستوى الثاني منذ اليوم الأول لضمان تنسيق خالٍ من التعارضات بين التخصصات الإنشائية والمعمارية والميكانيكية والكهربائية". وقد بدأ حشد المعدات الثقيلة والمكاتب الموقعية، ومن المقرر البدء في الأعمال المدنية الثقيلة الشهر المقبل.</p>
            `
        },
        image: 'https://images.unsplash.com/photo-1541888946425-d81bb19240f5?w=1200&q=85'
    },
    'news-green': {
        title: { en: 'Launching "Green Horizon 2030" Initiative', ar: 'إطلاق مبادرة "الأفق الأخضر 2030"' },
        date: { en: 'January 10, 2026', ar: '10 يناير 2026' },
        author: { en: 'Al Humam Sustainability Team', ar: 'فريق الاستدامة في الهمام المتقدمة' },
        content: {
            en: `
                <p>Reinforcing our commitment to environmental stewardship and corporate social responsibility (CSR), Al Humam Advanced has officially launched "Green Horizon 2030", a comprehensive decarbonization roadmap aimed at achieving net-zero carbon emissions across scope 1 and 2 operations by 2030.</p>
                <h3>Integration of Renewable Energy</h3>
                <p>A cornerstone of this initiative is the transition to hybrid power solutions on construction sites. We are replacing conventional diesel generators with solar-hybrid, battery energy storage systems (BESS), projected to reduce site fuel consumption by 40%. Additionally, all our permanent facilities will be retrofitted with rooftop Solar PV arrays ensuring 100% renewable energy coverage for administrative operations.</p>
                <h3>Circular Economy in Construction</h3>
                <p>The initiative mandates rigorous Waste Management Plans (WMP) for all projects, targeting a 90% diversion rate from landfills. This involves on-site segregation of steel, wood, and concrete, with concrete waste being crushed and reused as aggregate for sub-base layers. We are also partnering with material suppliers to implement "Material Passports" for better tracking of embodied carbon.</p>
                <h3>Strategic Alignment</h3>
                <p>Dr. Sarah Al-Amri, Head of Sustainability, emphasized: "Green Horizon 2030 is not just compliance; it is innovation. By adopting Modular Construction techniques and Digital Twinning, we are minimizing material wastage at the design stage." This bold step aligns perfectly with the Saudi Green Initiative and National Vision 2030 goals.</p>
            `,
            ar: `
                <p>تعزيزاً لالتزامنا بالإشراف البيئي والمسؤولية الاجتماعية للشركات (CSR)، أطلقت شركة الهمام المتقدمة رسمياً مبادرة "الأفق الأخضر 2030"، وهي خارطة طريق شاملة لإزالة الكربون تهدف إلى تحقيق صافي انبعاثات كربونية صفرية عبر عمليات النطاق 1 و 2 بحلول عام 2030.</p>
                <h3>تكامل الطاقة المتجددة</h3>
                <p>حجر الزاوية في هذه المبادرة هو الانتقال إلى حلول الطاقة الهجينة في مواقع البناء. نحن نستبدل مولدات الديزل التقليدية بأنظمة هجينة تعمل بالطاقة الشمسية وتخزين طاقة البطاريات (BESS)، والتي من المتوقع أن تقلل من استهلاك الوقود في الموقع بنسبة 40%. بالإضافة إلى ذلك، سيتم تحديث جميع منشآتنا الدائمة بألواح الطاقة الشمسية الكهروضوئية على الأسطح لضمان تغطية الطاقة المتجددة بنسبة 100% للعمليات الإدارية.</p>
                <h3>الاقتصاد الدائري في البناء</h3>
                <p>تفرض المبادرة خطط إدارة نفايات (WMP) صارمة لجميع المشاريع، مستهدفة معدل تحويل بنسبة 90% بعيداً عن مدافن النفايات. يتضمن ذلك الفرز في الموقع للصلب والخشب والخرسانة، مع سحق نفايات الخرسانة وإعادة استخدامها كركام لطبقات الأساس. نحن نتشارك أيضاً مع موردي المواد لتنفيذ "جوازات سفر المواد" لتتبع أفضل للكربون المتجسد.</p>
                <h3>التوافق الاستراتيجي</h3>
                <p>أكدت الدكتورة سارة العمري، رئيسة قسم الاستدامة: "الأفق الأخضر 2030 ليس مجرد امتثال؛ إنه ابتكار. من خلال اعتماد تقنيات البناء المعياري والتوأمة الرقمية (Digital Twinning)، نقوم بتقليل هدر المواد في مرحلة التصميم". تتوافق هذه الخطوة الجريئة تماماً مع مبادرة السعودية الخضراء وأهداف الرؤية الوطنية 2030.</p>
            `
        },
        image: 'https://images.unsplash.com/photo-1473341304170-971dccb5ac1e?w=1200&q=85'
    },
    'news-safety': {
        title: { en: 'Annual Safety Excellence Award Winner', ar: 'الفائز بجائزة التميز السنوية في السلامة' },
        date: { en: 'December 05, 2025', ar: '05 ديسمبر 2025' },
        author: { en: 'Al Humam HSE Department', ar: 'قسم الصحة والسلامة في الهمام المتقدمة' },
        content: {
            en: `
                <p>We are honored to announce that Al Humam Advanced has achieved the prestigious ISO 45001:2018 certification and received the "Annual Safety Excellence Award" from the Regional Construction Safety Council. This accolade recognizes our outstanding safety metrics, achieving a Total Recordable Incident Rate (TRIR) of 0.05, significantly below the industry average.</p>
                <h3>5 Million Safe Man-Hours</h3>
                <p>The award celebrates our achievement of 5 Million Safe Man-Hours without a Lost Time Injury (LTI) across our mega-projects portfolio. This milestone validates the effectiveness of our "Vision Zero" strategy, which prioritizes the elimination of fatal and serious incidents through rigorous risk assessment and mitigation hierarchies.</p>
                <h3>Technology-Driven Safety</h3>
                <p>Al Humam Advanced has pioneered the use of IoT-enabled Smart Helmets that monitor worker vitals and environmental conditions (heat stress, gas detection) in real-time. Furthermore, we implemented AI-powered video analytics for site surveillance, ensuring 100% compliance with PPE protocols and early detection of unauthorized zone entries.</p>
                <h3>Continuous Training</h3>
                <p>Our dedicated HSE department delivered over 50,000 hours of specialized training this year, including VR-based hazard simulation sessions. "Safety is not just a priority; it is a core value embedded in our DNA," remarked the HSE Director. We dedicate this award to our workforce, whose vigilance makes Al Humam Advanced the safest contractor in the region.</p>
            `,
            ar: `
                <p>نتشرف بالإعلان عن حصول شركة الهمام المتقدمة على شهادة ISO 45001:2018 المرموقة وحصولها على "جائزة التميز السنوية في السلامة" من مجلس سلامة البناء الإقليمي. يكرّم هذا الوسام مقاييس السلامة المتميزة لدينا، حيث حققنا معدل إجمالي للحوادث المسجلة (TRIR) يبلغ 0.05، وهو أقل بكثير من متوسط الصناعة.</p>
                <h3>5 ملايين ساعة عمل آمنة</h3>
                <p>تحتفي الجائزة بتحقيقنا لـ 5 ملايين ساعة عمل آمنة بدون إصابة عمل مضيعة للوقت (LTI) عبر محفظة مشاريعنا الكبرى. يؤكد هذا الإنجاز فعالية استراتيجية "الرؤية صفر" (Vision Zero) الخاصة بنا، والتي تعطي الأولوية للقضاء على الحوادث المميتة والخطيرة من خلال تقييم المخاطر الصارم وتسلسل هرمي للتخفيف.</p>
                <h3>السلامة المدعومة بالتكنولوجيا</h3>
                <p>رادت شركة الهمام المتقدمة استخدام الخوذات الذكية المدعومة بإنترنت الأشياء (IoT) التي تراقب المؤشرات الحيوية للعمال والظروف البيئية (الإجهاد الحراري، الكشف عن الغاز) في الوقت الفعلي. علاوة على ذلك، قمنا بتنفيذ تحليلات الفيديو المدعومة بالذكاء الاصطناعي لمراقبة الموقع، مما يضمن الامتثال بنسبة 100% لبروتوكولات معدات الوقاية الشخصية والاكتشاف المبكر لدخول المناطق غير المصرح بها.</p>
                <h3>التدريب المستمر</h3>
                <p>قدم قسم الصحة والسلامة والبيئة (HSE) المخصص لدينا أكثر من 50,000 ساعة من التدريب المتخصص هذا العام، بما في ذلك جلسات محاكاة المخاطر القائمة على الواقع الافتراضي (VR). وعلق مدير الصحة والسلامة والبيئة قائلاً: "السلامة ليست مجرد أولوية؛ إنها قيمة أساسية متأصلة في حمضنا النووي". نهدي هذه الجائزة لقوتنا العاملة، التي تجعل يقظتها من الهمام المتقدمة المقاول الأكثر أماناً في المنطقة.</p>
            `
        },
        image: 'https://images.unsplash.com/photo-1504307651254-35680f356dfd?w=1200&q=85'
    },
    'project-ministry': {
        title: { en: 'Ministry Headquarters Complex', ar: 'مجمع مقر الوزارة' },
        date: { en: 'Riyadh, KSA', ar: 'الرياض، المملكة العربية السعودية' },
        author: { en: 'Government Sector', ar: 'القطاع الحكومي' },
        content: {
            en: `
                <p>The Ministry Headquarters Complex stands as a beacon of modern administrative architecture in the heart of Riyadh. Spanning 40,000 square meters, this facility is designed to optimize government operations through intelligent spatial planning and state-of-the-art infrastructure.</p>
                <h3>Design Philosophy</h3>
                <p>The architectural concept merges traditional Najdi elements with contemporary glass façades, symbolizing the harmony between heritage and future vision. The central atrium serves as a natural light well, reducing energy consumption by 30%.</p>
                <h3>Smart Infrastructure</h3>
                <p>Equipped with a Tier-3 Data Center and an integrated Building Management System (BMS), the complex ensures seamless connectivity and operational efficiency. Security is paramount, featuring advanced biometric access control and AI-driven surveillance systems.</p>
            `,
            ar: `
                <p>يقف مجمع مقر الوزارة كمنارة للعمارة الإدارية الحديثة في قلب الرياض. يمتد هذا المرفق على مساحة 40,000 متر مربع، وقد تم تصميمه لتحسين العمليات الحكومية من خلال التخطيط المكاني الذكي والبنية التحتية الحديثة.</p>
                <h3>فلسفة التصميم</h3>
                <p>يدمج المفهوم المعماري بين العناصر النجدية التقليدية والواجهات الزجاجية المعاصرة، مما يرمز إلى الانسجام بين التراث والرؤية المستقبلية. تعمل الردهة المركزية كبئر ضوء طبيعي، مما يقلل من استهلاك الطاقة بنسبة 30%.</p>
                <h3>بنية تحتية ذكية</h3>
                <p>المجمع مجهز بمركز بيانات من المستوى 3 ونظام إدارة مباني متكامل (BMS)، مما يضمن اتصالاً سلساً وكفاءة تشغيلية. الأمن هو الأهم، حيث يتميز بتحكم متقدم في الوصول البيومتري وأنظمة مراقبة مدعومة بالذكاء الاصطناعي.</p>
            `
        },
        image: '../images/project_gov.avif',
        gallery: [
            '../images/project_gov.avif',
            'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?w=800&q=80',
            'https://images.unsplash.com/photo-1577495508048-b635879837f1?w=800&q=80',
            'https://images.unsplash.com/photo-1503387762-592deb58ef4e?w=800&q=80'
        ]
    },
    'project-residential': {
        title: { en: 'Al Humam Residential Community', ar: 'مجتمع الهمام السكني' },
        date: { en: 'Jeddah, KSA', ar: 'جدة، المملكة العربية السعودية' },
        author: { en: 'Housing Sector', ar: 'قطاع الإسكان' },
        content: {
            en: `
                <p>A flagship mixed-use development comprising 1,200 premium housing units, designed to foster a vibrant community lifestyle. This project integrates residential towers with retail promenades, green parks, and recreational facilities.</p>
                <h3>Sustainable Living</h3>
                <p>The community features a district cooling system and solar-powered street lighting. Water conservation is achieved through a greywater recycling network for landscape irrigation, aligning with the Saudi Green Initiative.</p>
            `,
            ar: `
                <p>مشروع تطوير متعدد الاستخدامات رائد يضم 1,200 وحدة سكنية متميزة، مصمم لتعزيز نمط حياة مجتمعي نابض بالحياة. يدمج هذا المشروع الأبراج السكنية مع الممرات التجارية، والحدائق الخضراء، والمرافق الترفيهية.</p>
                <h3>المعيشة المستدامة</h3>
                <p>يتميز المجتمع بنظام تبريد المناطق وإضاءة الشوارع بالطاقة الشمسية. يتم تحقيق الحفاظ على المياه من خلال شبكة إعادة تدوير المياه الرمادية لري المناظر الطبيعية، مما يتماشى مع مبادرة السعودية الخضراء.</p>
            `
        },
        image: '../images/project_resid.avif',
        gallery: [
            '../images/project_resid.avif',
            'https://images.unsplash.com/photo-1545324418-cc1a3fa10c00?w=800&q=80',
            'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=800&q=80',
            'https://images.unsplash.com/photo-1600607687939-ce8a6c25118c?w=800&q=80'
        ]
    },
    'project-highway': {
        title: { en: 'Strategic Highway Expansion', ar: 'توسعة الطريق السريع الاستراتيجي' },
        date: { en: 'Eastern Province, KSA', ar: 'المنطقة الشرقية' },
        author: { en: 'Infrastructure', ar: 'البنية التحتية' },
        content: {
            en: `
                <p>Delivering 120km of expanded highway infrastructure connecting key industrial zones. The project involves complex interchanges, bridges, and smart traffic monitoring systems to enhance logistical flow.</p>
                <h3>Engineering Challenges</h3>
                <p>The project utilized advanced soil stabilization techniques to overcome challenging terrain. Pre-cast concrete segments were used for bridge construction to minimize traffic disruption during execution.</p>
            `,
            ar: `
                <p>تسليم 120 كم من البنية التحتية الموسعة للطرق السريعة التي تربط المناطق الصناعية الرئيسية. يتضمن المشروع تقاطعات معقدة وجسوراً وأنظمة مراقبة حركة المرور الذكية لتعزيز التدفق اللوجستي.</p>
                <h3>التحديات الهندسية</h3>
                <p>استخدم المشروع تقنيات متقدمة لتثبيت التربة للتغلب على التضاريس الصعبة. تم استخدام قطاعات خرسانية مسبقة الصب لبناء الجسور لتقليل تعطل حركة المرور أثناء التنفيذ.</p>
            `
        },
        image: '../images/project_infra.avif',
        gallery: [
            '../images/project_infra.avif',
            'https://images.unsplash.com/photo-1519817650390-64a93db51149?w=800&q=80',
            'https://images.unsplash.com/photo-1584463699042-4e4604930364?w=800&q=80'
        ]
    },
    'project-industrial': {
        title: { en: 'Industrial City Development', ar: 'تطوير المدينة الصناعية' },
        date: { en: 'Jubail, KSA', ar: 'الجبيل' },
        author: { en: 'Industrial Sector', ar: 'القطاع الصناعي' },
        content: {
            en: `
                <p>A comprehensive development of a 2 million square meter industrial park. Scope includes utility networks, road infrastructure, warehouses, and administrative support buildings designed for heavy industry tenants.</p>
                <h3>Operational Efficiency</h3>
                <p>The park features a dedicated high-voltage substation and a centralized wastewater treatment plant. Optimized logistical routes ensure smooth movement of heavy goods vehicles.</p>
            `,
            ar: `
                <p>تطوير شامل لمدينة صناعية مساحتها 2 مليون متر مربع. يشمل النطاق شبكات المرافق، والبنية التحتية للطرق، والمستودعات، ومباني الدعم الإداري المصممة لمستأجري الصناعات الثقيلة.</p>
                <h3>الكفاءة التشغيلية</h3>
                <p>تتميز الحديقة بمحطة فرعية مخصصة للجهد العالي ومحطة مركزية لمعالجة مياه الصرف الصحي. تضمن الطرق اللوجستية المحسنة حركة سلسة للمركبات الثقيلة.</p>
            `
        },
        image: '../images/project_indust.avif',
        gallery: [
            '../images/project_indust.avif',
            'https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=800&q=80',
            'https://images.unsplash.com/photo-1504917599217-d4dc5ebe6122?w=800&q=80'
        ]
    }
};

/* ==========================================
   ARTICLE PAGE INITIALIZATION
   ========================================== */
document.addEventListener('DOMContentLoaded', () => {
    const urlParams = new URLSearchParams(window.location.search);
    let id = urlParams.get('id');

    // Also detect id from static filename (e.g. article-bim.html -> 'bim')
    if (!id) {
        const pathname = window.location.pathname;
        const match = pathname.match(/article-([a-z0-9_-]+?)(?:\.html)?\/?$/i);
        if (match) id = match[1];
    }

    // Get language: prioritize user's choice in localStorage, then URL param, fallback to 'ar'
    const storedLang = localStorage.getItem('alhumam-lang') || localStorage.getItem('PALMIRA-lang');
    let lang = (storedLang === 'ar' || storedLang === 'en') ? storedLang : (urlParams.get('lang') || 'ar');
    localStorage.setItem('alhumam-lang', lang);

    // If this is a service article id, seamlessly redirect to services.html where the rich dynamic article lives
    const serviceIds = ['excavation', 'building', 'infrastructure', 'design', 'civil', 'mep', 'energy', 'facilities'];
    if (id && serviceIds.includes(id)) {
        window.location.replace(`service-${id}.html`);
        return;
    }

    if (id && articlesData[id]) {
        renderArticle(id, lang);
    } else {
        // FIX: Was targeting non-existent 'articleContent' — now uses correct 'articleBody'
        const articleBody = document.getElementById('articleBody');
        if (articleBody && (!articleBody.children || articleBody.children.length === 0 || !articleBody.textContent.trim())) {
            articleBody.innerHTML = '<p style="text-align:center; padding:50px;">Article not found.</p>';
        }
    }

    // Listen for language changes dispatched by script.js
    const onLangChange = (e) => {
        lang = e.detail.lang;
        if (id && articlesData[id]) {
            renderArticle(id, lang);
        }
    };
    document.addEventListener('alhumam-lang-change', onLangChange);
    document.addEventListener('palmira-lang-change', onLangChange);
});

/* ==========================================
   RENDER ARTICLE
   ========================================== */
function resolveAssetPath(src) {
    if (!src) return '';
    if (src.startsWith('http://') || src.startsWith('https://') || src.startsWith('data:')) {
        return src;
    }
    const pathLower = window.location.pathname.toLowerCase();
    const isSubDir = pathLower.includes('/pages/') || pathLower.includes('\\pages\\') ||
                     pathLower.includes('/en/') || pathLower.includes('\\en\\');
    
    // Clean leading ../ if already present
    const cleanSrc = src.replace(/^\.\.\//, '');
    return isSubDir ? '../' + cleanSrc : cleanSrc;
}

function renderArticle(id, lang) {
    const data = articlesData[id];
    if (!data) return;

    // Update hero background — only override CSS default if the image loads successfully
    const articleHero = document.querySelector('.article-hero');
    if (articleHero && data.image) {
        const preload = new Image();
        preload.onload = () => {
            articleHero.style.backgroundImage = `linear-gradient(rgba(0,0,0,0.5), rgba(0,0,0,0.75)), url('${resolveAssetPath(data.image)}')`;
            articleHero.style.backgroundSize = 'cover';
            articleHero.style.backgroundPosition = 'center';
        };
        preload.src = resolveAssetPath(data.image);
    }

    // Update content safely
    const titleEl = document.getElementById('articleTitle');
    const dateEl = document.getElementById('articleDate');
    const authorEl = document.getElementById('articleAuthor');
    const bodyEl = document.getElementById('articleBody');

    if (titleEl) titleEl.textContent = data.title[lang];
    if (dateEl) dateEl.textContent = data.date[lang];
    if (authorEl) authorEl.textContent = data.author[lang];
    if (bodyEl) bodyEl.innerHTML = data.content[lang];

    // Gallery rendering with Lightbox
    if (data.gallery && data.gallery.length > 0 && bodyEl) {
        const galleryTitle = lang === 'ar' ? 'معرض الصور' : 'Project Gallery';
        let galleryHTML = `
            <div class="gallery-section">
                <h3 class="gallery-title">${galleryTitle}</h3>
                <div class="gallery-grid">
        `;
        const pageTitle = (data.title && (data.title[lang] || data.title.ar)) || 'شركة الهمام المتقدمة';
        data.gallery.forEach((img, index) => {
            const dynamicAlt = lang === 'ar'
                ? `${pageTitle} - توثيق الأعمال الإنشائية والميدانية (صورة ${index + 1}) - شركة الهمام المتقدمة`
                : `${pageTitle} - Construction & Engineering Documentation (Image ${index + 1}) - Al Humam Advanced`;
            galleryHTML += `
                <div class="gallery-item" data-gallery-index="${index}">
                    <img src="${resolveAssetPath(img)}" loading="lazy" alt="${dynamicAlt}">
                </div>
            `;
        });
        galleryHTML += '</div></div>';
        bodyEl.insertAdjacentHTML('beforeend', galleryHTML);

        // Create lightbox if it doesn't exist yet
        if (!document.getElementById('galleryLightbox')) {
            const lightboxHTML = `
                <div class="lightbox" id="galleryLightbox">
                    <div class="lightbox__overlay"></div>
                    <button class="lightbox__close" aria-label="Close">&times;</button>
                    <button class="lightbox__arrow lightbox__arrow--prev" aria-label="Previous">&#10094;</button>
                    <button class="lightbox__arrow lightbox__arrow--next" aria-label="Next">&#10095;</button>
                    <div class="lightbox__content">
                        <img src="" alt="Gallery Image" class="lightbox__img" id="lightboxImg">
                    </div>
                    <div class="lightbox__counter" id="lightboxCounter"></div>
                </div>
            `;
            document.body.insertAdjacentHTML('beforeend', lightboxHTML);

            const lightbox = document.getElementById('galleryLightbox');
            const lightboxImg = document.getElementById('lightboxImg');
            const lightboxCounter = document.getElementById('lightboxCounter');
            let currentIndex = 0;
            let galleryImages = [];

            function openLightbox(index, images) {
                galleryImages = images.map(resolveAssetPath);
                currentIndex = index;
                lightboxImg.src = galleryImages[currentIndex];
                lightboxCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
                lightbox.classList.add('active');
                document.body.style.overflow = 'hidden';
            }

            function closeLightbox() {
                lightbox.classList.remove('active');
                document.body.style.overflow = '';
            }

            function showImage(index) {
                if (index < 0) index = galleryImages.length - 1;
                if (index >= galleryImages.length) index = 0;
                currentIndex = index;
                lightboxImg.style.opacity = '0';
                setTimeout(() => {
                    lightboxImg.src = galleryImages[currentIndex];
                    lightboxImg.style.opacity = '1';
                    lightboxCounter.textContent = `${currentIndex + 1} / ${galleryImages.length}`;
                }, 200);
            }

            // Close
            lightbox.querySelector('.lightbox__close').addEventListener('click', closeLightbox);
            lightbox.querySelector('.lightbox__overlay').addEventListener('click', closeLightbox);

            // Navigation
            lightbox.querySelector('.lightbox__arrow--prev').addEventListener('click', () => showImage(currentIndex - 1));
            lightbox.querySelector('.lightbox__arrow--next').addEventListener('click', () => showImage(currentIndex + 1));

            // Keyboard
            document.addEventListener('keydown', (e) => {
                if (!lightbox.classList.contains('active')) return;
                if (e.key === 'Escape') closeLightbox();
                if (e.key === 'ArrowLeft') showImage(currentIndex - 1);
                if (e.key === 'ArrowRight') showImage(currentIndex + 1);
            });

            // Expose open function globally
            window.openGalleryLightbox = openLightbox;
        }

        // Attach click events to gallery items
        document.querySelectorAll('.gallery-item[data-gallery-index]').forEach(item => {
            item.addEventListener('click', () => {
                const index = parseInt(item.dataset.galleryIndex);
                window.openGalleryLightbox(index, data.gallery);
            });
        });
    }

    // Update page title
    document.title = `Al Humam Advanced | ${data.title[lang]}`;

    // Update direction (consistent with script.js behavior)
    document.documentElement.setAttribute('dir', lang === 'ar' ? 'rtl' : 'ltr');
    document.documentElement.setAttribute('lang', lang);

    // Update back button target and text based on article category
    const backBtn = document.querySelector('.article-back a');
    if (backBtn) {
        if (id.startsWith('project-')) {
            backBtn.href = 'projects.html';
            backBtn.setAttribute('data-en', 'BACK TO PROJECTS');
            backBtn.setAttribute('data-ar', 'العودة للمشاريع');
            backBtn.textContent = lang === 'ar' ? 'العودة للمشاريع' : 'BACK TO PROJECTS';
        } else if (id.startsWith('news-')) {
            backBtn.href = 'media.html';
            backBtn.setAttribute('data-en', 'BACK TO MEDIA CENTER');
            backBtn.setAttribute('data-ar', 'العودة للمركز الإعلامي');
            backBtn.textContent = lang === 'ar' ? 'العودة للمركز الإعلامي' : 'BACK TO MEDIA CENTER';
        } else {
            backBtn.href = 'innovation.html';
            backBtn.setAttribute('data-en', 'BACK TO INNOVATION');
            backBtn.setAttribute('data-ar', 'العودة للابتكار');
            backBtn.textContent = lang === 'ar' ? 'العودة للابتكار' : 'BACK TO INNOVATION';
        }
    }
}
