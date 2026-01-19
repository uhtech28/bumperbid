const cron = require("node-cron");
const Task = require("../models/Task");

cron.schedule("*/15 * * * *", async () => {
  const now = new Date();

  const tasks = await Task.find({
    status: { $ne: "completed" },
    isDeleted: false,
  });

  for (let task of tasks) {
    if (!task.deadline) continue;

    const timeLeft = new Date(task.deadline).getTime() - now.getTime();

    if (timeLeft < 6 * 60 * 60 * 1000 && task.priority === "medium") {
      task.priority = "high";
      await task.save();
    }

    if (timeLeft < 2 * 60 * 60 * 1000 && task.priority === "high") {
      task.priority = "urgent";
      await task.save();
    }
  }
});
