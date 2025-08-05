const express = require('express');
const logger = require('morgan');
const mongoose = require('mongoose');
const dotenv = require('dotenv');

const eventsRouter = require('./routes/event_router/event_router')
const clubsRouter = require('./routes/club_router/club_router')
const app = express();

app.use(logger('dev'));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use('/api/loadEvents', eventsRouter);
app.use('/api/findClub', clubsRouter);
dotenv.config();

mongoose.connect(process.env.DB_URL).then(() => {
  console.log('Connected to MongoDB database');
});


module.exports = app;
