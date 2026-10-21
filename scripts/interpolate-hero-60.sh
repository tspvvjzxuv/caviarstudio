#!/usr/bin/env bash
# Motion-interpolate the original 30 fps hero to 60 fps with RIFE v4.6.
# Loop-pad frame 1 as the last source frame, interpolate, then keep 600 frames
# (10.0 s at r=60/1) so the last in-between is last→first.
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
ORIG_REF="${ORIG_REF:-a83667b}"
RIFE="${RIFE:-/tmp/rife/rife-ncnn-vulkan-20221029-ubuntu/rife-ncnn-vulkan}"
MODEL="${MODEL:-rife-v4.6}"
IN_DIR="${IN_DIR:-/tmp/hero-in}"
OUT_DIR="${OUT_DIR:-/tmp/hero-rife-out}"
FRAMES="${FRAMES:-/tmp/hero-60}"
SRC="${SRC:-}"

if [[ ! -x "$RIFE" ]]; then
  echo "missing rife binary $RIFE" >&2
  exit 1
fi

if [[ -z "$SRC" ]]; then
  TMP_SRC="$(mktemp)"
  git -C "$ROOT" show "${ORIG_REF}:media/hero/liquid-chrome.mp4" > "$TMP_SRC"
  SRC="$TMP_SRC"
fi

mkdir -p "$IN_DIR" "$OUT_DIR" "$FRAMES"
if [[ ! -f "$IN_DIR/00000001.png" ]]; then
  ffmpeg -hide_banner -y -i "$SRC" -fps_mode passthrough -f image2 "$IN_DIR/%08d.png"
fi
cp -f "$IN_DIR/00000001.png" "$IN_DIR/00000301.png"

"$RIFE" -i "$IN_DIR" -o "$OUT_DIR" -m "$MODEL" -g -1 -j 1:4:2 -f %08d.png -n 602

rm -rf "$FRAMES"
mkdir -p "$FRAMES"
# 300 originals + 300 in-betweens, including last→first. Drop the padded extra.
export OUT_DIR FRAMES
python3 - <<'PY'
import os, shutil
src = os.environ["OUT_DIR"]
dst = os.environ["FRAMES"]
files = sorted(f for f in os.listdir(src) if f.endswith(".png"))
if len(files) < 600:
    raise SystemExit(f"expected >=600 interpolated frames, got {len(files)}")
os.makedirs(dst, exist_ok=True)
for i, name in enumerate(files[:600], start=1):
    shutil.copy2(os.path.join(src, name), os.path.join(dst, f"{i:08d}.png"))
print(f"wrote 600 frames to {dst}")
PY
