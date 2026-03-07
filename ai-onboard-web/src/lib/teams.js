import { supabase } from './supabase.js';

/**
 * Create a new team. The current user becomes the manager.
 */
export async function createTeam(name, userId) {
  // Insert team
  const { data: team, error: teamError } = await supabase
    .from('teams')
    .insert({ name, manager_id: userId })
    .select()
    .single();

  if (teamError) throw teamError;

  // Add creator as manager member
  const { error: memberError } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: userId, role: 'manager' });

  if (memberError) throw memberError;

  return team;
}

/**
 * Join a team via invite code.
 */
export async function joinTeam(inviteCode, userId) {
  // Look up team by invite code
  const { data: team, error: lookupError } = await supabase
    .from('teams')
    .select('id, name')
    .eq('invite_code', inviteCode)
    .single();

  if (lookupError || !team) throw new Error('Invalid invite code');

  // Check if already a member
  const { data: existing } = await supabase
    .from('team_members')
    .select('id')
    .eq('team_id', team.id)
    .eq('user_id', userId)
    .single();

  if (existing) return team; // Already a member, just return the team

  // Insert membership
  const { error: joinError } = await supabase
    .from('team_members')
    .insert({ team_id: team.id, user_id: userId, role: 'member' });

  if (joinError) throw joinError;

  return team;
}

/**
 * Get all teams the current user belongs to, including their role.
 */
export async function getMyTeams(userId) {
  const { data, error } = await supabase
    .from('team_members')
    .select('role, teams(id, name, invite_code, manager_id, created_at)')
    .eq('user_id', userId);

  if (error) throw error;

  return (data || []).map(row => ({
    ...row.teams,
    role: row.role
  }));
}

/**
 * Get all members of a team with their profile info.
 */
export async function getTeamMembers(teamId) {
  const { data, error } = await supabase
    .from('team_members')
    .select('user_id, role, invited_at, profiles(display_name)')
    .eq('team_id', teamId);

  if (error) throw error;

  return (data || []).map(row => ({
    userId: row.user_id,
    role: row.role,
    invitedAt: row.invited_at,
    displayName: row.profiles?.display_name || 'Unknown'
  }));
}

/**
 * Get a team by ID (for managers).
 */
export async function getTeam(teamId) {
  const { data, error } = await supabase
    .from('teams')
    .select('*')
    .eq('id', teamId)
    .single();

  if (error) throw error;
  return data;
}
