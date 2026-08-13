#!/usr/bin/env bash
set -euo pipefail

# Simple local deploy script:
# - builds a Docker image
# - pushes to Docker Hub if DOCKERHUB_* env vars are set
# - optionally calls a Wispbyte deploy endpoint if WISPBYTE_* env vars are set

IMAGE_NAME=${DOCKER_IMAGE_NAME:-attachments:latest}

echo "Building Docker image ${IMAGE_NAME}..."
docker build -t "${IMAGE_NAME}" .

if [ -n "${DOCKERHUB_USERNAME:-}" ] && [ -n "${DOCKERHUB_TOKEN:-}" ]; then
  echo "Logging in to Docker Hub..."
  echo "${DOCKERHUB_TOKEN}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin
  echo "Pushing ${IMAGE_NAME} to Docker Hub..."
  docker push "${IMAGE_NAME}"
fi

if [ -n "${WISPBYTE_DEPLOY_URL:-}" ] && [ -n "${WISPBYTE_API_KEY:-}" ]; then
  echo "Calling Wispbyte deploy endpoint..."
  curl -sS -X POST "${WISPBYTE_DEPLOY_URL}" \
    -H "Authorization: Bearer ${WISPBYTE_API_KEY}" \
    -H "Content-Type: application/json" \
    -d "{ \"image\": \"${IMAGE_NAME}\" }"
fi

echo "Done."
