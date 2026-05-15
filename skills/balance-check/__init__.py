# ── Cypher Trading Non-Custodial ──
# Skill: Balance Check
# Handles: wallet balance queries across chains

from ovos_workshop.skills import OVOSSkill
from ovos_workshop.decorators import intent_handler
from ovos_workshop.intents import IntentBuilder

class BalanceCheckSkill(OVOSSkill):
    def initialize(self):
        self.log.info("[BalanceCheck] Skill initialized")

    @intent_handler(IntentBuilder("CheckBalance")
                    .one_of("check", "balance", "portfolio", "how much")
                    .optionally("token").optionally("wallet"))
    def handle_balance(self, message):
        """Handle 'check my balance' or 'how much ETH do I have'"""
        token = message.data.get("token", "all")
        self.log.info(f"[BalanceCheck] Balance request for: {token}")

        # In production: fetch from RPC/multicall across chains
        self.speak_dialog("checking_balance", {"token": token})

        # Notify backend to fetch and display balances
        self.bus.emit("wallet.balance.request", {
            "token": token,
            "source": "voice"
        })

        # Response is async — backend pushes results to frontend
        self.speak_dialog("balance_results_stub", {
            "token": token
        })

    @intent_handler(IntentBuilder("CheckPortfolio")
                    .require("portfolio").one_of("show", "view", "check", "display"))
    def handle_portfolio(self, message):
        """Handle 'show my portfolio'"""
        self.log.info("[BalanceCheck] Portfolio request")
        self.speak_dialog("checking_portfolio")
        self.bus.emit("wallet.portfolio.request", {"source": "voice"})

    def stop(self):
        pass


def create_skill():
    return BalanceCheckSkill()
