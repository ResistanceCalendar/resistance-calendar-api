const cities = require('cities');
const allCities = require('all-the-cities');
const geocoder = require('geocoder');
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

  singleLineAddressToOSDILocation: function (singleLineAddress, callback) {
    geocoder.geocode(singleLineAddress, function (err, res) {
      if (err) {
        callback(err);
      }

      if (res.results.length == 0) {
        return callback(null, null);
      }

      const location = res.results[0];
      const osdiLocation = {
        // identifiers
        // origin_system
        // venue
        address_lines: [location.address_components[0].short_name + ' ' + location.address_components[1].short_name],
        locality: location.address_components[2].short_name,
        region: location.address_components[4].short_name,
        postal_code: location.address_components[6].short_name
        // country
        location: {
          longitude: location.geometry.location.lng,
          latitude: location.geometry.location.lat,
          type: 'Point',
          coordinates: [
            location.geometry.location.lng,
            location.geometry.location.lat
          ]
        }
      };
      callback(null, osdiLocation);
    });
  }
};
