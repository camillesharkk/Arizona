import { sourcePlatforms } from "./community-source";
import type { CommunityInsight } from "../data/community-insights";

export type CommunitySourceFilters = { platform: string; state: string; topic: string };
type Params = Record<string, string | string[] | undefined>;
const pageSize = 12;

export function filterCommunitySources(insights: readonly CommunityInsight[], params: Params) {
  const options = {
    platform: [...sourcePlatforms],
    state: [...new Set(insights.map(item => item.state))].sort(),
    topic: [...new Set(insights.flatMap(item => item.topic ? [item.topic] : item.keywords))].sort(),
  };

  function selected(key: keyof CommunitySourceFilters) {
    const value = params[key];
    return typeof value === "string" && (options[key] as string[]).includes(value) ? value : "";
  }

  const filters = { platform: selected("platform"), state: selected("state"), topic: selected("topic") };
  const filtered = insights.filter(item =>
    (!filters.platform || item.platform === filters.platform) &&
    (!filters.state || item.state === filters.state) &&
    (!filters.topic || (item.topic ? item.topic === filters.topic : item.keywords.includes(filters.topic))));
  filtered.sort((a, b) => b.updatedAt.localeCompare(a.updatedAt));
  const lastPage = Math.max(1, Math.ceil(filtered.length / pageSize));
  const requested = typeof params.sourcesPage === "string" && /^\d{1,4}$/.test(params.sourcesPage) ? Number(params.sourcesPage) : 1;
  const page = Math.min(lastPage, Math.max(1, requested));
  return { filters, options, page, lastPage, count: filtered.length, results: filtered.slice((page - 1) * pageSize, page * pageSize) };
}
