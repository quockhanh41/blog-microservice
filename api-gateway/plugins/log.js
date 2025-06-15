module.exports = {
  version: '1.0.0',
  policies: ['log'],
  init: (pluginContext) => {
    pluginContext.registerPolicy({
      name: 'log',
      policy: ({ message = '${req.method} ${req.originalUrl}' } = {}) => {
        return (req, res, next) => {
          const compiledMessage = message.replace(/\${([^}]*)}/g, (_, expr) => {
            try {
              const parts = expr.split('.');
              let val = req;
              for (const part of parts) {
                val = val[part];
              }
              return val;
            } catch (err) {
              return `[Error: ${err.message}]`;
            }
          });
          
          console.log(compiledMessage);
          next();
        };
      }
    });
  }
};
