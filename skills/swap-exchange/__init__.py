# ── Cypher Trading Non-Custodial ──
# Skill: Swap Exchange
# Handles: token swaps, exchange via DEX aggregators
# 🔒 All transactions signed client-side

from ovos_workshop.skills import OVOSSkill
from ovos_workshop.decorators import intent_handler
from ovos_workshop.intents import IntentBuilder

class SwapExchangeSkill(OVOSSkill):
    def initialize(self):
        self.log.info("[SwapExchange] Skill initialized")

    @intent_handler(IntentBuilder("SwapTokens")
                    .one_of("swap", "exchange", "trade")
                    .require("token1").require("token2").optionally("amount"))
    def handle_swap(self, message):
        """Handle 'swap 1 ETH to USDC' voice command"""
        token1 = message.data.get("token1", "ETH")
        token2 = message.data.get("token2", "USDC")
        amount = message.data.get("amount", "1")

        self.log.info(f"[SwapExchange] Swap: {amount} {token1} → {token2}")

        # Confirm with user before executing
        self.speak_dialog("confirm_swap", {
            "amount": amount,
            "token1": token1,
            "token2": token2
        })

        # Request confirmation before proceeding
        self.bus.emit("trading.swap.request", {
            "fromToken": token1,
            "toToken": token2,
            "amount": amount,
            "source": "voice"
        })

    @intent_handler(IntentBuilder("ConfirmSwap")
                    .require("confirm").one_of("yes", "proceed", "execute", "do it"))
    def handle_confirm(self, message):
        """Handle 'yes, execute the swap' confirmation"""
        self.log.info("[SwapExchange] Swap confirmed by user")

        # Execute swap (signing happens on user's device)
        self.bus.emit("trading.swap.execute", {})
        self.speak_dialog("swap_executing")

    @intent_handler(IntentBuilder("CancelSwap")
                    .require("cancel").one_of("no", "stop", "abort"))
    def handle_cancel(self, message):
        """Handle 'cancel the swap' command"""
        self.bus.emit("trading.swap.cancel", {})
        self.speak_dialog("swap_cancelled")

    def stop(self):
        pass


def create_skill():
    return SwapExchangeSkill()
