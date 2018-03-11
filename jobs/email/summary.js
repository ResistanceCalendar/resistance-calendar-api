const Sendemail = require('sendemail');
const Event = require('../../models/osdi/event');
const config = require('../../config.js');
const moment = require('moment');
const _ = require('lodash');

require('../../lib/database'); // Has side effect of connecting to database

const upcomingEventsQuery = Event.find({start_date: {$gte: Date.now()}});
const PastDay = Date.now() - (24 * 60 * 60 * 1000);
const UpcomingThreshold = Date.now() + (3 * 24 * 60 * 60 * 1000);

upcomingEventsQuery
  .catch(function (err) { if (err) console.error(err); })
  .then(function (rawUpcomingEvents) {
    const upcomingEvents = rawUpcomingEvents.map(function (event) {
      event.start_date_string = event.start_date ? moment(event.start_date).format('MMMM Do YYYY, h:mm:ss a') : undefined;
      return event;
    });

    const upcomingEventCount = upcomingEvents.length;
    const upcomingRSVPCount = _.sumBy(upcomingEvents, function (event) {
      return event.total_accepted;
    });
    const recentlyAddedEvents = upcomingEvents
      .filter(function (event) {
        return event.created_date &&
          event.created_date.getTime() > PastDay;
      });

    const eventsThisWeek = upcomingEvents.filter(function (event) {
      return event.start_date &&
        event.start_date.getTime() > Date.now() &&
        event.start_date.getTime() < UpcomingThreshold;
    });

    var stats = {
      email: config.emailAddress,
      subject: 'Resistance Calendar new and upcoming events',
      recentlyAddedEvents: _.sortBy(recentlyAddedEvents, (e) => e.start_date),
      upcomingEventCount: upcomingEventCount,
      upcomingRSVPCount: upcomingRSVPCount,
      upcomingEvents: _.sortBy(eventsThisWeek, (e) => e.start_date)
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
