const dns = require("dns");

dns.setServers(["8.8.8.8"]);

const express = require("express");
const cors = require("cors");
const dotenv = require("dotenv");

const connectDB = require("../config/db");

const authRoutes = require("../routes/authRoutes");
const testRoutes = require("../routes/testRoutes");
const farmRoutes = require("../routes/farmRoutes");
const cropRoutes = require("../routes/cropRoutes");
const expenseRoutes = require("../routes/expenseRoutes");
const harvestRoutes = require("../routes/harvestRoutes");
const reminderRoutes = require("../routes/reminderRoutes");
const weatherRoutes = require("../routes/weatherRoutes");
const schemeRoutes = require("../routes/schemeRoutes");
const adminRoutes = require("../routes/adminRoutes");

dotenv.config();

const app = express();

app.use(cors());

app.use(express.json());

app.get("/", (req, res) => {
  res.json({
    message: "KisanBandhu API is running",
  });
});

app.use(
  "/api/auth",
  authRoutes
);

app.use(
  "/api/test",
  testRoutes
);

app.use(
  "/api/farms",
  farmRoutes
);

app.use(
  "/api/crops",
  cropRoutes
);

app.use(
  "/api/expenses",
  expenseRoutes
);

app.use(
  "/api/harvests",
  harvestRoutes
);

app.use(
  "/api/reminders",
  reminderRoutes
);

app.use(
  "/api/weather",
  weatherRoutes
);

app.use(
  "/api/schemes",
  schemeRoutes
);

app.use(
  "/api/admin",
  adminRoutes
);

const PORT =
  process.env.PORT || 5000;

const startServer = async () => {
  await connectDB();

  app.listen(PORT, () => {
    console.log(
      `KisanBandhu server running on port ${PORT}`
    );
  });
};

startServer();