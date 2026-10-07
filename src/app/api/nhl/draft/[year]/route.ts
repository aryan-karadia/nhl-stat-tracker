import { getDraftPicks } from "@/lib/nhl-api";

export async function GET(
    _request: Request,
    { params }: { params: Promise<{ year: string }> }
) {
    const { year } = await params;
    const parsedYear = Number(year);

    if (!Number.isInteger(parsedYear) || parsedYear < 1917 || parsedYear > 3000) {
        return Response.json({ error: "Invalid draft year" }, { status: 400 });
    }

    try {
        return Response.json({ picks: await getDraftPicks(parsedYear) });
    } catch (error) {
        console.error("Failed to fetch NHL draft picks:", error);
        return Response.json({ error: "Unable to fetch NHL draft picks" }, { status: 502 });
    }
}
