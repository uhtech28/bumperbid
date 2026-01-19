const Task = require("../models/Task");

exports.checkTaskOwnership = async (req, res, next) => {
  const task = await Task.findById(req.params.id);

  if (!task) {
    return res.status(404).json({ message: "Task not found" });
  }

  if (req.user.role === "admin" || req.user.role === "manager") {
    req.task = task;
    return next();
  }

  if (
    req.user.role === "staff" &&
    task.assignedTo?.toString() === req.user._id.toString()
  ) {
    req.task = task;
    return next();
  }

  return res.status(403).json({ message: "Unauthorized task access" });
};
