const { removeTrailingSlashes } = require('./utils');
const fs = require('fs');
const dotenv = require('dotenv')
dotenv.config();
const DEFAULT_EXPIRATION_SECONDS = 60 * 60 * 24; // 24 hours

const INDEXD = 'INDEXD';
const CLOUD_FRONT = 'CLOUD_FRONT';
const LOCAL = 'LOCAL';
const PUBLIC_S3 = 'PUBLIC_S3';
const SIGNED_S3 = 'SIGNED_S3';
const DUMMY = 'DUMMY';
const ICDC = 'ICDC';
const BENTO = 'BENTO';
const GMB = 'GMB';
const C3DC = 'C3DC';
const CTDC = 'CTDC';

const config = {
  projectNames: {
    ICDC,
    BENTO,
    GMB,
    C3DC,
    CTDC
  },
  sourceNames: {
    INDEXD,
    CLOUD_FRONT,
    LOCAL,
    PUBLIC_S3,
    SIGNED_S3,
    DUMMY,
  },
  source: (process.env.URL_SRC || DUMMY).toUpperCase(),
  fake: process.env.FAKE ? (process.env.FAKE.toLowerCase() === 'true') : false, // This is used to fake CloudFront call locally
  backendUrl: removeTrailingSlashes(process.env.BACKEND_URL),
  authorizationEnabled: process.env.AUTHORIZATION_ENABLED ? process.env.AUTHORIZATION_ENABLED.toLowerCase() === 'true' : false,
  authEnabled: process.env.AUTH_ENABLED ? process.env.AUTH_ENABLED.toLowerCase() === 'true' : false,
  authUrl: process.env.AUTH_URL ? (process.env.AUTH_URL.toLowerCase() === 'null' ? null : process.env.AUTH_URL) : null,
  version: process.env.VERSION,
  date: process.env.DATE,
  project: (process.env.PROJECT || BENTO).toUpperCase(),
  // MySQL Session
  mysqlSessionEnabled: process.env.MYSQL_SESSION_ENABLED ? process.env.MYSQL_SESSION_ENABLED.toLowerCase() === 'true' : false,
  mysql_host: process.env.MYSQL_HOST,
  mysql_port: process.env.MYSQL_PORT,
  mysql_user: process.env.MYSQL_USER,
  mysql_password: process.env.MYSQL_PASSWORD,
  mysql_database: process.env.MYSQL_DATABASE,
  session_timeout: process.env.SESSION_TIMEOUT ? parseInt(process.env.SESSION_TIMEOUT) * 1000 : 1000 * 30 * 60,  // 30 minutes
  cookie_secret: process.env.COOKIE_SECRET,
};

if (!config.version) {
  config.version = 'Version not set'
}

if (!config.date) {
  config.date = new Date();
}

// Make sure when authentication is enabled, authUrl is also set
if (config.authEnabled && (!config.authUrl || !config.authUrl.startsWith('http'))) {
  throw `Invalid auth URL: ${config.authUrl}`;
}

function readPrivateKey(keyPath) {
  return fs.readFileSync(keyPath, 'utf8');
}

switch (config.source) {
  case INDEXD:
    config.indexDUrl = removeTrailingSlashes(process.env.INDEXD_URL);
    if (!config.indexDUrl) {
      throw "INDEXD_URL is not set!";
    }
    break;
  case CLOUD_FRONT:
    config.cfUrl = removeTrailingSlashes(process.env.CF_URL);
    config.cfKeyPairId = process.env.CF_KEY_PAIR_ID;
    config.cfPrivateKey = process.env.CF_PRIVATE_KEY;
    config.urlExpiresInSeconds = process.env.URL_EXPIRES_IN_SECONDS || DEFAULT_EXPIRATION_SECONDS
    if (!config.cfUrl) {
      throw "CF_URL is not set!";
    }
    if (!config.cfKeyPairId) {
      throw "CF_KEY_PAIR_ID is not set!";
    }
    if (!config.cfPrivateKey) {
      throw "CF_PRIVATE_KEY is not set!";
    }
    if (!config.backendUrl) {
      throw 'BACKEND_URL is not set!';
    }
    break;
  case SIGNED_S3:
    // config.region = process.env.REGION || 'us-east-1';
    config.urlExpiresInSeconds = process.env.URL_EXPIRES_IN_SECONDS || DEFAULT_EXPIRATION_SECONDS
    break;
  case LOCAL:
    // Todo: add local support here
    break;
  case PUBLIC_S3:
    // Todo: add public S3 support here
    break;
  case DUMMY:
    break;
  default:
    throw `Unknown Source: '${config.source}'`;
}

module.exports = config;