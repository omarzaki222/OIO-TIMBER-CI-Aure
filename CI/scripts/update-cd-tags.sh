#!/usr/bin/env bash
# Manually bump CD image tags (same contract as Jenkins "Update CD repo" stage).
# Usage (from monorepo root):
#   CD_DIR=/path/to/OIO-TIMBER-CD-azure IMAGE_TAG=123-abc1234 bash CI/scripts/update-cd-tags.sh
#
# Does not push unless PUSH=1 is set. Never embeds tokens in this file.
set -euo pipefail

CD_DIR="${CD_DIR:?Set CD_DIR to a checkout of OIO-TIMBER-CD-azure}"
IMAGE_TAG="${IMAGE_TAG:?Set IMAGE_TAG}"
KUSTOMIZE="${CD_DIR}/environments/azure/kustomization.yaml"

test -f "$KUSTOMIZE"

awk -v tag="${IMAGE_TAG}" '
  $0 ~ /newName: oioazureregistry.azurecr.io\/oio\/(backend|frontend|admin)/ {
    print
    if ((getline nextline) > 0) {
      if (nextline ~ /newTag:/) {
        print "    newTag: \"" tag "\""
        next
      }
      print nextline
    }
    next
  }
  { print }
' "$KUSTOMIZE" > "${KUSTOMIZE}.tmp"
mv "${KUSTOMIZE}.tmp" "$KUSTOMIZE"

echo "Updated tags to ${IMAGE_TAG} in ${KUSTOMIZE}"
if [[ "${PUSH:-0}" == "1" ]]; then
  git -C "$CD_DIR" add environments/azure/kustomization.yaml
  git -C "$CD_DIR" commit -m "ci: bump oio images to ${IMAGE_TAG}" || true
  git -C "$CD_DIR" push origin HEAD
fi
