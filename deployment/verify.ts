// Verify contracts
import { ethers } from "hardhat";
import * as fs from "fs";
import * as path from "path";
import { ContractName, DEFAULT_PARAMS, DeploymentParams } from "./config";

interface DeployedContract {
  address: string;
  txHash: string;
  blockNumber: number;
  deployedAt: number;
  args: any[];
}

interface AddressBook {
  [chainId: string]: {
    [contractName: string]: DeployedContract;
  };
}

const ADDRESSES_FILE = path.join(__dirname, "addresses.json");

function loadAddresses(): AddressBook {
  try {
    if (fs.existsSync(ADDRESSES_FILE)) {
      return JSON.parse(fs.readFileSync(ADDRESSES_FILE, "utf8"));
    }
  } catch (error) {
    console.warn("Failed to load addresses file:", error);
  }
  return {};
}

function saveAddresses(addresses: AddressBook): void {
  fs.writeFileSync(ADDRESSES_FILE, JSON.stringify(addresses, null, 2));
}

async function deployContract(
  contractName: ContractName,
  args: any[]
): Promise<DeployedContract> {
  console.log(`\n📦 Deploying ${contractName}...`);
  
  const ContractFactory = await ethers.getContractFactory(contractName);
  const contract = await ContractFactory.deploy(...args);
  
  await contract.waitForDeployment();
  const address = await contract.getAddress();
  const deployTx = contract.deploymentTransaction();
  
  if (!deployTx) {
    throw new Error("Deployment transaction not found");
  }

  const receipt = await deployTx.wait();
  if (!receipt) {
    throw new Error("Deployment receipt not found");
  }

  const deployedContract: DeployedContract = {
    address,
    txHash: deployTx.hash,
    blockNumber: receipt.blockNumber,
    deployedAt: Date.now(),
    args,
  };

  console.log(`✅ ${contractName} deployed at: ${address}`);
  console.log(`📋 Transaction: ${deployTx.hash}`);
  console.log(`🧱 Block: ${receipt.blockNumber}`);

  return deployedContract;
}

export async function deployFHEToken(
  params: DeploymentParams["FHEToken"] = DEFAULT_PARAMS.FHEToken
): Promise<DeployedContract> {
  const args = [params.name, params.symbol, params.decimals];
  return deployContract(ContractName.FHE_TOKEN, args);
}

export async function deployFHENFT(
  params: DeploymentParams["FHENFT"] = DEFAULT_PARAMS.FHENFT
): Promise<DeployedContract> {
  const args = [params.name, params.symbol];
  return deployContract(ContractName.FHE_NFT, args);
}

async function main() {
  const [deployer] = await ethers.getSigners();
  const network = await ethers.provider.getNetwork();
  const chainId = network.chainId.toString();

  console.log("🚀 Starting deployment...");
  console.log("👤 Deployer:", deployer.address);
  console.log("🌐 Network:", network.name, `(${chainId})`);
  console.log("💰 Balance:", ethers.formatEther(await ethers.provider.getBalance(deployer.address)), "ETH");

  // Load existing addresses
  const addresses = loadAddresses();
  if (!addresses[chainId]) {
    addresses[chainId] = {};
  }

  try {
    // Deploy FHE Token
    const tokenContract = await deployFHEToken();
    addresses[chainId][ContractName.FHE_TOKEN] = tokenContract;

    // Deploy FHE NFT
    const nftContract = await deployFHENFT();
    addresses[chainId][ContractName.FHE_NFT] = nftContract;

    // Save addresses
    saveAddresses(addresses);
    
    console.log("\n🎉 Deployment completed!");
    console.log("📝 Addresses saved to:", ADDRESSES_FILE);
    
  } catch (error) {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  }
}

// Allow running directly
if (require.main === module) {
  main().catch((error) => {
    console.error(error);
    process.exitCode = 1;
  });
}