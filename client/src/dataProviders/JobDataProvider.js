// In the name of God

const jobApi = {
    // start job
    startJob: async (jobId) => {
        const request = new Request(`/api/jobs/${jobId}/start`, {
            method: 'POST',
        });
        const response = await fetch(request);
        if (response.status < 200 || response.status >= 400) {
            throw new Error(response.status);
        }
        return await response.json();
    },
    stopJob: async (jobId) => {
        const request = new Request(`/api/jobs/${jobId}/stop`, {
            method: 'POST',
        });
        const response = await fetch(request);
        if (response.status < 200 || response.status >= 400) {
            throw new Error(response.status);
        }
        return await response.json();
    },
    fetchLog: async (jobId, callBack) => {
        const request = new Request(`/api/jobs/${jobId}/logs`, {
            method: 'GET',
        });
        const response = await fetch(request);
        if (response.status < 200 || response.status >= 400) {
            throw new Error(response.status);
        }
        return response.body.getReader();

    },
    attach: async (jobId) => {
        const request = new Request(`/api/jobs/${jobId}/attach`, {
            method: 'POST',
        });
        const response = await fetch(request);
        if (response.status < 200 || response.status >= 400) {
            throw new Error(response.status);
        }
        return response.body.getReader();

    },
    detach: async (jobId) => {
        const request = new Request(`/api/jobs/${jobId}/detach`, {
            method: 'POST',
        });
        const response = await fetch(request);
        if (response.status < 200 || response.status >= 400) {
            throw new Error(response.status);
        }
        return;

    },
}

export default jobApi;