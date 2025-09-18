// backend/index.js
import express from 'express';
import mongoose from 'mongoose';
import cors from 'cors';
//import morgan from 'morgan';               // optional but handy
import dotenv from 'dotenv';
import authRoutes from './routes/auth.js'; // you already have this

dotenv.config();

const app = express();

// --- Config ---
const PORT = process.env.PORT || 5000;
const MONGO_URI = process.env.MONGO_URI || 'mongodb://mongo:27017/tms';
const CORS_ORIGINS = [
  'http://localhost:3000',  // CRA dev server (what you want)
  'http://localhost:5173',  // just in case you switch back
  'http://localhost'
];

// --- Middleware ---
app.use(express.json());
app.use(cors({ origin: CORS_ORIGINS }));
//app.use(morgan('dev')); // optional

// --- Health check (for quick tests) ---
app.get('/api/health', (_req, res) => res.json({ status: 'ok' }));

// --- Routes ---
app.use('/api/auth', authRoutes);

// --- Global error guard (keeps JSON shape consistent) ---
app.use((err, _req, res, _next) => {
  console.error(err);
  res.status(err.status || 500).json({ message: err.message || 'Server error' });
});

// --- DB connect & start server ---
async function start() {
  try {
    await mongoose.connect(MONGO_URI, {
      // These options are fine defaults with Mongoose v6+
    });
    console.log('✅ MongoDB connected');

    app.listen(PORT, () => {
      console.log(`✅ API on ${PORT}`);
    });
  } catch (e) {
    console.error('❌ Failed to start API:', e);
    process.exit(1);
  }
}
start();

// --- Graceful shutdown (optional) ---
process.on('SIGTERM', () => mongoose.connection.close(() => process.exit(0)));
process.on('SIGINT', () => mongoose.connection.close(() => process.exit(0)));
