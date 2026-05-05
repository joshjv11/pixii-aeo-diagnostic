#!/bin/zsh
export NEXT_TELEMETRY_DISABLED=1
export NODE_OPTIONS="--max-old-space-size=4096"
npm run dev
