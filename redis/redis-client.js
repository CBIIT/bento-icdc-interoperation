const redis = require("redis");
const config = require("../config");

let redisClient;

(async () => {
  redisClient = redis.createClient(config.REDIS_HOST, config.REDIS_PORT);
  redisClient.on("error", (error) =>
    console.error(`Redis client error: ${error}`)
  );
  await redisClient.connect();
})();

module.exports = redisClient;
