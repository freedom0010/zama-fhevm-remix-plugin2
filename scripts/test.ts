import { spawn } from "child_process";
import * as path from "path";

async function startDevServer(): Promise<void> {
  console.log("🚀 Starting development server...");
  
  const process = spawn("vite", ["--host"], {
    stdio: "inherit",
    cwd: path.resolve(__dirname, ".."),
    shell: true,
  });

  process.on("error", (error) => {
    console.error("❌ Failed to start dev server:", error);
    process.exit(1);
  });

  // Handle graceful shutdown
  const shutdown = () => {
    console.log("\n🛑 Shutting down dev server...");
    process.kill();
    process.exit(0);
  };

  process.on("SIGINT", shutdown);
  process.on("SIGTERM", shutdown);
}

async function main() {
  await startDevServer();
}

// Allow running directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { startDevServer };