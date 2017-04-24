const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const ODATA = require('../../lib/odata');

lab.test('ODATA.createOrderBy undefined', (done) => {
  Code.expect(ODATA.createOrderBy(undefined)).to.equal([]);
  done();
});

lab.test('ODATA.createOrderBy single value', (done) => {
  Code.expect(ODATA.createOrderBy('a')).to.equal([['a', -1]]);
  done();
});

lab.test('ODATA.createOrderBy multiple value', (done) => {
  Code.expect(ODATA.createOrderBy('a,b')).to.equal([['a', -1], ['b', -1]]);
  done();
});

lab.test('ODATA.createOrderBy padding', (done) => {
  Code.expect(ODATA.createOrderBy('  a ,    b     ')).to.equal([['a', -1], ['b', -1]]);
  done();
});

lab.test('ODATA.createOrderBy direction', (done) => {
  Code.expect(ODATA.createOrderBy('a,b asc')).to.equal([['a', -1], ['b', -1]]);
  Code.expect(ODATA.createOrderBy('a,b desc')).to.equal([['a', 1], ['b', 1]]);
  done();
});

lab.test('ODATA.createFilter basics', (done) => {
  Code.expect(ODATA.createFilter('a eq \'b\'')).to.equal({'a': 'b'});
  Code.expect(ODATA.createFilter('a gt \'b\'')).to.equal({'a': {$gt: 'b'}});
  Code.expect(ODATA.createFilter('contains(a, \'b\')')).to.equal({'a': /b/gi});
  done();
});

lab.test('ODATA.createFilter combine functions', (done) => {
  Code.expect({'$and': [{a: /b/gi}, {c: /d/gi}]}).to.equal(
    ODATA.createFilter('contains(a, \'b\') and contains(c, \'d\')')
  );
  Code.expect({'$or': [{a: /b/gi}, {c: /d/gi}]}).to.equal(
    ODATA.createFilter('contains(a, \'b\') or contains(c, \'d\')')
  );
  done();
});
