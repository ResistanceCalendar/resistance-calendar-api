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
