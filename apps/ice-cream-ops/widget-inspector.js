(function initializeWidgetInspector(globalScope) {
  if (typeof document === "undefined") return;

  function createInspectorPanel() {
    if (typeof globalScope.getWidgetSpec !== "function") return;

    const widgetIds = Array.isArray(globalScope.__JOYUS_WIDGET_IDS) ? globalScope.__JOYUS_WIDGET_IDS : [];
    if (widgetIds.length === 0) return;

    const style = document.createElement("style");
    style.textContent = `
      #widget-inspector-toggle {
        position: fixed;
        right: 1rem;
        bottom: 1rem;
        z-index: 1200;
        border: 1px solid rgba(33, 24, 18, 0.3);
        border-radius: 999px;
        padding: 0.45rem 0.75rem;
        font-size: 0.75rem;
        background: rgba(255, 249, 241, 0.95);
        cursor: pointer;
      }
      #widget-inspector-panel {
        position: fixed;
        right: 1rem;
        bottom: 3.5rem;
        width: min(520px, calc(100vw - 2rem));
        max-height: 55vh;
        overflow: auto;
        z-index: 1200;
        border: 1px solid rgba(33, 24, 18, 0.3);
        border-radius: 14px;
        background: rgba(255, 252, 247, 0.98);
        box-shadow: 0 16px 38px rgba(30, 21, 12, 0.2);
        padding: 0.75rem;
        display: none;
      }
      #widget-inspector-panel[data-open='true'] {
        display: block;
      }
      #widget-inspector-panel h2 {
        margin: 0 0 0.45rem;
        font-size: 0.95rem;
      }
      #widget-inspector-panel label {
        display: flex;
        align-items: center;
        gap: 0.45rem;
        font-size: 0.8rem;
      }
      #widget-inspector-panel pre {
        margin: 0.6rem 0 0;
        padding: 0.55rem;
        border: 1px solid rgba(33, 24, 18, 0.22);
        border-radius: 10px;
        background: #f3ece3;
        font-size: 0.72rem;
        line-height: 1.35;
        overflow: auto;
      }
    `;
    document.head.appendChild(style);

    const toggle = document.createElement("button");
    toggle.id = "widget-inspector-toggle";
    toggle.type = "button";
    toggle.textContent = "Widget Inspector";

    const panel = document.createElement("aside");
    panel.id = "widget-inspector-panel";
    panel.setAttribute("data-open", "false");
    panel.setAttribute("aria-live", "polite");

    const title = document.createElement("h2");
    title.textContent = "Widget Inspector";

    const selectLabel = document.createElement("label");
    selectLabel.textContent = "Widget:";

    const select = document.createElement("select");
    widgetIds.forEach((widgetId) => {
      const option = document.createElement("option");
      option.value = widgetId;
      option.textContent = widgetId;
      select.appendChild(option);
    });

    const output = document.createElement("pre");

    function render(widgetId) {
      const spec = globalScope.getWidgetSpec(widgetId);
      output.textContent = JSON.stringify(spec, null, 2);
    }

    select.addEventListener("change", () => render(select.value));

    toggle.addEventListener("click", () => {
      const isOpen = panel.getAttribute("data-open") === "true";
      panel.setAttribute("data-open", isOpen ? "false" : "true");
      if (!isOpen) render(select.value);
    });

    selectLabel.appendChild(select);
    panel.appendChild(title);
    panel.appendChild(selectLabel);
    panel.appendChild(output);

    document.body.appendChild(toggle);
    document.body.appendChild(panel);

    render(select.value);
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", createInspectorPanel, { once: true });
  } else {
    createInspectorPanel();
  }
})(typeof window !== "undefined" ? window : globalThis);
