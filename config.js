const dotenv = require("dotenv");
dotenv.config();

// default signed URL expiration time
const DEFAULT_SIGNED_URL_EXPIRY_SECONDS = 60 * 60 * 24;

const config = {
  version: process.env.VERSION,
  date: process.env.DATE,
  BENTO_BACKEND_GRAPHQL_URI: process.env.BENTO_BACKEND_GRAPHQL_URI,
  REDIS_HOST: process.env.REDIS_HOST,
  REDIS_PORT: process.env.REDIS_PORT,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  CLOUDFRONT_DOMAIN: process.env.CLOUDFRONT_DOMAIN,
  CLOUDFRONT_KEY_PAIR_ID: process.env.CLOUDFRONT_KEY_PAIR_ID,
  CLOUDFRONT_PRIVATE_KEY: process.env.CLOUDFRONT_PRIVATE_KEY,
  SIGNED_URL_EXPIRY_SECONDS:
    process.env.SIGNED_URL_EXPIRY_SECONDS || DEFAULT_SIGNED_URL_EXPIRY_SECONDS,
};

if (!config.version) {
  config.version = "Version not set";
}

if (!config.date) {
  config.date = new Date();
}

// check if s3/cf env vars are set
// if not set, throw errors

module.exports = config;
