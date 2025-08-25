// deployment/scripts/manage.js
const { ethers } = require("hardhat");
const fs = require("fs");
const path = require("path");

class DeploymentManager {
  constructor(network) {
    this.network = network;
    this.deploymentsPath = path.join(__dirname, "../deployments", `${network}.json`);
  }

  loadDeployments() {
    if (!fs.existsSync(this.deploymentsPath)) {
      return {};
    }
    return JSON.parse(fs.readFileSync(this.deploymentsPath, "utf8"));
  }

  saveDeployments(deployments) {
    fs.writeFileSync(this.deploymentsPath, JSON.stringify(deployments, null, 2));
  }

  listContracts() {
    const deployments = this.loadDeployments();
    
    console.log(`📋 Contracts on ${this.network}:`);
    console.log("=" .repeat(80));
    
    for (const [name, deployment] of Object.entries(deployments)) {
      const status = deployment.rolledBack ? "🔄 ROLLED BACK" : 
                    deployment.verified ? "✅ VERIFIED" : "⚠️ UNVERIFIED";
      
      console.log(`${name}:`);
      console.log(`   Address: ${deployment.address}`);
      console.log(`   Status: ${status}`);
      console.log(`   Block: ${deployment.blockNumber}`);
      console.log(`   Gas Used: ${parseInt(deployment.gasUsed || 0).toLocaleString()}`);
      console.log(`   Deployed: ${new Date(deployment.timestamp).toLocaleString()}`);
      console.log("");
    }
  }

  async checkHealth() {
    const deployments = this.loadDeployments();
    const results = {};
    
    console.log(`🏥 Health check for ${this.network} contracts...`);
    
    for (const [name, deployment] of Object.entries(deployments)) {
      if (deployment.rolledBack) {
        results[name] = { status: "rolled_back", message: "Contract rolled back" };
        continue;
      }
      
      try {
        const code = await ethers.provider.getCode(deployment.address);
        if (code === "0x") {
          results[name] = { status: "failed", message: "No code at address" };
        } else {
          results[name] = { status: "healthy", message: "Contract operational" };
        }
      } catch (error) {
        results[name] = { status: "error", message: error.message };
      }
    }
    
    // Print results
    for (const [name, result] of Object.entries(results)) {
      const emoji = result.status === "healthy" ? "✅" : 
                   result.status === "rolled_back" ? "🔄" : "❌";
      console.log(`${emoji} ${name}: ${result.message}`);
    }
    
    return results;
  }

  async rollback(contractName) {
    const deployments = this.loadDeployments();
    
    if (!deployments[contractName]) {
      console.error(`❌ Contract ${contractName} not found`);
      return false;
    }
    
    deployments[contractName].rolledBack = true;
    deployments[contractName].rolledBackAt = new Date().toISOString();
    
    this.saveDeployments(deployments);
    
    console.log(`🔄 ${contractName} marked as rolled back`);
    return true;
  }

  generateAddressBook() {
    const deployments = this.loadDeployments();
    const addressBook = {};
    
    for (const [name, deployment] of Object.entries(deployments)) {
      if (!deployment.rolledBack) {
        addressBook[name] = {
          address: deployment.address,
          verified: deployment.verified || false,
          block: deployment.blockNumber
        };
      }
    }
    
    const addressBookPath = path.join(__dirname, "../deployments", `addresses-${this.network}.json`);
    fs.writeFileSync(addressBookPath, JSON.stringify(addressBook, null, 2));
    
    console.log(`📒 Address book generated: ${addressBookPath}`);
    return addressBook;
  }

  async estimateUpgradeCosts() {
    const deployments = this.loadDeployments();
    let totalGasEstimate = 0;
    
    console.log(`💰 Upgrade cost estimation for ${this.network}:`);
    
    for (const [name, deployment] of Object.entries(deployments)) {
      if (deployment.rolledBack) continue;
      
      try {
        const Contract = await ethers.getContractFactory(name);
        const deployTx = Contract.getDeployTransaction(...(deployment.constructorArgs || []));
        const gasEstimate = await ethers.provider.estimateGas(deployTx);
        
        totalGasEstimate += gasEstimate.toNumber();
        
        const gasPrice = await ethers.provider.getGasPrice();
        const cost = gasEstimate.mul(gasPrice);
        
        console.log(`   ${name}: ${gasEstimate.toLocaleString()} gas (~${ethers.utils.formatEther(cost)} ETH)`);
      } catch (error) {
        console.log(`   ${name}: Estimation failed - ${error.message}`);
      }
    }
    
    const totalGasPrice = await ethers.provider.getGasPrice();
    const totalCost = ethers.BigNumber.from(totalGasEstimate).mul(totalGasPrice);
    
    console.log(`\n📊 Total estimated upgrade cost: ${totalGasEstimate.toLocaleString()} gas (~${ethers.utils.formatEther(totalCost)} ETH)`);
    
    return { totalGasEstimate, totalCost: totalCost.toString() };
  }
}

async function main() {
  const network = process.env.NETWORK || hre.network.name;
  const command = process.argv[2];
  const contractName = process.argv[3];
  
  const manager = new DeploymentManager(network);
  
  switch (command) {
    case "list":
      manager.listContracts();
      break;
    case "health":
      await manager.checkHealth();
      break;
    case "rollback":
      if (!contractName) {
        console.error("❌ Please specify contract name for rollback");
        process.exit(1);
      }
      await manager.rollback(contractName);
      break;
    case "addresses":
      manager.generateAddressBook();
      break;
    case "costs":
      await manager.estimateUpgradeCosts();
      break;
    default:
      console.log("Available commands:");
      console.log("  list     - List all deployed contracts");
      console.log("  health   - Check contract health");
      console.log("  rollback <name> - Mark contract as rolled back");
      console.log("  addresses - Generate address book");
      console.log("  costs    - Estimate upgrade costs");
  }
}

if (require.main === module) {
  main()
    .then(() => process.exit(0))
    .catch((error) => {
      console.error(error);
      process.exit(1);
    });
}

module.exports = { DeploymentManager };
