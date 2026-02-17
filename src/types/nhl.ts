// ============================================================
// NHL Stat Tracker — Core Type Definitions
// ============================================================

// ---- Team ----
export interface TeamColors {
  primary: string;
  secondary: string;
  accent: string;
  text: string;
}

export interface TeamConfig {
  id: number;
  name: string;
  abbreviation: string;
  city: string;
  division: string;
  conference: string;
  logoUrl: string;
  colors: {
    regular: TeamColors;
    alternate: TeamColors;
  };
}

export type ColorScheme = "regular" | "alternate";

// ---- Standings ----
export interface Standing {
  teamAbbrev: string;
  teamName: string;
  teamLogo: string;
  divisionName: string;
  conferenceName: string;
  gamesPlayed: number;
  wins: number;
  losses: number;
  otLosses: number;
  points: number;
  pointsPctg: number;
  regulationWins: number;
  goalsFor: number;
  goalsAgainst: number;
  goalDiff: number;
  streakCode: string;
  streakCount: number;
  l10Wins: number;
  l10Losses: number;
  l10OtLosses: number;
  wildcardSequence: number;
  divisionSequence: number;
  conferenceSequence: number;
  leagueSequence: number;
  clinchIndicator?: string;
}

// ---- Player & Contracts ----
export interface Player {
  id: number;
  firstName: string;
  lastName: string;
  fullName: string;
  position: string;
  jerseyNumber: string;
  headshot: string;
}

export type TradeClauseType = "NMC" | "NTC" | "M-NTC" | "none";

export interface TradeClause {
  type: TradeClauseType;
  details: string;
  allowedTeams?: string[]; // team abbreviations
}

export interface ContractYear {
  season: string;
  baseSalary: number;
  signingBonus: number;
  capHit: number;
  totalSalary: number;
}

export interface PlayerContract {
  player: Player;
  teamAbbrev: string;
  capHit: number;
  aav: number;
  totalValue: number;
  yearsRemaining: number;
  contractYears: ContractYear[];
  expiryStatus: "UFA" | "RFA" | "10.2(c)";
  signingDate: string;
  tradeClause: TradeClause;
}

export interface TeamCapSummary {
  teamAbbrev: string;
  salaryCap: number;
  totalCapHit: number;
  capSpace: number;
  activeRoster: number;
  deadCap: number;
  ltirPool: number;
  contractsCount: number;
}

// ---- Draft Picks ----
export interface DraftProjection {
  playerName: string;
  position: string;
  currentTeam: string;
  league: string;
  scoutingReport: string;
  sources: string[];
}

export interface DraftPick {
  year: number;
  round: number;
  overallPick: number | null; // null if not yet determined
  teamAbbrev: string;
  originalTeamAbbrev: string; // differs if pick was traded
  isOwnPick: boolean;
  projection: DraftProjection | null;
}

// ---- Team Stats (Edge Stats) ----
export interface TeamStat {
  name: string;
  label: string;
  value: number;
  rank: number; // 1-32
  leagueAvg: number;
  format: "percentage" | "decimal" | "integer";
}

export interface TeamStatsCollection {
  teamAbbrev: string;
  stats: TeamStat[];
  topStats: TeamStat[]; // top 10 in league
  worstStats: TeamStat[]; // bottom 5 in league
}

// ---- Power Ranking ----
export interface GameResult {
  date: string;
  opponent: string;
  opponentLogo: string;
  result: "W" | "L" | "OTL";
  score: string;
  goalsFor: number;
  goalsAgainst: number;
}

export interface PowerRanking {
  teamAbbrev: string;
  last10Games: GameResult[];
  last10Record: string;
  last10PointsPctg: number;
  powerRankScore: number; // 0-100 computed score
  trend: "hot" | "warm" | "cold";
}
