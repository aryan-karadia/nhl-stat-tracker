# NHL Stat Tracker
### Live Demo: [https://nhl-stat-tracker.vercel.app/](https://nhl-stat-tracker.vercel.app/)

NHL Stat Tracker is a web application for real-time standings, salary cap analytics, and draft projections. The site features a dynamic design system that adapts the visual theme based on the selected NHL team.

## Core Features

### Real-Time Standings
- Fetches live standings data from the official NHL API.
- Includes power rankings based on the last 10 games.
- Provides edge statistics highlighting league-wide strengths and weaknesses.

### Team Roster
- Fetches the selected team's current roster from the official NHL API.
- Provides expandable player profiles with biographical details and current-season stats.
- Does not claim salary, contract, or trade-clause data that the official NHL API does not expose.

### Draft Projections
- Projections for upcoming 2025, 2026, and 2027 drafts.
- Synthesized scouting reports for top prospects.
- Tracking for pick ownership and trade history.

### Prospect Pool & Scouting
- Team prospect pool view with per-player scouting snapshots.
- Structured strengths and development areas for each prospect.
- Mock and live scraper support through the normalized data layer.

### Dynamic Branding
- Global theming system that swaps colors based on the chosen team.
- Support for alternate jersey color schemes.

---

## Tech Stack

- Framework: Next.js 16 (App Router, Server Components)
- Language: TypeScript
- Styling: Tailwind CSS 4 with CSS-first `@theme` tokens
- UI Components: Tailwind utility classes and reusable React components
- State Management: React Context
- Testing: Jest and React Testing Library (86 tests)
- API: Official NHL Web API

---

## AI Integration

This project was developed using Antigravity, an advanced agentic coding system. The AI managed architecture, implementation, and automated testing. Additionally, draft scouting reports were synthesized using LLMs to provide concise player profiles.

---

## Future Roadmap

I am continuously evolving this project. Current priorities include:

1. Advanced Analytics: Integration of Corsi, xG, and possession metrics.
2. Historical Data: Comparison tools for historical cap efficiency.
3. Player Profiles: Career statistics and performance visualizations.
4. Simulation Tools: Interactive trade and buyout calculators.

See the full [Feature Roadmap](ROADMAP.md) for more details.

---

## Getting Started

### Prerequisites
- pnpm
- Node.js 20+

### Installation
1. Clone the repository: `git clone https://github.com/aryan-karadia/nhl-stat-tracker.git`
2. Install dependencies: `pnpm install`
3. Start development: `pnpm dev`
4. Run tests: `pnpm test`

---

## Data Sources

The app now uses a normalized source resolver for salary, draft, and prospect data with three modes:

- `mock`: always use local deterministic mock data
- `live`: require live ingestion, throw if unavailable
- `auto`: try live first, then fall back to mock

### Mode Env Vars

- `NEXT_PUBLIC_SALARY_DATA_MODE`
- `NEXT_PUBLIC_DRAFT_DATA_MODE`
- `NEXT_PUBLIC_PROSPECTS_DATA_MODE`

### Live scraper URL templates

Set these when you want the built-in scraper logic to ingest an HTML table source:

- `NEXT_PUBLIC_DRAFT_LIVE_URL_TEMPLATE` (supports `{team}` and `{year}`)
- `NEXT_PUBLIC_PROSPECTS_LIVE_URL_TEMPLATE` (supports `{team}`)

Examples:

- `NEXT_PUBLIC_DRAFT_LIVE_URL_TEMPLATE=https://example.com/nhl/{year}/mock-draft/{team}`
- `NEXT_PUBLIC_PROSPECTS_LIVE_URL_TEMPLATE=https://example.com/nhl/{team}/prospects`

Important notes:

- Draft picks use live NHL data by default. Set `NEXT_PUBLIC_DRAFT_DATA_MODE=mock` only when deterministic local data is needed.
- The prospect pool uses official NHL draft selections from the current draft year and previous five drafts by default. Set `NEXT_PUBLIC_PROSPECTS_DATA_MODE=mock` only when deterministic local data is needed.
- These scrapers are intentionally lightweight and depend on table structure stability.
- If the source layout changes, `auto` mode falls back to mock data.
- Always confirm source terms of use before scraping.

The team roster page uses the official NHL Web API directly. No salary-cap `.env` variables are required. PuckPedia contract data is not used because its contract API requires separate access.

---

## Contact

Project Link: [https://github.com/aryan-karadia/nhl-stat-tracker](https://github.com/aryan-karadia/nhl-stat-tracker)
