const { spawn } = require('child_process');
const fs = require('fs');

async function deployAndTest() {
  console.log("🚀 Starting Ocean Policy DAO Deployment and Testing...\n");

  // Step 1: Start Hardhat node
  console.log("1️⃣ Starting local Hardhat blockchain...");
  const hardhatNode = spawn('npx', ['hardhat', 'node'], { 
    stdio: 'pipe',
    shell: true 
  });

  // Wait for Hardhat node to start
  await new Promise((resolve) => {
    hardhatNode.stdout.on('data', (data) => {
      const output = data.toString();
      if (output.includes('Started HTTP and WebSocket JSON-RPC server')) {
        console.log("✅ Hardhat node started successfully");
        resolve();
      }
    });
  });

  // Step 2: Deploy contract
  console.log("\n2️⃣ Deploying smart contract...");
  const deployProcess = spawn('npx', ['hardhat', 'run', 'scripts/deploy.js', '--network', 'localhost'], {
    stdio: 'inherit',
    shell: true
  });

  await new Promise((resolve, reject) => {
    deployProcess.on('close', (code) => {
      if (code === 0) {
        console.log("✅ Contract deployed successfully");
        resolve();
      } else {
        reject(new Error(`Deployment failed with code ${code}`));
      }
    });
  });

  // Step 3: Update environment with contract address
  if (fs.existsSync('deployment.json')) {
    const deployment = JSON.parse(fs.readFileSync('deployment.json', 'utf8'));
    
    // Update .env file
    let envContent = fs.readFileSync('.env', 'utf8');
    envContent = envContent.replace(/CONTRACT_ADDRESS=""/, `CONTRACT_ADDRESS="${deployment.contractAddress}"`);
    
    // Add a default owner private key (Hardhat account #0)
    const defaultOwnerKey = "0xac0974bec39a17e36ba4a6b4d238ff944bacb478cbed5efcae784d7bf4f2ff80";
    envContent = envContent.replace(/OWNER_PRIVATE_KEY=""/, `OWNER_PRIVATE_KEY="${defaultOwnerKey}"`);
    
    fs.writeFileSync('.env', envContent);
    console.log("✅ Environment updated with contract address");
  }

  // Step 4: Start the API server
  console.log("\n3️⃣ Starting API server...");
  const apiServer = spawn('bun', ['run', 'dev'], {
    stdio: 'pipe',
    shell: true
  });

  // Wait for API server to start
  await new Promise((resolve) => {
    apiServer.stdout.on('data', (data) => {
      const output = data.toString();
      console.log(output);
      if (output.includes('Started development server')) {
        console.log("✅ API server started successfully");
        resolve();
      }
    });
  });

  // Step 5: Test the system
  console.log("\n4️⃣ Testing blockchain integration...");
  
  // Test blockchain status
  try {
    const response = await fetch('http://localhost:3000/blockchain/status');
    const status = await response.json();
    console.log("📊 Blockchain Status:", status);
  } catch (error) {
    console.error("❌ Failed to check blockchain status:", error);
  }

  // Test policy simulation with blockchain
  try {
    console.log("\n🧪 Testing policy simulation with blockchain...");
    const response = await fetch('http://localhost:3000/start', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        scenario: "Test blockchain-based marine conservation policy",
        rounds: 1
      })
    });
    
    const result = await response.json();
    console.log("🎉 Policy simulation completed!");
    console.log("- Blockchain enabled:", result.data.blockchain_enabled);
    console.log("- Policy ID:", result.data.blockchain_governance.policy_id);
    console.log("- Transaction hashes:", result.data.blockchain_governance.transaction_hashes?.length || 0);
    
  } catch (error) {
    console.error("❌ Failed to test policy simulation:", error);
  }

  console.log("\n🎉 Deployment and testing completed!");
  console.log("\n📋 Next steps:");
  console.log("- API server running at: http://localhost:3000");
  console.log("- Blockchain node running at: http://localhost:8545");
  console.log("- Test with: POST http://localhost:3000/start");
  console.log("- Check status: GET http://localhost:3000/blockchain/status");
  
  // Keep processes running
  process.on('SIGINT', () => {
    console.log("\n🛑 Shutting down...");
    hardhatNode.kill();
    apiServer.kill();
    process.exit(0);
  });
}

deployAndTest().catch(console.error);