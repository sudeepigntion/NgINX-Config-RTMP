var spawn = require('child_process').spawn;

var exec = require('child_process').exec;

var commandArg;

var updateDate = new Date().getTime();

var proc;

function main()
{
    console.log("init");

    var cmd = 'ffprobe';

    commandArg = process.argv.slice(2);

    var args = [
        '-v', 
        'error',
        '-select_streams',
        'v:0',
        '-show_entries',
        'stream=width,height',
        '-of',
        'json',
        'rtmp://172.104.55.76/'+commandArg[0]+'/'+commandArg[1]
    ];

    var procProbes = spawn(cmd, args);

    var body = "";

    procProbes.stdout.on('data', function(data) {
        try
        {
            body += data;
        }
        catch(e)
        {
            console.log(e);
        }
    });

    procProbes.stderr.on('data', function(data)
    {
        console.log(data.toString());

        process.exit();
    });

    procProbes.on('close', function()
    {
        body = body.toString();

        body = JSON.parse(body);

        checkForCurrentStreams(body);
            
    });
}

main();

function checkForCurrentStreams(resol)
{
    var ps    = spawn('ps',   ['aux']);
    var grep  = spawn('grep', [commandArg[1]]);

    ps.stdout.pipe(grep.stdin);

    var body = "";

    grep.stdout.on('data', function(data) {
        try
        {
            body += data;
        }
        catch(e)
        {
            console.log(e);
        }
    });

    grep.stderr.on('data', function(data)
    {
        console.log(data.toString());

        process.exit();
    });

    grep.on('close', function()
    {
        body = body.toString();

        body = body.split("ffmpeg");

        if(body.length > 1)
        {
            process.exit(0);
        }
        else
        {
            if(resol.streams[0].height > 1440)
            {
                videoStreaming1440p()
            }

            if(resol.streams[0].height > 1080)
            {
                videoStreaming1080p()
            }

            if(resol.streams[0].height > 720)
            {
                videoStreaming720p()
            }

            if(resol.streams[0].height > 480)
            {
                videoStreaming480p()
            }

            if(resol.streams[0].height <= 480)
            {
                videoStreaming320p()
            }
        }
    }); 
}

function videoStreaming1440p()
{
    console.log(1440 + " resolution");

    var cmd = 'ffmpeg';
                                         
    var args = [
        '-i', 
        'rtmp://172.104.55.76/'+commandArg[0]+'/'+commandArg[1],
        '-async',
        '1',
        '-vsync',
        '-1',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '400k',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=360:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_360p.m3u8',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '500K',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=480:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_480p.m3u8',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '1500K',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=720:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_720p.m3u8',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '3000K',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=1080:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_1080p.m3u8',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '9000K',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=1440:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_1440p.m3u8',

        '-c',
        'copy',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'.m3u8'
    ];

    proc = spawn(cmd, args);

    proc.stdout.on('data', function(data)
    {
        try
        {
            process.nextTick(function()
            {
                updateDate = new Date().getTime();
            });

            data = data.toString();
            console.log(data);
        }
        catch(e)
        {
            console.log(e);
        }
    });

    proc.stderr.on('data', function(data)
    {
        console.log(data.toString());

        process.nextTick(function()
        {
            updateDate = new Date().getTime();
        });
    });

    proc.on('close', function()
    {
        console.log('finished');
    });
}

function videoStreaming1080p()
{
    console.log(1080 + " resolution");

    var cmd = 'ffmpeg';
                                         
    var args = [
        '-i', 
        'rtmp://172.104.55.76/'+commandArg[0]+'/'+commandArg[1],
        '-async',
        '1',
        '-vsync',
        '-1',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '400k',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=360:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_360p.m3u8',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '500K',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=480:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_480p.m3u8',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '1500K',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=720:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_720p.m3u8',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '3000K',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=1080:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_1080p.m3u8',

        '-c',
        'copy',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'.m3u8'
    ];

    proc = spawn(cmd, args);

    proc.stdout.on('data', function(data)
    {
        try
        {
            process.nextTick(function()
            {
                updateDate = new Date().getTime();
            });

            data = data.toString();
            console.log(data);
        }
        catch(e)
        {
            console.log(e);
        }
    });

    proc.stderr.on('data', function(data)
    {
        console.log(data.toString());

        process.nextTick(function()
        {
            updateDate = new Date().getTime();
        });
    });

    proc.on('close', function()
    {
        console.log('finished');
    });
}

function videoStreaming720p()
{
    console.log(720 + " resolution");

    var cmd = 'ffmpeg';
                                         
    var args = [
        '-i', 
        'rtmp://172.104.55.76/'+commandArg[0]+'/'+commandArg[1],
        '-async',
        '1',
        '-vsync',
        '-1',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '400k',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=360:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_360p.m3u8',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '500K',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=480:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_480p.m3u8',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '1500K',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=720:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_720p.m3u8',

        '-c',
        'copy',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'.m3u8'
    ];

    proc = spawn(cmd, args);

    proc.stdout.on('data', function(data)
    {
        try
        {
            process.nextTick(function()
            {
                updateDate = new Date().getTime();
            });

            data = data.toString();
            console.log(data);
        }
        catch(e)
        {
            console.log(e);
        }
    });

    proc.stderr.on('data', function(data)
    {
        console.log(data.toString());

        process.nextTick(function()
        {
            updateDate = new Date().getTime();
        });
    });

    proc.on('close', function()
    {
        console.log('finished');
    });
}

function videoStreaming480p()
{
    console.log(1440 + " resolution");

    var cmd = 'ffmpeg';
                                         
    var args = [
        '-i', 
        'rtmp://172.104.55.76/'+commandArg[0]+'/'+commandArg[1],
        '-async',
        '1',
        '-vsync',
        '-1',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '400k',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=360:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_360p.m3u8',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '500K',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=480:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_480p.m3u8',


        '-c',
        'copy',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'.m3u8'
    ];

    proc = spawn(cmd, args);

    proc.stdout.on('data', function(data)
    {
        try
        {
            process.nextTick(function()
            {
                updateDate = new Date().getTime();
            });

            data = data.toString();
            console.log(data);
        }
        catch(e)
        {
            console.log(e);
        }
    });

    proc.stderr.on('data', function(data)
    {
        console.log(data.toString());

        process.nextTick(function()
        {
            updateDate = new Date().getTime();
        });
    });

    proc.on('close', function()
    {
        console.log('finished');
    });
}

function videoStreaming320p()
{
    console.log(320 + " resolution");

    var cmd = 'ffmpeg';
                                         
    var args = [
        '-i', 
        'rtmp://172.104.55.76/'+commandArg[0]+'/'+commandArg[1],
        '-async',
        '1',
        '-vsync',
        '-1',

        '-c:v',
        'libx264',
        '-x264opts',
        'keyint=24:no-scenecut',
        '-c:a',
        'aac',
        '-max_muxing_queue_size',
        '4000',
        '-r',
        '30',
        '-b:v',
        '400k',
        '-profile:v',
        'high',
        '-b:a',
        '128k',
        '-vf',
        `scale=360:trunc(ow/a/2)*2`,
        '-tune',
        'zerolatency',
        '-preset',
        'veryfast',
        '-crf',
        '23',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'_360p.m3u8',

        '-c',
        'copy',
        '-f',
        'hls',
        '-hls_time',
        '1',
        '-hls_playlist_type',
        'event',
        '-hls_list_size',
        '10',
        '\/mnt\/hls\/'+commandArg[1]+'.m3u8'
    ];

    proc = spawn(cmd, args);

    proc.stdout.on('data', function(data)
    {
        try
        {
            process.nextTick(function()
            {
                updateDate = new Date().getTime();
            });

            data = data.toString();
            console.log(data);
        }
        catch(e)
        {
            console.log(e);
        }
    });

    proc.stderr.on('data', function(data)
    {
        console.log(data.toString());

        process.nextTick(function()
        {
            updateDate = new Date().getTime();
        });
    });

    proc.on('close', function()
    {
        console.log('finished');
    });
}

var cleanExit = function() { 
    fs.writeFileSync("./out.log","tried to kill process");
    process.exit() 
};
process.on('SIGINT', cleanExit); // catch ctrl-c
process.on('SIGTERM', cleanExit); // catch kill
