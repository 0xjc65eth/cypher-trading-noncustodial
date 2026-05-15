# ── Cypher Trading Non-Custodial ──
# Skill: Trade History
# Handles: trade history, past positions, performance summary

from ovos_workshop.skills import OVOSSkill
from ovos_workshop.decorators import intent_handler
from ovos_workshop.intents import IntentBuilder

class TradeHistorySkill(OVOSSkill):
    def initialize(self):
        self.log.info("[TradeHistory] Skill initialized")

    @intent_handler(IntentBuilder("ShowHistory")
                    .one_of("history", "past", "previous", "my")
                    .one_of("trades", "swaps", "positions", "transactions"))
    def handle_history(self, message):
        """Handle 'show my trade history'"""
        self.log.info("[TradeHistory] History request")
        self.speak_dialog("fetching_history")

        self.bus.emit("trading.history.request", {"source": "voice"})

    @intent_handler(IntentBuilder("LastTrade")
                    .require("last").one_of("trade", "swap", "transaction"))
    def handle_last_trade(self, message):
        """Handle 'what was my last trade'"""
        self.log.info("[TradeHistory] Last trade request")
        self.speak_dialog("last_trade")
        self.bus.emit("trading.history.last", {"source": "voice"})

    @intent_handler(IntentBuilder("Performance")
                    .require("performance").one_of("P&L", "profit", "loss", "how"))
    def handle_performance(self, message):
        """Handle 'how is my performance' or 'show P&L'"""
        self.log.info("[TradeHistory] Performance request")
        self.speak_dialog("performance")
        self.bus.emit("trading.history.performance", {"source": "voice"})

    def stop(self):
        pass


def create_skill():
    return TradeHistorySkill()
