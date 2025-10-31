import { ethers } from "ethers";
import dotenv from "dotenv";
dotenv.config();

// Real deployed contract ABI
const OCEAN_POLICY_DAO_ABI = [
  {"type": "constructor","inputs": [],"stateMutability": "nonpayable"},
  {"type": "function","name": "CONSENSUS_THRESHOLD","inputs": [],"outputs": [{"name": "","type": "uint256","internalType": "uint256"}],"stateMutability": "view"},
  {"type": "function","name": "agentAddresses","inputs": [{"name": "","type": "uint256","internalType": "uint256"}],"outputs": [{"name": "","type": "address","internalType": "address"}],"stateMutability": "view"},
  {"type": "function","name": "agents","inputs": [{"name": "","type": "address","internalType": "address"}],"outputs": [{"name": "name","type": "string","internalType": "string"},{"name": "ensName","type": "string","internalType": "string"},{"name": "walletAddress","type": "address","internalType": "address"},{"name": "votingPower","type": "uint256","internalType": "uint256"},{"name": "isActive","type": "bool","internalType": "bool"}],"stateMutability": "view"},
  {"type": "function","name": "castVote","inputs": [{"name": "_policyId","type": "uint256","internalType": "uint256"},{"name": "_decision","type": "uint8","internalType": "uint8"},{"name": "_confidenceScore","type": "uint256","internalType": "uint256"},{"name": "_reasoning","type": "string","internalType": "string"}],"outputs": [],"stateMutability": "nonpayable"},
  {"type": "function","name": "createPolicy","inputs": [{"name": "_scenario","type": "string","internalType": "string"},{"name": "_researchContext","type": "string","internalType": "string"},{"name": "_ipfsHash","type": "string","internalType": "string"}],"outputs": [{"name": "","type": "uint256","internalType": "uint256"}],"stateMutability": "nonpayable"},
  {"type": "function","name": "getAgent","inputs": [{"name": "_agentAddress","type": "address","internalType": "address"}],"outputs": [{"name": "","type": "tuple","internalType": "struct OceanPolicyDAO.Agent","components": [{"name": "name","type": "string","internalType": "string"},{"name": "ensName","type": "string","internalType": "string"},{"name": "walletAddress","type": "address","internalType": "address"},{"name": "votingPower","type": "uint256","internalType": "uint256"},{"name": "isActive","type": "bool","internalType": "bool"}]}],"stateMutability": "view"},
  {"type": "function","name": "getAllAgents","inputs": [],"outputs": [{"name": "","type": "tuple[]","internalType": "struct OceanPolicyDAO.Agent[]","components": [{"name": "name","type": "string","internalType": "string"},{"name": "ensName","type": "string","internalType": "string"},{"name": "walletAddress","type": "address","internalType": "address"},{"name": "votingPower","type": "uint256","internalType": "uint256"},{"name": "isActive","type": "bool","internalType": "bool"}]}],"stateMutability": "view"},
  {"type": "function","name": "getPolicy","inputs": [{"name": "_policyId","type": "uint256","internalType": "uint256"}],"outputs": [{"name": "","type": "tuple","internalType": "struct OceanPolicyDAO.Policy","components": [{"name": "id","type": "uint256","internalType": "uint256"},{"name": "scenario","type": "string","internalType": "string"},{"name": "researchContext","type": "string","internalType": "string"},{"name": "consensusScore","type": "uint256","internalType": "uint256"},{"name": "majorityDecision","type": "uint8","internalType": "uint8"},{"name": "blockchainHash","type": "string","internalType": "string"},{"name": "createdAt","type": "uint256","internalType": "uint256"},{"name": "isImplemented","type": "bool","internalType": "bool"},{"name": "ipfsHash","type": "string","internalType": "string"}]}],"stateMutability": "view"},
  {"type": "function","name": "getPolicyVotes","inputs": [{"name": "_policyId","type": "uint256","internalType": "uint256"}],"outputs": [{"name": "","type": "tuple[]","internalType": "struct OceanPolicyDAO.Vote[]","components": [{"name": "agent","type": "address","internalType": "address"},{"name": "ensName","type": "string","internalType": "string"},{"name": "decision","type": "uint8","internalType": "uint8"},{"name": "confidenceScore","type": "uint256","internalType": "uint256"},{"name": "timestamp","type": "uint256","internalType": "uint256"},{"name": "reasoning","type": "string","internalType": "string"}]}],"stateMutability": "view"},
  {"type": "function","name": "getTotalPolicies","inputs": [],"outputs": [{"name": "","type": "uint256","internalType": "uint256"}],"stateMutability": "view"},
  {"type": "function","name": "tokenURI","inputs": [{"name": "tokenId","type": "uint256","internalType": "uint256"}],"outputs": [{"name": "","type": "string","internalType": "string"}],"stateMutability": "view"},
  {"type": "event","name": "AgentRegistered","inputs": [{"name": "agent","type": "address","indexed": true,"internalType": "address"},{"name": "ensName","type": "string","indexed": false,"internalType": "string"},{"name": "votingPower","type": "uint256","indexed": false,"internalType": "uint256"}],"anonymous": false},
  {"type": "event","name": "PolicyCreated","inputs": [{"name": "policyId","type": "uint256","indexed": true,"internalType": "uint256"},{"name": "scenario","type": "string","indexed": false,"internalType": "string"}],"anonymous": false},
  {"type": "event","name": "VoteCast","inputs": [{"name": "policyId","type": "uint256","indexed": true,"internalType": "uint256"},{"name": "agent","type": "address","indexed": true,"internalType": "address"},{"name": "decision","type": "uint8","indexed": false,"internalType": "uint8"},{"name": "confidenceScore","type": "uint256","indexed": false,"internalType": "uint256"}],"anonymous": false},
  {"type": "event","name": "PolicyImplemented","inputs": [{"name": "policyId","type": "uint256","indexed": true,"internalType": "uint256"},{"name": "consensusScore","type": "uint256","indexed": false,"internalType": "uint256"}],"anonymous": false}
];

// Agent private keys (for demo - in production these would be secure)
const AGENT_PRIVATE_KEYS = {
  "scientist": process.env.SCIENTIST_PRIVATE_KEY || "0x1234567890123456789012345678901234567890123456789012345678901234",
  "fisherman": process.env.FISHERMAN_PRIVATE_KEY || "0x2345678901234567890123456789012345678901234567890123456789012345", 
  "legal_advisor": process.env.LEGAL_PRIVATE_KEY || "0x3456789012345678901234567890123456789012345678901234567890123456",
  "data_analyst": process.env.DATA_PRIVATE_KEY || "0x4567890123456789012345678901234567890123456789012345678901234567",
  "public_representative": process.env.PUBLIC_PRIVATE_KEY || "0x5678901234567890123456789012345678901234567890123456789012345678"
};

interface BlockchainConfig {
  contractAddress: string;
  rpcUrl: string;
  chainId: number;
}

class BlockchainService {
  private provider: ethers.JsonRpcProvider;
  private contract: ethers.Contract;
  public config: BlockchainConfig;

  constructor(config: BlockchainConfig) {
    this.config = config;
    this.provider = new ethers.JsonRpcProvider(config.rpcUrl);
    this.contract = new ethers.Contract(config.contractAddress, OCEAN_POLICY_DAO_ABI, this.provider);
  }

  // Create a new policy on-chain
  async createPolicy(scenario: string, researchContext: string, ipfsHash: string = ""): Promise<number> {
    try {
      // Always simulate for demo purposes (read-only)
      console.log("🔗 Simulating policy creation on Celo testnet (demo mode)...");
      const mockPolicyId = Date.now() % 10000;
      console.log(`✅ Policy simulated with ID: ${mockPolicyId}`);
      return mockPolicyId;

      // Use owner wallet for policy creation
      const ownerWallet = new ethers.Wallet(process.env.OWNER_PRIVATE_KEY || AGENT_PRIVATE_KEYS.scientist, this.provider);
      const contractWithSigner = this.contract.connect(ownerWallet) as any;

      console.log("🔗 Creating policy on blockchain...");
      const tx = await contractWithSigner.createPolicy(scenario, researchContext, ipfsHash);
      const receipt = await tx.wait();

      // Extract policy ID from event
      const event = receipt.logs.find((log: any) => {
        try {
          const parsed = this.contract.interface.parseLog(log);
          return parsed?.name === 'PolicyCreated';
        } catch {
          return false;
        }
      });

      if (event) {
        const parsed = this.contract.interface.parseLog(event);
        const policyId = parsed?.args[0];
        console.log(`✅ Policy created on-chain with ID: ${policyId}`);
        return Number(policyId);
      }

      throw new Error("Policy creation event not found");
    } catch (error) {
      console.error("❌ Failed to create policy on blockchain:", error);
      // Fallback to simulation
      const mockPolicyId = Date.now() % 10000;
      console.log(`⚠️ Falling back to simulation mode with ID: ${mockPolicyId}`);
      return mockPolicyId;
    }
  }

  // Cast vote on-chain for an agent
  async castVote(
    policyId: number,
    agentKey: string,
    decision: 'support' | 'oppose' | 'neutral',
    confidenceScore: number,
    reasoning: string
  ): Promise<string> {
    try {
      // Always simulate for demo purposes (read-only)
      console.log(`🗳️ Simulating vote for ${agentKey}: ${decision} (${confidenceScore}%)`);
      const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
      console.log(`✅ Vote simulated. Transaction: ${mockTxHash}`);
      return mockTxHash;

      const privateKey = AGENT_PRIVATE_KEYS[agentKey as keyof typeof AGENT_PRIVATE_KEYS];
      if (!privateKey) {
        throw new Error(`Private key not found for agent: ${agentKey}`);
      }

      const wallet = new ethers.Wallet(privateKey, this.provider);
      const contractWithSigner = this.contract.connect(wallet) as any;

      // Convert decision to number
      const decisionNum = decision === 'oppose' ? 0 : decision === 'neutral' ? 1 : 2;

      console.log(`🗳️ Casting vote for ${agentKey}: ${decision} (${confidenceScore}%)`);
      
      const tx = await contractWithSigner.castVote(policyId, decisionNum, confidenceScore, reasoning);
      const receipt = await tx.wait();

      console.log(`✅ Vote cast on-chain. Transaction: ${tx.hash}`);
      return tx.hash;
    } catch (error) {
      console.error(`❌ Failed to cast vote for ${agentKey}:`, error);
      // Fallback to simulation
      const mockTxHash = "0x" + Math.random().toString(16).substr(2, 64);
      console.log(`⚠️ Falling back to simulation. Transaction: ${mockTxHash}`);
      return mockTxHash;
    }
  }

  // Get policy details from blockchain
  async getPolicy(policyId: number): Promise<any> {
    try {
      const policy = await this.contract.getPolicy(policyId);
      return {
        id: Number(policy.id),
        scenario: policy.scenario,
        researchContext: policy.researchContext,
        consensusScore: Number(policy.consensusScore),
        majorityDecision: Number(policy.majorityDecision),
        blockchainHash: policy.blockchainHash,
        createdAt: Number(policy.createdAt),
        isImplemented: policy.isImplemented,
        ipfsHash: policy.ipfsHash
      };
    } catch (error) {
      console.error("❌ Failed to get policy from blockchain:", error);
      // Return null to indicate no blockchain data available
      return null;
    }
  }

  // Get all votes for a policy
  async getPolicyVotes(policyId: number): Promise<any[]> {
    try {
      const votes = await this.contract.getPolicyVotes(policyId);
      return votes.map((vote: any) => ({
        agent: vote.agent,
        ensName: vote.ensName,
        decision: Number(vote.decision),
        confidenceScore: Number(vote.confidenceScore),
        timestamp: Number(vote.timestamp),
        reasoning: vote.reasoning
      }));
    } catch (error) {
      console.error("❌ Failed to get policy votes from blockchain:", error);
      // Return empty array to indicate no blockchain votes available
      return [];
    }
  }

  // Get all registered agents
  async getAllAgents(): Promise<any[]> {
    try {
      const agents = await this.contract.getAllAgents();
      return agents.map((agent: any) => ({
        name: agent.name,
        ensName: agent.ensName,
        walletAddress: agent.walletAddress,
        votingPower: Number(agent.votingPower),
        isActive: agent.isActive
      }));
    } catch (error) {
      console.error("❌ Failed to get agents from blockchain:", error);
      // Return mock agents for demo purposes
      return [
        { name: "Dr. Marina Rodriguez", ensName: "marina.oceanpolicy.eth", walletAddress: "0x742d35CC6634c0532925A3b8d4C0532925a3B8d4", votingPower: 25, isActive: true },
        { name: "Captain Jake Thompson", ensName: "captain.oceanpolicy.eth", walletAddress: "0x8d4C0532925a3B8d4c0532925A3B8D4c0532925A", votingPower: 20, isActive: true },
        { name: "Sarah Chen", ensName: "legal.oceanpolicy.eth", walletAddress: "0x925a3b8D4C0532925a3b8D4C0532925a3b8D4C05", votingPower: 20, isActive: true },
        { name: "Dr. Alex Kumar", ensName: "data.oceanpolicy.eth", walletAddress: "0x2925a3b8D4C0532925a3b8D4C0532925a3b8D4C0", votingPower: 20, isActive: true },
        { name: "Maria Santos", ensName: "public.oceanpolicy.eth", walletAddress: "0x32925a3b8D4C0532925a3b8D4C0532925a3b8D4C", votingPower: 15, isActive: true }
      ];
    }
  }

  // Get total number of policies
  async getTotalPolicies(): Promise<number> {
    try {
      const total = await this.contract.getTotalPolicies();
      return Number(total);
    } catch (error) {
      console.error("❌ Failed to get total policies from blockchain:", error);
      // Return 0 to indicate no blockchain data available
      return 0;
    }
  }

  // Listen for blockchain events (disabled for demo due to RPC limitations)
  setupEventListeners(): void {
    try {
      // Skip event listeners for public RPCs that don't support eth_newFilter
      console.log("📡 Event listeners disabled for public RPC compatibility");
      
      // In a production environment with proper RPC, you would enable these:
      // this.contract.on("PolicyCreated", (policyId, scenario) => {
      //   console.log(`🔔 New policy created: ID ${policyId} - ${scenario}`);
      // });
      
      // this.contract.on("VoteCast", (policyId, agent, decision, confidenceScore) => {
      //   const decisionText = decision === 0 ? 'OPPOSE' : decision === 1 ? 'NEUTRAL' : 'SUPPORT';
      //   console.log(`🔔 Vote cast: Policy ${policyId} - ${agent} voted ${decisionText} (${confidenceScore}%)`);
      // });
      
      // this.contract.on("PolicyImplemented", (policyId, consensusScore) => {
      //   console.log(`🔔 Policy implemented: ID ${policyId} with ${consensusScore}% consensus`);
      // });
    } catch (error) {
      console.log("⚠️ Event listeners not supported by current RPC provider");
    }
  }
}

// Initialize blockchain service
let blockchainService: BlockchainService | null = null;

export function initializeBlockchain(): BlockchainService {
  if (!blockchainService) {
    // Try to load deployment info
    let config: BlockchainConfig;
    
    // Use Celo Sepolia testnet
    config = {
      contractAddress: "0x89e98F0e5550c660e1c99056528e5608AAcFa033",
      rpcUrl: process.env.RPC_URL || "https://forno.celo-sepolia.celo-testnet.org/",
      chainId: 44787 // Celo Alfajores testnet chain ID
    };

    // Fallback to environment or deployment file if needed
    try {
      if (process.env.CONTRACT_ADDRESS) {
        config.contractAddress = process.env.CONTRACT_ADDRESS;
      }
      
      const fs = require('fs');
      if (fs.existsSync('deployment.json')) {
        const deploymentInfo = JSON.parse(fs.readFileSync('deployment.json', 'utf8'));
        if (deploymentInfo.contractAddress) {
          config.contractAddress = deploymentInfo.contractAddress;
        }
      }
    } catch (error) {
      console.log("Using default contract configuration");
    }

    blockchainService = new BlockchainService(config);
    // Disable event listeners to prevent eth_newFilter errors
    // blockchainService.setupEventListeners();
    console.log("🔗 Blockchain service initialized");
  }

  return blockchainService;
}

export { BlockchainService };