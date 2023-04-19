const redis = require("redis");
const config = require("../config");

let redisClient;

(async () => {
  redisClient = redis.createClient(config.REDIS_HOST, config.REDIS_PORT, {
    disableOfflineQueue: true,
  });
  redisClient.on("error", async (error) => await redisClient.quit());
  await redisClient.connect();
})();

// async function connectToRedis() {
//   let redisClient = redis.createClient(config.REDIS_HOST, config.REDIS_PORT, {
//     socket: {
//       reconnectStrategy: false,
//     },
//   });
//   redisClient.on("error", (error) => console.error());
//   await redisClient.connect();
// }

module.exports = redisClient;
