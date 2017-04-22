const config = require('../../config');
const Event = require('../../models/osdi/event');
const Joi = require('joi');
const _ = require('lodash');
const ODATA = require('../../lib/odata');

const OPTS_SCHEMA = Joi.object().keys({
  per_page: Joi.number().integer().min(1).default(config.maxPageSize),
  page: Joi.number().integer().min(0).default(0),
  $filter: Joi.string(),
  $orderby: Joi.string(),
  $top: Joi.number().integer(),
  $inlinecount: Joi.number().integer(),

  // No ODATA standard for geometric search
  distance_coords: Joi.array().items(Joi.number().required(), Joi.number().required()),
  distance_max: Joi.number().integer()
});

const get = function (opts, next) {
  Joi.validate(opts.query, OPTS_SCHEMA, function (err, query) {
    if (err) handleError(next, 'validating', err);
    const searchFilter = ODATA.createFilter(query.$filter);
    const distanceFilter = createProximityFilter('location.location', query.distance_coords, query.distance_max);
    const filter = _.merge(searchFilter, distanceFilter);
    const orderBy = ODATA.createOrderBy(query.$orderby);
    console.log(`mongo db filter = ${JSON.stringify(filter)} orderBy = ${JSON.stringify(orderBy)}`);
    Event.count(filter)
      .exec(function (err, count) {
        if (err) handleError(next, 'counting events', err);

        Event.find(filter)
          .sort(orderBy)
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

const getOne = function (opts, next) {
  Event.count(opts.params)
    .exec(function (err, count) {
      if (err) handleError(next, 'counting event', err);

      Event.find(opts.params)
        .exec(function (err, osdiEvent) {
          if (err) handleError(next, 'finding event', err);
          const response = osdiEvent;

          next(null, response);
        });
    });
};

const create = {
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
    return new Event(req.payload).save()
      .then(function (e) {
        reply(e);
      })
      .catch(function (err) {
        console.log('err', err);
        throw new Error(err);
      });
  }
};

const createProximityFilter = function (fieldName, coord, maxDistance) {
  const filter = {};
  if (fieldName && coord && maxDistance) {
    filter[fieldName] = {
      $near: {
        $geometry: {
          type: 'Point',
          coordinates: [coord[0], coord[1]]
        },
        $maxDistance: maxDistance
      }
    };
  }
  return filter;
};

const handleError = function (next, str, err) {
  console.log(str, err);
  next(err);
};

exports.create = create;
exports.createProximityFilter = createProximityFilter;
exports.get = get;
exports.getOne = getOne;
