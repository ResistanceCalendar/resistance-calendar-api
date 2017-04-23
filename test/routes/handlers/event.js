const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const event = require('../../../routes/handlers/event');

lab.test('event.createProximityFilter proximity under defined', (done) => {
  Code.expect(event.createProximityFilter()).to.equal({});
  Code.expect(event.createProximityFilter('a', undefined, undefined, undefined)).to.equal({});
  Code.expect(event.createProximityFilter('a', 100, undefined, undefined)).to.equal({});
  Code.expect(event.createProximityFilter('a', undefined, [0, 1], undefined)).to.equal({});
  Code.expect(event.createProximityFilter('a', undefined, undefined, 94110)).to.equal({});
  done();
});

lab.test('event.createProximityFilter defined', (done) => {
  Code.expect(event.createProximityFilter('a', 100, [0, 1])).to.equal(
    {'a': {$near: {$geometry: {'coordinates': [0, 1], type: 'Point'}, $maxDistance: 100}}}
  );
  done();
});

lab.test('event.createProximityFilter ignores postalCode', (done) => {
  Code.expect(event.createProximityFilter('a', 100, [0, 1], 94110)).to.equal(
    {'a': {$near: {$geometry: {'coordinates': [0, 1], type: 'Point'}, $maxDistance: 100}}}
  );
  done();
});

lab.test('event.createProximityFilter uses postalCode', (done) => {
  Code.expect(event.createProximityFilter('a', 100, undefined, 94110)).to.equal(
    {'a': {$near: {$geometry: {'coordinates': [-122.41545, 37.748730], type: 'Point'}, $maxDistance: 100}}}
  );
  done();
});
