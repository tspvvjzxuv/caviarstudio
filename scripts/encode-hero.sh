#!/usr/bin/env bash
# Encode 60 fps hero variants from a RIFE PNG sequence.
# 600 frames, 10.0 s, r=60/1, GOP 60. No -r on a video input, no setpts.
# Image-sequence input uses -framerate 60 (native timestamps for 60 fps).
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
OUT="$ROOT/media/hero"
FRAMES="${FRAMES:-/tmp/hero-60}"
TMP="$(mktemp -d)"
trap 'rm -rf "$TMP"' EXIT

if [[ ! -f "$FRAMES/00000001.png" ]]; then
  echo "missing 60fps frames in $FRAMES — run scripts/interpolate-hero-60.sh first" >&2
  exit 1
fi

vf1080="scale=1920:1080:flags=lanczos,format=yuv420p"
vf720="scale=1280:720:flags=lanczos,format=yuv420p"
x264="keyint=60:min-keyint=60:scenecut=0:open-gop=0"
x265="keyint=60:min-keyint=60:scenecut=0:open-gop=0"
av1="keyint=60:irefresh-type=idr:scd=0:film-grain=0"

encode() {
  local label="$1"
  shift
  echo "==> $label"
  ffmpeg -hide_banner -y -framerate 60 -i "$FRAMES/%08d.png" -frames:v 600 -an -fps_mode passthrough "$@"
}

encode "h264 1080p60" \
  -vf "$vf1080" -c:v libx264 -profile:v high -level:v 4.1 -pix_fmt yuv420p \
  -preset slow -crf 30 -x264-params "$x264" -movflags +faststart \
  "$TMP/liquid-chrome.mp4"

encode "h264 720p60" \
  -vf "$vf720" -c:v libx264 -profile:v high -level:v 3.1 -pix_fmt yuv420p \
  -preset slow -crf 30 -x264-params "$x264" -movflags +faststart \
  "$TMP/liquid-chrome-720.mp4"

encode "hevc 1080p60" \
  -vf "$vf1080" -c:v libx265 -tag:v hvc1 -pix_fmt yuv420p \
  -preset medium -crf 30 -x265-params "$x265" -movflags +faststart \
  "$TMP/liquid-chrome.hevc.mp4"

encode "hevc 720p60" \
  -vf "$vf720" -c:v libx265 -tag:v hvc1 -pix_fmt yuv420p \
  -preset medium -crf 30 -x265-params "$x265" -movflags +faststart \
  "$TMP/liquid-chrome-720.hevc.mp4"

encode "av1 1080p60" \
  -vf "$vf1080" -c:v libsvtav1 -pix_fmt yuv420p \
  -crf 38 -preset 8 -g 60 -svtav1-params "$av1" \
  "$TMP/liquid-chrome.webm"

encode "av1 720p60" \
  -vf "$vf720" -c:v libsvtav1 -pix_fmt yuv420p \
  -crf 38 -preset 8 -g 60 -svtav1-params "$av1" \
  "$TMP/liquid-chrome-720.webm"

ffmpeg -hide_banner -y -framerate 60 -i "$FRAMES/%08d.png" -ss 1.6 -frames:v 1 -q:v 6 "$TMP/liquid-chrome.jpg"

for f in liquid-chrome.mp4 liquid-chrome-720.mp4 liquid-chrome.hevc.mp4 \
         liquid-chrome-720.hevc.mp4 liquid-chrome.webm liquid-chrome-720.webm \
         liquid-chrome.jpg; do
  mv -f "$TMP/$f" "$OUT/"
done

echo
echo "encoded 60 fps hero loop from $FRAMES:"
ls -lh "$OUT"
echo
for f in liquid-chrome.webm liquid-chrome.mp4 liquid-chrome.hevc.mp4 \
         liquid-chrome-720.webm liquid-chrome-720.mp4 liquid-chrome-720.hevc.mp4; do
  echo "==> $f"
  ffprobe -v error -select_streams v:0 \
    -show_entries stream=codec_name,avg_frame_rate,r_frame_rate,nb_frames,duration,width,height \
    -of default=noprint_wrappers=1 "$OUT/$f"
done
