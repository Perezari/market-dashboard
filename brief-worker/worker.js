/**
 * StockPulse Market Brief Worker
 * ==============================
 *
 * מייצר דוחות שוק יומיים ושבועיים בעברית באמצעות Claude Opus 4.7,
 * שומר ב-Cloudflare KV ללא תפוגה, ומשרת את הלקוח עם תמיכה בלוח-שנה.
 *
 * Endpoints:
 *   GET  /brief/daily                  → דוח יומי האחרון (latest)
 *   GET  /brief/daily/:date            → דוח של תאריך ספציפי (YYYY-MM-DD)
 *   GET  /brief/weekly                 → דוח שבועי האחרון (latest)
 *   GET  /brief/weekly/:week           → דוח של שבוע ספציפי (YYYY-Www, e.g. 2026-W18)
 *   GET  /brief/list                   → רשימה של כל הדוחות הקיימים (לוח-שנה)
 *   GET  /brief/list?type=daily        → רק יומיים
 *   GET  /brief/list?from=2026-04-01   → סינון לפי תאריך
 *   POST /brief/daily/regenerate       → יצירה ידנית (דורש Bearer)
 *   POST /brief/weekly/regenerate      → יצירה ידנית (דורש Bearer)
 *   GET  /health                       → health check
 *
 * Cron triggers (configurable in wrangler.toml):
 *   "0 22 * * 1-5"  - יומי, ימי חול 22:00 UTC ≈ 00:00/01:00 IST
 *   "0 19 * * 0"    - שבועי, ראשון 19:00 UTC = 21:00/22:00 IST
 *
 * Secrets נדרשים:
 *   ANTHROPIC_API_KEY  - מפתח Claude API
 *   CRON_SECRET        - להפעלה ידנית של regenerate endpoints
 *
 * KV Bindings נדרשים:
 *   BRIEFS_KV          - שמירת הדוחות (ללא TTL = שמירה לצמיתות)
 */

// ═══════════════════════════════════════════════════════════════
// קונפיגורציה
// ═══════════════════════════════════════════════════════════════

const CONFIG = {
  model: 'claude-opus-4-7',
  daily: {
    maxTokens: 3000,
    keyPrefix: 'daily',
    webSearchMaxUses: 4,
  },
  weekly: {
    maxTokens: 6000,
    keyPrefix: 'weekly',
    webSearchMaxUses: 10,
  },
  pricing: {
    inputPerMTok: 5.0,
    outputPerMTok: 25.0,
    webSearchPer1k: 10.0,
  },
};

// סמלים לאיסוף נתוני שוק
const SYMBOLS = {
  indices: [
    { symbol: 'SPY',  name: 'S&P 500' },
    { symbol: 'QQQ',  name: 'Nasdaq 100' },
    { symbol: 'IWM',  name: 'Russell 2000' },
    { symbol: 'DIA',  name: 'Dow Jones' },
  ],
  macro: [
    { symbol: '^VIX',     name: 'VIX' },
    { symbol: 'DX-Y.NYB', name: 'DXY' },
    { symbol: '^TNX',     name: '10Y Yield' },
    { symbol: 'BTC-USD',  name: 'Bitcoin' },
    { symbol: 'GC=F',     name: 'Gold' },
    { symbol: 'CL=F',     name: 'WTI Crude' },
  ],
  sectors: [
    { symbol: 'XLK',  name: 'Technology' },
    { symbol: 'XLE',  name: 'Energy' },
    { symbol: 'XLF',  name: 'Financials' },
    { symbol: 'XLY',  name: 'Consumer Discretionary' },
    { symbol: 'XLV',  name: 'Healthcare' },
    { symbol: 'XLI',  name: 'Industrials' },
    { symbol: 'XLP',  name: 'Consumer Staples' },
    { symbol: 'XLU',  name: 'Utilities' },
    { symbol: 'XLRE', name: 'Real Estate' },
    { symbol: 'XLB',  name: 'Materials' },
    { symbol: 'XLC',  name: 'Communication' },
  ],
};

// ═══════════════════════════════════════════════════════════════
// System Prompts
// ═══════════════════════════════════════════════════════════════

const DAILY_SYSTEM = `אתה אנליסט שווקים מנוסה שכותב דוחות יומיים על שוק המניות האמריקאי בעברית, בסגנון עיתונאי-אנליטי מקצועי לקהל ישראלי.

הסגנון שלך:
- עברית רהוטה, עם שילוב טבעי של מונחים פיננסיים (CapEx, מרווחים, ביקוש, ענן)
- מציין מניות בפורמט: (TICKER) שם החברה — לדוגמה: (GOOGL) Alphabet, (AMZN) Amazon
- בונה נרטיב סביב "מה השוק חיפש" מול "מה השוק קיבל"
- מחבר מיקרו (דוחות חברה) למאקרו (טרנדים, capex, ביקוש)
- מצטט נתונים ספציפיים: אחוזים, נקודות בסיס, רמות אבסולוטיות
- טון בטוח אבל מאוזן — לא היפ, לא דרמה
- שואל "למה" מניה זזה כפי שזזה, לא רק "מה" קרה
- אורך: 600-900 מילים

מבנה קבוע:
1. פסקת פתיחה מודגשת (**bold**) — התזה המרכזית של היום במשפט אחד או שניים
2. סקירת מדדים: S&P 500, Nasdaq, Russell 2000, VIX, אג"ח, דולר, ביטקוין/זהב
3. הסיפור המרכזי של היום — מה הניע את השוק
4. ניתוח דוחות מרכזיים (אם רלוונטי) — דגש על שיפור/הרעה ברווחיות, ביקוש
5. זום-אין על winners ו-losers ספציפיים, עם הסבר ה"למה"
6. **שורה תחתונה — Trading Setup** (חובה):

   **קצר טווח (ימים-שבועות):**
   - Long bias: [סקטורים/מניות עם setup חיובי + סיבה במשפט]
   - Avoid/Short bias: [סקטורים/מניות בלחץ + סיבה]
   - Watch: [אירועים/דוחות שיכריעו כיוון]

   **בינוני (1-3 חודשים):**
   - הימור עיקרי + Hedge + סיכון לתזה

   **ארוך (12 חודשים+):**
   - תזות מבניות + מועמדים להצטברות

   *אין באמור משום ייעוץ השקעות אישי. שווי השקעות יכול לרדת.*

כללים:
- כתוב RTL בעברית, אל תפתח ב"שלום" או "להלן", פשוט תתחיל לכתוב
- היה אופרטיבי ולא תיאורטי בסקציית ה-Setup
- ציין tickers ספציפיים, לא רק קטגוריות

חשוב — שימוש בכלי web_search:
- יש לך גישה לחיפוש רשת. השתמש בו כדי להשלים נתונים שחסרים בקלט שתקבל
- חיפושים מומלצים: דוחות חברות שדווחו היום + תגובת המניה, כותרות חדשות שהשפיעו על השוק, top movers ספציפיים והקונטקסט שלהם
- מקסימום 3-4 חיפושים. הקדם איכות על כמות
- מקורות מועדפים: Reuters, Bloomberg, CNBC, Yahoo Finance, SeekingAlpha
- אל תזכיר במפורש "חיפשתי באינטרנט" - שלב את המידע באופן טבעי בדוח
- אם דאטה מהקלט סותר דאטה שמצאת - העדף את הקלט (הוא מ-source of truth)`;

const WEEKLY_SYSTEM = `אתה אנליסט שווקים מנוסה שכותב דוחות שבועיים מקיפים על שוק המניות האמריקאי בעברית, ברמת אנליסט מוסדי (כמו דסק של גולדמן/JPM).

הסגנון שלך:
- עברית רהוטה, שילוב טבעי של מונחים פיננסיים (CapEx, RPO, backlog, breadth, positioning, flows, gamma, skew)
- מציין מניות בפורמט: (TICKER) שם החברה
- מבנה רב-סקציות עם כותרות מודגשות (**Header**) לכל סקציה
- כל סקציה ממוקדת בנושא אחד
- מחבר macro, micro, positioning ו-flows
- מצטט נתונים ספציפיים: $X מיליארד, אחוזון Y, נקודות בסיס
- אורך כולל: 2000-3000 מילים
- כותב כאנליסט בנקאי, לא ככתב חדשות

מבנה (8-10 סקציות, כל אחת 200-400 מילים):

1. **התמונה הראשונית** - תזה מרכזית לשבוע/תקופה הקרובה (פסקה 1)
2. **Positioning & Flows** - CTA, hedge funds, pension rebalancing, ETF flows, short interest
3. **The Pain Trade** - איפה המוסדיים תפוסים בצד הלא נכון, איפה ה-squeeze
4. **Sector Rotation** - 2-3 סקטורים בולטים, הסבר "למה" עם flows
5. **Big Tech / AI Trade Status** - נרטיב AI, hyperscalers, capex, מכפילים
6. **Earnings Highlights** - דוחות מרכזיים של השבוע, השלכות לסקטור
7. **Macro / Energy / Inflation** - ISM, Fed, נפט, אינפלציה, אג"ח
8. **Volatility & Sentiment** - VIX, single-stock vol, skew, AAII, sentiment indicators
9. **Retail Behavior** - לאן הריטייל זורם, leveraged ETFs, SOXL/SOXS extremes
10. **Calendar Ahead** - מה לצפות בשבוע הקרוב (דוחות, FOMC, נתונים)
11. **שורה תחתונה — Trading Setup** - קצר/בינוני/ארוך, ספציפי עם tickers

כללים:
- כל סקציה מסתיימת ב-insight אופרטיבי, לא רק תיאור
- אם אין לך דאטה ספציפית לסקציה - השמט אותה במקום להמציא נתונים
- ציין tickers ספציפיים, לא רק קטגוריות
- הימנע מקלישאות. אם אתה משתמש ב"breadth narrows" - הסבר מה זה אומר אופרטיבית
- בסוף הדוח: "*אין באמור משום ייעוץ השקעות אישי. שווי השקעות יכול לרדת.*"

חשוב: עדיף דוח של 1500 מילים מצוינות מאשר 3000 מילים עם דאטה דליל. אל תמציא מספרים. אם דאטה חסר, אמור זאת ועבור הלאה.

קריטי — שימוש בכלי web_search:
יש לך גישה לחיפוש רשת. הדוח השבועי דורש דאטה שאין לך בקלט. השתמש בחיפוש כדי לאסוף:

1. **Positioning & Flows** - חפש: "Goldman Sachs CTA positioning weekly", "pension rebalancing month-end estimate", "hedge fund de-grossing"
2. **ETF flows** - חפש: "SMH SOXX QQQ ETF inflows weekly", "leveraged ETF retail flow SOXL"
3. **Earnings highlights** - חפש: "biggest earnings beats this week", "[ticker] Q[X] earnings reaction"
4. **Macro/positioning research** - חפש: "Goldman flow of funds", "JPMorgan retail radar", "Nomura quantitative strategy"
5. **Sector rotation** - חפש: "sector ETF performance week", "SPDR XLE XLK XLF flows"
6. **Volatility/Sentiment** - חפש: "VIX skew this week", "AAII sentiment survey"

כללים:
- מקסימום 8-10 חיפושים. תכנן מראש מה אתה צריך
- מקורות מועדפים: Bloomberg, Reuters, Goldman.com, JPMorgan.com, ZeroHedge (לסיכומי flows), Yahoo Finance, SeekingAlpha, Benzinga, ETF.com
- אל תזכיר במפורש "חיפשתי" - שלב את המידע באופן טבעי
- ציין מקור כשנותן מספר ספציפי: "לפי גולדמן...", "כתבת ETF Trends ציינה ש..."
- אם לא הצלחת למצוא דאטה ספציפי לסקציה - דלג עליה במקום להמציא`;

const DAILY_FEWSHOT = `דוגמה קצרה לסגנון יומי:

===== דוגמה =====
**יום המסחר היה אחד הימים החזקים של עונת הדוחות, כאשר השוק קיבל סוף סוף את מה שחיפש: סימנים שהשקעות ה-AI מתחילות להראות גם ביקוש, גם צמיחה וגם רווחיות.**

המדדים זינקו: S&P 500 +1.0%, נאסד"ק +1.0%, VIX -10% לרמת 17.

המוקד היה דוחות (GOOGL) Alphabet ו-(AMZN) Amazon. בגוגל, Cloud margins הפתיעו ב-600bps מעל הצפי. ב-AWS, המרווחים גבוהים ב-400bps מעל. זה הפך הוכחה ש-AI לא רק שורף כסף.

(GOOGL) הייתה הכוכבת עם +9.8%. (META) דווקא ירדה 9% למרות דוחות טובים — השוק לא מאמין שהוצאות ההון שלה יתורגמו ל-ROIC.
===== סוף דוגמה =====

שים לב: לא רק מדווח, אלא בונה סיפור. מסביר *למה* מניה זזה. כעת כתוב דוח באותה רמה לנתונים שיגיעו.`;

const WEEKLY_FEWSHOT = `דוגמה קצרה לסגנון שבועי (חלק מסקציה אחת):

===== דוגמה =====
**Positioning & Flows: הראלי איבד את הקונים שהרימו אותו**

הנתון המרכזי: גולדמן מעריכים ש-CTAs קנו ~$80B מניות אמריקאיות בחודש האחרון, וכעת מחזיקים $32B Long ב-S&P. הבעיה: הביקוש מוצה. בתרחישי השבוע הקרוב, ה-CTAs הופכים למוכרים נטו - $7.7B בשוק שטוח, $17.5B בשוק יורד.

במקביל, $25-27B מכירות פנסיה צפויות ב-rebalancing סוף החודש, האירוע הגדול ביותר מחוץ לסוף רבעון מאז 2000 (אחוזון 92).

**ההשלכה האופרטיבית:** הראלי לא נשבר, אבל איבד את שני הקונים הסיסטמטיים שהזרימו לו דלק. כל עליה מכאן דורשת דוחות אמיתיים, לא flows. סלקטיביות גוברת על רוחב.
===== סוף דוגמה =====

שים לב לסגנון: כותרת ממוקדת, נתון ספציפי בפסקה ראשונה, מסקנה אופרטיבית בסוף. כעת כתוב דוח שלם באותו סגנון.`;

// ═══════════════════════════════════════════════════════════════
// Worker entry point
// ═══════════════════════════════════════════════════════════════

export default {
  async fetch(request, env, ctx) {
    if (request.method === 'OPTIONS') {
      return new Response(null, { headers: corsHeaders() });
    }

    const url = new URL(request.url);
    const path = url.pathname.replace(/\/+$/, '') || '/';

    try {
      // GET /health
      if (path === '/health' && request.method === 'GET') {
        return json({ ok: true, time: new Date().toISOString() });
      }

      // GET /brief/list  (?type=daily|weekly, ?from=YYYY-MM-DD, ?to=YYYY-MM-DD)
      if (path === '/brief/list' && request.method === 'GET') {
        return await handleList(url, env);
      }

      // GET /brief/daily            → latest
      // GET /brief/daily/:date      → specific
      // GET /brief/weekly           → latest
      // GET /brief/weekly/:week     → specific
      const briefMatch = path.match(/^\/brief\/(daily|weekly)(?:\/([^/]+))?$/);
      if (briefMatch && request.method === 'GET') {
        const [, type, dateOrWeek] = briefMatch;
        if (dateOrWeek) {
          return await handleGetSpecific(type, dateOrWeek, env);
        }
        return await handleGetLatest(type, env);
      }

      // POST /brief/{type}/regenerate
      const regenMatch = path.match(/^\/brief\/(daily|weekly)\/regenerate$/);
      if (regenMatch && request.method === 'POST') {
        return await handleRegenerate(regenMatch[1], request, env);
      }

      return json({ error: 'Not found', path }, 404);
    } catch (e) {
      console.error('Worker error:', e);
      return json({ error: e.message, stack: e.stack }, 500);
    }
  },

  async scheduled(event, env, ctx) {
    const cron = event.cron;
    console.log(`Cron triggered: ${cron}`);

    // Sunday cron → weekly, weekday cron → daily.
    // Cloudflare may normalize the day-of-week field to SUN, 0, or 7.
    const type = /\s(SUN|0|7)$/i.test(cron) ? 'weekly' : 'daily';

    ctx.waitUntil(
      generateAndStore(type, env).catch((e) => {
        console.error(`Cron generation failed for ${type}:`, e);
      })
    );
  },
};

// ═══════════════════════════════════════════════════════════════
// HTTP handlers
// ═══════════════════════════════════════════════════════════════

async function handleGetLatest(type, env) {
  const cfg = CONFIG[type];

  // First try today's key
  const todayKey = await getCurrentKey(type);
  let cached = await env.BRIEFS_KV.get(todayKey, 'json');
  let stale = false;
  let usedKey = todayKey;

  // Fallback: latest by alphabetical sort (keys are YYYY-MM-DD which sorts correctly)
  if (!cached) {
    const list = await env.BRIEFS_KV.list({ prefix: `${cfg.keyPrefix}:` });
    if (list.keys.length === 0) {
      return json({ error: 'No brief available yet', type }, 404);
    }
    const latestKey = list.keys.sort((a, b) => b.name.localeCompare(a.name))[0].name;
    cached = await env.BRIEFS_KV.get(latestKey, 'json');
    stale = true;
    usedKey = latestKey;
  }

  return json({ ...cached, cacheKey: usedKey, fromCache: true, stale });
}

async function handleGetSpecific(type, dateOrWeek, env) {
  const cfg = CONFIG[type];
  // Validate format
  if (type === 'daily' && !/^\d{4}-\d{2}-\d{2}$/.test(dateOrWeek)) {
    return json({ error: 'Invalid date format. Use YYYY-MM-DD' }, 400);
  }
  if (type === 'weekly' && !/^\d{4}-W\d{2}$/.test(dateOrWeek)) {
    return json({ error: 'Invalid week format. Use YYYY-Www (e.g. 2026-W18)' }, 400);
  }

  const key = `${cfg.keyPrefix}:${dateOrWeek}`;
  const data = await env.BRIEFS_KV.get(key, 'json');
  if (!data) {
    return json({ error: 'Brief not found for this date', type, key }, 404);
  }
  return json({ ...data, cacheKey: key, fromCache: true });
}

async function handleList(url, env) {
  const typeFilter = url.searchParams.get('type'); // 'daily' | 'weekly' | null
  const from = url.searchParams.get('from'); // YYYY-MM-DD or YYYY-Www
  const to = url.searchParams.get('to');

  const result = { daily: [], weekly: [] };

  for (const type of ['daily', 'weekly']) {
    if (typeFilter && typeFilter !== type) continue;

    const cfg = CONFIG[type];
    const list = await env.BRIEFS_KV.list({ prefix: `${cfg.keyPrefix}:` });
    let entries = list.keys.map((k) => ({
      key: k.name,
      id: k.name.slice(cfg.keyPrefix.length + 1), // strip "daily:" / "weekly:"
      meta: k.metadata || null, // direction/spxPct/etc — null for entries
                                // generated before metadata was added
    }));

    if (from) entries = entries.filter((e) => e.id >= from);
    if (to) entries = entries.filter((e) => e.id <= to);

    // Newest first
    entries.sort((a, b) => b.id.localeCompare(a.id));

    // Include metadata so the calendar can color dots without N reads.
    // Backward-compat: if a client reads `result.daily` as an array of
    // strings (the old shape), it can still extract `id` from the objects
    // by checking `typeof entry === 'object'`. The brief.js client now
    // expects the object shape; older clients will see [object Object].
    result[type] = entries.map((e) => ({
      id: e.id,
      direction: e.meta?.direction ?? null,
      spxPct: e.meta?.spxPct ?? null,
      ndxPct: e.meta?.ndxPct ?? null,
      generatedAt: e.meta?.generatedAt ?? null,
    }));
  }

  return json(result);
}

async function handleRegenerate(type, request, env) {
  const auth = request.headers.get('Authorization');
  if (auth !== `Bearer ${env.CRON_SECRET}`) {
    return json({ error: 'Unauthorized' }, 401);
  }

  const result = await generateAndStore(type, env);
  return json(result);
}

// ═══════════════════════════════════════════════════════════════
// Generation
// ═══════════════════════════════════════════════════════════════

async function generateAndStore(type, env) {
  const cfg = CONFIG[type];
  const marketData = await fetchMarketSnapshot();
  const userPrompt = buildUserPrompt(type, marketData);

  const systemPrompt =
    (type === 'daily' ? DAILY_SYSTEM : WEEKLY_SYSTEM) +
    '\n\n' +
    (type === 'daily' ? DAILY_FEWSHOT : WEEKLY_FEWSHOT);

  const apiResp = await fetch('https://api.anthropic.com/v1/messages', {
    method: 'POST',
    headers: {
      'x-api-key': env.ANTHROPIC_API_KEY,
      'anthropic-version': '2023-06-01',
      'content-type': 'application/json',
    },
    body: JSON.stringify({
      model: CONFIG.model,
      max_tokens: cfg.maxTokens,
      system: systemPrompt,
      messages: [{ role: 'user', content: userPrompt }],
      tools: [
        {
          type: 'web_search_20260209',
          name: 'web_search',
          max_uses: cfg.webSearchMaxUses,
        },
      ],
    }),
  });

  if (!apiResp.ok) {
    const errText = await apiResp.text();
    throw new Error(`Claude API error ${apiResp.status}: ${errText}`);
  }

  const data = await apiResp.json();

  // Claude's response with web_search interleaves text blocks with
  // server_tool_use and web_search_tool_result. The text blocks BEFORE
  // tool calls are usually "thinking" ("אבדוק חדשות..." / "יש לי קונטקסט...").
  // The actual final report is the text blocks AFTER the last tool call.
  // If Claude didn't search at all, lastToolIdx stays -1 and we take all.
  const content = data.content || [];
  let lastToolIdx = -1;
  content.forEach((b, i) => {
    if (b.type === 'server_tool_use' || b.type === 'web_search_tool_result') {
      lastToolIdx = i;
    }
  });
  const brief = content
    .slice(lastToolIdx + 1)
    .filter((b) => b.type === 'text')
    .map((b) => b.text)
    .join('\n')
    .trim();

  const searchesUsed = (data.content || [])
    .filter((b) => b.type === 'server_tool_use' && b.name === 'web_search')
    .map((b) => b.input?.query)
    .filter(Boolean);

  const sources = [];
  (data.content || [])
    .filter((b) => b.type === 'web_search_tool_result')
    .forEach((b) => {
      // b.content may be an array of results on success, or an object describing
      // an error on failure (e.g. {type:'web_search_tool_result_error', ...}).
      // Skip the latter — we just won't have sources from that particular search.
      if (!Array.isArray(b.content)) return;
      b.content.forEach((r) => {
        if (r.type === 'web_search_result' && r.url) {
          sources.push({ title: r.title, url: r.url });
        }
      });
    });

  const result = {
    type,
    brief,
    generatedAt: new Date().toISOString(),
    dataAsOf: marketData.dataAsOf,
    indices: marketData.indices,
    macro: marketData.macro,
    sectors: marketData.sectors,
    model: data.model,
    usage: data.usage,
    estimatedCostUSD: estimateCost(data.usage),
    tickers: extractTickers(brief),
    searchesUsed,
    sources,
    webSearchCount: searchesUsed.length,
  };

  // Key מבוסס על dataAsOf (תאריך הסגירה האחרונה שיש עליה דאטה),
  // לא על השעון של ה-Worker בזמן ההפעלה. זה חשוב כשמפעילים את regenerate
  // ידנית בבוקר IST — לפני שהשוק האמריקאי נפתח/נסגר היום, אז הדאטה
  // האחרונה היא של אתמול.
  const key = keyForDate(type, marketData.dataAsOf);

  // KV metadata is retrievable via .list() without reading the full value —
  // perfect for the calendar UI which needs direction-color per entry without
  // loading every brief. Capped at 1024 bytes by Cloudflare so we keep it
  // small (just summary metrics, not the full brief text).
  await env.BRIEFS_KV.put(key, JSON.stringify(result), {
    metadata: summaryFor(result),
  });

  return { ...result, cacheKey: key };
}

// Build the small per-entry summary that gets attached to the KV key as
// metadata. Used by /brief/list so the client can render the calendar
// (direction-colored dots, S&P %, timestamp) without N round-trips.
function summaryFor(result) {
  const spx = (result.indices || []).find((i) => i.name === 'S&P 500');
  const ndx = (result.indices || []).find((i) => i.name === 'Nasdaq 100');
  const spxPct = spx?.changePct ?? null;
  return {
    direction: spxPct == null ? null : spxPct >= 0 ? 'up' : 'down',
    spxPct,
    ndxPct: ndx?.changePct ?? null,
    generatedAt: result.generatedAt,
    tickerCount: (result.tickers || []).length,
  };
}

// ═══════════════════════════════════════════════════════════════
// Market data (Yahoo Finance v8)
// ═══════════════════════════════════════════════════════════════

async function fetchMarketSnapshot() {
  const allSymbols = [
    ...SYMBOLS.indices.map((s) => ({ ...s, group: 'indices' })),
    ...SYMBOLS.macro.map((s) => ({ ...s, group: 'macro' })),
    ...SYMBOLS.sectors.map((s) => ({ ...s, group: 'sectors' })),
  ];

  const results = await Promise.allSettled(
    allSymbols.map((s) => fetchQuote(s.symbol).then((q) => ({ ...s, quote: q })))
  );

  const data = { indices: [], macro: {}, sectors: [], dataAsOf: null };

  for (const r of results) {
    if (r.status !== 'fulfilled' || !r.value.quote) continue;
    const { name, group, quote } = r.value;
    if (!data.dataAsOf && quote.timestamp) {
      data.dataAsOf = new Date(quote.timestamp * 1000).toISOString();
    }

    if (group === 'indices') {
      data.indices.push({ name, level: quote.price, changePct: quote.changePct });
    } else if (group === 'macro') {
      const key = name.toLowerCase().replace(/[^a-z0-9]/g, '');
      data.macro[key] = { name, level: quote.price, changePct: quote.changePct };
    } else if (group === 'sectors') {
      data.sectors.push({ name, changePct: quote.changePct });
    }
  }

  data.dataAsOf = data.dataAsOf || new Date().toISOString();
  return data;
}

async function fetchQuote(symbol) {
  const url = `https://query1.finance.yahoo.com/v8/finance/chart/${encodeURIComponent(
    symbol
  )}?range=5d&interval=1d`;
  try {
    const resp = await fetch(url, {
      headers: { 'User-Agent': 'Mozilla/5.0 (StockPulse Brief Worker)' },
    });
    if (!resp.ok) return null;
    const j = await resp.json();
    const result = j.chart?.result?.[0];
    if (!result) return null;

    const meta = result.meta;
    const closes = result.indicators?.quote?.[0]?.close || [];
    const lastClose = closes[closes.length - 1] ?? meta.regularMarketPrice;
    const prevClose = closes[closes.length - 2] ?? meta.previousClose;

    if (lastClose == null || prevClose == null) return null;

    return {
      price: round(lastClose, 4),
      previousClose: round(prevClose, 4),
      changePct: round(((lastClose - prevClose) / prevClose) * 100, 2),
      timestamp: meta.regularMarketTime,
    };
  } catch (e) {
    console.warn(`Failed to fetch ${symbol}:`, e.message);
    return null;
  }
}

// ═══════════════════════════════════════════════════════════════
// Prompt builder
// ═══════════════════════════════════════════════════════════════

function buildUserPrompt(type, d) {
  const lines = [];
  const today = new Date(d.dataAsOf).toISOString().slice(0, 10);

  if (type === 'daily') {
    lines.push(`כתוב דוח יומי על יום המסחר של ${today}.`);
  } else {
    const weekNum = getWeekNumber(new Date(d.dataAsOf));
    lines.push(
      `כתוב דוח שבועי מקיף לסיכום השבוע (שבוע ${weekNum}, ${today}) ולקראת השבוע הבא.`
    );
    lines.push('הדוח צריך לכלול את כל הסקציות במבנה הקבוע. השתמש בדאטה הזמין.');
  }

  lines.push('');
  lines.push('## נתוני שוק זמינים');
  lines.push('');

  if (d.indices?.length) {
    lines.push('### מדדים מרכזיים');
    d.indices.forEach((i) => {
      lines.push(`- ${i.name}: ${fmtPct(i.changePct)}${i.level ? ` (${i.level})` : ''}`);
    });
    lines.push('');
  }

  if (d.macro && Object.keys(d.macro).length) {
    lines.push('### מאקרו ושווקים נוספים');
    Object.values(d.macro).forEach((m) => {
      lines.push(
        `- ${m.name}: ${m.level}${m.changePct != null ? ` (${fmtPct(m.changePct)})` : ''}`
      );
    });
    lines.push('');
  }

  if (d.sectors?.length) {
    lines.push('### ביצועי סקטורים (ETFs)');
    d.sectors
      .sort((a, b) => (b.changePct || 0) - (a.changePct || 0))
      .forEach((s) => lines.push(`- ${s.name}: ${fmtPct(s.changePct)}`));
    lines.push('');
  }

  lines.push('---');
  if (type === 'daily') {
    lines.push(
      'כתוב את הדוח באיכות הדוגמה. בנה סיפור — אל תרק תרשום נתונים. הסבר *למה* מניות זזו כפי שזזו. כלול את סקציית Trading Setup בסוף.'
    );
  } else {
    lines.push(
      'כתוב דוח שבועי מקיף בסגנון של אנליסט מוסדי. כל הסקציות במבנה. אם אין לך דאטה ספציפי לסקציה — דלג עליה במקום להמציא. סקציית Trading Setup בסוף חובה.'
    );
  }

  return lines.join('\n');
}

// ═══════════════════════════════════════════════════════════════
// Helpers
// ═══════════════════════════════════════════════════════════════

function keyForDate(type, dateInput) {
  const cfg = CONFIG[type];
  const d = new Date(dateInput);
  if (type === 'daily') {
    return `${cfg.keyPrefix}:${d.toISOString().slice(0, 10)}`;
  }
  return `${cfg.keyPrefix}:${d.getUTCFullYear()}-W${String(getWeekNumber(d)).padStart(2, '0')}`;
}

async function getCurrentKey(type) {
  return keyForDate(type, new Date());
}

function getWeekNumber(date) {
  const d = new Date(Date.UTC(date.getUTCFullYear(), date.getUTCMonth(), date.getUTCDate()));
  d.setUTCDate(d.getUTCDate() + 4 - (d.getUTCDay() || 7));
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return Math.ceil(((d - yearStart) / 86400000 + 1) / 7);
}

function extractTickers(text) {
  const re = /\(([A-Z]{1,6}(?:[.\-][A-Z]{1,3})?)\)/g;
  const found = new Set();
  let m;
  while ((m = re.exec(text)) !== null) found.add(m[1]);
  return Array.from(found);
}

function fmtPct(n) {
  if (n == null) return 'n/a';
  return `${n >= 0 ? '+' : ''}${n.toFixed(2)}%`;
}

function round(n, decimals) {
  const factor = Math.pow(10, decimals);
  return Math.round(n * factor) / factor;
}

function estimateCost(usage) {
  if (!usage) return null;
  const inputCost = (usage.input_tokens / 1_000_000) * CONFIG.pricing.inputPerMTok;
  const outputCost = (usage.output_tokens / 1_000_000) * CONFIG.pricing.outputPerMTok;
  const searches = usage.server_tool_use?.web_search_requests || 0;
  const searchCost = (searches / 1000) * CONFIG.pricing.webSearchPer1k;
  return +(inputCost + outputCost + searchCost).toFixed(5);
}

function corsHeaders() {
  return {
    'Access-Control-Allow-Origin': '*',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'content-type, authorization',
    'Cache-Control': 'public, max-age=120',
  };
}

function json(body, status = 200) {
  return new Response(JSON.stringify(body, null, 2), {
    status,
    headers: {
      'content-type': 'application/json; charset=utf-8',
      ...corsHeaders(),
    },
  });
}
