import Link from "next/link";
import { paths } from "@/lib/paths";
import { stateByCode } from "@/lib/states";
import type { filterCommunitySources } from "@/lib/community-source-filter";

type SourcePage = ReturnType<typeof filterCommunitySources>;

function pageHref(filters: SourcePage["filters"], page: number) {
  const query = new URLSearchParams();
  for (const [key, value] of Object.entries(filters)) if (value) query.set(key, value);
  if (page > 1) query.set("sourcesPage", String(page));
  return paths.community + (query.size ? "?" + query : "") + "#community-insights";
}

export function CommunitySourceControls({ sources }: { sources: SourcePage }) {
  return <>
    <form method="get" action={paths.community + "#community-insights"} className="community-source-filters" aria-label="Filter external discussions">
      {(["platform", "state", "topic"] as const).map(key => (
        <div className="field" key={key}>
          <label htmlFor={"community-source-" + key}>{key === "platform" ? "Platform" : key === "state" ? "State" : "Topic"}</label>
          <select id={"community-source-" + key} name={key} defaultValue={sources.filters[key]}>
            <option value="">All {key === "platform" ? "platforms" : key === "state" ? "states" : "topics"}</option>
            {sources.options[key].map(value => (
              <option key={value} value={value}>{key === "state" ? stateByCode(value)?.name ?? value : value}</option>
            ))}
          </select>
        </div>
      ))}
      <button className="btn btn-primary" type="submit">Apply filters</button>
      {Object.values(sources.filters).some(Boolean) && <Link href={pageHref({ platform: "", state: "", topic: "" }, 1)}>Clear filters</Link>}
    </form>
    <p className="community-meta">{sources.count} {sources.count === 1 ? "source" : "sources"}</p>
    {sources.count === 0 && <p className="card">No verified external discussions match these filters.</p>}
  </>;
}

export function CommunitySourcePagination({ sources }: { sources: SourcePage }) {
  if (sources.lastPage < 2) return null;
  return <nav className="community-source-pagination" aria-label="External discussion pages">
    {sources.page > 1 && <Link className="btn btn-ghost" href={pageHref(sources.filters, sources.page - 1)} prefetch={false}>Previous sources</Link>}
    <span className="community-meta">Page {sources.page} of {sources.lastPage}</span>
    {sources.page < sources.lastPage && <Link className="btn btn-ghost" href={pageHref(sources.filters, sources.page + 1)} prefetch={false}>Next sources</Link>}
  </nav>;
}
