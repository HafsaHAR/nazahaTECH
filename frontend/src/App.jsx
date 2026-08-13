import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from './context/AuthContext';
import { ThemeProvider } from './context/ThemeContext';
import { LanguageProvider } from './context/LanguageContext';
import AppLayout from './components/AppLayout';
import Login from './pages/Login';
import Register from './pages/Register';
import Dashboard from './pages/Dashboard';
import Challenges from './pages/Challenges';
import ChallengeDetail from './pages/ChallengeDetail';
import SubmitIdea from './pages/SubmitIdea';
import Ideas from './pages/Ideas';
import IdeaDetail from './pages/IdeaDetail';
import Profile from './pages/Profile';
import Library from './pages/Library';
import Initiatives from './pages/Initiatives';
import InitiativeDetail from './pages/InitiativeDetail';

function ProtectedRoute({ children }) {
  const { isAuthenticated, loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#4b5563' }}>
        Chargement de l'espace collaboratif INPPLC...
      </div>
    );
  }

  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  return children;
}

function AppRoutes() {
  const { loading } = useAuth();

  if (loading) {
    return (
      <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'sans-serif', color: '#4b5563' }}>
        Chargement de l'espace collaboratif INPPLC...
      </div>
    );
  }

  return (
    <Routes>
      {/* Routes Publiques d'Authentification */}
      <Route path="/login" element={<Login />} />
      <Route path="/register" element={<Register />} />

      {/* Disposition Principale INPPLC (AppLayout) */}
      <Route element={<AppLayout />}>
        {/* Vues Publiques / Consultation */}
        <Route path="/" element={<Dashboard />} />
        <Route path="/ideas" element={<Ideas />} />
        <Route path="/ideas/:id" element={<IdeaDetail />} />
        <Route path="/challenges" element={<Challenges />} />
        <Route path="/challenges/:id" element={<ChallengeDetail />} />
        <Route path="/library" element={<Library />} />
        <Route path="/initiatives" element={<Initiatives />} />
        <Route path="/initiatives/:id" element={<InitiativeDetail />} />

        {/* Routes Protégées par Authentification */}
        <Route path="/submit-idea" element={<ProtectedRoute><SubmitIdea /></ProtectedRoute>} />
        <Route path="/profile" element={<ProtectedRoute><Profile /></ProtectedRoute>} />
      </Route>

      {/* Redirection par défaut */}
      <Route path="*" element={<Navigate to="/" replace />} />
    </Routes>
  );
}

export default function App() {
  return (
    <Router>
      <ThemeProvider>
        <LanguageProvider>
          <AuthProvider>
            <AppRoutes />
          </AuthProvider>
        </LanguageProvider>
      </ThemeProvider>
    </Router>
  );
}
