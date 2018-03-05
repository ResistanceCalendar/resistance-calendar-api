const Event = require('../models/osdi/event');
const Facebook = require('../lib/facebook');
const Geo = require('../lib/geo');
const async = require('async');
const image = require('../lib/image');
const request = require('request');

require('../lib/database'); // Has side effect of connecting to database

const sources = require('../resource/source.json');

const postNewEvent = function (osdiEvent) {
  const slackEndpoint = process.env.SLACK_ENDPOINT;
  if (slackEndpoint) {
    const orgLink = osdiEvent.contact ? ` (<${osdiEvent.contact.additional_info}|${osdiEvent.contact.name}>)` : '';
    const eventLink = `<${osdiEvent.browser_url}|${osdiEvent.name}>`;
    return request({
      uri: slackEndpoint,
      method: 'POST',
      json: true,
      body: {
        text: `${eventLink}${orgLink}`
      }
    });
  }
};

const importEvents = function (job, done) {
  console.log(`Facebook ETL Starting`);

  const getAllUpcomingFacebookEvents = function (user, callback, pages) {
    console.log(`Getting events for ${user}`);
    Facebook.getAllUpcomingFacebookEvents(user, callback, pages);
  };

  async.concatLimit(sources['facebook'], 1, getAllUpcomingFacebookEvents, function (err, res) {
    if (err) handleError(err, 'fetching facebook events');
    console.log(`${res.length} events downloaded`);
    const facebookEventIds = [];
    const makeRequest = function (facebookEvent, callback) {
      cacheFacebookEventImage(facebookEvent, function (err, imageUrl) {
        if (err) handleError(err, 'updating image for facebook event');
        if (facebookEvent.cover) {
          facebookEvent.cover.source = imageUrl;
        }

        const osdiEvent = Facebook.toOSDIEvent(facebookEvent);
        facebookEventIds.push(facebookEvent.id);

        fixFacebookAddress(facebookEvent, osdiEvent, function (err, osdiEvent) {
          const facebookEventId = `[facebook:${facebookEvent.id}]`;

          if (err) handleError(err, `converting address to OSDI location for ${facebookEventId}`);
          upsertOSDIEvent(osdiEvent, function (err, savedEvent) {
            if (err) handleError(err, `upserting ${facebookEventId}`);
            console.log(`upserted ${facebookEventId} - ${savedEvent._id}`);
            callback();
          });
        });
      });
    };

    // Avoid overwhelming any service by limiting parallelism
    async.eachLimit(res, 5, makeRequest, function (err) {
      if (err) handleError(err);
      removeMongoEventsNotFoundInFacebook(facebookEventIds);
      console.log(`Facebook ETL Ended`);
    });
  });
};

const handleError = function (err, str) {
  console.log(str, err);
  throw new Error(err);
};

/**
 * Upsert the event to mongodb
 *
 * Example:
 *   upsertOSDIEvent(osdiEvent, functiuon(err, event) {
 *     // updated event actions
 *   });
 */
const upsertOSDIEvent = function (osdiEvent, callback) {
  const facebookId = osdiEvent.identifiers.find(function (id) {
    return id.startsWith('facebook:');
  });

  if (facebookId) {
    const query = { identifiers: { $in: [facebookId] } };

    // Done for debugging / monitoring / QA purposes
    Event.findOne(query, 'name', function (err, eventFound) {
      if (err) return handleError(err);
      if (!eventFound) {
        postNewEvent(osdiEvent);
      }
    });

    Event.upsert(query, osdiEvent, callback);
  } else {
    callback(`no facebook id found ${osdiEvent.name}`);
  }
};

/**
 * Downloads the event image defined by facebookEvent.cover.source which
 * and uploads it to cloundinary, returning the secure url to the callback
 *
 * Example:
 *  cacheFacebookEventImage(facebookEvent, function (err, imageUrl) {
 *    // do something with imageUrl
 *  });
 */
const cacheFacebookEventImage = function (facebookEvent, callback) {
  const facebookEventId = `[facebook:${facebookEvent.id}]`;
  if (facebookEvent.cover) {
    const imagePath = `facebook/${facebookEvent.cover.id}`;
    const imageUrl = facebookEvent.cover.source;
    image.cacheImage(facebookEventId, imagePath, imageUrl, callback);
  } else {
    console.log(`${facebookEventId} has no image`);
    callback(null, undefined);
  }
};

const fixFacebookAddress = function (facebookEvent, osdiEvent, callback) {
  if (!osdiEvent.location && facebookEvent.place && facebookEvent.place.name) {
    Geo.parseAddressStringToOSDILocation(facebookEvent.place.name, function (err, osdiLocation) {
      if (err) callback(err);
      if (osdiLocation) {
        osdiEvent.location = osdiLocation;
      }
      callback(null, osdiEvent);
    });
  } else {
    callback(null, osdiEvent);
  }
};

function removeMongoEventsNotFoundInFacebook (facebookEventIds) {
  Event.find({origin_system: 'Facebook'}, function (err, mongoEvents) {
    if (err) handleError(err);
    const mongoEventIds = mongoEvents.map(function (evt) {
      return evt.identifiers[0].replace('facebook:', '');
    });
    const itemsToDelete = removeSharedArrayItems(facebookEventIds, mongoEventIds);
    itemsToDelete.forEach(function (id) {
      Event.findOneAndRemove({identifiers: `facebook:${id}`}, function (err, event) {
        if (err) handleError(err);
        const facebookEventName = `[facebook:${id}]`;
        console.log(`deleted '${facebookEventName}'`);
      });
    });
  });
}

function removeSharedArrayItems (arr1, arr2) {
  let largest = [];
  let smallest = [];
  if (arr1.length >= arr2.length) {
    largest = arr1;
    smallest = arr2;
  } else {
    largest = arr2;
    smallest = arr1;
  }
  let newArray = [];
  largest.forEach(function (item) {
    if (!smallest.includes(item)) {
      newArray.push(item);
    }
  });
  return newArray;
}

importEvents();
