// Global variables
let isSimulating = false;
const API_BASE = 'http://localhost:3000';

// DOM Elements
const scenarioInput = document.getElementById('scenarioInput');
const roundsInput = document.getElementById('roundsInput');
const simulateBtn = document.getElementById('simulateBtn');
const btnText = document.querySelector('.btn-text');
const btnLoader = document.querySelector('.btn-loader');
const resultsSection = document.getElementById('resultsSection');
const blockchainStatus = document.getElementById('blockchainStatus');

// Initialize the application
document.addEventListener('DOMContentLoaded', function() {
    checkBlockchainStatus();
    setupEventListeners();
    
    // Set default scenario
    scenarioInput.value = "Proposed offshore wind farm development in marine protected area affecting local fishing communities and carbon sequestration efforts";
});

// Setup event listeners
function setupEventListeners() {
    simulateBtn.addEventListener('click', startSimulation);
    
    // Enter key to start simulation
    scenarioInput.addEventListener('keydown', function(e) {
        if (e.ctrlKey && e.key === 'Enter') {
            startSimulation();
        }
    });
}

// Check blockchain connection status
async function checkBlockchainStatus() {
    try {
        const response = await fetch(`${API_BASE}/blockchain/status`);
        const data = await response.json();
        
        const statusElement = document.getElementById('blockchainStatus');
        const statusText = statusElement.querySelector('.status-text');
        
        const networkInfo = document.getElementById('networkInfo');
        
        if (data.status === 'connected') {
            statusElement.className = 'status connected';
            statusText.textContent = 'Blockchain Connected';
            networkInfo.textContent = 'Network: Celo Alfajores Testnet';
        } else if (data.status === 'simulation') {
            statusElement.className = 'status connected';
            statusText.textContent = 'Demo Mode';
            networkInfo.textContent = 'Network: Demo Mode (Simulated Blockchain)';
        } else {
            statusElement.className = 'status disconnected';
            statusText.textContent = 'Offline Mode';
            networkInfo.textContent = 'Network: Disconnected';
        }
    } catch (error) {
        console.error('Failed to check blockchain status:', error);
        const statusElement = document.getElementById('blockchainStatus');
        const statusText = statusElement.querySelector('.status-text');
        statusElement.className = 'status disconnected';
        statusText.textContent = 'Connection Error';
    }
}

// Start policy simulation
async function startSimulation() {
    if (isSimulating) return;
    
    const scenario = scenarioInput.value.trim();
    if (!scenario) {
        alert('Please enter a policy scenario');
        return;
    }
    
    isSimulating = true;
    updateSimulateButton(true);
    hideResults();
    
    try {
        const response = await fetch(`${API_BASE}/start`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                scenario: scenario,
                rounds: parseInt(roundsInput.value)
            })
        });
        
        if (!response.ok) {
            throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        
        if (data.success) {
            displayResults(data.data);
        } else {
            throw new Error(data.data?.message || 'Simulation failed');
        }
        
    } catch (error) {
        console.error('Simulation error:', error);
        alert(`Simulation failed: ${error.message}`);
    } finally {
        isSimulating = false;
        updateSimulateButton(false);
    }
}

// Update simulate button state
function updateSimulateButton(loading) {
    simulateBtn.disabled = loading;
    
    if (loading) {
        btnText.style.display = 'none';
        btnLoader.style.display = 'inline';
        simulateBtn.style.background = '#333';
        simulateBtn.style.cursor = 'not-allowed';
    } else {
        btnText.style.display = 'inline';
        btnLoader.style.display = 'none';
        simulateBtn.style.background = '#fff';
        simulateBtn.style.cursor = 'pointer';
    }
}

// Hide results section
function hideResults() {
    resultsSection.style.display = 'none';
}

// Display simulation results
function displayResults(data) {
    // Show results section
    resultsSection.style.display = 'block';
    
    // Scroll to results
    resultsSection.scrollIntoView({ behavior: 'smooth' });
    
    // Display blockchain governance info
    displayBlockchainInfo(data.blockchain_governance);
    
    // Display animated agent responses first
    displayAgentResponses(data.blockchain_governance.stakeholder_votes);
    
    // Display votes summary
    displayVotes(data.blockchain_governance.stakeholder_votes);
    
    // Display markdown summary
    displayMarkdownSummary(data.simulation_results.summary);
    
    // Display transaction hashes
    displayTransactions(data.blockchain_governance.transaction_hashes);
}

// Display blockchain governance information
function displayBlockchainInfo(governance) {
    document.getElementById('policyId').textContent = governance.policy_id;
    document.getElementById('consensusScore').textContent = `${governance.consensus_score}%`;
    document.getElementById('majorityDecision').textContent = governance.majority_decision.toUpperCase();
    document.getElementById('onChainStatus').textContent = governance.consensus_score >= 60 ? 'APPROVED' : 'REQUIRES DEBATE';
    
    // Style the status
    const statusElement = document.getElementById('onChainStatus');
    if (governance.consensus_score >= 60) {
        statusElement.style.color = '#00ff00';
    } else {
        statusElement.style.color = '#ff6600';
    }
}

// Display agent votes
function displayVotes(votes) {
    const container = document.getElementById('votesContainer');
    container.innerHTML = '';
    
    votes.forEach(vote => {
        const voteElement = document.createElement('div');
        voteElement.className = 'vote-item';
        
        voteElement.innerHTML = `
            <div class="vote-agent">
                <div>
                    <div class="vote-agent-name">${vote.agent_name}</div>
                    <div class="vote-ens">${vote.ens_name}</div>
                </div>
            </div>
            <div class="vote-decision">
                <span class="vote-badge ${vote.vote}">${vote.vote.toUpperCase()}</span>
                <span class="vote-confidence">${vote.confidence_score}% confidence</span>
                <span class="vote-power">${vote.voting_power}% power</span>
            </div>
        `;
        
        container.appendChild(voteElement);
    });
}

// Display animated agent responses
function displayAgentResponses(votes) {
    const container = document.getElementById('agentResponsesContainer');
    container.innerHTML = '';
    
    const agentIcons = {
        'scientist': '🔬',
        'fisherman': '⚓',
        'legal_advisor': '⚖️',
        'data_analyst': '📊',
        'public_representative': '👥'
    };
    
    votes.forEach((vote, index) => {
        // Create loading placeholder first
        const loadingElement = document.createElement('div');
        loadingElement.className = 'agent-loading';
        loadingElement.innerHTML = `
            <span class="agent-icon">${agentIcons[vote.agent_id] || '🤖'}</span>
            <span>${vote.agent_name} is thinking...</span>
            <div class="agent-loading-dots">
                <div class="agent-loading-dot"></div>
                <div class="agent-loading-dot"></div>
                <div class="agent-loading-dot"></div>
            </div>
        `;
        container.appendChild(loadingElement);
        
        // Replace with actual response after delay
        setTimeout(() => {
            const responseElement = document.createElement('div');
            responseElement.className = 'agent-response-item';
            
            responseElement.innerHTML = `
                <div class="agent-response-header">
                    <span class="agent-response-icon">${agentIcons[vote.agent_id] || '🤖'}</span>
                    <div class="agent-response-info">
                        <h4>${vote.agent_name}</h4>
                        <div class="agent-response-ens">${vote.ens_name}</div>
                    </div>
                </div>
                <div class="agent-response-content">
                    ${formatAgentResponse(vote.reasoning)}
                </div>
                <div class="agent-response-vote">
                    <span class="vote-badge ${vote.vote}">${vote.vote.toUpperCase()}</span>
                    <span class="vote-confidence">${vote.confidence_score}% confidence</span>
                </div>
            `;
            
            container.replaceChild(responseElement, loadingElement);
        }, (index + 1) * 800); // Stagger the responses
    });
}

// Format agent response text
function formatAgentResponse(reasoning) {
    // Remove the blockchain vote line
    const cleanReasoning = reasoning.replace(/BLOCKCHAIN VOTE:.*$/m, '').trim();
    
    // Convert to paragraphs and add basic formatting
    return cleanReasoning
        .split('\n\n')
        .map(paragraph => `<p>${paragraph.trim()}</p>`)
        .join('');
}

// Display markdown summary
function displayMarkdownSummary(summary) {
    const container = document.getElementById('summaryContent');
    
    // Convert summary to markdown format if it isn't already
    const markdownSummary = formatSummaryAsMarkdown(summary);
    
    // Render markdown to HTML
    if (typeof marked !== 'undefined') {
        container.innerHTML = marked.parse(markdownSummary);
    } else {
        // Fallback if marked.js isn't loaded
        container.innerHTML = `<pre>${markdownSummary}</pre>`;
    }
}

// Format summary as proper markdown
function formatSummaryAsMarkdown(summary) {
    // If already formatted, return as is
    if (summary.includes('##') || summary.includes('###')) {
        return summary;
    }
    
    // Basic markdown formatting
    let formatted = summary;
    
    // Convert numbered sections to headers
    formatted = formatted.replace(/(\d+\.\s*\*\*[^*]+\*\*)/g, '\n## $1');
    formatted = formatted.replace(/\*\*([^*]+)\*\*/g, '**$1**');
    
    // Convert bullet points
    formatted = formatted.replace(/^\s*\*\s+/gm, '- ');
    formatted = formatted.replace(/^\s*-\s+/gm, '- ');
    
    // Add proper spacing
    formatted = formatted.replace(/\n\n\n+/g, '\n\n');
    
    return formatted;
}

// Display transaction hashes
function displayTransactions(hashes) {
    const container = document.getElementById('transactionsList');
    container.innerHTML = '';
    
    if (!hashes || hashes.length === 0) {
        container.innerHTML = '<div class="transaction-item">No transactions recorded</div>';
        return;
    }
    
    hashes.forEach((hash, index) => {
        const txElement = document.createElement('div');
        txElement.className = 'transaction-item';
        
        txElement.innerHTML = `
            <span>Vote ${index + 1}:</span>
            <span class="tx-hash" onclick="copyToClipboard('${hash}')" title="Click to copy">${hash}</span>
        `;
        
        container.appendChild(txElement);
    });
}

// Copy text to clipboard
function copyToClipboard(text) {
    navigator.clipboard.writeText(text).then(() => {
        // Show temporary feedback
        const originalText = event.target.textContent;
        event.target.textContent = 'Copied!';
        event.target.style.color = '#00ff00';
        
        setTimeout(() => {
            event.target.textContent = originalText;
            event.target.style.color = '#888';
        }, 1000);
    }).catch(err => {
        console.error('Failed to copy text: ', err);
    });
}

// View contract on Etherscan
function viewContract() {
    const contractAddress = document.getElementById('contractAddress').textContent;
    window.open(`https://etherscan.io/address/${contractAddress}`, '_blank');
}

// Utility function to format large numbers
function formatNumber(num) {
    if (num >= 1000000) {
        return (num / 1000000).toFixed(1) + 'M';
    } else if (num >= 1000) {
        return (num / 1000).toFixed(1) + 'K';
    }
    return num.toString();
}

// Add some sample scenarios for quick testing
const sampleScenarios = [
    "Proposed offshore wind farm development in marine protected area affecting local fishing communities",
    "Implementation of blockchain-based carbon credit system for ocean conservation projects",
    "New regulations for deep-sea mining operations near coral reef ecosystems",
    "Establishment of marine sanctuary with restricted fishing zones and tourism access",
    "Policy for plastic waste reduction in coastal areas with industry compliance requirements"
];

// Add sample scenario selector (optional enhancement)
function addSampleScenarios() {
    const inputSection = document.querySelector('.input-section');
    
    const samplesDiv = document.createElement('div');
    samplesDiv.innerHTML = `
        <div style="margin-top: 15px; padding-top: 15px; border-top: 1px solid #333;">
            <label style="color: #888; font-size: 0.9rem; margin-bottom: 10px; display: block;">Quick Start Examples:</label>
            <div style="display: flex; flex-wrap: wrap; gap: 8px;">
                ${sampleScenarios.map((scenario, index) => 
                    `<button onclick="loadSampleScenario(${index})" style="background: #222; border: 1px solid #444; color: #ccc; padding: 6px 12px; border-radius: 4px; font-size: 0.8rem; cursor: pointer; transition: all 0.2s;" onmouseover="this.style.background='#333'" onmouseout="this.style.background='#222'">
                        Example ${index + 1}
                    </button>`
                ).join('')}
            </div>
        </div>
    `;
    
    inputSection.appendChild(samplesDiv);
}

// Load sample scenario
function loadSampleScenario(index) {
    scenarioInput.value = sampleScenarios[index];
    scenarioInput.focus();
}

// Initialize sample scenarios
document.addEventListener('DOMContentLoaded', function() {
    setTimeout(addSampleScenarios, 100);
});