const mongoose = require('mongoose');
require('dotenv').config();

async function checkUsers() {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log('Connected to MongoDB');

    const users = await mongoose.connection.db.collection('users').find({}).limit(5).toArray();
    console.log(`Users found: ${users.length}`);
    
    if (users.length > 0) {
      console.log('Sample user:', JSON.stringify(users[0], null, 2));
    }

    await mongoose.disconnect();
    console.log('Database connection closed');
  } catch (error) {
    console.error('Error:', error);
    process.exit(1);
  }
}

checkUsers();