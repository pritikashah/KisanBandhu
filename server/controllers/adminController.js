const mongoose = require("mongoose");

const User = require("../models/User");

const getAllUsers = async (req, res) => {
  try {
    const users = await User.find(
      {},
      {
        passwordHash: 0,
      }
    ).sort({
      createdAt: -1,
    });

    return res.status(200).json({
      message:
        "Registered users fetched successfully.",
      count: users.length,
      users,
    });
  } catch (error) {
    console.error(
      "Get all users error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching registered users.",
    });
  }
};

const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    if (
      !mongoose.Types.ObjectId.isValid(id)
    ) {
      return res.status(400).json({
        message: "Invalid user ID.",
      });
    }

    const user = await User.findById(
      id,
      {
        passwordHash: 0,
      }
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      message:
        "User details fetched successfully.",
      user,
    });
  } catch (error) {
    console.error(
      "Get user by ID error:",
      error
    );

    return res.status(500).json({
      message:
        "Server error while fetching user details.",
    });
  }
};

module.exports = {
  getAllUsers,
  getUserById,
};