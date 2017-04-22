const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const event = require('../../../routes/handlers/event');

lab.test('event.createProximityFilter proximity under defined', (done) => {
  Code.expect(event.createProximityFilter()).to.equal({});
  Code.expect(event.createProximityFilter('a', undefined, undefined)).to.equal({});
  Code.expect(event.createProximityFilter('a', [0, 1], undefined)).to.equal({});
  Code.expect(event.createProximityFilter('a', undefined, 100)).to.equal({});
  Code.expect(event.createProximityFilter(undefined, undefined, 100)).to.equal({});
  done();
});

lab.test('event.createProximityFilter defined', (done) => {
  Code.expect(event.createProximityFilter('a', [0, 1], 100)).to.equal(
    {'a': {$near: {$geometry: {'coordinates': [0, 1], type: 'Point'}, $maxDistance: 100}}}
  );
  done();
});
