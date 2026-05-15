#!/bin/bash
# ── Cypher Trading Non-Custodial ──
# Development script — starts all services
set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🎙️  Cypher Trading — Starting Dev Environment   ${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"

# Check .env
if [ ! -f .env ]; then
    echo "⚠️  .env not found! Run 'npm run setup' first."
    exit 1
fi

# Load env
export $(grep -v '^#' .env | xargs)

# Start all services concurrently
echo -e "\n${GREEN}Starting all services:${NC}"
echo -e "  • Backend API    → http://localhost:${BACKEND_PORT:-4000}"
echo -e "  • Frontend (React) → http://localhost:${FRONTEND_PORT:-3000}"
echo -e "  • Voice WebSocket → ws://localhost:${VOICE_WEBSOCKET_PORT:-8181}"
echo -e "  • OVOS Skills     → localhost:5000"
echo -e "\n${BLUE}───────────────────────────────────────────────${NC}"
echo -e "  Say \"Hey Cypher\" to activate the voice assistant!"
echo -e "${BLUE}───────────────────────────────────────────────${NC}\n"

# Run all (Voice WebSocket is integrated into the backend server.ts)
npx concurrently \
  --names "BACKEND,FRONTEND,OVOS" \
  --prefix-colors "blue,green,magenta" \
  "cd backend && npm run dev" \
  "cd frontend && npm run dev:react" \
  "cd skills && python3 -m ovos_core.launcher"
