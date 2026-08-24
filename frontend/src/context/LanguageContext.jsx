import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  fr: {
    // Navigation & Sidebar
    'nav.dashboard': 'Tableau de bord',
    'nav.ideas': 'Idées',
    'nav.challenges': 'Défis',
    'nav.library': 'Bibliothèque',
    'nav.initiatives': 'Annuaire',
    'nav.profile': 'Profil',
    'nav.new_idea': 'Nouvelle idée',
    'nav.logout': 'Déconnexion',
    'nav.login': 'Se connecter',
    'nav.visitor': 'Visiteur',
    'nav.register': 'Créer un compte',

    // Topbar
    'topbar.search_placeholder': 'Rechercher des idées, défis, personnes...',
    'topbar.admin': 'Administrateur INPPLC',
    'topbar.member': 'Membre INPPLC',
    'topbar.guest': 'Visiteur (Non connecté)',

    // Actions & Buttons
    'action.vote': 'Voter',
    'action.voted': 'Voté',
    'action.comment': 'Commenter',
    'action.reply': 'Répondre',
    'action.like': 'J\'aime',
    'action.dislike': 'Je n\'aime pas',
    'action.bookmark': 'Sauvegarder',
    'action.bookmarked': 'Sauvegardé',
    'action.participate': 'Voir les défis',
    'action.submit_idea': 'Soumettre une idée',
    'action.create_challenge': 'Créer un Défi',
    'action.close': 'Fermer',
    'action.submit': 'Soumettre',
    'action.save': 'Enregistrer les modifications',
    'action.view_all': 'Voir tout',
    'action.download': '📥 Télécharger',
    'action.details': 'Voir la fiche →',
    'action.add_doc': '+ Ajouter un Document',
    'action.add_init': '+ Ajouter une Initiative',

    // Meta labels
    'meta.source': 'Source',
    'meta.size': 'Taille',
    'meta.published_on': 'Publié le',
    'meta.participants': 'participants',
    'meta.category': 'Catégorie',
    'meta.domain': 'Domaine',
    'meta.maturity': 'Maturité',
    'meta.country': 'Pays',

    // Dashboard Hero & Stats
    'dashboard.badge': 'Plateforme d\'innovation INPPLC',
    'dashboard.hero_title': 'Bienvenue sur l\'espace collaboratif',
    'dashboard.hero_sub': 'Proposez, débattez et faites avancer les idées qui renforcent la probité et la transparence au Maroc.',
    'dashboard.stat_ideas': 'Idées soumises',
    'dashboard.stat_challenges': 'Défis actifs',
    'dashboard.stat_votes': 'Votes cumulés',
    'dashboard.stat_contributions': 'Contributions ce mois',
    'dashboard.trending_title': '⚡ Idées populaires',
    'dashboard.trending_sub': 'Les propositions les plus votées cette semaine',

    // Ideas Page
    'ideas.title': '💡 Galerie des idées citoyennes',
    'ideas.sub': 'Découvrez, filtrez et votez pour les propositions d\'innovation citoyenne.',
    'ideas.search_ph': 'Rechercher une idée, un mot-clé...',
    'ideas.filter_all_cat': 'Toutes les catégories',
    'ideas.filter_all_status': 'Tous les statuts',
    'ideas.sort_newest': 'Plus récentes',
    'ideas.sort_popular': 'Plus populaires',

    // Challenges Page
    'challenges.title': '🏆 Défis d\'Innovation INPPLC',
    'challenges.sub': 'Relevez des défis stratégiques pour renforcer la probité et la transparence administrative au Maroc.',
    'challenges.search_ph': 'Rechercher un défi par mot-clé...',
    'challenges.status_active': '🟢 En cours',
    'challenges.status_closed': '🔴 Terminé',
    'challenges.participate_btn': '⚡ Participer au Défi',
    'challenges.view_submissions': '🎯 Soumissions des Participants',

    // Bibliothèque Page
    'library.title': '📚 Bibliothèque & Base Documentaire INPPLC',
    'library.sub': 'Consultez et téléchargez les textes juridiques, guides méthodologiques, normes et rapports de prévention contre la corruption.',
    'library.search_ph': 'Rechercher par mot-clé (ex: Loi 46-19, ISO 37001...)...',
    'library.type_all': 'Tous les documents',
    'library.type_lois': 'Lois',
    'library.type_guides': 'Guides',
    'library.type_rapports': 'Rapports',
    'library.type_normes': 'Normes',
    'library.type_modeles': 'Modèles',

    // Annuaire Page
    'initiatives.title': '📋 Annuaire des Initiatives Innovantes',
    'initiatives.sub': 'Explorez le répertoire des projets et bonnes pratiques de probité au Maroc et à l\'international.',
    'initiatives.search_ph': 'Rechercher une initiative, organisation ou ville...',

    // Profile Page
    'profile.title': 'Mon Profil',
    'profile.sub': 'Gérez vos informations personnelles et consultez votre historique d\'activité.',
    'profile.tab_my_ideas': '💡 Mes Idées Soumises',
    'profile.tab_my_challenges': '🎯 Mes Soumissions aux Défis',
    'profile.role_admin': 'Administrateur INPPLC',
    'profile.role_user': 'Citoyen / Participant',

    // Submit Idea Page
    'submit.title': '💡 Proposer une Nouvelle Idée',
    'submit.sub': 'Partagez votre solution pour renforcer la transparence et la probité.',
    'submit.form_title': 'Titre de l\'idée *',
    'submit.form_desc': 'Description détaillée *',
    'submit.form_category': 'Catégorie *',
    'submit.form_files': 'Pièces jointes & Documents (Optionnel)',
    'submit.btn_submit': '🚀 Publier l\'idée',

    // Login & Register Pages
    'login.title': 'Se connecter à NazahaTECH',
    'login.sub': 'Accédez à votre espace collaboratif d\'innovation INPPLC',
    'login.email': 'Adresse Email',
    'login.password': 'Mot de passe',
    'login.submit': 'Se connecter',
    'login.no_account': 'Pas encore de compte ?',
    'register.title': 'Créer un compte',
    'register.sub': 'Rejoignez la communauté d\'innovation pour la probité',
    'register.name': 'Nom complet',
    'register.first_name': 'Prénom',
    'register.last_name': 'Nom',
    'register.confirm_email': 'Confirmer l\'email',
    'register.phone': 'Numéro de téléphone',
    'register.password_ph': 'Au moins 6 caractères',
    'register.confirm_password': 'Confirmer le mot de passe',
    'register.submit': 'Créer mon compte',
    'register.has_account': 'Déjà un compte ?',

    // Guest prompts
    'guest.login_prompt': 'Veuillez vous connecter pour effectuer cette action.',
    'guest.login_btn': 'Se connecter pour continuer'
  },
  en: {
    // Navigation & Sidebar
    'nav.dashboard': 'Dashboard',
    'nav.ideas': 'Ideas',
    'nav.challenges': 'Challenges',
    'nav.library': 'Library',
    'nav.initiatives': 'Directory',
    'nav.profile': 'Profile',
    'nav.new_idea': 'New idea',
    'nav.logout': 'Logout',
    'nav.login': 'Sign in',
    'nav.visitor': 'Visitor',
    'nav.register': 'Create account',

    // Topbar
    'topbar.search_placeholder': 'Search ideas, challenges, people...',
    'topbar.admin': 'INPPLC Administrator',
    'topbar.member': 'INPPLC Member',
    'topbar.guest': 'Guest Visitor',

    // Actions & Buttons
    'action.vote': 'Vote',
    'action.voted': 'Voted',
    'action.comment': 'Comment',
    'action.reply': 'Reply',
    'action.like': 'Like',
    'action.dislike': 'Dislike',
    'action.bookmark': 'Save',
    'action.bookmarked': 'Saved',
    'action.participate': 'View challenges',
    'action.submit_idea': 'Submit an idea',
    'action.create_challenge': 'Create Challenge',
    'action.close': 'Close',
    'action.submit': 'Submit',
    'action.save': 'Save Changes',
    'action.view_all': 'View all',
    'action.download': '📥 Download',
    'action.details': 'View details →',
    'action.add_doc': '+ Add a Document',
    'action.add_init': '+ Add an Initiative',

    // Meta labels
    'meta.source': 'Source',
    'meta.size': 'Size',
    'meta.published_on': 'Published on',
    'meta.participants': 'participants',
    'meta.category': 'Category',
    'meta.domain': 'Domain',
    'meta.maturity': 'Maturity',
    'meta.country': 'Country',

    // Dashboard Hero & Stats
    'dashboard.badge': 'INPPLC innovation platform',
    'dashboard.hero_title': 'Welcome to the collaborative space',
    'dashboard.hero_sub': 'Share, debate and advance the ideas that strengthen integrity and transparency in Morocco.',
    'dashboard.stat_ideas': 'Ideas submitted',
    'dashboard.stat_challenges': 'Active challenges',
    'dashboard.stat_votes': 'Total votes',
    'dashboard.stat_contributions': 'Contributions this month',
    'dashboard.trending_title': '⚡ Trending ideas',
    'dashboard.trending_sub': 'Most voted this week',

    // Ideas Page
    'ideas.title': '💡 Citizen Ideas Gallery',
    'ideas.sub': 'Explore, filter and vote for citizen innovation proposals.',
    'ideas.search_ph': 'Search an idea, keyword...',
    'ideas.filter_all_cat': 'All categories',
    'ideas.filter_all_status': 'All statuses',
    'ideas.sort_newest': 'Most recent',
    'ideas.sort_popular': 'Most popular',

    // Challenges Page
    'challenges.title': '🏆 INPPLC Innovation Challenges',
    'challenges.sub': 'Take on strategic challenges to reinforce public governance and transparency.',
    'challenges.search_ph': 'Search a challenge by keyword...',
    'challenges.status_active': '🟢 Active',
    'challenges.status_closed': '🔴 Closed',
    'challenges.participate_btn': '⚡ Take Challenge',
    'challenges.view_submissions': '🎯 Participant Submissions',

    // Bibliothèque Page
    'library.title': '📚 INPPLC Library & Document Base',
    'library.sub': 'Consult and download legal texts, methodological guides, standards and corruption prevention reports.',
    'library.search_ph': 'Search by keyword (e.g. Law 46-19, ISO 37001...)...',
    'library.type_all': 'All documents',
    'library.type_lois': 'Laws',
    'library.type_guides': 'Guides',
    'library.type_rapports': 'Reports',
    'library.type_normes': 'Standards',
    'library.type_modeles': 'Templates',

    // Annuaire Page
    'initiatives.title': '📋 Innovative Initiatives Directory',
    'initiatives.sub': 'Explore the directory of integrity projects and best practices in Morocco and internationally.',
    'initiatives.search_ph': 'Search an initiative, organization or city...',

    // Profile Page
    'profile.title': 'My Profile',
    'profile.sub': 'Manage your personal details and view your activity history.',
    'profile.tab_my_ideas': '💡 My Submitted Ideas',
    'profile.tab_my_challenges': '🎯 My Challenge Submissions',
    'profile.role_admin': 'INPPLC Administrator',
    'profile.role_user': 'Citizen / Participant',

    // Submit Idea Page
    'submit.title': '💡 Submit a New Idea',
    'submit.sub': 'Share your solution to strengthen transparency and integrity.',
    'submit.form_title': 'Idea Title *',
    'submit.form_desc': 'Detailed Description *',
    'submit.form_category': 'Category *',
    'submit.form_files': 'Attachments & Documents (Optional)',
    'submit.btn_submit': '🚀 Publish Idea',

    // Login & Register Pages
    'login.title': 'Sign in to NazahaTECH',
    'login.sub': 'Access your INPPLC collaborative innovation space',
    'login.email': 'Email Address',
    'login.password': 'Password',
    'login.submit': 'Sign in',
    'login.no_account': 'Don\'t have an account?',
    'register.title': 'Create an Account',
    'register.sub': 'Join the innovation community for public integrity',
    'register.name': 'Full Name',
    'register.first_name': 'First Name',
    'register.last_name': 'Last Name',
    'register.confirm_email': 'Confirm Email',
    'register.phone': 'Phone Number',
    'register.password_ph': 'At least 6 characters',
    'register.confirm_password': 'Confirm Password',
    'register.submit': 'Create my account',
    'register.has_account': 'Already have an account?',

    // Guest prompts
    'guest.login_prompt': 'Please sign in to perform this action.',
    'guest.login_btn': 'Sign in to continue'
  },
  ar: {
    // Navigation & Sidebar
    'nav.dashboard': 'لوحة القيادة',
    'nav.ideas': 'الأفكار',
    'nav.challenges': 'التحديات',
    'nav.library': 'المكتبة',
    'nav.initiatives': 'دليل المبادرات',
    'nav.profile': 'الملف الشخصي',
    'nav.new_idea': 'فكرة جديدة',
    'nav.logout': 'تسجيل الخروج',
    'nav.login': 'تسجيل الدخول',
    'nav.visitor': 'زائر',
    'nav.register': 'إنشاء حساب',

    // Topbar
    'topbar.search_placeholder': 'ابحث عن أفكار، تحديات، أشخاص...',
    'topbar.admin': 'مشرف الهيئة الوطنية',
    'topbar.member': 'عضو الهيئة الوطنية',
    'topbar.guest': 'زائر (غير متصل)',

    // Actions & Buttons
    'action.vote': 'تصويت',
    'action.voted': 'تم التصويت',
    'action.comment': 'تعليق',
    'action.reply': 'رد',
    'action.like': 'إعجاب',
    'action.dislike': 'لم يعجبني',
    'action.bookmark': 'حفظ',
    'action.bookmarked': 'محفوظ',
    'action.participate': 'عرض التحديات',
    'action.submit_idea': 'إقتراح فكرة',
    'action.create_challenge': 'إنشاء تحدي',
    'action.close': 'إغلاق',
    'action.submit': 'إرسال',
    'action.save': 'حفظ التغييرات',
    'action.view_all': 'عرض الكل',
    'action.download': '📥 تحميل',
    'action.details': '← عرض البطاقة',
    'action.add_doc': '+ إضافة وثيقة',
    'action.add_init': '+ إضافة مبادرة',

    // Meta labels
    'meta.source': 'المصدر',
    'meta.size': 'الحجم',
    'meta.published_on': 'نُشر بتاريخ',
    'meta.participants': 'مشاركين',
    'meta.category': 'الفئة',
    'meta.domain': 'المجال',
    'meta.maturity': 'مستوى النضج',
    'meta.country': 'البلد',

    // Dashboard Hero & Stats
    'dashboard.badge': 'منصة الابتكار للهيئة الوطنية للنزاهة',
    'dashboard.hero_title': 'مرحباً بكم في الفضاء التشاركي',
    'dashboard.hero_sub': 'اقترحوا وناقشوا وطوروا الأفكار التي تعزز النزاهة والشفافية بالمغرب.',
    'dashboard.stat_ideas': 'الأفكار المقترحة',
    'dashboard.stat_challenges': 'التحديات النشطة',
    'dashboard.stat_votes': 'مجموع الأصوات',
    'dashboard.stat_contributions': 'المساهمات هذا الشهر',
    'dashboard.trending_title': '⚡ أفكار رائجة',
    'dashboard.trending_sub': 'الأكثر تصويتاً هذا الأسبوع',

    // Ideas Page
    'ideas.title': '💡 معرض الأفكار المواطنة',
    'ideas.sub': 'استكشف، تصفح وصوت على مقترحات الابتكار المواطنة.',
    'ideas.search_ph': 'البحث عن فكرة، كلمة مفتاحية...',
    'ideas.filter_all_cat': 'جميع الفئات',
    'ideas.filter_all_status': 'جميع الحالات',
    'ideas.sort_newest': 'الأحدث',
    'ideas.sort_popular': 'الأكثر شعبية',

    // Challenges Page
    'challenges.title': '🏆 تحديات الابتكار للهيئة',
    'challenges.sub': 'شارك في التحديات الاستراتيجية لتعزيز النزاهة والشفافية الإدارية.',
    'challenges.search_ph': 'البحث عن تحدي بالكلمة المفتاحية...',
    'challenges.status_active': '🟢 جارية',
    'challenges.status_closed': '🔴 منتهية',
    'challenges.participate_btn': '⚡ المشاركة في التحدي',
    'challenges.view_submissions': '🎯 مشاركات المتنافسين',

    // Bibliothèque Page
    'library.title': '📚 المكتبة والقاعدة المستندية للهيئة',
    'library.sub': 'اطّلع وقم بتحميل النصوص القانونية، الأدلة المنهجية، المعايير وتقارير الوقاية من الفساد.',
    'library.search_ph': 'البحث بالكلمة المفتاحية (مثال: قانون 46-19، أيزو 37001...)...',
    'library.type_all': 'جميع الوثائق',
    'library.type_lois': 'قوانين',
    'library.type_guides': 'أدلة',
    'library.type_rapports': 'تقارير',
    'library.type_normes': 'معايير',
    'library.type_modeles': 'نماذج',

    // Annuaire Page
    'initiatives.title': '📋 دليل المبادرات المبتكرة',
    'initiatives.sub': 'استكشف دليل المشاريع والممارسات الفضلى في مجال النزاهة بالمغرب ودولياً.',
    'initiatives.search_ph': 'البحث عن مبادرة، منظمة أو مدينة...',

    // Profile Page
    'profile.title': 'ملفي الشخصي',
    'profile.sub': 'إدارة معلوماتك الشخصية والاطلاع على سجل أنشطتك.',
    'profile.tab_my_ideas': '💡 الأفكار المقترحة',
    'profile.tab_my_challenges': '🎯 مشاركاتي في التحديات',
    'profile.role_admin': 'مشرف الهيئة الوطنية',
    'profile.role_user': 'مواطن / مشارك',

    // Submit Idea Page
    'submit.title': '💡 إقتراح فكرة جديدة',
    'submit.sub': 'شارك حلولك المبتكرة لتعزيز الشفافية والنزاهة الإدارية.',
    'submit.form_title': 'عنوان الفكرة *',
    'submit.form_desc': 'الوصف التفصيلي *',
    'submit.form_category': 'الفئة *',
    'submit.form_files': 'المرفقات والوثائق (اختياري)',
    'submit.btn_submit': '🚀 نشر الفكرة',

    // Login & Register Pages
    'login.title': 'تسجيل الدخول إلى نزاهة تيك',
    'login.sub': 'الولوج إلى فضاء الابتكار التشاركي للهيئة الوطنية',
    'login.email': 'البريد الإلكتروني',
    'login.password': 'كلمة المرور',
    'login.submit': 'تسجيل الدخول',
    'login.no_account': 'ليس لديك حساب بعد؟',
    'register.title': 'إنشاء حساب جديد',
    'register.sub': 'انضم إلى مجتمع الابتكار وتعزيز النزاهة',
    'register.name': 'الاسم الكامل',
    'register.first_name': 'الاسم الشخصي',
    'register.last_name': 'الاسم العائلي',
    'register.confirm_email': 'تأكيد البريد الإلكتروني',
    'register.phone': 'رقم الهاتف',
    'register.password_ph': '6 أحرف على الأقل',
    'register.confirm_password': 'تأكيد كلمة المرور',
    'register.submit': 'إنشاء الحساب',
    'register.has_account': 'لديك حساب بالفعل؟',

    // Guest prompts
    'guest.login_prompt': 'يرجى تسجيل الدخول للقيام بهذا الإجراء.',
    'guest.login_btn': 'تسجيل الدخول للمتابعة'
  }
};

// Dictionnaire dynamique de traduction automatique des contenus seédés en BDD (Titres, Descriptions, Sources, Filtres, Status)
const contentTranslations = {
  ar: {
    // Documents
    "Loi n° 46-19 relative à l'Instance Nationale de la Probité, de la Prévention et de la Lutte contre la Corruption": "القانون رقم 46-19 المتعلق بالهيئة الوطنية للنزاهة والوقاية من الفساد ومحاربته",
    "Cadre juridique fixant les attributions, l'organisation et les règles de fonctionnement de l'INPPLC au Maroc.": "الإطار القانوني المحدد لاختصاصات وتنظيم وقواعد سير الهيئة بالمملكة المغربية.",
    "Guide Pratique de Gestion des Risques de Corruption dans le Secteur Public": "الدليل العملي لإدارة مخاطر الفساد في القطاع العام",
    "Guide méthodologique à l'usage des administrations publiques pour la cartographie et l'atténuation des risques de probité.": "دليل منهجي موجه للإدارات العمومية لرسم خرائط المخاطر والحد منها.",
    "Rapport Annuel sur l'État de la Probité et la Lutte contre la Corruption au Maroc (2024)": "التقرير السنوي حول حالة النزاهة ومكافحة الفساد بالمغرب (2024)",
    "Analyse statistique globale, indicateurs de perception et bilan des actions de prévention menées au niveau national.": "تحليل إحصائي شامل، مؤشرات الإدراك وحصيلة برامج الوقاية الوطنية.",
    "Standard ISO 37001 — Système de Management Anti-Corruption (Présentation & Synthèse)": "معيار أيزو 37001 — نظام إدارة منع الرشوة والفساد (عرض وخلاصة)",
    "Synthèse des exigences de la norme internationale ISO 37001 pour la mise en place d'un dispositif de conformité d'entreprise.": "ملخص متطلبات المعيار الدولي ISO 37001 لإرساء آلية المطابقة بالمؤسسات.",
    "Modèle de Clause Contractuelle de Probité et d'Éthique pour les Marchés Publics": "نموذج بند التعاقد الخاص بالنزاهة والأخلاقيات في الصفقات العمومية",
    "Modèle de Clause Contractuelle de Probite et d'Éthique pour les Marchés Publics": "نموذج بند التعاقد الخاص بالنزاهة والأخلاقيات في الصفقات العمومية",
    "Modèle standardisé de clause anti-corruption à insérer dans les cahiers des charges et contrats d'approvisionnement.": "نموذج معياري لبند مكافحة الفساد يُدرج ضمن دفتر الشروط وعقود التوريد.",
    "Bulletin Officiel du Royaume du Maroc": "الجريدة الرسمية للمملكة المغربية",
    "INPPLC - Direction de la Prévention": "الهيئة الوطنية - مديرية الوقاية",
    "INPPLC Observatoire National": "الهيئة الوطنية - المرصد الوطني",
    "INPPLC Division Juridique": "الهيئة الوطنية - القسم القانوني",

    // Exact BDD Challenges (Match Screenshots)
    "Digitalisation des Marchés Publics Communaux": "رقمنة الصفقات العمومية للجماعات",
    "Concevoir une solution technologique innovante permettant de renforcer la transparence et le contrôle citoyen sur la passation et l'exécution des marchés publics au niveau local.": "تصميم حل تكنولوجي مبتكر لتعزيز الشفافية والرقابة المواطنة على إبرام وتنفيذ الصفقات العمومية على المستوى المحلي.",
    "Sensibilisation des Jeunes aux Valeurs de Probité": "ترسيخ قيم النزاهة لدى الشباب",
    "Créer un jeu sérieux ou une application éducative interactive visant à promouvoir l'éthique et la lutte contre la corruption auprès des étudiants et lycées.": "إنشاء لعبة تفاعلية أو تطبيق تعليمي لترسيخ الأخلاقيات ومحاربة الفساد لدى طلبة المدارس والجامعات.",
    "Créer un jeu sérieux ou une application éducative interactive visant à promouvoir l'éthique et la lutte contre la corruption auprès des étudiants et lycéens.": "إنشاء لعبة تفاعلية أو تطبيق تعليمي لترسيخ الأخلاقيات ومحاربة الفساد لدى طلبة المدارس والجامعات.",
    "Observatoire Ouvert du Signalement Éthique": "المرصد المفتوح للتبليغ الأخلاقي",
    "Proposer un mécanisme sécurisé, anonyme et crypté permettant aux citoyens et employés de signaler les manquements aux règles de probité administrative.": "اقترح آلية آمنة ومشفرة تسمح للمواطنين والموظفين بالتبليغ عن الخروقات لقواعد النزاهة الإدارية.",
    "Transparence des Budgets Participatifs": "شفافية الميزانيات التشاركية",
    "Développer une plateforme web permettant le suivi en temps réel de l'allocation des fonds publics participatifs dans les collectivités territoriales.": "تطوير منصة رقمية لتتبع تخصيص الأموال العمومية التشاركية بالجماعات الترابية في الوقت الفعلي.",
    "Audit Algorithmique des Subventions": "التدقيق الخوارزمي للدعم العمومي",
    "Développer une IA d audit automatique": "تطوير خوارزمية ذكاء اصطناعي للتدقيق التلقائي والدعم",
    "Développer une IA d'audit automatique des dossiers de subvention publique pour détecter les anomalies et doublons.": "تطوير خوارزمية ذكاء اصطناعي للتدقيق التلقائي في ملفات الدعم العمومي وكشف الاختلالات.",
    "Défi Admin Officiel": "التحدي الرسمي للهيئة",
    "Description officielle": "وصف التحدي الرسمي لتعزيز النزاهة والشفافية.",

    // Exact BDD Initiatives (Match Screenshots)
    "Chikaya.ma — Portail National des Réclamations Citoyennes": "شعاية.ما — البوابة الوطنية للشكايات",
    "Plateforme nationale unifiée permettant aux citoyens de soumettre, suivre et évaluer le traitement des réclamations auprès de l'ensemble des administrations publiques.": "منصة وطنية موحدة تمكن المواطنين من تقديم وتتبع وتقييم معالجة الشكايات لدى كافة الإدارات العمومية.",
    "Open Contracting Data Standard (OCDS) — Registre Public des Marchés": "بيانات الصفقات العمومية المفتوحة (OCDS) — السجل العمومي",
    "Implémentation du standard international d'open data sur la commande publique assurant la traçabilité complète des appels d'offres et l'analyse des risques d'entente.": "تطبيق المعيار الدولي للبيانات المفتوحة حول الصفقات العمومية لضمان الشفافية الكاملة وتحليل مخاطر التواطؤ.",
    "Programme Génération Probité & Clubs Citoyens Scolaires": "برنامج جيل النزاهة وأندية المواطنة المدرسية",
    "Initiative éducative créant des clubs d'éthique citoyenne dans les lycées pour sensibiliser les jeunes aux valeurs d'intégrité et de lutte contre le favoritisme.": "مبادرة تعليمية لإنشاء أندية النزاهة بالثانويات لتوعية الشباب بقيم الشفافية ومحاربة الزبونية.",
    "Algorithme d'IA pour la Détection des Anomalies de Déclaration de Patrimoine": "خوارزمية الذكاء الاصطناعي لكشف اختلالات التصريح بالممتلكات",
    "Prototype d'apprentissage automatique analysant les variations patrimoniales non justifiées et croisant les registres fonciers et fiscaux.": "نموذج أولى للذكاء الاصطناعي يحلل التغيرات غير المبررة في الممتلكات ويقاطع السجلات العقارية والضريبية.",
    "Ministère de la Transition Numérique et de la Réforme de l'Administration": "وزارة الانتقال الرقمي وإصلاح الإدارة",
    "Trésorerie Générale du Royaume (TGR) & INPPLC": "الخزينة العامة للمملكة والهيئة الوطنية",
    "ONG Transparency Maroc & Ministère de l'Éducation Nationale": "ترانسبرانسي المغرب ووزارة التربية الوطنية",
    "Laboratoire d'Innovation INPPLC Tech": "مختبر الابتكار للهيئة الوطنية",

    // Tags & Towns
    "Participation Citoyenne": "المشاركة المواطنة",
    "Data": "البيانات",
    "Casablanca": "الدار البيضاء",
    "Rabat": "الرباط",
    "Maroc": "المغرب",
    "International": "دولي",

    // Status Tabs & Filter pills
    "Tous les documents": "جميع الوثائق",
    "Tous les défis": "جميع التحديات",
    "Toutes les idées": "جميع الأفكار",
    "Ouverts": "🟢 مفتوحة",
    "En cours": "🟠 جارية",
    "Clôturés": "🔴 مغلقة",
    "Publiées": "🟢 منشورة",
    "En modération": "🟠 قيد المراجعة",
    "Déployé": "🟢 مُفعل",
    "POC / Prototype": "🟠 نموذج تجريبي",
    "Idée": "💡 فكرة",
    "Tous": "الكل",
    "Toutes": "الكل",
    "Lois": "قوانين",
    "Guides": "أدلة",
    "Rapports": "تقارير",
    "Normes": "معايير",
    "Modèles": "نماذج",
    "Prévention": "الوقاية",
    "Transparence": "الشفافية",
    "Digital": "الرقمي",
    "Éducation": "التعليم",
    "Audit": "التدقيق",
    "Control": "الرقابة"
  },
  en: {
    // Documents
    "Loi n° 46-19 relative à l'Instance Nationale de la Probité, de la Prévention et de la Lutte contre la Corruption": "Law No. 46-19 on the National Authority for Integrity, Prevention and Fighting Corruption",
    "Cadre juridique fixant les attributions, l'organisation et les règles de fonctionnement de l'INPPLC au Maroc.": "Legal framework establishing the mandates, organization and rules of operation of the INPPLC.",
    "Guide Pratique de Gestion des Risques de Corruption dans le Secteur Public": "Practical Guide to Corruption Risk Management in the Public Sector",
    "Guide méthodologique à l'usage des administrations publiques pour la cartographie et l'atténuation des risques de probité.": "Methodological guide for public administrations on mapping and mitigating integrity risks.",
    "Rapport Annuel sur l'État de la Probité et la Lutte contre la Corruption au Maroc (2024)": "Annual Report on the State of Integrity and Anti-Corruption in Morocco (2024)",
    "Analyse statistique globale, indicateurs de perception et bilan des actions de prévention menées au niveau national.": "Global statistical analysis, perception indicators and summary of national prevention actions.",
    "Standard ISO 37001 — Système de Management Anti-Corruption (Présentation & Synthèse)": "ISO 37001 Standard — Anti-Bribery Management System (Overview & Summary)",
    "Synthèse des exigences de la norme internationale ISO 37001 pour la mise en place d'un dispositif de conformité d'entreprise.": "Summary of international ISO 37001 requirements for implementing corporate compliance systems.",
    "Modèle de Clause Contractuelle de Probité et d'Éthique pour les Marchés Publics": "Model Contractual Integrity and Ethics Clause for Public Procurement",
    "Modèle de Clause Contractuelle de Probite et d'Éthique pour les Marchés Publics": "Model Contractual Integrity and Ethics Clause for Public Procurement",
    "Modèle standardisé de clause anti-corruption à insérer dans les cahiers des charges et contrats d'approvisionnement.": "Standardized anti-corruption clause model for inclusion in tender specifications and supply contracts.",
    "Bulletin Officiel du Royaume du Maroc": "Official Gazette of the Kingdom of Morocco",
    "INPPLC - Direction de la Prévention": "INPPLC - Prevention Directorate",
    "INPPLC Observatoire National": "INPPLC National Observatory",
    "INPPLC Division Juridique": "INPPLC Legal Division",

    // Exact BDD Challenges
    "Digitalisation des Marchés Publics Communaux": "Digitalization of Local Public Procurement",
    "Concevoir une solution technologique innovante permettant de renforcer la transparence et le contrôle citoyen sur la passation et l'exécution des marchés publics au niveau local.": "Design an innovative technological solution to enhance transparency and citizen oversight in public procurement.",
    "Sensibilisation des Jeunes aux Valeurs de Probité": "Youth Awareness on Integrity Values",
    "Créer un jeu sérieux ou une application éducative interactive visant à promouvoir l'éthique et la lutte contre la corruption auprès des étudiants et lycéens.": "Create a serious game or interactive educational app to promote ethics and anti-corruption among students.",
    "Observatoire Ouvert du Signalement Éthique": "Open Ethical Whistleblowing Observatory",
    "Proposer un mécanisme sécurisé, anonyme et crypté permettant aux citoyens et employés de signaler les manquements aux règles de probité administrative.": "Propose a secure, anonymous and encrypted mechanism allowing citizens to report integrity breaches.",
    "Transparence des Budgets Participatifs": "Transparency of Participatory Budgets",
    "Développer une plateforme web permettant le suivi en temps réel de l'allocation des fonds publics participatifs dans les collectivités territoriales.": "Develop a web platform allowing real-time tracking of participatory public funds in local authorities.",
    "Audit Algorithmique des Subventions": "Algorithmic Audit of Subsidies",
    "Développer une IA d audit automatique": "Develop an automated AI audit algorithm for subsidies",
    "Développer une IA d'audit automatique des dossiers de subvention publique pour détecter les anomalies et doublons.": "Develop an automated AI algorithm to audit public subsidy applications and detect anomalies.",
    "Défi Admin Officiel": "Official Admin Challenge",
    "Description officielle": "Official challenge description to reinforce public integrity.",

    // Exact BDD Initiatives
    "Chikaya.ma — Portail National des Réclamations Citoyennes": "Chikaya.ma — National Citizen Complaints Portal",
    "Plateforme nationale unifiée permettant aux citoyens de soumettre, suivre et évaluer le traitement des réclamations auprès de l'ensemble des administrations publiques.": "Unified national platform allowing citizens to submit, track and evaluate complaints across public administrations.",
    "Open Contracting Data Standard (OCDS) — Registre Public des Marchés": "Open Contracting Data Standard (OCDS) — Public Procurement Register",
    "Implémentation du standard international d'open data sur la commande publique assurant la traçabilité complète des appels d'offres et l'analyse des risques d'entente.": "Implementation of international open data standard on public procurement ensuring full bid traceability.",
    "Programme Génération Probité & Clubs Citoyens Scolaires": "Generation Integrity Program & School Citizen Clubs",
    "Initiative éducative créant des clubs d'éthique citoyenne dans les lycées pour sensibiliser les jeunes aux valeurs d'intégrité et de lutte contre le favoritisme.": "Educational initiative creating citizenship ethics clubs in high schools to raise youth awareness.",
    "Algorithme d'IA pour la Détection des Anomalies de Déclaration de Patrimoine": "AI Algorithm for Assets Declaration Anomaly Detection",
    "Prototype d'apprentissage automatique analysant les variations patrimoniales non justifiées et croisant les registres fonciers et fiscaux.": "Machine learning prototype analyzing unjustified asset variations and cross-checking land/tax registries.",
    "Ministère de la Transition Numérique et de la Réforme de l'Administration": "Ministry of Digital Transition and Administrative Reform",
    "Trésorerie Générale du Royaume (TGR) & INPPLC": "General Treasury of the Kingdom (TGR) & INPPLC",
    "ONG Transparency Maroc & Ministère de l'Éducation Nationale": "NGO Transparency Morocco & Ministry of National Education",
    "Laboratoire d'Innovation INPPLC Tech": "INPPLC Tech Innovation Lab",

    // Tags & Towns
    "Participation Citoyenne": "Citizen Participation",
    "Data": "Data",
    "Casablanca": "Casablanca",
    "Rabat": "Rabat",
    "Maroc": "Morocco",
    "International": "International",

    // Status Tabs & Filter pills
    "Tous les documents": "All documents",
    "Tous les défis": "All challenges",
    "Toutes les idées": "All ideas",
    "Ouverts": "🟢 Open",
    "En cours": "🟠 In progress",
    "Clôturés": "🔴 Closed",
    "Publiées": "🟢 Published",
    "En modération": "🟠 Pending moderation",
    "Déployé": "🟢 Deployed",
    "POC / Prototype": "🟠 Prototype",
    "Idée": "💡 Idea",
    "Tous": "All",
    "Toutes": "All",
    "Lois": "Laws",
    "Guides": "Guides",
    "Rapports": "Reports",
    "Normes": "Standards",
    "Modèles": "Templates",
    "Prévention": "Prevention",
    "Transparence": "Transparency",
    "Digital": "Digital",
    "Éducation": "Education",
    "Audit": "Audit",
    "Control": "Control"
  }
};

export function LanguageProvider({ children }) {
  const [lang, setLang] = useState(() => {
    return localStorage.getItem('nazahatech_lang') || 'fr';
  });

  useEffect(() => {
    localStorage.setItem('nazahatech_lang', lang);
    document.documentElement.lang = lang;
    document.documentElement.dir = lang === 'ar' ? 'rtl' : 'ltr';
  }, [lang]);

  const t = (key) => {
    return translations[lang]?.[key] || translations.fr?.[key] || key;
  };

  // Helper de traduction universelle pour le contenu dynamique (Titres BDD, Descriptions, Types, Sources, Status Tabs, Filter Pills)
  const translateText = (text) => {
    if (!text || typeof text !== 'string') return text;
    if (lang === 'fr') return text;
    const cleanText = text.trim();
    return contentTranslations[lang]?.[cleanText] || contentTranslations[lang]?.[text] || text;
  };

  return (
    <LanguageContext.Provider value={{ lang, setLang, t, translateText }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
