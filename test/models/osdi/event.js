const mongoose = require('mongoose');
const mockgoose = require('mockgoose');

const Code = require('code');
const Lab = require('lab');
const lab = exports.lab = Lab.script();
const Event = require('../../../models/osdi/event');

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

lab.test('event.create', (done) => {
  var event = new Event({title: 'Test event'});
  event.save()
    .catch(function (err) { if (err) done(err); })
    .then(function (newEvent) {
      const initCreatedDate = newEvent.created_date;
      const initModifiedDate = newEvent.modified_date;
      event['title'] = 'New title';
      event.save()
        .catch(function (err) { if (err) done(err); })
        .then(function (newNewEvent) {
          try {
            Code.expect(initCreatedDate).to.equal(newNewEvent.created_date);
            Code.expect(initModifiedDate).to.not.equal(newNewEvent.modified_date);
          } catch (err) {
            done(err);
          }
          done();
        });
    });
});
