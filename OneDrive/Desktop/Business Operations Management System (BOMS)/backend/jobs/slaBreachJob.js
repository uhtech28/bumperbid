const cron = require("node-cron");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { getIO } = require("../socket");
const { isSLABreached } = require("../utils/slaUtils");

// Runs every 5 minutes
cron.schedule("*/5 * * * *", async () => {
  try {
    const tasks = await Task.find({
      status: { $ne: "completed" },
      isDeleted: false,
      slaBreached: false,
      deadline: { $ne: null },
    });

    for (const task of tasks) {
      if (isSLABreached(task)) {
        task.slaBreached = true;
        task.isOverdue = true;

        task.logs.push({
          action: "sla_breached",
          by: null,
        });

        await task.save();

        // Notify assigned user
        if (task.assignedTo) {
          const notification = await Notification.create({
            user: task.assignedTo,
            message: "⚠ SLA Breached for your task",
            type: "sla_breach",
          });

          const io = getIO();
          io.to(task.assignedTo.toString()).emit("notification", notification);
        }
      }
    }
  } catch (err) {
    console.error("SLA Job Error:", err.message);
  }
});
