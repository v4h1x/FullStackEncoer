// In the name of God
import { stringify } from 'query-string';

const telemetryApi = {

    categories: { cpu: 'cpu', memory: 'memory', network: 'network', disk: 'disk', gpu: 'gpu' },

    fetchMetrics: async (start, end, categories, group) => {
        const query = {
            end: JSON.stringify(end),
            category: categories,
        };
        if (start)
            query.start = JSON.stringify(start);
        if (group)
            query.group = group;
        const request = new Request(`/api/telemetry/?${stringify(query)}`, {
            method: 'GET',
        });
        const response = await fetch(request);
        if (response.status < 200 || response.status >= 300) {
            throw new Error(response.status);
        }
        return await response.json();
    }
}

export default telemetryApi;