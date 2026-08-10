// ─── PM2 Ecosystem Configuration ─────────────────────────────────────────
// Usage:
//   npm install -g pm2
//   pm2 start ecosystem.config.js --env production
//   pm2 reload ecosystem.config.js --env production  ← zero-downtime reload
//   pm2 logs NeuralShop-Backend
//   pm2 monit
//
// WHY cluster mode: Node.js is single-threaded. cluster mode forks one
// process per CPU core so all cores handle HTTP requests. PM2 uses a
// round-robin load balancer across the cluster. Rate limiter and session data
// MUST live in Redis (not in-process memory) for this to work correctly.

export default {
  apps: [
    {
      name: "NeuralShop-Backend",
      script: "./src/server.js",

      // ── Cluster mode ────────────────────────────────────────────────
      exec_mode: "cluster",
      instances: "max",          // one worker per logical CPU

      // ── Auto-restart policy ──────────────────────────────────────────
      autorestart: true,
      max_restarts: 10,          // give up after 10 crashes in min_uptime window
      min_uptime: "10s",         // must stay alive 10s to count as "healthy start"
      restart_delay: 4000,       // wait 4s between restart attempts (back-off)

      // ── Memory limit ────────────────────────────────────────────────
      // Restart if heap + rss exceeds 512 MB — catches slow memory leaks
      max_memory_restart: "512M",

      // ── Graceful reload / shutdown ───────────────────────────────────
      // kill_timeout MUST be > the 30s shutdown timeout in server.js
      kill_timeout: 35000,       // ms before SIGKILL after SIGINT
      listen_timeout: 10000,     // ms to wait for app to become ready after start

      // ── Log files ────────────────────────────────────────────────────
      // PM2 merges logs from all cluster instances into these files.
      out_file: "./logs/pm2-out.log",
      error_file: "./logs/pm2-error.log",
      merge_logs: true,
      log_date_format: "YYYY-MM-DD HH:mm:ss",

      // ── Node.js flags ────────────────────────────────────────────────
      node_args: [
        "--max-old-space-size=512",   // enforce heap limit at Node level too
      ],

      // ── Environment variables ────────────────────────────────────────
      env: {
        NODE_ENV: "development",
        PORT: 6000,
      },
      env_production: {
        NODE_ENV: "production",
        PORT: 6000,
      },

      // ── Watch (dev only) ─────────────────────────────────────────────
      watch: false,
      ignore_watch: ["node_modules", "logs", ".git"],
    },
  ],
};
