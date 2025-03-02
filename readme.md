# Esport Dream League

## Architecture Plan
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 800 600">
  <!-- Background -->
  <rect width="800" height="600" fill="#f8f9fa" />
  
  <!-- Title -->
  <text x="400" y="40" font-family="Arial" font-size="24" text-anchor="middle" font-weight="bold">Esports Manager Game Architecture</text>
  
  <!-- User Layer -->
  <rect x="50" y="80" width="700" height="80" rx="10" fill="#e3f2fd" stroke="#2196f3" stroke-width="2" />
  <text x="400" y="120" font-family="Arial" font-size="18" text-anchor="middle" font-weight="bold">User Interfaces</text>
  <rect x="80" y="140" width="120" height="30" rx="5" fill="#bbdefb" stroke="#1e88e5" stroke-width="1" />
  <text x="140" y="160" font-family="Arial" font-size="12" text-anchor="middle">Web App (React)</text>
  <rect x="230" y="140" width="120" height="30" rx="5" fill="#bbdefb" stroke="#1e88e5" stroke-width="1" />
  <text x="290" y="160" font-family="Arial" font-size="12" text-anchor="middle">Mobile App</text>
  <rect x="380" y="140" width="120" height="30" rx="5" fill="#bbdefb" stroke="#1e88e5" stroke-width="1" />
  <text x="440" y="160" font-family="Arial" font-size="12" text-anchor="middle">Wallet Integration</text>
  <rect x="530" y="140" width="190" height="30" rx="5" fill="#bbdefb" stroke="#1e88e5" stroke-width="1" />
  <text x="625" y="160" font-family="Arial" font-size="12" text-anchor="middle">Data Visualizations (D3.js)</text>
  
  <!-- Application Layer -->
  <rect x="50" y="180" width="700" height="120" rx="10" fill="#e8f5e9" stroke="#4caf50" stroke-width="2" />
  <text x="400" y="210" font-family="Arial" font-size="18" text-anchor="middle" font-weight="bold">Application Layer</text>
  <rect x="80" y="230" width="120" height="60" rx="5" fill="#c8e6c9" stroke="#43a047" stroke-width="1" />
  <text x="140" y="255" font-family="Arial" font-size="12" text-anchor="middle">Team Management</text>
  <text x="140" y="275" font-family="Arial" font-size="10" text-anchor="middle">Web3.js + React</text>
  
  <rect x="230" y="230" width="120" height="60" rx="5" fill="#c8e6c9" stroke="#43a047" stroke-width="1" />
  <text x="290" y="255" font-family="Arial" font-size="12" text-anchor="middle">Marketplace</text>
  <text x="290" y="275" font-family="Arial" font-size="10" text-anchor="middle">NFT Trading</text>
  
  <rect x="380" y="230" width="120" height="60" rx="5" fill="#c8e6c9" stroke="#43a047" stroke-width="1" />
  <text x="440" y="255" font-family="Arial" font-size="12" text-anchor="middle">Tournament System</text>
  <text x="440" y="275" font-family="Arial" font-size="10" text-anchor="middle">Brackets & Rewards</text>
  
  <rect x="530" y="230" width="190" height="60" rx="5" fill="#c8e6c9" stroke="#43a047" stroke-width="1" />
  <text x="625" y="255" font-family="Arial" font-size="12" text-anchor="middle">AI Simulation Engine</text>
  <text x="625" y="275" font-family="Arial" font-size="10" text-anchor="middle">Match Simulation & Commentary</text>
  
  <!-- Backend Services Layer -->
  <rect x="50" y="320" width="700" height="100" rx="10" fill="#fff3e0" stroke="#ff9800" stroke-width="2" />
  <text x="400" y="350" font-family="Arial" font-size="18" text-anchor="middle" font-weight="bold">Backend Services</text>
  <rect x="100" y="370" width="160" height="40" rx="5" fill="#ffe0b2" stroke="#f57c00" stroke-width="1" />
  <text x="180" y="395" font-family="Arial" font-size="12" text-anchor="middle">Node.js API Services</text>
  
  <rect x="320" y="370" width="160" height="40" rx="5" fill="#ffe0b2" stroke="#f57c00" stroke-width="1" />
  <text x="400" y="395" font-family="Arial" font-size="12" text-anchor="middle">Off-chain AI Processing</text>
  
  <rect x="540" y="370" width="160" height="40" rx="5" fill="#ffe0b2" stroke="#f57c00" stroke-width="1" />
  <text x="620" y="395" font-family="Arial" font-size="12" text-anchor="middle">WebSocket Real-time Updates</text>
  
  <!-- Blockchain Layer -->
  <rect x="50" y="440" width="700" height="130" rx="10" fill="#e1f5fe" stroke="#03a9f4" stroke-width="2" />
  <text x="400" y="470" font-family="Arial" font-size="18" text-anchor="middle" font-weight="bold">Solana Blockchain Layer</text>
  
  <rect x="80" y="490" width="180" height="60" rx="5" fill="#b3e5fc" stroke="#0288d1" stroke-width="1" />
  <text x="170" y="515" font-family="Arial" font-size="12" text-anchor="middle">Player NFT Smart Contracts</text>
  <text x="170" y="535" font-family="Arial" font-size="10" text-anchor="middle">Anchor + Metaplex</text>
  
  <rect x="320" y="490" width="180" height="60" rx="5" fill="#b3e5fc" stroke="#0288d1" stroke-width="1" />
  <text x="410" y="515" font-family="Arial" font-size="12" text-anchor="middle">Game Logic Programs</text>
  <text x="410" y="535" font-family="Arial" font-size="10" text-anchor="middle">Tournament, Training, Trading</text>
  
  <rect x="560" y="490" width="180" height="60" rx="5" fill="#b3e5fc" stroke="#0288d1" stroke-width="1" />
  <text x="650" y="515" font-family="Arial" font-size="12" text-anchor="middle">Token Economy</text>
  <text x="650" y="535" font-family="Arial" font-size="10" text-anchor="middle">SPL Tokens + Treasury</text>
  
  <!-- Connection lines -->
  <!-- User to Application -->
  <line x1="400" y1="160" x2="400" y2="180" stroke="#666" stroke-width="2" stroke-dasharray="5,5" />
  
  <!-- Application to Backend -->
  <line x1="400" y1="300" x2="400" y2="320" stroke="#666" stroke-width="2" stroke-dasharray="5,5" />
  
  <!-- Backend to Blockchain -->
  <line x1="400" y1="420" x2="400" y2="440" stroke="#666" stroke-width="2" stroke-dasharray="5,5" />
  
  <!-- AI Engine to Off-chain processing -->
  <line x1="600" y1="290" x2="400" y2="370" stroke="#666" stroke-width="1" stroke-dasharray="3,3" />
</svg>

