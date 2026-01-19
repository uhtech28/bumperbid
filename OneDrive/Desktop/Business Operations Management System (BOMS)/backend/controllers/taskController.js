const { getIO } = require("../socket");
const Task = require("../models/Task");
const User = require("../models/User");
const Notification = require("../models/Notification");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// ===============================
// Workflow Rules
// ===============================
const validTransitions = {
  pending: ["in-progress"],
  "in-progress": ["completed"],
  completed: ["archived"],
  archived: [],
};

// ===============================
// Score Calculator
// ===============================
const calculateScore = (user) => {
  return (
    user.performance.completedTasks * 5 -
    user.performance.slaBreaches * 3 -
    user.performance.avgCompletionTime * 0.2
  );
};

// ===============================
// CREATE TASK
// ===============================
exports.createTask = catchAsync(async (req, res, next) => {
  const { title, description, client, assignedTo, priority, deadline } = req.body;

  const task = await Task.create({
    title,
    description,
    client,
    assignedTo,
    priority,
    deadline,
    createdBy: req.user._id,
  });

  task.logs.push({ action: "task_created", by: req.user._id });
  await task.save();

  const io = getIO();
  io.emit("dashboard:update");

  if (assignedTo) {
    const staff = await User.findById(assignedTo);
    staff.performance.totalAssigned += 1;
    staff.performance.score = calculateScore(staff);
    await staff.save();

    const notification = await Notification.create({
      user: assignedTo,
      message: "A new task has been assigned to you",
      type: "task_assigned",
    });

    io.to(assignedTo.toString()).emit("notification", notification);
  }

  res.status(201).json(task);
});

// ===============================
// GET ALL TASKS (ADMIN)
// ===============================
exports.getAllTasks = catchAsync(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const { status, priority, search, sortBy, order } = req.query;

  let filter = { isDeleted: false };

  if (status) filter.status = status;
  if (priority) filter.priority = priority;
  if (search) filter.title = { $regex: search, $options: "i" };

  let sortOptions = {};
  if (sortBy) sortOptions[sortBy] = order === "desc" ? -1 : 1;
  else sortOptions.createdAt = -1;

  const totalTasks = await Task.countDocuments(filter);

  const tasks = await Task.find(filter)
    .populate("client", "name email")
    .populate("assignedTo", "name email")
    .populate("createdBy", "name email")
    .sort(sortOptions)
    .skip(skip)
    .limit(limit);

  res.json({
    page,
    totalPages: Math.ceil(totalTasks / limit),
    totalTasks,
    tasks,
  });
});

// ===============================
// STAFF TASKS
// ===============================
exports.getMyTasks = catchAsync(async (req, res) => {
  const tasks = await Task.find({
    assignedTo: req.user._id,
    isDeleted: false,
  });

  res.json(tasks);
});

// ===============================
// CLIENT TASKS
// ===============================
exports.getClientTasks = catchAsync(async (req, res) => {
  const tasks = await Task.find({
    client: req.user._id,
    isDeleted: false,
  });

  res.json(tasks);
});

// ===============================
// UPDATE TASK STATUS
// ===============================
exports.updateTaskStatus = catchAsync(async (req, res, next) => {
  const { status } = req.body;
  const task = req.task;

  if (!task) return next(new AppError("Task not found", 404));

  if (task.status === "archived") {
    return next(new AppError("Archived tasks cannot be modified", 400));
  }

  if (!validTransitions[task.status].includes(status)) {
    return next(
      new AppError(`Invalid transition from ${task.status} to ${status}`, 400)
    );
  }

  const oldStatus = task.status;
  task.status = status;

  task.logs.push({
    action: "status_change",
    from: oldStatus,
    to: status,
    by: req.user._id,
  });

  // ===============================
  // PERFORMANCE UPDATE ON COMPLETION
  // ===============================
  if (status === "completed" && task.assignedTo) {
    const staff = await User.findById(task.assignedTo);

    const completionTime =
      (Date.now() - task.createdAt.getTime()) / (1000 * 60 * 60); // hours

    staff.performance.completedTasks += 1;
    staff.performance.avgCompletionTime =
      (staff.performance.avgCompletionTime + completionTime) / 2;

    if (task.slaBreached) {
      staff.performance.slaBreaches += 1;
    }

    staff.performance.score = calculateScore(staff);
    await staff.save();
  }

  await task.save();

  const io = getIO();
  io.emit("dashboard:update");

  if (task.assignedTo) {
    const notification = await Notification.create({
      user: task.assignedTo,
      message: `Task status changed from ${oldStatus} to ${status}`,
      type: "status_changed",
    });

    io.to(task.assignedTo.toString()).emit("notification", notification);
  }

  res.json(task);
});

// ===============================
// ASSIGN / REASSIGN TASK
// ===============================
exports.assignTask = catchAsync(async (req, res, next) => {
  const { assignedTo } = req.body;

  const task = await Task.findById(req.params.id);
  if (!task) return next(new AppError("Task not found", 404));

  const staff = await User.findById(assignedTo);
  if (!staff || staff.role !== "staff") {
    return next(new AppError("Invalid staff user", 400));
  }

  const oldAssignee = task.assignedTo;
  task.assignedTo = assignedTo;

  task.logs.push({
    action: "reassigned",
    from: oldAssignee,
    to: assignedTo,
    by: req.user._id,
  });

  await task.save();

  staff.performance.totalAssigned += 1;
  staff.performance.score = calculateScore(staff);
  await staff.save();

  const io = getIO();
  io.emit("dashboard:update");

  const notification = await Notification.create({
    user: assignedTo,
    message: "You have been assigned a new task",
    type: "task_assigned",
  });

  io.to(assignedTo.toString()).emit("notification", notification);

  res.json({
    message: "Task assigned successfully",
    task,
  });
});

// ===============================
// SOFT DELETE TASK
// ===============================
exports.softDeleteTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new AppError("Task not found", 404));

  task.isDeleted = true;
  task.deletedAt = new Date();

  task.logs.push({
    action: "soft_deleted",
    by: req.user._id,
  });

  await task.save();

  const io = getIO();
  io.emit("dashboard:update");

  res.json({ message: "Task soft deleted", task });
});

// ===============================
// RESTORE TASK
// ===============================
exports.restoreTask = catchAsync(async (req, res, next) => {
  const task = await Task.findById(req.params.id);
  if (!task) return next(new AppError("Task not found", 404));

  task.isDeleted = false;
  task.deletedAt = null;

  task.logs.push({
    action: "restored",
    by: req.user._id,
  });

  await task.save();

  const io = getIO();
  io.emit("dashboard:update");

  res.json({ message: "Task restored", task });
});
