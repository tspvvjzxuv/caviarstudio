#!/usr/bin/env bash
# Re-encode the hero loop: AV1 WebM + HEVC(hvc1) + H.264 High yuv420p faststart.
# 1080p desktop / 720p mobile, CRF, 30 fps CFR, 1s GOP for looping.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
SRC="$ROOT/media/hero/liquid-chrome.mp4"
OUT="$ROOT/media/hero"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [[ ! -f "$SRC" ]]; then
  echo "missing source $SRC" >&2
  exit 1
fi

# Constant 30 fps, even dims, yuv420p. Source is already 1920x1080 @ ~30.
vf1080="scale=1920:1080:flags=lanczos,fps=30,format=yuv420p"
vf720="scale=1280:720:flags=lanczos,fps=30,format=yuv420p"
x264="keyint=30:min-keyint=30:scenecut=0:open-gop=0"
x265="keyint=30:min-keyint=30:scenecut=0:open-gop=0"
# SVT-AV1: 1s GOP, no scene-cut so the loop stays even.
av1="keyint=30:irefresh-type=idr:scd=0:film-grain=0"

encode() {
  local label="$1"
  shift
  echo "==> $label"
  ffmpeg -hide_banner -y -i "$SRC" -an "$@"
}

# H.264 High, yuv420p, faststart — 1080p + 720p
encode "h264 1080p" \
  -vf "$vf1080" -c:v libx264 -profile:v high -level:v 4.1 -pix_fmt yuv420p \
  -preset slow -crf 30 -x264-params "$x264" -r 30 -movflags +faststart \
  "$TMP/liquid-chrome.mp4"

encode "h264 720p" \
  -vf "$vf720" -c:v libx264 -profile:v high -level:v 3.1 -pix_fmt yuv420p \
  -preset slow -crf 30 -x264-params "$x264" -r 30 -movflags +faststart \
  "$TMP/liquid-chrome-720.mp4"

# HEVC with hvc1 tag for Safari — 1080p + 720p
encode "hevc 1080p" \
  -vf "$vf1080" -c:v libx265 -tag:v hvc1 -pix_fmt yuv420p \
  -preset medium -crf 30 -x265-params "$x265" -r 30 -movflags +faststart \
  "$TMP/liquid-chrome.hevc.mp4"

encode "hevc 720p" \
  -vf "$vf720" -c:v libx265 -tag:v hvc1 -pix_fmt yuv420p \
  -preset medium -crf 30 -x265-params "$x265" -r 30 -movflags +faststart \
  "$TMP/liquid-chrome-720.hevc.mp4"

# AV1 WebM — 1080p + 720p (preset 8 = fast enough, still small)
encode "av1 1080p" \
  -vf "$vf1080" -c:v libsvtav1 -pix_fmt yuv420p \
  -crf 38 -preset 8 -g 30 -svtav1-params "$av1" -r 30 \
  "$TMP/liquid-chrome.webm"

encode "av1 720p" \
  -vf "$vf720" -c:v libsvtav1 -pix_fmt yuv420p \
  -crf 38 -preset 8 -g 30 -svtav1-params "$av1" -r 30 \
  "$TMP/liquid-chrome-720.webm"

# Poster from a mid-loop frame, progressive JPEG
ffmpeg -hide_banner -y -ss 1.6 -i "$TMP/liquid-chrome.mp4" -frames:v 1 \
  -q:v 6 "$TMP/liquid-chrome.jpg"

mv -f "$TMP"/liquid-chrome*.mp4 "$TMP"/liquid-chrome*.webm "$TMP"/liquid-chrome.jpg "$OUT/"

echo
echo "encoded hero loop:"
ls -lh "$OUT"
