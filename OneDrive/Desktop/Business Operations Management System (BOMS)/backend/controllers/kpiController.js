const Task = require("../models/Task");
const catchAsync = require("../utils/catchAsync");

exports.slaSuccessRate = catchAsync(async (req, res) => {
  const total = await Task.countDocuments({ isDeleted: false });
  const breached = await Task.countDocuments({ slaBreached: true });

  const success = total === 0 ? 100 : Math.round(((total - breached) / total) * 100);

  res.json({
    totalTasks: total,
    slaBreached: breached,
    slaSuccessRate: success + "%"
  });
});

exports.taskAging = catchAsync(async (req, res) => {
  const tasks = await Task.find({ status: { $ne: "completed" }, isDeleted: false });

  const aging = tasks.map(t => ({
    id: t._id,
    daysOpen: Math.floor((Date.now() - new Date(t.createdAt)) / (1000 * 60 * 60 * 24))
  }));

  res.json(aging);
});
