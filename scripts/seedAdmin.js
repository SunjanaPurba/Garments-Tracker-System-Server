// scripts/seedAdmin.js
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("../models/User");
const dns = require("dns");

async function seedAdmin() {
  try {
    console.log("🔗 Connecting to MongoDB...");

    dns.setServers(["8.8.8.8", "8.8.4.4"]);

    await mongoose.connect(process.env.MONGODB_URI, {
      serverSelectionTimeoutMS: 5000,
    });

    console.log("✅ Connected to MongoDB");

    const users = [
      {
        email: "admin@garmentpro.com",
        name: "Admin User",
        role: "admin",
        status: "approved",
      },
      {
        email: "manager@garmentpro.com",
        name: "Manager User",
        role: "manager",
        status: "approved",
      },
    ];

    for (const userData of users) {
      const exists = await User.findOne({ email: userData.email });

      if (exists) {
        console.log(`⚠️ ${userData.role} already exists: ${userData.email}`);
      } else {
        await User.create(userData);
        console.log(`✅ ${userData.role} created: ${userData.email}`);
      }
    }

    console.log("\n📊 Admin & Manager List:");
    const list = await User.find({ role: { $in: ["admin", "manager"] } });
    list.forEach((u) => console.log(`- ${u.name} | ${u.email} | ${u.role}`));

    await mongoose.disconnect();
    console.log("\n✅ Seeding completed");
  } catch (error) {
    console.error("❌ MongoDB Error:", error);
    process.exit(1);
  }
}

seedAdmin();
