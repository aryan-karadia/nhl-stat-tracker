import { getEnvDataSourceMode, getEnvVar, resolveDataSource } from "@/lib/data-source";
import { getDraftPicks, NHLDraftResponse } from "@/lib/nhl-api";
import { Prospect } from "@/types/nhl";
import { extractTablesFromHtml, findTableByHeaders, parseIntegerFromText, rowToRecord } from "@/lib/scrape-utils";

const PROSPECTS_DATA_MODE = getEnvDataSourceMode("NEXT_PUBLIC_PROSPECTS_DATA_MODE", "live");
const PROSPECTS_LIVE_URL_TEMPLATE =
  getEnvVar("NEXT_PUBLIC_PROSPECTS_LIVE_URL_TEMPLATE") || getEnvVar("PROSPECTS_LIVE_URL_TEMPLATE");

function mockProspectPool(teamAbbrev: string): Prospect[] {
  return [
    {
      id: `${teamAbbrev}-p1`,
      teamAbbrev,
      fullName: "Noah Powell",
      position: "C",
      age: 20,
      currentTeam: "London Knights",
      league: "OHL",
      draftInfo: "2024 - Round 1",
      report: {
        summary:
          "Pace-driving center with strong middle-lane habits. Reliable transition profile and improving finishing touch.",
        strengths: ["Skating acceleration", "Entry creation", "Forecheck pressure"],
        developmentAreas: ["Faceoff detail", "Net-front touch"],
        sourceNotes: ["EliteProspects", "The Athletic", "Public game tracking"],
        confidence: "medium",
      },
    },
    {
      id: `${teamAbbrev}-p2`,
      teamAbbrev,
      fullName: "Lukas Berg",
      position: "D",
      age: 21,
      currentTeam: "Toronto Marlies",
      league: "AHL",
      draftInfo: "2023 - Round 2",
      report: {
        summary:
          "Mobile left-shot defenseman with polished retrieval routes and outlet passing under pressure.",
        strengths: ["Blue-line mobility", "First pass quality", "Defensive gap control"],
        developmentAreas: ["Board battles", "Point shot power"],
        sourceNotes: ["AHL game reports", "Dobber Prospects", "Public microstat tracking"],
        confidence: "high",
      },
    },
    {
      id: `${teamAbbrev}-p3`,
      teamAbbrev,
      fullName: "Ethan Varga",
      position: "RW",
      age: 19,
      currentTeam: "Boston College",
      league: "NCAA",
      draftInfo: "2025 - Round 1",
      report: {
        summary:
          "Shot-first winger with dangerous off-puck timing and quick release from the circles.",
        strengths: ["Shooting mechanics", "Off-puck timing", "Power-play flank threat"],
        developmentAreas: ["Wall play strength", "Defensive route discipline"],
        sourceNotes: ["NCAA video review", "FC Hockey", "Independent scout notes"],
        confidence: "medium",
      },
    },
  ];
}

async function getLiveProspects(teamAbbrev: string): Promise<Prospect[]> {
  if (typeof window !== "undefined") {
    const response = await fetch(`/api/nhl/prospects/${teamAbbrev}`);
    if (!response.ok) {
      throw new Error(`Prospect API request failed with ${response.status}`);
    }
    return response.json();
  }

  if (!PROSPECTS_LIVE_URL_TEMPLATE) {
    return getDraftBasedProspects(teamAbbrev);
  }

  async function getDraftBasedProspects(teamAbbrev: string): Promise<Prospect[]> {
    const currentYear = new Date().getFullYear();
    const years = Array.from({ length: 6 }, (_, index) => currentYear - index);
    const responses = await Promise.all(years.map((year) => getDraftPicks(year)));

    return responses
      .flat()
      .filter((pick) => pick.teamAbbrev === teamAbbrev && pick.firstName && pick.lastName)
      .map((pick) => {
        const firstName = typeof pick.firstName === "string" ? pick.firstName : pick.firstName.default;
        const lastName = typeof pick.lastName === "string" ? pick.lastName : pick.lastName.default;
        const overallPick = pick.overallPickNumber ?? pick.overallPick ?? 0;

        return {
        id: `${teamAbbrev}-${pick.draftYear ?? currentYear}-${overallPick}`,
        teamAbbrev,
        fullName: `${firstName} ${lastName}`,
        position: pick.positionCode,
        age: null,
        currentTeam: pick.amateurClubName,
        league: pick.amateurLeague,
        draftInfo: `${pick.draftYear ?? currentYear} - Round ${pick.round}, Pick ${overallPick}`,
        report: {
          summary: `Selected ${overallPick}th overall by ${teamAbbrev} in the NHL Draft.`,
          strengths: [],
          developmentAreas: [],
          sourceNotes: ["Official NHL Draft API"],
          confidence: "high" as const,
        },
        };
      });
  }

  const liveUrl = PROSPECTS_LIVE_URL_TEMPLATE.replace("{team}", teamAbbrev.toLowerCase());
  const response = await fetch(liveUrl, {
    headers: {
      "User-Agent": "nhl-stat-tracker/1.0 (+personal-project)",
    },
  });

  if (!response.ok) {
    throw new Error(`Prospects source request failed with ${response.status}`);
  }

  const html = await response.text();
  const tables = extractTablesFromHtml(html);
  const prospectsTable = findTableByHeaders(tables, ["player", "position"]);

  if (!prospectsTable) {
    throw new Error("No prospect table found in live source HTML.");
  }

  const prospects = prospectsTable.rows
    .map((row, idx) => {
      const data = rowToRecord(prospectsTable.headers, row);
      const fullName = data.player || data.name || data.prospect || `Prospect ${idx + 1}`;
      const position = data.position || data.pos || "F";
      const age = parseIntegerFromText(data.age || "19", 19);
      const currentTeam = data.team || data.club || data["current team"] || "Unknown Team";
      const league = data.league || data.lg || "Unknown League";
      const summary = data.report || data.summary || data.notes || "Scouting summary unavailable.";

      return {
        id: `${teamAbbrev}-live-${idx + 1}`,
        teamAbbrev,
        fullName,
        position,
        age,
        currentTeam,
        league,
        draftInfo: data.draft || data["draft info"] || undefined,
        report: {
          summary,
          strengths: data.strengths ? data.strengths.split(/,|\//).map((s) => s.trim()).filter(Boolean) : [],
          developmentAreas: data.weaknesses
            ? data.weaknesses.split(/,|\//).map((s) => s.trim()).filter(Boolean)
            : [],
          sourceNotes: [liveUrl],
          confidence: "medium" as const,
        },
      } as Prospect;
    })
    .filter((prospect) => prospect.fullName.length > 0);

  if (prospects.length === 0) {
    throw new Error("Live prospects table parsed but no valid prospects were extracted.");
  }

  return prospects;
}

export async function getProspectPool(teamAbbrev: string): Promise<Prospect[]> {
  return resolveDataSource(teamAbbrev, {
    mode: PROSPECTS_DATA_MODE,
    getMock: mockProspectPool,
    getLive: getLiveProspects,
    isLiveResultValid: (prospects) => prospects.length > 0,
    onLiveError: (error) => {
      console.warn("Falling back to mock prospect scouting data:", error);
    },
  });
}
