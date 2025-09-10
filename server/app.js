const dotenv = require('dotenv');
dotenv.config();

const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const cookieParser = require('cookie-parser');
const cors = require('cors');

// load env FIRST
dotenv.config();

const authRoutes = require('./routes/auth');
const usersRouter = require('./routes/users.js');
const eventsRouter = require('./routes/event_router/event_router');
const clubsRouter = require('./routes/club_router/club_router');
const requireAuth = require('./middleware/auth');

const searchRouter = require('./routes/search_router/search_router')

const app = express();

app.use(express.json()); 
app.use(express.urlencoded({ extended: true }));

// change w/ our domain to whitelist 
const FRONTEND_ORIGINS = [
  process.env.FRONTEND_ORIGIN || 'http://localhost:3000',
].filter(Boolean);

// so browser can send cookies (refresh token) & so the set-cookie from /auth/login isn’t blocked.
app.use(cors({
  origin: (origin, cb) => cb(null, FRONTEND_ORIGINS.includes(origin) || !origin),
  credentials: true,
  methods: ['GET','POST','PUT','PATCH','DELETE','OPTIONS'],
  allowedHeaders: ['Content-Type','Authorization'],
}));

// tells Express request is secure to set/send cookies.
if (process.env.NODE_ENV === 'production') {
  app.set('trust proxy', 1);
}

app.use(logger('dev'));
app.use(express.static('public'));
app.use(cookieParser()); // read/write refresh cookie

// sanity check for JWT auth middleware
app.get('/__ping', (_req, res) => res.json({ ok: true }));       
app.get('/api/me', requireAuth, (req, res) => {                   
  res.json({ ok: true, user: req.user });
});

app.use('/auth', authRoutes);
app.use('/users', usersRouter);
app.use('/api/loadEvents', eventsRouter);
app.use('/api/findClub', clubsRouter);
app.use('/api/search', searchRouter);

app.use('/users', usersRouter);
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.DB_URL).then(() => {
  console.log('Connected to MongoDB database');
});

module.exports = app;