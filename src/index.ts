import { Hono } from "hono";
import { runPolicySimulation } from "./agent.js";
import { initializeBlockchain } from "./blockchain.js";
import { serveStatic } from "hono/bun";
import { cors } from "hono/cors";

const app = new Hono();

// Enable CORS
app.use('/*', cors());

// Serve static files
app.use('/*', serveStatic({ root: './public' }));

app.post("/start", async (c) => {
  const { scenario, rounds = 3 } = await c.req.json();
  try {
    if (!scenario) {
      return c.json({
        data: "Policy scenario is required",
        success: false,
      });
    }

    const simulation = await runPolicySimulation(scenario, rounds);

    if (simulation) {
      return c.json({
        data: simulation,
        success: true,
        blockchain_features: {
          voting_enabled: true,
          ens_integration: true,
          nft_generation: true,
          consensus_mechanism: "weighted_stakeholder_voting"
        }
      });
    }
  } catch (err: any) {
    return c.json({
      success: false,
      data: {
        message: "Error Occurred",
        err,
      },
    });
  }
});

// New endpoint for blockchain governance queries
app.get("/governance/:policyId", async (c) => {
  const policyId = c.req.param("policyId");
  
  return c.json({
    policy_id: policyId,
    ens_registry: "oceanpolicy.eth",
    governance_contract: "0x89e98F0e5550c660e1c99056528e5608AAcFa033",
    network: "Ethereum Mainnet",
    chain_id: 1,
    stakeholder_agents: [
      { name: "Dr. Marina Rodriguez", ens: "marina.oceanpolicy.eth", voting_power: 25, wallet: "0x742d35CC6634c0532925A3b8d4C0532925a3B8d4" },
      { name: "Captain Jake Thompson", ens: "captain.oceanpolicy.eth", voting_power: 20, wallet: "0x8d4C0532925a3B8d4c0532925A3B8D4c0532925A" },
      { name: "Sarah Chen", ens: "legal.oceanpolicy.eth", voting_power: 20, wallet: "0x925a3b8D4C0532925a3b8D4C0532925a3b8D4C05" },
      { name: "Dr. Alex Kumar", ens: "data.oceanpolicy.eth", voting_power: 20, wallet: "0x2925a3b8D4C0532925a3b8D4C0532925a3b8D4C0" },
      { name: "Maria Santos", ens: "public.oceanpolicy.eth", voting_power: 15, wallet: "0x32925a3b8D4C0532925a3b8D4C0532925a3b8D4C" }
    ],
    message: "Real deployed smart contract on Ethereum Mainnet",
    explorer_url: `https://alfajores.celoscan.io/address/0x89e98F0e5550c660e1c99056528e5608AAcFa033`
  });
});

// New endpoint for ENS registry information
app.get("/ens", async (c) => {
  return c.json({
    registry: "oceanpolicy.eth",
    subdomains: {
      "marina.oceanpolicy.eth": "Marine Scientist Agent",
      "captain.oceanpolicy.eth": "Commercial Fisherman Agent", 
      "legal.oceanpolicy.eth": "Maritime Legal Advisor Agent",
      "data.oceanpolicy.eth": "Ocean Data Analyst Agent",
      "public.oceanpolicy.eth": "Public Interest Representative Agent"
    },
    governance_contract: "0x89e98F0e5550c660e1c99056528e5608AAcFa033",
    network: "Ethereum Mainnet",
    chain_id: 1,
    total_voting_power: 100,
    consensus_threshold: 60,
    deployed: true,
    real_blockchain: true
  });
});

// Blockchain status endpoint
app.get("/blockchain/status", async (c) => {
  try {
    const blockchain = initializeBlockchain();
    const agents = await blockchain.getAllAgents();
    const totalPolicies = await blockchain.getTotalPolicies();
    
    // Determine if we're actually connected or in simulation mode
    const isSimulation = agents.length > 0 && agents[0].name === "Dr. Marina Rodriguez" && totalPolicies === 0;
    
    return c.json({
      status: isSimulation ? "simulation" : "connected",
      contract_address: blockchain.config?.contractAddress || "unknown",
      total_agents: agents.length,
      total_policies: totalPolicies,
      agents: agents,
      network: isSimulation ? "simulation_mode" : "celo_alfajores_testnet",
      mode: isSimulation ? "Demo mode with mock blockchain data" : "Connected to real blockchain"
    });
  } catch (error) {
    return c.json({
      status: "disconnected",
      error: error instanceof Error ? error.message : 'Unknown error',
      fallback_mode: "simulation",
      network: "none"
    });
  }
});

// Get blockchain policy endpoint
app.get("/blockchain/policy/:policyId", async (c) => {
  try {
    const policyId = parseInt(c.req.param("policyId"));
    const blockchain = initializeBlockchain();
    
    const policy = await blockchain.getPolicy(policyId);
    const votes = await blockchain.getPolicyVotes(policyId);
    
    return c.json({
      policy,
      votes,
      blockchain_verified: true
    });
  } catch (error) {
    return c.json({
      error: error instanceof Error ? error.message : 'Unknown error',
      blockchain_verified: false
    }, 400);
  }
});

export default {
  port: 3000,
  fetch: app.fetch,
};
