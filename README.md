# Oceanographic Policy Simulator 🌊⛓️

A blockchain-powered multi-agent debate system for oceanographic policy decisions, designed for policymakers and stakeholders. This system simulates realistic policy discussions with 5 ENS-registered AI agents, featuring on-chain voting, consensus mechanisms, and NFT policy certificates.

## 🤖 ENS-Registered Agent Personas

1. **Dr. Marina Rodriguez** - `marina.oceanpolicy.eth`
   - Marine Scientist with 25% voting power
   - Focuses on scientific evidence and environmental impact
   - Wallet: `0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4`

2. **Captain Jake Thompson** - `captain.oceanpolicy.eth`
   - Commercial Fisherman with 20% voting power
   - Represents fishing industry perspective
   - Wallet: `0x8D4C0532925a3b8D4C0532925a3b8D4C0532925a`

3. **Sarah Chen** - `legal.oceanpolicy.eth`
   - Maritime Legal Advisor with 20% voting power
   - Specializes in maritime law and policy implementation
   - Wallet: `0x925a3b8D4C0532925a3b8D4C0532925a3b8D4C053`

4. **Dr. Alex Kumar** - `data.oceanpolicy.eth`
   - Ocean Data Analyst with 20% voting power
   - Provides data-driven insights and trend analysis
   - Wallet: `0x2925a3b8D4C0532925a3b8D4C0532925a3b8D4C05`

5. **Maria Santos** - `public.oceanpolicy.eth`
   - Public Interest Representative with 15% voting power
   - Advocates for coastal communities and public welfare
   - Wallet: `0x32925a3b8D4C0532925a3b8D4C0532925a3b8D4C0`

## 🚀 Blockchain Features

- **On-Chain Voting System**: Each agent vote recorded with cryptographic signatures
- **ENS Integration**: All agents registered with .oceanpolicy.eth domains
- **Policy NFTs**: Unique NFT certificates for each policy simulation
- **Weighted Consensus**: Voting power based on stakeholder expertise
- **Blockchain Transparency**: All decisions immutably recorded on-chain
- **DAO Governance**: Decentralized autonomous organization for ocean policy

## 🌟 Core Features

- Multi-round policy debates with structured arguments
- Research-backed discussions using real-time data
- Balanced stakeholder representation with voting power
- Comprehensive policy recommendations with consensus scores
- Implementation feasibility analysis with blockchain governance

## Usage

Send a POST request to `/start` with a policy scenario:

```json
{
  "scenario": "Proposed offshore wind farm development in marine protected area",
  "rounds": 3
}
```

The system will:
1. Research the scenario using current data
2. Conduct multi-round debates between ENS-registered agents
3. Record weighted votes on blockchain with confidence scores
4. Calculate consensus using weighted stakeholder voting
5. Generate Policy NFT with metadata and blockchain hash
6. Provide implementation considerations with DAO governance

---

## 🧩 Framework & Runtime

- **Runtime:** Bun  
- **Web Framework:** Hono  
- **Language:** TypeScript  

---

## 🧠 Tools & Technologies

### AI/ML
- LangChain for AI workflow orchestration  
- Google Generative AI (Gemini 2.0 Flash model)  
- SerpAPI for research and data gathering  
- Multi-agent debate simulation

---

### 🧑‍💻 Development
- TypeScript with strict mode  
- Bun for package management and runtime  
- Hot reload development server  

---

### 🚀 Deployment
- Axicov CLI for workflow management  
- Docker support included

## Environment Variables

- `SERPAPI_API_KEY`: For research and data gathering
- `GOOGLE_API_KEY`: For AI agent responses and analysis

## Use Cases

- Policy impact assessment
- Stakeholder consultation simulation
- Educational tool for marine policy
- Decision support for policymakers
- Public engagement in ocean governance
#
# 🔗 Blockchain Integration

### ENS Registry: `oceanpolicy.eth`
- **Governance Contract**: `0x742d35Cc6634C0532925a3b8D4C0532925a3b8D4`
- **Consensus Threshold**: 60% for policy approval
- **Total Voting Power**: 100% distributed across 5 agents

### API Endpoints

**Policy Simulation**:
```bash
POST /start
{
  "scenario": "Your policy scenario",
  "rounds": 3
}
```

**Governance Query**:
```bash
GET /governance/{policyId}
```

**ENS Registry**:
```bash
GET /ens
```

### Sample Response with Blockchain Features

```json
{
  "simulation_results": { ... },
  "blockchain_governance": {
    "policy_id": "POL-1698765432-abc123def",
    "consensus_score": 75,
    "majority_decision": "support",
    "blockchain_hash": "0x742d35cc6634c0532925a3b8d4c0532925a3b8d4...",
    "stakeholder_votes": [
      {
        "ens_name": "marina.oceanpolicy.eth",
        "vote": "support",
        "confidence_score": 85,
        "voting_power": 25
      }
    ]
  },
  "policy_nft": {
    "policy_id": "POL-1698765432-abc123def",
    "nft_metadata": {
      "name": "Ocean Policy #POL-1698765432-abc123def",
      "attributes": [
        { "trait_type": "Consensus Score", "value": 75 },
        { "trait_type": "Decision", "value": "support" }
      ]
    }
  },
  "on_chain_status": "approved_for_implementation"
}
```