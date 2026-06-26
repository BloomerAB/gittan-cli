#!/bin/bash
set -euo pipefail

VERSION="${1:-$(node -p "require('./package.json').version")}"
OUTDIR="dist/release"

rm -rf "$OUTDIR"
mkdir -p "$OUTDIR"

TARGETS=(
  "bun-darwin-arm64:darwin-arm64"
  "bun-darwin-x64:darwin-x64"
  "bun-linux-x64:linux-x64"
  "bun-linux-arm64:linux-arm64"
)

for entry in "${TARGETS[@]}"; do
  target="${entry%%:*}"
  name="${entry##*:}"
  echo "Building $name..."
  bun build --compile --target="$target" src/index.ts --outfile "$OUTDIR/gittan-$name"
  tar -czf "$OUTDIR/gittan-$name.tar.gz" -C "$OUTDIR" "gittan-$name"
  rm "$OUTDIR/gittan-$name"
done

echo ""
echo "Built v$VERSION:"
ls -lh "$OUTDIR"
