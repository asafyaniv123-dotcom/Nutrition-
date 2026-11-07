#!/bin/sh
# finish.sh <in-rgba.png> <out.png> : the same dark ground, floor glow and bloom for every frame
FF="$(node -e "console.log(require('os').tmpdir())")/fftool/node_modules/ffmpeg-static/ffmpeg.exe"
D="$(dirname "$0")"
if [ ! -f "$D/ground.png" ]; then
  "$FF" -v error -y -f lavfi -i "color=c=black:s=1024x1024" -vf "format=rgb24,geq=r='26+70*exp(-(pow((X-560)/380,2)+pow((Y-690)/60,2)))':g='15+34*exp(-(pow((X-560)/380,2)+pow((Y-690)/60,2)))':b='8+8*exp(-(pow((X-560)/380,2)+pow((Y-690)/60,2)))'" -frames:v 1 "$D/ground.png"
fi
"$FF" -v error -y -i "$D/ground.png" -i "$1" -filter_complex "[1:v]format=rgba,split[f][g];[g]gblur=sigma=14,colorchannelmixer=aa=0.9[b];[0:v][b]overlay=format=auto[bg];[bg][f]overlay=format=auto" -frames:v 1 "$2"
