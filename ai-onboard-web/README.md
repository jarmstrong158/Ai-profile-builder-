# AI Onboard Web

A client-side personality profiling engine with team analytics, built on React and Supabase.

## Features

### Individual Profiling
- 50+ question quiz across 7 sections (optional Section 7 for experienced users)
- Scoring across 14 behavioral spectrums (e.g., explanation depth, autonomy, structure preference)
- Archetype matching against 9 profiles: Operator, Student, Tinkerer, Strategist, Collaborator, Craftsman, Explorer, Navigator, Architect
- Deviation detection for unusual spectrum combinations
- Shareable profile links

### Team Dashboard (Manager View)
- **Overview** — Team health score (0-100), band distribution (Thriving / On Track / Needs Attention / At Risk), completion rate
- **Members** — Clickable roster with individual health, archetype, spectrum charts, and flags
- **Composition** — Archetype distribution, spectrum diversity heatmap, polarized/clustered pattern detection
- **Adoption** — Usage frequency, use case breadth, top barriers, knowledge sharing rate
- **Flags** — Severity-sorted attention flags (team + individual), color-coded by urgency
- **Actions** — Priority-ranked recommendations with category badges

### Team Flow
- Email/password auth via Supabase
- Create teams, invite members via shareable links (`/#/join/<code>`)
- Members take quiz, answer 7 supplementary team questions, save to team
- Retake with volatility tracking (new -> volatile -> stabilizing -> stable)

## Architecture

```
src/
  engine/              # Pure computation - no side effects, no dependencies
    scoring.js           # Raw scores -> normalized (0-100) -> zone assignment
    archetype-matching.js # Euclidean distance matching against 9 ideal vectors
    profile-generator.js  # Template-based profile text generation
    dashboard-health.js   # Individual + team health scoring
    adoption-metrics.js   # Frequency, use cases, barriers, knowledge sharing
    attention-flags.js    # Team + individual flag generation
    recommendations.js    # Priority-sorted action items
    team-composition.js   # Archetype distribution, spectrum diversity, patterns
    retake.js            # Volatility detection, spectrum shift tracking
    team-quiz.js         # Supplementary question validation
    deviation-detector.js # Unusual combination flagging
    work-context.js      # Context-aware profile customization

  data/
    questions.js           # 50+ quiz questions across 7 sections
    supplementary-questions.js # 7 team-mode questions (S1-S7)
    archetypes.js          # 9 archetype definitions with ideal score vectors
    templates.js           # Profile text templates (first-person voice)
    weights.js             # Section and question weighting

  lib/                  # Supabase integration
    supabase.js           # Client initialization
    teams.js              # Team CRUD operations
    assessments.js        # Assessment save/fetch
    dashboard.js          # Orchestrator - fetches data, runs all engine functions

  context/
    AuthContext.jsx       # Auth state, sign up/in/out
    QuizContext.jsx       # Quiz progress state

  components/
    quiz/                 # Quiz UI (QuestionCard, OptionCard, ProgressBar)
    profile/              # Profile display (SpectrumChart, ArchetypeCard)
    dashboard/            # 10 dashboard components (TeamOverview, MemberList, etc.)
    common/               # Layout, ThemeToggle, ProtectedRoute

  pages/
    LandingPage.jsx       # Public landing
    QuizPage.jsx          # Quiz flow
    ProfilePage.jsx       # Results + "Save to Team"
    LoginPage.jsx         # Auth (sign in / sign up)
    DashboardPage.jsx     # Manager dashboard (6 tabs)
    TeamCreatePage.jsx    # Create team form
    JoinPage.jsx          # Join via invite link
    SupplementaryPage.jsx # S1-S7 team questions
    RetakePage.jsx        # Retake flow with volatility
    SharedProfilePage.jsx # Public shared profile view
```

## Setup

### Prerequisites
- Node.js 18+
- A [Supabase](https://supabase.com) project (free tier works)

### 1. Install dependencies

```bash
npm install
```

### 2. Set up Supabase

Create a Supabase project, then run the schema in the SQL Editor:

```bash
# The schema file is included in the repo
cat supabase-schema.sql
```

This creates 4 tables (`profiles`, `teams`, `team_members`, `assessments`) with Row Level Security policies.

You also need helper functions for profile auto-creation and RLS. Run this in the SQL Editor:

```sql
-- Auto-create profile on signup
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS TRIGGER AS $$
BEGIN
  INSERT INTO public.profiles (id, display_name)
  VALUES (NEW.id, COALESCE(NEW.raw_user_meta_data->>'display_name', 'User'));
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

-- RLS helper functions (prevent infinite recursion)
CREATE OR REPLACE FUNCTION public.is_member_of(check_team_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.team_members
    WHERE team_id = check_team_id AND user_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;

CREATE OR REPLACE FUNCTION public.is_manager_of(check_team_id UUID)
RETURNS BOOLEAN AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.teams
    WHERE id = check_team_id AND manager_id = auth.uid()
  );
$$ LANGUAGE sql SECURITY DEFINER;
```

In Supabase Authentication settings:
- Enable Email provider
- Disable "Confirm email" (for development)

### 3. Configure environment

```bash
cp .env.example .env
```

Edit `.env` with your Supabase project URL and anon key:

```
VITE_SUPABASE_URL=https://your-project.supabase.co
VITE_SUPABASE_ANON_KEY=your-anon-key-here
```

### 4. Run

```bash
npm run dev
```

The app runs at `http://localhost:5180`.

## Testing

```bash
npm test           # Run all tests (116 passing)
npm run test:watch # Watch mode
```

The test suite covers the full engine: scoring, archetype matching, health computation, adoption metrics, attention flags, recommendations, team composition, and retake volatility.

## Deployment

The app is a static SPA with no backend server. Deploy to any static host.

**Vercel** (recommended):
1. Import the GitHub repo
2. Set root directory to `ai-onboard-web`
3. Add `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` as environment variables
4. Deploy

After deploying, add your production URL to Supabase -> Authentication -> URL Configuration.

## The 14 Spectrums

| # | Spectrum | Low End | High End |
|---|----------|---------|----------|
| 1 | Explanation Depth | Minimal | Thorough |
| 2 | Feedback & Correction | Sparse | Detailed |
| 3 | Autonomy | Guided | Independent |
| 4 | Detail Orientation | Big Picture | Granular |
| 5 | Pacing | Fast | Measured |
| 6 | Scaffolding | Minimal | Structured |
| 7 | Prior Knowledge | Experienced | Beginner |
| 8 | Interaction Tone | Formal | Conversational |
| 9 | Risk Tolerance | Conservative | Experimental |
| 10 | Creative Engagement | Factual | Creative |
| 11 | Directness | Diplomatic | Blunt |
| 12 | Collaboration Style | Solo | Partnered |
| 13 | Iteration Speed | Methodical | Rapid |
| 14 | Trust & Rapport | Task-Focused | Relational |

## The 9 Archetypes

| Archetype | Description |
|-----------|-------------|
| **The Operator** | Direct, efficient, results-oriented. Wants answers, not lessons. |
| **The Student** | Here to learn. Values understanding over speed. |
| **The Tinkerer** | Moves fast, experiments constantly. Learns by doing. |
| **The Strategist** | Analytical and methodical. Wants data and tradeoffs. |
| **The Collaborator** | Thinks through dialogue. Wants a genuine thinking partner. |
| **The Craftsman** | High standards. Cares about precision and quality. |
| **The Explorer** | Curious and self-paced. Pulls on threads that interest them. |
| **The Navigator** | New to AI but not anxious. Wants orientation, not hand-holding. |
| **The Architect** | Precise vision. Needs the AI to execute within specifications. |

## Health Scoring

Team health is computed from supplementary question responses:

```
Health = (Adoption x 0.25) + (Success x 0.30) + (Confidence x 0.20) + (Time Impact x 0.25)
```

Bands: **Thriving** (75-100), **On Track** (50-74), **Needs Attention** (25-49), **At Risk** (0-24)
