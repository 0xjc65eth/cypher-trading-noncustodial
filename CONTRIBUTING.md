# 🤝 Contributing to Cypher Trading

**You + AI + Cypher = Voice-first DeFi for everyone.**

## 🔒 Non-Custodial Constitution (READ FIRST)

This is our founding principle. Any PR that violates these rules will be rejected:

1. **NEVER store private keys** — not in memory, not in files, not in databases
2. **NEVER transmit seed phrases** — not over the network, not in logs
3. **ALWAYS sign client-side** — WalletConnect v2 or browser wallet injection only
4. **READ-ONLY by default** — balance checks, quotes, and history require zero permissions
5. **VERIFY contracts on-chain** — the Security Agent validates known addresses before any tx

## 🚀 How to Contribute

### Quick Start
```bash
git clone https://github.com/0xjc65eth/cypher-trading-noncustodial.git
cd cypher-trading-noncustodial
npm run setup
npm run dev
```

### What We Need Help With

| Area | Priority | Skills Needed |
|------|----------|---------------|
| 🎙️ New Voice Skills | 🔥 HIGH | Python + OVOS |
| ⛓️ New Chain Integrations | 🔥 HIGH | ethers.js / web3.js |
| 🦊 Wallet Adapters | 🔥 HIGH | WalletConnect / Solana |
| 💻 UI/UX Polish | MEDIUM | React + Tailwind |
| 📊 Analytics Dashboard | MEDIUM | React + D3/Recharts |
| 🧪 Testing | MEDIUM | Vitest / Playwright |
| 📝 Documentation | LOW | Markdown |
| 🌐 i18n / Translations | LOW | Any language |

### Adding a New Chain

1. Add RPC config to `.env.example`
2. Add chain to `shared/types.ts`
3. Implement DEX methods in `backend/src/services/tradingEngine.ts`
4. Add aggregator to `frontend/src/services/dexAggregator.ts`
5. Create a voice skill in `skills/`

### Adding a New Voice Skill

See the [README](./README.md#-adding-new-skills) for a template.

### Adding a New Wallet Adapter

1. Implement in `frontend/src/services/walletService.ts`
2. Add provider detection
3. Update `WalletPanel.tsx` UI
4. Test with real wallet

## 🧪 Testing

```bash
# Backend tests
cd backend && npm test

# Frontend tests
cd frontend && npm test

# Voice skill tests
python3 -m pytest skills/
```

## 📬 Communication

- **Issues**: Bug reports & feature requests
- **Discussions**: Architecture & design decisions
- **PRs**: Code contributions

## 🏆 Recognition

All contributors are added to the README hall of fame. Top contributors get a "Cypher Builder" NFT.

---

**Remember: Your keys, your coins. We just make it voice-activated.** 🔥
