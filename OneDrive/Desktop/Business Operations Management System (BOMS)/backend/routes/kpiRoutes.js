const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { slaSuccessRate, taskAging } = require("../controllers/kpiController");

const router = express.Router();

router.get("/sla-success", protect, authorizeRoles("admin"), slaSuccessRate);
router.get("/task-aging", protect, authorizeRoles("admin"), taskAging);

module.exports = router;
