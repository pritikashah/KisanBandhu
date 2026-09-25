const express = require("express");
const { protect } = require("../middleware/authMiddleware");

const router = express.Router();

router.get("/protected", protect, (req, res) => {
  return res.status(200).json({
    message: "You accessed a protected route successfully.",
    user: req.user,
  });
});

module.exports = router;