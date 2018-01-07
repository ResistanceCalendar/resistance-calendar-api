const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Facebook = require('../../lib/facebook');
const config = require('../../config.js');

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

lab.test('Facebook.toOSDIEvent contact', (done) => {
  Code.expect(Facebook.toOSDIEvent({id: '00000'}).contact).to.equal(undefined);
  Code.expect(Facebook.toOSDIEvent({id: '00000', 'owner': {'name': 'rc'}}).contact).to.equal({'name': 'rc'});
  Code.expect(Facebook.toOSDIEvent({id: '00000', 'owner': {'name': 'rc', 'id': '1'}}).contact).to.equal({'name': 'rc', 'additional_info': 'http://facebook.com/1'});
  done();
});

lab.test('Facebook.toOSDIEvent location', (done) => {
  Code.expect(Facebook.toOSDIEvent({id: '00000', place: {location: {}}}).location.location)
    .to.equal(undefined);

  Code.expect(Facebook.toOSDIEvent({id: '00000', place: {location: {latitude: undefined, longitude: -122.42118}}}).location.location)
    .to.equal(undefined);

  Code.expect(Facebook.toOSDIEvent({id: '00000', place: {location: {latitude: null, longitude: -122.42118}}}).location.location)
    .to.equal(undefined);

  Code.expect(Facebook.toOSDIEvent({id: '00000', place: {location: {latitude: 37.76056, longitude: undefined}}}).location.location)
    .to.equal(undefined);

  Code.expect(Facebook.toOSDIEvent({id: '00000', place: {location: {latitude: 37.76056, longitude: null}}}).location.location)
    .to.equal(undefined);

  Code.expect(Facebook.toOSDIEvent({id: '00000', place: {location: {latitude: 37.76056, longitude: -122.42118}}}).location.location)
    .to.equal({
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

lab.test('Facebook.filterEventsAfter works without date', (done) => {
  const now = new Date();
  const events = [{id: '00000'}];
  Code.expect(Facebook.filterEventsAfter(now, events)).to.equal(events);
  done();
});

lab.test('Facebook.filterEventsAfter works with dates after padded date', (done) => {
  const now = new Date();
  const later = new Date(now.getTime() - (config.eventTimeToLiveMs - 1));
  const events = [{id: '00000', end_time: later}, {id: '00000', start_time: later}];
  Code.expect(Facebook.filterEventsAfter(now, events)).to.equal(events);
  done();
});

lab.test('Facebook.filterEventsAfter works with dates before padded date', (done) => {
  const now = new Date();
  const beforeNow = new Date(now.getTime() - (config.eventTimeToLiveMs + 1));
  const events = [{id: '00000', end_time: beforeNow}, {id: '00000', start_time: beforeNow}];
  Code.expect(Facebook.filterEventsAfter(now, events)).to.equal([]);
  done();
});
