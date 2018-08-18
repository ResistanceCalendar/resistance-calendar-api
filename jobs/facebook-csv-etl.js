const Event = require('../models/osdi/event');
const Facebook = require('../lib/facebook');

require('../lib/database'); // Has side effect of connecting to database

const importEvents = function () {
  const csvFile = 'resource/fb_events_test.csv';
  console.log(`Loading ${csvFile}`);

  Facebook.importFacebookCsv('resource/fb_events_issues.csv', function (err, osdiEvents) {
    if (err) {
      console.log(err);
      return;
    }

    osdiEvents.forEach(function (osdiEvent) {
      const query = { identifiers: { $in: [osdiEvent.identifiers[0]] } };
      Event.upsert(query, osdiEvent, function (err, doc) {
        if (err) return console.log(err);
        console.log(`Successfully inserted ${doc.title}`);
      });
    });
  });
};

importEvents();
