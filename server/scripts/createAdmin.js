const dns = require("dns");

dns.setServers(["8.8.8.8"]);

const dotenv = require("dotenv");
const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const User = require("../models/User");

dotenv.config();

const createAdmin = async () => {
  try {
    if (
      !process.env.ADMIN_NAME ||
      !process.env.ADMIN_EMAIL ||
      !process.env.ADMIN_PHONE ||
      !process.env.ADMIN_PASSWORD
    ) {
      throw new Error(
        "ADMIN_NAME, ADMIN_EMAIL, ADMIN_PHONE, and ADMIN_PASSWORD must be present in .env."
      );
    }

    await mongoose.connect(
      process.env.MONGODB_URI
    );

    console.log("MongoDB connected.");

    const normalizedEmail =
      process.env.ADMIN_EMAIL
        .trim()
        .toLowerCase();

    const normalizedPhone =
      process.env.ADMIN_PHONE.trim();

    const existingAdmin =
      await User.findOne({
        role: "admin",
        $or: [
          {
            email: normalizedEmail,
          },
          {
            phone: normalizedPhone,
          },
        ],
      });

    if (existingAdmin) {
      console.log(
        "Administrator account already exists."
      );

      await mongoose.connection.close();

      return;
    }

    const passwordHash =
      await bcrypt.hash(
        process.env.ADMIN_PASSWORD,
        10
      );

    const admin = await User.create({
      name: process.env.ADMIN_NAME.trim(),
      email: normalizedEmail,
      phone: normalizedPhone,
      passwordHash,
      role: "admin",
      isActive: true,
    });

    console.log(
      `Administrator created successfully: ${admin.email}`
    );

    await mongoose.connection.close();
  } catch (error) {
    console.error(
      "Create admin error:",
      error.message
    );

    try {
      await mongoose.connection.close();
    } catch {}

    process.exit(1);
  }
};

createAdmin();