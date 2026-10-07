import { getTeamRoster } from "@/lib/nhl-api";

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
        return Response.json(await getTeamRoster(normalizedTeamAbbrev));
    } catch (error) {
        console.error("Failed to fetch NHL team roster:", error);
        return Response.json({ error: "Unable to fetch NHL team roster" }, { status: 502 });
    }
}
