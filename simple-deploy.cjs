// Simple deployment script for Ocean Policy DAO
// This creates a mock deployment for demonstration

const fs = require('fs');

console.log("🌊 Ocean Policy DAO - Mock Deployment");
console.log("=====================================");

// Generate mock contract address
const mockContractAddress = "0x" + Math.random().toString(16).substr(2, 40);

// Create deployment info
const deploymentInfo = {
  contractAddress: mockContractAddress,
  network: "localhost_simulation",
  deployedAt: new Date().toISOString(),
  agents: [
    {
      name: "Dr. Marina Rodriguez",
      ensName: "marina.oceanpolicy.eth",
      walletAddress: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
      votingPower: "25"
    },
    {
      name: "Captain Jake Thompson",
      ensName: "captain.oceanpolicy.eth", 
      walletAddress: "0x8D4C0532925a3b8D4C0532925a3b8D4C0532925a",
      votingPower: "20"
    },
    {
      name: "Sarah Chen",
      ensName: "legal.oceanpolicy.eth",
      walletAddress: "0x925a3b8D4C0532925a3b8D4C0532925a3b8D4C053",
      votingPower: "20"
    },
    {
      name: "Dr. Alex Kumar", 
      ensName: "data.oceanpolicy.eth",
      walletAddress: "0x2925a3b8D4C0532925a3b8D4C0532925a3b8D4C05",
      votingPower: "20"
    },
    {
      name: "Maria Santos",
      ensName: "public.oceanpolicy.eth",
      walletAddress: "0x32925a3b8D4C0532925a3b8D4C0532925a3b8D4C0",
      votingPower: "15"
    }
  ],
  features: {
    voting: true,
    nft_minting: true,
    ens_integration: true,
    consensus_mechanism: true
  }
};

// Save deployment info
fs.writeFileSync('deployment.json', JSON.stringify(deploymentInfo, null, 2));

// Update .env file
let envContent = fs.readFileSync('.env', 'utf8');
envContent = envContent.replace(/CONTRACT_ADDRESS=""/, `CONTRACT_ADDRESS="${mockContractAddress}"`);

// Add a default owner private key
const defaultOwnerKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
envContent = envContent.replace(/OWNER_PRIVATE_KEY=""/, `OWNER_PRIVATE_KEY="${defaultOwnerKey}"`);

fs.writeFileSync('.env', envContent);

console.log("✅ Mock deployment completed!");
console.log("📋 Contract Details:");
console.log("- Contract Address:", mockContractAddress);
console.log("- Network: Localhost Simulation");
console.log("- Total Agents: 5");
console.log("- Voting Power Distribution: 25%, 20%, 20%, 20%, 15%");
console.log("- Features: Voting ✅, NFT Minting ✅, ENS Integration ✅");

console.log("\n💾 Files created:");
console.log("- deployment.json (contract info)");
console.log("- .env updated with contract address");

console.log("\n🚀 Ready to test! Run: bun run dev");