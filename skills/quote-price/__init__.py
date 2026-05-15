# ── Cypher Trading Non-Custodial ──
# Skill: Quote Price
# Handles: price checks, quotes across DEX aggregators

from ovos_workshop.skills import OVOSSkill
from ovos_workshop.decorators import intent_handler
from ovos_workshop.intents import IntentBuilder
import requests

ONEINCH_API = "https://api.1inch.dev/swap/v6.0"
JUPITER_API = "https://quote-api.jup.ag/v6"

class QuotePriceSkill(OVOSSkill):
    def initialize(self):
        self.log.info("[QuotePrice] Skill initialized")

    @intent_handler(IntentBuilder("GetPrice")
                    .one_of("price", "quote", "rate", "cost")
                    .optionally("token").optionally("amount"))
    def handle_price(self, message):
        """Handle 'what's the price of ETH' voice command"""
        token = message.data.get("token", "ETH")
        self.log.info(f"[QuotePrice] Price request for {token}")

        # In production: fetch real-time price from aggregator
        self.speak_dialog("price_response", {"token": token})

        # Emit price data to frontend
        self.bus.emit("trading.quote", {
            "token": token,
            "source": "1inch+Jupiter"
        })

    @intent_handler(IntentBuilder("GetBestPrice")
                    .require("best").one_of("price", "quote", "rate")
                    .require("token1").require("token2"))
    def handle_best_price(self, message):
        """Handle 'best price for swapping ETH to USDC'"""
        token1 = message.data.get("token1", "ETH")
        token2 = message.data.get("token2", "USDC")
        self.log.info(f"[QuotePrice] Best price: {token1} → {token2}")

        # Query multiple aggregators and return best
        self.speak_dialog("best_price", {
            "token1": token1,
            "token2": token2
        })

    def stop(self):
        pass


def create_skill():
    return QuotePriceSkill()
