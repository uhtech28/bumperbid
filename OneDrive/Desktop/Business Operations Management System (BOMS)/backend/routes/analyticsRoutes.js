const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const {
  tasksPerDay,
  tasksByStatus,
  tasksByPriority,
  staffWorkload,
  overdueStats,
  completionRate
} = require("../controllers/analyticsController");

const router = express.Router();

router.get("/tasks/daily", protect, authorizeRoles("admin"), tasksPerDay);
router.get("/tasks/status", protect, authorizeRoles("admin"), tasksByStatus);
router.get("/tasks/priority", protect, authorizeRoles("admin"), tasksByPriority);
router.get("/staff/workload", protect, authorizeRoles("admin"), staffWorkload);
router.get("/tasks/overdue", protect, authorizeRoles("admin"), overdueStats);
router.get("/tasks/completion-rate", protect, authorizeRoles("admin"), completionRate);

module.exports = router;
