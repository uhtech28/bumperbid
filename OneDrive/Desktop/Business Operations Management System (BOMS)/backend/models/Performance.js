const mongoose = require("mongoose");

const performanceSchema = new mongoose.Schema({
  staff: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  tasksCompleted: Number,
  slaBreaches: Number,
  avgCompletionTime: Number,
  score: Number,
}, { timestamps: true });

module.exports = mongoose.model("Performance", performanceSchema);
