// In the name of God
'use strict';

import { system, cpu, memLayout, currentLoad, mem as _mem, graphics, networkStats as _networkStats, fsSize, osInfo, versions } from 'systeminformation';
import NodeCache from "node-cache";
import JobController from './jobController.js';
import Common from '../common/common.js';
const cache = new NodeCache({ stdTTL: 5, useClones: false });

class SystemInfo {

    static async getServerCapabilities() {
        let caps = [];
        let gpu = await this.getGpuInfo();
        let jobTypes = await JobController.fetchAvailableJobTypes();
        if (gpu.name && jobTypes[1] === Common.JobType.GPU)
            caps.push(Common.ServerCapabilities.gpu);
        return caps;
    }

    static getVersion() {
        return '0.1'
    }

    static async getSoftwareInfo() {
        let os = await osInfo();
        let swVersions = await versions('node, docker');
        let info = {};
        info.Transcoder = SystemInfo.getVersion();
        info.os = os.distro + ' ' + os.release;
        info = { ...info, ...swVersions };
        return info;
    }

    static async getSystemInfo() {
        let info = await system();
        return info;
    }

    static async getCpuInfo() {
        let info = await cpu();
        return info;
    }

    static async getMemoryInfo() {
        let info = await memLayout();
        return info;
    }

    static async getCpuLoad() {
        let info = cache.get("cpuload");
        if (!info) {
            info = await currentLoad();
            cache.set("cpuload", info)
        }
        return info;
    }

    static async getMemoryLoad() {
        let info = cache.get("memoryLoad");
        if (!info) {
            info = await _mem();
            cache.set("memoryLoad", info);
        }
        return info;
    }

    static async getGpuInfo() {
        let info = cache.get("gpu");
        if (!info) {
            info = await graphics();
            cache.set("gpu", info)
        }
        return info;
    }

    static async getNetworkInfo() {
        // Network
        const networkInfo = {}
        let networkStats = await _networkStats();
        // networkInfo.networkRx = (networkStats[0].rx_sec).toFixed(2);
        // networkInfo.networkTx = (networkStats[0].tx_sec).toFixed(2);
        networkInfo.networkRx = networkStats[0].rx_sec;
        networkInfo.networkTx = networkStats[0].tx_sec;
        return networkInfo;
    }

    static async getSummary() {
        const summary = {};
        //Memory
        let mem = await this.getMemoryLoad();
        summary.activeMmemory = mem.active;
        summary.totalMmemory = mem.total;
        summary.memory = (mem.active / mem.total * 100).toFixed(2);
        //CPU
        let load = await this.getCpuLoad();
        summary.cpu = load.currentLoad;
        if (summary.cpu)
            summary.cpu = summary.cpu.toFixed(2);
        // Disk
        let diskInfo = await fsSize();
        summary.disk = diskInfo[0].use;
        return summary;
    }

    static async getMetrics() {
        const metrics = {};
        //Memory
        let mem = await this.getMemoryLoad();
        metrics.memory = {};
        metrics.memory.active = mem.active;
        metrics.memory.total = mem.total;
        metrics.memory.free = mem.free;
        //CPU
        metrics.cpu = {};
        let load = await this.getCpuLoad();
        metrics.cpu.usage = load.currentLoad.toFixed(2);
        metrics.cpu.system = load.currentLoadSystem.toFixed(2);
        // Disk
        metrics.disk = {};
        let diskInfo = await fsSize();
        metrics.disk.usage = diskInfo[0].use;
        // Network
        let network = await this.getNetworkInfo();
        metrics.network = {}
        metrics.network.rx = network.networkRx;
        metrics.network.tx = network.networkTx;
        //GPU
        let gpu = await this.getGpuInfo();
        metrics.gpu = {}
        if (gpu.controllers)
            for (const controller of gpu.controllers) {
                if (controller.name) {
                    metrics.gpu[`${controller.name}_gpu`] = controller.utilizationGpu;
                    metrics.gpu[`${controller.name}_memory`] = controller.utilizationMemory;
                }
            }

        return metrics;
    }


}

export default SystemInfo;