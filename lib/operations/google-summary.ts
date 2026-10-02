export type Ga4Channel = {
  channel: string;
  sessions: number;
  users: number;
  pageviews: number;
};

export type Ga4Totals = {
  sessions: number;
  users: number;
  pageviews: number;
  channels: Ga4Channel[];
};

export type GscQuery = {
  query: string;
  clicks: number;
  impressions: number;
  ctr: number;
  position: number;
};

export type GscTotals = {
  clicks: number;
  impressions: number;
  rowCount: number;
  topQueries: GscQuery[];
};

function emptyGa4(): Ga4Totals {
  return { sessions: 0, users: 0, pageviews: 0, channels: [] };
}

export function summarizeGa4(json: unknown): Ga4Totals {
  const report = json as {
    rows?: Array<{
      dimensionValues?: Array<{ value?: string }>;
      metricValues?: Array<{ value?: string }>;
    }>;
  };
  const totals = emptyGa4();
  for (const row of report.rows || []) {
    const channel = row.dimensionValues?.[0]?.value || "(unknown)";
    const sessions = Number(row.metricValues?.[0]?.value || 0);
    const users = Number(row.metricValues?.[1]?.value || 0);
    const pageviews = Number(row.metricValues?.[2]?.value || 0);
    totals.sessions += sessions;
    totals.users += users;
    totals.pageviews += pageviews;
    totals.channels.push({ channel, sessions, users, pageviews });
  }
  return totals;
}

export function summarizeGsc(json: unknown): GscTotals {
  const report = json as {
    rows?: Array<{
      keys?: string[];
      clicks?: number;
      impressions?: number;
      ctr?: number;
      position?: number;
    }>;
  };
  const rows = report.rows || [];
  const totals = { clicks: 0, impressions: 0, rowCount: rows.length, topQueries: [] as GscQuery[] };
  for (const row of rows) {
    totals.clicks += row.clicks || 0;
    totals.impressions += row.impressions || 0;
    totals.topQueries.push({
      query: row.keys?.[0] || "",
      clicks: row.clicks || 0,
      impressions: row.impressions || 0,
      ctr: row.ctr || 0,
      position: row.position || 0,
    });
  }
  totals.topQueries = totals.topQueries.slice(0, 10);
  return totals;
}
