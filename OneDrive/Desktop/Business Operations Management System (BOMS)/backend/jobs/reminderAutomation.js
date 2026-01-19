const cron = require("node-cron");
const Task = require("../models/Task");
const Notification = require("../models/Notification");
const { getIO } = require("../socket");

// Runs every 10 minutes
cron.schedule("*/10 * * * *", async () => {
  try {
    const now = new Date();

    const tasks = await Task.find({
      status: { $nin: ["completed", "archived"] },
      deadline: { $ne: null },
      isDeleted: false,
    });

    for (const task of tasks) {
      const diffMs = new Date(task.deadline) - now;
      const diffHours = diffMs / (1000 * 60 * 60);

      if (diffHours <= 24 && diffHours > 0) {
        const shouldSend =
          !task.lastReminderSentAt ||
          (now - task.lastReminderSentAt) / (1000 * 60 * 60) >= 6;

        if (shouldSend && task.assignedTo) {
          const notification = await Notification.create({
            user: task.assignedTo,
            message: `⏰ Reminder: Task "${task.title}" is due soon`,
            type: "deadline_reminder",
          });

          task.lastReminderSentAt = now;
          task.reminderCount += 1;

          task.logs.push({
            action: "reminder_sent",
            by: null,
          });

          await task.save();

          const io = getIO();
          io.to(task.assignedTo.toString()).emit("notification", notification);
        }
      }
    }
  } catch (err) {
    console.error("Reminder Job Error:", err.message);
  }
});
