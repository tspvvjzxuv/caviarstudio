#!/usr/bin/env bash
# Re-encode the hero loop from the original git mp4.
# Keep native timestamps/speed: no -r, no setpts, no fps resampling.
# AV1 WebM + HEVC(hvc1) + H.264 High yuv420p faststart; 1080p / 720p.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/media/hero"
ORIG_REF="${ORIG_REF:-a83667b}"
SRC="${SRC:-}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [[ -z "$SRC" ]]; then
  SRC="$TMP/liquid-chrome.src.mp4"
  git -C "$ROOT" show "${ORIG_REF}:media/hero/liquid-chrome.mp4" > "$SRC"
fi
if [[ ! -f "$SRC" ]]; then
  echo "missing source $SRC" >&2
  exit 1
fi

# Scale only. Do not fps=, setpts, or -r — those change playback speed.
vf1080="scale=1920:1080:flags=lanczos,format=yuv420p"
vf720="scale=1280:720:flags=lanczos,format=yuv420p"
# ~1s GOP at the source's native 30 tbr (300 frames / 9.966667s).
x264="keyint=30:min-keyint=30:scenecut=0:open-gop=0"
x265="keyint=30:min-keyint=30:scenecut=0:open-gop=0"
av1="keyint=30:irefresh-type=idr:scd=0:film-grain=0"

encode() {
  local label="$1"
  shift
  echo "==> $label"
  ffmpeg -hide_banner -y -i "$SRC" -an -fps_mode passthrough "$@"
}

encode "h264 1080p" \
  -vf "$vf1080" -c:v libx264 -profile:v high -level:v 4.1 -pix_fmt yuv420p \
  -preset slow -crf 30 -x264-params "$x264" -movflags +faststart \
  "$TMP/liquid-chrome.mp4"

encode "h264 720p" \
  -vf "$vf720" -c:v libx264 -profile:v high -level:v 3.1 -pix_fmt yuv420p \
  -preset slow -crf 30 -x264-params "$x264" -movflags +faststart \
  "$TMP/liquid-chrome-720.mp4"

encode "hevc 1080p" \
  -vf "$vf1080" -c:v libx265 -tag:v hvc1 -pix_fmt yuv420p \
  -preset medium -crf 30 -x265-params "$x265" -movflags +faststart \
  "$TMP/liquid-chrome.hevc.mp4"

encode "hevc 720p" \
  -vf "$vf720" -c:v libx265 -tag:v hvc1 -pix_fmt yuv420p \
  -preset medium -crf 30 -x265-params "$x265" -movflags +faststart \
  "$TMP/liquid-chrome-720.hevc.mp4"

encode "av1 1080p" \
  -vf "$vf1080" -c:v libsvtav1 -pix_fmt yuv420p \
  -crf 38 -preset 8 -g 30 -svtav1-params "$av1" \
  "$TMP/liquid-chrome.webm"

encode "av1 720p" \
  -vf "$vf720" -c:v libsvtav1 -pix_fmt yuv420p \
  -crf 38 -preset 8 -g 30 -svtav1-params "$av1" \
  "$TMP/liquid-chrome-720.webm"

ffmpeg -hide_banner -y -ss 1.6 -i "$SRC" -frames:v 1 -q:v 6 "$TMP/liquid-chrome.jpg"

for f in liquid-chrome.mp4 liquid-chrome-720.mp4 liquid-chrome.hevc.mp4 \
         liquid-chrome-720.hevc.mp4 liquid-chrome.webm liquid-chrome-720.webm \
         liquid-chrome.jpg; do
  mv -f "$TMP/$f" "$OUT/"
done

echo
echo "encoded hero loop from $ORIG_REF:"
ls -lh "$OUT"
