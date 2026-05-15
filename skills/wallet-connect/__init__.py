# ── Cypher Trading Non-Custodial ──
# Skill: Wallet Connect
# Handles: connect wallet, disconnect, check connection
# 🔒 NON-CUSTODIAL: This skill NEVER handles private keys

from ovos_workshop.skills import OVOSSkill
from ovos_workshop.decorators import intent_handler
from ovos_workshop.intents import IntentBuilder

class WalletConnectSkill(OVOSSkill):
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self.connected = False
        self.wallet_address = None

    def initialize(self):
        self.log.info("[WalletConnect] Skill initialized 🔒")
        self.add_event("wallet.connected", self.handle_wallet_connected)
        self.add_event("wallet.disconnected", self.handle_wallet_disconnected)

    @intent_handler(IntentBuilder("ConnectWallet")
                    .require("connect").require("wallet"))
    def handle_connect(self, message):
        """Handle 'connect wallet' voice command"""
        self.speak_dialog("connecting")
        self.log.info("[WalletConnect] User requested wallet connection")

        # Trigger wallet connection in the frontend/backend
        self.bus.emit("wallet.connect.request", {
            "source": "voice",
            "method": "walletconnect_v2"
        })

        # In production: opens WalletConnect modal
        # User scans QR code with their wallet app
        # All signing happens on user's device

    @intent_handler(IntentBuilder("DisconnectWallet")
                    .require("disconnect").require("wallet"))
    def handle_disconnect(self, message):
        """Handle 'disconnect wallet' voice command"""
        self.speak_dialog("disconnecting")
        self.bus.emit("wallet.disconnect.request", {})
        self.connected = False
        self.wallet_address = None

    @intent_handler(IntentBuilder("CheckWalletStatus")
                    .one_of("status", "connected").require("wallet"))
    def handle_status(self, message):
        """Handle 'wallet status' voice command"""
        if self.connected:
            self.speak_dialog("connected", {
                "address": f"{self.wallet_address[:6]}...{self.wallet_address[-4:]}" if self.wallet_address else ""
            })
        else:
            self.speak_dialog("not_connected")

    def handle_wallet_connected(self, message):
        self.connected = True
        self.wallet_address = message.data.get("address", "")
        short_addr = f"{self.wallet_address[:6]}...{self.wallet_address[-4:]}" if self.wallet_address else "Unknown"
        self.log.info(f"[WalletConnect] Wallet connected: {self.wallet_address[:10]}...")
        self.speak_dialog("connected", {"address": short_addr})

    def handle_wallet_disconnected(self, message):
        self.connected = False
        self.wallet_address = None

    def stop(self):
        pass


def create_skill():
    return WalletConnectSkill()
