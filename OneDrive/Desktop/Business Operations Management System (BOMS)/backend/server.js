const express = require("express");
const dotenv = require("dotenv");
const cors = require("cors");
const helmet = require("helmet");
const rateLimit = require("express-rate-limit");
const morgan = require("morgan");
const logger = require("./utils/logger");
const swaggerUi = require("swagger-ui-express");
const swaggerSpec = require("./utils/swagger");

// 🔥 Background Jobs
require("./jobs/taskAutomation");
require("./jobs/slaBreachJob");
require("./jobs/reminderAutomation");
require("./jobs/overdueAutomation");
require("./jobs/priorityEscalation");

dotenv.config();

// DB
const connectDB = require("./config/db");
connectDB();

// Routes
const authRoutes = require("./routes/authRoutes");
const testRoutes = require("./routes/testRoutes");
const userRoutes = require("./routes/userRoutes");
const taskRoutes = require("./routes/taskRoutes");
const dashboardRoutes = require("./routes/dashboardRoutes");
const notificationRoutes = require("./routes/notificationRoutes");
const reportRoutes = require("./routes/reportRoutes");
const activityRoutes = require("./routes/activityRoutes");
const analyticsRoutes = require("./routes/analyticsRoutes");
const slaRoutes = require("./routes/slaRoutes");
const kpiRoutes = require("./routes/kpiRoutes");
const errorHandler = require("./middlewares/errorHandler");

// 🔥 CREATE APP FIRST
const app = express();

// 🔐 Security
app.use(helmet());

// ✅ CORS — FIXED
app.use(
  cors({
    origin: ["http://localhost:3000", "http://localhost:3001"],
    methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  })
);

// JSON parser
app.use(express.json());

// 📜 Logger
app.use(
  morgan("combined", {
    stream: {
      write: (message) => logger.info(message.trim()),
    },
  })
);

// 🚦 Rate limiter
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 100,
  message: "Too many requests, please try again later.",
});
app.use(limiter);

// 🚀 Routes
app.use("/api/auth", authRoutes);
app.use("/api/test", testRoutes);
app.use("/api/users", userRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/dashboard", dashboardRoutes);
app.use("/api/notifications", notificationRoutes);
app.use("/api/reports", reportRoutes);
app.use("/api/activities", activityRoutes);
app.use("/api/analytics", analyticsRoutes);
app.use("/api/sla", slaRoutes);
app.use("/api/kpis", kpiRoutes);

// Swagger
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

app.get("/", (req, res) => {
  res.send("BOMS Backend Running");
});

// ❗ Global Error Handler (LAST)
app.use(errorHandler);

// Server
const PORT = process.env.PORT || 5000;
const http = require("http");
const server = http.createServer(app);

// Socket
const socket = require("./socket");
socket.init(server);

server.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
