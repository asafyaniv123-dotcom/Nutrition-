#!/usr/bin/env bash
# Promote the dev copy to the stable app.
#
#   ./release.sh            show what would change
#   ./release.sh --go       copy dev/ over the stable app and commit
#
# index.html and sw.js move, and so does stable/ - the snapshot of data/,
# assets/ and vendor/ that the stable app reads. Before it existed both copies
# fetched those from the root, so a language file edited for a dev experiment
# was live on her phone the moment Pages built: no release, nothing to review,
# no way back. Since 1 September data/lang alone changed in 191 commits.
#
# So the working copies stay where they are - the twelve tools still read
# data/ - and a release refreshes the snapshot beside them. liveBase() in the
# app picks between the two at runtime from the /dev/ path.
#
# The two manifests stay put on purpose: they are what give the phone two
# separate icons ("תזונה" and "תזונה DEV"), and the app files themselves are
# byte-identical between the copies - the dev behaviour is switched on at
# runtime by the /dev/ path, not by the build.
set -euo pipefail
# A SILENT EXIT MUST NOT LOOK LIKE A FINISHED DRY RUN. This script printed a
# page of filenames and then died on line 40 for eleven days, and the output
# was indistinguishable from success. Whatever goes wrong next, it says so.
trap 'echo; echo "release.sh FAILED at line $LINENO - nothing was published" >&2' ERR
cd "$(dirname "$0")"

changed=0
for f in index.html sw.js; do
  if ! cmp -s "dev/$f" "$f"; then
    changed=1
    frags=$({ diff <(tr ';' '\n' < "$f") <(tr ';' '\n' < "dev/$f") || true; } | grep -c '^[<>]' || true)
    echo "would update $f  ($frags changed fragments)"
  fi
done

# What she would START READING. This is the half a release used to be blind to:
# these files reached her without passing through here at all, so name every
# one of them rather than printing a count.
data_changed=0
for d in data assets vendor; do
  if ! diff -rq "$d" "stable/$d" >/dev/null 2>&1; then
    data_changed=1
    echo "would update stable/$d:"
    # diff returns 1 because there ARE differences - that is why this line is
    # running. Swallowed inside the braces, so the pipeline's status is sed's
    # and pipefail has nothing to kill the script with.
    { diff -rq "$d" "stable/$d" 2>&1 || true; } | sed 's/^/    /'
  fi
done
# An "if" rather than "[ … ] && changed=1": under set -e that one-liner only
# survives a false test by an exemption for && lists, and a release script is
# the wrong place to depend on which command is the final one.
if [ "$data_changed" = 1 ]; then changed=1; fi

if [ "$changed" = 0 ]; then echo "stable is already up to date with dev"; exit 0; fi

if [ "${1:-}" != "--go" ]; then
  echo
  echo "run ./release.sh --go to publish"
  exit 0
fi

cp dev/index.html index.html
cp dev/sw.js sw.js

# Refresh the snapshot the stable app reads. rsync --delete would be tidier but
# is not everywhere; removing and re-copying is the same thing and is obvious.
for d in data assets vendor; do
  rm -rf "stable/$d"
  cp -r "$d" "stable/$d"
done
# Prove it, rather than trusting the copy - this is the whole guarantee.
for d in data assets vendor; do
  diff -rq "$d" "stable/$d" >/dev/null || { echo "snapshot of $d did not take"; exit 1; }
done

git add index.html sw.js stable
git commit -m "Release dev to the stable app"
echo "released. push to publish: git push"
