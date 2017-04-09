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

  if (facebookId) {
    const facebookEventName = osdiEvent.name + ' [' + facebookId + ']';
    const query = { identifiers: { $in: [facebookId] } };

    // This funny bit of code is necessary to clear the existing _id from the
    // model since the id may not be deterministic at the time of model creation
    //
    // See http://stackoverflow.com/questions/31775150/node-js-mongodb-the-immutable-field-id-was-found-to-have-been-altered
    //
    var eventToUpdate = {};
    eventToUpdate = Object.assign(eventToUpdate, osdiEvent._doc);
    delete eventToUpdate._id;

    Event.findOneAndUpdate(query, eventToUpdate, {upsert: true}, function (err, doc) {
      if (err) handleError(err);
      console.log('upserted ' + facebookEventName);
    });
  } else {
    const err = 'no facebook id found ' + osdiEvent.name;
    handleError(err, err);
  }
};
