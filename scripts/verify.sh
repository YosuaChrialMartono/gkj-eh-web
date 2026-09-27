#!/usr/bin/env bash

set -euo pipefail

echo "Running formatting checks"
pnpm format:check

echo "Running lint"
pnpm lint

echo "Running unit and integration tests"
pnpm test

echo "Running production build"
pnpm build

echo "Running Playwright tests"
pnpm test:e2e
