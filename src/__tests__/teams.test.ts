import { getTeamByAbbrev, getTeamsByDivision, NHL_TEAMS, DEFAULT_TEAM_ABBREV } from "@/lib/teams";

describe("teams", () => {
  it("should have 32 teams", () => {
    expect(NHL_TEAMS).toHaveLength(32);
  });

  it("should have a default team", () => {
    const defaultTeam = getTeamByAbbrev(DEFAULT_TEAM_ABBREV);
    expect(defaultTeam).toBeDefined();
    expect(defaultTeam?.name).toBe("Calgary Flames");
  });

  it("should find team by abbreviation", () => {
    const bruins = getTeamByAbbrev("BOS");
    expect(bruins).toBeDefined();
    expect(bruins?.name).toBe("Boston Bruins");
    expect(bruins?.conference).toBe("Eastern");
    expect(bruins?.division).toBe("Atlantic");
  });

  it("should return undefined for unknown abbreviation", () => {
    expect(getTeamByAbbrev("XXX")).toBeUndefined();
  });

  it("should group teams by division", () => {
    const divisions = getTeamsByDivision();
    expect(Object.keys(divisions)).toHaveLength(4);
    expect(divisions["Atlantic"]).toBeDefined();
    expect(divisions["Metropolitan"]).toBeDefined();
    expect(divisions["Central"]).toBeDefined();
    expect(divisions["Pacific"]).toBeDefined();
  });

  it("each team should have required color schemes", () => {
    for (const team of NHL_TEAMS) {
      expect(team.colors.regular).toBeDefined();
      expect(team.colors.alternate).toBeDefined();
      expect(team.colors.regular.primary).toMatch(/^#[0-9A-F]{6}$/i);
      expect(team.colors.alternate.primary).toMatch(/^#[0-9A-F]{6}$/i);
    }
  });

  it("all teams should have unique abbreviations", () => {
    const abbrevs = NHL_TEAMS.map((t) => t.abbreviation);
    const unique = new Set(abbrevs);
    expect(unique.size).toBe(abbrevs.length);
  });
});
