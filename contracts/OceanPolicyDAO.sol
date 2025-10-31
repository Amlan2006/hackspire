// SPDX-License-Identifier: MIT
pragma solidity ^0.8.19;

import "@openzeppelin/contracts/token/ERC721/ERC721.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract OceanPolicyDAO is ERC721, Ownable {
    uint256 private _policyIdCounter;

    struct Agent {
        string name;
        string ensName;
        address walletAddress;
        uint256 votingPower;
        bool isActive;
    }

    struct Vote {
        address agent;
        string ensName;
        uint8 decision; // 0: oppose, 1: neutral, 2: support
        uint256 confidenceScore;
        uint256 timestamp;
        string reasoning;
    }

    struct Policy {
        uint256 id;
        string scenario;
        string researchContext;
        uint256 consensusScore;
        uint8 majorityDecision;
        string blockchainHash;
        uint256 createdAt;
        bool isImplemented;
        string ipfsHash;
    }

    mapping(uint256 => Policy) public policies;
    mapping(address => Agent) public agents;
    mapping(uint256 => Vote[]) public policyVotes;
    mapping(uint256 => string) private _tokenURIs;
    
    address[] public agentAddresses;
    uint256 public constant CONSENSUS_THRESHOLD = 60;

    event PolicyCreated(uint256 indexed policyId, string scenario);
    event VoteCast(uint256 indexed policyId, address indexed agent, uint8 decision, uint256 confidenceScore);
    event PolicyImplemented(uint256 indexed policyId, uint256 consensusScore);
    event AgentRegistered(address indexed agent, string ensName, uint256 votingPower);

    constructor() ERC721("Ocean Policy NFT", "OPNFT") Ownable(msg.sender) {
        // Register the 5 AI agents with corrected addresses
        _registerAgent(
            0x742d35CC6634c0532925A3b8d4C0532925a3B8d4,
            "Dr. Marina Rodriguez",
            "marina.oceanpolicy.eth",
            25
        );
        
        _registerAgent(
            0x8d4C0532925a3B8d4c0532925A3B8D4c0532925A,
            "Captain Jake Thompson", 
            "captain.oceanpolicy.eth",
            20
        );
        
        _registerAgent(
            0x925A3B8D4c0532925a3b8d4c0532925A3B8D4c05,
            "Sarah Chen",
            "legal.oceanpolicy.eth", 
            20
        );
        
        _registerAgent(
            0x2925a3b8d4c0532925a3b8D4c0532925a3B8D4c0,
            "Dr. Alex Kumar",
            "data.oceanpolicy.eth",
            20
        );
        
        _registerAgent(
            0x32925a3b8D4c0532925A3b8D4c0532925A3B8d4c,
            "Maria Santos",
            "public.oceanpolicy.eth",
            15
        );
    }

    function _registerAgent(
        address _address,
        string memory _name,
        string memory _ensName,
        uint256 _votingPower
    ) internal {
        agents[_address] = Agent({
            name: _name,
            ensName: _ensName,
            walletAddress: _address,
            votingPower: _votingPower,
            isActive: true
        });
        agentAddresses.push(_address);
        emit AgentRegistered(_address, _ensName, _votingPower);
    }

    function createPolicy(
        string memory _scenario,
        string memory _researchContext,
        string memory _ipfsHash
    ) external onlyOwner returns (uint256) {
        _policyIdCounter++;
        uint256 newPolicyId = _policyIdCounter;
        
        policies[newPolicyId] = Policy({
            id: newPolicyId,
            scenario: _scenario,
            researchContext: _researchContext,
            consensusScore: 0,
            majorityDecision: 1, // neutral by default
            blockchainHash: "",
            createdAt: block.timestamp,
            isImplemented: false,
            ipfsHash: _ipfsHash
        });

        emit PolicyCreated(newPolicyId, _scenario);
        return newPolicyId;
    }

    function castVote(
        uint256 _policyId,
        uint8 _decision,
        uint256 _confidenceScore,
        string memory _reasoning
    ) external {
        require(agents[msg.sender].isActive, "Not an authorized agent");
        require(_policyId <= _policyIdCounter && _policyId > 0, "Policy does not exist");
        require(_decision <= 2, "Invalid decision");
        require(_confidenceScore <= 100, "Invalid confidence score");

        // Check if agent already voted
        Vote[] storage votes = policyVotes[_policyId];
        for (uint i = 0; i < votes.length; i++) {
            require(votes[i].agent != msg.sender, "Agent already voted");
        }

        Agent memory agent = agents[msg.sender];
        votes.push(Vote({
            agent: msg.sender,
            ensName: agent.ensName,
            decision: _decision,
            confidenceScore: _confidenceScore,
            timestamp: block.timestamp,
            reasoning: _reasoning
        }));

        emit VoteCast(_policyId, msg.sender, _decision, _confidenceScore);

        // Calculate consensus if all agents have voted
        if (votes.length == agentAddresses.length) {
            _calculateConsensus(_policyId);
        }
    }

    function _calculateConsensus(uint256 _policyId) internal {
        Vote[] storage votes = policyVotes[_policyId];
        uint256 supportWeight = 0;
        uint256 opposeWeight = 0;
        uint256 neutralWeight = 0;

        for (uint i = 0; i < votes.length; i++) {
            Vote memory vote = votes[i];
            Agent memory agent = agents[vote.agent];
            uint256 weight = (agent.votingPower * vote.confidenceScore) / 100;

            if (vote.decision == 2) { // support
                supportWeight += weight;
            } else if (vote.decision == 0) { // oppose
                opposeWeight += weight;
            } else { // neutral
                neutralWeight += weight;
            }
        }

        uint256 totalWeight = supportWeight + opposeWeight + neutralWeight;
        uint256 consensusScore = 0;
        uint8 majorityDecision = 1; // neutral

        if (supportWeight > opposeWeight && supportWeight > neutralWeight) {
            consensusScore = (supportWeight * 100) / totalWeight;
            majorityDecision = 2; // support
        } else if (opposeWeight > supportWeight && opposeWeight > neutralWeight) {
            consensusScore = (opposeWeight * 100) / totalWeight;
            majorityDecision = 0; // oppose
        } else {
            consensusScore = (neutralWeight * 100) / totalWeight;
            majorityDecision = 1; // neutral
        }

        // Generate blockchain hash
        string memory blockchainHash = _generateHash(_policyId, consensusScore, majorityDecision);
        
        policies[_policyId].consensusScore = consensusScore;
        policies[_policyId].majorityDecision = majorityDecision;
        policies[_policyId].blockchainHash = blockchainHash;

        // Mint NFT if consensus reached
        if (consensusScore >= CONSENSUS_THRESHOLD) {
            _mintPolicyNFT(_policyId);
            policies[_policyId].isImplemented = true;
            emit PolicyImplemented(_policyId, consensusScore);
        }
    }

    function _generateHash(
        uint256 _policyId,
        uint256 _consensusScore,
        uint8 _majorityDecision
    ) internal view returns (string memory) {
        bytes32 hash = keccak256(abi.encodePacked(
            _policyId,
            _consensusScore,
            _majorityDecision,
            block.timestamp,
            block.prevrandao
        ));
        return _toHexString(hash);
    }

    function _toHexString(bytes32 data) internal pure returns (string memory) {
        bytes memory alphabet = "0123456789abcdef";
        bytes memory str = new bytes(64);
        for (uint256 i = 0; i < 32; i++) {
            str[i*2] = alphabet[uint8(data[i] >> 4)];
            str[1+i*2] = alphabet[uint8(data[i] & 0x0f)];
        }
        return string(str);
    }

    function _mintPolicyNFT(uint256 _policyId) internal {
        // Renamed variable to avoid shadowing
        string memory nftTokenURI = string(abi.encodePacked(
            "https://api.oceanpolicy.eth/nft/",
            _toString(_policyId),
            "/metadata"
        ));
        _tokenURIs[_policyId] = nftTokenURI;
        _safeMint(owner(), _policyId);
    }

    function tokenURI(uint256 tokenId) public view virtual override returns (string memory) {
        require(ownerOf(tokenId) != address(0), "ERC721: URI query for nonexistent token");
        return _tokenURIs[tokenId];
    }

    function getPolicy(uint256 _policyId) external view returns (Policy memory) {
        return policies[_policyId];
    }

    function getPolicyVotes(uint256 _policyId) external view returns (Vote[] memory) {
        return policyVotes[_policyId];
    }

    function getAgent(address _agentAddress) external view returns (Agent memory) {
        return agents[_agentAddress];
    }

    function getAllAgents() external view returns (Agent[] memory) {
        Agent[] memory allAgents = new Agent[](agentAddresses.length);
        for (uint i = 0; i < agentAddresses.length; i++) {
            allAgents[i] = agents[agentAddresses[i]];
        }
        return allAgents;
    }

    function getTotalPolicies() external view returns (uint256) {
        return _policyIdCounter;
    }

    function _toString(uint256 value) internal pure returns (string memory) {
        if (value == 0) {
            return "0";
        }
        uint256 temp = value;
        uint256 digits;
        while (temp != 0) {
            digits++;
            temp /= 10;
        }
        bytes memory buffer = new bytes(digits);
        while (value != 0) {
            digits -= 1;
            buffer[digits] = bytes1(uint8(48 + uint256(value % 10)));
            value /= 10;
        }
        return string(buffer);
    }
}