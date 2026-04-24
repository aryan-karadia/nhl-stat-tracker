describe("getProspectPool", () => {
  const originalFetch = global.fetch;
  const originalProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;

  afterEach(() => {
    global.fetch = originalFetch;
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process = originalProcess;
    jest.resetModules();
  });

  it("returns mock prospect data by default", async () => {
    const module = await import("@/lib/prospects-api");
    const prospects = await module.getProspectPool("TOR");

    expect(Array.isArray(prospects)).toBe(true);
    expect(prospects.length).toBeGreaterThan(0);
    expect(prospects[0].teamAbbrev).toBe("TOR");
  });

  it("uses live scraper in auto mode and falls back to mock if scrape fails", async () => {
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process = {
      env: {
        NEXT_PUBLIC_PROSPECTS_DATA_MODE: "auto",
        NEXT_PUBLIC_PROSPECTS_LIVE_URL_TEMPLATE: "https://example.com/{team}",
      },
    };

    global.fetch = jest.fn().mockResolvedValue({
      ok: true,
      text: async () => "<html><body>No valid table</body></html>",
    }) as unknown as typeof fetch;

    const module = await import("@/lib/prospects-api");
    const prospects = await module.getProspectPool("TOR");

    expect(prospects.length).toBeGreaterThan(0);
    expect(prospects[0].fullName).toBeTruthy();
  });
});
