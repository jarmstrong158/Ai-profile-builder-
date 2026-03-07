import { useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import ProfileView from '../components/profile/ProfileView.jsx';
import { buildShareUrl } from '../engine/share.js';

export default function ProfilePage() {
  const location = useLocation();
  const navigate = useNavigate();
  const profile = location.state?.profile;
  const scores = location.state?.scores;
  const zones = location.state?.zones;
  const archetype = location.state?.archetype;

  useEffect(() => {
    if (!profile) {
      navigate('/quiz', { replace: true });
    }
  }, [profile, navigate]);

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

  const handleShare = useCallback(() => {
    if (!scores || !archetype) return '';
    return buildShareUrl(scores, archetype);
  }, [scores, archetype]);

  if (!profile) return null;

  return (
    <Layout>
      <div className="py-8">
        <ProfileView
          profile={profile}
          scores={scores}
          zones={zones}
          archetype={archetype}
          onRetake={handleRetake}
          onShare={handleShare}
        />
      </div>
    </Layout>
  );
}
