Nowadays video streaming is a trend and people are crazy about facebook live, twitch tv and some other applications, but how these applications are built, what sort of protocols are used to do such streaming and people are viewing these streams in mobile apps and browser. Well, this is the perfect blog for you to learn the complete setup of the streaming server and also some alternative solutions will be provided.
So, what is RTMP? According to Wikipedia,
Real-Time Messaging Protocol (RTMP) was initially a proprietary protocol developed by Macromedia for streaming audio, video and data over the Internet, between a Flash player and a server. Macromedia is now owned by Adobe, which has released an incomplete version of the specification of the protocol for public use. The above image is a google cloud platform architecture taken from the website where they have shown how vod(video on demand) and live streaming works.
To get the full source go to my git repo: https://github.com/ignition123/NgINX-Config-RTMP
The RTMP protocol has multiple variations:
The "plain" protocol which works on top of and uses TCP port number 1935 by default.
RTMPS, which is RTMP over a TLS/SSL connection.
RTMPE, which is RTMP encrypted using Adobe's own security mechanism. While the details of the implementation are proprietary, the mechanism uses industry-standard cryptographic primitives.[1]
RTMPT, which is encapsulated within HTTP requests to traverse firewalls. RTMPT is frequently found utilizing cleartext requests on TCP ports 80 and 443 to bypass most corporate traffic filtering. The encapsulated session may carry plain RTMP, RTMPS, or RTMPE packets within.
RTMFP, which is RTMP over UDP instead of TCP, replacing RTMP Chunk Stream. The Secure Real-Time Media Flow Protocol suite has been developed by Adobe Systems and enables end‐users to connect and communicate directly with each other (P2P).

Facebook, twitch all use RTMPS now as it uses SSL for message transfer. Some other protocols are also there for such streaming such as RTSP which is widely used by youtube.
For the RTMP server setup there are tons of service some of them are open source and some of them are paid. Following are the services that provides RTMP support:
Wowza Streaming Engine (known as Wowza Media Server prior to version 4) is a unified streaming media server software developed by Wowza Media Systems. The server is used for streaming of live and on-demand video, audio, and rich Internet applications over IP networks to desktop, laptop, and tablet computers, mobile devices, IPTV set-top boxes, internet-connected TV sets, game consoles, and other network-connected devices. The server is a Java application deployable on most operating systems. The official site is https://www.wowza.com/
Ant Media Server is another streaming server that supports RTMP and provides both opensource and enterprise versions. The official site is https://antmedia.io/
Red 5 is another streaming server just like ant media server which is built in java and provides opensource and enterprise version of it. The official site is https://www.red5pro.com/open-source/
For some opensource libraries, there are solutions like node media server( https://www.npmjs.com/package/node-media-server), golang RTMP module( https://godoc.org/github.com/TrevorSStone/gortmp)
Nginx Web Server, it is a web server that provides load balancing, socket streaming, reverse proxy server and many more it comes in 2 versions, 1 is opensource and one with enterprise version. It is recently acquired by F5. ( https://www.nginx.com/)

In this blog, I will be demonstration step by step from installation to configurations of RTMP and then streaming the video in the browser or any mobile/tablet platform.
Following are the steps,
You need Linux servers as the Nginx RTMP module works only in the Linux server.
You need edge CDN servers to stream in a different place with low latency. peer 5 is a good CDN server.
For RTMP to HLS or MPEG-DASH you need a c++ library called FFmpeg which is an open-source video encoding library, it is the best encoder in opensource and is very powerful to encode the video streams to any format. We will explain about HLS and MPEG -DASH in bellow.
To install Nginx you can check in google. Install Nginx version 1.6 for RTMP support. To install Nginx RTMP module use the following commands

    Download & unpack latest Nginx-RTMP (you can also use HTTP)
    sudo git clone git://github.com/arut/nginx-rtmp-module.git
    Download & unpack Nginx (you can also use svn)
    sudo wget http://nginx.org/download/nginx-1.14.1.tar.gz
    sudo tar xzf nginx-1.14.1.tar.gz
    cd nginx-1.14.1
    Build Nginx with Nginx-RTMP
    sudo ./configure --with-http_ssl_module --add-module=../nginx-rtmp-module
    sudo make
    sudo make install
    Start Nginx Server
    sudo /usr/local/nginx/sbin/nginx
    
Now, we will change the Nginx conf file to make changes for RTMP. 
Here we have set the worker process to auto so that Nginx scales automatically. Setting the number of filehandle for connections and then setting error log path.

    worker_processes auto; 
    worker_rlimit_nofile 100000;
    error_log /var/log/nginx/error.log crit;
    Now we set up the connections configurations of nginx.
    events { 
    #determines how much clients will be served per worker 
    #max clients = worker_connections * worker_processes 
    #max clients is also limited by the number of socket connections available on the system (~64k)
    worker_connections 4000; 
    #optimized to serve many clients with each thread, essential for linux - for testing environment use 
    epoll; 
    #accept as many connections as possible, may flood worker connections if set too low - for testing environment 
    multi_accept on;
    }
  
Now we set up the RTMP module configuration. This uses some events like onplay, onpublish, ondone where authentication is used to verify the client. We will share the auth sample code written in nodejs later. The streaming is then converted to a hls file which is then streamed using http protocol.

    rtmp {
    server {
    listen 1935; # Listen on standard RTMP port
    ping 30s;
    notify_method get;
    chunk_size 4096;
    #video on demand for flv files
    application vod {
    play /mnt/flvs;
    }
    #video on demand for mp4 files
    application vod2 {
    play /mnt/mp4s;
    }
    #This application is to accept incoming stream
    application live {
    live on; # Allows live
    allow play all;
    on_publish http://127.0.0.1:3000/rtmp_key_auth;
    on_done http://127.0.0.1:3000/rtmp_streams_end;
    #on play event triggers when any client is streaming and displaying the streams
    #on_play http://127.0.0.1:3000/rtmp_key_auth;
    #Once receive stream, transcode for adaptive streaming
    #This single ffmpeg command takes the input and transforms
    #the source into 4 different streams with different bitrate
    #and quality. P.S. The scaling done here respects the aspect
    #ratio of the input.
    exec bash /opt/live_stream/exec_wrapper.sh $app $name;
    exec_kill_signal term;
    record all;
    record_path /mnt/recordings;
    record_unique on;
    record_append on;
    exec_record_done ffmpeg -i /mnt/recordings/ -f mp4 /mnt/mp4s/$basename.mp4;
    }
    application live_mobile {
    live on;
    allow play all;
    #-max_muxing_queue_size 4000
    #-hls_list_size 100
    on_publish http://127.0.0.1:3000/rtmp_key_auth;
    exec_push ffmpeg -re -i rtmp://127.0.0.1/$app/$name -async 1 -vsync -1 -c:v copy -c:a copy -tune zerolatency -preset veryfast -crf 23 -f hls -hls_time 10 -hls_playlist_type event /mnt/hls/$name.m3u8;
    record all;
    record_path /mnt/recordings;
    record_unique on;
    record_append on;
    exec_record_done ffmpeg -i /mnt/recordings/ -f mp4 /mnt/mp4s/$basename.mp4;
    }
    #This application is for splitting the stream into HLS fragments
    application show {
    live on; # Allows live input from above
    hls on; # Enable HTTP Live Streaming
    hls_fragment 3;
    hls_playlist_length 60;
    #hls_sync 100ms;
    hls_continuous on;
    deny play all;
    #Pointing this to an SSD is better as this involves lots of IO
    hls_path /mnt/hls/;
    hls_cleanup on;
    record all;
    record_path /mnt/recordings;
    record_unique on;
    record_append on;
    exec_record_done ffmpeg -i /mnt/recordings/ -f mp4 /mnt/mp4s/$basename.mp4;
    #Instruct clients to adjust resolution according to bandwidth
    hls_variant _low BANDWIDTH=288000; # Low bitrate, sub-SD resolution
    hls_variant _mid BANDWIDTH=448000; # Medium bitrate, SD resolution
    hls_variant _high BANDWIDTH=1152000; # High bitrate, higher-than-SD resolution
    hls_variant _hd720 BANDWIDTH=2048000; # High bitrate, HD 720p resolution
    hls_variant _src BANDWIDTH=4096000; # Source bitrate, source resolution
    }
    application recorder {
    live on;
    recorder all {
    record all;
    record_path /mnt/recordings;
    #record_max_size 100000K;
    #record_max_frames 4;
    record_unique on;
    #record_suffix _%d%m%Y_%H%M%S.flv;
    #record_append on;
    #record_interval 5s;
    #record_notify on;
    exec_record_done ffmpeg -i $path -f mp4 /tmp/live/$basename.mp4;
    }}
    application show {
    live on; # Allows live input from above
    hls on; # Enable HTTP Live Streaming
    hls_fragment 3;
    hls_playlist_length 60;
    #hls_sync 100ms;
    hls_continuous on;
    deny play all;
    #Pointing this to an SSD is better as this involves lots of IO
    hls_path /mnt/hls/;
    hls_cleanup on;
    record all;
    record_path /mnt/recordings;
    record_unique on;
    record_append on;
    exec_record_done ffmpeg -i /mnt/recordings/ -f mp4 /mnt/mp4s/$basename.mp4;
    # Instruct clients to adjust resolution according to bandwidth
    hls_variant _low BANDWIDTH=288000; # Low bitrate, sub-SD resolution
    hls_variant _mid BANDWIDTH=448000; # Medium bitrate, SD resolution
    hls_variant _high BANDWIDTH=1152000; # High bitrate, higher-than-SD resolution
    hls_variant _hd720 BANDWIDTH=2048000; # High bitrate, HD 720p resolution
    hls_variant _src BANDWIDTH=4096000; # Source bitrate, source resolution
    }
    application recorder {
    live on;
    recorder all {
    record all;
    record_path /mnt/recordings;
    #record_max_size 100000K;
    #record_max_frames 4;
    record_unique on;
    #record_suffix _%d%m%Y_%H%M%S.flv;
    #record_append on;
    #record_interval 5s;
    #record_notify on;
    exec_record_done ffmpeg -i $path -f mp4 /tmp/live/$basename.mp4;
    }}}}
    Now to serve the HLS streams we configure the HTTP server in Nginx. Following are the configuration
    http {
    open_file_cache max=200000 inactive=20s;
    open_file_cache_valid 30s;
    open_file_cache_min_uses 2;
    open_file_cache_errors on;
    gzip on;
    #gzip_static on;
    gzip_min_length 10240;
    gzip_comp_level 1;
    gzip_vary on;
    gzip_disable msie6;
    gzip_proxied expired no-cache no-store private auth;
    gzip_types
    #text/html is always compressed by HttpGzipModule
    text/css
    text/javascript
    text/xml
    text/plain
    text/x-component
    application/javascript
    application/x-javascript
    application/json
    application/xml
    application/rss+xml
    application/atom+xml
    font/truetype
    font/opentype
    application/vnd.ms-fontobject
    image/svg+xml;
    #access_log logs/access.log main;
    directio 512;
    server {
    listen 9200;
    server_name localhost;
    #charset koi8-r;
    #access_log logs/host.access.log main;
    location / {
    #Disable cache
    add_header 'Cache-Control' 'no-cache';
    #CORS setup
    add_header 'Access-Control-Allow-Origin' '*' always;
    add_header 'Access-Control-Expose-Headers' 'Content-Length';
    #allow CORS preflight requests
    if ($request_method = 'OPTIONS') {add_header 'Access-Control-Allow-Origin' '*';
    add_header 'Access-Control-Max-Age' 1728000;
    add_header 'Content-Type' 'text/plain charset=UTF-8';
    add_header 'Content-Length' 0;
    return 204;
    }
    types {
    application/dash+xml mpd;
    application/vnd.apple.mpegurl m3u8;
    video/mp2t ts;
    video/x-flv flv;
    video/mp4 mp4;
    video/webm webm;
    }
    root /mnt/;
    }}}


Now we are done with the configuration of nginx server for both RTMP and HLS streaming to read about HLS streaming following is the path https://en.wikipedia.org/wiki/HTTP_Live_Streaming, to read about MPEG-DASH following is the path https://en.wikipedia.org/wiki/Dynamic_Adaptive_Streaming_over_HTTP. There are more alternative like micrtosoft smooth streaming but we dont want to cover that for now.
Now we will demonstrate how to authenticate client before streaming starts or ends or play,
Following is the NodeJS sample snippet which you can modify use database to validate whatever you like. Following is the code written in express where it matches the key with the myStream string and validates you can uses any key that you will generate and pass it to client before starting the stream.

    app.get('/rtmp_key_auth',async function(req,res){
     if(req.query.name === undefined){
     res.status(404);
     res.send('Key does not match');
     }else{
     if(req.query.name === "myStream"){
     res.status(200);
     res.send('Authenticated');
     } else{
     res.status(404);
     res.send('Key does not match');
     }}});
 
Now remember video streaming does not take too much of CPU utilization but video encoding takes a lot of CPU usage for that you need good servers, secondly if some streams in a low-resolution don't upgrade the pixels it will take lots of CPU usage, always downgrade you stream from upper to lower for HLS to dynamically change the resolution depending on the internet speed. Suppose if someone is streaming at a resolution of 1080p then we will download streams to 720p, 480p, and 360p plus the original stream we are receiving. For that, I have created a bash script that works perfectly for downgrading the streams to different resolutions for HLS to stream. NGINX will execute the bash file which will future call FFmpeg library to encode the video from RTMP streams to HLS file. Following is the bash script sample.

     #!/bin/bash 
    on_die (){ 
    #kill all children 
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
    fi wait

It downgrades the resolutions and create seperate HLS files. To read about the ffmpeg flags you can visit the official site of ffmpeg there are lots of things to learn about the library. https://www.ffmpeg.org/. With this setup with slight modification you can create a successfully streaming server, I hope it gives you a clear understanding to stream hls or mpeg-dash you can use hls.js or mpeg-dash.js or there are more libraries like flowflv to stream rtmp directly. Next time will show how to create own rtmp server using the adobe RFC till then enjoy and keep learning…. :)
