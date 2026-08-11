import { useState, useRef, useEffect } from 'react';
import { useLanguage } from '../context/LanguageContext';
import './LanguageDropdown.css';

export default function LanguageDropdown() {
  const { lang, setLang } = useLanguage();
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef(null);

  const langLabels = {
    fr: 'FR',
    en: 'EN',
    ar: 'العربية'
  };

  // Fermeture automatique lors d'un clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleSelect = (selectedLang) => {
    setLang(selectedLang);
    setIsOpen(false);
  };

  return (
    <div className="lang-dropdown-wrapper" ref={dropdownRef}>
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="lang-dropdown-trigger"
        title="Changer la langue / Select language"
      >
        <span style={{ fontSize: '1rem' }}>🌐</span>
        <span>{langLabels[lang] || 'FR'}</span>
      </button>

      {isOpen && (
        <div className="lang-dropdown-menu">
          <button
            type="button"
            className={`lang-dropdown-item ${lang === 'fr' ? 'active' : ''}`}
            onClick={() => handleSelect('fr')}
          >
            Français
          </button>
          <button
            type="button"
            className={`lang-dropdown-item ${lang === 'en' ? 'active' : ''}`}
            onClick={() => handleSelect('en')}
          >
            English
          </button>
          <button
            type="button"
            className={`lang-dropdown-item ${lang === 'ar' ? 'active' : ''}`}
            onClick={() => handleSelect('ar')}
          >
            العربية
          </button>
        </div>
      )}
    </div>
  );
}
