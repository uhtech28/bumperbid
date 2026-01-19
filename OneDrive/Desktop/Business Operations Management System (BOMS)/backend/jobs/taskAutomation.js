const cron = require("node-cron");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { getIO } = require("../socket");

// Runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    const now = new Date();

    const overdueTasks = await Task.find({
      deadline: { $lt: now },
      status: { $nin: ["completed", "archived"] },
      isDeleted: false,
    });

    for (let task of overdueTasks) {
      if (!task.isOverdue) {
        task.isOverdue = true;

        task.logs.push({
          action: "auto_marked_overdue",
          by: null,
        });

        await task.save();

        if (task.assignedTo) {
          const notification = await Notification.create({
            user: task.assignedTo,
            message: `Task "${task.title}" is overdue`,
            type: "overdue_alert",
          });

          // Real-time alert
          const io = getIO();
          io.to(task.assignedTo.toString()).emit("notification", notification);
        }
      }
    }

    console.log("⏰ Overdue check completed");
  } catch (err) {
    console.error("Overdue job error:", err);
  }
});
