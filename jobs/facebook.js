const Facebook = require('../lib/facebook');
const moment = require('moment');

module.exports = function (agenda) {
  agenda.define('facebook-auth', function (job, done) {
    Facebook.extendAccessToken(function (err, res) {
      if (err) {
        console.log(err);
        throw err;
      }
      const extension = moment.duration(res.expires_in, 'seconds').days();
      console.log('Facebook access token extended for ' + extension + ' days');
    });
  });
};
