/**
 * StockPulse Market Brief — Client Module
 * =======================================
 *
 * Calendar + report viewer for AI-generated daily/weekly market briefs.
 * Backed by the brief-worker (Cloudflare Worker + KV).
 *
 * Public API:
 *   window.initBrief()                      — bootstrap (called by router)
 *   window.briefShowDate('2026-05-04')      — programmatic navigation
 *   window.briefShowWeek('2026-W18')
 *
 * Storage (localStorage):
 *   app_brief_worker_url   — the brief-worker URL (configured once by user)
 *   sp_brief_cache_<key>   — per-report content cache
 */

(function (global) {
  'use strict';

  // ───── State ──────────────────────────────────────────────────────────────
  const STATE = {
    initialized: false,
    type: 'daily',           // 'daily' | 'weekly'
    cursorMonth: null,       // Date pinned to first of currently-shown month
    selectedId: null,        // 'YYYY-MM-DD' (daily) or 'YYYY-Www' (weekly)
    // Map: id → { direction, spxPct, ndxPct, generatedAt } (or null if no metadata)
    available: { daily: new Map(), weekly: new Map() },
    quotesCache: {},         // ticker → { changePct }
  };

  const LS_KEY = 'app_brief_worker_url';
  const CACHE_PREFIX = 'sp_brief_cache_';

  function workerUrl() {
    return (localStorage.getItem(LS_KEY) || '').replace(/\/+$/, '');
  }

  function setWorkerUrl(url) {
    localStorage.setItem(LS_KEY, (url || '').replace(/\/+$/, ''));
  }

  // ───── DOM helpers ────────────────────────────────────────────────────────
  function $(id) { return document.getElementById(id); }

  function el(tag, attrs = {}, children = []) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs)) {
      if (k === 'class') e.className = v;
      else if (k === 'html') e.innerHTML = v;
      else if (k.startsWith('on') && typeof v === 'function') {
        e.addEventListener(k.slice(2).toLowerCase(), v);
      } else if (v != null) {
        e.setAttribute(k, v);
      }
    }
    (Array.isArray(children) ? children : [children]).forEach((c) => {
      if (c == null) return;
      e.appendChild(typeof c === 'string' ? document.createTextNode(c) : c);
    });
    return e;
  }

  function escapeHtml(s) {
    return String(s)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;');
  }

  // ───── Date helpers ───────────────────────────────────────────────────────
  function todayISO() { return new Date().toISOString().slice(0, 10); }

  function fmtDateHe(iso) {
    if (!iso) return '';
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: '2-digit', year: 'numeric' });
  }

  function fmtDateShort(iso) {
    const d = new Date(iso + 'T12:00:00');
    return d.toLocaleDateString('he-IL', { day: '2-digit', month: 'short' });
  }

  function isoDate(d) { return d.toISOString().slice(0, 10); }

  function getISOWeek(date) {
    const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
    d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
    const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
    const weekNo = Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
    return `${d.getUTCFullYear()}-W${String(weekNo).padStart(2, '0')}`;
  }

  function dateOfISOWeek(weekStr) {
    const [yearStr, wStr] = weekStr.split('-W');
    const year = +yearStr;
    const week = +wStr;
    const simple = new Date(Date.UTC(year, 0, 1 + (week - 1) * 7));
    const dow = simple.getUTCDay();
    const monday = new Date(simple);
    if (dow <= 4) monday.setUTCDate(simple.getUTCDate() - simple.getUTCDay() + 1);
    else monday.setUTCDate(simple.getUTCDate() + 8 - simple.getUTCDay());
    return monday;
  }

  function monthLabel(d) {
    return d.toLocaleDateString('he-IL', { month: 'long', year: 'numeric' });
  }

  function shiftMonth(d, delta) {
    const x = new Date(d);
    x.setMonth(x.getMonth() + delta);
    return x;
  }

  // ───── Network ────────────────────────────────────────────────────────────
  async function apiFetch(path) {
    const base = workerUrl();
    if (!base) throw new Error('NO_WORKER_URL');
    const resp = await fetch(`${base}${path}`);
    if (!resp.ok) {
      const text = await resp.text().catch(() => '');
      throw new Error(`Worker ${resp.status}: ${text || resp.statusText}`);
    }
    return resp.json();
  }

  async function loadList() {
    const data = await apiFetch('/brief/list');
    for (const type of ['daily', 'weekly']) {
      const map = new Map();
      (data[type] || []).forEach((entry) => {
        // Newer worker returns {id, direction, spxPct, ...}; older worker
        // returned plain ID strings. Handle both gracefully.
        if (typeof entry === 'string') {
          map.set(entry, null);
        } else if (entry && entry.id) {
          map.set(entry.id, entry);
        }
      });
      STATE.available[type] = map;
    }
  }

  function getCached(key) {
    try {
      const raw = localStorage.getItem(CACHE_PREFIX + key);
      return raw ? JSON.parse(raw) : null;
    } catch { return null; }
  }

  function setCached(key, data) {
    try { localStorage.setItem(CACHE_PREFIX + key, JSON.stringify(data)); }
    catch { /* quota — ignore */ }
  }

  async function loadBrief(type, id) {
    const cacheKey = `${type}:${id}`;
    const cached = getCached(cacheKey);
    if (cached) return { ...cached, _source: 'cache' };

    const data = await apiFetch(`/brief/${type}/${id}`);
    if (data?.brief) setCached(cacheKey, data);
    return { ...data, _source: 'worker' };
  }

  // ───── Markdown rendering (minimal) ───────────────────────────────────────
  function renderMarkdown(text) {
    let html = escapeHtml(text);

    html = html.replace(/^### (.+)$/gm, '<h3>$1</h3>');
    html = html.replace(/^## (.+)$/gm, '<h2>$1</h2>');
    html = html.replace(/^# (.+)$/gm, '<h1>$1</h1>');
    html = html.replace(/^---+$/gm, '<hr>');
    html = html.replace(/\*\*([^*\n]+)\*\*/g, '<strong>$1</strong>');
    html = html.replace(/\*([^*\n]+)\*/g, '<em>$1</em>');
    html = html.replace(/^[\-\*] (.+)$/gm, '<li>$1</li>');
    html = html.replace(/(<li>[\s\S]+?<\/li>)(?!\s*<li>)/g, '<ul>$1</ul>');

    const blocks = html.split(/\n{2,}/);
    return blocks
      .map((b) => {
        b = b.trim();
        if (!b) return '';
        if (/^<(h[1-6]|ul|ol|hr|pre|blockquote)/.test(b)) return b;
        return `<p>${b.replace(/\n/g, '<br>')}</p>`;
      })
      .join('\n');
  }

  // ───── Ticker chips ───────────────────────────────────────────────────────
  const TICKER_RE = /\(([A-Z]{1,6}(?:[.\-][A-Z]{1,3})?)\)/g;
  const NON_TICKER = new Set([
    'AI','EU','US','UK','OK','IPO','CPI','GDP','FOMC','CEO','CFO',
    'API','ETF','ETFS','PE','EPS','YOY','QOQ','YTD','MTD','WTD',
    'MTOK','BPS','KW','MW','GW','TW','TPU','GPU','CPU','NPU',
    'AWS','SAAS','RPO','ROIC','EBIT','EBITDA','DST','EDT','EST',
    'IST','UTC','NY','LA','SF','UAE','OPEC','NATO','UN','TLV',
  ]);

  function enrichTickers(html, quotes) {
    return html.replace(TICKER_RE, (match, ticker) => {
      if (NON_TICKER.has(ticker)) return match;
      const q = quotes[ticker];
      const cls = q ? (q.changePct > 0 ? 'up' : q.changePct < 0 ? 'down' : 'flat') : 'flat';
      const txt = q ? `${q.changePct > 0 ? '+' : ''}${q.changePct.toFixed(1)}%` : '';
      return `<span class="bf-ticker" data-ticker="${ticker}" title="${ticker}">`
        + `<span class="sym">${ticker}</span>`
        + (txt ? `<span class="chg ${cls}">${txt}</span>` : '')
        + `</span>`;
    });
  }

  function extractTickers(text) {
    const found = new Set();
    let m;
    TICKER_RE.lastIndex = 0;
    while ((m = TICKER_RE.exec(text)) !== null) {
      if (!NON_TICKER.has(m[1])) found.add(m[1]);
    }
    return Array.from(found);
  }

  // Pull quotes via the existing main-app PROXY, if available.
  async function fetchQuoteChange(ticker) {
    const proxy = (localStorage.getItem('app_proxy_url') || '').replace(/\/+$/, '');
    if (!proxy) return null;
    // Yahoo Finance uses hyphens for share-class suffixes, not dots:
    // BRK.B → BRK-B, BF.B → BF-B. Claude tends to write the dot form.
    const yahooSym = String(ticker).replace(/\./g, '-');
    const yahoo = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(yahooSym)}?range=5d&interval=1d`;
    try {
      const url = `${proxy}/?url=${encodeURIComponent(yahoo)}`;
      const resp = await fetch(url);
      if (!resp.ok) return null;
      const j = await resp.json();
      const r = j.chart?.result?.[0];
      if (!r) return null;
      const closes = r.indicators?.quote?.[0]?.close || [];
      const last = closes[closes.length - 1] ?? r.meta?.regularMarketPrice;
      const prev = closes[closes.length - 2] ?? r.meta?.previousClose;
      if (last == null || prev == null) return null;
      return { changePct: ((last - prev) / prev) * 100 };
    } catch { return null; }
  }

  async function enrichTickersAsync(tickers) {
    const out = {};
    if (!tickers.length) return out;
    const BATCH = 5;
    for (let i = 0; i < tickers.length; i += BATCH) {
      const batch = tickers.slice(i, i + BATCH);
      const results = await Promise.allSettled(batch.map((t) => {
        if (STATE.quotesCache[t]) return Promise.resolve(STATE.quotesCache[t]);
        return fetchQuoteChange(t).then((q) => {
          if (q) STATE.quotesCache[t] = q;
          return q;
        });
      }));
      results.forEach((r, idx) => {
        if (r.status === 'fulfilled' && r.value) out[batch[idx]] = r.value;
      });
    }
    return out;
  }

  // ───── Calendar rendering ─────────────────────────────────────────────────
  function renderCalendar() {
    const root = $('bf-calendar');
    if (!root) return;
    const cursor = STATE.cursorMonth;
    root.classList.toggle('weekly-mode', STATE.type === 'weekly');
    root.classList.toggle('daily-mode', STATE.type === 'daily');

    if (STATE.type === 'daily') {
      renderMonthGrid(root, cursor);
    } else {
      renderWeekGrid(root, cursor);
    }
  }

  function renderMonthGrid(root, cursor) {
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);
    const daysInMonth = new Date(year, month + 1, 0).getDate();
    const startDow = firstOfMonth.getDay(); // 0=Sun
    const today = todayISO();

    const dayLabels = ['א', 'ב', 'ג', 'ד', 'ה', 'ו', 'ש'];
    const cells = [];

    // Day-of-week header
    dayLabels.forEach((l) => cells.push(el('div', { class: 'bf-cal-dow' }, l)));

    // Empty leading
    for (let i = 0; i < startDow; i++) {
      cells.push(el('div', { class: 'bf-cal-cell empty' }));
    }

    // Days
    for (let d = 1; d <= daysInMonth; d++) {
      const iso = `${year}-${String(month + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;
      const meta = STATE.available.daily.get(iso);
      const has = STATE.available.daily.has(iso);
      const isFuture = iso > today;
      const isToday = iso === today;
      const isSelected = iso === STATE.selectedId;
      const direction = meta?.direction; // 'up' | 'down' | null

      const classes = ['bf-cal-cell'];
      if (has) classes.push('has-report');
      if (direction === 'up') classes.push('dir-up');
      if (direction === 'down') classes.push('dir-down');
      if (isFuture) classes.push('future');
      if (isToday) classes.push('today');
      if (isSelected) classes.push('selected');

      const tooltipParts = [];
      if (meta?.spxPct != null) {
        tooltipParts.push(`S&P ${meta.spxPct >= 0 ? '+' : ''}${meta.spxPct.toFixed(2)}%`);
      }
      if (meta?.ndxPct != null) {
        tooltipParts.push(`NDX ${meta.ndxPct >= 0 ? '+' : ''}${meta.ndxPct.toFixed(2)}%`);
      }
      const title = tooltipParts.join(' · ');

      const cell = el(
        'div',
        {
          class: classes.join(' '),
          'data-id': iso,
          title: title || null,
          onClick: () => selectId(iso),
        },
        [
          el('span', { class: 'bf-cal-num' }, String(d)),
          has ? el('span', { class: 'bf-cal-dot' }) : null,
        ]
      );
      cells.push(cell);
    }

    root.innerHTML = '';
    root.append(...cells);
  }

  function renderWeekGrid(root, cursor) {
    // Show 6 ISO weeks centered on cursor's month
    const year = cursor.getFullYear();
    const month = cursor.getMonth();
    const firstOfMonth = new Date(year, month, 1);

    const weeks = [];
    let d = new Date(firstOfMonth);
    // Step back to Monday of week containing the 1st
    d.setDate(d.getDate() - ((d.getDay() + 6) % 7));
    for (let i = 0; i < 6; i++) {
      const weekStart = new Date(d);
      const weekEnd = new Date(d);
      weekEnd.setDate(weekEnd.getDate() + 6);
      weeks.push({ start: weekStart, end: weekEnd, id: getISOWeek(weekStart) });
      d.setDate(d.getDate() + 7);
    }

    const today = todayISO();
    const cells = [];
    weeks.forEach((w) => {
      const meta = STATE.available.weekly.get(w.id);
      const has = STATE.available.weekly.has(w.id);
      const isFuture = isoDate(w.start) > today;
      const isSelected = w.id === STATE.selectedId;
      const direction = meta?.direction;

      const classes = ['bf-week-cell'];
      if (has) classes.push('has-report');
      if (direction === 'up') classes.push('dir-up');
      if (direction === 'down') classes.push('dir-down');
      if (isFuture) classes.push('future');
      if (isSelected) classes.push('selected');

      cells.push(
        el(
          'div',
          {
            class: classes.join(' '),
            'data-id': w.id,
            title: meta?.spxPct != null
              ? `S&P ${meta.spxPct >= 0 ? '+' : ''}${meta.spxPct.toFixed(2)}%` : null,
            onClick: () => selectId(w.id),
          },
          [
            el('div', { class: 'bf-week-id' }, w.id),
            el(
              'div',
              { class: 'bf-week-range' },
              `${fmtDateShort(isoDate(w.start))} – ${fmtDateShort(isoDate(w.end))}`
            ),
            has ? el('span', { class: 'bf-cal-dot' }) : null,
          ]
        )
      );
    });

    root.innerHTML = '';
    root.append(...cells);
  }

  // ───── Selection / report rendering ───────────────────────────────────────
  function selectId(id) {
    if (!STATE.available[STATE.type].has(id)) {
      // Click on date with no report: still update selection visual but show empty state
      STATE.selectedId = id;
      syncHash();
      renderCalendar();
      renderEmptyReport(id);
      return;
    }
    STATE.selectedId = id;
    syncHash();
    renderCalendar();
    loadAndRender(id);
  }

  function renderEmptyReport(id) {
    const panel = $('bf-report');
    if (!panel) return;
    panel.innerHTML = `
      <div class="bf-empty">
        <div class="bf-empty-title">אין דוח לתאריך הזה</div>
        <div class="bf-empty-sub">${escapeHtml(STATE.type === 'daily' ? fmtDateHe(id) : id)}</div>
        <div class="bf-empty-hint">
          הדוחות מתפרסמים אוטומטית אחרי סגירת השוק האמריקאי (יומי) וביום ראשון בערב (שבועי).
        </div>
      </div>`;
  }

  async function loadAndRender(id) {
    const panel = $('bf-report');
    if (!panel) return;
    panel.innerHTML = `<div class="bf-loading">טוען דוח...</div>`;

    try {
      const data = await loadBrief(STATE.type, id);
      renderReport(panel, data);
    } catch (e) {
      panel.innerHTML = `<div class="bf-error">שגיאה: ${escapeHtml(e.message)}</div>`;
    }
  }

  function renderReport(panel, data) {
    if (!data?.brief) {
      panel.innerHTML = `<div class="bf-error">לא נמצא דוח</div>`;
      return;
    }

    const generated = data.generatedAt
      ? new Date(data.generatedAt).toLocaleString('he-IL', { dateStyle: 'short', timeStyle: 'short' })
      : '';

    const tickers = data.tickers && data.tickers.length
      ? data.tickers
      : extractTickers(data.brief);

    const bodyHtml = renderMarkdown(data.brief);

    const dateLabel =
      STATE.type === 'daily'
        ? fmtDateHe(STATE.selectedId)
        : STATE.selectedId;

    panel.innerHTML = `
      <div class="bf-report-header">
        <div class="bf-report-title">דוח ${STATE.type === 'daily' ? 'יומי' : 'שבועי'}: ${escapeHtml(dateLabel)}</div>
        <div class="bf-report-meta">${generated ? `נוצר: ${generated}` : ''}${data._source === 'cache' ? ' · cache' : ''}</div>
      </div>
      <div class="bf-report-grid">
        <article class="bf-report-body" id="bf-report-body">${bodyHtml}</article>
        <aside class="bf-report-side">
          ${renderSideMarket(data)}
          ${tickers.length ? `
            <div class="bf-side-block">
              <div class="bf-side-h">טיקרים</div>
              <div class="bf-tickers-grid" id="bf-tickers-grid">
                ${tickers.map((t) => `
                  <div class="bf-ticker-card" data-ticker="${t}">
                    <span class="sym">${t}</span>
                    <span class="pct flat" data-pct-for="${t}">--</span>
                  </div>`).join('')}
              </div>
            </div>` : ''}
          ${renderSources(data)}
        </aside>
      </div>`;

    // Bind ticker clicks (placeholder — could navigate elsewhere later)
    panel.querySelectorAll('[data-ticker]').forEach((el) => {
      el.addEventListener('click', () => {
        const t = el.dataset.ticker;
        const fn = global.openStockDetail || global.showTickerDetail;
        if (typeof fn === 'function') fn(t);
      });
    });

    // Async ticker enrichment
    if (tickers.length) {
      enrichTickersAsync(tickers).then((quotes) => {
        Object.entries(quotes).forEach(([t, q]) => {
          const cls = q.changePct > 0 ? 'up' : q.changePct < 0 ? 'down' : 'flat';
          const txt = `${q.changePct > 0 ? '+' : ''}${q.changePct.toFixed(2)}%`;
          panel.querySelectorAll(`[data-pct-for="${t}"]`).forEach((node) => {
            node.className = `pct ${cls}`;
            node.textContent = txt;
          });
        });
        const body = $('bf-report-body');
        if (body) body.innerHTML = enrichTickers(bodyHtml, quotes);
      });
    }
  }

  function renderSideMarket(data) {
    const items = [];
    (data.indices || []).forEach((i) =>
      items.push({ name: i.name, pct: i.changePct, level: i.level })
    );
    if (data.macro) {
      Object.values(data.macro).slice(0, 5).forEach((m) =>
        items.push({ name: m.name, pct: m.changePct, level: m.level })
      );
    }
    if (!items.length) return '';
    return `
      <div class="bf-side-block">
        <div class="bf-side-h">סנפשוט שוק</div>
        <div class="bf-snap">
          ${items.map((i) => {
            const cls = i.pct > 0 ? 'up' : i.pct < 0 ? 'down' : 'flat';
            const sign = i.pct > 0 ? '+' : '';
            return `
              <div class="bf-snap-row">
                <span class="name">${escapeHtml(i.name)}</span>
                <span class="val ${cls}">${sign}${(i.pct ?? 0).toFixed(2)}%</span>
              </div>`;
          }).join('')}
        </div>
      </div>`;
  }

  function renderSources(data) {
    const sources = data.sources || [];
    const searches = data.searchesUsed || [];
    if (!sources.length && !searches.length) return '';
    const seen = new Set();
    const unique = sources.filter((s) => {
      if (seen.has(s.url)) return false;
      seen.add(s.url);
      return true;
    });
    return `
      <div class="bf-side-block">
        <details class="bf-sources">
          <summary>${unique.length} מקורות${searches.length ? ` · ${searches.length} חיפושים` : ''}</summary>
          ${unique.length ? `
            <ul class="bf-sources-list">
              ${unique.slice(0, 25).map((s) => `
                <li><a href="${escapeHtml(s.url)}" target="_blank" rel="noopener">${escapeHtml(s.title || s.url)}</a></li>
              `).join('')}
            </ul>` : ''}
        </details>
      </div>`;
  }

  // ───── Setup screen (when worker URL not configured) ──────────────────────
  function renderSetup() {
    const view = $('view-brief');
    if (!view) return;
    view.innerHTML = `
      <div class="bf-page">
        <div class="bf-setup">
          <div class="bf-setup-title">הגדר את ה-Brief Worker</div>
          <div class="bf-setup-sub">
            דוחות AI מסופקים מ-Cloudflare Worker נפרד. הדבק את ה-URL של ה-Worker שפרסת
            (ראה <code>brief-worker/DEPLOY.md</code> בשורש הפרויקט).
          </div>
          <input id="bf-setup-input" class="bf-setup-input" type="text"
            placeholder="https://stockpulse-brief-worker.YOUR-SUBDOMAIN.workers.dev"
            autocomplete="off" spellcheck="false" />
          <div class="bf-setup-err" id="bf-setup-err"></div>
          <button class="bf-setup-btn" id="bf-setup-save">שמור והמשך</button>
        </div>
      </div>`;

    const input = $('bf-setup-input');
    const err = $('bf-setup-err');
    const save = $('bf-setup-save');
    input.value = workerUrl();

    async function attempt() {
      const url = input.value.trim();
      if (!url) { err.textContent = 'יש להזין URL'; return; }
      if (!/^https?:\/\//.test(url)) { err.textContent = 'URL חייב להתחיל ב-http(s)://'; return; }
      err.textContent = 'בודק חיבור...';
      try {
        const resp = await fetch(`${url.replace(/\/+$/, '')}/health`);
        if (!resp.ok) throw new Error(`Worker החזיר ${resp.status}`);
        await resp.json();
        setWorkerUrl(url);
        err.textContent = '';
        STATE.initialized = false;
        init(); // re-init with new URL
      } catch (e) {
        err.textContent = `שגיאה: ${e.message}`;
      }
    }

    save.addEventListener('click', attempt);
    input.addEventListener('keydown', (e) => { if (e.key === 'Enter') attempt(); });
  }

  // ───── Full layout ────────────────────────────────────────────────────────
  function renderShell() {
    const view = $('view-brief');
    if (!view) return;
    view.innerHTML = `
      <div class="bf-page">
        <div class="bf-toolbar">
          <div class="bf-tabs">
            <button class="bf-tab" data-type="daily">יומי</button>
            <button class="bf-tab" data-type="weekly">שבועי</button>
          </div>
          <div class="bf-spacer"></div>
          <button class="bf-icon-btn" id="bf-refresh" title="רענון רשימה">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
          </button>
          <button class="bf-icon-btn" id="bf-settings" title="הגדרות">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
          </button>
        </div>

        <div class="bf-layout">
          <aside class="bf-cal-wrap">
            <div class="bf-cal-header">
              <button class="bf-cal-nav" id="bf-prev" title="חודש קודם">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="9 18 15 12 9 6"/></svg>
              </button>
              <div class="bf-cal-month" id="bf-cal-month"></div>
              <button class="bf-cal-nav" id="bf-next" title="חודש הבא">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="15 18 9 12 15 6"/></svg>
              </button>
            </div>
            <div class="bf-calendar" id="bf-calendar"></div>
            <button class="bf-today-btn" id="bf-today">חזור להיום</button>
          </aside>

          <section class="bf-report" id="bf-report">
            <div class="bf-empty">
              <div class="bf-empty-title">בחר תאריך מהלוח</div>
              <div class="bf-empty-sub">דוחות AI מעמיקים על שוק המניות האמריקאי</div>
            </div>
          </section>
        </div>
      </div>`;

    // Bind toolbar
    view.querySelectorAll('.bf-tab').forEach((btn) => {
      btn.addEventListener('click', () => switchType(btn.dataset.type));
    });
    $('bf-refresh').addEventListener('click', refresh);
    $('bf-settings').addEventListener('click', openSettings);
    $('bf-prev').addEventListener('click', () => navigateMonth(-1));
    $('bf-next').addEventListener('click', () => navigateMonth(+1));
    $('bf-today').addEventListener('click', goToToday);

    updateActiveTab();
    updateMonthLabel();
  }

  function updateActiveTab() {
    document.querySelectorAll('.bf-tab').forEach((t) => {
      t.classList.toggle('active', t.dataset.type === STATE.type);
    });
  }

  function updateMonthLabel() {
    const lbl = $('bf-cal-month');
    if (lbl) lbl.textContent = monthLabel(STATE.cursorMonth);
  }

  function switchType(type) {
    if (type !== 'daily' && type !== 'weekly') return;
    STATE.type = type;
    STATE.selectedId = null;
    updateActiveTab();
    renderCalendar();
    selectLatestForType();
    // selectLatestForType → selectId → syncHash, so the URL updates here too
  }

  function navigateMonth(delta) {
    STATE.cursorMonth = shiftMonth(STATE.cursorMonth, delta);
    updateMonthLabel();
    renderCalendar();
  }

  function goToToday() {
    STATE.cursorMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
    updateMonthLabel();
    renderCalendar();
    selectLatestForType();
  }

  function openSettings() {
    const current = workerUrl();
    const next = prompt('Brief Worker URL:', current);
    if (next === null) return; // cancelled
    setWorkerUrl(next.trim());
    STATE.initialized = false;
    init();
  }

  async function refresh() {
    try {
      // bust cache for current selection too
      if (STATE.selectedId) {
        localStorage.removeItem(CACHE_PREFIX + `${STATE.type}:${STATE.selectedId}`);
      }
      await loadList();
      renderCalendar();
      if (STATE.selectedId) selectId(STATE.selectedId);
      else selectLatestForType();
    } catch (e) {
      console.error('refresh failed', e);
    }
  }

  function selectLatestForType() {
    const map = STATE.available[STATE.type];
    if (!map || map.size === 0) {
      renderEmptyReport(STATE.type === 'daily' ? todayISO() : getISOWeek(new Date()));
      return;
    }
    const latest = Array.from(map.keys()).sort().reverse()[0];
    selectId(latest);
  }

  // Sync the URL hash to the current selection so deep-links work
  // (e.g. #/brief/daily/2026-05-04). Uses replaceState to avoid polluting
  // browser history on every date click.
  function syncHash() {
    if (!STATE.selectedId) return;
    const want = `#/brief/${STATE.type}/${STATE.selectedId}`;
    if (location.hash !== want) {
      try { history.replaceState(null, '', want); } catch (_) { location.hash = want; }
    }
  }

  // Apply deep-link params (from the router): ['daily','2026-05-04']
  function applyDeepLink(params) {
    if (!Array.isArray(params) || params.length === 0) return false;
    const [type, id] = params;
    if (type !== 'daily' && type !== 'weekly') return false;
    STATE.type = type;
    if (id) {
      STATE.selectedId = id;
      // Move calendar cursor to the month containing the selected date/week
      try {
        const d = type === 'daily'
          ? new Date(id + 'T12:00:00')
          : dateOfISOWeek(id);
        STATE.cursorMonth = new Date(d.getFullYear(), d.getMonth(), 1);
      } catch (_) {}
    }
    return true;
  }

  // ───── Init ───────────────────────────────────────────────────────────────
  async function init(params) {
    const view = $('view-brief');
    if (!view) {
      // The screen container does not exist (HTML not patched yet).
      console.warn('initBrief: #view-brief not found');
      return;
    }

    if (!workerUrl()) {
      renderSetup();
      return;
    }

    const hadDeepLink = applyDeepLink(params);

    if (!STATE.initialized) {
      if (!STATE.cursorMonth) {
        STATE.cursorMonth = new Date(new Date().getFullYear(), new Date().getMonth(), 1);
      }
      renderShell();
      STATE.initialized = true;
    } else if (hadDeepLink) {
      // Already initialized — just refresh the toolbar/calendar to match
      updateActiveTab();
      updateMonthLabel();
    }

    try {
      await loadList();
      renderCalendar();
      if (STATE.selectedId) {
        // Either deep-linked or restored — load that one
        selectId(STATE.selectedId);
      } else {
        selectLatestForType();
      }
    } catch (e) {
      const msg = e.message === 'NO_WORKER_URL' ? 'Worker URL לא מוגדר' : e.message;
      const panel = $('bf-report');
      if (panel) {
        panel.innerHTML = `
          <div class="bf-error">
            שגיאה בטעינת הרשימה: ${escapeHtml(msg)}
            <div style="margin-top:8px">
              <button class="bf-setup-btn" onclick="window.initBrief()">נסה שוב</button>
              <button class="bf-icon-btn" onclick="(function(){localStorage.removeItem('app_brief_worker_url');window.initBrief();})()">איפוס הגדרות</button>
            </div>
          </div>`;
      }
    }
  }

  // ───── Public API ─────────────────────────────────────────────────────────
  global.initBrief = init;
  global.briefShowDate = (iso) => { STATE.type = 'daily'; STATE.selectedId = iso; init(); };
  global.briefShowWeek = (w) => { STATE.type = 'weekly'; STATE.selectedId = w; init(); };
})(window);
