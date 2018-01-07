const Event = require('../models/osdi/event');
const Facebook = require('../lib/facebook');
const async = require('async');
const image = require('../lib/image');
const request = require('request');

require('../lib/database'); // Has side effect of connecting to database

const sources = require('../resource/source.json');

const postNewEvent = function (osdiEvent) {
  return request({
    uri: process.env.SLACK_ENDPOINT,
    method: 'POST',
    json: true,
    body: {
      text: `<${osdiEvent.browser_url}|${osdiEvent.name}>`
    }
  });
};

const importEvents = function (job, done) {
  console.log(`Facebook ETL Starting`);

  const getAllFacebookEvents = function (user, callback, pages) {
    console.log(`Getting events for ${user}`);
    Facebook.getAllFacebookEvents(user, callback, pages);
  };

  async.concatLimit(sources['facebook'], 1, getAllFacebookEvents, function (err, res) {
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
        const facebookEventName = `[facebook:${facebookEvent.id}]`;
        upsertOSDIEvent(osdiEvent, function (err, savedEvent) {
          if (err) handleError(err, `upserting ${facebookEventName}`);
          console.log(`upserted ${facebookEventName} - ${savedEvent._id}`);
          callback();
        });
      });
    };

    // Do not update old events
    const eventsToUpdate = Facebook.filterEventsAfter(new Date(), res);
    console.log(`updating ${eventsToUpdate.length} of ${res.length} events`);

    // Avoid overwhelming any service by limiting parallelism
    async.eachLimit(eventsToUpdate, 5, makeRequest, function (err) {
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

    Event.findOne(query, 'name', function (err, eventFound) {
      if (err) return handleError(err);
      if (!eventFound) {
        postNewEvent(osdiEvent);
      }
    });

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
      if (err) callback(err);
      callback(null, doc);
    });
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
