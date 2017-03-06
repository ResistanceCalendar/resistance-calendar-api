Facebook = require('../../controllers/facebookController.js');

// TODO(aaghevli): Ensure this is not called outside of localhost
exports.register = function (server, options, next) {
    server.route([{
        method: 'GET',
        path:   '/facebook/events',
        config: {
            handler: Facebook.getEvents
        }
    }]);
   next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
