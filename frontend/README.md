# Highway Delite - Travel Booking Platform

A fullstack travel experience booking application built with React, TypeScript, Node.js, Express, and PostgreSQL.

![Tech Stack](https://img.shields.io/badge/React-18-blue)
![TypeScript](https://img.shields.io/badge/TypeScript-5-blue)
![Node.js](https://img.shields.io/badge/Node.js-18+-green)
![PostgreSQL](https://img.shields.io/badge/PostgreSQL-14+-blue)

## 🎯 Features

- **Browse Experiences**: View curated travel experiences with beautiful imagery
- **Smart Search**: Filter experiences by keywords and categories
- **Real-time Availability**: Check slot availability with live updates
- **Booking System**: Complete booking flow with date/time selection
- **Promo Codes**: Apply discount codes at checkout
- **Responsive Design**: Mobile-first design using TailwindCSS
- **Type Safety**: Full TypeScript implementation across stack

## 🚀 Quick Start

### Prerequisites
- Node.js 18 or higher
- PostgreSQL 14 or higher
- npm or yarn
- Git

### Installation

1. **Clone the repository**
```bash
git clone 
cd highway-delite
```

2. **Setup Backend**
```bash
cd backend
npm install

# Create .env file
cat > .env << EOF
PORT=5000
NODE_ENV=development

# Database
DB_HOST=localhost
DB_PORT=5432
DB_NAME=highway
DB_USER=postgres
DB_PASSWORD=your_password


# CORS
FRONTEND_URL=http://localhost:5173
EOF
```

3. **Setup Frontend**
```bash
cd ../frontend
npm install

# Create .env file
cat > .env << EOF
VITE_API_URL=http://localhost:5000/api
EOF
```

4. **Initialize Tailwind CSS**
```bash
cd frontend
npx tailwindcss init -p
```

5. **Create Database**
```bash
# Using psql
psql -U postgres
CREATE DATABASE highway;
\q
```

6. **Seed Database**
```bash
cd backend
npm run seed
```

7. **Run Application**

Open two terminal windows:

**Terminal 1 (Backend):**
```bash
cd backend
npm run dev
```

**Terminal 2 (Frontend):**
```bash
cd frontend
npm run dev
```

8. **Access Application**
- Frontend: http://localhost:5173
- Backend API: http://localhost:5000/api

## 📁 Project Structure

```
highway-delite/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── init.sql
|   |   ├── index.ts         
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   └── nodemon.json
├── frontend/
│   ├── src/
│   │   ├── components/
│   │   │   ├── Header.tsx
│   │   │   ├── ExperienceCard.tsx
│   │   │   ├── SearchBar.tsx
│   │   │   └── LoadingSpinner.tsx
│   │   ├── pages/
│   │   │   ├── HomePage.tsx
│   │   │   ├── DetailsPage.tsx
│   │   │   ├── CheckoutPage.tsx
│   │   │   └── ResultPage.tsx
│   │   ├── services/
│   │   │   └── api.ts                # API client
│   │   ├── types/
│   │   │   └── index.ts              # TypeScript interfaces
│   │   ├── App.tsx
│   │   ├── main.tsx
│   │   └── index.css
│   ├── .env
│   ├── package.json
│   ├── tsconfig.json
│   ├── vite.config.ts
│   ├── tailwind.config.js
│   └── index.html
├── .gitignore
└── README.md
```

## 🛠️ Tech Stack

### Frontend
- **React 18** - UI library
- **TypeScript** - Type safety
- **Vite** - Build tool
- **TailwindCSS** - Styling
- **React Router** - Routing
- **Axios** - HTTP client

### Backend
- **Node.js** - Runtime
- **Express** - Web framework
- **TypeScript** - Type safety
- **PostgreSQL** - Database
- **Sequelize** - ORM
- **CORS** - Cross-origin support

## 📡 API Endpoints

### Experiences
```
GET    /api/experiences           # List all experiences
GET    /api/experiences/:id       # Get experience details with slots
```

### Bookings
```
POST   /api/bookings             # Create new booking
```

### Promo Codes
```
POST   /api/promo/validate       # Validate promo code
```

## 🎟️ Test Promo Codes

| Code | Type | Discount | Min Purchase | Max Discount |
|------|------|----------|--------------|--------------|
| SAVE10 | Percentage | 10% | ₹500 | ₹200 |
| FLAT100 | Flat | ₹100 | ₹800 | - |
| WELCOME20 | Percentage | 20% | ₹1000 | ₹500 |

## 🧪 Testing the Application

### Manual Testing Flow

1. **Homepage**
   - View all experiences
   - Search for "Kayaking"
   - Filter results

2. **Experience Details**
   - Click on any experience
   - View details, images, highlights
   - Select date from available options
   - Choose time slot (note availability)
   - Adjust quantity
   - Click "Confirm"

3. **Checkout**
   - Enter test details:
     - Name: John Doe
     - Email: test@test.com
   - Apply promo code: `SAVE10`
   - Agree to terms
   - Click "Pay and Confirm"

4. **Confirmation**
   - View booking reference
   - Note confirmation message

## 🚢 Deployment

### Deploy to Render (Backend + Database)

1. **Create PostgreSQL Database**
   - Go to Render Dashboard
   - New → PostgreSQL
   - Save connection details

2. **Deploy Backend**
   - New → Web Service
   - Connect GitHub repo
   - Root Directory: `backend`
   - Build: `npm install && npm run build`
   - Start: `npm start`
   - Add environment variables

3. **Seed Database**
   ```bash
   # In Render shell
   npm run seed
   ```

### Deploy to Vercel (Frontend)

1. **Import Project**
   - Connect GitHub repository
   - Framework: Vite
   - Root Directory: `frontend`
   - Build: `npm run build`
   - Output: `dist`

2. **Add Environment Variables**
   ```
   VITE_API_URL=https://your-backend.onrender.com/api
   ```

3. **Deploy**

### Post-Deployment

1. Update backend `FRONTEND_URL` with Vercel URL
2. Test complete booking flow
3. Monitor logs for errors

## 🐛 Troubleshooting

### Backend Issues

**Port already in use:**
```bash
lsof -ti:5000 | xargs kill -9
```

**Database connection failed:**
- Verify PostgreSQL is running: `pg_isready`
- Check credentials in `.env`
- Ensure database exists: `psql -l | grep highway_delite`

**Sequelize errors:**
```bash
cd backend
rm -rf node_modules
npm install
npm run seed
```

### Frontend Issues

**Module not found:**
```bash
cd frontend
rm -rf node_modules .vite
npm install
```

**API calls failing:**
- Check backend is running on port 5000
- Verify `VITE_API_URL` in `.env`
- Check browser console for CORS errors

**Build errors:**
```bash
npm run build -- --debug
```

## 📝 Environment Variables

### Backend (.env)
```env
PORT=5000
NODE_ENV=development
DB_HOST=localhost
DB_PORT=5432
DB_NAME=highway_delite
DB_USER=postgres
DB_PASSWORD=your_password
JWT_SECRET=your_secret_key
FRONTEND_URL=http://localhost:5173
```

### Frontend (.env)
```env
VITE_API_URL=http://localhost:5000/api
```

## 🔒 Security Considerations

- Never commit `.env` files
- Use strong JWT secrets in production
- Enable HTTPS in production
- Implement rate limiting
- Add input validation
- Sanitize user inputs
- Use prepared statements (Sequelize handles this)

## 🎨 Design System

### Colors
- Primary: `#FCD535` (Yellow)
- Secondary: `#1A1A1A` (Black)
- Background: `#F9FAFB` (Gray-50)
- Border: `#E5E7EB` (Gray-200)

### Typography
- Font Family: System UI
- Headings: Bold, 24-40px
- Body: Regular, 14-16px
- Small: 12-14px

### Spacing
- Base unit: 4px (Tailwind default)
- Container: max-width 1280px
- Padding: 16px (mobile), 32px (desktop)

## 📚 Additional Resources

- [React Documentation](https://react.dev)
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Express.js Guide](https://expressjs.com/en/guide/routing.html)
- [Sequelize Docs](https://sequelize.org/docs/v6/)
- [TailwindCSS](https://tailwindcss.com/docs)
- [PostgreSQL Tutorial](https://www.postgresql.org/docs/)