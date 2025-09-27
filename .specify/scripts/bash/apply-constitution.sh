#!/usr/bin/env bash
set -euo pipefail
# apply-constitution.sh - simple local runner that mimics the /constitution agent flow
# Usage: ./apply-constitution.sh "<short constitution statements>"

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../../.." && pwd)"
CONSTITUTION_PATH="$REPO_ROOT/.specify/memory/constitution.md"
PLAN_TEMPLATE="$REPO_ROOT/.specify/templates/plan-template.md"

if [[ $# -lt 1 ]]; then
  echo "Usage: $0 \"<constitution statements>\""
  exit 2
fi

INPUT="$1"
TIMESTAMP="$(date -u +%F)"
VERSION="2.2.0"

cat > "$CONSTITUTION_PATH" <<EOF
<!--
SYNC IMPACT REPORT
- Version change: auto -> $VERSION
- Updated via apply-constitution.sh
-->

# sprintCap Constitution

## Agent-provided Principles (from /constitution)

$INPUT

## Governance
**Version**: $VERSION | **Ratified**: $TIMESTAMP | **Last Amended**: $TIMESTAMP

EOF

echo "Wrote constitution to $CONSTITUTION_PATH"

# Bump plan-template footer reference if present
if grep -q "Based on Constitution" "$PLAN_TEMPLATE" 2>/dev/null; then
  sed -i.bak "s/Based on Constitution v[0-9.]*/Based on Constitution v$VERSION/" "$PLAN_TEMPLATE"
  echo "Updated plan template constitution reference to v$VERSION"
fi

# Run agent context updater if it exists
AGENT_UPDATER="$SCRIPT_DIR/update-agent-context.sh"
if [[ -x "$AGENT_UPDATER" ]]; then
  echo "Running agent context updater (copilot)..."
  "$AGENT_UPDATER" copilot || echo "agent-context updater exited non-zero"
else
  echo "No agent-context updater executable found at $AGENT_UPDATER (skipped)"
fi

echo "apply-constitution.sh completed"
