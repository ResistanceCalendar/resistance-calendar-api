const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Facebook = require('../../lib/facebook');

lab.test('Facebook.toOSDIEvent identifiers', (done) => {
  const osdiEvent = Facebook.toOSDIEvent({
    id: '00000'
  });
  Code.expect(osdiEvent.origin_system).to.equal('Facebook');
  Code.expect(osdiEvent.identifiers).to.equal(['facebook:00000']);
  done();
});

lab.test('Facebook.toOSDIEvent status', (done) => {
  Code.expect(Facebook.toOSDIEvent({}).status).to.equal('confirmed');
  Code.expect(Facebook.toOSDIEvent({is_canceled: false}).status).to.equal('confirmed');
  Code.expect(Facebook.toOSDIEvent({is_canceled: true}).status).to.equal('cancelled');
  done();
});

lab.test('Facebook.toOSDIEvent location', (done) => {
  const noLat = {location: {latitude: undefined, longitude: -122.42118}};
  Code.expect(Facebook.toOSDIEvent({id: '00000', place: noLat}).location.location).to.equal(undefined);

  const noLong = {location: {latitude: 37.76056, longitude: undefined}};
  Code.expect(Facebook.toOSDIEvent({id: '00000', place: noLong}).location.location).to.equal(undefined);

  const latLong = {location: {latitude: 37.76056, longitude: -122.42118}};
  Code.expect(Facebook.toOSDIEvent({id: '00000', place: latLong}).location.location).to.equal({
    longitude: -122.42118,
    latitude: 37.76056,
    type: 'Point',
    coordinates: [
      -122.42118,
      37.76056
    ]
  });
  done();
});
