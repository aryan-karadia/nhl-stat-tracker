import { getDraftPicks } from "@/lib/nhl-api";
import { Prospect } from "@/types/nhl";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ teamAbbrev: string }> }
) {
    const { teamAbbrev } = await params;
    const normalizedTeamAbbrev = teamAbbrev.toUpperCase();

    if (!/^[A-Z]{3}$/.test(normalizedTeamAbbrev)) {
        return Response.json({ error: "Invalid team abbreviation" }, { status: 400 });
    }

    try {
        const currentYear = new Date().getFullYear();
        const years = Array.from({ length: 6 }, (_, index) => currentYear - index);
        const responses = await Promise.all(years.map((year) => getDraftPicks(year)));
        const prospects: Prospect[] = responses
            .flat()
            .filter(
                (pick) =>
                    pick.teamAbbrev === normalizedTeamAbbrev &&
                    pick.firstName &&
                    pick.lastName
            )
            .map((pick) => {
                const firstName = typeof pick.firstName === "string" ? pick.firstName : pick.firstName.default;
                const lastName = typeof pick.lastName === "string" ? pick.lastName : pick.lastName.default;
                const overallPick = pick.overallPickNumber ?? pick.overallPick ?? 0;

                return {
                id: `${normalizedTeamAbbrev}-${pick.draftYear ?? currentYear}-${overallPick}`,
                teamAbbrev: normalizedTeamAbbrev,
                fullName: `${firstName} ${lastName}`,
                position: pick.positionCode,
                age: null,
                currentTeam: pick.amateurClubName,
                league: pick.amateurLeague,
                draftInfo: `${pick.draftYear ?? currentYear} - Round ${pick.round}, Pick ${overallPick}`,
                report: {
                    summary: `Selected ${overallPick}th overall by ${normalizedTeamAbbrev} in the NHL Draft.`,
                    strengths: [],
                    developmentAreas: [],
                    sourceNotes: ["Official NHL Draft API"],
                    confidence: "high",
                },
                };
            });

        return Response.json(prospects);
    } catch (error) {
        console.error("Failed to fetch NHL prospect pool:", error);
        return Response.json({ error: "Unable to fetch NHL prospect pool" }, { status: 502 });
    }
}
