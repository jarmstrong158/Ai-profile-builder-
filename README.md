# AI Profile Builder

A personality profiling platform that maps how individuals interact with AI tools — then uses those profiles to power team-level analytics, health scoring, and actionable recommendations.

## Project Structure

```
Ai-profile-builder-/
  ai-onboard-web/      # Main web application (React + Vite)
```

See [`ai-onboard-web/README.md`](ai-onboard-web/README.md) for full documentation.

## What It Does

1. **Individual Profiling** — A quiz engine scores users across 14 behavioral spectrums and matches them to one of 9 AI interaction archetypes (Operator, Student, Tinkerer, Strategist, Collaborator, Craftsman, Explorer, Navigator, Architect).

2. **Team Dashboard** — Managers create teams, invite members via shareable links, and get a live dashboard with health scores, archetype distribution, attention flags, and prioritized recommendations.

3. **Retake & Volatility** — Members retake the assessment over time. The engine tracks spectrum shifts, detects volatility, and surfaces emerging patterns.

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | React 19, Vite 7, React Router 7, Tailwind CSS 4 |
| Auth & Database | Supabase (free tier) |
| Computation | 100% client-side — no backend server |
| Hosting | Any static host (Vercel, Netlify, GitHub Pages) |

## Quick Start

```bash
cd ai-onboard-web
npm install
cp .env.example .env   # Add your Supabase credentials
npm run dev             # http://localhost:5180
```

## License

MIT
