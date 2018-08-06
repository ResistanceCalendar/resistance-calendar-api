const zipcodes = require('zipcodes');
const allCities = require('all-the-cities');
const parseAddress = require('parse-address-string');
const _ = require('lodash');

module.exports = {
  postalCodeToCoords: function (postalCode) {
    const response = zipcodes.lookup(postalCode);
    if (response) {
      return [response.longitude, response.latitude];
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

      // Sometimes the state is not parsed because it may be in longform
      if (!addressObj.state && addressObj.postal_code) {
        const response = zipcodes.lookup(addressObj.postal_code);
        if (response) {
          addressObj.state = response.state;
        }
      }

      if (!addressObj.city && addressObj.postal_code) {
        const response = zipcodes.lookup(addressObj.postal_code);
        if (response) {
          addressObj.city = response.city;
        }
      }

      if (addressObj.city && addressObj.state && !addressObj.postal_code) {
        const response = zipcodes.lookupByName(addressObj.city, addressObj.state);
        if (response.length !== 0) {
          addressObj.postal_code = response[0].zip;

          if (!addressObj.country) {
            addressObj.country = response[0].country;
          }
        }
      }

      const coords = zipcodes.lookup(addressObj.postal_code);
      const coordinatLocation = coords ? {
        longitude: coords.longitude,
        latitude: coords.latitude,
        type: 'Point',
        coordinates: [coords.longitude, coords.latitude]
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
