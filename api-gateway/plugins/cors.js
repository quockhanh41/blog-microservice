module.exports = {
  version: '1.0.0',
  policies: ['cors'],
  init: (pluginContext) => {
    pluginContext.registerPolicy({
      name: 'cors',
      policy: ({ origin = '*', methods = 'GET,POST,PUT,DELETE', allowedHeaders = 'Content-Type,Authorization', preflightContinue = false } = {}) => {
        return (req, res, next) => {
          res.setHeader('Access-Control-Allow-Origin', origin);
          res.setHeader('Access-Control-Allow-Methods', methods);
          res.setHeader('Access-Control-Allow-Headers', allowedHeaders);
          
          if (req.method === 'OPTIONS') {
            if (!preflightContinue) {
              res.status(204).end();
              return;
            }
          }
          
          next();
        };
      }
    });
  }
};
