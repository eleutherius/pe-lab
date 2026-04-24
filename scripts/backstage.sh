#!/bin/bash

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ROOT_DIR="$(dirname "$SCRIPT_DIR")"

IMAGE_NAME="backstage-local"
IMAGE_TAG="dev"
NAMESPACE="backstage"
HELM_RELEASE="backstage"
HELM_CHART="backstage/backstage"
VALUES_FILE="$ROOT_DIR/helm/backstage/values-test.yaml"

usage() {
  echo "Usage: $0 [options]"
  echo ""
  echo "Options:"
  echo "  --build       Build Docker image"
  echo "  --deploy      Install or upgrade Helm release"
  echo "  --all         Build and deploy"
  echo "  --help        Show this help"
}

do_build() {
  echo "==> Building Docker image $IMAGE_NAME:$IMAGE_TAG"
  docker build -t "$IMAGE_NAME:$IMAGE_TAG" "$ROOT_DIR/backstage"
  echo "==> Build done"
}

do_deploy() {
  echo "==> Deploying Helm release '$HELM_RELEASE' in namespace '$NAMESPACE'"
  helm repo add backstage https://backstage.github.io/charts 2>/dev/null || true
  helm repo update backstage
  helm upgrade --install "$HELM_RELEASE" "$HELM_CHART" \
    --namespace "$NAMESPACE" \
    --create-namespace \
    -f "$VALUES_FILE"
  echo "==> Waiting for rollout..."
  kubectl rollout status deployment/"$HELM_RELEASE" -n "$NAMESPACE"
  echo "==> Deploy done"
  echo ""
  echo "Run to access: kubectl -n $NAMESPACE port-forward svc/$HELM_RELEASE 7007:7007"
}

if [[ $# -eq 0 ]]; then
  usage
  exit 1
fi

BUILD=false
DEPLOY=false

for arg in "$@"; do
  case $arg in
    --build) BUILD=true ;;
    --deploy) DEPLOY=true ;;
    --all) BUILD=true; DEPLOY=true ;;
    --help) usage; exit 0 ;;
    *) echo "Unknown option: $arg"; usage; exit 1 ;;
  esac
done

$BUILD && do_build
$DEPLOY && do_deploy
