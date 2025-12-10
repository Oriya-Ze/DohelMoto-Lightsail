# DohelMoto - חנות חלקי חילוף לטרקטורונים וכלי שטח

חנות מקוונת מקצועית למכירת חלקי חילוף לטרקטורונים וכלי שטח, בנויה עם Docker Compose, עם מערכת ניהול למנהלים ואינטגרציה עם Verifone VeriPAY.

## תכונות

- 🛒 **קטלוג מוצרים מלא** - חיפוש, סינון לפי קטגוריות, תצוגת פרטי מוצר
- 🛍️ **עגלת קניות** - הוספה, עדכון ומחיקת מוצרים
- 👤 **מערכת משתמשים** - הרשמה, התחברות וניהול הזמנות
- 👨‍💼 **פאנל מנהל** - ניהול מוצרים, קטגוריות והזמנות
- 💳 **תשלומים מאובטחים** - אינטגרציה עם Verifone VeriPAY
- 📦 **ניהול הזמנות** - מעקב אחר הזמנות קודמות
- 🎨 **ממשק משתמש מודרני** - עיצוב רספונסיבי ונוח
- 🐳 **Docker Compose** - הפעלה קלה עם כל השירותים
- 🌐 **Nginx** - שרת פרוקסי וסטטיקי יעיל

## מבנה הפרויקט

```
DohelMoto-Lightsail/
├── backend/          # שרת API (Node.js/Express)
├── frontend/         # אפליקציית React
├── docker-compose.yml
└── README.md
```

## התקנה והפעלה

### דרישות מוקדמות
- Docker Engine
- Docker Compose Plugin (מותקן עם Docker CE)

### הפעלה

**אפשרות 1: שימוש בסקריפט (מומלץ)**
```bash
docker compose up --build -d
sleep 10
docker compose exec -T backend npm run seed
```

**אפשרות 2: הפעלה ידנית**
```bash
# 1. הפעל את כל השירותים
docker compose up --build -d

# 2. המתן כמה שניות שהשירותים יעלו
sleep 10

# 3. אתחל את מסד הנתונים עם נתונים לדוגמה
docker compose exec -T backend npm run seed
```

**4. פתח בדפדפן:**
```
http://localhost
```

### הפסקת השירותים
```bash
docker compose down
```

## משתמש מנהל

לאחר הרצת seed, נוצר משתמש מנהל:
- **אימייל**: admin@dohelmoto.com
- **סיסמה**: admin123

התחבר עם פרטי המנהל כדי לגשת לפאנל הניהול בכתובת: `/admin`

## שירותים

- **Frontend**: `http://localhost` (Nginx)
- **Backend API**: `http://localhost:5000`
- **PostgreSQL**: `localhost:5432`

## קטגוריות מוצרים

- מנועים
- תמסורת
- מתלים
- בלמים
- חשמל
- חלקי גוף
- מסננים
- צמיגים וגלגלים

## API Endpoints

### מוצרים
- `GET /api/products` - רשימת מוצרים
- `GET /api/products/:id` - פרטי מוצר
- `GET /api/categories` - רשימת קטגוריות

### משתמשים
- `POST /api/register` - הרשמה
- `POST /api/login` - התחברות

### עגלה
- `GET /api/cart/:userId` - קבלת עגלה
- `POST /api/cart` - הוספה לעגלה
- `PUT /api/cart/:id` - עדכון כמות
- `DELETE /api/cart/:id` - מחיקה מעגלה

### הזמנות
- `POST /api/orders` - יצירת הזמנה
- `GET /api/orders/:userId` - רשימת הזמנות

### מנהל (דורש הרשאות admin)
- `GET /api/admin/products` - רשימת כל המוצרים
- `POST /api/admin/products` - יצירת מוצר חדש
- `PUT /api/admin/products/:id` - עדכון מוצר
- `DELETE /api/admin/products/:id` - מחיקת מוצר
- `GET /api/admin/orders` - רשימת כל ההזמנות
- `PUT /api/admin/orders/:id/status` - עדכון סטטוס הזמנה
- `POST /api/admin/categories` - יצירת קטגוריה
- `PUT /api/admin/categories/:id` - עדכון קטגוריה
- `DELETE /api/admin/categories/:id` - מחיקת קטגוריה

### תשלומים (Verifone)
- `POST /api/payment/verifone/init` - אתחול תשלום
- `POST /api/payment/verifone/callback` - callback מתשלום

## הגדרת Verifone VeriPAY

על מנת להפעיל את מערכת התשלומים, עדכן את הקובץ `.env` ב-backend:

```env
VERIFONE_API_URL=https://secure.verifone.co.il/api
VERIFONE_TERMINAL_ID=your_terminal_id
VERIFONE_PASSWORD=your_password
FRONTEND_URL=http://localhost
```

## פיתוח

### Backend
```bash
cd backend
npm install
npm run dev
```

### Frontend
```bash
cd frontend
npm install
npm run dev
```

## פתרון בעיות

### Docker daemon לא רץ
```bash
sudo service docker start
# או
sudo systemctl start docker
```

### שגיאת הרשאות Docker
```bash
sudo usermod -aG docker $USER
newgrp docker  # או התנתק והתחבר מחדש
```

### בדיקת מצב השירותים
```bash
docker compose ps
docker compose logs -f
```

## טכנולוגיות

- **Frontend**: React, Vite, React Router
- **Backend**: Node.js, Express, PostgreSQL
- **Database**: PostgreSQL
- **Web Server**: Nginx
- **Containerization**: Docker, Docker Compose
- **Payment Gateway**: Verifone VeriPAY

## רישיון

ISC
