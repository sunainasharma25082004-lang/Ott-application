/**
 * Talent Hunt - Database Seeder
 * Run with: node seed.js   (from server folder)
 *
 * This will create:
 * - Admin user
 * - Sample Movies
 * - Sample Series + Episodes
 * - Sample Talent submissions
 */

require("dotenv").config();
const connectDB = require("./src/configs/Database");
const User = require("./src/models/User");
const Movie = require("./src/models/Movie");
const Series = require("./src/models/Series");
const Episode = require("./src/models/Episode");
const Talent = require("./src/models/Talent");

const seed = async () => {
  try {
    await connectDB();

    console.log("🌱 Starting seed...");

    // Clean previous seed data (optional)
    // await Movie.deleteMany({});
    // await Series.deleteMany({});
    // await Episode.deleteMany({});
    // await Talent.deleteMany({});

    // 1. Create Admin
    const adminExists = await User.findOne({ email: process.env.ADMIN_EMAIL || "admin@talenthunt.com" });
    if (!adminExists) {
      await User.create({
        name: "Admin",
        email: process.env.ADMIN_EMAIL || "admin@talenthunt.com",
        password: process.env.ADMIN_PASSWORD || "Admin@123",
        role: "admin",
        isVerified: true,
      });
      console.log("✅ Admin user created");
    } else {
      console.log("ℹ️ Admin already exists");
    }

    // 2. Sample Movies (matching frontend style)
    const moviesData = [
      {
        title: "Velocity Protocol",
        description: "A high-octane thriller about a secret protocol that can change the future.",
        thumbnail: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=800",
        poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        duration: 128,
        genres: ["Action", "Sci-Fi"],
        rating: 8.4,
        releaseYear: 2025,
        isTrending: true,
        isNewRelease: true,
        cast: [
          { name: "Chris Evans", image: "https://i.pravatar.cc/150?img=12", character: "Agent Kane" },
          { name: "Zendaya", image: "https://i.pravatar.cc/150?img=47", character: "Dr. Lira" },
        ],
      },
      {
        title: "The Silent Echo",
        description: "In a world where sound is currency, one man discovers the power of silence.",
        thumbnail: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=800",
        poster: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=1200",
        videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        duration: 142,
        genres: ["Drama", "Sci-Fi"],
        rating: 7.9,
        releaseYear: 2024,
        isTrending: true,
        cast: [
          { name: "Emma Stone", image: "https://i.pravatar.cc/150?img=32", character: "Elara" },
        ],
      },
      {
        title: "Shadow Ops",
        description: "Elite operatives take on an impossible mission in the heart of enemy territory.",
        thumbnail: "https://images.unsplash.com/photo-1518929458119-e5bf444c30f4?q=80&w=800",
        poster: "https://images.unsplash.com/photo-1509347528160-9a9e33742cdb?q=80&w=1200",
        duration: 115,
        genres: ["Action"],
        rating: 8.1,
        releaseYear: 2025,
        isNewRelease: true,
      },
      {
        title: "Autumn Leaves",
        description: "A heartfelt story of love, loss and second chances in a small mountain town.",
        thumbnail: "https://images.unsplash.com/photo-1513607366320-f4e2e09f70d8?q=80&w=800",
        poster: "https://images.unsplash.com/photo-1516280440614-37939bbacd81?q=80&w=1200",
        duration: 105,
        genres: ["Drama", "Romance"],
        rating: 7.6,
        releaseYear: 2024,
      },
    ];

    await Movie.deleteMany({});
    await Movie.insertMany(moviesData);
    console.log(`✅ Seeded ${moviesData.length} movies`);

    // 3. Sample Series + Episodes
    await Series.deleteMany({});
    await Episode.deleteMany({});

    const series = await Series.create({
      title: "The Last World",
      description: "Survivors of a collapsed civilization fight to rebuild while uncovering dark secrets.",
      thumbnail: "https://images.unsplash.com/photo-1517604931442-7e0c8ed2963c?q=80&w=800",
      poster: "https://images.unsplash.com/photo-1489599849927-2ee91cede3ba?q=80&w=1200",
      genres: ["Sci-Fi", "Drama"],
      rating: 8.7,
      releaseYear: 2024,
      numberOfSeasons: 2,
      isTrending: true,
    });

    const episodes = [
      { series: series._id, seasonNumber: 1, episodeNumber: 1, title: "The Awakening", thumbnail: "https://picsum.photos/400/600?random=10", duration: 52 },
      { series: series._id, seasonNumber: 1, episodeNumber: 2, title: "Broken Sky", thumbnail: "https://picsum.photos/400/600?random=11", duration: 48 },
      { series: series._id, seasonNumber: 2, episodeNumber: 1, title: "New Dawn", thumbnail: "https://picsum.photos/400/600?random=12", duration: 55 },
    ];

    await Episode.insertMany(episodes);
    console.log("✅ Seeded sample series + episodes");

    // 4. Sample Talent
    await Talent.deleteMany({});

    const talentData = [
      {
        name: "Aarav Sharma",
        category: "Actor",
        bio: "Method actor from Mumbai with 6 years of theatre experience.",
        location: "Mumbai, India",
        thumbnail: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?q=80&w=800",
        auditionVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/BigBuckBunny.mp4",
        votes: 1240,
        status: "featured",
        isFeatured: true,
      },
      {
        name: "Priya Malhotra",
        category: "Singer",
        bio: "Soulful voice that can make you cry in 10 seconds.",
        location: "Delhi",
        thumbnail: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?q=80&w=800",
        auditionVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ElephantsDream.mp4",
        votes: 980,
        status: "approved",
      },
      {
        name: "Rohan Verma",
        category: "Dancer",
        bio: "Contemporary + Hip-hop fusion specialist.",
        location: "Bangalore",
        thumbnail: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?q=80&w=800",
        auditionVideo: "https://commondatastorage.googleapis.com/gtv-videos-bucket/sample/ForBiggerEscapes.mp4",
        votes: 760,
        status: "approved",
      },
    ];

    await Talent.insertMany(talentData);
    console.log(`✅ Seeded ${talentData.length} talent entries`);

    console.log("\n🎉 Seeding completed successfully!");
    console.log("You can now login with admin or create normal users.");
    process.exit(0);
  } catch (error) {
    console.error("❌ Seeding failed:", error);
    process.exit(1);
  }
};

seed();
