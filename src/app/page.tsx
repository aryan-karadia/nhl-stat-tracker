<<<<<<< feature/salary-cap
import { StandingsPageClient } from "./client";
import { getStandings } from "@/lib/nhl-api";

export default async function StandingsPage() {
  const standings = await getStandings();

  return <StandingsPageClient standings={standings} />;
}
=======
import { StandingsPageClient } from "./client";
import { getStandings } from "@/lib/nhl-api";

export default async function StandingsPage() {
  const standings = await getStandings();

  return <StandingsPageClient standings={standings} />;
}
>>>>>>> main
