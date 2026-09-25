const express = require("express");

const {
  protect,
} = require("../middleware/authMiddleware");

const {
  createHarvest,
  getHarvests,
  getHarvestById,
  updateHarvest,
  deleteHarvest,
} = require("../controllers/harvestController");

const router = express.Router();

router.post("/", protect, createHarvest);

router.get("/", protect, getHarvests);

router.get(
  "/:id",
  protect,
  getHarvestById
);

router.put(
  "/:id",
  protect,
  updateHarvest
);

router.delete(
  "/:id",
  protect,
  deleteHarvest
);

module.exports = router;