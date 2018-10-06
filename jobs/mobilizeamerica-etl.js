const Event = require('../models/osdi/event');
const request = require('request');
const image = require('../lib/image');

require('../lib/database'); // Has side effect of connecting to database

const importEvents = function (endpoint) {
  console.log(`Loading ${endpoint}`);

  request({url: endpoint, encoding: null}, function (err, res, body) {
    if (err) {
      console.log(err);
      return;
    }

    const now = new Date().getTime();

    const osdi = JSON.parse(body);
    osdi.data.forEach(function (osdiEventJson) {
      // TODO: Add image caching support
      delete osdiEventJson.type;
      delete osdiEventJson.created_date;
      delete osdiEventJson.modified_date;

      const location = osdiEventJson.location ? osdiEventJson.location.location : undefined;

      if (location && !location.longitude) delete location.longitude;
      if (location && !location.latitude) delete location.latitude;

      if (location && location.longitude && location.latitude) {
        location.type = 'Point';
        location.coordinates = [
          location.longitude,
          location.latitude
        ];
      }

      if (!osdiEventJson.name) {
        osdiEventJson.name = osdiEventJson.title;
      }

      if (osdiEventJson.timeslots) {
        const individualEvents = osdiEventJson.timeslots.map(function (timeslot) {
          const copy = Object.assign(osdiEventJson);
          copy.origin_system = 'mobilizeamerica';
          copy.start_date = new Date(timeslot.start_date * 1000);
          copy.end_date = new Date(timeslot.end_date * 1000);

          if (now < copy.start_date.getTime()) {
            const id = `mobilizeamerica:${copy.id}${timeslot.id}`;
            copy.identifiers = [id];
            return new Event(osdiEventJson);
          } else return undefined;
        }).filter(function (e) {
          return e;
        });

        if (individualEvents.length !== 0) {
          const imagePath = `mobilizeamerica/${osdiEventJson.id}`;
          const imageUrl = osdiEventJson.featured_image_url;
          image.cacheImage(`mobilizeamerica:${osdiEventJson.id}`, imagePath, imageUrl, function (err, imageUrl) {
            // Don't throw on error for now
            if (err) console.log('updating image for event', err);

            individualEvents.forEach(function (event) {
              event.featured_image_url = imageUrl;
              const query = { identifiers: { $in: event.identifiers } };
              Event.upsert(query, event, function (err, doc) {
                if (err) handleError(err, 'upserting event');
                console.log(`Successfully inserted ${doc.title}`);
              });
            });
          });
        }
      }
    });

    if (osdi.next) {
      importEvents(osdi.next);
    }
  });
};

const handleError = function (err, str) {
  console.log(str, err);
  throw new Error(err);
};

importEvents('https://events.mobilizeamerica.io/api/v1/events');
