const Location = require('../../models/location');
const Joi = require('Joi');
const Boom = require('Boom');
const lodash = require('lodash');

exports.create = {
  validate: {
    payload: {
      identifiers: [Joi.string()],
      origin_system: Joi.string(),
      venue: Joi.string(),
      address_lines: [Joi.string()],
      locality: Joi.string(),
      region: Joi.string(),
      postal_code: Joi.string(),
      country: Joi.string(),
      language: Joi.string(),
      latitude: Joi.number(),
      longitude: Joi.number()
    }
  },

  handler: function(req, reply) {
    let locationPoint = {
      type: 'Point',
      coordinates: [req.payload.longitude, req.payload.latitude]
    };

    let params = {
      location: locationPoint,
      created_date: new Date(),
      modified_date: new Date()
    };

    let new_location = new Location(lodash.merge(req.payload, params));

    return new_location.save()
    .then(function(loc){
      reply(loc);
    })
    .catch(function(err){
      console.log('err', err);
      throw new Error(err);
    });
  }
};