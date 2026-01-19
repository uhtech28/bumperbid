const cron = require("node-cron");
const Task = require("../models/Task");
const Notification = require("../models/Notification");

cron.schedule("*/10 * * * *", async () => {
  const now = new Date();

  const tasks = await Task.find({
    status: { $ne: "completed" },
    isDeleted: false,
    slaBreached: false,
  });

  for (let task of tasks) {
    const createdTime = new Date(task.createdAt).getTime();
    const allowedTime = task.slaHours * 60 * 60 * 1000;

    if (now.getTime() - createdTime > allowedTime) {
      task.slaBreached = true;
      await task.save();

      if (task.assignedTo) {
        await Notification.create({
          user: task.assignedTo,
          message: "⚠ SLA Breach: Task overdue",
          type: "sla_breach",
        });
      }
    }
  }
});
