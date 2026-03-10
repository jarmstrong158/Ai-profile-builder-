import { supabase } from './supabase.js';

/**
 * Save a completed assessment (core quiz + supplementary answers).
 */
export async function saveAssessment({ userId, teamId, coreAnswers, supplementaryAnswers, normalizedScores, zones, archetypeResult, volatilityStatus = 'new' }) {
  const { data, error } = await supabase
    .from('assessments')
    .insert({
      user_id: userId,
      team_id: teamId,
      core_answers: coreAnswers,
      supplementary_answers: supplementaryAnswers,
      normalized_scores: normalizedScores,
      zones,
      archetype_result: archetypeResult,
      volatility_status: volatilityStatus
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all assessments for a team (manager use — dashboard).
 */
export async function getTeamAssessments(teamId) {
  const { data, error } = await supabase
    .from('assessments')
    .select('*, profiles(display_name)')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get the latest assessment for a user in a specific team.
 */
export async function getLatestAssessment(userId, teamId) {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error; // PGRST116 = no rows
  return data || null;
}

/**
 * Get the latest assessment for a user (any team).
 * Used by ProfilePage to reload a saved profile.
 */
export async function getMyLatestAssessment(userId) {
  const { data, error } = await supabase
    .from('assessments')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: false })
    .limit(1)
    .single();

  if (error && error.code !== 'PGRST116') throw error;
  return data || null;
}

/**
 * Get full assessment history for a user in a team (for volatility calculation).
 */
export async function getAssessmentHistory(userId, teamId) {
  const { data, error } = await supabase
    .from('assessments')
    .select('normalized_scores, volatility_status, created_at, archetype_result')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) throw error;

  return (data || []).map(row => ({
    normalizedScores: row.normalized_scores,
    volatilityStatus: row.volatility_status,
    date: new Date(row.created_at),
    archetypeResult: row.archetype_result
  }));
}
