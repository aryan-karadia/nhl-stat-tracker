import { getPlayerLanding } from "@/lib/nhl-api";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ playerId: string }> }
) {
    const { playerId } = await params;
    const parsedPlayerId = Number(playerId);

    if (!Number.isInteger(parsedPlayerId) || parsedPlayerId <= 0) {
        return Response.json({ error: "Invalid player ID" }, { status: 400 });
    }

    try {
        return Response.json(await getPlayerLanding(parsedPlayerId));
    } catch (error) {
        console.error("Failed to fetch NHL player profile:", error);
        return Response.json({ error: "Unable to fetch NHL player profile" }, { status: 502 });
    }
}
