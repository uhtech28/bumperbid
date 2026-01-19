const Activity = require("../models/Activity");
const catchAsync = require("../utils/catchAsync");

// ===============================
// GET ALL ACTIVITIES (Admin)
// ===============================
exports.getAllActivities = catchAsync(async (req, res) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 20;
  const skip = (page - 1) * limit;

  const total = await Activity.countDocuments();

  const activities = await Activity.find()
    .populate("performedBy", "name email role")
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    page,
    totalPages: Math.ceil(total / limit),
    total,
    activities,
  });
});

