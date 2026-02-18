import { getPlayerContracts, getTeamCapSummary } from "@/lib/salary-api";

// ── getPlayerContracts ─────────────────────────────────
describe("getPlayerContracts", () => {
  it("returns an array of player contracts", async () => {
    const contracts = await getPlayerContracts("TOR");
    expect(Array.isArray(contracts)).toBe(true);
    expect(contracts.length).toBeGreaterThan(0);
  });

  it("each contract has required fields", async () => {
    const contracts = await getPlayerContracts("TOR");

    for (const contract of contracts) {
      expect(contract.player).toBeDefined();
      expect(contract.player.fullName).toBeDefined();
      expect(contract.player.position).toBeDefined();
      expect(contract.player.jerseyNumber).toBeDefined();
      expect(typeof contract.capHit).toBe("number");
      expect(typeof contract.aav).toBe("number");
      expect(typeof contract.totalValue).toBe("number");
      expect(typeof contract.yearsRemaining).toBe("number");
      expect(contract.contractYears.length).toBeGreaterThan(0);
      expect(contract.tradeClause).toBeDefined();
      expect(contract.tradeClause.type).toBeDefined();
    }
  });

  it("contract years length matches yearsRemaining", async () => {
    const contracts = await getPlayerContracts("TOR");
    for (const contract of contracts) {
      expect(contract.contractYears).toHaveLength(contract.yearsRemaining);
    }
  });

  it("totalValue equals capHit times years", async () => {
    const contracts = await getPlayerContracts("TOR");
    for (const contract of contracts) {
      expect(contract.totalValue).toBe(contract.capHit * contract.yearsRemaining);
    }
  });

  it("player IDs incorporate team abbreviation", async () => {
    const torContracts = await getPlayerContracts("TOR");
    const bosContracts = await getPlayerContracts("BOS");
    // IDs should differ between teams
    expect(torContracts[0].player.id).not.toBe(bosContracts[0].player.id);
  });

  it("sets expiryStatus based on years remaining", async () => {
    const contracts = await getPlayerContracts("TOR");
    for (const contract of contracts) {
      if (contract.yearsRemaining <= 2) {
        expect(contract.expiryStatus).toBe("UFA");
      } else {
        expect(contract.expiryStatus).toBe("RFA");
      }
    }
  });

  it("includes trade clause details", async () => {
    const contracts = await getPlayerContracts("TOR");
    const withClause = contracts.filter((c) => c.tradeClause.type !== "none");
    expect(withClause.length).toBeGreaterThan(0);

    const nmc = contracts.find((c) => c.tradeClause.type === "NMC");
    expect(nmc).toBeDefined();
    expect(nmc!.tradeClause.details).toContain("no-movement");
  });
});

// ── getTeamCapSummary ──────────────────────────────────
describe("getTeamCapSummary", () => {
  it("returns correct team abbreviation", async () => {
    const summary = await getTeamCapSummary("TOR");
    expect(summary.teamAbbrev).toBe("TOR");
  });

  it("has salary cap of 88M", async () => {
    const summary = await getTeamCapSummary("TOR");
    expect(summary.salaryCap).toBe(95_000_000);
  });

  it("cap space equals salaryCap minus totalCapHit", async () => {
    const summary = await getTeamCapSummary("TOR");
    expect(summary.capSpace).toBe(summary.salaryCap - summary.totalCapHit);
  });

  it("totalCapHit equals sum of all contract cap hits", async () => {
    const contracts = await getPlayerContracts("TOR");
    const expectedTotal = contracts.reduce((sum, c) => sum + c.capHit, 0);

    const summary = await getTeamCapSummary("TOR");
    expect(summary.totalCapHit).toBe(expectedTotal);
  });

  it("contractsCount matches number of contracts", async () => {
    const contracts = await getPlayerContracts("TOR");
    const summary = await getTeamCapSummary("TOR");
    expect(summary.contractsCount).toBe(contracts.length);
    expect(summary.activeRoster).toBe(contracts.length);
  });

  it("deadCap and ltirPool are zero (mock data)", async () => {
    const summary = await getTeamCapSummary("TOR");
    expect(summary.deadCap).toBe(0);
    expect(summary.ltirPool).toBe(0);
  });
});
