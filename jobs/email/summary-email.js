const Sendemail = require('sendemail');
const Event = require('../../models/osdi/event');
const zipcodes = require('zipcodes');
const _ = require('lodash');

require('../../lib/database'); // Has side effect of connecting to database

const upcomingEventsQuery = Event.find({start_date: {$gte: Date.now()}});
const PastDay = Date.now() - (24 * 60 * 60 * 1000);

upcomingEventsQuery
  .catch(function (err) { if (err) console.error(err); })
  .then(function (upcomingEvents) {
    const upcomingEventCount = upcomingEvents.length;
    const upcomingRSVPCount = _.sumBy(upcomingEvents, function (event) {
      return event.total_accepted;
    });
    const recentlyAddedEvents = upcomingEvents
      .filter(function (event) {
        return event.created_date &&
          event.created_date.getTime() > PastDay;
      });

    var stats = {
      email: 'arash.aghevli@gmail.com',
      subject: 'Resistance Calendar this week',
      recentlyAddedEvents: _.sortBy(recentlyAddedEvents, (e) => e.start_date),
      upcomingEventCount: upcomingEventCount,
      upcomingRSVPCount: upcomingRSVPCount
    };

    Sendemail.email('summary', stats, function (err, result) {
      if (err) return console.error(err);

      console.log(' - - - - - - - - - - - - - - - - - - - - -> email sent: ');
      console.log(result);
      console.log(' - - - - - - - - - - - - - - - - - - - - - - - - - - - -');
    });
  })
  .catch(function (err) { if (err) console.error(err); });

upcomingEventsQuery.exec();
