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
  start_date: { type: Date },
  end_date: { type: Date },
  add_day_date: { type: Date },
  add_day: { type: Boolean },
  capacity: { type: Number },
  guests_can_invite_others: { type: Boolean },
  facebookLink: { type: String },
  // had to change 'location' to 'loc' bc location is reserved in mongo
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
        type: { type: String },
        // coordinate are [latitude, longitude]
        coordinates: [Number],
        accuracy: {type: String, enum: ['Rooftop', 'Approximate']}
      }
    },
    required: false
  }
});

const updateModifiedDate = function (next) {
  const now = new Date();
  this.modified_date = now;
  if (this.location) {
    this.location.modified_date = now;
  }
  next();
};

EventSchema.pre('save', updateModifiedDate)
  .pre('update', updateModifiedDate)
  .pre('findOneAndUpdate', updateModifiedDate)
  .pre('findByIdAndUpdate', updateModifiedDate);

EventSchema.index({ 'location.location': '2dsphere' });

let event = mongoose.model('Event', EventSchema);

module.exports = event;
