# DohelMoto - חנות חלקי חילוף לטרקטורונים וכלי שטח

> **מסמך זה משמש כמקור מידע מרכזי לפרויקט.** בעת פתיחת סשן חדש, קרא קודם את הקובץ הזה כדי להבין את המבנה, הארכיטקטורה והפרטים הטכניים. כל שינוי משמעותי בפרויקט צריך להתעדכן גם כאן.

---

## תיאור הפרויקט

חנות מקוונת מקצועית למכירת חלקי חילוף לטרקטורונים וכלי שטח. בנויה עם Docker Compose, עם מערכת ניהול למנהלים ואינטגרציה עם Cardcom לתשלומים.

---

## ארכיטקטורה

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Nginx (80)    │────▶│  Backend (5000)  │────▶│  PostgreSQL     │
│   Frontend SPA  │     │  Node.js/Express │     │  (5432)         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
```

- **Frontend**: React SPA (Vite) - מוגש דרך Nginx
- **Backend**: Node.js + Express API
- **Database**: PostgreSQL
- **Proxy**: Nginx מפנה `/api` ל-backend

---

## מבנה הפרויקט

```
DohelMoto-Lightsail/
├── backend/                 # שרת API
│   ├── server.js           # שרת Express מלא (כל ה-routes ביחד)
│   ├── scripts/
│   │   └── seed.js         # אתחול DB עם נתונים לדוגמה
│   ├── Dockerfile
│   └── package.json
├── frontend/                # אפליקציית React
│   ├── src/
│   │   ├── App.jsx         # קומפוננטות ראשיות + routing
│   │   ├── AdminPanel.jsx   # פאנל ניהול
│   │   ├── PaymentCallback.jsx
│   │   ├── App.css
│   │   ├── index.css
│   │   └── main.jsx
│   ├── nginx.conf          # Nginx config (proxy + SPA)
│   ├── Dockerfile
│   └── package.json
├── docker-compose.yml
├── rebuild.sh              # סקריפט: git add, commit, push
└── README.md
```

---

## סכמת מסד הנתונים

### טבלאות עיקריות

| טבלה | תיאור |
|------|--------|
| `users` | משתמשים, כולל role (user/admin), vehicle_brand, vehicle_model |
| `vehicles` | קטלוג כלי רכב (brand, brand_he, model, model_he, type) |
| `categories` | קטגוריות מוצרים (name, name_he, description, image_url) |
| `products` | מוצרים (name, name_he, price, sale_price, stock, sku, compatible_models, images[]) |
| `cart` | עגלת קניות (user_id, product_id, quantity) |
| `orders` | הזמנות (user_id, total_amount, status, payment_status, cardcom_token) |
| `order_items` | פריטי הזמנה |
| `about_page` | תוכן דינמי לעמוד אודות (who_we_are, vision, why_choose_us, רשתות חברתיות) |

### טבלת product_variants (אופציונלית)
- קיימת אם יש וריאנטים למוצרים
- Backend מחזיר [] אם הטבלה לא קיימת

---

## API Endpoints

### ציבורי
```http
GET  /api/health
GET  /api/categories
GET  /api/vehicles
GET  /api/vehicles/models?brand=
GET  /api/products?category_id=&search=&vehicle_brand=&vehicle_model=&page=&limit=
GET  /api/products/:id
GET  /api/products/:id/variants
GET  /api/about
POST /api/register
POST /api/login
```

### דורש Auth (Bearer token)
```http
GET  /api/cart/:userId
POST /api/cart
PUT  /api/cart/:id
DELETE /api/cart/:id
POST /api/orders
GET  /api/orders/:userId
GET  /api/user/vehicle
PUT  /api/user/vehicle
POST /api/payment/cardcom/init
```

### Admin (דורש role=admin)
```http
GET  /api/admin/products
POST /api/admin/products
PUT  /api/admin/products/:id
DELETE /api/admin/products/:id
GET  /api/admin/orders
PUT  /api/admin/orders/:id/status
POST /api/admin/categories
PUT  /api/admin/categories/:id
DELETE /api/admin/categories/:id
GET  /api/admin/about
PUT  /api/admin/about
```

### Callback (ללא auth)
```http
POST /api/payment/cardcom/callback
```

---

## Frontend - Routes ו-Components

| Route | Component | תיאור |
|-------|-----------|--------|
| `/` | Home | דף בית, קטגוריות ומוצרים מומלצים |
| `/products` | Products | רשימת מוצרים עם סינון (קטגוריה, חיפוש, כלי רכב, מיון) |
| `/product/:id` | ProductDetail | פרטי מוצר, גלריית תמונות, וריאנטים |
| `/categories` | Categories | כל הקטגוריות |
| `/cart` | Cart | עגלה + תשלום Cardcom |
| `/login` | Login | התחברות/הרשמה |
| `/orders` | Orders | הזמנות המשתמש |
| `/about` | About | תוכן דינמי מ-about_page |
| `/customer-service` | CustomerService | טופס יצירת קשר (סטטיק) |
| `/admin` | AdminPanel | ניהול מוצרים, קטגוריות, הזמנות, אודות |
| `/payment/success` | PaymentCallback | success |
| `/payment/cancel` | PaymentCallback | cancel |
| `/payment/error` | PaymentCallback | error |

---

## טכנולוגיות

| שכבה | טכנולוגיות |
|------|------------|
| Frontend | React 18, Vite, React Router, Axios, react-icons |
| Backend | Node.js, Express, pg (PostgreSQL), bcryptjs, jsonwebtoken, axios |
| DB | PostgreSQL 15 |
| Web Server | Nginx (Alpine) |
| Container | Docker, Docker Compose |

---

## התקנה והפעלה

### דרישות
- Docker Engine
- Docker Compose Plugin

### הפעלה
```bash
docker compose up --build -d
sleep 10
docker compose exec -T backend npm run seed
```

### כתובות
- **Frontend**: http://localhost
- **Backend API**: http://localhost:5000
- **PostgreSQL**: localhost:5432

### משתמשי מנהל (seed)
| אימייל | סיסמה |
|--------|--------|
| admin@dohelmoto.com | admin123 |
| test@dohelmoto.com | test123 |

---

## משתני סביבה (Backend)

| משתנה | תיאור |
|-------|--------|
| `DATABASE_URL` | חיבור PostgreSQL |
| `JWT_SECRET` | מפתח JWT |
| `CARDCOM_API_URL` | כתובת Cardcom |
| `CARDCOM_TERMINAL_ID` | מזהה טרמינל |
| `CARDCOM_USERNAME` | שם משתמש |
| `CARDCOM_PASSWORD` | סיסמה |
| `FRONTEND_URL` | כתובת Frontend (ל-redirects) |
| `BACKEND_URL` | כתובת Backend (ל-callback) |

---

## פיתוח מקומי

```bash
# Backend
cd backend && npm install && npm run dev

# Frontend
cd frontend && npm install && npm run dev
```

Frontend dev: http://localhost:3000

---

## בעיות ידועות / TODO

1. ~~**Login - vehicles ו-vehicleModels**~~ תוקן: הוספתי vehicles, vehicleModels ו-formData.vehicle_brand/model ל-Login.

2. **CustomerService**: טופס יצירת קשר לא מחובר ל-backend - רק console.log.

3. **vehicles.ON CONFLICT**: ב-seed.js יש `ON CONFLICT DO NOTHING` ל-vehicles אבל לא הוגדר UNIQUE - ייתכן שזה לא יעבוד.

4. **PaymentCallback**: שולח callback ל-backend עם transaction_id - אבל Cardcom קורא ל-callback עם פרמטרים שונים (ResponseCode, TransactionId, OrderId, LowProfileCode). יש לוודא התאמה.

5. **Admin variants API**: ProductsTab קורא ל-`/api/admin/products/:id/variants` - ה-endpoint לא קיים ב-backend.

---

## עדכון README

**כל שינוי משמעותי בפרויקט צריך להתעדכן ב-README:**
- הוספת/שינוי API endpoints
- הוספת/שינוי routes או components
- שינוי סכמת DB
- שינוי משתני סביבה
- תיקון באגים
- הוספת תכונות

---

## רישיון

ISC
