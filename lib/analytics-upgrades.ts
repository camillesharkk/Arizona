import { isPricingPath, rememberUpgradeSource, trackAnalyticsEvent } from "./analytics.ts";
import { LIFETIME_PRO_PRODUCT_CODE, SITE_PRO_PRODUCT_CODE } from "./pro-products.ts";

/** Observe actual visibility, including links rendered after quiz results load. */
export function observeUpgradeLinks(root: Document = document) {
  const observed = new WeakSet<HTMLAnchorElement>();
  const seen = new Set<string>();
  const source = (link: HTMLAnchorElement) => link.dataset.upgradeSource ||
    (link.closest("header") ? "header" : link.closest("footer") ? "footer" : "page_content");
  const context = (link: HTMLAnchorElement) => {
    const mode = link.dataset.upgradeMode;
    const count = Number(link.dataset.upgradeQuestionCount);
    const state = link.dataset.upgradeState;
    const product = link.dataset.upgradeProduct;
    return {
      entry_point: source(link),
      ...(state && /^[A-Z]{2}$/.test(state) ? { state } : {}),
      ...(product === SITE_PRO_PRODUCT_CODE || product === LIFETIME_PRO_PRODUCT_CODE
        ? { product_code: product, plan: product === LIFETIME_PRO_PRODUCT_CODE ? "lifetime" : "60_day" } : {}),
      ...(mode && /^(?:quick10|full\d{1,2}|topic|practice)$/.test(mode) ? { mode } : {}),
      ...(Number.isInteger(count) && count > 0 && count <= 80 ? { question_count: count } : {}),
    };
  };
  const isUpgrade = (link: HTMLAnchorElement) => {
    try {
      const url = new URL(link.href, window.location.href);
      return url.origin === window.location.origin && isPricingPath(url.pathname);
    } catch { return false; }
  };
  const observer = typeof IntersectionObserver === "undefined" ? null : new IntersectionObserver((entries) => {
    for (const entry of entries) {
      if (!entry.isIntersecting || entry.intersectionRatio < 0.5) continue;
      const link = entry.target as HTMLAnchorElement;
      const params = context(link);
      const key = [window.location.pathname, params.state, params.entry_point, params.product_code].join("|");
      if (!seen.has(key)) {
        seen.add(key);
        trackAnalyticsEvent("upgrade_view", params);
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
    trackAnalyticsEvent("upgrade_click", context(link));
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
