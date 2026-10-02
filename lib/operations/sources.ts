/** Non-secret identifiers for operations reporting. No API keys. */

export const operationsSources = {
  siteUrl: "https://arizonanotaryprep.com",
  github: {
    repoUrl: "https://github.com/camillesharkk/Arizona",
  },
  vercel: {
    team: "sharkkk",
    project: "arizona",
    dashboardUrl: "https://vercel.com/sharkkk/arizona",
  },
  neon: {
    projectName: "Arizona-notary",
  },
  ga4: {
    propertyId: "552874520",
  },
  searchConsole: {
    siteUrl: "sc-domain:arizonanotaryprep.com",
  },
} as const;
