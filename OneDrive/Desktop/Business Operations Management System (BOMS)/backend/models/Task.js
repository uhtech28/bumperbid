const mongoose = require("mongoose");

const logSchema = new mongoose.Schema(
  {
    action: String,
    from: String,
    to: String,
    by: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    at: {
      type: Date,
      default: Date.now,
    },
  },
  { _id: false }
);

const taskSchema = new mongoose.Schema(
  {
    title: { type: String, required: true },
    description: String,

    client: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    assignedTo: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },

    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    status: {
      type: String,
      enum: ["pending", "in-progress", "completed", "archived"],
      default: "pending",
    },

    priority: {
      type: String,
      enum: ["low", "medium", "high", "urgent"],
      default: "medium",
    },

    deadline: Date,

    // 🔥 SLA SYSTEM FIELDS
    slaHours: {
      type: Number,
      default: 48, // SLA = 48 hours by default
    },

    slaBreached: {
      type: Boolean,
      default: false,
    },

    isOverdue: {
      type: Boolean,
      default: false,
    },
    lastReminderSentAt: {
  type: Date,
},

reminderCount: {
  type: Number,
  default: 0,
},


    // 🗑 Soft delete
    isDeleted: {
      type: Boolean,
      default: false,
    },

    deletedAt: Date,

    logs: [logSchema],
  },
  { timestamps: true }
);

module.exports = mongoose.model("Task", taskSchema);
