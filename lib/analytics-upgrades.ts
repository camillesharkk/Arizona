import { rememberUpgradeSource, trackAnalyticsEvent } from "./analytics.ts";

/** Observe actual visibility, including links rendered after quiz results load. */
export function observeUpgradeLinks(root: Document = document) {
  const observed = new WeakSet<HTMLAnchorElement>();
  const seen = new Set<string>();
  const source = (link: HTMLAnchorElement) => link.dataset.upgradeSource ||
    (link.closest("header") ? "header" : link.closest("footer") ? "footer" : "page_content");
  const isUpgrade = (link: HTMLAnchorElement) => {
    try {
      const url = new URL(link.href, window.location.href);
      return url.origin === window.location.origin && url.pathname.replace(/\/$/, "") === "/pricing";
    } catch { return false; }
  };
  const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
      const link = entry.target as HTMLAnchorElement;
      const entryPoint = source(link);
      if (!seen.has(entryPoint)) {
        seen.add(entryPoint);
        trackAnalyticsEvent("upgrade_view", { entry_point: entryPoint });
      }
      observer?.unobserve(link);
    }
  }, { threshold: 0.5 });
  const scan = () => {
    root.querySelectorAll<HTMLAnchorElement>('a[href]').forEach((link) => {
      if (observed.has(link) || !isUpgrade(link)) return;
      observed.add(link);
      observer?.observe(link);
    });
  };
  const click = (event: MouseEvent) => {
    if (event.button !== 0 && event.button !== 1) return;
    const link = event.target instanceof Element ? event.target.closest<HTMLAnchorElement>("a[href]") : null;
    if (!link || !isUpgrade(link)) return;
    const entryPoint = source(link);
    rememberUpgradeSource(entryPoint);
    trackAnalyticsEvent("upgrade_click", { entry_point: entryPoint });
  };
  scan();
  const mutations = new MutationObserver(scan);
  mutations.observe(root.body, { childList: true, subtree: true });
  root.addEventListener("click", click, true);
  root.addEventListener("auxclick", click, true);
  return () => {
    mutations.disconnect();
    observer?.disconnect();
    root.removeEventListener("click", click, true);
    root.removeEventListener("auxclick", click, true);
  };
}
