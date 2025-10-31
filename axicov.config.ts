const axicovConfig = {
  name: "Oceanographic Policy Simulator",
  description: "Blockchain-powered multi-agent debate system for oceanographic policy decisions with ENS-registered AI agents, on-chain voting, and NFT policy certificates",
  readmePath: "./README.md",
  env: "./.env",
  params: {
    scenario: {
      description: "Policy scenario or situation to simulate and debate",
      required: true,
      type: String,
    },
    rounds: {
      description: "Number of debate rounds (default: 3)",
      required: false,
      type: Number,
    },
  },
  port: 3000,
  tags: ["Oceanography", "Policy", "Multi-Agent", "Blockchain", "ENS", "NFT", "DAO", "Governance"],
};

module.exports = axicovConfig;
