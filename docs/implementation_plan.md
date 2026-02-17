# NHL Stat Tracker — Implementation Plan

Build a Next.js NHL stat tracking website with team switching, standings, salary cap, and draft picks. Uses `api-web.nhle.com` (official NHL API) for standings/roster/draft data, and web scraping of PuckPedia for salary cap data.

## Decisions (Approved)

> [!NOTE]
> **Salary Cap**: Using **mock data** matching real schemas, with adapter pattern for future live source swap.
>
> **Draft Projections**: Using **LLM calls** to generate up-to-date projections. Each projection includes a source note (YouTuber, podcast, blog, news article, etc.) indicating where the data was gathered.
>
> **Edge Stats**: Using NHL API stats (PP%, PK%, goals/game, save%, shots, etc.) as performance metrics. Advanced analytics (Corsi, xG) deferred to a future phase.

---

## Proposed Changes

### Project Scaffolding

#### [NEW] Project root (Next.js + pnpm + shadcn/ui)

Scaffold with:
```bash
pnpm create next-app@latest ./ --ts --tailwind --eslint --app --src-dir --import-alias "@/*" --use-pnpm
npx shadcn@latest init
```

Install testing deps:
```bash
pnpm add -D jest @testing-library/react @testing-library/jest-dom @types/jest ts-jest jest-environment-jsdom
```

---

### Data Layer

#### [NEW] `src/types/nhl.ts`
TypeScript interfaces for all data models:
- `Team` — id, name, abbreviation, colors, logo
- `Standing` — team, wins, losses, OTL, points, division, conference, streak, last10
- `Player` — id, name, position, number
- `Contract` — player, AAV, capHit, years, signingDate, expiryStatus, clauses (NMC/NTC with allowed teams)
- `DraftPick` — year, round, overall, team, originalTeam, projectedPlayer
- `TeamStats` — various stat categories for edge stats

#### [NEW] `src/lib/nhl-api.ts`
NHL API client using `fetch` with Next.js caching:
- `getStandings()` → `GET https://api-web.nhle.com/v1/standings/now`
- `getTeamRoster(abbrev)` → `GET https://api-web.nhle.com/v1/roster/{abbrev}/current`
- `getDraftPicks(year)` → `GET https://api-web.nhle.com/v1/draft/picks/{year}/all`
- `getTeamStats(abbrev)` → `GET https://api-web.nhle.com/v1/club-stats/{abbrev}/now`
- `getTeamSchedule(abbrev)` → for last 10 games analysis
- All functions use `next: { revalidate: 300 }` (5-min cache)

#### [NEW] `src/lib/salary-api.ts`
Salary data adapter (starts with mock data):
- `getTeamSalaryCap(teamAbbrev)` → team cap summary
- `getPlayerContracts(teamAbbrev)` → all player contracts
- Interface-based design so we can swap mock → live later

#### [NEW] `src/lib/mock-data/salary-data.ts`
Realistic contract data for all 32 teams.

#### [NEW] `src/lib/draft-projections.ts`
LLM-powered draft projection service:
- Server action / route handler that calls an LLM to generate projected picks
- Each projection includes: player name, position, current team/league, scouting summary, **source attribution** (e.g. "Based on TSN mock draft, Wheeler YouTube channel, Daily Faceoff")
- Results cached and refreshed periodically
- Fallback to static data if LLM call fails

---

### Team Config & Theming

#### [NEW] `src/lib/teams.ts`
All 32 NHL teams with:
- Full name, abbreviation (3-letter), division, conference
- Primary colors (2-3 hex codes per team)
- Alternate colors (from alternate jerseys, e.g. Blasty for CGY)
- Logo URL (from NHL CDN: `https://assets.nhle.com/logos/nhl/svg/{abbrev}_light.svg`)

#### [NEW] `src/context/team-context.tsx`
React Context for selected team:
- `selectedTeam` state (persisted to localStorage)
- `setSelectedTeam()` action
- On change: applies CSS custom properties (`--team-primary`, `--team-secondary`, `--team-accent`, `--team-alt`) to `:root`

#### [NEW] `src/components/team-switcher.tsx`
shadcn `Command` + `Popover` component:
- Searchable list of all 32 teams
- Grouped by division
- Shows team logo + name
- Color scheme toggle (Regular / Alternate)
- Placed in the header/nav, always accessible

---

### Layout & Navigation

#### [NEW] `src/app/layout.tsx`
Root layout with:
- Inter font from `next/font/google`
- `TeamProvider` wrapping the app
- Responsive sidebar/header nav with TeamSwitcher
- Links: Standings, Salary Cap, Draft Picks
- Dark mode via shadcn's `ThemeProvider`

#### [NEW] `src/components/nav.tsx`
Navigation sidebar/header:
- Team logo + name (dynamic)
- Nav links with Lucide icons
- Color-themed to match selected team

---

### Standings Page

#### [NEW] `src/app/page.tsx` (Home = Standings)
Server component that fetches standings data.

#### [NEW] `src/components/standings/standings-table.tsx`
- Full standings table (shadcn `Table`)
- Columns: Rank, Team, GP, W, L, OTL, PTS, Streak, L10
- Projected draft pick position
- Playoff position indicator (clinched, wildcard, eliminated)
- Highlighted row for selected team

#### [NEW] `src/components/standings/power-ranking.tsx`
- Last 10 games record + analysis
- Win/loss trend visualization
- Points percentage trend

#### [NEW] `src/components/standings/edge-stats.tsx`
- **Top stats**: Stats where team ranks in top 10 (green badges)
- **Worst stats**: Stats where team ranks in bottom 5 (red badges)
- Stats: Goals/game, Goals against/game, PP%, PK%, Shots/game, Save%, etc.

---

### Salary Cap Page

#### [NEW] `src/app/salary-cap/page.tsx`
Server component fetching salary data.

#### [NEW] `src/components/salary/cap-overview.tsx`
- Total cap hit vs ceiling (progress bar)
- Cap space remaining
- Number of contracts
- LTIR usage if applicable

#### [NEW] `src/components/salary/contracts-table.tsx`
- shadcn `Table` with all player contracts
- Columns: Player, Position, Cap Hit, AAV, Years Remaining, Clause
- Sortable by cap hit, position, years
- Expandable row for contract details

#### [NEW] `src/components/salary/contract-detail.tsx`
- Full contract breakdown
- Year-by-year salary + signing bonuses
- Trade clause details:
  - NMC: badge + list of protected teams
  - NTC: badge + list of allowed trade destinations
  - Modified NTC: partial list with explanation

---

### Draft Picks Page

#### [NEW] `src/app/draft-picks/page.tsx`
Server component fetching draft data.

#### [NEW] `src/components/draft/draft-year-view.tsx`
- Tab/accordion per year (2025, 2026, 2027)
- For each pick: Round, Overall #, Original Team (if traded), Projected Player
- Badge showing "Via [Team]" if pick was acquired in trade

#### [NEW] `src/components/draft/projected-player-card.tsx`
- Player name, position, current team/league
- Scouting report snippet (LLM-generated)
- **Source attribution note** — e.g. "Sources: Bob McKenzie (TSN), Scott Wheeler (The Athletic), Steve Dangle (YouTube)"

---

### CI/CD

#### [NEW] `.github/workflows/ci.yml`
GitHub Actions workflow:
- Triggers on PR to `main`
- Runs: `pnpm install`, `pnpm lint`, `pnpm test`
- Blocks merge if tests fail

---

## Verification Plan

### Automated Tests

All tests use **Jest + React Testing Library**. Run with:
```bash
pnpm test
```

Tests to create:

| Test File | What it Tests |
|---|---|
| `src/__tests__/lib/nhl-api.test.ts` | NHL API functions return correctly shaped data (mocked fetch) |
| `src/__tests__/lib/salary-api.test.ts` | Salary API adapter returns mock data correctly |
| `src/__tests__/components/team-switcher.test.tsx` | Team switcher renders, search works, selection fires callback |
| `src/__tests__/context/team-context.test.tsx` | Context provides/updates team, applies CSS vars |
| `src/__tests__/components/standings-table.test.tsx` | Standings table renders with mock data, highlights selected team |
| `src/__tests__/components/power-ranking.test.tsx` | Power ranking renders last 10 data |
| `src/__tests__/components/edge-stats.test.tsx` | Top/worst stats render with correct color coding |
| `src/__tests__/components/contracts-table.test.tsx` | Contracts table renders, sorts, expands detail |
| `src/__tests__/components/contract-detail.test.tsx` | Trade clauses render correctly (NMC/NTC teams shown) |
| `src/__tests__/components/draft-year-view.test.tsx` | Draft picks render per year, shows "Via" badges |

Each test mocks API responses and validates rendering output. Tests are simple and focused — one assertion per test case where possible.

### Browser Verification
After implementation, use the browser tool to:
1. Open `http://localhost:3000`
2. Verify team selector appears prominently on first load
3. Select a team → verify color scheme changes
4. Navigate to each page (Standings, Salary Cap, Draft Picks)
5. Verify data renders correctly with no console errors
6. Switch to alternate color scheme → verify colors change
7. Test responsive layout at mobile width

### Manual Verification (User)
- Deploy locally with `pnpm dev` and visually inspect
- Confirm team branding matches expectations (especially Blasty for CGY)
- Confirm data accuracy by cross-referencing with NHL.com
