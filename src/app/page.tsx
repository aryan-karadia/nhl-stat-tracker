import { StandingsPageClient } from "./client";
import { getStandings, getTeamStats, getPowerRanking } from "@/lib/nhl-api";

export default async function StandingsPage() {
  const standings = await getStandings();

  return <StandingsPageClient standings={standings} />;
}
