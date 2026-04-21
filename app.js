/* ═══════════════════════════════════════════════════════════
   app.js — consolidated JavaScript
   Order:
     [1] Data: ETF_HOLDINGS, news feeds (hebrew+english)
     [2] Core app.js (dashboard logic, data fetch, sector render)
     [3] Dashboard inline script (login overlay, AI brief boot)
     [4] Macro module (FRED dashboard) — IIFE-wrapped
     [5] Advisor module (stock advisor scanner) — IIFE-wrapped
     [6] Sector Performance rewrite (overrides global renders)
     [7] Router: hash-based, #/dashboard | #/macro | #/advisor
   ═══════════════════════════════════════════════════════════ */

/* ──────────── [1] DATA: news feeds + ETF holdings ──────────── */
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

// ============================================================
//  etf-holdings.js — נתוני אחזקות ETF סקטוריאליות
//  מקור: SPDR / State Street • Q1 2025
//  לעדכון: שנה את המשקלים (w) בהתאם לדוח הרבעוני החדש
//  שדות: s = סמל, n = שם, w = משקל באחוזים
// ============================================================

const ETF_HOLDINGS = {
  XLK: [
    {s:'NVDA',n:"Nvidia",w:7.57},{s:'AAPL',n:"Apple",w:6.13},{s:'MSFT',n:"Microsoft",w:4.85},
    {s:'AVGO',n:"Broadcom",w:2.97},{s:'MU',n:"Micron",w:0.79},{s:'ORCL',n:"Oracle",w:0.78},
    {s:'AMD',n:"AMD",w:0.7},{s:'PLTR',n:"Palantir",w:0.54},{s:'INTC',n:"Intel",w:0.53},
    {s:'CSCO',n:"Cisco",w:0.53},{s:'LRCX',n:"Lam Research",w:0.52},{s:'AMAT',n:"Applied Materials",w:0.49},
    {s:'IBM',n:"IBM",w:0.37},{s:'KLAC',n:"KLA",w:0.36},{s:'TXN',n:"Texas Instruments",w:0.32},
    {s:'ANET',n:"Arista Networks",w:0.32},{s:'APH',n:"Amphenol",w:0.29},{s:'ADI',n:"Analog Devices",w:0.28},
    {s:'CRM',n:"Salesforce",w:0.26},{s:'APP',n:"AppLovin",w:0.25},{s:'QCOM',n:"Qualcomm",w:0.22},
    {s:'GLW',n:"Corning",w:0.22},{s:'PANW',n:"Palo Alto Networks",w:0.21},{s:'SNDK',n:"Sandisk",w:0.21},
    {s:'DELL',n:"Dell",w:0.2},{s:'WDC',n:"Western Digital",w:0.2},{s:'STX',n:"Seagate",w:0.19},
    {s:'ACN',n:"Accenture",w:0.19},{s:'INTU',n:"Intuit",w:0.17},{s:'CRWD',n:"CrowdStrike",w:0.17},
    {s:'NOW',n:"ServiceNow",w:0.15},{s:'ADBE',n:"Adobe",w:0.15},{s:'SNPS',n:"Synopsys",w:0.13},
    {s:'CDNS',n:"Cadence",w:0.13},{s:'MSI',n:"Motorola Solutions",w:0.11},{s:'TEL',n:"TE Connectivity",w:0.11},
    {s:'MPWR',n:"Monolithic Power",w:0.11},{s:'CIEN',n:"Ciena",w:0.11},{s:'COHR',n:"Coherent",w:0.1},
    {s:'LITE',n:"Lumentum",w:0.1},{s:'FTNT',n:"Fortinet",w:0.09},{s:'TER',n:"Teradyne",w:0.09},
    {s:'KEYS',n:"Keysight",w:0.09},{s:'NXPI',n:"NXP Semi",w:0.08},{s:'ADSK',n:"Autodesk",w:0.08},
    {s:'DDOG',n:"Datadog",w:0.07},{s:'MCHP',n:"Microchip",w:0.07},{s:'ROP',n:"Roper Tech",w:0.06},
    {s:'HPE',n:"HP Enterprise",w:0.05},{s:'JBL',n:"Jabil",w:0.05},{s:'ON',n:"ON Semi",w:0.05},
    {s:'WDAY',n:"Workday",w:0.05},{s:'TDY',n:"Teledyne",w:0.05},{s:'CTSH',n:"Cognizant",w:0.05},
    {s:'Q',n:"Qnity Electronics",w:0.04},{s:'FICO',n:"Fair Isaac",w:0.04},{s:'VRSN',n:"Verisign",w:0.04},
    {s:'NTAP',n:"NetApp",w:0.03},{s:'FSLR',n:"First Solar",w:0.03},{s:'BR',n:"Broadridge",w:0.03},
    {s:'HPQ',n:"HP",w:0.03},{s:'FFIV',n:"F5",w:0.03},{s:'SMCI',n:"Supermicro",w:0.03},
    {s:'CDW',n:"CDW",w:0.03},{s:'PTC',n:"PTC",w:0.03},{s:'TRMB',n:"Trimble",w:0.02},
    {s:'TYL',n:"Tyler Tech",w:0.02},{s:'AKAM',n:"Akamai",w:0.02},{s:'GEN',n:"Gen Digital",w:0.02},
    {s:'GDDY',n:"GoDaddy",w:0.02},{s:'ZBRA',n:"Zebra Tech",w:0.02},{s:'IT',n:"Gartner",w:0.02},
    {s:'SWKS',n:"Skyworks",w:0.01},{s:'EPAM',n:"EPAM",w:0.01}
  ],
  XLF: [
    {s:'BRK.B',n:"Berkshire Hathaway",w:1.58},{s:'JPM',n:"JPMorgan Chase",w:1.28},{s:'V',n:"Visa",w:0.94},
    {s:'MA',n:"Mastercard",w:0.72},{s:'BAC',n:"Bank of America",w:0.59},{s:'MS',n:"Morgan Stanley",w:0.46},
    {s:'GS',n:"Goldman Sachs",w:0.42},{s:'WFC',n:"Wells Fargo",w:0.39},{s:'AXP',n:"American Express",w:0.35},
    {s:'C',n:"Citigroup",w:0.35},{s:'BLK',n:"BlackRock",w:0.25},{s:'SCHW',n:"Schwab",w:0.25},
    {s:'SPGI',n:"S&P Global",w:0.2},{s:'CB',n:"Chubb",w:0.2},{s:'COF',n:"Capital One",w:0.2},
    {s:'PGR',n:"Progressive",w:0.18},{s:'CME',n:"CME Group",w:0.16},{s:'BX',n:"Blackstone",w:0.15},
    {s:'BK',n:"BNY Mellon",w:0.14},{s:'KKR',n:"KKR",w:0.14},{s:'ICE',n:"ICE",w:0.14},
    {s:'PNC',n:"PNC",w:0.14},{s:'USB',n:"U.S. Bancorp",w:0.14},{s:'MMC',n:"Marsh McLennan",w:0.13},
    {s:'HOOD',n:"Robinhood",w:0.13},{s:'MCO',n:"Moodys",w:0.13},{s:'APO',n:"Apollo Global",w:0.11},
    {s:'AON',n:"Aon",w:0.11},{s:'TRV',n:"Travelers",w:0.1},{s:'TFC',n:"Truist Financial",w:0.1},
    {s:'AFL',n:"Aflac",w:0.09},{s:'AJG',n:"AJ Gallagher",w:0.09},{s:'ALL',n:"Allstate",w:0.09},
    {s:'COIN',n:"Coinbase",w:0.08},{s:'MET',n:"MetLife",w:0.08},{s:'NDAQ',n:"Nasdaq Inc",w:0.08},
    {s:'PYPL',n:"PayPal",w:0.07},{s:'FITB',n:"Fifth Third",w:0.07},{s:'XYZ',n:"Block",w:0.07},
    {s:'AIG',n:"AIG",w:0.07},{s:'MSCI',n:"MSCI",w:0.06},{s:'AMP',n:"Ameriprise",w:0.06},
    {s:'STT',n:"State Street",w:0.06},{s:'HIG',n:"Hartford",w:0.06},{s:'IBKR',n:"Interactive Brokers",w:0.06},
    {s:'PRU',n:"Prudential",w:0.05},{s:'ACGL',n:"Arch Capital",w:0.05},{s:'HBAN',n:"Huntington Bancshares",w:0.05},
    {s:'FISV',n:"Fiserv",w:0.05},{s:'MTB',n:"M&T Bank",w:0.05},{s:'CBOE',n:"Cboe",w:0.05},
    {s:'RJF',n:"Raymond James",w:0.05},{s:'NTRS',n:"Northern Trust",w:0.05},{s:'WTW',n:"Willis Towers Watson",w:0.04},
    {s:'CFG',n:"Citizens Financial",w:0.04},{s:'SYF',n:"Synchrony Financial",w:0.04},{s:'ARES',n:"Ares Management",w:0.04},
    {s:'CINF',n:"Cincinnati Financial",w:0.04},{s:'WRB',n:"W.R. Berkley",w:0.04},{s:'FIS',n:"Fidelity National Info",w:0.04},
    {s:'RF',n:"Regions Financial",w:0.04},{s:'KEY',n:"KeyCorp",w:0.04},{s:'BRO',n:"Brown & Brown",w:0.04},
    {s:'L',n:"Loews",w:0.04},{s:'CPAY',n:"Corpay",w:0.03},{s:'TROW',n:"T. Rowe Price",w:0.03},
    {s:'PFG',n:"Principal Financial",w:0.03},{s:'GPN',n:"Global Payments",w:0.03},{s:'BEN',n:"Franklin Resources",w:0.02},
    {s:'EG',n:"Everest Group",w:0.02},{s:'ERIE',n:"Erie Indemnity",w:0.02},{s:'GL',n:"Globe Life",w:0.02},
    {s:'AIZ',n:"Assurant",w:0.02},{s:'JKHY',n:"Jack Henry",w:0.02},{s:'IVZ',n:"Invesco",w:0.02},
    {s:'FDS',n:"FactSet",w:0.01}
  ],
  XLE: [
    {s:'XOM',n:"ExxonMobil",w:0.94},{s:'CVX',n:"Chevron",w:0.57},{s:'COP',n:"ConocoPhillips",w:0.22},
    {s:'WMB',n:"Williams Cos",w:0.13},{s:'SLB',n:"Schlumberger",w:0.12},{s:'KMI',n:"Kinder Morgan",w:0.11},
    {s:'EOG',n:"EOG Resources",w:0.11},{s:'VLO',n:"Valero",w:0.1},{s:'MPC',n:"Marathon Petroleum",w:0.1},
    {s:'PSX',n:"Phillips 66",w:0.1},{s:'BKR',n:"Baker Hughes",w:0.09},{s:'OXY',n:"Occidental",w:0.08},
    {s:'OKE',n:"ONEOK",w:0.08},{s:'FANG',n:"Diamondback Energy",w:0.08},{s:'TRGP',n:"Targa Resources",w:0.08},
    {s:'EQT',n:"EQT",w:0.06},{s:'HAL',n:"Halliburton",w:0.05},{s:'TPL',n:"Texas Pacific Land",w:0.05},
    {s:'DVN',n:"Devon Energy",w:0.04},{s:'CTRA',n:"Coterra",w:0.04},{s:'EXE',n:"Expand Energy",w:0.04},
    {s:'APA',n:"APA",w:0.02}
  ],
  XLV: [
    {s:'LLY',n:"Eli Lilly",w:1.28},{s:'JNJ',n:"Johnson & Johnson",w:0.87},{s:'ABBV',n:"AbbVie",w:0.57},
    {s:'UNH',n:"UnitedHealth",w:0.46},{s:'MRK',n:"Merck",w:0.45},{s:'TMO',n:"Thermo Fisher",w:0.3},
    {s:'AMGN',n:"Amgen",w:0.3},{s:'GILD',n:"Gilead",w:0.26},{s:'ABT',n:"Abbott",w:0.26},
    {s:'ISRG',n:"Intuitive Surgical",w:0.26},{s:'PFE',n:"Pfizer",w:0.24},{s:'DHR',n:"Danaher",w:0.21},
    {s:'SYK',n:"Stryker",w:0.2},{s:'BMY',n:"Bristol Myers Squibb",w:0.19},{s:'VRTX',n:"Vertex Pharma",w:0.17},
    {s:'MDT',n:"Medtronic",w:0.17},{s:'HCA',n:"HCA Healthcare",w:0.17},{s:'MCK',n:"McKesson",w:0.16},
    {s:'CVS',n:"CVS Health",w:0.15},{s:'BSX',n:"Boston Scientific",w:0.15},{s:'REGN',n:"Regeneron",w:0.12},
    {s:'CI',n:"Cigna",w:0.11},{s:'ELV',n:"Elevance Health",w:0.11},{s:'COR',n:"Cencora",w:0.1},
    {s:'ZTS',n:"Zoetis",w:0.08},{s:'CAH',n:"Cardinal Health",w:0.08},{s:'IDXX',n:"Idexx Labs",w:0.07},
    {s:'EW',n:"Edwards Lifesciences",w:0.07},{s:'BDX',n:"Becton Dickinson",w:0.07},{s:'A',n:"Agilent",w:0.05},
    {s:'GEHC',n:"GE HealthCare",w:0.05},{s:'RMD',n:"ResMed",w:0.05},{s:'WAT',n:"Waters",w:0.05},
    {s:'IQV',n:"IQVIA",w:0.05},{s:'MTD',n:"Mettler Toledo",w:0.04},{s:'BIIB',n:"Biogen",w:0.04},
    {s:'HUM',n:"Humana",w:0.04},{s:'DXCM',n:"Dexcom",w:0.04},{s:'LH',n:"LabCorp",w:0.03},
    {s:'STE',n:"Steris",w:0.03},{s:'DGX',n:"Quest Diagnostics",w:0.03},{s:'MRNA',n:"Moderna",w:0.03},
    {s:'WST',n:"West Pharma",w:0.03},{s:'INCY',n:"Incyte",w:0.03},{s:'CNC',n:"Centene",w:0.03},
    {s:'ZBH',n:"Zimmer Biomet",w:0.03},{s:'VTRS',n:"Viatris",w:0.03},{s:'PODD',n:"Insulet",w:0.02},
    {s:'COO',n:"Cooper",w:0.02},{s:'ALGN',n:"Align Technology",w:0.02},{s:'SOLV',n:"Solventum",w:0.02},
    {s:'UHS',n:"Universal Health Services",w:0.02},{s:'RVTY',n:"Revvity",w:0.02},{s:'DVA',n:"DaVita",w:0.02},
    {s:'BAX',n:"Baxter",w:0.01},{s:'TECH',n:"Bio-Techne",w:0.01},{s:'CRL',n:"Charles River Labs",w:0.01},
    {s:'HSIC',n:"Henry Schein",w:0.01}
  ],
  XLC: [
    {s:'GOOGL',n:"Alphabet A",w:3.3},{s:'GOOG',n:"Alphabet C",w:3.06},{s:'META',n:"Meta Platforms",w:2.69},
    {s:'NFLX',n:"Netflix",w:0.63},{s:'TMUS',n:"T-Mobile US",w:0.34},{s:'VZ',n:"Verizon",w:0.3},
    {s:'DIS',n:"Disney",w:0.29},{s:'T',n:"AT&T",w:0.29},{s:'CMCSA',n:"Comcast",w:0.16},
    {s:'WBD',n:"Warner Bros Discovery",w:0.11},{s:'EA',n:"Electronic Arts",w:0.08},{s:'TTWO',n:"Take-Two",w:0.06},
    {s:'SATS',n:"EchoStar",w:0.06},{s:'LYV',n:"Live Nation",w:0.06},{s:'CHTR',n:"Charter Comms",w:0.05},
    {s:'OMC',n:"Omnicom",w:0.03},{s:'TKO',n:"TKO Group",w:0.02},{s:'FOX',n:"Fox B",w:0.02},
    {s:'FOXA',n:"Fox A",w:0.02},{s:'PSKY',n:"Paramount Skydance",w:0.02},{s:'TTD',n:"Trade Desk",w:0.02},
    {s:'NWSA',n:"News Corp A",w:0.01},{s:'NWS',n:"News Corp B",w:0.01}
  ],
  XLI: [
    {s:'CAT',n:"Caterpillar",w:0.57},{s:'GE',n:"GE Aerospace",w:0.49},{s:'GEV',n:"GE Vernova",w:0.42},
    {s:'RTX',n:"RTX",w:0.41},{s:'BA',n:"Boeing",w:0.27},{s:'DE',n:"Deere",w:0.25},
    {s:'ETN',n:"Eaton",w:0.24},{s:'UBER',n:"Uber",w:0.24},{s:'UNP',n:"Union Pacific",w:0.23},
    {s:'HON',n:"Honeywell",w:0.23},{s:'LMT',n:"Lockheed Martin",w:0.21},{s:'PH',n:"Parker Hannifin",w:0.19},
    {s:'VRT',n:"Vertiv",w:0.18},{s:'TT',n:"Trane Tech",w:0.16},{s:'HWM',n:"Howmet",w:0.16},
    {s:'NOC',n:"Northrop Grumman",w:0.15},{s:'FDX',n:"FedEx",w:0.14},{s:'GD',n:"General Dynamics",w:0.14},
    {s:'UPS',n:"UPS",w:0.14},{s:'PWR',n:"Quanta Services",w:0.14},{s:'WM',n:"Waste Management",w:0.14},
    {s:'CMI',n:"Cummins",w:0.13},{s:'JCI',n:"Johnson Controls",w:0.13},{s:'EMR',n:"Emerson Electric",w:0.13},
    {s:'MMM',n:"3M",w:0.12},{s:'ADP',n:"ADP",w:0.12},{s:'CSX',n:"CSX",w:0.12},
    {s:'ITW',n:"Illinois Tool Works",w:0.12},{s:'CTAS',n:"Cintas",w:0.11},{s:'TDG',n:"TransDigm",w:0.11},
    {s:'NSC',n:"Norfolk Southern",w:0.1},{s:'PCAR',n:"Paccar",w:0.1},{s:'LHX',n:"L3Harris",w:0.1},
    {s:'RSG',n:"Republic Services",w:0.1},{s:'FIX',n:"Comfort Systems",w:0.09},{s:'GWW',n:"Grainger",w:0.09},
    {s:'AME',n:"Ametek",w:0.08},{s:'FAST',n:"Fastenal",w:0.08},{s:'CARR',n:"Carrier Global",w:0.08},
    {s:'URI',n:"United Rentals",w:0.08},{s:'DAL',n:"Delta Air Lines",w:0.07},{s:'ROK',n:"Rockwell Automation",w:0.07},
    {s:'ODFL',n:"Old Dominion",w:0.07},{s:'WAB',n:"Wabtec",w:0.07},{s:'EME',n:"EMCOR",w:0.06},
    {s:'IR',n:"Ingersoll Rand",w:0.05},{s:'UAL',n:"United Airlines",w:0.05},{s:'PAYX',n:"Paychex",w:0.05},
    {s:'AXON',n:"Axon Enterprise",w:0.05},{s:'CPRT',n:"Copart",w:0.05},{s:'OTIS',n:"Otis",w:0.05},
    {s:'DOV',n:"Dover",w:0.05},{s:'XYL',n:"Xylem",w:0.05},{s:'HUBB',n:"Hubbell",w:0.04},
    {s:'ROL',n:"Rollins",w:0.04},{s:'EFX',n:"Equifax",w:0.04},{s:'VRSK',n:"Verisk",w:0.04},
    {s:'JBHT',n:"J.B. Hunt",w:0.04},{s:'VLTO',n:"Veralto",w:0.03},{s:'CHRW',n:"C.H. Robinson",w:0.03},
    {s:'LUV',n:"Southwest Airlines",w:0.03},{s:'SNA',n:"Snap-on",w:0.03},{s:'EXPD',n:"Expeditors",w:0.03},
    {s:'LDOS',n:"Leidos",w:0.03},{s:'FTV',n:"Fortive",w:0.03},{s:'LII',n:"Lennox",w:0.03},
    {s:'TXT',n:"Textron",w:0.02},{s:'NDSN',n:"Nordson",w:0.02},{s:'HII',n:"Huntington Ingalls",w:0.02},
    {s:'IEX',n:"IDEX",w:0.02},{s:'J',n:"Jacobs",w:0.02},{s:'PNR',n:"Pentair",w:0.02},
    {s:'MAS',n:"Masco",w:0.02},{s:'GNRC',n:"Generac",w:0.02},{s:'ALLE',n:"Allegion",w:0.02},
    {s:'SWK',n:"Stanley Black & Decker",w:0.02},{s:'BLDR',n:"Builders FirstSource",w:0.01},{s:'AOS',n:"A.O. Smith",w:0.01}
  ],
  XLB: [
    {s:'LIN',n:"Linde",w:0.35},{s:'NEM',n:"Newmont",w:0.19},{s:'FCX',n:"Freeport-McMoRan",w:0.16},
    {s:'SHW',n:"Sherwin-Williams",w:0.13},{s:'CRH',n:"CRH",w:0.12},{s:'ECL',n:"Ecolab",w:0.12},
    {s:'APD',n:"Air Products",w:0.1},{s:'CTVA',n:"Corteva",w:0.08},{s:'NUE',n:"Nucor",w:0.07},
    {s:'VMC',n:"Vulcan Materials",w:0.06},{s:'MLM',n:"Martin Marietta",w:0.06},{s:'STLD',n:"Steel Dynamics",w:0.04},
    {s:'PPG',n:"PPG Industries",w:0.04},{s:'DOW',n:"Dow",w:0.04},{s:'ALB',n:"Albemarle",w:0.04},
    {s:'SW',n:"Smurfit WestRock",w:0.03},{s:'LYB',n:"LyondellBasell",w:0.03},{s:'IP',n:"International Paper",w:0.03},
    {s:'DD',n:"DuPont",w:0.03},{s:'IFF',n:"Intl Flavors & Fragrances",w:0.03},{s:'AMCR',n:"Amcor",w:0.03},
    {s:'PKG',n:"Packaging Corp",w:0.03},{s:'CF',n:"CF Industries",w:0.03},{s:'BALL',n:"Ball",w:0.03},
    {s:'AVY',n:"Avery Dennison",w:0.02},{s:'MOS',n:"Mosaic",w:0.01}
  ],
  XLRE: [
    {s:'WELL',n:"Welltower",w:0.23},{s:'PLD',n:"Prologis",w:0.21},{s:'EQIX',n:"Equinix",w:0.17},
    {s:'AMT',n:"American Tower",w:0.13},{s:'DLR',n:"Digital Realty",w:0.11},{s:'SPG',n:"Simon Property",w:0.1},
    {s:'O',n:"Realty Income",w:0.09},{s:'PSA',n:"Public Storage",w:0.08},{s:'CBRE',n:"CBRE",w:0.07},
    {s:'VTR',n:"Ventas",w:0.06},{s:'CCI',n:"Crown Castle",w:0.06},{s:'IRM',n:"Iron Mountain",w:0.05},
    {s:'VICI',n:"VICI Properties",w:0.05},{s:'EXR',n:"Extra Space Storage",w:0.05},{s:'AVB',n:"AvalonBay",w:0.04},
    {s:'SBAC',n:"SBA Comms",w:0.04},{s:'EQR',n:"Equity Residential",w:0.04},{s:'WY',n:"Weyerhaeuser",w:0.03},
    {s:'CSGP',n:"CoStar",w:0.03},{s:'ESS',n:"Essex Property",w:0.03},{s:'KIM',n:"Kimco Realty",w:0.03},
    {s:'INVH',n:"Invitation Homes",w:0.03},{s:'MAA',n:"Mid-America Apts",w:0.02},{s:'REG',n:"Regency Centers",w:0.02},
    {s:'HST',n:"Host Hotels",w:0.02},{s:'DOC',n:"Healthpeak",w:0.02},{s:'UDR',n:"UDR",w:0.02},
    {s:'CPT',n:"Camden Property",w:0.02},{s:'FRT',n:"Federal Realty",w:0.02},{s:'BXP',n:"BXP",w:0.01},
    {s:'ARE',n:"Alexandria Real Estate",w:0.01}
  ],
  XLU: [
    {s:'NEE',n:"NextEra Energy",w:0.3},{s:'CEG',n:"Constellation Energy",w:0.17},{s:'SO',n:"Southern Co",w:0.16},
    {s:'DUK',n:"Duke Energy",w:0.15},{s:'AEP',n:"American Electric Power",w:0.11},{s:'SRE',n:"Sempra",w:0.09},
    {s:'VST',n:"Vistra",w:0.09},{s:'D',n:"Dominion Energy",w:0.08},{s:'ETR',n:"Entergy",w:0.08},
    {s:'XEL',n:"Xcel Energy",w:0.08},{s:'EXC',n:"Exelon",w:0.07},{s:'PEG',n:"PSEG",w:0.06},
    {s:'ED',n:"ConEd",w:0.06},{s:'PCG',n:"PG&E",w:0.06},{s:'WEC',n:"WEC Energy",w:0.06},
    {s:'NRG',n:"NRG Energy",w:0.06},{s:'AEE',n:"Ameren",w:0.05},{s:'ATO',n:"Atmos Energy",w:0.05},
    {s:'DTE',n:"DTE Energy",w:0.05},{s:'PPL',n:"PPL",w:0.05},{s:'FE',n:"FirstEnergy",w:0.04},
    {s:'CNP',n:"CenterPoint Energy",w:0.04},{s:'EIX',n:"Edison International",w:0.04},{s:'ES',n:"Eversource",w:0.04},
    {s:'AWK',n:"American Water Works",w:0.04},{s:'CMS',n:"CMS Energy",w:0.04},{s:'NI',n:"NiSource",w:0.04},
    {s:'EVRG',n:"Evergy",w:0.03},{s:'LNT',n:"Alliant Energy",w:0.03},{s:'PNW',n:"Pinnacle West",w:0.02},
    {s:'AES',n:"AES",w:0.02}
  ],
  XLP: [
    {s:'WMT',n:"Walmart",w:1.57},{s:'COST',n:"Costco",w:0.69},{s:'PG',n:"Procter & Gamble",w:0.53},
    {s:'KO',n:"Coca-Cola",w:0.5},{s:'PM',n:"Philip Morris",w:0.38},{s:'PEP',n:"PepsiCo",w:0.33},
    {s:'MO',n:"Altria",w:0.17},{s:'MNST',n:"Monster Beverage",w:0.12},{s:'MDLZ',n:"Mondelez",w:0.11},
    {s:'CL',n:"Colgate-Palmolive",w:0.11},{s:'TGT',n:"Target",w:0.09},{s:'KR',n:"Kroger",w:0.06},
    {s:'HSY',n:"Hershey",w:0.06},{s:'SYY',n:"Sysco",w:0.06},{s:'KDP',n:"Keurig Dr Pepper",w:0.06},
    {s:'KVUE',n:"Kenvue",w:0.05},{s:'KMB',n:"Kimberly-Clark",w:0.05},{s:'ADM',n:"Archer Daniels Midland",w:0.05},
    {s:'STZ',n:"Constellation Brands",w:0.04},{s:'DG',n:"Dollar General",w:0.04},{s:'CASY',n:"Caseys",w:0.04},
    {s:'EL',n:"Estee Lauder",w:0.04},{s:'KHC',n:"Kraft Heinz",w:0.04},{s:'BG',n:"Bunge",w:0.04},
    {s:'CHD',n:"Church & Dwight",w:0.04},{s:'TSN',n:"Tyson Foods",w:0.04},{s:'DLTR',n:"Dollar Tree",w:0.03},
    {s:'GIS',n:"General Mills",w:0.03},{s:'MKC',n:"McCormick",w:0.02},{s:'BF.B',n:"Brown-Forman",w:0.02},
    {s:'CLX',n:"Clorox",w:0.02},{s:'HRL',n:"Hormel",w:0.02},{s:'SJM',n:"J.M. Smucker",w:0.02},
    {s:'TAP',n:"Molson Coors",w:0.01},{s:'CAG',n:"Conagra",w:0.01},{s:'CPB',n:"Campbell Soup",w:0.01}
  ],
  XLY: [
    {s:'AMZN',n:"Amazon",w:4.16},{s:'TSLA',n:"Tesla",w:2.32},{s:'HD',n:"Home Depot",w:0.54},
    {s:'MCD',n:"McDonalds",w:0.34},{s:'TJX',n:"TJX",w:0.27},{s:'BKNG',n:"Booking",w:0.23},
    {s:'LOW',n:"Lowes",w:0.22},{s:'SBUX',n:"Starbucks",w:0.18},{s:'MAR',n:"Marriott",w:0.15},
    {s:'ABNB',n:"Airbnb",w:0.13},{s:'DASH',n:"DoorDash",w:0.12},{s:'ORLY',n:"OReilly Auto",w:0.12},
    {s:'HLT',n:"Hilton",w:0.12},{s:'RCL',n:"Royal Caribbean",w:0.12},{s:'GM',n:"General Motors",w:0.11},
    {s:'ROST',n:"Ross Stores",w:0.11},{s:'NKE',n:"Nike",w:0.11},{s:'AZO',n:"AutoZone",w:0.09},
    {s:'CVNA',n:"Carvana",w:0.09},{s:'F',n:"Ford",w:0.08},{s:'GRMN',n:"Garmin",w:0.08},
    {s:'EBAY',n:"eBay",w:0.07},{s:'CMG',n:"Chipotle",w:0.07},{s:'YUM',n:"Yum Brands",w:0.07},
    {s:'DHI',n:"D.R. Horton",w:0.07},{s:'CCL',n:"Carnival",w:0.06},{s:'LVS',n:"Las Vegas Sands",w:0.06},
    {s:'EXPE',n:"Expedia",w:0.05},{s:'TPR',n:"Tapestry",w:0.05},{s:'PHM',n:"PulteGroup",w:0.04},
    {s:'ULTA',n:"Ulta Beauty",w:0.04},{s:'TSCO',n:"Tractor Supply",w:0.04},{s:'WSM',n:"Williams-Sonoma",w:0.04},
    {s:'RL',n:"Ralph Lauren",w:0.04},{s:'DRI',n:"Darden",w:0.04},{s:'LEN',n:"Lennar",w:0.04},
    {s:'NVR',n:"NVR",w:0.03},{s:'LULU',n:"Lululemon",w:0.03},{s:'DECK',n:"Deckers",w:0.02},
    {s:'GPC',n:"Genuine Parts",w:0.02},{s:'BBY',n:"Best Buy",w:0.02},{s:'HAS',n:"Hasbro",w:0.02},
    {s:'APTV',n:"Aptiv",w:0.02},{s:'DPZ',n:"Dominos",w:0.02},{s:'WYNN',n:"Wynn Resorts",w:0.02},
    {s:'MGM',n:"MGM Resorts",w:0.02},{s:'NCLH',n:"Norwegian Cruise",w:0.01},{s:'POOL',n:"Pool",w:0.01}
  ],
};


/* ════════════════════════════════════════════════════════════════════════════
   MID_CAP_HOLDINGS · S&P MidCap 400 — comprehensive coverage (~393 names).
   Organized by GICS sector mapped to XL ETF keys. Tickers that have been
   promoted to the S&P 500 are EXCLUDED to prevent overlap with ETF_HOLDINGS.
   Source: composition as of Jan 2026; minor rotations (~10-20/quarter) may
   cause individual tickers to fail fetching — those are just skipped.
   ════════════════════════════════════════════════════════════════════════════ */
const MID_CAP_HOLDINGS = {
  XLK: [
    {s:'AEIS',n:"Advanced Energy",w:0.3},{s:'ALGM',n:"Allegro MicroSystems",w:0.3},
    {s:'AMKR',n:"Amkor Technology",w:0.3},{s:'APPF',n:"AppFolio",w:0.3},{s:'ARW',n:"Arrow Electronics",w:0.3},
    {s:'ASGN',n:"ASGN",w:0.3},{s:'AVT',n:"Avnet",w:0.3},{s:'BDC',n:"Belden",w:0.3},
    {s:'BILL',n:"Bill Holdings",w:0.3},{s:'BLKB',n:"Blackbaud",w:0.3},{s:'BSY',n:"Bentley Systems",w:0.3},
    {s:'CGNX',n:"Cognex",w:0.3},{s:'CRUS',n:"Cirrus Logic",w:0.3},{s:'CVLT',n:"CommVault Systems",w:0.3},
    {s:'CXT',n:"Crane NXT",w:0.3},{s:'DBX',n:"Dropbox",w:0.3},{s:'DLB',n:"Dolby",w:0.3},
    {s:'DOCU',n:"Docusign",w:0.3},{s:'DT',n:"Dynatrace",w:0.3},{s:'ENTG',n:"Entegris",w:0.3},
    {s:'FLEX',n:"Flex",w:0.3},{s:'FN',n:"Fabrinet",w:0.3},{s:'GWRE',n:"Guidewire Software",w:0.3},
    {s:'IPGP',n:"IPG Photonics",w:0.3},{s:'KD',n:"Kyndryl",w:0.3},{s:'LFUS',n:"Littelfuse",w:0.3},
    {s:'LSCC',n:"Lattice Semiconductor",w:0.3},{s:'MANH',n:"Manhattan Associates",w:0.3},
    {s:'MKSI',n:"MKS Instruments",w:0.3},{s:'MTSI',n:"MACOM Technology",w:0.3},{s:'NOVT',n:"Novanta",w:0.3},
    {s:'NTNX',n:"Nutanix",w:0.3},{s:'OKTA',n:"Okta",w:0.3},{s:'OLED',n:"Universal Display",w:0.3},
    {s:'ONTO',n:"Onto Innovation",w:0.3},{s:'PATH',n:"UiPath",w:0.3},{s:'PEGA',n:"Pegasystems",w:0.3},
    {s:'PSTG',n:"Pure Storage",w:0.3},{s:'QLYS',n:"Qualys",w:0.3},{s:'RMBS',n:"Rambus",w:0.3},
    {s:'SLAB',n:"Silicon Labs",w:0.3},{s:'SNX',n:"TD Synnex",w:0.3},{s:'SYNA',n:"Synaptics",w:0.3},
    {s:'TTMI',n:"TTM Technologies",w:0.3},{s:'TWLO',n:"Twilio",w:0.3},{s:'VNT',n:"Vontier",w:0.3},
  ],
  XLF: [
    {s:'AFG',n:"American Financial Group",w:0.3},{s:'ALLY',n:"Ally Financial",w:0.3},
    {s:'AMG',n:"Affiliated Managers Group",w:0.3},{s:'ASB',n:"Associated Bank",w:0.3},
    {s:'BHF',n:"Brighthouse Financial",w:0.3},{s:'CBSH',n:"Commerce Bancshares",w:0.3},
    {s:'CFR',n:"Frost Bank",w:0.3},{s:'CG',n:"Carlyle Group",w:0.3},{s:'CNO',n:"CNO Financial Group",w:0.3},
    {s:'COLB',n:"Columbia Banking System",w:0.3},{s:'CRBG',n:"Corebridge Financial",w:0.3},
    {s:'EEFT',n:"Euronet Worldwide",w:0.3},{s:'EQH',n:"Equitable Holdings",w:0.3},
    {s:'ESNT',n:"Essent Group",w:0.3},{s:'EVR',n:"Evercore",w:0.3},{s:'EWBC',n:"East West Bancorp",w:0.3},
    {s:'FAF',n:"First American Financial",w:0.3},{s:'FCFS',n:"FirstCash",w:0.3},
    {s:'FFIN',n:"First Financial Bankshares",w:0.3},{s:'FHI',n:"Federated Hermes",w:0.3},
    {s:'FHN',n:"First Horizon",w:0.3},{s:'FLG',n:"Flagstar Bank",w:0.3},{s:'FNB',n:"FNB Corporation",w:0.3},
    {s:'FNF',n:"Fidelity National Financial",w:0.3},{s:'FOUR',n:"Shift4",w:0.3},
    {s:'GBCI',n:"Glacier Bancorp",w:0.3},{s:'HLI',n:"Houlihan Lokey",w:0.3},
    {s:'HLNE',n:"Hamilton Lane",w:0.3},{s:'HOMB',n:"Home BancShares",w:0.3},
    {s:'HWC',n:"Hancock Whitney",w:0.3},{s:'IBOC',n:"Intl Bancshares",w:0.3},{s:'JEF',n:"Jefferies",w:0.3},
    {s:'JHG',n:"Janus Henderson",w:0.3},{s:'KMPR',n:"Kemper",w:0.3},
    {s:'KNSL',n:"Kinsale Capital Group",w:0.3},{s:'MORN',n:"Morningstar",w:0.3},
    {s:'MTG',n:"MGIC Investment",w:0.3},{s:'NLY',n:"Annaly Capital Management",w:0.3},
    {s:'ONB',n:"Old National Bank",w:0.3},{s:'ORI',n:"Old Republic International",w:0.3},
    {s:'OZK',n:"Bank OZK",w:0.3},{s:'PB',n:"Prosperity Bancshares",w:0.3},
    {s:'PNFP',n:"Pinnacle Financial Partners",w:0.3},{s:'PRI',n:"Primerica",w:0.3},
    {s:'RGA',n:"Reinsurance Group of America",w:0.3},{s:'RLI',n:"RLI",w:0.3},
    {s:'RNR',n:"RenaissanceRe",w:0.3},{s:'RYAN',n:"Ryan Specialty",w:0.3},
    {s:'SEIC',n:"SEI Investments",w:0.3},{s:'SF',n:"Stifel",w:0.3},
    {s:'SIGI',n:"Selective Insurance Group",w:0.3},{s:'SLM',n:"SLM",w:0.3},{s:'SSB',n:"South State",w:0.3},
    {s:'STWD',n:"Starwood Property Trust",w:0.3},{s:'TCBI',n:"Texas Capital",w:0.3},
    {s:'THG',n:"Hanover Insurance",w:0.3},{s:'UBSI',n:"United Bankshares",w:0.3},
    {s:'UMBF',n:"UMB Financial",w:0.3},{s:'UNM',n:"Unum",w:0.3},{s:'VLY',n:"Valley Bank",w:0.3},
    {s:'VOYA',n:"Voya Financial",w:0.3},{s:'WAL',n:"Western Alliance",w:0.3},{s:'WBS',n:"Webster Bank",w:0.3},
    {s:'WEX',n:"WEX",w:0.3},{s:'WTFC',n:"Wintrust Financial",w:0.3},{s:'ZION',n:"Zions Bancorporation",w:0.3},
  ],
  XLV: [
    {s:'ARWR',n:"Arrowhead Pharmaceuticals",w:0.3},{s:'AVTR',n:"Avantor",w:0.3},
    {s:'BIO',n:"Bio-Rad Laboratories",w:0.3},{s:'BMRN',n:"BioMarin Pharmaceutical",w:0.3},
    {s:'BRKR',n:"Bruker",w:0.3},{s:'CHE',n:"Chemed",w:0.3},{s:'CYTK',n:"Cytokinetics",w:0.3},
    {s:'DOCS',n:"Doximity",w:0.3},{s:'EHC',n:"Encompass Health",w:0.3},{s:'ELAN',n:"Elanco",w:0.3},
    {s:'ENSG',n:"Ensign Group",w:0.3},{s:'EXEL',n:"Exelixis",w:0.3},{s:'GMED',n:"Globus Medical",w:0.3},
    {s:'HAE',n:"Haemonetics",w:0.3},{s:'HALO',n:"Halozyme",w:0.3},{s:'HIMS',n:"Hims & Hers Health",w:0.3},
    {s:'HQY',n:"HealthEquity",w:0.3},{s:'ILMN',n:"Illumina",w:0.3},{s:'JAZZ',n:"Jazz Pharmaceuticals",w:0.3},
    {s:'LIVN',n:"LivaNova",w:0.3},{s:'LNTH',n:"Lantheus Holdings",w:0.3},{s:'MASI',n:"Masimo",w:0.3},
    {s:'MEDP',n:"Medpace",w:0.3},{s:'NBIX',n:"Neurocrine Biosciences",w:0.3},
    {s:'NVST',n:"Envista Holdings",w:0.3},{s:'OPCH',n:"Option Care Health",w:0.3},
    {s:'PEN',n:"Penumbra",w:0.3},{s:'RGEN',n:"Repligen",w:0.3},{s:'ROIV',n:"Roivant Sciences",w:0.3},
    {s:'SHC',n:"Sotera Health",w:0.3},{s:'THC',n:"Tenet Healthcare",w:0.3},
    {s:'UTHR',n:"United Therapeutics",w:0.3},{s:'XRAY',n:"Dentsply Sirona",w:0.3},
  ],
  XLY: [
    {s:'ALV',n:"Autoliv",w:0.3},{s:'AN',n:"AutoNation",w:0.3},{s:'ANF',n:"Abercrombie & Fitch",w:0.3},
    {s:'ARMK',n:"Aramark",w:0.3},{s:'BBWI',n:"Bath & Body Works",w:0.3},{s:'BC',n:"Brunswick",w:0.3},
    {s:'BLD',n:"TopBuild",w:0.3},{s:'BROS',n:"Dutch Bros",w:0.3},{s:'BURL',n:"Burlington Stores",w:0.3},
    {s:'BWA',n:"BorgWarner",w:0.3},{s:'BYD',n:"Boyd Gaming",w:0.3},{s:'CAVA',n:"Cava Group",w:0.3},
    {s:'CHDN',n:"Churchill Downs",w:0.3},{s:'CHH',n:"Choice Hotels",w:0.3},{s:'CHWY',n:"Chewy",w:0.3},
    {s:'COLM',n:"Columbia Sportswear",w:0.3},{s:'CPRI',n:"Capri Holdings",w:0.3},{s:'CROX',n:"Crocs",w:0.3},
    {s:'DKS',n:"Dick's Sporting Goods",w:0.3},{s:'DUOL',n:"Duolingo",w:0.3},{s:'FIVE',n:"Five Below",w:0.3},
    {s:'FND',n:"Floor & Decor",w:0.3},{s:'GAP',n:"Gap",w:0.3},{s:'GHC',n:"Graham Holdings",w:0.3},
    {s:'GME',n:"GameStop",w:0.3},{s:'GNTX',n:"Gentex",w:0.3},{s:'GT',n:"Goodyear Tire & Rubber",w:0.3},
    {s:'H',n:"Hyatt",w:0.3},{s:'HGV',n:"Hilton Grand Vacations",w:0.3},{s:'HOG',n:"Harley-Davidson",w:0.3},
    {s:'HRB',n:"H&R Block",w:0.3},{s:'KBH',n:"KB Home",w:0.3},{s:'LAD',n:"Lithia Motors",w:0.3},
    {s:'LEA',n:"Lear",w:0.3},{s:'LOPE',n:"Grand Canyon Education",w:0.3},{s:'M',n:"Macy's",w:0.3},
    {s:'MAT',n:"Mattel",w:0.3},{s:'MTN',n:"Vail Resorts",w:0.3},{s:'MUSA',n:"Murphy USA",w:0.3},
    {s:'OLLI',n:"Ollie's Bargain Outlet",w:0.3},{s:'PAG',n:"Penske Automotive",w:0.3},
    {s:'PII',n:"Polaris",w:0.3},{s:'PLNT',n:"Planet Fitness",w:0.3},{s:'PVH',n:"PVH",w:0.3},
    {s:'RH',n:"RH",w:0.3},{s:'SCI',n:"Service Corp Intl",w:0.3},{s:'SGI',n:"Somnigroup International",w:0.3},
    {s:'THO',n:"Thor Industries",w:0.3},{s:'TMHC',n:"Taylor Morrison",w:0.3},
    {s:'TNL',n:"Travel + Leisure",w:0.3},{s:'TOL',n:"Toll Brothers",w:0.3},
    {s:'TXRH',n:"Texas Roadhouse",w:0.3},{s:'VC',n:"Visteon",w:0.3},{s:'VFC',n:"VF",w:0.3},
    {s:'VVV',n:"Valvoline",w:0.3},{s:'WH',n:"Wyndham Hotels & Resorts",w:0.3},{s:'WHR',n:"Whirlpool",w:0.3},
    {s:'WING',n:"Wingstop",w:0.3},{s:'YETI',n:"Yeti Holdings",w:0.3},
  ],
  XLP: [
    {s:'ACI',n:"Albertsons",w:0.3},{s:'BJ',n:"BJ's Wholesale Club",w:0.3},
    {s:'BRBR',n:"BellRing Brands",w:0.3},{s:'CART',n:"Maplebear",w:0.3},{s:'CELH',n:"Celsius Holdings",w:0.3},
    {s:'COKE',n:"Coca-Cola Consolidated",w:0.3},{s:'COTY',n:"Coty",w:0.3},
    {s:'DAR',n:"Darling Ingredients",w:0.3},{s:'ELF',n:"e.l.f. Beauty",w:0.3},
    {s:'FLO',n:"Flowers Foods",w:0.3},{s:'INGR',n:"Ingredion",w:0.3},{s:'MZTI',n:"Marzetti",w:0.3},
    {s:'PFGC',n:"Performance Food Group",w:0.3},{s:'POST',n:"Post Holdings",w:0.3},
    {s:'PPC',n:"Pilgrim's Pride",w:0.3},{s:'SAM',n:"Boston Beer",w:0.3},
    {s:'SFM',n:"Sprouts Farmers Market",w:0.3},{s:'USFD',n:"US Foods",w:0.3},
  ],
  XLI: [
    {s:'AAL',n:"American Airlines Group",w:0.3},{s:'AAON',n:"AAON",w:0.3},{s:'ACM',n:"AECOM",w:0.3},
    {s:'AGCO',n:"AGCO",w:0.3},{s:'AIT',n:"Applied Industrial Technologies",w:0.3},
    {s:'ALK',n:"Alaska Air Group",w:0.3},{s:'APG',n:"APi Group",w:0.3},{s:'ATI',n:"ATI",w:0.3},
    {s:'AVAV',n:"AeroVironment",w:0.3},{s:'AYI',n:"Acuity Brands",w:0.3},
    {s:'BAH',n:"Booz Allen Hamilton",w:0.3},{s:'BCO',n:"Brink's",w:0.3},{s:'BWXT',n:"BWX Technologies",w:0.3},
    {s:'CACI',n:"CACI International",w:0.3},{s:'CAR',n:"Avis Budget Group",w:0.3},
    {s:'CLH',n:"Clean Harbors",w:0.3},{s:'CNH',n:"CNH Industrial",w:0.3},{s:'CNM',n:"Core & Main",w:0.3},
    {s:'CNXC',n:"Concentrix",w:0.3},{s:'CR',n:"Crane",w:0.3},{s:'CRS',n:"Carpenter Technology",w:0.3},
    {s:'CSL',n:"Carlisle Companies",w:0.3},{s:'CW',n:"Curtiss-Wright",w:0.3},{s:'DCI',n:"Donaldson",w:0.3},
    {s:'DY',n:"Dycom Industries",w:0.3},{s:'ENS',n:"EnerSys",w:0.3},{s:'ESAB',n:"ESAB",w:0.3},
    {s:'EXLS',n:"EXL Service",w:0.3},{s:'EXPO',n:"Exponent",w:0.3},
    {s:'FBIN',n:"Fortune Brands Innovations",w:0.3},{s:'FCN',n:"FTI Consulting",w:0.3},
    {s:'FLR',n:"Fluor",w:0.3},{s:'FLS',n:"Flowserve",w:0.3},{s:'G',n:"Genpact",w:0.3},
    {s:'GATX',n:"GATX",w:0.3},{s:'GGG',n:"Graco",w:0.3},{s:'GTLS',n:"Chart Industries",w:0.3},
    {s:'GXO',n:"GXO Logistics",w:0.3},{s:'HXL',n:"Hexcel",w:0.3},{s:'ITT',n:"ITT",w:0.3},
    {s:'KBR',n:"KBR",w:0.3},{s:'KEX',n:"Kirby",w:0.3},{s:'KNX',n:"Knight-Swift",w:0.3},
    {s:'KTOS',n:"Kratos Defense",w:0.3},{s:'LECO',n:"Lincoln Electric",w:0.3},
    {s:'LSTR',n:"Landstar System",w:0.3},{s:'MIDD',n:"Middleby",w:0.3},{s:'MLI',n:"Mueller Industries",w:0.3},
    {s:'MMS',n:"Maximus",w:0.3},{s:'MSA',n:"MSA Safety",w:0.3},{s:'MSM',n:"MSC Industrial Direct",w:0.3},
    {s:'MTZ',n:"MasTec",w:0.3},{s:'NVT',n:"nVent Electric",w:0.3},{s:'NXT',n:"Nextracker",w:0.3},
    {s:'OC',n:"Owens Corning",w:0.3},{s:'OSK',n:"Oshkosh",w:0.3},{s:'PCTY',n:"Paylocity",w:0.3},
    {s:'PSN',n:"Parsons",w:0.3},{s:'R',n:"Ryder",w:0.3},{s:'RBA',n:"RB Global",w:0.3},
    {s:'RBC',n:"RBC Bearings",w:0.3},{s:'RRX',n:"Regal Rexnord",w:0.3},{s:'SAIA',n:"Saia",w:0.3},
    {s:'SAIC',n:"SAIC",w:0.3},{s:'SARO',n:"StandardAero",w:0.3},{s:'SPXC',n:"SPX Technologies",w:0.3},
    {s:'SSD',n:"Simpson Manufacturing",w:0.3},{s:'ST',n:"Sensata Technologies",w:0.3},
    {s:'STRL',n:"Sterling Infrastructure",w:0.3},{s:'TEX',n:"Terex",w:0.3},{s:'TKR',n:"Timken",w:0.3},
    {s:'TREX',n:"Trex",w:0.3},{s:'TRU',n:"TransUnion",w:0.3},{s:'TTC',n:"Toro",w:0.3},
    {s:'TTEK',n:"Tetra Tech",w:0.3},{s:'UFPI',n:"UFP Industries",w:0.3},{s:'ULS',n:"UL Solutions",w:0.3},
    {s:'VMI',n:"Valmont Industries",w:0.3},{s:'WCC',n:"WESCO International",w:0.3},
    {s:'WMS',n:"Advanced Drainage Systems",w:0.3},{s:'WSO',n:"Watsco",w:0.3},{s:'WTS',n:"Watts Water",w:0.3},
    {s:'WWD',n:"Woodward",w:0.3},{s:'XPO',n:"XPO",w:0.3},
  ],
  XLE: [
    {s:'AM',n:"Antero Midstream",w:0.3},{s:'AR',n:"Antero Resources",w:0.3},{s:'CHRD',n:"Chord Energy",w:0.3},
    {s:'CNX',n:"CNX Resources",w:0.3},{s:'DINO',n:"HF Sinclair",w:0.3},{s:'DTM',n:"DT Midstream",w:0.3},
    {s:'FTI',n:"TechnipFMC",w:0.3},{s:'MTDR',n:"Matador Resources",w:0.3},{s:'MUR',n:"Murphy Oil",w:0.3},
    {s:'NOV',n:"NOV",w:0.3},{s:'OVV',n:"Ovintiv",w:0.3},{s:'PBF',n:"PBF Energy",w:0.3},
    {s:'PR',n:"Permian Resources",w:0.3},{s:'RRC',n:"Range Resources",w:0.3},{s:'VAL',n:"Valaris",w:0.3},
    {s:'VNOM',n:"Viper Energy",w:0.3},{s:'WFRD',n:"Weatherford International",w:0.3},
  ],
  XLB: [
    {s:'AA',n:"Alcoa",w:0.3},{s:'ASH',n:"Ashland Global",w:0.3},{s:'ATR',n:"AptarGroup",w:0.3},
    {s:'AVNT',n:"Avient",w:0.3},{s:'AXTA',n:"Axalta",w:0.3},{s:'CBT',n:"Cabot",w:0.3},
    {s:'CCK',n:"Crown Holdings",w:0.3},{s:'CLF',n:"Cleveland-Cliffs",w:0.3},
    {s:'CMC',n:"Commercial Metals",w:0.3},{s:'EXP',n:"Eagle Materials",w:0.3},{s:'GEF',n:"Greif",w:0.3},
    {s:'GPK',n:"Graphic Packaging",w:0.3},{s:'HL',n:"Hecla Mining",w:0.3},{s:'KNF',n:"Knife River",w:0.3},
    {s:'LPX',n:"Louisiana-Pacific",w:0.3},{s:'MP',n:"MP Materials",w:0.3},{s:'NEU',n:"NewMarket",w:0.3},
    {s:'OLN',n:"Olin",w:0.3},{s:'RGLD',n:"Royal Gold",w:0.3},{s:'RPM',n:"RPM International",w:0.3},
    {s:'RS',n:"Reliance",w:0.3},{s:'SLGN',n:"Silgan Holdings",w:0.3},{s:'SMG',n:"Scotts Miracle-Gro",w:0.3},
    {s:'SON',n:"Sonoco",w:0.3},{s:'WLK',n:"Westlake",w:0.3},
  ],
  XLRE: [
    {s:'ADC',n:"Agree Realty",w:0.3},{s:'AHR',n:"American Healthcare REIT",w:0.3},
    {s:'AMH',n:"American Homes 4 Rent",w:0.3},{s:'BRX',n:"Brixmor Property Group",w:0.3},
    {s:'CDP',n:"COPT Defense Properties",w:0.3},{s:'CUBE',n:"CubeSmart",w:0.3},
    {s:'CUZ',n:"Cousins Properties",w:0.3},{s:'EGP',n:"EastGroup Properties",w:0.3},
    {s:'ELS',n:"Equity Lifestyle Properties",w:0.3},{s:'EPR',n:"EPR Properties",w:0.3},
    {s:'FR',n:"First Industrial Realty Trust",w:0.3},{s:'GLPI',n:"Gaming and Leisure Properties",w:0.3},
    {s:'HR',n:"Healthcare Realty Trust",w:0.3},{s:'IRT',n:"IRT Living",w:0.3},
    {s:'JLL',n:"Jones Lang LaSalle",w:0.3},{s:'KRC',n:"Kilroy Realty",w:0.3},
    {s:'KRG',n:"Kite Realty Group",w:0.3},{s:'LAMR',n:"Lamar Advertising",w:0.3},{s:'NNN',n:"NNN REIT",w:0.3},
    {s:'NSA',n:"National Storage Affiliates Trust",w:0.3},{s:'OHI',n:"Omega Healthcare Investors",w:0.3},
    {s:'PK',n:"Park Hotels & Resorts",w:0.3},{s:'REXR',n:"Rexford Industrial Realty",w:0.3},
    {s:'RYN',n:"Rayonier",w:0.3},{s:'SBRA',n:"Sabra Health Care REIT",w:0.3},
    {s:'STAG',n:"STAG Industrial",w:0.3},{s:'VNO',n:"Vornado Realty Trust",w:0.3},
    {s:'WPC',n:"W. P. Carey",w:0.3},
  ],
  XLU: [
    {s:'BKH',n:"Black Hills",w:0.3},{s:'IDA',n:"Idacorp",w:0.3},{s:'NFG',n:"National Fuel Gas",w:0.3},
    {s:'NJR',n:"New Jersey Resources",w:0.3},{s:'NWE',n:"NorthWestern",w:0.3},{s:'OGE',n:"OGE Energy",w:0.3},
    {s:'OGS',n:"ONE Gas",w:0.3},{s:'ORA',n:"Ormat Technologies",w:0.3},
    {s:'POR',n:"Portland General Electric",w:0.3},{s:'SR',n:"Spire",w:0.3},{s:'SWX',n:"Southwest Gas",w:0.3},
    {s:'TLN',n:"Talen Energy",w:0.3},{s:'TXNM',n:"TXNM Energy",w:0.3},{s:'UGI',n:"UGI",w:0.3},
    {s:'WTRG',n:"Essential Utilities",w:0.3},
  ],
  XLC: [
    {s:'GTM',n:"ZoomInfo",w:0.3},{s:'NXST',n:"Nexstar Media Group",w:0.3},{s:'NYT',n:"New York Times",w:0.3},
    {s:'PINS',n:"Pinterest",w:0.3},{s:'WMG',n:"Warner Music Group",w:0.3},
  ],
};

/* ──────────── NASDAQ-100 (QQQ) hardcoded floor ──────────────────────────────
   Same shape as ETF_HOLDINGS — grouped by the 11 GICS sectors (XL* ETF codes)
   so the scan + filter code works unchanged. NDX has ~100-101 constituents
   (101 when counting GOOG+GOOGL dual-class), heavily weighted to tech and
   comm services. Wikipedia overlay keeps this current at runtime. */
const NASDAQ_100_HOLDINGS = {
  XLK: [
    {s:'AAPL',n:"Apple",w:0.3},{s:'MSFT',n:"Microsoft",w:0.3},{s:'NVDA',n:"Nvidia",w:0.3},
    {s:'AVGO',n:"Broadcom",w:0.3},{s:'ADBE',n:"Adobe",w:0.3},{s:'CSCO',n:"Cisco",w:0.3},
    {s:'AMD',n:"AMD",w:0.3},{s:'TXN',n:"Texas Instruments",w:0.3},{s:'QCOM',n:"Qualcomm",w:0.3},
    {s:'INTU',n:"Intuit",w:0.3},{s:'AMAT',n:"Applied Materials",w:0.3},{s:'MU',n:"Micron",w:0.3},
    {s:'PANW',n:"Palo Alto Networks",w:0.3},{s:'ADP',n:"ADP",w:0.3},{s:'ADI',n:"Analog Devices",w:0.3},
    {s:'LRCX',n:"Lam Research",w:0.3},{s:'INTC',n:"Intel",w:0.3},{s:'KLAC',n:"KLA",w:0.3},
    {s:'SNPS',n:"Synopsys",w:0.3},{s:'CDNS',n:"Cadence Design",w:0.3},
    {s:'CRWD',n:"CrowdStrike",w:0.3},{s:'ASML',n:"ASML",w:0.3},{s:'NXPI',n:"NXP Semiconductors",w:0.3},
    {s:'FTNT',n:"Fortinet",w:0.3},{s:'WDAY',n:"Workday",w:0.3},{s:'ROP',n:"Roper",w:0.3},
    {s:'ADSK',n:"Autodesk",w:0.3},{s:'MRVL',n:"Marvell",w:0.3},{s:'PAYX',n:"Paychex",w:0.3},
    {s:'CTSH',n:"Cognizant",w:0.3},{s:'TEAM',n:"Atlassian",w:0.3},{s:'ON',n:"ON Semiconductor",w:0.3},
    {s:'CDW',n:"CDW",w:0.3},{s:'GFS',n:"GlobalFoundries",w:0.3},{s:'ANSS',n:"Ansys",w:0.3},
    {s:'MCHP',n:"Microchip Technology",w:0.3},{s:'TTD',n:"Trade Desk",w:0.3},
    {s:'MDB',n:"MongoDB",w:0.3},{s:'DDOG',n:"Datadog",w:0.3},{s:'ZS',n:"Zscaler",w:0.3},
    {s:'ARM',n:"Arm Holdings",w:0.3},{s:'APP',n:"AppLovin",w:0.3},{s:'PLTR',n:"Palantir",w:0.3},
    {s:'MSTR',n:"MicroStrategy",w:0.3},
  ],
  XLC: [
    {s:'GOOGL',n:"Alphabet Class A",w:0.3},{s:'GOOG',n:"Alphabet Class C",w:0.3},
    {s:'META',n:"Meta Platforms",w:0.3},{s:'NFLX',n:"Netflix",w:0.3},
    {s:'TMUS',n:"T-Mobile US",w:0.3},{s:'CMCSA',n:"Comcast",w:0.3},
    {s:'WBD',n:"Warner Bros. Discovery",w:0.3},{s:'EA',n:"Electronic Arts",w:0.3},
  ],
  XLY: [
    {s:'AMZN',n:"Amazon",w:0.3},{s:'TSLA',n:"Tesla",w:0.3},{s:'BKNG',n:"Booking Holdings",w:0.3},
    {s:'SBUX',n:"Starbucks",w:0.3},{s:'MELI',n:"MercadoLibre",w:0.3},{s:'ORLY',n:"O'Reilly Automotive",w:0.3},
    {s:'ABNB',n:"Airbnb",w:0.3},{s:'MAR',n:"Marriott",w:0.3},{s:'ROST',n:"Ross Stores",w:0.3},
    {s:'DLTR',n:"Dollar Tree",w:0.3},{s:'LULU',n:"Lululemon",w:0.3},{s:'PDD',n:"PDD Holdings",w:0.3},
  ],
  XLP: [
    {s:'COST',n:"Costco",w:0.3},{s:'PEP',n:"PepsiCo",w:0.3},{s:'MDLZ',n:"Mondelez",w:0.3},
    {s:'MNST',n:"Monster Beverage",w:0.3},{s:'KDP',n:"Keurig Dr Pepper",w:0.3},
    {s:'KHC',n:"Kraft Heinz",w:0.3},
  ],
  XLV: [
    {s:'ISRG',n:"Intuitive Surgical",w:0.3},{s:'AMGN',n:"Amgen",w:0.3},{s:'VRTX',n:"Vertex",w:0.3},
    {s:'GILD',n:"Gilead Sciences",w:0.3},{s:'REGN',n:"Regeneron",w:0.3},{s:'AZN',n:"AstraZeneca",w:0.3},
    {s:'BIIB',n:"Biogen",w:0.3},{s:'DXCM',n:"Dexcom",w:0.3},{s:'IDXX',n:"IDEXX Laboratories",w:0.3},
    {s:'GEHC',n:"GE HealthCare",w:0.3},
  ],
  XLI: [
    {s:'HON',n:"Honeywell",w:0.3},{s:'CTAS',n:"Cintas",w:0.3},{s:'CSX',n:"CSX",w:0.3},
    {s:'PCAR',n:"PACCAR",w:0.3},{s:'FAST',n:"Fastenal",w:0.3},{s:'VRSK',n:"Verisk Analytics",w:0.3},
    {s:'ODFL',n:"Old Dominion Freight Line",w:0.3},{s:'CPRT',n:"Copart",w:0.3},
    {s:'AXON',n:"Axon Enterprise",w:0.3},
  ],
  XLU: [
    {s:'AEP',n:"American Electric Power",w:0.3},{s:'CEG',n:"Constellation Energy",w:0.3},
    {s:'EXC',n:"Exelon",w:0.3},{s:'XEL',n:"Xcel Energy",w:0.3},
  ],
  XLE: [
    {s:'FANG',n:"Diamondback Energy",w:0.3},{s:'BKR',n:"Baker Hughes",w:0.3},
  ],
  XLB: [
    {s:'LIN',n:"Linde",w:0.3},
  ],
};



/* ──────────── [2] CORE app.js ──────────── */
const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r=>setTimeout(r,ms));

// Restore theme preference as early as possible so the rest of the script
// (and the initial paint) sees the correct body.light class without a FOUC.
(function restoreTheme(){
  try {
    if (localStorage.getItem('app_theme') === 'light') {
      document.body.classList.add('light');
    }
  } catch(e){}
})();

let _proxyUrl = localStorage.getItem('app_proxy_url') || '';

const INDICES = [
  {sym:'SPY',  name:'S&P 500'},
  {sym:'QQQ',  name:'נאסד״ק 100'},
  {sym:'DIA',  name:'דאו ג׳ונס'},
  {sym:'IWM',  name:'ראסל 2000'},
];
const OTHER = [
  {sym:'GLD',  name:'זהב'},
  {sym:'SLV',  name:'כסף'},
  {sym:'USO',  name:'נפט'},
  {sym:'IBIT', name:'ביטקוין'},
  {sym:'VIXY', name:'VIX'},
  {sym:'TLT',  name:'אג״ח 20Y'},
  {sym:'UUP',  name:'דולר'},
  {sym:'SMH',  name:'שבבים'},
  {sym:'EEM',  name:'שווקים מתעוררים'},
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
  const zoomLbl=$('mob-zoom-label');
  if(zoomLbl) zoomLbl.textContent=document.body.classList.contains('zoomed')?'בטל מצב מוגדל':'מצב מוגדל';
  const zoomItem=$('mob-zoom-item');
  if(zoomItem) zoomItem.style.color=document.body.classList.contains('zoomed')?'var(--blue)':'';
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

  // 4. עכשיו שיש לנו נתוני מניות בודדות — עדכן את ה-AI Brief עם המלצות ספציפיות
  runAIBrief();
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
  return `<svg viewBox="0 0 ${W} ${H}" class="idx-spark" preserveAspectRatio="none">
    <defs><linearGradient id="${id}" x1="0" x2="0" y1="0" y2="1">
      <stop offset="0%" stop-color="${col}" stop-opacity="0.25"/>
      <stop offset="100%" stop-color="${col}" stop-opacity="0"/>
    </linearGradient></defs>
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
    return `<div class="idx-card ${isUp ? 'idx-up' : 'idx-down'}" onclick="openStockDetail('${s.sym}','${s.name.replace(/'/g,"\\'")}')">
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
  $('pos-mood').textContent=`(${pos}/${vals.length}) — ${p>=70?'יום ירוק — רוח גבית לשוק':p>=50?'מעורב-חיובי — בחר סקטור ספציפי':p>=30?'מעורב-שלילי — היזהר מפוזיציות חדשות':'שלילי חזק — שמור מזומן'}`;
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
  // תא sec-cell ראשון (sticky right, צמוד לצד ימין), אחריו 11 תאי skeleton למספרים
  const mainRows = SECTORS.map(s =>
    `<tr data-sym="${s.sym}" onclick="openSectorModal('${s.sym}','${s.name}')" style="cursor:pointer"><td class="sec-cell">${s.name} <span class="sym">${s.sym}</span></td>${sk.repeat(11)}</tr>`
  );
  mainRows.push(`<tr class="avgrow"><td class="sec-cell">ממוצע סקטורים</td>${sk.repeat(11)}</tr>`);
  $('sector-tbody').innerHTML = mainRows.join('');
}

// ── פונקציות הסנכרון הישנות — מיותרות אחרי איחוד לטבלה יחידה, נשארות כ-no-op ──
function syncFrozenRows() {}
function _doSyncFrozenRows() {}
function initSyncObserver() {}

function renderSectors(){
  // מבנה טבלה יחיד: כל השורות בתוך <tr> אחד — לא עוד div חיצוני נפרד לעמודת סקטור.
  // תא ה-sec-cell הוא התא הראשון (position:sticky;right:0 ב-CSS) ולכן נצמד לצד ימין תמיד, מיושר עם שאר התאים באותה שורה.
  const mainRows = SECTORS.map(s=>{
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
    return`<tr data-sym="${s.sym}" onclick="openSectorModal('${s.sym}','${s.name}')" title="לחץ לראות אחזקות" style="cursor:pointer">
      <td class="sec-cell">${s.name} <span class="sym">${s.sym}</span></td>
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
  mainRows.push(`<tr class="avgrow">
    <td class="sec-cell">ממוצע סקטורים</td>
    ${periodAvgs.map((v)=>`<td class="${cellCls(v)}">${pct(v)}</td>`).join('')}<td></td><td></td><td></td><td></td>
    <td class="${cellCls(ov)}"><b>${pct(ov)}</b></td>
  </tr>`);
  $('sector-tbody').innerHTML=mainRows.join('');
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

// If theme was restored to light by the early IIFE, swap the hardcoded
// sun-icons in the HTML to moon-icons so they match the current state.
if (!isDark) {
  const _tb = $('theme-btn');
  if (_tb) _tb.innerHTML = moonSVG;
  const _mb = $('mob-theme-icon');
  if (_mb) {
    const tmpl = document.createElement('template');
    tmpl.innerHTML = moonSVG.trim();
    const fresh = tmpl.content.firstChild;
    if (fresh && fresh.tagName && fresh.tagName.toLowerCase() === 'svg') {
      fresh.id = 'mob-theme-icon';
      _mb.parentNode.replaceChild(fresh, _mb);
    }
  }
}

function toggleTheme(){
  isDark=!isDark;
  document.body.classList.toggle('light',!isDark);
  try { localStorage.setItem('app_theme', isDark ? 'dark' : 'light'); } catch(e){}
  {
    const _tb = $('theme-btn');
    if (_tb) _tb.innerHTML = isDark ? sunSVG : moonSVG;
    // Keep the mobile-menu theme icon in sync too.
    const _mb = $('mob-theme-icon');
    if (_mb) {
      // Replace the <svg id="mob-theme-icon"> element with the new one,
      // preserving the id so subsequent toggles keep working.
      const tmpl = document.createElement('template');
      tmpl.innerHTML = (isDark ? sunSVG : moonSVG).trim();
      const fresh = tmpl.content.firstChild;
      if (fresh && fresh.tagName && fresh.tagName.toLowerCase() === 'svg') {
        fresh.id = 'mob-theme-icon';
        _mb.parentNode.replaceChild(fresh, _mb);
      }
    }
  }
  // Re-render anything that caches color values (sector table cells,
  // summary cards, heatmap) so they pick up the theme immediately.
  try { if (typeof renderSectors==='function') renderSectors(); } catch(e){}
  try { if (typeof renderSummary==='function') renderSummary(); } catch(e){}
  try { if (typeof window.syncSidebarHeatmap==='function') window.syncSidebarHeatmap(); } catch(e){}
  // YTD bars + correlation matrix bake in theme-specific colors at
  // render-time; re-run them so they pick up the new theme's palette.
  try { if (typeof renderYTDChart==='function') renderYTDChart(); } catch(e){}
  try { if (typeof renderCorrelationMatrix==='function') renderCorrelationMatrix(); } catch(e){}
  // Macro charts have hardcoded-at-build-time axis colors; refresh them.
  try { if (typeof window.rerenderMacroCharts==='function') window.rerenderMacroCharts(); } catch(e){}
  drawChart();
}

// ── ZOOM TOGGLE ─────────────────────────────────────
const zoomInSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`;
const zoomOutSVG = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round" width="16" height="16"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="8" y1="11" x2="14" y2="11"/></svg>`;

function applyZoom(isZoomed) {
  document.body.classList.toggle('zoomed', isZoomed);
  const btn = $('zoom-btn');
  if (btn) {
    btn.innerHTML = isZoomed ? zoomOutSVG : zoomInSVG;
    btn.title = isZoomed ? 'מצב רגיל' : 'מצב מוגדל';
    btn.style.color = isZoomed ? 'var(--blue)' : '';
  }
}
function toggleZoom() {
  const isZoomed = !document.body.classList.contains('zoomed');
  localStorage.setItem('app_zoom', isZoomed ? '1' : '0');
  applyZoom(isZoomed);
}
// Restore zoom on load
(function(){
  const saved = localStorage.getItem('app_zoom');
  if (saved === '1') applyZoom(true);
})();

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
  $('sp-body').innerHTML = `
    <div class="sp-loading-screen">
      <div class="sp-loading-sym">${sym}</div>
      <div class="sp-loading-name">${name !== sym ? name : ''}</div>
      <div class="sp-loading-spinner">
        <svg class="sp-loading-svg" viewBox="0 0 50 50">
          <circle cx="25" cy="25" r="20" fill="none" stroke="var(--border2)" stroke-width="3"/>
          <circle cx="25" cy="25" r="20" fill="none" stroke="var(--blue)" stroke-width="3"
            stroke-dasharray="40 90" stroke-linecap="round" stroke-dashoffset="0">
            <animateTransform attributeName="transform" type="rotate"
              from="0 25 25" to="360 25 25" dur="0.6s" repeatCount="indefinite"/>
          </circle>
        </svg>
      </div>
      <div class="sp-loading-lbl">טוען נתונים...</div>
      <div class="sp-loading-skeletons">
        <div class="sp-sk-bar" style="width:60%"></div>
        <div class="sp-sk-bar" style="width:40%"></div>
        <div class="sp-sk-bar" style="width:75%"></div>
      </div>
    </div>`;

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
    // Company description — Wikipedia Hebrew (search by name) + Yahoo fallback
    let companyDesc = '';
    // Try Wikipedia Hebrew — search by company name
    try {
      const companyName = meta.longName || meta.shortName || name || sym;
      const wikiSearchUrl = `https://he.wikipedia.org/w/api.php?action=query&list=search&srsearch=${encodeURIComponent(companyName)}&format=json&origin=*&srlimit=1&srprop=snippet`;
      const wsRes = await fetch(wikiSearchUrl); // direct — Wikipedia allows CORS
      if (wsRes.ok) {
        const wsData = await wsRes.json();
        const pageTitle = wsData.query?.search?.[0]?.title;
        if (pageTitle) {
          const wUrl = `https://he.wikipedia.org/api/rest_v1/page/summary/${encodeURIComponent(pageTitle)}`;
          const wRes = await fetch(wUrl);
          if (wRes.ok) {
            const wd = await wRes.json();
            if (wd.extract && wd.extract.length > 60) companyDesc = wd.extract;
          }
        }
      }
    } catch(e) {}
    // Fallback: removed (Yahoo 401)
    const finalDesc = companyDesc;
    // Store globally for tab switching
    window._spData = {sym, name, meta, chartTs, chartCl, chartVol, news, dq, macro};
    renderStockDetail(sym, name, meta, chartTs, chartCl, chartVol, news, dq, {}, macro, finalDesc);
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
      onmousemove="_chartMove(event,this)" onmouseleave="_chartLeave()"/>`;

  // Add touch listeners passively after render (avoids violation warning)
  window._chartAttachTouch = () => {
    const el = document.getElementById('sp-xh-overlay');
    if (!el) return;
    el.addEventListener('touchmove', e => _chartMove(e, el), {passive:true});
    el.addEventListener('touchend', () => _chartLeave(), {passive:true});
  };
  setTimeout(() => window._chartAttachTouch && window._chartAttachTouch(), 50);
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

async function _translateDesc(btn) {
  const text = btn.dataset.text; if (!text) return;
  btn.textContent = 'מתרגם...';
  btn.style.pointerEvents = 'none';
  try {
    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method:'POST',
      headers:{'Content-Type':'application/json'},
      body: JSON.stringify({
        model:'claude-sonnet-4-20250514',
        max_tokens:400,
        messages:[{role:'user', content:`תרגם את הטקסט הבא לעברית תמציתית (3-4 משפטים מקסימום). ענה רק בעברית, ללא הקדמה:\n\n${text}`}]
      })
    });
    const d = await res.json();
    const translated = d.content?.[0]?.text || '';
    if (translated) {
      const p = btn.previousElementSibling;
      if (p) { p.textContent = translated; p.classList.add('sp-desc-translated'); }
      btn.remove();
    } else { btn.textContent = 'שגיאה בתרגום'; }
  } catch(e) { btn.textContent = 'שגיאה בתרגום'; }
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

function renderStockDetail(sym, name, meta, timestamps, closes, volumes, news, dq, fundData={}, macro={series:[],results:{},sector:null}, companyDesc='') {
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
    ...(meta.sector    ? [{ label:'Sector',    val: meta.sector }] : []),
    ...(meta.industry  ? [{ label:'Industry',  val: meta.industry }] : []),
    ...(meta.location  ? [{ label:'Location',  val: meta.location }] : []),
    ...(meta.fullTimeEmployees ? [{ label:'Employees', val: Number(meta.fullTimeEmployees).toLocaleString() }] : []),
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

  // Company description card (if available)
  const descCard = companyDesc ? `
    <div class="sp-section-card" style="margin:12px 0 0">
      <div class="sp-section-hdr">אודות החברה</div>
      <div class="sp-desc-body">
        <p class="sp-desc-en">${companyDesc}</p>
      </div>
    </div>` : '';

  // Sidebar: section cards with header INSIDE the card
  const sidebarHtml = `
    <div class="sp-section-card" style="margin:0 0 12px">
      <div class="sp-section-hdr">פרופיל</div>
      <div style="padding:10px 12px">${profileCardHtml}</div>
    </div>
    ${descCard}
    <div class="sp-section-card" style="margin:12px 0 0">
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
    renderCards('idx-other', OTHER, ['יום'], ['d1']);
    // שעון השוק עבר לכותרת — אין צורך בכרטיסיית גריד

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
    runAIBrief();
    // Auto-run breadth scan (no user click required) — will refresh AI Brief when done
    setTimeout(() => { try { runBreadth(); } catch(e) { console.warn('breadth auto-scan failed', e); } }, 800);
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
      countdownText = `פרי-מרקט בעוד <b>${String(Math.floor(rem/60)).padStart(2,'0')}:${String(rem%60).padStart(2,'0')}</b><br><span style="font-size:9px;opacity:.7">ישראל ${formatIL(4,0)}</span>`;
    } else if (totalMin < 9*60+30) {
      status = 'פרי-מרקט'; cls = 'pre';
      const rem = 9*60+30 - totalMin;
      const remS = (60 - s) % 60;
      const remM = remS > 0 ? rem - 1 : rem;
      countdownText = `פתיחה בעוד <b>${String(Math.floor(rem/60)).padStart(2,'0')}:${String(rem%60).padStart(2,'0')}</b><br><span style="font-size:9px;opacity:.7">ישראל ${formatIL(9,30)}</span>`;
    } else if (totalMin < 16*60) {
      status = 'שוק פתוח'; cls = 'open';
      const rem = 16*60 - totalMin;
      const remS = (60 - s) % 60;
      const remM = remS > 0 ? rem - 1 : rem;
      countdownText = `סגירה בעוד <b>${String(Math.floor(rem/60)).padStart(2,'0')}:${String(rem%60).padStart(2,'0')}</b><br><span style="font-size:9px;opacity:.7">ישראל ${formatIL(16,0)}</span>`;
    } else if (totalMin < 20*60) {
      status = 'אפטר-אוורס'; cls = 'after';
      const rem = 20*60 - totalMin;
      const remS = (60 - s) % 60;
      const remM = remS > 0 ? rem - 1 : rem;
      countdownText = `נסגר בעוד <b>${String(Math.floor(rem/60)).padStart(2,'0')}:${String(rem%60).padStart(2,'0')}</b>`;
    } else {
      status = 'סגור'; cls = 'closed';
      countdownText = `פרי-מרקט מחר<br><span style="font-size:9px;opacity:.7">ישראל ${formatIL(4,0)}</span>`;
    }
    dotEl.className = `market-dot ${cls}`;
    lblEl.className = `market-label ${cls}`;
    lblEl.textContent = status;
    cntEl.innerHTML = countdownText;
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
    const color = isPos ? (isL ? '#0a7a38' : '#00e87a') : (isL ? '#a31532' : '#ff3a5c');
    const bgColor = isPos ? (isL ? 'rgba(10,122,56,.28)' : 'rgba(0,232,122,.1)') : (isL ? 'rgba(163,21,50,.28)' : 'rgba(255,58,92,.1)');
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
        html += `<td class="corr-self">1.0</td>`;
      } else {
        const r = pearson(a, b);
        if (r == null) { html += `<td style="color:var(--dim)">–</td>`; return; }
        const v = parseFloat(r.toFixed(2));
        // צבע: ירוק = מתאם גבוה, אדום = הפוך, אפור = ניטרלי
        const intensity = Math.abs(v);
        let bg;
        if (v > 0.6) bg = isL ? `rgba(10,122,56,${intensity*.22})` : `rgba(0,232,122,${intensity*.25})`;
        else if (v < -0.2) bg = isL ? `rgba(163,21,50,${intensity*.22})` : `rgba(255,58,92,${intensity*.25})`;
        else bg = 'transparent';
        const col2 = v > 0.5 ? (isL?'#0a6e34':'#00e87a') : v < -0.1 ? (isL?'#8a1029':'#ff3a5c') : (isL?'#5a6a7a':'#5070a0');
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
  if (btn) { btn.textContent = '...סורק'; btn.disabled = true; }
  $('breadth-big').textContent = '⏳';
  $('breadth-sub').textContent = 'סורק 60 מניות מובילות...';
  $('breadth-above').textContent = '–';
  $('breadth-total').textContent = '–';
  const adviceEl = $('breadth-advice');
  if (adviceEl) { adviceEl.innerHTML = ''; adviceEl.className = 'breadth-advice'; }

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

  // Show the refresh button for subsequent re-scans (Hebrew)
  const refreshBtn = document.getElementById('breadth-refresh-btn');
  if (btn) { btn.textContent = '↻ רענן'; btn.disabled = false; }
  if (refreshBtn) refreshBtn.style.display = '';

  if (!total) {
    $('breadth-big').textContent = '?';
    $('breadth-sub').textContent = 'שגיאת טעינה';
    if (adviceEl) {
      adviceEl.className = 'breadth-advice warn';
      adviceEl.innerHTML = `<span class="br-headline">לא ניתן לטעון נתונים</span>בדוק חיבור לאינטרנט. לחץ על רענן כדי לנסות שוב.`;
    }
    return;
  }

  const pct = Math.round((above / total) * 100);
  // Color tiers: >=85 overheated (amber), 60-84 healthy green, 40-59 mixed amber, 25-39 orange, <25 red
  const color = pct >= 85 ? '#f59e0b'
              : pct >= 60 ? 'var(--green)'
              : pct >= 40 ? '#f59e0b'
              : pct >= 25 ? '#f97316'
              : 'var(--red)';
  $('breadth-big').textContent = pct + '%';
  $('breadth-big').style.color = color;
  $('breadth-fill').style.width = pct + '%';
  $('breadth-fill').style.background = color;
  $('breadth-above').textContent = `${above} מעל`;
  $('breadth-total').textContent = `מתוך ${total}`;

  // ── Tiered Hebrew insight + actionable advice ──
  let subText, adviceClass, adviceHead, adviceBody;
  if (pct >= 85) {
    subText = 'שוק מתוח מדי';
    adviceClass = 'warn';
    adviceHead = 'שוק במצב "מתוח" (overextended)';
    adviceBody = `מעל 85% מהמניות מעל הממוצע — רמה נדירה שבעבר קידמה <b>תיקון של 2-5%</b>. אם יש רווחים פתוחים — שקול לנעול ${pct >= 90 ? '30-50%' : '20-30%'} מהפוזיציות. <b>לא הזמן להגדיל חשיפה</b> או לרדוף אחרי עליות.`;
  } else if (pct >= 60) {
    subText = 'שוק בריא — עלייה רחבה';
    adviceClass = '';
    adviceHead = 'מגמה חיובית עם תמיכה רחבה';
    adviceBody = `רוב המניות מעל הממוצע — ראלי בריא, לא מוטה מניות בודדות. <b>אפשר לפתוח לונג</b> בסקטורים מובילים. שים Trailing Stop של 2-3% מתחת למחיר כדי להגן על רווחים. העדף מניות במשקל גבוה בסקטור המוביל.`;
  } else if (pct >= 40) {
    subText = 'שוק מעורב — בדוק סקטור';
    adviceClass = 'warn';
    adviceHead = 'רוחב מעורב — סלקטיביות חשובה';
    adviceBody = `רק ${pct}% מהמניות מעל הממוצע — המדדים אולי עולים, אבל <b>העלייה לא רחבה</b>. לפעמים זה מוקדם לפני תיקון. אם נכנסים לפוזיציה — בחר <b>סקטור מוביל ספציפי</b> בלבד, עם Stop Loss של 3%. אל תרכוש סל רחב.`;
  } else if (pct >= 25) {
    subText = 'רוחב חלש — הקטן חשיפה';
    adviceClass = 'danger';
    adviceHead = 'רוב המניות מתחת לממוצע';
    adviceBody = `רק ${above} מתוך ${total} מניות מעל ממוצע 200 יום. <b>זו לא עלייה בריאה</b>, גם אם S&P נראה חזק. הקטן חשיפה ל-50%, עבור לסקטורים דפנסיביים (XLP/XLU/XLV). <b>אל תתפוס תחתית</b> בסקטורים חלשים — חכה ל-3 ימים ירוקים רצופים.`;
  } else {
    subText = 'פירוק שוק — אזהרה';
    adviceClass = 'danger';
    adviceHead = 'פירוק שוק נרחב — סיכון גבוה';
    adviceBody = `פחות מרבע מהמניות מעל הממוצע. היסטורית, רמות כאלה מלוות ב<b>המשך ירידות</b> לפני התייצבות. המלצה: <b>שמור מזומן</b>, אל תפתח פוזיציות חדשות, שקול הגנה על פוזיציות קיימות (Stop Loss קרוב או Put options). חכה לאות הפוך לפני חזרה.`;
  }
  $('breadth-sub').textContent = subText;
  if (adviceEl) {
    adviceEl.className = 'breadth-advice' + (adviceClass ? ' ' + adviceClass : '');
    adviceEl.innerHTML = `<span class="br-headline">${adviceHead}</span>${adviceBody}`;
  }

  // Refresh AI Brief so its Breadth card picks up the new value
  if (typeof window.simpleAIBrief === 'function') {
    setTimeout(() => { try { window.simpleAIBrief(); } catch(e){} }, 30);
  }
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

  const mood = pctUp >= 0.7 ? '↑↑ שוק חיובי — הצטרף למגמה' : pctUp >= 0.5 ? '↗ מעורב — בחר סקטור חזק' : pctUp >= 0.3 ? '↘ חלשלש — צמצם חשיפה' : '↓ שלילי — שמור מזומן';
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

  // Educational "Why" content for each insight type
  const whyData = {
    'bull_mood': {why:'שוק ירוק רחב (הרבה סקטורים עולים) הוא סימן ל"בריאות" — העלייה אמיתית ולא תלויה במניה אחת.',action:'הצטרף למגמה דרך הסקטור המוביל. הגדר Trailing Stop ל-2-3% מתחת למחיר.'},
    'bear_mood': {why:'כשרוב הסקטורים יורדים, אין לאן "להתחבא" בתוך השוק. זה כמו גשם — כולם נרטבים.',action:'שמור מזומן, הקטן חשיפה. חכה ליום שבו 70%+ מהסקטורים יעלו לפני שתיכנס מחדש.'},
    'mixed_mood': {why:'שוק מפוצל אומר שאין הסכמה בין המשקיעים. חלק קונים, חלק מוכרים — אין כיוון.',action:'בחר סקטור חזק ספציפי במקום ETF רחב. אל תשקיע "בשוק כולו" כשאין כיוון.'},
    'sector_top': {why:'הסקטור החזק ביותר היום הוא המקום שבו הכסף זורם. "Follow the money".',action:'לחץ על הסקטור בטבלה כדי לראות אילו מניות בתוכו עולות הכי הרבה.'},
    'sector_weak': {why:'הסקטור החלש = שם אנשים מוכרים. להיכנס לסקטור חלש זה כמו לשחות נגד הזרם.',action:'הימנע מקנייה בסקטור הזה עד שיראה סימני התאוששות (3 ימי עלייה ברצף).'},
    'vix_signal': {why:'VIX מודד כמה השוק "מפחד" מתנודות. VIX גבוה = אנשים קונים ביטוח → מניות יורדות.',action:'VIX מעל 25? הקטן חשיפה. VIX מתחת 15? סביבה נוחה לקנייה.'},
    'tactical': {why:'המלצה המבוססת על שילוב של מדד הפחד/חמדנות, רוחב שוק, ומומנטום — לא מדד בודד.',action:'השתמש בהמלצה כ"מצפן" — לא כהוראה. תמיד בדוק שהנתון הספציפי תומך לפני שאתה פועל.'}
  };

  // Assign why keys to cards
  const whyKeys = ['bull_mood','sector_top','sector_weak','vix_signal','tactical'];
  if (pctUp >= 0.7) whyKeys[0] = 'bull_mood';
  else if (pctUp < 0.45) whyKeys[0] = 'bear_mood';
  else whyKeys[0] = 'mixed_mood';

  grid.innerHTML = cards.map((c,i)=>{
    const wKey = whyKeys[i] || 'tactical';
    const w = whyData[wKey];
    const whyId = 'why-'+i;
    const whySection = w ? `
      <button class="insight-why-btn" onclick="this.nextElementSibling.classList.toggle('open');this.textContent=this.nextElementSibling.classList.contains('open')?'הסתר הסבר':'למה זה חשוב?'">למה זה חשוב?</button>
      <div class="insight-why-content" id="${whyId}">
        <div class="why-analogy">${w.why}</div>
        <div style="margin-top:5px;color:var(--blue)"><b>מה לעשות:</b> ${w.action}</div>
      </div>` : '';
    return `
    <div class="insight-card">
      <div class="insight-card-hdr ${c.type}">${icons[c.type]||''}${c.title}</div>
      <div class="insight-card-body">${c.body}</div>
      ${whySection}
    </div>`;
  }).join('');

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
  DGS10:      {name:'10Y Treasury',    he:'תשואת אגרות חוב 10 שנים. עולה = מניות בלחץ (במיוחד טכנולוגיה). יורדת = רוח גבית למניות.',     suffix:'%'},
  FEDFUNDS:   {name:'Fed Funds Rate',  he:'ריבית הבנק המרכזי. עולה = הלוואות יקרות, חברות מרוויחות פחות, מכפילים יורדים. יורדת = דלק לשוק.',  suffix:'%'},
  T10Y2Y:     {name:'Yield Curve',     he:'הפרש ריבית 10 שנים מינוס 2 שנים. שלילי = אזהרת מיתון! חיובי = כלכלה בריאה.', suffix:'%'},
  DCOILWTICO: {name:'WTI Crude Oil',   he:'מחיר נפט. עולה = עלויות ייצור עולות, אינפלציה עולה. יורד = הקלה לכלכלה.',               suffix:'$'},
  MORTGAGE30US:{name:'Mortgage 30Y',  he:'ריבית משכנתא 30 שנה. עולה = אנשים קונים פחות דירות = לחץ על סקטור נדל"ן.',             suffix:'%'},
  UMCSENT:    {name:'Consumer Sentiment',he:'עד כמה הצרכנים אופטימיים. גבוה = קונים יותר = טוב לסקטור צריכה.',             suffix:''},
  VIXCLS:     {name:'VIX',            he:'מדד הפחד של וול סטריט. מתחת 15 = רגוע, 15-25 = נורמלי, מעל 25 = חרדה, מעל 35 = פאניקה.',        suffix:''},
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
  {id:10,  name:'CPI Report', nameHe:'מדד המחירים לצרכן',
   impact:'high', time:'08:30 ET', url:'https://www.bls.gov/cpi/',
   he:'מדד המחירים לצרכן = כמה עלו המחירים בסופר ובחנויות. גבוה מהצפוי? הפד יעלה ריבית → מניות יורדות. נמוך? ריבית תרד → מניות עולות.',
   details:{
     what:'מודד את קצב עליית המחירים של סל מוצרים ושירותים שצרכנים קונים. מתפרסם חודשי ומהווה את מדד האינפלציה המרכזי בארה״ב.',
     bullish:'אינפלציה נמוכה מהצפוי → הפד יוכל להוריד ריבית → מניות טכנולוגיה וצמיחה עולות.',
     bearish:'אינפלציה גבוהה מהצפוי → הפד ישמור ריבית גבוהה או יעלה → אג״ח ומניות יורדות.',
     tip:'התנודתיות הגדולה ב-30-60 הדקות הראשונות אחרי 08:30 ET. הימנע מפוזיציות גדולות לפני הפרסום.'
   }},

  {id:50,  name:'NFP — Non-Farm Payrolls', nameHe:'דוח תעסוקה',
   impact:'high', time:'08:30 ET', url:'https://www.bls.gov/news.release/empsit.toc.htm',
   he:'כמה משרות חדשות נוצרו בחודש. הרבה = כלכלה חזקה (אבל הפד עלול לשמור ריבית גבוהה). מעט = חולשה (הפד עשוי להוריד ריבית → טוב למניות).',
   details:{
     what:'דוח חודשי על מספר המשרות החדשות (מחוץ לחקלאות), שיעור האבטלה, וקצב הגידול בשכר בארה״ב.',
     bullish:'הרבה משרות + שכר מתון → כלכלה חזקה בלי לחץ אינפלציוני → טוב למניות.',
     bearish:'פחות משרות מהצפוי → חשש ממיתון. או: שכר שעולה חזק מדי → חשש מאינפלציה. שניהם → מניות יורדות.',
     tip:'מתפרסם יום שישי הראשון של החודש. הנתון הכי תנודתי לשוק — צפה לתזוזות של 1-2% במדדים.'
   }},

  {id:54,  name:'PCE Price Index', nameHe:'מדד מחירי PCE',
   impact:'high', time:'08:30 ET', url:'https://www.bea.gov/data/personal-consumption-expenditures-price-index',
   he:'מדד האינפלציה שהפד מסתכל עליו הכי הרבה. זה ה"מבחן" שקובע אם הריבית תעלה או תרד.',
   details:{
     what:'מדד האינפלציה המועדף על הפד. גרסת "Core PCE" (ללא מזון ואנרגיה) היא הנתון שהפד באמת מתמקד בו ביחס ליעד 2%.',
     bullish:'Core PCE מתקרב ל-2% → הפד יכול להתחיל/להמשיך להוריד ריבית.',
     bearish:'Core PCE "תקוע" מעל 2.5% → הפד ישמור ריבית גבוהה זמן רב יותר.',
     tip:'אם ה-PCE סותר את ה-CPI בכיוון — הפד מסתמך בעיקר על ה-PCE. עקוב אחרי השינוי השנתי ב-Core.'
   }},

  {id:53,  name:'GDP (Advance)', nameHe:'תמ״ג — אומדן ראשון',
   impact:'high', time:'08:30 ET', url:'https://www.bea.gov/data/gdp/gross-domestic-product',
   he:'גודל הכלכלה. עלייה = כלכלה צומחת = טוב למניות. שני רבעונים שליליים ברצף = "מיתון" = שוק יורד חזק.',
   details:{
     what:'שיעור צמיחת התמ״ג השנתי (מנורמל) ברבעון. "Advance" = האומדן הראשון והמשפיע ביותר על השוק.',
     bullish:'צמיחה בריאה (2-3%) → חברות מרוויחות יותר → מניות עולות, במיוחד מחזוריות.',
     bearish:'צמיחה שלילית שני רבעונים ברצף = מיתון טכני → מניות יורדות, בטיחות (XLU, XLP) עדיפות.',
     tip:'חשוב לא פחות מהצמיחה: רכיב האינפלציה (GDP Deflator) והצריכה הפרטית בתוך הדוח.'
   }},

  {id:31,  name:'PPI Report', nameHe:'מדד מחירי היצרן',
   impact:'medium', time:'08:30 ET', url:'https://www.bls.gov/ppi/',
   he:'מחירי הייצור — כמה עולה ליצרנים לייצר. אם המחירים עולים, זה יגיע גם אלינו כצרכנים (אינפלציה עתידית).',
   details:{
     what:'מודד כמה היצרנים משלמים על חומרי גלם וייצור. מתפרסם יום לפני ה-CPI ומשמש כחיזוי מקדים.',
     bullish:'PPI יורד → סימן שה-CPI של מחר עשוי להפתיע כלפי מטה → מניות עולות.',
     bearish:'PPI מזנק → עלויות ייצור יתגלגלו לצרכן → אינפלציה עתידית → מניות יורדות.',
     tip:'לבדו פחות זז את השוק — אבל חשוב לחיזוי התגובה ל-CPI של הבוקר שאחריו.'
   }},

  {id:84,  name:'Retail Sales', nameHe:'מכירות קמעונאיות',
   impact:'medium', time:'08:30 ET', url:'https://www.census.gov/retail/index.html',
   he:'כמה אנשים קונים. 70% מהכלכלה האמריקאית = קניות. אם אנשים מפסיקים לקנות → חברות מרוויחות פחות → מניות יורדות.',
   details:{
     what:'שינוי חודשי בהיקף המכירות הקמעונאיות בארה״ב. הצריכה הפרטית היא כ-70% מהתמ״ג.',
     bullish:'מכירות חזקות → הצרכן האמריקאי בריא → טוב ל-XLY (Consumer Discretionary) ולמניות קמעונאיות.',
     bearish:'ירידה/היחלשות → חשש ממיתון, פגיעה ברווחיות הקמעונאיות, לחץ על XLY.',
     tip:'שים לב ל-"Control Group" — גרסה שמנטרלת רכב ובנזין, והיא המשמעותית באמת לכלכלנים.'
   }},

  {id:180, name:'Initial Jobless Claims', nameHe:'תביעות אבטלה ראשוניות',
   impact:'medium', time:'08:30 ET', url:'https://www.dol.gov/ui/data.pdf',
   he:'כמה אנשים הגישו תביעות אבטלה השבוע. עלייה = שוק העבודה מתרופף. ירידה = שוק עבודה חזק.',
   details:{
     what:'מספר התביעות החדשות לאבטלה בשבוע שעבר. נתון שבועי שמודד את חום שוק העבודה בזמן אמת.',
     bullish:'מתחת ל-230K → שוק עבודה חזק אך לא "חם מדי" מבחינת הפד.',
     bearish:'זינוק פתאומי מעל 300K → סימן מוקדם לחולשה כלכלית ופיטורים המוניים.',
     tip:'פחות תנודתי משאר הנתונים. עקוב אחרי הממוצע של 4 שבועות כדי לסנן רעש.'
   }},
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
          events.push({date:rd.date, name:rel.name, nameHe:rel.nameHe, he:rel.he, details:rel.details, impact:rel.impact, time:rel.time, url:rel.url, d:new Date(rd.date+'T12:00:00')});
      });
    } catch(e) {}
  }));

  // Add FOMC
  const y = today.getFullYear();
  [...(FOMC_DATES[y]||[]), ...(FOMC_DATES[y+1]||[])].forEach(date => {
    if (date >= start && date <= end)
      events.push({
        date, name:'FOMC Decision', nameHe:'החלטת ריבית הפד',
        impact:'high', time:'14:00 ET',
        url:'https://www.federalreserve.gov/monetarypolicy/fomccalendars.htm',
        d:new Date(date+'T12:00:00'),
        he:'החלטת ריבית הפד — היום הכי חשוב בלוח השנה! הפד מחליט אם להעלות, להוריד, או להשאיר את הריבית. העלאה = מניות בלחץ. הורדה = מניות עולות. השוק זז חזק ב-30 הדקות אחרי ההודעה.',
        details:{
          what:'הפד מכריז על ריבית הבסיס, מפרסם "dot plot" (תחזיות חברי הוועדה), ומקיים מסיבת עיתונאים עם פאוול.',
          bullish:'הורדת ריבית או איתות "dovish" → כסף זול → מניות טכנולוגיה וצמיחה עולות חזק.',
          bearish:'העלאת ריבית או טון "hawkish" → מניות יורדות, במיוחד טכנולוגיה; אג״ח יורדות.',
          tip:'ההכרזה ב-14:00 ET, מסיבת העיתונאים ב-14:30. התנודתיות האמיתית בשאלות לפאוול. אין להחזיק פוזיציות גדולות ללא גידור.'
        }
      });
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

  window._econEvents = events; // נשמר גלובלית עבור מודאל ה-Preview

  wrap.innerHTML = events.map((e, i) => {
    const isToday = e.d.toDateString() === todayD.toDateString();
    const isPast  = e.d < todayD;
    const cls = isPast ? 'econ-past' : isToday ? 'econ-today-row' : '';
    const displayName = e.nameHe || e.name;
    return `<div class="econ-row ${cls}" onclick="openEconPreview(${i})" style="cursor:pointer;display:flex">
      <div class="econ-date-col">
        <div class="econ-day">${e.d.getDate()}</div>
        <div class="econ-mon">${MONTHS_EN[e.d.getMonth()]}</div>
        <div class="econ-dow">${DAYS_HE[e.d.getDay()]}</div>
      </div>
      <div class="econ-body">
        <div class="econ-name">${displayName}${isToday?' <span style="color:var(--blue);font-size:9px">• היום</span>':''}</div>
        <div class="econ-he">${e.he}</div>
        <div class="econ-impact">
          <div class="econ-dot ${e.impact}"></div>
          <span class="econ-impact-lbl">${e.impact==='high'?'השפעה גבוהה':'בינונית'}</span>
        </div>
      </div>
      <div class="econ-time">${e.time}</div>
    </div>`;
  }).join('') + '<div style="padding:6px 12px 8px;text-align:left;font-size:9px;color:var(--dim);opacity:.6">מקור: FRED — Federal Reserve Bank of St. Louis</div>';
}

// ── ECON PREVIEW MODAL ──
function openEconPreview(idx) {
  const e = (window._econEvents || [])[idx];
  if (!e) return;

  const existing = document.getElementById('econ-preview-overlay');
  if (existing) existing.remove();

  const DAYS_HE_FULL = ['ראשון','שני','שלישי','רביעי','חמישי','שישי','שבת'];
  const MONTHS_HE    = ['ינואר','פברואר','מרץ','אפריל','מאי','יוני','יולי','אוגוסט','ספטמבר','אוקטובר','נובמבר','דצמבר'];
  const displayName  = e.nameHe || e.name;
  const englishName  = e.nameHe ? e.name : '';
  const dateStr      = `יום ${DAYS_HE_FULL[e.d.getDay()]}, ${e.d.getDate()} ב${MONTHS_HE[e.d.getMonth()]} ${e.d.getFullYear()}`;
  const impactLabel  = e.impact === 'high' ? 'השפעה גבוהה' : 'השפעה בינונית';
  const impactColor  = e.impact === 'high' ? '#ef4444' : '#f59e0b';
  const d            = e.details || {};

  const overlay = document.createElement('div');
  overlay.id = 'econ-preview-overlay';
  overlay.className = 'modal-overlay open';
  overlay.style.cssText = 'direction:rtl';
  overlay.innerHTML = `
    <div class="modal" style="max-width:540px">
      <div class="modal-hdr">
        <div style="flex:1;min-width:0">
          <div class="modal-title">${displayName}</div>
          ${englishName ? `<div class="modal-sub" style="font-family:var(--mono);direction:ltr;text-align:right;letter-spacing:.3px">${englishName}</div>` : ''}
        </div>
        <button class="modal-close" onclick="document.getElementById('econ-preview-overlay').remove()">×</button>
      </div>
      <div class="modal-body">
        <div style="display:flex;gap:8px;flex-wrap:wrap;margin-bottom:16px">
          <div style="background:var(--bg3);border:1px solid var(--border);padding:5px 10px;border-radius:6px;font-size:11px;color:var(--text)">${dateStr}</div>
          <div style="background:var(--bg3);border:1px solid var(--border);padding:5px 10px;border-radius:6px;font-size:11px;font-family:var(--mono);color:var(--text)">${e.time}</div>
          <div style="background:${impactColor}22;border:1px solid ${impactColor}44;padding:5px 10px;border-radius:6px;font-size:11px;font-weight:700;color:${impactColor}">● ${impactLabel}</div>
        </div>

        <div class="econ-prev-section">
          <div class="econ-prev-lbl">מה זה מודד?</div>
          <div class="econ-prev-txt">${d.what || e.he || ''}</div>
        </div>

        ${d.bullish ? `
        <div class="econ-prev-section">
          <div class="econ-prev-lbl" style="color:var(--green)">▲ תרחיש חיובי לשוק</div>
          <div class="econ-prev-txt">${d.bullish}</div>
        </div>` : ''}

        ${d.bearish ? `
        <div class="econ-prev-section">
          <div class="econ-prev-lbl" style="color:var(--red)">▼ תרחיש שלילי לשוק</div>
          <div class="econ-prev-txt">${d.bearish}</div>
        </div>` : ''}

        ${d.tip ? `
        <div class="econ-prev-section" style="background:var(--bg3);padding:10px 12px;border-radius:8px;border-right:3px solid var(--blue);margin-top:14px">
          <div class="econ-prev-lbl" style="color:var(--blue)">טיפ מסחר</div>
          <div class="econ-prev-txt">${d.tip}</div>
        </div>` : ''}
      </div>
      <div class="modal-footer" style="display:flex;gap:8px;justify-content:center;align-items:center;padding:12px 16px">
        ${e.url ? `<a href="${e.url}" target="_blank" rel="noopener noreferrer" style="background:var(--blue);color:#000;font-weight:700;font-size:12px;padding:8px 16px;border-radius:6px;text-decoration:none;display:inline-flex;align-items:center;gap:6px">המשך למקור הרשמי <span style="font-size:10px">↗</span></a>` : ''}
        <button onclick="document.getElementById('econ-preview-overlay').remove()" style="background:var(--bg3);border:1px solid var(--border);color:var(--text);font-size:12px;padding:8px 16px;border-radius:6px;cursor:pointer;font-family:inherit">סגור</button>
      </div>
    </div>`;

  overlay.addEventListener('click', (ev) => {
    if (ev.target === overlay) overlay.remove();
  });
  document.body.appendChild(overlay);
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

// ══════════════════════════════════════════════════════
// AI MARKET BRIEF — Smart Dashboard Layer
// ══════════════════════════════════════════════════════

// ── Education Dictionary ────────────────────────────
const EDU_DICT = {
  'ריבית הפד': {
    title:'ריבית הפד (Fed Funds Rate)',
    body:'זו הריבית שהבנק המרכזי האמריקאי קובע. היא משפיעה על <b>כל דבר</b> — הלוואות, משכנתאות, והכי חשוב: על מחירי המניות.',
    example:'כשהריבית עולה, כסף "בטוח" (פיקדון, אגרות חוב) נותן תשואה טובה יותר → אנשים מוציאים כסף ממניות → מחירים יורדים. כשהריבית יורדת → הפוך.'
  },
  'VIX': {
    title:'VIX — מדד הפחד',
    body:'מודד כמה השוק <b>מפחד מתנודות</b> ב-30 הימים הקרובים. כשה-VIX גבוה, אנשים חוששים. כשנמוך — רגועים.',
    example:'VIX מתחת ל-15 = שוק רגוע מאוד. VIX מעל 25 = חרדה. VIX מעל 35 = פאניקה (בדר"כ הזדמנות קנייה לאמיצים).'
  },
  'מכפיל רווח': {
    title:'מכפיל רווח (P/E Ratio)',
    body:'כמה שנים ייקח לחברה "להחזיר" לך את ההשקעה מהרווחים שלה. מכפיל 20 = 20 שנה (בתיאוריה).',
    example:'ריבית גבוהה → מכפילים יורדים כי "מחר" שווה פחות היום. לכן מניות טכנולוגיה (מכפילים גבוהים) נפגעות יותר מעליית ריבית.'
  },
  'RSI': {
    title:'RSI — מדד כוח יחסי',
    body:'מודד אם מניה עלתה "יותר מדי מהר" או ירדה "יותר מדי מהר". סולם 0-100.',
    example:'RSI מתחת ל-30 = מכירת יתר (אולי הזדמנות קנייה). RSI מעל 70 = קניית יתר (אולי כדאי למכור). RSI 50 = ניטרלי.'
  },
  'S&P 500': {
    title:'S&P 500 — מדד 500 הגדולות',
    body:'מדד שעוקב אחרי 500 החברות הגדולות בארה"ב. נחשב <b>הברומטר של הכלכלה האמריקאית</b>.',
    example:'כשאומרים "השוק עלה" — בדר"כ מתכוונים ל-S&P 500. SPY הוא קרן שעוקבת אחריו.'
  },
  'תשואת אגרות חוב': {
    title:'תשואת אגרות חוב (10Y Treasury)',
    body:'הריבית שממשלת ארה"ב משלמת על הלוואה ל-10 שנים. נחשב ל"ריבית הבסיס" של העולם.',
    example:'כשתשואת ה-10Y עולה → מניות נוטות לרדת (כי אגרות חוב "מתחרות" במניות). תשואה מעל 4.5% = לחץ משמעותי על השוק.'
  },
  'רוחב שוק': {
    title:'רוחב שוק (Market Breadth)',
    body:'בודק כמה מניות עולות לעומת יורדות. שוק "בריא" הוא כזה שבו <b>הרבה מניות</b> עולות, לא רק כמה ענקיות.',
    example:'אם S&P 500 עולה אבל רק 5 מניות ענק מושכות אותו (כמו NVIDIA, Apple) — זו אזהרה. עלייה רחבה של 80%+ מהמניות = עלייה אמיתית ובריאה.'
  },
  'סקטור': {
    title:'סקטור — ענף בשוק',
    body:'השוק מחולק ל-11 ענפים (סקטורים). כל סקטור מגיב אחרת לאירועים כלכליים.',
    example:'ריבית עולה? טכנולוגיה נפגעת. נפט עולה? אנרגיה מרוויחה. מיתון? תשתיות ובריאות מחזיקים טוב יותר. לדעת איזה סקטור חזק = לדעת לאן ללכת.'
  },
  'YTD': {
    title:'YTD — תשואה מתחילת השנה',
    body:'כמה אחוזים המניה/הסקטור עלה או ירד מ-1 בינואר עד היום.',
    example:'אם XLK (טכנולוגיה) ב-YTD של +15% ו-XLE (אנרגיה) ב--5% — הכסף זורם לטכנולוגיה השנה.'
  },
  'מומנטום': {
    title:'מומנטום — כוח המגמה',
    body:'כשמניה עולה, היא <b>נוטה להמשיך לעלות</b> (ולהפך). זה מומנטום — "אובייקט בתנועה נשאר בתנועה".',
    example:'סקטור שעולה כבר חודש ברציפות → מומנטום חיובי = רוב הסיכויים שימשיך. מומנטום שלילי = לא הזמן לקנות (תפוס סכין נופלת).'
  },
  'Fear & Greed': {
    title:'מדד פחד וחמדנות',
    body:'משקלל כמה מדדים לתמונה אחת: האם השוק <b>פוחד</b> (הזדמנות?) או <b>חמדן</b> (סכנה?).',
    example:'וורן באפט אמר: "היה חמדן כשאחרים פוחדים, ופחדן כשאחרים חמדנים." מדד מתחת ל-25 = פחד קיצוני = לעתים הזדמנות קנייה היסטורית.'
  },
  'Stop Loss': {
    title:'Stop Loss — פקודת הגנה',
    body:'פקודה אוטומטית שמוכרת את המניה אם היא יורדת למחיר מסוים. <b>ביטוח</b> נגד הפסד גדול.',
    example:'קנית מניה ב-$100 ושמת Stop Loss ב-$92 → אם המניה יורדת ל-$92, היא נמכרת אוטומטית. ההפסד שלך מוגבל ל-8% במקום 30%+.'
  },
  'מתאם': {
    title:'מתאם (Correlation)',
    body:'מודד עד כמה שני נכסים זזים ביחד. מתאם 1 = זזים ביחד. מתאם -1 = זזים הפוך. 0 = אין קשר.',
    example:'טכנולוגיה ותקשורת — מתאם גבוה (שניהם מושפעים מריבית). אנרגיה וטכנולוגיה — מתאם נמוך = פיזור טוב!'
  },
};

// ── AI Brief Engine ────────────────────────────────
function runAIBrief() {
  const sec = $('ai-brief-section');
  if (!sec) return;

  // ── Data collection ──
  const secData = SECTORS.map(s => ({
    sym:s.sym, name:s.name,
    d1:(qmap[s.sym]||{}).d1, h:histMap[s.sym]||{}
  }));
  const validDay = secData.filter(s=>s.d1!=null&&!isNaN(s.d1));
  if (!validDay.length) return;

  const avgD1 = validDay.reduce((a,s)=>a+s.d1,0)/validDay.length;
  const upCount = validDay.filter(s=>s.d1>0).length;
  const pctUp = upCount/validDay.length;
  const sorted = [...validDay].sort((a,b)=>b.d1-a.d1);
  const top = sorted[0], weak = sorted[sorted.length-1];
  const spy = qmap['SPY']||{}, vix = qmap['VIXY']||{};
  const fg = calcFearGreed();
  const tlt = qmap['TLT']||{};
  const btc = qmap['IBIT']||{};

  sec.style.display = 'block';

  // ═══════════════════════════════════════
  // 1. SMART ALERT BANNER
  // ═══════════════════════════════════════
  const alertEl = $('ai-alert-banner');
  let alertHtml = '';

  if (vix.d1 != null && vix.d1 > 5) {
    alertHtml = `<div class="alert-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
    </div><div class="alert-text"><div class="alert-label">זהירות — תנודתיות גבוהה</div>VIX (מדד הפחד) מזנק ${vix.d1>0?'+':''}${vix.d1.toFixed(1)}% — השוק חרד. הקטן פוזיציות, שמור מזומן, והימנע מהחלטות אימפולסיביות.</div>`;
    alertEl.className = 'ai-alert-banner alert-danger';
  } else if (fg.total <= 20) {
    alertHtml = `<div class="alert-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>
    </div><div class="alert-text"><div class="alert-label">פחד קיצוני בשוק</div>מדד הפחד/חמדנות ב-${fg.total} — רמה נמוכה מאוד. היסטורית, רמות כאלה מסמנות <b>הזדמנויות קנייה</b> לטווח ארוך. שקול להתחיל לחקור.</div>`;
    alertEl.className = 'ai-alert-banner alert-opportunity';
  } else if (pctUp >= 0.9 && avgD1 > 1) {
    alertHtml = `<div class="alert-icon">
      <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" width="20" height="20"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>
    </div><div class="alert-text"><div class="alert-label">ראלי רחב</div>${upCount} מתוך ${validDay.length} סקטורים עולים (ממוצע +${avgD1.toFixed(2)}%). עלייה רחבה כזו מעידה על אופטימיות אמיתית — לא רק מניה אחת שמושכת.</div>`;
    alertEl.className = 'ai-alert-banner alert-opportunity';
  }

  if (alertHtml) {
    alertEl.innerHTML = alertHtml;
    alertEl.style.display = 'flex';
  } else {
    alertEl.style.display = 'none';
  }

  // ═══════════════════════════════════════
  // 2. AI VERDICT — one-liner
  // ═══════════════════════════════════════
  let verdictIcon, verdictText;

  if (pctUp >= 0.75) {
    verdictIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="#00e87a" stroke-width="2.5" stroke-linecap="round" width="28" height="28"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>';
    verdictText = `<b>יום ירוק בשוק.</b> ${upCount} מתוך ${validDay.length} סקטורים חיוביים, עם ממוצע של <span class="ai-highlight green">${avgD1>0?'+':''}${avgD1.toFixed(2)}%</span>.
      ${top ? ` <b>${top.name}</b> מוביל עם <span class="ai-highlight green">+${top.d1.toFixed(2)}%</span>.` : ''}
      ${fg.total >= 70 ? ' שים לב — השוק כבר אופטימי מדי, אל תרדוף אחרי עליות.' : ' מומנטום חיובי — המשך מגמה סביר.'}`;
  } else if (pctUp >= 0.45) {
    verdictIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" width="28" height="28"><line x1="5" y1="12" x2="19" y2="12"/><polyline points="12 5 19 12 12 19"/></svg>';
    verdictText = `<b>שוק מפוצל — אין כיוון ברור.</b> ${upCount} סקטורים עולים, ${validDay.length-upCount} יורדים. ממוצע <span class="ai-highlight amber">${avgD1>0?'+':''}${avgD1.toFixed(2)}%</span>.
      ${top&&weak ? ` פער גדול: ${top.name} <span class="ai-highlight green">+${top.d1.toFixed(2)}%</span> לעומת ${weak.name} <span class="ai-highlight red">${weak.d1.toFixed(2)}%</span>.` : ''}
      בשוק מעורב, בחר סקטור מוביל ספציפי — לא "קונים הכל".`;
  } else {
    verdictIcon = '<svg viewBox="0 0 24 24" fill="none" stroke="#ff3a5c" stroke-width="2.5" stroke-linecap="round" width="28" height="28"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>';
    verdictText = `<b>יום אדום — לחץ מכירות רחב.</b> רק ${upCount} סקטורים חיוביים. ממוצע <span class="ai-highlight red">${avgD1.toFixed(2)}%</span>.
      ${weak ? ` <b>${weak.name}</b> החלש ביותר: <span class="ai-highlight red">${weak.d1.toFixed(2)}%</span>.` : ''}
      ביום שלילי רחב, <b>אל תנסה "לתפוס תחתית"</b> — עדיף לשמור על מזומן ולחכות.`;
  }

  $('ai-verdict-icon').innerHTML = verdictIcon;
  $('ai-verdict-text').innerHTML = verdictText;

  // ═══════════════════════════════════════
  // 3. THREE KEY SIGNALS
  // ═══════════════════════════════════════
  const signals = [];

  // Signal 1: Sector Rotation
  if (top && weak) {
    const gap = top.d1 - weak.d1;
    let rotTag = 'info', rotBody = '';
    if (gap > 3) {
      rotTag = 'neutral';
      rotBody = `פער חריג של <span class="signal-val">${gap.toFixed(1)}%</span> בין הסקטור החזק לחלש. הכסף "זורם" מ-${weak.name} ל-${top.name}. זה נקרא <b>רוטציית סקטורים</b> — עקוב אחרי הכסף.`;
    } else {
      rotBody = `<b>${top.name}</b> מוביל (<span class="signal-val up">+${top.d1.toFixed(2)}%</span>), <b>${weak.name}</b> בתחתית (<span class="signal-val down">${weak.d1.toFixed(2)}%</span>). ${gap<1?'פער קטן = השוק נע ביחד.':'פער בינוני — שקול להעדיף את הסקטור החזק.'}`;
      rotTag = gap<1 ? 'info' : 'neutral';
    }
    signals.push({
      title: 'רוטציית סקטורים',
      body: rotBody,
      tag: rotTag,
      tagText: gap > 3 ? 'רוטציה פעילה' : gap > 1.5 ? 'פער בינוני' : 'שוק מסונכרן'
    });
  }

  // Signal 2: Risk level
  const vixD1 = vix.d1 || 0;
  const riskScore = Math.round(Math.min(100, Math.max(0, 50 + vixD1*5 - (pctUp-0.5)*40)));
  let riskTag, riskTagText, riskBody;
  if (riskScore >= 70) {
    riskTag='bear'; riskTagText='סיכון גבוה';
    riskBody=`רמת הסיכון עומדת על <span class="signal-val down">${riskScore}/100</span>. VIX ${vixD1>0?'עולה':'יציב'}, ורוב הסקטורים ${pctUp<0.4?'יורדים':'מעורבים'}. <b>הקטן חשיפה</b> — אל תהיה "גיבור" ביום קשה.`;
  } else if (riskScore >= 40) {
    riskTag='neutral'; riskTagText='סיכון בינוני';
    riskBody=`רמת סיכון <span class="signal-val">${riskScore}/100</span> — טווח נורמלי. אפשר לסחור, אבל עם <b>Stop Loss</b> מוגדר מראש. אל תגדיל פוזיציות ביום מעורב.`;
  } else {
    riskTag='bull'; riskTagText='סביבה רגועה';
    riskBody=`רמת סיכון נמוכה (<span class="signal-val up">${riskScore}/100</span>). VIX ${vixD1<-2?'יורד':'יציב'} ורוב הסקטורים עולים. <b>סביבה נוחה</b> לפתיחת פוזיציות — אבל תמיד עם תכנית יציאה.`;
  }
  signals.push({title:'רמת סיכון', body:riskBody, tag:riskTag, tagText:riskTagText});

  // Signal 3: What's driving the market
  let driverTitle, driverBody, driverTag, driverTagText;
  const tltD1 = tlt.d1||0;
  const btcD1 = btc.d1||0;
  if (Math.abs(tltD1) > 1.5) {
    driverTitle = 'אגרות חוב זזות חזק';
    driverBody = `TLT (אגרות חוב ארוכות) ${tltD1>0?'עולה':'יורד'} <span class="signal-val ${tltD1>0?'up':'down'}">${tltD1>0?'+':''}${tltD1.toFixed(2)}%</span>. ${tltD1>0?'ירידת תשואות = תמיכה במניות, במיוחד טכנולוגיה.':'עליית תשואות = לחץ על מכפילים גבוהים, במיוחד טכנולוגיה ונדל"ן.'}`;
    driverTag = tltD1>0 ? 'bull' : 'bear';
    driverTagText = tltD1>0 ? 'תשואות יורדות' : 'תשואות עולות';
  } else if (Math.abs(btcD1) > 3) {
    driverTitle = 'קריפטו זזים';
    driverBody = `Bitcoin ETF ${btcD1>0?'מזנק':'צולל'} <span class="signal-val ${btcD1>0?'up':'down'}">${btcD1>0?'+':''}${btcD1.toFixed(1)}%</span>. ${btcD1>0?'תיאבון סיכון עולה — חיובי לנכסי סיכון.':'בריחה מסיכון — שוק מחפש ביטחון.'}`;
    driverTag = btcD1>0 ? 'bull' : 'bear';
    driverTagText = btcD1>0 ? 'Risk-On' : 'Risk-Off';
  } else {
    const spyD1 = spy.d1 || 0;
    driverTitle = 'מה מניע את השוק';
    driverBody = `S&P 500 ${spyD1>0?'עולה':'יורד'} <span class="signal-val ${spyD1>0?'up':'down'}">${spyD1>0?'+':''}${spyD1.toFixed(2)}%</span>. אגרות חוב יציבות (<span class="signal-val">${tltD1>0?'+':''}${tltD1.toFixed(2)}%</span>). ${Math.abs(spyD1)<0.3?'יום שקט יחסית — השוק ממתין לקטליזטור.':'השוק נע על פי מומנטום ולא קטליזטור ספציפי.'}`;
    driverTag = Math.abs(spyD1)<0.3 ? 'info' : spyD1>0 ? 'bull' : 'bear';
    driverTagText = Math.abs(spyD1)<0.3 ? 'יום שקט' : spyD1>0 ? 'מומנטום חיובי' : 'מומנטום שלילי';
  }
  signals.push({title:driverTitle, body:driverBody, tag:driverTag, tagText:driverTagText});

  $('ai-signals').innerHTML = signals.map((s,i) => `
    <div class="ai-signal">
      <div class="ai-signal-num">${i+1}</div>
      <div class="ai-signal-title">${s.title}</div>
      <div class="ai-signal-body">${s.body}</div>
      <div class="ai-signal-tag ${s.tag}">${s.tagText}</div>
    </div>`).join('');

  // ═══════════════════════════════════════
  // 4. STOCK-LEVEL INTELLIGENCE + ACTION ITEMS
  // ═══════════════════════════════════════

  // Scan all holdings for top movers
  const allStocks = [];
  Object.entries(ETF_HOLDINGS).forEach(([etf, holdings]) => {
    const sectorName = (SECTORS.find(s=>s.sym===etf)||{}).name || etf;
    holdings.forEach(h => {
      const q = qmap[h.s];
      if (q && q.d1 != null && !isNaN(q.d1)) {
        allStocks.push({sym:h.s, name:h.n, d1:q.d1, price:q.price, etf, sectorName, weight:h.w});
      }
    });
  });

  // Deduplicate by symbol, keep highest weight
  const stockMap = {};
  allStocks.forEach(s => {
    if (!stockMap[s.sym] || stockMap[s.sym].weight < s.weight) stockMap[s.sym] = s;
  });
  const uniqueStocks = Object.values(stockMap).sort((a,b) => b.d1 - a.d1);

  // Top gainers and losers from individual stocks
  const topGainers = uniqueStocks.slice(0, 3);
  const topLosers = uniqueStocks.slice(-3).reverse();

  const actions = [];

  // ACTION: Hot stocks in leading sector
  if (top && top.d1 > 0.5) {
    const sectorStocks = allStocks.filter(s => s.etf === top.sym).sort((a,b) => b.d1 - a.d1);
    const hotInSector = sectorStocks.slice(0, 3).filter(s => s.d1 > 0);
    if (hotInSector.length > 0) {
      const stockList = hotInSector.map(s =>
        `<b>${s.sym}</b> <span class="signal-val up">+${s.d1.toFixed(1)}%</span> ($${s.price?s.price.toFixed(0):'?'})`
      ).join(' · ');
      actions.push({
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#00e87a" stroke-width="2" width="18" height="18"><polyline points="22 7 13.5 15.5 8.5 10.5 2 17"/><polyline points="16 7 22 7 22 13"/></svg>',
        text: `<b>מניות חמות ב${top.name}:</b> ${stockList}`,
        why: `הסקטור החזק ביותר היום (+${top.d1.toFixed(2)}%). המניות האלו מובילות אותו — שקול כניסה עם Stop Loss ב-3% מתחת למחיר הנוכחי.`
      });
    }
  }

  // ACTION: Warning on losing stocks
  if (weak && weak.d1 < -0.5) {
    const weakStocks = allStocks.filter(s => s.etf === weak.sym).sort((a,b) => a.d1 - b.d1);
    const hurtInSector = weakStocks.slice(0, 3).filter(s => s.d1 < 0);
    if (hurtInSector.length > 0) {
      const stockList = hurtInSector.map(s =>
        `<b>${s.sym}</b> <span class="signal-val down">${s.d1.toFixed(1)}%</span>`
      ).join(' · ');
      actions.push({
        icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff3a5c" stroke-width="2" width="18" height="18"><polyline points="22 17 13.5 8.5 8.5 13.5 2 7"/><polyline points="16 17 22 17 22 11"/></svg>',
        text: `<b>הימנע מ${weak.name}:</b> ${stockList}`,
        why: `הסקטור החלש ביותר (${weak.d1.toFixed(2)}%). אל תנסה "לתפוס תחתית" — חכה לאות התייצבות (3 ימים ירוקים ברצף).`
      });
    }
  }

  // ACTION: Biggest overall movers
  if (topGainers.length > 0 && topGainers[0].d1 > 2) {
    const bigMover = topGainers[0];
    actions.push({
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" width="18" height="18"><path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z"/></svg>',
      text: `<b>${bigMover.name} (${bigMover.sym})</b> מזנקת <span class="signal-val up">+${bigMover.d1.toFixed(1)}%</span> — $${bigMover.price?bigMover.price.toFixed(2):'?'}`,
      why: `המניה החזקה ביותר מ-${bigMover.sectorName}. אחרי זינוק חד ביום אחד, לפעמים כדאי לחכות ליום למחרת (pullback) לפני כניסה, ולא לרדוף.`
    });
  }

  // ACTION: Sentiment-based
  if (fg.total >= 75) {
    actions.push({
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2" width="18" height="18"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>',
      text: '<b>חמדנות גבוהה</b> — שקול לקחת רווחים על מניות שכבר עלו +10% מהכניסה',
      why: 'כשכולם אופטימיים (F&G ' + fg.total + '), זה בדיוק הזמן לנעול רווחים. מכור 30-50% מעמדות רווחיות ושמור מזומן.'
    });
  } else if (fg.total <= 25) {
    actions.push({
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#00b4ff" stroke-width="2" width="18" height="18"><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/><line x1="11" y1="8" x2="11" y2="14"/><line x1="8" y1="11" x2="14" y2="11"/></svg>',
      text: '<b>פחד קיצוני</b> — הזדמנות לחפש מניות איכותיות במחירי הנחה',
      why: 'כש-Fear & Greed ב-' + fg.total + ', בדוק מניות גדולות (AAPL, MSFT, GOOGL) שירדו 5%+ מהשיא — אלה מועמדות לקנייה הדרגתית.'
    });
  }

  // ACTION: Market condition specific
  if (pctUp >= 0.7 && avgD1 > 0.3) {
    actions.push({
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#00e87a" stroke-width="2" width="18" height="18"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>',
      text: '<b>מומנטום חיובי רחב</b> — סביבה מתאימה לפתיחת פוזיציות לונג',
      why: upCount + ' סקטורים עולים. שים Trailing Stop ב-2% ותן למגמה לרוץ. העדף מניות בסקטורים חזקים עם משקל גבוה ב-ETF.'
    });
  } else if (pctUp <= 0.3) {
    const defStocks = allStocks.filter(s => ['XLU','XLP','XLV'].includes(s.etf) && s.d1 > 0).sort((a,b)=>b.weight-a.weight).slice(0,2);
    const defList = defStocks.length ? defStocks.map(s=>`<b>${s.sym}</b>`).join(', ') : 'PG, KO, JNJ';
    actions.push({
      icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#ff3a5c" stroke-width="2" width="18" height="18"><rect x="3" y="11" width="18" height="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>',
      text: `<b>הגנה:</b> אם חייב להיות בשוק, העדף מניות דפנסיביות — ${defList}`,
      why: 'סקטורים דפנסיביים (תשתיות, צריכה בסיסית, בריאות) מפסידים פחות ביום שלילי. לא הזמן לספקולציה.'
    });
  }

  // Always: Calendar check
  actions.push({
    icon: '<svg viewBox="0 0 24 24" fill="none" stroke="#8aa0be" stroke-width="2" width="18" height="18"><rect x="3" y="4" width="18" height="18" rx="2" ry="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    text: '<b>לפני שאתה פועל</b> — גלול למטה ובדוק את לוח האירועים הכלכליים',
    why: 'CPI, NFP, או החלטת ריבית הפד יכולים להפוך את השוק ב-180° תוך דקות. אל תפתח פוזיציה גדולה יום לפני נתון חשוב.'
  });

  $('ai-actions').innerHTML = actions.map(a => `
    <div class="ai-action">
      <div class="ai-action-icon">${a.icon}</div>
      <div class="ai-action-text">${a.text}<span class="ai-action-why">${a.why}</span></div>
    </div>`).join('');

  // ═══════════════════════════════════════
  // 5. EDUCATION PILLS
  // ═══════════════════════════════════════
  renderEduPills();
}

// ── Education System ────────────────────────────
let _eduMode = false;
function toggleEduMode() {
  _eduMode = !_eduMode;
  const btn = $('ai-edu-toggle');
  const panel = $('ai-edu-panel');
  if (btn) btn.classList.toggle('active', _eduMode);
  if (panel) panel.style.display = _eduMode ? 'block' : 'none';
  const label = $('edu-toggle-label');
  if (label) label.textContent = _eduMode ? 'הסתר הסברים' : 'הסברים';
}

function renderEduPills() {
  const grid = $('ai-edu-grid');
  if (!grid) return;
  grid.innerHTML = Object.keys(EDU_DICT).map(key =>
    `<div class="edu-pill" onclick="showEduTooltip(event,'${key}')">${key}</div>`
  ).join('');
}

function showEduTooltip(e, key) {
  const data = EDU_DICT[key];
  if (!data) return;
  const tt = $('edu-tooltip');
  $('edu-tooltip-title').textContent = data.title;
  $('edu-tooltip-body').innerHTML = data.body;
  $('edu-tooltip-example').innerHTML = data.example;
  tt.style.display = 'block';

  // Position near the clicked element — account for CSS zoom
  const zoomLevel = document.body.classList.contains('zoomed') ? 1.4 : 1;
  const rect = e.target.getBoundingClientRect();
  const ttW = 320;
  // Force layout to get actual height
  const ttH = tt.offsetHeight || 200;
  let left = (rect.left + rect.width/2 - ttW/2) / zoomLevel;
  let top = (rect.bottom + 10) / zoomLevel;
  // Keep on screen
  const vw = window.innerWidth / zoomLevel;
  const vh = window.innerHeight / zoomLevel;
  if (left < 10) left = 10;
  if (left + ttW > vw - 10) left = vw - ttW - 10;
  if (top + ttH > vh - 10) top = (rect.top / zoomLevel) - ttH - 10;
  tt.style.left = left + 'px';
  tt.style.top = top + 'px';
}

// Close tooltip on click outside
document.addEventListener('click', function(e) {
  const tt = $('edu-tooltip');
  if (!tt) return;
  if (!e.target.closest('.edu-pill') && !e.target.closest('.edu-tooltip')) {
    tt.style.display = 'none';
  }
});

// ── Enhanced Insights with "Why" explanations ──────
const INSIGHT_WHYS = {
  bull_trend: {
    why: 'כמו גלים בים — כשרוב הגלים הולכים לכיוון אחד, קל "לגלוש" עליהם.',
    action: 'הצטרף למגמה עם Trailing Stop (הגנה שנעה עם המחיר למעלה).'
  },
  bear_trend: {
    why: 'כמו לנהוג נגד כיוון התנועה — אפשר, אבל מסוכן.',
    action: 'שמור על מזומן, אל תנסה "לתפוס את התחתית" — חכה לאות ירוק.'
  },
  mixed: {
    why: 'כמו רמזור צהוב — לא ירוק ולא אדום. זה הזמן לצפות, לא לפעול.',
    action: 'עקוב אחרי הסקטור המוביל. אם הוא ממשיך להוביל יום-יומיים — שקול כניסה.'
  },
  vix_high: {
    why: 'VIX גבוה = אנשים קונים "ביטוח" (אופציות Put). זה עולה כסף → אנשים מפסיקים לקנות מניות.',
    action: 'הקטן חשיפה ל-50%. הגדל רק כש-VIX מתחיל לרדת.'
  },
  sector_leader: {
    why: 'סקטור מוביל = שם הכסף זורם. הכסף הגדול ("Smart Money") נע לפני כולם.',
    action: 'בדוק את ה-5 אחזקות הגדולות ביותר בסקטור — שם ההזדמנות.'
  }
};

// Auto-start if key saved
startMarketClock(); // שעון שוק פועל תמיד, גם לפני לוגין
if (_proxyUrl) {
  init();
} else {
  showScreen('screen-key');
}


/* ──────────── [3] DASHBOARD INLINE ──────────── */

/* ═══════════════════════════════════════════════════════════
   DASHBOARD INLINE (login overlay, simpleAIBrief, misc boot)
   Originally at the end of /dashboard.html
   ═══════════════════════════════════════════════════════════ */

(function(){
  try{
    if(!localStorage.getItem('app_proxy_url')){
      var ov = document.getElementById('login-overlay');
      if(ov) ov.classList.add('visible');
      // שומר את ה-URL האחרון כדי למלא מראש אחרי retry
      var saved = localStorage.getItem('app_proxy_url_last');
      if(saved){
        var inp = document.getElementById('lo-key-input');
        if(inp) inp.value = saved;
      }
    }
  }catch(e){}
})();


/* ═══════════ LOGIN OVERLAY — מחבר את ה-Worker בלי לצאת מהדשבורד ═══════════ */
async function loStartWithKey(){
  const input   = document.getElementById('lo-key-input');
  const err     = document.getElementById('lo-key-err');
  const btn     = document.getElementById('lo-login-btn');
  const btnText = btn.querySelector('.lo-btn-text');
  const val     = (input.value || '').trim();

  if (!val) {
    err.textContent = 'אנא הזן את כתובת ה-Worker.';
    err.classList.add('show');
    input.focus();
    return;
  }
  if (!val.startsWith('http')) {
    err.textContent = 'הכתובת חייבת להתחיל ב-https://';
    err.classList.add('show');
    return;
  }

  const cleanUrl = val.endsWith('/') ? val.slice(0, -1) : val;
  const originalText = btnText.textContent;

  err.classList.remove('show');
  btn.classList.add('loading');
  btnText.textContent = 'מוודא הרשאות...';

  try {
    const testUrl = 'https://query1.finance.yahoo.com/v7/finance/spark?symbols=SPY&range=1d&interval=1d';
    const r = await fetch(`${cleanUrl}/?url=${encodeURIComponent(testUrl)}`);
    const d = await r.json();
    if (d.spark && d.spark.result) {
      // Success — שומר ומטעין מחדש את הדשבורד (נשאר ב-PWA mode — אין ניווט ליעד חדש)
      localStorage.setItem('app_proxy_url', cleanUrl);
      localStorage.setItem('app_proxy_url_last', cleanUrl);
      btnText.textContent = 'מתחבר...';
      setTimeout(() => { location.reload(); }, 300);
    } else {
      throw new Error('Invalid response');
    }
  } catch (e) {
    err.textContent = 'מפתח המערכת שגוי או שהשרת אינו מגיב.';
    err.classList.add('show');
    btn.classList.remove('loading');
    btnText.textContent = originalText;
  }
}

/* showKey override: מציג את ה-overlay עם שגיאה במקום לצאת ל-index.html */
window.showKey = function(){
  try {
    const last = localStorage.getItem('app_proxy_url') || '';
    localStorage.removeItem('app_proxy_url');
    if (last) localStorage.setItem('app_proxy_url_last', last);
  } catch(e) {}
  const ov = document.getElementById('login-overlay');
  if (ov) {
    ov.classList.add('visible');
    const inp = document.getElementById('lo-key-input');
    if (inp) {
      inp.value = localStorage.getItem('app_proxy_url_last') || '';
      setTimeout(() => inp.focus(), 100);
    }
    const err = document.getElementById('lo-key-err');
    if (err) {
      err.textContent = 'החיבור ל-Worker נכשל. בדוק את הכתובת ונסה שוב.';
      err.classList.add('show');
    }
  }
};

/* Terminal clocks + latency */
(function(){
  function tick(){
    const now = new Date();
    const fmt = {hour12:false, hour:'2-digit', minute:'2-digit'};
    const tlv = now.toLocaleTimeString('en-GB',{...fmt,timeZone:'Asia/Jerusalem'});
    const ny  = now.toLocaleTimeString('en-GB',{...fmt,timeZone:'America/New_York'});
    const a=document.getElementById('term-clock-tlv'); if(a)a.textContent=tlv;
    const b=document.getElementById('term-clock-ny');  if(b)b.textContent=ny;
    const d=document.getElementById('hdr-build');
    if(d){
      const str=now.toLocaleDateString('en-US',{year:'numeric',month:'2-digit',day:'2-digit',timeZone:'Asia/Jerusalem'}).replace(/\//g,'.');
      d.textContent = 'build · ' + str;
    }
  }
  tick(); setInterval(tick,1000);
  setInterval(()=>{
    const el=document.getElementById('term-latency');
    if(el) el.textContent=(50+Math.floor(Math.random()*50))+'ms';
  },1400);
})();

/* Sidebar sector heatmap: sync from #sector-tbody */
(function(){
  const SECTOR_MAP = {XLK:'TECH',XLC:'COMM',XLP:'CONS',XLV:'HEAL',XLF:'FIN',XLI:'INDU',XLRE:'REAL',XLE:'ENER'};
  function parsePct(txt){
    if(!txt) return null;
    const m = String(txt).match(/-?\d+\.?\d*/);
    return m ? parseFloat(m[0]) : null;
  }
  function syncHeatmap(){
    const rows = document.querySelectorAll('#sector-tbody tr:not(.avgrow)');
    if(!rows.length) return;
    rows.forEach(row => {
      // הסימבול קריא מ-data-sym attribute (עמודת הסקטור כבר לא חלק מה-tr הזה)
      const sym = row.getAttribute('data-sym');
      if(!sym || !SECTOR_MAP[sym]) return;
      // תא ה-1D הוא התא הראשון שאינו sec-cell (ה-sec-cell הוא עכשיו ה-td הראשון ב-tr)
      const dayCell = row.querySelector('td:not(.sec-cell)');
      const pct = parsePct(dayCell ? dayCell.textContent : '');
      const cell = document.querySelector(`.heat-cell[data-sector-slot="${sym}"]`);
      if(!cell) return;
      const pctSpan = cell.querySelector('.heat-pct');
      if(pct == null){ cell.className='heat-cell neu'; if(pctSpan)pctSpan.textContent='–'; return; }
      const abs = Math.abs(pct);
      const sign = pct>0?'+':(pct<0?'−':'');
      if(pctSpan) pctSpan.textContent = sign + abs.toFixed(2) + '%';
      const strong = abs >= 1.0;
      if(pct > 0.05) cell.className = 'heat-cell up' + (strong?' strong':'');
      else if(pct < -0.05) cell.className = 'heat-cell down' + (strong?' strong':'');
      else cell.className = 'heat-cell neu';
      // שם הסקטור — קריא מתא ה-.sec-cell בתוך אותה שורה
      const sectorCell = row.querySelector('td.sec-cell');
      const nameTxt = sectorCell ? sectorCell.textContent.replace(sym,'').trim() : sym;
      cell.onclick = () => { if(window.openSectorModal) window.openSectorModal(sym, nameTxt); };
      cell.style.cursor = 'pointer';
    });
  }
  const tb = document.getElementById('sector-tbody');
  if(tb){
    const obs = new MutationObserver(() => setTimeout(syncHeatmap, 50));
    obs.observe(tb, {childList:true, subtree:true, characterData:true});
  }
  setInterval(syncHeatmap, 3000);
})();

/* Concise AI Brief — reads from DOM, overrides runAIBrief */
(function(){
  const SECTOR_NAMES = {
    XLK:'טכנולוגיה',XLC:'תקשורת',XLP:'צריכה בסיסית',XLV:'בריאות',
    XLF:'פיננסים',XLI:'תעשייה',XLY:'צריכה שיקולית',XLRE:'נדל״ן',
    XLB:'חומרים',XLU:'תשתיות',XLE:'אנרגיה'
  };
  function readSectorData(){
    const rows = document.querySelectorAll('#sector-tbody tr:not(.avgrow)');
    const out = [];
    rows.forEach(row => {
      const sym = row.getAttribute('data-sym');
      if (!sym || !SECTOR_NAMES[sym]) return;
      const td = row.querySelector('td:not(.sec-cell)');
      const m = td ? td.textContent.match(/-?\d+\.?\d*/) : null;
      if (!m) return;
      const d1 = parseFloat(m[0]);
      if (isNaN(d1)) return;
      out.push({ sym, name: SECTOR_NAMES[sym], d1 });
    });
    return out;
  }
  function readVIX(){
    const cards = document.querySelectorAll('.idx-card');
    for (const c of cards){
      const symEl = c.querySelector('.idx-card-sym');
      if (symEl && symEl.textContent.trim() === 'VIXY'){
        const p = c.querySelector('.idx-card-price');
        if (p){ const m = p.textContent.match(/\d+\.?\d*/); if (m) return parseFloat(m[0]); }
      }
    }
    return null;
  }
  function readBreadth(){
    const el = document.getElementById('breadth-big');
    if (!el) return null;
    const m = el.textContent.match(/\d+/);
    return m ? parseInt(m[0],10) : null;
  }
  function readFG(){
    const numEl = document.getElementById('fg-num');
    const lblEl = document.getElementById('fg-lbl');
    if (!numEl) return null;
    const m = numEl.textContent.match(/\d+/);
    if (!m) return null;
    return {
      score: parseInt(m[0],10),
      label: lblEl ? lblEl.textContent.trim() : ''
    };
  }
  function readMI(){
    const adv  = document.getElementById('mi-adv');
    const avg  = document.getElementById('mi-avg');
    const hi52 = document.getElementById('mi-hi52');
    const parse = el => {
      if (!el) return null;
      const t = el.textContent.trim();
      if (!t || t === '–') return null;
      return t;
    };
    return {
      adv:  parse(adv),   // "9/2" format
      avg:  parse(avg),   // "+0.74%"
      hi52: parse(hi52)   // "-4.4%"
    };
  }
  function fmt(n){ return (n>=0?'+':'') + n.toFixed(2) + '%'; }

  function simpleAIBrief(){
    const sec = document.getElementById('ai-brief-section');
    if (sec) sec.style.display = 'block';

    const data = readSectorData();
    if (data.length < 5) return;

    const positives = data.filter(s => s.d1 > 0).length;
    const negatives = data.filter(s => s.d1 < 0).length;
    const total = data.length;
    const avg = data.reduce((a,s)=>a+s.d1,0)/total;
    const sorted = data.slice().sort((a,b)=>b.d1-a.d1);
    const leader = sorted[0];
    const laggard = sorted[sorted.length-1];
    const vix = readVIX();
    const breadth = readBreadth();

    let mood = 'mixed', verdict;
    if (avg > 0.3 && positives >= 7){
      mood = '';
      verdict = `<strong>יום ירוק בשוק</strong> — ${positives}/${total} סקטורים חיוביים, בהובלת <strong>${leader.name}</strong> (${fmt(leader.d1)}). ציפייה להמשך מגמה.`;
    } else if (avg < -0.3 && negatives >= 7){
      mood = 'neg';
      verdict = `<strong>יום אדום בשוק</strong> — ${negatives}/${total} סקטורים שליליים. <strong>${laggard.name}</strong> מוביל ירידות (${fmt(laggard.d1)}). זהירות נדרשת.`;
    } else {
      verdict = `שוק <strong>מעורב</strong> — <strong>${leader.name}</strong> חזקה (${fmt(leader.d1)}), אבל <strong>${laggard.name}</strong> חלש (${fmt(laggard.d1)}).`;
    }

    const vEl = document.getElementById('ai-verdict');
    if (vEl) vEl.className = 'ai-verdict' + (mood ? ' ' + mood : '');
    const vIcon = document.getElementById('ai-verdict-icon');
    if (vIcon){
      vIcon.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round" width="20" height="20"><path d="M12 2a7 7 0 0 0-7 7c0 2.38 1.19 4.47 3 5.74V17a1 1 0 0 0 1 1h6a1 1 0 0 0 1-1v-2.26c1.81-1.27 3-3.36 3-5.74a7 7 0 0 0-7-7z"/><line x1="9" y1="21" x2="15" y2="21"/><line x1="10" y1="24" x2="14" y2="24"/></svg>`;
    }
    const vText = document.getElementById('ai-verdict-text');
    if (vText) vText.innerHTML = verdict;

    const leaderPos = leader.d1 > 0;
    const vixPos = vix != null && vix < 20;
    const breadthPos = breadth != null && breadth > 55;
    const breadthNeg = breadth != null && breadth < 40;
    const breadthHot = breadth != null && breadth >= 85;  // over-extended
    const vixDot = vix == null ? 'neu' : vixPos ? 'pos' : 'neg';
    const vixVal = vix == null ? '' : vixPos ? 'pos' : 'neg';
    const vixDesc = vix == null ? 'ממתין לנתונים' : vix < 15 ? 'שוק רגוע — סביבה חיובית' : vix < 20 ? 'תנודתיות מתונה' : 'תנודתיות גבוהה — זהירות';
    const bDot = breadthHot ? 'neu' : breadthPos ? 'pos' : breadthNeg ? 'neg' : 'neu';
    const bDesc = breadth == null ? 'מחשב...' :
                  breadthHot ? 'מתוח — שקול רווחים' :
                  breadthPos ? 'רוחב שוק חיובי' :
                  breadthNeg ? 'רוחב שוק חלש' : 'רוחב שוק מעורב';

    // Sentiment (Fear & Greed)
    const fgData = readFG();
    let sentDot = 'neu', sentVal = 'neu', sentDesc = 'מחשב...', sentScoreTxt = '–';
    if (fgData){
      sentScoreTxt = fgData.score + (fgData.label ? ' · ' + fgData.label : '');
      if (fgData.score >= 75){ sentDot='neu'; sentVal='neu'; sentDesc='חמדנות קיצונית — זהירות'; }
      else if (fgData.score >= 55){ sentDot='pos'; sentVal='pos'; sentDesc='אופטימיות בריאה'; }
      else if (fgData.score >= 45){ sentDot='neu'; sentVal='neu'; sentDesc='סנטימנט ניטרלי'; }
      else if (fgData.score >= 25){ sentDot='neg'; sentVal='neg'; sentDesc='פחד — סלקטיביות'; }
      else { sentDot='pos'; sentVal='pos'; sentDesc='פחד קיצוני — הזדמנות'; }
    }

    const signalsEl = document.getElementById('ai-signals');
    if (signalsEl){
      signalsEl.innerHTML = `
        <div class="ai-signal">
          <div class="ai-s-hdr"><div class="ai-s-dot ${sentDot}"></div><div class="ai-s-label">Sentiment</div></div>
          <div class="ai-s-val ${sentVal}">${sentScoreTxt}</div>
          <div class="ai-s-desc">${sentDesc}</div>
        </div>
        <div class="ai-signal">
          <div class="ai-s-hdr"><div class="ai-s-dot ${leaderPos?'pos':'neg'}"></div><div class="ai-s-label">Leadership</div></div>
          <div class="ai-s-val ${leaderPos?'pos':'neg'}">${leader.name} ${fmt(leader.d1)}</div>
          <div class="ai-s-desc">${leaderPos ? 'הסקטור המוביל היום בשוק' : 'אף סקטור לא מוביל חיובית'}</div>
        </div>
        <div class="ai-signal">
          <div class="ai-s-hdr"><div class="ai-s-dot ${bDot}"></div><div class="ai-s-label">Breadth</div></div>
          <div class="ai-s-val">${breadth!=null?breadth+'%':'–'}</div>
          <div class="ai-s-desc">${bDesc}</div>
        </div>
        <div class="ai-signal">
          <div class="ai-s-hdr"><div class="ai-s-dot ${vixDot}"></div><div class="ai-s-label">Vol Regime</div></div>
          <div class="ai-s-val ${vixVal}">VIX ${vix!=null?vix.toFixed(2):'–'}</div>
          <div class="ai-s-desc">${vixDesc}</div>
        </div>`;
    }

    // ── Micro-stats strip: Up/Down · Avg 1D · vs 52W (from hidden Market Internals) ──
    const mi = readMI();
    const microEl = document.getElementById('ai-micro-stats');
    if (microEl){
      // Avg 1D: we already have `avg` computed from sector table — use it for freshness
      const avgClass = avg > 0.15 ? 'pos' : avg < -0.15 ? 'neg' : 'neu';
      const avgTxt = fmt(avg);
      // Up/Down: prefer hidden MI value, else compute
      let udTxt = mi.adv || `${positives}/${negatives}`;
      // vs 52W: only from hidden MI (needs historical)
      const hi52 = mi.hi52 || '–';
      const hi52Num = parseFloat((hi52||'').replace(/[^\-\d.]/g,''));
      const hi52Class = !isFinite(hi52Num) ? 'neu' : hi52Num > -3 ? 'pos' : hi52Num > -8 ? 'neu' : 'neg';

      microEl.innerHTML = `
        <div class="ai-mi-item">
          <div class="ai-mi-lbl">עולים / יורדים</div>
          <div class="ai-mi-val">${udTxt}</div>
        </div>
        <div class="ai-mi-sep"></div>
        <div class="ai-mi-item">
          <div class="ai-mi-lbl">ממוצע יומי</div>
          <div class="ai-mi-val ${avgClass}">${avgTxt}</div>
        </div>
        <div class="ai-mi-sep"></div>
        <div class="ai-mi-item">
          <div class="ai-mi-lbl">מרחק משיא 52W</div>
          <div class="ai-mi-val ${hi52Class}">${hi52}</div>
        </div>`;
    }

    const watchTxt = leaderPos
      ? `המשך הובלת <b>${leader.name}</b> — עד מתי ימשיך להוביל.`
      : `חולשה רחבה — עקוב אחר רמות תמיכה.`;
    const riskTxt = laggard.d1 < -0.5
      ? `<b>${laggard.name}</b> בחולשה (${fmt(laggard.d1)}) — עלול להעיב על השוק.`
      : `תנודתיות נמוכה יחסית — סבלנות נדרשת.`;
    const oppTxt = positives > 6
      ? `מומנטום חיובי — כניסות <b>סלקטיביות</b> לסקטורים מובילים.`
      : negatives > 6
      ? `שוק חלש — <b>חכה ליציבות</b> לפני כניסה חדשה.`
      : `שוק מעורב — פעל <b>סלקטיבית</b> בסקטורים יחסיים.`;

    // Pull the detailed breadth advice from the hidden Breadth card into the AI actions
    const breadthAdviceRow = (() => {
      const src = document.getElementById('breadth-advice');
      if (!src || !src.innerHTML.trim()) return '';
      const headline = src.querySelector('.br-headline')?.textContent?.trim() || 'רוחב שוק';
      // Extract body = innerHTML minus the headline span
      const clone = src.cloneNode(true);
      const h = clone.querySelector('.br-headline');
      if (h) h.remove();
      const bodyHtml = clone.innerHTML.trim();
      if (!bodyHtml) return '';
      // Tone: advice.warn → neu (amber), advice.danger → neg (red), else pos (green)
      const tone = src.classList.contains('danger') ? 'neg'
                 : src.classList.contains('warn')   ? 'neu'
                 : 'pos';
      const pctTxt = breadth != null ? ` (${breadth}%)` : '';
      return `<div class="ai-a-row"><div class="ai-a-dot ${tone}"></div><div class="ai-a-txt ${tone}"><b>רוחב שוק${pctTxt} — ${headline}:</b> ${bodyHtml}</div></div>`;
    })();

    const actionsEl = document.getElementById('ai-actions');
    if (actionsEl){
      actionsEl.innerHTML = `
        <div class="ai-a-row"><div class="ai-a-dot"></div><div class="ai-a-txt"><b>עקוב:</b> ${watchTxt}</div></div>
        <div class="ai-a-row"><div class="ai-a-dot"></div><div class="ai-a-txt"><b>סיכון:</b> ${riskTxt}</div></div>
        <div class="ai-a-row"><div class="ai-a-dot"></div><div class="ai-a-txt"><b>הזדמנות:</b> ${oppTxt}</div></div>
        ${breadthAdviceRow}`;
    }

    const edu = document.getElementById('ai-edu-panel');
    if (edu) edu.style.display = 'none';
  }

  window.simpleAIBrief = simpleAIBrief;
  function installOverride(){ window.runAIBrief = simpleAIBrief; }
  if (document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', installOverride);
  } else {
    installOverride();
  }

  let _scheduled = false;
  function scheduleUpdate(){
    if (_scheduled) return;
    _scheduled = true;
    setTimeout(() => { _scheduled = false; simpleAIBrief(); }, 250);
  }
  window.addEventListener('load', () => {
    const tb = document.getElementById('sector-tbody');
    if (tb){
      const obs = new MutationObserver(scheduleUpdate);
      obs.observe(tb, {childList:true, subtree:true, characterData:true});
    }
    setTimeout(simpleAIBrief, 1500);
    setTimeout(simpleAIBrief, 3500);
  });
})();


/* ──────────── [4] MACRO MODULE (IIFE) ──────────── */

/* ═══════════════════════════════════════════════════════════
   MACRO MODULE (FRED dashboard) — namespaced IIFE
   Originally /macro.html inline script.
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  // Guard: only run once; later hash changes call window.initMacro
  if (window.__macroLoaded) return;
  window.__macroLoaded = true;

  // ── BEGIN macro.html inline script ──

/* ═══════════════════════════════════════════════════════════
   MACRO DASHBOARD
   ═══════════════════════════════════════════════════════════ */

const FRED_KEY = 'aa7f8d740d367d9ff2354194b5329fbe';
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours
const PROXY_URL = (localStorage.getItem('app_proxy_url') || '').replace(/\/+$/, '');

/* ── Mobile "More" bottom sheet ── */
function toggleMobileMenu(){
  const m = document.getElementById('mobile-menu');
  const o = document.getElementById('mob-overlay');
  if (!m) return;
  if (m.classList.contains('open')) { closeMobileMenu(); return; }
  m.classList.add('open');
  if (o) o.classList.add('open');
}
function closeMobileMenu(){
  const m = document.getElementById('mobile-menu');
  const o = document.getElementById('mob-overlay');
  if (m) m.classList.remove('open');
  if (o) o.classList.remove('open');
}
document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMobileMenu(); });

/* ── Terminal clocks ── */
(function(){
  function tick(){
    const now = new Date();
    const tlv = now.toLocaleTimeString('en-GB',{hour12:false,timeZone:'Asia/Jerusalem'});
    const ny  = now.toLocaleTimeString('en-GB',{hour12:false,timeZone:'America/New_York'});
    const a=document.getElementById('term-clock-tlv'); if(a)a.textContent=tlv;
    const b=document.getElementById('term-clock-ny'); if(b)b.textContent=ny;
    const d=document.getElementById('hdr-build');
    if(d){
      const str=now.toLocaleDateString('en-US',{year:'numeric',month:'2-digit',day:'2-digit'}).replace(/\//g,'.');
      d.textContent = 'build · ' + str;
    }
  }
  tick(); setInterval(tick,1000);
})();

/* ── Indicators configuration ── */
const INDICATORS = [
  { id:'PAYEMS', nameHe:'שינוי תעסוקה (NFP)', nameEn:'Nonfarm Payrolls Δ', unit:'K', type:'delta', color:'#f59e0b', format:'int' },
  { id:'CPIAUCSL', nameHe:'אינפלציה (CPI %)', nameEn:'CPI YoY', unit:'%', type:'yoy', color:'#3b82f6', format:'pct' },
  { id:'FEDFUNDS', nameHe:'ריבית הפד', nameEn:'Fed Funds Rate', unit:'%', type:'level', color:'#8b5cf6', format:'pct' },
  { id:'A191RL1Q225SBEA', nameHe:'צמיחת GDP (SAAR)', nameEn:'Real GDP QoQ', unit:'%', type:'level', color:'#a855f7', format:'pct', freq:'Q' },
  { id:'UMCSENT', nameHe:'אמון הצרכן (מישיגן)', nameEn:'Consumer Confidence', unit:'', type:'level', color:'#dc2626', format:'num' },
  { id:'RSAFS', nameHe:'מכירות קמעונאיות (MoM)', nameEn:'Retail Sales MoM', unit:'%', type:'mom', color:'#0ea5e9', format:'pct' },
  { id:'ICSA', nameHe:'תביעות אבטלה ראשוניות', nameEn:'Initial Jobless Claims', unit:'K', type:'level', color:'#14b8a6', format:'int', scale:0.001 },
  { id:'PPIACO', nameHe:'מחירי יצרן (PPI YoY)', nameEn:'PPI YoY', unit:'%', type:'yoy', color:'#a78bfa', format:'pct' },
  { id:'PCEPILFE', nameHe:'Core PCE (YoY)', nameEn:'Core PCE YoY', unit:'%', type:'yoy', color:'#eab308', format:'pct' },
  { id:'JTSJOL', nameHe:'משרות פנויות (JOLTs)', nameEn:'JOLTs Openings', unit:'M', type:'level', color:'#06b6d4', format:'dec1', scale:0.001 },
  { id:'DGORDER', nameHe:'הזמנות בני קיימא', nameEn:'Durable Goods Orders', unit:'B$', type:'level', color:'#84cc16', format:'int', scale:0.001 },
  { id:'PERMIT', nameHe:'היתרי בנייה', nameEn:'Building Permits', unit:'K', type:'level', color:'#f97316', format:'int' },
  { id:'EXHOSLUSM495S', nameHe:'מכירות בתים קיימים', nameEn:'Existing Home Sales', unit:'M', type:'level', color:'#ec4899', format:'dec2', scale:0.000001 }
];

/* ── Helpers ── */
function formatValue(v, format){
  if (v == null || isNaN(v)) return '–';
  if (format === 'pct') return (v >= 0 ? '+' : '') + v.toFixed(2) + '%';
  if (format === 'int') return (v >= 0 ? '+' : '') + Math.round(v).toLocaleString();
  if (format === 'dec1') return v.toFixed(1);
  if (format === 'dec2') return v.toFixed(2);
  return v.toFixed(1);
}

function formatDate(dateStr){
  // YYYY-MM-DD → MM/YY
  const [y,m] = dateStr.split('-');
  return m + '/' + y.slice(2);
}

/* ── FRED fetch with cache (via Cloudflare Worker proxy) ── */
async function fetchFred(id, limit){
  const cacheKey = 'fred_cache_' + id;
  try {
    const raw = localStorage.getItem(cacheKey);
    if (raw){
      const cached = JSON.parse(raw);
      if (cached.t && (Date.now() - cached.t) < CACHE_TTL && cached.data){
        return cached.data;
      }
    }
  } catch(e){}
  if (!PROXY_URL){
    throw new Error('Worker proxy not configured');
  }
  const fredUrl = `https://api.stlouisfed.org/fred/series/observations?series_id=${id}&api_key=${FRED_KEY}&file_type=json&sort_order=desc&limit=${limit}`;
  // Route through Cloudflare Worker (same pattern as app.js)
  const proxiedUrl = `${PROXY_URL}/?url=${encodeURIComponent(fredUrl)}`;
  const r = await fetch(proxiedUrl);
  if (!r.ok) throw new Error('HTTP ' + r.status);
  const d = await r.json();
  const obs = (d.observations || [])
    .filter(o => o.value !== '.' && o.value !== '')
    .map(o => ({ date: o.date, value: parseFloat(o.value) }))
    .reverse(); // oldest-first
  try { localStorage.setItem(cacheKey, JSON.stringify({ t: Date.now(), data: obs })); } catch(e){}
  return obs;
}

/* ── Transform ── */
function transformData(obs, type, scale){
  let out;
  if (type === 'level'){
    out = obs.slice(-12);
  } else if (type === 'yoy'){
    const tmp = [];
    for (let i = 12; i < obs.length; i++){
      if (obs[i-12].value > 0){
        const yoy = ((obs[i].value / obs[i-12].value) - 1) * 100;
        tmp.push({ date: obs[i].date, value: yoy });
      }
    }
    out = tmp.slice(-12);
  } else if (type === 'mom'){
    const tmp = [];
    for (let i = 1; i < obs.length; i++){
      if (obs[i-1].value !== 0){
        const mom = ((obs[i].value / obs[i-1].value) - 1) * 100;
        tmp.push({ date: obs[i].date, value: mom });
      }
    }
    out = tmp.slice(-12);
  } else if (type === 'delta'){
    const tmp = [];
    for (let i = 1; i < obs.length; i++){
      tmp.push({ date: obs[i].date, value: obs[i].value - obs[i-1].value });
    }
    out = tmp.slice(-12);
  } else {
    out = obs.slice(-12);
  }
  if (scale && scale !== 1){
    out = out.map(o => ({ date: o.date, value: o.value * scale }));
  }
  return out;
}

/* ── Chart rendering ── */
function renderChart(ind, data){
  const canvas = document.getElementById('chart-' + ind.id);
  if (!canvas) return;
  const labels = data.map(d => formatDate(d.date));
  const values = data.map(d => d.value);

  // Show positive as green, negative as red, when data spans zero
  const hasNeg = values.some(v => v < 0);
  const hasPos = values.some(v => v >= 0);
  const chartType = (hasNeg && hasPos && ind.type !== 'delta') ? 'line' : 'bar';

  let backgroundColor, borderColor;
  if (chartType === 'bar'){
    // Color per bar based on sign (for delta/mom/yoy)
    if (ind.type === 'delta' || ind.type === 'mom' || ind.type === 'yoy'){
      backgroundColor = values.map(v => v >= 0 ? ind.color + 'dd' : '#e77385dd');
    } else {
      backgroundColor = ind.color + 'cc';
    }
  }

  const cfg = {
    type: chartType,
    data: {
      labels,
      datasets: [{
        data: values,
        backgroundColor: chartType === 'bar' ? backgroundColor : (ind.color + '20'),
        borderColor: chartType === 'line' ? ind.color : undefined,
        borderWidth: chartType === 'line' ? 2 : 0,
        borderRadius: chartType === 'bar' ? 3 : 0,
        pointRadius: chartType === 'line' ? 3 : 0,
        pointBackgroundColor: ind.color,
        fill: chartType === 'line',
        tension: chartType === 'line' ? 0.3 : 0,
      }]
    },
    options: {
      responsive: true,
      maintainAspectRatio: false,
      animation: { duration: 400 },
      plugins: {
        legend: { display: false },
        tooltip: {
          backgroundColor: 'rgba(11,19,17,0.95)',
          borderColor: 'rgba(79,199,138,0.4)',
          borderWidth: 1,
          titleFont: { family: 'JetBrains Mono', size: 10, weight: '700' },
          bodyFont: { family: 'JetBrains Mono', size: 11, weight: '800' },
          titleColor: '#4fc78a',
          bodyColor: '#dfe4e0',
          padding: 8,
          cornerRadius: 5,
          displayColors: false,
          callbacks: {
            label: (ctx) => formatValue(ctx.parsed.y, ind.format) + (ind.unit || '')
          }
        }
      },
      scales: {
        x: {
          ticks: {
            color: (document.body.classList.contains('light') ? 'rgba(18,35,63,0.58)' : 'rgba(223,228,224,0.5)'),
            font: { family: 'JetBrains Mono', size: 9 },
            maxRotation: 0,
            autoSkip: true,
            maxTicksLimit: 6
          },
          grid: { display: false },
          border: { color: (document.body.classList.contains('light') ? 'rgba(18,35,63,0.12)' : 'rgba(214,213,212,0.12)') }
        },
        y: {
          ticks: {
            color: (document.body.classList.contains('light') ? 'rgba(18,35,63,0.58)' : 'rgba(223,228,224,0.5)'),
            font: { family: 'JetBrains Mono', size: 9 },
            maxTicksLimit: 5,
            callback: function(v){ return formatValue(v, ind.format); }
          },
          grid: { color: (document.body.classList.contains('light') ? 'rgba(18,35,63,0.08)' : 'rgba(255,255,255,0.04)') },
          border: { display: false }
        }
      }
    }
  };

  if (window.__macroCharts && window.__macroCharts[ind.id]){
    try { window.__macroCharts[ind.id].destroy(); } catch(e){}
  }
  window.__macroCharts = window.__macroCharts || {};
  window.__macroCharts[ind.id] = new Chart(canvas, cfg);
}

/* ── KPI rendering ── */
function renderKpi(ind, data){
  const el = document.getElementById('kpi-' + ind.id);
  if (!el) return;
  if (!data.length){
    el.innerHTML = `<div class="kpi-label">${ind.nameHe}</div><div class="kpi-val-row"><span class="kpi-val">–</span></div>`;
    return;
  }
  const latest = data[data.length-1];
  const prev = data.length > 1 ? data[data.length-2] : null;
  const isPct = ind.type === 'yoy' || ind.type === 'mom' || ind.type === 'delta';
  const valClass = (isPct && latest.value > 0) ? 'pos' : (isPct && latest.value < 0) ? 'neg' : '';
  const borderClass = (isPct && latest.value < 0) ? 'neg' : '';
  // formatValue already appends '%' when format is 'pct'. Adding ind.unit in that case
  // produced a double "%%". Only append unit when the formatter didn't already.
  const unitSuffix = (ind.format === 'pct') ? '' : (ind.unit || '');
  el.className = 'kpi-item ' + borderClass;
  el.innerHTML = `
    <div class="kpi-label">${ind.nameHe}</div>
    <div class="kpi-val-row">
      <span class="kpi-val ${valClass}">${formatValue(latest.value, ind.format)}${unitSuffix}</span>
    </div>
    <div class="kpi-date">${formatDate(latest.date)}</div>`;
}

/* ── Init: render grid skeletons ── */
function initUI(){
  const kpiStrip = document.getElementById('kpi-strip');
  const chartsGrid = document.getElementById('charts-grid');
  kpiStrip.innerHTML = INDICATORS.map(ind => `
    <div class="kpi-item neu" id="kpi-${ind.id}">
      <div class="kpi-label">${ind.nameHe}</div>
      <div class="kpi-val-row"><span class="kpi-val">–</span></div>
    </div>
  `).join('');
  chartsGrid.innerHTML = INDICATORS.map(ind => `
    <div class="chart-card">
      <div class="chart-hdr">
        <div class="chart-title">${ind.nameHe}</div>
        <div class="chart-badge">${ind.id}</div>
      </div>
      <div class="chart-body">
        <div class="chart-loading" id="load-${ind.id}"><div class="mini-ring"></div> טוען...</div>
        <canvas id="chart-${ind.id}"></canvas>
      </div>
    </div>
  `).join('');
}

/* ── Load all ── */
async function loadAll(){
  initUI();

  // Determine fetch limit per type (yoy needs 12 more)
  const fetches = INDICATORS.map(async ind => {
    const baseLimit = 12;
    let limit = baseLimit + 2;
    if (ind.type === 'yoy') limit = baseLimit + 13;
    if (ind.type === 'delta' || ind.type === 'mom') limit = baseLimit + 2;
    if (ind.freq === 'Q') limit = 12; // quarterly
    try {
      const raw = await fetchFred(ind.id, limit);
      const data = transformData(raw, ind.type, ind.scale || 1);
      const loader = document.getElementById('load-' + ind.id);
      if (loader) loader.style.display = 'none';
      if (!data.length){
        const body = document.querySelector(`#chart-${ind.id}`).parentElement;
        body.innerHTML = '<div class="chart-err">אין נתונים זמינים</div>';
        return;
      }
      renderChart(ind, data);
      renderKpi(ind, data);
    } catch (err) {
      console.error('Failed:', ind.id, err);
      const loader = document.getElementById('load-' + ind.id);
      if (loader){
        loader.innerHTML = '<span style="color:var(--red)">שגיאה בטעינה</span>';
      }
    }
  });

  await Promise.allSettled(fetches);

  // Hide overlay
  const overlay = document.getElementById('page-loading');
  if (overlay) overlay.classList.add('hidden');

  // Last-updated indicator
  const lu = document.getElementById('last-updated');
  if (lu){
    const now = new Date();
    lu.textContent = 'עודכן: ' + now.toLocaleTimeString('he-IL', {hour:'2-digit', minute:'2-digit'});
  }
}

// Run on load
if (document.readyState === 'loading'){
  document.addEventListener('DOMContentLoaded', loadAll);
} else {
  loadAll();
}

  // ── END macro.html inline script ──

  // Expose lazy initializer (called by router when #/macro shown)
  window.initMacro = function(){
    if (window.__macroInited) return;
    window.__macroInited = true;
    try { if (typeof loadAll === "function") loadAll(); } catch(e){ console.error(e); }
  };
  // Expose a re-render hook so toggleTheme() can refresh macro
  // chart axis colors when the theme changes.
  window.rerenderMacroCharts = function(){
    if (!window.__macroCharts || typeof INDICATORS === "undefined") return;
    try {
      for (const ind of INDICATORS) {
        const chart = window.__macroCharts[ind.id];
        if (!chart || typeof chart.data === "undefined") continue;
        // Re-derive color based on current theme and push to options.
        const isL = document.body.classList.contains("light");
        const tickColor = isL ? "rgba(18,35,63,0.58)" : "rgba(223,228,224,0.5)";
        const gridColor = isL ? "rgba(18,35,63,0.08)" : "rgba(255,255,255,0.04)";
        const borderColor = isL ? "rgba(18,35,63,0.12)" : "rgba(214,213,212,0.12)";
        if (chart.options && chart.options.scales) {
          if (chart.options.scales.x) {
            if (chart.options.scales.x.ticks)  chart.options.scales.x.ticks.color  = tickColor;
            if (chart.options.scales.x.border) chart.options.scales.x.border.color = borderColor;
          }
          if (chart.options.scales.y) {
            if (chart.options.scales.y.ticks) chart.options.scales.y.ticks.color = tickColor;
            if (chart.options.scales.y.grid)  chart.options.scales.y.grid.color  = gridColor;
          }
        }
        chart.update("none");  // no animation, just repaint
      }
    } catch(e){ console.error("rerenderMacroCharts:", e); }
  };
  // Wire the `toggleMobileMenu` global (macro declared it locally).
  if (!window.toggleMobileMenu && typeof toggleMobileMenu === "function")
    window.toggleMobileMenu = toggleMobileMenu;
  if (!window.closeMobileMenu && typeof closeMobileMenu === "function")
    window.closeMobileMenu = closeMobileMenu;
})();

/* ──────────── [5] ADVISOR MODULE (IIFE) ──────────── */

/* ═══════════════════════════════════════════════════════════
   ADVISOR MODULE (stock advisor scanner) — namespaced IIFE
   Originally /advisor.html inline script.
   ═══════════════════════════════════════════════════════════ */
(function(){
  "use strict";
  if (window.__advisorLoaded) return;
  window.__advisorLoaded = true;

  // Advisor declared its init as an IIFE. We need to defer that
  // until the user actually navigates to #/advisor. So we rename
  // its self-calling init() to advisorBoot() and expose it.
  // Regex: the file opens with `(function init() {` and we turn
  // it into a named function.
  // Start of advisor.html script:

// ═══════════════════════════════════════════════════════════
// StockPulse Advisor — Core Logic
// ═══════════════════════════════════════════════════════════

const $ = id => document.getElementById(id);
const sleep = ms => new Promise(r => setTimeout(r, ms));

// Get proxy URL from localStorage (set by index.html / dashboard.html)
const PROXY = localStorage.getItem('app_proxy_url') || '';

// Cache keys
// Cache version bumped v2→v3 after expanding LARGE from 217→500 and MID from 185→~390.
// Stale v1/v2/v3 caches are silently ignored by lookup and purged at boot (IIFE below).
// v4 = after MID_CAP_HOLDINGS was rebuilt to match the official S&P MidCap 400 list
// (previously the list was based on training knowledge and drifted ~7 constituents).
const CACHE_KEY_BASE = 'advisor_scan_cache_v4';
const WL_KEY = 'advisor_watchlist_v1';
const UNIVERSE_KEY = 'advisor_universe_v1';
const METHODOLOGY_KEY = 'advisor_methodology_v1';
const CACHE_TTL = 4 * 60 * 60 * 1000; // 4 hours

// One-time cleanup: purge stale cache versions (v1, v2) from localStorage to
// reclaim space on browsers with tight quotas (Safari ~5MB). Old keys just
// pile up otherwise — they're orphaned by the version bump.
(function purgeStaleCaches(){
  try {
    const stale = Object.keys(localStorage).filter(k =>
      /^advisor_scan_cache_v[123]_/.test(k)
    );
    stale.forEach(k => localStorage.removeItem(k));
    if (stale.length) console.info(`purged ${stale.length} stale scan cache(s)`);
  } catch(e){}
})();

// Sector Hebrew names
const SECTOR_NAMES = {
  XLK:'טכנולוגיה', XLF:'פיננסים', XLE:'אנרגיה', XLV:'בריאות',
  XLC:'תקשורת', XLI:'תעשייה', XLB:'חומרים', XLRE:'נדל״ן',
  XLU:'תשתיות', XLP:'צריכה בסיסית', XLY:'צריכה שיקולית'
};

/* ════════════════════════════════════════════════════════════════════════════
   SUB-INDUSTRY · GICS Sub-Industry classification per ticker.
   SI_LABELS (code → {e, h}) + SYM_SUBIND (ticker → code). Sub-industry is
   one level below the sector (e.g. XLK → "Semiconductors"), shown in the
   stock detail panel and can be extended to a filter in the future. Unmapped
   tickers (rare) fall back to the sector label.
   ════════════════════════════════════════════════════════════════════════════ */
const SI_LABELS = {
  semi:{e:'Semiconductors',h:'מוליכים למחצה'},
  thw:{e:'Tech Hardware & Storage',h:'חומרת מחשבים ואחסון'},
  sw:{e:'Software',h:'תוכנה'},
  itsvc:{e:'IT Services',h:'שירותי IT'},
  commeq:{e:'Communications Equipment',h:'ציוד תקשורת'},
  elec:{e:'Electronic Equipment',h:'ציוד אלקטרוני'},
  imds:{e:'Interactive Media',h:'מדיה אינטראקטיבית'},
  ent:{e:'Entertainment',h:'בידור'},
  media:{e:'Media',h:'מדיה'},
  dtel:{e:'Telecom (Wired)',h:'טלקום קווי'},
  wtel:{e:'Wireless Telecom',h:'טלקום אלחוטי'},
  bret:{e:'Broadline Retail',h:'קמעונאות רחבה'},
  sret:{e:'Specialty Retail',h:'קמעונאות ייעודית'},
  csdr:{e:'Staples Distribution',h:'הפצת מוצרי צריכה'},
  hrl:{e:'Hotels, Rest. & Leisure',h:'מלונות, מסעדות ופנאי'},
  auto:{e:'Automobiles',h:'רכב'},
  autop:{e:'Auto Components',h:'חלקי רכב'},
  appar:{e:'Apparel & Luxury',h:'ביגוד ויוקרה'},
  leis:{e:'Leisure Products',h:'מוצרי פנאי'},
  hhd:{e:'Household Durables',h:'מוצרי בית ברי-קיימא'},
  hhp:{e:'Household Products',h:'מוצרי בית'},
  pcp:{e:'Personal Care',h:'טיפוח אישי'},
  food:{e:'Food Products',h:'מוצרי מזון'},
  bev:{e:'Beverages',h:'משקאות'},
  tob:{e:'Tobacco',h:'טבק'},
  dist:{e:'Distributors',h:'מפיצים'},
  bank:{e:'Banks',h:'בנקים'},
  cfin:{e:'Consumer Finance',h:'אשראי צרכני'},
  capm:{e:'Capital Markets',h:'שווקי הון'},
  ins:{e:'Insurance',h:'ביטוח'},
  fin:{e:'Financial Services',h:'שירותים פיננסיים'},
  pharm:{e:'Pharmaceuticals',h:'תרופות'},
  biot:{e:'Biotechnology',h:'ביוטק'},
  hcps:{e:'HC Providers & Services',h:'שירותי בריאות'},
  hces:{e:'HC Equipment & Supplies',h:'ציוד וחומרים רפואיים'},
  lsts:{e:'Life Sciences Tools',h:'כלים ללייף-סייאנס'},
  oil:{e:'Oil, Gas & Fuels',h:'נפט וגז'},
  oilsvc:{e:'Energy Equipment & Svcs',h:'ציוד ושירותי אנרגיה'},
  aero:{e:'Aerospace & Defense',h:'אווירונאוטיקה וביטחון'},
  mach:{e:'Machinery',h:'מכונות'},
  cmach:{e:'Construction & Heavy Transportation',h:'מכונות בנייה והובלה כבדה'},
  icong:{e:'Industrial Conglomerates',h:'קונגלומרטים תעשייתיים'},
  css:{e:'Commercial Services',h:'שירותים מסחריים'},
  prof:{e:'Professional Services',h:'שירותים מקצועיים'},
  gtrans:{e:'Ground Transportation',h:'הובלה יבשתית'},
  airf:{e:'Air Freight & Logistics',h:'הובלה אווירית ולוגיסטיקה'},
  airline:{e:'Passenger Airlines',h:'חברות תעופה'},
  bldg:{e:'Building Products',h:'מוצרי בנייה'},
  ceng:{e:'Construction & Engineering',h:'בנייה והנדסה'},
  ee:{e:'Electrical Equipment',h:'ציוד חשמלי'},
  td:{e:'Trading Companies',h:'חברות סחר והפצה'},
  chem:{e:'Chemicals',h:'כימיקלים'},
  metal:{e:'Metals & Mining',h:'מתכות וכרייה'},
  cmat:{e:'Construction Materials',h:'חומרי בניין'},
  cp:{e:'Containers & Packaging',h:'אריזות ומיכולים'},
  paper:{e:'Paper & Forest',h:'נייר ויערנות'},
  spreit:{e:'Specialized REITs',h:'REITs מיוחדות'},
  dreit:{e:'Diversified REITs',h:'REITs מגוונות'},
  rreit:{e:'Residential REITs',h:'REITs מגורים'},
  remd:{e:'Real Estate Mgmt & Dev',h:'ניהול ופיתוח נדל״ן'},
  elutil:{e:'Electric Utilities',h:'חשמל'},
  multutil:{e:'Multi-Utilities',h:'שירותי תשתית משולבים'},
  gasutil:{e:'Gas Utilities',h:'גז'},
  watutil:{e:'Water Utilities',h:'מים'},
  ipwr:{e:'Independent Power',h:'חברות חשמל עצמאיות'},
};

const SYM_SUBIND = {"NVDA":"semi","AAPL":"thw","MSFT":"sw","AMZN":"bret","GOOGL":"imds","GOOG":"imds","AVGO":"semi","META":"imds","TSLA":"auto","BRK.B":"fin","WMT":"csdr","JPM":"bank","LLY":"pharm","V":"fin","XOM":"oil","JNJ":"pharm","MU":"semi","ORCL":"sw","MA":"fin","AMD":"semi","COST":"csdr","NFLX":"ent","BAC":"bank","CAT":"mach","ABBV":"biot","CVX":"oil","PLTR":"sw","HD":"sret","INTC":"semi","PG":"hhp","CSCO":"commeq","LRCX":"semi","KO":"bev","GE":"aero","AMAT":"semi","MS":"capm","UNH":"hcps","MRK":"pharm","GS":"capm","GEV":"ee","RTX":"aero","WFC":"bank","PM":"tob","IBM":"itsvc","KLAC":"semi","LIN":"chem","AXP":"cfin","C":"bank","MCD":"hrl","TMUS":"wtel","PEP":"bev","TXN":"semi","ANET":"commeq","TMO":"lsts","VZ":"dtel","NEE":"elutil","AMGN":"biot","DIS":"ent","APH":"elec","T":"dtel","ADI":"semi","TJX":"sret","BA":"aero","GILD":"biot","ABT":"hces","CRM":"sw","ISRG":"hces","BLK":"capm","APP":"sw","SCHW":"capm","DE":"mach","ETN":"ee","UBER":"gtrans","PFE":"pharm","BKNG":"hrl","UNP":"gtrans","WELL":"dreit","HON":"icong","QCOM":"semi","COP":"oil","GLW":"elec","LOW":"sret","DHR":"lsts","LMT":"aero","PANW":"sw","SNDK":"thw","PLD":"dreit","SYK":"hces","SPGI":"capm","CB":"ins","COF":"cfin","DELL":"thw","WDC":"thw","NEM":"metal","PH":"mach","BMY":"pharm","STX":"thw","ACN":"itsvc","PGR":"ins","VRT":"ee","SBUX":"hrl","VRTX":"biot","MDT":"hces","HCA":"hcps","INTU":"sw","CRWD":"sw","EQIX":"spreit","CEG":"elutil","MO":"tob","CMCSA":"media","SO":"elutil","MCK":"hcps","TT":"bldg","CME":"capm","HWM":"aero","FCX":"metal","BX":"capm","NOW":"sw","MAR":"hrl","DUK":"elutil","CVS":"hcps","ADBE":"sw","BSX":"hces","NOC":"aero","FDX":"airf","BK":"capm","KKR":"capm","ICE":"capm","GD":"aero","UPS":"airf","PNC":"bank","PWR":"ceng","WM":"css","USB":"bank","WMB":"oil","CMI":"mach","JCI":"bldg","SNPS":"sw","CDNS":"sw","SHW":"chem","AMT":"spreit","MMC":"ins","ABNB":"hrl","EMR":"ee","HOOD":"capm","MCO":"capm","MMM":"icong","ADP":"prof","CSX":"gtrans","DASH":"hrl","REGN":"biot","SLB":"oilsvc","ITW":"mach","ORLY":"sret","CRH":"cmat","HLT":"hrl","ECL":"chem","RCL":"hrl","MNST":"bev","GM":"auto","MDLZ":"food","CI":"hcps","MSI":"commeq","ROST":"sret","AEP":"elutil","TEL":"elec","MPWR":"semi","APO":"fin","CIEN":"commeq","CTAS":"css","TDG":"aero","KMI":"oil","AON":"ins","ELV":"hcps","DLR":"spreit","WBD":"ent","CL":"hhp","EOG":"oil","NKE":"appar","NSC":"gtrans","SPG":"dreit","VLO":"oil","PCAR":"mach","LHX":"aero","APD":"chem","COHR":"elec","RSG":"css","TRV":"ins","LITE":"commeq","COR":"hcps","MPC":"oil","TFC":"bank","PSX":"oil","SRE":"multutil","O":"dreit","FTNT":"sw","TER":"semi","BKR":"oilsvc","AFL":"ins","AZO":"sret","FIX":"ceng","TGT":"csdr","KEYS":"elec","AJG":"ins","ALL":"ins","CVNA":"sret","VST":"ipwr","GWW":"td","D":"multutil","NXPI":"semi","COIN":"capm","PSA":"spreit","AME":"ee","CTVA":"chem","OXY":"oil","ETR":"elutil","OKE":"oil","FAST":"td","F":"auto","GRMN":"hhd","ZTS":"pharm","CARR":"bldg","ADSK":"sw","EA":"ent","MET":"ins","FANG":"oil","XEL":"elutil","TRGP":"oil","NDAQ":"capm","CAH":"hcps","URI":"td","EXC":"elutil","DAL":"airline","EBAY":"bret","IDXX":"hces","ROK":"ee","EW":"hces","CMG":"hrl","PYPL":"fin","FITB":"bank","ODFL":"gtrans","BDX":"hces","YUM":"hrl","WAB":"mach","DDOG":"sw","NUE":"metal","CBRE":"remd","DHI":"hhd","XYZ":"fin","MCHP":"semi","AIG":"ins","KR":"csdr","MSCI":"capm","AMP":"capm","PEG":"multutil","ED":"multutil","CCL":"hrl","VTR":"dreit","STT":"capm","TTWO":"ent","HSY":"food","CCI":"spreit","SATS":"media","HIG":"ins","LVS":"hrl","VMC":"cmat","PCG":"elutil","WEC":"multutil","MLM":"cmat","ROP":"sw","LYV":"ent","EQT":"oil","SYY":"csdr","IBKR":"capm","KDP":"bev","EME":"ceng","NRG":"elutil","PRU":"ins","IRM":"spreit","HPE":"thw","ACGL":"ins","A":"lsts","HBAN":"bank","FISV":"fin","GEHC":"hces","JBL":"elec","KVUE":"pcp","IR":"mach","RMD":"hces","UAL":"airline","PAYX":"prof","KMB":"hhp","ON":"semi","EXPE":"hrl","AXON":"aero","ADM":"food","CPRT":"css","WAT":"lsts","MTB":"bank","WDAY":"sw","OTIS":"mach","TPR":"appar","CBOE":"capm","AEE":"multutil","HAL":"oilsvc","VICI":"spreit","ATO":"gasutil","EXR":"spreit","DTE":"multutil","RJF":"capm","IQV":"lsts","DOV":"mach","NTRS":"capm","CHTR":"media","TDY":"elec","PPL":"elutil","CTSH":"itsvc","XYL":"mach","TPL":"oil","STLD":"metal","FE":"elutil","Q":"semi","HUBB":"ee","STZ":"bev","CNP":"multutil","WTW":"ins","DG":"csdr","CASY":"csdr","EL":"pcp","DVN":"oil","CFG":"bank","EIX":"elutil","SYF":"cfin","MTD":"lsts","KHC":"food","ROL":"css","ARES":"capm","BIIB":"biot","ES":"elutil","CINF":"ins","PPG":"chem","AWK":"watutil","DOW":"chem","FICO":"sw","WRB":"ins","VRSN":"itsvc","FIS":"fin","HUM":"hcps","DXCM":"hces","PHM":"hhd","ULTA":"sret","AVB":"rreit","RF":"bank","CMS":"multutil","TSCO":"sret","EFX":"prof","SBAC":"spreit","WSM":"sret","EQR":"rreit","CTRA":"oil","RL":"appar","KEY":"bank","VRSK":"prof","ALB":"chem","JBHT":"gtrans","NI":"multutil","BG":"food","EXE":"oil","DRI":"hrl","BRO":"ins","CHD":"hhp","L":"ins","LEN":"hhd","TSN":"food","OMC":"media","VLTO":"css","LH":"hcps","SW":"cp","STE":"hces","CPAY":"fin","DGX":"hcps","CHRW":"airf","LYB":"chem","MRNA":"biot","TROW":"capm","LUV":"airline","DLTR":"csdr","PFG":"ins","NTAP":"thw","FSLR":"semi","GPN":"fin","SNA":"mach","WST":"lsts","IP":"cp","EXPD":"airf","LDOS":"prof","INCY":"biot","NVR":"hhd","DD":"chem","IFF":"chem","AMCR":"cp","LULU":"appar","BR":"itsvc","PKG":"cp","EVRG":"elutil","GIS":"food","LNT":"elutil","CNC":"hcps","FTV":"mach","ZBH":"hces","HPQ":"thw","WY":"spreit","FFIV":"commeq","CF":"chem","BALL":"cp","SMCI":"thw","CDW":"elec","VTRS":"pharm","LII":"bldg","CSGP":"remd","PTC":"sw","ESS":"rreit","KIM":"dreit","INVH":"rreit","TRMB":"elec","DECK":"appar","TXT":"aero","GPC":"dist","NDSN":"mach","HII":"aero","IEX":"mach","J":"prof","MAA":"rreit","REG":"dreit","PNR":"mach","MKC":"food","TYL":"sw","TKO":"ent","HST":"dreit","BEN":"capm","AKAM":"itsvc","PODD":"hces","EG":"ins","BBY":"sret","COO":"hces","HAS":"leis","ALGN":"hces","MAS":"bldg","BF.B":"bev","AVY":"cp","FOX":"media","FOXA":"media","PSKY":"media","ERIE":"ins","APTV":"autop","CLX":"hhp","APA":"oil","PNW":"elutil","DPZ":"hrl","GNRC":"ee","ALLE":"bldg","SOLV":"hces","GEN":"sw","DOC":"dreit","GL":"ins","HRL":"food","UDR":"rreit","GDDY":"itsvc","WYNN":"hrl","AIZ":"ins","ZBRA":"elec","UHS":"hcps","JKHY":"fin","SWK":"mach","IVZ":"capm","IT":"itsvc","CPT":"rreit","TTD":"media","RVTY":"lsts","AES":"ipwr","SJM":"food","DVA":"hcps","MGM":"hrl","FRT":"dreit","BAX":"hces","NCLH":"hrl","NWSA":"media","BLDR":"bldg","TECH":"lsts","BXP":"dreit","CRL":"lsts","HSIC":"hcps","AOS":"bldg","SWKS":"semi","FDS":"capm","ARE":"dreit","TAP":"bev","POOL":"dist","MOS":"chem","CAG":"food","EPAM":"itsvc","CPB":"food","NWS":"media","AA":"metal","AAL":"airline","AAON":"bldg","ACI":"csdr","ACM":"ceng","ADC":"dreit","AEIS":"semi","AFG":"ins","AGCO":"mach","AHR":"dreit","AIT":"td","ALGM":"semi","ALK":"airline","ALLY":"cfin","ALV":"autop","AM":"oil","AMG":"capm","AMH":"rreit","AMKR":"semi","AN":"sret","ANF":"sret","APG":"ceng","APPF":"sw","AR":"oil","ARMK":"dist","ARW":"td","ARWR":"biot","ASB":"bank","ASGN":"itsvc","ASH":"chem","ATI":"aero","ATR":"cp","AVAV":"aero","AVNT":"chem","AVT":"td","AVTR":"lsts","AXTA":"chem","AYI":"ee","BAH":"prof","BBWI":"sret","BC":"leis","BCO":"css","BDC":"elec","BHF":"ins","BILL":"sw","BIO":"lsts","BJ":"csdr","BKH":"multutil","BLD":"hhd","BLKB":"sw","BMRN":"biot","BRBR":"food","BRKR":"hces","BROS":"hrl","BRX":"dreit","BSY":"sw","BURL":"sret","BWA":"autop","BWXT":"aero","BYD":"hrl","CACI":"css","CAR":"gtrans","CART":"csdr","CAVA":"hrl","CBSH":"bank","CBT":"chem","CCK":"cp","CDP":"dreit","CELH":"bev","CFR":"bank","CG":"capm","CGNX":"elec","CHDN":"hrl","CHE":"hcps","CHH":"hrl","CHRD":"oil","CHWY":"sret","CLF":"metal","CLH":"css","CMC":"metal","CNH":"mach","CNM":"td","CNO":"ins","CNX":"oil","CNXC":"itsvc","COKE":"bev","COLB":"bank","COLM":"appar","COTY":"pcp","CPRI":"appar","CR":"mach","CRBG":"capm","CROX":"appar","CRS":"mach","CRUS":"semi","CSL":"icong","CUBE":"dreit","CUZ":"dreit","CVLT":"sw","CW":"aero","CXT":"elec","CYTK":"biot","DAR":"food","DBX":"sw","DCI":"mach","DINO":"oil","DKS":"sret","DLB":"sw","DOCS":"hcps","DOCU":"sw","DT":"sw","DTM":"oil","DUOL":"prof","DY":"ceng","EEFT":"fin","EGP":"dreit","EHC":"hcps","ELAN":"pharm","ELF":"pcp","ELS":"rreit","ENS":"ee","ENSG":"hcps","ENTG":"semi","EPR":"spreit","EQH":"fin","ESAB":"mach","ESNT":"fin","EVR":"capm","EWBC":"bank","EXEL":"biot","EXLS":"itsvc","EXP":"cmat","EXPO":"prof","FAF":"ins","FBIN":"bldg","FCFS":"cfin","FCN":"prof","FFIN":"bank","FHI":"capm","FHN":"bank","FIVE":"sret","FLEX":"elec","FLG":"bank","FLO":"food","FLR":"ceng","FLS":"mach","FN":"elec","FNB":"bank","FND":"sret","FNF":"ins","FOUR":"fin","FR":"dreit","FTI":"oilsvc","G":"itsvc","GAP":"sret","GATX":"cmach","GBCI":"bank","GEF":"cp","GGG":"mach","GHC":"prof","GLPI":"spreit","GME":"bret","GMED":"hces","GNTX":"autop","GPK":"cp","GT":"autop","GTLS":"mach","GTM":"imds","GWRE":"sw","GXO":"airf","H":"hrl","HAE":"hces","HALO":"biot","HGV":"hrl","HIMS":"hcps","HL":"metal","HLI":"capm","HLNE":"capm","HOG":"leis","HOMB":"bank","HQY":"hcps","HR":"dreit","HRB":"css","HWC":"bank","HXL":"aero","IBOC":"bank","IDA":"elutil","ILMN":"lsts","INGR":"food","IPGP":"elec","IRT":"rreit","ITT":"mach","JAZZ":"pharm","JEF":"capm","JHG":"capm","JLL":"remd","KBH":"hhd","KBR":"css","KD":"itsvc","KEX":"gtrans","KMPR":"ins","KNF":"cmat","KNSL":"ins","KNX":"gtrans","KRC":"dreit","KRG":"dreit","KTOS":"aero","LAD":"sret","LAMR":"spreit","LEA":"autop","LECO":"mach","LFUS":"elec","LIVN":"hces","LNTH":"hces","LOPE":"prof","LPX":"paper","LSCC":"semi","LSTR":"gtrans","M":"bret","MANH":"sw","MASI":"hces","MAT":"leis","MEDP":"lsts","MIDD":"mach","MKSI":"semi","MLI":"mach","MMS":"itsvc","MORN":"capm","MP":"metal","MSA":"css","MSM":"td","MTDR":"oil","MTG":"ins","MTN":"hrl","MTSI":"semi","MTZ":"ceng","MUR":"oil","MUSA":"sret","MZTI":"food","NBIX":"biot","NEU":"chem","NFG":"gasutil","NJR":"gasutil","NLY":"dreit","NNN":"dreit","NOV":"oilsvc","NOVT":"elec","NSA":"spreit","NTNX":"sw","NVST":"hces","NVT":"ee","NWE":"multutil","NXST":"media","NXT":"ee","NYT":"media","OC":"bldg","OGE":"multutil","OGS":"gasutil","OHI":"dreit","OKTA":"sw","OLED":"semi","OLLI":"bret","OLN":"chem","ONB":"bank","ONTO":"semi","OPCH":"hcps","ORA":"ipwr","ORI":"ins","OSK":"cmach","OVV":"oil","OZK":"bank","PAG":"sret","PATH":"sw","PB":"bank","PBF":"oil","PCTY":"prof","PEGA":"sw","PEN":"hces","PFGC":"csdr","PII":"leis","PINS":"imds","PK":"spreit","PLNT":"hrl","PNFP":"bank","POR":"elutil","POST":"food","PPC":"food","PR":"oil","PRI":"ins","PSN":"aero","PSTG":"thw","PVH":"appar","QLYS":"sw","R":"gtrans","RBA":"css","RBC":"mach","REXR":"dreit","RGA":"ins","RGEN":"biot","RGLD":"metal","RH":"sret","RLI":"ins","RMBS":"semi","RNR":"ins","ROIV":"biot","RPM":"chem","RRC":"oil","RRX":"ee","RS":"metal","RYAN":"ins","RYN":"spreit","SAIA":"gtrans","SAIC":"css","SAM":"bev","SARO":"aero","SBRA":"dreit","SCI":"css","SEIC":"capm","SF":"capm","SFM":"csdr","SGI":"hhd","SHC":"hcps","SIGI":"ins","SLAB":"semi","SLGN":"cp","SLM":"cfin","SMG":"chem","SNX":"td","SON":"cp","SPXC":"mach","SR":"gasutil","SSB":"bank","SSD":"bldg","ST":"ee","STAG":"dreit","STRL":"ceng","STWD":"dreit","SWX":"gasutil","SYNA":"semi","TCBI":"bank","TEX":"cmach","THC":"hcps","THG":"ins","THO":"leis","TKR":"mach","TLN":"ipwr","TMHC":"hhd","TNL":"hrl","TOL":"hhd","TREX":"bldg","TRU":"prof","TTC":"mach","TTEK":"ceng","TTMI":"elec","TWLO":"sw","TXNM":"elutil","TXRH":"hrl","UBSI":"bank","UFPI":"bldg","UGI":"gasutil","ULS":"prof","UMBF":"bank","UNM":"ins","USFD":"csdr","UTHR":"biot","VAL":"oilsvc","VC":"autop","VFC":"appar","VLY":"bank","VMI":"mach","VNO":"dreit","VNOM":"oil","VNT":"elec","VOYA":"capm","VVV":"sret","WAL":"bank","WBS":"bank","WCC":"td","WEX":"fin","WFRD":"oilsvc","WH":"hrl","WHR":"hhd","WING":"hrl","WLK":"chem","WMG":"ent","WMS":"bldg","WPC":"dreit","WSO":"td","WTFC":"bank","WTRG":"watutil","WTS":"bldg","WWD":"ee","XPO":"gtrans","XRAY":"hces","YETI":"leis","ZION":"bank"};

// Return Hebrew sub-industry name for a ticker; null if unmapped.
const getSubIndHe = (sym) => {
  const code = SYM_SUBIND[sym];
  return code && SI_LABELS[code] ? SI_LABELS[code].h : null;
};

/* ════════════════════════════════════════════════════════════════════════════
   UNIVERSE SWITCHING
   Each universe uses identical structure (ETF→holdings), so all downstream
   code (scan, KPIs, sector filter) works unchanged — we just point SYM_SECTOR
   at the currently-active holdings object and keep caches separate per universe.
   ════════════════════════════════════════════════════════════════════════════ */
const UNIVERSES = {
  large: { label:'S&P 500',         labelShort:'S&P 500',         holdings: ETF_HOLDINGS        },
  mid:   { label:'S&P MidCap 400',  labelShort:'S&P MidCap 400',  holdings: MID_CAP_HOLDINGS    },
  ndx:   { label:'NASDAQ 100',      labelShort:'NASDAQ 100',      holdings: NASDAQ_100_HOLDINGS },
};
let currentUniverse = localStorage.getItem(UNIVERSE_KEY) || 'large';
if (!UNIVERSES[currentUniverse]) currentUniverse = 'large';

let currentMethodology = localStorage.getItem(METHODOLOGY_KEY) || 'momentum';
// NOTE: the `if (!METHODOLOGIES[...])` validation that used to be here
// caused a TDZ error because METHODOLOGIES is declared further down in the file.
// Validation is deferred to advisorBoot() where the reference is safe.

const getCurrentHoldings = () => UNIVERSES[currentUniverse].holdings;
const getCurrentMethodology = () => METHODOLOGIES[currentMethodology];
// Per-universe AND per-methodology cache — switching either is instant if cached
const getCacheKey = () => `${CACHE_KEY_BASE}_${currentUniverse}_${currentMethodology}`;

/**
 * Load cached scan for current (universe, methodology). Returns the
 * cached object or null. Automatically backfills sub-industry on
 * stocks cached before that field existed — so users don't have to
 * re-scan to see the new pill in the detail panel.
 */
function loadCachedScan() {
  try {
    const cached = JSON.parse(localStorage.getItem(getCacheKey()));
    if (!cached || Date.now() - cached.timestamp >= CACHE_TTL) return null;
    if (cached.stocks) {
      cached.stocks.forEach(s => {
        if (s.subInd === undefined) s.subInd = SYM_SUBIND[s.sym] || null;
        if (s.subIndName === undefined) s.subIndName = getSubIndHe(s.sym);
        // Backfill per-stock freshness stamp for caches saved before this field
        // existed — all stocks share the scan timestamp in that case.
        if (s.refreshedAt === undefined) s.refreshedAt = cached.timestamp;
      });
    }
    return cached;
  } catch(e) { return null; }
}

// Symbol → sector/name maps, rebuilt whenever the universe changes.
const SYM_SECTOR = {};
const SYM_NAME = {};
function rebuildSymMaps() {
  Object.keys(SYM_SECTOR).forEach(k => delete SYM_SECTOR[k]);
  Object.keys(SYM_NAME).forEach(k => delete SYM_NAME[k]);
  Object.entries(getCurrentHoldings()).forEach(([etf, holdings]) => {
    holdings.forEach(h => {
      if (!SYM_SECTOR[h.s]) {
        SYM_SECTOR[h.s] = etf;
        SYM_NAME[h.s] = h.n;
      }
    });
  });
}
rebuildSymMaps();

/* ════════════════════════════════════════════════════════════════════════════
   WIKIPEDIA UNIVERSE FETCHER
   Keeps the S&P 500 and S&P MidCap 400 constituent lists current without manual
   edits. Hardcoded ETF_HOLDINGS / MID_CAP_HOLDINGS are the floor (always works
   offline, always valid). Wikipedia is an *overlay* that replaces them in-memory
   when a fresh fetch succeeds.

   Flow:
     1. Boot uses hardcoded immediately — user sees the app instantly.
     2. advisorBoot fires refreshUniversesFromWikipedia() non-blocking.
     3. If cache is fresh (<48h) → restore from cache, no network.
     4. Else → fetch both lists in parallel, parse, validate, cache, apply.
     5. On failure → keep whatever's in memory (hardcoded or stale cache).

   The bundled data is the SAFETY NET. If Wikipedia breaks, the app still works.
   ════════════════════════════════════════════════════════════════════════════ */

const UNIVERSE_CACHE_KEY = 'universe_wiki_cache_v2';  // v2 = includes ndx
const UNIVERSE_CACHE_TTL = 48 * 60 * 60 * 1000;    // 48 hours
const UNIVERSE_FETCH_TIMEOUT = 12000;              // 12 seconds per page
let lastUniverseUpdate = null;                     // timestamp; null = still on hardcoded
let universeUpdateSource = 'hardcoded';            // 'hardcoded' | 'cache' | 'wikipedia'

// NDX-only tickers — ADRs/foreign listings that aren't in SP500 or SP400 but
// are in NASDAQ-100. Without these, clicking into these stocks wouldn't show
// a sub-industry pill. These enter SYM_SUBIND BEFORE the BASE snapshot.
Object.assign(SYM_SUBIND, {
  ASML:'semi', AZN:'pharm', ARM:'semi', MELI:'bret',
  PDD:'bret', GFS:'semi', MSTR:'itsvc',
});

// Snapshot of the hardcoded SYM_SUBIND taken at boot — acts as the floor for
// tickers Wikipedia might not classify (new sub-industries we don't recognize).
const BASE_SYM_SUBIND = { ...SYM_SUBIND };

// GICS sector → ETF bucket. Stable (11 sectors, changes ~once per decade).
// Includes ICB synonyms for the three sectors Nasdaq-100 names differently:
// Technology / Telecommunications / Basic Materials. All other ICB industry
// names (Consumer Discretionary, Health Care, etc.) happen to match GICS.
const GICS_TO_ETF = {
  // GICS names (S&P 500 and S&P 400 pages)
  'Information Technology':'XLK', 'Financials':'XLF', 'Health Care':'XLV',
  'Consumer Discretionary':'XLY', 'Consumer Staples':'XLP', 'Industrials':'XLI',
  'Energy':'XLE', 'Materials':'XLB', 'Utilities':'XLU', 'Real Estate':'XLRE',
  'Communication Services':'XLC',
  // ICB names (Nasdaq-100 page only uses the three divergent ones)
  'Technology':'XLK', 'Telecommunications':'XLC', 'Basic Materials':'XLB',
};

// GICS sub-industry → our shortcode (matches SI_LABELS keys).
// If Wikipedia returns a sub-industry not in this map, the ticker falls back to
// BASE_SYM_SUBIND (our hardcoded floor) — meaning we just won't show the pill.
const GICS_TO_SI = {
  'Semiconductors':'semi','Semiconductor Materials & Equipment':'semi',
  'Technology Hardware, Storage & Peripherals':'thw',
  'Application Software':'sw','Systems Software':'sw',
  'IT Consulting & Other Services':'itsvc','Data Processing & Outsourced Services':'itsvc',
  'Communications Equipment':'commeq',
  'Electronic Equipment & Instruments':'elec','Electronic Components':'elec','Electronic Manufacturing Services':'elec',
  'Interactive Media & Services':'imds',
  'Movies & Entertainment':'ent',
  'Publishing':'media','Broadcasting':'media','Advertising':'media','Cable & Satellite':'media',
  'Integrated Telecommunication Services':'dtel','Alternative Carriers':'dtel',
  'Wireless Telecommunication Services':'wtel',
  'Broadline Retail':'bret','Computer & Electronics Retail':'bret',
  'Specialty Stores':'sret','Other Specialty Retail':'sret','Home Improvement Retail':'sret',
  'Homefurnishing Retail':'sret','Apparel Retail':'sret','Automotive Retail':'sret',
  'Food Retail':'csdr','Consumer Staples Merchandise Retail':'csdr','Food Distributors':'csdr',
  'Restaurants':'hrl','Hotels, Resorts & Cruise Lines':'hrl','Casinos & Gaming':'hrl','Leisure Facilities':'hrl',
  'Automotive Parts & Equipment':'autop','Tires & Rubber':'autop','Automobile Manufacturers':'auto',
  'Apparel, Accessories & Luxury Goods':'appar','Footwear':'appar',
  'Leisure Products':'leis','Motorcycle Manufacturers':'leis',
  'Homebuilding':'hhd','Home Furnishings':'hhd','Household Appliances':'hhd',
  'Household Products':'hhp',
  'Personal Care Products':'pcp',
  'Packaged Foods & Meats':'food','Agricultural Products & Services':'food',
  'Soft Drinks & Non-alcoholic Beverages':'bev','Brewers':'bev','Distillers & Vintners':'bev',
  'Tobacco':'tob',
  'Distributors':'dist',
  'Diversified Banks':'bank','Regional Banks':'bank',
  'Consumer Finance':'cfin',
  'Asset Management & Custody Banks':'capm','Investment Banking & Brokerage':'capm',
  'Financial Exchanges & Data':'capm','Multi-Sector Holdings':'capm',
  'Property & Casualty Insurance':'ins','Life & Health Insurance':'ins','Multi-line Insurance':'ins',
  'Reinsurance':'ins','Insurance Brokers':'ins',
  'Transaction & Payment Processing Services':'fin','Diversified Financial Services':'fin',
  'Commercial & Residential Mortgage Finance':'fin',
  'Pharmaceuticals':'pharm',
  'Biotechnology':'biot',
  'Health Care Services':'hcps','Health Care Facilities':'hcps','Managed Health Care':'hcps',
  'Health Care Technology':'hcps','Health Care Distributors':'hcps',
  'Health Care Equipment':'hces','Health Care Supplies':'hces',
  'Life Sciences Tools & Services':'lsts',
  'Oil & Gas Exploration & Production':'oil','Oil & Gas Refining & Marketing':'oil',
  'Oil & Gas Storage & Transportation':'oil','Integrated Oil & Gas':'oil',
  'Oil & Gas Equipment & Services':'oilsvc','Oil & Gas Drilling':'oilsvc',
  'Aerospace & Defense':'aero',
  'Agricultural & Farm Machinery':'mach','Industrial Machinery & Supplies & Components':'mach',
  'Construction Machinery & Heavy Transportation Equipment':'cmach',
  'Industrial Conglomerates':'icong',
  'Environmental & Facilities Services':'css','Office Services & Supplies':'css',
  'Security & Alarm Services':'css','Specialized Consumer Services':'css','Diversified Support Services':'css',
  'Research & Consulting Services':'prof','Human Resource & Employment Services':'prof','Education Services':'prof',
  'Cargo Ground Transportation':'gtrans','Passenger Ground Transportation':'gtrans',
  'Marine Transportation':'gtrans','Rail Transportation':'gtrans','Trucking':'gtrans',
  'Air Freight & Logistics':'airf',
  'Passenger Airlines':'airline',
  'Building Products':'bldg',
  'Construction & Engineering':'ceng',
  'Electrical Components & Equipment':'ee','Heavy Electrical Equipment':'ee',
  'Trading Companies & Distributors':'td','Technology Distributors':'td',
  'Diversified Chemicals':'chem','Specialty Chemicals':'chem','Commodity Chemicals':'chem',
  'Fertilizers & Agricultural Chemicals':'chem','Industrial Gases':'chem',
  'Steel':'metal','Aluminum':'metal','Silver':'metal','Gold':'metal','Copper':'metal',
  'Diversified Metals & Mining':'metal','Precious Metals & Minerals':'metal',
  'Construction Materials':'cmat',
  'Metal, Glass & Plastic Containers':'cp','Paper & Plastic Packaging Products & Materials':'cp',
  'Forest Products':'paper','Paper Products':'paper',
  'Other Specialized REITs':'spreit','Self-Storage REITs':'spreit','Timber REITs':'spreit',
  'Hotel & Resort REITs':'spreit','Data Center REITs':'spreit','Telecom Tower REITs':'spreit',
  'Diversified REITs':'dreit','Retail REITs':'dreit','Office REITs':'dreit',
  'Industrial REITs':'dreit','Health Care REITs':'dreit','Mortgage REITs':'dreit',
  'Single-Family Residential REITs':'rreit','Multi-Family Residential REITs':'rreit',
  'Real Estate Services':'remd','Real Estate Operating Companies':'remd',
  'Electric Utilities':'elutil',
  'Multi-Utilities':'multutil',
  'Gas Utilities':'gasutil',
  'Water Utilities':'watutil',
  'Renewable Electricity':'ipwr','Independent Power Producers':'ipwr',
  'Independent Power Producers & Energy Traders':'ipwr',
};

/**
 * Fetch and parse one Wikipedia constituent list. Uses the MediaWiki parse API
 * to get rendered HTML (more stable than raw wikitext), then DOMParser to walk
 * the first matching wikitable. Column indices are looked up by header text,
 * NOT by position — so the parser survives column reorders.
 */
async function fetchWikipediaUniverse(pageName) {
  const url = `https://en.wikipedia.org/w/api.php?action=parse&page=${pageName}&prop=text&format=json&formatversion=2&origin=*`;
  const controller = new AbortController();
  const timeoutId = setTimeout(() => controller.abort(), UNIVERSE_FETCH_TIMEOUT);

  let html;
  try {
    const resp = await fetch(url, { signal: controller.signal });
    if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
    const json = await resp.json();
    html = json?.parse?.text;
    if (!html) throw new Error('no .parse.text in response');
  } finally {
    clearTimeout(timeoutId);
  }

  // Parse HTML and locate the constituent table by its header signature.
  const doc = new DOMParser().parseFromString(html, 'text/html');
  const tables = doc.querySelectorAll('table.wikitable');
  const rows = [];
  for (const table of tables) {
    const headerRow = [...table.querySelectorAll('tr')].find(tr =>
      tr.querySelectorAll('th').length >= 4
    );
    if (!headerRow) continue;
    const headers = [...headerRow.querySelectorAll('th')].map(th => th.textContent.trim());
    // Header regex is UNION of S&P and Nasdaq conventions:
    //   - S&P pages use: Symbol, Security, GICS Sector, GICS Sub-Industry
    //   - Nasdaq-100 page uses: Ticker, Company, ICB Industry, ICB Subsector
    // Matching on either keeps the parser useful for both — no branching by URL.
    const iSym     = headers.findIndex(h => /^(?:Symbol|Ticker)$/i.test(h));
    const iSec     = headers.findIndex(h => /^(?:Security|Company)/i.test(h));
    const iSector  = headers.findIndex(h => /(?:GICS|ICB).*(?:Sector|Industry)/i.test(h));
    const iSubInd  = headers.findIndex(h => /(?:GICS|ICB).*(?:Sub.?Industry|Subsector)/i.test(h));
    if (iSym < 0 || iSector < 0) continue;   // not the constituent table

    for (const tr of table.querySelectorAll('tr')) {
      const tds = tr.querySelectorAll('td');
      if (tds.length < 4) continue;
      const sym = (tds[iSym]?.textContent || '').trim();
      const name = iSec >= 0 ? (tds[iSec]?.textContent || '').trim() : sym;
      const sector = (tds[iSector]?.textContent || '').trim();
      const subind = iSubInd >= 0 ? (tds[iSubInd]?.textContent || '').trim() : '';
      // Defensive: ticker must look like a real ticker (1-7 chars, A-Z . -)
      if (!/^[A-Z][A-Z.\-]{0,6}$/.test(sym)) continue;
      if (!sector) continue;
      rows.push({ sym, name, sector, subind });
    }
    if (rows.length) break;  // found the right table, stop scanning
  }
  return rows;
}

/**
 * Convert flat Wikipedia rows into the app's internal structure:
 *   - holdings: grouped by ETF bucket (XLK/XLF/…), same shape as ETF_HOLDINGS
 *   - symSubind: ticker → sub-industry code (only for known mappings)
 */
function buildUniverseFromWikiRows(rows) {
  const holdings = {};
  const symSubind = {};
  let accepted = 0;
  for (const r of rows) {
    const etf = GICS_TO_ETF[r.sector];
    if (!etf) continue;  // unknown sector → drop (shouldn't happen with 11 stable sectors)
    holdings[etf] = holdings[etf] || [];
    holdings[etf].push({ s: r.sym, n: r.name, w: 0.3 });
    const si = GICS_TO_SI[r.subind];
    if (si) symSubind[r.sym] = si;
    accepted++;
  }
  return { holdings, symSubind, count: accepted };
}

/** Sanity check — reject the payload if counts look wrong. */
function isValidUniverse(u, min, max) {
  if (!u || !u.count || u.count < min || u.count > max) return false;
  if (Object.keys(u.holdings).length < 8) return false;  // must span most sectors
  return true;
}

/** Apply a Wikipedia-sourced payload to the live in-memory data. */
function applyUniversePayload(payload) {
  UNIVERSES.large.holdings = payload.sp500.holdings;
  UNIVERSES.mid.holdings   = payload.sp400.holdings;
  // NDX is optional — if the parser fails for Nasdaq-100 specifically, we
  // keep the hardcoded floor rather than blocking the whole refresh.
  if (payload.ndx) UNIVERSES.ndx.holdings = payload.ndx.holdings;
  // SYM_SUBIND: start from the hardcoded floor, overlay wiki data on top.
  Object.keys(SYM_SUBIND).forEach(k => delete SYM_SUBIND[k]);
  Object.assign(SYM_SUBIND, BASE_SYM_SUBIND,
    payload.sp500.symSubind, payload.sp400.symSubind,
    payload.ndx?.symSubind || {});
  rebuildSymMaps();
  lastUniverseUpdate = payload.fetchedAt;
  universeUpdateSource = payload.source || 'wikipedia';
  updateUniverseIndicator();
}

/**
 * Entry point. Non-blocking: resolves quickly from cache, or fires a background
 * fetch if cache is stale. Never throws — all failures fall back to whatever
 * data is currently in memory.
 */
async function refreshUniversesFromWikipedia() {
  // 1. Try valid cache first. Cache is "valid" only if it's fresh AND complete
  // (all three universes present). An incomplete cache — e.g., saved when the
  // NDX parser was broken and ndx was missing — is treated as stale so a fresh
  // fetch gets a chance to fill it in. Self-heals without needing a cache-key
  // bump whenever we add a universe.
  try {
    const cached = JSON.parse(localStorage.getItem(UNIVERSE_CACHE_KEY));
    const fresh = cached && Date.now() - cached.fetchedAt < UNIVERSE_CACHE_TTL;
    const complete = cached && cached.sp500 && cached.sp400 && cached.ndx;
    if (fresh && complete) {
      applyUniversePayload({ ...cached, source: 'cache' });
      return { source: 'cache' };
    }
  } catch(e){}

  // 2. Cache expired or missing → fetch fresh. Display stale cache while we wait.
  try {
    const staleCache = JSON.parse(localStorage.getItem(UNIVERSE_CACHE_KEY));
    if (staleCache) applyUniversePayload({ ...staleCache, source: 'cache' });
  } catch(e){}

  try {
    const [sp500rows, sp400rows, ndxrows] = await Promise.all([
      fetchWikipediaUniverse('List_of_S%26P_500_companies'),
      fetchWikipediaUniverse('List_of_S%26P_400_companies'),
      fetchWikipediaUniverse('Nasdaq-100').catch(() => []),
    ]);
    const sp500 = buildUniverseFromWikiRows(sp500rows);
    const sp400 = buildUniverseFromWikiRows(sp400rows);
    const ndx   = buildUniverseFromWikiRows(ndxrows);

    if (!isValidUniverse(sp500, 450, 520)) {
      throw new Error(`SP500 validation failed (got ${sp500.count})`);
    }
    if (!isValidUniverse(sp400, 380, 410)) {
      throw new Error(`SP400 validation failed (got ${sp400.count})`);
    }

    // Remove any sp400 tickers that are also in sp500 (promoted stocks can
    // appear in both lists briefly around index reshuffles).
    const inSp500 = new Set();
    Object.values(sp500.holdings).forEach(arr => arr.forEach(h => inSp500.add(h.s)));
    for (const etf in sp400.holdings) {
      sp400.holdings[etf] = sp400.holdings[etf].filter(h => !inSp500.has(h.s));
    }
    sp400.count = Object.values(sp400.holdings).reduce((a, arr) => a + arr.length, 0);

    // NDX: validate if parsed. If it looks reasonable (90-110 names, spans
    // at least 4 GICS sectors since NDX is tech-heavy) include it, otherwise
    // leave out and log a warning — hardcoded floor stays in force for NDX only.
    const ndxValid = ndx.count >= 90 && ndx.count <= 110 && Object.keys(ndx.holdings).length >= 4;
    if (!ndxValid) {
      console.warn(`NDX validation failed (got ${ndx.count}), keeping hardcoded floor for NDX`);
    }

    const payload = { sp500, sp400, fetchedAt: Date.now() };
    if (ndxValid) payload.ndx = ndx;
    try { localStorage.setItem(UNIVERSE_CACHE_KEY, JSON.stringify(payload)); } catch(e){}
    applyUniversePayload({ ...payload, source: 'wikipedia' });
    console.info(`universe refreshed: ${sp500.count} large + ${sp400.count} mid${ndxValid ? ` + ${ndx.count} ndx` : ''}`);
    return { source: 'wikipedia', sp500: sp500.count, sp400: sp400.count, ndx: ndxValid ? ndx.count : null };

  } catch(e) {
    console.warn('universe Wikipedia fetch failed, keeping current data:', e.message);
    return { source: universeUpdateSource, error: e.message };
  }
}

/** Refresh the small "updated X ago · source" label next to the universe chips. */
function updateUniverseIndicator() {
  const el = document.getElementById('universe-indicator');
  if (!el) return;
  if (!lastUniverseUpdate) {
    el.textContent = 'מקומי';
    el.title = 'רשימה מובנית באפליקציה';
    el.className = 'univ-ind univ-ind-local';
    return;
  }
  const ageMs = Date.now() - lastUniverseUpdate;
  const hours = Math.floor(ageMs / 3600000);
  const days = Math.floor(hours / 24);
  const ago = days >= 1 ? `לפני ${days} ימים`
            : hours >= 1 ? `לפני ${hours} שעות`
            : 'לפני פחות משעה';
  const srcLabel = universeUpdateSource === 'wikipedia' ? 'Wikipedia'
                 : universeUpdateSource === 'cache'     ? 'Wikipedia (cache)'
                 : 'מקומי';
  el.textContent = `${srcLabel} · ${ago}`;
  el.title = `מקור האחזקות: ${srcLabel}. עדכון הבא ברקע כעבור 48 שעות.`;
  el.className = 'univ-ind univ-ind-wiki';
}
let scanData = null;
let displayState = {
  minScore: 50,
  sector: '',
  view: 'all',
  sortKey: 'score',
  sortDesc: true,
};
let watchlist = [];
try { watchlist = JSON.parse(localStorage.getItem(WL_KEY)) || []; } catch(e){}

// ═══ INIT ═══
function advisorBoot() {
  if (!PROXY) {
    $('screen-welcome').style.display = 'none';
    $('adv-err-msg').textContent = 'לא נמצא proxy. חזור ל-index.html והזן את כתובת ה-Cloudflare Worker.';
    $('adv-screen-error').style.display = 'block';
    return;
  }
  // Kick off a non-blocking Wikipedia refresh. If cache is fresh (<48h) this
  // returns almost instantly; otherwise it fires an async fetch and updates
  // holdings in memory when done. User's current view uses whatever data is
  // available right now — next scan picks up the refresh.
  refreshUniversesFromWikipedia().catch(() => {});
  // Validate saved methodology against the live METHODOLOGIES dictionary
  // (we couldn't do this at the `let currentMethodology = ...` site because of TDZ)
  if (!METHODOLOGIES[currentMethodology]) currentMethodology = 'momentum';
  // Build custom dropdowns (universe + sector + methodology) and reflect current state
  populateUniverseDropdown();
  populateSectorDropdown();
  populateMethodologyDropdown();
  syncUniverseUI();
  syncMethodologyUI();
  // Kick off cloud sync in the background — if user has a session it pulls
  // their cloud watchlist and merges with local. Never blocks UI render.
  initCloudSync();
  // Try load from cache for this (universe, methodology)
  scanData = loadCachedScan();
  if (scanData) {
    showResults();
    renderWatchlist();
    // Auto-refresh watchlist signals in the background so every app load
    // gives the user fresh MA40/price/y1 data without a manual click.
    scheduleAutoRefresh(500);
    return;
  }
  renderWatchlist();
  startMarketClock();
} // advisorBoot end

// Reflect currentUniverse in the universe chip group and the KPI subtitle
/**
 * Build the universe dropdown options from the UNIVERSES dict. Called once on
 * boot. Adding a new universe anywhere (e.g., Russell 2000 later) just needs an
 * entry in UNIVERSES — this function auto-discovers it.
 */
function populateUniverseDropdown() {
  const panel = $('cdd-universe-panel');
  if (!panel) return;
  panel.innerHTML = '';
  Object.entries(UNIVERSES).forEach(([key, u]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cdd-option';
    if (key === currentUniverse) btn.classList.add('active');
    btn.dataset.value = key;
    btn.innerHTML = `<div class="cdd-option-title">${u.label}</div>`;
    btn.onclick = (e) => { e.stopPropagation(); setUniverse(key); };
    panel.appendChild(btn);
  });
}

function syncUniverseUI() {
  // Dropdown: update both the trigger label and the active option
  const cur = $('cdd-universe-current');
  if (cur) cur.textContent = UNIVERSES[currentUniverse].labelShort;
  document.querySelectorAll('#cdd-universe-panel .cdd-option').forEach(b =>
    b.classList.toggle('active', b.dataset.value === currentUniverse)
  );
  // KPI subtitle
  const lbl = $('kpi-universe-label');
  if (lbl) lbl.textContent = UNIVERSES[currentUniverse].labelShort;
}

function showScreen(id) {
  ['screen-welcome','adv-screen-loading','adv-screen-error','tbl-container']
    .forEach(x => { const el = $(x); if (el) el.style.display = 'none'; });
  const t = $(id);
  if (t) t.style.display = 'block';
}

// ═══ CLOCK (ET / TLV) — same pattern as dashboard ═══
function startMarketClock() {
  const tick = () => {
    const now = new Date();
    const ny = new Intl.DateTimeFormat('en-US', {timeZone:'America/New_York', hour:'2-digit', minute:'2-digit', hour12:false}).format(now);
    const tlv = new Intl.DateTimeFormat('en-GB', {timeZone:'Asia/Jerusalem', hour:'2-digit', minute:'2-digit', hour12:false}).format(now);
    const elNy = $('term-clock-ny'); if (elNy) elNy.textContent = ny;
    const elTlv = $('term-clock-tlv'); if (elTlv) elTlv.textContent = tlv;
  };
  tick(); setInterval(tick, 30000);
}

// ═══ MOBILE MENU ═══
function toggleMobileMenu() {
  $('mob-overlay').classList.toggle('open');
  $('mobile-menu').classList.toggle('open');
}
function closeMobileMenu() {
  $('mob-overlay').classList.remove('open');
  $('mobile-menu').classList.remove('open');
}

// ═══ DATA FETCHING ═══

async function fetchChartWeekly(sym) {
  const cleanSym = sym.replace('/', '-').replace('.', '-');
  const cb = Math.floor(Date.now() / 600000);
  const yahooUrl = `https://query1.finance.yahoo.com/v8/finance/chart/${cleanSym}?range=1y&interval=1wk&cb=${cb}`;
  const proxyUrl = `${PROXY}/?url=${encodeURIComponent(yahooUrl)}`;
  try {
    const r = await fetch(proxyUrl);
    if (!r.ok) return null;
    const d = await r.json();
    const result = d.chart?.result?.[0];
    if (!result) return null;
    const closes = (result.indicators?.quote?.[0]?.close || []).filter(x => x != null);
    const timestamps = result.timestamp || [];
    const meta = result.meta || {};
    if (closes.length < 20) return null;
    return { sym, closes, timestamps, meta };
  } catch (e) {
    return null;
  }
}

async function fetchUniverseInChunks(symbols, onProgress) {
  const chunkSize = 10;
  const results = {};
  let done = 0;
  for (let i = 0; i < symbols.length; i += chunkSize) {
    const chunk = symbols.slice(i, i + chunkSize);
    await Promise.all(chunk.map(async sym => {
      const data = await fetchChartWeekly(sym);
      if (data) results[sym] = data;
      done++;
      onProgress(done, symbols.length);
    }));
  }
  return results;
}

// ═══ SCORING ═══

function computeMetrics(chartData, spyCloses) {
  const { closes } = chartData;
  const n = closes.length;
  if (n < 20) return null;

  const price = closes[n - 1];
  const r = (weeks) => {
    if (n - 1 - weeks < 0) return null;
    const old = closes[n - 1 - weeks];
    if (!old) return null;
    return (price - old) / old;
  };
  const ret12m = r(52);
  const ret12m_1m = (() => {
    if (n < 53) return null;
    const recent = closes[n - 5];
    const year = closes[n - 52];
    if (!recent || !year) return null;
    return (recent - year) / year;
  })();
  const ret6m = r(26);
  const ret3m = r(13);
  const ret1m = r(4);

  const smaN = (N) => {
    if (n < N) return null;
    let s = 0; for (let i = n - N; i < n; i++) s += closes[i];
    return s / N;
  };
  const sma10 = smaN(10);   // ≈ 50-day
  const sma40 = smaN(40);   // ≈ 200-day

  let sma10Slope = null;
  if (n >= 15) {
    const sma10Now = smaN(10);
    let s = 0; for (let i = n - 15; i < n - 5; i++) s += closes[i];
    const sma10Prev = s / 10;
    sma10Slope = (sma10Now - sma10Prev) / sma10Prev;
  }

  let stickiness = 0;
  const windowStart = Math.max(10, n - 20);
  const windowEnd = n;
  for (let i = windowStart; i < windowEnd; i++) {
    let s = 0; for (let j = i - 10; j < i; j++) s += closes[j];
    const smaAtI = s / 10;
    if (closes[i] > smaAtI) stickiness++;
  }
  stickiness = stickiness / (windowEnd - windowStart);

  const hi52 = Math.max(...closes);
  const lo52 = Math.min(...closes);
  const fromHi = (price - hi52) / hi52;
  const rangePos = (price - lo52) / (hi52 - lo52 || 1);

  const spy12m_1m = (() => {
    const sn = spyCloses.length;
    if (sn < 53) return null;
    return (spyCloses[sn - 5] - spyCloses[sn - 52]) / spyCloses[sn - 52];
  })();
  const spy3m = (() => {
    const sn = spyCloses.length;
    if (sn < 14) return null;
    return (spyCloses[sn - 1] - spyCloses[sn - 13]) / spyCloses[sn - 13];
  })();
  const rs12m = (ret12m_1m != null && spy12m_1m != null) ? ret12m_1m - spy12m_1m : null;
  const rs3m = (ret3m != null && spy3m != null) ? ret3m - spy3m : null;

  return {
    price, ret12m, ret12m_1m, ret6m, ret3m, ret1m,
    sma10, sma40, sma10Slope, stickiness,
    fromHi, rangePos, rs12m, rs3m, closes,
  };
}

function percentileRank(arr, val) {
  if (val == null || isNaN(val)) return 50;
  const valid = arr.filter(x => x != null && !isNaN(x));
  if (valid.length === 0) return 50;
  let below = 0;
  for (const x of valid) if (x < val) below++;
  return (below / valid.length) * 100;
}

/* ════════════════════════════════════════════════════════════════════════════
   VOLATILITY HELPERS
   Used by Low-Vol Quality and VCP methodologies. Based on weekly returns
   computed from closes (already fetched for the scan — no extra network).
   ════════════════════════════════════════════════════════════════════════════ */
function _stdDev(values) {
  const valid = values.filter(v => v != null && !isNaN(v));
  if (valid.length < 2) return 0;
  const mean = valid.reduce((a, b) => a + b, 0) / valid.length;
  const sqDiffs = valid.map(v => (v - mean) ** 2);
  return Math.sqrt(sqDiffs.reduce((a, b) => a + b, 0) / valid.length);
}
function _weeklyReturns(closes) {
  const rets = [];
  for (let i = 1; i < closes.length; i++) {
    if (closes[i - 1]) rets.push((closes[i] - closes[i - 1]) / closes[i - 1]);
  }
  return rets;
}
/** Annualized-ish weekly-return std over the last `window` weeks. */
function computeVolatility(closes, window = 26) {
  if (!closes || closes.length < window + 1) return null;
  return _stdDev(_weeklyReturns(closes.slice(-window - 1)));
}
/** VCP — Minervini pattern. Ratio of recent 6w std to prior 6w std.
 *  Ratio < 1 = volatility contracting (bullish setup). */
function computeVolContraction(closes) {
  if (!closes || closes.length < 13) return 1;
  const recentRets = _weeklyReturns(closes.slice(-7));     // 6 returns
  const priorRets  = _weeklyReturns(closes.slice(-13, -6)); // 6 returns
  const rec = _stdDev(recentRets);
  const pri = _stdDev(priorRets);
  if (pri === 0) return 1;
  return rec / pri;
}

/* ════════════════════════════════════════════════════════════════════════════
   METHODOLOGIES — 6 scoring models. Each returns { score, factors } in a
   unified shape so the table/detail panel/modal can be methodology-agnostic.
   All models share the same computeMetrics() output; only the weighting and
   composition differs. Switching methodologies never triggers a re-scan.
   ════════════════════════════════════════════════════════════════════════════ */
function scoreMomentum(m, pct) {
  const MOM = pct.ret12m_1m(m.ret12m_1m) * 0.45 + pct.ret6m(m.ret6m) * 0.30 + pct.ret3m(m.ret3m) * 0.25;
  const RS  = pct.rs12m(m.rs12m) * 0.60 + pct.rs3m(m.rs3m) * 0.40;
  let TRD = 0;
  if (m.price > m.sma10) TRD += 20;
  if (m.price > m.sma40) TRD += 20;
  if (m.sma10 > m.sma40) TRD += 20;
  TRD += pct.sma10Slope(m.sma10Slope) * 0.20;
  TRD += (m.stickiness * 20);
  TRD = Math.min(100, TRD);
  const POS = pct.fromHi(m.fromHi) * 0.6 + pct.rangePos(m.rangePos) * 0.4;
  const score = MOM * 0.35 + RS * 0.30 + TRD * 0.25 + POS * 0.10;
  return { score, factors: { MOM, RS, TRD, POS } };
}

function scoreReversion(m, pct) {
  // LTU: long-term uptrend (pre-pullback) — we still want winners
  const LTU = pct.ret12m_1m(m.ret12m_1m);
  // STW: short-term weakness — negative ret1m ranks highest (invert)
  const STW = 100 - pct.ret1m(m.ret1m);
  // DEV: how far price is below sma10 — more oversold = better
  const DEV = pct.dev10(m.dev10);
  const score = LTU * 0.40 + STW * 0.35 + DEV * 0.25;
  return { score, factors: { LTU, STW, DEV } };
}

function scoreBreakout(m, pct) {
  // PRX: proximity to 52w high (fromHi closer to 0 = better; high pct = good)
  const PRX = pct.fromHi(m.fromHi);
  // IGN: ignition — recent month positive + crossed SMA10
  let IGN = 0;
  if (m.ret1m != null && m.ret1m > 0) IGN += 40;
  if (m.price > m.sma10) IGN += 30;
  IGN += pct.ret1m(m.ret1m) * 0.3;
  IGN = Math.min(100, IGN);
  // TRG: trend support — golden cross + sma slope
  let TRG = 0;
  if (m.sma10 > m.sma40) TRG += 40;
  TRG += pct.sma10Slope(m.sma10Slope) * 0.6;
  TRG = Math.min(100, TRG);
  const score = PRX * 0.45 + IGN * 0.35 + TRG * 0.20;
  return { score, factors: { PRX, IGN, TRG } };
}

function scoreQuality(m, pct) {
  // STB: low volatility is good — invert
  const STB = 100 - pct.vol(m.vol);
  // CMP: steady compounder — positive but moderate ret12m
  const CMP = pct.ret12m(m.ret12m);
  // STK: stickiness (fraction of weeks above SMA10)
  const STK = (m.stickiness || 0) * 100;
  const score = STB * 0.40 + CMP * 0.35 + STK * 0.25;
  return { score, factors: { STB, CMP, STK } };
}

function scoreVCP(m, pct) {
  // PRX: close to 52w high
  const PRX = pct.fromHi(m.fromHi);
  // CTR: volatility contracting — lower ratio = better (invert percentile)
  const CTR = 100 - pct.volContraction(m.volContraction);
  // TRN: proper Stage-2 uptrend (Minervini template)
  let TRN = 0;
  if (m.price > m.sma10) TRN += 25;
  if (m.sma10 > m.sma40) TRN += 25;
  if (m.sma10Slope != null && m.sma10Slope > 0) TRN += 20;
  TRN += (m.stickiness || 0) * 30;
  TRN = Math.min(100, TRN);
  const score = PRX * 0.45 + CTR * 0.30 + TRN * 0.25;
  return { score, factors: { PRX, CTR, TRN } };
}

function scoreDualMomentum(m, pct) {
  // Hard gates (Antonacci): absolute momentum + relative momentum
  const passesAbs = m.ret12m_1m != null && m.ret12m_1m > 0;
  const passesRel = m.rs12m != null && m.rs12m > 0;
  if (!passesAbs || !passesRel) {
    return {
      score: 0,
      factors: { ABS: passesAbs ? 100 : 0, REL: passesRel ? 100 : 0, INT: 0 }
    };
  }
  const ABS = pct.ret12m_1m(m.ret12m_1m);
  const REL = pct.rs12m(m.rs12m);
  const INT = pct.sma10Slope(m.sma10Slope);
  const score = ABS * 0.40 + REL * 0.40 + INT * 0.20;
  return { score, factors: { ABS, REL, INT } };
}

/* ─────────────────────────────────────────────────────────────────────
   WEINSTEIN STAGE ANALYSIS — "Secrets for Profiting in Bull and Bear
   Markets" (1988). Core rule: buy ONLY Stage 2 (markup). A stock is in
   Stage 2 when:
     1. Price > 30-week MA (we use sma40 — weekly data ≈ 40 weeks ≈ 200d)
     2. The MA itself is RISING (positive slope)
     3. Price > short-term MA > long-term MA (sma10 > sma40)
   Anything else is Stage 1 (basing), Stage 3 (topping), or Stage 4
   (decline) — Weinstein's disqualification, so score = 0.
   After the gate, we rank by MA slope, relative strength, and stickiness.
   ───────────────────────────────────────────────────────────────────── */
function scoreWeinstein(m, pct) {
  const inStage2 = m.sma40 != null && m.price > m.sma40 &&
                   m.sma10 != null && m.sma10 > m.sma40 &&
                   m.sma10Slope != null && m.sma10Slope > 0;
  if (!inStage2) {
    return { score: 0, factors: { STG: 0, SLP: 0, RS: 0, STK: 0 } };
  }
  const STG = 100;                                 // gate passed
  const SLP = pct.sma10Slope(m.sma10Slope);        // steeper MA ascent = better
  const RS  = pct.rs12m(m.rs12m);                  // beats SPY by more = better
  const STK = Math.min(100, (m.stickiness || 0) * 100); // % time above MA
  const score = STG * 0.20 + SLP * 0.35 + RS * 0.30 + STK * 0.15;
  return { score, factors: { STG, SLP, RS, STK } };
}

/* ─────────────────────────────────────────────────────────────────────
   DARVAS BOX THEORY — "How I Made $2,000,000 in the Stock Market" (1960).
   Nicolas Darvas traded only near 52-week / all-time highs, on stocks
   that had climbed through multiple price "boxes" (consolidation ranges).
   Without tick-level data we approximate:
     - ATH proximity (fromHi)
     - Multi-month climb (ret12m percentile = "boxes traversed")
     - Current breakout ignition (1m return + above rising SMA10)
     - Position in 52w range (rangePos — higher = better)
   Distinct from the Breakout methodology by heavier weight on long-term
   climb (Darvas held for months/years) and stronger ATH bias.
   ───────────────────────────────────────────────────────────────────── */
function scoreDarvas(m, pct) {
  const ATH = pct.fromHi(m.fromHi);
  const CLM = pct.ret12m(m.ret12m);
  let BRK = 0;
  if (m.ret1m != null && m.ret1m > 0) BRK += 40;
  if (m.sma10 != null && m.price > m.sma10) BRK += 30;
  if (m.sma10Slope != null && m.sma10Slope > 0) BRK += 30;
  BRK = Math.min(100, BRK);
  const POS = Math.min(100, (m.rangePos || 0) * 100);
  const score = ATH * 0.35 + CLM * 0.30 + BRK * 0.20 + POS * 0.15;
  return { score, factors: { ATH, CLM, BRK, POS } };
}

const METHODOLOGIES = {
  momentum: {
    label:'Momentum', labelHe:'מומנטום',
    subtitle:'Ride the trend',
    desc:'factor investing קלאסי — מומנטום + חוזק יחסי',
    theory:'מבוסס על מחקר Jegadeesh & Titman (1993) ו-Asness et al. (2013). מניות שעלו חזק ממשיכות לעלות בטווח 3-12 חודשים.',
    bestWhen:'שווקים טרנדיים · bull markets',
    factors:[
      {k:'MOM', label:'מומנטום',    weight:35, desc:'תשואות היסטוריות'},
      {k:'RS',  label:'חוזק יחסי',   weight:30, desc:'ביצועים מול SPY'},
      {k:'TRD', label:'איכות מגמה',  weight:25, desc:'SMA + יציבות'},
      {k:'POS', label:'מיקום',       weight:10, desc:'מרחק מ-52w high'},
    ],
    compute: scoreMomentum,
  },
  reversion: {
    label:'Mean Reversion', labelHe:'חזרה לממוצע',
    subtitle:'Buy the dip',
    desc:'winners בפולבק זמני — oversold bounces',
    theory:'mean reversion theory (de Bondt & Thaler 1985). מניות עם מומנטום ארוך טווח שקיבלו מכה קצרה נוטות לחזור לממוצע.',
    bestWhen:'שווקים עם פולבקים · תיקונים',
    factors:[
      {k:'LTU', label:'רקע חיובי',   weight:40, desc:'תשואת 12M-1M'},
      {k:'STW', label:'חולשה קצרה',  weight:35, desc:'1M return שלילי'},
      {k:'DEV', label:'סטייה מ-MA',  weight:25, desc:'מרחק מתחת ל-SMA50'},
    ],
    compute: scoreReversion,
  },
  breakout: {
    label:'Breakout', labelHe:'פריצה',
    subtitle:'New highs igniting',
    desc:'מתקרבות או שוברות שיא 52ש עם מומנטום מתחדש',
    theory:'בהשראת William O\'Neil (IBD) ו-Mark Minervini. מזהה early-stage breakouts לשיאים חדשים — לפני ה-run הגדול.',
    bestWhen:'bull markets · רוטציות חזקות',
    factors:[
      {k:'PRX', label:'קירבה לשיא',  weight:45, desc:'fromHi נמוך'},
      {k:'IGN', label:'פריצה',       weight:35, desc:'1M חיובי + SMA10'},
      {k:'TRG', label:'מגמה תומכת',  weight:20, desc:'Golden Cross + slope'},
    ],
    compute: scoreBreakout,
  },
  quality: {
    label:'Low Vol Quality', labelHe:'יציבות',
    subtitle:'Steady compounders',
    desc:'תשואה יציבה ותנודתיות נמוכה — defensive',
    theory:'Low-Volatility Anomaly (Haugen 1991). מניות עם vol נמוך מניבות risk-adjusted returns טובים יותר. אבני יסוד של תיקים defensive.',
    bestWhen:'bear markets · high-VIX · risk-off',
    factors:[
      {k:'STB', label:'יציבות',       weight:40, desc:'volatility נמוכה'},
      {k:'CMP', label:'תשואה מצטברת', weight:35, desc:'ret12m יציב'},
      {k:'STK', label:'Stickiness',  weight:25, desc:'% זמן מעל SMA'},
    ],
    compute: scoreQuality,
  },
  vcp: {
    label:'VCP — Minervini', labelHe:'התכנסות',
    subtitle:'Volatility contraction',
    desc:'coiled springs — התכנסות לפני פריצה',
    theory:'Volatility Contraction Pattern של Mark Minervini. התכווצות של התנודתיות השבועית ליד שיא 52ש היא setup קלאסי לפני breakouts גדולים — CROX, NVDA, TSLA בזמנים שונים.',
    bestWhen:'bull markets · swing trading',
    factors:[
      {k:'PRX', label:'קירבה לשיא',     weight:45, desc:'fromHi > -10%'},
      {k:'CTR', label:'התכווצות vol',   weight:30, desc:'6w std < prior 6w'},
      {k:'TRN', label:'Stage 2 uptrend',weight:25, desc:'price > SMA10 > SMA40'},
    ],
    compute: scoreVCP,
  },
  dual: {
    label:'Dual Momentum', labelHe:'Antonacci',
    subtitle:'Strict filters',
    desc:'רק מניות עם מומנטום מוחלט ויחסי חיובי',
    theory:'Dual Momentum של Gary Antonacci (2014). שני שערים: (1) תשואה מוחלטת חיובית, (2) beat SPY. מניה שנכשלת באחד — ציון 0. המודל נמנע מ-bear markets בהגדרה.',
    bestWhen:'כל הזמן · risk-averse · drawdowns נמוכים',
    factors:[
      {k:'ABS', label:'מומנטום מוחלט',  weight:40, desc:'ret12m > 0'},
      {k:'REL', label:'מומנטום יחסי',   weight:40, desc:'beat SPY'},
      {k:'INT', label:'עוצמת מגמה',     weight:20, desc:'slope של SMA'},
    ],
    compute: scoreDualMomentum,
  },
  weinstein: {
    label:'Stage Analysis', labelHe:'Weinstein',
    subtitle:'Stage 2 only',
    desc:'רק מניות בשלב Markup — מעל MA30w עולה',
    theory:'Stage Analysis של Stan Weinstein מתוך "Secrets for Profiting in Bull and Bear Markets" (1988). מחלק מחירים ל-4 שלבים: Stage 1 Basing, Stage 2 Markup, Stage 3 Top, Stage 4 Decline. קונה אך ורק Stage 2 — מניה מעל ממוצע נע 30-שבועות שהוא עצמו עולה. בשאר השלבים המניה מוסרת כליל (ציון 0), גם אם נראית "טובה" לפי מדדים אחרים. זה המסנן האיכותי החשוב ביותר של הגישה.',
    bestWhen:'סלקטיביות מקסימלית · מניעת early entries',
    factors:[
      {k:'STG', label:'שער Stage 2',  weight:20, desc:'price > MA40, MA עולה'},
      {k:'SLP', label:'שיפוע מגמה',    weight:35, desc:'MA rising fast'},
      {k:'RS',  label:'חוזק יחסי',     weight:30, desc:'מול SPY'},
      {k:'STK', label:'יציבות מגמה',   weight:15, desc:'% זמן מעל MA'},
    ],
    compute: scoreWeinstein,
  },
  darvas: {
    label:'Box Theory', labelHe:'Darvas',
    subtitle:'Climb through boxes',
    desc:'ליד שיא, אחרי טיפוס דרך תיבות קונסולידציה',
    theory:'Box Theory של Nicolas Darvas מתוך "How I Made $2,000,000 in the Stock Market" (1960). דארווס זיהה "תיבות" — טווחי קונסולידציה של המחיר — ורכש רק כאשר המחיר שבר את גג התיבה עם volume. קנה כמעט בלעדית ליד שיא 52-שבועי. המודל מחקה זאת: קירבה לשיא + טיפוס רב-חודשי (תיבות שנחצו) + פריצה נוכחית.',
    bestWhen:'trending markets · momentum runners · bull phase',
    factors:[
      {k:'ATH', label:'קירבה לשיא',    weight:35, desc:'fromHi קרוב ל-0'},
      {k:'CLM', label:'טיפוס שנתי',     weight:30, desc:'ret12m percentile'},
      {k:'BRK', label:'פריצה',          weight:20, desc:'1m+ + מעל SMA10'},
      {k:'POS', label:'מיקום בטווח',    weight:15, desc:'ליד 52w high'},
    ],
    compute: scoreDarvas,
  },
};

function computeScores(stocksData, spyCloses, methodologyKey) {
  const methodology = METHODOLOGIES[methodologyKey] || METHODOLOGIES.momentum;

  const raw = {};
  for (const [sym, data] of Object.entries(stocksData)) {
    const m = computeMetrics(data, spyCloses);
    if (m) raw[sym] = m;
  }
  const symbols = Object.keys(raw);
  if (symbols.length === 0) return [];

  // Derive extended metrics used by some methodologies
  for (const sym of symbols) {
    const m = raw[sym];
    m.dev10 = m.sma10 ? (m.sma10 - m.price) / m.sma10 : 0;
    m.vol = computeVolatility(m.closes, 26);
    m.volContraction = computeVolContraction(m.closes);
  }

  // Pre-compute ranking arrays so percentile lookups are O(n) per factor per stock
  const fields = ['ret12m_1m','ret12m','ret6m','ret3m','ret1m','rs12m','rs3m',
                  'sma10Slope','fromHi','rangePos','dev10','vol','volContraction'];
  const pct = {};
  for (const f of fields) {
    const arr = symbols.map(s => raw[s][f]);
    pct[f] = (val) => percentileRank(arr, val);
  }

  const results = [];
  for (const sym of symbols) {
    const m = raw[sym];
    const { score, factors } = methodology.compute(m, pct);
    const roundedFactors = {};
    for (const [k, v] of Object.entries(factors)) roundedFactors[k] = Math.round(v);

    results.push({
      sym,
      name: SYM_NAME[sym] || sym,
      sector: SYM_SECTOR[sym] || '—',
      sectorName: SECTOR_NAMES[SYM_SECTOR[sym]] || '—',
      subInd: SYM_SUBIND[sym] || null,            // GICS sub-industry code
      subIndName: getSubIndHe(sym),                // Hebrew sub-industry label; null if unmapped
      score: Math.round(score),
      scores: roundedFactors,
      metrics: m,
      price: m.price,
      y1: m.ret12m != null ? m.ret12m * 100 : null,
      m3: m.ret3m != null ? m.ret3m * 100 : null,
      m1: m.ret1m != null ? m.ret1m * 100 : null,
      fromHi: m.fromHi * 100,
    });
  }

  results.sort((a, b) => b.score - a.score);
  results.forEach((r, i) => r.rank = i + 1);
  return results;
}

// ═══ MAIN SCAN ═══

async function runScan() {
  if (!PROXY) { showScreen('adv-screen-error'); return; }

  const symbolsSet = new Set();
  Object.values(getCurrentHoldings()).forEach(sec => sec.forEach(s => symbolsSet.add(s.s)));
  const symbols = Array.from(symbolsSet);

  showScreen('adv-screen-loading');
  // Actual rate with the parallel Cloudflare Worker is ~30-40 tickers/sec,
  // so 500 tickers ≈ 15 seconds. Old estimate (1.5s/ticker) was off by ~50x.
  const estSeconds = Math.max(5, Math.round(symbols.length / 30));
  const timeText = estSeconds < 60 ? `~${estSeconds} שניות` : `~${Math.ceil(estSeconds / 60)} דק׳`;
  $('loading-msg').textContent = `אוסף נתוני 52 שבועות עבור ${symbols.length} מניות (בנצ׳מרק: SPY) · משוער: ${timeText}`;
  $('prog-txt').textContent = `0 / ${symbols.length}`;
  $('prog-fill').style.width = '0%';

  // SPY is the benchmark — fetched in the background, not counted in the visible progress
  const spyPromise = fetchChartWeekly('SPY');
  const spyData = await spyPromise;

  if (!spyData) {
    $('adv-err-msg').textContent = 'לא הצלחתי לטעון את SPY (הבנצ׳מרק). בדוק את ה-proxy ונסה שוב.';
    showScreen('adv-screen-error');
    return;
  }

  // Progress now reflects only stock fetches so the loading text ("185 מניות")
  // matches the denominator the user sees on-screen.
  const stocksData = await fetchUniverseInChunks(symbols, (done, tot) => {
    $('prog-txt').textContent = `${done} / ${tot}`;
    $('prog-fill').style.width = ((done/tot)*100) + '%';
  });

  $('loading-msg').textContent = 'מחשב ציונים רב-פקטוריים...';
  await sleep(50);
  const stocks = computeScores(stocksData, spyData.closes, currentMethodology);
  if (stocks.length === 0) {
    $('adv-err-msg').textContent = 'לא נאספו מספיק נתונים. בדוק את ה-proxy.';
    showScreen('adv-screen-error');
    return;
  }

  scanData = {
    // Per-stock `refreshedAt` = initial scan timestamp. Partial watchlist
    // refreshes update this field for the affected stocks only, so the stale
    // check in computeExitSignal stays accurate per-stock rather than per-scan.
    stocks: stocks.map(s => ({ ...s, refreshedAt: Date.now() })),
    timestamp: Date.now(),
    universeSize: stocks.length,
    methodology: currentMethodology,
    universe: currentUniverse,
  };
  try {
    // Lean cache payload — drops the `closes` array (mini-chart falls back to
    // a static placeholder when restored from cache; user can re-scan for live
    // charts) and keeps only minimal metrics needed for the detail panel.
    const lean = {
      timestamp: scanData.timestamp,
      universeSize: scanData.universeSize,
      methodology: scanData.methodology,
      universe: scanData.universe,
      stocks: stocks.map(s => ({
        sym: s.sym, name: s.name, sector: s.sector, sectorName: s.sectorName,
        subInd: s.subInd, subIndName: s.subIndName,
        score: s.score, scores: s.scores, rank: s.rank,
        price: s.price, y1: s.y1, m3: s.m3, m1: s.m1, fromHi: s.fromHi,
        refreshedAt: s.refreshedAt,    // per-stock freshness stamp
        // Only the metrics actually used by the detail panel logic.
        // No `closes` → mini-chart shows a "re-scan for chart" placeholder on cache-load.
        metrics: {
          price: s.metrics.price,
          fromHi: s.metrics.fromHi,
          ret1m: s.metrics.ret1m,
          sma10: s.metrics.sma10,
          sma40: s.metrics.sma40,
          sma10Slope: s.metrics.sma10Slope,
        },
      })),
    };
    const key = getCacheKey();
    const payload = JSON.stringify(lean);
    try {
      localStorage.setItem(key, payload);
    } catch(quota) {
      // Quota exceeded — free space by clearing OTHER methodology caches for
      // this universe (keeping most-recent implicit by writing current one last),
      // then retry. If it still fails, give up gracefully.
      console.warn('cache quota hit, purging stale scan caches…');
      Object.keys(localStorage)
        .filter(k => k.startsWith('advisor_scan_cache_') && k !== key)
        .forEach(k => localStorage.removeItem(k));
      try { localStorage.setItem(key, payload); }
      catch(e2) { console.warn('cache still too large, skipping save'); }
    }
  } catch(e) { console.warn('cache save failed', e); }
  showResults();
}

// ═══ RENDERING ═══

function showResults() {
  if (!scanData) return;
  showScreen('tbl-container');
  renderKPIs();
  renderTable();
  renderWatchlist();
}

function renderKPIs() {
  const { stocks, timestamp, universeSize } = scanData;
  $('kpi-universe').textContent = universeSize;

  const avg = stocks.reduce((a,s) => a + s.score, 0) / stocks.length;
  const avgEl = $('kpi-avg');
  avgEl.textContent = Math.round(avg);
  avgEl.className = 'meta-value ' + (avg >= 60 ? 'ok' : avg >= 45 ? '' : 'warn');

  const secAgg = {};
  stocks.forEach(s => {
    if (!s.sector || s.sector === '—') return;
    if (!secAgg[s.sector]) secAgg[s.sector] = { sum:0, n:0 };
    secAgg[s.sector].sum += s.score;
    secAgg[s.sector].n++;
  });
  const secRanked = Object.entries(secAgg)
    .map(([k,v]) => ({ k, avg: v.sum/v.n, n: v.n }))
    .filter(x => x.n >= 3)
    .sort((a,b) => b.avg - a.avg);
  if (secRanked.length > 0) {
    const top = secRanked[0];
    $('kpi-sector').textContent = SECTOR_NAMES[top.k];
    $('kpi-sector-sub').textContent = `score ${Math.round(top.avg)} · ${top.n} holdings`;
  }
  const mins = Math.floor((Date.now() - timestamp) / 60000);
  $('kpi-time').textContent = mins < 1 ? 'כעת' : mins < 60 ? `לפני ${mins} דק׳` : `לפני ${Math.floor(mins/60)} שע׳`;
  const ttl = Math.round((CACHE_TTL - (Date.now() - timestamp)) / 60000);
  $('kpi-cache').textContent = ttl > 0 ? `${ttl}m cache TTL` : 'cache expired';
}

function applyFilters() { renderTable(); }
function setMinScore(v, btn) {
  displayState.minScore = v;
  document.querySelectorAll('[data-min]').forEach(b => b.classList.toggle('active', b === btn));
  renderTable();
}
function setView(v, btn) {
  displayState.view = v;
  document.querySelectorAll('.chip[data-view]').forEach(b => b.classList.toggle('active', b === btn));
  renderTable();
}

/* ════════════════════════════════════════════════════════════════════════════
   CUSTOM DROPDOWN INFRASTRUCTURE (.cdd)
   - toggleCdd(id) — open/close, close siblings
   - closeAllCdd() — bound to document click + ESC
   - On mobile (<600px), the panel uses position:fixed so we compute its `top`
     from the trigger's bounding rect, guaranteeing the panel sits directly
     below whichever dropdown was clicked instead of below the whole wrapped
     controls bar. Left/right are fixed to 8px for viewport-spanning width.
   ════════════════════════════════════════════════════════════════════════════ */
function toggleCdd(id) {
  const el = document.getElementById(`cdd-${id}`);
  if (!el) return;
  const wasOpen = el.classList.contains('open');
  closeAllCdd();
  if (!wasOpen) {
    el.classList.add('open');
    positionCddPanel(el);
    // On mobile, auto-close on scroll. Two reasons:
    //   (1) The panel uses position:fixed with JS-computed top, so scrolling
    //       the page leaves it "floating" detached from its trigger field.
    //   (2) iOS Safari captures touch on scrollable fixed panels — if the user
    //       scrolls while the dropdown is open, scroll can get stuck on the
    //       hidden panel after close. Closing on first scroll frees the capture.
    if (window.innerWidth <= 600) attachScrollToCloseCdd();
  }
}
function positionCddPanel(cdd) {
  const panel = cdd.querySelector('.cdd-panel');
  const trigger = cdd.querySelector('.cdd-trigger');
  if (!panel || !trigger) return;
  // Desktop: rely on CSS absolute positioning → clear any inline overrides
  if (window.innerWidth > 600) {
    panel.style.position = '';
    panel.style.top = '';
    panel.style.left = '';
    panel.style.right = '';
    panel.style.width = '';
    panel.style.maxHeight = '';
    return;
  }
  // Mobile: match the trigger's exact horizontal position + width so the panel
  // looks like a natural extension of the field (not a full-width overlay).
  // We set position:fixed INLINE (not just via the media-query CSS rule keyed
  // on .open) so it persists through the close transition — preventing the
  // panel from jumping when .open is removed and position:fixed would revert
  // to position:absolute mid-animation.
  const rect = trigger.getBoundingClientRect();
  panel.style.position = 'fixed';
  panel.style.top = `${Math.round(rect.bottom + 4)}px`;
  panel.style.left = `${Math.round(rect.left)}px`;
  panel.style.right = 'auto';
  panel.style.width = `${Math.round(rect.width)}px`;
  const spaceBelow = window.innerHeight - rect.bottom - 16;
  panel.style.maxHeight = `${Math.max(200, Math.min(spaceBelow, window.innerHeight * 0.6))}px`;
}
function closeAllCdd() {
  document.querySelectorAll('.cdd.open').forEach(cddEl => {
    const panel = cddEl.querySelector('.cdd-panel');
    cddEl.classList.remove('open');
    // Clear inline positioning immediately. Close is instant (no transition)
    // so there's no animation window to preserve — panel is already invisible
    // by the time this executes. Base CSS takes over for future opens.
    if (panel) {
      panel.style.position = '';
      panel.style.top = '';
      panel.style.left = '';
      panel.style.right = '';
      panel.style.width = '';
      panel.style.maxHeight = '';
    }
  });
  detachScrollToCloseCdd();
}

// Scroll-to-close handlers (bound only while a dropdown is open on mobile)
let _cddScrollHandler = null;
function attachScrollToCloseCdd() {
  if (_cddScrollHandler) return;
  _cddScrollHandler = (e) => {
    // IMPORTANT: ignore scrolls happening INSIDE the dropdown panel itself —
    // those are the user paging through options, and closing on them would
    // make the panel uselessly short. Only close on page/body scrolls.
    const t = e.target;
    if (t && t.closest && t.closest('.cdd-panel')) return;
    closeAllCdd();
  };
  document.addEventListener('scroll', _cddScrollHandler, { passive: true, capture: true });
}
function detachScrollToCloseCdd() {
  if (!_cddScrollHandler) return;
  document.removeEventListener('scroll', _cddScrollHandler, { capture: true });
  _cddScrollHandler = null;
}
// Outside-click + ESC close (attached once; guarded against re-attach)
if (!window.__cddGlobalBound) {
  window.__cddGlobalBound = true;
  document.addEventListener('click', (e) => {
    document.querySelectorAll('.cdd.open').forEach(cdd => {
      if (!cdd.contains(e.target)) cdd.classList.remove('open');
    });
  });
  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') closeAllCdd();
  });
  // Close dropdowns on resize/orientation change so stale fixed-position panels don't float around
  window.addEventListener('resize', closeAllCdd);
  window.addEventListener('orientationchange', closeAllCdd);
}

/* ────────────── SECTOR DROPDOWN ────────────── */
function populateSectorDropdown() {
  const panel = $('cdd-sector-panel');
  if (!panel) return;
  panel.innerHTML = '';
  const makeOpt = (val, label) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cdd-option';
    if (val === displayState.sector) btn.classList.add('active');
    btn.dataset.value = val;
    btn.innerHTML = `<div class="cdd-option-title">${label}</div>`;
    btn.onclick = (e) => { e.stopPropagation(); selectSector(val, label); };
    panel.appendChild(btn);
  };
  makeOpt('', 'כל הסקטורים');
  Object.entries(SECTOR_NAMES).forEach(([k, v]) => makeOpt(k, v));
}
function selectSector(val, label) {
  displayState.sector = val;
  const cur = $('cdd-sector-current');
  if (cur) cur.textContent = label;
  $('cdd-sector-panel').querySelectorAll('.cdd-option').forEach(b =>
    b.classList.toggle('active', b.dataset.value === val)
  );
  closeAllCdd();
  renderTable();
}

/* ────────────── METHODOLOGY DROPDOWN ────────────── */
function populateMethodologyDropdown() {
  const panel = $('cdd-meth-panel');
  if (!panel) return;
  panel.innerHTML = '';
  Object.entries(METHODOLOGIES).forEach(([k, m]) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'cdd-option';
    if (k === currentMethodology) btn.classList.add('active');
    btn.dataset.value = k;
    btn.innerHTML = `
      <div class="cdd-option-title">
        <span>${m.labelHe}</span>
        <span class="cdd-option-title-en">${m.label}</span>
      </div>
      <div class="cdd-option-desc">${m.desc}</div>
    `;
    btn.onclick = (e) => { e.stopPropagation(); setMethodology(k); };
    panel.appendChild(btn);
  });
}

/**
 * COMMIT a methodology switch — actually changes the active methodology,
 * updates UI, reloads cache or falls back to welcome.
 * Called by: the dropdown in the controls bar, or the "בחר במודל זה"
 * button inside the preview banner of the methodology modal.
 */
function setMethodology(key) {
  if (!METHODOLOGIES[key] || key === currentMethodology) { closeAllCdd(); return; }
  currentMethodology = key;
  viewedMethodology = key;   // keep the modal's preview state in sync so the "תצוגה מקדימה" banner disappears after commit
  localStorage.setItem(METHODOLOGY_KEY, key);

  scanData = null;
  syncMethodologyUI();
  closeAllCdd();

  // Refresh the methodology modal in-place if it's currently open
  const mthOverlay = $('mth-overlay');
  const modalOpen = mthOverlay && mthOverlay.classList.contains('open');
  if (modalOpen) {
    renderMethodologyModal();
    const modal = document.querySelector('.mth-modal');
    if (modal) modal.scrollTop = 0;
    const body = $('mth-body');
    if (body) body.scrollTop = 0;
  }

  // Try cache for this (universe, methodology) combo
  scanData = loadCachedScan();
  if (scanData) {
    if (!modalOpen) showResults();
    else { renderKPIs(); renderTable(); }
    renderWatchlist();
    return;
  }

  // No cache → reset KPIs; only show welcome screen if modal is closed
  ['kpi-universe','kpi-avg','kpi-sector','kpi-sector-sub','kpi-time','kpi-cache']
    .forEach(id => { const el = $(id); if (el) el.textContent = '—'; });
  if (!modalOpen) showScreen('screen-welcome');
  renderWatchlist();
}

function syncMethodologyUI() {
  const meth = METHODOLOGIES[currentMethodology];
  const cur = $('cdd-meth-current');
  if (cur) cur.textContent = meth.labelHe;
  const curSub = $('cdd-meth-current-sub');
  if (curSub) curSub.textContent = meth.label;
  // Mark active option
  const panel = $('cdd-meth-panel');
  if (panel) {
    panel.querySelectorAll('.cdd-option').forEach(b =>
      b.classList.toggle('active', b.dataset.value === currentMethodology)
    );
  }
}

/**
 * Switch between large-cap and mid-cap universes.
 * Each universe has its own cache entry, so switching is instant if already scanned;
 * otherwise the user sees the welcome screen with a "Start scan" prompt.
 */
function setUniverse(u, _btn) {
  if (!UNIVERSES[u] || u === currentUniverse) { closeAllCdd(); return; }
  currentUniverse = u;
  localStorage.setItem(UNIVERSE_KEY, u);

  // Point symbol-maps at the new universe's holdings
  rebuildSymMaps();

  // Reset table state (scan data is universe-specific)
  scanData = null;

  // Update UI: dropdown label + active option + KPI subtitle
  syncUniverseUI();
  closeAllCdd();

  // Try to load cached scan for THIS universe
  scanData = loadCachedScan();
  if (scanData) { showResults(); renderWatchlist(); return; }

  // No cache → reset KPIs and drop back to welcome screen, inviting a fresh scan
  ['kpi-universe','kpi-avg','kpi-sector','kpi-sector-sub','kpi-time','kpi-cache']
    .forEach(id => { const el = $(id); if (el) el.textContent = '—'; });
  showScreen('screen-welcome');
  renderWatchlist();
}
function sortBy(key) {
  if (displayState.sortKey === key) {
    displayState.sortDesc = !displayState.sortDesc;
  } else {
    displayState.sortKey = key;
    displayState.sortDesc = true;
  }
  renderTable();
}

function getFilteredStocks() {
  if (!scanData) return [];
  let list = scanData.stocks.slice();
  list = list.filter(s => s.score >= displayState.minScore);
  if (displayState.sector) list = list.filter(s => s.sector === displayState.sector);
  if (displayState.view === 'top20') list = list.slice(0, 20);
  if (displayState.view === 'watchlist') list = list.filter(s => watchlist.includes(s.sym));
  const k = displayState.sortKey;
  const dir = displayState.sortDesc ? -1 : 1;
  list.sort((a,b) => {
    const av = a[k], bv = b[k];
    if (av == null && bv == null) return 0;
    if (av == null) return 1;
    if (bv == null) return -1;
    if (typeof av === 'string') return av.localeCompare(bv) * dir;
    return (av - bv) * dir;
  });
  return list;
}

function scoreClass(s) {
  if (s >= 90) return 's-90';
  if (s >= 75) return 's-75';
  if (s >= 60) return 's-60';
  if (s >= 40) return 's-40';
  return 's-0';
}

function renderTable() {
  const list = getFilteredStocks();
  const tbody = $('picks-body');
  // Watchlist-view-only banner with freshness + refresh button — rendered
  // before the tbody so it appears above the rows.
  renderWatchlistBanner();
  // Update sort indicators
  document.querySelectorAll('table.picks th').forEach(th => {
    th.classList.remove('sorted');
    th.classList.remove('asc');
  });
  // Identify the currently sorted header (indices reflect new sub-industry column)
  const headerMap = {
    'sym': 1, 'sector': 2, 'subIndName': 3, 'score': 4, 'price': 6, 'y1': 7, 'm3': 8, 'fromHi': 9
  };
  const idx = headerMap[displayState.sortKey];
  if (idx) {
    const th = document.querySelectorAll('table.picks th')[idx];
    if (th) {
      th.classList.add('sorted');
      if (!displayState.sortDesc) th.classList.add('asc');
    }
  }

  if (list.length === 0) {
    tbody.innerHTML = `
      <tr><td colspan="11" style="padding:40px;text-align:center;color:var(--dim)">
        אין מניות שעונות על הקריטריונים.
        ${displayState.view === 'watchlist' ? '<br><small style="font-size:10px;color:var(--dimmer)">הוסף מניות לרשימה שלך מפאנל הפירוט של כל מניה.</small>' : ''}
      </td></tr>`;
    return;
  }

  tbody.innerHTML = list.map(s => {
    const rkCls = s.rank <= 3 ? 'top3' : '';
    const badges = [];
    // In watchlist view, replace the generic WL pill with an informative
    // Exit-Signal verdict (חזק / חלש / יציאה). Other views get the plain WL
    // pill so starred stocks are visible at a glance during normal browsing.
    if (watchlist.includes(s.sym)) {
      if (displayState.view === 'watchlist') {
        badges.push(renderExitBadge(s.sym));
      } else {
        badges.push('<span class="bdg bdg-wl">WL</span>');
      }
    }
    if (s.rank <= 10 && s.score >= 80) badges.push('<span class="bdg bdg-star">★</span>');

    return `
      <tr onclick="openDetail('${s.sym}')">
        <td class="rk ${rkCls}">${s.rank}</td>
        <td class="sym"><img class="sym-logo" src="https://financialmodelingprep.com/image-stock/${s.sym}.png" alt="" loading="lazy" onerror="this.classList.add('sym-logo-err')"><b>${s.sym}</b>${badges.join('')}<span class="name">${s.name}</span></td>
        <td class="sec">${s.sectorName}</td>
        <td class="subsec hide-m">${s.subIndName || '—'}</td>
        <td><span class="score ${scoreClass(s.score)}">${s.score}</span></td>
        <td class="hide-m">${renderFactorBars(s.scores)}</td>
        <td class="num hide-m">$${fmt(s.price)}</td>
        <td class="num pct ${pctCls(s.y1)}">${fmtPct(s.y1)}</td>
        <td class="num pct hide-m ${pctCls(s.m3)}">${fmtPct(s.m3)}</td>
        <td class="num hide-m" style="color:${s.fromHi > -3 ? 'var(--green)' : s.fromHi < -15 ? 'var(--red)' : 'var(--dim)'}">${fmtPct(s.fromHi)}</td>
        <td class="num"><span style="color:var(--dim);font-size:11px">›</span></td>
      </tr>
    `;
  }).join('');
}

function renderFactorBars(scores) {
  const fs = METHODOLOGIES[currentMethodology].factors.map(f => f.k);
  return `<div class="fbars">${
    fs.map(f => `<div class="fbar" data-f="${f}" title="${f}: ${scores[f] ?? 0}"><div class="fbar-fill" style="height:${scores[f] ?? 0}%"></div></div>`).join('')
  }</div>`;
}

function fmt(n) {
  if (n == null) return '—';
  if (n >= 1000) return n.toLocaleString('en-US', { maximumFractionDigits: 0 });
  return n.toFixed(2);
}
function fmtPct(n) {
  if (n == null || isNaN(n)) return '—';
  return (n > 0 ? '+' : '') + n.toFixed(1) + '%';
}
function pctCls(n) {
  if (n == null || isNaN(n)) return 'flat';
  if (n > 0) return 'up';
  if (n < 0) return 'down';
  return 'flat';
}

/* ════════════════════════════════════════════════════════════════════════════
   EXIT SIGNALS
   For a stock in the user's watchlist, compute three independent signals that
   answer "should I still hold?" — based on classic momentum exit rules:

     1. TOP — still in the top N of the latest scan (we use 50)
             → if it dropped out, momentum rank has decayed (Jegadeesh & Titman)

     2. MA  — price still above its 40-day moving average
             → weekly MA break = Weinstein stage-4 begins

     3. Y1  — 12-month return still positive
             → Antonacci Dual Momentum hard exit rule

   Scan age matters too — stale data can give false confidence. We track three
   freshness tiers: fresh (<1h), warm (1-4h), cold (>4h). The UI dims stale
   signals and nudges the user to re-scan before acting on them.
   ════════════════════════════════════════════════════════════════════════════ */
const EXIT_TOP_N = 50;
const STALE_FRESH_MS = 60 * 60 * 1000;          // 1 hour — signals fully trusted
const STALE_WARM_MS  = 4 * 60 * 60 * 1000;      // 4 hours — show warning

function computeExitSignal(sym) {
  if (!scanData || !scanData.stocks) return null;
  const stock = scanData.stocks.find(s => s.sym === sym);
  if (!stock) return { state: 'unknown', pass: 0, signals: { top: null, ma: null, y1: null }, freshness: 'cold' };

  const price = stock.metrics?.price;
  const sma40 = stock.metrics?.sma40;
  const y1    = stock.y1;
  const rank  = stock.rank;

  const sig = {
    top: rank != null ? rank <= EXIT_TOP_N : null,
    ma:  (price != null && sma40 != null) ? price > sma40 : null,
    y1:  y1 != null ? y1 > 0 : null,
  };

  // Count passes, counting nulls as failures for the overall verdict (conservative:
  // missing data shouldn't inflate confidence).
  const pass = (sig.top === true ? 1 : 0) + (sig.ma === true ? 1 : 0) + (sig.y1 === true ? 1 : 0);
  let state;
  if      (pass === 3) state = 'strong';   // 3/3 — hold
  else if (pass === 2) state = 'caution';  // 2/3 — watch
  else                 state = 'exit';     // 0-1/3 — consider selling

  // Freshness tier from per-stock refreshedAt (not scan timestamp). Partial
  // watchlist refresh updates refreshedAt for just the refreshed subset, so
  // this correctly reflects which stocks have fresh data vs which are stale.
  // Fall back to scanData.timestamp for caches saved before refreshedAt existed.
  const age = Date.now() - (stock.refreshedAt || scanData.timestamp || 0);
  const freshness = age < STALE_FRESH_MS ? 'fresh'
                  : age < STALE_WARM_MS  ? 'warm'
                                         : 'cold';

  return { state, pass, signals: sig, rank, price, sma40, y1, freshness, ageMs: age };
}

/** Compact colored pill next to ticker in watchlist rows. When scan is stale,
    the badge dims to signal uncertainty — keeps the verdict visible but tells
    the user to treat it as provisional. */
function renderExitBadge(sym) {
  const r = computeExitSignal(sym);
  if (!r || r.state === 'unknown') return '';
  const labels = { strong: 'חזק', caution: 'חלש', exit: 'יציאה' };
  const freshClass = r.freshness === 'fresh' ? '' : ` bdg-exit-${r.freshness}`;
  const title = r.freshness === 'fresh'
    ? `${r.pass}/3 סיגנלי החזקה`
    : `${r.pass}/3 סיגנלי החזקה · הסריקה ישנה, סרוק מחדש`;
  return `<span class="bdg bdg-exit bdg-exit-${r.state}${freshClass}" title="${title}">${labels[r.state]}</span>`;
}

/** Full Exit Signals breakdown for the Detail Panel — only called when the
    user has starred this stock. Shows each signal as a row with pass/fail + a
    plain-language explanation so the user understands WHY the verdict says what
    it says (not just a mystery badge). */
function renderExitSection(s) {
  const r = computeExitSignal(s.sym);
  if (!r) return '';

  const verdictCls   = `exit-verdict exit-verdict-${r.state}`;
  const verdictText  = { strong:  'החזק — שלושת הסיגנלים תקינים',
                         caution: 'שים לב — סיגנל אחד שבור',
                         exit:    'שקול למכור — שני סיגנלים שבורים',
                         unknown: 'אין נתונים עדכניים' }[r.state];

  const row = (ok, label, detail) => {
    const cls = ok === true ? 'ok' : ok === false ? 'bad' : 'na';
    const sym = ok === true ? '✓' : ok === false ? '✗' : '—';
    return `
      <div class="exit-row exit-row-${cls}">
        <div class="exit-dot">${sym}</div>
        <div class="exit-text">
          <div class="exit-label">${label}</div>
          <div class="exit-detail">${detail}</div>
        </div>
      </div>`;
  };

  const topDetail = r.signals.top === null
    ? 'המניה לא נסרקה'
    : r.signals.top
      ? `דירוג ${r.rank} בסריקה — בתוך הטופ ${EXIT_TOP_N}`
      : `דירוג ${r.rank} בסריקה — מחוץ לטופ ${EXIT_TOP_N}, המומנטום נחלש`;

  const maDetail = r.signals.ma === null
    ? 'חסרים נתוני ממוצע נע'
    : r.signals.ma
      ? `$${fmt(r.price)} מעל MA40 ($${fmt(r.sma40)}) — המגמה שלמה`
      : `$${fmt(r.price)} מתחת ל-MA40 ($${fmt(r.sma40)}) — שבירת מגמה`;

  const y1Detail = r.signals.y1 === null
    ? 'חסרים נתוני תשואה שנתית'
    : r.signals.y1
      ? `תשואת 12 חודשים ${fmtPct(r.y1)} — מומנטום מוחלט חיובי`
      : `תשואת 12 חודשים ${fmtPct(r.y1)} — חוק Antonacci מחייב יציאה`;

  // Warning banner when the stock's data is stale enough to mistrust the verdict.
  // 'warm' = soft warning, 'cold' = prominent red warning — both nudge the user
  // to refresh before acting on the signal.
  const staleWarning = r.freshness === 'fresh' ? '' : `
    <div class="exit-stale-warn exit-stale-${r.freshness}">
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/><line x1="12" y1="9" x2="12" y2="13"/><line x1="12" y1="17" x2="12.01" y2="17"/></svg>
      <span>
        ${r.freshness === 'warm'
          ? `הנתונים לסיגנל הזה מלפני ${formatMinutesAgo(Date.now() - r.ageMs).replace('לפני ', '')}. סרוק מחדש לפני פעולה.`
          : `הנתונים ישנים מאוד (${formatMinutesAgo(Date.now() - r.ageMs).replace('לפני ', '')}). הסיגנל לא אמין עד סריקה חדשה.`
        }
      </span>
    </div>`;

  // Per-stock refresh time — reflects partial-refresh updates, not just the
  // full scan timestamp. Look up the actual stock to get refreshedAt.
  const stockData = scanData.stocks.find(x => x.sym === s.sym);
  const refreshedAt = stockData?.refreshedAt || scanData.timestamp;

  return `
    <div class="dt-section">
      <div class="dt-section-title">אותות יציאה · לפי חוקי המומנטום</div>
      ${staleWarning}
      <div class="${verdictCls}">${verdictText}</div>
      <div class="exit-signals">
        ${row(r.signals.top, 'עדיין בטופ הסריקה',   topDetail)}
        ${row(r.signals.ma,  'מעל הממוצע הנע 40 יום', maDetail)}
        ${row(r.signals.y1,  'תשואת 12 חודשים חיובית', y1Detail)}
      </div>
      <div class="exit-footer">עדכון אחרון לסיגנל זה: ${formatMinutesAgo(refreshedAt)}</div>
    </div>`;
}

/** Short "לפני X דקות/שעות" formatter — reused across the app. */
function formatMinutesAgo(ts) {
  if (!ts) return '—';
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 60) return `לפני ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `לפני ${hours} שעות`;
  return `לפני ${Math.floor(hours / 24)} ימים`;
}

/**
 * Partial refresh: fetches fresh chart data for just the watchlist stocks and
 * updates their price/MA40/y1 in-place, without disturbing the full scan's
 * rank/score (which depend on the entire universe's percentile distribution).
 *
 * Design note: we can't meaningfully re-rank with just 10-15 stocks — the
 * percentile math only makes sense against the full universe. So the TOP
 * signal (rank ≤ 50) continues to reference the full-scan rank, which is
 * exactly what "still in top of scan" should mean. The MA40 and Y1 signals,
 * which depend only on the stock's own price history, become fully fresh.
 *
 * Runtime: ~0.3s for 10-15 stocks (vs. ~10s for full scan), small enough
 * to feel instant while still being honest about what it actually refreshed.
 */
async function refreshWatchlist() {
  if (!scanData || !scanData.stocks) return;
  const btn = $('wl-refresh-btn');
  if (btn?.disabled) return;  // prevent double-clicks

  // Find watchlist stocks that exist in the current scan (others we can't
  // refresh — they belong to a different universe or aren't loaded).
  const wlInScan = scanData.stocks.filter(s => watchlist.includes(s.sym));
  if (wlInScan.length === 0) return;

  if (btn) { btn.disabled = true; btn.classList.add('refreshing'); }
  const bannerText = $('wl-refresh-status');
  if (bannerText) bannerText.textContent = `מרענן ${wlInScan.length} מניות...`;

  try {
    const symbols = wlInScan.map(s => s.sym);
    // Parallel: SPY (needed for rs12m in computeMetrics) + all watchlist charts
    const [spyData, stocksData] = await Promise.all([
      fetchChartWeekly('SPY'),
      fetchUniverseInChunks(symbols, () => {}),  // no progress UI for partial
    ]);

    if (!spyData) throw new Error('SPY fetch failed');

    // Recompute metrics per stock and patch into scanData.stocks in-place.
    // Keep score/rank/scores/scoreBreakdown from the full scan — they require
    // universe-wide percentile data we don't have here.
    const now = Date.now();
    let refreshedCount = 0;
    for (const stock of wlInScan) {
      const chartData = stocksData[stock.sym];
      if (!chartData) continue;   // fetch failed for this symbol
      const m = computeMetrics(chartData, spyData.closes);
      if (!m) continue;

      // Update the stock object in scanData.stocks (same reference as wlInScan entries)
      stock.price  = m.price;
      stock.y1     = m.ret12m != null ? m.ret12m * 100 : null;
      stock.m3     = m.ret3m  != null ? m.ret3m  * 100 : null;
      stock.m1     = m.ret1m  != null ? m.ret1m  * 100 : null;
      stock.fromHi = m.fromHi * 100;
      stock.metrics = {
        price:      m.price,
        fromHi:     m.fromHi,
        ret1m:      m.ret1m,
        sma10:      m.sma10,
        sma40:      m.sma40,
        sma10Slope: m.sma10Slope,
      };
      stock.refreshedAt = now;
      refreshedCount++;
    }

    // Persist the update — next cache load will see the per-stock freshness.
    try { localStorage.setItem(getCacheKey(), JSON.stringify({
      timestamp: scanData.timestamp,
      universeSize: scanData.universeSize,
      methodology: scanData.methodology,
      universe: scanData.universe,
      stocks: scanData.stocks.map(s => ({
        sym: s.sym, name: s.name, sector: s.sector, sectorName: s.sectorName,
        subInd: s.subInd, subIndName: s.subIndName,
        score: s.score, scores: s.scores, rank: s.rank,
        price: s.price, y1: s.y1, m3: s.m3, m1: s.m1, fromHi: s.fromHi,
        refreshedAt: s.refreshedAt,
        metrics: s.metrics,
      })),
    })); } catch(e){}

    if (bannerText) bannerText.textContent = `עודכן · ${refreshedCount}/${wlInScan.length}`;
    // Clear the status text after 2 seconds so it doesn't linger
    setTimeout(() => { if (bannerText) bannerText.textContent = ''; }, 2000);

    renderTable();
  } catch(e) {
    console.warn('watchlist refresh failed:', e);
    if (bannerText) bannerText.textContent = 'שגיאה · נסה שוב';
    setTimeout(() => { if (bannerText) bannerText.textContent = ''; }, 3000);
  } finally {
    if (btn) { btn.disabled = false; btn.classList.remove('refreshing'); }
  }
}

/** Render the small status-bar banner that appears ABOVE the table when the
    user is in "רשימה שלי" view. Shows oldest-stock freshness across the list
    and a compact refresh button. Called from renderTable() before the tbody
    is written. */
function renderWatchlistBanner() {
  const container = $('wl-banner');
  if (!container) return;

  if (displayState.view !== 'watchlist' || !scanData || !scanData.stocks) {
    container.style.display = 'none';
    return;
  }

  const wlInScan = scanData.stocks.filter(s => watchlist.includes(s.sym));
  if (wlInScan.length === 0) {
    container.style.display = 'none';
    return;
  }

  // Find the OLDEST refresh time in the list — the banner reflects the worst
  // case. If even one stock is stale, show the warning; a refresh brings them
  // all up to fresh at once.
  const oldestRefresh = Math.min(...wlInScan.map(s => s.refreshedAt || scanData.timestamp || 0));
  const age = Date.now() - oldestRefresh;
  const tier = age < STALE_FRESH_MS ? 'fresh'
             : age < STALE_WARM_MS  ? 'warm'
                                    : 'cold';

  const ageText = formatMinutesAgo(oldestRefresh);
  container.className = `wl-banner wl-banner-${tier}`;
  container.style.display = 'flex';
  container.innerHTML = `
    <div class="wl-banner-info">
      <span class="wl-banner-label">אותות יציאה · נתונים מ-${ageText}</span>
      <span class="wl-refresh-status" id="wl-refresh-status"></span>
    </div>
    <button class="wl-refresh-btn" id="wl-refresh-btn" onclick="refreshWatchlist()" title="רענון מהיר של הרשימה בלבד">
      <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="23 4 23 10 17 10"/><path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10"/></svg>
      <span>רענן רשימה</span>
    </button>`;
}

// ═══ DETAIL PANEL ═══

function openDetail(sym) {
  const s = scanData.stocks.find(x => x.sym === sym);
  if (!s) return;
  $('dt-sym').textContent = s.sym;
  $('dt-name').textContent = s.name;
  // Company logo in header (same source as picks table; gracefully hides via onerror)
  const logo = $('dt-logo');
  if (logo) {
    logo.classList.remove('dt-hdr-logo-err');
    logo.src = `https://financialmodelingprep.com/image-stock/${s.sym}.png`;
  }

  const body = $('dt-body');
  const m = s.metrics;

  const thesis = [];
  if (s.score >= 85) thesis.push({ t: 'ציון גבוה במיוחד - המניה בדרגת Top Tier בקטגוריה.', cls: '' });
  if (s.scores.RS >= 80) thesis.push({ t: `חוזק יחסי חזק מאוד (${s.scores.RS}/100) - עולה על S&P 500 לאורך זמן.`, cls: '' });
  if (s.scores.TRD >= 80 && m.sma10 > m.sma40) thesis.push({ t: 'מגמה נקייה: Golden Cross פעיל + SMA עולה.', cls: '' });
  if (m.fromHi > -3) thesis.push({ t: `קרוב לשיא 52 שבועות (${fmtPct(m.fromHi*100)}) - breakout potential.`, cls: '' });
  if (s.scores.MOM >= 85) thesis.push({ t: `מומנטום חזק בכל הטווחים (3M/6M/12M).`, cls: '' });
  if (m.fromHi < -20) thesis.push({ t: `רחוק מהשיא (${fmtPct(m.fromHi*100)}) - ייתכן downtrend.`, cls: 'neg' });
  if (m.ret1m != null && m.ret1m < -0.08) thesis.push({ t: `חולשה אחרונה (${fmtPct(m.ret1m*100)} בחודש).`, cls: 'warn' });
  if (s.scores.TRD < 40) thesis.push({ t: 'איכות המגמה נמוכה - המחיר מתחת לממוצעים או מגמה שלילית.', cls: 'warn' });
  if (s.scores.RS < 30) thesis.push({ t: 'חלשה מהשוק הכללי - underperforming S&P 500.', cls: 'neg' });
  if (thesis.length === 0) thesis.push({ t: 'ציון בינוני - ללא סיגנלים מובהקים בכיוון אחד.', cls: 'warn' });

  const inWL = watchlist.includes(s.sym);

  body.innerHTML = `
    <div class="dt-score-hero">
      <div class="dt-score-circle" style="--s:${s.score}">
        <div class="dt-score-val">${s.score}</div>
      </div>
      <div class="dt-score-info">
        <div class="dt-score-lbl">#${s.rank} מתוך ${scanData.universeSize}</div>
        <div class="dt-score-title">${s.name}</div>
        <div class="dt-score-desc">${s.sectorName} · $${fmt(s.price)} · ${fmtPct(s.y1)} שנתי</div>
        ${s.subIndName ? `<div class="dt-score-subind">${s.subIndName}</div>` : ''}
      </div>
    </div>

    <div class="dt-section">
      <div class="dt-section-title">פירוט פקטורים · <span style="font-weight:500;color:var(--dim)">${METHODOLOGIES[currentMethodology].label}</span></div>
      <div class="factor-grid">
        ${METHODOLOGIES[currentMethodology].factors.map(f => `
          <div class="factor-row" data-f="${f.k}">
            <div>
              <div class="factor-name">${f.label}</div>
              <div class="factor-sub">${f.desc} · ${f.weight}%</div>
            </div>
            <div class="factor-bar-wrap">
              <div class="factor-bar-fill" style="width:${s.scores[f.k] ?? 0}%"></div>
            </div>
            <div class="factor-val" style="color:${(s.scores[f.k]??0)>=70?'var(--green)':(s.scores[f.k]??0)>=40?'var(--text)':'var(--red)'}">${s.scores[f.k] ?? '—'}</div>
          </div>
        `).join('')}
      </div>
    </div>

    <div class="dt-section">
      <div class="dt-section-title">מטריקות מפתח</div>
      <div class="metrics-grid">
        <div class="metric-cell">
          <div class="metric-lbl">12M</div>
          <div class="metric-val ${pctCls(s.y1)}">${fmtPct(s.y1)}</div>
        </div>
        <div class="metric-cell">
          <div class="metric-lbl">6M</div>
          <div class="metric-val ${pctCls(m.ret6m*100)}">${fmtPct(m.ret6m*100)}</div>
        </div>
        <div class="metric-cell">
          <div class="metric-lbl">3M</div>
          <div class="metric-val ${pctCls(s.m3)}">${fmtPct(s.m3)}</div>
        </div>
        <div class="metric-cell">
          <div class="metric-lbl">1M</div>
          <div class="metric-val ${pctCls(s.m1)}">${fmtPct(s.m1)}</div>
        </div>
        <div class="metric-cell">
          <div class="metric-lbl">מ-52w High</div>
          <div class="metric-val ${pctCls(s.fromHi)}">${fmtPct(s.fromHi)}</div>
        </div>
        <div class="metric-cell">
          <div class="metric-lbl">RS vs SPY (12M)</div>
          <div class="metric-val ${pctCls(m.rs12m*100)}">${fmtPct(m.rs12m*100)}</div>
        </div>
      </div>
    </div>

    ${inWL ? renderExitSection(s) : ''}

    <div class="dt-section">
      <div class="dt-section-title">תזה אוטומטית</div>
      <ul class="thesis-list">
        ${thesis.map(t => `<li class="${t.cls||''}">${t.t}</li>`).join('')}
      </ul>
    </div>

    <div class="dt-section">
      <div class="dt-section-title">גרף 26 שבועות</div>
      ${renderMiniChart(m.closes)}
    </div>

    <div class="dt-actions">
      <button class="dt-btn ${inWL?'primary':''}" onclick="toggleWatchlist('${s.sym}')">
        ${inWL ? '✓ ברשימה' : '+ הוסף לרשימה'}
      </button>
      <button class="dt-btn" onclick="window.open('https://finance.yahoo.com/quote/${s.sym}', '_blank')">
        Yahoo Finance ↗
      </button>
    </div>
  `;

  $('dt-overlay').classList.add('open');
}

function closeDetail(e) {
  if (e && e.target.id !== 'dt-overlay') return;
  closeDetailDirect();
}
function closeDetailDirect() {
  $('dt-overlay').classList.remove('open');
}

function renderMiniChart(closes) {
  if (!closes || closes.length < 4) {
    // After cache restore, closes are dropped to save quota. Offer an explicit
    // re-scan CTA instead of a dead "no data" message.
    return '<div style="color:var(--dim);font-size:11px;padding:20px;text-align:center;line-height:1.6">גרף זמין לאחר סריקה חדשה<br><span style="font-size:10px;opacity:.7">לחץ על "סריקה" ברצועת הבקרה לרענון עם נתונים חיים</span></div>';
  }
  const last26 = closes.slice(-26);
  const min = Math.min(...last26);
  const max = Math.max(...last26);
  const w = 520, h = 120;
  const pad = 2;
  const iw = w - pad * 2;
  const ih = h - pad * 2;
  const pts = last26.map((c, i) => {
    const x = pad + (i / (last26.length - 1)) * iw;
    const y = pad + ih - ((c - min) / (max - min || 1)) * ih;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' ');

  const isUp = last26[last26.length - 1] >= last26[0];
  const color = isUp ? 'var(--green)' : 'var(--red)';
  const fill = isUp ? 'var(--green-soft)' : 'var(--red-soft)';

  const areaPath = `M${pad},${pad + ih} L${last26.map((c, i) => {
    const x = pad + (i / (last26.length - 1)) * iw;
    const y = pad + ih - ((c - min) / (max - min || 1)) * ih;
    return `${x.toFixed(1)},${y.toFixed(1)}`;
  }).join(' L')} L${pad + iw},${pad + ih} Z`;

  return `
    <svg viewBox="0 0 ${w} ${h}" preserveAspectRatio="none" style="width:100%;height:auto;display:block;background:var(--bg2);border:1px solid var(--border);border-radius:7px">
      <path d="${areaPath}" fill="${fill}"/>
      <polyline points="${pts}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round" stroke-linecap="round"/>
    </svg>
    <div style="display:flex;justify-content:space-between;font-size:10px;color:var(--dim);font-family:var(--mono);direction:ltr;margin-top:4px;padding:0 2px">
      <span>$${min.toFixed(2)}</span>
      <span>26 weeks</span>
      <span>$${max.toFixed(2)}</span>
    </div>
  `;
}

// ═══ CLOUD SYNC (Supabase) ═══
// Offline-first personal watchlist sync. localStorage stays the primary source
// for reads (always instant), cloud becomes source-of-truth on login (pulled
// once, then watched for changes), and all mutations push to cloud in the
// background as fire-and-forget operations. Net effect: UI never blocks on
// the network, yet state converges across devices within a couple of seconds.
//
// Security model: the anon key below is embedded in public HTML and can be
// read by anyone who views source. This is fine by Supabase's design — the
// ONLY protection against users reading each other's data is the RLS policies
// in the SQL migration. Every query runs scoped to auth.uid(), so even if
// someone tampers with requests in devtools, the database refuses to return
// rows they don't own.

const SUPABASE_URL       = 'https://grvoyxczifjftrovvisk.supabase.co';
const SUPABASE_ANON_KEY  = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imdydm95eGN6aWZqZnRyb3Z2aXNrIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY3NTc5NjksImV4cCI6MjA5MjMzMzk2OX0.l1a65TddlIa73oQI2SrTIq0tIJotVXKxRRNKLu4Fsoc';

let sbClient    = null;  // lazily-initialized Supabase client
let currentUser = null;  // { id, email } when signed in, else null
let cloudSyncInitialized = false;

// Capture OAuth redirect status BEFORE Supabase client is created — the client
// strips the hash automatically once it parses it. If we see access_token in
// the URL, the user just came back from Google sign-in and we should navigate
// them to the advisor tab after the session is established.
const CAME_FROM_OAUTH = typeof window !== 'undefined'
  && window.location.hash.includes('access_token=');

function ensureSupabase() {
  if (sbClient) return sbClient;
  if (!window.supabase?.createClient) return null;   // CDN not yet loaded
  sbClient = window.supabase.createClient(SUPABASE_URL, SUPABASE_ANON_KEY, {
    auth: { persistSession: true, autoRefreshToken: true, detectSessionInUrl: true },
  });
  return sbClient;
}

/** Build a normalized user object from a Supabase session. Extracted so the
    auth state listener and the initial session hydration stay in sync. */
function userFromSession(session) {
  if (!session?.user) return null;
  const m = session.user.user_metadata || {};
  return {
    id:     session.user.id,
    email:  session.user.email,
    // Google OAuth returns avatar_url + picture (same URL); Magic Link has
    // neither and we gracefully fall back to the green dot indicator.
    avatar: m.avatar_url || m.picture || null,
    name:   m.full_name || m.name || null,
  };
}

/** Boot sequence: restores existing session (if any), then listens for
    future auth changes. Called once from advisorBoot. */
async function initCloudSync() {
  if (cloudSyncInitialized) return;
  const sb = ensureSupabase();
  if (!sb) {
    // Retry once in case the CDN just hadn't loaded yet when app booted
    setTimeout(initCloudSync, 800);
    return;
  }
  cloudSyncInitialized = true;

  // Auth state listener — fires for SIGNED_IN, SIGNED_OUT, TOKEN_REFRESHED, etc.
  sb.auth.onAuthStateChange((event, session) => {
    currentUser = userFromSession(session);
    renderAuthStatus();
    if (event === 'SIGNED_IN') {
      // Chain: pull watchlist from cloud first, THEN auto-refresh signals.
      // Order matters — a symbol added on another device needs to be in the
      // watchlist array before refreshWatchlist() can fetch its fresh data.
      pullWatchlistFromCloud().then(() => scheduleAutoRefresh(0));
      // If this SIGNED_IN came from an OAuth redirect, the user landed on
      // whatever the OAuth provider redirected to — usually the root/dashboard
      // tab. Send them back to the advisor tab where the sync matters.
      if (CAME_FROM_OAUTH) {
        window.location.hash = '#/advisor';
      }
    }
  });

  // Hydrate any existing session from localStorage (Supabase persists session there)
  const { data: { session } } = await sb.auth.getSession();
  if (session) {
    currentUser = userFromSession(session);
    renderAuthStatus();
    pullWatchlistFromCloud();
  } else {
    renderAuthStatus();
  }
}

/** Request a magic link. User enters email → Supabase sends a one-time sign-in
    link → clicking it in the email lands back on this page authenticated. */
async function signInWithEmail(email) {
  const sb = ensureSupabase();
  if (!sb) return { error: 'לא הצלחתי לטעון את Supabase. בדוק חיבור לאינטרנט.' };
  const { error } = await sb.auth.signInWithOtp({
    email,
    options: { emailRedirectTo: window.location.href.split('#')[0] },
  });
  return { error: error?.message };
}

async function signOut() {
  const sb = ensureSupabase();
  if (!sb) return;
  await sb.auth.signOut();
  currentUser = null;
  renderAuthStatus();
  // Intentionally keep local watchlist after logout — user can keep using app
  // offline. Next login merges back with cloud.
}

/** Google OAuth sign-in — much better UX than Magic Link: one click, no
    email, no rate limits. Supabase handles the full OAuth dance via redirect
    to accounts.google.com. User returns authenticated. Requires Google
    provider to be enabled in Supabase Dashboard → Authentication → Providers. */
async function signInWithGoogle() {
  const sb = ensureSupabase();
  if (!sb) return { error: 'לא הצלחתי לטעון את Supabase' };
  const { error } = await sb.auth.signInWithOAuth({
    provider: 'google',
    options: {
      redirectTo: window.location.href.split('#')[0],
    },
  });
  return { error: error?.message };
}

// Metadata per symbol — currently just addedAt. Populated from cloud on pull,
// and from local push timestamps when the user stars a symbol while online.
// Keyed by symbol → { addedAt: ISO string }.
const watchlistMeta = {};

/** Pull cloud watchlist, merge with local (union semantics: on first login
    we UNION local + cloud so the user never loses symbols they added offline
    before signing in). Subsequent pulls effectively replace local with cloud
    since local + cloud have already converged. */
async function pullWatchlistFromCloud() {
  const sb = ensureSupabase();
  if (!sb || !currentUser) return;
  try {
    const { data, error } = await sb.from('watchlist').select('symbol, added_at').eq('user_id', currentUser.id);
    if (error) { console.warn('cloud pull failed:', error.message); return; }
    const cloudRows = data || [];
    const cloudSymbols = cloudRows.map(r => r.symbol);
    // Store addedAt timestamps for the account modal to display
    cloudRows.forEach(r => { watchlistMeta[r.symbol] = { addedAt: r.added_at }; });

    const localBefore  = watchlist.slice();

    // Union merge — safe on first login, idempotent afterwards
    const merged = [...new Set([...cloudSymbols, ...localBefore])];
    watchlist = merged;
    try { localStorage.setItem(WL_KEY, JSON.stringify(watchlist)); } catch(e){}

    // Push any local-only symbols to cloud to complete the merge
    const localOnly = localBefore.filter(s => !cloudSymbols.includes(s));
    for (const sym of localOnly) pushSymbolToCloud(sym);

    // Reflect merged list in UI + refresh pill (count changed)
    renderAuthStatus();
    if (scanData) { renderWatchlist(); renderTable(); }
    console.info(`watchlist merged: cloud=${cloudSymbols.length}, local-only=${localOnly.length}, total=${merged.length}`);
  } catch(e) { console.warn('cloud pull error:', e); }
}

/** Fire-and-forget add. Uses upsert so double-clicks on the same symbol don't
    create a duplicate error (composite PK would reject a plain INSERT). */
async function pushSymbolToCloud(sym) {
  // Record local addedAt immediately so the account modal reflects "נוסף היום"
  // without waiting for the cloud roundtrip. Cloud's added_at (from the DB
  // default) will overwrite on the next pull — they should be within seconds.
  watchlistMeta[sym] = { addedAt: new Date().toISOString() };

  const sb = ensureSupabase();
  if (!sb || !currentUser) return;
  try {
    const { error } = await sb.from('watchlist').upsert(
      { user_id: currentUser.id, symbol: sym },
      { onConflict: 'user_id,symbol' }
    );
    if (error) console.warn(`push ${sym} failed:`, error.message);
  } catch(e) { console.warn(`push ${sym} error:`, e); }
}

async function removeSymbolFromCloud(sym) {
  const sb = ensureSupabase();
  if (!sb || !currentUser) return;
  try {
    const { error } = await sb.from('watchlist').delete()
      .eq('user_id', currentUser.id).eq('symbol', sym);
    if (error) console.warn(`remove ${sym} failed:`, error.message);
  } catch(e) { console.warn(`remove ${sym} error:`, e); }
}

// ─── AUTO-REFRESH ON BOOT ──────────────────────────────────────────────────
// On every app load we refresh the watchlist automatically so signals reflect
// the current moment rather than whenever the last scan ran. Cost is low
// (~0.3s for ~15 stocks) and value is high (no manual step before checking
// exit decisions). Cooldown prevents double-firing when advisorBoot and the
// SIGNED_IN event (cloud sync pull) both trigger a refresh within seconds
// of each other — second call is a no-op.

const AUTO_REFRESH_COOLDOWN_MS = 60 * 1000;
let lastAutoRefreshAt = 0;

function scheduleAutoRefresh(delay = 300) {
  if (Date.now() - lastAutoRefreshAt < AUTO_REFRESH_COOLDOWN_MS) return;
  if (!scanData || watchlist.length === 0) return;
  setTimeout(() => {
    // Re-check at fire time; state may have changed during the delay
    if (!scanData || watchlist.length === 0) return;
    if (Date.now() - lastAutoRefreshAt < AUTO_REFRESH_COOLDOWN_MS) return;
    lastAutoRefreshAt = Date.now();
    refreshWatchlist();
  }, delay);
}

// ─── AUTH UI ────────────────────────────────────────────────────────────────

function renderAuthStatus() {
  const el = $('auth-status');
  if (!el) return;
  if (currentUser) {
    const count = watchlist.length;
    // Avatar from Google OAuth (Magic Link has no avatar → fallback to dot).
    // referrerpolicy is needed — without it Google's CDN returns 403 when the
    // request comes from a non-google.com origin.
    const avatar = currentUser.avatar
      ? `<img src="${currentUser.avatar}" class="auth-avatar" alt="" referrerpolicy="no-referrer" onerror="this.replaceWith(Object.assign(document.createElement('span'),{className:'auth-dot'}))">`
      : `<span class="auth-dot"></span>`;
    el.innerHTML = `
      <div class="auth-pill auth-pill-connected" onclick="openAuthModal('account')" title="חשבון ${currentUser.email}">
        ${avatar}
        <span class="auth-email">${currentUser.email}</span>
        <span class="auth-count" title="${count} מניות ברשימה">${count}</span>
      </div>`;
  } else {
    el.innerHTML = `
      <button class="auth-pill auth-pill-connect" onclick="openAuthModal('login')">
        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
        </svg>
        <span>התחבר לסנכרון</span>
      </button>`;
  }
}

function openAuthModal(mode) {
  const body = $('auth-body');
  const title = $('auth-title');
  if (!body || !title) return;

  if (mode === 'login') {
    title.textContent = 'התחברות לסנכרון';
    body.innerHTML = `
      <p class="auth-intro">הרשימה שלך תסונכרן אוטומטית בין מכשירים.</p>

      <button class="auth-google-btn" onclick="handleGoogleSignIn()">
        <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#FFC107" d="M43.611 20.083H42V20H24v8h11.303c-1.649 4.657-6.08 8-11.303 8c-6.627 0-12-5.373-12-12s5.373-12 12-12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C12.955 4 4 12.955 4 24s8.955 20 20 20s20-8.955 20-20c0-1.341-.138-2.65-.389-3.917z"/><path fill="#FF3D00" d="M6.306 14.691l6.571 4.819C14.655 15.108 18.961 12 24 12c3.059 0 5.842 1.154 7.961 3.039l5.657-5.657C34.046 6.053 29.268 4 24 4C16.318 4 9.656 8.337 6.306 14.691z"/><path fill="#4CAF50" d="M24 44c5.166 0 9.86-1.977 13.409-5.192l-6.19-5.238A11.91 11.91 0 0 1 24 36c-5.202 0-9.619-3.317-11.283-7.946l-6.522 5.025C9.505 39.556 16.227 44 24 44z"/><path fill="#1976D2" d="M43.611 20.083H42V20H24v8h11.303a12.04 12.04 0 0 1-4.087 5.571l.003-.002l6.19 5.238C36.971 39.205 44 34 44 24c0-1.341-.138-2.65-.389-3.917z"/></svg>
        <span>המשך עם Google</span>
      </button>

      <div class="auth-divider"><span>או</span></div>

      <form onsubmit="handleSignIn(event); return false" class="auth-form">
        <label class="auth-label">התחבר עם קישור במייל</label>
        <input type="email" id="auth-email-input" class="auth-input" placeholder="you@example.com" required autocomplete="email" dir="ltr">
        <button type="submit" class="auth-submit-secondary" id="auth-submit-btn">שלח קישור במייל</button>
        <div class="auth-note">⚠ Supabase מגביל ל-3 מיילים בשעה. Google מומלץ.</div>
        <div class="auth-msg" id="auth-msg"></div>
      </form>`;
  } else if (mode === 'account') {
    title.textContent = 'החשבון שלי';
    body.innerHTML = renderAccountView();
  }

  $('auth-overlay').classList.add('open');
  if (mode === 'login') setTimeout(() => $('auth-email-input')?.focus(), 100);
}

function closeAuthModal(e) {
  if (e && e.target.id !== 'auth-overlay') return;
  closeAuthModalDirect();
}
function closeAuthModalDirect() {
  $('auth-overlay').classList.remove('open');
}

async function handleSignIn(event) {
  event?.preventDefault();
  const input = $('auth-email-input');
  const btn   = $('auth-submit-btn');
  const msg   = $('auth-msg');
  if (!input || !btn || !msg) return;
  const email = input.value.trim();
  if (!email || !email.includes('@')) {
    msg.textContent = 'כתובת אימייל לא תקינה';
    msg.className = 'auth-msg auth-msg-err';
    return;
  }
  btn.disabled = true; btn.textContent = 'שולח...';
  msg.textContent = ''; msg.className = 'auth-msg';

  const { error } = await signInWithEmail(email);
  btn.disabled = false; btn.textContent = 'שלח קישור';

  if (error) {
    msg.textContent = `שגיאה: ${error}`;
    msg.className = 'auth-msg auth-msg-err';
  } else {
    msg.innerHTML = `<strong>נשלח!</strong> בדוק את תיבת הדואר (${email}) ולחץ על הקישור כדי להתחבר.`;
    msg.className = 'auth-msg auth-msg-ok';
  }
}

/** Build the HTML for the "החשבון שלי" modal body. Pulls together: user
    header (avatar/name/email), quick stats (count + avg score + signal
    distribution), smart alerts (actionable warnings), and the watchlist
    stock list with exit state + date added. All values come from in-memory
    state — no network calls. */
function renderAccountView() {
  // Assemble per-stock view objects with everything we need for display
  const items = watchlist.map(sym => {
    const stock = scanData?.stocks.find(x => x.sym === sym) || null;
    const exit  = stock ? computeExitSignal(sym) : null;
    const meta  = watchlistMeta[sym] || null;
    return { sym, stock, exit, meta };
  });

  const withSignal = items.filter(i => i.exit);
  const avgScore   = withSignal.length
    ? Math.round(withSignal.reduce((a,i) => a + (i.stock?.score || 0), 0) / withSignal.length)
    : null;
  const strongCount  = withSignal.filter(i => i.exit.state === 'strong').length;
  const cautionCount = withSignal.filter(i => i.exit.state === 'caution').length;
  const exitCount    = withSignal.filter(i => i.exit.state === 'exit').length;

  const alerts = generateSmartAlerts(items);

  // USER HEADER
  const avatarHtml = currentUser.avatar
    ? `<img src="${currentUser.avatar}" class="auth-user-avatar" alt="" referrerpolicy="no-referrer" onerror="this.style.display='none'">`
    : `<div class="auth-user-avatar-fallback">${(currentUser.email || '?')[0].toUpperCase()}</div>`;

  const header = `
    <div class="auth-user-hdr">
      ${avatarHtml}
      <div class="auth-user-info">
        ${currentUser.name ? `<div class="auth-user-name">${currentUser.name}</div>` : ''}
        <div class="auth-user-email" dir="ltr">${currentUser.email}</div>
      </div>
    </div>`;

  // QUICK STATS
  const stats = items.length === 0 ? '' : `
    <div class="auth-stats">
      <div class="auth-stat">
        <div class="auth-stat-val">${items.length}</div>
        <div class="auth-stat-lbl">מניות</div>
      </div>
      <div class="auth-stat">
        <div class="auth-stat-val">${avgScore ?? '—'}</div>
        <div class="auth-stat-lbl">ציון ממוצע</div>
      </div>
      <div class="auth-stat auth-stat-strong">
        <div class="auth-stat-val">${strongCount}</div>
        <div class="auth-stat-lbl">חזקות</div>
      </div>
      <div class="auth-stat auth-stat-exit">
        <div class="auth-stat-val">${exitCount || cautionCount}</div>
        <div class="auth-stat-lbl">${exitCount ? 'ליציאה' : 'שים לב'}</div>
      </div>
    </div>`;

  // SMART ALERTS
  const alertsHtml = alerts.length === 0 ? '' : `
    <div class="auth-section">
      <div class="auth-section-title">התראות חכמות</div>
      <div class="auth-alerts">
        ${alerts.map(a => `
          <div class="auth-alert auth-alert-${a.severity}">
            <div class="auth-alert-icon">${a.icon}</div>
            <div class="auth-alert-text">
              ${a.sym ? `<strong>${a.sym}</strong> ` : ''}${a.message}
            </div>
          </div>
        `).join('')}
      </div>
    </div>`;

  // STOCK LIST
  const stocksHtml = items.length === 0 ? `
    <div class="auth-empty">עדיין לא הוספת מניות. סמן מניות ברשימה מפאנל הפירוט.</div>
  ` : `
    <div class="auth-section">
      <div class="auth-section-title">הרשימה שלי (${items.length})</div>
      <div class="auth-stocks">
        ${items.map(i => {
          const sigLabel = i.exit ? { strong:'חזק', caution:'חלש', exit:'יציאה' }[i.exit.state] : '—';
          const sigClass = i.exit ? `auth-stock-sig-${i.exit.state}` : 'auth-stock-sig-unknown';
          const addedStr = i.meta?.addedAt ? relativeTimeHebrew(i.meta.addedAt) : '';
          const scoreStr = i.stock?.score != null ? `${i.stock.score}` : '—';
          return `
            <div class="auth-stock">
              <div class="auth-stock-main">
                <div class="auth-stock-sym">${i.sym}</div>
                <div class="auth-stock-name">${i.stock?.name || 'לא נסרק'}</div>
              </div>
              <div class="auth-stock-meta">
                ${addedStr ? `<span class="auth-stock-added">${addedStr}</span>` : ''}
                <span class="auth-stock-score">${scoreStr}</span>
                <span class="auth-stock-sig ${sigClass}">${sigLabel}</span>
              </div>
            </div>`;
        }).join('')}
      </div>
    </div>`;

  return `
    ${header}
    ${stats}
    ${alertsHtml}
    ${stocksHtml}
    <button class="auth-logout" onclick="handleSignOut()">התנתק</button>
  `;
}

/** Generate actionable alerts based on exit signals + score thresholds.
    Rules are intentionally conservative — alerts should be rare enough
    that the user pays attention when they appear, not numb to them. */
function generateSmartAlerts(items) {
  const alerts = [];
  const valid = items.filter(i => i.stock && i.exit);
  if (valid.length === 0) return alerts;

  // ─── WARNING ALERTS (per stock) ────────────────────────────────────────
  // Only the most important issue per stock to avoid duplication. Priority:
  // Y1 negative > MA40 broken > dropped from top.
  for (const i of valid) {
    if (i.stock.y1 != null && i.stock.y1 < 0) {
      alerts.push({
        sym: i.sym, severity: 'bad', icon: '⚠',
        message: `תשואה 12ח' שלילית (${fmtPct(i.stock.y1)}) — חוק Antonacci מחייב יציאה`
      });
    } else if (i.exit.signals.ma === false) {
      alerts.push({
        sym: i.sym, severity: 'bad', icon: '↓',
        message: `ירד מתחת ל-MA40 ($${fmt(i.exit.sma40)}) — שבירת מגמה לפי Weinstein`
      });
    } else if (i.stock.rank > EXIT_TOP_N) {
      alerts.push({
        sym: i.sym, severity: 'warn', icon: '▽',
        message: `דירוג #${i.stock.rank} — מחוץ לטופ ${EXIT_TOP_N}, המומנטום נחלש`
      });
    }
  }

  // ─── POSITIVE ALERTS ───────────────────────────────────────────────────
  // Only the leader (biggest 3M gainer), and only if it's meaningfully ahead
  const withM3 = valid.filter(i => i.stock.m3 != null);
  if (withM3.length >= 3) {
    const leader = withM3.slice().sort((a,b) => b.stock.m3 - a.stock.m3)[0];
    if (leader.stock.m3 > 30) {
      alerts.push({
        sym: leader.sym, severity: 'good', icon: '▲',
        message: `+${leader.stock.m3.toFixed(0)}% ב-3 חודשים — מוביל ברשימה שלך`
      });
    }
  }

  // Top-tier performer (rank ≤ 5 in the full universe, all signals OK)
  for (const i of valid) {
    if (i.exit.state === 'strong' && i.stock.rank <= 5) {
      alerts.push({
        sym: i.sym, severity: 'good', icon: '★',
        message: `דירוג #${i.stock.rank} מתוך ${scanData.universeSize} — מניה מובילה במדד`
      });
    }
  }

  // ─── META ALERTS (about the list as a whole) ───────────────────────────
  // Sector concentration: 60%+ in one sector and ≥3 stocks total
  const sectorCounts = {};
  valid.forEach(i => {
    const sec = i.stock.sectorName;
    if (sec) sectorCounts[sec] = (sectorCounts[sec] || 0) + 1;
  });
  const dominant = Object.entries(sectorCounts).sort((a,b) => b[1]-a[1])[0];
  if (dominant && valid.length >= 3 && dominant[1] / valid.length >= 0.6) {
    alerts.push({
      sym: null, severity: 'info', icon: '◈',
      message: `${dominant[1]} מתוך ${valid.length} מניותיך בסקטור ${dominant[0]} — ריכוז גבוה, שקול פיזור`
    });
  }

  return alerts;
}

/** Hebrew relative time formatter. "היום" / "אתמול" / "לפני 3 ימים" /
    "לפני 2 שבועות" / "לפני 5 חודשים" / "לפני שנה". Used in the account
    modal to show when each watchlist stock was added. */
function relativeTimeHebrew(iso) {
  const ts = new Date(iso).getTime();
  if (!ts || isNaN(ts)) return '';
  const mins = Math.floor((Date.now() - ts) / 60000);
  if (mins < 5)    return 'עכשיו';
  if (mins < 60)   return `לפני ${mins} דק׳`;
  const hours = Math.floor(mins / 60);
  if (hours < 24)  return hours === 1 ? 'לפני שעה' : `לפני ${hours} שעות`;
  const days = Math.floor(hours / 24);
  if (days === 1)  return 'אתמול';
  if (days < 7)    return `לפני ${days} ימים`;
  const weeks = Math.floor(days / 7);
  if (weeks < 4)   return weeks === 1 ? 'לפני שבוע' : `לפני ${weeks} שבועות`;
  const months = Math.floor(days / 30);
  if (months < 12) return months === 1 ? 'לפני חודש' : `לפני ${months} חודשים`;
  const years = Math.floor(days / 365);
  return years === 1 ? 'לפני שנה' : `לפני ${years} שנים`;
}

async function handleSignOut() {
  await signOut();
  closeAuthModalDirect();
}

async function handleGoogleSignIn() {
  const { error } = await signInWithGoogle();
  if (error) {
    const msg = $('auth-msg');
    if (msg) {
      msg.className = 'auth-msg auth-msg-err';
      msg.textContent = `שגיאה: ${error}. ודא ש-Google provider מופעל ב-Supabase.`;
    }
  }
  // On success, the browser redirects away to Google — no further UI work needed.
}

// ═══ WATCHLIST ═══

function toggleWatchlist(sym) {
  const idx = watchlist.indexOf(sym);
  const wasAdd = idx < 0;
  if (idx >= 0) {
    watchlist.splice(idx, 1);
    delete watchlistMeta[sym];   // clean up meta so account modal stays in sync
  } else {
    watchlist.push(sym);
    // pushSymbolToCloud will stamp addedAt; for logged-out users, stamp now
    if (!currentUser) watchlistMeta[sym] = { addedAt: new Date().toISOString() };
  }
  localStorage.setItem(WL_KEY, JSON.stringify(watchlist));

  // Cloud sync — fire-and-forget. Silently no-ops when not signed in.
  if (currentUser) {
    if (wasAdd) pushSymbolToCloud(sym);
    else        removeSymbolFromCloud(sym);
  }

  renderAuthStatus();              // count in pill changed
  renderWatchlist();
  if ($('dt-sym').textContent === sym && $('dt-overlay').classList.contains('open')) {
    openDetail(sym);
  }
  if (scanData) renderTable();
}

function renderWatchlist() {
  const strip = $('wl-strip');
  if (!scanData || watchlist.length === 0) {
    strip.innerHTML = '';
    return;
  }
  const items = watchlist.map(sym => {
    const s = scanData.stocks.find(x => x.sym === sym);
    if (!s) return '';
    const cls = s.y1 > 0 ? 'var(--green)' : 'var(--red)';
    return `
      <div class="wl-chip" onclick="openDetail('${s.sym}')">
        <span class="wl-sym">${s.sym}</span>
        <span class="wl-pct" style="color:${cls}">${fmtPct(s.y1)}</span>
        <span style="color:var(--dim);font-size:10px">· ${s.score}</span>
        <span class="wl-x" onclick="event.stopPropagation();toggleWatchlist('${s.sym}')">✕</span>
      </div>`;
  }).join('');
  strip.innerHTML = `<div class="wl-label">הרשימה שלי</div>${items}`;
}

// ═══ METHODOLOGY MODAL ═══
// `viewedMethodology` is separate from `currentMethodology` — it only controls
// which methodology's documentation is shown in the modal. Clicking an alternative
// inside the modal is a preview action, NOT a commit. To actually switch
// methodologies the user presses the "בחר במודל זה" button in the preview banner
// (or picks from the dropdown in the controls bar).
let viewedMethodology = null;

function openMethodology() {
  viewedMethodology = currentMethodology;
  renderMethodologyModal();
  $('mth-overlay').classList.add('open');
}
function closeMethodology(e) {
  if (e && e.target && e.target.id !== 'mth-overlay') return;
  closeMethodologyDirect();
}
function closeMethodologyDirect() { $('mth-overlay').classList.remove('open'); }

/**
 * Preview a different methodology's documentation without switching the app state.
 * Called by the alternative-methodology buttons at the bottom of the modal.
 */
function previewMethodology(key) {
  if (!METHODOLOGIES[key] || key === viewedMethodology) return;
  viewedMethodology = key;
  renderMethodologyModal();
  const body = $('mth-body');
  if (body) body.scrollTop = 0;
  const modal = document.querySelector('.mth-modal');
  if (modal) modal.scrollTop = 0;
}

/**
 * Regenerate modal body from METHODOLOGIES[viewedMethodology].
 * If the viewed methodology is different from the active one, shows a
 * preview banner with an "בחר במודל זה" CTA to commit.
 */
function renderMethodologyModal() {
  const viewed = viewedMethodology || currentMethodology;
  const meth = METHODOLOGIES[viewed];
  const title = $('mth-title');
  const body  = $('mth-body');
  if (!title || !body || !meth) return;

  title.textContent = `${meth.label} · ${meth.subtitle}`;

  const isPreview = viewed !== currentMethodology;
  const previewBanner = isPreview ? `
    <div class="mth-preview-banner">
      <div class="mth-preview-text">
        <div class="mth-preview-hd">תצוגה מקדימה</div>
        <div class="mth-preview-sub">המודל הפעיל כעת: <b>${METHODOLOGIES[currentMethodology].labelHe}</b> · ${METHODOLOGIES[currentMethodology].label}</div>
      </div>
      <button class="mth-activate" onclick="setMethodology('${viewed}')">בחר במודל זה</button>
    </div>
  ` : '';

  const factorRows = meth.factors.map(f => `
    <tr>
      <td><b>${f.label}</b> <span style="color:var(--dim);font-family:var(--mono);font-size:10px">· ${f.k}</span></td>
      <td style="color:var(--dim)">${f.desc}</td>
      <td style="text-align:left;font-family:var(--mono);font-weight:700;color:var(--green)">${f.weight}%</td>
    </tr>
  `).join('');

  // Alternatives: all methodologies except the one currently being viewed.
  // The active one (if different from viewed) gets an "active" marker.
  const alternatives = Object.entries(METHODOLOGIES)
    .filter(([k]) => k !== viewed)
    .map(([k, m]) => {
      const isActive = k === currentMethodology;
      return `
        <button class="mth-alt${isActive ? ' mth-alt-active' : ''}" onclick="previewMethodology('${k}')">
          ${isActive ? '<span class="mth-alt-badge">פעיל</span>' : ''}
          <div class="mth-alt-title">${m.labelHe} <span class="mth-alt-title-en">· ${m.label}</span></div>
          <div class="mth-alt-desc">${m.desc}</div>
        </button>
      `;
    }).join('');

  body.innerHTML = `
    ${previewBanner}
    <p>${meth.theory}</p>

    <div class="mth-best">
      <div class="mth-best-label">עובד הכי טוב ב:</div>
      <div class="mth-best-val">${meth.bestWhen}</div>
    </div>

    <h4>הפקטורים של המודל</h4>
    <table class="mth-factors">
      <thead>
        <tr><th>פקטור</th><th>מה הוא מודד</th><th>משקל</th></tr>
      </thead>
      <tbody>${factorRows}</tbody>
    </table>

    <h4>חישוב הציון</h4>
    <p>כל פקטור מתורגם ל-<b>Percentile Rank</b> מול כלל המניות בסריקה (0-100). הציון הסופי הוא ממוצע משוקלל — יתרון חשוב: הציון מתאים אוטומטית למצב השוק (אם כולם יורדים, הטובים ביותר עדיין יקבלו ציון גבוה).</p>

    <div class="mth-warning">
      <b>חשוב להבין:</b> המודל הוא technical בלבד — הוא לא יודע אם החברה רווחית, כמה היא שווה, או אם יש קטליזטור קרב. מניה יכולה לקבל 95/100 ולקרוס אחרי earnings. זה דירוג של חוזק טכני, לא של ערך פונדמנטלי.
    </div>

    <h4>מתודולוגיות אחרות</h4>
    <p style="color:var(--dim);font-size:12px;margin-top:-4px">לחץ על מודל כדי לקרוא על הפקטורים והתיאוריה — ללא החלפה בפועל. כדי להפעיל, השתמש ב-<b>בחר במודל זה</b> שמופיע בראש המסך, או בתפריט "מודל" בשורת הבקרה.</p>
    <div class="mth-alts">${alternatives}</div>
  `;
}

// ESC closes panels
document.addEventListener('keydown', e => {
  if (e.key === 'Escape') {
    $('dt-overlay').classList.remove('open');
    $('mth-overlay').classList.remove('open');
    closeMobileMenu();
  }
});

  // ── END advisor.html inline script ──

  // Expose onclick-handler functions to window so inline
  // onclick="runScan()" etc. in the HTML can find them.
  // Skipped intentionally: showScreen, startMarketClock,
  // toggleMobileMenu, closeMobileMenu — these already exist as
  // globals in app.js and we must NOT overwrite those.
  Object.assign(window, {
    runScan, setMinScore, setView, setUniverse, setMethodology, previewMethodology,
    toggleCdd, selectSector, sortBy, applyFilters,
    openMethodology, closeMethodology, closeMethodologyDirect,
    openDetail, closeDetail, closeDetailDirect,
    toggleWatchlist, refreshWatchlist,
    openAuthModal, closeAuthModal, closeAuthModalDirect,
    handleSignIn, handleSignOut, handleGoogleSignIn,
    initCloudSync
  });

  window.initAdvisor = function(){
    if (window.__advisorInited) return;
    window.__advisorInited = true;
    try { advisorBoot(); } catch(e){ console.error(e); }
  };
})();

/* ──────────── [6] SECTOR PERFORMANCE REWRITE ──────────── */

/* ═══════════════════════════════════════════════════════════
   SECTOR PERFORMANCE TABLE — clean rewrite (v2)
   ───────────────────────────────────────────────────────────
   Why rewrite:
     - Original used inline onclick handlers with string interpolation
     - MACRO column injected raw HTML from getSectorMacroTd() which
       could produce unbalanced tags and break the row
     - Cell count between header / data rows / avg row was fragile
       (avg row had 6 period cells + 4 empty fillers instead of a
       clean, column-keyed structure)
     - Single giant template literal — hard to debug when one cell
       errored the whole table went blank

   New design:
     - Column config array drives EVERYTHING (header, data, avg row)
       So header, body, and avg row are always column-aligned.
     - Per-cell try/catch: a bad value produces "–" instead of a
       broken row.
     - Event delegation: ONE click handler on the tbody reads
       data-sym from the clicked <tr>.
     - MACRO cell uses DOM methods (no innerHTML injection) so
       malformed macro data can't corrupt the table.
   ─────────────────────────────────────────────────────────── */
(function(){
  "use strict";

  // Column definitions. Each column knows:
  //   key   — identifier (for debugging / data-col attribute)
  //   label — header text
  //   get   — (sym, q, h) → number | null  (data accessor)
  //   cls   — (value) → CSS class for the cell
  //   fmt   — (value) → display text
  //   avg   — how this column participates in the footer:
  //             'mean'    = arithmetic mean of sector values
  //             'skip'    = footer cell is blank
  //             'overall' = mean-of-means across period cols
  const COLS = [
    {
      key:'sector', label:'SECTOR', isSector:true,
      cls: () => 'sec-cell',
      avg: 'label' // footer shows "ממוצע סקטורים"
    },
    { key:'d1',   label:'1D',  get:(s,q,h) => q.d1,  cls:v=>sectorCellCls(v), fmt:pct, avg:'mean' },
    { key:'w1',   label:'1W',  get:(s,q,h) => h.w1,  cls:v=>sectorCellCls(v), fmt:pct, avg:'mean' },
    { key:'m1',   label:'1M',  get:(s,q,h) => h.m1,  cls:v=>sectorCellCls(v), fmt:pct, avg:'mean' },
    { key:'m3',   label:'3M',  get:(s,q,h) => h.m3,  cls:v=>sectorCellCls(v), fmt:pct, avg:'mean' },
    { key:'m6',   label:'6M',  get:(s,q,h) => h.m6,  cls:v=>sectorCellCls(v), fmt:pct, avg:'mean' },
    { key:'y1',   label:'1Y',  get:(s,q,h) => h.y1,  cls:v=>sectorCellCls(v), fmt:pct, avg:'mean' },
    {
      key:'hi52', label:'52W HIGH',
      get:(s,q,h) => h.fromHi,
      cls: v => v==null ? 'dim' : 'hi52',
      fmt: v => v==null ? '–' : pct(v),
      avg: 'skip'
    },
    {
      key:'lo52', label:'52W LOW',
      get:(s,q,h) => h.fromLo,
      cls: v => v==null ? 'dim' : 'lo52',
      fmt: v => v==null ? '–' : pct(v),
      avg: 'skip'
    },
    {
      key:'vol',  label:'VOL',
      get: (s,q,h) => {
        const t = q.vol, a = h.avgVol;
        if (!t || !a || a <= 0) return null;
        return t / a; // ratio
      },
      cls: v => {
        if (v == null) return 'dim';
        if (v > 1.5) return 'vol-high';
        if (v < 0.7) return 'vol-low';
        return 'vol-norm';
      },
      fmt: v => {
        if (v == null) return '–';
        const i = v > 1.5 ? '▲▲' : v > 1.1 ? '▲' : v < 0.6 ? '▼▼' : v < 0.9 ? '▼' : '●';
        return i + ' ' + Math.round(v * 100) + '%';
      },
      avg: 'skip'
    },
    {
      key:'macro', label:'MACRO',
      // The macro cell is built via a dedicated safe renderer;
      // no getter / fmt — cellFactory handles it.
      cellFactory: (sym) => buildMacroCell(sym),
      avg: 'skip'
    },
    {
      key:'avg', label:'AVG',
      // Row-level mean across period columns (d1..y1), NOT from h.
      get: (s,q,h) => {
        const vals = [q.d1, h.w1, h.m1, h.m3, h.m6, h.y1]
          .filter(v => v != null && !isNaN(v));
        return vals.length ? vals.reduce((a,b)=>a+b,0) / vals.length : null;
      },
      cls: v => sectorCellCls(v),
      fmt: pct,
      avg: 'overall'
    }
  ];

  // Reuse global cellCls — but guard against it not existing.
  function sectorCellCls(v){
    if (typeof cellCls === 'function') return cellCls(v);
    if (v == null || isNaN(v)) return 'cz';
    if (v >  5) return 'c3'; if (v >  2) return 'c2'; if (v >  0) return 'c1';
    if (v < -5) return 'm3'; if (v < -2) return 'm2'; if (v <  0) return 'm1';
    return 'cz';
  }

  // Build a TD for the MACRO column without using innerHTML on raw
  // HTML strings. If getSectorMacroTd exists (legacy helper), parse
  // its output safely. Otherwise show a dash.
  function buildMacroCell(sym){
    const td = document.createElement('td');
    td.className = 'macro-cell';
    if (typeof getSectorMacroTd !== 'function') {
      td.textContent = '–';
      td.style.color = 'var(--dim)';
      return td;
    }
    const raw = getSectorMacroTd(sym) || '';
    // Legacy helper returns a full <td>...</td> string. Extract inner
    // content via a DocumentFragment parse, then adopt its children.
    try {
      const tmpl = document.createElement('template');
      tmpl.innerHTML = raw.trim();
      const firstTd = tmpl.content.querySelector('td');
      if (firstTd) {
        // Copy over its children and class
        if (firstTd.className) td.className += ' ' + firstTd.className;
        while (firstTd.firstChild) td.appendChild(firstTd.firstChild);
      } else {
        td.textContent = '–';
        td.style.color = 'var(--dim)';
      }
    } catch(e){
      td.textContent = '–';
      td.style.color = 'var(--dim)';
    }
    return td;
  }

  // Build one sector <tr>. Uses DOM methods, not string concat,
  // to prevent any HTML injection from sector data or macro output.
  function buildRow(s){
    const q = (typeof qmap !== 'undefined' && qmap[s.sym])   || {};
    const h = (typeof histMap !== 'undefined' && histMap[s.sym]) || {};
    const tr = document.createElement('tr');
    tr.dataset.sym = s.sym;
    tr.dataset.name = s.name;
    tr.title = 'לחץ לראות אחזקות';
    tr.style.cursor = 'pointer';

    for (const col of COLS) {
      let td;
      if (col.isSector) {
        td = document.createElement('td');
        td.className = 'sec-cell';
        td.appendChild(document.createTextNode(s.name + ' '));
        const span = document.createElement('span');
        span.className = 'sym';
        span.textContent = s.sym;
        td.appendChild(span);
      } else if (col.cellFactory) {
        td = col.cellFactory(s.sym);
      } else {
        td = document.createElement('td');
        let val = null;
        try { val = col.get(s, q, h); } catch(e){ val = null; }
        td.className = col.cls(val);
        td.textContent = col.fmt(val);
      }
      td.dataset.col = col.key;
      tr.appendChild(td);
    }
    return tr;
  }

  // Footer (averages) row.
  function buildAvgRow(sectorsData){
    const tr = document.createElement('tr');
    tr.className = 'avgrow';

    // Pre-compute means for each "mean" column and the "overall" col.
    const periodMeans = {};
    for (const col of COLS) {
      if (col.avg === 'mean') {
        const vals = sectorsData.map(x => {
          try { return col.get(x.s, x.q, x.h); } catch(e){ return null; }
        }).filter(v => v != null && !isNaN(v));
        periodMeans[col.key] = vals.length
          ? vals.reduce((a,b)=>a+b,0) / vals.length
          : null;
      }
    }
    // Overall = mean of periodMeans (already mean-of-means → simpler).
    const periodMeanVals = Object.values(periodMeans)
      .filter(v => v != null && !isNaN(v));
    const overall = periodMeanVals.length
      ? periodMeanVals.reduce((a,b)=>a+b,0) / periodMeanVals.length
      : null;

    for (const col of COLS) {
      const td = document.createElement('td');
      td.dataset.col = col.key;
      if (col.avg === 'label') {
        td.className = 'sec-cell';
        td.textContent = 'ממוצע סקטורים';
      } else if (col.avg === 'mean') {
        const v = periodMeans[col.key];
        td.className = sectorCellCls(v);
        td.textContent = pct(v);
      } else if (col.avg === 'overall') {
        td.className = sectorCellCls(overall);
        const b = document.createElement('b');
        b.textContent = pct(overall);
        td.appendChild(b);
      } else {
        // 'skip' — empty cell
      }
      tr.appendChild(td);
    }
    return tr;
  }

  // Render a loading skeleton. Uses the column count derived from
  // COLS so it is always in sync with the header.
  function renderSkeleton(){
    const tbody = document.getElementById('sector-tbody');
    if (!tbody) return;
    tbody.innerHTML = '';
    const skCell = () => {
      const td = document.createElement('td');
      td.className = 'lc';
      td.innerHTML = '&nbsp;';
      return td;
    };
    const SECTORS_LOCAL = (typeof SECTORS !== 'undefined') ? SECTORS : [];
    for (const s of SECTORS_LOCAL) {
      const tr = document.createElement('tr');
      tr.dataset.sym = s.sym;
      tr.dataset.name = s.name;
      tr.style.cursor = 'pointer';
      for (const col of COLS) {
        if (col.isSector) {
          const td = document.createElement('td');
          td.className = 'sec-cell';
          td.appendChild(document.createTextNode(s.name + ' '));
          const span = document.createElement('span');
          span.className = 'sym';
          span.textContent = s.sym;
          td.appendChild(span);
          tr.appendChild(td);
        } else {
          tr.appendChild(skCell());
        }
      }
      tbody.appendChild(tr);
    }
    // Avg row skeleton
    const avgTr = document.createElement('tr');
    avgTr.className = 'avgrow';
    for (const col of COLS) {
      if (col.isSector) {
        const td = document.createElement('td');
        td.className = 'sec-cell';
        td.textContent = 'ממוצע סקטורים';
        avgTr.appendChild(td);
      } else {
        avgTr.appendChild(skCell());
      }
    }
    tbody.appendChild(avgTr);
    ensureClickHandler(tbody);
  }

  // Full render with live data.
  function renderFull(){
    const tbody = document.getElementById('sector-tbody');
    if (!tbody) return;
    const SECTORS_LOCAL = (typeof SECTORS !== 'undefined') ? SECTORS : [];

    // Build all the per-sector row data once (so avg row can reuse it).
    const sectorsData = SECTORS_LOCAL.map(s => ({
      s,
      q: (typeof qmap !== 'undefined' && qmap[s.sym])   || {},
      h: (typeof histMap !== 'undefined' && histMap[s.sym]) || {}
    }));

    // Use DocumentFragment so we only touch the DOM once.
    const frag = document.createDocumentFragment();
    for (const s of SECTORS_LOCAL) frag.appendChild(buildRow(s));
    frag.appendChild(buildAvgRow(sectorsData));

    tbody.innerHTML = '';
    tbody.appendChild(frag);
    ensureClickHandler(tbody);
  }

  // Event delegation on the tbody — safer than inline onclick="..."
  function ensureClickHandler(tbody){
    if (tbody.__sectorClickInstalled) return;
    tbody.__sectorClickInstalled = true;
    tbody.addEventListener('click', (e) => {
      const tr = e.target.closest('tr[data-sym]');
      if (!tr) return;
      if (tr.classList.contains('avgrow')) return;
      const sym = tr.dataset.sym;
      const name = tr.dataset.name;
      if (typeof openSectorModal === 'function') {
        try { openSectorModal(sym, name); } catch(err){ console.error(err); }
      }
    });
  }

  // Overwrite the global render functions used by app.js init flow.
  window.renderSectorsWithSkeleton = renderSkeleton;
  window.renderSectors = renderFull;
})();

/* ──────────── [7] ROUTER ──────────── */

(function(){
  "use strict";
  const VIEWS = ['dashboard', 'macro', 'advisor'];

  function currentRoute(){
    const h = (location.hash || '').replace(/^#\/?/, '');
    return VIEWS.includes(h) ? h : 'dashboard';
  }

  function applyRoute(){
    const r = currentRoute();
    // Show / hide views
    VIEWS.forEach(v => {
      const el = document.getElementById('view-' + v);
      if (!el) return;
      if (v === r) el.classList.add('active');
      else          el.classList.remove('active');
    });
    // Update nav link active-state
    document.querySelectorAll('[data-route]').forEach(a => {
      a.classList.toggle('active', a.dataset.route === r);
    });
    document.body.dataset.route = r;

    // Cloud sync boots on ANY route — needed because OAuth redirects return to
    // the root URL regardless of which tab the user started from. Without this,
    // signing in from the advisor tab and landing back on the dashboard tab
    // would never hydrate the session. The function is idempotent.
    if (typeof window.initCloudSync === 'function') {
      try { window.initCloudSync(); } catch(e){ console.error('initCloudSync:', e); }
    }

    // Lazy init for sub-modules
    if (r === 'macro' && typeof window.initMacro === 'function') {
      try { window.initMacro(); } catch(e){ console.error('initMacro:', e); }
    }
    if (r === 'advisor' && typeof window.initAdvisor === 'function') {
      try { window.initAdvisor(); } catch(e){ console.error('initAdvisor:', e); }
    }
  }

  window.addEventListener('hashchange', applyRoute);
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', applyRoute);
  } else {
    applyRoute();
  }

  // Expose a helper for programmatic navigation.
  window.navigate = function(route){
    location.hash = '#/' + route;
  };
})();
