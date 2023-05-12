const dotenv = require("dotenv");
dotenv.config();

const config = {
  version: process.env.VERSION,
  date: process.env.DATE,
  BENTO_BACKEND_GRAPHQL_URI: process.env.BENTO_BACKEND_GRAPHQL_URI,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  CLOUDFRONT_KEY_PAIR_ID: process.env.CLOUDFRONT_KEY_PAIR_ID,
  CLOUDFRONT_PRIVATE_KEY: process.env.CLOUDFRONT_PRIVATE_KEY,
};

if (!config.version) {
  config.version = "Version not set";
}

if (!config.date) {
  config.date = new Date();
}

if (!config.S3_ACCESS_KEY_ID) {
  throw new Error("S3_ACCESS_KEY_ID is not set!");
}

if (!config.S3_SECRET_ACCESS_KEY) {
  throw new Error("S3_SECRET_ACCESS_KEY is not set!");
}

if (!config.CLOUDFRONT_KEY_PAIR_ID) {
  throw new Error("CLOUDFRONT_KEY_PAIR_ID is not set!");
}

if (!config.CLOUDFRONT_PRIVATE_KEY) {
  throw new Error("CLOUDFRONT_PRIVATE_KEY is not set!");
}

module.exports = config;
