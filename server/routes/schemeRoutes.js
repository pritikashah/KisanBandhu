const express = require("express");

const {
  protect,
  authorizeRoles,
} = require("../middleware/authMiddleware");

const {
  createScheme,
  getSchemes,
  getSchemeById,
  searchSchemes,
  updateScheme,
  deleteScheme,
} = require("../controllers/schemeController");

const router = express.Router();

router.get(
  "/search",
  protect,
  searchSchemes
);

router.get(
  "/",
  protect,
  getSchemes
);

router.get(
  "/:id",
  protect,
  getSchemeById
);

router.post(
  "/",
  protect,
  authorizeRoles("admin"),
  createScheme
);

router.put(
  "/:id",
  protect,
  authorizeRoles("admin"),
  updateScheme
);

router.delete(
  "/:id",
  protect,
  authorizeRoles("admin"),
  deleteScheme
);

module.exports = router;