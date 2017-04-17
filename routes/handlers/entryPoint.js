const osdiLinks = require('../../lib/links.js');
const config = require('../../config.js');

exports.get = {

  handler: function (req, reply) {
    reply({
      motd: 'Welcome to the Resistance Calendar API Entry Point',
      max_pagesize: config.maxPageSize,
      vendor_name: 'Resistance Calendar',
      product_name: 'Resistance Calendar OSDI Server',
      osdi_version: '1.0',
      namespace: 'resistance_calendar',
      _links: osdiLinks
    });
  }

};
