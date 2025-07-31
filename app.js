const express = require("express");
const path = require("path");
const logger = require("morgan");
const fs = require("fs");
const cors = require("cors");
const graphql = require("./data-management/init-graphql");
const interoperationRouter = require("./routes/interoperation");

const LOG_FOLDER = "logs";
if (!fs.existsSync(LOG_FOLDER)) {
  fs.mkdirSync(LOG_FOLDER);
}

// create a write stream (in append mode)
const accessLogStream = fs.createWriteStream(
  path.join(__dirname, LOG_FOLDER, "access.log"),
  { flags: "a" }
);

const app = express();
const allowedOrigins = [
  "http://localhost:3000",
  "https://caninecommons-dev.cancer.gov",
  "https://caninecommons-qa.cancer.gov",
  "https://caninecommons-stage.cancer.gov",
  "https://caninecommons.cancer.gov",
  "https://caninecommons-test.cancer.gov",
  "https://internal-crdc-i-alb8a-ftoq5dvktc0w-373649459.us-east-1.elb.amazonaws.com",
  "http://internal-crdc-i-alb8a-ftoq5dvktc0w-373649459.us-east-1.elb.amazonaws.com",
];

app.use(
  cors({
    origin: function (origin, callback) {
      if (!origin || allowedOrigins.includes(origin)) {
        callback(null, true);
      } else {
        callback(new Error("Not allowed by CORS"));
      }
    },
    methods: ["GET", "HEAD", "PUT", "PATCH", "POST", "DELETE"],
    allowedHeaders: ["Content-Type"],
  })
);

// setup the logger
app.use(logger("combined", { stream: accessLogStream }));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use("/api/interoperation", interoperationRouter);
app.use("/api/interoperation/graphql", graphql);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next({ status: 404, message: `Path: '${req.path}' is not supported!` });
});

// error handler
app.use(function (err, req, res, next) {
  const message = req.app.get("env") === "development" ? err.message : "error";

  // render the error page
  res.status(err.status || 500);
  res.json(message);
});

module.exports = app;
