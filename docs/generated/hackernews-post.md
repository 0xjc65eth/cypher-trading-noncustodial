**Show HN: Cypher — Open-source voice assistant for non-custodial crypto trading**

Hey HN,

I built Cypher because DeFi UX is genuinely terrible. To swap tokens you need: open MetaMask → go to 1inch → connect wallet → approve token → review price → confirm swap → wait → verify. That's 7+ steps for a simple trade. And if you're blind? Forget it.

Cypher replaces all of that with voice:

"Hey Cypher, swap 1 ETH to USDC at best price" → Done.

Under the hood:
- OVOS + Whisper for speech-to-text
- Adapt + Padatious for intent parsing
- 1inch + Jupiter + GMX APIs for best execution
- WalletConnect v2 for client-side signing (keys NEVER touch our code)
- Mimic3 for text-to-speech confirmation

The interesting engineering challenge was the subagent system. Three agents (Voice, Trading, Security) coordinate via a manager pattern. The Security Agent validates every transaction against known contract allowlists before the Trading Agent can execute. All read-only by default.

Multi-chain from day 1: Ethereum, Arbitrum, Base, Solana, Polygon.

Totally open source (MIT). Looking for feedback and contributors.

https://github.com/0xjc65eth/cypher-trading-noncustodial
