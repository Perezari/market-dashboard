// ============================================================
//  news-sources.js — קובץ הגדרות מקורות חדשות
//  ערוך כאן בלבד. app.js נגע לא יגע.
//
//  פורמט כל מקור:
//  { name: 'שם תצוגה', url: 'כתובת RSS/Atom' }
//
//  ✅ תומך ב: RSS 2.0 / Atom / rss.app feeds (כולל תמונות)
//  ✅ כשל = מדולג בשקט, שאר המקורות ממשיכים
// ============================================================

// ── עברית ────────────────────────────────────────────────────
const HEBREW_NEWS_FEEDS = [
  { name: 'וואלה כסף',      url: 'https://rss.walla.co.il/feed/557'   },
  { name: 'כסף עולמי',      url: 'https://rss.walla.co.il/feed/112'   },
  { name: 'קריפטו',         url: 'https://rss.walla.co.il/feed/13373' },
  { name: 'וואלה TECH',     url: 'https://rss.walla.co.il/feed/4000'  },
  { name: 'חדשות בעולם',    url: 'https://rss.walla.co.il/feed/2'     },
  { name: 'דעות כסף',       url: 'https://rss.walla.co.il/feed/4997'  },
  { name: 'רשתות חברתיות',  url: 'https://rss.walla.co.il/feed/13019' },
];

// ── English ───────────────────────────────────────────────────
const EN_NEWS_FEEDS = [
  { name: 'Benzinga Markets',       url: 'https://rss.app/feeds/6xoFWSgjRpOcDBAX.xml' },
  { name: 'Benzinga Financial',     url: 'https://rss.app/feeds/GlMwezZhdiLNXGNT.xml' },
  { name: 'Benzinga Long Ideas',    url: 'https://rss.app/feeds/djJ62cwc1d2vpH8w.xml' },
  { name: 'Benzinga Short Ideas',   url: 'https://rss.app/feeds/tvj0z6mPGCJUhSD7.xml' },
  // ── הוסף כאן מקורות אנגליים נוספים ──
  // { name: 'MarketWatch', url: 'https://feeds.content.dowjones.io/public/rss/mw_realtimeheadlines' },
  // { name: 'CNBC Markets', url: 'https://search.cnbc.com/rs/search/combinedcms/view.xml?partnerId=wrss01&id=20910258' },
  // { name: 'Reuters', url: 'https://feeds.reuters.com/reuters/businessNews' },
  // { name: 'SEC 8-K', url: 'https://www.sec.gov/cgi-bin/browse-edgar?action=getcurrent&type=8-K&dateb=&owner=include&count=10&output=atom' },
  // { name: 'Federal Reserve', url: 'https://www.federalreserve.gov/feeds/press_all.xml' },
];