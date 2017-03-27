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
      const facebookId = osdiEvent.identifiers[0];
      const facebookEventName = osdiEvent.name + ' [' + facebookId + ']';

      // TODO(aaghevli): Make sure we pick the right id
      const query = { identifiers: { $in: [facebookId] } };
      Event.find(query, function (err, eventData) {
        if (err) {
          console.log('error finding ' + facebookEventName, err);
          throw new Error(err);
        }

        if (eventData.length === 0) {
          osdiEvent.save(function (err, data) {
            if (err) {
              console.log('error saving' + facebookEventName, err);
              throw new Error(err);
            }
            console.log('saved ' + facebookEventName);
          });
        } else {
          osdiEvent._id = eventData._id;
          Event.update(osdiEvent, function (err, raw) {
            if (err) {
              console.log('error updating ' + facebookEventName, err);
              throw new Error(err);
            }
            console.log('updated ' + facebookEventName);
          });
        }
      });
    });
    done();
  });
};
