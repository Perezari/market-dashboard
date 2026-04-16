const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r=>setTimeout(r,ms));


let _proxyUrl = localStorage.getItem('app_proxy_url') || '';

const INDICES = [
  {sym:'SPY',  name:'S&P 500'},
  {sym:'QQQ',  name:'נאסד״ק 100'},
  {sym:'DIA',  name:'דאו ג׳ונס'},
  {sym:'IWM',  name:'ראסל 2000'},
];
const OTHER = [
  {sym:'GLD',  name:'זהב'},
  {sym:'IBIT', name:'Bitcoin ETF'},
  {sym:'VIXY', name:'VIX (VIXY)'},
  {sym:'TLT',  name:'אג״ח 20Y'},
  {sym:'UUP',  name:'דולר (UUP)'},
];
const SECTORS = [
  {sym:'XLK',  name:'טכנולוגיה'},
  {sym:'XLF',  name:'פיננסים'},
  {sym:'XLE',  name:'אנרגיה'},
  {sym:'XLV',  name:'בריאות'},
  {sym:'XLC',  name:'תקשורת'},
  {sym:'XLI',  name:'תעשייה'},
  {sym:'XLB',  name:'חומרים'},
  {sym:'XLRE', name:'נדל״ן'},
  {sym:'XLU',  name:'תשתיות'},
  {sym:'XLP',  name:'צריכה בסיסית'},
  {sym:'XLY',  name:'צריכה שיקולית'},
];
const ALL = [...INDICES,...OTHER,...SECTORS];

// ── helpers ────────────────────────────────────────
function pct(v){if(v==null||isNaN(v))return'–';return(v>0?'+':'')+Number(v).toFixed(1)+'%'}
function cellCls(v){
  if(v==null||isNaN(v))return'cz';
  if(v>5)return'c3';if(v>2)return'c2';if(v>0)return'c1';
  if(v<-5)return'm3';if(v<-2)return'm2';if(v<0)return'm1';return'cz';
}
function badgeCls(v){
  if(v==null||isNaN(v))return'z';
  if(v>5)return'p3';if(v>2)return'p2';if(v>0)return'p1';
  if(v<-5)return'n3';if(v<-2)return'n2';if(v<0)return'n1';return'z';
}
function avg(arr){const v=arr.filter(x=>x!=null&&!isNaN(x));return v.length?v.reduce((a,b)=>a+b,0)/v.length:null}
function fmtPrice(p,sym){
  if(p==null)return'–';
  if(sym==='BTCUSD')return Math.round(p).toLocaleString('en-US');
  if(p>1000)return p.toLocaleString('en-US',{minimumFractionDigits:2,maximumFractionDigits:2});
  return Number(p).toFixed(2);
}

function showScreen(name){
  ['screen-key','screen-loading','screen-error','app'].forEach(id=>{
    const el=$(id);if(!el)return;
    el.style.display=id===name?(id==='app'?'flex':'flex'):'none';
  });
}
function showKey(){showScreen('screen-key')}

async function startWithKey() {
  const k = $('key-input').value.trim();
  if (!k || !k.startsWith('http')) {
    $('key-err').textContent = 'אנא הזן כתובת חוקית שמתחילה ב-http';
    $('key-err').style.display = 'block';
    return;
  }

  const cleanUrl = k.endsWith('/') ? k.slice(0, -1) : k;
  
  // הפיכת הכפתור למצב טעינה
  const btn = document.querySelector('.key-btn');
  const originalText = btn.textContent;
  btn.textContent = 'מוודא הרשאות...';
  btn.style.opacity = '0.7';
  btn.style.pointerEvents = 'none';

  try {
    // שליחת בדיקת "פינג" מהירה למשיכת נתון אחד (SPY)
    const testUrl = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=SPY&range=1d&interval=1d`;
    const r = await fetch(`${cleanUrl}/?url=${encodeURIComponent(testUrl)}`);
    const d = await r.json();

    // אם קיבלנו בחזרה את המבנה המוכר של Yahoo - ה-Worker תקין!
    if (d.spark && d.spark.result) {
      $('key-err').style.display = 'none';
      _proxyUrl = cleanUrl;
      localStorage.setItem('app_proxy_url', _proxyUrl);
      init(); // הכל תקין, מעבירים אותו פנימה
    } else {
      throw new Error('Invalid response');
    }
  } catch (e) {
    // ה-Worker לא קיים, לא תקין, או שלא מכיל את הקוד הנכון
    $('key-err').textContent = 'מפתח המערכת שגוי או שהשרת אינו מגיב.';
    $('key-err').style.display = 'block';
  } finally {
    // החזרת הכפתור למצב רגיל
    btn.textContent = originalText;
    btn.style.opacity = '1';
    btn.style.pointerEvents = 'auto';
  }
}

// --- 3. Heatmap ---
function renderHeatmap() {
  const container = $('heatmap-container');
  container.innerHTML = '';
  
  // אוספים את כל המניות ומסדרים לפי משקל כדי להציג את ה-60 המשפיעות ביותר
  let uniqueHoldings = {};
  Object.values(ETF_HOLDINGS).forEach(sector => {
    sector.forEach(h => {
      if(!uniqueHoldings[h.s] || uniqueHoldings[h.s] < h.w) uniqueHoldings[h.s] = h.w;
    });
  });
  
  let sortedSyms = Object.keys(uniqueHoldings).sort((a,b) => uniqueHoldings[b] - uniqueHoldings[a]).slice(0, 60);
  
  let html = '';
  sortedSyms.forEach(sym => {
    const quote = qmap[sym];
    if(quote && quote.d1 !== undefined) {
      const d1 = quote.d1;
      let colorClass = 'hm-gray';
      
      // סולם הצבעים בהתאם לאחוז השינוי
      if (d1 >= 2) colorClass = 'hm-green-3';
      else if (d1 >= 0.7) colorClass = 'hm-green-2';
      else if (d1 > 0) colorClass = 'hm-green-1';
      else if (d1 <= -2) colorClass = 'hm-red-3';
      else if (d1 <= -0.7) colorClass = 'hm-red-2';
      else if (d1 < 0) colorClass = 'hm-red-1';

      html += `<div class="hm-box ${colorClass}" title="${sym} \n שינוי: ${d1.toFixed(2)}%">${sym}</div>`;
    }
  });
  
  if(!html) html = '<div style="color:var(--dim); font-size:11px;">ממתין לנתוני שוק...</div>';
  container.innerHTML = html;
}

// --- 4. Technical Momentum Screener (RSI) ---
async function runTechScreener() {
  $('tech-results').innerHTML = '<div class="mini-ring" style="margin: 20px auto;"></div><div style="text-align:center; color:var(--dim); font-size:11px;">מחשב מדד כוח יחסי (RSI) ל-40 מניות מובילות...</div>';

  const holdingsSet = new Set();
  Object.values(ETF_HOLDINGS).forEach(sector => sector.forEach(stock => holdingsSet.add(stock.s)));
  const symbolsArray = Array.from(holdingsSet).slice(0, 40); // מדגם המניות

  const signals = [];

  await Promise.all(symbolsArray.map(async (sym) => {
    const cleanSym = sym.replace('/', '-').replace('.', '-');
    const cb = Math.floor(Date.now() / 10000);
    // מושכים גרף יומי של 3 חודשים אחרונים לחישוב טכני
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSym}?interval=1d&range=3mo&cb=${cb}`;
    const proxyUrl = `${_proxyUrl}/?url=${encodeURIComponent(yahooUrl)}`;

    try {
      const r = await fetch(proxyUrl);
      if (!r.ok) return;
      const d = await r.json();
      const result = d.chart?.result?.[0];
      if (!result) return;

      const closes = result.indicators?.quote?.[0]?.close || [];
      const validCloses = closes.filter(c => c !== null);

      if (validCloses.length > 20) {
        // --- מתמטיקה של RSI (14 יום) לפי תקן Wilder ---
        let avgGain = 0, avgLoss = 0;
        
        // ממוצע ראשוני (14 ימים ראשונים)
        for(let i = 1; i <= 14; i++) {
          let diff = validCloses[i] - validCloses[i-1];
          if(diff > 0) avgGain += diff;
          else avgLoss += Math.abs(diff);
        }
        avgGain /= 14;
        avgLoss /= 14;
        
        // החלקת הממוצע (Smoothing) לשאר הימים
        for(let i = 15; i < validCloses.length; i++) {
          let diff = validCloses[i] - validCloses[i-1];
          let gain = diff > 0 ? diff : 0;
          let loss = diff < 0 ? Math.abs(diff) : 0;
          avgGain = ((avgGain * 13) + gain) / 14;
          avgLoss = ((avgLoss * 13) + loss) / 14;
        }
        
        let rsi = 100;
        if (avgLoss > 0) {
          rsi = 100 - (100 / (1 + (avgGain / avgLoss)));
        }

        // חישוב ממוצע נע 20 (SMA) ומחיר נוכחי
        const sma20 = validCloses.slice(-20).reduce((a,b)=>a+b,0) / 20;
        const currentPrice = validCloses[validCloses.length - 1];
        const vsSma = ((currentPrice - sma20) / sma20) * 100;

        // שומרים רק מניות שיש להן איתות טכני מובהק
        if (rsi < 40 || rsi > 65) {
          signals.push({ sym, rsi, vsSma, price: currentPrice });
        }
      }
    } catch (e) { }
  }));

  if (signals.length === 0) {
    $('tech-results').innerHTML = '<div style="text-align:center; color:var(--dim); padding:10px;">לא נמצאו איתותי מומנטום חריגים כרגע.</div>';
    return;
  }

  // ממיינים מה-RSI הנמוך ביותר (הכי Oversold) ומעלה
  signals.sort((a,b) => a.rsi - b.rsi);

  // יצירת ה-HTML של התוצאות
// יצירת ה-HTML של התוצאות מרווח ומיושר
  $('tech-results').innerHTML = signals.map((s, i) => {
    // 1. הגדרות המומנטום (RSI)
    const isOversold = s.rsi < 40;
    const rsiText = isOversold ? 'מכירת יתר' : 'קניית יתר';
    const rsiIcon = isOversold
      ? `<svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="var(--green)"/></svg>`
      : `<svg width="9" height="9" viewBox="0 0 10 10"><circle cx="5" cy="5" r="5" fill="var(--red)"/></svg>`;
    const badgeClass = isOversold ? 'oversold' : 'overbought';

    // 2. הגדרות המגמה (ממוצע 20)
    const isUp = s.vsSma > 0;
    const trendColor = isUp ? 'var(--green)' : 'var(--red)';
    const trendText = isUp ? 'מעל ממוצע 20' : 'מתחת ממוצע 20';
    const sign = isUp ? '+' : '';

    return `
    <div class="screener-row" style="align-items:center; padding: 12px 10px; direction: rtl;">
      
      <div style="width: 50px; font-size:14px; font-weight:400; direction:ltr; text-align:right;">${s.sym}</div>

      <div style="flex:1; display:flex; justify-content:space-evenly; align-items:center; padding: 0 10px;">
        
        <div style="display:flex; align-items:center; gap:6px; color:${trendColor}; font-size:12px; font-weight:400;">
          <span>${trendText}</span>
          <span style="direction:ltr; font-family:var(--mono); font-weight:400;">${sign}${s.vsSma.toFixed(1)}%</span>
        </div>

        <div class="tech-badge ${badgeClass}" style="display:flex; align-items:center; gap:4px; margin:0; padding:4px 8px; font-size:11px;">
          <span>${rsiIcon}</span>
          <span>${rsiText}</span>
          <span style="direction:ltr; font-family:var(--mono); font-weight:400;">(RSI: ${s.rsi.toFixed(1)})</span>
        </div>

      </div>

      <div style="width: 60px; font-family:var(--mono); font-size:14px; direction:ltr; font-weight:400; text-align:left;">$${s.price.toFixed(2)}</div>

    </div>
    `;
  }).join('');
}

function logout() {
  localStorage.removeItem('app_proxy_url');
  location.reload();
}

function toggleMobileMenu(){
  const m=$('mobile-menu');
  const o=$('mob-overlay');
  const isOpen = m.classList.contains('open');
  if(isOpen){ closeMobileMenu(); return; }
  m.classList.add('open');
  if(o) o.classList.add('open');
  const now=new Date();
  const mobTs=$('mob-ts');
  if(mobTs) mobTs.textContent=now.toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'})+' · '+now.toLocaleDateString('he-IL');
  const themeLbl=$('mob-theme-label');
  if(themeLbl) themeLbl.textContent=document.body.classList.contains('light')?'מצב כהה':'מצב בהיר';
}
function closeMobileMenu(){
  const m=$('mobile-menu');
  const o=$('mob-overlay');
  if(m) m.classList.remove('open');
  if(o) o.classList.remove('open');
}

document.addEventListener('keydown',e=>{if(e.key==='Escape'){closeMobileMenu();closeModalDirect();}});

// ── Yahoo Finance API only (Finnhub removed) ─────────

// ── NEWS ENGINE — מקורות מוגדרים ב-news-sources.js ──────────

function _getDomain(feed) {
  if (feed.domain) return feed.domain;
  try { return new URL(feed.url).hostname.replace('www.',''); } catch(e) { return ''; }
}

function _faviconUrl(domain) {
  return `https://www.google.com/s2/favicons?domain=${domain}&sz=32`;
}

function _parseRSSItems(text, sourceName, domain) {
  const items = [];
  if (!text?.trim().startsWith('<') || text.includes('<!DOCTYPE html')) return items;
  const xml = new DOMParser().parseFromString(text, 'text/xml');
  if (xml.querySelector('parseerror,parsererror')) return items;
  const nodes = [...xml.querySelectorAll('item'), ...xml.querySelectorAll('entry')];
  nodes.slice(0, 8).forEach(node => {
    const title = (node.querySelector('title')?.textContent || '').trim().replace(/<!\[CDATA\[|\]\]>/g, '');
    const linkEl = node.querySelector('link');
    const link = linkEl?.textContent?.trim() || linkEl?.getAttribute('href') || '';
    const pub = node.querySelector('pubDate,published,updated')?.textContent?.trim();
    const img = node.querySelector('enclosure[type^="image"]')?.getAttribute('url')
              || node.querySelector('media\\:content,content')?.getAttribute('url')
              || node.querySelector('image')?.getAttribute('url') || null;
    if (title && link?.startsWith('http')) items.push({ title, link, pub, source: sourceName, domain, img });
  });
  return items;
}

async function _fetchFeeds(feeds) {
  const allItems = [];
  await Promise.allSettled(feeds.map(async feed => {
    const domain = _getDomain(feed);
    try {
      // נסה ישירות (rss.app תומך CORS) — אחרת Worker
      let text = null;
      try {
        const rd = await fetch(feed.url, {signal: AbortSignal.timeout(4000)});
        if (rd.ok) text = await rd.text();
      } catch(e) {}
      if (!text) {
        try {
          const rp = await fetch(`${_proxyUrl}/?url=${encodeURIComponent(feed.url)}`);
          if (rp.ok) text = await rp.text();
        } catch(e) {}
      }
      if (!text) return;
      const items = _parseRSSItems(text, feed.name, domain);
      items.forEach(i => allItems.push(i));
    } catch(e) { }
  }));
  return allItems;
}

const _newsCache={he:null,en:null,heTm:0,enTm:0};
const NEWS_CACHE_TTL=10*60*1000;
async function fetchHebrewNews(force=false) {
  $('news-grid').innerHTML = '<div class="modal-loading" style="color:var(--dim);font-size:12px"><div class="mini-ring" style="margin:0 auto 8px"></div>טוען חדשות...</div>';
  _renderNewsGrid(await _fetchFeeds(HEBREW_NEWS_FEEDS), 'he', HEBREW_NEWS_FEEDS);
}

async function fetchEnglishNews() {
  $('news-grid').innerHTML = '<div class="modal-loading" style="color:var(--dim);font-size:12px"><div class="mini-ring" style="margin:0 auto 8px"></div>Loading...</div>';
  _renderNewsGrid(await _fetchFeeds(EN_NEWS_FEEDS), 'en', EN_NEWS_FEEDS);
}

function _renderNewsGrid(items, lang, feeds) {
  const grid = $('news-grid');
  if (!items.length) { grid.innerHTML='<div style="color:var(--dim);font-size:12px;text-align:center;padding:16px">לא נמצאו חדשות.</div>'; return; }
  const isHe = lang === 'he';

  // קיבוץ לפי מקור בסדר שהוגדר ב-news-sources.js — כל מקור מקבל בלוק משלו
  const grouped = new Map();
  feeds.forEach(feed => grouped.set(feed.name, { feed, items: [] }));
  items.forEach(item => { if (grouped.has(item.source)) grouped.get(item.source).items.push(item); });

  let html = '';
  grouped.forEach(({ feed, items: grpItems }) => {
    if (!grpItems.length) return;
    const domain = _getDomain(feed);
    const fav = domain ? `<img src="${_faviconUrl(domain)}" class="news-src-favicon" alt="" onerror="this.style.display='none'">` : '';
    html += `<div class="news-src-header">${fav}<span>${feed.name}</span></div>`;
    grpItems.sort((a,b) => new Date(b.pub||0) - new Date(a.pub||0)).slice(0, 6).forEach(item => {
      const time = item.pub ? new Date(item.pub).toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'}) : '';
      const imgHtml = item.img ? `<div class="news-thumb"><img src="${item.img}" alt="" loading="lazy" onerror="this.parentElement.style.display='none'"></div>` : '';
      const badge = domain
        ? `<span class="news-source-badge"><img src="${_faviconUrl(domain)}" class="news-badge-favicon" alt="" onerror="this.style.display='none'"><span>${item.source}</span></span>`
        : `<span class="news-source">${item.source}</span>`;
      html += `<a href="${item.link.replace(/"/g,'&quot;')}" target="_blank" rel="noopener noreferrer" class="news-card${item.img?' news-card-img':''}">
        ${imgHtml}
        <div class="news-card-text">
          <div class="news-title"${isHe?'':' style="direction:ltr;text-align:left"'}>${item.title}</div>
          <div class="news-meta"${isHe?'':' style="direction:ltr;justify-content:flex-start;gap:8px"'}>
            <span class="news-time"><svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>${time}</span>
            ${badge}
          </div>
        </div>
      </a>`;
    });
  });
  grid.innerHTML = html;
}

let _activeNewsTab = 'he';
function initNewsSection() {
  const hdr = document.querySelector('.news-section-hdr');
  if (!hdr || hdr.querySelector('.news-tabs')) return;
  const tabs = document.createElement('div');
  tabs.className = 'news-tabs';
  tabs.innerHTML = `
    <button class="news-tab active" onclick="switchNewsTab('he')">עברית</button>
    <button class="news-tab" onclick="switchNewsTab('en')"><svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-1px"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg> בעולם</button>`;
  hdr.appendChild(tabs);
  fetchHebrewNews();
}
function switchNewsTab(lang) {
  _activeNewsTab = lang;
  document.querySelectorAll('.news-tab').forEach(b =>
    b.classList.toggle('active', b.textContent.includes(lang === 'he' ? 'עברית' : 'בעולם')));
  if (lang === 'he') fetchHebrewNews(); else fetchEnglishNews();
}

async function fetchAndRenderMovers() {
  // 1. אוספים את כל הסמלים הייחודיים מתוך המילון של הסקטורים (220 מניות)
  const holdingsSet = new Set();
  Object.values(ETF_HOLDINGS).forEach(sector => {
    sector.forEach(stock => holdingsSet.add(stock.s));
  });
  const holdingSymbols = Array.from(holdingsSet);

  // 2. מושכים את כל ה-220 מניות בבקשה מרוכזת אחת מ-Yahoo!
  const newQuotes = await fetchYahooQuotesBatch(holdingSymbols);
  Object.assign(qmap, newQuotes); // מעדכנים את מילון המחירים הראשי

  // 3. מרנדרים את הפאנל
  renderMovers(holdingsSet);
}

function renderMovers(holdingsSet) {
  const validMovers = [];
  
  // מסננים החוצה מניות שאין להן נתונים
  holdingsSet.forEach(sym => {
    const d = qmap[sym];
    if (d && d.d1 != null && !isNaN(d.d1)) {
      validMovers.push({ sym: sym, d1: d.d1 });
    }
  });

  if (validMovers.length === 0) {
    $('movers-grid').innerHTML = '<div style="grid-column:1/-1;text-align:center;color:var(--dim);">אין נתונים זמינים כרגע</div>';
    return;
  }

  // ממיינים מהגבוה לנמוך
  validMovers.sort((a, b) => b.d1 - a.d1);

  // לוקחים את 5 העולות הכי הרבה ואת 5 היורדות הכי הרבה
  const topGainers = validMovers.slice(0, 5);
  const topLosers = validMovers.slice(-5).reverse();

  // פונקציית עזר ליצירת שורות
  const buildRows = (items, isUp) => items.map(item => `
    <div class="mover-row">
      <span class="mover-sym">${item.sym}</span>
      <span class="mover-val ${isUp ? 'up' : 'down'}">${item.d1 > 0 ? '+' : ''}${item.d1.toFixed(2)}%</span>
    </div>
  `).join('');

  $('movers-grid').innerHTML = `
    <div>
      <div class="mover-col-title green"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg> מזנקות</div>
      <div class="mover-col-inner">${buildRows(topGainers, true)}</div>
    </div>
    <div>
      <div class="mover-col-title red"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg> צוללות</div>
      <div class="mover-col-inner">${buildRows(topLosers, false)}</div>
    </div>
  `;
}

async function fetchHistoricalReturns(sym) {
  const cb = Math.floor(Date.now() / 10000);
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=1y&interval=1d&cb=${cb}`;
  const proxyUrl = `${_proxyUrl}/?url=${encodeURIComponent(yahooUrl)}`;  
  try {
    const r = await fetch(proxyUrl);
    if (!r.ok) return {};
    const d = await r.json();
    const result = d.chart?.result?.[0];
    const prices = result?.indicators?.quote?.[0]?.close?.filter(p => p != null);
    const timestamps = result?.timestamp;
    if (!prices || prices.length === 0) return {};
    const current = prices[prices.length - 1];
    const getPct = (daysBack) => {
      const idx = Math.max(0, prices.length - 1 - daysBack);
      if (!prices[idx]) return null;
      return ((current - prices[idx]) / prices[idx]) * 100;
    };
    // 52w high/low
    const hi52 = Math.max(...prices);
    const lo52 = Math.min(...prices);
    const fromHi = ((current - hi52) / hi52) * 100; // שלילי
    const fromLo = ((current - lo52) / lo52) * 100; // חיובי
    // YTD — מוצאים את מחיר פתיחת השנה
    let ytd = null;
    if (timestamps) {
      const yearStart = new Date(new Date().getFullYear(), 0, 1).getTime() / 1000;
      const ytdIdx = timestamps.findIndex(t => t >= yearStart);
      if (ytdIdx >= 0 && prices[ytdIdx]) ytd = ((current - prices[ytdIdx]) / prices[ytdIdx]) * 100;
    }
    // raw prices for correlation
    const rawPrices = prices;
    // חישוב ממוצע נפח 20 יום מהנתונים ההיסטוריים
    const volumes = result?.indicators?.quote?.[0]?.volume?.filter(v => v != null && v > 0) || [];
    const avgVol = volumes.length >= 5 ? Math.round(volumes.slice(-20).reduce((a,b)=>a+b,0) / Math.min(20, volumes.slice(-20).length)) : null;
    return { w1:getPct(5), m1:getPct(21), m3:getPct(63), m6:getPct(126), y1:getPct(252), fromHi, fromLo, ytd, rawPrices, avgVol };
  } catch (e) {
    return {};
  }
}

async function fetchYahooQuotesBatch(symbolsArray) {
  if (!symbolsArray || symbolsArray.length === 0) return {};
  
  const chunkSize = 20; // נחלק את הבקשה לקבוצות של 40 מניות כדי לא להכעיס את יאהו
  const allQuotes = {};
  
  // פיצול המערך הגדול לתת-מערכים קטנים
  const chunks = [];
  for (let i = 0; i < symbolsArray.length; i += chunkSize) {
    chunks.push(symbolsArray.slice(i, i + chunkSize));
  }

  // שולחים את כל הבקשות במקביל (Parallel) כדי לשמור על מהירות שיא
  await Promise.all(chunks.map(async (chunk) => {
    const yahooSymbols = chunk.map(s => s.replace('/', '-').replace('.', '-'));
    const symbolsStr = yahooSymbols.join(',');
    const cb = Math.floor(Date.now() / 10000); 
    
    const yahooUrl = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbolsStr}&range=1d&interval=5m&cb=${cb}`;
    const proxyUrl = `${_proxyUrl}/?url=${encodeURIComponent(yahooUrl)}`;
	
    try {
      const r = await fetch(proxyUrl);
      if (!r.ok) return;
      const d = await r.json();
      const results = d.spark?.result || [];

      for (const res of results) {
        const meta = res.response?.[0]?.meta;
        if (!meta) continue;

        const price = meta.regularMarketPrice;
        const prev = meta.chartPreviousClose || meta.previousClose;
        
        let d1 = 0;
        if (price && prev) {
          d1 = ((price - prev) / prev) * 100;
        }

        const originalSym = chunk.find(s => s.replace('/', '-').replace('.', '-') === res.symbol) || res.symbol;
        const closes = (res.response?.[0]?.indicators?.quote?.[0]?.close || []).filter(v => v != null && !isNaN(v));
        
        allQuotes[originalSym] = {
          price: price,
          d1: d1,
          prev: prev,
          vol: meta.regularMarketVolume || null,
          avgVol: meta.averageDailyVolume3Month || meta.averageDailyVolume10Day || null,
          spark: closes,
        };
      }
    } catch (e) {
    }
  }));

  return allQuotes; // מחזירים את כל הנתונים שאספנו מכל המנות
}

// ── Render helpers ──────────────────────────────────
let qmap={};
const histMap={};

function renderTicker(){
  const items=[...INDICES,...OTHER].map(s=>{
    const d=qmap[s.sym]||{};
    const col=(d.d1||0)>0?'#00e87a':(d.d1||0)<0?'#ff3a5c':'#4a6480';
    const arrow=(d.d1||0)>0?'▲':(d.d1||0)<0?'▼':'–';
    return`<span class="tick-item"><span class="tick-sym">${s.sym}</span><span class="tick-price">${fmtPrice(d.price,s.sym)}</span><span class="tick-chg" style="color:${col}">${arrow} ${pct(d.d1)}</span></span><div class="tick-sep"></div>`;
  }).join('');
  $('ticker').innerHTML=items+items;
}

function buildSparkSvg(closes, isUp, prev) {
  if (!closes || closes.length < 2) return '';
  const allVals = prev != null ? [...closes, prev] : closes;
  const min = Math.min(...allVals), max = Math.max(...allVals);
  const range = max - min || 1;
  const W = 100, H = 36;
  const yOf = v => H - ((v - min) / range) * (H - 2) - 1;
  const pts = closes.map((v, i) => {
    const x = (i / (closes.length - 1)) * W;
    return [x, yOf(v)];
  });
  const linePath = 'M' + pts.map(p => p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L');
  const fillPath = `M0,${H} L` + pts.map(p => p[0].toFixed(1)+','+p[1].toFixed(1)).join(' L') + ` L${W},${H} Z`;
  const id = 'sg'+Math.random().toString(36).slice(2,7);
  const col = isUp ? 'var(--green)' : 'var(--red)';
  // קו ייחוס מקווקוו ב-Y של הסגירה הקודמת
  const baselineY = prev != null ? yOf(prev).toFixed(1) : null;
  const baseline = baselineY != null
    ? `<line x1="0" x2="${W}" y1="${baselineY}" y2="${baselineY}" stroke="var(--dim)" stroke-dasharray="2 2" stroke-width="0.7" opacity="0.5" vector-effect="non-scaling-stroke"/>`
    : '';
  return `<svg viewBox="0 0 ${W} ${H}" class="idx-spark" preserveAspectRatio="none">
    <defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="${col}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
    </linearGradient></defs>
    ${baseline}
    <path d="${fillPath}" fill="url(#${id})"/>
    <path d="${linePath}" stroke="${col}" stroke-width="1.5" fill="none" stroke-linejoin="round" stroke-linecap="round"/>
  </svg>`;
}

function renderCards(elId, items, labels, keys) {
  const container = $(elId);
  // שמור את כרטיסיית השעון לפני איפוס ה-innerHTML
  const clock = container.querySelector('#market-clock-card');
  container.innerHTML = items.map(s => {
    const d = qmap[s.sym] || {};
    const isUp = (d.d1 || 0) >= 0;
    const col = isUp ? 'var(--green)' : 'var(--red)';
    const pctTxt = d.d1 != null ? (isUp ? '+' : '') + d.d1.toFixed(2) + '%' : '–';
    const absTxt = (d.price && d.prev)
      ? (isUp ? '+' : '') + '$' + Math.abs(d.price - d.prev).toFixed(2)
      : '';
    const arrowSvg = isUp
      ? `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="17" x2="17" y2="7"/><polyline points="7 7 17 7 17 17"/></svg>`
      : `<svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="7" y1="7" x2="17" y2="17"/><polyline points="17 7 17 17 7 17"/></svg>`;
    const spark = buildSparkSvg(d.spark, isUp, d.prev);
    return `<div class="idx-card" onclick="openStockDetail('${s.sym}','${s.name.replace(/'/g,"\\'")}')">
      <div class="idx-card-top">
        <div class="idx-card-meta">
          <div class="idx-card-sym">${s.sym}</div>
          <div class="idx-card-name">${s.name}</div>
        </div>
        <div class="idx-card-badge" style="color:${col}">
          ${arrowSvg}<span>${pctTxt}</span>
        </div>
      </div>
      <div class="idx-card-price">${fmtPrice(d.price, s.sym)}</div>
      ${absTxt ? `<div class="idx-card-abs" style="color:${col}">${absTxt}</div>` : ''}
      ${spark ? `<div class="idx-card-chart">${spark}</div>` : ''}
    </div>`;
  }).join('');
  // שחזר את כרטיסיית השעון במקומה — מונע קפיצה בגריד
  if (clock) container.appendChild(clock);
}

function renderPositivity(){
  const vals=ALL.map(s=>(qmap[s.sym]||{}).d1).filter(v=>v!=null&&!isNaN(v));
  const pos=vals.filter(v=>v>0).length;
  const p=Math.round(pos/vals.length*100);
  $('pos-fill').style.cssText=`width:${p}%;background:${p>=50?'var(--green)':'var(--red)'}`;
  $('pos-pct').style.color=p>=50?'var(--green)':'var(--red)';
  $('pos-pct').textContent=p+'%';
  $('pos-mood').textContent=`(${pos}/${vals.length}) — ${p>=70?'יום חיובי מאוד':p>=50?'מעורב-חיובי':p>=30?'מעורב-שלילי':'שלילי חזק'}`;
}

// --- LAB LOGIC ---

function openLabModal() {
  $('lab-overlay').classList.add('open');
  document.body.style.overflow = 'hidden';
  
  // אכלוס רשימות הבחירה בסימולטור
  const allOptions = ALL.map(s => `<option value="${s.sym}">${s.sym} - ${s.name}</option>`).join('');
  ['sim-sel-1', 'sim-sel-2', 'sim-sel-3'].forEach(id => {
    const el = $(id);
    if(el.innerHTML === '') {
      el.innerHTML = '<option value="">-- בחר נכס --</option>' + allOptions;
    }
  });
}

function closeLab(e) { if(e.target === $('lab-overlay')) closeLabDirect(); }
function closeLabDirect() {
  $('lab-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

// 1. Simulator & Risk
function runSimulator() {
  let totalW = 0;
  let dayReturn = 0;
  let yearReturn = 0;
  let techCount = 0; // לזיהוי חפיפת טכנולוגיה
  
  for(let i=1; i<=3; i++) {
    const sym = $(`sim-sel-${i}`).value;
    const w = parseFloat($(`sim-w-${i}`).value) || 0;
    
    if (sym && w > 0) {
      totalW += w;
      const liveData = qmap[sym] || {};
      const histData = histMap[sym] || {};
      
      if (liveData.d1) dayReturn += (liveData.d1 * (w / 100));
      if (histData.y1) yearReturn += (histData.y1 * (w / 100));
      
      if (['XLK', 'XLC', 'QQQ'].includes(sym)) techCount++;
    }
  }

  if (totalW === 0 || totalW > 100) {
    alert("נא לוודא שהמשקלים תקינים ומסתכמים לעד 100%");
    return;
  }

  const dEl = $('sim-res-day');
  dEl.textContent = dayReturn > 0 ? '+' + dayReturn.toFixed(2) + '%' : dayReturn.toFixed(2) + '%';
  dEl.className = 'lab-result ' + (dayReturn >= 0 ? 'green' : 'red');

  const yEl = $('sim-res-year');
  yEl.textContent = yearReturn > 0 ? '+' + yearReturn.toFixed(2) + '%' : yearReturn.toFixed(2) + '%';
  yEl.className = 'lab-result ' + (yearReturn >= 0 ? 'green' : 'red');

  // פסיכולוגיה של פיזור
  let riskMsg = "✓ פיזור טוב: התיק שלך משלב נכסים שונים.";
  if (techCount >= 2) riskMsg = "! סכנת חפיפה: בחרת נכסים עם קורלציה גבוהה (הטיית טכנולוגיה). התנודתיות תהיה חזקה.";
  if (totalW < 100) riskMsg += ` (נשאר במזומן: ${100 - totalW}%)`;
  $('sim-risk').textContent = riskMsg;
}

// 2. Dividend Screener
async function runScreener() {
  $('screener-results').innerHTML = '<div class="mini-ring" style="margin: 20px auto;"></div><div style="text-align:center; color:var(--dim); font-size:11px;">מחשב תשואות דיבידנד מתוך היסטוריית הגרפים (עוקף חסימות)...</div>';
  
  // אוספים את כל המניות מהאחזקות שלנו
  const holdingsSet = new Set();
  Object.values(ETF_HOLDINGS).forEach(sector => sector.forEach(stock => holdingsSet.add(stock.s)));
  
  // לוקחים מדגם של 40 חברות גדולות כדי שהסריקה תהיה חלקה ומהירה
  const symbolsArray = Array.from(holdingsSet).slice(0, 40); 
  
  const dividendStocks = [];

  // סורקים כל מניה מול נקודת הקצה של הגרפים שאינה חסומה (v8/chart)
  await Promise.all(symbolsArray.map(async (sym) => {
    const cleanSym = sym.replace('/', '-').replace('.', '-');
    const cb = Math.floor(Date.now() / 10000);
    
    // אנו מבקשים טווח של שנה אחרונה (1y) ורק אירועי דיבידנד (events=div)
    const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSym}?interval=1mo&range=1y&events=div&cb=${cb}`;
    const proxyUrl = `${_proxyUrl}/?url=${encodeURIComponent(yahooUrl)}`;
    
    try {
      const r = await fetch(proxyUrl);
      if (!r.ok) return;
      const d = await r.json();
      
      const result = d.chart?.result?.[0];
      if (!result) return;

      const price = result.meta?.regularMarketPrice;
      const dividends = result.events?.dividends; // מילון של כל הדיבידנדים שחולקו בשנה האחרונה
      
      if (price && dividends) {
        let totalDivCash = 0;
        
        // סוכמים את כל המזומן שחולק בפועל למניה בשנה האחרונה
        Object.values(dividends).forEach(div => {
          totalDivCash += (div.amount || 0);
        });
        
        // חישוב התשואה השנתית באחוזים (סך המזומן חלקי מחיר המניה הנוכחי)
        if (totalDivCash > 0) {
          const yieldPct = (totalDivCash / price) * 100;
          dividendStocks.push({ sym: sym, yield: yieldPct });
        }
      }
    } catch (e) {
      // אם מניה נכשלה או שאין לה נתונים, פשוט נדלג עליה בשקט
    }
  }));

  // ממיינים מהתשואה הגדולה לקטנה
  dividendStocks.sort((a, b) => b.yield - a.yield);
  const top10 = dividendStocks.slice(0, 10);
      
  if (top10.length === 0) {
    $('screener-results').innerHTML = '<div style="text-align:center; color:var(--red); padding:10px;">לא נמצאו נתוני דיבידנד זמינים.</div>';
    return;
  }

  // מציגים את 10 החברות המובילות
  $('screener-results').innerHTML = top10.map((s, i) => `
    <div class="screener-row">
      <span>${i+1}. <b>${s.sym}</b></span>
      <span style="color:var(--green)">${s.yield.toFixed(2)}% תשואה שנתית</span>
    </div>
  `).join('');
}

function renderSectorsWithSkeleton(){
  const sk='<td class="lc">&nbsp;</td>';
  const frozenRows = SECTORS.map(s =>
    `<div class="tbl-frozen-row"><span class="sym">${s.sym}</span>${s.name}</div>`
  ).join('') + '<div class="tbl-frozen-row tbl-frozen-avg">ממוצע</div>';
  $('sector-frozen').innerHTML = '<div class="tbl-frozen-hdr">סקטור</div>' + frozenRows;

  // כל התאים skeleton — נתונים מגיעים יחד בסוף
  const rows = SECTORS.map(() =>
    `<tr>${sk}${sk}${sk}${sk}${sk}${sk}${sk}${sk}${sk}${sk}${sk}</tr>`
  );
  rows.push(`<tr class="avgrow">${sk}${sk}${sk}${sk}${sk}${sk}${sk}${sk}${sk}<td class="lc">&nbsp;</td><td class="lc">&nbsp;</td></tr>`);
  $('sector-tbody').innerHTML = rows.join('');
  syncFrozenRows();
}

let _syncTimer = null;
function syncFrozenRows() {
  if (_syncTimer) clearTimeout(_syncTimer);
  _syncTimer = setTimeout(_doSyncFrozenRows, 30);
}
function _doSyncFrozenRows() {
  const rows = document.querySelectorAll('#sector-tbody tr');
  const frozenRows = document.querySelectorAll('#sector-frozen .tbl-frozen-row');
  const th = document.querySelector('.t th');
  const fh = document.querySelector('.tbl-frozen-hdr');
  if (th && fh) fh.style.height = th.offsetHeight + 'px';
  rows.forEach((tr, i) => {
    if (frozenRows[i]) frozenRows[i].style.height = tr.offsetHeight + 'px';
  });
}
// ResizeObserver fires whenever table re-layouts — works on all devices
function initSyncObserver() {
  const tbody = document.getElementById('sector-tbody');
  if (!tbody || !window.ResizeObserver) return;
  new ResizeObserver(() => syncFrozenRows()).observe(tbody);
}

function renderSectors(){
  // עמודת שמות קפואה (לא sticky — אין ריצוד)
  const frozen = $('sector-frozen');
  if(frozen) frozen.innerHTML = '<div class="tbl-frozen-hdr">סקטור</div>'
    + SECTORS.map(s=>`<div class="tbl-frozen-row" onclick="openSectorModal('${s.sym}','${s.name}')" style="cursor:pointer"><span class="sym">${s.sym}</span>${s.name}</div>`).join('')
    + '<div class="tbl-frozen-row tbl-frozen-avg">ממוצע סקטורים</div>';

  // טבלת נתונים (ללא עמודת שמות)
  const rows=SECTORS.map(s=>{
    const d=qmap[s.sym]||{};
    const h=histMap[s.sym]||{};
    const vals=[d.d1,h.w1,h.m1,h.m3,h.m6,h.y1];
    const a=avg(vals);
    const td=(v,cls='')=>`<td class="${cellCls(v)}${cls?' '+cls:''}">${pct(v)}</td>`;
    const hiTd = h.fromHi!=null ? `<td class="hi52">${pct(h.fromHi)}</td>` : '<td style="color:var(--dim)">–</td>';
    const loTd = h.fromLo!=null ? `<td class="lo52">${pct(h.fromLo)}</td>` : '<td style="color:var(--dim)">–</td>';
    let volTd = '<td style="color:var(--dim)">–</td>';
    const todayVol = d.vol, avgVol20 = h.avgVol;
    if (todayVol && avgVol20 && avgVol20 > 0) {
      const vr = todayVol / avgVol20;
      const vi = vr > 1.5 ? '▲▲' : vr > 1.1 ? '▲' : vr < 0.6 ? '▼▼' : vr < 0.9 ? '▼' : '●';
      const vc = vr > 1.5 ? 'vol-high' : vr < 0.7 ? 'vol-low' : 'vol-norm';
      volTd = `<td class="${vc}" title="${(vr*100).toFixed(0)}% מהממוצע">${vi} ${(vr*100).toFixed(0)}%</td>`;
    }
    return`<tr onclick="openSectorModal('${s.sym}','${s.name}')" title="לחץ לראות אחזקות">
      ${td(d.d1)}${td(h.w1)}${td(h.m1)}${td(h.m3)}${td(h.m6)}${td(h.y1)}${hiTd}${loTd}${volTd}
      ${getSectorMacroTd(s.sym)}
      <td class="${cellCls(a)}">${pct(a)}</td>
    </tr>`;
  });
  const periodAvgs=[0,1,2,3,4,5].map(pi=>avg(SECTORS.map(s=>{
    const d=qmap[s.sym]||{},h=histMap[s.sym]||{};
    return[d.d1,h.w1,h.m1,h.m3,h.m6,h.y1][pi];
  })));
  const ov=avg(periodAvgs);
  rows.push(`<tr class="avgrow">
    ${periodAvgs.map((v)=>`<td class="${cellCls(v)}">${pct(v)}</td>`).join('')}<td></td><td></td><td></td><td></td>
    <td class="${cellCls(ov)}"><b>${pct(ov)}</b></td>
  </tr>`);
  $('sector-tbody').innerHTML=rows.join('');
  syncFrozenRows();
}

function renderSummary(){
  const dv=SECTORS.map(s=>({s,v:(qmap[s.sym]||{}).d1})).filter(x=>x.v!=null&&!isNaN(x.v)).sort((a,b)=>b.v-a.v);
  if(!dv.length)return;
  const pos=dv.filter(x=>x.v>0).length;
  const a=avg(dv.map(x=>x.v));
  const best=dv[0],worst=dv[dv.length-1];
  $('summary').innerHTML=`
    <div class="sum-card"><div class="sum-card-label">חיוביים</div><div class="sum-card-val" style="color:${pos>0?'var(--green)':'var(--red)'}">${pos}</div><div class="sum-card-sub">מתוך ${SECTORS.length} סקטורים</div></div>
    <div class="sum-card"><div class="sum-card-label">ממוצע יומי</div><div class="sum-card-val" style="color:${(a||0)>=0?'var(--green)':'var(--red)'}">${pct(a)}</div><div class="sum-card-sub">כל הסקטורים</div></div>
    <div class="sum-card"><div class="sum-card-label">הכי חזק</div><div class="sum-card-val" style="color:var(--green);font-size:15px">${best?.s?.sym||'–'}</div><div class="sum-card-sub" style="color:var(--green)">${pct(best?.v)} ${best?.s?.name||''}</div></div>
    <div class="sum-card"><div class="sum-card-label">הכי חלש</div><div class="sum-card-val" style="color:var(--red);font-size:15px">${worst?.s?.sym||'–'}</div><div class="sum-card-sub" style="color:var(--red)">${pct(worst?.v)} ${worst?.s?.name||''}</div></div>`;
}

function drawChart(){
  const sorted = SECTORS.map(s => ({name: s.sym, v: (qmap[s.sym]||{}).d1 || 0})).sort((a,b) => b.v - a.v);
  const canvas = $('chart');
  const n = sorted.length, BAR = 18, GAP = 4, PT = 6;
  canvas.height = n * (BAR + GAP) + PT + 8;
  const W = canvas.width, H = canvas.height, ctx = canvas.getContext('2d');
  ctx.clearRect(0, 0, W, H);

  // 1. צבעים עדינים ודינמיים (תמיכה במצב בהיר/כהה ומניעת סנוור)
  const isL = document.body.classList.contains('light');
  const greenFill = isL ? 'rgba(0, 144, 74, 0.15)' : 'rgba(0, 232, 122, 0.12)';
  const greenStroke = isL ? '#00904a' : '#00e87a';
  const redFill = isL ? 'rgba(204, 26, 58, 0.15)' : 'rgba(255, 58, 92, 0.12)';
  const redStroke = isL ? '#cc1a3a' : '#ff3a5c';
  const textColor = isL ? '#0e1e34' : '#ccd8ea';
  const gridColor = isL ? '#d0daea' : '#1e3550';
  const zeroColor = isL ? '#7090b0' : '#3d5470';

  // 2. מתמטיקה מדויקת למניעת גלישה!
  const maxAbs = Math.max(...sorted.map(s => Math.abs(s.v)), 0.5);
  const ZERO = 120; // קו האפס הוזז ימינה כדי להבטיח מקום לצד השלילי (מינוס)
  const maxBw = 75; // הגבלת רוחב העמודה כך שתמיד יישאר מקום לטקסט האחוזים בצדדים

  // ציור קווי רקע
  ctx.strokeStyle = gridColor; ctx.lineWidth = 1;
  [-3, -2, -1, 1, 2, 3].forEach(v => {
    const x = ZERO + (v / maxAbs) * maxBw;
    if(x > 10 && x < W - 40) { 
      ctx.beginPath(); ctx.moveTo(x, 0); ctx.lineTo(x, H); ctx.stroke();
    }
  });
  
  // ציור קו האפס במרכז היחסי
  ctx.strokeStyle = zeroColor; ctx.lineWidth = 1.5;
  ctx.beginPath(); ctx.moveTo(ZERO, 0); ctx.lineTo(ZERO, H); ctx.stroke();

  // ציור העמודות והטקסטים
  sorted.forEach((s, i) => {
    const y = PT + i * (BAR + GAP);
    const v = s.v;
    const pos = v >= 0;
    
    // חישוב רוחב ומיקום מדויק
    const bw = (Math.abs(v) / maxAbs) * maxBw;
    const bx = pos ? ZERO : ZERO - bw;

    // מילוי וגבול העמודה (חצי שקוף ומודרני, ללא צללים)
    ctx.fillStyle = pos ? greenFill : redFill;
    ctx.fillRect(bx, y, bw || 1, BAR);
    ctx.strokeStyle = pos ? greenStroke : redStroke;
    ctx.lineWidth = 1;
    if(bw > 1) ctx.strokeRect(bx, y, bw, BAR);

    // טקסט: שם הסקטור (צד ימין)
    ctx.fillStyle = textColor;
    ctx.font = '11px Rubik, Assistant, sans-serif';
    ctx.textAlign = 'right';
    ctx.fillText(s.name, W - 4, y + BAR - 4);

    // טקסט: אחוזים ממוקמים בטוח (צמוד לעמודה מבחוץ)
    ctx.fillStyle = pos ? greenStroke : redStroke;
    ctx.font = 'bold 11px "JetBrains Mono", monospace';
    ctx.textAlign = pos ? 'left' : 'right';
    ctx.fillText(pct(v), pos ? ZERO + bw + 5 : ZERO - bw - 5, y + BAR - 4);
  });
}


// ── THEME ──────────────────────────────────────────
let isDark = !document.body.classList.contains('light');
const moonSVG=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"/></svg>`;
const sunSVG=`<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>`;
function toggleTheme(){
  isDark=!isDark;
  document.body.classList.toggle('light',!isDark);
  $('theme-btn').innerHTML=isDark?sunSVG:moonSVG;
  drawChart();
}

// ── SECTOR HOLDINGS — נטען מ-etf-holdings.js ─────────────────

async function openSectorModal(sym,name){
  $('modal-title').textContent='אחזקות '+name+' ('+sym+')';
  $('modal-sub').textContent='טוען נתוני יום בזמן אמת...';
  $('modal-body').innerHTML='<div class="modal-loading"><div class="mini-ring"></div>מביא מחירים חיים מ-Yahoo...</div>';
  $('modal-overlay').classList.add('open');
  document.body.style.overflow='hidden';

  const data=ETF_HOLDINGS[sym]||[];
  if(!data.length){renderHoldings(sym,name,data);return;}

  // מסננים רק מניות שעדיין אין לנו את המחיר שלהן
  const missingSymbols = data.map(h => h.s).filter(s => !qmap[s] || qmap[s].price == null);
  
  if (missingSymbols.length > 0) {
    // מביאים את כל המניות החסרות בבקשה *אחת* בלבד!
    const newQuotes = await fetchYahooQuotesBatch(missingSymbols);
    Object.assign(qmap, newQuotes); // שומרים את התוצאות לזיכרון
  }
  
  renderHoldings(sym,name,data);
}

// פלטת צבעים לאחזקות — כל מניה מקבלת צבע ייחודי
const HOLDING_COLORS = [
  '#00b4ff','#e17055','#ffd166','#a29bfe','#00cec9',
  '#fd79a8','#55efc4','#fdcb6e','#74b9ff','#e84393'
];

function renderHoldings(sym, name, data) {
  if (!data || !data.length) {
    $('modal-body').innerHTML = '<div class="modal-loading">אין נתוני אחזקות זמינים</div>';
    return;
  }

  const sorted = [...data].sort((a, b) => (b.w||0) - (a.w||0));
  const total  = sorted.reduce((acc, h) => acc + (h.w||0), 0);
  $('modal-sub').textContent     = sorted.length + ' מניות • חשיפה: ' + total.toFixed(1) + '%';
  $('modal-footer').textContent  = 'SPDR ' + sym + ' • Q1 2025 • ' + sorted.length + ' מניות';

  // ── 1. פס הפצה צבעוני ─────────────────────────────
  const TOP_N = 8;
  const topHoldings = sorted.slice(0, TOP_N);
  const topTotal    = topHoldings.reduce((s, h) => s + (h.w||0), 0);
  const restPct     = ((total - topTotal) / total * 100);

  const barSegs = topHoldings.map((h, i) => {
    const pct = (h.w / total * 100).toFixed(1);
    const col = HOLDING_COLORS[i];
    return `<div class="hbar-seg" data-idx="${i}" style="flex:${h.w};background:${col}" title="${h.s}: ${pct}%">
      <span class="hbar-seg-lbl">${pct}%</span>
    </div>`;
  });
  if (restPct > 0.1) {
    barSegs.push(`<div class="hbar-seg" style="flex:${(total - topTotal).toFixed(1)};background:var(--bg4);border-radius:0 5px 5px 0" title="שאר: ${restPct.toFixed(1)}%"></div>`);
  }

  // ── 2. שורות הטבלה ─────────────────────────────────
  const rows = sorted.map((h, i) => {
    const col    = HOLDING_COLORS[Math.min(i, HOLDING_COLORS.length - 1)];
    const maxW   = sorted[0]?.w || 1;
    const barPct = Math.round((h.w / maxW) * 100);
    const dq     = qmap[h.s] || {};
    const hasDay = dq.d1 != null && !isNaN(dq.d1);
    const chgCls = !hasDay ? 'flat' : dq.d1 > 0 ? 'up' : dq.d1 < 0 ? 'down' : 'flat';
    const chgStr = hasDay ? (dq.d1 > 0 ? '+' : '') + dq.d1.toFixed(2) + '%' : '–';
    const priceStr = dq.price ? '$' + Number(dq.price).toFixed(2) : '–';

    return `<tr class="hrow2" data-idx="${i}" onclick="openStockDetail('${h.s}','${(h.n||h.s).replace(/'/g,"\\'")}')">
      <td class="hc hc-num">${i + 1}</td>
      <td class="hc hc-holding">
        <div class="hc-hold-inner">
          <span class="hc-dot" style="background:${col}"></span>
          <div class="hc-info">
            <span class="hc-sym">${h.s}</span>
            <span class="hc-name">${h.n || ''}</span>
          </div>
        </div>
      </td>
      <td class="hc hc-price"><span class="hc-price-val">${priceStr}</span></td>
      <td class="hc hc-chg"><span class="hrow-chg ${chgCls}">${chgStr}</span></td>
      <td class="hc hc-weight">
        <div class="hc-weight-inner">
          <div class="hc-wbar"><div class="hc-wbar-fill" style="width:${barPct}%;background:${col}"></div></div>
          <span class="hc-wpct">${h.w.toFixed(1)}%</span>
        </div>
      </td>
    </tr>`;
  }).join('');

  $('modal-body').innerHTML = `
    <div class="hbar-wrap" id="holdings-bar">${barSegs.join('')}</div>
    <table class="htbl2">
      <thead>
        <tr>
          <th class="hc hc-num">#</th>
          <th class="hc hc-holding" style="text-align:right">אחזקה</th>
          <th class="hc hc-price">מחיר</th>
          <th class="hc hc-chg">שינוי יומי</th>
          <th class="hc hc-weight">משקל</th>
        </tr>
      </thead>
      <tbody>${rows}</tbody>
    </table>`;

  // ── לאחר רנדר: הסתרת label צר + קישור hover שורה ↔ סגמנט ──
  requestAnimationFrame(() => {
    // הסתר % בסגמנטים שאין בהם מקום
    document.querySelectorAll('#holdings-bar .hbar-seg').forEach(seg => {
      const lbl = seg.querySelector('.hbar-seg-lbl');
      if (!lbl) return;
      if (seg.offsetWidth < lbl.scrollWidth + 14) lbl.style.visibility = 'hidden';
    });

    // hover שורה → הדגש סגמנט תואם
    document.querySelectorAll('.hrow2[data-idx]').forEach(row => {
      const idx = row.dataset.idx;
      const seg = document.querySelector(`#holdings-bar .hbar-seg[data-idx="${idx}"]`);
      if (!seg) return;
      row.addEventListener('mouseenter', () => seg.classList.add('hbar-seg--active'));
      row.addEventListener('mouseleave', () => seg.classList.remove('hbar-seg--active'));
    });
  });
}

// ── STOCK DETAIL PANEL ────────────────
async function openStockDetail(sym, name) {
  const overlay = $('stock-overlay');
  $('sp-sym').textContent = sym;
  $('sp-name').textContent = name;
  const dq = qmap[sym] || {};
  $('sp-price').textContent = dq.price ? '$'+Number(dq.price).toFixed(2) : '–';
  const chgEl = $('sp-chg');
  if (dq.d1 != null) {
    chgEl.textContent = (dq.d1>0?'+':'')+dq.d1.toFixed(2)+'%';
    chgEl.className = 'sp-chg '+(dq.d1>0?'up':dq.d1<0?'down':'flat');
  }
  overlay.classList.add('open');
  document.body.style.overflow = 'hidden';
  // ניקוי סיידברים לפני טעינה
  const sb = $('sp-sidebar'); if (sb) sb.innerHTML = '';
  const sbr = $('sp-sidebar-right'); if (sbr) sbr.innerHTML = '';
  $('sp-body').innerHTML = '<div class="modal-loading" style="padding:40px"><div class="mini-ring" style="margin:0 auto 10px"></div>טוען '+sym+'...</div>';

  try {
    const chartUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=1d&interval=5m&includePrePost=true`;
    const newsUrl  = `https://query1.finance.yahoo.com/v1/finance/search?q=${encodeURIComponent(sym)}&newsCount=5&quotesCount=0&enableFuzzyQuery=false`;
    const histUrl  = `https://query1.finance.yahoo.com/v8/finance/chart/${sym}?range=1mo&interval=1d`;
    const [cRes, nRes, macroData, hRes] = await Promise.allSettled([
      fetch(_proxyUrl+'/?url='+encodeURIComponent(chartUrl)),
      fetch(_proxyUrl+'/?url='+encodeURIComponent(newsUrl)),
      fetchMacroContext(sym),
      fetch(_proxyUrl+'/?url='+encodeURIComponent(histUrl)),
    ]);
    // --- meta + stats from 1d intraday ---
    let meta={}, news=[], macro={series:[],results:{},sector:null};
    if (cRes.status==='fulfilled' && cRes.value.ok) {
      const d = await cRes.value.json();
      const r = d.chart?.result?.[0];
      if (r) { meta=r.meta||{}; }
    }
    // --- chart data: 1mo daily (reuse hRes) ---
    let chartTs=[], chartCl=[], chartVol=[];
    if (hRes.status==='fulfilled' && hRes.value.ok) {
      const hd = await hRes.value.json();
      const hr = hd.chart?.result?.[0];
      if (hr) {
        if (!meta.regularMarketPrice) meta={...hr.meta,...meta};
        chartTs  = hr.timestamp||[];
        chartCl  = hr.indicators?.quote?.[0]?.close||[];
        chartVol = hr.indicators?.quote?.[0]?.volume||[];
        // avgVol from daily volumes
        if (!meta.averageDailyVolume3Month && !meta.averageDailyVolume10Day) {
          const dvols = chartVol.filter(v=>v!=null&&v>0);
          if (dvols.length >= 2) meta.averageDailyVolume3Month = Math.round(dvols.reduce((a,b)=>a+b,0)/dvols.length);
        }
      }
    }
    if (nRes.status==='fulfilled' && nRes.value.ok) {
      const d = await nRes.value.json(); news=d.news||[];
    }
    if (macroData.status==='fulfilled') macro = macroData.value;
    // Store globally for tab switching
    window._spData = {sym, name, meta, chartTs, chartCl, chartVol, news, dq, macro};
    renderStockDetail(sym, name, meta, chartTs, chartCl, chartVol, news, dq, {}, macro);
    // Reset tabs
    document.querySelectorAll('.sp-tab').forEach(t=>t.classList.remove('active'));
    $('tab-chart')?.classList.add('active');
  } catch(e) {
    $('sp-body').innerHTML = '<div class="modal-loading" style="padding:30px;color:var(--dim)">שגיאה בטעינה</div>';
  }
}

// ── CHART RANGE CONFIG ──────────────────────────
const CHART_RANGE_CFG = {
  '1D': {range:'1d',  interval:'5m',  prepost:true,  isIntraday:true},
  '1W': {range:'5d',  interval:'30m', prepost:false, isIntraday:true},
  '1M': {range:'1mo', interval:'1d',  prepost:false, isIntraday:false},
  '3M': {range:'3mo', interval:'1d',  prepost:false, isIntraday:false},
  '6M': {range:'6mo', interval:'1d',  prepost:false, isIntraday:false},
  '1Y': {range:'1y',  interval:'1d',  prepost:false, isIntraday:false},
};

function buildChartSvg(sym, meta, timestamps, closes, volumes, rangeKey) {
  const cfg = CHART_RANGE_CFG[rangeKey] || CHART_RANGE_CFG['1M'];
  const pts = closes.map((c,i)=>({c,t:timestamps[i],v:volumes[i]||0})).filter(p=>p.c!=null);
  if (pts.length < 2) return '';

  const W=600, CHART_H=130, VOL_H=28, PAD_T=10, PAD_B=2;
  const cA = CHART_H - PAD_T - PAD_B;
  const minC = Math.min(...pts.map(p=>p.c));
  const maxC = Math.max(...pts.map(p=>p.c));
  const rng  = (maxC-minC)||maxC*0.01||1;
  const prev = meta?.chartPreviousClose || null;

  // Expand range to include prev close so baseline is always visible
  const allVals = prev!=null ? [minC,maxC,prev] : [minC,maxC];
  const padV = rng*0.12;
  const lo = Math.min(...allVals)-padV, hi = Math.max(...allVals)+padV, vRng = hi-lo;

  const lastC  = pts[pts.length-1].c;
  const firstC = pts[0].c;
  const isUp = lastC >= (prev||firstC);
  const col    = isUp ? '#00e87a' : '#ff3a5c';
  const colDim = isUp ? 'rgba(0,232,122,.13)' : 'rgba(255,58,92,.13)';

  const tx = i => (i/(pts.length-1))*W;
  const ty = v => PAD_T + cA - ((v-lo)/vRng)*cA;

  const linePts = pts.map((p,i)=>`${tx(i).toFixed(1)},${ty(p.c).toFixed(1)}`).join(' ');
  const areaD   = `M0,${ty(pts[0].c).toFixed(1)} `+pts.map((p,i)=>`L${tx(i).toFixed(1)},${ty(p.c).toFixed(1)}`).join(' ')+` L${tx(pts.length-1)},${(PAD_T+cA).toFixed(1)} L0,${(PAD_T+cA).toFixed(1)} Z`;

  // Volume bars
  const maxVol  = Math.max(...pts.map(p=>p.v),1);
  const volBars = pts.map((p,i)=>{
    const bw=Math.max(2,(W/pts.length)*0.68), bh=Math.max(1,(p.v/maxVol)*VOL_H);
    return `<rect x="${(tx(i)-bw/2).toFixed(1)}" y="${(VOL_H-bh).toFixed(1)}" width="${bw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${col}" opacity=".28"/>`;
  }).join('');

  // Grid lines
  const gridSvg = [0,0.33,0.66,1].map(f=>`<line x1="0" y1="${(PAD_T+cA*(1-f)).toFixed(1)}" x2="${W}" y2="${(PAD_T+cA*(1-f)).toFixed(1)}" stroke="rgba(255,255,255,.04)" stroke-width="1"/>`).join('');

  // Prev close dashed reference line
  let prevLineEl = '', prevBadgeEl = '';
  if (prev != null) {
    const py = ty(prev).toFixed(1);
    prevLineEl = `<line x1="0" y1="${py}" x2="${W}" y2="${py}" stroke="rgba(200,200,200,.35)" stroke-dasharray="4 3" stroke-width="0.8"/>`;
    const tyPct2 = ((+py)/(CHART_H+VOL_H)*100).toFixed(1);
    prevBadgeEl = `<div style="position:absolute;top:${tyPct2}%;left:8px;transform:translateY(-50%);font-size:8px;color:rgba(200,200,200,.55);font-family:var(--mono);line-height:1;pointer-events:none;white-space:nowrap">Prev close: $${prev.toFixed(2)}</div>`;
  }

  // Crosshair SVG elements (hidden initially)
  const xhairEl = `
    <line id="sp-xh-v" x1="0" y1="${PAD_T}" x2="0" y2="${PAD_T+cA}" stroke="rgba(200,216,234,.5)" stroke-width="1" stroke-dasharray="3 2" opacity="0" pointer-events="none"/>
    <line id="sp-xh-h" x1="0" y1="0" x2="${W}" y2="0" stroke="rgba(200,216,234,.3)" stroke-width="1" stroke-dasharray="3 2" opacity="0" pointer-events="none"/>
    <circle id="sp-xh-dot" cx="0" cy="0" r="4" fill="${col}" stroke="#0e1a2a" stroke-width="1.5" opacity="0" pointer-events="none"/>
    <rect id="sp-xh-overlay" x="0" y="0" width="${W}" height="${CHART_H}" fill="transparent"
      onmousemove="_chartMove(event,this)" onmouseleave="_chartLeave()" ontouchmove="_chartMove(event,this)" ontouchend="_chartLeave()"/>`;

  // Price labels (right side)
  const tyPct = v => (ty(v)/(CHART_H+VOL_H)*100).toFixed(1);
  const priceLbls = [maxC,(maxC+minC)/2,minC].map(v=>
    `<div style="position:absolute;top:${tyPct(v)}%;right:4px;transform:translateY(-50%);font-size:8px;color:rgba(204,216,234,.32);font-family:var(--mono);line-height:1;pointer-events:none">${v.toFixed(2)}</div>`
  ).join('');
  const curBadge = `<div style="position:absolute;top:${tyPct(lastC)}%;right:0;transform:translateY(-50%);background:${col};color:#000;font-size:8px;font-weight:800;font-family:var(--mono);padding:2px 5px;border-radius:2px 0 0 2px;line-height:1.4;pointer-events:none">${lastC.toFixed(2)}</div>`;
  const chgPct = ((lastC-(prev||firstC))/(prev||firstC)*100);
  const chgBadge = `<div style="position:absolute;top:7px;left:8px;font-size:9px;font-weight:700;font-family:var(--mono);color:${col};background:${colDim};padding:2px 7px;border-radius:3px;line-height:1.4;pointer-events:none">${chgPct>=0?'+':''}${chgPct.toFixed(2)}%</div>`;

  // Axis labels
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  const DAYS=['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const axPts=[0,Math.floor(pts.length*.25),Math.floor(pts.length*.5),Math.floor(pts.length*.75),pts.length-1];
  const axLabels = axPts.map((i,j)=>{
    const ts=pts[i]?.t; if(!ts) return '';
    const d=new Date(ts*1000); let lbl;
    if(cfg.isIntraday){ if(rangeKey==='1W'){lbl=DAYS[d.getDay()];}else{const h=d.getUTCHours()-4,m=d.getUTCMinutes(),hh=(h+24)%24,h12=hh%12||12,sfx=hh<12?'AM':'PM';lbl=`${h12}${m?':'+String(m).padStart(2,'0'):''}${sfx}`;}}
    else{lbl=`${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]}`;}
    const pct=(i/(pts.length-1)*100).toFixed(1);
    const xf=j===0?'translateX(0)':j===axPts.length-1?'translateX(-100%)':'translateX(-50%)';
    return `<span style="position:absolute;left:${pct}%;transform:${xf};font-size:8px;color:rgba(204,216,234,.32);font-family:var(--sans);white-space:nowrap">${lbl}</span>`;
  }).join('');

  // Range buttons + tool buttons
  const rangeBar = `<div class="sp-chart-hdr">
    <div class="sp-chart-ranges">${
      Object.keys(CHART_RANGE_CFG).map(k=>
        `<button class="sp-rng-btn${k===rangeKey?' active':''}" onclick="switchChartRange('${k}')">${k}</button>`
      ).join('')
    }</div>
    <div class="sp-chart-tools">
      <button class="sp-tool-btn" onclick="_chartZoom(1)" title="Zoom In"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
      <button class="sp-tool-btn" onclick="_chartZoom(-1)" title="Zoom Out"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg></button>
      <button class="sp-tool-btn" onclick="_chartScreenshot('${sym}')" title="Screenshot"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M23 19a2 2 0 0 1-2 2H3a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h4l2-3h6l2 3h4a2 2 0 0 1 2 2z"/><circle cx="12" cy="13" r="4"/></svg></button>
      <button class="sp-tool-btn" onclick="_chartExpandFull()" title="Expand chart"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="15 3 21 3 21 9"/><polyline points="9 21 3 21 3 15"/><line x1="21" y1="3" x2="14" y2="10"/><line x1="3" y1="21" x2="10" y2="14"/></svg></button>
    </div>
  </div>`;

  // Dot grid background pattern (Perplexity style)
  const dotPat = `<pattern id="spd${sym}" patternUnits="userSpaceOnUse" width="6" height="6"><circle cx="3" cy="3" r="0.55" fill="rgba(200,210,230,.2)"/></pattern>`;

  // Store chart data for crosshair JS
  window._chartPts = pts.map((p,i)=>({c:p.c, t:p.t, v:p.v, svgY:ty(p.c), svgX:tx(i)}));
  window._chartAllPts = pts; // full dataset for zoom
  window._chartMeta = {W, CHART_H, col, prev, cfg, rangeKey, sym};

  return `<div class="sp-chart-wrap">
    ${rangeBar}
    <div style="position:relative" id="sp-chart-container">
      <div id="sp-chart-tooltip" class="sp-chart-tooltip" style="display:none"></div>
      <svg id="sp-chart-svg" width="100%" viewBox="0 0 ${W} ${CHART_H}" preserveAspectRatio="none" style="display:block;height:128px;overflow:visible">
        <defs>
          <linearGradient id="spg${sym}" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stop-color="${col}" stop-opacity=".22"/><stop offset="90%" stop-color="${col}" stop-opacity="0"/></linearGradient>
          ${dotPat}
        </defs>
        <rect width="${W}" height="${CHART_H}" fill="url(#spd${sym})"/>
        ${gridSvg}
        ${prevLineEl}
        <path d="${areaD}" fill="url(#spg${sym})"/>
        <polyline points="${linePts}" fill="none" stroke="${col}" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"/>
        ${xhairEl}
      </svg>
      <svg width="100%" viewBox="0 0 ${W} ${VOL_H}" preserveAspectRatio="none" style="display:block;height:26px">${volBars}</svg>
      ${priceLbls}${curBadge}${chgBadge}${prevBadgeEl}
      <div style="position:relative;height:18px;margin:2px 4px 0">${axLabels}</div>
    </div>
  </div>`;
}

/* ── Chart crosshair handlers ──────────────────────── */
function _chartMove(e, overlay) {
  if (e.cancelable) e.preventDefault();
  const pts = window._chartPts; if (!pts || pts.length < 2) return;
  const m = window._chartMeta; if (!m) return;

  const svg = overlay.closest('svg');
  const rect = svg.getBoundingClientRect();
  const clientX = e.touches ? e.touches[0].clientX : e.clientX;
  const relX = Math.max(0, Math.min(1, (clientX - rect.left) / rect.width));
  const idx = Math.max(0, Math.min(pts.length-1, Math.round(relX*(pts.length-1))));
  const pt = pts[idx];

  const vl=$('sp-xh-v'), hl=$('sp-xh-h'), dt=$('sp-xh-dot');
  if (vl) { vl.setAttribute('x1',pt.svgX.toFixed(1)); vl.setAttribute('x2',pt.svgX.toFixed(1)); vl.setAttribute('opacity','1'); }
  if (hl) { hl.setAttribute('y1',pt.svgY.toFixed(1)); hl.setAttribute('y2',pt.svgY.toFixed(1)); hl.setAttribute('opacity','1'); }
  if (dt) { dt.setAttribute('cx',pt.svgX.toFixed(1)); dt.setAttribute('cy',pt.svgY.toFixed(1)); dt.setAttribute('opacity','1'); }

  const tip = $('sp-chart-tooltip'); if (!tip) return;
  const d = new Date(pt.t*1000);
  const MONTHS=['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];
  let dateLbl;
  if (m.cfg?.isIntraday) {
    const h=d.getUTCHours()-4, mn=d.getUTCMinutes(), hh=(h+24)%24, h12=hh%12||12, sfx=hh<12?'AM':'PM';
    dateLbl=`${MONTHS[d.getUTCMonth()]} ${d.getUTCDate()}, ${h12}:${String(mn).padStart(2,'0')} ${sfx}`;
  } else {
    dateLbl=`${d.getUTCDate()} ${MONTHS[d.getUTCMonth()]} ${d.getUTCFullYear()}`;
  }
  const chg = m.prev ? ((pt.c - m.prev)/m.prev*100) : 0;
  const chgCol = chg >= 0 ? '#00e87a' : '#ff3a5c';
  const fmtV = v => v>=1e9?(v/1e9).toFixed(2)+'B':v>=1e6?(v/1e6).toFixed(1)+'M':v>=1e3?(v/1e3).toFixed(0)+'K':v;
  tip.innerHTML = `<div class="sp-tip-date">${dateLbl}</div><div class="sp-tip-price">$${pt.c.toFixed(2)}</div><div class="sp-tip-chg" style="color:${chgCol}">${chg>=0?'+':''}${chg.toFixed(2)}%</div>${pt.v?`<div class="sp-tip-vol">Vol: ${fmtV(pt.v)}</div>`:''}`;
  tip.style.display = 'block';
  // Clamp tooltip horizontally
  const tipW = 100; // approx px
  const containerRect = tip.parentElement.getBoundingClientRect();
  let leftPx = (clientX - containerRect.left) - tipW/2;
  leftPx = Math.max(4, Math.min(containerRect.width - tipW - 4, leftPx));
  tip.style.left = leftPx+'px';
  tip.style.top = '6px';
}
function _chartLeave() {
  ['sp-xh-v','sp-xh-h','sp-xh-dot'].forEach(id=>{ const el=$(id); if(el) el.setAttribute('opacity','0'); });
  const tip=$('sp-chart-tooltip'); if(tip) tip.style.display='none';
}

/* ── Helper: rebuild sp-body (center: chart only on desktop, all on mobile) ── */
function _rebuildSpBody(newChartHtml) {
  // Desktop center: just the chart card
  // Mobile: everything in one scroll (stats+macro+profile+news in body)
  const mobileExtra = `
    <div class="sp-mobile-section">
      <div class="sp-section-card">
        <div class="sp-section-hdr">נתוני שוק</div>
        ${window._spStatsHtml || ''}
      </div>
      <div class="sp-section-card">
        <div class="sp-section-hdr">הקשר מאקרו</div>
        ${window._macroHtml || ''}
      </div>
      <div class="sp-section-card">
        <div class="sp-section-hdr">פרופיל</div>
        <div style="padding:10px 12px">${window._profileCardHtml || ''}</div>
      </div>
      <div class="sp-section-card">
        <div class="sp-section-hdr">חדשות</div>
        ${window._spNewsHtml || ''}
      </div>
    </div>`;

  const bodyHtml = `
    <div class="sp-section-card" style="margin:12px">
      <div class="sp-section-hdr">גרף</div>
      ${newChartHtml}
    </div>
    ${mobileExtra}
    <div style="height:max(env(safe-area-inset-bottom),20px)"></div>`;

  window._spChartHtml = bodyHtml;
  $('sp-body').innerHTML = bodyHtml;
}

const _ZOOM_LEVELS = [1, 0.75, 0.5, 0.25];
window._chartZoomIdx = 0;
window._chartOrigPts = null; // שמירת הנתונים המקוריים לפני זום

function _chartZoom(dir) {
  // dir: 1 = zoom in (show less), -1 = zoom out (show more)
  const d = window._spData; if (!d) return;

  // שמור נתונים מקוריים פעם אחת (לפני זום ראשון)
  if (!window._chartOrigPts && window._chartAllPts) {
    window._chartOrigPts = window._chartAllPts.slice();
  }
  const origPts = window._chartOrigPts; if (!origPts || origPts.length < 4) return;

  const newIdx = Math.max(0, Math.min(_ZOOM_LEVELS.length-1, (window._chartZoomIdx||0) + dir));
  if (newIdx === window._chartZoomIdx) return; // כבר בגבול
  window._chartZoomIdx = newIdx;

  const frac = _ZOOM_LEVELS[newIdx];
  const start = Math.floor(origPts.length * (1 - frac));
  const sliced = origPts.slice(start);

  const newChart = buildChartSvg(
    d.sym, d.meta,
    sliced.map(p=>p.t), sliced.map(p=>p.c), sliced.map(p=>p.v),
    window._chartMeta?.rangeKey || '1M'
  );
  // שחזר את הנתונים המקוריים שבuildChartSvg מחק
  window._chartAllPts = origPts;
  _rebuildSpBody(newChart);
}

function _chartScreenshot(sym) {
  const svg = $('sp-chart-svg'); if (!svg) return;

  // בנה SVG עם רקע כהה
  const clone = svg.cloneNode(true);
  clone.setAttribute('xmlns', 'http://www.w3.org/2000/svg');
  const bg = document.createElementNS('http://www.w3.org/2000/svg','rect');
  bg.setAttribute('width','100%'); bg.setAttribute('height','100%');
  bg.setAttribute('fill','#1e1d1c');
  clone.insertBefore(bg, clone.firstChild);
  const svgStr = new XMLSerializer().serializeToString(clone);
  const svgBlob = new Blob([svgStr], {type:'image/svg+xml;charset=utf-8'});
  const svgUrl = URL.createObjectURL(svgBlob);

  // הצג modal
  const existing = $('sp-ss-modal'); if (existing) existing.remove();
  const modal = document.createElement('div');
  modal.id = 'sp-ss-modal';
  modal.className = 'sp-ss-modal';
  modal.innerHTML = `
    <div class="sp-ss-inner">
      <div class="sp-ss-hdr">
        <span>Save screenshot</span>
        <button class="sp-ss-close" onclick="document.getElementById('sp-ss-modal').remove()">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>
        </button>
      </div>
      <div class="sp-ss-preview-wrap">
        <img src="${svgUrl}" class="sp-ss-preview" alt="chart"/>
        <div class="sp-ss-sym">${sym||''} Chart</div>
      </div>
      <div class="sp-ss-btns">
        <button class="sp-ss-btn" onclick="_ssDlSvg('${sym}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download SVG
        </button>
        <button class="sp-ss-btn sp-ss-btn-primary" onclick="_ssDlPng('${sym}')">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download PNG
        </button>
      </div>
    </div>`;
  modal.addEventListener('click', e => { if (e.target === modal) modal.remove(); });
  document.body.appendChild(modal);
  window._ssSvgUrl = svgUrl;
  window._ssSvg = svg;
}

function _ssDlSvg(sym) {
  const a = document.createElement('a');
  a.href = window._ssSvgUrl; a.download = `${sym||'chart'}.svg`;
  a.click();
}

function _ssDlPng(sym) {
  const svg = window._ssSvg; if (!svg) return;
  const rect = svg.getBoundingClientRect();
  const canvas = document.createElement('canvas');
  const scale = 2;
  canvas.width = rect.width * scale; canvas.height = rect.height * scale;
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = '#1e1d1c'; ctx.fillRect(0,0,canvas.width,canvas.height);
  const img = new Image();
  img.onload = () => {
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);
    const a = document.createElement('a');
    a.download = `${sym||'chart'}.png`;
    a.href = canvas.toDataURL('image/png');
    a.click();
    const modal = $('sp-ss-modal'); if (modal) modal.remove();
  };
  img.onerror = () => { _ssDlSvg(sym); }; // fallback
  img.src = window._ssSvgUrl;
}

function _chartExpandFull() {
  const existing = document.getElementById('chart-fs-overlay');
  if (existing) { existing.remove(); return; }
  const wrap = document.querySelector('.sp-chart-wrap');
  if (!wrap) return;
  const overlay = document.createElement('div');
  overlay.id = 'chart-fs-overlay';
  overlay.className = 'chart-fs-overlay';
  overlay.innerHTML = `
    <button class="chart-fs-close" onclick="document.getElementById('chart-fs-overlay').remove()">×</button>
    <div class="chart-fs-inner">${wrap.outerHTML}</div>`;
  overlay.addEventListener('keydown', e=>{ if(e.key==='Escape') overlay.remove(); });
  document.body.appendChild(overlay);
  overlay.focus();
}

async function switchChartRange(rangeKey) {
  const d = window._spData; if (!d) return;
  const cfg = CHART_RANGE_CFG[rangeKey]; if (!cfg) return;
  // איפוס מצב זום
  window._chartZoomIdx = 0;
  window._chartOrigPts = null;
  // optimistic button highlight
  document.querySelectorAll('.sp-rng-btn').forEach(b=>b.classList.toggle('active', b.textContent===rangeKey));
  // dim chart
  const wrap = document.querySelector('.sp-chart-wrap');
  if (wrap) wrap.style.opacity='.45';
  try {
    const url = `https://query1.finance.yahoo.com/v8/finance/chart/${d.sym}?range=${cfg.range}&interval=${cfg.interval}${cfg.prepost?'&includePrePost=true':''}`;
    const r   = await fetch(_proxyUrl+'/?url='+encodeURIComponent(url));
    if (!r.ok) throw new Error();
    const json = await r.json();
    const res  = json.chart?.result?.[0];
    if (!res) throw new Error();
    const ts  = res.timestamp||[];
    const cl  = res.indicators?.quote?.[0]?.close||[];
    const vol = res.indicators?.quote?.[0]?.volume||[];
    const newChart = buildChartSvg(d.sym, d.meta, ts, cl, vol, rangeKey);
    _rebuildSpBody(newChart);
  } catch(e) {
    if (wrap) wrap.style.opacity='1';
  }
}

function renderStockDetail(sym, name, meta, timestamps, closes, volumes, news, dq, fundData={}, macro={series:[],results:{},sector:null}) {
  const fmt2 = v => v!=null ? Number(v).toFixed(2) : '–';
  const fmtB = v => {
    if (!v) return '–';
    if (v>=1e12) return '$'+(v/1e12).toFixed(2)+'T';
    if (v>=1e9)  return '$'+(v/1e9).toFixed(2)+'B';
    if (v>=1e6)  return '$'+(v/1e6).toFixed(1)+'M';
    return v.toLocaleString();
  };
  const fmtV = v => {
    if (!v) return '–';
    if (v>=1e9) return (v/1e9).toFixed(2)+'B';
    if (v>=1e6) return (v/1e6).toFixed(1)+'M';
    if (v>=1e3) return (v/1e3).toFixed(0)+'K';
    return v.toLocaleString();
  };

  const price = meta.regularMarketPrice || dq.price || 0;
  if (price) $('sp-price').textContent = '$'+Number(price).toFixed(2);
  if (meta.longName || meta.shortName) $('sp-name').textContent = meta.longName||meta.shortName;

  const dayLo=meta.regularMarketDayLow, dayHi=meta.regularMarketDayHigh;
  const wLo=meta.fiftyTwoWeekLow, wHi=meta.fiftyTwoWeekHigh;

  // ── Perplexity-style 3×3 stats grid ──────────────────
  const divYield = meta.dividendYield
    ? (meta.dividendYield < 1 ? (meta.dividendYield*100).toFixed(2)+'%' : meta.dividendYield.toFixed(2)+'%')
    : '–';

  const statsData = [
    { label:'Prev Close', val: meta.chartPreviousClose ? '$'+fmt2(meta.chartPreviousClose) : '–' },
    { label:'Market Cap',  val: meta.marketCap ? fmtB(meta.marketCap) : '–' },
    { label:'Open',        val: meta.regularMarketOpen ? '$'+fmt2(meta.regularMarketOpen) : '–' },
    { label:'P/E Ratio',   val: meta.trailingPE ? fmt2(meta.trailingPE) : '–' },
    { label:'Day Range',   val: dayLo ? '$'+fmt2(dayLo)+'–$'+fmt2(dayHi) : '–' },
    { label:'Div. Yield',  val: divYield },
    { label:'52W Range',   val: wLo ? '$'+fmt2(wLo)+'–$'+fmt2(wHi) : '–' },
    { label:'EPS',         val: meta.trailingEps ? '$'+fmt2(meta.trailingEps) : '–' },
    { label:'Volume',      val: fmtV(meta.regularMarketVolume||dq.vol) },
  ];

  const statsHtml = `
    <div class="sp-stats-grid">
      ${statsData.map(s=>`
        <div class="sp-stat-cell">
          <dt class="sp-stat-lbl">${s.label}</dt>
          <dd class="sp-stat-val">${s.val}</dd>
        </div>`).join('')}
    </div>`;

  // ── Chart ─────────────────────────────────────────────
  const chartHtml = buildChartSvg(sym, meta, timestamps, closes, volumes, '1M');

  // ── Sidebar (desktop only) ─────────────────────────────
  const macroHtml = renderMacroContext(macro);
  const exch = meta.exchangeName || meta.fullExchangeName || '–';
  const profileRows = [
    { label:'Symbol',    val: sym },
    { label:'Exchange',  val: exch },
    { label:'Currency',  val: meta.currency || 'USD' },
    { label:'Market Cap',val: meta.marketCap ? fmtB(meta.marketCap) : '–' },
    { label:'P/E',       val: meta.trailingPE ? fmt2(meta.trailingPE) : '–' },
    { label:'EPS',       val: meta.trailingEps ? '$'+fmt2(meta.trailingEps) : '–' },
    { label:'Div. Yield',val: divYield },
    { label:'Avg Volume',val: fmtV(meta.averageDailyVolume3Month||dq.avgVol) },
  ];
  // ── Profile card HTML (shared by sidebar and mobile) ──
  const profileCardHtml = `
    <div class="sp-profile-card">
      ${profileRows.map((r,i)=>`
        <div class="sp-profile-row${i===profileRows.length-1?' last':''}">
          <dt class="sp-profile-lbl">${r.label}</dt>
          <dd class="sp-profile-val">${r.val}</dd>
        </div>`).join('')}
    </div>
    <div style="display:grid;grid-template-columns:1fr 1fr;gap:6px;margin-top:10px;padding:0 0 4px">
      <a href="https://finance.yahoo.com/quote/${sym}/financials" target="_blank" class="sp-sb-link">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><polyline points="22 7 13.5 15.5 8.5 10.5 1 18"/><polyline points="16 7 22 7 22 13"/></svg>Yahoo Finance
      </a>
      <a href="https://stockanalysis.com/stocks/${sym.toLowerCase()}/" target="_blank" class="sp-sb-link">
        <svg width="11" height="11" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>Stock Analysis
      </a>
    </div>`;

  // Sidebar: section cards with header INSIDE the card
  const sidebarHtml = `
    <div class="sp-section-card" style="margin:0 0 12px">
      <div class="sp-section-hdr">פרופיל</div>
      <div style="padding:10px 12px">${profileCardHtml}</div>
    </div>
    <div class="sp-section-card" style="margin:0">
      <div class="sp-section-hdr">הקשר מאקרו</div>
      ${macroHtml}
    </div>
    <div style="height:max(env(safe-area-inset-bottom),20px)"></div>`;

  window._spSidebarHtml = sidebarHtml;
  window._macroHtml = macroHtml;
  window._profileCardHtml = profileCardHtml;
  const sidebar = $('sp-sidebar');
  if (sidebar) sidebar.innerHTML = sidebarHtml;

  // ── News items HTML — must be before right sidebar ────
  const newsItemsHtml = news.length
    ? news.slice(0,6).map(n=>{
        const ago=n.providerPublishTime?Math.round((Date.now()/1000-n.providerPublishTime)/3600):null;
        const t=(n.title||'').toLowerCase();
        const pos=['surge','soar','beat','gain','growth','strong','record','upgrade','rally','rise','profit','exceed','jumps','climbs'];
        const neg=['fall','drop','miss','loss','weak','cut','crash','decline','plunge','slump','disappoint','warning','concern','below','down'];
        const p=pos.filter(w=>t.includes(w)).length, ng=neg.filter(w=>t.includes(w)).length;
        const sent=p>ng?'positive':ng>p?'negative':'neutral';
        const badge=sent==='positive'?'<span style="display:inline-flex;font-size:8px;font-weight:700;padding:1px 6px;border-radius:3px;background:var(--gd);color:var(--green)">▲ חיובי</span>'
          :sent==='negative'?'<span style="display:inline-flex;font-size:8px;font-weight:700;padding:1px 6px;border-radius:3px;background:var(--rd);color:var(--red)">▼ שלילי</span>'
          :'<span style="display:inline-flex;font-size:8px;font-weight:700;padding:1px 6px;border-radius:3px;background:var(--bg4);color:var(--dim)">● ניטרלי</span>';
        return `<a class="sp-news-item" href="${n.link||'#'}" target="_blank" rel="noopener" style="display:flex;gap:10px;padding:12px 16px;border-bottom:1px solid var(--border);text-decoration:none;color:inherit">
          <div style="flex:1"><div class="sp-news-title">${n.title||''}</div>
          <div style="display:flex;align-items:center;gap:6px;margin-top:5px">${badge}
            <span class="sp-news-meta">${n.publisher||''} ${ago!=null?'· '+(ago<1?'עכשיו':ago+'h ago'):''}</span>
          </div></div></a>`;
      }).join('')
    : '<div style="padding:24px;text-align:center;color:var(--dim);font-size:12px">אין חדשות זמינות</div>';
  window._spNewsHtml = newsItemsHtml + '<div style="height:max(env(safe-area-inset-bottom),20px)"></div>';

  // Right sidebar: stats + news (desktop)
  const rightSidebarHtml = `
    <div class="sp-section-card" style="margin:12px 12px 6px">
      <div class="sp-section-hdr">נתוני שוק</div>
      ${statsHtml}
    </div>
    <div class="sp-section-card" style="margin:6px 12px 12px">
      <div class="sp-section-hdr">חדשות</div>
      ${newsItemsHtml}
    </div>
    <div style="height:20px"></div>`;
  window._spRightSidebarHtml = rightSidebarHtml;
  const rightSidebar = $('sp-sidebar-right');
  if (rightSidebar) rightSidebar.innerHTML = rightSidebarHtml;

  // Desktop: stats+chart in body, macro in sidebar. Mobile: macro in body too.
  window._spStatsHtml = statsHtml + '<div style="height:max(env(safe-area-inset-bottom),20px)"></div>';
  window._spStatsHtmlMobile = statsHtml + macroHtml + '<div style="height:max(env(safe-area-inset-bottom),20px)"></div>';
  window._spChartHtml = chartHtml + (window.innerWidth >= 900 ? window._spStatsHtml : window._spStatsHtmlMobile);

  // Fundamentals tab (mobile) — same profile card
  window._spFundHtml = `
    <div style="padding:14px 16px">
      <div class="sp-profile-card">
        ${profileRows.map((r,i)=>`
          <div class="sp-profile-row${i===profileRows.length-1?' last':''}">
            <dt class="sp-profile-lbl">${r.label}</dt>
            <dd class="sp-profile-val">${r.val}</dd>
          </div>`).join('')}
      </div>
      <div style="display:grid;grid-template-columns:1fr 1fr;gap:8px;margin-top:12px">
        <a href="https://finance.yahoo.com/quote/${sym}/financials" target="_blank"
          style="display:flex;align-items:center;justify-content:center;gap:5px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px;text-decoration:none;color:var(--text);font-size:11px;font-weight:600">
          Yahoo Finance
        </a>
        <a href="https://stockanalysis.com/stocks/${sym.toLowerCase()}/" target="_blank"
          style="display:flex;align-items:center;justify-content:center;gap:5px;background:var(--bg3);border:1px solid var(--border);border-radius:8px;padding:10px;text-decoration:none;color:var(--text);font-size:11px;font-weight:600">
          Stock Analysis
        </a>
      </div>
    </div>
    <div style="height:max(env(safe-area-inset-bottom),20px)"></div>`;

  // ── Build body: section cards ────────────────────────
  const bodyHtml = `
    <div class="sp-section-card" style="margin:12px">
      <div class="sp-section-hdr">גרף</div>
      ${chartHtml}
    </div>
    <div class="sp-mobile-section">
      <div class="sp-section-card">
        <div class="sp-section-hdr">נתוני שוק</div>
        ${statsHtml}
      </div>
      <div class="sp-section-card">
        <div class="sp-section-hdr">הקשר מאקרו</div>
        ${macroHtml}
      </div>
      <div class="sp-section-card">
        <div class="sp-section-hdr">פרופיל</div>
        <div style="padding:10px 12px">${profileCardHtml}</div>
      </div>
      <div class="sp-section-card">
        <div class="sp-section-hdr">חדשות</div>
        ${newsItemsHtml}
      </div>
    </div>
    <div style="height:max(env(safe-area-inset-bottom),20px)"></div>`;

  window._spChartHtml = bodyHtml;
  window._spStatsHtml = statsHtml;
  $('sp-body').innerHTML = bodyHtml;
}

function switchStockTab(tab) {
  document.querySelectorAll('.sp-tab').forEach(t=>t.classList.remove('active'));
  $('tab-'+tab)?.classList.add('active');
  // Mobile only — desktop has no tabs
  if (window.innerWidth < 900) {
    $('sp-body').innerHTML = (tab==='fundamentals' ? window._spFundHtml :
      tab==='news' ? window._spNewsHtml : window._spChartHtml)
      || '<div style="padding:30px;text-align:center;color:var(--dim)">טוען...</div>';
  }
}

function closeStockDetail(e) {
  if (e && e.target !== $('stock-overlay')) return;
  $('stock-overlay').classList.remove('open');
  document.body.style.overflow = '';
}

function closeModal(e){
  if(e.target===$('modal-overlay'))closeModalDirect();
}
function closeModalDirect(){
  $('modal-overlay').classList.remove('open');
  document.body.style.overflow='';
  const wrap=$('modal-search-wrap');
  if(wrap)wrap.classList.remove('open');
}
document.addEventListener('keydown',e=>{if(e.key==='Escape')closeModalDirect()});

function toggleModalSearch(){
  const wrap=$('modal-search-wrap');
  const isOpen=wrap.classList.contains('open');
  if(isOpen){wrap.classList.remove('open');}
  else{wrap.classList.add('open');const inp=$('modal-search-input');inp.value='';setTimeout(()=>inp.focus(),50);}
}
function searchFromModal(){
  const inp=$('modal-search-input');
  const sym=inp.value.trim().toUpperCase().replace(/\s+/g,'');
  if(!sym)return;
  toggleModalSearch();
  openStockDetail(sym,sym);
}

// ── MAIN ─────────────────────────────────────────────
async function init(){
  showScreen('screen-loading');
  const btn=$('refresh-btn');if(btn)btn.classList.add('loading');

  try{
    // Step 1: quotes for all symbols via Yahoo Finance proxy
    $('progress').textContent=`מביא מחירים — ${ALL.length} סמלים...`;
    const allSymbols = ALL.map(s => s.sym);
    const allQuotes = await fetchYahooQuotesBatch(allSymbols);
    Object.assign(qmap, allQuotes);

    // Check if proxy works (all data empty = bad proxy URL)
    const gotData = Object.values(allQuotes).filter(d => d.price).length;
    if(gotData===0){
      $('key-err').style.display='block';
      $('key-err').textContent='שגיאה בחיבור לשרת — בדוק את ה-Worker URL';
      showKey();return;
    }

    // Render with day data
    const now=new Date();
    const tsBadge=$('ts-badge'),tsDate=$('ts-date'),tsTime=$('ts-time');
    if(tsBadge){
      tsDate.textContent=now.toLocaleDateString('he-IL');
      tsTime.textContent=now.toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'});
      tsBadge.style.display='flex';
    }
    renderTicker();
    renderCards('idx-main',  INDICES, ['יום'], ['d1']);
    renderCards('idx-other', OTHER,   ['יום'], ['d1']);
    // כרטיסיית שעון שוק מקווקוות
    if(!$('market-clock-card')){
      const mc=document.createElement('div');
      mc.id='market-clock-card'; mc.className='market-clock-card';
      mc.innerHTML='<div class="mc-status-row"><div class="market-dot closed" id="market-dot"></div><span class="market-label closed" id="market-label">טוען...</span></div>'
        +'<div class="market-countdown" id="market-countdown"></div>'
        +'<div class="mc-bottom">NYSE 09:30–16:00 ET</div>';
      $('idx-other').appendChild(mc);
    }

    renderPositivity();
    renderSectorsWithSkeleton();
    initSyncObserver(); // observe table for automatic height sync // skeleton מיידי עם יום% אמיתי
    renderSummary();
    renderFearGreed();
    drawChart();
    // הצג skeleton ל-YTD ו-Correlation מיד
    const ytdSec=$('ytd-section'); if(ytdSec) ytdSec.style.display='block';
    $('ytd-bars').innerHTML=`<div style="display:flex;flex-direction:column;gap:5px">${SECTORS.map(()=>`
      <div class="ytd-row"><span class="ytd-sym lc" style="width:36px;height:12px;border-radius:3px">&nbsp;</span>
      <div class="ytd-bar-track"><div class="lc" style="width:60%;height:100%"></div></div>
      <span style="width:40px;height:12px" class="lc">&nbsp;</span></div>`).join('')}</div>`;
    const corrSec=$('corr-section'); if(corrSec) corrSec.style.display='block';
    $('corr-table-wrap').innerHTML=`<div style="text-align:center;color:var(--dim);font-size:11px;padding:20px;font-family:var(--mono)"><div class="mini-ring" style="margin:0 auto 8px"></div>מחשב מתאמים...</div>`;
    showScreen('app');
    // Macro panel + P/C + Earnings (parallel, non-blocking)
    fetchMacro();
    renderMarketInternals();
    fetchEarningsCalendar();
    renderEconCalendar(); // async — runs in background

    // Background: parallel fetch → single render
    $('footer').textContent='טוען נתונים היסטוריים...';

    // מביא את כל הסקטורים במקביל
    await sleep(1000); // המתנה קצרה לאנימציית הטעינה
    await Promise.all(SECTORS.map(async s => {
      try { histMap[s.sym] = await fetchHistoricalReturns(s.sym); }
      catch (e) { histMap[s.sym] = {}; }
    }));

    // רנדור אחד אחרי שהכל מוכן
    await fetchFredColData();
    renderSectors();
    setTimeout(() => fetchAndRenderMovers(), 500);
    setTimeout(() => initNewsSection(), 3000);

    // Double RAF ensures DOM is fully painted before measuring row heights
    syncFrozenRows();
    renderFearGreed();
    renderYTDChart();
    renderCorrelationMatrix();
    renderMarketInternals();
    runInsights();
    const pos=SECTORS.filter(s=>(qmap[s.sym]||{}).d1>0).length;
    $('footer').textContent=`${pos}/${SECTORS.length} סקטורים חיוביים • Yahoo Finance • ${now.toLocaleTimeString('he-IL',{hour:'2-digit',minute:'2-digit'})}`;

  }catch(e){
    $('err-msg').textContent='שגיאה בטעינת נתונים.';
    $('err-code').textContent=e.message;$('err-code').style.display='block';
    showScreen('screen-error');
  }finally{
    if(btn)btn.classList.remove('loading');
  }
}

// ══════════════════════════════════════════════
// 6 NEW FEATURES — JS
// ══════════════════════════════════════════════

// ── 1. MARKET CLOCK ──────────────────────────
function getETHour() {
  // מחשב שעה בET תוך כדי תמיכה ב-DST אמריקאי
  const now = new Date();
  const etStr = now.toLocaleString('en-US', { timeZone: 'America/New_York' });
  return new Date(etStr);
}
function startMarketClock() {
  function tick() {
    const et = getETHour();
    const day = et.getDay(); // 0=ראשון,6=שבת
    const h = et.getHours(), m = et.getMinutes(), s = et.getSeconds();
    const totalMin = h * 60 + m;
    const dotEl = $('market-dot'), lblEl = $('market-label'), cntEl = $('market-countdown');
    if (!dotEl) return;
    const isWeekend = day === 0 || day === 6;
    let status, cls, countdownText = '';
    // שעון ישראל (ET + 7 בקיץ, +8 בחורף — DST אמריקאי)
    const ilDate = new Date(et.getTime());
    // מחשב הפרש: ישראל היא UTC+3 (קיץ) או UTC+2 (חורף)
    // ET היא UTC-4 (קיץ) או UTC-5 (חורף) — ההפרש הוא תמיד 7 שעות בקיץ אמריקאי, 8 בחורף
    const nowUTC = new Date();
    const ilStr = nowUTC.toLocaleTimeString('he-IL', {timeZone:'Asia/Jerusalem', hour:'2-digit', minute:'2-digit'});
    const formatIL = (etH, etM) => {
      const target = new Date(et);
      target.setHours(etH, etM, 0, 0);
      const diffMs = target - et;
      const future = new Date(nowUTC.getTime() + diffMs);
      return future.toLocaleTimeString('he-IL', {timeZone:'Asia/Jerusalem', hour:'2-digit', minute:'2-digit'});
    };

    if (isWeekend) {
      status = 'סגור (סוף שבוע)'; cls = 'closed';
      const daysTo = day === 6 ? 2 : 1;
      countdownText = `נפתח בעוד ${daysTo} ימים`;
    } else if (totalMin < 4*60) {
      status = 'סגור'; cls = 'closed';
      const rem = 4*60 - totalMin;
      const remS = (60 - s) % 60;
      const remM = remS > 0 ? rem - 1 : rem;
      countdownText = `פרי-מרקט בעוד <b>${String(Math.floor(remM/60)).padStart(2,'0')}:${String(remM%60).padStart(2,'0')}:${String(remS).padStart(2,'0')}</b><br><span style="font-size:9px;opacity:.7">ישראל ${formatIL(4,0)}</span>`;
    } else if (totalMin < 9*60+30) {
      status = 'פרי-מרקט'; cls = 'pre';
      const rem = 9*60+30 - totalMin;
      const remS = (60 - s) % 60;
      const remM = remS > 0 ? rem - 1 : rem;
      countdownText = `פתיחה בעוד <b>${String(Math.floor(remM/60)).padStart(2,'0')}:${String(remM%60).padStart(2,'0')}:${String(remS).padStart(2,'0')}</b><br><span style="font-size:9px;opacity:.7">ישראל ${formatIL(9,30)}</span>`;
    } else if (totalMin < 16*60) {
      status = 'שוק פתוח'; cls = 'open';
      const rem = 16*60 - totalMin;
      const remS = (60 - s) % 60;
      const remM = remS > 0 ? rem - 1 : rem;
      countdownText = `סגירה בעוד <b>${String(Math.floor(remM/60)).padStart(2,'0')}:${String(remM%60).padStart(2,'0')}:${String(remS).padStart(2,'0')}</b><br><span style="font-size:9px;opacity:.7">ישראל ${formatIL(16,0)}</span>`;
    } else if (totalMin < 20*60) {
      status = 'אפטר-אוורס'; cls = 'after';
      const rem = 20*60 - totalMin;
      const remS = (60 - s) % 60;
      const remM = remS > 0 ? rem - 1 : rem;
      countdownText = `נסגר בעוד <b>${String(Math.floor(remM/60)).padStart(2,'0')}:${String(remM%60).padStart(2,'0')}:${String(remS).padStart(2,'0')}</b>`;
    } else {
      status = 'סגור'; cls = 'closed';
      countdownText = `פרי-מרקט מחר<br><span style="font-size:9px;opacity:.7">ישראל ${formatIL(4,0)}</span>`;
    }
    dotEl.className = `market-dot ${cls}`;
    lblEl.className = `market-label ${cls}`;
    lblEl.textContent = status;
    cntEl.innerHTML = countdownText;
    // עדכון צבע גבול הכרטיסייה לפי מצב השוק
    const card = $('market-clock-card');
    if (card) {
      const borderColor = cls==='open' ? 'rgba(0,232,122,.5)'
                        : cls==='pre'||cls==='after' ? 'rgba(245,158,11,.5)'
                        : 'var(--border2)';
      card.style.borderColor = borderColor;
    }
  }
  tick();
  setInterval(tick, 1000);
}

// ── 2. FEAR & GREED INDEX ────────────────────
function calcFearGreed() {
  const vixData = qmap['VIXY'] || {};
  const vixD1 = vixData.d1 || 0;
  // VIX proxy: VIXY d1 — עלייה ב-VIX = פחד
  // נמיר ל-score: VIXY +5% ומעלה = פחד קיצוני (0), VIXY -5% ומטה = חמדנות קיצונית (100)
  const vixScore = Math.min(100, Math.max(0, 50 - vixD1 * 7));

  // מומנטום שוק — ממוצע d1 של כל הסקטורים
  const sectorD1 = SECTORS.map(s => (qmap[s.sym]||{}).d1).filter(v => v!=null&&!isNaN(v));
  const momentum = sectorD1.length ? sectorD1.reduce((a,b)=>a+b,0)/sectorD1.length : 0;
  const momScore = Math.min(100, Math.max(0, 50 + momentum * 12));

  // חיוביות — כמה סקטורים חיוביים
  const posCount = sectorD1.filter(v => v > 0).length;
  const posScore = (posCount / Math.max(sectorD1.length, 1)) * 100;

  const total = Math.round(vixScore * 0.35 + momScore * 0.40 + posScore * 0.25);
  return { total, vixScore: Math.round(vixScore), momScore: Math.round(momScore), posScore: Math.round(posScore), momentum: momentum.toFixed(2) };
}

function renderFearGreed() {
  const fg = calcFearGreed();
  const score = fg.total;
  // ציבע ותווית
  const getLabelAndColor = (s) => {
    if (s >= 75) return { lbl: 'חמדנות קיצונית', color: '#00e87a' };
    if (s >= 55) return { lbl: 'חמדנות', color: '#5bc27f' };
    if (s >= 45) return { lbl: 'ניטרלי', color: '#f59e0b' };
    if (s >= 25) return { lbl: 'פחד', color: '#f97316' };
    return { lbl: 'פחד קיצוני', color: '#ff3a5c' };
  };
  const { lbl, color } = getLabelAndColor(score);
  $('fg-num').textContent = score;
  $('fg-num').style.color = color;
  $('fg-lbl').textContent = lbl;
  // מצייר את הגאוג'
  drawFGGauge(score, color);
  // קומפוננטים
  $('fg-components').innerHTML = `
    <div class="fg-comp"><div class="fg-comp-val" style="color:${score>=50?'var(--green)':'var(--red)'}">VIX ${fg.vixScore}</div><div class="fg-comp-lbl">תנודתיות</div></div>
    <div class="fg-comp"><div class="fg-comp-val" style="color:${fg.momentum>=0?'var(--green)':'var(--red)'}">${fg.momentum}%</div><div class="fg-comp-lbl">מומנטום</div></div>
    <div class="fg-comp"><div class="fg-comp-val" style="color:${fg.posScore>=50?'var(--green)':'var(--red)'}">${Math.round(fg.posScore)}%</div><div class="fg-comp-lbl">חיוביות</div></div>`;
}

function drawFGGauge(score, activeColor) {
  const canvas = $('fg-canvas');
  if (!canvas) return;
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height, cx = W/2, cy = H-10, R = Math.min(cx-10, H-20), r = R - 22;
  ctx.clearRect(0, 0, W, H);
  const isL = document.body.classList.contains('light');
  const bgTrack = isL ? '#dce6f2' : '#162840';
  // zones: 5 חלקים — extreme fear, fear, neutral, greed, extreme greed
  const zones = [
    { from: 0,  to: 20,  color: '#ff3a5c' },
    { from: 20, to: 40,  color: '#f97316' },
    { from: 40, to: 60,  color: '#f59e0b' },
    { from: 60, to: 80,  color: '#5bc27f' },
    { from: 80, to: 100, color: '#00e87a' },
  ];
  const toAngle = v => Math.PI + (v / 100) * Math.PI; // 180°→360°
  // background arc
  ctx.beginPath(); ctx.arc(cx, cy, R, Math.PI, 2*Math.PI); ctx.arc(cx, cy, r, 2*Math.PI, Math.PI, true);
  ctx.fillStyle = bgTrack; ctx.fill();
  // colored zones
  zones.forEach(z => {
    ctx.beginPath();
    ctx.arc(cx, cy, R, toAngle(z.from), toAngle(z.to));
    ctx.arc(cx, cy, r, toAngle(z.to), toAngle(z.from), true);
    ctx.fillStyle = z.color + 'cc'; ctx.fill();
  });
  // needle
  const angle = toAngle(score);
  const nx = cx + Math.cos(angle) * (r + (R-r)/2);
  const ny = cy + Math.sin(angle) * (r + (R-r)/2);
  ctx.beginPath(); ctx.arc(nx, ny, 5, 0, 2*Math.PI);
  ctx.fillStyle = '#fff'; ctx.fill();
  ctx.strokeStyle = activeColor; ctx.lineWidth = 2; ctx.stroke();
}

// ── 3. YTD BAR CHART ─────────────────────────
function showLoadingState(sectionId, contentId, msg) {
  const sec = $(sectionId);
  if (sec) sec.style.display = 'block';
  const el = $(contentId);
  if (el) el.innerHTML = `<div style="text-align:center;color:var(--dim);font-size:11px;padding:16px;font-family:var(--mono)">
    <div class="mini-ring" style="margin:0 auto 8px"></div>${msg}</div>`;
}

function renderYTDChart() {
  const data = SECTORS.map(s => ({ sym: s.sym, name: s.name, ytd: (histMap[s.sym]||{}).ytd }))
    .filter(s => s.ytd != null).sort((a,b) => b.ytd - a.ytd);
  const sec = $('ytd-section');
  if (sec) sec.style.display = 'block';
  if (!data.length) return; // keep loading state
  const maxAbs = Math.max(...data.map(s => Math.abs(s.ytd)), 1);
  const isL = document.body.classList.contains('light');
  $('ytd-bars').innerHTML = data.map(s => {
    const pct = s.ytd;
    const barW = Math.abs(pct) / maxAbs * 100;
    const isPos = pct >= 0;
    const color = isPos ? (isL ? '#00904a' : '#00e87a') : (isL ? '#cc1a3a' : '#ff3a5c');
    const bgColor = isPos ? (isL ? 'rgba(0,144,74,.12)' : 'rgba(0,232,122,.1)') : (isL ? 'rgba(204,26,58,.12)' : 'rgba(255,58,92,.1)');
    return `<div class="ytd-row">
      <span class="ytd-sym">${s.sym}</span>
      <div class="ytd-bar-track">
        <div class="ytd-bar-fill" style="width:${barW}%;background:${color};background:linear-gradient(90deg,${bgColor},${color})"></div>
      </div>
      <span class="ytd-val" style="color:${color}">${pct>0?'+':''}${pct.toFixed(1)}%</span>
    </div>`;
  }).join('');
}

// ── 4. CORRELATION MATRIX ────────────────────
function pearson(a, b) {
  const n = Math.min(a.length, b.length);
  if (n < 3) return null;
  const ax = a.slice(-n), bx = b.slice(-n);
  const ma = ax.reduce((s,v)=>s+v,0)/n;
  const mb = bx.reduce((s,v)=>s+v,0)/n;
  let num=0, da=0, db=0;
  for(let i=0;i<n;i++){const x=ax[i]-ma,y=bx[i]-mb;num+=x*y;da+=x*x;db+=y*y;}
  return da&&db ? num/Math.sqrt(da*db) : null;
}
function renderCorrelationMatrix() {
  const syms = SECTORS.filter(s => histMap[s.sym]?.rawPrices?.length > 20);
  const sec = $('corr-section');
  if (sec) sec.style.display = 'block';
  if (syms.length < 3) return; // keep loading state until enough data
  const isL = document.body.classList.contains('light');
  // header row
  let html = `<table class="corr-table"><thead><tr><th>סקטור</th>${syms.map(s=>`<th>${s.sym}</th>`).join('')}</tr></thead><tbody>`;
  syms.forEach(row => {
    html += `<tr><td>${row.name}</td>`;
    syms.forEach(col => {
      const a = histMap[row.sym].rawPrices;
      const b = histMap[col.sym].rawPrices;
      if (row.sym === col.sym) {
        html += `<td style="background:var(--border2);color:var(--dim)">1.0</td>`;
      } else {
        const r = pearson(a, b);
        if (r == null) { html += `<td style="color:var(--dim)">–</td>`; return; }
        const v = parseFloat(r.toFixed(2));
        // צבע: ירוק = מתאם גבוה, אדום = הפוך, אפור = ניטרלי
        const intensity = Math.abs(v);
        let bg;
        if (v > 0.6) bg = isL ? `rgba(0,144,74,${intensity*.35})` : `rgba(0,232,122,${intensity*.25})`;
        else if (v < -0.2) bg = isL ? `rgba(204,26,58,${intensity*.35})` : `rgba(255,58,92,${intensity*.25})`;
        else bg = 'transparent';
        const col2 = v > 0.5 ? (isL?'#005828':'#00e87a') : v < -0.1 ? (isL?'#cc1a3a':'#ff3a5c') : (isL?'#4070a0':'#5070a0');
        html += `<td style="background:${bg};color:${col2}">${v.toFixed(2)}</td>`;
      }
    });
    html += '</tr>';
  });
  html += '</tbody></table>';
  $('corr-table-wrap').innerHTML = html;
}

// ── 5. BREADTH INDICATOR (200-day SMA) ───────
async function runBreadth() {
  const btn = document.querySelector('.breadth-btn');
  if (btn) { btn.textContent = 'סורק...'; btn.disabled = true; }
  $('breadth-big').textContent = '⏳';
  $('breadth-sub').textContent = 'מחשב ממוצע 200 יום...';

  const holdingsSet = new Set();
  Object.values(ETF_HOLDINGS).forEach(sector => sector.forEach(h => holdingsSet.add(h.s)));
  const symbols = Array.from(holdingsSet).slice(0, 60); // top 60 לביצועים

  let above = 0, total = 0;
  await Promise.all(symbols.map(async sym => {
    try {
      const cb = Math.floor(Date.now() / 10000);
      const url = `https://query1.finance.yahoo.com/v8/finance/chart/${sym.replace('/','–').replace('.','-')}?range=1y&interval=1d&cb=${cb}`;
      const r = await fetch(`${_proxyUrl}/?url=${encodeURIComponent(url)}`);
      if (!r.ok) return;
      const d = await r.json();
      const closes = d.chart?.result?.[0]?.indicators?.quote?.[0]?.close?.filter(p => p != null);
      if (!closes || closes.length < 20) return;
      const current = closes[closes.length - 1];
      const sma200 = closes.slice(-200).reduce((a,b)=>a+b,0) / Math.min(200, closes.length);
      total++;
      if (current > sma200) above++;
    } catch(e) {}
  }));

  if (btn) { btn.textContent = 'רענן'; btn.disabled = false; }
  if (!total) { $('breadth-big').textContent = '?'; return; }
  const pct = Math.round((above / total) * 100);
  const color = pct >= 60 ? 'var(--green)' : pct >= 40 ? '#f59e0b' : 'var(--red)';
  $('breadth-big').textContent = pct + '%';
  $('breadth-big').style.color = color;
  $('breadth-fill').style.width = pct + '%';
  $('breadth-fill').style.background = color;
  $('breadth-above').textContent = `${above} מניות מעל`;
  $('breadth-total').textContent = `מתוך ${total}`;
  $('breadth-sub').textContent = pct >= 60 ? '↑ שוק בריא' : pct >= 40 ? '≈ מעורב' : '↓ שוק חלש';
}

// ══════════════════════════════════════
// 5 NEW FEATURES
// ══════════════════════════════════════

// ── MACRO PANEL ──────────────────────
const MACRO_SYMS = [
  {sym:'EURUSD=X', id:'EURUSD', name:'EUR/USD', dec:4},
  {sym:'USDILS=X', id:'USDILS', name:'USD/ILS', dec:3},
  {sym:'CL=F',     id:'OIL',   name:'נפט',     dec:2},
  {sym:'NG=F',     id:'GAS',   name:'גז',       dec:3},
  {sym:'GC=F',     id:'GOLD',  name:'זהב',      dec:1},
  {sym:'^TNX',     id:'TNX',   name:'10Y',      dec:3},
];
async function fetchMacro() {
  try {
    const quotes = await fetchYahooQuotesBatch(MACRO_SYMS.map(m=>m.sym));
    // Store macro data in qmap so getSectorMacroTd can use it
    Object.assign(qmap, quotes);
    MACRO_SYMS.forEach(m => {
      const d = quotes[m.sym] || {};
      const priceEl = $(`mp-${m.id}`), chgEl = $(`mc-${m.id}`);
      if (!priceEl || !chgEl) return;
      priceEl.className = 'macro-price';
      chgEl.className = 'macro-chg';
      if (d.price == null) { priceEl.textContent='–'; chgEl.textContent=''; return; }
      priceEl.textContent = Number(d.price).toFixed(m.dec);
      const c = d.d1;
      if (c == null) { chgEl.textContent=''; return; }
      chgEl.textContent = (c>0?'+':'')+c.toFixed(2)+'%';
      chgEl.classList.add(c>0.05?'up':c<-0.05?'down':'flat');
    });
  } catch(e) { }
}

// ── VOLUME in fetchYahooQuotesBatch & renderSectors ──
// (volume added to qmap via existing batch — see update below)

// ── SECTOR ROTATION CHART ────────────
function renderRotationChart() {
  const data = SECTORS.map(s => ({
    sym: s.sym, name: s.name,
    x: histMap[s.sym]?.m1,  // 1-month return = X axis
    y: histMap[s.sym]?.w1,  // 1-week return  = Y axis
  })).filter(s => s.x != null && s.y != null);
  if (data.length < 4) return;

  const sec = $('rotation-section');
  if (sec) sec.style.display = 'block';

  const W=360, H=280, PAD=40;
  const cx=W/2, cy=H/2;
  const isL = document.body.classList.contains('light');

  // Scales
  const xs = data.map(d=>d.x), ys = data.map(d=>d.y);
  const xRange = Math.max(Math.abs(Math.min(...xs)), Math.abs(Math.max(...xs)), 2) * 1.3;
  const yRange = Math.max(Math.abs(Math.min(...ys)), Math.abs(Math.max(...ys)), 1) * 1.3;
  const scX = v => cx + (v/xRange) * (W/2-PAD);
  const scY = v => cy - (v/yRange) * (H/2-PAD);

  const colors = {
    'מוביל':  isL ? 'rgba(0,144,74,.12)' : 'rgba(0,232,122,.08)',
    'מחלש':   isL ? 'rgba(245,158,11,.12)' : 'rgba(245,158,11,.08)',
    'פיגור':  isL ? 'rgba(204,26,58,.12)' : 'rgba(255,58,92,.08)',
    'משפר':   isL ? 'rgba(0,112,192,.12)' : 'rgba(0,180,255,.08)',
  };
  const dotColors = ['#00e87a','#f59e0b','#ff3a5c','#00b4ff','#a78bfa','#fb923c','#34d399','#60a5fa','#f472b6','#facc15','#94a3b8'];
  const axisColor = isL ? '#b8c8de' : '#1e3550';
  const textColor = isL ? '#4070a0' : '#3d5470';

  let svg = `
    <!-- quadrant backgrounds -->
    <rect x="${cx}" y="${PAD}" width="${W/2-PAD}" height="${H/2-PAD}" fill="${colors['מוביל']}" rx="4"/>
    <rect x="${PAD}" y="${PAD}" width="${W/2-PAD}" height="${H/2-PAD}" fill="${colors['משפר']}" rx="4"/>
    <rect x="${cx}" y="${cy}" width="${W/2-PAD}" height="${H/2-PAD}" fill="${colors['מחלש']}" rx="4"/>
    <rect x="${PAD}" y="${cy}" width="${W/2-PAD}" height="${H/2-PAD}" fill="${colors['פיגור']}" rx="4"/>
    <!-- quadrant labels -->
    <text x="${W-PAD-6}" y="${PAD+14}" text-anchor="end" class="rq-label" fill="${isL?'#00904a':'#00e87a'}">מוביל ↗</text>
    <text x="${PAD+6}" y="${PAD+14}" text-anchor="start" class="rq-label" fill="${isL?'#0070c0':'#00b4ff'}">משפר ↑</text>
    <text x="${W-PAD-6}" y="${H-PAD-6}" text-anchor="end" class="rq-label" fill="${isL?'#b45309':'#f59e0b'}">מחלש ↘</text>
    <text x="${PAD+6}" y="${H-PAD-6}" text-anchor="start" class="rq-label" fill="${isL?'#cc1a3a':'#ff3a5c'}">פיגור ↙</text>
    <!-- axes -->
    <line x1="${PAD}" y1="${cy}" x2="${W-PAD}" y2="${cy}" stroke="${axisColor}" stroke-width="1"/>
    <line x1="${cx}" y1="${PAD}" x2="${cx}" y2="${H-PAD}" stroke="${axisColor}" stroke-width="1"/>
    <text x="${W-PAD+2}" y="${cy+4}" font-size="8" fill="${textColor}" font-family="var(--mono)">חודש+</text>
    <text x="${PAD-2}" y="${cy+4}" font-size="8" fill="${textColor}" font-family="var(--mono)" text-anchor="end">חודש-</text>
    <text x="${cx}" y="${PAD-4}" font-size="8" fill="${textColor}" font-family="var(--mono)" text-anchor="middle">שבוע+</text>
    <text x="${cx}" y="${H-PAD+10}" font-size="8" fill="${textColor}" font-family="var(--mono)" text-anchor="middle">שבוע-</text>`;

  data.forEach((s,i) => {
    const px = scX(s.x), py = scY(s.y);
    const col = dotColors[i % dotColors.length];
    svg += `<circle cx="${px.toFixed(1)}" cy="${py.toFixed(1)}" r="7" fill="${col}" fill-opacity=".85" class="r-dot">
      <title>${s.sym}: חודש ${s.x>0?'+':''}${s.x.toFixed(1)}% | שבוע ${s.y>0?'+':''}${s.y.toFixed(1)}%</title></circle>
    <text x="${px.toFixed(1)}" y="${(py-10).toFixed(1)}" font-size="9" font-weight="700" fill="${col}" text-anchor="middle" font-family="var(--mono)">${s.sym}</text>`;
  });

  svg += '</svg>';  // will be set as innerHTML, no need for closing
  $('rotation-svg').innerHTML = svg;
}

// ── MARKET INTERNALS ─────────────────
function renderMarketInternals() {
  const sectorData = SECTORS.map(s => ({
    sym: s.sym,
    d1: (qmap[s.sym]||{}).d1,
    fromHi: (histMap[s.sym]||{}).fromHi,
  })).filter(s => s.d1 != null && !isNaN(s.d1));

  if (!sectorData.length) return;

  const up = sectorData.filter(s => s.d1 > 0).length;
  const dn = sectorData.filter(s => s.d1 < 0).length;
  const avgD1 = sectorData.reduce((a,s) => a+s.d1, 0) / sectorData.length;
  const hiData = sectorData.filter(s => s.fromHi != null);
  const avgHi = hiData.length ? hiData.reduce((a,s) => a+s.fromHi, 0) / hiData.length : null;
  const pctUp = up / sectorData.length;

  const upColor = up >= dn ? 'var(--green)' : 'var(--red)';
  const avgColor = avgD1 >= 0 ? 'var(--green)' : 'var(--red)';

  $('mi-adv').textContent = `${up}/${dn}`;
  $('mi-adv').style.color = upColor;
  $('mi-adv-sub').textContent = `מתוך ${sectorData.length}`;

  $('mi-avg').textContent = (avgD1>0?'+':'')+avgD1.toFixed(2)+'%';
  $('mi-avg').style.color = avgColor;

  if (avgHi != null) {
    $('mi-hi52').textContent = avgHi.toFixed(1)+'%';
    $('mi-hi52').style.color = avgHi > -5 ? 'var(--green)' : avgHi > -15 ? '#f59e0b' : 'var(--red)';
  }

  $('mi-bar').style.width = (pctUp * 100) + '%';
  $('mi-bar').style.background = pctUp >= 0.7 ? 'var(--green)' : pctUp >= 0.5 ? '#5bc27f' : pctUp >= 0.3 ? '#f59e0b' : 'var(--red)';

  const mood = pctUp >= 0.7 ? '↑↑ שוק חיובי מאוד' : pctUp >= 0.5 ? '↗ מעורב-חיובי' : pctUp >= 0.3 ? '↘ מעורב-שלילי' : '↓ שוק שלילי';
  $('mi-mood').textContent = mood;
}

// ── EARNINGS CALENDAR (via spark earningsTimestamp) ─
const TOP_EARN_SYMS = ['AAPL','MSFT','NVDA','AMZN','GOOGL','META','TSLA','JPM','V','WMT',
  'JNJ','PFE','XOM','BAC','KO','NFLX','AMD','INTC','GS','DIS','COST','UNH','CVX','CRM','ADBE'];
const EARN_NAMES = {
  AAPL:'Apple',MSFT:'Microsoft',NVDA:'NVIDIA',AMZN:'Amazon',GOOGL:'Alphabet',
  META:'Meta',TSLA:'Tesla',JPM:'JPMorgan',V:'Visa',WMT:'Walmart',
  JNJ:'Johnson & Johnson',PFE:'Pfizer',XOM:'ExxonMobil',BAC:'Bank of America',
  KO:'Coca-Cola',NFLX:'Netflix',AMD:'AMD',INTC:'Intel',GS:'Goldman Sachs',
  DIS:'Disney',COST:'Costco',UNH:'UnitedHealth',CVX:'Chevron',CRM:'Salesforce',ADBE:'Adobe'
};

async function fetchEarningsCalendar() {
  try {
    const chunkSize = 10;
    const allMeta = {};
    // Batch fetch via spark (same endpoint we use for prices — no 401)
    for (let i = 0; i < TOP_EARN_SYMS.length; i += chunkSize) {
      const chunk = TOP_EARN_SYMS.slice(i, i + chunkSize);
      const symbolsStr = chunk.join(',');
      const cb = Math.floor(Date.now() / 10000);
      const url = `https://query1.finance.yahoo.com/v7/finance/spark?symbols=${symbolsStr}&range=1d&interval=1d&cb=${cb}`;
      const r = await fetch(`${_proxyUrl}/?url=${encodeURIComponent(url)}`);
      if (!r.ok) continue;
      const d = await r.json();
      (d.spark?.result || []).forEach(res => {
        const meta = res.response?.[0]?.meta;
        if (meta?.earningsTimestamp) allMeta[res.symbol] = meta;
      });
    }

    const now = new Date();
    const in14days = new Date(now.getTime() + 14*24*3600*1000);

    const upcoming = Object.entries(allMeta)
      .map(([sym, meta]) => {
        const ts = meta.earningsTimestamp;
        const date = new Date(ts * 1000);
        return { sym, date, ts };
      })
      .filter(e => e.date >= now && e.date <= in14days)
      .sort((a,b) => a.ts - b.ts);

    if (!upcoming.length) return;

    const sec = $('earnings-section');
    if (sec) sec.style.display = 'block';

    const today = now.toDateString();
    const tomorrow = new Date(now.getTime() + 86400000).toDateString();

    $('earnings-grid').innerHTML = upcoming.map(e => {
      const isToday = e.date.toDateString() === today;
      const isTom   = e.date.toDateString() === tomorrow;
      const dateStr = isToday ? 'היום' : isTom ? 'מחר' :
        e.date.toLocaleDateString('he-IL', {weekday:'short', month:'short', day:'numeric'});
      const cls = isToday ? 'today' : isTom ? 'tomorrow' : '';
      const dateCls = isToday ? 'today' : (isTom ? 'soon' : '');
      const q = qmap[e.sym] || {};
      const priceStr = q.price ? `$${Number(q.price).toFixed(2)}  ${q.d1!=null?(q.d1>0?'▲':'▼')+(Math.abs(q.d1).toFixed(1))+'%':''}` : '';
      return `<div class="earn-card ${cls}">
        <div style="display:flex;justify-content:space-between;align-items:center">
          <span class="earn-sym">${e.sym}</span>
          <span class="earn-date ${dateCls}">${dateStr}</span>
        </div>
        <div class="earn-name">${EARN_NAMES[e.sym]||e.sym}</div>
        ${priceStr?`<div class="earn-eps" style="font-family:var(--mono)">${priceStr}</div>`:''}
      </div>`;
    }).join('');
  } catch(e) { }
}

// ── MARKET INSIGHTS (auto, no API) ──────────────────────
function runInsights() {
  const grid = $('insights-grid');
  const btn = $('insights-btn');
  if (!grid) return;

  // ── נתוני בסיס ──
  const secData = SECTORS.map(s => ({
    sym:s.sym, name:s.name,
    d:qmap[s.sym]||{}, h:histMap[s.sym]||{}
  }));
  const validDay = secData.filter(s=>s.d.d1!=null&&!isNaN(s.d.d1));
  if (!validDay.length) { grid.innerHTML='<div class="insight-empty">טוען נתונים... נסה שוב בעוד רגע</div>'; return; }

  const avgD1 = validDay.reduce((a,s)=>a+s.d.d1,0)/validDay.length;
  const upCount = validDay.filter(s=>s.d.d1>0).length;
  const pctUp = upCount/validDay.length;
  const sorted = [...validDay].sort((a,b)=>b.d.d1-a.d.d1);
  const top = sorted[0], weak = sorted[sorted.length-1];
  const fg = calcFearGreed();
  const spy = qmap['SPY']||{}, qqq = qmap['QQQ']||{};
  const vix = qmap['VIXY']||{};

  // ── בניית כרטיסיות ──
  const cards = [];

  // 1. מגמת יום
  let moodType, moodTitle, moodBody;
  if (pctUp >= 0.7) {
    moodType='bull';
    moodTitle=`יום חיובי — ${upCount}/${validDay.length} סקטורים עולים`;
    moodBody=`ממוצע שינוי הסקטורים עומד על ${avgD1>0?'+':''}${avgD1.toFixed(2)}%. רוחב שוק חיובי מעיד על עוצמה אמיתית ולא רק מניות בודדות שמושכות. ${spy.d1!=null?`S&P 500 ${spy.d1>0?'+':''}${spy.d1.toFixed(2)}%.`:''}`;
  } else if (pctUp >= 0.45) {
    moodType='neutral';
    moodTitle=`יום מעורב — ${upCount}/${validDay.length} סקטורים חיוביים`;
    moodBody=`שוק מפוצל ללא כיוון ברור. ממוצע ${avgD1>0?'+':''}${avgD1.toFixed(2)}%. בשוק מעורב עדיף להמתין לפריצה ברורה לכיוון אחד לפני כניסה לפוזיציה.`;
  } else {
    moodType='bear';
    moodTitle=`יום שלילי — רק ${upCount}/${validDay.length} סקטורים חיוביים`;
    moodBody=`לחץ מכירות רחב. ממוצע ${avgD1.toFixed(2)}%. כשרוב הסקטורים יורדים, קשה למצוא מקלט — שקול הגדלת מזומן או גידור.`;
  }
  cards.push({type:moodType, title:moodTitle, body:moodBody});

  // 2. סקטור מוביל
  if (top) {
    const h = top.h;
    const isAccelerating = h.w1!=null && top.d.d1 > h.w1/5;
    cards.push({
      type:'bull',
      title:`${top.name} (${top.sym}) מוביל — ${top.d.d1>0?'+':''}${top.d.d1.toFixed(2)}% היום`,
      body:`${h.m1!=null?`חודשי: ${h.m1>0?'+':''}${h.m1.toFixed(1)}%. `:''}`
        +(h.fromHi!=null?`נמצא ${Math.abs(h.fromHi).toFixed(1)}% מתחת לשיא 52W. `:'')
        +(isAccelerating?'מומנטום מתגבר — יום חזק יחסית לקצב השבוע. ':'')
        +(h.ytd!=null?`מתחילת השנה: ${h.ytd>0?'+':''}${h.ytd.toFixed(1)}%.`:'')
    });
  }

  // 3. סקטור חלש / סיכון
  if (weak) {
    const h = weak.h;
    const nearLow = h.fromLo!=null && h.fromLo < 10;
    cards.push({
      type:'bear',
      title:`${weak.name} (${weak.sym}) הכי חלש — ${weak.d.d1.toFixed(2)}% היום`,
      body:`${h.m1!=null?`חודשי: ${h.m1>0?'+':''}${h.m1.toFixed(1)}%. `:''}`
        +(nearLow?`קרוב לשפל שנתי — ${h.fromLo.toFixed(1)}% מעל השפל. תוסיף לחץ מוכרים. `:'')
        +(h.ytd!=null?`YTD: ${h.ytd>0?'+':''}${h.ytd.toFixed(1)}%. `:'')
        +'הימנע מכניסה נגד הכיוון בסקטור חלש.'
    });
  }

  // 4. VIX / סנטימנט
  if (vix.d1!=null) {
    const vixUp = vix.d1 > 3;
    const vixDown = vix.d1 < -3;
    cards.push({
      type: vixUp?'bear':vixDown?'bull':'neutral',
      title: vixUp?`VIX עולה ${vix.d1>0?'+':''}${vix.d1.toFixed(1)}% — תנודתיות עולה`
            :vixDown?`VIX יורד ${vix.d1.toFixed(1)}% — שוק רגוע`
            :`VIX יציב (${vix.d1>0?'+':''}${vix.d1.toFixed(1)}%)`,
      body: vixUp?`עלייה ב-VIX מסמנת חרדה בשוק. זה הזמן לצמצם סיכון, לא להגדיל. אופציות יקרות יותר כעת.`
           :vixDown?`ירידת VIX מסמנת רגיעה. סביבה נוחה לפוזיציות ארוכות. אופציות זולות יחסית — הזדמנות ל-Covered Calls.`
           :`תנודתיות נמוכה יחסית. שוק ב"המתנה". עדיף להמתין לזרז (נתון כלכלי, Earnings) לפני כניסה.`
    });
  }

  // 5. המלצה טקטית — FG + Breadth
  let tacticalType, tacticalTitle, tacticalBody;
  if (fg.total >= 70 && pctUp < 0.4) {
    tacticalType='bear'; tacticalTitle='סנטימנט גבוה + ירידות — זהירות!';
    tacticalBody='שוק אופטימי מדי בזמן שמרבית הסקטורים יורדים. פיזור שלילי עלול לקדים ירידה חדה. שקול הפחתת חשיפה.';
  } else if (fg.total <= 30 && pctUp > 0.6) {
    tacticalType='bull'; tacticalTitle='פחד קיצוני + רוב עולה — הזדמנות?';
    tacticalBody='שוק פסימי בעוד שרוב הסקטורים עולים. לרוב זהו סיגנל Contrarian חיובי. בדוק כניסה מבוקרת עם Stop Loss.';
  } else if (pctUp >= 0.7 && avgD1 > 0.5) {
    tacticalType='bull'; tacticalTitle='מומנטום חיובי רחב — Trend Following';
    tacticalBody=`${upCount} סקטורים עולים עם ממוצע +${avgD1.toFixed(2)}%. שוק עם מומנטום חיובי נוטה להמשיך. הצטרף למגמה עם Trailing Stop.`;
  } else {
    tacticalType='info'; tacticalTitle='המתן לאיתות ברור';
    tacticalBody='נתוני השוק כרגע מעורבים. אין כיוון דומיננטי ברור. עדיף לשבת על הגדר עד לפריצה ברורה — שמור תחמושת למצב ברור יותר.';
  }
  cards.push({type:tacticalType, title:tacticalTitle, body:tacticalBody});

  // ── רינדור ──
  const icons = {
    bull:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    bear:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6"/><polyline points="17 18 23 18 23 12"/></svg>',
    neutral:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>',
    info:'<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="14" height="14"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>',
  };
  grid.innerHTML = cards.map(c=>`
    <div class="insight-card">
      <div class="insight-card-hdr ${c.type}">${icons[c.type]||''}${c.title}</div>
      <div class="insight-card-body">${c.body}</div>
    </div>`).join('');

  // עדכון כפתור
  if(btn) btn.innerHTML = '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" width="13" height="13"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg> עדכן';
}

// ── PDF EXPORT ────────────────────────
function exportDashboardPDF() {
  const now = new Date();
  const dateLabel = now.toLocaleDateString('he-IL', {year:'numeric', month:'long', day:'numeric'});
  const timeLabel = now.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'});

  // נתוני מדדים
  const indicesRows = [...INDICES, ...OTHER].map(s => {
    const d = qmap[s.sym]||{};
    const chgColor = (d.d1||0)>0 ? '#059669' : (d.d1||0)<0 ? '#dc2626' : '#6b7280';
    return `<tr>
      <td style="font-weight:700">${s.name}</td>
      <td style="font-family:monospace;font-weight:600">${s.sym}</td>
      <td style="font-family:monospace">${d.price ? fmtPrice(d.price,s.sym) : '–'}</td>
      <td style="font-family:monospace;color:${chgColor};font-weight:700">${d.d1!=null?(d.d1>0?'+':'')+d.d1.toFixed(2)+'%':'–'}</td>
    </tr>`;
  }).join('');

  // נתוני סקטורים
  const sectorRows = SECTORS.map(s => {
    const d = qmap[s.sym]||{}, h = histMap[s.sym]||{};
    const chgColor = (d.d1||0)>0 ? '#059669' : (d.d1||0)<0 ? '#dc2626' : '#6b7280';
    const vals = [d.d1,h.w1,h.m1,h.m3,h.m6,h.y1];
    const a = avg(vals);
    const cell = v => v!=null ? `<td style="font-family:monospace;color:${v>0?'#059669':v<0?'#dc2626':'#6b7280'};font-weight:${Math.abs(v)>3?'700':'400'}">${v>0?'+':''}${v.toFixed(1)}%</td>` : '<td style="color:#d1d5db">–</td>';
    return `<tr>
      <td style="font-weight:700">${s.name} <span style="font-family:monospace;color:#9ca3af;font-size:.75rem">${s.sym}</span></td>
      ${cell(d.d1)}${cell(h.w1)}${cell(h.m1)}${cell(h.m3)}${cell(h.m6)}${cell(h.y1)}
      ${a!=null?`<td style="font-family:monospace;font-weight:700;color:${a>0?'#059669':a<0?'#dc2626':'#6b7280'}">${a>0?'+':''}${a.toFixed(1)}%</td>`:'<td>–</td>'}
    </tr>`;
  }).join('');

  // תובנות
  const insightCards = document.querySelectorAll('.insight-card');
  const insightsHtml = insightCards.length ? Array.from(insightCards).map(card => {
    const hdr = card.querySelector('.insight-card-hdr');
    const body = card.querySelector('.insight-card-body');
    const type = hdr?.className.includes('bull')?'bull':hdr?.className.includes('bear')?'bear':'neutral';
    const color = type==='bull'?'#059669':type==='bear'?'#dc2626':'#d97706';
    return `<div style="padding:10px 0;border-bottom:1px solid #f3f4f6">
      <div style="font-size:.8rem;font-weight:700;color:${color};margin-bottom:4px">${hdr?.textContent?.trim()||''}</div>
      <div style="font-size:.78rem;color:#374151;line-height:1.5">${body?.textContent?.trim()||''}</div>
    </div>`;
  }).join('') : '<div style="color:#9ca3af;font-size:.8rem">אין תובנות</div>';

  // FG
  const fg = calcFearGreed();
  const fgColor = fg.total>=70?'#059669':fg.total>=45?'#d97706':'#dc2626';
  const fgLabel = fg.total>=70?'חמדנות':fg.total>=55?'חמדנות':fg.total>=45?'ניטרלי':fg.total>=25?'פחד':'פחד קיצוני';

  const html = `<!DOCTYPE html><html dir="rtl" lang="he"><head>
<meta charset="UTF-8"/>
<title>דשבורד שוק אמריקאי — ${dateLabel}</title>
<link href="https://fonts.googleapis.com/css2?family=Rubik:wght@400;500;700;800&display=swap" rel="stylesheet"/>
<style>
*{margin:0;padding:0;box-sizing:border-box}
body{font-family:'Rubik',sans-serif;background:#fff;color:#111827;font-size:13px;direction:rtl}
.page{max-width:900px;margin:0 auto;padding:32px 28px}
.hdr{display:flex;justify-content:space-between;align-items:flex-start;margin-bottom:24px;padding-bottom:16px;border-bottom:2px solid #050d1a}
.hdr-title{font-size:1.4rem;font-weight:800;color:#050d1a}
.hdr-sub{font-size:.78rem;color:#6b7280;margin-top:3px}
.hdr-meta{text-align:left;font-size:.75rem;color:#6b7280;line-height:1.7}
.pills{display:flex;gap:8px;margin-bottom:20px;flex-wrap:wrap}
.pill{background:#f9fafb;border:1px solid #e5e7eb;border-radius:6px;padding:6px 14px;font-size:.78rem}
.pill b{font-size:1rem;font-weight:800;display:block}
.section-title{font-size:.8rem;font-weight:700;text-transform:uppercase;letter-spacing:.8px;color:#6b7280;margin:20px 0 8px;display:flex;align-items:center;gap:6px}
.section-title::before{content:'';width:3px;height:12px;background:#050d1a;border-radius:2px;display:inline-block}
table{width:100%;border-collapse:collapse;margin-bottom:16px;font-size:.8rem}
th{background:#f3f4f6;color:#374151;font-weight:600;padding:7px 10px;text-align:right;border:1px solid #e5e7eb;font-size:.72rem;text-transform:uppercase;letter-spacing:.5px}
td{padding:7px 10px;border:1px solid #f3f4f6;text-align:right;vertical-align:middle}
tr:nth-child(even) td{background:#fafafa}
.action-bar{position:fixed;bottom:0;left:0;right:0;background:#050d1a;padding:12px 24px;display:flex;gap:10px;justify-content:center}
.action-btn{background:#00b4ff;color:#000;border:none;padding:10px 24px;border-radius:6px;font-weight:700;cursor:pointer;font-family:'Rubik',sans-serif;font-size:.85rem}
.action-btn.sec{background:rgba(255,255,255,.15);color:#fff}
@media print{.action-bar{display:none}body{font-size:11px}.page{padding:16px}}
</style></head><body>
<div class="page">
  <div class="hdr">
    <div>
      <div class="hdr-title">דשבורד שוק אמריקאי</div>
      <div class="hdr-sub">Yahoo Finance · Real-Time Market Data</div>
    </div>
    <div class="hdr-meta">
      <div><strong>תאריך:</strong> ${dateLabel}</div>
      <div><strong>שעה:</strong> ${timeLabel}</div>
    </div>
  </div>

  <div class="pills">
    <div class="pill"><b style="color:${fgColor}">${fg.total}</b>Fear & Greed</div>
    <div class="pill"><b style="color:#050d1a">${SECTORS.filter(s=>(qmap[s.sym]||{}).d1>0).length}/${SECTORS.length}</b>סקטורים חיוביים</div>
    <div class="pill"><b style="color:${(qmap['SPY']||{}).d1>0?'#059669':'#dc2626'}">${(qmap['SPY']||{}).d1!=null?((qmap['SPY'].d1>0?'+':'')+qmap['SPY'].d1.toFixed(2)+'%'):'–'}</b>S&P 500</div>
    <div class="pill"><b style="color:${(qmap['QQQ']||{}).d1>0?'#059669':'#dc2626'}">${(qmap['QQQ']||{}).d1!=null?((qmap['QQQ'].d1>0?'+':'')+qmap['QQQ'].d1.toFixed(2)+'%'):'–'}</b>נאסד"ק</div>
  </div>

  <div class="section-title">מדדים מובילים</div>
  <table><thead><tr><th>שם</th><th>סמל</th><th>מחיר</th><th>יום %</th></tr></thead><tbody>${indicesRows}</tbody></table>

  <div class="section-title" style="page-break-before:auto">ביצועי סקטורים</div>
  <table><thead><tr><th>סקטור</th><th>יום</th><th>שבוע</th><th>חודש</th><th>3 חד׳</th><th>6 חד׳</th><th>שנה</th><th>ממוצע</th></tr></thead><tbody>${sectorRows}</tbody></table>

  <div class="section-title" style="page-break-before:always">תובנות שוק</div>
  <div style="background:#f9fafb;border:1px solid #e5e7eb;border-radius:8px;padding:14px 16px">${insightsHtml}</div>

  <div style="margin-top:32px;text-align:center;font-size:.7rem;color:#9ca3af;border-top:1px solid #f3f4f6;padding-top:12px">
    דשבורד שוק אמריקאי · הופק ${dateLabel} בשעה ${timeLabel} · לצורך מידע בלבד, אינו מהווה ייעוץ השקעות
  </div>
</div>
<div class="action-bar">
  <button class="action-btn" onclick="window.print()"><svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="vertical-align:-2px"><polyline points="6 9 6 2 18 2 18 9"/><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"/><rect x="6" y="14" width="12" height="8"/></svg> הדפס / שמור PDF</button>
  <button class="action-btn sec" onclick="window.close()">← סגור</button>
</div>
</body></html>`;

  // iframe print — iOS safe (same pattern as Budgy)
  const existing = document.getElementById('pdf-iframe');
  if (existing) existing.remove();
  const iframe = document.createElement('iframe');
  iframe.id = 'pdf-iframe';
  iframe.style.cssText = 'position:fixed;right:-10000px;bottom:-10000px;width:100%;height:100%;border:none';
  document.body.appendChild(iframe);

  let done = false;
  function triggerPrint() {
    if (done) return; done = true;
    setTimeout(() => {
      iframe.contentWindow.focus();
      iframe.contentWindow.print();
    }, 2500);
  }
  iframe.onload = triggerPrint;
  setTimeout(triggerPrint, 4000); // iOS fallback

  const doc = iframe.contentWindow.document;
  doc.open(); doc.write(html); doc.close();
}

// ── MACRO CONTEXT (FRED) ──────────────
const MACRO_SERIES = {
  DGS10:      {name:'10Y Treasury',    he:'תשואת אג"ח 10 שנים — ריבית בסיס לכל נכסי הסיכון',     suffix:'%'},
  FEDFUNDS:   {name:'Fed Funds Rate',  he:'ריבית הפד — עולה=לחץ על מכפילים, יורדת=תמיכה בשוק',  suffix:'%'},
  T10Y2Y:     {name:'Yield Curve',     he:'פרש תשואות 10Y-2Y — שלילי=אזהרת מיתון, חיובי=נורמלי', suffix:'%'},
  DCOILWTICO: {name:'WTI Crude Oil',   he:'נפט גולמי — משפיע על עלויות ואינפלציה',               suffix:'$'},
  MORTGAGE30US:{name:'Mortgage 30Y',  he:'ריבית משכנתא 30 שנה — לחץ על שוק הנדל"ן',             suffix:'%'},
  UMCSENT:    {name:'Consumer Sentiment',he:'סנטימנט צרכני — מחזק את הצריכה הפרטית',             suffix:''},
  VIXCLS:     {name:'VIX',            he:'מדד פחד — מעל 25=תנודתיות גבוהה, מתחת 15=שקט',        suffix:''},
};

// Map sector ETF → relevant FRED series
const SECTOR_MACRO = {
  XLK:  ['DGS10','FEDFUNDS','VIXCLS'],
  XLF:  ['T10Y2Y','FEDFUNDS','DGS10'],
  XLE:  ['DCOILWTICO','FEDFUNDS','DGS10'],
  XLRE: ['MORTGAGE30US','DGS10','FEDFUNDS'],
  XLY:  ['UMCSENT','FEDFUNDS','DGS10'],
  XLP:  ['UMCSENT','FEDFUNDS','DGS10'],
  XLC:  ['DGS10','FEDFUNDS','VIXCLS'],
  XLI:  ['DGS10','FEDFUNDS','DCOILWTICO'],
  XLB:  ['DCOILWTICO','DGS10','FEDFUNDS'],
  XLU:  ['DGS10','FEDFUNDS','MORTGAGE30US'],
  XLV:  ['DGS10','FEDFUNDS','VIXCLS'],
};
const DEFAULT_MACRO = ['DGS10','FEDFUNDS','VIXCLS'];

function getStockSector(sym) {
  for (const [etf, holdings] of Object.entries(ETF_HOLDINGS)) {
    if (holdings.some(h => h.s === sym)) return etf;
  }
  return null;
}

async function fetchMacroContext(sym) {
  const sector  = getStockSector(sym);
  const series  = SECTOR_MACRO[sector] || DEFAULT_MACRO;
  const results = {};
  await Promise.allSettled(series.map(async id => {
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=3&observation_start=2020-01-01`;
      const r = await fetch(_proxyUrl + '/?url=' + encodeURIComponent(url));
      if (!r.ok) return;
      const d = await r.json();
      const obs = (d.observations || []).filter(o => o.value !== '.');
      if (obs.length >= 1) {
        const cur  = parseFloat(obs[0].value);
        const prev = obs.length >= 2 ? parseFloat(obs[1].value) : null;
        results[id] = {cur, prev, date: obs[0].date};
      }
    } catch(e) {}
  }));
  return {series, results, sector};
}

function renderMacroContext(macroData) {
  const {series, results, sector} = macroData;
  const items = series.map(id => {
    const info = MACRO_SERIES[id];
    const obs  = results[id];
    if (!obs) return null;
    const valStr = (info.suffix === '$' ? '$' : '') + obs.cur.toFixed(info.suffix==='%'?2:1) + (info.suffix==='%'?' %':'');
    let chgHtml = '';
    if (obs.prev != null) {
      const diff = obs.cur - obs.prev;
      const cls  = Math.abs(diff) < 0.01 ? 'flat' : diff > 0 ? 'up' : 'down';
      chgHtml = `<div class="sp-macro-item-chg ${cls}">${diff>0?'+':''}${diff.toFixed(2)} מהפרסום הקודם</div>`;
    }
    return `<div class="sp-macro-item">
      <div class="sp-macro-item-name">${info.name}</div>
      <div class="sp-macro-item-val">${valStr}</div>
      ${chgHtml}
      <div class="sp-macro-item-he">${info.he}</div>
    </div>`;
  }).filter(Boolean).join('');

  if (!items) return '';
  const sectorLabel = sector ? `<div class="sp-macro-sector">סקטור: ${sector}</div>` : '';
  return `<div class="sp-macro">
    ${sectorLabel}<div class="sp-macro-grid">${items}</div>
  </div>`;
}

// ── ECONOMIC CALENDAR — FRED API (Federal Reserve St. Louis) ──
const FRED_KEY = 'aa7f8d740d367d9ff2354194b5329fbe';

// FOMC dates — only these aren't in FRED (Fed publishes annually)
const FOMC_DATES = {
  2025: ['2025-01-29','2025-03-19','2025-05-07','2025-06-18','2025-07-30','2025-09-17','2025-10-29','2025-12-10'],
  2026: ['2026-01-28','2026-03-18','2026-04-29','2026-06-17','2026-07-29','2026-09-16','2026-11-04','2026-12-09'],
};

const FRED_RELEASES = [
  {id:10,  name:'CPI Report',              he:'מדד המחירים לצרכן — מודד אינפלציה. גבוה מהצפוי = שוק יורד (חשש מריבית גבוהה).', impact:'high',   time:'08:30 ET', url:'https://www.bls.gov/cpi/'},
  {id:50,  name:'NFP — Non-Farm Payrolls', he:'שכר חוץ-חקלאי — כמה משרות נוצרו. מדד עבודה חזק = כלכלה חזקה (לפעמים שוק יורד מחשש לריבית).', impact:'high',   time:'08:30 ET', url:'https://www.bls.gov/news.release/empsit.toc.htm'},
  {id:54,  name:'PCE Price Index',         he:'הוצאות צריכה אישית — מדד האינפלציה המועדף על הפד. משפיע ישירות על החלטות ריבית.',  impact:'high',   time:'08:30 ET', url:'https://www.bea.gov/data/personal-consumption-expenditures-price-index'},
  {id:53,  name:'GDP (Advance)',           he:'תוצר מקומי גולמי — גודל הכלכלה האמריקאית. שני רבעונים שליליים = מיתון.',           impact:'high',   time:'08:30 ET', url:'https://www.bea.gov/data/gdp/gross-domestic-product'},
  {id:31,  name:'PPI Report',             he:'מדד מחירי יצרנים — אינפלציה מצד ההיצע. מקדים לעיתים את ה-CPI.',                   impact:'medium', time:'08:30 ET', url:'https://www.bls.gov/ppi/'},
  {id:84,  name:'Retail Sales',           he:'מכירות קמעונאיות — כוח הצרכן. 70% מהכלכלה האמריקאית מבוססת על צריכה.',            impact:'medium', time:'08:30 ET', url:'https://www.census.gov/retail/index.html'},
  {id:180, name:'Initial Jobless Claims', he:'תביעות אבטלה שבועיות — בריאות שוק העבודה. עלייה = התרופפות.',                      impact:'medium', time:'08:30 ET', url:'https://www.dol.gov/ui/data.pdf'},
];

async function fetchEconCalendarFRED() {
  const today   = new Date();
  const start   = today.toISOString().slice(0,10);
  const end     = new Date(today.getTime() + 35*24*3600*1000).toISOString().slice(0,10);
  const events  = [];

  await Promise.allSettled(FRED_RELEASES.map(async rel => {
    try {
      const url = `https://api.stlouisfed.org/fred/release/dates?release_id=${rel.id}&api_key=${FRED_KEY}&file_type=json&sort_order=asc&realtime_start=${start}&realtime_end=${end}&include_release_dates_with_no_data=true`;
      const r = await fetch(_proxyUrl + '/?url=' + encodeURIComponent(url));
      if (!r.ok) return;
      const d = await r.json();
      (d.release_dates||[]).forEach(rd => {
        if (rd.date >= start && rd.date <= end)
          events.push({date:rd.date, name:rel.name, he:rel.he, impact:rel.impact, time:rel.time, url:rel.url, d:new Date(rd.date+'T12:00:00')});
      });
    } catch(e) {}
  }));

  // Add FOMC
  const y = today.getFullYear();
  [...(FOMC_DATES[y]||[]), ...(FOMC_DATES[y+1]||[])].forEach(date => {
    if (date >= start && date <= end)
      events.push({date, name:'FOMC Decision', he:'ועדת הריבית (פד) — קובעת את שיעור הריבית. עלייה=לחץ על מניות, ירידה=דחיפה לשוק.', impact:'high', time:'14:00 ET', url:'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm', d:new Date(date+'T12:00:00')});
  });

  return events.sort((a,b) => a.date.localeCompare(b.date));
}

async function renderEconCalendar() {
  const wrap = $('econ-wrap');
  if (!wrap) return;
  wrap.innerHTML = '<div class="modal-loading" style="padding:20px;font-size:11px"><div class="mini-ring" style="margin:0 auto 8px"></div>טוען מ-FRED...</div>';

  const today   = new Date();
  const todayD  = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const past3   = new Date(todayD.getTime() - 3*24*3600*1000);
  const DAYS_HE   = ['א׳','ב׳','ג׳','ד׳','ה׳','ו׳','ש׳'];
  const MONTHS_EN = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

  let events = await fetchEconCalendarFRED();
  events = events.filter(e => e.d >= past3);

  if (!events.length) {
    wrap.innerHTML = '<div style="padding:20px;text-align:center;color:var(--dim);font-size:12px">אין אירועים ב-30 הימים הקרובים</div>';
    return;
  }

  wrap.innerHTML = events.map(e => {
    const isToday = e.d.toDateString() === todayD.toDateString();
    const isPast  = e.d < todayD;
    const cls = isPast ? 'econ-past' : isToday ? 'econ-today-row' : '';
    const href = e.url || '#';
    return `<a class="econ-row ${cls}" href="${href}" onclick="if(this.href!=='#'){window.open('${href}','_blank','noopener,noreferrer');return false;}" style="text-decoration:none;color:inherit;display:flex;cursor:pointer">
      <div class="econ-date-col">
        <div class="econ-day">${e.d.getDate()}</div>
        <div class="econ-mon">${MONTHS_EN[e.d.getMonth()]}</div>
        <div class="econ-dow">${DAYS_HE[e.d.getDay()]}</div>
      </div>
      <div class="econ-body">
        <div class="econ-name">${e.name}${isToday?' <span style="color:var(--blue);font-size:9px">• היום</span>':''}</div>
        <div class="econ-he">${e.he}</div>
        <div class="econ-impact">
          <div class="econ-dot ${e.impact}"></div>
          <span class="econ-impact-lbl">${e.impact==='high'?'השפעה גבוהה':'בינונית'}</span>
        </div>
      </div>
      <div class="econ-time">${e.time}</div>
    </a>`;
  }).join('') + '<div style="padding:6px 12px 8px;text-align:left;font-size:9px;color:var(--dim);opacity:.6">מקור: FRED — Federal Reserve Bank of St. Louis</div>';
}

// ── SECTOR MACRO COLUMN (uses existing qmap data — no extra fetch) ──
const FRED_COL_KEY = 'aa7f8d740d367d9ff2354194b5329fbe';
const fredColData = {}; // {seriesId: {cur, prev}}

const SECTOR_MACRO_COL = {
  XLK:  {id:'DGS10',        label:'10Y',    fmt:v=>`${v.toFixed(2)}%`},
  XLF:  {id:'DGS10',        label:'10Y',    fmt:v=>`${v.toFixed(2)}%`},
  XLE:  {id:'DCOILWTICO',   label:'נפט',   fmt:v=>`$${v.toFixed(1)}`},
  XLRE: {id:'DGS10',        label:'10Y',    fmt:v=>`${v.toFixed(2)}%`},
  XLY:  {id:'DCOILWTICO',   label:'נפט',   fmt:v=>`$${v.toFixed(1)}`},
  XLP:  {id:'DGS10',        label:'10Y',    fmt:v=>`${v.toFixed(2)}%`},
  XLC:  {id:'DGS10',        label:'10Y',    fmt:v=>`${v.toFixed(2)}%`},
  XLI:  {id:'DCOILWTICO',   label:'נפט',   fmt:v=>`$${v.toFixed(1)}`},
  XLB:  {id:'DCOILWTICO',   label:'נפט',   fmt:v=>`$${v.toFixed(1)}`},
  XLU:  {id:'DGS10',        label:'10Y',    fmt:v=>`${v.toFixed(2)}%`},
  XLV:  {id:'DGS10',        label:'10Y',    fmt:v=>`${v.toFixed(2)}%`},
};

async function fetchFredColData() {
  const needed = [...new Set(Object.values(SECTOR_MACRO_COL).map(v=>v.id))];
  await Promise.allSettled(needed.map(async id => {
    try {
      const url = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${FRED_COL_KEY}&file_type=json&sort_order=desc&limit=3&observation_start=2020-01-01`;
      const r = await fetch(_proxyUrl+'/?url='+encodeURIComponent(url));
      if (!r.ok) return;
      const d = await r.json();
      const obs = (d.observations||[]).filter(o=>o.value!='.');
      if (obs.length) fredColData[id] = {cur:parseFloat(obs[0].value), prev:obs.length>1?parseFloat(obs[1].value):null};
    } catch(e){}
  }));
}

function getSectorMacroTd(sym) {
  const conf = SECTOR_MACRO_COL[sym];
  if (!conf) return '<td style="border-left:2px solid var(--border2)"></td>';
  const obs = fredColData[conf.id];
  if (!obs) return '<td style="color:var(--dim);font-size:9px;border-left:2px solid var(--border2)">–</td>';
  const val = conf.fmt(obs.cur);
  const noChg = obs.prev==null || Math.abs(obs.cur-obs.prev)<0.001;
  const arrow = noChg ? '' : obs.cur>obs.prev ? ' ▲' : ' ▼';
  const clr = noChg ? 'var(--dim)' : obs.cur>obs.prev ? 'var(--red)' : 'var(--green)';
  return `<td style="font-family:var(--mono);font-size:9px;white-space:nowrap;border-left:2px solid var(--border2);color:${clr}" title="${conf.label}: ${val}">${val}${arrow}</td>`;
}

// Auto-start if key saved
startMarketClock(); // שעון שוק פועל תמיד, גם לפני לוגין
if (_proxyUrl) {
  init();
} else {
  showScreen('screen-key');
}
