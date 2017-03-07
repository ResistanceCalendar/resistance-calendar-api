const Facebook = require('./handlers/facebook');

exports.register = (plugin, options, next) => {
  plugin.route([
    { method: 'GET', path: '/facebook/events', config: Facebook.events }
  ]);
  next();
};

exports.register.attributes = {
  name: 'api'
};
