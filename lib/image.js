const cloudinary = require('cloudinary');
const config = require('../config');
const http = require('http');
const AWS = require('aws-sdk');
const request = require('request');
const url = require('url');

module.exports.cacheImage = function (eventId, imagePath, imageUrl, callback) {
  if (!config.s3ImageBucket) {
    callback();
    return;
  }

  if (imageUrl) {
    const expectedUrl = `https://${config.s3ImageBucket}.s3.amazonaws.com/${imagePath}`;
    const headParams = { Bucket: config.s3ImageBucket, Key: imagePath};
    var s3 = new AWS.S3();
    s3.headObject(headParams, function (err, data) {
      if (err && err.statusCode == 404) { // Not found
        request({url: imageUrl, encoding: null}, function(err, res, body) {
          if (err) return callback(err);
          const putParams = {
            Bucket: config.s3ImageBucket,
            Key: imagePath,
            ContentType: res.headers['content-type'],
            ContentLength: res.headers['content-length'],
            Body: body,
            ACL: 'public-read'
          };
          s3.putObject(putParams, function (err, data) {
            if (err) return callback(err);
            console.log(`${eventId} image saved to ${expectedUrl}`);
            callback(null, expectedUrl);
          });
        });
      } else if (err) {
        console.log('Unknown s3 error: ' + err);
        callback(err);
      } else {
        console.log(`${eventId} image exists at ${expectedUrl}`);
        callback(null, expectedUrl);
      }
    });
  } else {
    console.log(`${eventId} has no image`);
    callback();
  }
};
