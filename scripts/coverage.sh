#!/usr/bin/env bash

set -euo pipefail

cd "$(dirname "${BASH_SOURCE[0]}")/.."

if [[ ! -x ./node_modules/.bin/nyc ]]; then
  echo "nyc is not installed. Run 'npm ci' before collecting coverage." >&2
  exit 1
fi

rm -rf -- .nyc_output nyc_output coverage coverage-jest coverage-cypress
mkdir -p coverage/src

npm run test
cp coverage-jest/coverage-final.json coverage/src/jest.json

npm run test:ct
cp coverage-cypress/coverage-final.json coverage/src/cypress.json

./node_modules/.bin/nyc merge coverage/src coverage/coverage-final.json
./node_modules/.bin/nyc report -t coverage --reporter html --report-dir coverage/html
