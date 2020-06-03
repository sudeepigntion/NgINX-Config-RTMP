#!/bin/bash

on_die ()
{
    # kill all children
    pkill -KILL -P $$
}

trap 'on_die' TERM

filepath="rtmp://34.89.92.246:1935/$1/$2"
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

echo $height
echo $width

if [[ "${height}" -lt 1441 && "${height}" -gt 1080 ]]
then
	ffmpeg -i rtmp://34.89.92.246:1935/$1/$2 -c:v libx264 -x264opts keyint=120:no-scenecut -s 1920x1080 -max_muxing_queue_size 4000 -r 60 -b:v 3000K -profile:v main -tune zerolatency -preset veryfast -c:a aac -sws_flags bilinear -hls_list_size 10 /mnt/hls/$2_1080.m3u8 -c:v libx264 -x264opts keyint=120:no-scenecut -s 1280x720 -max_muxing_queue_size 4000 -r 60 -b:v 1500K -profile:v main -tune zerolatency -preset veryfast -c:a aac -sws_flags bilinear -hls_list_size 10 /mnt/hls/$2_720p.m3u8 -c:v libx264 -x264opts keyint=120:no-scenecut -s 854x480 -max_muxing_queue_size 4000 -r 60 -b:v 500K -profile:v main -tune zerolatency -preset veryfast -c:a aac -sws_flags bilinear -hls_list_size 10 /mnt/hls/$2_480p.m3u8 -c:v libx264 -x264opts keyint=60:no-scenecut -s 640x360 -max_muxing_queue_size 4000 -r 30 -b:v 400K -profile:v main -tune zerolatency -preset veryfast -c:a aac -sws_flags bilinear -hls_list_size 10 /mnt/hls/$2_360p.m3u8 -c copy -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2.m3u8 &
elif [[ "${height}" -lt 1081 && "${height}" -gt 720 ]]
then
	ffmpeg -i rtmp://34.89.92.246:1935/$1/$2 -c:v libx264 -x264opts keyint=120:no-scenecut -s 1280x720 -max_muxing_queue_size 4000 -r 60 -b:v 1500K -profile:v main -tune zerolatency -preset veryfast -c:a aac -sws_flags bilinear -hls_list_size 10 /mnt/hls/$2_720p.m3u8 -c:v libx264 -x264opts keyint=60:no-scenecut -s 854x480 -max_muxing_queue_size 4000 -r 30 -b:v 500K -profile:v main -tune zerolatency -preset veryfast -c:a aac -sws_flags bilinear -hls_list_size 10 /mnt/hls/$2_480p.m3u8 -c:v libx264 -x264opts keyint=60:no-scenecut -s 640x360 -max_muxing_queue_size 4000 -r 30 -b:v 400K -profile:v main -tune zerolatency -preset veryfast -c:a aac -sws_flags bilinear -hls_list_size 10 /mnt/hls/$2_360p.m3u8 -c copy -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2.m3u8 &
elif [[ "${height}" -lt 721 && "${height}" -gt 480 ]]
then
	ffmpeg -i rtmp://34.89.92.246:1935/$1/$2 -c:v libx264 -x264opts keyint=60:no-scenecut -s 854x480 -max_muxing_queue_size 4000 -r 30 -b:v 500K -profile:v main -tune zerolatency -preset veryfast -c:a aac -sws_flags bilinear -hls_list_size 10 /mnt/hls/$2_480p.m3u8 -c:v libx264 -x264opts keyint=60:no-scenecut -s 640x360 -max_muxing_queue_size 4000 -r 30 -b:v 400K -profile:v main -tune zerolatency -preset veryfast -c:a aac -sws_flags bilinear -hls_list_size 10 /mnt/hls/$2_360p.m3u8 -c copy -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2.m3u8 &
elif [[ "${height}" -lt 481 && "${height}" -gt 300 ]]
then
	ffmpeg -i rtmp://34.89.92.246:1935/$1/$2 -c:v libx264 -x264opts keyint=60:no-scenecut -s 640x360 -max_muxing_queue_size 4000 -r 30 -b:v 400K -profile:v main -tune zerolatency -preset veryfast -c:a aac -sws_flags bilinear -hls_list_size 10 /mnt/hls/$2_360p.m3u8 -c copy -f hls -hls_time 1 -hls_playlist_type event -hls_list_size 10 /mnt/hls/$2.m3u8 &
else
	echo "not working"
fi

wait
