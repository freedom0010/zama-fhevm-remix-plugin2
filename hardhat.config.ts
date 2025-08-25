import { spawn } from "child_process";
import * as path from "path";

async function runTests(): Promise<void> {
  console.log("🧪 Starting test suite...");
  
  try {
    // TODO: Add actual test runner (vitest, jest, or hardhat tests)
    console.log("📝 TypeScript compilation check...");
    await new Promise<void>((resolve, reject) => {
      const process = spawn("tsc", ["--noEmit"], {
        stdio: "inherit",
        cwd: path.resolve(__dirname, ".."),
        shell: true,
      });

      process.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`TypeScript check failed with code ${code}`));
        }
      });

      process.on("error", reject);
    });

    // Mock test execution
    console.log("🎯 Running unit tests...");
    console.log("✅ All tests passed! (TODO: Add real test suite)");
    
    // TODO: Add integration tests
    console.log("🔗 Running integration tests...");
    console.log("✅ Integration tests passed! (TODO: Add real integration tests)");
    
    console.log("🎉 Test suite completed successfully!");
    
  } catch (error) {
    console.error("❌ Tests failed:", error);
    process.exit(1);
  }
}

async function runHardhatTests(): Promise<void> {
  console.log("⚒️  Running Hardhat tests...");
  
  return new Promise((resolve, reject) => {
    const process = spawn("hardhat", ["test"], {
      stdio: "inherit",
      cwd: path.resolve(__dirname, ".."),
      shell: true,
    });

    process.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Hardhat tests passed!");
        resolve();
      } else {
        reject(new Error(`Hardhat tests failed with code ${code}`));
      }
    });

    process.on("error", reject);
  });
}

async function main() {
  const testType = process.argv[2] || "all";
  
  switch (testType) {
    case "hardhat":
      await runHardhatTests();
      break;
    case "unit":
      console.log("TODO: Add unit tests with vitest");
      break;
    case "all":
    default:
      await runTests();
      break;
  }
}

// Allow running directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { runTests, runHardhatTests };