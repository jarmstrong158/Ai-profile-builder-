import { supabase } from './supabase.js';

/**
 * Schedule a retake for a team member.
 * @param {'auto'|'manager'} scheduleType
 */
export async function scheduleRetake({ teamId, userId, scheduledBy, scheduleType, scheduledFor }) {
  const { data, error } = await supabase
    .from('scheduled_retakes')
    .insert({
      team_id: teamId,
      user_id: userId,
      scheduled_by: scheduledBy || null,
      schedule_type: scheduleType,
      scheduled_for: scheduledFor
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get pending scheduled retakes for a user across all teams.
 */
export async function getMyPendingRetakes(userId) {
  const { data, error } = await supabase
    .from('scheduled_retakes')
    .select('*')
    .eq('user_id', userId)
    .eq('status', 'pending')
    .order('scheduled_for', { ascending: true });

  if (error) throw error;
  return data || [];
}

/**
 * Get all scheduled retakes for a team (manager view).
 */
export async function getTeamScheduledRetakes(teamId) {
  const { data, error } = await supabase
    .from('scheduled_retakes')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Mark a scheduled retake as completed.
 */
export async function completeScheduledRetake(retakeId) {
  const { error } = await supabase
    .from('scheduled_retakes')
    .update({ status: 'completed', completed_at: new Date().toISOString() })
    .eq('id', retakeId);

  if (error) throw error;
}

/**
 * Cancel a scheduled retake.
 */
export async function cancelScheduledRetake(retakeId) {
  const { error } = await supabase
    .from('scheduled_retakes')
    .update({ status: 'cancelled' })
    .eq('id', retakeId);

  if (error) throw error;
}

/**
 * Check if a user has a pending retake that is due (scheduled_for <= now).
 * Returns the retake record if due, null otherwise.
 */
export async function getDueRetake(userId, teamId) {
  const { data, error } = await supabase
    .from('scheduled_retakes')
    .select('*')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .eq('status', 'pending')
    .lte('scheduled_for', new Date().toISOString())
    .order('scheduled_for', { ascending: true })
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return data;
}

/**
 * Check if a user has ANY pending retake for a team (due or upcoming).
 */
export async function hasPendingRetake(userId, teamId) {
  const { data, error } = await supabase
    .from('scheduled_retakes')
    .select('id')
    .eq('user_id', userId)
    .eq('team_id', teamId)
    .eq('status', 'pending')
    .limit(1)
    .maybeSingle();

  if (error) throw error;
  return !!data;
}

/**
 * Auto-schedule the next retake based on volatility status.
 * Called after a retake is saved — schedules the next one automatically.
 */
export async function autoScheduleNextRetake({ teamId, userId, volatilityStatus, assessmentDate }) {
  const { getNextRetakeDate } = await import('../engine/retake.js');
  const nextDate = getNextRetakeDate(volatilityStatus, assessmentDate);

  return scheduleRetake({
    teamId,
    userId,
    scheduledBy: null,
    scheduleType: 'auto',
    scheduledFor: nextDate.toISOString()
  });
}
