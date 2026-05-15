**Title:** I built a non-custodial voice assistant that trades crypto on DEXes. Say "Hey Cypher" to swap, check balances, or open perps.

**Body:**

DeFi trading UX is broken. 15+ clicks to swap. Fat-finger errors. Completely inaccessible to blind and motor-disabled users.

I built Cypher: an open-source, non-custodial, voice-first trading assistant.

🎙️ "Hey Cypher, swap 1 ETH to USDC at best price" → Done in 3 seconds.

**How it works:**
1. You speak a command ("swap 1 ETH to USDC")
2. OpenAI Whisper transcribes it
3. Trading Agent queries 1inch + Jupiter for best price
4. Mimic3 TTS confirms: "Best price: 2,450 USDC. Confirm?"
5. You say "Yes" and sign via WalletConnect on YOUR device
6. Transaction sent. Keys never leave your device

**Features:**
- 🔒 Non-custodial (client-side signing only — I CAN'T access your funds)
- ⛓️ Multi-chain: Ethereum, Arbitrum, Base, Solana, Polygon
- 🎙️ 7 voice skills: wallet, quotes, swaps, perps, balance, history, risk
- 🧠 AI subagents: Voice Agent, Trading Agent, Security Agent
- ♿ Accessibility-first: built for blind and disabled traders
- 📂 Open source (MIT)

**Tech stack:** OVOS + Electron + React + ethers.js + WalletConnect v2

**What I'd love feedback on:**
- What voice commands would you want?
- Which chains should we add next?
- Any security concerns with the non-custodial architecture?

**Repo:** https://github.com/0xjc65eth/cypher-trading-noncustodial

All code is open source. All contributions welcome. 🫡
