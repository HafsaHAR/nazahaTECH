import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/inpplc-logo.png';
import './AuthPage.css';

export default function Login() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
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
          <h1 className="hero-title">Ensemble pour la probité et la transparence.</h1>
          <p className="hero-description">
            La plateforme d'innovation citoyenne de l'Instance Nationale de la Probité, de la Prévention et de la Lutte contre la Corruption.
          </p>
        </div>

        <div className="hero-footer">
          © 2026 INPPLC — Royaume du Maroc
        </div>
      </div>

      {/* Formulaire Blanc Droit */}
      <div className="auth-form-wrapper">
        <div className="auth-form-card">
          <h2 className="form-title">Se connecter</h2>
          <p className="form-subtitle">Accédez à votre espace personnel.</p>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            <div className="form-group">
              <label htmlFor="email">Email</label>
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
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                value={password}
                onChange={(e) => { setPassword(e.target.value); setError(''); }}
                onBlur={() => handleBlur('password')}
                className={passwordError ? 'input-invalid' : ''}
                placeholder="Votre mot de passe"
                required
              />
              {passwordError && <span className="field-error">{passwordError}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Connexion en cours...' : 'Connexion'}
            </button>
          </form>

          <div className="auth-toggle">
            Pas encore de compte ?
            <Link to="/register" className="auth-toggle-link">
              S'inscrire
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
