const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const event = require('../../../routes/handlers/event');
const Event = require('../../../models/osdi/event');

lab.test('event.createProximityFilter proximity under defined', (done) => {
  Code.expect(event.createProximityFilter()).to.equal({});
  Code.expect(event.createProximityFilter('a', {})).to.equal({});
  Code.expect(event.createProximityFilter('a', {distance_max: 100})).to.equal({});
  Code.expect(event.createProximityFilter('a', {distance_coords: [0, 1]})).to.equal({});
  Code.expect(event.createProximityFilter('a', {distance_postal_code: 94110})).to.equal({});
  done();
});

lab.test('event.createProximityFilter defined', (done) => {
  Code.expect(event.createProximityFilter('a', {distance_max: 100, distance_coords: [0, 1]})).to.equal(
    {'a': {$near: {$geometry: {'coordinates': [0, 1], type: 'Point'}, $maxDistance: 100}}}
  );
  done();
});

lab.test('event.createProximityFilter ignores postalCode', (done) => {
  Code.expect(event.createProximityFilter('a', {distance_max: 100, distance_coords: [0, 1], distance_postal_code: 94110})).to.equal(
    {'a': {$near: {$geometry: {'coordinates': [0, 1], type: 'Point'}, $maxDistance: 100}}}
  );
  done();
});

lab.test('event.createProximityFilter uses postalCode', (done) => {
  Code.expect(event.createProximityFilter('a', {distance_max: 100, distance_postal_code: 94110})).to.equal(
    {'a': {$near: {$geometry: {'coordinates': [-122.4153, 37.7509], type: 'Point'}, $maxDistance: 100}}}
  );
  done();
});

lab.test('event.createProximityFilter ignores city', (done) => {
  Code.expect(event.createProximityFilter('a', {distance_max: 100, distance_coords: [0, 1], distance_city: 'Albuquerque'})).to.equal(
    {'a': {$near: {$geometry: {'coordinates': [0, 1], type: 'Point'}, $maxDistance: 100}}}
  );
  done();
});

lab.test('event.createProximityFilter uses city', (done) => {
  Code.expect(event.createProximityFilter('a', {distance_max: 100, distance_city: 'Albuquerque'})).to.equal(
    {'a': {$near: {$geometry: {'coordinates': [-106.65114, 35.08449], type: 'Point'}, $maxDistance: 100}}}
  );
  done();
});

lab.test('event.render no dates', (done) => {
  Code.expect(undefined).to.equal(event.render(new Event({})).start_date);
  Code.expect(undefined).to.equal(event.render(new Event({})).end_date);
  done();
});

lab.test('event.render no timezone', (done) => {
  const dateString = '2017-01-02T00:00:00Z';
  const date = new Date(dateString);
  Code.expect(dateString).to.equal(event.render(new Event({start_date: date})).start_date);
  Code.expect(dateString).to.equal(event.render(new Event({end_date: date})).end_date);
  Code.expect(dateString).to.equal(event.render(new Event({start_date: date, location: {}})).start_date);
  Code.expect(dateString).to.equal(event.render(new Event({end_date: date, location: {}})).end_date);
  done();
});

lab.test('event.render timezone', (done) => {
  const dateString = '2017-01-02T00:00:00.000Z';
  const date = new Date(dateString);
  Code.expect('2017-01-01T19:00:00-05:00').to.equal(event.render(new Event({start_date: date, timezone: 'America/New_York'})).start_date);
  Code.expect('2017-01-01T19:00:00-05:00').to.equal(event.render(new Event({end_date: date, timezone: 'America/New_York'})).end_date);
  Code.expect(undefined).to.equal(event.render(new Event({end_date: date, timezone: 'America/New_York'})).timezone);
  done();
});
