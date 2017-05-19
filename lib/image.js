const cloudinary = require('cloudinary');
const config = require('../config');
const http = require('http');
const url = require('url');

const CLOUDINARY_URL_OPTIONS = {
  secure: true
};

module.exports.cacheImage = function (eventId, imageId, imageUrl, callback) {
  if (!config.cloudinaryUri) {
    callback();
    return;
  }

  if (imageUrl) {
    const cloudinaryId = imageId;
    const cloudinaryUrl = cloudinary.url(cloudinaryId, CLOUDINARY_URL_OPTIONS);
    const parsedUrl = url.parse(cloudinaryUrl);
    const requestOptions = {
      method: 'HEAD',
      host: parsedUrl.host,
      path: parsedUrl.pathname,
      agent: false
    };

    http.request(requestOptions, function (res, err) {
      if (err) callback(err);
      if (res.statusCode === 404) {
        cloudinary.uploader.upload(imageUrl, function (result) {
          console.log(`${eventId} image saved to ${cloudinaryUrl}`);
          callback(null, result.secure_url);
        }, {public_id: cloudinaryId});
      } else if (res.statusCode === 200) {
        console.log(`${eventId} image exists at ${cloudinaryUrl}`);
        callback(null, cloudinaryUrl);
      }
    }).end();
  } else {
    console.log(`${eventId} has no image`);
    callback(null, undefined);
  }
};
