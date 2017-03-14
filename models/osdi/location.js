var mongoose = require('mongoose'),
    Schema = mongoose.Schema;

var Location = new mongoose.Schema({
	identifiers: [String],
	origin_system: { type: String },
	created_date: { type: Date, required: true },
	modified_date: { type: Date, required: true },

	venue: { type: String },
	address_lines: [String],
	locality: { type: String },
	region: { type: String },
	postal_code: { type: String },
	country: { type: String },
	language: { type: String },
	location: {
		type: { type: String },
		//coordinate are [longitude, latitude]
		coordinates: [Number],
		accuracy: {type: String, enum: ['Rooftop', 'Approximate']}
	}
});

Location.index({ 'location' : '2dsphere' });

let location = mongoose.model('Location', Location);

module.exports = location;