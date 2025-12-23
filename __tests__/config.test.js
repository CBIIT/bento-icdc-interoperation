// __tests__/config.test.js

jest.mock("dotenv", () => ({
  config: jest.fn(), // don't actually read .env during tests
}));

const CONFIG_PATH = "../config.js"; // explicit, since file is config.js

function baseRequiredEnv(overrides = {}) {
  return {
    VERSION: "1.2.3",
    DATE: "2025-01-15",
    BENTO_BACKEND_GRAPHQL_URI: "http://example/graphql",
    REDIS_HOST: "localhost",
    REDIS_PORT: "6379",
    AWS_REGION: "us-east-1",
    S3_ACCESS_KEY_ID: "test-access",
    S3_SECRET_ACCESS_KEY: "test-secret",
    FILE_MANIFEST_BUCKET_NAME: "test-bucket",
    CLOUDFRONT_KEY_PAIR_ID: "K123",
    CLOUDFRONT_PRIVATE_KEY: "-----BEGIN PRIVATE KEY-----\nabc\n-----END PRIVATE KEY-----",
    CLOUDFRONT_DOMAIN: "d123.cloudfront.net",
    SIGNED_URL_EXPIRY_SECONDS: "3600",
    REDIS_AUTH_ENABLED: "false", // default off
    // REDIS_PASSWORD intentionally omitted unless REDIS_AUTH_ENABLED is true
    ...overrides,
  };
}

function loadConfigWithEnv(env) {
  // Important: create a fresh env object each time
  process.env = { ...process.env, ...env };

  let loaded;
  jest.isolateModules(() => {
    // isolateModules ensures config.js is evaluated fresh in this closure
    // eslint-disable-next-line global-require, import/no-dynamic-require
    loaded = require(CONFIG_PATH);
  });
  return loaded;
}

describe("config.js", () => {
  const ORIGINAL_ENV = process.env;

  beforeEach(() => {
    jest.resetModules();
    process.env = { ...ORIGINAL_ENV };

    // Clear only the vars your config cares about
    [
      "VERSION",
      "DATE",
      "BENTO_BACKEND_GRAPHQL_URI",
      "REDIS_HOST",
      "REDIS_PORT",
      "AWS_REGION",
      "S3_ACCESS_KEY_ID",
      "S3_SECRET_ACCESS_KEY",
      "FILE_MANIFEST_BUCKET_NAME",
      "CLOUDFRONT_KEY_PAIR_ID",
      "CLOUDFRONT_PRIVATE_KEY",
      "CLOUDFRONT_DOMAIN",
      "SIGNED_URL_EXPIRY_SECONDS",
      "REDIS_AUTH_ENABLED",
      "REDIS_PASSWORD",
    ].forEach((k) => delete process.env[k]);
  });

  afterAll(() => {
    process.env = ORIGINAL_ENV;
  });

  it("loads successfully when required env vars are set (redis auth disabled)", () => {
    const config = loadConfigWithEnv(
      baseRequiredEnv({ REDIS_AUTH_ENABLED: "false" })
    );

    expect(config.version).toBe("1.2.3");
    expect(config.date).toBe("2025-01-15");
    expect(config.REDIS_HOST).toBe("localhost");
  });

  it("sets default version and date when missing", () => {
    // Delete VERSION/DATE so config.version and config.date start as undefined
    const env = baseRequiredEnv();
    delete env.VERSION;
    delete env.DATE;

    const config = loadConfigWithEnv(env);

    expect(config.version).toBe("Version not set!");
    expect(config.date).toEqual(expect.any(Date));
  });

  it("does NOT require REDIS_PASSWORD when REDIS_AUTH_ENABLED is not true", () => {
    const env = baseRequiredEnv({ REDIS_AUTH_ENABLED: "false" });
    delete env.REDIS_PASSWORD;

    expect(() => loadConfigWithEnv(env)).not.toThrow();
  });

  it("requires REDIS_PASSWORD when REDIS_AUTH_ENABLED is true (case-insensitive)", () => {
    const env = baseRequiredEnv({ REDIS_AUTH_ENABLED: "TrUe" });
    delete env.REDIS_PASSWORD;

    expect(() => loadConfigWithEnv(env)).toThrow(/REDIS_PASSWORD/);
  });

  it("throws and lists missing env vars", () => {
    // Provide almost nothing (but keep REDIS_AUTH_ENABLED false so it won't require password)
    const env = { REDIS_AUTH_ENABLED: "false" };

    expect(() => loadConfigWithEnv(env)).toThrow(
      /The following environment variables are not set:/
    );

    try {
      loadConfigWithEnv(env);
    } catch (e) {
      expect(e.message).toMatch(/BENTO_BACKEND_GRAPHQL_URI/);
      expect(e.message).toMatch(/AWS_REGION/);
    }
  });
});
