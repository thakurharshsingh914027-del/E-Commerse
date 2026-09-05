# ai-product-recommendation-ecommerce

Full MERN e-commerce project with a local Python recommendation engine and fallback recommendation logic in the backend when the ML service is offline.

## Stack

- Frontend: React, Vite, Tailwind CSS, Axios, React Router
- Backend: Node.js, Express, MongoDB, Mongoose, JWT
- ML Service: Python, Flask, Pandas, Scikit-learn

## Features

- User registration, login, and JWT-protected routes
- Product listing, filters, search, detail page, ratings, and category discovery
- Cart management and checkout flow
- Order history
- User behavior tracking for views, likes, cart adds, and purchases
- AI recommendation sections:
  - Recommended For You
  - Similar Products
  - Trending Products
  - Frequently Bought Together
- Admin dashboard for products, users, and recommendation logs
- Local ML service integration plus backend fallback logic

## Project Structure

```text
ai-product-recommendation-ecommerce/
├── frontend/
├── backend/
├── ml-service/
└── README.md
```

## Backend Environment

Create or confirm [backend/.env](/c:/Users/harsh/OneDrive/Desktop/Major-project2/backend/.env):

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/ai_product_recommender
JWT_SECRET=supersecretkey
ML_SERVICE_URL=http://127.0.0.1:8000
```

## Setup

### 1. Backend

```bash
cd backend
npm install
npm run seed
npm run dev
```

Seeded admin credentials:

- `admin@example.com`
- `admin123`

### 2. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on `http://localhost:5173`.

### 3. ML Service

```bash
cd ml-service
pip install -r requirements.txt
python app.py
```

ML service runs on `http://127.0.0.1:8000`.

## API Summary

### Auth

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/auth/me`

### Products

- `GET /api/products`
- `GET /api/products/:id`
- `POST /api/products`
- `PUT /api/products/:id`
- `DELETE /api/products/:id`

### Cart

- `GET /api/cart`
- `POST /api/cart`
- `PUT /api/cart/:productId`
- `DELETE /api/cart/:productId`

### Orders

- `POST /api/orders`
- `GET /api/orders/my-orders`

### Recommendations

- `POST /api/recommendations/activity`
- `GET /api/recommendations/user/:userId`
- `GET /api/recommendations/similar/:productId`
- `GET /api/recommendations/trending`
- `GET /api/recommendations/frequently-bought-together/:productId`

### ML Service

- `GET /health`
- `POST /recommend/user`
- `POST /recommend/similar`
- `POST /recommend/trending`

## Notes

- The backend sends product, activity, and order snapshots to the local ML service.
- If the Python service is unavailable, the Express backend falls back to local recommendation ranking so the storefront still works.
- Existing older frontend/backend files remain in the repo, but the new app entry points are [frontend/src/main.jsx](/c:/Users/harsh/OneDrive/Desktop/Major-project2/frontend/src/main.jsx) and [backend/server.js](/c:/Users/harsh/OneDrive/Desktop/Major-project2/backend/server.js).
