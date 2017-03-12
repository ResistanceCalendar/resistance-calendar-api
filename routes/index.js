const Facebook = require('./handlers/facebook');
const Event = require('./handlers/event');

exports.register = (plugin, options, next) => {
  plugin.route([
    { method: 'GET', path: '/facebook/events', config: Facebook.events },
    { method: 'POST', path: '/events', config: Event.create }
  ]);
  next();
};

exports.register.attributes = {
  name: 'api'
};
