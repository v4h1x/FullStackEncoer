// In the name of God

const systemInfoApi = {

    resources: {cpu: 'cpu', cpuLoad:'cpu/load', network:'network', memory:'memory', memoryLoad:'memory/load', summary:'summary', system:'', gpu:'gpu', software:'/software'},

    fetchInfo : async (resource) => {
        const request = new Request(`/api/system/${resource}`, {
            method: 'GET',
        });
        const response = await fetch(request);
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.status);
        }
        return await response.json();
    }
}

export default systemInfoApi;