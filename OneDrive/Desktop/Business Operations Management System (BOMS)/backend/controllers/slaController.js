const Task = require("../models/Task");
const catchAsync = require("../utils/catchAsync");

exports.slaStats = catchAsync(async (req, res) => {
  const breached = await Task.countDocuments({ slaBreached: true });
  const active = await Task.countDocuments({
    status: { $in: ["pending", "in-progress"] },
  });

  res.json({
    active,
    breached,
    healthy: active - breached,
  });
});
