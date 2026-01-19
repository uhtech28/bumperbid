const Notification = require("../models/Notification");
const catchAsync = require("../utils/catchAsync");
const AppError = require("../utils/AppError");

// ===============================
// GET USER NOTIFICATIONS
// ===============================
exports.getMyNotifications = catchAsync(async (req, res, next) => {
  const page = Number(req.query.page) || 1;
  const limit = Number(req.query.limit) || 10;
  const skip = (page - 1) * limit;

  const total = await Notification.countDocuments({ user: req.user._id });

  const notifications = await Notification.find({ user: req.user._id })
    .sort({ createdAt: -1 })
    .skip(skip)
    .limit(limit);

  res.json({
    page,
    totalPages: Math.ceil(total / limit),
    total,
    notifications,
  });
});

// ===============================
// UNREAD COUNT
// ===============================
exports.getUnreadCount = catchAsync(async (req, res, next) => {
  const count = await Notification.countDocuments({
    user: req.user._id,
    isRead: false,
  });

  res.json({ unread: count });
});

// ===============================
// MARK AS READ
// ===============================
exports.markAsRead = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  if (notification.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  notification.isRead = true;
  await notification.save();

  res.json({ message: "Notification marked as read" });
});

// ===============================
// MARK ALL AS READ
// ===============================
exports.markAllAsRead = catchAsync(async (req, res, next) => {
  await Notification.updateMany(
    { user: req.user._id, isRead: false },
    { isRead: true }
  );

  res.json({ message: "All notifications marked as read" });
});

// ===============================
// DELETE NOTIFICATION
// ===============================
exports.deleteNotification = catchAsync(async (req, res, next) => {
  const notification = await Notification.findById(req.params.id);

  if (!notification) {
    return next(new AppError("Notification not found", 404));
  }

  if (notification.user.toString() !== req.user._id.toString()) {
    return next(new AppError("Not authorized", 403));
  }

  await notification.deleteOne();

  res.json({ message: "Notification deleted" });
});
