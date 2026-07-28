module.exports = {
  apps: [
    {
      name: "dspace-darkid-import",
      script: "scripts/start-standalone.mjs",
      interpreter: "node",
      exec_mode: "fork",
      instances: 1,
      env: {
        NODE_ENV: "production",
        HOSTNAME: process.env.HOSTNAME || "0.0.0.0",
        PORT: process.env.PORT || "8787",
        REQUEST_BODY_LIMIT_BYTES: process.env.REQUEST_BODY_LIMIT_BYTES || "1048576",
        PROXY_RESPONSE_LIMIT_BYTES: process.env.PROXY_RESPONSE_LIMIT_BYTES || "26214400",
        PROXY_TIMEOUT_MS: process.env.PROXY_TIMEOUT_MS || "30000"
      },
      env_production: {
        NODE_ENV: "production",
        HOSTNAME: process.env.HOSTNAME || "0.0.0.0",
        PORT: process.env.PORT || "8787",
        REQUEST_BODY_LIMIT_BYTES: process.env.REQUEST_BODY_LIMIT_BYTES || "1048576",
        PROXY_RESPONSE_LIMIT_BYTES: process.env.PROXY_RESPONSE_LIMIT_BYTES || "26214400",
        PROXY_TIMEOUT_MS: process.env.PROXY_TIMEOUT_MS || "30000"
      }
    }
  ]
};
