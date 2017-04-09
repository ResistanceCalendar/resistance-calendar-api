const Event = require('../models/osdi/event');
const Facebook = require('../lib/facebook');
const cloudinary = require('cloudinary');
const fs = require('fs');
var http = require('http');
var url = require('url');
const request = require('request');

require('../lib/database'); // Has side effect of connecting to database

module.exports = function (job, done) {
  Facebook.getAllFacebookEvents(function (err, res) {
    if (err) handleError('fetching facebook events', err);
    // for each facebook event, cache the image into our cloudinary and update
    // the cover.source

    res.forEach(function (facebookEvent) {
      cacheFacebookEventImage(facebookEvent, function (err, imageUrl) {
        if (err) handleError('updating image for facebook event', err);
        if (facebookEvent.cover) {
          facebookEvent.cover.source = imageUrl;
          console.log(`updating ${facebookEvent.id} with ${imageUrl}`);
        }
        const osdiEvent = Facebook.toOSDIEvent(facebookEvent);
        console.log(facebookEvent.id + ': ' + osdiEvent.featured_image_url);
        saveOrUpdateEvent(osdiEvent);
      });
    });
  }, 1);
};

const handleError = function (err, str) {
  console.log(str, err);
  throw new Error(err);
};

const download = function (uri, filename, callback) {
  request.head(uri, function (err, res, body) {
    if (err) handleError('downloading event image', err);
    request(uri).pipe(fs.createWriteStream(filename)).on('close', callback);
  });
};

const saveOrUpdateEvent = function (osdiEvent) {
  const facebookId = osdiEvent.identifiers.find(function (id) {
    return id.startsWith('facebook:');
  });

  if (facebookId) {
    const facebookEventName = osdiEvent.name + ' [' + facebookId + ']';
    const query = { identifiers: { $in: [facebookId] } };
    Event.find(query, function (err, eventData) {
      if (err) handleError('error finding ' + facebookEventName, err);
      if (eventData.length === 0) {
        osdiEvent.save(function (err, data) {
          if (err) handleError('error saving' + facebookEventName, err);
          console.log('saved ' + facebookEventName);
        });
      } else {
        eventData.forEach(function (event) {
          osdiEvent._id = event._id;
          Event.update(osdiEvent, function (err, raw) {
            if (err) handleError('error updating ' + facebookEventName, err);
            console.log('updated ' + facebookEventName);
          });
        });
      }
    });
  } else {
    const err = 'no facebook id found ' + osdiEvent.name;
    handleError(err, err);
  }
};

const cacheFacebookEventImage = function (facebookEvent, callback) {
  if (facebookEvent.cover) {
    const coverId = facebookEvent.cover.id;
    const cloudinaryId = 'facebook:' + coverId;
    const filename = coverId + '.jpg';
    const cloudinaryUrl = cloudinary.url(cloudinaryId);
    const parsedUrl = url.parse(cloudinaryUrl);

    const options = {
      method: 'HEAD',
      host: parsedUrl.host,
      port: '',
      path: parsedUrl.pathname
    };
    const req = http.request(options, function (res, err) {
      if (err) callback(err);
      if (res.statusCode === 404) {
        // TODO(aaghevli): Stream API without saving to disk first
        fs.exists(filename, function (exists) {
          if (exists) {
            cloudinary.uploader.upload(filename, function (result) {
              console.log('uploaded event cover ' + coverId + ' to ' + cloudinaryUrl);
              // Set the facebook event cover value to the cloudinaryUrl
              facebookEvent.cover.source = cloudinaryUrl;
              callback(null, cloudinaryUrl);
            }, {public_id: cloudinaryId});
          } else {
            download(facebookEvent.cover.source, filename, function () {
              cloudinary.uploader.upload(filename, function (result) {
                console.log('uploaded event cover ' + coverId + ' to ' + cloudinaryUrl);
                // Set the facebook event cover value to the cloudinaryUrl
                facebookEvent.cover.source = cloudinaryUrl;
                callback(null, cloudinaryUrl);
              }, {public_id: cloudinaryId});
            });
          }
        });
      } else if (res.statusCode === 200) {
        console.log('event cover ' + coverId + ' already exists at ' + cloudinaryUrl);
        facebookEvent.cover.source = cloudinaryUrl;
        callback(null, cloudinaryUrl);
      }
    });
    req.end();
  } else {
    console.log('no image for event ' + facebookEvent.id);
    callback(null, undefined);
  }
};
