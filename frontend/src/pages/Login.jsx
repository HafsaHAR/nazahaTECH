import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useLanguage } from '../context/LanguageContext';
import { Link, useNavigate } from 'react-router-dom';
import LanguageDropdown from '../components/LanguageDropdown';
import logo from '../assets/inpplc-logo.png';
import './AuthPage.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const { t } = useLanguage();
  const navigate = useNavigate();

  const handleBlur = (field) => {
    setTouched((prev) => ({ ...prev, [field]: true }));
  };

  const emailError = touched.email && !email ? 'L\'email est obligatoire.' : '';
  const passwordError = touched.password && !password ? 'Le mot de passe est obligatoire.' : '';

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ email: true, password: true });

    if (!email || !password) {
      setError('Veuillez saisir votre email et votre mot de passe.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await login({ email, password });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Identifiants invalides ou problème de connexion.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="auth-container">
      {/* Hero Sombre Gauche */}
      <div className="auth-hero">
        <div className="hero-header">
          <div className="logo-badge">
            <img src={logo} alt="INPPLC Logo" />
          </div>
          <div className="brand-text">
            <span className="brand-name">INPPLC</span>
            <span className="brand-sub">Innovation Hub</span>
          </div>
        </div>

        <div className="hero-body">
          <h1 className="hero-title">{t('dashboard.hero_title')}</h1>
          <p className="hero-description">
            {t('dashboard.hero_sub')}
          </p>
        </div>

        <div className="hero-footer">
          © 2026 INPPLC — Royaume du Maroc
        </div>
      </div>

      {/* Formulaire Blanc Droit avec Sélecteur de Langue */}
      <div className="auth-form-wrapper">
        <div style={{ position: 'absolute', top: '1.5rem', right: '1.5rem', zIndex: 10 }}>
          <LanguageDropdown />
        </div>

        <div className="auth-form-card">
          <h2 className="form-title">{t('login.title')}</h2>
          <p className="form-subtitle">{t('login.sub')}</p>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">{t('login.email')} *</label>
              <input
                type="email"
                id="email"
                value={email}
                onChange={(e) => { setEmail(e.target.value); setError(''); }}
                onBlur={() => handleBlur('email')}
                className={emailError ? 'input-invalid' : ''}
                placeholder="exemple@domaine.ma"
                required
              />
              {emailError && <span className="field-error">{emailError}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="password">{t('login.password')} *</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onBlur={() => handleBlur('password')}
                className={passwordError ? 'input-invalid' : ''}
                placeholder="••••••••"
                required
              />
              {passwordError && <span className="field-error">{passwordError}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Connexion...' : t('login.submit')}
            </button>
          </form>

          <div className="auth-toggle">
            {t('login.no_account')}{' '}
            <Link to="/register" className="auth-toggle-link">
              {t('nav.register')}
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
