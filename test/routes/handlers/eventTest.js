const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const event = require('../../../routes/handlers/event');

lab.test('event.createOrderBy undefined', (done) => {
  Code.expect(event.createOrderBy(undefined)).to.equal([]);
  done();
});

lab.test('event.createOrderBy single value', (done) => {
  Code.expect(event.createOrderBy('a')).to.equal([['a', -1]]);
  done();
});

lab.test('event.createOrderBy multiple value', (done) => {
  Code.expect(event.createOrderBy('a,b')).to.equal([['a', -1], ['b', -1]]);
  done();
});

lab.test('event.createOrderBy padding', (done) => {
  Code.expect(event.createOrderBy('  a ,    b     ')).to.equal([['a', -1], ['b', -1]]);
  done();
});

lab.test('event.createOrderBy direction', (done) => {
  Code.expect(event.createOrderBy('a,b asc')).to.equal([['a', -1], ['b', -1]]);
  Code.expect(event.createOrderBy('a,b desc')).to.equal([['a', 1], ['b', 1]]);
  done();
});
