/* Claude Code Arsenal — rendu du catalogue + graphiques */
(function () {
  "use strict";

  const D = window.DATA;
  if (!D) return;

  /* ── helpers ───────────────────────────────────────────── */
  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];

  const fmt = (n) => {
    if (n == null) return "—";
    if (n >= 1e6) return (n / 1e6).toFixed(2).replace(".", ",").replace(",00", "") + " M";
    if (n >= 1e4) return Math.round(n / 1e3).toLocaleString("fr-FR") + " k";
    return n.toLocaleString("fr-FR");
  };

  const esc = (s) => String(s).replace(/[&<>"']/g, (c) => (
    { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]
  ));

  const slug = (s) => s.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase();

  const originBadge = (o) => {
    if (o === "Anthropic") return '<span class="badge official">Officiel Anthropic</span>';
    if (o === "Superpowers") return '<span class="badge superpowers">Superpowers</span>';
    return '<span class="badge community">Communauté</span>';
  };

  /* ── état ──────────────────────────────────────────────── */
  const state = { tab: "plugins", q: "", sort: "rank", cats: new Set() };

  const list = () => D[state.tab];

  /* ── rendu des cartes ──────────────────────────────────── */
  const maxInstall = Math.max(...D.plugins.map((p) => p.i || 0));
  const maxPluginStars = Math.max(...D.plugins.map((p) => p.s || 0));
  const maxStars = Math.max(...D.skills.map((s) => s.s || 0));

  function cardHTML(it, isSkill) {
    const kind = isSkill ? "skill" : "plugin";
    const inv = state.tab === "plugins";
    const metricVal = inv ? it.i : it.s;
    const max = inv ? (it.i ? maxInstall : maxPluginStars) : maxStars;
    const pct = metricVal ? Math.max(4, Math.round((metricVal / max) * 100)) : 0;

    let metricLabel;
    if (inv && it.i) metricLabel = `${fmt(it.i)} installs`;
    else if (it.s) metricLabel = `${it.a ? "≈ " : ""}${fmt(it.s)} ★`;
    else metricLabel = it.o === "Anthropic" ? "officiel · pas de score isolé" : it.o;

    const cmd = it.cmd || it.npm || "";
    const cmdHTML = cmd
      ? `<div class="cmd">
           <span class="prompt" aria-hidden="true">❯</span>
           <code title="${esc(cmd)}">${esc(cmd)}</code>
           <button class="copy" data-copy="${esc(cmd)}" aria-label="Copier : ${esc(cmd)}">
             <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" aria-hidden="true"><rect x="9" y="9" width="11" height="11" rx="2"/><path d="M5 15V5a2 2 0 012-2h8"/></svg>
           </button>
         </div>`
      : "";

    const altLine = it.alt
      ? `<div class="npm">ou : ${esc(it.alt)}</div>` : "";

    const npmLine = it.npm && it.cmd
      ? `<div class="npm">${/^np[xm]\s/.test(it.npm) ? "" : "npm : "}${esc(it.npm)}</div>` : "";

    const mpLine = it.mp
      ? `<div class="npm">d'abord : ${esc(it.mp)}</div>` : "";

    const bLine = it.b
      ? `<div class="npm">↳ ${esc(it.b)}</div>` : "";

    return `
    <article class="card ${kind}">
      <div class="card-top">
        <span class="rank" aria-label="Rang ${it.r}">${String(it.r).padStart(2, "0")}</span>
        <div class="card-titles">
          <h3>${esc(it.n)}</h3>
          <div class="badges">
            ${originBadge(it.o)}
            <span class="badge cat">${esc(it.c)}</span>
          </div>
        </div>
      </div>
      <p class="desc">${esc(it.d)}</p>
      <div class="tags">${(it.t || []).map((t) => `<span class="tag">${esc(t)}</span>`).join("")}</div>
      <div class="metric">
        <span class="bar" aria-hidden="true"><i style="width:${pct}%"></i></span>
        <b>${esc(metricLabel)}</b>
      </div>
      ${cmdHTML}
      ${mpLine}
      ${bLine}
      ${npmLine}
      ${altLine}
      <div class="card-foot">
        <a class="link" href="${esc(it.repo)}" target="_blank" rel="noopener noreferrer" title="${esc(it.repo)}" aria-label="Dépôt source : ${esc(it.repo)}">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><path d="M12 .5a11.5 11.5 0 00-3.6 22.4c.6.1.8-.3.8-.6v-2c-3.2.7-3.9-1.4-3.9-1.4-.5-1.3-1.2-1.7-1.2-1.7-1-.7.1-.7.1-.7 1.1.1 1.7 1.2 1.7 1.2 1 1.7 2.6 1.2 3.2.9.1-.7.4-1.2.7-1.5-2.6-.3-5.3-1.3-5.3-5.7 0-1.3.5-2.3 1.2-3.1-.1-.3-.5-1.5.1-3 0 0 1-.3 3.2 1.2a11 11 0 015.8 0c2.2-1.5 3.2-1.2 3.2-1.2.6 1.5.2 2.7.1 3 .8.8 1.2 1.8 1.2 3.1 0 4.4-2.7 5.4-5.3 5.7.4.4.8 1.1.8 2.2v3.3c0 .3.2.7.8.6A11.5 11.5 0 0012 .5z"/></svg>
          <span>${esc(it.repo.replace(/^https?:\/\/github\.com\//, "").split("/tree/")[0])}</span>
        </a>
        <span class="npm">#${it.r}</span>
      </div>
    </article>`;
  }

  function render() {
    const isSkill = state.tab === "skills";
    const q = slug(state.q);

    let items = list().filter((it) => {
      const hay = slug([it.n, it.c, it.o, it.d, (it.t || []).join(" ")].join(" "));
      if (q && !hay.includes(q)) return false;
      if (state.cats.size && !state.cats.has(it.c)) return false;
      return true;
    });

    if (state.sort === "name") items = [...items].sort((a, b) => a.n.localeCompare(b.n, "fr"));
    if (state.sort === "cat") items = [...items].sort((a, b) => a.c.localeCompare(b.c, "fr") || a.r - b.r);

    $("#cards").innerHTML = items.length
      ? items.map((it) => cardHTML(it, isSkill)).join("")
      : `<div class="empty"><b>Aucun résultat</b>Essaie un autre mot-clé ou retire un filtre.</div>`;

    $("#count").textContent = `${items.length} / ${list().length} affichés`;
  }

  /* ── filtres ───────────────────────────────────────────── */
  function renderChips() {
    const cats = [...new Set(list().map((x) => x.c))].sort((a, b) => a.localeCompare(b, "fr"));
    const cls = state.tab === "skills" ? "li" : "cy";
    $("#chips").innerHTML = cats.map((c) =>
      `<button class="chip ${cls}" aria-pressed="${state.cats.has(c)}" data-cat="${esc(c)}">${esc(c)}</button>`
    ).join("");
  }

  function setTab(tab) {
    state.tab = tab;
    state.cats.clear();
    $("#tab-plugins").setAttribute("aria-selected", String(tab === "plugins"));
    $("#tab-skills").setAttribute("aria-selected", String(tab === "skills"));
    $("#cards").setAttribute("aria-labelledby", tab === "plugins" ? "tab-plugins" : "tab-skills");
    renderChips();
    render();
  }

  /* ── copie ─────────────────────────────────────────────── */
  let toastTimer;
  function toast(msg) {
    const t = $("#toast");
    t.textContent = msg;
    t.classList.add("show");
    clearTimeout(toastTimer);
    toastTimer = setTimeout(() => t.classList.remove("show"), 1600);
  }

  async function copyText(text) {
    try {
      await navigator.clipboard.writeText(text);
      return true;
    } catch {
      const ta = document.createElement("textarea");
      ta.value = text;
      ta.style.position = "fixed";
      ta.style.opacity = "0";
      document.body.appendChild(ta);
      ta.select();
      let ok = false;
      try { ok = document.execCommand("copy"); } catch { ok = false; }
      ta.remove();
      return ok;
    }
  }

  /* ── graphiques ────────────────────────────────────────── */
  const C = {
    cy: "#56d4ff", li: "#b8ff3c", te: "#2dd4bf", vi: "#a78bfa",
    am: "#ffa24c", pk: "#f472b6", grid: "rgba(255,255,255,.07)", text: "#9aa5b4"
  };

  function chartDefaults() {
    if (!window.Chart) return false;
    Chart.defaults.color = C.text;
    Chart.defaults.font.family = "Inter, system-ui, sans-serif";
    Chart.defaults.font.size = 13;
    Chart.defaults.plugins.legend.labels.boxWidth = 12;
    Chart.defaults.plugins.legend.labels.boxHeight = 12;
    Chart.defaults.plugins.legend.labels.padding = 16;
    Chart.defaults.plugins.tooltip.backgroundColor = "#0f1319";
    Chart.defaults.plugins.tooltip.borderColor = "rgba(255,255,255,.14)";
    Chart.defaults.plugins.tooltip.borderWidth = 1;
    Chart.defaults.plugins.tooltip.titleColor = "#eef1f6";
    Chart.defaults.plugins.tooltip.bodyColor = "#c3ccd8";
    Chart.defaults.plugins.tooltip.padding = 12;
    Chart.defaults.plugins.tooltip.cornerRadius = 8;
    Chart.defaults.plugins.tooltip.displayColors = false;
    Chart.defaults.animation.duration = 700;
    return true;
  }

  function hbar(id, labels, values, color, unit) {
    const el = document.getElementById(id);
    if (!el) return;
    const max = Math.max(...values);
    new Chart(el, {
      type: "bar",
      data: {
        labels,
        datasets: [{
          data: values,
          backgroundColor: values.map((v) => {
            const a = 0.35 + 0.65 * (v / max);
            return color === C.cy ? `rgba(86,212,255,${a})` : `rgba(184,255,60,${a})`;
          }),
          hoverBackgroundColor: color,
          borderRadius: 6,
          borderSkipped: false,
          barThickness: "flex",
          maxBarThickness: 22
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 14 } },
        scales: {
          x: {
            grid: { color: C.grid, drawBorder: false },
            border: { display: false },
            ticks: {
              callback: (v) => fmt(v),
              maxTicksLimit: 5
            }
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: 13 }, color: "#dbe4ef" }
          }
        },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              label: (ctx) => ` ${ctx.parsed.x.toLocaleString("fr-FR")} ${unit}`
            }
          }
        }
      }
    });
  }

  function initCharts() {
    if (!chartDefaults()) {
      $$(".chart-box").forEach((b) => {
        b.innerHTML = '<p style="color:#6d7887;font-size:14px;padding:20px">Graphiques indisponibles hors ligne (CDN Chart.js bloqué).</p>';
      });
      return;
    }

    const { pluginInstalls, skillStars, categories, origins, youtube } = D.charts;

    hbar("ch-installs", pluginInstalls.labels, pluginInstalls.values, C.cy, "installs");
    hbar("ch-stars", skillStars.labels, skillStars.values, C.li, "étoiles");

    new Chart($("#ch-cats"), {
      type: "doughnut",
      data: {
        labels: categories.labels,
        datasets: [{
          data: categories.values,
          backgroundColor: [
            "rgba(86,212,255,.9)", "rgba(45,212,191,.85)", "rgba(167,139,250,.85)",
            "rgba(255,162,76,.85)", "rgba(244,114,182,.8)", "rgba(184,255,60,.8)",
            "rgba(120,180,255,.7)", "rgba(148,163,184,.45)"
          ],
          borderColor: "#0b0d12",
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "58%",
        plugins: {
          legend: { position: window.innerWidth < 640 ? "bottom" : "right", labels: { padding: 14, font: { size: 13 } } },
          tooltip: { callbacks: { label: (c) => ` ${c.label} : ${c.parsed} plugins` } }
        }
      }
    });

    new Chart($("#ch-origins"), {
      type: "doughnut",
      data: {
        labels: origins.labels,
        datasets: [{
          data: origins.values,
          backgroundColor: ["rgba(184,255,60,.9)", "rgba(86,212,255,.9)", "rgba(167,139,250,.9)"],
          borderColor: "#0b0d12",
          borderWidth: 3,
          hoverOffset: 8
        }]
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        cutout: "62%",
        plugins: {
          legend: { position: "bottom", labels: { padding: 16, font: { size: 13 } } },
          tooltip: { callbacks: { label: (c) => ` ${c.label} : ${c.parsed} skills` } }
        }
      }
    });

    const ytOrder = youtube.labels
      .map((label, i) => ({ label, value: youtube.values[i], url: youtube.urls[i] }))
      .sort((a, b) => b.value - a.value);

    const ytNarrow = window.innerWidth < 640;
    const ytMax = ytNarrow ? 24 : 52;

    new Chart($("#ch-yt"), {
      type: "bar",
      data: {
        labels: ytOrder.map((v) => v.label.length > ytMax ? v.label.slice(0, ytMax - 1) + "…" : v.label),
        datasets: [{
          data: ytOrder.map((v) => v.value),
          backgroundColor: ytOrder.map((v, i) => {
            const a = 0.4 + 0.6 * (v.value / ytOrder[0].value);
            return i % 2 ? `rgba(86,212,255,${a})` : `rgba(184,255,60,${a})`;
          }),
          hoverBackgroundColor: ytOrder.map((v, i) => (i % 2 ? C.cy : C.li)),
          borderRadius: 6,
          borderSkipped: false,
          maxBarThickness: 26
        }]
      },
      options: {
        indexAxis: "y",
        responsive: true,
        maintainAspectRatio: false,
        layout: { padding: { right: 18 } },
        plugins: {
          legend: { display: false },
          tooltip: {
            callbacks: {
              title: (items) => ytOrder[items[0].dataIndex].label,
              label: (c) => ` ${c.parsed.x.toLocaleString("fr-FR")} vues`,
              afterLabel: (c) => ytOrder[c.dataIndex].url || ""
            }
          }
        },
        scales: {
          x: {
            grid: { color: C.grid },
            border: { display: false },
            ticks: { callback: (v) => fmt(v), maxTicksLimit: 5 }
          },
          y: {
            grid: { display: false },
            border: { display: false },
            ticks: { font: { size: ytNarrow ? 11.5 : 13 }, color: "#dbe4ef" }
          }
        },
        onClick: (evt, els) => {
          if (!els.length) return;
          const url = ytOrder[els[0].index].url;
          if (url) window.open(url, "_blank", "noopener");
        }
      }
    });

    // clic sur le graphique = ouvrir la vidéo
    $("#ch-yt").style.cursor = "pointer";
    $("#ch-yt").setAttribute("title", "Cliquer une barre pour ouvrir la vidéo");
  }

  /* ── stacks & sources ──────────────────────────────────── */
  function renderStacks() {
    $("#stacks-grid").innerHTML = D.stacks.map((s) => `
      <article class="stack">
        <h3>${esc(s.name)}</h3>
        <p>${esc(s.desc)}</p>
        <ol>${s.items.map((i) => `<li><button class="stack-go" data-go="${esc(i)}" title="Voir la fiche ${esc(i)}">${esc(i)}</button></li>`).join("")}</ol>
      </article>`).join("");
  }

  function renderSources() {
    $("#sources-list").innerHTML = D.sources.map((s) => `
      <a class="src" href="${esc(s.u)}" target="_blank" rel="noopener noreferrer">
        <span class="k">${esc(s.k)}</span>
        <p>${esc(s.t)}</p>
      </a>`).join("");
  }

  /* ── événements ────────────────────────────────────────── */
  function bind() {
    $("#tab-plugins").addEventListener("click", () => setTab("plugins"));
    $("#tab-skills").addEventListener("click", () => setTab("skills"));

    $("#q").addEventListener("input", (e) => {
      state.q = e.target.value;
      render();
    });

    $("#sort").addEventListener("change", (e) => {
      state.sort = e.target.value;
      render();
    });

    document.addEventListener("keydown", (e) => {
      if (e.key === "/" && document.activeElement !== $("#q")) {
        e.preventDefault();
        $("#q").focus();
      }
      if (e.key === "Escape" && document.activeElement === $("#q")) {
        $("#q").value = "";
        state.q = "";
        render();
        $("#q").blur();
      }
    });

    // délégation : chips + copie
    document.addEventListener("click", async (e) => {
      const tabLink = e.target.closest("[data-tab]");
      if (tabLink) {
        setTab(tabLink.dataset.tab);
        return;
      }

      const chip = e.target.closest(".chip");
      if (chip) {
        const c = chip.dataset.cat;
        if (state.cats.has(c)) state.cats.delete(c);
        else state.cats.add(c);
        chip.setAttribute("aria-pressed", String(state.cats.has(c)));
        render();
        return;
      }

      const go = e.target.closest(".stack-go");
      if (go) {
        const name = go.dataset.go;
        state.q = name;
        $("#q").value = name;
        setTab(D.skills.some((s) => s.n === name) ? "skills" : "plugins");
        const top = $("#explorer").getBoundingClientRect().top + window.scrollY - 80;
        window.scrollTo({ top, behavior: "smooth" });
        return;
      }

      const btn = e.target.closest(".copy");
      if (!btn) return;
      const ok = await copyText(btn.dataset.copy);
      btn.classList.toggle("done", ok);
      toast(ok ? "Commande copiée" : "Copie impossible — sélectionne le texte");
      setTimeout(() => btn.classList.remove("done"), 1500);
    });
  }

  /* ── démarrage ─────────────────────────────────────────── */
  function start() {
    $("#q").value = "";
    $("#sort").value = "rank";
    renderChips();
    render();
    renderStacks();
    renderSources();
    bind();
    initCharts();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", start);
  } else {
    start();
  }
})();
