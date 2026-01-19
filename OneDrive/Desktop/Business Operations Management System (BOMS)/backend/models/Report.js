const mongoose = require("mongoose");

const reportSchema = new mongoose.Schema(
  {
    name: String,
    type: String,
    generatedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    filePath: String,
  },
  { timestamps: true }
);

module.exports = mongoose.model("Report", reportSchema);
