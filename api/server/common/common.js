// In the name of God
'use strict';

const Common = {

    ServerCapabilities: { gpu: 'gpu', declink: 'declink' },
    JobType: { CPU: 'CPU', GPU: 'GPU' },
    JobStatus: {
        STOPPED: 'STOPPED',
        RUNNING: 'RUNNING',
        STARTING: 'STARTING',
        STOPPING: 'STOPPING',
        PAUSED: 'PAUSED'
    },
    Roles: {
        ADMIN: 'ADMIN',
        MONITORING: 'MONITORING',
        OPERATOR_L1: 'OPERATOR L1',
        OPERATOR_L2: 'OPERATOR L2'
    },
    Authorities: {
        CLEAR_LOGS: 'CLEAR_LOGS',
        CLEAR_TELEMETRIES: 'CLEAR_TELEMETRIES',
        CONTROL_JOBS: 'CONTROL_JOBS',
        CREATE_JOBS: 'CREATE_JOBS',
        CREATE_USERS: 'CREATE_USERS',
        VIEW_JOBS: 'VIEW_JOBS',
        VIEW_JOB_DETAIL: 'VIEW_JOB_DETAIL',
        VIEW_JOB_LOG: 'VIEW_JOB_LOG',
        VIEW_LOGS: 'VIEW_LOGS',
        VIEW_TELEMETRIES: 'VIEW_TELEMETRIES',
        VIEW_USERS: 'VIEW_USERS',
    },
    Events: {
        JOB_STATUS_CHANGED: 'job:status:changed',
        JOB_LOG: 'job:log',
        JOB_LOG_END: 'job:log:end'
    },

    formatBytesToString: (value) => {
        let oneGigValue = 1024 * 1024 * 1024;
        if (value >= oneGigValue)
            return `${(value / oneGigValue).toFixed(1)}GB`;
        let oneMegValue = 1024 * 1024;
        if (value >= oneMegValue)
            return `${(value / oneMegValue).toFixed(1)}MB`;
        let oneKValue = 1024;
        if (value >= oneKValue)
            return `${(value / oneKValue).toFixed(1)}KB`;
        return `${value}`;
    },
    convertBitRate: (value) => {
        let oneGigValue = 1000 * 1000 * 1000;
        if (value >= oneGigValue)
            return { 'v': (value / oneGigValue).toFixed(1), 'unit': 'Gbps' };
        let oneMegValue = 1000 * 1000;
        if (value >= oneMegValue)
            return { 'v': (value / oneMegValue).toFixed(1), 'unit': 'Mbps' };
        let oneKValue = 1000;
        if (value >= oneKValue)
            return { 'v': (value / oneKValue).toFixed(1), 'unit': 'Kbps' };
        return { 'v': value, 'unit': 'bps' };
    },
    convertToUnit: (value, unit) => {
        switch (unit) {
            case 'Gbps':
                return (value / (1000 * 1000 * 1000)).toFixed(1);
            case 'Mbps':
                return (value / (1000 * 1000)).toFixed(1);
            case 'Kbps':
                return (value / 1000).toFixed(1);
            default:
                return value;
        }
    },
    convertToBitRate: (value, unit) => {
        switch (unit) {
            case 'Gbps':
                return value * 1000 * 1000 * 1000;
            case 'Mbps':
                return value * 1000 * 1000;
            case 'Kbps':
                return value * 1000;
            default:
                return value;
        }
    },
};

export default Common;


