const User = require("../models/User");

// Auto-creates the admin account on server startup if it doesn't exist.
// Credentials can be overridden via ADMIN_EMAIL / ADMIN_PASSWORD env vars.
const seedAdminUser = async () => {
  try {
    const email = process.env.ADMIN_EMAIL || "admin@talenthunt.com";
    const exists = await User.findOne({ email });
    if (exists) return;

    await User.create({
      name: "Admin",
      email,
      password: process.env.ADMIN_PASSWORD || "Admin@123",
      role: "admin",
      isVerified: true,
      phone: "",
    });

    console.log(`✅ Admin account created: ${email} / (see ADMIN_PASSWORD env or default Admin@123)`);
  } catch (err) {
    // Non-fatal — server continues even if seed fails (e.g. DB not ready yet)
    console.warn("⚠️  Could not auto-seed admin user:", err.message);
  }
};

module.exports = seedAdminUser;
