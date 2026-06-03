#!/usr/bin/env bash
# build-zip.sh
# Creates a Chrome Web Store-ready ZIP from the src/ folder.
# The ZIP contains manifest.json at its root (not inside a "src/" subfolder).
#
# Usage: ./build-zip.sh
# Output: verlanglijst-online-calculator.zip (in the repo root)

set -euo pipefail

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
OUTPUT="$SCRIPT_DIR/verlanglijst-online-calculator.zip"

rm -f "$OUTPUT"

cd "$SCRIPT_DIR/src"
zip -r "$OUTPUT" .

echo "✅ Created: $OUTPUT"
echo "   Verify with: unzip -l $OUTPUT | head -20"
