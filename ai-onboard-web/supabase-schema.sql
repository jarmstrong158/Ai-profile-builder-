-- AI Onboard — Supabase Schema
-- Run this in the Supabase SQL Editor after creating your project.

-- 1. User profiles (extends Supabase auth.users)
CREATE TABLE profiles (
  id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
  display_name TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 2. Teams
CREATE TABLE teams (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  invite_code TEXT UNIQUE NOT NULL DEFAULT substr(gen_random_uuid()::text, 1, 8),
  manager_id UUID NOT NULL REFERENCES profiles(id),
  created_at TIMESTAMPTZ DEFAULT now()
);

-- 3. Team membership
CREATE TABLE team_members (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  role TEXT NOT NULL DEFAULT 'member' CHECK (role IN ('manager', 'member')),
  invited_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(team_id, user_id)
);

-- 4. Assessment results
CREATE TABLE assessments (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES profiles(id) ON DELETE CASCADE,
  team_id UUID NOT NULL REFERENCES teams(id) ON DELETE CASCADE,
  core_answers JSONB NOT NULL,
  supplementary_answers JSONB,
  normalized_scores JSONB NOT NULL,
  zones JSONB NOT NULL,
  archetype_result JSONB NOT NULL,
  volatility_status TEXT DEFAULT 'new',
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Indexes
CREATE INDEX idx_assessments_user_team ON assessments(user_id, team_id);
CREATE INDEX idx_assessments_team ON assessments(team_id);
CREATE INDEX idx_team_members_team ON team_members(team_id);
CREATE INDEX idx_teams_invite_code ON teams(invite_code);

-- ============================================================
-- Row Level Security (RLS) Policies
-- ============================================================

ALTER TABLE profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE teams ENABLE ROW LEVEL SECURITY;
ALTER TABLE team_members ENABLE ROW LEVEL SECURITY;
ALTER TABLE assessments ENABLE ROW LEVEL SECURITY;

-- Profiles: users can read and update their own profile
CREATE POLICY "Users can read own profile"
  ON profiles FOR SELECT
  USING (auth.uid() = id);

CREATE POLICY "Users can update own profile"
  ON profiles FOR UPDATE
  USING (auth.uid() = id);

CREATE POLICY "Users can insert own profile"
  ON profiles FOR INSERT
  WITH CHECK (auth.uid() = id);

-- Teams: managers can CRUD; members can read teams they belong to
CREATE POLICY "Managers can create teams"
  ON teams FOR INSERT
  WITH CHECK (auth.uid() = manager_id);

CREATE POLICY "Members can read their teams"
  ON teams FOR SELECT
  USING (
    id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
    OR manager_id = auth.uid()
  );

CREATE POLICY "Managers can update their teams"
  ON teams FOR UPDATE
  USING (manager_id = auth.uid());

CREATE POLICY "Managers can delete their teams"
  ON teams FOR DELETE
  USING (manager_id = auth.uid());

-- Allow anyone to read a team by invite_code (for joining)
CREATE POLICY "Anyone can look up team by invite code"
  ON teams FOR SELECT
  USING (true);

-- Team Members: managers can add/remove; members can read roster
CREATE POLICY "Users can join teams"
  ON team_members FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Members can read team roster"
  ON team_members FOR SELECT
  USING (
    team_id IN (SELECT team_id FROM team_members WHERE user_id = auth.uid())
  );

CREATE POLICY "Managers can remove members"
  ON team_members FOR DELETE
  USING (
    team_id IN (SELECT id FROM teams WHERE manager_id = auth.uid())
  );

-- Assessments: users can insert and read their own; managers can read all for their teams
CREATE POLICY "Users can insert own assessments"
  ON assessments FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can read own assessments"
  ON assessments FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Managers can read team assessments"
  ON assessments FOR SELECT
  USING (
    team_id IN (SELECT id FROM teams WHERE manager_id = auth.uid())
  );
