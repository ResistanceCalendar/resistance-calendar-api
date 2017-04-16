const osdiLinks = require('../../lib/links.js');

exports.get = {

  handler: function (req, reply) {
    reply({
      motd: 'Welcome to the Resistance Calendar API Entry Point',
      max_pagesize: 25,
      vendor_name: 'Resistance Calendar',
      product_name: 'Resistance Calendar OSDI Server',
      osdi_version: '1.0',
      namespace: 'resistance_calendar_api',
      _links: osdiLinks
    });
  }

};
