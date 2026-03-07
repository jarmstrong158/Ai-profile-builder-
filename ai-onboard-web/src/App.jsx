import { HashRouter, Routes, Route } from 'react-router-dom';
import LandingPage from './pages/LandingPage.jsx';
import QuizPage from './pages/QuizPage.jsx';
import ProfilePage from './pages/ProfilePage.jsx';
import SharedProfilePage from './pages/SharedProfilePage.jsx';

export default function App() {
  return (
    <HashRouter>
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/quiz" element={<QuizPage />} />
        <Route path="/profile" element={<ProfilePage />} />
        <Route path="/shared/:hash" element={<SharedProfilePage />} />
      </Routes>
    </HashRouter>
  );
}
