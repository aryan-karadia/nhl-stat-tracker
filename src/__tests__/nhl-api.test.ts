import { getStandings, getTeamStats, getPowerRanking, getTeamRoster } from "@/lib/nhl-api";

// Mock global fetch
const mockFetch = jest.fn();
global.fetch = mockFetch;

afterEach(() => {
  mockFetch.mockReset();
});

// ── Helpers ────────────────────────────────────────────
function makeStandingsEntry(overrides: Record<string, unknown> = {}) {
  return {
    teamAbbrev: { default: "TOR" },
    teamName: { default: "Toronto Maple Leafs" },
    teamLogo: "https://logo.png",
    divisionName: "Atlantic",
    conferenceName: "Eastern",
    gamesPlayed: 60,
    wins: 35,
    losses: 20,
    otLosses: 5,
    points: 75,
    pointPctg: 0.625,
    regulationWins: 30,
    goalFor: 200,
    goalAgainst: 170,
    goalDifferential: 30,
    streakCode: "W",
    streakCount: 3,
    l10Wins: 7,
    l10Losses: 2,
    l10OtLosses: 1,
    wildcardSequence: 0,
    divisionSequence: 2,
    conferenceSequence: 4,
    leagueSequence: 6,
    ...overrides,
  };
}

// ── getStandings ───────────────────────────────────────
describe("getStandings", () => {
  it("returns mapped standings data", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ standings: [makeStandingsEntry()] }),
    });

    const standings = await getStandings();
    expect(standings).toHaveLength(1);
    expect(standings[0].teamAbbrev).toBe("TOR");
    expect(standings[0].teamName).toBe("Toronto Maple Leafs");
    expect(standings[0].goalsFor).toBe(200);
    expect(standings[0].goalDiff).toBe(30);
    expect(standings[0].pointsPctg).toBe(0.625);
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(getStandings()).rejects.toThrow("NHL API Error: 500");
  });

  it("calls the correct NHL API endpoint", async () => {
    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => ({ standings: [] }),
    });

    await getStandings();
    expect(mockFetch).toHaveBeenCalledWith(
      "https://api-web.nhle.com/v1/standings/now",
      expect.objectContaining({ next: { revalidate: 300 } })
    );
  });
});

// ── getTeamStats ───────────────────────────────────────
describe("getTeamStats", () => {
  it("returns stats collection with rankings", async () => {
    const teams = [
      makeStandingsEntry({ teamAbbrev: { default: "TOR" }, goalFor: 200, goalAgainst: 170, gamesPlayed: 60, pointPctg: 0.625 }),
      makeStandingsEntry({ teamAbbrev: { default: "MTL" }, goalFor: 150, goalAgainst: 190, gamesPlayed: 60, pointPctg: 0.500 }),
      makeStandingsEntry({ teamAbbrev: { default: "BOS" }, goalFor: 220, goalAgainst: 160, gamesPlayed: 60, pointPctg: 0.700 }),
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ standings: teams }),
    });

    const result = await getTeamStats("TOR");
    expect(result.teamAbbrev).toBe("TOR");
    expect(result.stats.length).toBeGreaterThan(0);

    const gfStat = result.stats.find((s) => s.name === "goalsForPerGame");
    expect(gfStat).toBeDefined();
    expect(gfStat!.rank).toBe(2); // BOS is 1st, TOR is 2nd
  });

  it("throws when team not found", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ standings: [makeStandingsEntry()] }),
    });

    await expect(getTeamStats("XXX")).rejects.toThrow("Team XXX not found");
  });

  it("classifies top and worst stats correctly", async () => {
    // With only 3 teams, all ranks are <= 10, so all should be topStats
    const teams = [
      makeStandingsEntry({ teamAbbrev: { default: "TOR" } }),
      makeStandingsEntry({ teamAbbrev: { default: "MTL" } }),
      makeStandingsEntry({ teamAbbrev: { default: "BOS" } }),
    ];

    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ standings: teams }),
    });

    const result = await getTeamStats("TOR");
    expect(result.topStats.length).toBeGreaterThan(0);
    result.topStats.forEach((s) => expect(s.rank).toBeLessThanOrEqual(10));
  });
});

// ── getPowerRanking ────────────────────────────────────
describe("getPowerRanking", () => {
  it("returns hot trend for strong L10 record", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        standings: [makeStandingsEntry({ l10Wins: 8, l10Losses: 1, l10OtLosses: 1 })],
      }),
    });

    const result = await getPowerRanking("TOR");
    expect(result.trend).toBe("hot");
    expect(result.last10Record).toBe("8-1-1");
    expect(result.powerRankScore).toBeGreaterThanOrEqual(70);
  });

  it("returns cold trend for poor L10 record", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        standings: [makeStandingsEntry({ l10Wins: 2, l10Losses: 7, l10OtLosses: 1 })],
      }),
    });

    const result = await getPowerRanking("TOR");
    expect(result.trend).toBe("cold");
  });

  it("returns warm trend for middling L10 record", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({
        standings: [makeStandingsEntry({ l10Wins: 5, l10Losses: 4, l10OtLosses: 1 })],
      }),
    });

    const result = await getPowerRanking("TOR");
    expect(result.trend).toBe("warm");
  });

  it("throws when team not found", async () => {
    mockFetch.mockResolvedValue({
      ok: true,
      json: async () => ({ standings: [] }),
    });

    await expect(getPowerRanking("XXX")).rejects.toThrow("Team XXX not found");
  });
});


// ── getTeamRoster ──────────────────────────────────────
describe("getTeamRoster", () => {
  it("returns roster data from API", async () => {
    const mockRoster = {
      forwards: [{ id: 1, headshot: "url", firstName: { default: "Auston" }, lastName: { default: "Matthews" }, positionCode: "C", sweaterNumber: 34 }],
      defensemen: [],
      goalies: [],
    };

    mockFetch.mockResolvedValueOnce({
      ok: true,
      json: async () => mockRoster,
    });

    const roster = await getTeamRoster("TOR");
    expect(roster.forwards).toHaveLength(1);
    expect(roster.forwards[0].firstName.default).toBe("Auston");
  });

  it("throws on API error", async () => {
    mockFetch.mockResolvedValueOnce({ ok: false, status: 500 });
    await expect(getTeamRoster("TOR")).rejects.toThrow("NHL API Error: 500");
  });
});
