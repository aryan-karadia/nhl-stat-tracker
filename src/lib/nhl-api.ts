import { Standing, TeamStat, TeamStatsCollection, PowerRanking } from "@/types/nhl";

const NHL_API_BASE = "https://api-web.nhle.com/v1";

// ============================================================
// Standings
// ============================================================

interface NHLStandingsResponse {
  standings: Array<{
    teamAbbrev: { default: string };
    teamName: { default: string };
    teamLogo: string;
    divisionName: string;
    conferenceName: string;
    gamesPlayed: number;
    wins: number;
    losses: number;
    otLosses: number;
    points: number;
    pointPctg: number;
    regulationWins: number;
    goalFor: number;
    goalAgainst: number;
    goalDifferential: number;
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
  }>;
}

export async function getStandings(): Promise<Standing[]> {
  const res = await fetch(`${NHL_API_BASE}/standings/now`, {
    next: { revalidate: 300 }, // 5-minute cache
  });

  if (!res.ok) throw new Error(`NHL API Error: ${res.status}`);

  const data: NHLStandingsResponse = await res.json();

  return data.standings.map((s) => ({
    teamAbbrev: s.teamAbbrev.default,
    teamName: s.teamName.default,
    teamLogo: s.teamLogo,
    divisionName: s.divisionName,
    conferenceName: s.conferenceName,
    gamesPlayed: s.gamesPlayed,
    wins: s.wins,
    losses: s.losses,
    otLosses: s.otLosses,
    points: s.points,
    pointsPctg: s.pointPctg,
    regulationWins: s.regulationWins,
    goalsFor: s.goalFor,
    goalsAgainst: s.goalAgainst,
    goalDiff: s.goalDifferential,
    streakCode: s.streakCode,
    streakCount: s.streakCount,
    l10Wins: s.l10Wins,
    l10Losses: s.l10Losses,
    l10OtLosses: s.l10OtLosses,
    wildcardSequence: s.wildcardSequence,
    divisionSequence: s.divisionSequence,
    conferenceSequence: s.conferenceSequence,
    leagueSequence: s.leagueSequence,
    clinchIndicator: s.clinchIndicator,
  }));
}

// ============================================================
// Team Stats (for edge stats / power ranking)
// ============================================================

/**
 * Interface for NHL Club Stats API response.
 * Reserved for future use when integrating with the official NHL club statistics endpoint.
 * The NHL API returns season stats in a nested format that will be typed here.
 * Currently, stats are derived from standings data until this integration is implemented.
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface NHLClubStatsResponse {
  // The NHL API returns season stats in a nested format
  [key: string]: unknown;
}

/**
 * Available stat categories from the NHL API.
 * Reserved for future use when fetching detailed club statistics from the NHL API.
 * These definitions will be used to format and display stats once the API integration is complete.
 * Currently, stats are computed from standings data in getTeamStats().
 */
// eslint-disable-next-line @typescript-eslint/no-unused-vars
const STAT_DEFINITIONS: Array<{
  key: string;
  label: string;
  format: "percentage" | "decimal" | "integer";
}> = [
  { key: "goalsForPerGame", label: "Goals For / Game", format: "decimal" },
  { key: "goalsAgainstPerGame", label: "Goals Against / Game", format: "decimal" },
  { key: "powerPlayPct", label: "Power Play %", format: "percentage" },
  { key: "penaltyKillPct", label: "Penalty Kill %", format: "percentage" },
  { key: "shotsForPerGame", label: "Shots For / Game", format: "decimal" },
  { key: "shotsAgainstPerGame", label: "Shots Against / Game", format: "decimal" },
  { key: "faceoffWinPct", label: "Faceoff Win %", format: "percentage" },
  { key: "savePct", label: "Save %", format: "percentage" },
  { key: "shootingPct", label: "Shooting %", format: "percentage" },
];

/**
 * Compute team stats with league rankings.
 * We fetch all standings and compute ranking based on stat comparisons.
 */
export async function getTeamStats(teamAbbrev: string): Promise<TeamStatsCollection> {
  const standings = await getStandings();
  const team = standings.find((s) => s.teamAbbrev === teamAbbrev);
  if (!team) throw new Error(`Team ${teamAbbrev} not found`);

  // Derive stats from standings data
  const allTeamStats = standings.map((s) => ({
    abbrev: s.teamAbbrev,
    goalsForPerGame: s.gamesPlayed > 0 ? s.goalsFor / s.gamesPlayed : 0,
    goalsAgainstPerGame: s.gamesPlayed > 0 ? s.goalsAgainst / s.gamesPlayed : 0,
    pointsPctg: s.pointsPctg,
  }));

  // Build stat rankings
  const stats: TeamStat[] = [];

  // Goals For per game
  const gfSorted = [...allTeamStats].sort((a, b) => b.goalsForPerGame - a.goalsForPerGame);
  const teamGF = team.gamesPlayed > 0 ? team.goalsFor / team.gamesPlayed : 0;
  stats.push({
    name: "goalsForPerGame",
    label: "Goals For / Game",
    value: parseFloat(teamGF.toFixed(2)),
    rank: gfSorted.findIndex((s) => s.abbrev === teamAbbrev) + 1,
    leagueAvg: parseFloat((gfSorted.reduce((a, b) => a + b.goalsForPerGame, 0) / gfSorted.length).toFixed(2)),
    format: "decimal",
  });

  // Goals Against per game (lower is better, rank ascending)
  const gaSorted = [...allTeamStats].sort((a, b) => a.goalsAgainstPerGame - b.goalsAgainstPerGame);
  const teamGA = team.gamesPlayed > 0 ? team.goalsAgainst / team.gamesPlayed : 0;
  stats.push({
    name: "goalsAgainstPerGame",
    label: "Goals Against / Game",
    value: parseFloat(teamGA.toFixed(2)),
    rank: gaSorted.findIndex((s) => s.abbrev === teamAbbrev) + 1,
    leagueAvg: parseFloat((gaSorted.reduce((a, b) => a + b.goalsAgainstPerGame, 0) / gaSorted.length).toFixed(2)),
    format: "decimal",
  });

  // Points percentage
  const ppSorted = [...allTeamStats].sort((a, b) => b.pointsPctg - a.pointsPctg);
  stats.push({
    name: "pointsPctg",
    label: "Points %",
    value: parseFloat((team.pointsPctg * 100).toFixed(1)),
    rank: ppSorted.findIndex((s) => s.abbrev === teamAbbrev) + 1,
    leagueAvg: parseFloat(((ppSorted.reduce((a, b) => a + b.pointsPctg, 0) / ppSorted.length) * 100).toFixed(1)),
    format: "percentage",
  });

  // Goal differential per game
  const gdPerGame = allTeamStats.map((s) => ({
    ...s,
    gdPerGame: s.goalsForPerGame - s.goalsAgainstPerGame,
  }));
  const gdSorted = [...gdPerGame].sort((a, b) => b.gdPerGame - a.gdPerGame);
  const teamGD = teamGF - teamGA;
  stats.push({
    name: "goalDiffPerGame",
    label: "Goal Diff / Game",
    value: parseFloat(teamGD.toFixed(2)),
    rank: gdSorted.findIndex((s) => s.abbrev === teamAbbrev) + 1,
    leagueAvg: parseFloat((gdSorted.reduce((a, b) => a + b.gdPerGame, 0) / gdSorted.length).toFixed(2)),
    format: "decimal",
  });

  return {
    teamAbbrev,
    stats,
    topStats: stats.filter((s) => s.rank <= 10),
    worstStats: stats.filter((s) => s.rank >= 28), // bottom 5
  };
}

// ============================================================
// Power Ranking (Last 10 Games)
// ============================================================

export async function getPowerRanking(teamAbbrev: string): Promise<PowerRanking> {
  const standings = await getStandings();
  const team = standings.find((s) => s.teamAbbrev === teamAbbrev);
  if (!team) throw new Error(`Team ${teamAbbrev} not found`);

  const l10Record = `${team.l10Wins}-${team.l10Losses}-${team.l10OtLosses}`;
  const l10Points = team.l10Wins * 2 + team.l10OtLosses;
  const l10PointsPctg = l10Points / 20; // max 20 points in 10 games

  // Power rank score: weighted combination
  const powerRankScore = Math.round(l10PointsPctg * 100);

  let trend: "hot" | "warm" | "cold";
  if (l10PointsPctg >= 0.7) trend = "hot";
  else if (l10PointsPctg >= 0.5) trend = "warm";
  else trend = "cold";

  return {
    teamAbbrev,
    last10Games: [], // Would need schedule API for game-by-game
    last10Record: l10Record,
    last10PointsPctg: parseFloat((l10PointsPctg * 100).toFixed(1)),
    powerRankScore,
    trend,
  };
}

// ============================================================
// Draft Picks
// ============================================================

interface NHLDraftResponse {
  picks: Array<{
    round: number;
    pickInRound: number;
    overallPickNumber: number;
    teamAbbrev: string;
    originalTeamAbbrev?: string;
    firstName: string;
    lastName: string;
    positionCode: string;
    amateurClubName: string;
    amateurLeague: string;
  }>;
}

export async function getDraftPicks(year: number): Promise<NHLDraftResponse["picks"]> {
  const res = await fetch(`${NHL_API_BASE}/draft/picks/${year}/all`, {
    next: { revalidate: 3600 }, // 1-hour cache
  });

  if (!res.ok) {
    // Draft data might not exist for future years
    if (res.status === 404) return [];
    throw new Error(`NHL API Error: ${res.status}`);
  }

  const data: NHLDraftResponse = await res.json();
  return data.picks || [];
}

// ============================================================
// Team Roster
// ============================================================

interface NHLRosterPlayer {
  id: number;
  headshot: string;
  firstName: { default: string };
  lastName: { default: string };
  positionCode: string;
  sweaterNumber: number;
}

interface NHLRosterResponse {
  forwards: NHLRosterPlayer[];
  defensemen: NHLRosterPlayer[];
  goalies: NHLRosterPlayer[];
}

export async function getTeamRoster(teamAbbrev: string): Promise<NHLRosterResponse> {
  const res = await fetch(`${NHL_API_BASE}/roster/${teamAbbrev}/current`, {
    next: { revalidate: 3600 },
  });

  if (!res.ok) throw new Error(`NHL API Error: ${res.status}`);
  return res.json();
}
