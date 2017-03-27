const Event = require('../models/osdi/event');
const Facebook = require('../lib/facebook');
require('../lib/database'); // Has side effect of connecting to database

module.exports = function (job, done) {
  Facebook.getOSDIEvents({per_page: 1}, function (err, res) {
    if (err) {
      console.error(err);
      return;
    }

    const osdiEvents = res;

    osdiEvents.forEach(function (osdiEvent) {
      console.log('Saving ' + osdiEvent.name + ' (' + osdiEvent.identifiers[0] + ')');

      // TODO(aaghevli): Make sure we pick the right id
      const query = { identifiers: { $in: [osdiEvent.identifiers[0]] } };
      Event.find(query, function (err, eventData) {
        if (err) {
          console.log('error finding ' + osdiEvent.name, err);
          throw new Error(err);
        }

        if (eventData.length === 0) {
          osdiEvent.save(function (err, data) {
            if (err) {
              console.log('error saving' + osdiEvent.name, err);
              throw new Error(err);
            }
            console.log('saved ' + data.name);
          });
        } else {
          osdiEvent._id = eventData._id;
          Event.update(osdiEvent, function (err, raw) {
            if (err) {
              console.log('error updating ' + osdiEvent.name, err);
              throw new Error(err);
            }
            console.log('updated ' + osdiEvent.name);
          });
        }
      });
    });
    done();
  });
};
