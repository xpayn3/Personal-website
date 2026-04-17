#!/bin/bash
# Batch convert AccountingBox MP4s -> high-quality WebM + generate thumbs.
# Run from the AccountingBox folder. Keeps originals.

set -u
cd "$(dirname "$0")" || exit 1

# Map: original -> clean output name (without extension)
declare -A MAP=(
  ["1_loop.mp4"]="1_loop"
  ["2_intro.mp4"]="2_intro"
  ["4_loop.mp4"]="4_loop"
  ["6_intro.mp4"]="6_intro"
  ["freetrial[0000-0115].mp4"]="freetrial"
  ["hiter[0000-0120].mp4"]="hiter"
  ["intro[0010-0160].mp4"]="intro"
  ["kjerkoli[0000-0113].mp4"]="kjerkoli"
  ["kjerkoli_drugomesto[0000-0120].mp4"]="kjerkoli_drugomesto"
  ["kjerkoli_prvomesto[0000-0120].mp4"]="kjerkoli_prvomesto"
  ["podpora[0000-0144].mp4"]="podpora"
)

for src in "${!MAP[@]}"; do
  out="${MAP[$src]}"
  if [[ ! -f "$src" ]]; then
    echo "SKIP (missing): $src"
    continue
  fi
  if [[ -f "${out}.webm" ]]; then
    echo "SKIP (exists): ${out}.webm"
  else
    echo "[convert] $src -> ${out}.webm"
    ffmpeg -y -hide_banner -loglevel error -i "$src" \
      -c:v libvpx-vp9 -crf 30 -b:v 0 -row-mt 1 -tile-columns 2 -threads 8 \
      -deadline good -speed 2 -an "${out}.webm"
  fi
  if [[ ! -f "${out}_thumb.webp" ]]; then
    echo "[thumb]   ${out}_thumb.webp"
    ffmpeg -y -hide_banner -loglevel error -ss 1 -i "$src" \
      -frames:v 1 -vf "scale='min(1024,iw)':-2" -c:v libwebp -quality 85 "${out}_thumb.webp" \
      || ffmpeg -y -hide_banner -loglevel error -i "$src" \
           -frames:v 1 -vf "scale='min(1024,iw)':-2" -c:v libwebp -quality 85 "${out}_thumb.webp"
  fi
done

# Cover images -> webp + mobile
for img in Podjetja_cover.jpg racunovodje_cover_final.jpg; do
  base="${img%.*}"
  if [[ -f "$img" && ! -f "${base}.webp" ]]; then
    echo "[image]   ${base}.webp"
    ffmpeg -y -hide_banner -loglevel error -i "$img" -c:v libwebp -quality 88 "${base}.webp"
  fi
  if [[ -f "$img" && ! -f "mobile/${base}.webp" ]]; then
    ffmpeg -y -hide_banner -loglevel error -i "$img" -vf "scale=300:-2" -c:v libwebp -quality 85 "mobile/${base}.webp"
  fi
done

# Mobile thumbs for videos
for src in "${!MAP[@]}"; do
  out="${MAP[$src]}"
  if [[ -f "${out}_thumb.webp" && ! -f "mobile/${out}_thumb.webp" ]]; then
    ffmpeg -y -hide_banner -loglevel error -i "${out}_thumb.webp" -vf "scale=300:-2" -c:v libwebp -quality 85 "mobile/${out}_thumb.webp"
  fi
done

echo "DONE."
