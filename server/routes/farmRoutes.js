const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  createFarm,
  getFarms,
  getFarmById,
  updateFarm,
  deleteFarm,
} = require("../controllers/farmController");

const router = express.Router();

router.post("/", protect, createFarm);

router.get("/", protect, getFarms);

router.get("/:id", protect, getFarmById);

router.put("/:id", protect, updateFarm);

router.delete("/:id", protect, deleteFarm);

module.exports = router;