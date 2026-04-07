#!/usr/bin/env bash
# Only allow deploying to production from the main branch.
BRANCH=$(git rev-parse --abbrev-ref HEAD)
if [ "$BRANCH" != "main" ]; then
  echo "Error: production deploy must be run from 'main' (currently on '$BRANCH')."
  echo "Merge your changes into main first: git checkout main && git merge dev"
  exit 1
fi
npm run build && npx gh-pages -d dist
