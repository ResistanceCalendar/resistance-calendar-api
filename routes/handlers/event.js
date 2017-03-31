const Event = require('../../models/osdi/event');
const Joi = require('joi');
const lodash = require('lodash');

const OPTS_SCHEMA = Joi.object().keys({
  per_page: Joi.number().integer().min(1).default(25),
  page: Joi.number().integer().min(0).default(0)
});

exports.get = function (opts, next) {
  Joi.validate(opts, OPTS_SCHEMA, function (err, query) {
    if (err) handleError(next, 'validating', err);
    Event.count()
      .exec(function (err, count) {
        if (err) handleError(next, 'counting events', err);

        Event.find()
          .limit(query.per_page)
          .skip(query.per_page * query.page)
          .exec(function (err, osdiEvents) {
            if (err) handleError(next, 'finding events', err);
            const response = {
              total_pages: Math.ceil(count / query.per_page),
              per_page: query.per_page,
              page: query.page,
              total_records: count,
              _embedded: {
                'osdi:events': osdiEvents
              }
            };
            next(null, response);
          });
      });
  });
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

const handleError = function (next, err, str) {
  console.log(str, err);
  next(err);
};
