const mongoose = require('mongoose');

async function dropClubIdIndex() {
  try {
    await mongoose.connect('mongodb+srv://vinhn28:!Vn12282005@cluster0.j4qp7fq.mongodb.net/test?retryWrites=true&w=majority', {
      useNewUrlParser: true,
      useUnifiedTopology: true
    });

    const db = mongoose.connection.db;

    // Drop the old clubId index
    await db.collection('users').dropIndex('clubId_1');
    console.log('✅ Dropped index clubId_1');

    process.exit(0);
  } catch (err) {
    console.error('❌ Error dropping index:', err.message);
    process.exit(1);
  }
}

dropClubIdIndex();