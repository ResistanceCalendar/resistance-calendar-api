const Event = require('../models/osdi/event');
const Facebook = require('../lib/facebook');
const async = require('async');
const image = require('../lib/image');

require('../lib/database'); // Has side effect of connecting to database

module.exports = function (job, done) {
  Facebook.getAllFacebookEvents(function (err, res) {
    if (err) handleError('fetching facebook events', err);
    const makeRequest = function (facebookEvent, callback) {
      cacheFacebookEventImage(facebookEvent, function (err, imageUrl) {
        if (err) handleError('updating image for facebook event', err);
        if (facebookEvent.cover) {
          facebookEvent.cover.source = imageUrl;
        }
        const osdiEvent = Facebook.toOSDIEvent(facebookEvent);
        const facebookEventName = `'${osdiEvent.name}' [facebook:${facebookEvent.id}]`;
        upsertOSDIEvent(osdiEvent, function (err) {
          if (err) handleError(`upserting ${facebookEventName}`);
          console.log(`upserted ${facebookEventName}`);
          callback();
        });
      });
    };

    // Avoid overwhelming any service by limiting parallelism
    async.eachLimit(res, 5, makeRequest, function (err) {
      if (err) handleError(err);
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
    const imageId = `facebook:${facebookEvent.cover.id}`;
    const imageUrl = facebookEvent.cover.source;
    image.cacheImage(facebookEventId, imageId, imageUrl, callback);
  } else {
    console.log(`${facebookEventId} has no image`);
    callback(null, undefined);
  }
};
