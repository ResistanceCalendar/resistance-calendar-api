const cities = require('cities');
const allCities = require('all-the-cities');
const parseAddress = require('parse-address-string');
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
  },

  parseAddressStringToOSDILocation: function (addressString, callback) {
    parseAddress(addressString, function (err, addressObj) {
      if (err) return callback(err);
      if (!addressObj) return callback(null, undefined);

      const coords = cities.zip_lookup(addressObj.postal_code);

      console.log(JSON.stringify(addressObj));
      console.log(JSON.stringify(coords));

      const coordinatLocation = coords ? {
        longitude: parseFloat(coords.longitude),
        latitude: parseFloat(coords.latitude),
        type: 'Point',
        coordinates: [
          parseFloat(coords.longitude),
          parseFloat(coords.latitude)
        ]
      } : undefined;

      const osdiLocation = {
        // identifiers
        // origin_system
        // venue
        address_lines: [addressObj.street_address1],
        locality: addressObj.city,
        region: addressObj.state,
        postal_code: addressObj.postal_code,
        country: addressObj.country,
        location: coordinatLocation
      };

      callback(null, osdiLocation);
    });
  }
};
