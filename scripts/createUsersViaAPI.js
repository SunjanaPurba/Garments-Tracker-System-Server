// scripts/createUsersViaAPI.js
const axios = require("axios");

async function createUsersViaAPI() {
  const API_URL = "http://localhost:5000/api/users";

  // Admin user
  const adminData = {
    email: "admin@garmentpro.com",
    name: "Admin User",
    role: "admin",
    status: "approved",
  };

  // Manager user
  const managerData = {
    email: "manager@garmentpro.com",
    name: "Manager User",
    role: "manager",
    status: "approved",
  };

  try {
    console.log("Creating admin user...");
    const adminResponse = await axios.put(API_URL, adminData);
    console.log("✅ Admin created:", adminResponse.data.email);

    console.log("Creating manager user...");
    const managerResponse = await axios.put(API_URL, managerData);
    console.log("✅ Manager created:", managerResponse.data.email);
  } catch (error) {
    console.error("❌ Error:", error.response?.data || error.message);
  }
}

createUsersViaAPI();
