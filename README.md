# DohelMoto - חנות חלקי חילוף לטרקטורונים וכלי שטח

חנות מקוונת מקצועית למכירת חלקי חילוף לטרקטורונים וכלי שטח, בנויה עם Docker Compose.

## תכונות

- 🛒 **קטלוג מוצרים מלא** - חיפוש, סינון לפי קטגוריות, תצוגת פרטי מוצר
- 🛍️ **עגלת קניות** - הוספה, עדכון ומחיקת מוצרים
- 👤 **מערכת משתמשים** - הרשמה, התחברות וניהול הזמנות
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

### פתרון בעיות Docker (אם נדרש)

אם אתה מקבל שגיאות הקשורות ל-Docker, הרץ:
```bash
./fix-docker.sh
```

לאחר מכן, התנתק והתחבר מחדש (או הרץ `newgrp docker`).

### הפעלה

**אפשרות 1: שימוש בסקריפט (מומלץ)**
```bash
./start.sh
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

## רישיון

ISC
