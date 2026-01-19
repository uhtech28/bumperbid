const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    name: { type: String, required: true },
    email: {
      type: String,
      required: true,
      unique: true,
      lowercase: true,
    },
    password: { type: String, required: true },
   role: {
  type: String,
  enum: ["admin", "manager", "staff", "client"],
  default: "client",
},
performance: {
  completedTasks: { type: Number, default: 0 },
  totalAssigned: { type: Number, default: 0 },
  slaBreaches: { type: Number, default: 0 },
  avgCompletionTime: { type: Number, default: 0 }, // in hours
  score: { type: Number, default: 0 },
},

  },
  { timestamps: true }
);

// Hash password
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});


// Compare password
userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
