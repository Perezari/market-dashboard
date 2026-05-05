# StockPulse Brief Worker — מדריך פריסה

מערכת דוחות AI יומיים ושבועיים על שוק המניות האמריקאי, מבוססת Claude Opus 4.7 ו-Cloudflare Workers.

## מה צריך פעם אחת לפני הפריסה

1. **חשבון Cloudflare** (יש לך — אותו חשבון שמריץ את ה-Worker הקיים `market.ari-perez25-06.workers.dev`).
2. **חשבון Anthropic API** עם billing מוגדר. אם עוד אין:
   - היכנס ל-[https://console.anthropic.com](https://console.anthropic.com)
   - **Settings** → **Billing** → טען לפחות $5 לארנק
   - **API Keys** → **Create Key** → תן לו שם `stockpulse-brief` → העתק את המפתח (נראה כמו `sk-ant-api03-...`)
3. **Wrangler CLI** מותקן (חלק מ-`@cloudflare/workers-sdk`):
   ```bash
   npm install -g wrangler
   wrangler --version
   ```
   אם הפלט הוא מספר גרסה — אתה מוכן.
4. **התחברות ל-Cloudflare**:
   ```bash
   wrangler login
   ```
   ייפתח דפדפן עם בקשת אישור — לחץ **Allow**.

---

## פריסה (מתוך תיקיית `brief-worker/`)

מתחיל ב:
```bash
cd brief-worker
```

### שלב 1 — צור KV Namespace לשמירת הדוחות

```bash
wrangler kv namespace create BRIEFS_KV
```

הפלט ייראה כך:
```
🌀 Creating namespace with title "stockpulse-brief-worker-BRIEFS_KV"
✨ Success!
Add the following to your configuration file in your kv_namespaces array:
[[kv_namespaces]]
binding = "BRIEFS_KV"
id = "abc123def456..."
```

**העתק את ה-`id`.**

### שלב 2 — עדכן את `wrangler.toml`

פתח את [wrangler.toml](wrangler.toml) והחלף `REPLACE_WITH_YOUR_KV_ID` ב-id שקיבלת:

```toml
[[kv_namespaces]]
binding = "BRIEFS_KV"
id = "abc123def456..."
```

### שלב 3 — הוסף Secrets

```bash
# מפתח Anthropic API (מהשלב הקודם)
wrangler secret put ANTHROPIC_API_KEY
# יישאל "Enter a secret value:" — הדבק את המפתח שמתחיל ב-sk-ant-...

# סוד פנימי לאבטחת ה-regenerate endpoints (יוצרים מחרוזת אקראית כלשהי)
wrangler secret put CRON_SECRET
# הדבק מחרוזת אקראית של 32+ תווים. דוגמה ליצירה:
#   PowerShell:  -join ((48..57)+(65..90)+(97..122) | Get-Random -Count 40 | %{[char]$_})
#   Git Bash:    openssl rand -hex 32
```

### שלב 4 — Deploy

```bash
wrangler deploy
```

הפלט יראה:
```
✨ Success! Uploaded 1 Worker
   stockpulse-brief-worker.YOUR-SUBDOMAIN.workers.dev
✨ Cron Triggers
  - 0 22 * * 1-5  (next: ...)
  - 0 19 * * 0    (next: ...)
```

**העתק את ה-URL** — זה ה-Brief Worker URL שתשים אחר כך ב-StockPulse.

### שלב 5 — בדיקה ראשונית

```bash
# בדיקת בריאות
curl https://stockpulse-brief-worker.YOUR-SUBDOMAIN.workers.dev/health
# תוצאה צפויה: {"ok":true,"time":"2026-..."}

# יצירה ידנית של דוח יומי ראשון (אחרת תצטרך לחכות לקרון)
curl -X POST https://stockpulse-brief-worker.YOUR-SUBDOMAIN.workers.dev/brief/daily/regenerate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"

# קבל את הדוח
curl https://stockpulse-brief-worker.YOUR-SUBDOMAIN.workers.dev/brief/daily
```

הקריאה השנייה צריכה לקחת 30-60 שניות (Claude עובד) ולהחזיר JSON עם שדה `brief` מלא בעברית.

### שלב 6 — חבר ב-StockPulse

1. פתח את הדשבורד.
2. עבור לכרטיסיה **דוחות AI** (הסמל שנראה כמו לוח שנה ב-sidebar).
3. בפעם הראשונה תוצג מסך הגדרות — הדבק את ה-Brief Worker URL ולחץ **שמור והמשך**.
4. תופיע נקודה ירוקה בלוח השנה על התאריך של היום (אם הרצת את `/brief/daily/regenerate`).

---

## תזמון Cron

| Cron          | UTC   | ישראל (חורף/קיץ) | ארה"ב (ET)        |
|---------------|-------|-------------------|---------------------|
| `0 22 * * 1-5`| 22:00 | 00:00 / 01:00     | 17:00 / 18:00       |
| `0 19 * * 0`  | 19:00 | 21:00 / 22:00     | 14:00 / 15:00       |

הראשון רץ אחרי סגירת השוק האמריקאי (16:00 ET) עם buffer של שעה-שעתיים. השני רץ ביום ראשון בערב — מספיק זמן אחרי סגירת שישי לסכם שבוע ולהציג setup לשבוע הבא.

---

## עלות צפויה

לפי תמחור Opus 4.7 ($5/MTok input, $25/MTok output, $10 per 1,000 web searches):

| דוח     | קלט   | פלט   | חיפושים | עלות לדוח | חודשי         |
|---------|-------|-------|---------|-----------|----------------|
| יומי    | ~3K   | ~2K   | ~3      | ~$0.10    | ~$2.20 (22×)   |
| שבועי   | ~3.5K | ~5K   | ~8      | ~$0.22    | ~$0.90 (4×)    |
| **סה"כ**|       |       |         |           | **~$3.10**     |

KV ו-Worker requests חינם בנפח שלך.

---

## API Reference

| Method | Path                          | תיאור                                   |
|--------|-------------------------------|------------------------------------------|
| GET    | `/brief/daily`                | מחזיר דוח יומי אחרון (latest)            |
| GET    | `/brief/daily/:date`          | דוח של תאריך ספציפי (YYYY-MM-DD)         |
| GET    | `/brief/weekly`               | מחזיר דוח שבועי אחרון                    |
| GET    | `/brief/weekly/:week`         | דוח של שבוע ספציפי (YYYY-Www)            |
| GET    | `/brief/list`                 | רשימה של כל הדוחות הזמינים (לוח-שנה)     |
| GET    | `/brief/list?type=daily`      | סינון לפי סוג                            |
| GET    | `/brief/list?from=YYYY-MM-DD` | סינון לפי טווח                           |
| POST   | `/brief/daily/regenerate`     | יצירה ידנית (דורש `Authorization: Bearer`) |
| POST   | `/brief/weekly/regenerate`    | יצירה ידנית (דורש `Authorization: Bearer`) |
| GET    | `/health`                     | health check                              |

---

## בעיות נפוצות

### "No brief available yet"
הדוח עוד לא נוצר. הפעל ידנית:
```bash
curl -X POST https://YOUR-WORKER/brief/daily/regenerate \
  -H "Authorization: Bearer YOUR_CRON_SECRET"
```

### צופה בלוגים בזמן אמת
```bash
wrangler tail
```
זה מציג כל בקשה + console.log. שימושי במיוחד אחרי שהקרון רץ.

### "Yahoo Finance מחזיר null"
לפעמים Yahoo חוסם בקשות מ-Workers. הפתרון: עדכן את `worker.js` להשתמש ב-PROXY הקיים שלך (`market.ari-perez25-06.workers.dev`) במקום הקריאה הישירה. החלף את הפונקציה `fetchQuote` בקריאה דרך הפרוקסי.

### "Claude API error 401"
ה-`ANTHROPIC_API_KEY` לא הוגדר נכון. הרץ שוב:
```bash
wrangler secret put ANTHROPIC_API_KEY
```

### "Claude API error 529 (overloaded)"
שרתי Anthropic עמוסים. נסה שוב בעוד כמה דקות.

### עלות גבוהה מהצפי
Opus 4.7 משתמש ב-tokenizer חדש שצורך עד 35% יותר טוקנים. אם רוצה להוזיל — שנה ב-`worker.js` את `model: 'claude-opus-4-7'` ל-`model: 'claude-sonnet-4-6'`. פי ~3 פחות יקר, איכות 90% מ-Opus.

### איך אני מוחק דוחות ישנים?
דוחות נשמרים ב-KV ללא תפוגה. למחיקה ידנית:
```bash
# רשימת מפתחות
wrangler kv key list --binding=BRIEFS_KV

# מחיקת מפתח ספציפי
wrangler kv key delete --binding=BRIEFS_KV "daily:2026-04-01"
```

---

## עדכון הדוח אחרי שינוי קוד

```bash
cd brief-worker
wrangler deploy
```

זמן deploy ~10 שניות. השינוי תופס מיידית.
