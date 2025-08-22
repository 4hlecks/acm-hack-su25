require('dotenv').config();
const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');

const usersRouter = require('./routes/users.js');
const eventsRouter = require('./routes/event_router/event_router')
const clubsRouter = require('./routes/club_router/club_router')

const app = express();
const cors = require('cors');

app.use(cors({ origin: 'http://localhost:3000' }));
app.use(logger('dev'));
app.use(express.static('public'));

app.use('/api/loadEvents', eventsRouter);
app.use('/api/findClub', clubsRouter);

app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', usersRouter);
app.use('/uploads', express.static('uploads'));

mongoose.connect(process.env.DB_URL).then(() => {
  console.log('Connected to MongoDB database');
});

module.exports = app;