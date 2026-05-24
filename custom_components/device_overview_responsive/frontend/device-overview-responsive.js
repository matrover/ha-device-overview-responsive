(() => {
  const VERSION = "0.3.9";
  const DEFAULT_GAP = 16;
  const STYLE_ID = "device-overview-responsive-style";
  const GRID_CLASS = "device-overview-responsive-grid";
  const LIMITED_WIDTH_CLASS = "device-overview-responsive-limited-width";
  const OUTER_COLUMN_CLASS = "device-overview-responsive-outer-column";
  const MIDDLE_COLUMN_CLASS = "device-overview-responsive-middle-column";
  const INTERVAL_KEY = "__deviceOverviewResponsiveInterval";
  const DEVICE_PAGE_RE = /\/config\/devices\/device\//;
  const CONFIG_URL = "/device_overview_responsive/config.json";
  const MODULE_SRC =
    document.currentScript?.src ||
    [...document.scripts].find((script) => script.src.includes("device-overview-responsive.js"))?.src ||
    "";
  const MODULE_PARAMS = new URL(MODULE_SRC || window.location.href).searchParams;
  let configuredMaxWidth = Math.max(0, Number(MODULE_PARAMS.get("max_width")) || 0);

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
    const styleHost = root === document ? document.head : root;
    if (!styleHost?.querySelector || styleHost.querySelector(`#${STYLE_ID}`)) return;

    const style = document.createElement("style");
    style.id = STYLE_ID;
    style.textContent = `
      .${GRID_CLASS} {
        display: flex !important;
        flex-wrap: wrap !important;
        align-items: start !important;
        gap: var(--grid-card-gap, 16px) !important;
        box-sizing: border-box !important;
        width: auto !important;
        max-width: none !important;
        margin-left: var(--grid-card-gap, 16px) !important;
        margin-right: var(--grid-card-gap, 16px) !important;
      }

      .${GRID_CLASS}.${LIMITED_WIDTH_CLASS} {
        width: min(calc(100% - var(--grid-card-gap, 16px) * 2), var(--dor-grid-max-width)) !important;
        max-width: var(--dor-grid-max-width) !important;
        margin-left: auto !important;
        margin-right: auto !important;
      }

      .${GRID_CLASS} > *,
      .${GRID_CLASS} ha-card {
        width: 100% !important;
        min-width: 0 !important;
        max-width: none !important;
      }

      .${GRID_CLASS} > .column {
        display: block !important;
        flex: 1 1 var(--dor-column-min, 320px) !important;
        min-width: var(--dor-column-min, 320px) !important;
        max-width: none !important;
      }

      .${GRID_CLASS} > .${OUTER_COLUMN_CLASS} {
        flex: 2 1 0 !important;
      }

      .${GRID_CLASS} > .${MIDDLE_COLUMN_CLASS} {
        flex: 4 1 0 !important;
      }

      .${GRID_CLASS} > :not(.column):not(.fullwidth) {
        flex: 1 1 100% !important;
        max-width: 100% !important;
      }

      .${GRID_CLASS} > .fullwidth {
        flex: 1 1 100% !important;
      }

      @media (max-width: 870px) {
        .${GRID_CLASS},
        .${GRID_CLASS}.${LIMITED_WIDTH_CLASS} {
          width: auto !important;
          max-width: none !important;
          margin-left: var(--grid-card-gap, 16px) !important;
          margin-right: var(--grid-card-gap, 16px) !important;
        }

        .${GRID_CLASS} > .column {
          flex: 1 1 100% !important;
          min-width: 0 !important;
        }
      }
    `;
    styleHost.appendChild(style);
  };

  const allRoots = () => {
    const roots = [document];
    walkAll(document.body, (host) => {
      if (host.shadowRoot) roots.push(host.shadowRoot);
    });
    return roots;
  };

  const isDeviceOverviewPage = () => DEVICE_PAGE_RE.test(window.location.pathname);

  const refreshConfig = async () => {
    try {
      const response = await fetch(`${CONFIG_URL}?_=${Date.now()}`, {
        cache: "no-store",
        credentials: "same-origin",
      });
      if (!response.ok) return;
      const config = await response.json();
      configuredMaxWidth = Math.max(0, Number(config.max_width) || 0);
    } catch (err) {
      console.debug("Device Overview Responsive config unavailable", err);
    }
  };

  const clearLayout = () => {
    for (const root of allRoots()) {
      root.querySelectorAll?.(`.${GRID_CLASS}`).forEach((node) => {
        [...node.children].forEach((child) => {
          child.classList?.remove(OUTER_COLUMN_CLASS, MIDDLE_COLUMN_CLASS);
        });
        node.classList.remove(GRID_CLASS, LIMITED_WIDTH_CLASS);
        node.style.removeProperty("--dor-column-count");
        node.style.removeProperty("--dor-column-min");
        node.style.removeProperty("--dor-grid-max-width");
      });
    }
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

    const blockedNames = new Set([
      "body",
      "home-assistant",
      "hassio-main",
      "hass-router-page",
      "ha-panel-config",
    ]);

    let best = null;
    for (const [node, count] of parents) {
      if (count < 3) continue;
      const localName = (node.localName || "").toLowerCase();
      if (blockedNames.has(localName)) continue;

      const rect = rectOf(node);
      if (!rect || rect.width < 280) continue;

      const directLayoutChildren = [...node.children].filter((child) =>
        child.localName === "ha-card" || child.querySelector?.("ha-card")
      );
      const columnChildren = [...node.children].filter((child) => {
        const childRect = rectOf(child);
        return child.classList?.contains("column") && childRect;
      });
      const layoutColumnCount = columnChildren.length || directLayoutChildren.length;
      if (layoutColumnCount < 2) continue;

      const targetWidth = Math.max(280, viewportWidth - DEFAULT_GAP * 2);
      const className = String(node.className || "");
      const preferredName = /content|container|grid|layout|columns/i.test(className) ? 20 : 0;
      const score =
        count * 10 +
        layoutColumnCount * 12 +
        preferredName -
        Math.abs(rect.width - targetWidth) / 35;

      if (!best || score > best.score) best = { node, score, layoutColumnCount };
    }

    return best || null;
  };

  const applyLayout = () => {
    const viewportWidth = window.innerWidth || document.documentElement.clientWidth || 0;
    const summary = {
      active: false,
      page: window.location.pathname,
      viewportWidth,
      grids: 0,
    };

    clearLayout();
    if (!isDeviceOverviewPage()) {
      window.__deviceOverviewResponsiveLastRun = summary;
      return summary;
    }

    for (const root of allRoots()) {
      injectStyle(root);
      const bestGrid = findBestGrid(root, viewportWidth);
      if (!bestGrid) continue;

      const grid = bestGrid.node;
      const columnMin = viewportWidth >= 1200 ? 320 : 280;
      const availableWidth = Math.max(columnMin, viewportWidth - DEFAULT_GAP * 2);
      const fittingColumns = Math.max(1, Math.floor((availableWidth + DEFAULT_GAP) / (columnMin + DEFAULT_GAP)));
      const columnCount = Math.min(bestGrid.layoutColumnCount, fittingColumns);
      grid.classList.add(GRID_CLASS);
      grid.style.setProperty("--dor-column-count", String(columnCount));
      grid.style.setProperty("--dor-column-min", `${columnMin}px`);
      if (configuredMaxWidth > 0) {
        grid.classList.add(LIMITED_WIDTH_CLASS);
        grid.style.setProperty("--dor-grid-max-width", `${configuredMaxWidth}px`);
      }

      const columns = [...grid.children].filter((child) => {
        const childRect = rectOf(child);
        return child.classList?.contains("column") && childRect;
      });
      if (columns.length === 3) {
        columns[0].classList.add(OUTER_COLUMN_CLASS);
        columns[1].classList.add(MIDDLE_COLUMN_CLASS);
        columns[2].classList.add(OUTER_COLUMN_CLASS);
      }

      summary.active = true;
      summary.grids += 1;
    }

    window.__deviceOverviewResponsiveLastRun = summary;
    return summary;
  };

  window.clearInterval(window[INTERVAL_KEY]);
  window[INTERVAL_KEY] = window.setInterval(() => {
    refreshConfig().finally(applyLayout);
  }, 1000);
  window.__deviceOverviewResponsiveApply = applyLayout;
  window.addEventListener("location-changed", () => {
    window.setTimeout(applyLayout, 0);
    window.setTimeout(applyLayout, 300);
    window.setTimeout(applyLayout, 1000);
  });
  window.addEventListener("resize", () => window.setTimeout(applyLayout, 50));

  refreshConfig().finally(applyLayout);
  console.info(`Device Overview Responsive ${VERSION} loaded`);
})();
