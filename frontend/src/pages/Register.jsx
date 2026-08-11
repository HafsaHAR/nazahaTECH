import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Link, useNavigate } from 'react-router-dom';
import logo from '../assets/inpplc-logo.png';
import './AuthPage.css';

export default function Register() {
  const [formData, setFormData] = useState({
    firstName: '',
    lastName: '',
    email: '',
    confirmEmail: '',
    phoneNumber: '',
    password: '',
    confirmPassword: ''
  });

  const [touched, setTouched] = useState({});
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { register } = useAuth();
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    setError('');
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched((prev) => ({ ...prev, [name]: true }));
  };

  // Validations en temps réel
  const errors = {};
  if (touched.firstName && !formData.firstName.trim()) {
    errors.firstName = 'Le prénom est obligatoire.';
  }
  if (touched.lastName && !formData.lastName.trim()) {
    errors.lastName = 'Le nom est obligatoire.';
  }
  if (touched.email && (!formData.email || !/^\S+@\S+\.\S+$/.test(formData.email))) {
    errors.email = 'Veuillez saisir une adresse email valide.';
  }
  if (touched.confirmEmail && formData.confirmEmail !== formData.email) {
    errors.confirmEmail = 'L\'adresse email de confirmation ne correspond pas.';
  }
  if (touched.password && formData.password.length < 6) {
    errors.password = 'Le mot de passe doit contenir au moins 6 caractères.';
  }
  if (touched.confirmPassword && formData.confirmPassword !== formData.password) {
    errors.confirmPassword = 'Le mot de passe de confirmation ne correspond pas.';
  }
  if (touched.phoneNumber && formData.phoneNumber && !/^[0-9+\s-]{8,15}$/.test(formData.phoneNumber)) {
    errors.phoneNumber = 'Format de téléphone invalide.';
  }

  const handleSubmit = async (e) => {
    e.preventDefault();

    // Marquer tous les champs comme touchés
    setTouched({
      firstName: true,
      lastName: true,
      email: true,
      confirmEmail: true,
      phoneNumber: true,
      password: true,
      confirmPassword: true
    });

    if (
      !formData.firstName.trim() ||
      !formData.lastName.trim() ||
      !formData.email.trim() ||
      formData.confirmEmail !== formData.email ||
      formData.password.length < 6 ||
      formData.confirmPassword !== formData.password
    ) {
      setError('Veuillez corriger les erreurs indiquées dans le formulaire.');
      return;
    }

    setLoading(true);
    setError('');

    try {
      await register({
        firstName: formData.firstName,
        lastName: formData.lastName,
        email: formData.email,
        confirmEmail: formData.confirmEmail,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        confirmPassword: formData.confirmPassword
      });
      navigate('/');
    } catch (err) {
      setError(err.response?.data?.message || 'Erreur lors de la création du compte.');
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
          <h1 className="hero-title">Rejoignez une communauté engagée pour la probité.</h1>
          <p className="hero-description">
            Soumettez des idées, participez à des défis et contribuez à des institutions plus transparentes.
          </p>
        </div>

        <div className="hero-footer">
          © 2026 INPPLC — Royaume du Maroc
        </div>
      </div>

      {/* Formulaire Blanc Droit */}
      <div className="auth-form-wrapper">
        <div className="auth-form-card">
          <h2 className="form-title">Créer un compte</h2>
          <p className="form-subtitle">Rejoignez la plateforme en quelques secondes.</p>

          {error && <div className="alert-error">{error}</div>}

          <form onSubmit={handleSubmit} noValidate>
            {/* Prénom et Nom */}
            <div className="form-row">
              <div className="form-group">
                <label htmlFor="firstName">Prénom *</label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.firstName ? 'input-invalid' : ''}
                  placeholder="Youssef"
                  required
                />
                {errors.firstName && <span className="field-error">{errors.firstName}</span>}
              </div>

              <div className="form-group">
                <label htmlFor="lastName">Nom *</label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  onBlur={handleBlur}
                  className={errors.lastName ? 'input-invalid' : ''}
                  placeholder="El Mansouri"
                  required
                />
                {errors.lastName && <span className="field-error">{errors.lastName}</span>}
              </div>
            </div>

            {/* Email et Confirmation Email */}
            <div className="form-group">
              <label htmlFor="email">Email *</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.email ? 'input-invalid' : ''}
                placeholder="exemple@domaine.ma"
                required
              />
              {errors.email && <span className="field-error">{errors.email}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmEmail">Confirmer l'email *</label>
              <input
                type="email"
                id="confirmEmail"
                name="confirmEmail"
                value={formData.confirmEmail}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.confirmEmail ? 'input-invalid' : ''}
                placeholder="exemple@domaine.ma"
                required
              />
              {errors.confirmEmail && <span className="field-error">{errors.confirmEmail}</span>}
            </div>

            {/* Téléphone */}
            <div className="form-group">
              <label htmlFor="phoneNumber">Numéro de téléphone</label>
              <input
                type="tel"
                id="phoneNumber"
                name="phoneNumber"
                value={formData.phoneNumber}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.phoneNumber ? 'input-invalid' : ''}
                placeholder="0661234567"
              />
              {errors.phoneNumber && <span className="field-error">{errors.phoneNumber}</span>}
            </div>

            {/* Mot de passe et Confirmation */}
            <div className="form-group">
              <label htmlFor="password">Mot de passe *</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.password ? 'input-invalid' : ''}
                placeholder="Au moins 6 caractères"
                required
              />
              {errors.password && <span className="field-error">{errors.password}</span>}
            </div>

            <div className="form-group">
              <label htmlFor="confirmPassword">Confirmer le mot de passe *</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                onBlur={handleBlur}
                className={errors.confirmPassword ? 'input-invalid' : ''}
                placeholder="Répétez votre mot de passe"
                required
              />
              {errors.confirmPassword && <span className="field-error">{errors.confirmPassword}</span>}
            </div>

            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Création...' : 'Créer mon compte'}
            </button>
          </form>

          <div className="auth-toggle">
            Déjà inscrit ?
            <Link to="/login" className="auth-toggle-link">
              Se connecter
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
