import { useState } from 'react';
import axios from 'axios';
import logo from '../assets/inpplc-logo.png';
import './AuthPage.css';

export default function AuthPage() {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [successMsg, setSuccessMsg] = useState('');

  const handleChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
    setError('');
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');
    setSuccessMsg('');

    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/register';
    const payload = isLogin
      ? { email: formData.email, password: formData.password }
      : { name: formData.name, email: formData.email, password: formData.password };

    try {
      const response = await axios.post(endpoint, payload);
      if (isLogin) {
        setSuccessMsg('Connexion réussie ! Redirection...');
        if (response.data.token) {
          localStorage.setItem('token', response.data.token);
        }
      } else {
        setSuccessMsg('Compte créé avec succès ! Vous pouvez maintenant vous connecter.');
        setIsLogin(true);
        setFormData({ name: '', email: '', password: '' });
      }
    } catch (err) {
      const msg = err.response?.data?.message || 'Une erreur est survenue. Veuillez réanalyser vos identifiants.';
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setError('');
    setSuccessMsg('');
  };

  return (
    <div className="auth-container">
      {/* Panneau de Gauche (Hero Sombre) */}
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
          <h1 className="hero-title">
            {isLogin
              ? 'Ensemble pour la probité et la transparence.'
              : 'Rejoignez une communauté engagée pour la probité.'}
          </h1>
          <p className="hero-description">
            {isLogin
              ? "La plateforme d'innovation citoyenne de l'Instance Nationale de la Probité, de la Prévention et de la Lutte contre la Corruption."
              : 'Soumettez des idées, participez à des défis et contribuez à des institutions plus transparentes.'}
          </p>
        </div>

        <div className="hero-footer">
          © 2026 INPPLC — Royaume du Maroc
        </div>
      </div>

      {/* Panneau de Droite (Formulaire Blanc) */}
      <div className="auth-form-wrapper">
        <div className="auth-form-card">
          <h2 className="form-title">
            {isLogin ? 'Se connecter' : 'Créer un compte'}
          </h2>
          <p className="form-subtitle">
            {isLogin
              ? 'Accédez à votre espace personnel.'
              : 'Rejoignez la plateforme en quelques secondes.'}
          </p>

          {error && <div className="alert-error">{error}</div>}
          {successMsg && (
            <div className="alert-error" style={{ backgroundColor: '#f0fdf4', borderColor: '#bbf7d0', color: '#166534' }}>
              {successMsg}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            {!isLogin && (
              <div className="form-group">
                <label htmlFor="name">Nom complet</label>
                <input
                  type="text"
                  id="name"
                  name="name"
                  value={formData.name}
                  onChange={handleChange}
                  required={!isLogin}
                  placeholder=""
                />
              </div>
            )}

            <div className="form-group">
              <label htmlFor="email">Email</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                required
                placeholder=""
              />
            </div>

            <div className="form-group">
              <label htmlFor="password">Mot de passe</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                required
                placeholder=""
              />
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading
                ? 'Patientez...'
                : isLogin
                ? 'Connexion'
                : 'Créer mon compte'}
            </button>
          </form>

          <div className="auth-toggle">
            {isLogin ? (
              <>
                Pas encore de compte ?
                <button type="button" className="auth-toggle-link" onClick={toggleMode}>
                  S'inscrire
                </button>
              </>
            ) : (
              <>
                Déjà inscrit ?
                <button type="button" className="auth-toggle-link" onClick={toggleMode}>
                  Se connecter
                </button>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
