(() => {
  const VERSION = "0.2.0";
  const STYLE_ID = "device-overview-responsive-style";
  const GRID_CLASS = "device-overview-responsive-grid";
  const INTERVAL_KEY = "__deviceOverviewResponsiveInterval";

  const rectOf = (el) => {
    const rect = el?.getBoundingClientRect?.();
    return rect && rect.width > 0 && rect.height > 0 ? rect : null;
  };

  const walkAll = (root, visit) => {
    if (!root) return;
    for (const child of root.children || []) {
      visit(child);
      walkAll(child.shadowRoot, visit);
      walkAll(child, visit);
    }
  };

  const injectStyle = (root) => {
    if (!root?.querySelector || root.querySelector(`#${STYLE_ID}`)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${GRID_CLASS} {
        display: grid !important;
        grid-template-columns: repeat(auto-fit, minmax(min(100%, 300px), 1fr)) !important;
        align-items: start !important;
        gap: var(--grid-card-gap, 16px) !important;
        width: min(100%, calc(100vw - 96px)) !important;
        max-width: min(1480px, calc(100vw - 96px)) !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      @media (max-width: 870px) {
        .${GRID_CLASS} {
          width: min(100%, calc(100vw - 32px)) !important;
          max-width: min(100%, calc(100vw - 32px)) !important;
          grid-template-columns: 1fr !important;
        }
      }

      .${GRID_CLASS} > *,
      .${GRID_CLASS} ha-card {
        min-width: 0 !important;
        max-width: 100% !important;
      }
    `;
    root.appendChild(style);
  };

  const isDeviceOverviewRoot = (root, host) => {
    const hostName = (host?.localName || "").toLowerCase();
    if (hostName.includes("config-device") || hostName.includes("device-page")) return true;

    const text = String(root?.textContent || "");
    return text.includes("Device info") && text.includes("Activity");
  };

  const findBestGrid = (root, viewportWidth) => {
    const cards = [...root.querySelectorAll("ha-card")].filter((card) => {
      const rect = rectOf(card);
      return rect && rect.width >= 180 && rect.height >= 60;
    });
    if (cards.length < 3) return null;

    const parents = new Map();
    for (const card of cards) {
      let node = card.parentElement;
      let depth = 0;
      while (node && depth < 8) {
        parents.set(node, (parents.get(node) || 0) + 1);
        node = node.parentElement;
        depth += 1;
      }
    }

    let best = null;
    for (const [node, count] of parents) {
      if (count < 3) continue;
      const rect = rectOf(node);
      if (!rect || rect.width < 280) continue;

      const directLayoutChildren = [...node.children].filter((child) =>
        child.localName === "ha-card" || child.querySelector?.("ha-card")
      );
      const targetWidth = Math.min(viewportWidth - 96, 1480);
      const score = count * 10 + directLayoutChildren.length * 7 - Math.abs(rect.width - targetWidth) / 40;

      if (!best || score > best.score) best = { node, score };
    }

    return best?.node || null;
  };

  const applyLayout = () => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    if (viewportWidth < 520) return;

    walkAll(document.body, (host) => {
      const root = host.shadowRoot;
      if (!root || !isDeviceOverviewRoot(root, host)) return;

      injectStyle(root);
      const grid = findBestGrid(root, viewportWidth);
      grid?.classList.add(GRID_CLASS);
    });
  };

  window.clearInterval(window[INTERVAL_KEY]);
  window[INTERVAL_KEY] = window.setInterval(applyLayout, 1000);
  window.addEventListener("location-changed", () => {
    window.setTimeout(applyLayout, 0);
    window.setTimeout(applyLayout, 300);
    window.setTimeout(applyLayout, 1000);
  });
  window.addEventListener("resize", () => window.setTimeout(applyLayout, 50));

  applyLayout();
  console.info(`Device Overview Responsive ${VERSION} loaded`);
})();
