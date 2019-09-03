#!/bin/bash

on_die ()
{
    # kill all children
    pkill -KILL -P $$
}

trap 'on_die' TERM

filepath="rtmp://172.104.55.76/$1/$2"
width_prefix='streams_stream_0_width='
height_prefix='streams_stream_0_height='
declare -a dimensions
while read -r line
do
    dimensions+=( "${line}" )
done < <( ffprobe -v error -of flat=s=_ -select_streams v:0 -show_entries stream=width,height "${filepath}" )
width_with_prefix=${dimensions[0]}
height_with_prefix=${dimensions[1]}
width=${width_with_prefix#${width_prefix}}
height=${height_with_prefix#${height_prefix}}


if [ "${height}" -lt 1441 ] && [ "${height}" -gt 1080 ]
then
	ffmpeg -i rtmp://172.104.55.76/$1/$2 -async 1 -vsync -1 -c:v libx264 -x264opts keyint=24:no-scenecut -c:a aac -max_muxing_queue_size 4000 -r 30 -b:v 400k -profile:v high -b:a 128k -vf "trunc(oh*a/2)*2:360" -tune zerolatency -preset veryfast -crf 23 -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2_360p.m3u8 -c:v libx264 -x264opts keyint=24:no-scenecut -c:a aac -max_muxing_queue_size 4000 -r 30 -b:v 500K -profile:v high -b:a 128k -vf "trunc(oh*a/2)*2:480" -tune zerolatency -preset veryfast -crf 23 -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2_480p.m3u8 -c:v libx264 -x264opts keyint=24:no-scenecut -c:a aac -max_muxing_queue_size 4000 -r 30 -b:v 1500K -profile:v high -b:a 128k -vf "trunc(oh*a/2)*2:720" -tune zerolatency -preset veryfast -crf 23 -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2_720p.m3u8 -c:v libx264 -x264opts keyint=24:no-scenecut -c:a aac -max_muxing_queue_size 4000 -r 30 -b:v 3000K -profile:v high -b:a 128k -vf "trunc(oh*a/2)*2:1080" -tune zerolatency -preset veryfast -crf 23 -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2_1080p.m3u8 -c copy -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2.m3u8 &
elif [ "${height}" -lt 1081 ] && [ "${height}" -gt 720 ]
then
	ffmpeg -i rtmp://172.104.55.76/$1/$2 -async 1 -vsync -1 -c:v libx264 -x264opts keyint=24:no-scenecut -c:a aac -max_muxing_queue_size 4000 -r 30 -b:v 400k -profile:v high -b:a 128k -vf "trunc(oh*a/2)*2:360" -tune zerolatency -preset veryfast -crf 23 -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2_360p.m3u8 -c:v libx264 -x264opts keyint=24:no-scenecut -c:a aac -max_muxing_queue_size 4000 -r 30 -b:v 500K -profile:v high -b:a 128k -vf "trunc(oh*a/2)*2:480" -tune zerolatency -preset veryfast -crf 23 -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2_480p.m3u8 -c:v libx264 -x264opts keyint=24:no-scenecut -c:a aac -max_muxing_queue_size 4000 -r 30 -b:v 1500K -profile:v high -b:a 128k -vf "trunc(oh*a/2)*2:720" -tune zerolatency -preset veryfast -crf 23 -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2_720p.m3u8 -c copy -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2.m3u8 &
elif [ "${height}" -lt 721 ] && [ "${height}" -gt 480 ]
then
	ffmpeg -i rtmp://172.104.55.76/$1/$2 -async 1 -vsync -1 -c:v libx264 -x264opts keyint=24:no-scenecut -c:a aac -max_muxing_queue_size 4000 -r 30 -b:v 400k -profile:v high -b:a 128k -vf "trunc(oh*a/2)*2:360" -tune zerolatency -preset veryfast -crf 23 -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2_360p.m3u8 -c:v libx264 -x264opts keyint=24:no-scenecut -c:a aac -max_muxing_queue_size 4000 -r 30 -b:v 500K -profile:v high -b:a 128k -vf "trunc(oh*a/2)*2:480" -tune zerolatency -preset veryfast -crf 23 -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2_480p.m3u8 -c copy -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2.m3u8 &
elif [ "${height}" -lt 481 ] && [ "${height}" -gt 300 ]
then
	ffmpeg -i rtmp://172.104.55.76/$1/$2 -async 1 -vsync -1 -c:v libx264 -x264opts keyint=24:no-scenecut -c:a aac -max_muxing_queue_size 4000 -r 30 -b:v 400k -profile:v high -b:a 128k -vf "trunc(oh*a/2)*2:360" -tune zerolatency -preset veryfast -crf 23 -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2_360p.m3u8 -c copy -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2.m3u8 &
else
	echo "not working"
fi

wait
