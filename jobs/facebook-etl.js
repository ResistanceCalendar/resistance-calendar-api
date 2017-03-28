const Event = require('../models/osdi/event');
const Facebook = require('../lib/facebook');
require('../lib/database'); // Has side effect of connecting to database

module.exports = function (job, done) {
  Facebook.getAllOSDIEvents(function (err, res) {
    if (err) handleError('fetching facebook events', err);
    res.forEach(saveOrUpdate);
    done();
  });
};

const handleError = function (err, str) {
  console.log(str, err);
  throw new Error(err);
};

const saveOrUpdate = function (osdiEvent) {
  const facebookId = osdiEvent.identifiers.find(function (id) {
    return id.startsWith('facebook:');
  });

  if (facebookId === undefined) {
    const err = 'no facebook id found ' + osdiEvent.name;
    handleError(err, err);
  } else {
    const facebookEventName = osdiEvent.name + ' [' + facebookId + ']';
    const query = { identifiers: { $in: [facebookId] } };
    Event.find(query, function (err, eventData) {
      if (err) handleError('error finding ' + facebookEventName, err);
      if (eventData.length === 0) {
        osdiEvent.save(function (err, data) {
          if (err) handleError('error saving' + facebookEventName, err);
          console.log('saved ' + facebookEventName);
        });
      } else {
        osdiEvent._id = eventData._id;
        Event.update(osdiEvent, function (err, raw) {
          if (err) handleError('error updating ' + facebookEventName, err);
          console.log('updated ' + facebookEventName);
        });
      }
    });
  }
};
