const cities = require('cities');
const allCities = require('all-the-cities');
const _ = require('lodash');

module.exports = {
  postalCodeToCoords: function (postalCode) {
    const response = cities.zip_lookup(postalCode);
    if (response) {
      return [
        parseFloat(response.longitude),
        parseFloat(response.latitude)
      ];
    } else return null;
  },

  cityToCoords: function (city) {
    city = _.upperFirst(city);
    const response = allCities.filter(function (c) {
      return c.name.match(city);
    });
    if (response) {
      return [
        parseFloat(response[0].lon),
        parseFloat(response[0].lat)
      ];
    } else return null;
  }
};
