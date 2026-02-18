# NHL Stat Tracker
### Live Demo: [https://nhl-stat-tracker.vercel.app/](https://nhl-stat-tracker.vercel.app/)

NHL Stat Tracker is a web application for real-time standings, salary cap analytics, and draft projections. The site features a dynamic design system that adapts the visual theme based on the selected NHL team.

## Core Features

### Real-Time Standings
- Fetches live standings data from the official NHL API.
- Includes power rankings based on the last 10 games.
- Provides edge statistics highlighting league-wide strengths and weaknesses.

### Salary Cap Management
- Tracks team cap hits against the projected 2025-26 limit ($95M).
- Detailed breakdown of player contracts, including AAV and term lengths.
- Visibility into trade protection clauses (NMC/NTC).

### Draft Projections
- Projections for upcoming 2025, 2026, and 2027 drafts.
- Synthesized scouting reports for top prospects.
- Tracking for pick ownership and trade history.

### Dynamic Branding
- Global theming system that swaps colors based on the chosen team.
- Support for alternate jersey color schemes.

---

## Tech Stack

- Framework: Next.js 16 (App Router, Server Components)
- Language: TypeScript
- Styling: Tailwind CSS 4 and CSS Variables
- UI Components: shadcn/ui
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

## Contact

Project Link: [https://github.com/aryan-karadia/nhl-stat-tracker](https://github.com/aryan-karadia/nhl-stat-tracker)
