# ── Cypher Trading Non-Custodial ──
# Skill: Perps Position
# Handles: perpetual futures, leverage, long/short on GMX

from ovos_workshop.skills import OVOSSkill
from ovos_workshop.decorators import intent_handler
from ovos_workshop.intents import IntentBuilder

class PerpsPositionSkill(OVOSSkill):
    def initialize(self):
        self.log.info("[PerpsPosition] Skill initialized")

    @intent_handler(IntentBuilder("OpenLongPosition")
                    .require("open").one_of("long", "buy")
                    .optionally("token").optionally("leverage"))
    def handle_long(self, message):
        """Handle 'open long on ETH with 10x leverage'"""
        token = message.data.get("token", "ETH")
        leverage = message.data.get("leverage", "5")

        self.log.info(f"[PerpsPosition] Long: {token} {leverage}x")
        self.speak_dialog("open_long", {
            "token": token,
            "leverage": leverage
        })

        self.bus.emit("trading.perps.request", {
            "pair": token,
            "side": "long",
            "leverage": int(leverage),
            "source": "voice"
        })

    @intent_handler(IntentBuilder("OpenShortPosition")
                    .require("open").require("short")
                    .optionally("token").optionally("leverage"))
    def handle_short(self, message):
        """Handle 'open short on BTC with 3x leverage'"""
        token = message.data.get("token", "BTC")
        leverage = message.data.get("leverage", "3")

        self.log.info(f"[PerpsPosition] Short: {token} {leverage}x")
        self.speak_dialog("open_short", {
            "token": token,
            "leverage": leverage
        })

        self.bus.emit("trading.perps.request", {
            "pair": token,
            "side": "short",
            "leverage": int(leverage),
            "source": "voice"
        })

    @intent_handler(IntentBuilder("ClosePosition")
                    .require("close").one_of("position", "trade", "perp"))
    def handle_close(self, message):
        """Handle 'close my position'"""
        self.log.info("[PerpsPosition] Closing position")
        self.speak_dialog("close_position")
        self.bus.emit("trading.perps.close", {"source": "voice"})

    def stop(self):
        pass


def create_skill():
    return PerpsPositionSkill()
