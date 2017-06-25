const mongoose = require('mongoose');
const mockgoose = require('mockgoose');

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Event = require('../../../models/osdi/event');
const etl = require('../../../jobs/facebook-etl');

mockgoose(mongoose);

// Create the mongoose connection on init
lab.before(function (done) {
  mongoose.connect('mongodb://example.com/TestingDB', done);
});

// Close the fake connection after all tests are done
lab.after(function (done) {
  mongoose.connection.close(function () {
    done();
  });
});

lab.test('remove ', (done) => {
  var event = new Event({origin_system: 'NotFacebook', identifiers: ['facebook:1234']});
  event.save()
    .catch(function (err) { if (err) done(err); })
    .then(function (newEvent) {
      etl.removeEventsNotFoundInFacebook([1234]);
      Event.find({origin_system: 'NotFacebook'}, function (err, foundEvents) {
        if (err) done(err);
        Code.expect(foundEvents.length).to.equal(1);
        done();
      });
    });
});
