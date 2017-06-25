const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Facebook = require('../../lib/facebook');

lab.test('Facebook.toOSDIEvent', (done) => {
  const facebookEvent = {
    id: '00000'
  };
  const osdiEvent = Facebook.toOSDIEvent(facebookEvent);
  Code.expect(osdiEvent.origin_system).to.equal('Facebook');
  Code.expect(osdiEvent.identifiers).to.equal(['facebook:00000']);
  done();
});
