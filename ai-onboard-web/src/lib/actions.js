/**
 * Actions library — DB helpers for the actions table.
 * Handles creating, reading, updating, and deleting team actions (pairings, tasks, notes).
 */

import { supabase } from './supabase.js';

/**
 * Create a new action.
 * @param {Object} params
 * @returns {Object} The created action
 */
export async function createAction({
  teamId,
  createdBy,
  actionType,
  targetMemberId,
  partnerMemberId = null,
  title,
  messageToTarget = null,
  messageToPartner = null,
  spectrumFocus = null,
  data: actionData = null,
  status = 'active'
}) {
  const { data, error } = await supabase
    .from('actions')
    .insert({
      team_id: teamId,
      created_by: createdBy,
      action_type: actionType,
      target_member_id: targetMemberId,
      partner_member_id: partnerMemberId,
      title,
      message_to_target: messageToTarget,
      message_to_partner: messageToPartner,
      spectrum_focus: spectrumFocus,
      data: actionData,
      status
    })
    .select()
    .single();

  if (error) throw error;
  return data;
}

/**
 * Get all actions for a team.
 * @param {string} teamId
 * @returns {Array<Object>} Actions ordered by created_at DESC
 */
export async function getTeamActions(teamId) {
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .eq('team_id', teamId)
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Get actions targeting a specific user (as target or partner).
 * @param {string} userId
 * @returns {Array<Object>} Actions where user is involved
 */
export async function getMyActions(userId) {
  const { data, error } = await supabase
    .from('actions')
    .select('*')
    .or(`target_member_id.eq.${userId},partner_member_id.eq.${userId}`)
    .eq('status', 'active')
    .order('created_at', { ascending: false });

  if (error) throw error;
  return data || [];
}

/**
 * Acknowledge an action (member has seen and is working on it).
 * @param {string} actionId
 */
export async function acknowledgeAction(actionId) {
  const { error } = await supabase
    .from('actions')
    .update({ acknowledged_at: new Date().toISOString() })
    .eq('id', actionId);

  if (error) throw error;
}

/**
 * Update action status (active → completed or dismissed).
 * @param {string} actionId
 * @param {string} status - 'completed' or 'dismissed'
 */
export async function updateActionStatus(actionId, status) {
  const updates = { status };
  if (status === 'completed') {
    updates.completed_at = new Date().toISOString();
  }

  const { error } = await supabase
    .from('actions')
    .update(updates)
    .eq('id', actionId);

  if (error) throw error;
}

/**
 * Delete an action.
 * @param {string} actionId
 */
export async function deleteAction(actionId) {
  const { error } = await supabase
    .from('actions')
    .delete()
    .eq('id', actionId);

  if (error) throw error;
}
