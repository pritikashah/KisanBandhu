const express = require("express");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  getAllUsers,
  getUserById,
} = require("../controllers/adminController");

const router = express.Router();

router.get(
  "/users",
  protect,
  authorizeRoles("admin"),
  getAllUsers
);

router.get(
  "/users/:id",
  protect,
  authorizeRoles("admin"),
  getUserById
);

module.exports = router;