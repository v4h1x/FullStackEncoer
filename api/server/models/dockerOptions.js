// In the name of God
'use strict';
import { readdirSync } from 'fs';
import Common from '../common/common.js';
import { parseArgsStringToArgv } from 'string-argv';

const CPU_IMAGE_NAME = 'irib/ffmpeg:5-ubuntu-decklink';
const GPU_IMAGE_NAME = 'irib/ffmpeg:5-nvidia-decklink';

const getImageName = (jobType) => {
    switch (jobType) {
        case Common.JobType.CPU:
            return CPU_IMAGE_NAME;
        case Common.JobType.GPU:
            return GPU_IMAGE_NAME;
    }
};

const createDockerCommand = (job) => {

    return parseArgsStringToArgv(job.command);

    // return job.command.getCommandArray();
    // 
    // switch (jobType) {
    //     case Common.JobType.CPU:
    //         return ['-y', '-hide_banner', //'-loglevel', 'error', //'-v', 'quiet', 
    //             '-fflags', 'genpts+nobuffer', '-start_at_zero', '-copyts', '-copytb', '1', '-f', 'mpegts',
    //             // '-fifo_size', '229376', 
    //             // '-stream_loop', '-1', 
    //             '-i', inputAddress, '-c:v', 'h264', '-an', '-sn',
    //             '-map', '0:v', '-f', 'fifo', '-fifo_format', 'mpegts', '-drop_pkts_on_overflow', '1',
    //             '-attempt_recovery', '1', '-restart_with_keyframe', '1',
    //             '-timeshift', '' + delay,
    //             // '-vf', 'tpad=start_duration=' + delay,
    //             '-queue_size', '8000', '-format_opts', 'mpegts_copyts=1:pkt_size=1316:bitrate=' + bandwidth, outputAddress];
    //     case Common.JobType.GPU:
    //         return ['-y', '-hide_banner', //'-loglevel', 'error', //'-v', 'quiet', 
    //             '-hwaccel', 'nvdec',
    //             '-fflags', 'genpts+nobuffer', '-start_at_zero', '-copyts', '-copytb', '1', '-f', 'mpegts',
    //             // '-fifo_size', '229376', 
    //             // '-stream_loop', '-1', 
    //             '-i', inputAddress, '-c:v', 'h264', '-an', '-sn',
    //             '-map', '0:v', '-f', 'fifo', '-fifo_format', 'mpegts', '-drop_pkts_on_overflow', '1',
    //             '-attempt_recovery', '1', '-restart_with_keyframe', '1',
    //             '-timeshift', '' + delay,
    //             // '-vf', 'tpad=start_duration=' + delay,
    //             '-queue_size', '8000', '-format_opts', 'mpegts_copyts=1:pkt_size=1316:bitrate=' + bandwidth, outputAddress];
    // }
};

const getContainerOptions = (job) => {
    let files = readdirSync('/dev/blackmagic/');
    let devices = [{
        "PathOnHost": "/dev/sda",
        "PathInContainer": "/dev/sda",
        "CgroupPermissions": "r"
    }];
    files.forEach(f => {
        devices.push({
            "PathOnHost": "/dev/blackmagic/" + f,
            "PathInContainer": "/dev/blackmagic/" + f,
            "CgroupPermissions": "rwm"
        })
    });

    let options = {
        Image: getImageName(job.type),
        // TODO for now network is set to host but in future 
        // it can be replaced by a more accurate method
        HostConfig: {
            AutoRemove: false,
            NetworkMode: 'host',
            Binds: ['/run/udev:/run/udev'],
            Devices: devices,
            RestartPolicy: {
                Name: "unless-stopped",
                MaximumRetryCount: 0
            },
            LogConfig: {
                Type: "json-file",
                Config: {
                    "max-size": "20m",
                    "max-file": "5"
                }
            },
        },
        Cmd: createDockerCommand(job),
        name: job.name
    };
    if (job.type === Common.JobType.GPU)
        options.HostConfig.Runtime = 'nvidia';
    return options;
};

export const DockerOptions = {
    ImageNames: { CPU: CPU_IMAGE_NAME, GPU: GPU_IMAGE_NAME },
    getImageName: getImageName,
    createDockerCommand: createDockerCommand,
    getContainerOptions: getContainerOptions
};
