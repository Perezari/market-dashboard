// ============================================================
//  etf-holdings.js — נתוני אחזקות ETF סקטוריאליות
//  מקור: SPDR / State Street • Q1 2025
//  לעדכון: שנה את המשקלים (w) בהתאם לדוח הרבעוני החדש
//  שדות: s = סמל, n = שם, w = משקל באחוזים
// ============================================================

const ETF_HOLDINGS = {
  XLK: [
    {s:'NVDA',n:'NVIDIA',w:23.1},{s:'MSFT',n:'Microsoft',w:20.8},{s:'AAPL',n:'Apple',w:18.4},
    {s:'AVGO',n:'Broadcom',w:4.9},{s:'ORCL',n:'Oracle',w:3.6},{s:'AMD',n:'AMD',w:2.4},
    {s:'NOW',n:'ServiceNow',w:2.1},{s:'PLTR',n:'Palantir',w:1.9},{s:'CRM',n:'Salesforce',w:1.7},
    {s:'CSCO',n:'Cisco',w:1.5},{s:'ACN',n:'Accenture',w:1.4},{s:'IBM',n:'IBM',w:1.2},
    {s:'ADBE',n:'Adobe',w:1.1},{s:'QCOM',n:'Qualcomm',w:1.0},{s:'TXN',n:'Texas Instruments',w:0.9},
    {s:'INTU',n:'Intuit',w:0.8},{s:'MU',n:'Micron',w:0.7},{s:'AMAT',n:'Applied Materials',w:0.7},
    {s:'LRCX',n:'Lam Research',w:0.6},{s:'ADI',n:'Analog Devices',w:0.5}
  ],
  XLF: [
    {s:'BRK/B',n:'Berkshire Hathaway',w:13.2},{s:'JPM',n:'JPMorgan Chase',w:12.8},{s:'V',n:'Visa',w:8.4},
    {s:'MA',n:'Mastercard',w:6.9},{s:'BAC',n:'Bank of America',w:4.1},{s:'WFC',n:'Wells Fargo',w:3.8},
    {s:'GS',n:'Goldman Sachs',w:3.2},{s:'MS',n:'Morgan Stanley',w:2.9},{s:'SPGI',n:'S&P Global',w:2.7},
    {s:'BLK',n:'BlackRock',w:2.5},{s:'AXP',n:'American Express',w:2.3},{s:'C',n:'Citigroup',w:2.0},
    {s:'PGR',n:'Progressive',w:1.9},{s:'COF',n:'Capital One',w:1.7},{s:'ICE',n:'ICE',w:1.5},
    {s:'CME',n:'CME Group',w:1.4},{s:'CB',n:'Chubb',w:1.3},{s:'MMC',n:'Marsh & McLennan',w:1.1},
    {s:'SCHW',n:'Charles Schwab',w:1.0},{s:'USB',n:'U.S. Bancorp',w:0.9}
  ],
  XLE: [
    {s:'XOM',n:'ExxonMobil',w:23.4},{s:'CVX',n:'Chevron',w:15.2},{s:'COP',n:'ConocoPhillips',w:8.1},
    {s:'EOG',n:'EOG Resources',w:5.3},{s:'SLB',n:'Schlumberger',w:4.2},{s:'MPC',n:'Marathon Petroleum',w:3.8},
    {s:'PSX',n:'Phillips 66',w:3.4},{s:'VLO',n:'Valero Energy',w:3.1},{s:'OXY',n:'Occidental',w:2.8},
    {s:'HAL',n:'Halliburton',w:2.5},{s:'DVN',n:'Devon Energy',w:2.2},{s:'FANG',n:'Diamondback Energy',w:2.0},
    {s:'HES',n:'Hess',w:1.9},{s:'BKR',n:'Baker Hughes',w:1.7},{s:'TRGP',n:'Targa Resources',w:1.5},
    {s:'WMB',n:'Williams Companies',w:1.4},{s:'KMI',n:'Kinder Morgan',w:1.2},{s:'OKE',n:'ONEOK',w:1.1},
    {s:'EQT',n:'EQT Corp',w:0.9},{s:'MRO',n:'Marathon Oil',w:0.8}
  ],
  XLV: [
    {s:'UNH',n:'UnitedHealth',w:12.5},{s:'LLY',n:'Eli Lilly',w:11.8},{s:'ABBV',n:'AbbVie',w:8.2},
    {s:'JNJ',n:'Johnson & Johnson',w:7.4},{s:'MRK',n:'Merck',w:6.1},{s:'TMO',n:'Thermo Fisher',w:4.3},
    {s:'ABT',n:'Abbott Labs',w:3.9},{s:'DHR',n:'Danaher',w:3.5},{s:'ISRG',n:'Intuitive Surgical',w:3.2},
    {s:'BSX',n:'Boston Scientific',w:2.8},{s:'SYK',n:'Stryker',w:2.6},{s:'VRTX',n:'Vertex Pharma',w:2.3},
    {s:'REGN',n:'Regeneron',w:2.1},{s:'CI',n:'Cigna',w:1.9},{s:'ELV',n:'Elevance Health',w:1.7},
    {s:'HUM',n:'Humana',w:1.5},{s:'ZTS',n:'Zoetis',w:1.4},{s:'MRNA',n:'Moderna',w:1.2},
    {s:'MCK',n:'McKesson',w:1.1},{s:'A',n:'Agilent',w:0.9}
  ],
  XLC: [
    {s:'META',n:'Meta Platforms',w:22.6},{s:'GOOGL',n:'Alphabet A',w:15.3},{s:'GOOG',n:'Alphabet C',w:13.1},
    {s:'NFLX',n:'Netflix',w:7.8},{s:'T',n:'AT&T',w:4.2},{s:'VZ',n:'Verizon',w:3.8},
    {s:'CHTR',n:'Charter Comm',w:3.1},{s:'TMUS',n:'T-Mobile',w:2.9},{s:'EA',n:'Electronic Arts',w:2.4},
    {s:'TTWO',n:'Take-Two Interactive',w:1.8},{s:'LYV',n:'Live Nation',w:1.6},{s:'IPG',n:'Interpublic',w:1.4},
    {s:'OMC',n:'Omnicom',w:1.3},{s:'MTCH',n:'Match Group',w:1.1},{s:'PARA',n:'Paramount',w:0.9},
    {s:'WBD',n:'Warner Bros Discovery',w:0.8},{s:'FOXA',n:'Fox Corp A',w:0.7},{s:'DIS',n:'Disney',w:0.6}
  ],
  XLI: [
    {s:'RTX',n:'RTX Corp (Raytheon)',w:6.8},{s:'HON',n:'Honeywell',w:6.2},{s:'CAT',n:'Caterpillar',w:5.9},
    {s:'GE',n:'GE Aerospace',w:5.4},{s:'UNP',n:'Union Pacific',w:4.8},{s:'DE',n:'John Deere',w:4.3},
    {s:'ETN',n:'Eaton',w:4.0},{s:'LMT',n:'Lockheed Martin',w:3.7},{s:'UPS',n:'UPS',w:3.4},
    {s:'PH',n:'Parker Hannifin',w:3.1},{s:'ITW',n:'Illinois Tool Works',w:2.9},{s:'WM',n:'Waste Management',w:2.7},
    {s:'EMR',n:'Emerson Electric',w:2.5},{s:'NOC',n:'Northrop Grumman',w:2.3},{s:'GD',n:'General Dynamics',w:2.1},
    {s:'CSX',n:'CSX',w:2.0},{s:'NSC',n:'Norfolk Southern',w:1.9},{s:'FDX',n:'FedEx',w:1.7},
    {s:'AXON',n:'Axon Enterprise',w:1.5},{s:'VRSK',n:'Verisk',w:1.3}
  ],
  XLB: [
    {s:'LIN',n:'Linde',w:17.8},{s:'SHW',n:'Sherwin-Williams',w:8.4},{s:'FCX',n:'Freeport-McMoRan',w:7.2},
    {s:'APD',n:'Air Products',w:6.1},{s:'ECL',n:'Ecolab',w:5.3},{s:'NEM',n:'Newmont',w:4.8},
    {s:'NUE',n:'Nucor',w:4.2},{s:'ALB',n:'Albemarle',w:3.6},{s:'PPG',n:'PPG Industries',w:3.3},
    {s:'DD',n:'DuPont',w:3.0},{s:'VMC',n:'Vulcan Materials',w:2.8},{s:'MLM',n:'Martin Marietta',w:2.6},
    {s:'CE',n:'Celanese',w:2.3},{s:'MOS',n:'Mosaic',w:2.1},{s:'IFF',n:'Intl Flavors',w:1.9},
    {s:'BALL',n:'Ball Corp',w:1.7},{s:'AVY',n:'Avery Dennison',w:1.5},{s:'FMC',n:'FMC Corp',w:1.3},
    {s:'CF',n:'CF Industries',w:1.2},{s:'CTVA',n:'Corteva',w:1.0}
  ],
  XLRE: [
    {s:'AMT',n:'American Tower',w:11.2},{s:'PLD',n:'Prologis',w:10.5},{s:'CCI',n:'Crown Castle',w:7.8},
    {s:'EQIX',n:'Equinix',w:7.3},{s:'PSA',n:'Public Storage',w:5.9},{s:'SBAC',n:'SBA Comm',w:4.8},
    {s:'O',n:'Realty Income',w:4.5},{s:'DLR',n:'Digital Realty',w:4.2},{s:'WY',n:'Weyerhaeuser',w:3.9},
    {s:'EXR',n:'Extra Space Storage',w:3.6},{s:'SPG',n:'Simon Property',w:3.3},{s:'AVB',n:'AvalonBay',w:3.0},
    {s:'EQR',n:'Equity Residential',w:2.8},{s:'VTR',n:'Ventas',w:2.6},{s:'ARE',n:'Alexandria RE',w:2.4},
    {s:'ESS',n:'Essex Property',w:2.2},{s:'MAA',n:'Mid-America Apt',w:2.0},{s:'INVH',n:'Invitation Homes',w:1.8},
    {s:'VICI',n:'VICI Properties',w:1.6},{s:'HST',n:'Host Hotels',w:1.4}
  ],
  XLU: [
    {s:'NEE',n:'NextEra Energy',w:16.4},{s:'SO',n:'Southern Company',w:7.8},{s:'DUK',n:'Duke Energy',w:7.2},
    {s:'SRE',n:'Sempra',w:5.9},{s:'AEP',n:'American Electric Power',w:5.4},{s:'EXC',n:'Exelon',w:5.1},
    {s:'XEL',n:'Xcel Energy',w:4.8},{s:'ED',n:'Consolidated Edison',w:4.3},{s:'ETR',n:'Entergy',w:3.9},
    {s:'ES',n:'Eversource',w:3.6},{s:'WEC',n:'WEC Energy',w:3.3},{s:'AWK',n:'American Water Works',w:3.0},
    {s:'CMS',n:'CMS Energy',w:2.8},{s:'DTE',n:'DTE Energy',w:2.6},{s:'AES',n:'AES Corp',w:2.4},
    {s:'NI',n:'NiSource',w:2.2},{s:'AEE',n:'Ameren',w:2.0},{s:'LNT',n:'Alliant Energy',w:1.8},
    {s:'EVRG',n:'Evergy',w:1.6},{s:'PNW',n:'Pinnacle West',w:1.4}
  ],
  XLP: [
    {s:'PG',n:'Procter & Gamble',w:16.2},{s:'KO',n:'Coca-Cola',w:11.8},{s:'PEP',n:'PepsiCo',w:11.4},
    {s:'COST',n:'Costco',w:10.9},{s:'PM',n:'Philip Morris',w:6.3},{s:'MO',n:'Altria',w:4.8},
    {s:'MDLZ',n:'Mondelez',w:4.2},{s:'CL',n:'Colgate',w:3.7},{s:'KMB',n:'Kimberly-Clark',w:3.3},
    {s:'STZ',n:'Constellation Brands',w:3.0},{s:'GIS',n:'General Mills',w:2.8},{s:'SYY',n:'Sysco',w:2.6},
    {s:'CAG',n:'Conagra Brands',w:2.4},{s:'HRL',n:'Hormel Foods',w:2.2},{s:'KHC',n:'Kraft Heinz',w:2.0},
    {s:'TSN',n:'Tyson Foods',w:1.8},{s:'K',n:'Kellanova',w:1.6},{s:'CPB',n:'Campbell Soup',w:1.4},
    {s:'CHD',n:'Church & Dwight',w:1.2},{s:'CLX',n:'Clorox',w:1.0}
  ],
  XLY: [
    {s:'AMZN',n:'Amazon',w:24.8},{s:'TSLA',n:'Tesla',w:17.2},{s:'HD',n:'Home Depot',w:8.6},
    {s:'MCD',n:"McDonald's",w:5.4},{s:'NKE',n:'Nike',w:4.1},{s:'LOW',n:"Lowe's",w:3.8},
    {s:'SBUX',n:'Starbucks',w:3.5},{s:'TJX',n:'TJX Companies',w:3.2},{s:'BKNG',n:'Booking Holdings',w:2.9},
    {s:'F',n:'Ford Motor',w:2.6},{s:'GM',n:'General Motors',w:2.4},{s:'YUM',n:'Yum! Brands',w:2.2},
    {s:'ORLY',n:"O'Reilly Auto",w:2.0},{s:'AZO',n:'AutoZone',w:1.8},{s:'APTV',n:'Aptiv',w:1.6},
    {s:'DHI',n:'D.R. Horton',w:1.4},{s:'LEN',n:'Lennar',w:1.3},{s:'PHM',n:'PulteGroup',w:1.2},
    {s:'CCL',n:'Carnival',w:1.1},{s:'RCL',n:'Royal Caribbean',w:1.0}
  ]
};
