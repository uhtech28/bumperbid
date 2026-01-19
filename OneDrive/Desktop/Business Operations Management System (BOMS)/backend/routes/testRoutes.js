const express = require("express");
const { protect } = require("../middlewares/authMiddleware");

const router = express.Router();

router.get("/public", (req, res) => {
  res.json({ message: "Public route working" });
});

router.get("/protected", protect, (req, res) => {
  res.json({
    message: "Protected route working",
    user: req.user,
  });
});

module.exports = router;
