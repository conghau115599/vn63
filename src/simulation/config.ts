/** All coefficients are DESIGN_ASSUMPTION, not measured Vietnamese statistics. */
export const simulationConfig = {
  version: "v1.3-assumptions-1",
  sourceGrade: "ASSUMPTION" as const,
  personality: {
    version: "traits-v1",
    maxMonthlyChange: 0.9,
    baselinePull: 0.008,
    habitRate: 0.22,
  },
  modes: {
    REALISM: {
      eventExposure: 0.065,
      businessCostBps: 10000,
      downturnThreshold: 0.12,
      shockFloor: 0.65,
    },
    HARDSHIP: {
      eventExposure: 0.095,
      businessCostBps: 11000,
      downturnThreshold: 0.22,
      shockFloor: 0.55,
    },
  },
  business: {
    version: "business-v1",
    marketVersion: "regional-sector-v1",
    maxCreditVnd: "20000000",
    monthlyInterestBps: 80,
    validationCostVnd: "200000",
    setupCostVnd: "500000",
    minimumValidatedMonths: 1,
    baseReach: 750,
    referencePriceVnd: 100000,
    baseFixedVnd: "1200000",
    baseUnitCostVnd: "65000",
    maxSales: 500,
  },
};
