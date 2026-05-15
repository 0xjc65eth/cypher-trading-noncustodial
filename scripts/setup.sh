#!/bin/bash
# ── Cypher Trading Non-Custodial ──
# Setup Script — installs ALL dependencies
set -e

BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"
echo -e "${BLUE}   🔥 Cypher Trading Non-Custodial — Setup        ${NC}"
echo -e "${BLUE}   Voice Assistant for Non-Custodial Crypto Trading${NC}"
echo -e "${BLUE}═══════════════════════════════════════════════════${NC}"

# ── Node.js check ──
echo -e "\n${YELLOW}[1/6] Checking Node.js...${NC}"
if ! command -v node &> /dev/null; then
    echo -e "${RED}Node.js not found! Install Node.js >= 20 from https://nodejs.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Node.js $(node -v)${NC}"

# ── Python check ──
echo -e "\n${YELLOW}[2/6] Checking Python...${NC}"
if ! command -v python3 &> /dev/null; then
    echo -e "${RED}Python 3 not found! Install Python >= 3.10 from https://python.org${NC}"
    exit 1
fi
echo -e "${GREEN}✓ Python $(python3 --version)${NC}"

# ── Root npm install ──
echo -e "\n${YELLOW}[3/6] Installing root dependencies...${NC}"
npm install
echo -e "${GREEN}✓ Root dependencies installed${NC}"

# ── Frontend install ──
echo -e "\n${YELLOW}[4/6] Installing frontend dependencies (Electron + React + WalletConnect)...${NC}"
cd frontend && npm install && cd ..
echo -e "${GREEN}✓ Frontend dependencies installed${NC}"

# ── Backend install ──
echo -e "\n${YELLOW}[5/6] Installing backend dependencies (Node.js + Express + ethers.js)...${NC}"
cd backend && npm install && cd ..
echo -e "${GREEN}✓ Backend dependencies installed${NC}"

# ── Python / OVOS skills install ──
echo -e "\n${YELLOW}[6/6] Installing Python skills dependencies (OVOS, Whisper, TTS)...${NC}"
cd skills && pip3 install -r requirements.txt && cd ..
echo -e "${GREEN}✓ Python skills dependencies installed${NC}"

# ── Environment setup ──
if [ ! -f .env ]; then
    cp .env.example .env
    echo -e "\n${YELLOW}⚠️  .env created from .env.example — edit it with your keys!${NC}"
fi

echo -e "\n${GREEN}═══════════════════════════════════════════════════${NC}"
echo -e "${GREEN}   ✅ Setup Complete! Run 'npm run dev' to start  ${NC}"
echo -e "${GREEN}═══════════════════════════════════════════════════${NC}"
