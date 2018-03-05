const Joi = require('joi');
const zipcodes = require('zipcodes');

const OPTS_SCHEMA = Joi.object().keys({
  coords: Joi.array().items(Joi.number().required(), Joi.number().required())
});

const get = function (opts, next) {
  Joi.validate(opts.query, OPTS_SCHEMA, function (err, query) {
    if (err) handleError(next, 'validating', err);
    const coordinates = JSON.parse(opts.query.coords);
    const response = zipcodes.lookup(coordinates[1], coordinates[0]);
    const city = response ? response.city : undefined;
    next(null, city);
  });
};

const handleError = function (next, str, err) {
  console.log(str, err);
  next(err);
};

exports.get = get;
