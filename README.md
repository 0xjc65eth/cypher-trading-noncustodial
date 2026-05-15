# 🔥 Cypher Trading Non-Custodial

<p align="center">
  <img src="https://img.shields.io/badge/voice-OVOS-purple?style=for-the-badge" alt="OVOS Voice" />
  <img src="https://img.shields.io/badge/frontend-Electron%20%2B%20React-cyan?style=for-the-badge" alt="Electron+React" />
  <img src="https://img.shields.io/badge/trading-NON--CUSTODIAL-green?style=for-the-badge" alt="Non-Custodial" />
  <img src="https://img.shields.io/badge/chains-Multi--Chain-blue?style=for-the-badge" alt="Multi-Chain" />
</p>

**🎙️ The first non-custodial voice assistant for crypto trading.**  
Say "Hey Cypher" — trade on DEXes, open perps, check your portfolio — all by voice, all self-custodied.

> ⚠️ **Cypher NEVER stores your private keys or seed phrases. Ever.**  
> All transactions are signed locally on your device via WalletConnect v2.  
> Your keys, your coins. 🔒

---

## ✨ Features

| Feature | Description |
|---|---|
| 🎙️ **Voice Commands** | Trade by voice — "Swap 1 ETH to USDC", "Open long on SOL with 5x", "Check my balance" |
| 🔒 **Non-Custodial** | Private keys NEVER leave your device. We can't access your funds. |
| ⛓️ **Multi-Chain** | Ethereum, Arbitrum, Base, Solana, Polygon — all from one interface |
| 🦄 **DEX Aggregation** | Best prices via 1inch, Jupiter (Solana), Uniswap V3/V4 |
| 📈 **Perpetuals** | Long/Short with leverage on GMX (Arbitrum) |
| 🛡️ **Risk Management** | Voice-controlled stop-loss, take-profit, max position size |
| 🧠 **Subagents** | Voice Agent, Trading Agent, Security Agent — coordinated AI |
| 💻 **Desktop + Mobile** | Electron app with React — always-on voice orb |

---

## 🏗️ Architecture

```
cypher-trading-noncustodial/
├── frontend/          # Electron + React (Voice UI, Wallet, Trading panels)
│   ├── electron/      # Main process, IPC, security policies
│   └── src/
│       ├── components/# VoiceOrb, WalletPanel, TradingPanel, PortfolioView
│       ├── hooks/     # useVoice, useWallet, useTrading
│       └── services/  # voiceService, walletService, tradingService
├── backend/           # Node.js + Express (API, trading engine, subagents)
│   └── src/
│       ├── routes/    # /api/voice, /api/trading, /api/wallet
│       ├── services/  # tradingEngine (1inch, Jupiter, GMX)
│       └── subagents/ # voiceAgent, tradingAgent, securityAgent
├── skills/            # OVOS Python skills (7 skills)
│   ├── wallet-connect/
│   ├── quote-price/
│   ├── swap-exchange/
│   ├── perps-position/
│   ├── balance-check/
│   ├── trade-history/
│   └── risk-management/
├── shared/            # Shared TypeScript types
├── scripts/           # setup.sh, dev.sh, voice-ws-server.js
└── package.json       # Root orchestration
```

### Subagent Communication Flow

```
User Voice → [Voice WebSocket] → Voice Agent → Intent Recognition
                                                  ↓
                                          Trading Agent ← → Security Agent
                                                  ↓
                                          DEX Aggregator (1inch/Jupiter/GMX)
                                                  ↓
                                          WalletConnect (client-side signing)
```

---

## 🚀 Quick Start

### Prerequisites

- **Node.js** >= 20
- **Python** >= 3.10
- **Wallet** (MetaMask, Rainbow, or Rabby browser extension)

### 1. Clone & Setup

```bash
git clone https://github.com/cypher-trading/cypher-trading-noncustodial.git
cd cypher-trading-noncustodial
npm run setup
```

### 2. Configure Environment

```bash
cp .env.example .env
# Edit .env with your:
#   - WalletConnect Project ID (get from cloud.walletconnect.com)
#   - RPC URLs (Alchemy / Infura)
#   - 1inch API key (optional, free tier available)
```

### 3. Start Everything

```bash
npm run dev
```

This starts:
- **Backend API** → http://localhost:4000
- **Frontend (React)** → http://localhost:3000
- **Voice WebSocket** → ws://localhost:8181
- **OVOS Skills** → localhost:5000

### 4. Open the Electron App

```bash
cd frontend && npm run dev:electron
```

---

## 🎙️ Voice Commands

| Command | Action |
|---|---|
| "Connect wallet" | Open WalletConnect to link your wallet |
| "Check my balance" | Show all token balances across chains |
| "What's the price of ETH?" | Fetch best price from DEX aggregators |
| "Swap 1 ETH to USDC" | Prepare a swap (confirm before executing) |
| "Open long on SOL with 5x leverage" | Open a perp position on GMX |
| "Set stop-loss at 5 percent" | Configure automatic exit strategy |
| "Show my trade history" | Display past swaps and positions |
| "What's my P&L?" | Portfolio performance summary |

---

## 🛠️ Adding New Skills

### 1. Create a new OVOS skill

```bash
mkdir -p skills/my-new-skill/dialog/en-us
```

### 2. Add `__init__.py`

```python
from ovos_workshop.skills import OVOSSkill
from ovos_workshop.decorators import intent_handler
from ovos_workshop.intents import IntentBuilder

class MyNewSkill(OVOSSkill):
    def initialize(self):
        self.log.info("[MyNewSkill] Initialized")

    @intent_handler(IntentBuilder("MyIntent").require("keyword"))
    def handle_intent(self, message):
        self.speak_dialog("response")

    def stop(self):
        pass

def create_skill():
    return MyNewSkill()
```

### 3. Add dialog files

Create `skills/my-new-skill/dialog/en-us/response.dialog`

### 4. Register the skill in OVOS config

Add to `skills/skills_config.yaml`

---

## 🔒 Security

Cypher is built with non-custodial principles at its core:

- **No private keys**: Never stored, never transmitted, never requested
- **Client-side signing**: All transactions signed via WalletConnect v2 on your device
- **Read-only by default**: Balance checks and quotes don't require any permissions
- **Contract verification**: Security agent validates known contract addresses
- **Smart contract exits**: Stop-loss and take-profit execute on-chain, not on a server
- **Open source**: Every line of code visible. No backdoors possible.

---

## 📦 Key Dependencies

### Frontend
- Electron 32 + React 18
- WalletConnect v2 + ethers.js v6
- Tailwind CSS + Framer Motion + Lucide Icons

### Backend
- Node.js + Express + WebSocket
- ethers.js v6 + Zod validation

### Voice (OVOS)
- OVOS Core + Precise Wake Word ("Hey Cypher")
- OpenAI Whisper (STT) + Mimic3 (TTS)
- Adapt + Padatious intent parsers

---

## 🧠 Subagents

| Agent | Role |
|---|---|
| **Voice Agent** | STT/TTS, intent recognition, wake word detection |
| **Trading Agent** | DEX quote aggregation, swap execution, perps management |
| **Security Agent** | Non-custodial verification, risk checks, contract validation |

---

## 📄 License

MIT — Free to use, modify, and distribute.

---

## 🙏 Acknowledgments

Built on the shoulders of giants:
- [OVOS (Open Voice OS)](https://openvoiceos.org/)
- [WalletConnect](https://walletconnect.com/)
- [1inch](https://1inch.io/)
- [Jupiter](https://jup.ag/)
- [GMX](https://gmx.io/)
- [Uniswap](https://uniswap.org/)

---

<p align="center">
  <b>🔥 Say "Hey Cypher" and take control of your DeFi trading. Voice-first, non-custodial, multi-chain.</b>
</p>
