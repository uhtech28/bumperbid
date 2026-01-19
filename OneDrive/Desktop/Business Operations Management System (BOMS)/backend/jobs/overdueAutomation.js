const cron = require("node-cron");
const Task = require("../models/Task");

cron.schedule("*/5 * * * *", async () => {
  try {
    const now = new Date();

    await Task.updateMany(
      {
        deadline: { $lt: now },
        status: { $ne: "completed" },
        isDeleted: false,
      },
      { isOverdue: true }
    );
  } catch (err) {
    console.error("Overdue Automation Error:", err);
  }
});
