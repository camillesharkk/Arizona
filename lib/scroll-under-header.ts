export function scrollUnderHeader(el: Element | null) {
  if (!el || typeof window === "undefined") return;
  const mobileBar = document.querySelector(".study-topbar");
  const mobile = Boolean(mobileBar?.getClientRects().length);
  const header = mobile ? mobileBar : document.querySelector(".site-header");
  const offset = header?.getBoundingClientRect().bottom ?? 0;
  const stem = el.getBoundingClientRect().top;
  const card = mobile && el.matches(".quiz-stem") ? el.closest(".card") : null;
  const cardTop = card?.getBoundingClientRect().top ?? stem;
  const top = (stem - cardTop < 150 ? cardTop : stem) + window.scrollY - offset - 12;
  window.scrollTo(0, Math.max(0, top));
}

export function scrollUnderHeaderAfterLayout(el: Element | null) {
  requestAnimationFrame(() => {
    requestAnimationFrame(() => scrollUnderHeader(el));
  });
}

let scrollTicket = 0;

export function scrollUnderHeaderSoon(el: Element | null) {
  const token = ++scrollTicket;
  const run = () => {
    if (token !== scrollTicket) return;
    scrollUnderHeader(el);
  };
  requestAnimationFrame(() => {
    requestAnimationFrame(() => {
      run();
      requestAnimationFrame(run);
    });
  });
}
