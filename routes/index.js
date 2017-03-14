const Facebook = require('./handlers/facebook');
const Event = require('./handlers/event');
const Location = require('./handlers/location');

exports.register = (plugin, options, next) => {
  plugin.route([
    { method: 'GET', path: '/facebook/events', config: Facebook.events },
    { method: 'POST', path: '/events', config: Event.create },
    { method: 'POST', path: '/location', config: Location.create },
  ]);
  next();
};

exports.register.attributes = {
  name: 'api'
};
