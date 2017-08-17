const mongoose = require('mongoose');

const EventSchema = new mongoose.Schema({
  identifiers: ['String'],
  origin_system: { type: String },
  created_date: { type: Date, required: true, default: Date.now() },
  modified_date: { type: Date, required: true, default: Date.now() },
  // name of the event for administrative display
  name: { type: String },
  // title of event for public display
  title: { type: String, required: true },
  // may contain text and/or HTML
  description: { type: String },
  // text-only, single paragraph. For listing pages with not enough room for description
  summary: { type: String },
  browser_url: { type: String },
  // whether event requires tickets or is open RSVP
  type: { type: String, enum: ['ticketed', 'open'] },
  featured_image_url: { type: String },
  total_accepted: {type: Number},
  status: { type: String, enum: ['confirmed', 'tentatives', 'cancelled'] },
  // instructions for event shown after people have RSVPed. Text and/or HTML
  instructions: { type: String },
  // Quasi-OSDI: start_date and end_date are persisted as UTC in mongo, and
  // should be converted on post init to canonical OSDI values using the
  // location.timezone value if available, otherwise UTC may be used
  start_date: { type: Date },
  end_date: { type: Date },
  add_day_date: { type: Date },
  add_day: { type: Boolean },
  capacity: { type: Number },
  guests_can_invite_others: { type: Boolean },
  facebookLink: { type: String },
  location: {
    type: {
      identifiers: [String],
      origin_system: { type: String },
      created_date: { type: Date, required: true, default: Date.now() },
      modified_date: { type: Date, required: true, default: Date.now() },
      venue: { type: String },
      address_lines: [String],
      locality: { type: String },
      region: { type: String },
      postal_code: { type: String },
      country: { type: String },
      language: { type: String },
      location: {
        latitude: { type: Number },
        longitude: { type: Number },
        accuracy: {type: String, enum: ['Rooftop', 'Approximate']},
        // The following two fields are for 2dsphere querying and not OSDI
        // specific
        type: { type: String },
        coordinates: [Number]
      }
    },
    required: false
  },
  // Quasi-OSDI: Added in order to allow times to be formatted in localtime
  timezone: { type: String }
});

const updateDates = function (next) {
  const now = new Date();
  this.modified_date = now;
  if (this.location) {
    this.location.modified_date = now;
  }
  next();
};

EventSchema
  .pre('save', updateDates)
  .pre('update', updateDates)
  .pre('findOneAndUpdate', updateDates)
  .pre('findByIdAndUpdate', updateDates);

EventSchema.index({ 'location.location': '2dsphere' });

let event = mongoose.model('Event', EventSchema);

module.exports = event;
