# NHL Stat Tracker — Task Breakdown

## Phase 1: Project Setup & Scaffolding
- [ ] Initialize Next.js project with pnpm
- [ ] Install and configure shadcn/ui (Tailwind, Lucide, Inter font)
- [ ] Configure Jest + React Testing Library
- [ ] Set up project folder structure (`app/`, `lib/`, `components/`, `types/`, `__tests__/`)
- [ ] Set up GitHub Actions CI/CD pipeline (run tests on PR)

## Phase 2: Data Layer & API Integration
- [ ] Create NHL API service (`lib/nhl-api.ts`) — standings, roster, draft picks
- [ ] Create salary cap data service (`lib/salary-api.ts`) — player contracts, cap hit
- [ ] Define TypeScript types for all data models (`types/`)
- [ ] Implement server-side data fetching with Next.js Route Handlers / Server Components
- [ ] Add caching strategy (Next.js `fetch` cache + `revalidate`)

## Phase 3: Team Switcher & Theming (User picks team first)
- [ ] Create team data config — all 32 teams with colors (primary, alternate), abbreviations, logos
- [ ] Build TeamSwitcher component (shadcn Select/Combobox)
- [ ] Implement CSS custom property theming that swaps on team change
- [ ] Create TeamContext (React Context) for global team state
- [ ] Write tests for TeamSwitcher + theming

## Phase 4: Standings Page
- [ ] Build standings table component with current standings data
- [ ] Add projected draft pick column
- [ ] Add projected playoff position indicator
- [ ] Power ranking section (last 10 games analysis)
- [ ] Top edge stats section (top 10 in league)
- [ ] Worst edge stats section (bottom 5 in league)
- [ ] Write tests for standings components

## Phase 5: Salary Cap Page
- [ ] Build salary cap overview component (team cap usage, space remaining)
- [ ] Player contract breakdown table
- [ ] Contract detail view (years, AAV, clauses)
- [ ] Trade clause display (NMC/NTC with allowed teams list)
- [ ] Write tests for salary cap components

## Phase 6: Draft Picks Page
- [ ] Build draft picks by year view
- [ ] Show projected player for each pick
- [ ] Note original team if pick was traded
- [ ] Write tests for draft picks components

## Phase 7: Polish & Verification
- [ ] Responsive design pass
- [ ] Dark mode support
- [ ] Error/loading states (skeletons)
- [ ] Run full test suite
- [ ] Browser-based verification of all features
- [ ] Write walkthrough document
