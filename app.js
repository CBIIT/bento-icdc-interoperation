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
  "http://localhost:7000",
  "https://caninecommons-dev.cancer.gov",
  "https://caninecommons-qa.cancer.gov",
  "https://caninecommons-stage.cancer.gov",
  "https://caninecommons.cancer.gov",
  "https://caninecommons-test.cancer.gov",
];

// Match any internal CRDC ALB domain
const awsRegions = [
  "us-east-1", "us-east-2", "us-west-1", "us-west-2",
];
const awsRegionPattern = awsRegions.join("|");
const internalCrdcAlbRegex = new RegExp(
  `^https://internal-crdc-i-[a-z0-9-]+-[a-z0-9]+-[0-9]+\\.(${awsRegionPattern})\\.elb\\.amazonaws\\.com$`
);

function isAllowedOrigin(origin) {
  if (!origin) return true;
  if (allowedOrigins.includes(origin)) return true;
  if (internalCrdcAlbRegex.test(origin)) return true;

  return false;
}

app.use(
  cors({
    origin: function (origin, callback) {
      if (isAllowedOrigin(origin)) {
        callback(null, true);
      } else {
        console.warn("Origin blocked by CORS policy");
        callback(new Error("Not allowed by CORS"));
      }
    },
    credentials: true,
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
