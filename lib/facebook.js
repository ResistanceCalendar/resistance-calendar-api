'use strict';

const FB = require('fbgraph');
const Event = require('../models/osdi/event');
const Location = require('../models/osdi/location');
const FB_EVENT_FIELDS_STRING = [
  'id', 'name', 'description', 'start_time', 'end_time', 'place',
  'attending_count', 'interested_count', 'can_guests_invite'
].join(',');

FB.setVersion(process.env.FB_GRAPH_API_VERSION || '2.8');
FB.setAccessToken(process.env.FB_GRAPH_API_TOKEN);

/**
 * Example:
 *  Facebook.getOSDIEvents(options, function(err, res) {...})
 *
 *  Supported opts:
 *   - per_page: specifies how many results to return per page.
 */
module.exports.getOSDIEvents = function (opts, callback) {
  var params = {
    fields: FB_EVENT_FIELDS_STRING,
    limit: opts.per_page
  };
  FB.get('resistance-calendar/events', params, function (err, res) {
    if (err) {
      callback(err);
      return;
    }

    try {
      const facebookEvents = res.data;
      const osdiEvents = facebookEvents.map(toOSDIEvent);
      osdiEvents.forEach(function (osdiEvent) {
        osdiEvent.save()
          .catch(function (err) {
            throw new Error(err);
          });
      });
      callback(err, osdiEvents);
    } catch (err) {
      callback(err);
    }
  });
};

function toOSDIEvent (facebookEvent) {
  const identifier = 'facebook:' + facebookEvent.id;
  const originSystem = 'Facebook';
  const createdDate = new Date();
  const modifiedDate = new Date();

  var location;
  if (facebookEvent.place && facebookEvent.place.location) {
    const facebookEventLocation = facebookEvent.place.location;
    location = new Location({
      identifiers: [identifier],
      created_date: createdDate,
      modified_date: modifiedDate,
      origin_system: originSystem,
      venue: facebookEvent.place.name,
      address_lines: [
        facebookEventLocation.street
      ],
      locality: facebookEventLocation.city,
      region: facebookEventLocation.state,
      postal_code: facebookEventLocation.zip,
      location: {
        coordinates: [
          facebookEventLocation.latitude,
          facebookEventLocation.longitude
        ]
      }
    });
  }

  return new Event({
    identifiers: [identifier],
    created_date: createdDate,
    modified_date: modifiedDate,
    origin_system: originSystem,
    name: facebookEvent.name,
    title: facebookEvent.name,
    description: facebookEvent.description,
    // summary
    // browser_url
    // type
    // ticket_levels
    // featured_image_url
    total_accepted: facebookEvent.attending_count,
    // total_tickets
    // total_amount
    // status
    // instructions
    start_date: new Date(facebookEvent.start_time),
    end_time: new Date(facebookEvent.end_time),
    // all_day_date
    // all_day
    // capacity
    guests_can_invite_others: facebookEvent.can_guests_invite,
    // transparence
    // visibility
    loc: location,
    // reminders
    // share_url
    // total_shares
    // share_options
    date: new Date() // TODO(aaghevli): Verify if required?
  });
}
