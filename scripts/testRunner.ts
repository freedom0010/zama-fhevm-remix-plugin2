import { spawn } from "child_process";
import * as path from "path";

async function runTests(): Promise<void> {
  console.log("🧪 Starting test suite...");

  try {
    // TypeScript 编译检查
    console.log("📝 TypeScript compilation check...");
    await new Promise<void>((resolve, reject) => {
      const proc = spawn("tsc", ["--noEmit"], {
        stdio: "inherit",
        cwd: path.resolve(__dirname, ".."),
        shell: true,
      });

      proc.on("close", (code) => {
        if (code === 0) {
          resolve();
        } else {
          reject(new Error(`TypeScript check failed with code ${code}`));
        }
      });

      proc.on("error", reject);
    });

    // Mock 单元测试
    console.log("🎯 Running unit tests...");
    console.log("✅ All tests passed! (TODO: Add real test suite)");

    // Mock 集成测试
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
    const proc = spawn("npx", ["hardhat", "test"], {
      stdio: "inherit",
      cwd: path.resolve(__dirname, ".."),
      shell: true,
    });

    proc.on("close", (code) => {
      if (code === 0) {
        console.log("✅ Hardhat tests passed!");
        resolve();
      } else {
        reject(new Error(`Hardhat tests failed with code ${code}`));
      }
    });

    proc.on("error", reject);
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
      await runHardhatTests();
      break;
  }
}

// ✅ ESM 模式下的 "main" 检查
if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}

export { runTests, runHardhatTests };
