const dotenv = require("dotenv");
dotenv.config();

const config = {
  version: process.env.VERSION,
  date: process.env.DATE,
  BENTO_BACKEND_GRAPHQL_URI: process.env.BENTO_BACKEND_GRAPHQL_URI,
};

if (!config.version) {
  config.version = "Version not set";
}

if (!config.date) {
  config.date = new Date();
}

module.exports = config;
