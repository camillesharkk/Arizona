export function scrollUnderHeader(el: Element | null) {
  if (!el || typeof window === "undefined") return;
  const header = document.querySelector(".site-header");
  const offset = header ? header.getBoundingClientRect().bottom : 0;
  const top = el.getBoundingClientRect().top + window.scrollY - offset - 12;
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
