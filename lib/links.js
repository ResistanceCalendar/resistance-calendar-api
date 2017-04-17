const config = require('../config.js');

const apiBaseUrl = config.baseUrl + '/v1/';

const links = {
  self: {
    href: apiBaseUrl,
    title: 'This is the API entry point'
  },
  'osdi:events': {
    href: apiBaseUrl + 'events',
    title: 'The collection of events in the system'
  }
};

module.exports = links;
