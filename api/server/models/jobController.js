// In the name of God

import Common from '../common/common.js';
import { DockerOptions } from './dockerOptions.js';
import Docker from 'dockerode';
var docker = new Docker();
import { PassThrough, Readable } from 'stream';
import { xml2js } from 'xml-js';
import pkg from 'child_process';
const exec = pkg.exec;

const jobStats = {};
const jobPids = {};
const jobStreams = {};

// docker.getEvents({}, function (err, data) {
//     if (err) {
//         console.log(err.message);
//     } else {
//         data.on('data', function (chunk) {
//             console.log(JSON.parse(chunk.toString('utf8')));
//         });
//     }
// });

const jobExists = async (job) => {
    let c = docker.getContainer(job.name);
    return new Promise((resolve) => {
        c.stats({ stream: false }, function (error, data) {
            if (error)
                resolve(false);
            resolve(true);
        })
    });
};

const parseOutput = (stream, job) => {
    if (!jobStats[job.name])
        jobStats[job.name] = {};
    stream.on('data', function (chunk) {
        if (jobStreams[job.name])
            jobStreams[job.name].write(chunk);

        let c = chunk.toString('utf8');
        let lines = c.match(/[^\r\n]+/g);
        lines.forEach(line => {
            let index = line.indexOf('frame=');
            if (index >= 0) {
                for (let pair of line.substring(index).match(/[a-z]*= *[^ ]*/g)) {
                    if (jobStats[job.name]) {
                        let kv = pair.split('=');
                        jobStats[job.name][kv[0]] = kv[1].trim();
                    }
                }
            }
            // else {
            //     if (jobStreams[job.name])
            //         jobStreams[job.name].write(line);
            // }
        });
    })
}
const JobController = {

    fetchAvailableDeckLinkInputs: () => {
        return new Promise((resolve, reject) => {
            let job = { command: '-sources decklink -hide_banner', type: Common.JobType.CPU };
            let options = DockerOptions.getContainerOptions(job);
            options.HostConfig.AutoRemove = true;
            options.HostConfig.RestartPolicy.Name = "";
            options.AttachStdout = true;
            options.AttachStderr = true;
            options.Tty = true;
            docker.run(DockerOptions.getImageName(Common.JobType.CPU),
                ['-sources', 'decklink', '-hide_banner'],
                null, options,
                function (err) {
                    if (err) {
                        reject(err);
                        return;
                    }
                })
                .on('stream', s => {
                    s.on('data', function (chunk) {
                        let c = chunk.toString('utf8');
                        if (!c.startsWith('Auto-detected')) {
                            let lines = c.match(/[^\r\n]+/g);
                            let inputs = [];
                            lines.forEach(line => {
                                let i1 = line.indexOf('[');
                                let i2 = line.indexOf(']');
                                inputs.push(line.substring(i1 + 1, i2));
                            });
                            resolve(inputs);

                        }
                    })

                });
        });
    },

    fetchAvailableJobTypes: async () => {
        let promise = new Promise((resolve, reject) => {
            let image = docker.getImage(DockerOptions.ImageNames.GPU);
            if (image)
                resolve([Common.JobType.CPU, Common.JobType.GPU]);
            resolve([Common.JobType.CPU]);
        });
        return promise;
    },

    fetchGpuMemUsage: async () => {

        return new Promise((resolve) => {
            // shell out
            exec('nvidia-smi -q -x', function (err, stdout, stderr) {

                // handle errors
                if (err) {
                    return callback(err);
                }
                if (stderr) {
                    return callback(stderr);
                }

                // XML parser options
                const options = {
                    explicitArray: false,
                    trim: true,
                };

                // restructure the XML into json
                let data = xml2js(stdout, { compact: true, nativeType: true });

                // return the data
                let allProcess = data.nvidia_smi_log.gpu.processes.process_info;
                allProcess.forEach(processInfo => {
                    let jobName = jobPids[processInfo['pid']['_text']];
                    if (jobName)
                        jobStats[jobName]['gpu'] = processInfo['used_memory']['_text'];
                });
                resolve();
            });
        });
    },

    fetchJobStats: async (job) => {

        if (job.status === Common.JobStatus.STOPPED)
            return Promise.resolve(job);
        let c = docker.getContainer(job.name);
        return c.stats({ stream: false })
            .then(data => new Promise(resolve => {
                if (!job.stats)
                    job.stats = { ...jobStats[job.name] };
                if (data.cpu_stats) {
                    const cpuDelta = data.cpu_stats.cpu_usage.total_usage - data.precpu_stats.cpu_usage.total_usage;
                    const systemDelta = data.cpu_stats.system_cpu_usage - data.precpu_stats.system_cpu_usage;
                    const number_cpus = data.cpu_stats.online_cpus;
                    const usage = (cpuDelta / systemDelta) * number_cpus;
                    job.stats.cpu = usage ? (usage * 100.0).toFixed(2) : null;
                }
                if (data.memory_stats && data.memory_stats.usage)
                    job.stats.memory = Common.formatBytesToString(data.memory_stats.usage); // + ' / ' + Common.formatBytesToString(data.memory_stats.limit)

                resolve(job);
            }))
            .catch(error => job);
    },

    fetchJobStatus: async (job) => {
        let c = docker.getContainer(job.name);
        return c.inspect()
            .then(data => data.State.Status === 'running' ? Common.JobStatus.RUNNING : Common.JobStatus.STOPPED)
            .catch(error => Common.JobStatus.STOPPED)
    },

    attach: (job) => {
        return new Promise((resolve, reject) => {
            if (!jobStreams[job.name]) {
                jobStreams[job.name] = new PassThrough();
                jobStreams[job.name].on('close', () => {
                    jobStreams[job.name] = null;
                })
                jobStreams[job.name].on('end', () => {
                    jobStreams[job.name] = null;
                })
                jobStreams[job.name].on('finish', () => {
                    jobStreams[job.name] = null;
                })
                jobStreams[job.name].on('unpipe', () => {
                    jobStreams[job.name] = null;
                })
                jobStreams[job.name].on('error', error => console.log(error));

            }
            return resolve(jobStreams[job.name]);
        });
    },

    detach: (job) => {
        return new Promise((resolve, reject) => {
            if (jobStreams[job.name]) {
                let s = jobStreams[job.name];
                jobStreams[job.name] = null;
                s.end();
            }
            return resolve();
        });
    },

    fetchLogStream: (job) => {

        let container = docker.getContainer(job.name);

        return container.logs({
            follow: false,
            stdout: true,
            stderr: true,
            timestamps: false
        })
            .then(buffer => new Promise((resolve) => {
                let logStream = Readable.from(buffer);
                resolve(logStream);
            }));
    },

    fetchLog: (job) => {

        let container = docker.getContainer(job.name);

        return container.logs({
            follow: false,
            stdout: true,
            stderr: true,
            timestamps: true
        });
    },

    start: async (job, runCallback, stopCallback, errorHandler) => {
        let options = DockerOptions.getContainerOptions(job);

        var containerc;
        return jobExists(job)
            .then(exists => exists ? new Promise((resolve) => resolve(docker.getContainer(job.name))) :
                docker.createContainer(options))
            .then(container => {
                containerc = container;
                return container.attach({ stream: true, stdout: true, stderr: true })
            })
            .then(stream => {
                parseOutput(stream, job);
                return containerc.start()
            })
            .then(data => {
                runCallback(job);
                return containerc.top()
            })
            .then((data) => {
                jobPids[data.Processes[0][1]] = job.name;
                return containerc.wait();
            })
            .then(data => new Promise((resolve) => {
                stopCallback(job);
                resolve();
            }))
            .catch(error => errorHandler(error));
    },
    stop: (job) => {
        let container = docker.getContainer(job.name);
        jobStats[job.name] = null;
        return container.stop();
    },
    delete: async (job) => {
        return jobExists(job)
            .then(exists => exists ? docker.getContainer(job.name).remove() : Promise.resolve());
    },
    attachForOutput: async (job) => {
        let container = docker.getContainer(job.name);
        return container.attach({ stream: true, stdout: true, stderr: true })
            .then(stream => {
                parseOutput(stream, job);
                return Promise.resolve();
            });
    },
    getParentPid: async (job) => {
        let container = docker.getContainer(job.name);
        return container.top()
            .then(data => jobPids[data.Processes[0][1]] = job.name)
    }
};

export default JobController;
