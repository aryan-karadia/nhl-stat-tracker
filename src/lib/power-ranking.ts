import { PowerRanking, Standing } from "@/types/nhl";

type PowerRankingTeam = Pick<
  Standing,
  "teamAbbrev" | "gamesPlayed" | "l10Wins" | "l10Losses" | "l10OtLosses"
>;

export function calculatePowerRanking(team: PowerRankingTeam): PowerRanking {
  const gamesInSample = Math.min(Math.max(team.gamesPlayed, 0), 10);
  const l10Points = team.l10Wins * 2 + team.l10OtLosses;
  const maxPoints = gamesInSample * 2;
  const l10PointsPctg = maxPoints > 0 ? l10Points / maxPoints : 0;
  const powerRankScore = Math.round(l10PointsPctg * 100);

  let trend: PowerRanking["trend"];
  if (l10PointsPctg >= 0.7) trend = "hot";
  else if (l10PointsPctg >= 0.5) trend = "warm";
  else trend = "cold";

  return {
    teamAbbrev: team.teamAbbrev,
    last10Games: [],
    last10Record: `${team.l10Wins}-${team.l10Losses}-${team.l10OtLosses}`,
    last10PointsPctg: parseFloat((l10PointsPctg * 100).toFixed(1)),
    powerRankScore,
    trend,
  };
}
