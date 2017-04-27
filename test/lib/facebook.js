const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const facebook = require('../../lib/facebook');

lab.test('facebook events gets geocoded location for bad locations', (done) => {
  facebook.toOSDIEvent(badFacebookLocationEvent, function (err, res) {
    if (err) console.error(err);

    const eventLocation = res.location;
    Code.expect(eventLocation.location.latitude).to.equal(26.6143134);
    Code.expect(eventLocation.location.longitude).to.equal(-80.0476973);
    Code.expect(eventLocation.postal_code).to.equal('33460');
    Code.expect(eventLocation.region).to.equal('FL');
    Code.expect(eventLocation.locality).to.equal('Lake Worth');
    Code.expect(eventLocation.address_lines[0]).to.equal('100 S Golfview Rd');
    done();
  });
});

const badFacebookLocationEvent = {
  'description': 'May 1st strike for worker solidarity',
  'end_time': '2017-05-01T18:00:00-0400',
  'name': 'March for immigrant + worker rights / Marcha del 1 de mayo',
  'place': {
    'name': 'Bryant Park 100 S Gulfview Rd. S Lake Worth, FL'
  },
  'start_time': '2017-05-01T15:00:00-0400',
  'id': '626714440858644'
};
