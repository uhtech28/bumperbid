const User = require("../models/User");
const Task = require("../models/Task");

exports.getDashboardStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalTasks = await Task.countDocuments({ isDeleted: false });

    const pending = await Task.countDocuments({ status: "pending", isDeleted: false });
    const inProgress = await Task.countDocuments({ status: "in-progress", isDeleted: false });
    const completed = await Task.countDocuments({ status: "completed", isDeleted: false });
    const archived = await Task.countDocuments({ status: "archived", isDeleted: false });

    const overdue = await Task.countDocuments({ isOverdue: true, isDeleted: false });
    const slaBreached = await Task.countDocuments({ slaBreached: true, isDeleted: false });

    const priorityStats = await Task.aggregate([
      { $match: { isDeleted: false } },
      { $group: { _id: "$priority", count: { $sum: 1 } } },
    ]);

    res.json({
      users: totalUsers,
      tasks: {
        total: totalTasks,
        pending,
        inProgress,
        completed,
        archived,
        overdue,
        slaBreached,
      },
      priorityStats,
    });
  } catch (error) {
    console.error("Dashboard Error:", error);
    res.status(500).json({ message: "Dashboard error" });
  }
};
