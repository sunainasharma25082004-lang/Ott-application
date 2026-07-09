require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const uri = process.env.MONGO_URI;

if (!uri) {
  console.error('Error: MONGO_URI is not defined in the environment variables.');
  process.exit(1);
}

async function run() {
  console.log('Connecting to MongoDB Atlas...');
  await mongoose.connect(uri);
  console.log('Connected.');

  const db = mongoose.connection.db;
  const moviesCollection = db.collection('movies');
  const usersCollection = db.collection('users');
  const profilesCollection = db.collection('profiles');

  // 1. Clean up old demo movie and seed the verified demo movie
  console.log('Cleaning up old demo video...');
  await moviesCollection.deleteMany({ title: 'Auto Demo Video' });

  const demoMovie = {
    title: 'Auto Demo Video',
    description: 'A high-quality public demo video to test video playback and local downloads.',
    thumbnail: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
    poster: 'https://images.unsplash.com/photo-1536440136628-849c177e76a1?w=400&q=80',
    videoUrl: 'https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerFun.mp4',
    duration: 120, // 2 hours
    genres: ['Action', 'Drama'],
    rating: 8.5,
    releaseYear: 2026,
    language: 'English',
    isTrending: true,
    isNewRelease: true,
    views: 0,
    isDummy: false,
    cast: [],
    createdAt: new Date(),
    updatedAt: new Date()
  };

  console.log('Inserting new demo video...');
  const movieResult = await moviesCollection.insertOne(demoMovie);
  console.log('Inserted movie successfully with ID:', movieResult.insertedId);

  // 2. Clean up old user and seed the verified test user
  console.log('Cleaning up old user and profile...');
  await usersCollection.deleteMany({ email: 'user@talenthunt.com' });

  const salt = await bcrypt.genSalt(10);
  const hashedPassword = await bcrypt.hash('User@123', salt);

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

  // 3. Clean up old profiles for this user and insert a new one
  await profilesCollection.deleteMany({ user: userId });

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
