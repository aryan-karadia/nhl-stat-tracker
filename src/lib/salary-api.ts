import { PlayerContract, TeamCapSummary, Player, TradeClause } from "@/types/nhl";
import { getEnvDataSourceMode, getEnvVar, resolveDataSource } from "@/lib/data-source";
import { extractTablesFromHtml, findTableByHeaders, parseCurrencyToNumber, parseIntegerFromText, rowToRecord } from "@/lib/scrape-utils";

// ============================================================
// Salary Cap Data Adapter
// Currently uses mock data. Swap this module's implementation
// to connect to a live source (PuckPedia, RapidAPI, etc.)
// ============================================================

const CURRENT_SALARY_CAP = 95_000_000; // 2025-26 salary cap
const SALARY_DATA_MODE = getEnvDataSourceMode("NEXT_PUBLIC_SALARY_DATA_MODE");
const SALARY_LIVE_URL_TEMPLATE =
  getEnvVar("NEXT_PUBLIC_SALARY_LIVE_URL_TEMPLATE") || getEnvVar("SALARY_LIVE_URL_TEMPLATE");

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
      clause: { type: "M-NTC", details: "Can be traded to 10 teams", allowedTeams: ["TOR", "MTL", "VAN", "EDM", "CGY", "OTT", "WPG", "NYR", "BOS", "CHI"] },
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
      clause: { type: "M-NTC", details: "Can be traded to 8 teams", allowedTeams: ["FLA", "TBL", "CAR", "NSH", "DAL", "COL", "VGK", "LAK"] },
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

function getFirstAndLastName(fullName: string): { firstName: string; lastName: string } {
  const parts = fullName.trim().split(/\s+/).filter(Boolean);
  const firstName = parts[0] || "Unknown";
  const lastName = parts.slice(1).join(" ") || "Player";
  return { firstName, lastName };
}

function parseClause(clauseText: string): TradeClause {
  const normalized = clauseText.toUpperCase();
  if (normalized.includes("NMC")) {
    return { type: "NMC", details: clauseText || "No-movement clause", allowedTeams: [] };
  }
  if (normalized.includes("M-NTC") || normalized.includes("MODIFIED")) {
    return { type: "M-NTC", details: clauseText || "Modified no-trade clause" };
  }
  if (normalized.includes("NTC")) {
    return { type: "NTC", details: clauseText || "No-trade clause" };
  }
  return { type: "none", details: clauseText || "No trade protection" };
}

function createContractFromScrapedRow(teamAbbrev: string, row: Record<string, string>, idx: number): PlayerContract {
  const fullName =
    row.player || row.name || row.skater || row["player name"] || row["full name"] || `Player ${idx + 1}`;
  const capHit = parseCurrencyToNumber(row["cap hit"] || row.aav || row.salary || row["caphit"] || "0");
  const yearsRemaining = Math.max(1, parseIntegerFromText(row.term || row.years || row["years remaining"] || "1", 1));
  const position = row.pos || row.position || "F";
  const jerseyNumber = row["#"] || row.number || row.no || String(10 + idx);
  const clauseText = row.clause || row["trade clause"] || row["no trade"] || "";

  const { firstName, lastName } = getFirstAndLastName(fullName);

  const player: Player = {
    id: 9_000_000 + idx + teamAbbrev.charCodeAt(0) * 100,
    firstName,
    lastName,
    fullName,
    position,
    jerseyNumber,
    headshot: "https://assets.nhle.com/mugs/nhl/default-skater.png",
  };

  const contractYears = Array.from({ length: yearsRemaining }, (_, yearIdx) => ({
    season: `${2025 + yearIdx}-${2026 + yearIdx}`,
    baseSalary: capHit * 0.85,
    signingBonus: capHit * 0.15,
    capHit,
    totalSalary: capHit,
  }));

  return {
    player,
    teamAbbrev,
    capHit,
    aav: capHit,
    totalValue: capHit * yearsRemaining,
    yearsRemaining,
    contractYears,
    expiryStatus: yearsRemaining <= 2 ? "UFA" : "RFA",
    signingDate: "2024-07-01",
    tradeClause: parseClause(clauseText),
  };
}

/**
 * First live scraper implementation.
 * Provide `NEXT_PUBLIC_SALARY_LIVE_URL_TEMPLATE` with `{team}` placeholder.
 */
async function getLiveContracts(teamAbbrev: string): Promise<PlayerContract[]> {
  if (!SALARY_LIVE_URL_TEMPLATE) {
    throw new Error("Salary live URL template is not configured.");
  }

  const liveUrl = SALARY_LIVE_URL_TEMPLATE.replace("{team}", teamAbbrev.toLowerCase());
  const response = await fetch(liveUrl, {
    headers: {
      "User-Agent": "nhl-stat-tracker/1.0 (+personal-project)",
    },
  });

  if (!response.ok) {
    throw new Error(`Salary source request failed with ${response.status}`);
  }

  const html = await response.text();
  const tables = extractTablesFromHtml(html);
  const salaryTable = findTableByHeaders(tables, ["player", "cap"]);

  if (!salaryTable) {
    throw new Error("No salary table found in live source HTML.");
  }

  const contracts = salaryTable.rows
    .map((row, idx) => createContractFromScrapedRow(teamAbbrev, rowToRecord(salaryTable.headers, row), idx))
    .filter((contract) => contract.capHit > 0);

  if (contracts.length === 0) {
    throw new Error("Live salary table parsed but no valid contracts were extracted.");
  }

  return contracts;
}

export async function getPlayerContracts(teamAbbrev: string): Promise<PlayerContract[]> {
  return resolveDataSource(teamAbbrev, {
    mode: SALARY_DATA_MODE,
    getMock: async (abbrev) => {
      // Simulate network delay for realistic UX in mock mode.
      await new Promise((r) => setTimeout(r, 200));
      return generateMockContracts(abbrev);
    },
    getLive: getLiveContracts,
    isLiveResultValid: (contracts) => contracts.length > 0,
    onLiveError: (error) => {
      console.warn("Falling back to mock salary data:", error);
    },
  });
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
