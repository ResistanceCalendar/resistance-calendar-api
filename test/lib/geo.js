const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Geo = require('../../lib/geo');

lab.test('Geo.parseAddressStringToOSDILocation', (done) => {
  const addressLine = 'Bryant Park, 100 S Gulfview Rd, S Lake Worth, FL 33460';
  Geo.parseAddressStringToOSDILocation(addressLine, function (err, osdiLocation) {
    if (err) Code.fail(err);

    Code.expect(osdiLocation.location.type, 'Point');
    Code.expect(osdiLocation.location.latitude).to.equal(26.6182);
    Code.expect(osdiLocation.location.longitude).to.equal(-80.056);
    Code.expect(osdiLocation.location.coordinates).to.equal([-80.056, 26.6182]);

    Code.expect(osdiLocation.postal_code).to.equal('33460');
    Code.expect(osdiLocation.region).to.equal('FL');
    Code.expect(osdiLocation.address_lines[0]).to.equal('100 S Gulfview Rd');
    done();
  });
});

lab.test('Geo.parseAddressStringToOSDILocation fixes missing state', (done) => {
  const addressLine = '2129 N Western Ave, Chicago, IL 60647-4146, United States';
  Geo.parseAddressStringToOSDILocation(addressLine, function (err, osdiLocation) {
    if (err) Code.fail(err);
    Code.expect(osdiLocation.region).to.equal('IL');
    done();
  });
});

lab.test('Geo.parseAddressStringToOSDILocation fixes missing city', (done) => {
  const addressLine = 'Downtown Presbyterian Church 154 5th Ave N Nashville, TN 37219';
  Geo.parseAddressStringToOSDILocation(addressLine, function (err, osdiLocation) {
    if (err) Code.fail(err);
    Code.expect(osdiLocation.locality).to.equal('Nashville');
    done();
  });
});
