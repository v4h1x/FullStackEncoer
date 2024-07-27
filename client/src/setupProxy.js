const { createProxyMiddleware } = require('http-proxy-middleware');

module.exports = function (app) {
    app.use(
        '/api/users',
        createProxyMiddleware({
            target: 'http://localhost:3001',
        })
    );
    app.use(
        '/api/jobs',
        createProxyMiddleware({
            target: 'http://localhost:3001',
        })
    );
    app.use(
        '/api/auth',
        createProxyMiddleware({
            target: 'http://localhost:3001',
        })
    );
    app.use(
        '/api/system',
        createProxyMiddleware({
            target: 'http://localhost:3001',
        })
    );
    app.use(
        '/api/telemetry',
        createProxyMiddleware({
            target: 'http://localhost:3001',
        })
    );
    app.use(
        '/api/logs',
        createProxyMiddleware({
            target: 'http://localhost:3001',
        })
    );
    app.use(
        '/socket/',
        createProxyMiddleware({
            target: 'http://localhost:3001',
            // ws: true,
            // changeOrigin: true,
            logLevel: 'debug',
        }),
    );
};