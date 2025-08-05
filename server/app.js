const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const usersRouter = require('./routes/users.js');
const eventsRouter = require('./routes/event_router/event_router')
const clubsRouter = require('./routes/club_router/club_router')
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/users', usersRouter);
app.use('/api/loadEvents', eventsRouter);
app.use('/api/findClub', clubsRouter);
app.use('/uploads', express.static('uploads'));
dotenv.config();

mongoose.connect(process.env.DB_URL).then(() => {
  console.log('Connected to MongoDB database');
});

module.exports = app;