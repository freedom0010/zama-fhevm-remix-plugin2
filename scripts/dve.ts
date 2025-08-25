import { spawn } from "child_process";
import * as path from "path";

async function runCommand(command: string, args: string[]): Promise<void> {
  return new Promise((resolve, reject) => {
    console.log(`🔧 Running: ${command} ${args.join(" ")}`);
    
    const process = spawn(command, args, {
      stdio: "inherit",
      cwd: path.resolve(__dirname, ".."),
      shell: true,
    });

    process.on("close", (code) => {
      if (code === 0) {
        resolve();
      } else {
        reject(new Error(`Process exited with code ${code}`));
      }
    });

    process.on("error", (error) => {
      reject(error);
    });
  });
}

async function buildProject(): Promise<void> {
  console.log("🚀 Starting build process...");
  
  try {
    // Clean previous build
    console.log("🧹 Cleaning previous build...");
    await runCommand("rm", ["-rf", "dist"]);
    
    // Run TypeScript compilation check
    console.log("📝 Checking TypeScript...");
    await runCommand("tsc", ["--noEmit"]);
    
    // Run Vite build
    console.log("📦 Building with Vite...");
    await runCommand("vite", ["build"]);
    
    console.log("✅ Build completed successfully!");
    
  } catch (error) {
    console.error("❌ Build failed:", error);
    process.exit(1);
  }
}

async function main() {
  await buildProject();
}

// Allow running directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { buildProject };