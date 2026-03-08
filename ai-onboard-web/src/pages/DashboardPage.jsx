import { useState, useEffect, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/common/Layout.jsx';
import { useAuth } from '../context/AuthContext.jsx';
import { getMyTeams, getTeam } from '../lib/teams.js';
import { loadDashboardData } from '../lib/dashboard.js';
import { getTeamActions } from '../lib/actions.js';
import TeamOverview from '../components/dashboard/TeamOverview.jsx';
import MemberList from '../components/dashboard/MemberList.jsx';
import MemberDetail from '../components/dashboard/MemberDetail.jsx';
import TeamComposition from '../components/dashboard/TeamComposition.jsx';
import AdoptionMetrics from '../components/dashboard/AdoptionMetrics.jsx';
import AttentionFlags from '../components/dashboard/AttentionFlags.jsx';
import Recommendations from '../components/dashboard/Recommendations.jsx';
import TeamPatterns from '../components/dashboard/TeamPatterns.jsx';
import InvitePanel from '../components/dashboard/InvitePanel.jsx';
import CompositionPriorities from '../components/dashboard/CompositionPriorities.jsx';

const TABS = [
  { id: 'overview', label: 'Overview' },
  { id: 'members', label: 'Members' },
  { id: 'composition', label: 'Composition' },
  { id: 'adoption', label: 'Adoption' },
  { id: 'flags', label: 'Flags' },
  { id: 'recommendations', label: 'Actions' }
];

export default function DashboardPage() {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [teams, setTeams] = useState([]);
  const [selectedTeam, setSelectedTeam] = useState(null);
  const [teamInfo, setTeamInfo] = useState(null);
  const [dashboardData, setDashboardData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedMember, setSelectedMember] = useState(null);

  // Load teams
  useEffect(() => {
    if (!user) return;

    getMyTeams(user.id)
      .then(t => {
        setTeams(t);
        // Auto-select first team where user is manager, or first team
        const managed = t.find(team => team.role === 'manager');
        if (managed) {
          setSelectedTeam(managed.id);
        } else if (t.length > 0) {
          setSelectedTeam(t[0].id);
        }
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [user]);

  // Load dashboard data when team is selected
  useEffect(() => {
    if (!selectedTeam) return;

    setLoading(true);
    setError('');

    Promise.all([
      getTeam(selectedTeam),
      loadDashboardData(selectedTeam)
    ])
      .then(([info, data]) => {
        setTeamInfo(info);
        setDashboardData(data);
        setLoading(false);
      })
      .catch(err => {
        setError(err.message);
        setLoading(false);
      });
  }, [selectedTeam]);

  // Refresh just the actions (lightweight, no full dashboard reload)
  const refreshActions = useCallback(async () => {
    if (!selectedTeam || !dashboardData) return;
    try {
      const freshActions = await getTeamActions(selectedTeam);
      setDashboardData(prev => ({ ...prev, actions: freshActions }));
    } catch (err) {
      console.error('Failed to refresh actions:', err);
    }
  }, [selectedTeam, dashboardData]);

  if (loading) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <p style={{ color: 'var(--color-text-secondary)' }}>Loading dashboard...</p>
        </div>
      </Layout>
    );
  }

  if (teams.length === 0) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h1
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
            >
              No Teams Yet
            </h1>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              Create a team to start tracking your team's AI adoption and communication profiles.
            </p>
            <button
              onClick={() => navigate('/teams/new')}
              className="px-6 py-2 rounded text-sm font-medium cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              Create a Team
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  const isManager = teams.find(t => t.id === selectedTeam)?.role === 'manager';

  if (!isManager) {
    return (
      <Layout>
        <div className="min-h-[calc(100vh-48px)] flex items-center justify-center">
          <div className="text-center max-w-md px-4">
            <h1
              className="text-2xl font-semibold mb-4"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
            >
              Manager Access Required
            </h1>
            <p className="mb-6" style={{ color: 'var(--color-text-secondary)' }}>
              The team dashboard is only available to team managers. If you believe you should have access, contact your team manager.
            </p>
            <button
              onClick={() => navigate('/')}
              className="px-6 py-2 rounded text-sm font-medium cursor-pointer"
              style={{ backgroundColor: 'var(--color-accent)', color: 'white' }}
            >
              Go Home
            </button>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="w-full max-w-[800px] mx-auto py-8 px-4 sm:px-0">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1
              className="text-2xl font-semibold"
              style={{ fontFamily: 'var(--font-heading)', color: 'var(--color-text-primary)' }}
            >
              {teamInfo?.name || 'Dashboard'}
            </h1>
            <p className="text-sm" style={{ color: 'var(--color-text-secondary)' }}>
              {dashboardData?.members?.length || 0} member{(dashboardData?.members?.length || 0) !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="flex items-center gap-3">
            {/* Team selector (if multiple teams) */}
            {teams.length > 1 && (
              <select
                value={selectedTeam || ''}
                onChange={e => { setSelectedTeam(e.target.value); setSelectedMember(null); }}
                className="px-3 py-1.5 rounded text-sm"
                style={{
                  backgroundColor: 'var(--color-surface)',
                  color: 'var(--color-text-primary)',
                  border: '1px solid var(--color-border)'
                }}
              >
                {teams.map(t => (
                  <option key={t.id} value={t.id}>{t.name}</option>
                ))}
              </select>
            )}

            <button
              onClick={() => navigate('/teams/new')}
              className="px-3 py-1.5 rounded text-sm cursor-pointer"
              style={{ color: 'var(--color-accent)', border: '1px solid var(--color-accent)' }}
            >
              + New Team
            </button>
          </div>
        </div>

        {/* Preview mode banner — when team has very few members */}
        {dashboardData?.members?.length <= 1 && (
          <div
            className="mb-6 px-5 py-4 rounded-lg"
            style={{ backgroundColor: '#3b82f610', border: '1px solid #3b82f630' }}
          >
            <p className="text-sm font-medium" style={{ color: '#3b82f6' }}>
              Preview Mode
            </p>
            <p className="text-xs mt-0.5" style={{ color: 'var(--color-text-secondary)' }}>
              {dashboardData.members.length === 0
                ? 'No members yet. Share your invite link to start building your team.'
                : 'This is a preview with just your data. Share the invite link below to build your team — the dashboard gets richer with more members.'}
            </p>
          </div>
        )}

        {/* Invite panel (managers only) */}
        {isManager && teamInfo?.invite_code && (
          <div className="mb-6">
            <InvitePanel inviteCode={teamInfo.invite_code} />
          </div>
        )}

        {error && (
          <div
            className="mb-6 px-4 py-3 rounded text-sm"
            style={{ backgroundColor: 'rgba(220, 38, 38, 0.1)', color: '#dc2626' }}
          >
            {error}
          </div>
        )}

        {/* Member Detail View */}
        {selectedMember ? (
          <MemberDetail
            member={selectedMember.member}
            flags={selectedMember.flags}
            recommendations={dashboardData?.individualRecommendations?.[selectedMember.member.userId]}
            onBack={() => setSelectedMember(null)}
          />
        ) : (
          <>
            {/* Tab Navigation */}
            <div className="flex gap-1 mb-6 overflow-x-auto rounded-lg p-1" style={{ backgroundColor: 'var(--color-surface)' }}>
              {TABS.map(tab => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className="flex-1 px-3 py-2 text-sm cursor-pointer whitespace-nowrap rounded-md transition-all"
                  style={{
                    color: activeTab === tab.id ? 'var(--color-text-primary)' : 'var(--color-text-secondary)',
                    backgroundColor: activeTab === tab.id ? 'var(--color-accent)' : 'transparent',
                    fontWeight: activeTab === tab.id ? '600' : '400',
                    ...(activeTab === tab.id ? { color: 'white' } : {})
                  }}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Tab Content */}
            <div className="min-h-[300px]">
              {activeTab === 'overview' && dashboardData && (
                <TeamOverview teamHealth={dashboardData.teamHealth} />
              )}

              {activeTab === 'members' && dashboardData && (
                <MemberList
                  members={dashboardData.members}
                  memberFlags={dashboardData.memberFlags}
                  onSelectMember={(member, flags) => setSelectedMember({ member, flags })}
                />
              )}

              {activeTab === 'composition' && dashboardData && (
                <div className="flex flex-col gap-8">
                  <CompositionPriorities
                    archetypeDistribution={dashboardData.archetypeDistribution}
                    teamPatterns={dashboardData.teamPatterns}
                    members={dashboardData.members}
                    spectrumDiversity={dashboardData.spectrumDiversity}
                  />
                  <TeamComposition
                    archetypeDistribution={dashboardData.archetypeDistribution}
                    spectrumDiversity={dashboardData.spectrumDiversity}
                  />
                  <div style={{ borderTop: '1px solid var(--color-border)', paddingTop: '1.5rem' }}>
                    <h3
                      className="text-xs font-semibold tracking-widest uppercase mb-4"
                      style={{ color: 'var(--color-accent)' }}
                    >
                      Team Patterns
                    </h3>
                    <TeamPatterns teamPatterns={dashboardData.teamPatterns} />
                  </div>
                </div>
              )}

              {activeTab === 'adoption' && dashboardData && (
                <AdoptionMetrics adoptionSummary={dashboardData.adoptionSummary} />
              )}

              {activeTab === 'flags' && dashboardData && (
                <AttentionFlags
                  teamFlags={dashboardData.teamFlags}
                  memberFlags={dashboardData.memberFlags}
                  members={dashboardData.members}
                />
              )}

              {activeTab === 'recommendations' && dashboardData && (
                <Recommendations
                  recommendations={dashboardData.teamRecommendations}
                  members={dashboardData.members}
                  pairingSuggestions={dashboardData.pairingSuggestions}
                  actions={dashboardData.actions}
                  teamId={selectedTeam}
                  onActionsChange={refreshActions}
                />
              )}
            </div>
          </>
        )}
      </div>
    </Layout>
  );
}
