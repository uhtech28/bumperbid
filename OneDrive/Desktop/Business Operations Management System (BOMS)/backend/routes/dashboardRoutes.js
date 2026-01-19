const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { getDashboardStats } = require("../controllers/dashboardController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Dashboard
 *   description: Dashboard analytics and stats
 */

/**
 * @swagger
 * /api/dashboard/stats:
 *   get:
 *     summary: Get dashboard statistics (Admin only)
 *     tags: [Dashboard]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Dashboard statistics
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 users:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 120
 *                 tasks:
 *                   type: object
 *                   properties:
 *                     total:
 *                       type: number
 *                       example: 450
 *                     pending:
 *                       type: number
 *                       example: 100
 *                     inProgress:
 *                       type: number
 *                       example: 200
 *                     completed:
 *                       type: number
 *                       example: 130
 *                     archived:
 *                       type: number
 *                       example: 20
 *                 overdueTasks:
 *                   type: number
 *                   example: 15
 *                 priorityStats:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: high
 *                       count:
 *                         type: number
 *                         example: 50
 *                 staffWorkload:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       _id:
 *                         type: string
 *                         example: 65abc123
 *                       taskCount:
 *                         type: number
 *                         example: 20
 *       401:
 *         description: Unauthorized
 *       403:
 *         description: Forbidden
 */

router.get("/stats", protect, authorizeRoles("admin"), getDashboardStats);

module.exports = router;
