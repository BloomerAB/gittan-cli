#!/bin/bash
set -euo pipefail

BASE_URL="${GITTAN_CLI_URL:-https://cli.gittan.eu}"
INSTALL_DIR="${GITTAN_INSTALL_DIR:-/usr/local/bin}"

detect_platform() {
  local os arch

  case "$(uname -s)" in
    Darwin) os="darwin" ;;
    Linux)  os="linux" ;;
    *)
      echo "Unsupported OS: $(uname -s)" >&2
      echo "gittan CLI supports macOS and Linux. Windows users: use WSL." >&2
      exit 1
      ;;
  esac

  case "$(uname -m)" in
    x86_64|amd64)  arch="x64" ;;
    arm64|aarch64) arch="arm64" ;;
    *)
      echo "Unsupported architecture: $(uname -m)" >&2
      exit 1
      ;;
  esac

  echo "${os}-${arch}"
}

main() {
  local platform version tmpdir

  platform="$(detect_platform)"
  version="${GITTAN_CLI_VERSION:-latest}"

  echo "Installing gittan CLI (${platform})..."

  tmpdir="$(mktemp -d)"
  trap 'rm -rf "$tmpdir"' EXIT

  local url="${BASE_URL}/dl/${version}/gittan-${platform}.tar.gz"

  if ! curl -fsSL "$url" -o "$tmpdir/gittan.tar.gz"; then
    echo "Download failed: $url" >&2
    exit 1
  fi

  tar -xzf "$tmpdir/gittan.tar.gz" -C "$tmpdir"

  if [ ! -w "$INSTALL_DIR" ]; then
    echo "Installing to ${INSTALL_DIR} (requires sudo)..."
    sudo install -m 755 "$tmpdir/gittan-${platform}" "${INSTALL_DIR}/gittan"
  else
    install -m 755 "$tmpdir/gittan-${platform}" "${INSTALL_DIR}/gittan"
  fi

  echo "Installed gittan to ${INSTALL_DIR}/gittan"
  "${INSTALL_DIR}/gittan" version
}

main
