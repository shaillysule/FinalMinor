// =============================
//      IMPORTS
// =============================
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const dotenv = require('dotenv');
const helmet = require('helmet');
const rateLimit = require('express-rate-limit');
const path = require('path');

dotenv.config();

const app = express();

// =============================
//      CORRECT CORS SETUP
// =============================

const allowedOrigins = [
  "https://nexgenstocksfrontend.onrender.com",  // your frontend
  "http://localhost:3000"                       // local dev
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        console.log("❌ CORS BLOCKED:", origin);
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
    methods: "GET,POST,PUT,DELETE,PATCH,OPTIONS",
    allowedHeaders: "Content-Type,Authorization"
  })
);

// Preflight support
app.options("*", cors());

// =============================
//      MIDDLEWARES
// =============================
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(helmet());

app.use(rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100
}));

// =============================
//      IMPORT ROUTES
// =============================
const authRoutes = require('./routes/api/auth');
const learningRoutes = require('./routes/learning');
const userRoutes = require('./routes/User');
const paymentRoutes = require('./routes/subscription');
const adminRoutes = require('./routes/api/admin');
const stockRoutes = require('./routes/stockRoutes');
const chatbotRoutes = require('./routes/chatbot');
const portfolioRoutes = require('./routes/portfolioRoutes');
const portfoliosTrade = require('./routes/portfolio');

// =============================
//  ANTI-SPAM CHATBOT MIDDLEWARE
// =============================
let lastRequestTime = 0;

app.use('/api/chatbot', (req, res, next) => {
  const now = Date.now();
  if (now - lastRequestTime < 5000) {
    return res.status(429).json({
      error: 'Please wait 5 seconds between messages.'
    });
  }
  lastRequestTime = now;
  next();
});

// =============================
//      ROUTE MOUNTING
// =============================
app.use('/api/auth', authRoutes);
app.use('/api/learning', learningRoutes);
app.use('/api/user', userRoutes);
app.use('/api/subscription', paymentRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/stocks', stockRoutes);
app.use('/api/chatbot', chatbotRoutes);
app.use('/api/portfolios', portfolioRoutes);
app.use('/api/portfolio', portfoliosTrade);

// =============================
//      REMOVE WRONG CLIENT CODE
// (Frontend is deployed separately on Render)
//
// ❌ DO NOT SERVE client/build FROM BACKEND IN RENDER
// =============================

// =============================
//      DEFAULT ROUTE
// =============================
app.get('/', (req, res) => {
  res.send('🚀 NexGenStocks API is running successfully.');
});

// =============================
//    ERROR HANDLER
// =============================
app.use((err, req, res, next) => {
  console.error("🔥 Server Error:", err.message);
  res.status(500).json({ error: 'Internal Server Error' });
});

// =============================
//   MONGODB CONNECTION
// =============================
const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('✅ MongoDB connected successfully');
  } catch (err) {
    console.error('❌ MongoDB connection error:', err.message);
    process.exit(1);
  }
};
connectDB();

// =============================
//     START SERVER
// =============================
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`🚀 Server running on port ${PORT}`);
});
