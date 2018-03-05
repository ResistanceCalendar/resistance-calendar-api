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
      Event.upsert(query, osdiEvent, function (err, doc) {
        if (err) return console.log(err);
        console.log(`Successfully inserted ${doc.title}`);
      });
    });
  });
};

importEvents();
