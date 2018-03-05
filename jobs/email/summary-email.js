const Sendemail = require('sendemail');
const Event = require('../../models/osdi/event');

require('../../lib/database'); // Has side effect of connecting to database

const countQuery = Event.count({});
const missingLocationsQuery = Event.find({location: null});

Promise.all([countQuery, missingLocationsQuery]).then(function (values) {
  const eventCount = values[0];
  const eventsWithMissingLocations = values[1];

  var stats = {
    email: 'arash.aghevli@gmail.com',
    eventCount: eventCount,
    eventsWithMissingLocations: eventsWithMissingLocations,
    missingLocationCount: eventsWithMissingLocations.length,
    subject: 'Resistance Calendar this week'
  };

  Sendemail.email('welcome', stats, function (err, result) {
    if (err) return console.error(err);

    console.log(' - - - - - - - - - - - - - - - - - - - - -> email sent: ');
    console.log(result);
    console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
  });
});

countQuery.exec();
