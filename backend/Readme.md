# Nexgen Stocks Backend — Node.js, Express, MongoDB
This is the backend API for **Nexgen Stocks**, an AI-powered stock market platform.  
The backend handles authentication, portfolio management, stock data, and AI chatbot communication.

## Overview:
The backend provides secure REST APIs using Express.js.  
User data, portfolio, and stock details are stored in MongoDB.  
AI chatbot responses are generated using the Gemini API.

## Features:
### Authentication  
- Signup, login, JWT token generation  
- Password hashing using bcrypt  
- Protected routes with middleware
  
### Stock Management  
- Fetch list of stocks  
- Fetch single stock data  

### Portfolio System  
- Buy and sell stocks  
- Store user holdings  
- Fetch portfolio by user  

### AI Chatbot  
- Sends user prompt to Gemini API  
- Returns AI-generated financial answers  

## Tech Stack
- Node.js  
- Express.js  
- MongoDB / Mongoose  
- JWT Authentication  
- Gemini AI API  
- bcrypt

  ## Folder structure
  backend/
│
├── controllers/
│   ├── adminController.js
│   ├── authController.js
│   ├── chatbotController.js
│   ├── new.html
│   ├── portfolioController.js
│   ├── stockController.js
│
├── middleware/
│   └── (middleware files here)
│
├── models/
│   ├── BuySellModel.js
│   ├── Learning.js
│   ├── LearningModule.js
│   ├── Portfolio.js
│   ├── Reward.js
│   ├── sentiment.js
│   ├── StockPrediction.js
│   ├── Transaction.js
│   ├── User.js
│
├── node_modules/
│
├── routes/
│   ├── api/
│   │   ├── adminRoutes.js
│   │   ├── auth.js
│   │   ├── brokerage.js
│   │   ├── chatbot.js
│   │   ├── learning.js
│   │   ├── notifications.js
│   │   ├── subscription.js
│   │   ├── subscription1.js
│   │   ├── userRoutes.js
│   │
│   ├── portfolio.js
│   ├── portfolioRoutes.js
│   ├── stockRoutes.js
│   ├── User.js
│
├── scripts/
│
├── services/
│
├── utils/
│
├── .env
├── check_api.js
├── package-lock.json
├── package.json
├── server.js

## Installation:
### Install dependencies
npm install

## Environment Variables:
Create .env in the backend folder:

MONGO_URI=mongodb://localhost:27017/nexgenStocks
JWT_SECRET=your_jwt_secret
PORT=5000
PAYPAL_CLIENT_ID=Adf-lJQVofcll4FdKqnfw6zziI6BDV00AsEkd6zJmjMZGQKuWdUvfciRkx1YgeKIbm_7V6J6EjcDqPbG
PAYPAL_CLIENT_SECRET=EIJhf6I-ppd-pUkQKSBUCE_dqvsHaBi7tbS9iXEeTU02or2znzhr3cliFiaJn60q-4T4R42sG0uvNu_8
# ALPHA_VANTAGE_API_KEY=   52RN4O5TC0X9G3HG
 ALPHA_VANTAGE_API_KEY= 9908QPQJBVN9A6TU
RAPIDAPI_KEY=c7b623e3d0mshb05414131153fb3p1152a7jsnb6d18785204b
# OPENAI_API_KEY=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
GEMINI_API_KEY=AIzaSyCuMw0k6sDnQLVgbVsAaFFoiTx8colf4vI
FINNHUB_API_KEY=d499fi1r01qshn3l8elgd499fi1r01qshn3l8em0

## Running the Backend:
move to directory StockProject/April/backend
npm start
Backend runs on:http://localhost:5000

## API endpoints:
1. AUTH ROUTES - routes/auth.js
POST   /api/auth/signup   → User registration (Gmail only)
POST   /api/auth/login → User login (JWT)
GET    /api/auth/me  → Get logged-in user details

2. USER ROUTES- routes/User.js
GET /api/user  → Get user subscription status

3. PORTFOLIO (Trading) ROUTES- routes/portfolio.js
  POST   /api/portfolio/buy  → Buy stock
POST   /api/portfolio/sell   → Sell stock
GET    /api/portfolio   → Get portfolio summary + holdings
GET    /api/portfolio/transactions → Get transaction history

4. PORTFOLIO MANAGEMENT ROUTES- routes/portfolioRoutes.js
POST   /api/portfolios/           → Create a new portfolio
GET    /api/portfolios/           → Get user's portfolios
GET    /api/portfolios/:id        → Get one portfolio by ID
PUT    /api/portfolios/:id        → Update portfolio info
DELETE /api/portfolios/:id        → Delete a portfolio
POST   /api/portfolios/:portfolioId/update-risk → Calculate risk metrics

5. STOCK MARKET ROUTES- routes/stockRoutes.js
GET    /api/stocks                → Get all stocks (live API)
GET    /api/stocks/indices/market → Market indices (NIFTY, NASDAQ)
GET    /api/stocks/trending/stocks→ Trending stocks
GET    /api/stocks/market-data    → Global market data
GET    /api/stocks/:symbol        → Get single stock details
GET    /api/stocks/:symbol/history → Historical price chart data

6. CHATBOT ROUTES- routes/chatbot.js
POST   /api/chatbot/stock         → AI chatbot for stock queries

7. LEARNING Routes- routes/learning.js
GET    /api/learning              → Get learning progress
POST   /api/learning/complete     → Complete quiz/challenge
GET    /api/learning/leaderboard  → Top 10 leaderboard
GET    /api/learning/modules      → Get all learning modules
GET    /api/learning/modules/:id  → Get a single module
POST   /api/learning/complete-module → Mark module as complete

## Troubleshooting:
MongoDB connection error
Ensure MongoDB service is running:sudo systemctl start mongod

CORS issue
Add in server.js: app.use(cors());

AI API failure
Check: Gemini API key, Quota exceeded, Internet required

Author: Shailly Sule

## Folder Structure

