module.exports = {
  version: '1.0.0',
  init: (pluginContext) => {
    pluginContext.registerGatewayRoute((app) => {
      app.get('/gateway-info', (req, res) => {
        res.json({
          apiGateway: 'Express Gateway',
          version: '1.0.0',
          services: [
            { name: 'User Service', status: 'active', url: 'http://user-service:3001' },
            { name: 'Post Service', status: 'active', url: 'http://post-service:3002' },
            { name: 'Feed Service', status: 'active', url: 'http://feed-service:3003' }
          ]
        });
      });
    });
  }
};
