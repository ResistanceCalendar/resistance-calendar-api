const Facebook = require('../lib/facebook');
require('../lib/database'); // Has side effect of connecting to database

module.exports = function (job, done) {
  Facebook.getOSDIEvents(function (err, res) {
    if (err) {
      console.error(err);
      return;
    }

    const osdiEvents = res;

    osdiEvents.forEach(function (osdiEvent) {
      console.log('Saving ' + osdiEvent.name);
      osdiEvent.save(function (err, data) {
        if (err) {
          console.log('error saving' + osdiEvent.name, err);
          throw new Error(err);
        }
        console.log('saved ' + data.name);
      });
    });
    console.log('done!');
    done();
  });
};
