// ============================================================
//  news-sources.js — קובץ הגדרות מקורות חדשות
//  ערוך כאן בלבד. app.js נגע לא יגע.
// ============================================================

// ── עברית ────────────────────────────────────────────────────
const HEBREW_NEWS_FEEDS = [
  { name: 'וואלה כסף',     url: 'https://rss.walla.co.il/feed/557',   domain: 'walla.co.il' },
  { name: 'כסף עולמי',     url: 'https://rss.walla.co.il/feed/112',   domain: 'walla.co.il' },
  { name: 'קריפטו',        url: 'https://rss.walla.co.il/feed/13373', domain: 'walla.co.il' },
  { name: 'וואלה TECH',    url: 'https://rss.walla.co.il/feed/4000',  domain: 'walla.co.il' },
  { name: 'דעות כסף',      url: 'https://rss.walla.co.il/feed/4997',  domain: 'walla.co.il' },
  { name: 'רשתות חברתיות', url: 'https://rss.walla.co.il/feed/13019', domain: 'walla.co.il' },
];

// ── English ───────────────────────────────────────────────────
const EN_NEWS_FEEDS = [
  { name: 'Benzinga Markets',   url: 'https://rss.app/feeds/6xoFWSgjRpOcDBAX.xml', domain: 'benzinga.com' },
  { name: 'Benzinga Financial', url: 'https://rss.app/feeds/GlMwezZhdiLNXGNT.xml', domain: 'benzinga.com' },
  // { name: 'MarketWatch',    url: 'https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines', domain: 'marketwatch.com' },
  // { name: 'CNBC Markets',   url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258', domain: 'cnbc.com' },
  // { name: 'Reuters',        url: 'https://feeds.reuters.com/reuters/businessNews', domain: 'reuters.com' },
  // { name: 'SEC 8-K',        url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&dateb=&owner=include&count=10&output=atom', domain: 'sec.gov' },
  // { name: 'Federal Reserve',url: 'https://www.federalreserve.gov/feeds/press_all.xml', domain: 'federalreserve.gov' },
];
