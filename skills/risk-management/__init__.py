# ── Cypher Trading Non-Custodial ──
# Skill: Risk Management
# Handles: stop-loss, take-profit, position limits, risk settings

from ovos_workshop.skills import OVOSSkill
from ovos_workshop.decorators import intent_handler
from ovos_workshop.intents import IntentBuilder

class RiskManagementSkill(OVOSSkill):
    def initialize(self):
        self.log.info("[RiskManagement] Skill initialized 🔒")

    @intent_handler(IntentBuilder("SetStopLoss")
                    .require("set").require("stop").require("loss")
                    .optionally("percentage"))
    def handle_set_stop_loss(self, message):
        """Handle 'set stop loss at 5 percent'"""
        pct = message.data.get("percentage", "5")
        self.log.info(f"[RiskManagement] Stop-loss set: {pct}%")
        self.speak_dialog("stop_loss_set", {"percentage": pct})

        self.bus.emit("risk.stop_loss.set", {
            "percentage": float(pct),
            "source": "voice"
        })

    @intent_handler(IntentBuilder("SetTakeProfit")
                    .require("set").one_of("take", "target").require("profit")
                    .optionally("percentage"))
    def handle_set_take_profit(self, message):
        """Handle 'set take profit at 10 percent'"""
        pct = message.data.get("percentage", "10")
        self.log.info(f"[RiskManagement] Take-profit set: {pct}%")
        self.speak_dialog("take_profit_set", {"percentage": pct})

        self.bus.emit("risk.take_profit.set", {
            "percentage": float(pct),
            "source": "voice"
        })

    @intent_handler(IntentBuilder("MaxPositionSize")
                    .require("max").one_of("position", "size", "trade")
                    .optionally("percentage"))
    def handle_max_position(self, message):
        """Handle 'set max position size to 25 percent'"""
        pct = message.data.get("percentage", "25")
        self.log.info(f"[RiskManagement] Max position size: {pct}%")
        self.speak_dialog("max_position_set", {"percentage": pct})

        self.bus.emit("risk.max_position.set", {
            "percentage": float(pct),
            "source": "voice"
        })

    @intent_handler(IntentBuilder("GetRiskSettings")
                    .one_of("show", "what", "check").require("risk").require("settings"))
    def handle_show_settings(self, message):
        """Handle 'show my risk settings'"""
        self.log.info("[RiskManagement] Show settings")
        self.speak_dialog("show_settings")
        self.bus.emit("risk.settings.request", {"source": "voice"})

    def stop(self):
        pass


def create_skill():
    return RiskManagementSkill()
