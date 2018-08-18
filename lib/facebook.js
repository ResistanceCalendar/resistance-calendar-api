'use strict';

const async = require('async');
const FB = require('fbgraph');
const Event = require('../models/osdi/event');
const config = require('../config.js');
const fs = require('fs');
const csvParse = require('csv-parse');
const Geo = require('./geo');

const FB_EVENT_FIELDS_STRING = [
  'attending_count',
  'can_guests_invite',
  'cover',
  'description',
  'end_time',
  'id',
  'interested_count',
  'is_canceled',
  'name',
  'owner',
  'place',
  'start_time',
  'timezone'
].join(',');

FB.setVersion(config.facebookGraphApiVersion);
FB.setAccessToken(config.facebookGraphApiToken);

/**
 * WARNING: Useful only for bulk imports and not intended for general querying.
 *
 * This may be used in conjunction with toOSDIEvent to convert the results into
 * OSDI via the following example:
 *
 * getAllFacebookEvents('user', function (err, res) {
 *   if (err) return callback(err);
 *     callback(err, res.map(module.exports.toOSDIEvent));
 *   });
 */
const getAllUpcomingFacebookEvents = function (user, callback, pages) {
  const now = new Date();
  const queryParams = {
    fields: FB_EVENT_FIELDS_STRING,
    limit: 500
  };
  var pageCount = 0;
  const allFacebookEvents = [];
  const getAllEvents = function (query) {
    FB.get(query, queryParams, function (err, res) {
      if (err) {
        // no fatal exceptions sent to callback
        console.error(err.message);
        return callback(null, []);
      }

      try {
        const facebookEvents = res.data;
        const upcomingFacebookEvents = facebookEvents ? filterEventsAfter(now, facebookEvents) : facebookEvents;
        allFacebookEvents.push.apply(allFacebookEvents, upcomingFacebookEvents);
        pageCount++;

        console.log(`page ${pageCount}: ${upcomingFacebookEvents.length}/${facebookEvents.length} events upcoming of ${allFacebookEvents.length} total`);
        if (res.paging && res.paging.next && (!pages || pageCount < pages)) {
          getAllEvents(res.paging.next, callback);
        } else {
          callback(null, allFacebookEvents);
        }
      } catch (err) {
        callback(err);
      }
    });
  };

  getAllEvents(`${user}/events`);
};

const filterEventsAfter = function (date, facebookEvents) {
  return facebookEvents.filter(function (facebookEvent) {
    const eventAnchorDateString = facebookEvent.end_time ? facebookEvent.end_time : facebookEvent.start_time;
    const eventAnchorDate = eventAnchorDateString ? new Date(eventAnchorDateString) : undefined;
    const eventEndDatePadded = eventAnchorDate ? (eventAnchorDate.getTime() + config.eventTimeToLiveMs) : undefined;

    // Events without dates should I guess always be updated for now
    return !eventEndDatePadded || (date.getTime() < eventEndDatePadded);
  });
};

const toOSDIEvent = function (facebookEvent) {
  const identifier = `facebook:${facebookEvent.id}`;
  const originSystem = 'Facebook';

  var location;
  if (facebookEvent.place && facebookEvent.place.location) {
    const facebookEventLocation = facebookEvent.place.location;
    const addressLines = facebookEventLocation.street ? [facebookEventLocation.street] : [];

    var osdiLocation;
    if (facebookEventLocation.longitude && facebookEventLocation.latitude) {
      osdiLocation = {
        longitude: facebookEventLocation.longitude,
        latitude: facebookEventLocation.latitude,
        type: 'Point',
        coordinates: [
          facebookEventLocation.longitude,
          facebookEventLocation.latitude
        ]
      };
    }

    location = {
      identifiers: [identifier],
      origin_system: originSystem,
      venue: facebookEvent.place.name,
      address_lines: addressLines,
      locality: facebookEventLocation.city,
      region: facebookEventLocation.state,
      postal_code: facebookEventLocation.zip,
      country: facebookEventLocation.country,
      location: osdiLocation
    };
  }

  var osdiContact;
  if (facebookEvent.owner) {
    osdiContact = {};
    osdiContact.name = facebookEvent.owner.name;
    if (facebookEvent.owner.id) {
      osdiContact.additional_info = `http://facebook.com/${facebookEvent.owner.id}`;
    }
  }

  return new Event({
    identifiers: [identifier],
    origin_system: originSystem,
    name: facebookEvent.name,
    title: facebookEvent.name,
    description: facebookEvent.description,
    // summary
    browser_url: `http://facebook.com/events/${facebookEvent.id}`,
    // type
    // ticket_levels
    featured_image_url: facebookEvent.cover ? facebookEvent.cover.source : undefined,
    total_accepted: facebookEvent.attending_count,
    // total_tickets
    // total_amount
    status: facebookEvent.is_canceled === true ? 'cancelled' : 'confirmed',
    // instructions
    start_date: facebookEvent.start_time ? new Date(facebookEvent.start_time) : undefined,
    end_date: facebookEvent.end_time ? new Date(facebookEvent.end_time) : undefined,
    // all_day_date
    // all_day
    // capacity
    guests_can_invite_others: facebookEvent.can_guests_invite,
    // transparence
    // visibility
    location: location,
    // reminders
    // share_url
    // total_shares
    // share_options
    timezone: facebookEvent.timezone,
    contact: osdiContact
  });
};

const cleanCsv = function (row, callback) {
  // Facebook p[ages do not resolve super well and place the venue name first]
  const isPage = row.location_address && row.location_city !== '';
  var address = '';
  if (row.location_address && row.location_city !== '') {
    address = row.location_city;
  } else {
    address = row.location_address;
  }

  Geo.parseAddressStringToOSDILocation(address, function (err, osdiLocation) {
    if (err) callback(err);
    row.osdiLocation = osdiLocation;
    if (isPage) {
      row.osdiLocation.venue = row.location_address;
    }
    callback(null, row);
  });
};

const importFacebookCsv = function (file, callback) {
  fs.readFile(file, function (err, fileData) {
    if (err) callback(err);

    const options = {
      columns: true,
      trim: true,
      skip_lines_with_error: true
    };
    csvParse(fileData, options, function (err, rawRows) {
      if (err) callback(err);

      async.map(rawRows, cleanCsv, function (err, rows) {
        if (err) callback(err);
        const osdiEvents = rows.map(function (row) {
          const originSystem = 'facebook-csv';
          const identifier = `facebook:${row.id}`;

          const osdiContact = {
            additional_info: row.organization_url
          };

          const startDate = new Date(row.start_time);

          const osdiEvent = new Event({
            identifiers: [identifier],
            origin_system: originSystem,
            name: row.name,
            title: row.name,
            description: row.description,
            // summary
            browser_url: row.event_url,
            // type
            // ticket_levels
            featured_image_url: row.image,
            // total_accepted: facebookEvent.attending_count,
            // total_tickets
            // total_amount
            // status: facebookEvent.is_canceled === true ? 'cancelled' : 'confirmed',
            // instructions
            start_date: startDate,
            // end_date: facebookEvent.end_time ? new Date(facebookEvent.end_time) : undefined,
            // all_day_date
            // all_day
            // capacity
            // guests_can_invite_others: facebookEvent.can_guests_invite,
            // transparence
            // visibility
            location: row.osdiLocation,
            // reminders
            // share_url
            // total_shares
            // share_options
            timezone: row.timezone,
            contact: osdiContact
          });

          // if (!osdiEvent.location || !osdiEvent.location.location) {
          //   console.log(row.address);
          // }
          // console.log(row);
          // console.log(osdiEvent);
          return osdiEvent;
        });

        callback(null, osdiEvents);
      });
    });
  });
};

module.exports.getAllUpcomingFacebookEvents = getAllUpcomingFacebookEvents;
module.exports.filterEventsAfter = filterEventsAfter;
module.exports.toOSDIEvent = toOSDIEvent;
module.exports.importFacebookCsv = importFacebookCsv;
