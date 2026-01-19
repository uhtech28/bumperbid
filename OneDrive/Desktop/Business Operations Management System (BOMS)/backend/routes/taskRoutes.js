const express = require("express");
const { protect } = require("../middlewares/authMiddleware");
const authorizeRoles = require("../middlewares/authorizeRoles");
const { checkTaskOwnership } = require("../middlewares/taskOwnership");

const {
  createTask,
  getAllTasks,
  getMyTasks,
  getClientTasks,
  updateTaskStatus,
  assignTask,
  softDeleteTask,
  restoreTask,
} = require("../controllers/taskController");

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Tasks
 *   description: Task management APIs
 */

/**
 * @swagger
 * /api/tasks:
 *   post:
 *     summary: Create a new task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - title
 *               - client
 *             properties:
 *               title:
 *                 type: string
 *                 example: Design Landing Page
 *               description:
 *                 type: string
 *                 example: Create UI for homepage
 *               client:
 *                 type: string
 *                 example: 65abc12345
 *               assignedTo:
 *                 type: string
 *                 example: 65staff123
 *               priority:
 *                 type: string
 *                 example: high
 *               deadline:
 *                 type: string
 *                 format: date
 *     responses:
 *       201:
 *         description: Task created successfully
 */
router.post("/", protect, authorizeRoles("admin", "manager"), createTask);

/**
 * @swagger
 * /api/tasks:
 *   get:
 *     summary: Get all tasks (Admin only)
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: query
 *         name: status
 *         schema:
 *           type: string
 *       - in: query
 *         name: priority
 *         schema:
 *           type: string
 *       - in: query
 *         name: search
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: List of tasks
 */
router.get("/", protect, authorizeRoles("admin"), getAllTasks);

/**
 * @swagger
 * /api/tasks/my:
 *   get:
 *     summary: Get tasks assigned to logged-in staff
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Staff tasks
 */
router.get("/my", protect, authorizeRoles("staff"), getMyTasks);

/**
 * @swagger
 * /api/tasks/client:
 *   get:
 *     summary: Get tasks for logged-in client
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Client tasks
 */
router.get("/client", protect, authorizeRoles("client"), getClientTasks);

/**
 * @swagger
 * /api/tasks/{id}/status:
 *   put:
 *     summary: Update task status
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - status
 *             properties:
 *               status:
 *                 type: string
 *                 example: in-progress
 *     responses:
 *       200:
 *         description: Status updated
 */
router.put(
  "/:id/status",
  protect,
  authorizeRoles("staff", "admin", "manager"),
  checkTaskOwnership,
  updateTaskStatus
);

/**
 * @swagger
 * /api/tasks/{id}/assign:
 *   put:
 *     summary: Assign or reassign a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - assignedTo
 *             properties:
 *               assignedTo:
 *                 type: string
 *                 example: 65staff123
 *     responses:
 *       200:
 *         description: Task assigned
 */
router.put("/:id/assign", protect, authorizeRoles("admin", "manager"), assignTask);

/**
 * @swagger
 * /api/tasks/{id}:
 *   delete:
 *     summary: Soft delete a task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task soft deleted
 */
router.delete("/:id", protect, authorizeRoles("admin"), softDeleteTask);

/**
 * @swagger
 * /api/tasks/{id}/restore:
 *   put:
 *     summary: Restore a soft-deleted task
 *     tags: [Tasks]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Task restored
 */
router.put("/:id/restore", protect, authorizeRoles("admin"), restoreTask);

module.exports = router;
