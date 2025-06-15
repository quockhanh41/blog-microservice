module.exports = {
  version: '1.0.0',
  policies: ['rate-limit'],
  init: (pluginContext) => {
    pluginContext.registerPolicy({
      name: 'rate-limit',
      policy: ({ windowMs = 60 * 1000, max = 100, message = 'Too many requests, please try again later.' } = {}) => {
        const requests = new Map();
        
        return (req, res, next) => {
          const ip = req.ip || req.connection.remoteAddress;
          const now = Date.now();
          
          if (!requests.has(ip)) {
            requests.set(ip, []);
          }
          
          const requestTimes = requests.get(ip);
          
          // Remove expired requests
          const validRequestTimes = requestTimes.filter(time => now - time < windowMs);
          requests.set(ip, validRequestTimes);
          
          if (validRequestTimes.length >= max) {
            res.status(429).send(message);
            return;
          }
          
          // Add current request time
          validRequestTimes.push(now);
          requests.set(ip, validRequestTimes);
          
          next();
        };
      }
    });
  }
};
