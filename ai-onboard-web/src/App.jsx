import { HashRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext.jsx';
import ProtectedRoute from './components/common/ProtectedRoute.jsx';
import LandingPage from './pages/LandingPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SharedProfilePage from './pages/SharedProfilePage.jsx';
import LoginPage from './pages/LoginPage.jsx';
import TeamCreatePage from './pages/TeamCreatePage.jsx';
import JoinPage from './pages/JoinPage.jsx';
import SupplementaryPage from './pages/SupplementaryPage.jsx';
import DashboardPage from './pages/DashboardPage.jsx';
import RetakePage from './pages/RetakePage.jsx';
import MyDashboardPage from './pages/MyDashboardPage.jsx';

export default function App() {
  return (
    <AuthProvider>
      <HashRouter>
        <Routes>
          {/* Public routes */}
          <Route path="/" element={<LandingPage />} />
          <Route path="/quiz" element={<QuizPage />} />
          <Route path="/profile" element={<ProfilePage />} />
          <Route path="/shared/:hash" element={<SharedProfilePage />} />
          <Route path="/login" element={<LoginPage />} />
          <Route path="/join/:code" element={<JoinPage />} />

          {/* Protected routes */}
          <Route path="/teams/new" element={<ProtectedRoute><TeamCreatePage /></ProtectedRoute>} />
          <Route path="/supplementary" element={<ProtectedRoute><SupplementaryPage /></ProtectedRoute>} />
          <Route path="/dashboard" element={<ProtectedRoute><DashboardPage /></ProtectedRoute>} />
          <Route path="/my-dashboard" element={<ProtectedRoute><MyDashboardPage /></ProtectedRoute>} />
          <Route path="/retake" element={<ProtectedRoute><RetakePage /></ProtectedRoute>} />
        </Routes>
      </HashRouter>
    </AuthProvider>
  );
}
