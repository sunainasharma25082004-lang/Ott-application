const mongoose = require("mongoose");
const Movie = require("./server/src/models/Movie");

const MONGO_URI = "mongodb+srv://vizdigitalofficial_db_user:r17bIUQAaGOUkQem@ottapp01.253qrvl.mongodb.net/test?retryWrites=true&w=majority";

async function checkMovies() {
  console.log("Connecting to live database to inspect movies...");
  try {
    await mongoose.connect(MONGO_URI);
    const movies = await Movie.find({}, "title videoUrl isTrending views");
    
    console.log("\n=================== LIVE MOVIES IN DATABASE ===================");
    movies.forEach((m, idx) => {
      console.log(`${idx + 1}. Title: ${m.title}`);
      console.log(`   URL:   ${m.videoUrl}`);
      console.log(`   Views: ${m.views || 0} | Trending: ${m.isTrending || false}`);
      console.log("------------------------------------------------------------");
    });
    console.log("==============================================================\n");

  } catch (err) {
    console.error("Error reading movies:", err);
  } finally {
    await mongoose.disconnect();
  }
}

checkMovies();
