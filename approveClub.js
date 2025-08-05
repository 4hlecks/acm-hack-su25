const mongoose = require('mongoose');
const dotenv = require('dotenv');
const path = require('path');
const User = require('./server/models/users_schema');

dotenv.config({ path: path.resolve(__dirname, 'server/.env') });

mongoose.connect(process.env.DB_URL, { serverSelectionTimeoutMS: 10000 })
  .then(async () => {
    const result = await User.updateOne(
      { email: 'club@example.com' },
      { $set: { approved: true } }
    );
    console.log('Result:', result);
    mongoose.disconnect();
  })
  .catch(err => console.error('Connection error:', err));
