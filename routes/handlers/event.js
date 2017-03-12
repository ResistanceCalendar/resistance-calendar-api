const Event = require('../../models/event');
const Joi = require('Joi');
const Boom = require('Boom');
const lodash = require('lodash');

exports.create = {
  validate: {
    payload: {
      title: Joi.string().required(),
      description: Joi.string().required(),
      facebookLink: Joi.string(),
      date: Joi.date(),
      latitude: Joi.number(),
      longitude: Joi.number()
    }
  },
  handler: function(req, reply) {
    const location = {
      type: 'Point',
      coordinates: [req.payload.longitude, req.payload.latitude]
    };

    var event = new Event(lodash.merge(req.payload, {location: location}));

    return event.save()
    .then(function(e){
      reply(event);
    })
    .catch(function(err){
      console.log('err', err);
      throw new Error(err);
    });
  }
};