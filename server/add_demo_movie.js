const mongoose = require('mongoose');

const uri = 'mongodb://127.0.0.1:27017/talenthunt';

async function run() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(uri);
  console.log('Connected.');

  const db = mongoose.connection.db;
  const collection = db.collection('movies');

  // Clean up any old demo movie
  console.log('Cleaning up old demo video...');
  await collection.deleteMany({ title: 'Auto Demo Video' });

  // Insert new demo movie document
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
  const result = await collection.insertOne(demoMovie);
  console.log('Inserted successfully with ID:', result.insertedId);

  await mongoose.disconnect();
  console.log('Disconnected.');
}

run().catch(err => {
  console.error('Error running script:', err);
  process.exit(1);
});
