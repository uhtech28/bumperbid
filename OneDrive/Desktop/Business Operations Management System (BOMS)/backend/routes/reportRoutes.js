const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");

const {
  generateTaskReport,
  exportTasksCSV,
  downloadReport,
} = require("../controllers/reportController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Reports
 *   description: System reports and exports
 */

/**
 * @swagger
 * /api/reports/tasks/pdf:
 *   get:
 *     summary: Generate PDF report for all tasks
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: PDF report generated
 */
router.get("/tasks/pdf", protect, authorizeRoles("admin"), generateTaskReport);

/**
 * @swagger
 * /api/reports/tasks/csv:
 *   get:
 *     summary: Export tasks as CSV
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: CSV exported successfully
 */
router.get("/tasks/csv", protect, authorizeRoles("admin"), exportTasksCSV);

/**
 * @swagger
 * /api/reports/download/{id}:
 *   get:
 *     summary: Download generated report
 *     tags: [Reports]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         description: Report ID
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Report downloaded
 */
router.get("/download/:id", protect, authorizeRoles("admin"), downloadReport);

module.exports = router;
