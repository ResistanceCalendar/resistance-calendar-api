// Inspired by http://cubettech.com/blog/an-introduction-to-hapijs-part-1/
//             and http://cubettech.com/blog/an-introduction-to-hapijs-part-2/
'use strict';

const FB = require('fbgraph');
FB.setVersion(process.env.FB_GRAPH_API_VERSION || '2.8');
FB.setAccessToken(process.env.FB_GRAPH_API_TOKEN)

//this is something similar to a constructor.
function facebookController() {}

facebookController.prototype.getEvents = function(request, reply) {
  FB.get('resistance-calendar/events', function(err, res) {
    return reply(res).type('application/json');
  });
}

module.exports = facebookController;
