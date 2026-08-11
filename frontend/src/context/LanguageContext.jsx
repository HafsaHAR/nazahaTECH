import { createContext, useContext, useState, useEffect } from 'react';

const LanguageContext = createContext();

const translations = {
  fr: {
    // Navigation
    'nav.dashboard': 'Tableau de bord',
    'nav.ideas': 'Idées',
    'nav.challenges': 'Défis',
    'nav.profile': 'Profil',
    'nav.new_idea': 'Nouvelle idée',
    'nav.logout': 'Déconnexion',
    'nav.login': 'Se connecter',

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
    'action.save': 'Enregistrer',
    'action.view_all': 'Voir tout',

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

    // Challenges Page
    'challenges.title': '🏆 Défis d\'Innovation INPPLC',
    'challenges.sub': 'Relevez des défis stratégiques pour renforcer la probité et la transparence administrative au Maroc.',

    // Profile Page
    'profile.title': 'Mon Profil',
    'profile.sub': 'Gérez vos informations personnelles et consultez votre historique d\'activité.',

    // Guest prompts
    'guest.login_prompt': 'Veuillez vous connecter pour effectuer cette action.',
    'guest.login_btn': 'Se connecter pour continuer'
  },
  en: {
    // Navigation
    'nav.dashboard': 'Dashboard',
    'nav.ideas': 'Ideas',
    'nav.challenges': 'Challenges',
    'nav.profile': 'Profile',
    'nav.new_idea': 'New idea',
    'nav.logout': 'Logout',
    'nav.login': 'Sign in',

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

    // Challenges Page
    'challenges.title': '🏆 INPPLC Innovation Challenges',
    'challenges.sub': 'Take on strategic challenges to reinforce public governance and transparency.',

    // Profile Page
    'profile.title': 'My Profile',
    'profile.sub': 'Manage your personal details and view your activity history.',

    // Guest prompts
    'guest.login_prompt': 'Please sign in to perform this action.',
    'guest.login_btn': 'Sign in to continue'
  },
  ar: {
    // Navigation
    'nav.dashboard': 'لوحة القيادة',
    'nav.ideas': 'الأفكار',
    'nav.challenges': 'التحديات',
    'nav.profile': 'الملف الشخصي',
    'nav.new_idea': 'فكرة جديدة',
    'nav.logout': 'تسجيل الخروج',
    'nav.login': 'تسجيل الدخول',

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

    // Challenges Page
    'challenges.title': '🏆 تحديات الابتكار للهيئة',
    'challenges.sub': 'شارك في التحديات الاستراتيجية لتعزيز النزاهة والشفافية الإدارية.',

    // Profile Page
    'profile.title': 'ملفي الشخصي',
    'profile.sub': 'إدارة معلوماتك الشخصية والاطلاع على سجل أنشطتك.',

    // Guest prompts
    'guest.login_prompt': 'يرجى تسجيل الدخول للقيام بهذا الإجراء.',
    'guest.login_btn': 'تسجيل الدخول للمتابعة'
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

  return (
    <LanguageContext.Provider value={{ lang, setLang, t }}>
      {children}
    </LanguageContext.Provider>
  );
}

export const useLanguage = () => useContext(LanguageContext);
