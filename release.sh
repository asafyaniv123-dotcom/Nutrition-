#!/usr/bin/env bash
# Promote the dev copy to the stable app.
#
#   ./release.sh            show what would change
#   ./release.sh --go       copy dev/ over the stable app and commit
#
# Only index.html and sw.js move. The two manifests stay put on purpose: they
# are what give the phone two separate icons ("תזונה" and "תזונה DEV"), and the
# app files themselves are byte-identical between the copies - the dev
# behaviour is switched on at runtime by the /dev/ path, not by the build.
set -euo pipefail
cd "$(dirname "$0")"

changed=0
for f in index.html sw.js; do
  if ! cmp -s "dev/$f" "$f"; then
    changed=1
    echo "would update $f  ($(diff <(tr ';' '\n' < "$f") <(tr ';' '\n' < "dev/$f") | grep -c '^[<>]') changed fragments)"
  fi
done

if [ "$changed" = 0 ]; then echo "stable is already up to date with dev"; exit 0; fi

if [ "${1:-}" != "--go" ]; then
  echo
  echo "run ./release.sh --go to publish"
  exit 0
fi

cp dev/index.html index.html
cp dev/sw.js sw.js
git add index.html sw.js
git commit -m "Release dev to the stable app"
echo "released. push to publish: git push"
