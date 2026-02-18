import { PlayerContract, TeamCapSummary, Player, TradeClause } from "@/types/nhl";

// ============================================================
// Salary Cap Data Adapter
// Currently uses mock data. Swap this module's implementation
// to connect to a live source (PuckPedia, RapidAPI, etc.)
// ============================================================

const CURRENT_SALARY_CAP = 88_000_000; // 2024-25 salary cap

/**
 * Generate mock contract data for a team's roster.
 * In production, this would fetch from a salary data API.
 */
function generateMockContracts(teamAbbrev: string): PlayerContract[] {
  // Mock contracts — realistic structure with varied data
  const mockPlayers: Array<{
    name: string;
    pos: string;
    num: string;
    capHit: number;
    years: number;
    clause: TradeClause;
  }> = [
    {
      name: "Star Forward",
      pos: "C",
      num: "97",
      capHit: 12_500_000,
      years: 5,
      clause: { type: "NMC", details: "Full no-movement clause", allowedTeams: [] },
    },
    {
      name: "Top Winger",
      pos: "LW",
      num: "29",
      capHit: 9_500_000,
      years: 4,
      clause: { type: "M-NTC", details: "Modified no-trade clause — 10-team list", allowedTeams: ["TOR", "MTL", "VAN", "EDM", "CGY", "OTT", "WPG", "NYR", "BOS", "CHI"] },
    },
    {
      name: "Elite Defenseman",
      pos: "D",
      num: "44",
      capHit: 8_200_000,
      years: 6,
      clause: { type: "NTC", details: "Full no-trade clause" },
    },
    {
      name: "Second Line Center",
      pos: "C",
      num: "18",
      capHit: 6_000_000,
      years: 3,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Scoring Winger",
      pos: "RW",
      num: "88",
      capHit: 5_750_000,
      years: 2,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Shutdown Defenseman",
      pos: "D",
      num: "5",
      capHit: 5_500_000,
      years: 4,
      clause: { type: "M-NTC", details: "Modified NTC — 8-team no-trade list", allowedTeams: ["FLA", "TBL", "CAR", "NSH", "DAL", "COL", "VGK", "LAK"] },
    },
    {
      name: "Starting Goalie",
      pos: "G",
      num: "35",
      capHit: 5_000_000,
      years: 3,
      clause: { type: "NTC", details: "Full no-trade clause" },
    },
    {
      name: "Third Line Winger",
      pos: "LW",
      num: "11",
      capHit: 3_500_000,
      years: 2,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Third Line Center",
      pos: "C",
      num: "15",
      capHit: 3_000_000,
      years: 1,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Bottom Six Forward",
      pos: "RW",
      num: "23",
      capHit: 2_000_000,
      years: 2,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Third Pair D",
      pos: "D",
      num: "6",
      capHit: 1_800_000,
      years: 1,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Fourth Line Center",
      pos: "C",
      num: "22",
      capHit: 1_200_000,
      years: 1,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Depth Winger",
      pos: "LW",
      num: "42",
      capHit: 900_000,
      years: 2,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Bottom Pair D",
      pos: "D",
      num: "3",
      capHit: 850_000,
      years: 1,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Backup Goalie",
      pos: "G",
      num: "40",
      capHit: 1_500_000,
      years: 2,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Energy Forward",
      pos: "RW",
      num: "17",
      capHit: 1_100_000,
      years: 1,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Seventh Defenseman",
      pos: "D",
      num: "53",
      capHit: 775_000,
      years: 2,
      clause: { type: "none", details: "No trade protection" },
    },
    {
      name: "Extra Forward",
      pos: "C",
      num: "62",
      capHit: 775_000,
      years: 1,
      clause: { type: "none", details: "No trade protection" },
    },
  ];

  return mockPlayers.map((p, idx) => {
    const player: Player = {
      id: 8470000 + idx + (teamAbbrev.charCodeAt(0) * 100),
      firstName: p.name.split(" ")[0],
      lastName: p.name.split(" ").slice(1).join(" "),
      fullName: p.name,
      position: p.pos,
      jerseyNumber: p.num,
      headshot: `https://assets.nhle.com/mugs/nhl/default-skater.png`,
    };

    const contractYears = Array.from({ length: p.years }, (_, i) => ({
      season: `${2024 + i}-${2025 + i}`,
      baseSalary: p.capHit * 0.8,
      signingBonus: p.capHit * 0.2,
      capHit: p.capHit,
      totalSalary: p.capHit,
    }));

    return {
      player,
      teamAbbrev,
      capHit: p.capHit,
      aav: p.capHit,
      totalValue: p.capHit * p.years,
      yearsRemaining: p.years,
      contractYears,
      expiryStatus: p.years <= 2 ? "UFA" as const : "RFA" as const,
      signingDate: "2023-07-01",
      tradeClause: p.clause,
    };
  });
}

// ============================================================
// Public API
// ============================================================

export async function getPlayerContracts(teamAbbrev: string): Promise<PlayerContract[]> {
  // Simulate network delay for realistic UX
  await new Promise((r) => setTimeout(r, 200));
  // Temporarily throw an error to demonstrate error UI
  throw new Error("API Error: Failed to fetch salary data");
  return generateMockContracts(teamAbbrev);
}

export async function getTeamCapSummary(teamAbbrev: string): Promise<TeamCapSummary> {
  const contracts = await getPlayerContracts(teamAbbrev);
  const totalCapHit = contracts.reduce((sum, c) => sum + c.capHit, 0);

  return {
    teamAbbrev,
    salaryCap: CURRENT_SALARY_CAP,
    totalCapHit,
    capSpace: CURRENT_SALARY_CAP - totalCapHit,
    activeRoster: contracts.length,
    deadCap: 0,
    ltirPool: 0,
    contractsCount: contracts.length,
  };
}
