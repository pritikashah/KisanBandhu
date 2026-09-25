const express = require("express");

const { protect } = require("../middleware/authMiddleware");

const {
  createCrop,
  getAllCrops,
  getCropsByFarm,
  getCropById,
  updateCrop,
  deleteCrop,
} = require("../controllers/cropController");

const router = express.Router();

router.post("/", protect, createCrop);

router.get("/", protect, getAllCrops);

router.get("/farm/:farmId", protect, getCropsByFarm);

router.get("/:id", protect, getCropById);

router.put("/:id", protect, updateCrop);

router.delete("/:id", protect, deleteCrop);

module.exports = router;