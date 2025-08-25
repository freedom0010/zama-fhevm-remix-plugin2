import { ethers } from "hardhat";
import fs from "fs";
import path from "path";

export interface DeploymentRecord {
  contractName: string;
  address: string;
  txHash: string;
  blockNumber: number;
  timestamp: number;
  network: string;
  gasUsed: string;
  gasPrice: string;
  deployer: string;
  verified: boolean;
  constructorArgs: any[];
}

export interface DeploymentReport {
  deployments: DeploymentRecord[];
  summary: {
    totalContracts: number;
    totalGasUsed: string;
    totalCostETH: string;
    totalCostUSD?: string;
    network: string;
    timestamp: number;
  };
}

export class DeploymentManager {
  private deploymentsFile: string;
  private network: string;

  constructor(network: string) {
    this.network = network;
    this.deploymentsFile = path.join(__dirname, `deployments-${network}.json`);
    this.ensureDeploymentDir();
  }

  private ensureDeploymentDir() {
    const deploymentDir = path.dirname(this.deploymentsFile);
    if (!fs.existsSync(deploymentDir)) {
      fs.mkdirSync(deploymentDir, { recursive: true });
    }
  }

  async saveDeployment(record: DeploymentRecord) {
    let deployments: DeploymentRecord[] = [];
    
    if (fs.existsSync(this.deploymentsFile)) {
      const content = fs.readFileSync(this.deploymentsFile, "utf8");
      deployments = JSON.parse(content);
    }

    // Remove existing deployment of same contract
    deployments = deployments.filter(d => d.contractName !== record.contractName);
    deployments.push(record);

    fs.writeFileSync(this.deploymentsFile, JSON.stringify(deployments, null, 2));
    console.log(`✅ Saved deployment record for ${record.contractName}`);
  }

  getDeployment(contractName: string): DeploymentRecord | null {
    if (!fs.existsSync(this.deploymentsFile)) {
      return null;
    }

    const content = fs.readFileSync(this.deploymentsFile, "utf8");
    const deployments: DeploymentRecord[] = JSON.parse(content);
    
    return deployments.find(d => d.contractName === contractName) || null;
  }

  async generateReport(): Promise<DeploymentReport> {
    if (!fs.existsSync(this.deploymentsFile)) {
      return {
        deployments: [],
        summary: {
          totalContracts: 0,
          totalGasUsed: "0",
          totalCostETH: "0",
          network: this.network,
          timestamp: Date.now(),
        },
      };
    }

    const content = fs.readFileSync(this.deploymentsFile, "utf8");
    const deployments: DeploymentRecord[] = JSON.parse(content);

    const totalGasUsed = deployments.reduce(
      (sum, d) => sum + BigInt(d.gasUsed),
      BigInt(0)
    );

    const totalCostWei = deployments.reduce(
      (sum, d) => sum + BigInt(d.gasUsed) * BigInt(d.gasPrice),
      BigInt(0)
    );

    const totalCostETH = ethers.formatEther(totalCostWei);

    const report: DeploymentReport = {
      deployments,
      summary: {
        totalContracts: deployments.length,
        totalGasUsed: totalGasUsed.toString(),
        totalCostETH,
        network: this.network,
        timestamp: Date.now(),
      },
    };

    // Save report
    const reportFile = path.join(__dirname, `report-${this.network}-${Date.now()}.json`);
    fs.writeFileSync(reportFile, JSON.stringify(report, null, 2));

    return report;
  }
}

export async function estimateGas(
  contractFactory: any,
  constructorArgs: any[] = []
): Promise<{ gasLimit: bigint; gasPrice: bigint; estimatedCost: string }> {
  const deployTransaction = await contractFactory.getDeployTransaction(...constructorArgs);
  const gasLimit = await ethers.provider.estimateGas(deployTransaction);
  
  const feeData = await ethers.provider.getFeeData();
  const gasPrice = feeData.gasPrice || BigInt("20000000000"); // 20 gwei fallback

  const estimatedCost = ethers.formatEther(gasLimit * gasPrice);

  return {
    gasLimit,
    gasPrice,
    estimatedCost,
  };
}

export async function verifyContract(
  address: string,
  constructorArgs: any[] = [],
  contractPath?: string
) {
  try {
    console.log(`🔍 Verifying contract at ${address}...`);
    
    const verifyArgs: any = {
      address,
      constructorArguments: constructorArgs,
    };

    if (contractPath) {
      verifyArgs.contract = contractPath;
    }

    await ethers.run("verify:verify", verifyArgs);
    console.log(`✅ Contract verified at ${address}`);
    return true;
  } catch (error: any) {
    if (error.message.includes("Already Verified")) {
      console.log(`ℹ️  Contract at ${address} is already verified`);
      return true;
    }
    console.error(`❌ Verification failed for ${address}:`, error.message);
    return false;
  }
}

export function formatDeploymentSummary(report: DeploymentReport): string {
  let summary = `
🚀 DEPLOYMENT REPORT - ${report.summary.network.toUpperCase()}
${"=".repeat(50)}

📊 SUMMARY:
  • Total Contracts: ${report.summary.totalContracts}
  • Total Gas Used: ${BigInt(report.summary.totalGasUsed).toLocaleString()}
  • Total Cost: ${report.summary.totalCostETH} ETH
  • Network: ${report.summary.network}
  • Timestamp: ${new Date(report.summary.timestamp).toISOString()}

📋 DEPLOYED CONTRACTS:
`;

  report.deployments.forEach((deployment, index) => {
    summary += `
  ${index + 1}. ${deployment.contractName}
     📍 Address: ${deployment.address}
     🔗 Tx Hash: ${deployment.txHash}
     ⛽ Gas Used: ${BigInt(deployment.gasUsed).toLocaleString()}
     💰 Cost: ${ethers.formatEther(BigInt(deployment.gasUsed) * BigInt(deployment.gasPrice))} ETH
     ✅ Verified: ${deployment.verified ? "Yes" : "No"}
     📅 Block: ${deployment.blockNumber}
`;
  });

  return summary;
}

export async function waitForConfirmation(txHash: string, confirmations: number = 2) {
  console.log(`⏳ Waiting for ${confirmations} confirmations for tx ${txHash}...`);
  
  const receipt = await ethers.provider.waitForTransaction(txHash, confirmations);
  
  if (!receipt) {
    throw new Error("Transaction receipt not found");
  }

  console.log(`✅ Transaction confirmed in block ${receipt.blockNumber}`);
  return receipt;
}