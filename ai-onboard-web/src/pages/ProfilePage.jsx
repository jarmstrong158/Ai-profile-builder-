import { useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import ProfileView from '../components/profile/ProfileView.jsx';

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = location.state?.profile;

  // Redirect to quiz if no profile data
  useEffect(() => {
    if (!profile) {
      navigate('/quiz', { replace: true });
    }
  }, [profile, navigate]);

  // Warn before unload if profile hasn't been saved
  useEffect(() => {
    const handleBeforeUnload = (e) => {
      e.preventDefault();
      e.returnValue = "Your profile hasn't been saved. Download or copy it before leaving.";
    };
    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, []);

  const handleRetake = () => {
    navigate('/quiz', { replace: true });
  };

  if (!profile) return null;

  return (
    <Layout>
      <div className="py-8">
        <ProfileView profile={profile} onRetake={handleRetake} />
      </div>
    </Layout>
  );
}
