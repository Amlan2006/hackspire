const hre = require("hardhat");

async function main() {
  console.log("🌊 Deploying Ocean Policy DAO...");

  // Deploy the contract
  const OceanPolicyDAO = await hre.ethers.getContractFactory("OceanPolicyDAO");
  const oceanPolicyDAO = await OceanPolicyDAO.deploy();

  await oceanPolicyDAO.waitForDeployment();

  const contractAddress = await oceanPolicyDAO.getAddress();
  console.log("✅ Ocean Policy DAO deployed to:", contractAddress);

  // Verify agents are registered
  console.log("\n🤖 Verifying AI Agents Registration:");
  
  const agents = await oceanPolicyDAO.getAllAgents();
  for (let i = 0; i < agents.length; i++) {
    const agent = agents[i];
    console.log(`- ${agent.name} (${agent.ensName}): ${agent.votingPower}% voting power`);
  }

  console.log("\n📋 Contract Details:");
  console.log("- Contract Address:", contractAddress);
  console.log("- Network:", hre.network.name);
  console.log("- Consensus Threshold: 60%");
  console.log("- Total Agents:", agents.length);

  // Save deployment info
  const fs = require('fs');
  const deploymentInfo = {
    contractAddress: contractAddress,
    network: hre.network.name,
    deployedAt: new Date().toISOString(),
    agents: agents.map(agent => ({
      name: agent.name,
      ensName: agent.ensName,
      walletAddress: agent.walletAddress,
      votingPower: agent.votingPower.toString()
    }))
  };

  fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));
  console.log("\n💾 Deployment info saved to deployment.json");
}

main()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error("❌ Deployment failed:", error);
    process.exit(1);
  });