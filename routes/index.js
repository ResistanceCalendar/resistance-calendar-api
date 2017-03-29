const Facebook = require('./handlers/facebook');
const Event = require('./handlers/event');
const moment = require('moment');

/**
 * Setting up caching via help from the following article:
 *   http://vawks.com/blog/2014/03/15/caching-with-hapi/
 *
 * All times in ms:
 *  expiresIn - relative expiration since the item was saved in the cache
 *  staleIn - mark an item stored in cache as stale and attempt to regenerate
 *  staleTimeout - wait before returning a stale value while generateFunc is
 *                 generating a fresh value.
 *  generateTimeout - wait before returning a timeout error when the
 *                    generateFunc function takes too long to return a value
 */

exports.register = (plugin, options, next) => {
  plugin.method('getFacebookEvents', Facebook.events, {
    cache: {
      expiresIn: moment.duration(5, 'minute').asMilliseconds(),
      staleIn: moment.duration(1, 'minute').asMilliseconds(),
      staleTimeout: 100,
      generateTimeout: moment.duration(2, 'seconds').asMilliseconds()
    },
    generateKey: function (opts) {
      return JSON.stringify(opts);
    }
  });

  plugin.route([
    createRoute('GET', '/facebook/events', plugin.methods.getFacebookEvents),
    { method: 'POST', path: '/events', config: Event.create }
  ]);
  next();
};

exports.register.attributes = {
  name: 'api'
};

const createRoute = function (method, path, serverMethod) {
  return {
    method: method,
    path: path,
    handler: function (request, reply) {
      serverMethod(request.query, function (error, result) {
        reply(error || result);
      });
    }
  };
};
