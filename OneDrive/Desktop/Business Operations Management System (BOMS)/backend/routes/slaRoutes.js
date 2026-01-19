const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { slaStats } = require("../controllers/slaController");

const router = express.Router();

router.get("/stats", protect, authorizeRoles("admin"), slaStats);

module.exports = router;
