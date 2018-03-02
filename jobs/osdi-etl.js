const Event = require('../models/osdi/event');
const request = require('request');

require('../lib/database'); // Has side effect of connecting to database

const importEvents = function () {
  const osdiEndpoint = 'https://map.justicedemocrats.com/api/events';
  console.log(`Loading ${osdiEndpoint}`);

  request({url: osdiEndpoint, encoding: null}, function (err, res, body) {
    if (err) {
      console.log(err);
      return;
    }

    const events = JSON.parse(body);
    events.forEach(function (osdiEventJson) {
      delete osdiEventJson.type;
      const location = osdiEventJson.location ? osdiEventJson.location.location : undefined;
      if (location) {
        location.type = 'Point';
        location.coordinates = [
          location.longitude,
          location.latitude
        ];
      }

      const osdiEvent = new Event(osdiEventJson);
      const query = { identifiers: { $in: [osdiEvent.identifiers[0]] } };

      // This funny bit of code is necessary to clear the existing _id from the
      // model since the id may not be deterministic at the time of model creation
      //
      // See http://stackoverflow.com/questions/31775150/node-js-mongodb-the-immutable-field-id-was-found-to-have-been-altered
      //
      var eventToUpdate = {};
      eventToUpdate = Object.assign(eventToUpdate, osdiEvent._doc);
      delete eventToUpdate._id;

      const options = {upsert: true, new: true};
      Event.findOneAndUpdate(query, eventToUpdate, options, function (err, doc) {
        if (err) {
          console.log(err);
          return;
        }
        console.log(`Successfully inserted ${doc.title}`);
      });
    });
  });
};

importEvents();
