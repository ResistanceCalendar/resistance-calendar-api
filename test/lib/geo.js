const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Geo = require('../../lib/geo');

lab.test('Geo.parseAddressStringToOSDILocation', (done) => {
  const addressLine = 'Bryant Park, 100 S Gulfview Rd, S Lake Worth, FL 33460';
  Geo.parseAddressStringToOSDILocation(addressLine, function (err, osdiLocation) {
    if (err) Code.fail(err);

    Code.expect(osdiLocation.location.type, 'Point');
    Code.expect(osdiLocation.location.latitude).to.equal(26.619695);
    Code.expect(osdiLocation.location.longitude).to.equal(-80.05676);
    Code.expect(osdiLocation.location.coordinates).to.equal([-80.05676, 26.619695]);

    Code.expect(osdiLocation.postal_code).to.equal('33460');
    Code.expect(osdiLocation.region).to.equal('FL');
    Code.expect(osdiLocation.address_lines[0]).to.equal('100 S Gulfview Rd');
    done();
  });
});
