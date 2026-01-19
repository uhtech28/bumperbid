require("dotenv").config();
const express = require("express");
const cors = require("cors");
const swaggerJsdoc = require("swagger-jsdoc");
const swaggerUi = require("swagger-ui-express");

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// ====== TEST ROUTE ======
app.get("/", (req, res) => {
  res.send("BOMS Backend is running 🚀");
});

// ====== USERS DEMO ROUTE ======
app.get("/api/users", (req, res) => {
  res.json([
    {
      id: 1,
      name: "Admin User",
      email: "admin@test.com",
      role: "admin"
    },
    {
      id: 2,
      name: "Staff User",
      email: "staff@test.com",
      role: "staff"
    },
    {
      id: 3,
      name: "Client User",
      email: "client@test.com",
      role: "client"
    }
  ]);
});

// ====== SWAGGER CONFIG ======
const swaggerOptions = {
  definition: {
    openapi: "3.0.0",
    info: {
      title: "BOMS API",
      version: "1.0.0",
      description: "Business Operations Management System API"
    },
    servers: [
      {
        url: "http://localhost:5000"
      }
    ]
  },
  apis: ["./index.js"]
};

const swaggerSpec = swaggerJsdoc(swaggerOptions);
app.use("/api-docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ====== PORT ======
const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
  console.log(`📄 Swagger: http://localhost:${PORT}/api-docs`);
});
