const Task = require("../models/Task");
const User = require("../models/User");
const catchAsync = require("../utils/catchAsync");

// 📈 Tasks per day (last 30 days)
exports.tasksPerDay = catchAsync(async (req, res) => {
  const data = await Task.aggregate([
    {
      $match: { isDeleted: false }
    },
    {
      $group: {
        _id: {
          $dateToString: { format: "%Y-%m-%d", date: "$createdAt" }
        },
        count: { $sum: 1 }
      }
    },
    { $sort: { _id: 1 } }
  ]);

  res.json(data);
});

// 📊 Tasks by status
exports.tasksByStatus = catchAsync(async (req, res) => {
  const data = await Task.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$status",
        count: { $sum: 1 }
      }
    }
  ]);

  res.json(data);
});

// 🧠 Tasks by priority
exports.tasksByPriority = catchAsync(async (req, res) => {
  const data = await Task.aggregate([
    { $match: { isDeleted: false } },
    {
      $group: {
        _id: "$priority",
        count: { $sum: 1 }
      }
    }
  ]);

  res.json(data);
});

// 👨‍💼 Staff workload
exports.staffWorkload = catchAsync(async (req, res) => {
  const data = await Task.aggregate([
    {
      $match: {
        assignedTo: { $ne: null },
        isDeleted: false
      }
    },
    {
      $group: {
        _id: "$assignedTo",
        taskCount: { $sum: 1 }
      }
    },
    {
      $lookup: {
        from: "users",
        localField: "_id",
        foreignField: "_id",
        as: "staff"
      }
    },
    {
      $unwind: "$staff"
    },
    {
      $project: {
        _id: 0,
        staffId: "$staff._id",
        name: "$staff.name",
        taskCount: 1
      }
    }
  ]);

  res.json(data);
});

// ⏰ Overdue tasks trend
exports.overdueStats = catchAsync(async (req, res) => {
  const data = await Task.countDocuments({
    deadline: { $lt: new Date() },
    status: { $ne: "completed" },
    isDeleted: false
  });

  res.json({ overdueTasks: data });
});

// 📉 Completion rate
exports.completionRate = catchAsync(async (req, res) => {
  const total = await Task.countDocuments({ isDeleted: false });
  const completed = await Task.countDocuments({
    status: "completed",
    isDeleted: false
  });

  const rate = total === 0 ? 0 : Math.round((completed / total) * 100);

  res.json({
    total,
    completed,
    completionRate: rate + "%"
  });
});
