import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './AuthPromptModal.css';

export default function AuthPromptModal({ isOpen, onClose, actionName = '' }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auth-modal-close-btn" onClick={onClose} title="Fermer">
          ✕
        </button>

        <div className="auth-modal-icon">
          🔐
        </div>

        <h3 className="auth-modal-title">
          Connexion requise
        </h3>

        <p className="auth-modal-text">
          {actionName
            ? `Pour ${actionName} sur NazahaTECH, veuillez vous connecter ou créer un compte citoyen.`
            : 'Veuillez vous connecter à votre compte citoyen ou créer un compte pour participer.'}
        </p>

        <div className="auth-modal-buttons">
          <Link to="/login" className="btn-modal-login" onClick={onClose}>
            {t('nav.login')}
          </Link>
          <Link to="/register" className="btn-modal-register" onClick={onClose}>
            Créer un compte
          </Link>
        </div>
      </div>
    </div>
  );
}
