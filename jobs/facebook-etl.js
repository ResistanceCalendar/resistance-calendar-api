const Event = require('../models/osdi/event');
const Facebook = require('../lib/facebook');
require('../lib/database'); // Has side effect of connecting to database

module.exports = function (job, done) {
  Facebook.getAllFacebookEvents(function (err, res) {
    if (err) handleError('fetching facebook events', err);
    const osdiEvents = res.map(Facebook.toOSDIEvent);
    const coverImages = res.map(function (facebookEvent) {
      console.log(JSON.stringify(facebookEvent));
      return facebookEvent.cover;
    });
    console.log(JSON.stringify(coverImages));
    osdiEvents.forEach(saveOrUpdateEvent);
  }, 1);
};

const handleError = function (err, str) {
  console.log(str, err);
  throw new Error(err);
};

const saveOrUpdateEvent = function (osdiEvent) {
  const facebookId = osdiEvent.identifiers.find(function (id) {
    return id.startsWith('facebook:');
  });

  if (facebookId) {
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
  } else {
    const err = 'no facebook id found ' + osdiEvent.name;
    handleError(err, err);
  }
};
