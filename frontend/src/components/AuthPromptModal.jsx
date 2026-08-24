import { Link } from 'react-router-dom';
import { useLanguage } from '../context/LanguageContext';
import './AuthPromptModal.css';

export default function AuthPromptModal({ isOpen, onClose, actionName = '' }) {
  const { t } = useLanguage();

  if (!isOpen) return null;

  return (
    <div className="auth-modal-overlay" onClick={onClose}>
      <div className="auth-modal-content" onClick={(e) => e.stopPropagation()}>
        <button type="button" className="auth-modal-close-btn" onClick={onClose} title={t('action.close')}>
          ✕
        </button>

        <div className="auth-modal-icon">
          🔐
        </div>

        <h3 className="auth-modal-title">
          {t('guest.login_btn')}
        </h3>

        <p className="auth-modal-text">
          {t('guest.login_prompt')}
        </p>

        <div className="auth-modal-buttons">
          <Link to="/login" className="btn-modal-login" onClick={onClose}>
            {t('nav.login')}
          </Link>
          <Link to="/register" className="btn-modal-register" onClick={onClose}>
            {t('nav.register')}
          </Link>
        </div>
      </div>
    </div>
  );
}
