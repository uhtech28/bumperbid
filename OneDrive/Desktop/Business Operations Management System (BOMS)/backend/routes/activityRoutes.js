const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { getAllActivities } = require("../controllers/activityController");

const router = express.Router();

// Admin only
router.get("/", protect, authorizeRoles("admin"), getAllActivities);

module.exports = router;
