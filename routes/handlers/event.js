const Event = require('../../models/osdi/event');
const Joi = require('joi');
const lodash = require('lodash');

exports.get = {
  validate: {
    query: {
      per_page: Joi.number().integer().min(1).default(25),
      page: Joi.number().integer().min(0).default(0)
    }
  },
  handler: function (req, reply) {
    Event.count()
      .exec(function (err, count) {
        if (err) {
          console.log('err', err);
          throw new Error(err);
        }

        Event.find()
          .limit(req.query.per_page)
          .skip(req.query.per_page * req.query.page)
          .exec(function (err, osdiEvents) {
            if (err) {
              console.log('err', err);
              throw new Error(err);
            }
            const response = {
              total_pages: Math.ceil(count / req.query.per_page),
              per_page: req.query.per_page,
              page: req.query.page,
              total_records: count,
              _embedded: {
                'osdi:events': osdiEvents
              }
            };
            reply(response);
          });
      });
  }
};

exports.create = {
  validate: {
    payload: {
      identifiers: [Joi.string()],
      origin_system: Joi.string(),
      // name of the event for administrative display
      name: Joi.string(),
      // title of event for public display
      title: Joi.string().required(),
      // may contain text and/or HTML
      description: Joi.string().required(),
      // text-only, single paragraph. For listing pages with not enough room for description
      summary: Joi.string(),
      browser_url: Joi.string(),
      // whether event requires tickets or is open RSVP
      type: Joi.string().valid('ticketed', 'open'),
      featured_image_url: Joi.string(),
      total_accepted: Joi.number(),
      status: Joi.string().valid('confirmed', 'tentatives', 'cancelled'),
      // instructions for event shown after people have RSVPed. Text and/or HTML
      instructions: Joi.string(),
      start_date: Joi.date(),
      end_date: Joi.date(),
      add_day_date: Joi.date(),
      add_day: Joi.boolean(),
      capacity: Joi.number(),
      guests_can_invite_others: Joi.boolean(),
      facebookLink: Joi.string(),
      date: Joi.date(),
      loc: Joi.string()
    }
  },
  handler: function (req, reply) {
    let params = {
      created_date: new Date(),
      modified_date: new Date()
    };

    var event = new Event(lodash.merge(req.payload, params));

    return event.save()
      .then(function (e) {
        reply(e);
      })
      .catch(function (err) {
        console.log('err', err);
        throw new Error(err);
      });
  }
};
