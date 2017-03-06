facebookController = require('../../controllers/facebookController.js');
console.log(facebookController)
console.log(facebookController.getEvents)

// TODO(aaghevli): Ensure this is not called outside of localhost
exports.register = function (server, options, next) {
    const facebookCtrlObj = new facebookController();
    server.route([{
        method: 'GET',
        path:   '/facebook/events',
        config: {
            handler: facebookCtrlObj.getEvents
        }
    }]);
   next();
};

exports.register.attributes = {
  pkg: require('./package.json')
};
