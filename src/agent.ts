import dotenv from "dotenv";
dotenv.config();

import { ChatGoogleGenerativeAI } from "@langchain/google-genai";
import { HumanMessage } from "@langchain/core/messages";
import { ChatPromptTemplate } from "@langchain/core/prompts";
import { SerpAPI } from "@langchain/community/tools/serpapi";
import { initializeBlockchain } from "./blockchain.js";

// Initialize SerpAPI tool for research
const serpTool = new SerpAPI();

// Initialize Google Generative AI model
const llm = new ChatGoogleGenerativeAI({
  model: "gemini-2.0-flash",
  temperature: 0.7,
});

// Types
interface AgentPersona {
  name: string;
  role: string;
  prompt: string;
}

interface AgentResponse {
  agent_name: string;
  role: string;
  response: string;
}

interface RoundData {
  round_number: number;
  responses: Record<string, AgentResponse>;
}

interface SimulationResult {
  scenario: string;
  research_context: string;
  rounds: RoundData[];
  summary: string;
  recommendations: string[];
}

// Blockchain-specific interfaces
interface BlockchainVote {
  agent_id: string;
  agent_name: string;
  ens_name: string;
  wallet_address: string;
  vote: 'support' | 'oppose' | 'neutral';
  confidence_score: number;
  voting_power: number;
  reasoning: string;
}

interface PolicyNFTMetadata {
  policy_id: string;
  scenario: string;
  consensus_score: number;
  majority_decision: string;
  stakeholder_votes: BlockchainVote[];
  implementation_status: 'proposed' | 'approved' | 'implemented' | 'rejected';
  created_at: string;
  blockchain_hash: string;
  ens_registry: string;
  nft_metadata: {
    name: string;
    description: string;
    image: string;
    attributes: Array<{ trait_type: string; value: string | number }>;
  };
}

// Agent personas with ENS identities and blockchain integration
const AGENT_PERSONAS: Record<string, AgentPersona & { ens_name: string; wallet_address: string; voting_power: number }> = {
  scientist: {
    name: "Dr. Marina Rodriguez",
    role: "Marine Scientist",
    ens_name: "marina.oceanpolicy.eth",
    wallet_address: "0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4",
    voting_power: 25,
    prompt: `You are Dr. Marina Rodriguez, a leading marine scientist with 15 years of experience in oceanography and marine ecosystems. 
    You focus on scientific evidence, environmental impact, and long-term sustainability. You cite research, data, and ecological principles.
    Your concerns include biodiversity, climate change effects, and ecosystem health. You speak with authority on scientific matters but remain open to evidence-based discussions.
    
    BLOCKCHAIN IDENTITY: You are registered on-chain as marina.oceanpolicy.eth with 25% voting power in the Ocean Governance DAO.
    When making policy recommendations, consider their on-chain implementation and governance implications.`
  },
  fisherman: {
    name: "Captain Jake Thompson",
    role: "Commercial Fisherman",
    ens_name: "captain.oceanpolicy.eth",
    wallet_address: "0x8D4C0532925a3b8D4C0532925a3b8D4C0532925a",
    voting_power: 20,
    prompt: `You are Captain Jake Thompson, a third-generation commercial fisherman with 25 years of experience. 
    You represent the fishing industry's perspective, focusing on economic viability, traditional practices, and livelihood concerns.
    You understand the ocean from a practical standstand and worry about regulations affecting your business and community.
    You speak from experience and emphasize the human cost of policy decisions.
    
    BLOCKCHAIN IDENTITY: You are registered on-chain as captain.oceanpolicy.eth with 20% voting power representing fishing industry stakeholders.
    Your votes carry the weight of traditional maritime communities in the decentralized governance system.`
  },
  legal_advisor: {
    name: "Sarah Chen",
    role: "Maritime Legal Advisor",
    ens_name: "legal.oceanpolicy.eth",
    wallet_address: "0x925a3b8D4C0532925a3b8D4C0532925a3b8D4C053",
    voting_power: 20,
    prompt: `You are Sarah Chen, a maritime law expert specializing in international ocean law, environmental regulations, and policy implementation.
    You focus on legal feasibility, regulatory compliance, international treaties, and enforcement mechanisms.
    You analyze policies for legal soundness, potential conflicts, and implementation challenges.
    You speak precisely about legal implications and regulatory frameworks.
    
    BLOCKCHAIN IDENTITY: You are registered on-chain as legal.oceanpolicy.eth with 20% voting power for legal compliance validation.
    Your role includes ensuring all policy proposals meet smart contract execution requirements and regulatory compliance.`
  },
  data_analyst: {
    name: "Dr. Alex Kumar",
    role: "Ocean Data Analyst",
    ens_name: "data.oceanpolicy.eth",
    wallet_address: "0x2925a3b8D4C0532925a3b8D4C0532925a3b8D4C05",
    voting_power: 20,
    prompt: `You are Dr. Alex Kumar, a data scientist specializing in oceanographic data analysis and trend forecasting.
    You analyze historical data, identify patterns, and predict future trends. You focus on quantitative evidence, statistical analysis, and data-driven insights.
    You provide objective analysis of past policies, their outcomes, and evidence-based predictions.
    You speak in terms of data, statistics, and measurable outcomes.
    
    BLOCKCHAIN IDENTITY: You are registered on-chain as data.oceanpolicy.eth with 20% voting power for data validation and metrics.
    Your analyses contribute to on-chain oracle feeds and policy outcome predictions stored immutably on the blockchain.`
  },
  public_representative: {
    name: "Maria Santos",
    role: "Public Interest Representative",
    ens_name: "public.oceanpolicy.eth",
    wallet_address: "0x32925a3b8D4C0532925a3b8D4C0532925a3b8D4C0",
    voting_power: 15,
    prompt: `You are Maria Santos, representing coastal communities and the general public interest.
    You focus on public health, community impact, accessibility, and social justice aspects of ocean policies.
    You advocate for transparency, public participation, and equitable outcomes for all stakeholders.
    You speak for the common citizen and emphasize democratic values and community welfare.
    
    BLOCKCHAIN IDENTITY: You are registered on-chain as public.oceanpolicy.eth with 15% voting power representing public interest.
    Your role includes ensuring democratic participation and that all policy decisions are transparently recorded on-chain for public accountability.`
  }
};

// Function to get agent response with voting decision
async function getAgentResponse(agentKey: string, scenario: string, context: string, round: number): Promise<{ response: string; vote: BlockchainVote }> {
  const agent = AGENT_PERSONAS[agentKey];

  const prompt = ChatPromptTemplate.fromMessages([
    ["system", agent.prompt],
    ["human", `
SCENARIO: ${scenario}

DEBATE CONTEXT: ${context}

ROUND ${round}: Please provide your perspective on this oceanographic policy scenario. 
Consider the arguments made by other stakeholders and respond with:
1. Your position on the scenario
2. Key concerns from your perspective
3. Proposed solutions or recommendations
4. Response to other stakeholders' points (if any)
5. Your final vote: SUPPORT, OPPOSE, or NEUTRAL (with confidence level 1-100)

Keep your response focused, professional, and true to your role. Limit to 200-300 words.
End your response with: "BLOCKCHAIN VOTE: [SUPPORT/OPPOSE/NEUTRAL] - Confidence: [1-100]% - ENS: ${agent.ens_name}"
    `]
  ]);

  const chain = prompt.pipe(llm);
  const response = await chain.invoke({});
  const responseText = response.content as string;

  // Extract vote from response
  const voteMatch = responseText.match(/BLOCKCHAIN VOTE: (SUPPORT|OPPOSE|NEUTRAL) - Confidence: (\d+)%/);
  const vote: BlockchainVote = {
    agent_id: agentKey,
    agent_name: agent.name,
    ens_name: agent.ens_name,
    wallet_address: agent.wallet_address,
    vote: voteMatch ? (voteMatch[1].toLowerCase() as 'support' | 'oppose' | 'neutral') : 'neutral',
    confidence_score: voteMatch ? parseInt(voteMatch[2]) : 50,
    voting_power: agent.voting_power,
    reasoning: responseText.replace(/BLOCKCHAIN VOTE:.*$/, '').trim()
  };

  return { response: responseText, vote };
}

// Function to calculate consensus and generate blockchain hash
function calculateConsensus(votes: BlockchainVote[]): { consensus_score: number; majority_decision: string; blockchain_hash: string } {
  let supportWeight = 0;
  let opposeWeight = 0;
  let neutralWeight = 0;

  votes.forEach(vote => {
    const weight = (vote.voting_power / 100) * (vote.confidence_score / 100);
    switch (vote.vote) {
      case 'support':
        supportWeight += weight;
        break;
      case 'oppose':
        opposeWeight += weight;
        break;
      case 'neutral':
        neutralWeight += weight;
        break;
    }
  });

  const totalWeight = supportWeight + opposeWeight + neutralWeight;
  const consensus_score = Math.round((Math.max(supportWeight, opposeWeight, neutralWeight) / totalWeight) * 100);
  
  let majority_decision = 'neutral';
  if (supportWeight > opposeWeight && supportWeight > neutralWeight) {
    majority_decision = 'support';
  } else if (opposeWeight > supportWeight && opposeWeight > neutralWeight) {
    majority_decision = 'oppose';
  }

  // Generate mock blockchain hash (in real implementation, this would be actual transaction hash)
  const voteData = votes.map(v => `${v.ens_name}:${v.vote}:${v.confidence_score}`).join('|');
  const blockchain_hash = `0x${Buffer.from(voteData + Date.now()).toString('hex').slice(0, 64)}`;

  return { consensus_score, majority_decision, blockchain_hash };
}

// Function to generate Policy NFT metadata
function generatePolicyNFT(scenario: string, votes: BlockchainVote[], consensus: any, policyId: string): PolicyNFTMetadata {
  return {
    policy_id: policyId,
    scenario: scenario,
    consensus_score: consensus.consensus_score,
    majority_decision: consensus.majority_decision,
    stakeholder_votes: votes,
    implementation_status: consensus.consensus_score >= 60 ? 'approved' : 'proposed',
    created_at: new Date().toISOString(),
    blockchain_hash: consensus.blockchain_hash,
    ens_registry: "oceanpolicy.eth",
    nft_metadata: {
      name: `Ocean Policy #${policyId}`,
      description: `Decentralized policy decision for: ${scenario}`,
      image: `https://api.oceanpolicy.eth/nft/${policyId}/image`,
      attributes: [
        { trait_type: "Consensus Score", value: consensus.consensus_score },
        { trait_type: "Decision", value: consensus.majority_decision },
        { trait_type: "Stakeholders", value: votes.length },
        { trait_type: "Status", value: consensus.consensus_score >= 60 ? 'approved' : 'proposed' }
      ]
    }
  };
}

// Function to research the scenario
async function researchScenario(scenario: string): Promise<string> {
  try {
    const llmWithTools = llm.bindTools([serpTool]);
    const prompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a research assistant. Search for relevant information about the given oceanographic policy scenario."],
      ["human", `Research this oceanographic policy scenario: ${scenario}. Find relevant data, similar cases, and current regulations.`]
    ]);

    const chain = prompt.pipe(llmWithTools);
    const response = await chain.invoke({});

    if (response.tool_calls && response.tool_calls.length > 0) {
      const toolResults = await serpTool.batch(response.tool_calls);
      const contextPrompt = ChatPromptTemplate.fromMessages([
        ["system", "Summarize the research findings into key points relevant to policy discussion."],
        ["human", `Original scenario: ${scenario}\n\nResearch results: ${toolResults.map(r => r.content).join('\n\n')}`]
      ]);

      const summaryChain = contextPrompt.pipe(llm);
      const summary = await summaryChain.invoke({});
      return summary.content as string;
    }

    return "No additional research data found.";
  } catch (error) {
    return "Research unavailable for this scenario.";
  }
}

// Main simulation function with real blockchain integration
export async function runPolicySimulation(scenario: string, rounds: number = 3) {
  try {
    // Initialize blockchain service
    const blockchain = initializeBlockchain();
    
    // Research the scenario first
    const researchContext = await researchScenario(scenario);

    // Create policy on blockchain
    let blockchainPolicyId: number;
    try {
      blockchainPolicyId = await blockchain.createPolicy(scenario, researchContext);
      console.log(`🔗 Policy created on blockchain with ID: ${blockchainPolicyId}`);
    } catch (error) {
      console.warn("⚠️ Blockchain unavailable, using simulation mode");
      blockchainPolicyId = Date.now(); // Fallback to timestamp
    }

    const simulation: SimulationResult = {
      scenario,
      research_context: researchContext,
      rounds: [],
      summary: "",
      recommendations: []
    };

    let debateContext = `RESEARCH CONTEXT:\n${researchContext}\n\n`;
    let allVotes: BlockchainVote[] = [];
    let blockchainVoteHashes: string[] = [];

    // Run debate rounds
    for (let round = 1; round <= rounds; round++) {
      const roundData: RoundData = {
        round_number: round,
        responses: {}
      };

      const roundVotes: BlockchainVote[] = [];

      // Get responses from each agent
      for (const [agentKey, agent] of Object.entries(AGENT_PERSONAS)) {
        const { response, vote } = await getAgentResponse(agentKey, scenario, debateContext, round);
        
        roundData.responses[agentKey] = {
          agent_name: agent.name,
          role: agent.role,
          response: response
        };

        roundVotes.push(vote);
        
        // Cast vote on blockchain (final round only)
        if (round === rounds) {
          try {
            const txHash = await blockchain.castVote(
              blockchainPolicyId,
              agentKey,
              vote.vote,
              vote.confidence_score,
              vote.reasoning
            );
            blockchainVoteHashes.push(txHash);
            console.log(`✅ Vote cast on blockchain for ${agent.ens_name}: ${txHash}`);
          } catch (error) {
            console.warn(`⚠️ Failed to cast blockchain vote for ${agent.ens_name}:`, error);
          }
        }
        
        // Add to debate context for next round
        debateContext += `\n${agent.name} (${agent.role}) [${agent.ens_name}]: ${response}\n`;
      }

      // Store votes from final round for consensus calculation
      if (round === rounds) {
        allVotes = roundVotes;
      }

      simulation.rounds.push(roundData);
    }

    // Calculate blockchain consensus
    const consensus = calculateConsensus(allVotes);

    // Get real blockchain data if available
    let blockchainPolicy = null;
    let blockchainVotes = [];
    try {
      blockchainPolicy = await blockchain.getPolicy(blockchainPolicyId);
      blockchainVotes = await blockchain.getPolicyVotes(blockchainPolicyId);
      console.log(`🔗 Retrieved blockchain policy data: ${blockchainPolicy.consensusScore}% consensus`);
    } catch (error) {
      console.warn("⚠️ Could not retrieve blockchain data, using simulation");
    }

    // Generate Policy NFT
    const policyNFT = generatePolicyNFT(scenario, allVotes, consensus, blockchainPolicyId.toString());

    // Generate final summary and recommendations
    const summaryPrompt = ChatPromptTemplate.fromMessages([
      ["system", "You are a policy synthesis expert. Analyze the multi-stakeholder debate and provide a balanced summary with actionable recommendations."],
      ["human", `
SCENARIO: ${scenario}

FULL DEBATE TRANSCRIPT:
${debateContext}

BLOCKCHAIN VOTING RESULTS:
${allVotes.map(v => `${v.ens_name}: ${v.vote.toUpperCase()} (${v.confidence_score}% confidence, ${v.voting_power}% power)`).join('\n')}

CONSENSUS: ${consensus.majority_decision.toUpperCase()} (${consensus.consensus_score}% consensus score)

Please provide:
1. A balanced summary of key points from all stakeholders
2. Areas of consensus and major disagreements
3. 3-5 actionable policy recommendations that address multiple stakeholder concerns
4. Implementation considerations
5. Blockchain governance implications

Format as a structured policy brief.
      `]
    ]);

    const summaryChain = summaryPrompt.pipe(llm);
    const summaryResponse = await summaryChain.invoke({});

    simulation.summary = summaryResponse.content as string;

    return {
      simulation_results: simulation,
      blockchain_governance: {
        policy_id: blockchainPolicyId.toString(),
        consensus_score: blockchainPolicy?.consensusScore || consensus.consensus_score,
        majority_decision: blockchainPolicy?.majorityDecision !== undefined ? 
          (blockchainPolicy.majorityDecision === 0 ? 'oppose' : blockchainPolicy.majorityDecision === 2 ? 'support' : 'neutral') : 
          consensus.majority_decision,
        blockchain_hash: blockchainPolicy?.blockchainHash || consensus.blockchain_hash,
        stakeholder_votes: allVotes,
        ens_registry: "oceanpolicy.eth",
        transaction_hashes: blockchainVoteHashes,
        on_chain_policy: blockchainPolicy,
        on_chain_votes: blockchainVotes
      },
      policy_nft: policyNFT,
      stakeholder_count: Object.keys(AGENT_PERSONAS).length,
      total_rounds: rounds,
      timestamp: new Date().toISOString(),
      on_chain_status: (blockchainPolicy?.consensusScore || consensus.consensus_score) >= 60 ? 'approved_for_implementation' : 'requires_further_debate',
      blockchain_enabled: blockchainPolicy !== null
    };

  } catch (error) {
    throw new Error(`Simulation failed: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}
