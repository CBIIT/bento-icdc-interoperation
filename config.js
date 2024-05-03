const dotenv = require("dotenv");
dotenv.config();

const config = {
  version: process.env.VERSION,
  date: process.env.DATE,
  AWS_REGION: process.env.AWS_REGION,
  S3_ACCESS_KEY_ID: process.env.S3_ACCESS_KEY_ID,
  S3_SECRET_ACCESS_KEY: process.env.S3_SECRET_ACCESS_KEY,
  FILE_MANIFEST_BUCKET_NAME: process.env.FILE_MANIFEST_BUCKET_NAME,
  CLOUDFRONT_KEY_PAIR_ID: process.env.CLOUDFRONT_KEY_PAIR_ID,
  CLOUDFRONT_PRIVATE_KEY: process.env.CLOUDFRONT_PRIVATE_KEY,
  CLOUDFRONT_DOMAIN: process.env.CLOUDFRONT_DOMAIN,
  SIGNED_URL_EXPIRY_SECONDS: process.env.SIGNED_URL_EXPIRY_SECONDS,
};

function scanConfigObject(configObject) {
  if (!configObject.version) {
    configObject.version = "Version not set!";
  }
  if (!configObject.date) {
    configObject.date = new Date();
  }
  unsetVars = [];
  let filteredKeys = Object.keys(configObject).filter((key) => {
    return !["date", "version"].includes(key);
  });
  for (key in filteredKeys) {
    if (!configObject[filteredKeys[key]]) {
      unsetVars.push(filteredKeys[key]);
    }
  }
  if (unsetVars.length !== 0) {
    throw new Error(
      `The following environment variables are not set: ${unsetVars.join(", ")}`
    );
  }
}

scanConfigObject(config);

module.exports = config;
