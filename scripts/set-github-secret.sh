#!/usr/bin/env bash
# Set API_KEY from .env as a GitHub Actions secret for integration tests in CI.
# Requires: gh cli (brew install gh), .env with API_KEY or HEVY_API_KEY
set -e

if ! command -v gh &>/dev/null; then
  echo "Error: gh cli not found. Install with: brew install gh" >&2
  exit 1
fi

if [[ ! -f .env ]]; then
  echo "Error: .env not found. Copy .env.example to .env and add your API key." >&2
  exit 1
fi

API_KEY=$(
  grep -E '^API_KEY=' .env 2>/dev/null | cut -d= -f2- ||
  grep -E '^HEVY_API_KEY=' .env 2>/dev/null | cut -d= -f2- ||
  true
)
# Trim quotes and whitespace
API_KEY=$(printf '%s' "$API_KEY" | sed -e 's/^["'\'']//' -e 's/["'\'']$//' -e 's/^[[:space:]]*//' -e 's/[[:space:]]*$//')

if [[ -z "$API_KEY" ]]; then
  echo "Error: API_KEY or HEVY_API_KEY not set in .env" >&2
  exit 1
fi

echo "Setting API_KEY as GitHub secret..."
echo -n "$API_KEY" | gh secret set API_KEY
echo "Done. Integration tests will run in CI when API_KEY is set."
