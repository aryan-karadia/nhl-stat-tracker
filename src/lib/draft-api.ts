import { getEnvDataSourceMode, getEnvVar, resolveDataSource } from "@/lib/data-source";
import { getDraftPicks } from "@/lib/nhl-api";
import { DraftPick, DraftProjection } from "@/types/nhl";
import { extractTablesFromHtml, findTableByHeaders, parseIntegerFromText, rowToRecord } from "@/lib/scrape-utils";

const DRAFT_DATA_MODE = getEnvDataSourceMode("NEXT_PUBLIC_DRAFT_DATA_MODE");
const DRAFT_LIVE_URL_TEMPLATE =
  getEnvVar("NEXT_PUBLIC_DRAFT_LIVE_URL_TEMPLATE") || getEnvVar("DRAFT_LIVE_URL_TEMPLATE");

const MOCK_PROJECTIONS: Record<string, DraftProjection> = {
  "1": {
    playerName: "James Hagens",
    position: "C",
    currentTeam: "Boston College",
    league: "NCAA",
    scoutingReport:
      "Elite transition center with speed and high-end playmaking touch. Drives pace and creates controlled entries at a top-line level.",
    sources: ["The Athletic", "EliteProspects", "Daily Faceoff"],
  },
  "2": {
    playerName: "Michael Misa",
    position: "C",
    currentTeam: "Saginaw Spirit",
    league: "OHL",
    scoutingReport:
      "Dynamic offensive center with advanced puck skills and deceptive release. Projects as a high-impact top-six scorer.",
    sources: ["TSN", "EliteProspects"],
  },
  "3": {
    playerName: "Porter Martone",
    position: "RW",
    currentTeam: "Brampton Steelheads",
    league: "OHL",
    scoutingReport:
      "Power winger with a heavy game and refined touch around the net. Blends physicality with high-end finishing tools.",
    sources: ["The Athletic", "McKeen's Hockey"],
  },
  "5": {
    playerName: "Matthew Schaefer",
    position: "D",
    currentTeam: "Erie Otters",
    league: "OHL",
    scoutingReport:
      "Mobile two-way defenseman with strong retrieval habits and clean exits. Projects as a minute-eating top-pair option.",
    sources: ["The Athletic", "FC Hockey"],
  },
  "10": {
    playerName: "Caleb Desnoyers",
    position: "C",
    currentTeam: "Moncton Wildcats",
    league: "QMJHL",
    scoutingReport:
      "Reliable two-way center with high compete and translatable defensive value. Strong faceoff profile and forecheck pressure.",
    sources: ["NHL Central Scouting", "FC Hockey"],
  },
};

const TRADE_SOURCE_TEAMS = ["TOR", "MTL", "BOS", "NYR", "VAN", "EDM", "CGY", "CHI"];

function seededNumber(seed: string, modulo: number): number {
  let hash = 0;
  for (let i = 0; i < seed.length; i++) {
    hash = (hash * 31 + seed.charCodeAt(i)) >>> 0;
  }
  return hash % modulo;
}

function buildMockDraftPicks(teamAbbrev: string, year: number): DraftPick[] {
  const basePick = seededNumber(`${teamAbbrev}-${year}-base`, 28) + 1;
  const picks: DraftPick[] = [];

  const round1TradeSeed = seededNumber(`${teamAbbrev}-${year}-r1-trade`, 10);
  const round1IsTraded = round1TradeSeed >= 7;

  picks.push({
    year,
    round: 1,
    overallPick: year <= 2025 ? basePick : null,
    teamAbbrev,
    originalTeamAbbrev: round1IsTraded
      ? TRADE_SOURCE_TEAMS[seededNumber(`${teamAbbrev}-${year}-r1-src`, TRADE_SOURCE_TEAMS.length)]
      : teamAbbrev,
    isOwnPick: !round1IsTraded,
    projection: MOCK_PROJECTIONS[String(basePick)] ?? null,
  });

  for (let round = 2; round <= 7; round++) {
    const includeRound = seededNumber(`${teamAbbrev}-${year}-r${round}-include`, 10) >= 3;
    if (!includeRound) {
      continue;
    }

    const overallPick = year <= 2025 ? (round - 1) * 32 + basePick : null;
    const isTraded = seededNumber(`${teamAbbrev}-${year}-r${round}-trade`, 10) >= 8;

    picks.push({
      year,
      round,
      overallPick,
      teamAbbrev,
      originalTeamAbbrev: isTraded
        ? TRADE_SOURCE_TEAMS[seededNumber(`${teamAbbrev}-${year}-r${round}-src`, TRADE_SOURCE_TEAMS.length)]
        : teamAbbrev,
      isOwnPick: !isTraded,
      projection: null,
    });
  }

  return picks;
}

async function getLiveTeamDraftPicks(params: { teamAbbrev: string; year: number }): Promise<DraftPick[]> {
  if (DRAFT_LIVE_URL_TEMPLATE) {
    const liveUrl = DRAFT_LIVE_URL_TEMPLATE
      .replace("{team}", params.teamAbbrev.toLowerCase())
      .replace("{year}", String(params.year));

    const response = await fetch(liveUrl, {
      headers: {
        "User-Agent": "nhl-stat-tracker/1.0 (+personal-project)",
      },
    });

    if (!response.ok) {
      throw new Error(`Draft source request failed with ${response.status}`);
    }

    const html = await response.text();
    const tables = extractTablesFromHtml(html);
    const draftTable = findTableByHeaders(tables, ["round", "overall"]);

    if (!draftTable) {
      throw new Error("No draft table found in live source HTML.");
    }

    const parsed = draftTable.rows
      .map((row) => rowToRecord(draftTable.headers, row))
      .map((row) => {
        const rowTeam = (row.team || row["team abbrev"] || row.club || params.teamAbbrev).toUpperCase();
        return {
          year: params.year,
          round: parseIntegerFromText(row.round || "0"),
          overallPick: parseIntegerFromText(row.overall || row.pick || "0"),
          teamAbbrev: rowTeam,
          originalTeamAbbrev: (row.original || row["from team"] || rowTeam).toUpperCase(),
          isOwnPick: true,
          projection: null,
        } as DraftPick;
      })
      .filter((pick) => pick.round > 0 && (pick.overallPick ?? 0) > 0)
      .filter((pick) => pick.teamAbbrev === params.teamAbbrev)
      .map((pick) => ({
        ...pick,
        isOwnPick: pick.originalTeamAbbrev === params.teamAbbrev,
        projection: pick.overallPick ? MOCK_PROJECTIONS[String(pick.overallPick)] ?? null : null,
      }));

    if (parsed.length > 0) {
      return parsed;
    }
  }

  // Fallback to official NHL draft endpoint when no scraper source is configured.
  const livePicks = await getDraftPicks(params.year);

  return livePicks
    .filter((pick) => pick.teamAbbrev === params.teamAbbrev)
    .map((pick) => ({
      year: params.year,
      round: pick.round,
      overallPick: pick.overallPickNumber,
      teamAbbrev: params.teamAbbrev,
      originalTeamAbbrev: pick.originalTeamAbbrev || params.teamAbbrev,
      isOwnPick: !pick.originalTeamAbbrev || pick.originalTeamAbbrev === params.teamAbbrev,
      projection: MOCK_PROJECTIONS[String(pick.overallPickNumber)] ?? null,
    }));
}

export async function getTeamDraftPicks(teamAbbrev: string, year: number): Promise<DraftPick[]> {
  return resolveDataSource(
    { teamAbbrev, year },
    {
      mode: DRAFT_DATA_MODE,
      getMock: ({ teamAbbrev: abbrev, year: draftYear }) => buildMockDraftPicks(abbrev, draftYear),
      getLive: getLiveTeamDraftPicks,
      isLiveResultValid: (picks) => picks.length > 0,
      onLiveError: (error) => {
        console.warn("Falling back to mock draft data:", error);
      },
    }
  );
}
