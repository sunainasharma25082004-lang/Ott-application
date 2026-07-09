const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = 'mongodb://127.0.0.1:27017/talenthunt';

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.');

  const db = mongoose.connection.db;
  const usersCollection = db.collection('users');
  const profilesCollection = db.collection('profiles');

  // Clean up any old user/profile
  console.log('Cleaning up old user and profile...');
  await usersCollection.deleteMany({ email: 'user@talenthunt.com' });

  // Hash password
  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('User@123', salt);

  // Insert user
  const user = {
    name: 'Demo User',
    email: 'user@talenthunt.com',
    password: hashedPassword,
    role: 'user',
    isVerified: true,
    avatar: 'https://i.pravatar.cc/300?img=33',
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log('Inserting verified user...');
  const userResult = await usersCollection.insertOne(user);
  const userId = userResult.insertedId;
  console.log('User created with ID:', userId);

  // Insert profile
  const profile = {
    user: userId,
    name: 'Demo Profile',
    avatar: 'https://i.pravatar.cc/300?img=33',
    isKids: false,
    preferences: {
      favoriteGenres: ['Action', 'Drama'],
      language: 'en'
    },
    lastWatched: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log('Inserting profile...');
  await profilesCollection.insertOne(profile);
  console.log('Profile created successfully.');

  await mongoose.disconnect();
  console.log('Disconnected.');
}

run().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});
