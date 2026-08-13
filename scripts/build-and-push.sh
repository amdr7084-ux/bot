#!/usr/bin/env bash
set -euo pipefail

IMAGE_NAME=${DOCKER_IMAGE_NAME:-youruser/attachments:latest}
echo "Building image ${IMAGE_NAME}..."
docker build -t "${IMAGE_NAME}" .

if [ -n "${DOCKERHUB_USERNAME:-}" ] && [ -n "${DOCKERHUB_TOKEN:-}" ]; then
  echo "Logging in to Docker Hub..."
  echo "${DOCKERHUB_TOKEN}" | docker login -u "${DOCKERHUB_USERNAME}" --password-stdin
  echo "Pushing ${IMAGE_NAME}..."
  docker push "${IMAGE_NAME}"
else
  echo "Docker Hub credentials not set; skipping push. Set DOCKERHUB_USERNAME and DOCKERHUB_TOKEN to push."
fi
