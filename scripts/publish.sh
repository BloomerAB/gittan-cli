#!/bin/bash
set -euo pipefail

VERSION="${1:-$(node -p "require('./package.json').version")}"
FORGEJO_URL="${FORGEJO_URL:?FORGEJO_URL required}"
FORGEJO_TOKEN="${FORGEJO_TOKEN:?FORGEJO_TOKEN required}"
PACKAGE_OWNER="${PACKAGE_OWNER:-gittan}"

RELEASE_DIR="dist/release"

if [ ! -d "$RELEASE_DIR" ]; then
  echo "No release artifacts found. Run scripts/build-all.sh first." >&2
  exit 1
fi

for tarball in "$RELEASE_DIR"/*.tar.gz; do
  filename="$(basename "$tarball")"
  echo "Uploading $filename (v$VERSION)..."

  status=$(curl -s -o /dev/null -w "%{http_code}" \
    -X PUT \
    -H "Authorization: token $FORGEJO_TOKEN" \
    --upload-file "$tarball" \
    "${FORGEJO_URL}/api/packages/${PACKAGE_OWNER}/generic/cli/${VERSION}/${filename}")

  if [ "$status" = "201" ] || [ "$status" = "200" ] || [ "$status" = "409" ]; then
    echo "  $filename → $status (ok)"
  else
    echo "  $filename → $status (FAILED)" >&2
    exit 1
  fi
done

echo ""
echo "Published CLI v$VERSION to ${FORGEJO_URL}/api/packages/${PACKAGE_OWNER}/generic/cli/${VERSION}/"
