import { getEnvDataSourceMode, getEnvVar, resolveDataSource } from "@/lib/data-source";

describe("resolveDataSource", () => {
  it("returns mock data in mock mode", async () => {
    const result = await resolveDataSource("TOR", {
      mode: "mock",
      getMock: (team) => `mock-${team}`,
      getLive: async (team) => `live-${team}`,
    });

    expect(result).toBe("mock-TOR");
  });

  it("returns live data in auto mode when available", async () => {
    const result = await resolveDataSource("TOR", {
      mode: "auto",
      getMock: (team) => `mock-${team}`,
      getLive: async (team) => `live-${team}`,
    });

    expect(result).toBe("live-TOR");
  });

  it("falls back to mock in auto mode when live fails", async () => {
    const result = await resolveDataSource("TOR", {
      mode: "auto",
      getMock: (team) => `mock-${team}`,
      getLive: async () => {
        throw new Error("upstream failed");
      },
    });

    expect(result).toBe("mock-TOR");
  });

  it("throws in live mode when live fails", async () => {
    await expect(
      resolveDataSource("TOR", {
        mode: "live",
        getMock: () => "mock",
        getLive: async () => {
          throw new Error("hard failure");
        },
      })
    ).rejects.toThrow("hard failure");
  });
});

describe("environment helpers", () => {
  const originalProcess = (globalThis as { process?: { env?: Record<string, string | undefined> } }).process;
  const originalConsoleInfo = console.info;

  afterEach(() => {
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process = originalProcess;
    console.info = originalConsoleInfo;
  });

  it("reads env var values safely", () => {
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process = {
      env: {
        TEST_VALUE: "abc",
      },
    };

    expect(getEnvVar("TEST_VALUE")).toBe("abc");
  });

  it("logs env var lookups", () => {
    const infoSpy = jest.spyOn(console, "info").mockImplementation(() => undefined);

    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process = {
      env: {
        TEST_VALUE: "abc",
      },
    };

    expect(getEnvVar("TEST_VALUE")).toBe("abc");
    expect(infoSpy).toHaveBeenCalledWith("[data-source] env lookup", {
      name: "TEST_VALUE",
      value: "abc",
    });
  });

  it("returns fallback mode when env is invalid", () => {
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process = {
      env: {
        TEST_MODE: "invalid",
      },
    };

    expect(getEnvDataSourceMode("TEST_MODE", "auto")).toBe("auto");
  });

  it("returns valid mode from env", () => {
    (globalThis as { process?: { env?: Record<string, string | undefined> } }).process = {
      env: {
        TEST_MODE: "live",
      },
    };

    expect(getEnvDataSourceMode("TEST_MODE", "mock")).toBe("live");
  });
});
